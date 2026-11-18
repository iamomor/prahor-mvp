import type { UltrasoundField, UltrasoundSubtype } from "./ultrasound";
﻿import type { AntenatalSections, DocumentType, ReportSection, StructuredResult, ObservationCode, LaboratoryDetails, SourceLocation } from "./report-schema";
import type { ObservationCategory, RecordType } from "@/features/jibonrekha/demo-health";
export type ReviewStatus = "pending" | "verified" | "rejected";
export type InputMethod = "manual" | "image" | "voice";
export type Correction = { property: string; before: string; after: string; at: string };
export type ExtractedReportField = {
  ultrasound?: UltrasoundField;
  recordId?: string;
  section?: ReportSection; observationCode?: ObservationCode; structuredResult?: StructuredResult; laboratory?: LaboratoryDetails; sourceLocation?: SourceLocation;
  id: string; label: string; value: string; unit: string; destination: RecordType | ""; reviewStatus: ReviewStatus;
  category?: ObservationCategory; observedAt?: string; reportDate?: string; referenceRange?: string; notes?: string;
  originalLabel?: string; originalUnit?: string; reviewedAt?: string;
  rawValue?: string; normalizedValue?: string; sourceText?: string; unitUnavailable?: boolean;
  parsingReliability?: "recognized" | "uncertain" | "unrecognized";
  ocrConfidence?: number; correctionHistory?: Correction[];
};
export type ExtractedReport = {
  selectedEpisodeId?: string;
  scanSubtype?: UltrasoundSubtype; scanDate?: string;
  id: string; name: string; status: "needs_review"; source: "document_extracted" | "self_reported";
  observedAt: string; fields: ExtractedReportField[];
  schemaVersion?: 2; documentType?: DocumentType; sections?: AntenatalSections;
  clinicianVerification?: { status: "unverified"; documentedClaimOnly: boolean };
  inputMethod?: InputMethod; rawText?: string; transcript?: string; sourceFileId?: string;
  ocrConfidence?: number; unrecognizedText?: string[];
};

export type AntenatalReportV2 = ExtractedReport & { schemaVersion: 2; documentType: DocumentType; sections: AntenatalSections; clinicianVerification: { status: "unverified"; documentedClaimOnly: boolean } };

