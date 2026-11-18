import { currentUserResponseSchema } from "@/lib/contracts/transport";
import type { AccessPreferences, PatchAccessPreferences } from "@/lib/contracts/adapt";
import { loadAccountPreferences, saveAccountPreferences, PreferencesApiError, type AccountPreferences } from "../api/client";
import { accountPatch, applyAccount, type DevicePreferences } from "./account-mapping";

export type AccountIdentity = import("@/lib/contracts/platform").CurrentUser;
export type SyncPhase = "guest" | "loading" | "review" | "ready" | "saving" | "error";
export type SyncState = {
  identity: AccountIdentity | null; phase: SyncPhase; account: AccessPreferences | null;
  etag: string | null; updatedAt: string | null; patch: PatchAccessPreferences;
  enabled: boolean; message: string;
};
export type StoredSession = { userId: string; backup: DevicePreferences; enabled: boolean };
export type SyncDependencies = {
  identity(signal: AbortSignal): Promise<AccountIdentity | null>;
  load(signal: AbortSignal, accountId: string): Promise<AccountPreferences>;
  save(patch: PatchAccessPreferences, etag: string, signal: AbortSignal, accountId: string): Promise<AccountPreferences>;
  readDevice(): DevicePreferences; writeDevice(value: DevicePreferences): void;
  readSession(): StoredSession | null; writeSession(value: StoredSession | null): void;
};
export type SyncResult = { status: "saved" | "unchanged" | "applied" | "cancelled" | "conflict" | "failed" };
const initialState: SyncState = { identity: null, phase: "guest", account: null, etag: null,
  updatedAt: null, patch: {}, enabled: false, message: "Settings work on this device. Account settings have not been loaded." };

/** UI state only. Server identity, authorization and SQL validation remain authoritative. */
export class PreferenceSyncController {
  private state: SyncState = initialState;
  private listeners = new Set<() => void>();
  private generation = 0;
  private request: AbortController | null = null;
  private session: StoredSession | null = null;
  private applying = false;
  constructor(private readonly deps: SyncDependencies) {}
  getSnapshot = (): SyncState => this.state;
  getServerSnapshot = (): SyncState => initialState;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener); return () => { this.listeners.delete(listener); };
  };
  private publish(next: Partial<SyncState>) {
    this.state = { ...this.state, ...next };
    for (const listener of this.listeners) listener();
  }
  private invalidate() { this.generation++; this.request?.abort(); this.request = null; }
  private current(generation: number) { return generation === this.generation; }
  private persist() { this.deps.writeSession(this.session); }
  private writeDevice(value: DevicePreferences) {
    this.applying = true;
    try { this.deps.writeDevice(value); } finally { this.applying = false; }
  }
  private transition(identity: AccountIdentity | null) {
    this.session ??= this.deps.readSession();
    if (this.session && this.session.userId !== identity?.id) {
      this.writeDevice(this.session.backup); this.session = null; this.persist();
    }
    if (identity && !this.session) {
      this.session = { userId: identity.id, backup: this.deps.readDevice(), enabled: false }; this.persist();
    }
  }
  deviceChanged = () => {
    if (this.applying || !this.state.account) return;
    const patch = accountPatch(this.deps.readDevice(), this.state.account);
    this.publish({ patch, ...(["saving", "error", "loading"].includes(this.state.phase) ? {} : {
      phase: Object.keys(patch).length ? "review" as const : "ready" as const,
      message: Object.keys(patch).length ? "Changes are applied on this device. Review and save them to your account." : "Device and account choices match.",
    }) });
  };
  refresh = async (): Promise<void> => {
    this.invalidate(); const generation = this.generation;
    const request = new AbortController(); this.request = request;
    this.publish({ phase: "loading", account: null, etag: null, patch: {}, updatedAt: null, message: "Loading account settings…" });
    try {
      const identity = await this.deps.identity(request.signal);
      if (!this.current(generation)) return;
      this.transition(identity);
      if (!identity) { this.publish({ ...initialState, message: "Signed out. Settings are applied on this device only." }); return; }
      this.publish({ identity, enabled: this.session?.enabled ?? false, account: null, etag: null, patch: {} });
      const snapshot = await this.deps.load(request.signal, identity.id);
      if (!this.current(generation)) return;
      this.accept(snapshot, "Account settings loaded. Review differences before saving or using account choices.");
    } catch {
      if (this.current(generation)) this.publish({ phase: "error", etag: null,
        message: "Account settings could not be loaded. Device settings remain available. Retry; no save was confirmed." });
    } finally { if (this.current(generation)) this.request = null; }
  };
  private accept(snapshot: AccountPreferences, message: string) {
    const patch = accountPatch(this.deps.readDevice(), snapshot.preferences);
    this.publish({ account: snapshot.preferences, etag: snapshot.etag, updatedAt: snapshot.updatedAt,
      patch, phase: Object.keys(patch).length ? "review" : "ready", message });
  }
  save = async (): Promise<SyncResult> => {
    if (!this.state.identity || !this.state.account || !this.state.etag || ["saving", "loading"].includes(this.state.phase)) return { status: "failed" };
    const patch = accountPatch(this.deps.readDevice(), this.state.account);
    if (!Object.keys(patch).length) {
      this.publish({ patch, phase: "ready", message: "Device and account choices match. Nothing needed saving." });
      return { status: "unchanged" };
    }
    const generation = this.generation;
    const accountId = this.state.identity.id;
    const request = new AbortController(); this.request = request;
    this.publish({ phase: "saving", patch, message: "Saving reviewed choices to your account…" });
    try {
      const snapshot = await this.deps.save(patch, this.state.etag, request.signal, accountId);
      if (!this.current(generation)) return { status: "cancelled" };
      if (this.session) { this.session.enabled = true; this.persist(); }
      this.accept(snapshot, "The submitted choices were saved to your account. Any newer device edits still need review.");
      this.publish({ enabled: true }); return { status: "saved" };
    } catch (error) {
      if (!this.current(generation)) return { status: "cancelled" };
      if (error instanceof PreferencesApiError && error.status === 409) {
        try {
          const snapshot = await this.deps.load(request.signal, accountId);
          if (!this.current(generation)) return { status: "cancelled" };
          this.accept(snapshot, "Account settings changed elsewhere. Your device choices are preserved. Review the latest differences before saving again.");
          return { status: "conflict" };
        } catch { /* Retain draft on reload failure. */ }
      }
      this.publish({ phase: "error", etag: null, message: "Your save was not confirmed. Device choices are preserved. Reload account settings before retrying." });
      return { status: "failed" };
    } finally { if (this.current(generation)) this.request = null; }
  };
  useAccount = (): SyncResult => {
    if (!this.state.identity || !this.state.account || !this.state.etag || ["loading", "saving", "error"].includes(this.state.phase)) return { status: "failed" };
    this.writeDevice(applyAccount(this.state.account, this.deps.readDevice()));
    this.publish({ patch: {}, phase: "ready", message: "Account choices applied. Device-only preferences were preserved." });
    return { status: "applied" };
  };
  disable = () => {
    this.invalidate();
    if (this.session) { this.session.enabled = false; this.persist(); }
    this.publish({ enabled: false, phase: this.state.account ? "ready" : "guest",
      message: "Account sync is off on this device. Saved account settings remain. A previously submitted request may still have reached the server; reload to verify." });
  };
}

export async function loadServerIdentity(signal: AbortSignal): Promise<AccountIdentity | null> {
  const response = await fetch("/api/me", { credentials: "same-origin", cache: "no-store", signal });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("identity_unavailable");
  return currentUserResponseSchema.parse(await response.json()).data;
}
export function accountTransport() {
  const fetchAccount = (signal: AbortSignal, accountId: string): typeof fetch => (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("X-Prohor-Account", accountId);
    return fetch(input, { ...init, headers, signal });
  };
  return {
    identity: loadServerIdentity,
    load: (signal: AbortSignal, accountId: string) => loadAccountPreferences(fetchAccount(signal, accountId)),
    save: (patch: PatchAccessPreferences, etag: string, signal: AbortSignal, accountId: string) =>
      saveAccountPreferences(patch, etag, fetchAccount(signal, accountId)),
  };
}
