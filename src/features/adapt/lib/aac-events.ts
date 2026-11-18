/**
 * Event and draft synchronization contract for PROHOR AAC communication.
 *
 * Provides a single clean source of truth for:
 * - "prohor-aac-insert" CustomEvent dispatched to window
 * - Temporary session-only draft buffer (sessionStorage)
 * - Deterministic text merging (appends with clean spacing, never overwriting user input)
 */

export const AAC_INSERT_EVENT = "prohor-aac-insert";
export const AAC_DRAFT_STORAGE_KEY = "prohor-aac-draft-v1";

export type AACInsertDetail = {
  text: string;
  source?: "aac-composer";
};

/**
 * Dispatches an AAC insert event across the browser window and
 * stores it in sessionStorage for graceful cross-route recovery.
 */
export function dispatchAacInsert(text: string): void {
  if (typeof window === "undefined" || !text.trim()) return;

  try {
    sessionStorage.setItem(AAC_DRAFT_STORAGE_KEY, text.trim());
  } catch {
    // Gracefully handle environments with restricted sessionStorage
  }

  window.dispatchEvent(
    new CustomEvent<AACInsertDetail>(AAC_INSERT_EVENT, {
      detail: { text: text.trim(), source: "aac-composer" },
    }),
  );
  window.dispatchEvent(new Event("prohor-aac-draft-change"));
}

/**
 * Reads any stored draft from sessionStorage.
 */
export function getStoredAacDraft(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const draft = sessionStorage.getItem(AAC_DRAFT_STORAGE_KEY);
    return draft && draft.trim() ? draft.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Clears the stored draft after it has been consumed or dismissed.
 */
export function clearStoredAacDraft(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(AAC_DRAFT_STORAGE_KEY);
  } catch {
    // Ignore
  }
  window.dispatchEvent(new Event("prohor-aac-draft-change"));
}

/**
 * Merges a newly composed AAC text into an existing textarea value.
 *
 * Rules:
 * - If existing text is empty, returns the AAC text.
 * - If existing text exists, appends two newlines and the AAC text.
 * - Never overwrites or deletes existing user input.
 */
export function mergeAacText(existing: string, aacText: string): string {
  const trimmedAac = aacText.trim();

  if (!existing.trim()) return trimmedAac;
  if (!trimmedAac) return existing;

  return `${existing}\n\n${trimmedAac}`;
}
