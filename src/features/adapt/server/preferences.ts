import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { accessPreferencesSchema, DEFAULT_ACCESS_PREFERENCES, type PatchAccessPreferences } from "@/lib/contracts/adapt";
import { timestampSchema } from "@/lib/contracts/common";

const storedPreferencesSchema = z.object({
  settings: accessPreferencesSchema,
  updated_at: timestampSchema,
  schema_version: z.literal(2),
});
export type PreferenceSnapshot = { settings: z.infer<typeof accessPreferencesSchema>; updatedAt: string | null };
export class PreferenceStoreError extends Error {
  constructor(public readonly kind: "invalid" | "forbidden" | "conflict" | "unavailable") { super(kind); }
}
function storeFailure(error: { code?: string }): never {
  throw new PreferenceStoreError(error.code === "PT409" || error.code === "40001" ? "conflict" : error.code === "42501" ? "forbidden" :
    error.code === "22023" || error.code === "23514" ? "invalid" : "unavailable");
}

export async function loadPreferences(client: SupabaseClient, userId: string): Promise<PreferenceSnapshot> {
  const result = await client.from("access_preferences").select("settings, updated_at, schema_version").eq("user_id", userId).maybeSingle();
  if (result.error) storeFailure(result.error);
  if (!result.data) return { settings: { ...DEFAULT_ACCESS_PREFERENCES }, updatedAt: null };
  const row = storedPreferencesSchema.parse(result.data);
  return { settings: row.settings, updatedAt: row.updated_at };
}

export async function patchPreferences(client: SupabaseClient, patch: PatchAccessPreferences,
  version: { check: boolean; updatedAt: string | null }): Promise<PreferenceSnapshot> {
  const result = await client.rpc("patch_access_preferences", {
    p_patch: patch, p_check_version: version.check, p_expected_updated_at: version.updatedAt,
  });
  if (result.error) storeFailure(result.error);
  if (!Array.isArray(result.data) || result.data.length !== 1) throw new PreferenceStoreError("unavailable");
  const row = storedPreferencesSchema.parse(result.data[0]);
  return { settings: row.settings, updatedAt: row.updated_at };
}
