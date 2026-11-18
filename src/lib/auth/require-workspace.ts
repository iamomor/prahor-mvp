import "server-only";
import { redirect } from "next/navigation";
import { readIdentity, signInPath, type WorkspaceRole } from "./access";
import { createServerSupabase } from "../supabase/server";

/** Defense in depth: layouts/pages never rely solely on the proxy. */
export async function requireWorkspace(role: WorkspaceRole) {
  const identity = await readIdentity(await createServerSupabase());
  if (identity.status === 401) redirect(signInPath(role === "mother" ? "/app" : role === "supporter" ? "/supporter" : "/provider"));
  if (identity.status === 503) redirect("/sign-in?error=profile-unavailable");
  if (identity.profile.role !== role) redirect("/account");
  return identity.profile;
}

export async function requireAccount() {
  const identity = await readIdentity(await createServerSupabase());
  if (identity.status === 401) redirect(signInPath("/account"));
  if (identity.status !== 200) redirect("/sign-in?error=profile-unavailable");
  return identity.profile;
}
