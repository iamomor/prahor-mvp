import type { HealthObservation, RecordType } from "./demo-health";
import type { RecordsWorkspace, Consent, AuditEvent, BartaContext, ObservationRevision } from "./records-model";
/** Proposed capability boundaries, not implemented endpoints or client-side authorization. */
export type RecordsPrincipal = { actorId: string; ownerUserId: string; role: "mother" | "authorized_supporter" | "healthcare_provider" };
export type RecordsAccessRequest = { principal: RecordsPrincipal; recordType: RecordType; recordId: string; pregnancyId: string; purpose: string; operation: "read" | "add" | "correct" | "archive" | "share" };
export type RecordsIntegrationError = { code: "unauthenticated" | "forbidden" | "validation" | "conflict" | "offline" | "unavailable"; message: string };
export interface RecordsBackendAdapter {
  currentPrincipal(): Promise<RecordsPrincipal>;
  readWorkspace(request: RecordsAccessRequest): Promise<RecordsWorkspace>;
  listObservations(request: RecordsAccessRequest): Promise<HealthObservation[]>;
  saveObservationBatch(request: RecordsAccessRequest, observations: HealthObservation[], idempotencyKey: string): Promise<HealthObservation[]>;
  correctObservation(request: RecordsAccessRequest, observationId: string, expectedRevision: number, revision: ObservationRevision): Promise<HealthObservation>;
  updateConsent(request: RecordsAccessRequest, consent: Consent): Promise<Consent>;
  listAudit(request: RecordsAccessRequest): Promise<AuditEvent[]>;
  requestDeletion(request: RecordsAccessRequest, reason: string): Promise<{ requestId: string; status: "received" }>;
}
/** Transport is intentionally not implemented. The server must recheck consent at send time. */
export interface PendingBartaContextAdapter { submitApprovedContext(context: BartaContext, consentRevision: number): Promise<{ deliveryId: string }> }
