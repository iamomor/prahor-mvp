import type { SupportRequestStatus } from "@/lib/contracts/bondhon";

export type Status = SupportRequestStatus;
export const ORDER = ["submitted", "delivered", "acknowledged", "responded", "closed"] as const satisfies readonly Status[];
const NEXT: Record<Status, readonly Status[]> = {
  submitted: ["delivered", "closed"], delivered: ["acknowledged", "closed"],
  acknowledged: ["responded", "closed"], responded: ["closed"], closed: [],
};
/** Presentation rule only. The existing server remains the authorization boundary. */
export const canMove = (from: Status, to: Status): boolean => NEXT[from]?.includes(to) ?? false;
export type TrackerEvent = { type: Status; at: string };
export type Stage = { status: Status; reached: boolean; at?: string };
export function buildTracker(events: readonly TrackerEvent[]): Stage[] {
  const seen = new Map<Status, string>();
  for (const event of events) {
    if (!ORDER.includes(event.type) || !Number.isFinite(Date.parse(event.at))) continue;
    const previous = seen.get(event.type);
    if (!previous || Date.parse(event.at) < Date.parse(previous)) seen.set(event.type, event.at);
  }
  return ORDER.map(status => ({ status, reached: seen.has(status), ...(seen.has(status) ? { at: seen.get(status) } : {}) }));
}
/** No events means unknown, never a fabricated submission. */
export function currentStatus(events: readonly TrackerEvent[]): Status | null {
  return buildTracker(events).reduce<Status | null>((current, stage) => stage.reached ? stage.status : current, null);
}
export type ScopedGrant = {
  granteeUserId: string; record: { type: string; id: string; fields: readonly string[] };
  startsAt: string; expiresAt: string; revokedAt?: string | null;
};
/** Display helper only: never merge fields across records/recipients or ignore request withdrawal. */
export function visibleFields(grants: readonly ScopedGrant[], now: Date,
  scope: { type: string; id: string; granteeUserId: string }, requestActive: boolean): string[] {
  const time = now.getTime();
  if (!requestActive || !Number.isFinite(time)) return [];
  return [...new Set(grants.filter(grant => grant.granteeUserId === scope.granteeUserId &&
    grant.record.type === scope.type && grant.record.id === scope.id && !grant.revokedAt &&
    Date.parse(grant.startsAt) <= time && time < Date.parse(grant.expiresAt))
    .flatMap(grant => grant.record.fields))];
}
