type Provenance = { source: string; verification: string; source_note?: string | null };

export function accountSourceLabel(item: Provenance): string {
  if (item.source === "self_reported") return "আপনি লিখেছেন";
  if (item.source === "document_extracted") {
    if (item.verification !== "user_verified") return "রিপোর্ট থেকে · যাচাই বাকি";
    if (item.source_note === "Bujhi manual entry from report image; reviewed by mother")
      return "রিপোর্ট দেখে আপনি লিখেছেন · OCR পড়েনি · আপনি যাচাই করেছেন";
    if (item.source_note === "Bujhi local OCR; reviewed by mother")
      return "রিপোর্ট থেকে OCR পড়েছে · আপনি যাচাই করেছেন";
    return "রিপোর্ট থেকে · আপনি যাচাই করেছেন";
  }
  if (item.source === "clinician_confirmed" && item.verification === "clinician_confirmed") return "চিকিৎসক নিশ্চিত করেছেন";
  if (item.source === "clinician_entered") return "চিকিৎসক লিখেছেন · নিশ্চিতকরণ বাকি";
  return "উৎস যাচাই করুন";
}
