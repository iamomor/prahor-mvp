import { expect, test } from "@playwright/test";
import {
  activityPreferencesRequestSchema, createHabitRequestSchema, habitEventRequestSchema,
  hydrationGetQuerySchema, hydrationRequestSchema,
} from "../../src/lib/contracts/shusthota-p1";
import {
  getPublishedActivityPlans,
  getPublishedReviewedResources,
  validateClinicianApprovedPlan,
  validateReviewedResource,
  validateWellnessTrendInput,
} from "../../src/features/shusthota/reviewed-content";

const id = "a6000000-0000-4000-8000-000000000011";
const reviewerId = "a6000000-0000-4000-8000-000000000022";
const timestamp = "2026-11-20T08:30:00.000Z";

test("hydration schema bounds amounts, rejects owner injection and limits query keys", () => {
  expect(hydrationRequestSchema.safeParse({ amountMl: 250, occurredAt: timestamp, retryKey: id }).success).toBe(true);
  expect(hydrationRequestSchema.safeParse({ amountMl: 0, occurredAt: timestamp, retryKey: id }).success).toBe(false);
  expect(hydrationRequestSchema.safeParse({ amountMl: 5001, occurredAt: timestamp, retryKey: id }).success).toBe(false);
  expect(hydrationRequestSchema.safeParse({ amountMl: 250, occurredAt: timestamp, retryKey: id, ownerUserId: id }).success).toBe(false);
  expect(hydrationGetQuerySchema.safeParse({ scope: "history" }).success).toBe(true);
  expect(hydrationGetQuerySchema.safeParse({ scope: "all" }).success).toBe(false);
  expect(hydrationGetQuerySchema.safeParse({ page: "2" }).success).toBe(false);
});

test("habits require a user-authored label and allowlisted symbol", () => {
  expect(createHabitRequestSchema.safeParse({ label: "My routine", icon: "care", retryKey: id }).success).toBe(true);
  expect(createHabitRequestSchema.safeParse({ label: " ", icon: "care", retryKey: id }).success).toBe(false);
  expect(createHabitRequestSchema.safeParse({ label: "My routine", icon: "clinical-plan", retryKey: id }).success).toBe(false);
});

test("activity preferences are optional, unique and non-inferential; habit undo references an event", () => {
  expect(activityPreferencesRequestSchema.safeParse({ preferences: [], occurredAt: timestamp, retryKey: id }).success).toBe(true);
  expect(activityPreferencesRequestSchema.safeParse({ preferences: ["walking", "walking"], occurredAt: timestamp, retryKey: id }).success).toBe(false);
  expect(activityPreferencesRequestSchema.safeParse({ preferences: ["none", "resting"], occurredAt: timestamp, retryKey: id }).success).toBe(false);
  expect(habitEventRequestSchema.safeParse({ eventType: "completion_undone", occurredAt: timestamp, retryKey: id, relatedEventId: id }).success).toBe(true);
  expect(habitEventRequestSchema.safeParse({ eventType: "completion_undone", occurredAt: timestamp, retryKey: id }).success).toBe(false);
});

test("relaxation resource approval gate enforces review provenance and publication status", () => {
  const validApproved = {
    id,
    language: "en" as const,
    category: "breathing" as const,
    title: "Gentle diaphragmatic breathing",
    body: "Take a slow, deep breath in through your nose for 4 seconds, then gently exhale.",
    sourceReference: "WHO Recommendations on Maternal and Perinatal Health (2020)",
    contentVersion: "1.0",
    review: {
      status: "approved" as const,
      reviewerId,
      reviewerRole: "Certified Midwife Specialist",
      reviewedAt: timestamp,
    },
    publicationStatus: "published" as const,
    educationalOnly: true as const,
  };

  const passCheck = validateReviewedResource(validApproved);
  expect(passCheck.ok).toBe(true);

  // Draft review status rejected
  const draftReview = { ...validApproved, review: { ...validApproved.review, status: "draft" } };
  expect(validateReviewedResource(draftReview).ok).toBe(false);

  // Unpublished publicationStatus rejected
  const unpublished = { ...validApproved, publicationStatus: "unpublished" };
  expect(validateReviewedResource(unpublished).ok).toBe(false);

  // Missing reviewer credentials rejected
  const noReviewer = { ...validApproved, review: { status: "approved" } };
  expect(validateReviewedResource(noReviewer).ok).toBe(false);

  // Repository returns empty array when no verified items exist
  expect(getPublishedReviewedResources()).toEqual([]);
});

test("clinician-approved plan approval gate strictly enforces medical credentials", () => {
  const validPlan = {
    id,
    language: "en" as const,
    title: "Second Trimester Gentle Mobility Guide",
    instructions: "Perform supported seated shoulder rolls and gentle ankle circles while seated comfortably.",
    version: "1.0",
    sourceReference: "ACOG Committee Opinion No. 804: Physical Activity and Exercise During Pregnancy",
    review: {
      status: "approved" as const,
      clinicianId: reviewerId,
      qualification: "Consultant Obstetrician & Gynecologist, MBBS, FCPS",
      approvedAt: timestamp,
    },
    publicationStatus: "published" as const,
  };

  const passCheck = validateClinicianApprovedPlan(validPlan);
  expect(passCheck.ok).toBe(true);

  // Missing qualification rejected
  const missingQual = { ...validPlan, review: { ...validPlan.review, qualification: "" } };
  expect(validateClinicianApprovedPlan(missingQual).ok).toBe(false);

  // Unapproved plan rejected
  const unapproved = { ...validPlan, review: { ...validPlan.review, status: "in_review" } };
  expect(validateClinicianApprovedPlan(unapproved).ok).toBe(false);

  // Repository returns empty array when no verified plans exist
  expect(getPublishedActivityPlans()).toEqual([]);
});

test("wellness trend summary input validator excludes diary entries and provider information", () => {
  const valid = {
    consented: true as const,
    fields: ["mood", "energy", "hydration"] as const,
    records: [{ occurredAt: timestamp, mood: "comfortable", energy: "high", hydrationMl: 300 }],
  };
  expect(validateWellnessTrendInput(valid).ok).toBe(true);

  // Missing consent rejected
  expect(validateWellnessTrendInput({ ...valid, consented: false }).ok).toBe(false);

  // Diary text inclusion strictly rejected
  expect(validateWellnessTrendInput({ ...valid, diaryText: "Private thoughts" }).ok).toBe(false);

  // Provider information inclusion strictly rejected
  expect(validateWellnessTrendInput({ ...valid, providerId: reviewerId }).ok).toBe(false);

  // Disallowed fields rejected
  expect(validateWellnessTrendInput({ ...valid, fields: ["mood", "exercisePrescription"] }).ok).toBe(false);
});
