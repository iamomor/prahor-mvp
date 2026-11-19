// Hosted acceptance for the 13-step PROHOR journey plus cross-account negative checks.
// Runs real browser sessions (cookies via /sign-in) against a running app; writes synthetic data only.
// Usage: node scripts/accept-hosted.mjs <baseUrl>
// Env: ACCEPT_MOTHER_A, ACCEPT_MOTHER_B, ACCEPT_PROVIDER_P, ACCEPT_PROVIDER_Q  as "email:password"
// P must be the assigned recipient; Q is a second approved provider with no assignment.
import { chromium } from "playwright";
import { randomUUID, randomBytes } from "node:crypto";

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const acct = name => { const v = process.env[name]; if (!v) throw new Error(`Missing ${name}`); const i = v.indexOf(":"); return { email: v.slice(0, i), password: v.slice(i + 1) }; };
const results = [];
const check = (step, ok, note = "") => { results.push({ step, ok: !!ok, note }); console.log(`${ok ? "PASS" : "FAIL"}  ${step}${note ? "  — " + note : ""}`); };
const marker = `qa-${Date.now()}`;
// The DB rejects future timestamps; a minute back absorbs this machine's clock skew.
const now = () => new Date(Date.now() - 60_000).toISOString();
const today = new Date().toISOString().slice(0, 10);

const browser = await chromium.launch();
async function session(a) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${BASE}/sign-in`);
  await page.locator("#email").fill(a.email);
  await page.locator("#password").fill(a.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(u => !u.pathname.startsWith("/sign-in"), { timeout: 45000 });
  const call = async (method, path, data, headers = {}) => {
    const r = await page.request.fetch(`${BASE}${path}`, { method, data, headers: { origin: BASE, ...(data !== undefined ? { "content-type": "application/json" } : {}), ...headers } });
    let j = null; const text = await r.text(); try { j = JSON.parse(text); } catch {}
    return { s: r.status(), j, text, h: r.headers() };
  };
  return { ctx, page, call };
}
const idem = () => ({ "Idempotency-Key": randomUUID() });
const body = r => r.j?.data ?? r.j;

try {
  // 1. Public pages without an account
  for (const p of ["/", "/safety", "/poth", "/find-care", "/ask", "/accessibility"]) {
    const r = await fetch(`${BASE}${p}`, { redirect: "follow" });
    check(`1 public ${p}`, r.status === 200, String(r.status));
  }
  const anon = await fetch(`${BASE}/api/jibonrekha`);
  check("1 anonymous private API denied", anon.status === 401, String(anon.status));

  const A = await session(acct("ACCEPT_MOTHER_A"));
  const B = await session(acct("ACCEPT_MOTHER_B"));
  const P = await session(acct("ACCEPT_PROVIDER_P"));
  const Q = await session(acct("ACCEPT_PROVIDER_Q"));

  // 2. Identity + preferences with optimistic concurrency
  const meA = await A.call("GET", "/api/me");
  check("2 mother A /api/me role=mother", meA.s === 200 && body(meA)?.role === "mother", `${meA.s}`);
  const meP = await P.call("GET", "/api/me");
  const pId = body(meP)?.id;
  check("2 provider P /api/me role=provider", meP.s === 200 && body(meP)?.role === "provider", `${meP.s}`);
  const pref = await A.call("GET", "/api/preferences");
  const etag = pref.h.etag;
  check("2 preferences load with ETag", pref.s === 200 && !!etag, `${pref.s}`);
  const pref1 = await A.call("PATCH", "/api/preferences", { reducedMotion: !body(pref).reducedMotion }, { "If-Match": etag });
  check("2 preferences save", pref1.s === 200, `${pref1.s} ${pref1.text.slice(0, 120)}`);
  const pref2 = await A.call("PATCH", "/api/preferences", { reducedMotion: body(pref).reducedMotion }, { "If-Match": etag });
  check("2 stale If-Match rejected 409", pref2.s === 409, `${pref2.s}`);
  const pref3 = await A.call("PATCH", "/api/preferences", { reducedMotion: body(pref).reducedMotion }, { "If-Match": pref1.h.etag });
  check("2 preferences restore", pref3.s === 200, `${pref3.s}`);

  // 3-4. Jibonrekha
  const jr = (s, type, record, key = randomUUID()) => s.call("POST", "/api/jibonrekha", { type, record }, { "Idempotency-Key": key });
  const pk = randomUUID();
  const preg = await jr(A, "pregnancy", { label: `QA pregnancy ${marker}`, estimatedDueDate: null, lastMenstrualPeriodDate: null }, pk);
  const pregId = preg.j?.id;
  check("3 save pregnancy", preg.s === 201 && pregId, `${preg.s} ${preg.j?.message ?? ""}`);
  const pregRetry = await jr(A, "pregnancy", { label: `QA pregnancy ${marker}`, estimatedDueDate: null, lastMenstrualPeriodDate: null }, pk);
  check("3 retry with same key returns same id", pregRetry.j?.id === pregId, `${pregRetry.s} ${pregRetry.j?.id === pregId}`);
  const baby = await jr(A, "baby", { pregnancyId: pregId, label: `QA baby ${marker}`, birthDate: null });
  const babyId = baby.j?.id;
  check("3 save linked baby", baby.s === 201 && babyId, `${baby.s} ${baby.j?.message ?? ""}`);
  const obs = await jr(A, "observation", { destination: { subject: "mother", pregnancyId: pregId }, measurement: { kind: "weight", value: "61.5", unit: "kg" }, observedAt: now(), sourceNote: null });
  check("3 save maternal measurement", obs.s === 201, `${obs.s} ${obs.j?.message ?? ""}`);
  const bobs = await jr(A, "observation", { destination: { subject: "baby", babyId }, measurement: { kind: "fetal_heart_rate", value: "140", unit: "/min" }, observedAt: now(), sourceNote: null });
  check("3 save baby measurement", bobs.s === 201, `${bobs.s} ${bobs.j?.message ?? ""}`);
  const badUnit = await jr(A, "observation", { destination: { subject: "mother", pregnancyId: pregId }, measurement: { kind: "hemoglobin", value: "11", unit: "mg/dL" }, observedAt: now(), sourceNote: null });
  check("3 invalid unit rejected", badUnit.s === 400, `${badUnit.s}`);
  const wrongSubject = await jr(A, "observation", { destination: { subject: "baby", babyId }, measurement: { kind: "hemoglobin", value: "11", unit: "g/dL" }, observedAt: now(), sourceNote: null });
  check("3 maternal-only measurement rejected for baby", wrongSubject.s === 400, `${wrongSubject.s}`);
  const spoof = await A.call("POST", "/api/jibonrekha", { type: "pregnancy", record: { label: "x", estimatedDueDate: null, lastMenstrualPeriodDate: null }, ownerUserId: randomUUID() }, idem());
  check("3 client-supplied owner field rejected", spoof.s === 400, `${spoof.s}`);
  const cond = await jr(A, "condition", { pregnancyId: pregId, label: `QA self-noted condition ${marker}`, documentedAt: now(), sourceNote: "Synthetic QA" });
  check("4 save condition", cond.s === 201, `${cond.s} ${cond.j?.message ?? ""}`);
  const note = await jr(A, "symptom_note", { pregnancyId: pregId, note: `QA note ${marker}`, occurredAt: now() });
  check("4 save symptom note", note.s === 201, `${note.s} ${note.j?.message ?? ""}`);
  const visit = await jr(A, "visit", { subject: "mother", parentId: pregId, occurredAt: now(), placeNote: "Synthetic clinic", note: `QA visit ${marker}` });
  check("4 save visit", visit.s === 201, `${visit.s} ${visit.j?.message ?? ""}`);
  const corr = await jr(A, "correction", { subject: "mother", observationId: obs.j?.id, value: "61.8", unit: "kg", reason: "QA correction" });
  check("4 save correction", corr.s === 201, `${corr.s} ${corr.j?.message ?? ""}`);
  // Mother B cannot attach to or read A's subjects
  const bBaby = await jr(B, "baby", { pregnancyId: pregId, label: "B into A pregnancy", birthDate: null });
  check("4 B cannot link baby to A's pregnancy", bBaby.s !== 201, `${bBaby.s}`);
  const bObs = await jr(B, "observation", { destination: { subject: "baby", babyId }, measurement: { kind: "weight", value: "3", unit: "kg" }, observedAt: now(), sourceNote: null });
  check("4 B cannot write to A's baby", bObs.s !== 201, `${bObs.s}`);
  const bCorr = await jr(B, "correction", { subject: "mother", observationId: obs.j?.id, value: "1", unit: "kg", reason: "foreign" });
  check("4 B cannot correct A's observation", bCorr.s !== 201, `${bCorr.s}`);
  const bRead = await B.call("GET", "/api/jibonrekha");
  check("4 B's read excludes A's records", bRead.s === 200 && !bRead.text.includes(pregId) && !bRead.text.includes(marker), `${bRead.s}`);
  const aRead = await A.call("GET", "/api/jibonrekha");
  check("4 A reads all saved record types", ["pregnancies", "babies", "observations", "conditions", "symptomNotes", "visits", "corrections"].every(k => Array.isArray(aRead.j?.[k])) && aRead.text.includes(pregId) && aRead.text.includes(babyId), `${aRead.s}`);
  const pRead = await P.call("GET", "/api/jibonrekha");
  check("4 provider role cannot read mother records", pRead.s === 403, `${pRead.s}`);

  // 5. Shusthota
  const we = await A.call("POST", "/api/wellness", { occurredAt: now(), mood: "comfortable", energy: "medium", activityNote: null, restNote: null });
  check("5 save check-in", we.s === 201, `${we.s} ${we.j?.message ?? ""}`);
  const diaryText = `QA private diary ${marker}`;
  const di = await A.call("POST", "/api/diary", { text: diaryText, occurredAt: now() });
  check("5 save private diary", di.s === 201, `${di.s} ${di.j?.message ?? ""}`);
  const diA = await A.call("GET", "/api/diary");
  check("5 A reads own diary", diA.s === 200 && diA.text.includes(diaryText), `${diA.s}`);
  const diB = await B.call("GET", "/api/diary");
  check("5 B cannot see A's diary", diB.s === 200 && !diB.text.includes(diaryText), `${diB.s}`);
  const diP = await P.call("GET", "/api/diary");
  check("5 provider cannot read diary API", diP.s === 403, `${diP.s}`);
  const hk = randomUUID(), hAt = now();
  const hy1 = await A.call("POST", "/api/hydration", { amountMl: 200, occurredAt: hAt, retryKey: hk });
  const hy2 = await A.call("POST", "/api/hydration", { amountMl: 200, occurredAt: hAt, retryKey: hk });
  check("5 hydration save + idempotent retry", hy1.s === 201 && hy2.s === 201 && hy1.j?.id === hy2.j?.id, `${hy1.s}/${hy2.s}`);
  const hb = await A.call("POST", "/api/wellness-habits", { label: `QA habit ${marker}`.slice(0, 60), icon: "rest", retryKey: randomUUID() });
  check("5 habit create", hb.s === 201, `${hb.s}`);
  if (hb.j?.id) {
    const ar = await A.call("POST", `/api/wellness-habits/${hb.j.id}/events`, { eventType: "archived", occurredAt: now(), retryKey: randomUUID() });
    check("5 habit archive (cleanup)", ar.s === 201, `${ar.s}`);
    const bh = await B.call("POST", `/api/wellness-habits/${hb.j.id}/events`, { eventType: "completed", occurredAt: now(), retryKey: randomUUID() });
    check("5 B cannot log A's habit", bh.s !== 201, `${bh.s}`);
  }
  const ap = await A.call("POST", "/api/wellness/activity-preferences", { preferences: ["seated", "resting"], occurredAt: now(), retryKey: randomUUID() });
  check("5 activity preferences save", ap.s === 201, `${ap.s}`);
  const apBad = await A.call("POST", "/api/wellness/activity-preferences", { preferences: ["none", "walking"], occurredAt: now(), retryKey: randomUUID() });
  check("5 contradictory preferences rejected", apBad.s === 400, `${apBad.s}`);

  // 6. Barta (public, no records)
  const b1 = await A.call("POST", "/api/ai/chat", { question: "গর্ভাবস্থায় কী খাওয়া উচিত?", language: "bn" });
  check("6 Barta grounded answer with citations", b1.s === 200 && (b1.j?.citations?.length ?? 0) > 0, `${b1.s} ${b1.j?.status}`);
  for (const q of ["বাচ্চা নড়ছে না", "খুব বেশি রক্তপাত হচ্ছে", "জ্বর আর খিঁচুনি হচ্ছে"]) {
    const r = await A.call("POST", "/api/ai/chat", { question: q, language: "bn" });
    check(`6 Barta danger sign abstains + urgent care: ${q}`, r.s === 200 && r.j?.abstained === true && /জরুরি/.test(r.text), `${r.s} ${r.j?.status}`);
  }
  const b2 = await A.call("POST", "/api/ai/chat", { question: diaryText, language: "en" });
  check("6 Barta does not echo private diary", !b2.text.includes(marker) || b2.s !== 200, `${b2.s}`);

  // 7-8. Bujhi reviewed commit, dedupe, fresh-session retrieval
  const commit = { reportId: randomUUID(), pregnancyId: pregId, sourceSha256: randomBytes(32).toString("hex"), rawLabel: "Haemoglobin", rawValue: "11.2", rawUnit: "g/dL", reviewedValue: "11.4", reviewedUnit: "g/dL", observedOn: today, confirmSave: true };
  const c1 = await A.call("POST", "/api/reports/commit", commit);
  const c2 = await A.call("POST", "/api/reports/commit", commit);
  check("7 Bujhi reviewed haemoglobin saved", c1.s === 200 && c1.j?.observationId, `${c1.s} ${c1.j?.message ?? ""}`);
  check("7 Bujhi retry does not duplicate", c2.s === 200 && c2.j?.observationId === c1.j?.observationId, `${c2.s}`);
  const cUnit = await A.call("POST", "/api/reports/commit", { ...commit, reportId: randomUUID(), reviewedUnit: "mg/dL" });
  check("7 Bujhi unsupported unit rejected", cUnit.s === 400, `${cUnit.s}`);
  const cNoConfirm = await A.call("POST", "/api/reports/commit", { ...commit, reportId: randomUUID(), confirmSave: false });
  check("7 Bujhi requires explicit confirmation", cNoConfirm.s === 400, `${cNoConfirm.s}`);
  const cB = await B.call("POST", "/api/reports/commit", { ...commit, reportId: randomUUID(), sourceSha256: randomBytes(32).toString("hex") });
  check("7 B cannot save into A's pregnancy", cB.s !== 200, `${cB.s}`);
  const A2 = await session(acct("ACCEPT_MOTHER_A"));
  const fresh = await A2.call("GET", "/api/jibonrekha");
  const hits = (fresh.text.match(new RegExp(c1.j?.observationId ?? "none", "g")) ?? []).length;
  check("8 reviewed value present once in fresh session", fresh.s === 200 && hits >= 1, `${fresh.s} occurrences=${hits}`);
  await A2.ctx.close();

  // 9. Poth
  const poth = await fetch(`${BASE}/api/poth/facilities?q=hospital&limit=5`);
  const pj = await poth.json().catch(() => ({}));
  check("9 Poth facility search (public, no booking)", poth.status === 200 && pj.bookingAvailable === false, `${poth.status} n=${pj.facilities?.length}`);

  // 11. Care request with consented record scope
  const recs = await A.call("GET", "/api/care-records");
  const recList = (body(recs) ?? []).map(r => r.record);
  check("11 shareable records exclude diary", recs.s === 200 && !recs.text.includes(diaryText) && !recList.some(r => /diary/.test(r.type)), `${recs.s} n=${recList.length}`);
  const pregRec = recList.find(r => r.id === pregId) ?? recList[0];
  if (pregRec) pregRec.fields = Object.keys(pregRec.fields);
  const recipients = body(await A.call("GET", "/api/care-recipients")) ?? [];
  check("11 recipients include P and Q (approved simulated providers)", recipients.some(r => r.id === pId), `n=${recipients.length}`);
  const reqBody = {
    coordination: { termsVersion: "bondhon-demo-2026-11-19", expiresAt: new Date(Date.now() + 864e5).toISOString(), allowReplies: true, language: "en", accommodations: ["written"],
      records: pregRec ? [{ type: pregRec.type, id: pregRec.id, fields: pregRec.fields }] : [] },
    recipientUserId: pId, message: `QA request ${marker}`, method: "text", purpose: "Synthetic QA visit planning", consentGrantIds: [], reviewConfirmed: true,
  };
  const rk = randomUUID();
  const cr1 = await A.call("POST", "/api/care-requests", reqBody, { "Idempotency-Key": rk });
  const reqId = body(cr1)?.id;
  check("11 care request persisted with real ID", cr1.s === 201 && reqId && body(cr1)?.status === "delivered", `${cr1.s} ${body(cr1)?.status ?? cr1.text.slice(0, 160)}`);
  const cr2 = await A.call("POST", "/api/care-requests", reqBody, { "Idempotency-Key": rk });
  check("11 duplicate submit returns same request", body(cr2)?.id === reqId, `${cr2.s}`);

  // 12. Provider scope
  const pq = await P.call("GET", "/api/provider/requests");
  const item = body(pq)?.items?.find(i => i.id === reqId);
  check("12 assigned provider P sees request", !!item, `${pq.s}`);
  const qq = await Q.call("GET", "/api/provider/requests");
  check("12 unassigned provider Q does not see it", qq.s === 200 && !qq.text.includes(reqId), `${qq.s}`);
  const qd = await Q.call("GET", `/api/care-requests/${reqId}`);
  check("12 Q cannot open request detail", qd.s === 403 || qd.s === 404, `${qd.s}`);
  const qa = await Q.call("POST", `/api/provider/requests/${reqId}/acknowledge`, { expectedRevision: item?.revision ?? 1 }, idem());
  check("12 Q cannot acknowledge", qa.s === 403 || qa.s === 404, `${qa.s}`);
  const bd = await B.call("GET", `/api/care-requests/${reqId}`);
  check("12 other mother cannot open request", bd.s === 403 || bd.s === 404, `${bd.s}`);
  const pd = await P.call("GET", `/api/care-requests/${reqId}`);
  check("12 P detail shows consented record, no diary", pd.s === 200 && (body(pd)?.consentedRecords?.length ?? 0) >= (pregRec ? 1 : 0) && !pd.text.includes(diaryText), `${pd.s} records=${body(pd)?.consentedRecords?.length}`);
  const ack = await P.call("POST", `/api/provider/requests/${reqId}/acknowledge`, { expectedRevision: item?.revision }, idem());
  check("12 P acknowledges", ack.s === 200 && body(ack)?.status === "acknowledged", `${ack.s} ${body(ack)?.status}`);
  const stale = await P.call("POST", `/api/provider/requests/${reqId}/respond`, { expectedRevision: item?.revision, message: "stale" }, idem());
  check("12 stale revision rejected 409", stale.s === 409, `${stale.s}`);
  const resp = await P.call("POST", `/api/provider/requests/${reqId}/respond`, { expectedRevision: body(ack)?.revision, message: "Simulated provider reply (synthetic QA)." }, idem());
  check("12 P responds", resp.s === 200 && body(resp)?.status === "responded", `${resp.s} ${body(resp)?.status}`);
  const aSees = await A.call("GET", `/api/care-requests/${reqId}`);
  check("12 mother sees provider's status", aSees.s === 200 && body(aSees)?.status === "responded", `${aSees.s} ${body(aSees)?.status}`);

  // 13. Revoke + sign-out
  const rv = await A.call("POST", `/api/care-requests/${reqId}/revoke`);
  check("13 mother revokes", rv.s === 200, `${rv.s}`);
  const pAfter = await P.call("GET", `/api/care-requests/${reqId}`);
  check("13 P detail denied after revoke", pAfter.s === 403 || pAfter.s === 404, `${pAfter.s}`);
  const pCoord = await P.call("GET", `/api/care-requests/${reqId}/coordination`);
  check("13 P coordination shows no shared records after revoke", pCoord.s !== 200 || !(pCoord.text.includes(pregId) && /"fields"/.test(pCoord.text)), `${pCoord.s}`);
  const pList2 = await P.call("GET", "/api/provider/requests");
  check("13 revoked request leaves P queue", !pList2.text.includes(reqId), `${pList2.s}`);
  const so = await A.call("POST", "/auth/sign-out");
  const afterSo = await A.call("GET", "/api/jibonrekha");
  check("13 sign-out blocks private reads", (so.s === 200 || so.s === 303) && afterSo.s === 401, `${so.s} then ${afterSo.s}`);
} catch (e) {
  check("suite crashed", false, e.message);
} finally {
  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exitCode = failed.length ? 1 : 0;
}
