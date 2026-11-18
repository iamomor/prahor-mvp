import { expect, test } from "@playwright/test";
import {
  consentGrantSchema, extractedFieldSchema, sharedRecordProjectionSchema, wellnessEntrySchema,
} from "../../src/lib/contracts";
import { at, ids, later } from "./fixtures";

const row = {
  id: ids.field, ownerUserId: ids.motherA, createdAt: at, updatedAt: at,
  revision: 1, dataMode: "synthetic",
};

test("saved wellness records retain the same nonempty check-in rule as create requests", () => {
  expect(wellnessEntrySchema.safeParse({
    ...row, occurredAt: at, mood: null, energy: null, activityNote: null, restNote: null,
  }).success).toBe(false);
});

test("stored consent cannot grant an owner's record back to the same owner", () => {
  expect(consentGrantSchema.safeParse({
    ...row, granteeUserId: ids.motherA,
    record: { type: "baby_record", id: ids.baby, fields: ["label"] },
    purpose: "Synthetic structural test", startsAt: at, expiresAt: later, revokedAt: null,
  }).success).toBe(false);
});

test("provider projection cannot become empty when serialized to JSON", () => {
  expect(sharedRecordProjectionSchema.safeParse({
    type: "baby_record", id: ids.baby, fields: { label: undefined },
  }).success).toBe(false);
});

test("partial sharing permits selected null fields without exposing the rest of a check-in", () => {
  const projection = { type: "wellness_entry", id: ids.field, fields: { mood: null } };
  expect(sharedRecordProjectionSchema.parse(projection)).toEqual(projection);
});

test("raw OCR labels, values and units survive validation without trimming", () => {
  const raw = { rawLabel: "  Synthetic field\n", rawValue: " 10.00 ", rawUnit: " g/dL " };
  const result = extractedFieldSchema.parse({
    id: ids.field, ...raw, parsedMeasurement: null, confidence: null,
    uncertainty: ["engine_uncertain"], source: { page: 1, locator: "synthetic line 1" },
    verification: "unverified",
  });
  expect({ rawLabel: result.rawLabel, rawValue: result.rawValue, rawUnit: result.rawUnit }).toEqual(raw);
});
