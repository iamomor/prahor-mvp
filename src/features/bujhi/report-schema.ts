/** Versioned report context. Presence, user review, and professional authenticity are distinct. */
export type DocumentType = "anc" | "laboratory" | "ultrasound" | "clinical_note" | "vital_sign" | "observation" | "unknown";
export type Presence = "provided" | "not_provided" | "not_applicable" | "not_reviewed" | "unreadable" | "conflicting";
export type ReportSection = "patient" | "dating" | "history" | "vitals" | "laboratory" | "ultrasound" | "supplements" | "risk" | "carePlan" | "provider";
export type UserReview = "pending" | "verified" | "rejected";
export type Datum<T = string> = {
  value?: T; original?: string; presence: Presence; reviewStatus: UserReview;
  source: "self_reported" | "document_extracted" | "profile" | "calculated";
  sourceText?: string; notes?: string; reviewedAt?: string;
};
export type PatientIdentification = {
  name?: Datum; age?: Datum; dateOfBirth?: Datum; patientId?: Datum; ancVisitId?: Datum;
  facility?: Datum; reportDate?: Datum; visitDate?: Datum; providerDetails?: Datum;
};
export type PregnancyDating = {
  lmp?: Datum; edd?: Datum; gestationalAge?: Datum; gestationalAgeSource?: Datum;
  scanDate?: Datum; ultrasoundDating?: Datum; eddConfirmationSource?: Datum; notes?: Datum;
  calculation?: { method: "LMP_PLUS_280_DAYS"; lmpInput: string; estimatedEdd: string; days: 280 };
};
export type ObstetricHistory = {
  originalNotation?: Datum; gravida?: Datum; para?: Datum; abortionsOrLosses?: Datum; livingChildren?: Datum;
  previousDeliveries?: Datum; previousComplications?: Datum; chronicConditions?: Datum; allergies?: Datum; currentMedicines?: Datum;
};
export type ObservationSection = { fieldIds: string[]; notes?: Datum };
export type UltrasoundSection = ObservationSection & {
  scanDate?: Datum; gestationalAgeAtScan?: Datum; numberOfFetuses?: Datum; heartbeatFindings?: Datum;
  placentalLocation?: Datum; amnioticFluid?: Datum; estimatedFetalWeight?: Datum; presentation?: Datum; otherFindings?: Datum;
};
export type ImmunizationSupplements = {
  tetanusHistory?: Datum; vaccineDates?: Datum; ironFolicAcid?: Datum; calcium?: Datum; otherSupplements?: Datum;
  documentedDose?: Datum; documentedFrequency?: Datum; documentedStatus?: Datum;
};
export type DocumentedRiskAssessment = { classification?: Datum; documentedReason?: Datum; assessingProvider?: Datum; assessmentDate?: Datum; dangerSignsDiscussed?: Datum };
export type CarePlan = { followUp?: Datum; referral?: Datum; documentedRecommendations?: Datum; notes?: Datum; deliveryPlanning?: Datum };
export type ProviderVerification = {
  name?: Datum; designation?: Datum; facility?: Datum; date?: Datum; signatureOrStamp?: Datum;
  authenticity: "not_verified" | "document_claim_only";
};
export type AntenatalSections = {
  patient?: PatientIdentification; dating?: PregnancyDating; history?: ObstetricHistory;
  vitals?: ObservationSection; laboratory?: ObservationSection; ultrasound?: UltrasoundSection;
  supplements?: ImmunizationSupplements; risk?: DocumentedRiskAssessment; carePlan?: CarePlan; provider?: ProviderVerification;
};
export type StructuredResult =
  | { type: "numeric"; original: string; normalizedCandidate?: string }
  | { type: "qualitative" | "textual"; original: string }
  | { type: "compound"; original: string; components: { label: string; original: string; unit?: string }[] };
export type ObservationCode = "blood_pressure" | "weight" | "height" | "bmi" | "pulse" | "temperature" | "fundal_height" | "fetal_heart_rate" | "fetal_movement" | "presentation" | "edema" | "hemoglobin" | "blood_group_rh" | "urine_protein" | "urine_glucose" | "blood_glucose" | "ogtt" | "hbsag" | "hiv" | "syphilis" | "beta_hcg" | "other";
export type LaboratoryDetails = {
  originalTestLabel: string; referenceIntervalUnit?: string; specimen?: string; collectionDate?: string;
  facility?: string; method?: string; sampleTiming?: { type: "fasting" | "timed" | "unspecified"; minutes?: number; original: string };
};
export type SourceLocation = { line?: number; page?: number; description?: string; box?: { x0: number; y0: number; x1: number; y1: number } };
export const documentLabels: Record<DocumentType, string> = {
  unknown: "ধরন অজানা · Other or unknown",
  anc: "সম্পূর্ণ গর্ভকালীন রিপোর্ট · Complete ANC report", laboratory: "পরীক্ষার রিপোর্ট · Laboratory report",
  ultrasound: "আল্ট্রাসাউন্ড · Ultrasound", clinical_note: "চিকিৎসার নোট · Clinical note",
  vital_sign: "প্রেসার বা পরিমাপ · Vital sign", observation: "নিজের তথ্য · Observation",
};
export const sectionLabels: Record<ReportSection, string> = {
  patient: "A. পরিচয় ও রিপোর্ট · Patient Identification", dating: "B. গর্ভকাল ও তারিখ · Pregnancy Dating",
  history: "C. আগের গর্ভধারণের তথ্য · Previous pregnancies", vitals: "D. মায়ের পরিমাপ ও পরীক্ষা · Vitals & Examination",
  laboratory: "E. পরীক্ষার ফল · Laboratory Results", ultrasound: "F. আল্ট্রাসাউন্ড · Ultrasound",
  supplements: "G. টিকা ও সাপ্লিমেন্ট · Immunization & Supplements", risk: "H. রিপোর্টে লেখা ঝুঁকির মূল্যায়ন · Documented Risk Assessment",
  carePlan: "I. রিপোর্টে লেখা পরিকল্পনা · Care Plan", provider: "J. প্রদানকারীর বিবরণ · Provider Verification",
};
/** Descriptor keys are checked against the actual section interfaces. No generic catch-all medical fields. */
type Keys<S extends ReportSection> = Exclude<keyof NonNullable<AntenatalSections[S]>, "fieldIds" | "calculation" | "authenticity">;
type Descriptors = { [S in ReportSection]: readonly { key: Keys<S>; label: string; date?: boolean }[] };
export const sectionFields = {
  patient: [
    { key: "name", label: "নাম · Patient name" }, { key: "age", label: "বয়স, যদি জানা থাকে · Age" }, { key: "dateOfBirth", label: "জন্মতারিখ · Date of birth", date: true },
    { key: "patientId", label: "রোগী আইডি · Patient ID" }, { key: "ancVisitId", label: "ANC ভিজিট আইডি · Visit ID" }, { key: "facility", label: "হাসপাতাল বা ল্যাব · Facility" },
    { key: "reportDate", label: "রিপোর্টের তারিখ · Report date", date: true }, { key: "visitDate", label: "ভিজিটের তারিখ · Visit date", date: true }, { key: "providerDetails", label: "রিপোর্টে লেখা প্রদানকারীর তথ্য · Provider details" },
  ],
  dating: [
    { key: "lmp", label: "শেষ মাসিকের প্রথম দিন · LMP", date: true }, { key: "edd", label: "রিপোর্টে লেখা সম্ভাব্য প্রসবের তারিখ · EDD", date: true },
    { key: "gestationalAge", label: "রিপোর্টে লেখা গর্ভকাল · Gestational age" }, { key: "gestationalAgeSource", label: "গর্ভকালের উৎস · Dating source" },
    { key: "scanDate", label: "স্ক্যানের তারিখ · Scan date", date: true }, { key: "ultrasoundDating", label: "স্ক্যানে লেখা গর্ভকাল · Ultrasound dating" }, { key: "eddConfirmationSource", label: "EDD নিশ্চিতকরণের উৎস · Confirmation source" }, { key: "notes", label: "তারিখের নোট · Dating notes" },
  ],
  history: [
    { key: "originalNotation", label: "মূল G/P/A/L লেখা · Original notation" }, { key: "gravida", label: "মোট গর্ভধারণ · Gravida" }, { key: "para", label: "আগের প্রসব · Para" },
    { key: "abortionsOrLosses", label: "যেভাবে নথিভুক্ত আছে গর্ভপাত বা ক্ষতির ইতিহাস · Loss history" }, { key: "livingChildren", label: "জীবিত সন্তান · Living children" },
    { key: "previousDeliveries", label: "আগের প্রসবের বিবরণ · Previous deliveries" }, { key: "previousComplications", label: "আগের সমস্যার বিবরণ · Previous complications" },
    { key: "chronicConditions", label: "দীর্ঘমেয়াদি অসুস্থতার নথি · Chronic conditions" }, { key: "allergies", label: "অ্যালার্জির নথি · Allergies" }, { key: "currentMedicines", label: "বর্তমান ওষুধ, যেমন লেখা আছে · Current medicines" },
  ],
  vitals: [{ key: "notes", label: "অন্যান্য পরীক্ষার নোট · Examination notes" }],
  laboratory: [{ key: "notes", label: "ল্যাবের নোট · Laboratory notes" }],
  ultrasound: [
    { key: "scanDate", label: "স্ক্যানের তারিখ · Scan date", date: true }, { key: "gestationalAgeAtScan", label: "স্ক্যানে লেখা গর্ভকাল · Gestational age at scan" }, { key: "numberOfFetuses", label: "রিপোর্টে লেখা ভ্রূণের সংখ্যা · Number of fetuses" },
    { key: "heartbeatFindings", label: "রিপোর্টে লেখা হৃদস্পন্দনের বিবরণ · Heartbeat findings" }, { key: "placentalLocation", label: "প্লাসেন্টার অবস্থান · Placental location" },
    { key: "amnioticFluid", label: "রিপোর্টে লেখা পানির বিবরণ · Amniotic fluid" }, { key: "estimatedFetalWeight", label: "রিপোর্টে লেখা আনুমানিক ওজন ও একক · Estimated fetal weight" },
    { key: "presentation", label: "রিপোর্টে লেখা অবস্থান · Presentation" }, { key: "otherFindings", label: "অন্যান্য লেখা ফলাফল · Other findings" }, { key: "notes", label: "স্ক্যানের নোট · Notes" },
  ],
  supplements: [
    { key: "tetanusHistory", label: "টিটেনাসযুক্ত টিকার ইতিহাস · Tetanus-containing vaccine history" }, { key: "vaccineDates", label: "নথিভুক্ত টিকার তারিখ · Vaccine dates" },
    { key: "ironFolicAcid", label: "রিপোর্টে লেখা আয়রন-ফলিক অ্যাসিড · Iron-folic acid" }, { key: "calcium", label: "রিপোর্টে লেখা ক্যালসিয়াম · Calcium" }, { key: "otherSupplements", label: "অন্যান্য সাপ্লিমেন্ট · Other supplements" },
    { key: "documentedDose", label: "নথিভুক্ত মাত্রা · Documented dose" }, { key: "documentedFrequency", label: "নথিভুক্ত সময়সূচি · Frequency" }, { key: "documentedStatus", label: "নথিভুক্ত অবস্থা · Status" },
  ],
  risk: [
    { key: "classification", label: "হুবহু নথিভুক্ত ঝুঁকির শ্রেণি · Classification as documented" }, { key: "documentedReason", label: "নথিভুক্ত কারণ · Documented reason" }, { key: "assessingProvider", label: "মূল্যায়নকারীর নাম, যদি লেখা থাকে · Assessing provider" },
    { key: "assessmentDate", label: "মূল্যায়নের তারিখ · Assessment date", date: true }, { key: "dangerSignsDiscussed", label: "বিপদের লক্ষণ নিয়ে আলোচনার নথি · Danger signs discussed" },
  ],
  carePlan: [
    { key: "followUp", label: "পরের ভিজিটের নথি · Follow-up appointment" }, { key: "referral", label: "রেফারালের নথি · Referral" }, { key: "documentedRecommendations", label: "চিকিৎসকের লিখিত পরামর্শ · Documented recommendations" }, { key: "notes", label: "পরিকল্পনার নোট · Care plan notes" }, { key: "deliveryPlanning", label: "প্রসব পরিকল্পনার নথি · Delivery planning" },
  ],
  provider: [
    { key: "name", label: "প্রদানকারীর নাম · Provider name" }, { key: "designation", label: "পদবি · Designation" }, { key: "facility", label: "প্রতিষ্ঠান · Facility" }, { key: "date", label: "তারিখ · Date", date: true }, { key: "signatureOrStamp", label: "স্বাক্ষর বা সিল আছে বলে নথি · Signature/stamp presence" },
  ],
} as const satisfies Descriptors;
export function datum(value: string, source: Datum["source"] = "self_reported"): Datum {
  return { value, original: value, presence: value.trim() ? "provided" : "not_provided", source, reviewStatus: "pending" };
}
export function readDatum(sections: AntenatalSections, section: ReportSection, key: string): Datum | undefined {
  const value = (sections[section] as Record<string, unknown> | undefined)?.[key];
  return typeof value === "object" && value !== null && "presence" in value ? value as Datum : undefined;
}
export function setDatum(sections: AntenatalSections, section: ReportSection, key: string, value: Datum): AntenatalSections {
  if (!sectionFields[section].some((field) => field.key === key)) return sections;
  return { ...sections, [section]: { ...sections[section], ...(section === "provider" ? { authenticity: "document_claim_only" as const } : {}), [key]: value } };
}
