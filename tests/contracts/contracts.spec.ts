import { expect, test } from "@playwright/test";
import {
  DEFAULT_ACCESS_PREFERENCES, accessPreferencesSchema, bartaAnswerSchema, bartaRequestSchema,
  commitDocumentReviewRequestSchema, createConsentGrantRequestSchema, createDocumentRequestSchema,
  createObservationRequestSchema, createSupportRequestRequestSchema,
  createWellnessEntryRequestSchema, diaryEntrySchema, extractedFieldSchema, extractionResultSchema,
  fromLocalPreferences, healthObservationSchema, isPermittedSupportTransition,
  knowledgeSourceSchema, measurementSchema, provenanceSchema, providerRequestSchema,
  reviewExtractionRequestSchema, shareableRecordSchema, sharedRecordProjectionSchema,
  supportRequestEventSchema, supportRequestStatuses, timestampSchema, verificationSchema,
  type ApiRequest, type PregnancyRecord, type BabyRecord,
} from "../../src/lib/contracts";
import { DEFAULT_PROHOR_PREFERENCES } from "../../src/lib/access-preferences";
import { at, ids, later, maternalNote, review } from "./fixtures";

test("v1 preference upgrade preserves independent choices and adds v2 defaults", () => {
  const upgraded = fromLocalPreferences({
    ...DEFAULT_PROHOR_PREFERENCES, theme: "original-rose", highContrast: true,
    communication: "aac", spaciousLayout: true, simplifiedContent: false,
  });
  expect(upgraded).toMatchObject({
    theme: "original-rose", highContrast: true, communication: "aac", spaciousLayout: true,
    simplifiedContent: false, readAloud: false, textSpacing: "default",
  });
  expect(accessPreferencesSchema.safeParse({ ...DEFAULT_ACCESS_PREFERENCES, role: "provider" }).success).toBe(false);
});

test("observation inputs reject owner and provenance escalation", () => {
  const request: ApiRequest<"POST /api/health"> = { ...maternalNote };
  expect(createObservationRequestSchema.safeParse(request).success).toBe(true);
  for (const extra of [
    { ownerUserId: ids.motherB }, { source: "clinician_confirmed" },
    { provenance: { source: "document_extracted" } }, { dataMode: "real" },
  ]) expect(createObservationRequestSchema.safeParse({ ...request, ...extra }).success).toBe(false);
});

test("maternal and baby destinations cannot be combined or substituted", () => {
  expect(createObservationRequestSchema.safeParse({
    ...maternalNote, destination: { subject: "mother", pregnancyId: ids.pregnancy, babyId: ids.baby },
  }).success).toBe(false);
  const fetal = { kind: "fetal_heart_rate", value: "120", unit: "/min" };
  expect(createObservationRequestSchema.safeParse({ ...maternalNote, measurement: fetal }).success).toBe(false);
  expect(createObservationRequestSchema.safeParse({
    ...maternalNote, destination: { subject: "baby", babyId: ids.baby }, measurement: fetal,
  }).success).toBe(true);
  expect(createObservationRequestSchema.safeParse({
    ...maternalNote, destination: { subject: "baby", babyId: ids.baby },
    measurement: { kind: "hemoglobin", value: "10", unit: "g/dL" },
  }).success).toBe(false);
});

test("measurement units and decimal precision are explicit without silent coercion", () => {
  const value = { kind: "hemoglobin", value: "10.00", unit: "g/dL" };
  expect(measurementSchema.parse(value).value).toBe("10.00");
  for (const bad of [{ ...value, unit: "kg" }, { ...value, value: 10 }, { ...value, value: "" }, { ...value, kind: "invented" }]) {
    expect(measurementSchema.safeParse(bad).success).toBe(false);
  }
});

test("record timestamps cannot be timezone-free guesses", () => {
  expect(timestampSchema.safeParse(at).success).toBe(true);
  expect(timestampSchema.safeParse("2026-11-16T09:00:00").success).toBe(false);
});

test("document-derived observations require a user review and never become clinician confirmed", () => {
  const provenance = {
    source: "document_extracted", verification: "user_verified", recordedByUserId: ids.motherA,
    recordedAt: at, documentId: ids.document, extractedFieldId: ids.field, reviewId: ids.review,
  };
  expect(provenanceSchema.safeParse(provenance).success).toBe(true);
  expect(provenanceSchema.safeParse({ ...provenance, verification: "clinician_confirmed" }).success).toBe(false);
  expect(provenanceSchema.safeParse({ ...provenance, reviewId: undefined }).success).toBe(false);
});

test("synthetic mother and baby records keep distinct identities and provenance", () => {
  const row = { ownerUserId: ids.motherA, createdAt: at, updatedAt: at, revision: 1, dataMode: "synthetic" } as const;
  const pregnancy: PregnancyRecord = {
    ...row, id: ids.pregnancy, label: "Synthetic pregnancy A", estimatedDueDate: null, lastMenstrualPeriodDate: null,
    provenance: { source: "self_reported", verification: "self_reported", recordedByUserId: ids.motherA, recordedAt: at, sourceNote: null },
  };
  const baby: BabyRecord = { ...row, id: ids.baby, pregnancyId: pregnancy.id, label: "Synthetic baby A", birthDate: null };
  expect(baby.id).not.toBe(pregnancy.id);
  expect(baby.ownerUserId).toBe(pregnancy.ownerUserId);
  const observation = {
    ...row, id: ids.field, destination: maternalNote.destination,
    measurement: maternalNote.measurement, observedAt: at, provenance: pregnancy.provenance,
  };
  expect(healthObservationSchema.safeParse(observation).success).toBe(true);
  expect(healthObservationSchema.safeParse({ ...observation, dataMode: "real" }).success).toBe(false);
});

test("grounded answer requires citations and explicit limitations; abstention has no answer", () => {
  const citation = {
    sourceId: ids.source, chunkId: ids.chunk, sourceVersion: "structural-test-only",
    title: "Synthetic nonmedical schema fixture", publisher: "Contract test",
    url: "https://example.invalid/structural-test", locator: "test-only", reviewedAt: at,
  };
  const grounded = { status: "grounded", answer: "Nonmedical test string.", citations: [citation], limitations: ["Structural test only."] };
  expect(bartaAnswerSchema.safeParse(grounded).success).toBe(true);
  expect(bartaAnswerSchema.safeParse({ ...grounded, citations: [] }).success).toBe(false);
  expect(bartaAnswerSchema.safeParse({ ...grounded, limitations: [] }).success).toBe(false);
  const abstention = { status: "abstained", answer: null, citations: [], reason: "insufficient_evidence", message: "No evidence available." };
  expect(bartaAnswerSchema.safeParse(abstention).success).toBe(true);
  expect(bartaAnswerSchema.safeParse({ ...abstention, answer: "Fabricated answer" }).success).toBe(false);
  expect(bartaAnswerSchema.safeParse({ ...abstention, citations: [citation] }).success).toBe(false);
});

test("AI retention defaults to ephemeral and saved mode requires explicit confirmation", () => {
  expect(bartaRequestSchema.parse({ question: "General information", language: "bn" }).retention).toEqual({ mode: "ephemeral" });
  expect(bartaRequestSchema.safeParse({
    question: "General information", language: "bn", retention: { mode: "saved", conversationId: null },
  }).success).toBe(false);
  expect(bartaRequestSchema.safeParse({ question: "General information", language: "bn", diaryText: "private" }).success).toBe(false);
});

test("source approval needs a recorded reviewer and review time", () => {
  const source = {
    id: ids.source, version: "test-only", title: "Nonmedical test", publisher: "Test",
    url: "https://example.invalid/test", language: "bn", publishedOn: null,
    reviewedAt: null, reviewedByUserId: null, reviewStatus: "approved",
  };
  expect(knowledgeSourceSchema.safeParse(source).success).toBe(false);
  expect(knowledgeSourceSchema.safeParse({ ...source, reviewStatus: "pending" }).success).toBe(true);
});

test("report upload contract accepts only the proposed bounded synthetic format", () => {
  const payload = { format: "prohor-synthetic-lab-v1", contentType: "application/pdf", byteSize: 1024, syntheticConfirmed: true };
  expect(createDocumentRequestSchema.safeParse(payload).success).toBe(true);
  for (const bad of [
    { ...payload, byteSize: 5 * 1024 * 1024 + 1 }, { ...payload, contentType: "image/png" },
    { ...payload, syntheticConfirmed: false }, { ...payload, objectPath: "other-user/report.pdf" },
  ]) expect(createDocumentRequestSchema.safeParse(bad).success).toBe(false);
});

test("raw extracted fields remain unverified with bounded nullable confidence", () => {
  const field = {
    id: ids.field, rawLabel: "Synthetic field", rawValue: "10.00", rawUnit: "g/dL",
    parsedMeasurement: null, confidence: null, uncertainty: ["engine_uncertain"],
    source: { page: 1, locator: "synthetic line 1" }, verification: "unverified",
  };
  expect(extractedFieldSchema.safeParse(field).success).toBe(true);
  expect(extractedFieldSchema.safeParse({ ...field, verification: "user_verified" }).success).toBe(false);
  expect(extractedFieldSchema.safeParse({ ...field, confidence: 1.1 }).success).toBe(false);
  const result = {
    id: ids.extraction, documentId: ids.document, revision: 1, engine: "test", engineVersion: "0",
    format: "prohor-synthetic-lab-v1", status: "review_required", fields: [field], errorCode: null,
  };
  expect(extractionResultSchema.safeParse(result).success).toBe(true);
  for (const bad of [
    { ...result, status: "processing" }, { ...result, status: "failed" },
    { ...result, fields: [] }, { ...result, fields: [field, field] },
  ]) expect(extractionResultSchema.safeParse(bad).success).toBe(false);
});

test("review requires one decision per field, explicit units and a matching subject", () => {
  expect(reviewExtractionRequestSchema.safeParse(review).success).toBe(true);
  expect(reviewExtractionRequestSchema.safeParse({ ...review, decisions: [review.decisions[0], review.decisions[0]] }).success).toBe(false);
  expect(reviewExtractionRequestSchema.safeParse({ ...review, destination: { subject: "baby", babyId: ids.baby } }).success).toBe(false);
  expect(reviewExtractionRequestSchema.safeParse({ ...review, reviewedByMother: false }).success).toBe(false);
  expect(reviewExtractionRequestSchema.safeParse({ ...review, decisions: [{ ...review.decisions[0], measurement: { kind: "hemoglobin", value: "10", unit: "kg" } }] }).success).toBe(false);
  // Rejecting all fields is a valid review. Refusing its commit is a separate server/database check.
  expect(reviewExtractionRequestSchema.safeParse({ ...review, decisions: [{ extractedFieldId: ids.field, decision: "rejected" }] }).success).toBe(true);
});

test("commit cannot replace the reviewed snapshot with client values or another destination", () => {
  const commit = { reviewId: ids.review, expectedReviewRevision: 1, confirmSave: true };
  expect(commitDocumentReviewRequestSchema.safeParse(commit).success).toBe(true);
  for (const extra of [{ measurement: review.decisions[0].measurement }, { destination: { subject: "baby", babyId: ids.baby } }, { source: "clinician_confirmed" }]) {
    expect(commitDocumentReviewRequestSchema.safeParse({ ...commit, ...extra }).success).toBe(false);
  }
});

test("wellness check-ins reject diary content, and diary privacy cannot be widened", () => {
  const wellness = { occurredAt: at, mood: null, energy: "low", activityNote: null, restNote: null };
  expect(createWellnessEntryRequestSchema.safeParse(wellness).success).toBe(true);
  expect(createWellnessEntryRequestSchema.safeParse({ ...wellness, privateNote: "private" }).success).toBe(false);
  expect(createWellnessEntryRequestSchema.safeParse({ ...wellness, energy: null }).success).toBe(false);
  const diary = { id: ids.field, ownerUserId: ids.motherA, createdAt: at, updatedAt: at, revision: 1, dataMode: "synthetic", text: "Synthetic private test", occurredAt: at, privacy: "owner_only" };
  expect(diaryEntrySchema.safeParse(diary).success).toBe(true);
  expect(diaryEntrySchema.safeParse({ ...diary, privacy: "provider" }).success).toBe(false);
});

test("consent scopes cannot include a diary, AI transcript, raw file, wildcard or duplicate field", () => {
  const valid = { type: "maternal_observation", id: ids.field, fields: ["measurement"] };
  expect(shareableRecordSchema.safeParse(valid).success).toBe(true);
  for (const type of ["wellness_diary_entry", "ai_conversation", "medical_document", "all_records"]) {
    expect(shareableRecordSchema.safeParse({ ...valid, type }).success).toBe(false);
  }
  for (const fields of [["*"], ["measurement", "measurement"], ["privateNote"], []]) {
    expect(shareableRecordSchema.safeParse({ ...valid, fields }).success).toBe(false);
  }
});

test("grant requires finite ordered expiry and explicit review; ownership is server-derived", () => {
  const grant = { granteeUserId: ids.provider, record: { type: "baby_record", id: ids.baby, fields: ["label"] }, purpose: "Synthetic request", startsAt: at, expiresAt: later, reviewConfirmed: true };
  expect(createConsentGrantRequestSchema.safeParse(grant).success).toBe(true);
  for (const extra of [{ expiresAt: at }, { expiresAt: null }, { reviewConfirmed: false }, { ownerUserId: ids.motherB }]) {
    expect(createConsentGrantRequestSchema.safeParse({ ...grant, ...extra }).success).toBe(false);
  }
});

test("provider projections reject owner identifiers, private source details and wrong resource fields", () => {
  const projection = { type: "maternal_observation", id: ids.field, fields: { provenance: { source: "self_reported", verification: "self_reported", recordedAt: at } } };
  expect(sharedRecordProjectionSchema.safeParse(projection).success).toBe(true);
  expect(sharedRecordProjectionSchema.safeParse({ ...projection, fields: { provenance: { ...projection.fields.provenance, sourceNote: "private source text" } } }).success).toBe(false);
  expect(sharedRecordProjectionSchema.safeParse({ ...projection, fields: { diaryText: "private" } }).success).toBe(false);
  expect(sharedRecordProjectionSchema.safeParse({ ...projection, fields: {} }).success).toBe(false);
  const request = { id: ids.request, createdAt: at, updatedAt: at, revision: 1, status: "delivered", providerMode: "simulated", method: "aac", message: "Synthetic explicit message", consentedRecords: [projection] };
  expect(providerRequestSchema.safeParse(request).success).toBe(true);
  expect(providerRequestSchema.safeParse({ ...request, ownerUserId: ids.motherA }).success).toBe(false);
});

test("request submission requires recipient and review, but permits message-only nonvoice care", () => {
  const request = { recipientUserId: ids.provider, message: "Synthetic request", purpose: "Synthetic follow-up", method: "aac", consentGrantIds: [], reviewConfirmed: true, coordination: { termsVersion: "bondhon-demo-2026-11-19", expiresAt: "2026-11-20T00:00:00Z", allowReplies: false, language: "en", accommodations: [], records: [] } };
  expect(createSupportRequestRequestSchema.safeParse(request).success).toBe(true);
  for (const extra of [{ coordination: undefined }, { recipientUserId: undefined }, { reviewConfirmed: false }, { status: "delivered" }, { assignedProviderId: ids.provider }]) {
    expect(createSupportRequestRequestSchema.safeParse({ ...request, ...extra }).success).toBe(false);
  }
});

test("support state transitions never skip evidence stages or reopen closed requests", () => {
  const expected = new Set([
    "submitted:delivered", "submitted:closed", "delivered:acknowledged", "delivered:closed",
    "acknowledged:responded", "acknowledged:closed", "responded:closed",
  ]);
  for (const from of supportRequestStatuses) for (const to of supportRequestStatuses) {
    expect(isPermittedSupportTransition(from, to), `${from} -> ${to}`).toBe(expected.has(`${from}:${to}`));
  }
});

test("delivery and response events need structural evidence references", () => {
  const event = { id: ids.event, requestId: ids.request, actorUserId: ids.provider, occurredAt: at, requestRevision: 2 };
  expect(supportRequestEventSchema.safeParse({ ...event, status: "delivered" }).success).toBe(false);
  expect(supportRequestEventSchema.safeParse({ ...event, status: "delivered", deliveryReceiptId: ids.receipt }).success).toBe(true);
  expect(supportRequestEventSchema.safeParse({ ...event, status: "responded", assignmentId: ids.receipt }).success).toBe(false);
  // Receipt existence/ownership, actor authorization and transaction atomicity still need database tests.
});

test("facility verification cannot be asserted without evidence and review metadata", () => {
  expect(verificationSchema.safeParse({ status: "not_verified", lastReviewedAt: null }).success).toBe(true);
  expect(verificationSchema.safeParse({ status: "verified" }).success).toBe(false);
});
