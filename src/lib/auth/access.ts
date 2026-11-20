import type { SupabaseClient } from "@supabase/supabase-js";
import { safeAuthReturnPath } from "../routes";
import { accountAccessSchema, type ActiveRole, type WorkspaceRole } from "../contracts/account";

export type { WorkspaceRole } from "../contracts/account";
export type OwnProfile = { user_id: string; display_name: string; role: ActiveRole; roles?: WorkspaceRole[]; onboarded?: boolean;
  email?: string; pendingEmail?: string | null };
export type IdentityResult = { status: 200; profile: OwnProfile } | { status: 401 } |
  { status: 503; reason?: "profile_missing" };

/** Validate with Auth, then read only that identity's DB-assigned role under RLS. */
export async function readIdentity(client: SupabaseClient | null): Promise<IdentityResult> {
  if (!client) return { status: 503 };
  try {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return { status: error && (error.name === "AuthRetryableFetchError" || error.status === 429 || (error.status && error.status >= 500)) ? 503 : 401 };
    if (!data.user.email || !data.user.email_confirmed_at || data.user.is_anonymous) return { status: 401 };
    // Independent reads: run together so identity costs two round trips, not three.
    const [result, { data: access, error: accessError }] = await Promise.all([
      client.from("profiles").select("user_id, display_name, role").eq("user_id", data.user.id).maybeSingle(),
      client.rpc("prohor_account_access"),
    ]);
    const profile = result.data;
    if (result.error) return { status: 503 };
    if (!profile) return { status: 503, reason: "profile_missing" };
    if (profile.user_id !== data.user.id ||
        !["mother", "provider", "supporter", "member"].includes(profile.role) || typeof profile.display_name !== "string") return { status: 503 };
    // Preserve existing deployed mother/provider accounts before the forward migration.
    if (accessError?.code === "PGRST202" && ["mother", "provider"].includes(profile.role))
      return { status: 200, profile: { ...(profile as OwnProfile), email: data.user.email, pendingEmail: data.user.new_email ?? null } };
    const parsed = accountAccessSchema.safeParse(access);
    if (accessError || !parsed.success || parsed.data.userId !== data.user.id) return { status: 503 };
    return { status: 200, profile: { user_id: data.user.id, display_name: parsed.data.displayName,
      email: data.user.email, pendingEmail: data.user.new_email ?? null,
      role: parsed.data.activeRole, onboarded: parsed.data.onboarded,
      roles: parsed.data.roles.filter(r => r.status === "approved").map(r => r.role) } };
  } catch { return { status: 503 }; }
}

export function workspaceRole(pathname: string): WorkspaceRole | null {
  if (pathname === "/app" || pathname.startsWith("/app/")) return "mother";
  if (pathname === "/provider" || pathname.startsWith("/provider/")) return "provider";
  if (pathname === "/supporter" || pathname.startsWith("/supporter/")) return "supporter";
  return null;
}

export function authDestination(value: string | null, role: ActiveRole, onboarded = true): string {
  if (!onboarded || role === "member") return "/account";
  const path = safeAuthReturnPath(value);
  const pathname = new URL(path, "https://prohor.invalid").pathname;
  const required = workspaceRole(pathname);
  if (path === "/" || pathname.startsWith("/auth/") || pathname === "/sign-in" ||
      pathname === "/sign-up" || (required && required !== role)) return role === "provider" ? "/provider" : role === "supporter" ? "/supporter" : "/app";
  return path;
}

// A signed-in mother stays inside /app until she signs out: public module pages map to their in-app twin.
const appTwins: [string, string][] = [["/safety", "/app/safety"], ["/ask", "/app/ask"], ["/poth", "/app/poth"], ["/find-care", "/app/poth"],
  ["/bondhon", "/app/bondhon"], ["/jibonrekha", "/app/jibonrekha"], ["/demo/jibonrekha", "/app/jibonrekha"], ["/demo/bujhi/kit", "/app/bujhi/kit"],
  ["/demo/bujhi", "/app/bujhi"], ["/bujhi", "/app/bujhi"], ["/accessibility", "/app/accessibility"]];
const marketingPages = new Set(["/", "/about", "/faq", "/features", "/for-mothers", "/for-providers", "/how-it-works", "/trust", "/demo", "/barta-demo"]);
export function signedInAppPath(pathname: string): string | null {
  for (const [from, to] of appTwins)
    if (pathname === from || pathname.startsWith(`${from}/`)) return from === "/safety" ? to + pathname.slice(from.length) : to;
  return marketingPages.has(pathname) ? "/app" : null;
}

export function signInPath(next: string): string {
  return `/sign-in?next=${encodeURIComponent(safeAuthReturnPath(next))}&status=session-required`;
}
