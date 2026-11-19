import { idSchema, languageSchema, timestampSchema } from "@/lib/contracts/common";
import { z } from "zod";

/** Relaxation resource categories supported by PROHOR Shusthota Calm Corner */
export const resourceCategories = ["breathing", "gentle_rest", "mindful_calm", "body_awareness"] as const;
export type ResourceCategory = (typeof resourceCategories)[number];

/** Content cannot be published unless its review provenance is complete and approved. */
export const reviewedResourceSchema = z.strictObject({
    id: idSchema,
    language: languageSchema,
    category: z.enum(resourceCategories),
    title: z.string().trim().min(1).max(160),
    body: z.string().trim().min(1).max(12000),
    sourceReference: z.string().trim().min(1).max(1000),
    contentVersion: z.string().trim().min(1).max(40),
    review: z.strictObject({
        status: z.literal("approved"),
        reviewerId: idSchema,
        reviewerRole: z.string().trim().min(1).max(100),
        reviewedAt: timestampSchema,
    }),
    publicationStatus: z.literal("published"),
    educationalOnly: z.literal(true),
});

export type ReviewedResource = z.infer<typeof reviewedResourceSchema>;

/** Candidate resource that may be in draft, pending review, or rejected state before approval */
export const candidateResourceSchema = z.strictObject({
    id: idSchema,
    language: languageSchema,
    category: z.enum(resourceCategories),
    title: z.string().trim().min(1).max(160),
    body: z.string().trim().min(1).max(12000),
    sourceReference: z.string().trim().min(1).max(1000),
    contentVersion: z.string().trim().min(1).max(40),
    review: z.strictObject({
        status: z.enum(["draft", "in_review", "approved", "rejected"]),
        reviewerId: idSchema.optional(),
        reviewerRole: z.string().trim().min(1).max(100).optional(),
        reviewedAt: timestampSchema.optional(),
    }),
    publicationStatus: z.enum(["draft", "unpublished", "published"]),
    educationalOnly: z.literal(true),
});

export type CandidateResource = z.infer<typeof candidateResourceSchema>;

/**
 * Strict clinical approval gate for relaxation resources.
 * Content is REJECTED if:
 * - Review status is not 'approved'
 * - Publication status is not 'published'
 * - Reviewer ID, role or reviewed timestamp is missing
 * - Schema validation fails
 */
export function validateReviewedResource(
    candidate: unknown,
): { ok: true; data: ReviewedResource } | { ok: false; reason: string } {
    const parsed = reviewedResourceSchema.safeParse(candidate);
    if (!parsed.success) {
        const issues = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ");
        return { ok: false, reason: `Approval gate rejected: ${issues}` };
    }
    return { ok: true, data: parsed.data };
}

/** Future plan metadata has the same publication gate; there are intentionally no plan records today. */
export const clinicianApprovedPlanSchema = z.strictObject({
    id: idSchema,
    language: languageSchema,
    title: z.string().trim().min(1).max(160),
    instructions: z.string().trim().min(1).max(12000),
    version: z.string().trim().min(1).max(40),
    sourceReference: z.string().trim().min(1).max(1000),
    review: z.strictObject({
        status: z.literal("approved"),
        clinicianId: idSchema,
        qualification: z.string().trim().min(1).max(120),
        approvedAt: timestampSchema,
    }),
    publicationStatus: z.literal("published"),
});

/** No diary field is representable in this future provider interface. */
export type ClinicianApprovedPlan = z.infer<typeof clinicianApprovedPlanSchema>;

/**
 * Strict clinical approval gate for activity plans.
 * Plan is REJECTED if:
 * - Review status is not 'approved'
 * - Publication status is not 'published'
 * - Clinician ID, medical qualification or approval timestamp is missing
 * - Schema validation fails
 */
export function validateClinicianApprovedPlan(
    candidate: unknown,
): { ok: true; data: ClinicianApprovedPlan } | { ok: false; reason: string } {
    const parsed = clinicianApprovedPlanSchema.safeParse(candidate);
    if (!parsed.success) {
        const issues = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ");
        return { ok: false, reason: `Clinical approval gate rejected: ${issues}` };
    }
    return { ok: true, data: parsed.data };
}

/**
 * In-memory repository for reviewed resources.
 * Under PROHOR clinical integrity rules:
 * NEVER invent a clinician, reviewer, source, review date, or clinical approval.
 * Without verified sign-off, published lists return empty array.
 */
const candidateResources: CandidateResource[] = [];

export function getPublishedReviewedResources(language?: "en" | "bn"): ReviewedResource[] {
    const published: ReviewedResource[] = [];
    for (const candidate of candidateResources) {
        const check = validateReviewedResource(candidate);
        if (check.ok && (!language || check.data.language === language)) {
            published.push(check.data);
        }
    }
    return published;
}

const candidatePlans: unknown[] = [];

export function getPublishedActivityPlans(language?: "en" | "bn"): ClinicianApprovedPlan[] {
    const published: ClinicianApprovedPlan[] = [];
    for (const candidate of candidatePlans) {
        const check = validateClinicianApprovedPlan(candidate);
        if (check.ok && (!language || check.data.language === language)) {
            published.push(check.data);
        }
    }
    return published;
}

/** No diary field is representable in this provider interface. */
export type WellnessTrendInput = {
    consented: true;
    fields: readonly ("mood" | "energy" | "activityNote" | "restNote" | "hydration")[];
    records: readonly {
        occurredAt: string;
        mood?: string | null;
        energy?: string | null;
        activityNote?: string | null;
        restNote?: string | null;
        hydrationMl?: number;
    }[];
};
export type WellnessTrendOutput = { summary: string; informationalOnly: true; nonDiagnostic: true };
export interface WellnessTrendProvider {
    summarize(input: WellnessTrendInput): Promise<WellnessTrendOutput>;
}

export function validateWellnessTrendInput(
    input: unknown,
): { ok: true; data: WellnessTrendInput } | { ok: false; error: string } {
    if (typeof input !== "object" || input === null) return { ok: false, error: "Invalid trend input" };
    const candidate = input as Record<string, unknown>;
    if (candidate.consented !== true) return { ok: false, error: "Explicit consent is required" };
    if (!Array.isArray(candidate.fields) || candidate.fields.length === 0)
        return { ok: false, error: "At least one field must be selected" };
    const allowedFields = new Set(["mood", "energy", "activityNote", "restNote", "hydration"]);
    if (!candidate.fields.every(f => typeof f === "string" && allowedFields.has(f)))
        return { ok: false, error: "Only approved wellness fields may be processed" };
    if ("diary" in candidate || "text" in candidate || "diaryText" in candidate)
        return { ok: false, error: "Private diary must never be passed to AI" };
    if ("providerId" in candidate || "providerName" in candidate)
        return { ok: false, error: "Provider identity must never be passed to trend summary" };
    if (!Array.isArray(candidate.records)) return { ok: false, error: "Records array is required" };
    return { ok: true, data: input as WellnessTrendInput };
}
