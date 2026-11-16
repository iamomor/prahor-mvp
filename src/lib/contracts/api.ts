import type { z } from "zod";
import type { AccessPreferences, saveAccessPreferencesRequestSchema } from "./adapt";
import type { BartaAnswer, BartaRequest } from "./barta";
import type {
  ConsentGrant, CreateSupportRequestRequest, SupportRequest, SupportRequestEventSummary,
  ProviderRequest, ProviderRequestSummary,
  createConsentGrantRequestSchema, providerAcknowledgeRequestSchema,
  providerRespondRequestSchema, closeSupportRequestRequestSchema,
} from "./bondhon";
import type {
  CommitDocumentReviewRequest, ExtractionResult, ReviewExtractionRequest,
  createDocumentRequestSchema, startExtractionRequestSchema,
} from "./bujhi";
import type { ApiResult, Page, RecordDestination } from "./common";
import type {
  BabyRecord, CreateObservationRequest, HealthObservation, MaternalCondition, PregnancyRecord,
  createBabyRequestSchema, createMaternalConditionRequestSchema, createPregnancyRequestSchema,
  createSymptomNoteRequestSchema,
} from "./health";
import type { Facility, saveAppointmentRequestSchema } from "./poth";
import type { Profile, UserRole } from "./platform";
import type { SafetyGuidance } from "./shonket";
import type {
  DiaryEntry, WellnessEntry, createDiaryEntryRequestSchema, createWellnessEntryRequestSchema,
} from "./wellness";

type Operation<Request, Response> = { request: Request; response: ApiResult<Response> };

/** Route payload map only; no endpoint is enabled by declaring a contract. See architecture/api-contracts.md. */
export interface ApiOperations {
  "GET /api/me": Operation<undefined, { profile: Profile; roles: UserRole[] }>;
  "GET /api/access-preferences": Operation<undefined, { settings: AccessPreferences; schemaVersion: 2; updatedAt: string | null }>;
  "PUT /api/access-preferences": Operation<z.infer<typeof saveAccessPreferencesRequestSchema>, { settings: AccessPreferences; updatedAt: string }>;
  "POST /api/ai/chat": Operation<BartaRequest, BartaAnswer>;
  "GET /api/pregnancies": Operation<undefined, Page<PregnancyRecord>>;
  "POST /api/pregnancies": Operation<z.infer<typeof createPregnancyRequestSchema>, PregnancyRecord>;
  "POST /api/babies": Operation<z.infer<typeof createBabyRequestSchema>, BabyRecord>;
  "GET /api/health": Operation<undefined, Page<HealthObservation>>;
  "POST /api/health": Operation<CreateObservationRequest, HealthObservation>;
  "POST /api/maternal-conditions": Operation<z.infer<typeof createMaternalConditionRequestSchema>, MaternalCondition>;
  "POST /api/symptom-notes": Operation<z.infer<typeof createSymptomNoteRequestSchema>, { id: string }>;
  "GET /api/wellness": Operation<undefined, Page<WellnessEntry>>;
  "POST /api/wellness": Operation<z.infer<typeof createWellnessEntryRequestSchema>, WellnessEntry>;
  "POST /api/diary": Operation<z.infer<typeof createDiaryEntryRequestSchema>, DiaryEntry>;
  "GET /api/diary": Operation<undefined, Page<DiaryEntry>>;
  "POST /api/reports": Operation<z.infer<typeof createDocumentRequestSchema>, { documentId: string; uploadPath: string }>;
  "POST /api/reports/extract": Operation<z.infer<typeof startExtractionRequestSchema>, { extractionId: string; status: "queued" }>;
  "GET /api/reports/extractions/:id": Operation<undefined, ExtractionResult>;
  "POST /api/reports/extractions/:id/reviews": Operation<ReviewExtractionRequest, { reviewId: string; revision: number; destination: RecordDestination }>;
  "POST /api/reports/commit": Operation<CommitDocumentReviewRequest, { reviewId: string; records: HealthObservation[] }>;
  "GET /api/facilities": Operation<undefined, Page<Facility>>;
  "GET /api/safety-guidance": Operation<undefined, Page<SafetyGuidance>>;
  "POST /api/appointments": Operation<z.infer<typeof saveAppointmentRequestSchema>, { id: string; status: "self_recorded" }>;
  "POST /api/consents": Operation<z.infer<typeof createConsentGrantRequestSchema>, ConsentGrant>;
  "POST /api/consents/:id/revoke": Operation<undefined, { id: string; revokedAt: string }>;
  "POST /api/care-requests": Operation<CreateSupportRequestRequest, SupportRequest>;
  "GET /api/care-requests/:id": Operation<undefined, SupportRequest | ProviderRequest>;
  "GET /api/care-requests/:id/events": Operation<undefined, Page<SupportRequestEventSummary>>;
  "GET /api/provider/requests": Operation<undefined, Page<ProviderRequestSummary>>;
  "POST /api/provider/requests/:id/acknowledge": Operation<z.infer<typeof providerAcknowledgeRequestSchema>, ProviderRequest>;
  "POST /api/provider/requests/:id/respond": Operation<z.infer<typeof providerRespondRequestSchema>, ProviderRequest>;
  "POST /api/care-requests/:id/close": Operation<z.infer<typeof closeSupportRequestRequestSchema>, SupportRequest | ProviderRequest>;
}

export type ApiRequest<K extends keyof ApiOperations> = ApiOperations[K]["request"];
export type ApiResponse<K extends keyof ApiOperations> = ApiOperations[K]["response"];
