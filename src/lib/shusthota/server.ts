import "server-only";
import { readIdentity } from "@/lib/auth/access";
import { createServerSupabase } from "@/lib/supabase/server";

export async function shusthotaMotherDb() {
  const db = await createServerSupabase();
  const identity = await readIdentity(db);
  if (identity.status !== 200) return { status: identity.status, db: null } as const;
  if (identity.profile.role !== "mother" || !db) return { status: 403, db: null } as const;
  return { status: 200, db } as const;
}

export function futureTimestamp(value: string): boolean {
  return Date.parse(value) > Date.now() + 60_000;
}
