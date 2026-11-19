import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { randomUUID } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { establishFixtureRole } from "./care-fixtures.mjs";

const db = new PGlite();
const users = Object.fromEntries(["mother", "other", "provider", "foreignProvider", "pendingProvider"].map(key => [key, randomUUID()]));
let recordId;
let historicalRequest;
async function asUser(userId, action, role = "authenticated") {
  return db.transaction(async tx => {
    await tx.exec(`set local role ${role}`);
    await tx.query("select set_config('request.jwt.claim.sub',$1,true)", [userId]);
    return action(tx);
  });
}
async function rpc(who, name, values = {}) {
  const entries = Object.entries(values);
  return asUser(users[who], async tx => (await tx.query(
    `select public.${name}(${entries.map(([key], index) => `${key}=>$${index + 1}`).join(",")}) as data`,
    entries.map(([, value]) => value),
  )).rows[0].data);
}
function payload(options = {}) {
  return { recipientUserId: users.provider, purpose: "Synthetic routine visit", message: "Synthetic request", method: "text",
    consentGrantIds: [], reviewConfirmed: true, coordination: {
      termsVersion: "bondhon-demo-2026-11-19", expiresAt: new Date(Date.now() + 3600000).toISOString(),
      language: "bn", allowReplies: true, accommodations: ["written"], records: [], ...options,
    } };
}
async function create(input = payload(), key = randomUUID()) {
  return rpc("mother", "mvp_care_create_coordinated_request", { p_payload: input, p_idempotency_key: key });
}
async function detail(who, request) { return rpc(who, "mvp_care_coordination_detail", { p_id: request.id }); }
async function follow(who, request, message, key = randomUUID()) {
  return rpc(who, "mvp_care_follow_up", { p_id: request.id, p_expected_revision: request.revision, p_message: message, p_idempotency_key: key });
}
before(async () => {
  await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth; grant usage on schema public,auth to anon,authenticated,service_role;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,is_anonymous boolean not null default false,raw_user_meta_data jsonb not null default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid; $$;`);
  const directory = new URL("../../supabase/migrations/", import.meta.url);
  for (const file of (await readdir(directory)).filter(name => name.endsWith(".sql") && name < "20261119060000").sort())
    await db.exec(await readFile(new URL(file, directory), "utf8"));
  for (const [key, id] of Object.entries(users)) {
    await db.query("insert into auth.users(id,email,email_confirmed_at) values($1,$2,now())", [id, `${key}@example.invalid`]);
    await establishFixtureRole(db, id, key.toLowerCase().includes("provider") ? "provider" : "mother", key !== "pendingProvider");
  }
  recordId = await asUser(users.mother, async tx => (await tx.query("insert into public.pregnancy_records(label) values('Synthetic label') returning id")).rows[0].id);
  historicalRequest = await rpc("mother", "mvp_care_create_request", {
    p_recipient_user_id: users.provider, p_message: "Synthetic historical request", p_method: "text",
    p_purpose: "Historical compatibility", p_consent_grant_ids: [], p_review_confirmed: true, p_idempotency_key: randomUUID(),
  });
  for (const file of (await readdir(directory)).filter(name => name.endsWith(".sql") && name >= "20261119060000").sort())
    await db.exec(await readFile(new URL(file, directory), "utf8"));
});
after(async () => { await db.close(); });

test("permission-free creation is denied to every application role while historical reads and closure survive", async () => {
  const signature = "public.mvp_care_create_request(uuid,text,text,text,uuid[],boolean,uuid)";
  for (const role of ["anon", "authenticated", "service_role"])
    assert.equal((await db.query("select has_function_privilege($1,$2,'execute') as allowed", [role, signature])).rows[0].allowed, false);
  await assert.rejects(() => rpc("mother", "mvp_care_create_request", {
    p_recipient_user_id: users.provider, p_message: "Denied", p_method: "text", p_purpose: "Denied",
    p_consent_grant_ids: [], p_review_confirmed: true, p_idempotency_key: randomUUID(),
  }), { code: "42501" });
  assert.equal((await detail("mother", historicalRequest)).request.coordination, undefined);
  assert.equal((await detail("provider", historicalRequest)).request.id, historicalRequest.id);
  await rpc("mother", "mvp_care_close", { p_id: historicalRequest.id,
    p_expected_revision: historicalRequest.revision, p_idempotency_key: randomUUID() });
  await assert.rejects(() => detail("provider", historicalRequest));
});

test("pending and revoked providers cannot read, acknowledge, message or receive new requests", async () => {
  const request = await create();
  await assert.rejects(() => create({ ...payload(), recipientUserId: users.pendingProvider }));
  await db.query("select public.prohor_review_provider($1,false,'Synthetic administrator')", [users.provider]);
  try {
    for (const who of ["provider", "pendingProvider"]) {
      await assert.rejects(() => detail(who, request));
      await assert.rejects(() => rpc(who, "mvp_care_provider_requests"));
      await assert.rejects(() => follow(who, request, "Denied"));
      await assert.rejects(() => rpc(who, "mvp_care_acknowledge", { p_id: request.id,
        p_expected_revision: request.revision, p_idempotency_key: randomUUID() }));
      await assert.rejects(() => rpc(who, "mvp_care_respond", { p_id: request.id,
        p_expected_revision: request.revision, p_idempotency_key: randomUUID(), p_message: "Denied" }));
      await assert.rejects(() => rpc(who, "mvp_care_close", { p_id: request.id,
        p_expected_revision: request.revision, p_idempotency_key: randomUUID() }));
    }
    await assert.rejects(() => create());
  } finally {
    await db.query("select public.prohor_review_provider($1,true,'Synthetic administrator')", [users.provider]);
  }
});

test("second mother and unassigned provider cannot access or mutate a coordinated request", async () => {
  const request = await create();
  for (const who of ["other", "foreignProvider"]) {
    await assert.rejects(() => detail(who, request));
    for (const operation of ["mvp_care_get_request", "mvp_care_request_events"])
      await assert.rejects(() => rpc(who, operation, { p_id: request.id }));
    for (const operation of ["mvp_care_acknowledge", "mvp_care_close", "mvp_care_respond"])
      await assert.rejects(() => rpc(who, operation, { p_id: request.id, p_expected_revision: request.revision,
        p_idempotency_key: randomUUID(), ...(operation === "mvp_care_respond" ? { p_message: "Denied" } : {}) }));
    await assert.rejects(() => follow(who, request, "Denied"));
  }
  assert.equal((await detail("mother", request)).request.revision, request.revision);
});

test("request, record grants and receipt are atomic and match explicit selected fields", async () => {
  const request = await create(payload({ records: [{ type: "pregnancy_record", id: recordId, fields: ["label"] }] }));
  assert.equal(request.coordination.language, "bn");
  assert.equal(request.coordination.version, 1);
  assert.equal(request.consentGrantIds.length, 1);
  const provider = await detail("provider", request);
  assert.deepEqual(provider.request.consentedRecords[0].fields, { label: "Synthetic label" });
  assert.deepEqual(provider.grants, []);
  assert.deepEqual(provider.audit, []);
  assert.equal("ownerUserId" in provider.request, false);
  const owner = await detail("mother", request);
  assert.deepEqual(owner.grants[0].record.fields, ["label"]);
  assert.ok(owner.audit.some(item => item.actor === "provider" && item.policyVersion === 1));
});
test("retries return the same request and reject changed purposes, scope, permissions or expiry", async () => {
  const input = payload(); const key = randomUUID(); const first = await create(input, key);
  assert.equal((await create(input, key)).id, first.id);
  for (const modified of [{ ...input, message: "Changed" }, { ...input, coordination: { ...input.coordination, allowReplies: false } },
    { ...input, coordination: { ...input.coordination, accommodations: [] } }])
    await assert.rejects(() => create(modified, key));
});
test("a failed grant rolls back every part of the request", async () => {
  const before = (await db.query("select count(*) as n from prohor_care.consent_grants")).rows[0].n;
  await assert.rejects(() => create(payload({ records: [
    { type: "pregnancy_record", id: recordId, fields: ["label"] },
    { type: "pregnancy_record", id: randomUUID(), fields: ["label"] },
  ] })));
  assert.equal((await db.query("select count(*) as n from prohor_care.consent_grants")).rows[0].n, before);
});
test("message-only request revocation removes provider reads, queue visibility and messages", async () => {
  const request = await create();
  await detail("provider", request);
  const revoked = await rpc("mother", "mvp_care_revoke_request", { p_id: request.id });
  assert.equal(revoked.request.status, "delivered");
  assert.ok(revoked.request.coordination.revokedAt);
  assert.equal((await rpc("mother", "mvp_care_revoke_request", { p_id: request.id })).request.coordination.revokedAt, revoked.request.coordination.revokedAt);
  await assert.rejects(() => detail("provider", request));
  await assert.rejects(() => follow("mother", request, "After revocation"));
  assert.equal((await rpc("provider", "mvp_care_provider_requests")).items.some(item => item.id === request.id), false);
  assert.ok((await detail("mother", request)).audit.some(item => item.action === "request.permission_revoked"));
});
test("expired request permission blocks existing provider sessions and canonical response endpoint", async () => {
  const request = await create();
  const acknowledged = await rpc("provider", "mvp_care_acknowledge", { p_id: request.id, p_expected_revision: request.revision, p_idempotency_key: randomUUID() });
  await db.query("update prohor_care.request_permissions set expires_at=now()-interval '1 second' where request_id=$1", [request.id]);
  await assert.rejects(() => detail("provider", request));
  await assert.rejects(() => rpc("provider", "mvp_care_respond", { p_id: request.id, p_expected_revision: acknowledged.revision, p_message: "Synthetic reply", p_idempotency_key: randomUUID() }));
  assert.equal((await detail("mother", request)).request.id, request.id);
});
test("view-only permission blocks original response and new follow-up endpoint", async () => {
  const request = await create(payload({ allowReplies: false }));
  const ack = await rpc("provider", "mvp_care_acknowledge", { p_id: request.id, p_expected_revision: request.revision, p_idempotency_key: randomUUID() });
  await assert.rejects(() => rpc("provider", "mvp_care_respond", { p_id: request.id, p_expected_revision: ack.revision, p_message: "Denied", p_idempotency_key: randomUUID() }));
  await assert.rejects(() => follow("mother", request, "Denied"));
  assert.equal((await detail("mother", request)).messages.length, 0);
});
test("follow-up is scoped, idempotent and visible only to the named participants", async () => {
  const request = await create(); const key = randomUUID();
  await follow("mother", request, "Synthetic follow-up", key);
  const replay = await follow("mother", request, "Synthetic follow-up", key);
  assert.equal(replay.messages.length, 1);
  await assert.rejects(() => follow("mother", request, "Changed retry", key));
  await assert.rejects(() => detail("other", request));
  await assert.rejects(() => detail("foreignProvider", request));
  await assert.rejects(() => follow("foreignProvider", request, "Denied"));
  await assert.rejects(() => follow("provider", request, "Acknowledge first"));
  const ack = await rpc("provider", "mvp_care_acknowledge", { p_id: request.id, p_expected_revision: request.revision, p_idempotency_key: randomUUID() });
  const response = await rpc("provider", "mvp_care_respond", { p_id: request.id, p_expected_revision: ack.revision, p_message: "Synthetic provider response", p_idempotency_key: randomUUID() });
  const next = await follow("mother", response, "Synthetic next question");
  assert.deepEqual(next.messages.map(item => item.sender), ["mother", "provider", "mother"]);
});
test("owner pagination and share candidates do not expose another owner or private diary", async () => {
  const input = await create();
  const page = await rpc("mother", "mvp_care_owner_requests", { p_limit: 1 });
  assert.equal(page.items.length, 1);
  assert.ok(page.nextCursor);
  const cursor = JSON.parse(page.nextCursor);
  const next = await rpc("mother", "mvp_care_owner_requests", { p_limit: 1, p_after_created_at: cursor.createdAt, p_after_id: cursor.id });
  assert.notEqual(next.items[0].id, page.items[0].id);
  assert.equal((await rpc("other", "mvp_care_owner_requests")).items.some(item => item.id === input.id), false);
  const own = await rpc("mother", "mvp_care_shareable_records");
  assert.ok(own.some(item => item.record.id === recordId));
  assert.equal(JSON.stringify(own).includes("diary"), false);
  assert.deepEqual(await rpc("other", "mvp_care_shareable_records"), []);
});
test("revoking a selected record grant also denies coordinated request access", async () => {
  const request = await create(payload({ records: [{ type: "pregnancy_record", id: recordId, fields: ["label"] }] }));
  await rpc("mother", "mvp_care_revoke_consent", { p_id: request.consentGrantIds[0] });
  await assert.rejects(() => detail("provider", request));
});
test("unknown, expired, overlong, foreign and diary scopes cannot create a request", async () => {
  for (const patch of [ { expiresAt: new Date(Date.now()-10000).toISOString() },
    { expiresAt: new Date(Date.now()+31*86400000).toISOString() },
    { records: [{ type: "wellness_diary_entry", id: recordId, fields: ["text"] }] },
    { records: [{ type: "pregnancy_record", id: recordId, fields: ["notAField"] }] },
    { records: [{ type: "pregnancy_record", id: recordId, fields: ["label"] }, { type: "pregnancy_record", id: recordId, fields: ["label"] }] } ])
    await assert.rejects(() => create(payload(patch)));
});
test("direct tables and privileged internal helpers remain unavailable to clients", async () => {
  for (const sql of ["select * from prohor_care.request_permissions", "select * from prohor_care.follow_up_messages",
    "select prohor_care.permission_dto(gen_random_uuid())"]) await assert.rejects(() => asUser(users.mother, tx => tx.exec(sql)));
  const inspection = await db.exec(await readFile(new URL("../../supabase/inspection/bondhon_readonly.sql", import.meta.url), "utf8"));
  assert.equal(inspection.length, 6);
  assert.equal(inspection[3].rows.length, 6);
  assert.ok(inspection[3].rows.every(row => row.relrowsecurity && row.relforcerowsecurity && !row.direct_access));
  assert.equal(inspection[4].rows.length, 21);
  assert.ok(inspection[4].rows.every(row => row.exists && row.can_execute ===
    (row.role_name === "authenticated" && !row.signature.startsWith("public.mvp_care_create_request("))));
  assert.ok(inspection[5].rows.every(row => !row.can_execute));
});


test("latest Bujhi reviewed hemoglobin can be shared with its exact selected provenance and value", async () => {
  const observation = await rpc("mother", "bujhi_commit_reviewed_hemoglobin", {
    p_report_id: randomUUID(), p_pregnancy_id: recordId, p_source_sha256: "a".repeat(64),
    p_raw_label: "Hemoglobin", p_raw_value: "11.4", p_raw_unit: "g/dL",
    p_reviewed_value: "11.4", p_reviewed_unit: "g/dL", p_observed_on: "2025-01-14",
  });
  const request = await create(payload({ records: [{ type: "maternal_observation", id: observation, fields: ["measurement", "provenance"] }] }));
  const shown = (await detail("provider", request)).request.consentedRecords[0].fields;
  assert.deepEqual(shown.measurement, { kind: "hemoglobin", value: "11.4", unit: "g/dL" });
  assert.equal(shown.provenance.source, "document_extracted");
  assert.equal(shown.provenance.verification, "user_verified");
  assert.equal("sourceNote" in shown.provenance, false);
  assert.equal("documentId" in shown.provenance, false);
  const candidates = await rpc("mother", "mvp_care_shareable_records");
  assert.ok(candidates.some(item => item.record.id === observation));
});

function shonketParams(extra = {}) {
  return { p_message: "Synthetic concern for test", p_method: "text", p_concern_types: ["fever", "other"],
    p_onset: "today", p_idempotency_key: randomUUID(), ...extra };
}
test("Shonket request retry, owner/provider isolation, open evidence, revision acknowledgement and private projection", async () => {
  const input = shonketParams();
  const request = await rpc("mother", "mvp_shonket_submit_request", input);
  assert.equal(request.status, "submitted");
  assert.equal(request.revision, 1);
  const assignment = await db.query("select recipient_user_id from prohor_care.assignments where request_id=$1", [request.id]);
  const assignedProvider = assignment.rows[0].recipient_user_id === users.provider ? "provider" : "foreignProvider";
  const unassignedProvider = assignedProvider === "provider" ? "foreignProvider" : "provider";
  assert.deepEqual(request.concernTypes, input.p_concern_types);
  assert.equal(request.onset, "today");
  assert.deepEqual(request.events.map(event => event.status), ["submitted"]);
  assert.equal((await rpc("mother", "mvp_shonket_submit_request", input)).id, request.id);
  assert.equal(Number((await db.query("select count(*) as n from prohor_care.support_requests where workflow='shonket'")).rows[0].n), 1);
  await assert.rejects(() => rpc("provider", "mvp_shonket_submit_request", shonketParams()));
  await assert.rejects(() => asUser(null, tx => tx.query(
    "select public.mvp_shonket_submit_request($1,$2,$3::text[],$4,$5)",
    ["Synthetic", "text", [], null, randomUUID()]), "anon"), { code: "42501" });

  await assert.rejects(() => asUser(users.mother, tx => tx.query(
    "insert into prohor_care.support_requests(owner_user_id,recipient_user_id,message,method,purpose) values($1,$2,'Direct insert','text','No')",
    [users.mother, users.provider])), { code: "42501" });
  await assert.rejects(() => asUser(users.mother, tx => tx.query(
    "update prohor_care.support_requests set status='acknowledged' where id=$1", [request.id])), { code: "42501" });

  assert.deepEqual(await rpc("other", "mvp_shonket_my_requests", { p_limit: 50 }), []);
  await assert.rejects(() => rpc("mother", "mvp_shonket_open_request", { p_id: request.id }));
  assert.deepEqual(await rpc(unassignedProvider, "mvp_shonket_provider_requests", { p_limit: 50 }), []);
  await assert.rejects(() => rpc(unassignedProvider, "mvp_shonket_open_request", { p_id: request.id }));
  await assert.rejects(() => rpc(assignedProvider, "mvp_care_get_request", { p_id: request.id }));
  assert.equal((await rpc(assignedProvider, "mvp_care_provider_requests")).items.some(item => item.id === request.id), false);
  assert.equal((await rpc(assignedProvider, "mvp_shonket_provider_requests", { p_limit: 50 })).some(item => item.id === request.id), true);
  await assert.rejects(() => rpc(assignedProvider, "mvp_care_acknowledge", {
    p_id: request.id, p_expected_revision: 1, p_idempotency_key: randomUUID(),
  }));

  const opened = await rpc(assignedProvider, "mvp_shonket_open_request", { p_id: request.id });
  assert.equal(opened.status, "delivered");
  assert.equal(opened.revision, 2);
  const deliveredEvent = await db.query("select actor_user_id,receipt_id from prohor_care.request_events where request_id=$1 and status='delivered'", [request.id]);
  assert.equal(deliveredEvent.rows[0].actor_user_id, assignment.rows[0].recipient_user_id);
  assert.ok(deliveredEvent.rows[0].receipt_id);
  await assert.rejects(() => rpc(assignedProvider, "mvp_care_acknowledge", {
    p_id: request.id, p_expected_revision: 1, p_idempotency_key: randomUUID(),
  }));
  const ackKey = randomUUID();
  const acknowledged = await rpc(assignedProvider, "mvp_care_acknowledge", {
    p_id: request.id, p_expected_revision: opened.revision, p_idempotency_key: ackKey,
  });
  assert.equal(acknowledged.status, "acknowledged");
  await assert.rejects(() => rpc(assignedProvider, "mvp_care_respond", {
    p_id: request.id, p_expected_revision: acknowledged.revision, p_idempotency_key: randomUUID(), p_message: "Out of phase",
  }));
  await assert.rejects(() => rpc("mother", "mvp_care_close", {
    p_id: request.id, p_expected_revision: acknowledged.revision, p_idempotency_key: randomUUID(),
  }));
  await assert.rejects(() => rpc(assignedProvider, "mvp_care_acknowledge", {
    p_id: request.id, p_expected_revision: opened.revision, p_idempotency_key: randomUUID(),
  }));
  assert.deepEqual(await rpc(assignedProvider, "mvp_care_acknowledge", {
    p_id: request.id, p_expected_revision: opened.revision, p_idempotency_key: ackKey,
  }), acknowledged);

  const mine = await rpc("mother", "mvp_shonket_my_requests", { p_limit: 50 });
  assert.equal(mine[0].status, "acknowledged");
  assert.deepEqual(mine[0].events.map(event => event.status), ["submitted", "delivered", "acknowledged"]);
  const providerProjection = await rpc(assignedProvider, "mvp_shonket_open_request", { p_id: request.id });
  assert.deepEqual(Object.keys(providerProjection).sort(), ["id", "createdAt", "updatedAt", "revision", "status", "message", "method", "concernTypes", "onset", "events"].sort());
  for (const secret of [users.mother, "diary", "chat", "healthRecords", "consentedRecords"])
    assert.equal(JSON.stringify(providerProjection).includes(secret), false);
});

test("Shonket rejects unknown categories and blank messages and denies anonymous submission", async () => {
  await assert.rejects(() => rpc("mother", "mvp_shonket_submit_request", shonketParams({ p_concern_types: ["invented"] })));
  await assert.rejects(() => rpc("mother", "mvp_shonket_submit_request", shonketParams({ p_message: "  " })));
  await assert.rejects(() => asUser(null, tx => tx.query(
    "select public.mvp_shonket_submit_request($1,$2,$3::text[],$4,$5)",
    ["Synthetic", "text", [], null, randomUUID()])), { code: "42501" });
});
