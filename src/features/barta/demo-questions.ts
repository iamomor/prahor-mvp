export const bartaDemoQuestions = {
  form: {
    en: "What is on the sample visit form?",
    bn: "নমুনা ফর্মে কী আছে?",
  },
  notes: {
    en: "Does the sample form have a notes section?",
    bn: "নমুনা ফর্মে নোট লেখার জায়গা আছে কি?",
  },
  access: {
    en: "Where can I note my access needs on the sample form?",
    bn: "নমুনা ফর্মে আমার কী ধরনের সহায়তা দরকার, তা কোথায় লিখব?",
  },
} as const;

export function getBartaDemoLanguage(question: string): "bn" | "en" {
  return /[\u0980-\u09ff]/u.test(question) ? "bn" : "en";
}
