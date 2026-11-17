import "server-only";
import { bartaEducationCorpus } from "./education-corpus";
import type { BartaCorpus } from "./approved-knowledge";

const ancSourceId = "b1826b55-6646-495c-bd98-7852311f67d0";
const ancVersion = "WHO/RHR/16.12";
const checkedAt = "2026-11-16T12:57:58.000Z";
const ancPassage = {
  sourceId: ancSourceId,
  sourceVersion: ancVersion,
  locator: "Overview",
  topic: "anc",
  stage: "pregnancy",
  audience: "mother",
  translationGroup: "616de971-1b33-44eb-bf9f-e0de6678f3ae",
  reviewStatus: "approved",
  reviewBasis: "project_reference_check",
  reviewedByUserId: null,
  reviewedAt: checkedAt,
  reuseBasis: "Independently worded factual terminology with attribution and a link to the WHO reference.",
} as const;

// The project source check and scope are recorded in docs/PROHOR-Barta-ANC-Review.md.
export const approvedBartaCorpus: BartaCorpus = {
  sources: bartaEducationCorpus.sources,
  passages: [
    {
      ...ancPassage,
      chunkId: "efdc34fe-36c4-464a-8339-11ce87cc65ba",
      language: "en",
      questions: [
        "What does ANC mean?", "What is antenatal care?", "What does ANC stand for?",
        "What is ANC?", "ANC meaning", "Meaning of antenatal care",
        "Could you explain the meaning of the term ANC?", "Could you explain what ANC means?",
        "What does ANC mean in pregnancy?", "What does the term ANC mean?",
        "In maternal care what is the expansion of ANC?", "What is the full form of ANC?",
      ],
      text: "ANC stands for antenatal care. It means health care during pregnancy.",
    },
    {
      ...ancPassage,
      chunkId: "9c36a68c-6209-4d12-aa41-6d7aad42d4a7",
      language: "bn",
      questions: [
        "ANC বলতে কী বোঝায়?", "গর্ভকালীন সেবা কী?", "ANC কী?", "ANC মানে কী?",
        "ANC এর পূর্ণরূপ কী?", "ANC mane ki?", "gorbokalin sheba ki?",
      ],
      text: "ANC-এর পূর্ণরূপ antenatal care। এর অর্থ গর্ভাবস্থায় নেওয়া স্বাস্থ্যসেবা।",
    },
    ...bartaEducationCorpus.passages,
  ],
};
