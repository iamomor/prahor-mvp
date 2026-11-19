import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
const source = stripTypeScriptTypes(readFileSync(new URL("../../src/features/bondhon/bondhon-status.ts", import.meta.url), "utf8"));
const { canMove, buildTracker, currentStatus, visibleFields } = await import("data:text/javascript," + encodeURIComponent(source));
const at = "2026-11-19T10:00:00Z";
test("all allowed lifecycle transitions match the existing five-status contract", () => {
  const allowed = ["submitted/delivered", "submitted/closed", "delivered/acknowledged", "delivered/closed", "acknowledged/responded", "acknowledged/closed", "responded/closed"];
  const statuses = ["submitted", "delivered", "acknowledged", "responded", "closed"];
  for (const from of statuses) for (const to of statuses) assert.equal(canMove(from, to), allowed.includes(`${from}/${to}`));
});
test("empty, timeout and invalid timestamp histories never fabricate submission", () => {
  assert.equal(currentStatus([]), null);
  assert.equal(currentStatus([{ type: "submitted", at: "14:32" }]), null);
  assert.equal(buildTracker([]).filter(stage => stage.reached).length, 0);
});
test("closing early does not imply delivery, acknowledgement or a response", () => {
  const stages = buildTracker([{ type: "submitted", at }, { type: "closed", at: "2026-11-19T10:01:00Z" }]);
  assert.deepEqual(stages.filter(stage => stage.reached).map(stage => stage.status), ["submitted", "closed"]);
});
test("out-of-order events retain first recorded timestamp without duplicating stages", () => {
  const events = [{ type: "delivered", at: "2026-11-19T10:02:00Z" }, { type: "submitted", at }, { type: "delivered", at: "2026-11-19T10:01:00Z" }];
  assert.equal(currentStatus(events), "delivered");
  assert.equal(buildTracker(events)[1].at, "2026-11-19T10:01:00Z");
});
const scope = { type: "maternal_observation", id: "record-a", granteeUserId: "provider-a" };
const grant = { granteeUserId: "provider-a", record: { type: scope.type, id: scope.id, fields: ["measurement"] }, startsAt: at, expiresAt: "2026-11-20T10:00:00Z" };
const now = new Date("2026-11-19T12:00:00Z");
test("field display is scoped to the exact recipient and record", () => {
  const other = { ...grant, record: { ...grant.record, id: "record-b", fields: ["note"] } };
  assert.deepEqual(visibleFields([grant, other], now, scope, true), ["measurement"]);
  assert.deepEqual(visibleFields([grant], now, { ...scope, granteeUserId: "provider-b" }, true), []);
  assert.deepEqual(visibleFields([grant], now, { ...scope, type: "baby_observation" }, true), []);
});
test("revoked, expired, future, invalid and withdrawn request permissions display no fields", () => {
  assert.deepEqual(visibleFields([grant], now, scope, false), []);
  assert.deepEqual(visibleFields([{ ...grant, revokedAt: at }], now, scope, true), []);
  assert.deepEqual(visibleFields([grant], new Date(grant.expiresAt), scope, true), []);
  assert.deepEqual(visibleFields([grant], new Date("2026-11-19T09:59:59Z"), scope, true), []);
  assert.deepEqual(visibleFields([grant], new Date("invalid"), scope, true), []);
  assert.deepEqual(visibleFields([{ ...grant, expiresAt: "invalid" }], now, scope, true), []);
});
test("inclusive start boundary and field de-duplication remain predictable", () => {
  assert.deepEqual(visibleFields([grant, grant], new Date(at), scope, true), ["measurement"]);
});
