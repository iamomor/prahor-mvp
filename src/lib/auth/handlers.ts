import type { SupabaseClient } from "@supabase/supabase-js";
import { jsonNoStore } from "../api-response";
import { safeAuthReturnPath } from "../routes";
import { authDestination, readIdentity } from "./access";
import { boundedJson, emailLinkSchema, sameOriginPost, signInSchema, signUpSchema, siteOrigin } from "./validation";
import { authCookieOptions } from "./cookies";
import { currentUserSchema } from "../contracts/platform";
import { contractVersion } from "../contracts/common";
import type { ApiResponse } from "../contracts/api";

export type AuthAction = "sign-in" | "sign-up" | "email-link" | "sign-out";
export type AuthDependencies = { createClient: () => Promise<SupabaseClient | null>; siteUrl: string | undefined };

function emailRateLimited(error: { code?: string; status?: number } | null) {
  return error?.status === 429 || ["email_send_rate_limited", "over_email_send_rate_limit"].includes(error?.code ?? "");
}

function checkEmail(next: string, origin: string) {
  const response = jsonNoStore({ code: "check-email" }, 200);
  response.cookies.set("prohor-auth-next", next, {
    path: "/", httpOnly: true, sameSite: "lax", secure: origin.startsWith("https:"), maxAge: 3600,
  });
  return response;
}

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
      // Return JSON (not a redirect) so the browser applies Set-Cookie before
      // the client does window.location.assign. fetch() does not reliably apply
      // Set-Cookie from a followed 303 redirect — using manual JSON avoids that.
      const response = jsonNoStore({ ok: true }, 200);
      response.headers.set("Cache-Control", "no-store");
      const cookieHeader = request.headers.get("cookie") ?? "";
      for (const item of cookieHeader.split(";")) {
        const name = item.split("=")[0]?.trim();
        if (name && (name.startsWith("sb-") || name.includes("auth") || name.startsWith("prohor-auth"))) {
          response.cookies.set(name, "", { ...authCookieOptions(), maxAge: 0 });
        }
      }
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
    if (action === "sign-up") {
      const version = await client.rpc("prohor_role_profile_ready");
      if (version.error || version.data !== 1) return jsonNoStore({ code: "roles-unavailable" }, 503);
    }
    const next = safeAuthReturnPath(parsed.data.next ?? "/app");
    const callback = new URL("/auth/callback", origin);
    if (action === "email-link") {
      const { error } = await client.auth.signInWithOtp({ email: parsed.data.email,
        options: { shouldCreateUser: false, emailRedirectTo: callback.href } });
      if (emailRateLimited(error)) return jsonNoStore({ code: "email-rate-limited" }, 429);
      if (error && !["otp_disabled", "user_not_found", "signups_not_allowed"].includes(error.code ?? "")) return jsonNoStore({ code: "authentication-failed" }, 400);
      return checkEmail(next, origin);
    }
    const credentials = parsed.data as { email: string; password: string };
    if (action === "sign-up") {
      const { data, error } = await client.auth.signUp({ email: credentials.email, password: credentials.password,
        options: { emailRedirectTo: callback.href } });
      if (emailRateLimited(error)) return jsonNoStore({ code: "email-rate-limited" }, 429);
      if (["user_already_exists", "email_exists"].includes(error?.code ?? ""))
        return jsonNoStore({ code: "account-already-exists" }, 409);
      if (error) return jsonNoStore({ code: "registration-failed" }, 400);
      if (!data.session) return jsonNoStore({ code: "registration-pending" }, 503);
      const signup = signUpSchema.parse(parsed.data);
      const profile = signup.profile;
      const saved = await client.rpc("prohor_save_role_profile", { p_name: profile.displayName,
        p_purposes: profile.purposes, p_organization: profile.organization, p_registration: profile.registrationNumber,
        p_details: profile.details });
      if (saved.error) return jsonNoStore({ code: "profile-pending", accountId: data.user?.id }, 503);
    } else {
      const { error } = await client.auth.signInWithPassword({ email: credentials.email, password: credentials.password });
      if (["email_not_confirmed", "email_unconfirmed"].includes(error?.code ?? ""))
        return jsonNoStore({ code: "confirmation-required" }, 403);
      if (error) return jsonNoStore({ code: "authentication-failed" }, 400);
    }
    const identity = await readIdentity(client);
    if (identity.status !== 200) return jsonNoStore({ code: "profile-unavailable" }, identity.status);
    return jsonNoStore({ redirectTo: authDestination(next, identity.profile.role, identity.profile.onboarded) }, 200);
  } catch { return jsonNoStore({ code: "unavailable" }, 503); }
}

export async function handleIdentityGet(client: SupabaseClient | null, providerOnly = false) {
  const identity = await readIdentity(client);
  if (identity.status !== 200) return jsonNoStore({ code: identity.status === 401 ? "session-required" : "unavailable" }, identity.status);
  if (providerOnly && identity.profile.role !== "provider") return jsonNoStore({ code: "access-denied" }, 403);
  const { user_id, display_name, role } = identity.profile;
  return jsonNoStore({ profile: { user_id, display_name, role } }, 200);
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
