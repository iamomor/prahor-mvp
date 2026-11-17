import { patchAccessPreferencesSchema, preferencesResponseSchema, type AccessPreferences, type PatchAccessPreferences } from "@/lib/contracts/adapt";

export class PreferencesApiError extends Error {
  constructor(public readonly status: number) { super(status === 409 ? "preferences_conflict" : "preferences_unavailable"); }
}
export type AccountPreferences = { preferences: AccessPreferences; etag: string; updatedAt: string | null };

async function requestSnapshot(fetcher: typeof fetch, init: RequestInit, patch?: PatchAccessPreferences): Promise<AccountPreferences> {
  let response: Response;
  try { response = await fetcher("/api/preferences", init); }
  catch { throw new PreferencesApiError(0); }
  if (!response.ok) throw new PreferencesApiError(response.status);
  let payload: unknown;
  try { payload = await response.json(); }
  catch { throw new PreferencesApiError(500); }
  const result = preferencesResponseSchema.safeParse(payload);
  if (!result.success) throw new PreferencesApiError(500);
  const etag = response.headers.get("etag");
  if (etag !== JSON.stringify(result.data.updatedAt ?? "missing")) throw new PreferencesApiError(500);
  if (patch && (result.data.updatedAt === null || Object.entries(patch).some(([key, value]) =>
    value !== undefined && result.data.data[key as keyof AccessPreferences] !== value))) {
    throw new PreferencesApiError(500);
  }
  return { preferences: result.data.data, updatedAt: result.data.updatedAt, etag };
}

/** Explicit account loading: the caller reviews local/account conflicts before applying. */
export async function loadAccountPreferences(fetcher: typeof fetch = fetch): Promise<AccountPreferences> {
  return requestSnapshot(fetcher, { credentials: "same-origin", cache: "no-store" });
}

/** Send only deliberate changes. Never silently retry a conflicting save. */
export async function saveAccountPreferences(patch: PatchAccessPreferences, etag: string, fetcher: typeof fetch = fetch): Promise<AccountPreferences> {
  const validated = patchAccessPreferencesSchema.parse(patch);
  return requestSnapshot(fetcher, {
    method: "PATCH", credentials: "same-origin", cache: "no-store",
    headers: { "Content-Type": "application/json", "If-Match": etag }, body: JSON.stringify(validated),
  }, validated);
}
