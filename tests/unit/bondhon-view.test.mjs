import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
const source = stripTypeScriptTypes(readFileSync(new URL("../../src/features/bondhon/bondhon-view.ts", import.meta.url), "utf8"));
const v = await import("data:text/javascript," + encodeURIComponent(source));
const iso = text => Date.parse(text);
const NOW = iso("2026-11-19T15:30:00Z"); // 9:30 pm in Bangladesh
const MIN = 60_000, HOUR = 3_600_000, DAY = 86_400_000;
const plain = value => JSON.parse(JSON.stringify(value)); // arrays from the vm may carry another realm's prototype

test("dates show Bangladesh time, in both languages, with the year only when it differs", () => {
  assert.equal(v.formatWhen("2026-11-19T15:14:00Z", "en", NOW), "Thu 19 Nov, 9:14 pm");
  assert.equal(v.formatWhen("2026-11-19T15:14:00Z", "bn", NOW), "বৃহস্পতিবার, ১৯ নভেম্বর, রাত ৯:১৪");
  assert.equal(v.formatWhen("2026-11-19T15:14:00Z", "en", iso("2027-02-01T00:00:00Z")), "Thu 19 Nov 2026, 9:14 pm");
  assert.equal(v.formatWhen("2026-11-19T18:00:00Z", "en", NOW), "Fri 20 Nov, 12:00 am"); // Dhaka midnight, not UTC
  assert.equal(v.formatWhen("2026-11-19T06:05:00Z", "en", NOW), "Thu 19 Nov, 12:05 pm");
  assert.equal(v.formatWhen("not a date", "en", NOW), "—");
});
test("time left rounds up so live access never reads 0, and ends cleanly", () => {
  const cases = [[0, "ended"], [-5, "ended"], [NaN, "ended"], [30_000, "1 min left"], [59 * MIN, "59 min left"], [60 * MIN, "1 h left"],
    [18 * HOUR + 20 * MIN, "18 h 20 min left"], [24 * HOUR, "1 day left"], [3 * 24 * HOUR + 3 * HOUR, "3 days 3 h left"]];
  for (const [ms, text] of cases) assert.equal(v.formatLeft(ms, "en"), text, String(ms));
  assert.equal(v.formatLeft(18 * HOUR + 20 * MIN, "bn"), "১৮ ঘণ্টা ২০ মিনিট বাকি");
  assert.equal(v.formatLeft(0, "bn"), "মেয়াদ শেষ");
  assert.equal(v.msLeft("2026-11-19T16:30:00Z", NOW), HOUR);
  assert.equal(v.msLeft("garbage", NOW), 0);
});
const receipt = (hoursWindow, leftMs, extra = {}) => ({ approvedAt: new Date(NOW + leftMs - hoursWindow * HOUR).toISOString(), expiresAt: new Date(NOW + leftMs).toISOString(), revokedAt: null, ...extra });
const req = (status, coordination) => ({ status, ...(coordination ? { coordination } : {}) });
test("access state: revoked beats expired, closed beats all, and bad data fails closed", () => {
  assert.equal(v.accessState(req("closed", receipt(24, 5 * HOUR)), NOW), "closed");
  assert.equal(v.accessState(req("delivered"), NOW), "legacy");
  assert.equal(v.accessState(req("delivered", receipt(24, -HOUR, { revokedAt: "2026-11-19T10:00:00Z" })), NOW), "revoked");
  assert.equal(v.accessState(req("delivered", receipt(24, 0)), NOW), "expired"); // the exact end instant is already over
  assert.equal(v.accessState(req("delivered", { approvedAt: "x", expiresAt: "y", revokedAt: null }), NOW), "unknown");
  assert.equal(v.accessState(req("delivered", receipt(24, 5 * HOUR)), NaN), "unknown");
});
test("ending soon scales with the window, so a 1-hour permission is not 'ending soon' all along", () => {
  assert.equal(v.accessState(req("delivered", receipt(1, 30 * MIN)), NOW), "active");
  assert.equal(v.accessState(req("delivered", receipt(1, 14 * MIN)), NOW), "ending_soon");
  assert.equal(v.accessState(req("delivered", receipt(24, 61 * MIN)), NOW), "active");
  assert.equal(v.accessState(req("delivered", receipt(24, 59 * MIN)), NOW), "ending_soon");
  assert.equal(v.fractionLeft(receipt(24, 6 * HOUR), NOW), 0.25);
  assert.equal(v.fractionLeft(receipt(24, -1), NOW), 0);
});
test("what-happens-next copy exists in both languages and never overstates", () => {
  const statuses = ["submitted", "delivered", "acknowledged", "responded", "closed"], accesses = ["active", "ending_soon", "expired", "revoked", "closed", "legacy"];
  for (const s of statuses) for (const a of accesses) {
    const c = v.nextStep(s, a);
    for (const part of [c.meaning, c.next]) { assert.ok(part.en.length > 10 && part.bn.length > 10); }
  }
  for (const a of ["expired", "revoked", "closed", "legacy"]) assert.deepEqual(plain(v.nextStep("delivered", a)), plain(v.nextStep("responded", a)), a); // ended access ignores progress
  assert.match(v.nextStep("delivered", "active").meaning.en, /has not acknowledged it yet/);
  assert.doesNotMatch(v.nextStep("submitted", "active").meaning.en, /delivered to the demo queue\.$/); // submitted is not delivered
  assert.match(v.nextStep("acknowledged", "active").next.en, /Nothing is guaranteed/);
});
const ev = (id, action, at, actor = "mother") => ({ id, action, actor, occurredAt: at, policyVersion: 1 });
test("history reads as sentences: no raw strings, read noise hidden, bursts merged, newest first", () => {
  const audit = [ev("a1", "request.owner_read", "2026-11-19T15:20:00Z"), ev("a2", "request.events_read", "2026-11-19T15:20:01Z"),
    ev("p1", "request.provider_read", "2026-11-19T15:25:00Z", "provider"), ev("c1", "consent.created", "2026-11-19T15:14:02Z"),
    ev("c2", "consent.created", "2026-11-19T15:14:02Z"), ev("c3", "consent.created", "2026-11-19T15:14:01Z"),
    ev("d1", "request.delivered", "2026-11-19T15:15:00Z", "provider"), ev("z", "request.something_new", "2026-11-19T15:16:00Z"),
    ev("bad", "request.closed", "nope")];
  const rows = v.auditTimeline(audit, "2026-11-19T15:14:00Z");
  assert.deepEqual(plain(rows.map(r => r.text.en)), ["Activity recorded", "Delivered to the demo queue", "You approved sharing (3 records)", "You sent this request"]);
  assert.deepEqual(plain(rows.map(r => r.count)), [1, 1, 3, 1]);
  for (const r of rows) { assert.doesNotMatch(r.text.en + r.text.bn, /request\.|consent\.|_/); assert.ok(r.text.bn.length > 3); }
  assert.equal(rows.at(-1).key, "submitted");
  assert.equal(v.auditTimeline([ev("m", "request.closed", "2026-11-19T15:50:00Z", "provider")])[0].who, "provider");
  assert.equal(v.auditTimeline([], "garbage").length, 0);
});
test("provider opens are counted honestly: provider actor only, 'at least' when the server cap is reached", () => {
  const audit = [ev("1", "request.provider_read", "2026-11-19T15:25:00Z", "provider"), ev("2", "request.provider_read", "2026-11-19T15:31:00Z", "provider"),
    ev("3", "request.provider_read", "2026-11-19T15:40:00Z", "mother"), ev("4", "request.owner_read", "2026-11-19T15:41:00Z")];
  assert.deepEqual(plain(v.providerOpens(audit)), { count: 2, lastAt: "2026-11-19T15:31:00Z", atLeast: false });
  assert.deepEqual(plain(v.providerOpens([])), { count: 0, lastAt: null, atLeast: false });
  assert.equal(v.providerOpens(Array.from({ length: 100 }, (_, i) => ev(String(i), "request.provider_read", "2026-11-19T15:00:00Z", "provider"))).atLeast, true);
});
const rec = (type, id, fields, recordedAt) => ({ record: { type, id, fields }, recordedAt });
const available = [rec("pregnancy_record", "p1", { label: "L", estimatedDueDate: "2027-03-14" }, "2026-10-01T00:00:00Z"),
  rec("maternal_observation", "m1", { measurement: {}, observedAt: "x", provenance: {} }, "2026-11-01T00:00:00Z"),
  rec("maternal_observation", "m2", { measurement: {}, observedAt: "x" }, "2026-11-10T00:00:00Z"),
  rec("maternal_observation", "m3", { measurement: {}, observedAt: "x", provenance: {} }, "2026-11-05T00:00:00Z"),
  rec("maternal_symptom_note", "s1", { note: "private", occurredAt: "x" }, "2026-11-12T00:00:00Z"),
  rec("wellness_entry", "w1", { mood: "low" }, "2026-11-12T00:00:00Z"), rec("maternal_condition", "c1", { label: "x" }, "2026-11-12T00:00:00Z")];
test("visit packs choose the newest records, only fields that exist, and never touch sensitive types", () => {
  const readings = v.PACKS.find(p => p.id === "latest_readings");
  assert.deepEqual(plain(v.packSelection(readings, available)), { "maternal_observation/m2": ["measurement", "observedAt"], "maternal_observation/m3": ["measurement", "observedAt", "provenance"] });
  assert.deepEqual(plain(v.packSelection(v.PACKS[2], available)), {}); // no baby record: nothing is invented
  const allowed = new Set(["pregnancy_record", "maternal_observation", "baby_record", "baby_observation"]);
  for (const pack of v.PACKS) assert.ok(allowed.has(pack.type), pack.id);
  const everything = v.PACKS.flatMap(pack => Object.keys(v.packSelection(pack, available)));
  assert.ok(everything.every(key => !/symptom|wellness|condition/.test(key)));
});
test("tapping a pack twice undoes exactly what it added, and never mutates its inputs", () => {
  const add = { "pregnancy_record/p1": ["label", "estimatedDueDate"] };
  const base = { "maternal_observation/m1": ["measurement"], "pregnancy_record/p1": ["label"] };
  const frozen = JSON.stringify(base);
  const on = v.togglePack(base, add);
  assert.deepEqual(plain(on), { "maternal_observation/m1": ["measurement"], "pregnancy_record/p1": ["label", "estimatedDueDate"] }); // partial overlap adds the rest
  assert.deepEqual(plain(v.togglePack(on, add)), { "maternal_observation/m1": ["measurement"] }); // second tap removes, keeps others
  assert.equal(JSON.stringify(base), frozen);
  assert.deepEqual(plain(v.togglePack({}, {})), {});
  assert.deepEqual(plain(v.countSelection(on)), { records: 2, fields: 3 });
});
test("expiry: exact for short windows, and the 30-day option stays under the server's cap even if the client clock runs fast", () => {
  assert.equal(v.expiryAt(24, NOW), new Date(NOW + DAY).toISOString());
  assert.equal(v.expiryAt(1, NOW), new Date(NOW + HOUR).toISOString());
  assert.ok(Date.parse(v.expiryAt(720, NOW)) <= NOW + 30 * DAY - 10 * MIN);
  assert.deepEqual(plain(v.DURATIONS.map(d => d.hours)), [1, 24, 168, 720]);
});
test("share again offers the duration closest to the old window, and 24 hours when it is unreadable", () => {
  assert.equal(v.closestHours(24 * HOUR), 24);
  assert.equal(v.closestHours(2 * HOUR), 1);
  assert.equal(v.closestHours(5 * DAY), 168);
  assert.equal(v.closestHours(45 * DAY), 720);
  assert.equal(v.closestHours(0), 24);
  assert.equal(v.closestHours(NaN), 24);
});
test("batch outcomes distinguish withdrawn, closed, active and unknown requests", () => {
  assert.deepEqual(plain(v.summariseStop([{ id: "a", state: "stopped" }, { id: "b", state: "ended" }])), { total: 2, stopped: 1, ended: 1, pending: [], kind: "all" });
  assert.deepEqual(plain(v.summariseStop([{ id: "a", state: "stopped" }, { id: "b", state: "unknown" }])), { total: 2, stopped: 1, ended: 0, pending: ["b"], kind: "partial" });
  assert.equal(v.summariseStop([{ id: "a", state: "active" }]).kind, "none");
  assert.equal(v.summariseStop([]).kind, "none");
});
const listItem = (id, status, recipientUserId, c) => ({ id, status, recipientUserId, createdAt: "2026-11-19T10:00:00Z", ...(c ? { coordination: c } : {}) });
test("home splits who can see now from earlier, soonest-ending first, and builds ring nodes", () => {
  const items = [listItem("late", "delivered", "u2", receipt(24, 10 * HOUR)), listItem("soon", "acknowledged", "u1", receipt(24, 30 * MIN)),
    listItem("gone", "delivered", "u3", receipt(24, -HOUR)), listItem("rev", "delivered", "u4", receipt(24, HOUR, { revokedAt: "2026-11-19T11:00:00Z" })),
    listItem("shut", "closed", "u5", receipt(24, HOUR)), listItem("old", "delivered", "u6")];
  const { active, earlier } = v.splitSharing(items, NOW);
  assert.deepEqual(plain(active.map(i => i.id)), ["soon", "late"]);
  assert.deepEqual(plain(earlier.map(i => i.id).sort()), ["gone", "old", "rev", "shut"]);
  const nodes = v.ringNodes(active, { u1: "farhan Hossain", u2: "Nasrin Akter" }, NOW);
  assert.deepEqual(plain(nodes.map(n => [n.initial, n.soon])), [["F", true], ["N", false]]);
  assert.ok(nodes[0].frac > 0 && nodes[0].frac < 0.1);
  assert.equal(v.ringNodes(active, {}, NOW)[0].initial, "?");
  assert.equal(v.ringNodes(Array.from({ length: 5 }, (_, i) => listItem(String(i), "delivered", "u1", receipt(24, HOUR * 5))), {}, NOW).length, 1);
});
test("provider queue hides ended access, sorts by time left, keeps old requests last, and counts per tab", () => {
  const items = [listItem("a", "delivered", "m", receipt(24, 5 * HOUR)), listItem("b", "delivered", "m", receipt(24, 20 * MIN)),
    listItem("c", "acknowledged", "m", receipt(24, 2 * HOUR)), listItem("d", "responded", "m", receipt(24, 3 * HOUR)),
    listItem("old", "delivered", "m"), listItem("x1", "closed", "m", receipt(24, HOUR)), listItem("x2", "delivered", "m", receipt(24, -1)),
    listItem("x3", "delivered", "m", receipt(24, HOUR, { revokedAt: "2026-11-19T11:00:00Z" }))];
  const all = v.queueView(items, NOW, "all");
  assert.deepEqual(plain(all.rows.map(r => r.id)), ["b", "c", "d", "a", "old"]);
  assert.deepEqual(plain(all.counts), { new: 3, progress: 1, replied: 1, all: 5 });
  assert.deepEqual(plain(v.queueView(items, NOW, "new").rows.map(r => r.id)), ["b", "a", "old"]);
  assert.deepEqual(plain(v.queueView(items, NOW, "replied").rows.map(r => r.id)), ["d"]);
  assert.deepEqual(plain(v.queueView([], NOW, "all").counts), { new: 0, progress: 0, replied: 0, all: 0 });
});

test("incomplete, unchecked and loading collections never confirm that sharing is empty", () => {
  assert.equal(v.sharingOverview([], NOW, true, true).emptyConfirmed, true);
  assert.equal(v.sharingOverview([], NOW, false, true).emptyConfirmed, false);
  assert.equal(v.sharingOverview([], NOW, true, false).emptyConfirmed, false);
  assert.equal(v.sharingOverview([listItem("old", "delivered", "u1")], NOW, true, true).emptyConfirmed, false);
  const items = [listItem("a", "delivered", "u1", receipt(24, HOUR)), listItem("b", "acknowledged", "u1", receipt(24, 2 * HOUR))];
  assert.equal(v.sharingOverview(items, NOW, true, true).people, 1);
  assert.equal(v.sharingOverview(items, NOW, true, true).requestCount, 2);
});
test("future approvals and invalid permission windows fail closed", () => {
  assert.equal(v.accessState(req("delivered", { approvedAt: new Date(NOW + HOUR).toISOString(), expiresAt: new Date(NOW + 2 * HOUR).toISOString(), revokedAt: null }), NOW), "scheduled");
  assert.equal(v.accessState(req("delivered", { approvedAt: "bad", expiresAt: new Date(NOW + HOUR).toISOString(), revokedAt: null }), NOW), "unknown");
  assert.equal(v.accessState(req("delivered", { approvedAt: new Date(NOW + 2 * HOUR).toISOString(), expiresAt: new Date(NOW + HOUR).toISOString(), revokedAt: null }), NOW), "unknown");
});
test("an absent list row, expired timestamp or wrong request can never prove withdrawal", () => {
  assert.equal(v.stopEvidence("a", { id: "b", status: "closed" }), "unknown");
  assert.equal(v.stopEvidence("a", { id: "a", status: "delivered" }), "unknown");
  assert.equal(v.stopEvidence("a", { id: "a", status: "delivered", coordination: receipt(24, -HOUR) }), "active");
  assert.equal(v.stopEvidence("a", { id: "a", status: "closed" }), "ended");
});
test("a lost mutation response is reconciled against the exact request receipt", async () => {
  const readIds = [];
  const results = await v.stopRequests(["a"], () => "same-key", {
    revoke: async () => { throw new Error("connection lost after commit"); },
    read: async id => { readIds.push(id); return { id, status: "delivered", coordination: receipt(24, HOUR, { revokedAt: new Date(NOW).toISOString() }) }; },
  });
  assert.deepEqual(readIds, ["a"]);
  assert.deepEqual(plain(results), [{ id: "a", state: "stopped" }]);
});
test("unavailable reconciliation stays unknown and retries preserve the request key", async () => {
  const keys = new Map(), calls = [];
  const keyFor = id => { if (!keys.has(id)) keys.set(id, `key-${id}`); return keys.get(id); };
  const operations = { revoke: async (id, key) => { calls.push([id, key]); throw new Error("offline"); }, read: async () => { throw new Error("not found or offline"); } };
  assert.deepEqual(plain(await v.stopRequests(["a"], keyFor, operations)), [{ id: "a", state: "unknown" }]);
  await v.stopRequests(["a"], keyFor, operations);
  assert.deepEqual(calls, [["a", "key-a"], ["a", "key-a"]]);
});
test("mixed stop batches preserve individual outcomes and bound concurrent writes", async () => {
  let active = 0, maximum = 0;
  const ids = Array.from({ length: 13 }, (_, i) => String(i));
  const results = await v.stopRequests([...ids, "0"], id => `key-${id}`, {
    revoke: async id => {
      active++; maximum = Math.max(maximum, active);
      await new Promise(resolve => setTimeout(resolve, 1)); active--;
      if (id === "1") throw new Error("failed");
      return { id, status: id === "2" ? "closed" : "delivered", coordination: receipt(24, HOUR, { revokedAt: new Date(NOW).toISOString() }) };
    },
    read: async id => ({ id, status: "delivered", coordination: receipt(24, HOUR) }),
  });
  assert.equal(results.length, 13); assert.ok(maximum <= 4);
  assert.equal(results.find(r => r.id === "1").state, "active");
  assert.equal(results.find(r => r.id === "2").state, "ended");
  assert.equal(v.summariseStop(results).kind, "partial");
});
test("history grouping cannot chain beyond a minute or combine receipt versions", () => {
  const events = [ev("a", "consent.created", "2026-11-19T15:15:00Z"), ev("b", "consent.created", "2026-11-19T15:14:10Z"), ev("c", "consent.created", "2026-11-19T15:13:20Z"), { ...ev("d", "consent.created", "2026-11-19T15:13:19Z"), policyVersion: 2 }];
  assert.deepEqual(plain(v.auditTimeline(events).map(e => e.count)), [2, 1, 1]);
});
test("unsupported expiry choices cannot create unbounded permission windows", () => {
  for (const hours of [0, -1, 721, 999999, NaN, Infinity]) assert.throws(() => v.expiryAt(hours, NOW));
  assert.throws(() => v.expiryAt(24, NaN));
});
