export type ActResult = { ok: true; code: string; data: Record<string, unknown> } | { ok: false; code: string };
/** Sends one account action; on success the account snapshot is already reloaded. */
export type Act = (body: unknown) => Promise<ActResult>;
