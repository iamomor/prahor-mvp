import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { z } from "zod";
import { currentApiContracts, currentUserResponseSchema, apiResultSchema, pageSchema,
  paginationQuerySchema, resourceIdParamsSchema, type CurrentApiRequest, type ProposedApiRequest,
} from "../../src/lib/contracts";
import { ids, at } from "./fixtures";

function routeFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? routeFiles(join(directory, entry.name)) : entry.name === "route.ts" ? [join(directory, entry.name)] : []);
}

test("current API catalog matches every real route method and source file", () => {
  const root = resolve("src/app/api");
  const found: Record<string,string> = {};
  for (const file of routeFiles(root)) {
    const path = `/api/${relative(root, file).replaceAll("\\", "/").replace(/\/route\.ts$/, "").replace(/\[([^\]]+)\]/g, ":$1")}`;
    for (const match of readFileSync(file, "utf8").matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b/g)) {
      found[`${match[1]} ${path}`] = relative(resolve("."), file).replaceAll("\\", "/");
    }
  }
  expect(Object.keys(found).sort()).toEqual(Object.keys(currentApiContracts).sort());
  for (const [key, contract] of Object.entries(currentApiContracts)) expect(found[key], key).toBe(contract.source);
});

test("Bujhi review and commit keep the verified clinical values server-bound", () => {
  const review = currentApiContracts["POST /api/reports/reviews"].request;
  const commit = currentApiContracts["POST /api/reports/commit"].request;
  const ids = { reportId: "00000000-0000-4000-8000-000000000001", pregnancyId: "00000000-0000-4000-8000-000000000002", fieldId: "00000000-0000-4000-8000-000000000003" };
  const record = { ...ids, sourceSha256: "a".repeat(64), rawLabel: "Hb", rawValue: "11.2", rawUnit: "g/dL", reviewedValue: "11.2", reviewedUnit: "g/dL", observedOn: "2026-11-20", decision: "verified" };
  expect(review.safeParse(record).success).toBe(true);
  expect(review.safeParse({ ...record, ownerId: "00000000-0000-4000-8000-000000000004" }).success).toBe(false);
  expect(review.safeParse({ ...record, decision: "clinician_confirmed" }).success).toBe(false);
  expect(commit.safeParse({ reviewId: ids.reportId, fieldId: ids.fieldId, confirmSave: true }).success).toBe(true);
  expect(commit.safeParse({ reviewId: ids.reportId, fieldId: ids.fieldId, confirmSave: true, value: "99" }).success).toBe(false);
});

test("new phone, notification and Poth routes have bounded, non-escalating contracts", () => {
  const phone = currentApiContracts["POST /api/auth/phone"].request;
  expect(phone.safeParse({ action: "request", phone: "+8801712345678" }).success).toBe(true);
  expect(phone.safeParse({ action: "request", phone: "+8801712345678", role: "provider" }).success).toBe(false);
  expect(phone.safeParse({ action: "verify", phone: "+8801712345678", token: "123456" }).success).toBe(true);
  const notify = currentApiContracts["PUT /api/notifications/preferences"].request;
  expect(notify.safeParse({ channel: "sms", optedIn: true }).success).toBe(true);
  expect(notify.safeParse({ channel: "sms", optedIn: true, userId: "00000000-0000-4000-8000-000000000001" }).success).toBe(false);
  const evidence = currentApiContracts["POST /api/poth/access-evidence/review"].request;
  expect(evidence.safeParse({ facilityId: "dghs/123", attribute: "wheelchair", value: "reported_available", status: "verified", source: "Synthetic call note" }).success).toBe(true);
  expect(evidence.safeParse({ facilityId: "dghs/123", attribute: "wheelchair", value: "reported_available", status: "verified", source: "Synthetic call note", reviewer: true }).success).toBe(false);
});

test("canonical documentation covers every current and proposed operation", () => {
  const doc = readFileSync("docs/architecture/api-contracts.md", "utf8");
  const proposed = [...readFileSync("src/lib/contracts/api.ts", "utf8").matchAll(/^\s+"((?:GET|POST|PUT|PATCH|DELETE) \/api\/[^\"]+)":/gm)].map(match => match[1]);
  for (const operation of [...Object.keys(currentApiContracts), ...proposed]) expect(doc, operation).toContain(`\`${operation}\``);
  expect(doc).toContain("Needs Review");
  expect(doc).toContain("**Mock:**");
});

test("current Barta accepts public education and legacy payloads while rejecting private context", () => {
  const current: CurrentApiRequest<"POST /api/ai/chat"> = { question: "Synthetic question" };
  const future: ProposedApiRequest<"POST /api/ai/chat"> = { ...current, language: "bn", retention: { mode: "ephemeral" } };
  expect(currentApiContracts["POST /api/ai/chat"].request.safeParse(current).success).toBe(true);
  expect(currentApiContracts["POST /api/ai/chat"].request.safeParse(future).success).toBe(true);
  expect(currentApiContracts["POST /api/ai/chat"].request.safeParse({ ...future, diaryText: "Private context" }).success).toBe(false);
  expect(currentApiContracts["POST /api/care-requests"].request.safeParse({ message: "Synthetic request", method: "aac" }).success).toBe(false);
  expect(currentApiContracts["POST /api/care-requests"].request.safeParse({
    recipientUserId: ids.provider, message: "Synthetic request", method: "aac", purpose: "Synthetic support",
    consentGrantIds: [], reviewConfirmed: true, coordination: {
      termsVersion: "bondhon-demo-2026-11-19", expiresAt: "2026-11-20T00:00:00Z",
      allowReplies: false, language: "en", accommodations: [], records: [],
    },
  }).success).toBe(true);
  expect(currentApiContracts["POST /api/care-requests"].request.safeParse({ message: "Synthetic request", method: "aac", status: "delivered" }).success).toBe(false);
});

test("current stub response variants cannot pretend to be completed domain services", () => {
  const barta = currentApiContracts["POST /api/ai/chat"];
  expect(barta.status).toBe("Limited");
  expect(barta.responses[501].safeParse({ message: "Not connected", status: "not_connected" }).success).toBe(true);
  expect(barta.responses[501].safeParse({ status: "grounded", answer: "Fabricated answer" }).success).toBe(false);
  expect(currentApiContracts["GET /api/health"].responses).not.toHaveProperty("200");
  const care = currentApiContracts["POST /api/care-requests"];
  expect(care.status).toBe("Limited");
  expect(care.responses[503].safeParse({ status: "delivered", message: "False delivery" }).success).toBe(false);
  expect(care.responses[201].safeParse({ status: "delivered", message: "False delivery" }).success).toBe(false);
});

test("Shusthota GET contracts match the exact route select lists and reject extra columns", () => {
  const pg = "2026-11-19T05:40:12.123456+00:00"; // PostgREST timestamptz shape
  const wellness = { id: ids.field, occurred_at: pg, created_at: pg, mood: "mixed", energy: null, activity_note: null, rest_note: "Synthetic rest" };
  const diary = { id: ids.field, text: "Synthetic diary", privacy: "owner_only", occurred_at: pg, created_at: pg };
  const w = currentApiContracts["GET /api/wellness"].responses[200], d = currentApiContracts["GET /api/diary"].responses[200];
  expect(w.safeParse({ entries: [wellness] }).success).toBe(true);
  expect(w.safeParse({ entries: [{ ...wellness, owner_user_id: ids.motherA }] }).success).toBe(false);
  expect(d.safeParse({ entries: [diary] }).success).toBe(true);
  expect(d.safeParse({ entries: [{ ...diary, data_mode: "synthetic" }] }).success).toBe(false);
  expect(d.safeParse({ entries: [{ ...diary, privacy: "provider" }] }).success).toBe(false);
});

test("shared success/error/page validators match the approved envelopes", () => {
  const success = { data: { id: ids.motherA, role: "mother", displayName: "Ayesha" }, requestId: ids.request, contractVersion: "1" };
  expect(currentUserResponseSchema.parse(success)).toEqual(success);
  expect(currentUserResponseSchema.safeParse({ ...success, token: "forbidden" }).success).toBe(false);
  expect(currentUserResponseSchema.safeParse({ ...success, data: { ...success.data, role: "admin" } }).success).toBe(false);
  const result = apiResultSchema(z.string());
  expect(result.safeParse({ error: { code: "invalid_request", message: "Invalid input", fieldErrors: [{ path: "destination.babyId", message: "Choose an owned baby record" }] }, requestId: ids.request }).success).toBe(true);
  expect(result.safeParse({ error: { code: "SQL_ERROR", message: "Internal error", stack: "forbidden" }, requestId: ids.request }).success).toBe(false);
  expect(pageSchema(z.string()).safeParse({ items: ["Synthetic"], nextCursor: null }).success).toBe(true);
  expect(pageSchema(z.string()).safeParse({ items: [12], nextCursor: null }).success).toBe(false);
});

test("proposed path/query helpers validate UUIDs and limits without changing wire handlers", () => {
  expect(resourceIdParamsSchema.parse({ id: ids.baby })).toEqual({ id: ids.baby });
  expect(resourceIdParamsSchema.safeParse({ id: "foreign-name", ownerUserId: ids.motherA }).success).toBe(false);
  expect(paginationQuerySchema.parse({})).toEqual({ limit: 20 });
  expect(paginationQuerySchema.parse({ limit: "50", cursor: at })).toEqual({ limit: 50, cursor: at });
  for (const limit of ["0", "51", "-1", "1.5", "100000", "invalid"]) expect(paginationQuerySchema.safeParse({ limit }).success).toBe(false);
  expect(paginationQuerySchema.safeParse({ limit: "5", ownerUserId: ids.motherA }).success).toBe(false);
});
