/**
 * Easy Read registry: human-written, human-reviewed alternatives to existing PROHOR text.
 * Nothing here is generated at runtime, and nothing is shown unless a real person approved it.
 * Clinical advice, medicines, doses, emergency instructions, report values and AI answers are never added here.
 * No runtime imports (see easy-read.test.mjs).
 */
export type EasyReadStatus = "draft" | "review" | "approved" | "retired";
type EasyReadText = { title: string; sentences: string[]; nextAction?: string };

export type EasyReadEntry = {
  id: string;
  module: "adapt" | "barta" | "shonket" | "jibonrekha" | "bujhi" | "shusthota" | "poth" | "bondhon";
  route: string;
  /** Where the original text lives, so a reviewer can compare the two. */
  original: string;
  status: EasyReadStatus;
  /** Name/role of the Easy Read reviewer. Must be a real review; never filled in to make an entry show. */
  reviewedBy?: string;
  /** ISO date of that review. */
  reviewedAt?: string;
  en: EasyReadText;
  bn: EasyReadText;
};

/**
 * Drafts are written by the team from existing approved interface copy and wait for review by an Easy Read
 * reviewer together with a person with intellectual disability (runbook §6). None has been reviewed yet.
 */
export const EASY_READ_ENTRIES: EasyReadEntry[] = [
  {
    id: "adapt-settings-intro",
    module: "adapt",
    route: "/accessibility",
    original: "src/i18n/translations.ts › adapt.intro",
    status: "draft",
    en: {
      title: "Change how PROHOR looks",
      sentences: ["You can change how PROHOR looks.", "You can make the words bigger.", "You can still use every part of PROHOR."],
      nextAction: "Choose a setting below.",
    },
    bn: {
      title: "প্রহর দেখতে কেমন হবে",
      sentences: ["আপনি প্রহরের চেহারা বদলাতে পারেন।", "আপনি লেখা বড় করতে পারেন।", "আপনি প্রহরের সব অংশ ব্যবহার করতে পারবেন।"],
      nextAction: "নিচ থেকে একটি সেটিং বাছুন।",
    },
  },
];

const words = (text: string) => text.trim().split(/\s+/u).filter(Boolean).length;

/** Runbook §6 template: title ≤ 5 words; 3–5 sentences of ≤ 12 words each. Returns the broken rules. */
export function easyReadProblems(entry: EasyReadEntry): string[] {
  const problems: string[] = [];
  for (const lang of ["en", "bn"] as const) {
    const text = entry[lang];
    if (!text?.title?.trim() || words(text.title) > 5) problems.push(`${lang}: title must be 1–5 words`);
    if (!Array.isArray(text?.sentences) || text.sentences.length < 3 || text.sentences.length > 5) problems.push(`${lang}: needs 3–5 sentences`);
    else text.sentences.forEach((sentence, i) => { if (!sentence.trim() || words(sentence) > 12) problems.push(`${lang}: sentence ${i + 1} must be 1–12 words`); });
  }
  if (entry.status === "approved" && (!entry.reviewedBy?.trim() || !/^\d{4}-\d{2}-\d{2}/u.test(entry.reviewedAt ?? ""))) {
    problems.push("approved entries need a real reviewer and review date");
  }
  return problems;
}

/** The only way the app reads Easy Read: approved, reviewed and well-formed, or nothing. */
export function approvedEasyRead(id: string, entries: EasyReadEntry[] = EASY_READ_ENTRIES): EasyReadEntry | undefined {
  const entry = entries.find(item => item.id === id);
  return entry && entry.status === "approved" && easyReadProblems(entry).length === 0 ? entry : undefined;
}

/** True when at least one approved entry exists, so the setting is never shown as an empty promise. */
export function hasApprovedEasyRead(entries: EasyReadEntry[] = EASY_READ_ENTRIES): boolean {
  return entries.some(entry => approvedEasyRead(entry.id, entries));
}
