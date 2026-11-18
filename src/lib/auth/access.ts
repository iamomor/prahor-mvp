import type { SupabaseClient } from "@supabase/supabase-js";
import { safeAuthReturnPath } from "../routes";

export type WorkspaceRole = "mother" | "provider";
export type OwnProfile = { user_id: string; display_name: string; role: WorkspaceRole };
export type IdentityResult = { status: 200; profile: OwnProfile } | { status: 401 } |
  { status: 503; reason?: "profile_missing" };

/** Validate with Auth, then read only that identity's DB-assigned role under RLS. */
export async function readIdentity(client: SupabaseClient | null): Promise<IdentityResult> {
  if (!client) return { status: 503 };
  try {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return { status: error && (error.name === "AuthRetryableFetchError" || error.status === 429 || (error.status && error.status >= 500)) ? 503 : 401 };
    if (!data.user.email || !data.user.email_confirmed_at || data.user.is_anonymous) return { status: 401 };
    const result = await client.from("profiles").select("user_id, display_name, role")
      .eq("user_id", data.user.id).maybeSingle();
    const profile = result.data;
    if (result.error) return { status: 503 };
    if (!profile) return { status: 503, reason: "profile_missing" };
    if (profile.user_id !== data.user.id ||
        !["mother", "provider"].includes(profile.role) || typeof profile.display_name !== "string") return { status: 503 };
    return { status: 200, profile: profile as OwnProfile };
  } catch { return { status: 503 }; }
}

const publicAppRoutes = new Set([
  "/app/adapt",
  "/app/shonket",
  "/app/bondhon",
  "/app/shusthota",
  "/app/bujhi",
  "/app/jibonrekha",
]);

export function workspaceRole(pathname: string): WorkspaceRole | null {
  if (publicAppRoutes.has(pathname)) return null;
  if (pathname === "/app" || pathname.startsWith("/app/")) return "mother";
  if (pathname === "/provider" || pathname.startsWith("/provider/")) return "provider";
  return null;
}

export function authDestination(value: string | null, role: WorkspaceRole): string {
  const path = safeAuthReturnPath(value);
  const pathname = new URL(path, "https://prohor.invalid").pathname;
  const required = workspaceRole(pathname);
  if (path === "/" || pathname.startsWith("/auth/") || pathname === "/sign-in" ||
      pathname === "/sign-up" || (required && required !== role)) return role === "provider" ? "/provider" : "/app";
  return path;
}

export function signInPath(next: string): string {
  return `/sign-in?next=${encodeURIComponent(safeAuthReturnPath(next))}&status=session-required`;
}
