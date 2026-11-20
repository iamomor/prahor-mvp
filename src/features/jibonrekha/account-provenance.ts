type Provenance = { source: string; verification: string; source_note?: string | null };

export function accountSourceLabel(item: Provenance, bangla = true): string {
  const L = (en: string, bn: string) => bangla ? bn : en;
  if (item.source === "self_reported") return L("Self-reported", "আপনি লিখেছেন");
  if (item.source === "document_extracted") {
    if (item.verification !== "user_verified") return L("From report · review pending", "রিপোর্ট থেকে · যাচাই বাকি");
    if (item.source_note === "Bujhi manual entry from report image; reviewed by mother")
      return L("Entered after reading report · no OCR · user reviewed", "রিপোর্ট দেখে আপনি লিখেছেন · OCR পড়েনি · আপনি যাচাই করেছেন");
    if (item.source_note === "Bujhi local OCR; reviewed by mother")
      return L("OCR from report · user reviewed", "রিপোর্ট থেকে OCR পড়েছে · আপনি যাচাই করেছেন");
    return L("From report · user reviewed", "রিপোর্ট থেকে · আপনি যাচাই করেছেন");
  }
  if (item.source === "clinician_confirmed" && item.verification === "clinician_confirmed") return L("Clinician confirmed", "চিকিৎসক নিশ্চিত করেছেন");
  if (item.source === "clinician_entered") return L("Clinician entered · confirmation pending", "চিকিৎসক লিখেছেন · নিশ্চিতকরণ বাকি");
  return L("Check the source", "উৎস যাচাই করুন");
}
