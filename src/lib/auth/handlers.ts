import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { jsonNoStore } from "../api-response";
import { safeAuthReturnPath } from "../routes";
import { authDestination, readIdentity } from "./access";
import { boundedJson, emailLinkSchema, sameOriginPost, signInSchema, signUpSchema, siteOrigin } from "./validation";
import { currentUserSchema } from "../contracts/platform";
import { contractVersion } from "../contracts/common";
import type { ApiResponse } from "../contracts/api";

export type AuthAction = "sign-in" | "sign-up" | "email-link" | "sign-out";
export type AuthDependencies = { createClient: () => Promise<SupabaseClient | null>; siteUrl: string | undefined };

export async function handleAuthPost(request: Request, action: AuthAction, dependencies: AuthDependencies) {
  const origin = siteOrigin(dependencies.siteUrl);
  if (!origin) return jsonNoStore({ code: "unavailable" }, 503);
  if (!sameOriginPost(request, origin)) return jsonNoStore({ code: "request-denied" }, 403);
  try {
    if (action === "sign-out") {
      const client = await dependencies.createClient();
      if (!client) return jsonNoStore({ code: "unavailable" }, 503);
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) return jsonNoStore({ code: "signout-failed" }, 503);
      const response = NextResponse.redirect(new URL("/sign-in?status=signed-out", origin), 303);
      response.headers.set("Cache-Control", "no-store");
      return response;
    }
    if (!request.headers.get("content-type")?.startsWith("application/json")) return jsonNoStore({ code: "invalid-input" }, 400);
    let input: unknown;
    try { input = await boundedJson(request); } catch { return jsonNoStore({ code: "invalid-input" }, 400); }
    const schema = action === "sign-up" ? signUpSchema : action === "email-link" ? emailLinkSchema : signInSchema;
    const parsed = schema.safeParse(input);
    if (!parsed.success) return jsonNoStore({ code: "invalid-input" }, 400);
    const client = await dependencies.createClient();
    if (!client) return jsonNoStore({ code: "unavailable" }, 503);
    const next = safeAuthReturnPath(parsed.data.next ?? "/app");
    const callback = new URL("/auth/callback", origin);
    callback.searchParams.set("next", next);
    if (action === "email-link") {
      const { error } = await client.auth.signInWithOtp({ email: parsed.data.email,
        options: { shouldCreateUser: false, emailRedirectTo: callback.href } });
      if (error && !["otp_disabled", "user_not_found", "signups_not_allowed"].includes(error.code ?? "")) return jsonNoStore({ code: "authentication-failed" }, 400);
      return jsonNoStore({ code: "check-email" }, 200);
    }
    const credentials = parsed.data as { email: string; password: string };
    if (action === "sign-up") {
      const { data, error } = await client.auth.signUp({ email: credentials.email, password: credentials.password,
        options: { emailRedirectTo: callback.href } });
      if (error && !["user_already_exists", "email_exists"].includes(error.code ?? "")) return jsonNoStore({ code: "registration-failed" }, 400);
      if (error || !data.session) return jsonNoStore({ code: "check-email" }, 200);
    } else {
      const { error } = await client.auth.signInWithPassword(credentials);
      if (error) return jsonNoStore({ code: "authentication-failed" }, 400);
    }
    const identity = await readIdentity(client);
    if (identity.status !== 200) return jsonNoStore({ code: "profile-unavailable" }, identity.status);
    return jsonNoStore({ redirectTo: authDestination(next, identity.profile.role) }, 200);
  } catch { return jsonNoStore({ code: "unavailable" }, 503); }
}

export async function handleIdentityGet(client: SupabaseClient | null, providerOnly = false) {
  const identity = await readIdentity(client);
  if (identity.status !== 200) return jsonNoStore({ code: identity.status === 401 ? "session-required" : "unavailable" }, identity.status);
  if (providerOnly && identity.profile.role !== "provider") return jsonNoStore({ code: "access-denied" }, 403);
  return jsonNoStore({ profile: identity.profile }, 200);
}

/** Canonical Step 12 API adapter; shares authentication/RLS lookup with Step 11. */
export async function handleMeGet(createClient: () => Promise<SupabaseClient | null>) {
  const requestId = crypto.randomUUID();
  function respond(body: ApiResponse<"GET /api/me">, status: number) {
    const response = jsonNoStore(body, status);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }
  function failure(code: "unauthenticated" | "not_found" | "unavailable", status: number) {
    const message = code === "unauthenticated" ? "Authentication required." :
      code === "not_found" ? "Your profile was not found." : "Unable to retrieve your profile.";
    return respond({ error: { code, message }, requestId }, status);
  }
  try {
    const identity = await readIdentity(await createClient());
    if (identity.status === 401) return failure("unauthenticated", 401);
    if (identity.status === 503) return identity.reason === "profile_missing"
      ? failure("not_found", 404) : failure("unavailable", 500);
    const data = currentUserSchema.parse({ id: identity.profile.user_id,
      displayName: identity.profile.display_name, role: identity.profile.role });
    return respond({ data, requestId, contractVersion }, 200);
  } catch { return failure("unavailable", 500); }
}
