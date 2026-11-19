import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { randomUUID } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { establishFixtureRole } from "./care-fixtures.mjs";

// In-memory SQL only; no env files, remote URLs, auth credentials or live users.
const db = new PGlite();
const ids = Object.fromEntries(["a", "b", "p", "q", "unapproved", "unconfirmed", "anonymous"].map(name => [name, randomUUID()]));
const records = {};
const purpose = "Synthetic reviewed support";
const start = new Date(Date.now() - 60000).toISOString();
const expiry = new Date(Date.now() + 3600000).toISOString();
const hidden = "PRIVATE_SOURCE_SENTINEL";
function asUser(user, operation, role = "authenticated") {
  return db.transaction(async tx => {
    await tx.exec(`set local role ${role}`);
    await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [user ?? ""]);
    return operation(tx);
  });
}
async function rpc(user, name, params = {}) {
  const entries = Object.entries(params);
  return asUser(user, async tx => (await tx.query(`select public.${name}(${entries.map(([key], i) => `${key}=>$${i + 1}`).join(",")}) as data`, entries.map(([, value]) => value))).rows[0].data);
}
function consentParams(extra = {}) {
  return { p_grantee_user_id: ids.p, p_record_type: "maternal_observation", p_record_id: records.a.observation,
    p_fields: ["provenance"], p_purpose: purpose, p_starts_at: start, p_expires_at: expiry,
    p_review_confirmed: true, p_idempotency_key: randomUUID(), ...extra };
}
function requestParams(grants = [], extra = {}) {
  return { p_recipient_user_id: ids.p, p_message: "Synthetic reviewed message", p_method: "text", p_purpose: purpose,
    p_consent_grant_ids: grants, p_review_confirmed: true, p_idempotency_key: randomUUID(), ...extra };
}
async function requestWithGrant(extra = {}) {
  const grant = await rpc(ids.a, "mvp_care_create_consent", consentParams(extra));
  const request = await rpc(ids.a, "mvp_care_create_request", requestParams([grant.id]));
  return { grant, request };
}
function actionParams(request, extra = {}) {
  return { p_id: request.id, p_expected_revision: request.revision, p_idempotency_key: randomUUID(), ...extra };
}
async function count(table) { return Number((await db.query(`select count(*) as count from prohor_care.${table}`)).rows[0].count); }

before(async () => {
  await db.exec(`create role anon nologin; create role authenticated nologin;
    create role service_role nologin bypassrls; create schema auth;
    grant usage on schema public,auth to anon,authenticated,service_role;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,is_anonymous boolean not null default false,raw_user_meta_data jsonb not null default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid; $$;`);
  const migrationDir = new URL("../../supabase/migrations/", import.meta.url);
  for (const file of (await readdir(migrationDir)).filter(name => name.endsWith(".sql")).sort()) {
    await db.exec(await readFile(new URL(file, migrationDir), "utf8"));
  }
  for (const [name, id] of Object.entries(ids)) {
    await db.query("insert into auth.users(id,email,email_confirmed_at,is_anonymous) values($1,$2,$3,$4)",
      [id, `${name}@example.invalid`, name === "unconfirmed" ? null : start, name === "anonymous"]);
    if (!["unconfirmed", "anonymous"].includes(name)) {
      await establishFixtureRole(db, id, ["p", "q", "unapproved"].includes(name) ? "provider" : "mother", name !== "unapproved");
    }
  }
  for (const name of ["a", "b"]) {
    records[name] = await asUser(ids[name], async tx => {
      const pregnancy = (await tx.query("insert into public.pregnancy_records(label) values('Synthetic pregnancy') returning id")).rows[0].id;
      const baby = (await tx.query("insert into public.baby_records(pregnancy_id,label) values($1,'Synthetic baby') returning id", [pregnancy])).rows[0].id;
      const observation = (await tx.query("insert into public.health_observations(pregnancy_id,kind,value,unit,observed_at,source_note) values($1,'note','Synthetic note',null,now(),$2) returning id", [pregnancy, hidden])).rows[0].id;
      const babyObservation = (await tx.query("insert into public.baby_observations(baby_id,kind,value,unit,observed_at) values($1,'note','Synthetic baby note',null,now()) returning id", [baby])).rows[0].id;
      const condition = (await tx.query("insert into public.maternal_conditions(label,documented_at) values('Synthetic self-report',now()) returning id")).rows[0].id;
      const symptom = (await tx.query("insert into public.maternal_symptom_notes(note,occurred_at) values('Synthetic symptom note',now()) returning id")).rows[0].id;
      const wellness = (await tx.query("insert into public.wellness_entries(occurred_at,mood) values(now(),'prefer_not_to_say') returning id")).rows[0].id;
      const diary = (await tx.query("insert into public.wellness_diary_entries(text,occurred_at) values('PRIVATE_DIARY_SENTINEL',now()) returning id")).rows[0].id;
      return { pregnancy, baby, observation, babyObservation, condition, symptom, wellness, diary };
    });
  }
});
after(async () => { await db.close(); });

test("reviewed submission creates one real simulated queue receipt and evidence-backed delivered state", async () => {
  const { grant, request } = await requestWithGrant();
  assert.equal(grant.record.type, "maternal_observation");
  assert.equal(request.status, "delivered");
  assert.equal(request.revision, 2);
  assert.equal(request.providerMode, "simulated");
  assert.equal(request.ownerUserId, ids.a);
  assert.deepEqual(request.consentGrantIds, [grant.id]);
  const events = await rpc(ids.a, "mvp_care_request_events", { p_id: request.id });
  assert.deepEqual(events.items.map(event => event.status), ["submitted", "delivered"]);
  const receipt = await db.query("select * from prohor_care.queue_receipts where request_id=$1", [request.id]);
  assert.equal(receipt.rows.length, 1);
});

test("deferred evidence validates after RPC return in the authenticated PostgREST caller context", async () => {
  const input = requestParams();
  const request = await asUser(ids.a, async tx => {
    const result = await tx.query("select public.mvp_care_create_request($1,$2,$3,$4,$5::uuid[],$6,$7) as data",
      [input.p_recipient_user_id,input.p_message,input.p_method,input.p_purpose,input.p_consent_grant_ids,input.p_review_confirmed,input.p_idempotency_key]);
    await tx.exec("set constraints all immediate");
    return result.rows[0].data;
  });
  assert.equal(request.status,"delivered");
  const trigger = (await db.query("select prosecdef,has_function_privilege('authenticated',oid,'execute') as app_execute from pg_proc where oid='prohor_care.check_request_evidence()'::regprocedure")).rows[0];
  assert.equal(trigger.prosecdef,true);
  assert.equal(trigger.app_execute,false);
});

test("assigned provider gets exact safe projections without owner, grants, source notes or diary", async () => {
  const { request } = await requestWithGrant();
  const data = await rpc(ids.p, "mvp_care_get_request", { p_id: request.id });
  assert.deepEqual(Object.keys(data).sort(), ["consentedRecords", "createdAt", "id", "message", "method", "providerMode", "revision", "status", "updatedAt"].sort());
  assert.deepEqual(Object.keys(data.consentedRecords[0].fields), ["provenance"]);
  assert.deepEqual(Object.keys(data.consentedRecords[0].fields.provenance).sort(), ["recordedAt", "source", "verification"]);
  for (const value of [ids.a, hidden, "PRIVATE_DIARY_SENTINEL", "ownerUserId", "grantIds", "sourceNote"]) assert.equal(JSON.stringify(data).includes(value), false);
});

test("provider acknowledgement requires explicit assigned action, then mother sees persisted status", async () => {
  const { request } = await requestWithGrant();
  const params = actionParams(request);
  const ack = await rpc(ids.p, "mvp_care_acknowledge", params);
  assert.equal(ack.status, "acknowledged");
  assert.equal(ack.revision, 3);
  assert.equal((await rpc(ids.a, "mvp_care_get_request", { p_id: request.id })).status, "acknowledged");
  assert.deepEqual(await rpc(ids.p, "mvp_care_acknowledge", params), ack);
  const events = await rpc(ids.a, "mvp_care_request_events", { p_id: request.id });
  assert.deepEqual(events.items.map(event => event.status), ["submitted", "delivered", "acknowledged"]);
});

test("guest, missing identity, unconfirmed and anonymous users cannot call private operations", async () => {
  for (const user of [null, ids.unconfirmed, ids.anonymous]) {
    await assert.rejects(rpc(user, "mvp_care_recipients"), { code: "42501" });
    await assert.rejects(rpc(user, "mvp_care_create_request", requestParams()), { code: "42501" });
  }
  await assert.rejects(asUser(null, tx => tx.query("select public.mvp_care_recipients()"), "anon"), { code: "42501" });
});

test("only trusted active simulated providers appear as recipients; client role promotion is denied", async () => {
  const result = await rpc(ids.a, "mvp_care_recipients");
  assert.deepEqual(result.map(row => row.id).sort(), [ids.p, ids.q].sort());
  assert(result.every(row => row.providerMode === "simulated" && Object.keys(row).length === 3));
  await assert.rejects(asUser(ids.a, tx => tx.query("update public.profiles set role='provider' where user_id=$1", [ids.a])), { code: "42501" });
  await db.query("update auth.users set raw_user_meta_data='{" + '"role":"provider"' + "}' where id=$1", [ids.a]);
  await assert.rejects(rpc(ids.a, "mvp_care_provider_requests"), { code: "42501" });
  await assert.rejects(rpc(ids.a, "mvp_care_create_request", requestParams([], { p_recipient_user_id: ids.unapproved })), { code: "42501" });
  await assert.rejects(rpc(ids.unapproved, "mvp_care_provider_requests"), { code: "42501" });
});

test("mother B and unassigned provider Q cannot read, enumerate events or acknowledge A's request", async () => {
  const { request } = await requestWithGrant();
  for (const user of [ids.b, ids.q]) {
    await assert.rejects(rpc(user, "mvp_care_get_request", { p_id: request.id }), { code: "P0002", message: "Resource unavailable" });
    await assert.rejects(rpc(user, "mvp_care_request_events", { p_id: request.id }), { code: "P0002" });
  }
  await assert.rejects(rpc(ids.q, "mvp_care_acknowledge", actionParams(request)), { code: "P0002" });
  await assert.rejects(rpc(ids.a, "mvp_care_acknowledge", actionParams(request)), { code: "42501" });
  const queue = await rpc(ids.q, "mvp_care_provider_requests");
  assert.equal(queue.items.some(row => row.id === request.id), false);
  await assert.rejects(rpc(ids.b, "mvp_care_get_request", { p_id: randomUUID() }), { code: "P0002", message: "Resource unavailable" });
});

test("consent rejects foreign parents/resources, self grants, unreviewed submissions and unsafe scopes", async () => {
  await assert.rejects(rpc(ids.a, "mvp_care_create_consent", consentParams({ p_record_id: records.b.observation })), { code: "P0002" });
  for (const patch of [{ p_grantee_user_id: ids.a }, { p_review_confirmed: false }, { p_fields: ["sourceNote"] },
    { p_fields: ["provenance", "provenance"] }, { p_fields: [null] }, { p_fields: [] }, { p_idempotency_key: null },
    { p_record_type: "diary", p_record_id: records.a.diary, p_fields: ["text"] },
    { p_record_type: "ai_conversation", p_fields: ["messages"] }, { p_record_type: "medical_document", p_fields: ["rawFile"] },
    { p_expires_at: start }, { p_expires_at: "infinity" }]) {
    await assert.rejects(rpc(ids.a, "mvp_care_create_consent", consentParams(patch)), { code: "22023" });
  }
  await assert.rejects(rpc(ids.a, "mvp_care_create_request", requestParams([], { p_review_confirmed: false })), { code: "22023" });
});

test("every allowed record type uses exactly its selected field projection", async () => {
  for (const [type, record, fields] of [
    ["pregnancy_record", records.a.pregnancy, ["label"]],
    ["maternal_condition", records.a.condition, ["label"]],
    ["maternal_observation", records.a.observation, ["measurement"]],
    ["maternal_symptom_note", records.a.symptom, ["note"]],
    ["baby_record", records.a.baby, ["birthDate"]],
    ["baby_observation", records.a.babyObservation, ["measurement"]],
    ["wellness_entry", records.a.wellness, ["energy"]],
  ]) {
    const { request } = await requestWithGrant({ p_record_type: type, p_record_id: record, p_fields: fields });
    const result = await rpc(ids.p, "mvp_care_get_request", { p_id: request.id });
    const shared = result.consentedRecords[0];
    assert.equal(shared.type, type);
    assert.equal(shared.id, record);
    assert.deepEqual(Object.keys(shared.fields), fields);
    if (fields[0] === "energy" || fields[0] === "birthDate") assert.equal(shared.fields[fields[0]], null);
  }
});

test("wrong recipient, purpose, future, expired, revoked or foreign grants cannot authorize submission", async () => {
  const valid = await rpc(ids.a, "mvp_care_create_consent", consentParams());
  for (const patch of [{ p_recipient_user_id: ids.q }, { p_purpose: "Different purpose" }, { p_consent_grant_ids: [valid.id, valid.id] }]) {
    await assert.rejects(rpc(ids.a, "mvp_care_create_request", requestParams([valid.id], patch)), { code: patch.p_consent_grant_ids ? "22023" : "P0002" });
  }
  await assert.rejects(rpc(ids.b, "mvp_care_create_request", requestParams([valid.id])), { code: "P0002" });
  const future = await rpc(ids.a, "mvp_care_create_consent", consentParams({ p_starts_at: new Date(Date.now() + 60000).toISOString() }));
  await assert.rejects(rpc(ids.a, "mvp_care_create_request", requestParams([future.id])), { code: "P0002" });
  await db.query("update prohor_care.consent_grants set expires_at=clock_timestamp()-interval '1 second' where id=$1", [valid.id]);
  await assert.rejects(rpc(ids.a, "mvp_care_create_request", requestParams([valid.id])), { code: "P0002" });
  const revoked = await rpc(ids.a, "mvp_care_create_consent", consentParams());
  await rpc(ids.a, "mvp_care_revoke_consent", { p_id: revoked.id });
  await assert.rejects(rpc(ids.a, "mvp_care_create_request", requestParams([revoked.id])), { code: "P0002" });
});

test("grant revocation is idempotent and immediately denies future provider reads, actions and queue membership", async () => {
  const { grant, request } = await requestWithGrant();
  await rpc(ids.p, "mvp_care_get_request", { p_id: request.id });
  await assert.rejects(rpc(ids.b, "mvp_care_revoke_consent", { p_id: grant.id }), { code: "P0002" });
  const first = await rpc(ids.a, "mvp_care_revoke_consent", { p_id: grant.id });
  assert.deepEqual(await rpc(ids.a, "mvp_care_revoke_consent", { p_id: grant.id }), first);
  await assert.rejects(rpc(ids.p, "mvp_care_get_request", { p_id: request.id }), { code: "P0002" });
  await assert.rejects(rpc(ids.p, "mvp_care_request_events", { p_id: request.id }), { code: "P0002" });
  await assert.rejects(rpc(ids.p, "mvp_care_acknowledge", actionParams(request)), { code: "P0002" });
  assert.equal((await rpc(ids.p, "mvp_care_provider_requests")).items.some(row => row.id === request.id), false);
  assert.equal((await rpc(ids.a, "mvp_care_get_request", { p_id: request.id })).status, "delivered");
  assert.equal(Number((await db.query("select count(*) as count from prohor_care.audit_events where resource_id=$1 and action='consent.revoked'", [grant.id])).rows[0].count), 1);
});

test("current grant expiry is enforced again on acknowledgement replay", async () => {
  const { grant, request } = await requestWithGrant();
  const params = actionParams(request);
  await rpc(ids.p, "mvp_care_acknowledge", params);
  await db.query("update prohor_care.consent_grants set expires_at=clock_timestamp()-interval '1 second' where id=$1", [grant.id]);
  await assert.rejects(rpc(ids.p, "mvp_care_acknowledge", params), { code: "P0002" });
  await assert.rejects(rpc(ids.p, "mvp_care_get_request", { p_id: request.id }), { code: "P0002" });
});

test("provider approval revocation, role removal and assignment withdrawal each deny subsequent access", async () => {
  for (const revoke of ["approval", "role", "assignment"]) {
    const { request } = await requestWithGrant();
    try {
      if (revoke === "approval") await db.query("update prohor_care.provider_approvals set revoked_at=now() where user_id=$1", [ids.p]);
      if (revoke === "role") await db.query("update public.profiles set role='mother' where user_id=$1", [ids.p]);
      if (revoke === "assignment") await db.query("update prohor_care.assignments set revoked_at=now() where request_id=$1", [request.id]);
      await assert.rejects(rpc(ids.p, "mvp_care_get_request", { p_id: request.id }), { code: revoke === "assignment" ? "P0002" : "42501" });
      await assert.rejects(rpc(ids.p, "mvp_care_acknowledge", actionParams(request)), { code: revoke === "assignment" ? "P0002" : "42501" });
    } finally {
      await db.query("update public.profiles set role='provider' where user_id=$1", [ids.p]);
      await db.query("update prohor_care.provider_approvals set revoked_at=null where user_id=$1", [ids.p]);
    }
  }
});

test("trusted account approval and revocation automatically update care eligibility", async () => {
  const { request } = await requestWithGrant();
  try {
    await db.query("select public.prohor_review_provider($1,false,'Synthetic reviewer')", [ids.p]);
    assert((await db.query("select revoked_at from prohor_care.provider_approvals where user_id=$1", [ids.p])).rows[0].revoked_at);
    assert(!(await rpc(ids.a, "mvp_care_recipients")).some(row => row.id === ids.p));
    await assert.rejects(rpc(ids.p, "mvp_care_get_request", { p_id: request.id }), { code: "42501" });
    await assert.rejects(rpc(ids.p, "mvp_care_acknowledge", actionParams(request)), { code: "42501" });
  } finally {
    await db.query("select public.prohor_review_provider($1,true,'Synthetic reviewer')", [ids.p]);
  }
  assert.equal((await db.query("select revoked_at from prohor_care.provider_approvals where user_id=$1", [ids.p])).rows[0].revoked_at, null);
  assert((await rpc(ids.a, "mvp_care_recipients")).some(row => row.id === ids.p));
});

test("stale scalar role cannot bypass a revoked membership for care or private RLS", async () => {
  try {
    await db.query("update public.account_role_memberships set status='revoked' where user_id=$1 and role='mother'", [ids.b]);
    assert.equal((await asUser(ids.b, tx => tx.query("select * from public.health_observations"))).rows.length, 0);
    await assert.rejects(rpc(ids.b, "mvp_care_create_request", requestParams()), { code: "42501" });
    await assert.rejects(asUser(ids.b, tx => tx.query("insert into public.pregnancy_records(label) values('Synthetic denied')")), { code: "42501" });
    // Regression (20261119040000): later Jibonrekha/Bujhi policies and RPCs must not fall back to the scalar profile role.
    assert.equal((await asUser(ids.b, tx => tx.query("select * from public.pregnancy_records"))).rows.length, 0);
    await assert.rejects(rpc(ids.b, "jr_save", { p_action: "pregnancy", p_data: { label: "Synthetic denied" }, p_key: randomUUID() }), { code: "42501" });
    await assert.rejects(rpc(ids.b, "bujhi_commit_reviewed_hemoglobin", { p_report_id: randomUUID(), p_pregnancy_id: records.b.pregnancy,
      p_source_sha256: "a".repeat(64), p_raw_label: "Hemoglobin", p_raw_value: "11.0", p_raw_unit: "g/dL",
      p_reviewed_value: "11.0", p_reviewed_unit: "g/dL", p_observed_on: "2026-11-18" }), { code: "42501" });
  } finally {
    await db.query("update public.account_role_memberships set status='approved' where user_id=$1 and role='mother'", [ids.b]);
  }
});

test("same retry key returns original request after a lost response, changed payload conflicts and a different actor is isolated", async () => {
  const params = requestParams();
  const before = await count("support_requests");
  const saved = await rpc(ids.a, "mvp_care_create_request", params);
  assert.deepEqual(await rpc(ids.a, "mvp_care_create_request", params), saved);
  assert.equal(await count("support_requests"), before + 1);
  for (const patch of [{ p_message: "Different message" }, { p_method: "aac" }, { p_recipient_user_id: ids.q }, { p_purpose: "Different purpose" }]) {
    await assert.rejects(rpc(ids.a, "mvp_care_create_request", { ...params, ...patch }), { code: "PT409" });
  }
  const other = await rpc(ids.b, "mvp_care_create_request", params);
  assert.notEqual(other.id, saved.id);
  assert.equal(other.ownerUserId, ids.b);
});

test("consent retries canonicalize field order but never replace a revoked original grant", async () => {
  const params = consentParams({ p_fields: ["observedAt", "provenance"] });
  const first = await rpc(ids.a, "mvp_care_create_consent", params);
  assert.deepEqual(await rpc(ids.a, "mvp_care_create_consent", { ...params, p_fields: [...params.p_fields].reverse() }), first);
  await assert.rejects(rpc(ids.a, "mvp_care_create_consent", { ...params, p_fields: ["measurement"] }), { code: "PT409" });
  await rpc(ids.a, "mvp_care_revoke_consent", { p_id: first.id });
  const again = await rpc(ids.a, "mvp_care_create_consent", params);
  assert.equal(again.id, first.id);
  assert.notEqual(again.revokedAt, null);
  assert.equal(again.revision, 2);
});

test("owner reconciliation after grant revocation returns existing state without resubmitting", async () => {
  const grant = await rpc(ids.a, "mvp_care_create_consent", consentParams());
  const params = requestParams([grant.id]);
  const first = await rpc(ids.a, "mvp_care_create_request", params);
  await rpc(ids.a, "mvp_care_revoke_consent", { p_id: grant.id });
  const before = await count("queue_receipts");
  assert.deepEqual(await rpc(ids.a, "mvp_care_create_request", params), first);
  assert.equal(await count("queue_receipts"), before);
  await assert.rejects(rpc(ids.p, "mvp_care_get_request", { p_id: first.id }), { code: "P0002" });
});

test("driver double-click transactions deduplicate request, queue, events and audit", async () => {
  const params = requestParams();
  const results = await Promise.all([rpc(ids.a, "mvp_care_create_request", params), rpc(ids.a, "mvp_care_create_request", params)]);
  assert.equal(results[0].id, results[1].id);
  assert.equal(Number((await db.query("select count(*) as count from prohor_care.request_events where request_id=$1", [results[0].id])).rows[0].count), 2);
  assert.equal(Number((await db.query("select count(*) as count from prohor_care.audit_events where resource_id=$1 and action='request.delivered'", [results[0].id])).rows[0].count), 1);
});

test("stale revisions, skipped response transitions and duplicate fresh-key acknowledgement add no event", async () => {
  const { request } = await requestWithGrant();
  await assert.rejects(rpc(ids.p, "mvp_care_acknowledge", actionParams(request, { p_expected_revision: 1 })), { code: "PT409" });
  await assert.rejects(rpc(ids.p, "mvp_care_respond", { ...actionParams(request), p_message: "Synthetic response" }), { code: "PT409" });
  await rpc(ids.p, "mvp_care_acknowledge", actionParams(request));
  await assert.rejects(rpc(ids.p, "mvp_care_acknowledge", actionParams(request)), { code: "PT409" });
  const events = await rpc(ids.a, "mvp_care_request_events", { p_id: request.id });
  assert.equal(events.items.length, 3);
});

test("provider response needs a stored assignment-bound message and retries cannot alter it", async () => {
  const { request } = await requestWithGrant();
  const ack = await rpc(ids.p, "mvp_care_acknowledge", actionParams(request));
  const params = { ...actionParams(ack), p_message: "Synthetic explicit provider response" };
  const result = await rpc(ids.p, "mvp_care_respond", params);
  assert.equal(result.status, "responded");
  assert.deepEqual(await rpc(ids.p, "mvp_care_respond", params), result);
  await assert.rejects(rpc(ids.p, "mvp_care_respond", { ...params, p_message: "Changed response" }), { code: "PT409" });
  const messages = await db.query("select sender_user_id,message from prohor_care.response_messages where request_id=$1", [request.id]);
  assert.deepEqual(messages.rows, [{ sender_user_id: ids.p, message: params.p_message }]);
  assert.equal((await rpc(ids.a, "mvp_care_get_request", { p_id: request.id })).status, "responded");
});

test("owner closure withdraws message-only access and is idempotent without implying medical resolution", async () => {
  const params = requestParams();
  const request = await rpc(ids.a, "mvp_care_create_request", params);
  assert.deepEqual((await rpc(ids.p, "mvp_care_get_request", { p_id: request.id })).consentedRecords, []);
  const closeParams = actionParams(request);
  const closed = await rpc(ids.a, "mvp_care_close", closeParams);
  assert.equal(closed.status, "closed");
  assert.deepEqual(await rpc(ids.a, "mvp_care_close", closeParams), closed);
  assert.deepEqual(await rpc(ids.a, "mvp_care_create_request", params), closed);
  await assert.rejects(rpc(ids.p, "mvp_care_get_request", { p_id: request.id }), { code: "P0002" });
  await assert.rejects(rpc(ids.p, "mvp_care_acknowledge", actionParams(request)), { code: "P0002" });
});

test("provider closure returns no shared records and subsequent provider access stays withdrawn", async () => {
  const { request } = await requestWithGrant();
  const closed = await rpc(ids.p, "mvp_care_close", actionParams(request));
  assert.equal(closed.status, "closed");
  assert.deepEqual(closed.consentedRecords, []);
  await assert.rejects(rpc(ids.p, "mvp_care_get_request", { p_id: request.id }), { code: "P0002" });
  assert.equal((await rpc(ids.a, "mvp_care_get_request", { p_id: request.id })).status, "closed");
});

test("queue and event pagination expose only allowed summaries and validate cursor positions", async () => {
  const { request } = await requestWithGrant();
  const first = await rpc(ids.p, "mvp_care_provider_requests", { p_limit: 1 });
  assert.equal(first.items.length, 1);
  assert.equal("consentedRecords" in first.items[0], false);
  assert.equal("ownerUserId" in first.items[0], false);
  const cursor = JSON.parse(first.nextCursor);
  const next = await rpc(ids.p, "mvp_care_provider_requests", { p_limit: 1, p_after_created_at: cursor.createdAt, p_after_id: cursor.id });
  assert.notEqual(next.items[0].id, first.items[0].id);
  const events = await rpc(ids.a, "mvp_care_request_events", { p_id: request.id, p_limit: 1 });
  assert.equal(events.nextCursor, "1");
  assert.equal("actorUserId" in events.items[0], false);
  assert.equal("receiptId" in events.items[0], false);
  const page2 = await rpc(ids.a, "mvp_care_request_events", { p_id: request.id, p_after_revision: 1 });
  assert.deepEqual(page2.items.map(row => row.status), ["delivered"]);
  for (const patch of [{ p_limit: 0 }, { p_limit: 51 }, { p_after_id: randomUUID() }]) {
    await assert.rejects(rpc(ids.p, "mvp_care_provider_requests", patch), { code: "22023" });
  }
});

test("all internal tables force RLS and deny direct reads/writes and helper calls, even for service_role", async () => {
  const tables = (await db.query("select c.relname,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='prohor_care' and c.relkind='r'")).rows;
  assert.deepEqual(tables.map(table => table.relname).sort(), ["provider_approvals", "consent_grants", "support_requests", "request_grants", "assignments", "queue_receipts", "response_messages", "request_events", "mutation_receipts", "audit_events", "request_permissions", "follow_up_messages"].sort());
  assert(tables.every(table => table.relrowsecurity && table.relforcerowsecurity));
  for (const role of ["anon", "authenticated", "service_role"]) {
    for (const table of tables) {
      await assert.rejects(asUser(ids.p, tx => tx.exec(`select * from prohor_care.${table.relname}`), role), { code: "42501" });
    }
    await assert.rejects(asUser(ids.a, tx => tx.query("select prohor_care.actor()"), role), { code: "42501" });
  }
  const functions = (await db.query("select p.proname,p.prosecdef,p.proconfig,has_function_privilege('anon',p.oid,'EXECUTE') as anonymous,has_function_privilege('service_role',p.oid,'EXECUTE') as service,has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'mvp_care_%'")).rows;
  assert.equal(functions.length, 16);
  assert(functions.every(fn => fn.prosecdef && fn.proconfig.some(value => value === 'search_path=""')));
  assert(functions.every(fn => !fn.anonymous && !fn.service && fn.authenticated));
  const helpers = (await db.query("select has_function_privilege('authenticated',p.oid,'EXECUTE') as allowed from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='prohor_care'")).rows;
  assert(helpers.every(fn => !fn.allowed));
});

test("database evidence constraints reject unsupported status, wrong-owner links and forged receipts", async () => {
  const { grant, request } = await requestWithGrant();
  const { request: foreign } = await requestWithGrant();
  await assert.rejects(db.transaction(tx => tx.query("update prohor_care.support_requests set status='acknowledged',revision=revision+1 where id=$1", [request.id])), { code: "23514" });
  const receipt = (await db.query("select id from prohor_care.queue_receipts where request_id=$1", [foreign.id])).rows[0].id;
  await assert.rejects(db.query("insert into prohor_care.request_events(request_id,actor_user_id,status,request_revision,receipt_id) values($1,$2,'delivered',99,$3)", [request.id, ids.a, receipt]), { code: "23503" });
  await assert.rejects(db.query("insert into prohor_care.request_grants(request_id,grant_id,owner_user_id,recipient_user_id,purpose) values($1,$2,$3,$4,$5)", [foreign.id, grant.id, ids.b, ids.p, purpose]), { code: "23503" });
  await assert.rejects(db.query("insert into prohor_care.request_events(request_id,actor_user_id,status,request_revision) values($1,$2,'closed',99)", [request.id, ids.a]), { code: "23514" });
});

test("failed queue or audit writes roll back the entire submission and retry receipt", async () => {
  for (const table of ["queue_receipts", "audit_events"]) {
    const params = requestParams();
    const before = await count("support_requests");
    await db.exec(`create function prohor_care.test_failure() returns trigger language plpgsql as $$ begin raise exception 'Synthetic outage'; end; $$;
      create trigger test_failure before insert on prohor_care.${table} for each row execute function prohor_care.test_failure();`);
    try {
      await assert.rejects(rpc(ids.a, "mvp_care_create_request", params), { code: "P0001", message: "Care service unavailable" });
      assert.equal(await count("support_requests"), before);
      assert.equal(Number((await db.query("select count(*) as count from prohor_care.mutation_receipts where idempotency_key=$1", [params.p_idempotency_key])).rows[0].count), 0);
    } finally {
      await db.exec(`drop trigger test_failure on prohor_care.${table}; drop function prohor_care.test_failure();`);
    }
    assert.equal((await rpc(ids.a, "mvp_care_create_request", params)).status, "delivered");
  }
});

test("audit failure prevents a sensitive read and an acknowledgement from returning success", async () => {
  const { request } = await requestWithGrant();
  await db.exec("create function prohor_care.test_failure() returns trigger language plpgsql as $$ begin raise exception 'Synthetic outage'; end; $$; create trigger test_failure before insert on prohor_care.audit_events for each row execute function prohor_care.test_failure();");
  try {
    await assert.rejects(rpc(ids.p, "mvp_care_get_request", { p_id: request.id }), { code: "P0001", message: "Care service unavailable" });
    await assert.rejects(rpc(ids.p, "mvp_care_acknowledge", actionParams(request)), { code: "P0001" });
    assert.equal((await db.query("select status from prohor_care.support_requests where id=$1", [request.id])).rows[0].status, "delivered");
  } finally { await db.exec("drop trigger test_failure on prohor_care.audit_events; drop function prohor_care.test_failure();"); }
});

test("read-only activation inspector reports the exact RLS tables and narrow RPC privileges", async () => {
  const results = await db.exec(await readFile(new URL("../../supabase/inspection/care_backend_readonly.sql", import.meta.url), "utf8"));
  assert.equal(results[0].rows.length, 18);
  assert(results[0].rows.every(row => row.present && row.rls && row.forced_rls && !row.anon_select));
  assert(results[0].rows.filter(row => row.schema_name === "prohor_care").every(row => !row.authenticated_select));
  assert.equal(results[1].rows.length, 10);
  assert(results[1].rows.every(row => row.security_definer && row.owner === "postgres" && !row.anonymous_execute && row.authenticated_execute));
});

test("audit and receipt storage contain only bounded pointers/state, never copied clinical/message/diary payloads", async () => {
  const columns = (await db.query("select column_name from information_schema.columns where table_schema='prohor_care' and table_name in ('audit_events','mutation_receipts')")).rows.map(row => row.column_name);
  for (const field of ["message", "payload", "response", "diary", "source_note", "fields", "record_snapshot"]) assert.equal(columns.includes(field), false);
  const dump = JSON.stringify((await db.query("select row_to_json(a) as row from prohor_care.audit_events a")).rows);
  assert.equal(dump.includes(hidden), false);
  assert.equal(dump.includes("Synthetic reviewed message"), false);
  assert.equal(dump.includes("PRIVATE_DIARY_SENTINEL"), false);
  const counts = (await db.query(await readFile(new URL("../../supabase/inspection/auth_provisioning_counts.sql", import.meta.url), "utf8"))).rows[0];
  assert.equal(Number(counts.missing_profiles), 0);
  assert.equal(Number(counts.missing_preferences), 0);
  assert(Object.values(counts).every(value => /^\d+$/.test(String(value))));
});
