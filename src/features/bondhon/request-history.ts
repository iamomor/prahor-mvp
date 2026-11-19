// Request IDs this browser submitted. IDs only: status is always re-read from the server, which
// enforces ownership, so an ID from another account simply fails to load and is hidden.
// shortcut: IDs live on this device only; add a "list my requests" RPC if mothers need cross-device history.
const key = "prohor-care-request-ids";

export function readRequestIds(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string").slice(0, 10) : [];
  } catch { return []; }
}

export function rememberRequestId(id: string) {
  try { localStorage.setItem(key, JSON.stringify([id, ...readRequestIds().filter(item => item !== id)].slice(0, 10))); }
  catch { /* storage blocked: status page still works from the URL id */ }
}
