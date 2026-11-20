import type { SupportRequestStatus } from "@/lib/contracts/bondhon";

/** Pure view logic for Bondhon v2: no React, no fetch, no clock reads (callers pass `now`). All Bangla is draft. */
export type Words = { en: string; bn: string };
export type Lang = "en" | "bn";
const w = (en: string, bn: string): Words => ({ en, bn });
const MINUTE = 60_000, HOUR = 3_600_000;

// ---------- numbers, dates, time left (Bangladesh time, Bangla digits)
const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const digits = (value: string | number, lang: Lang) =>
  lang === "bn" ? String(value).replace(/\d/g, d => BN_DIGITS[Number(d)]) : String(value);
const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BN_MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const BN_DAYS: Record<string, string> = { Sun: "রবিবার", Mon: "সোমবার", Tue: "মঙ্গলবার", Wed: "বুধবার", Thu: "বৃহস্পতিবার", Fri: "শুক্রবার", Sat: "শনিবার" };
const dhakaParts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", weekday: "short", day: "numeric", month: "numeric",
  year: "numeric", hour: "numeric", minute: "2-digit", hourCycle: "h23" });
const periodBn = (h: number) => h >= 4 && h < 6 ? "ভোর" : h >= 6 && h < 12 ? "সকাল" : h >= 12 && h < 15 ? "দুপুর" : h >= 15 && h < 17 ? "বিকাল" : h >= 17 && h < 19 ? "সন্ধ্যা" : "রাত";

/** "Thu 19 Nov, 9:14 pm" / "বৃহস্পতিবার, ১৯ নভেম্বর, রাত ৯:১৪". The year shows only when it differs from `now`'s. */
export function formatWhen(iso: string, lang: Lang, now: number): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "—";
  const p = Object.fromEntries(dhakaParts.formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  const year = Number(p.year) !== Number(dhakaParts.formatToParts(new Date(Number.isFinite(now) ? now : ms)).find(x => x.type === "year")?.value)
    ? ` ${digits(p.year, lang)}` : "";
  const hour = Number(p.hour), minute = String(p.minute).padStart(2, "0"), clock = `${hour % 12 || 12}:${minute}`;
  const month = Number(p.month) - 1;
  return lang === "bn"
    ? `${BN_DAYS[p.weekday] ?? ""}, ${digits(p.day, "bn")} ${BN_MONTHS[month]}${year}, ${periodBn(hour)} ${digits(clock, "bn")}`
    : `${p.weekday} ${p.day} ${EN_MONTHS[month]}${year}, ${clock} ${hour < 12 ? "am" : "pm"}`;
}

export const msLeft = (expiresAt: string, now: number): number => {
  const end = Date.parse(expiresAt);
  return Number.isFinite(end) && Number.isFinite(now) ? Math.max(0, end - now) : 0;
};
/** Rounds up, so 30 seconds reads "1 min" and never "0 min" while access still exists. */
export function formatLeft(ms: number, lang: Lang): string {
  if (!Number.isFinite(ms) || !(ms > 0)) return lang === "bn" ? "মেয়াদ শেষ" : "ended";
  const mins = Math.ceil(ms / MINUTE), n = (v: number) => digits(v, lang);
  if (mins < 60) return lang === "bn" ? `${n(mins)} মিনিট বাকি` : `${mins} min left`;
  if (mins < 1440) {
    const h = Math.floor(mins / 60), m = mins % 60;
    return lang === "bn" ? `${n(h)} ঘণ্টা${m ? ` ${n(m)} মিনিট` : ""} বাকি` : `${h} h${m ? ` ${m} min` : ""} left`;
  }
  const d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60);
  return lang === "bn" ? `${n(d)} দিন${h ? ` ${n(h)} ঘণ্টা` : ""} বাকি` : `${d} ${d === 1 ? "day" : "days"}${h ? ` ${h} h` : ""} left`;
}

// ---------- access state: one word for "can the provider see this right now?"
export type Receipt = { approvedAt: string; expiresAt: string; revokedAt: string | null };
export type Access = "active" | "ending_soon" | "expired" | "revoked" | "closed" | "legacy" | "unknown" | "scheduled";
/** Fails closed: an unreadable clock or timestamp is "expired", never "active". */
export function accessState(request: { status: SupportRequestStatus; coordination?: Receipt }, now: number): Access {
  if (request.status === "closed") return "closed";
  const c = request.coordination;
  if (!c) return "legacy";
  if (c.revokedAt) return "revoked";
  const approved = Date.parse(c.approvedAt), end = Date.parse(c.expiresAt);
  if (!Number.isFinite(now) || !Number.isFinite(approved) || !Number.isFinite(end) || end <= approved) return "unknown";
  if (now < approved) return "scheduled";
  const left = end - now;
  if (!(left > 0)) return "expired";
  const total = Date.parse(c.expiresAt) - Date.parse(c.approvedAt);
  const soon = Math.min(HOUR, total > 0 ? total / 4 : HOUR); // a 1-hour permission is "ending soon" for its last 15 min, not all along
  return left <= soon ? "ending_soon" : "active";
}
export const isOpenAccess = (a: Access) => a === "active" || a === "ending_soon";
export function fractionLeft(c: Receipt, now: number): number {
  const total = Date.parse(c.expiresAt) - Date.parse(c.approvedAt), left = Date.parse(c.expiresAt) - now;
  return total > 0 && left > 0 ? Math.min(1, left / total) : 0;
}
export const accessWords: Record<Access, Words> = {
  active: w("Active", "চালু আছে"), ending_soon: w("Ending soon", "শিগগির শেষ হবে"), expired: w("Expired", "মেয়াদ শেষ"),
  revoked: w("Stopped by you", "আপনি বন্ধ করেছেন"), closed: w("Closed", "বন্ধ"), legacy: w("No sharing receipt", "সম্মতির রসিদ নেই"),
  unknown: w("Access not confirmed", "প্রবেশ নিশ্চিত নয়"), scheduled: w("Not started", "এখনও শুরু হয়নি"),
};

/** "What this means" and "what to do next", from server status plus access. Never promises a reply. */
export function nextStep(status: SupportRequestStatus, access: Access): { meaning: Words; next: Words } {
  if (access === "closed" || status === "closed") return { meaning: w("This request is closed. Provider access ended.", "অনুরোধ বন্ধ। সেবাদাতার প্রবেশ শেষ।"),
    next: w("Nothing more to do. To get help again, make a new request.", "আর কিছু করার নেই। আবার সহায়তা চাইলে নতুন অনুরোধ করুন।") };
  if (access === "revoked") return { meaning: w("You stopped sharing. The provider can no longer see this request.", "আপনি শেয়ার বন্ধ করেছেন। সেবাদাতা আর এই অনুরোধ দেখতে পাবেন না।"),
    next: w("What they already saw can’t be taken back. You can close it, or start a new request.", "আগে যা দেখা হয়েছে তা ফিরিয়ে নেওয়া যায় না। বন্ধ করতে পারেন, অথবা নতুন অনুরোধ করুন।") };
  if (access === "expired") return { meaning: w("The sharing time ended, so the provider can no longer see this request.", "শেয়ারের সময় শেষ, তাই সেবাদাতা আর এই অনুরোধ দেখতে পাবেন না।"),
    next: w("Close it to tidy up, or share again with a new request.", "গুছিয়ে রাখতে বন্ধ করুন, অথবা নতুন অনুরোধে আবার শেয়ার করুন।") };
  if (access === "unknown" || access === "scheduled") return { meaning: w("Current access could not be confirmed from the permission times.", "অনুমতির সময় থেকে বর্তমান প্রবেশ নিশ্চিত করা যায়নি।"), next: w("Refresh current access. Do not assume sharing has stopped.", "বর্তমান অনুমতি আবার যাচাই করুন। শেয়ার বন্ধ হয়েছে ধরে নেবেন না।") };
  if (access === "legacy") return { meaning: w("This is an older request with no sharing receipt.", "এটি পুরোনো অনুরোধ, এতে সম্মতির রসিদ নেই।"),
    next: w("Close it, then make a new reviewed request.", "বন্ধ করে পর্যালোচনা করে নতুন অনুরোধ করুন।") };
  const byStatus: Record<Exclude<SupportRequestStatus, "closed">, { meaning: Words; next: Words }> = {
    submitted: { meaning: w("Saved on PROHOR. It has not been delivered to the demo queue yet.", "প্রহরে সংরক্ষিত। এখনও ডেমো তালিকায় পৌঁছায়নি।"),
      next: w("Refresh in a moment. If it stays like this, check your connection.", "একটু পরে আবার দেখুন। একই থাকলে সংযোগ দেখুন।") },
    delivered: { meaning: w("Your request reached the demo queue. A simulated provider has not acknowledged it yet.", "আপনার অনুরোধ ডেমো তালিকায় পৌঁছেছে। সিমুলেটেড সেবাদাতা এখনও গ্রহণের বিষয়টি নিশ্চিত করেননি।"),
      next: w("Nothing for you to do. Refresh in a moment, or close the request if you no longer need it.", "আপনার কিছু করার নেই। একটু পরে আবার দেখুন, অথবা আর দরকার না হলে বন্ধ করুন।") },
    acknowledged: { meaning: w("A simulated provider has acknowledged your request.", "একজন সিমুলেটেড সেবাদাতা আপনার অনুরোধ গ্রহণ করেছেন।"),
      next: w("A reply may come. Nothing is guaranteed, and nobody watches this live.", "উত্তর আসতে পারে। নিশ্চয়তা নেই, এবং কেউ সরাসরি নজর রাখছেন না।") },
    responded: { meaning: w("A simulated reply is recorded below.", "একটি সিমুলেটেড উত্তর নিচে লিপিবদ্ধ আছে।"),
      next: w("Read it below. You can follow up on this same purpose, or close the request.", "নিচে পড়ুন। একই উদ্দেশ্যে পরবর্তী বার্তা পাঠাতে বা অনুরোধ বন্ধ করতে পারেন।") },
  };
  return byStatus[status];
}

// ---------- audit trail → human sentences
export type AuditItem = { id: string; action: string; actor: "mother" | "provider"; occurredAt: string; policyVersion: number | null };
export type TimelineEntry = { key: string; at: string; who: "you" | "provider" | "system"; text: Words; count: number };
const NOISE = new Set(["request.owner_read", "request.events_read", "request.provider_read"]);
const plural = (n: number, en: string, bn: string): Words => w(`${n} ${en}${n === 1 ? "" : "s"}`, `${digits(n, "bn")}টি ${bn}`);
function sentence(action: string, actor: "mother" | "provider", count: number): { who: TimelineEntry["who"]; text: Words } {
  const r = plural(count, "record", "রেকর্ড");
  switch (action) {
    case "consent.created": return { who: "you", text: w(`You approved sharing (${r.en})`, `আপনি শেয়ারে সম্মত হয়েছেন (${r.bn})`) };
    case "consent.revoked": return { who: "you", text: w(`Sharing stopped (${r.en})`, `শেয়ার বন্ধ হয়েছে (${r.bn})`) };
    case "request.delivered": return { who: "system", text: w("Delivered to the demo queue", "ডেমো তালিকায় পৌঁছেছে") };
    case "request.acknowledged": return { who: "provider", text: w("A simulated provider acknowledged it", "একজন সিমুলেটেড সেবাদাতা গ্রহণ করেছেন") };
    case "request.responded": return { who: "provider", text: w("A simulated provider replied", "একজন সিমুলেটেড সেবাদাতা উত্তর দিয়েছেন") };
    case "request.consent_created": return { who: "you", text: w("You approved sending this request", "আপনি এই অনুরোধ পাঠাতে সম্মত হয়েছেন") };
    case "request.access_denied": return { who: "system", text: w("An access attempt after sharing stopped was blocked", "শেয়ার বন্ধ হওয়ার পর একটি প্রবেশের চেষ্টা আটকানো হয়েছে") };
    case "request.permission_revoked": return { who: "you", text: w("You stopped sharing", "আপনি শেয়ার বন্ধ করেছেন") };
    case "request.closed": return actor === "mother" ? { who: "you", text: w("You closed the request", "আপনি অনুরোধ বন্ধ করেছেন") }
      : { who: "provider", text: w("A simulated provider closed the request", "একজন সিমুলেটেড সেবাদাতা অনুরোধ বন্ধ করেছেন") };
    case "request.follow_up": return actor === "mother" ? { who: "you", text: w("You sent a follow-up message", "আপনি পরবর্তী বার্তা পাঠিয়েছেন") }
      : { who: "provider", text: w("A simulated provider sent a follow-up", "একজন সিমুলেটেড সেবাদাতা পরবর্তী বার্তা পাঠিয়েছেন") };
    default: return { who: "system", text: w("Activity recorded", "কাজ লিপিবদ্ধ হয়েছে") }; // never show a raw server string
  }
}
/** Newest first. Read events are dropped (see providerOpens); identical events within a minute merge ("3 records"). */
export function auditTimeline(audit: readonly AuditItem[], submittedAt?: string): TimelineEntry[] {
  const events = audit.filter(item => !NOISE.has(item.action) && Number.isFinite(Date.parse(item.occurredAt)))
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt) || a.id.localeCompare(b.id));
  const merged: Array<{ item: AuditItem; count: number; oldest: number }> = [];
  for (const item of events) {
    const last = merged[merged.length - 1], t = Date.parse(item.occurredAt);
    if (last && last.item.action === item.action && last.item.actor === item.actor && last.item.policyVersion === item.policyVersion && Date.parse(last.item.occurredAt) - t <= MINUTE) { last.count++; last.oldest = t; }
    else merged.push({ item, count: 1, oldest: t });
  }
  const entries: TimelineEntry[] = merged.map(({ item, count }) => ({ key: item.id, at: item.occurredAt, count, ...sentence(item.action, item.actor, count) }));
  if (submittedAt && Number.isFinite(Date.parse(submittedAt)))
    entries.push({ key: "submitted", at: submittedAt, who: "you", count: 1, text: w("You sent this request", "আপনি এই অনুরোধ পাঠিয়েছেন") });
  return entries.sort((a, b) => Date.parse(b.at) - Date.parse(a.at) || (a.key === "submitted" ? 1 : b.key === "submitted" ? -1 : 0));
}
/** The server logs every provider fetch. This says "opened", never "read": a fetch is not a person looking. */
export function providerOpens(audit: readonly AuditItem[]): { count: number; lastAt: string | null; atLeast: boolean } {
  const reads = audit.filter(item => item.action === "request.provider_read" && item.actor === "provider" && Number.isFinite(Date.parse(item.occurredAt)));
  const lastAt = reads.reduce<string | null>((best, item) => !best || Date.parse(item.occurredAt) > Date.parse(best) ? item.occurredAt : best, null);
  return { count: reads.length, lastAt, atLeast: audit.length >= 100 }; // the server returns at most 100 events
}

// ---------- visit packs (opt-in shortcuts; sensitive record types are never in a pack)
export type AvailableRecord = { record: { type: string; id: string; fields: Record<string, unknown> }; recordedAt: string };
export type Selection = Record<string, string[]>; // key = `${type}/${id}`, same keys the request form already uses
export const PACKS = [
  { id: "pregnancy_basics", type: "pregnancy_record", fields: ["label", "estimatedDueDate"], newest: 1,
    title: w("Pregnancy basics", "গর্ভাবস্থার মূল তথ্য"), blurb: w("Pregnancy label and estimated due date", "গর্ভাবস্থার নাম ও সম্ভাব্য প্রসবের তারিখ") },
  { id: "latest_readings", type: "maternal_observation", fields: ["measurement", "observedAt", "provenance"], newest: 2,
    title: w("Latest readings", "সাম্প্রতিক পরিমাপ"), blurb: w("Your 2 newest readings, with who recorded them", "আপনার সর্বশেষ ২টি পরিমাপ, কে লিখেছেন সহ") },
  { id: "baby_basics", type: "baby_record", fields: ["label", "birthDate"], newest: 1,
    title: w("Baby basics", "শিশুর মূল তথ্য"), blurb: w("Baby label and birth date", "শিশুর নাম ও জন্মতারিখ") },
  { id: "baby_readings", type: "baby_observation", fields: ["measurement", "observedAt", "provenance"], newest: 2,
    title: w("Baby’s latest readings", "শিশুর সাম্প্রতিক পরিমাপ"), blurb: w("The baby’s 2 newest readings", "শিশুর সর্বশেষ ২টি পরিমাপ") },
] as const;
export type Pack = typeof PACKS[number];
export function packSelection(pack: Pack, available: readonly AvailableRecord[]): Selection {
  const picked = available.filter(item => item.record.type === pack.type)
    .sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt) || a.record.id.localeCompare(b.record.id)).slice(0, pack.newest);
  const out: Selection = {};
  for (const { record } of picked) {
    const fields = pack.fields.filter(field => Object.hasOwn(record.fields, field));
    if (fields.length) out[`${record.type}/${record.id}`] = [...fields];
  }
  return out;
}
/** Tapping a pack twice undoes it: if everything it adds is already chosen it removes exactly those fields. */
export function togglePack(current: Selection, add: Selection): Selection {
  const entries = Object.entries(add);
  const all = entries.length > 0 && entries.every(([key, fields]) => fields.every(field => current[key]?.includes(field)));
  const next: Selection = Object.fromEntries(Object.entries(current).map(([key, fields]) => [key, [...fields]]));
  for (const [key, fields] of entries) {
    const merged = all ? (next[key] ?? []).filter(field => !fields.includes(field)) : [...new Set([...(next[key] ?? []), ...fields])];
    if (merged.length) next[key] = merged; else delete next[key];
  }
  return next;
}
export const countSelection = (selection: Selection) => ({
  records: Object.values(selection).filter(fields => fields.length).length,
  fields: Object.values(selection).reduce((sum, fields) => sum + fields.length, 0),
});

// ---------- duration
export const DURATIONS = [
  { hours: 1, label: w("1 hour", "১ ঘণ্টা") }, { hours: 24, label: w("24 hours", "২৪ ঘণ্টা") },
  { hours: 168, label: w("7 days", "৭ দিন") }, { hours: 720, label: w("30 days", "৩০ দিন") },
] as const;
/** The listed duration closest to a past permission window, so "Share again" offers the same length. */
export function closestHours(windowMs: number): number {
  const hours = windowMs / HOUR;
  if (!(hours > 0)) return 24;
  return DURATIONS.reduce<number>((best, option) => Math.abs(Math.log(option.hours / hours)) < Math.abs(Math.log(best / hours)) ? option.hours : best, DURATIONS[1].hours);
}
/** The server rejects anything past 30 days from ITS clock; the 30-day option backs off 10 minutes so a fast client clock can’t trip it.
 *  shortcut: fixed 10-minute guard, upgrade to a server-supplied "now" if skew ever exceeds that. */
export function expiryAt(hours: number, now: number): string {
  const guard = hours >= 720 ? 10 * MINUTE : 0;
  if (!DURATIONS.some(option => option.hours === hours) || !Number.isFinite(now)) throw new RangeError("Choose a supported permission duration.");
  return new Date(now + hours * HOUR - guard).toISOString();
}

// ---------- stop everything
export type StopState = "stopped" | "ended" | "active" | "unknown";
export type StopResult = { id: string; state: StopState };
export type StopSnapshot = { id: string; status: SupportRequestStatus; coordination?: Receipt };
/** A missing row on a paginated list is NOT proof of withdrawal. Confirm the exact request. */
export function stopEvidence(id: string, snapshot: StopSnapshot): StopState {
  if (snapshot.id !== id) return "unknown";
  if (snapshot.status === "closed") return "ended";
  if (snapshot.coordination?.revokedAt && Number.isFinite(Date.parse(snapshot.coordination.revokedAt))) return "stopped";
  // Client clock/expiry alone cannot prove the server has stopped access.
  return snapshot.coordination ? "active" : "unknown";
}
export async function stopRequests(ids: readonly string[], keyFor: (id: string) => string, operations: {
  revoke: (id: string, key: string) => Promise<StopSnapshot>;
  read: (id: string) => Promise<StopSnapshot>;
}): Promise<StopResult[]> {
  const unique = [...new Set(ids)];
  const results: StopResult[] = [];
  for (let offset = 0; offset < unique.length; offset += 4) {
    const batch = await Promise.all(unique.slice(offset, offset + 4).map(async id => {
      try {
        const state = stopEvidence(id, await operations.revoke(id, keyFor(id)));
        if (state === "stopped" || state === "ended") return { id, state };
      } catch { /* Reconcile a potentially committed operation by its exact ID. */ }
      try { return { id, state: stopEvidence(id, await operations.read(id)) }; }
      catch { return { id, state: "unknown" as const }; }
    }));
    results.push(...batch);
  }
  return results;
}
export function summariseStop(results: readonly StopResult[]) {
  const pending = results.filter(r => r.state !== "stopped" && r.state !== "ended").map(r => r.id);
  const stopped = results.filter(r => r.state === "stopped").length;
  const ended = results.filter(r => r.state === "ended").length;
  return { total: results.length, stopped, ended, pending,
    kind: !results.length ? "none" as const : pending.length === 0 ? "all" as const : stopped + ended === 0 ? "none" as const : "partial" as const };
}

// ---------- mother's home: who can see what right now
export type RingNode = { id: string; initial: string; name: string; frac: number; soon: boolean };
type ListRequest = { id: string; status: SupportRequestStatus; recipientUserId: string; createdAt: string; coordination?: Receipt };
export function splitSharing<T extends ListRequest>(items: readonly T[], now: number): { active: T[]; earlier: T[] } {
  const active = items.filter(item => isOpenAccess(accessState(item, now)))
    .sort((a, b) => Date.parse(a.coordination?.expiresAt ?? "") - Date.parse(b.coordination?.expiresAt ?? "") || a.id.localeCompare(b.id));
  const ids = new Set(active.map(item => item.id));
  return { active, earlier: items.filter(item => !ids.has(item.id)) };
}
export function sharingOverview(items: readonly ListRequest[], now: number, ready: boolean, complete: boolean) {
  const { active } = splitSharing(items, now);
  const people = new Set(active.map(item => item.recipientUserId)).size;
  const unchecked = items.some(item => ["legacy", "unknown", "scheduled"].includes(accessState(item, now)) && item.status !== "closed");
  return { people, requestCount: active.length, unchecked, emptyConfirmed: ready && complete && !active.length && !unchecked };
}
export function ringNodes(active: readonly ListRequest[], names: Readonly<Record<string, string>>, now: number): RingNode[] {
  const people = new Map<string, ListRequest[]>();
  for (const item of active) people.set(item.recipientUserId, [...(people.get(item.recipientUserId) ?? []), item]);
  return [...people.entries()].slice(0, 3).map(([personId, requests]) => {
    const name = (names[personId] ?? "").trim() || "?";
    return { id: personId, name, initial: [...name][0]?.toUpperCase() ?? "?",
      frac: Math.min(...requests.map(item => item.coordination ? fractionLeft(item.coordination, now) : 0)),
      soon: requests.some(item => accessState(item, now) === "ending_soon") };
  });
}

// ---------- provider queue: needs first, ending soonest
export type QueueFilter = "new" | "progress" | "replied" | "all";
type QueueRow = { id: string; status: SupportRequestStatus; createdAt: string; coordination?: Receipt };
const FILTER_STATUS: Record<Exclude<QueueFilter, "all">, readonly SupportRequestStatus[]> = { new: ["submitted", "delivered"], progress: ["acknowledged"], replied: ["responded"] };
export function queueView<T extends QueueRow>(items: readonly T[], now: number, filter: QueueFilter) {
  // Same rule the workspace already applied: closed, revoked and expired requests never reach a provider's list.
  const open = items.filter(item => item.status !== "closed" && (!item.coordination || isOpenAccess(accessState(item, now))));
  const count = (f: QueueFilter) => f === "all" ? open.length : open.filter(item => FILTER_STATUS[f].includes(item.status)).length;
  const rows = open.filter(item => filter === "all" || FILTER_STATUS[filter].includes(item.status)).sort((a, b) => {
    const x = a.coordination ? Date.parse(a.coordination.expiresAt) : Infinity, y = b.coordination ? Date.parse(b.coordination.expiresAt) : Infinity;
    return x === y ? Date.parse(b.createdAt) - Date.parse(a.createdAt) || a.id.localeCompare(b.id) : x - y;
  });
  return { rows, counts: { new: count("new"), progress: count("progress"), replied: count("replied"), all: count("all") } as Record<QueueFilter, number> };
}
