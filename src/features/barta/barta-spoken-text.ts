import type { BartaAnswer } from "@/lib/contracts/barta";
import { educationTopicIds, educationTopics } from "./education-topics";

type Language = "bn" | "en";

export const maxSpeechText = 4000;

const labels = {
  en: { sources: "Reviewed sources.", choices: "You can choose:", page: "Page", next: "Suggested follow-up:" },
  bn: { sources: "যাচাই করা সূত্র।", choices: "আপনি বেছে নিতে পারেন:", page: "পৃষ্ঠা", next: "পরের প্রশ্ন:" },
};

const spokenInitials = {
  ANC: { bn: "এ এন সি", en: "A N C" },
  PNC: { bn: "পি এন সি", en: "P N C" },
  WHO: { bn: "বিশ্ব স্বাস্থ্য সংস্থা", en: "W H O" },
  DGHS: { bn: "স্বাস্থ্য অধিদপ্তর", en: "D G H S" },
};

export function prepareSpeechText(text: string, language: Language): string {
  const expanded = text.replace(/\b(?:ANC|PNC|WHO|DGHS)\b/gu, (initials) => (
    spokenInitials[initials as keyof typeof spokenInitials][language]
  ));
  return expanded.replace(/。|।/gu, ".").replace(/([^.!?\s])\n+/gu, "$1.\n\n");
}

export function buildBartaSpeechText(answer: BartaAnswer, language: Language): string {
  const label = labels[language];
  if (answer.status === "grounded") {
    const sources = answer.citations.map((citation) => [
      citation.publisher, citation.title, citation.publicationYear, citation.locator,
      citation.page ? `${label.page} ${citation.page}` : undefined,
    ].filter(Boolean).join(". "));
    const details = [label.sources, ...sources, answer.followUp ? `${label.next} ${answer.followUp}` : ""]
      .filter(Boolean).join("\n\n");
    const complete = `${answer.answer}\n\n${details}`;
    return complete.length <= maxSpeechText ? complete : answer.answer;
  }
  if (answer.status === "clarification" && answer.suggestions.length) {
    return `${answer.message}\n${label.choices}\n${answer.suggestions.join("\n")}`;
  }
  return answer.message;
}

export function getBartaSpokenGuide(language: Language): string {
  const guide = language === "bn"
    ? "প্রহরের বার্তায় স্বাগতম। উত্তরের ভাষা বেছে নিন। লিখে প্রশ্ন করুন, অথবা কথা বলে প্রশ্ন করতে প্রশ্নের ঘরে কথার ভাষা বেছে নিয়ে মাইক্রোফোন চালু করুন। কথার লেখা দেখে তারপর প্রশ্ন পাঠান। স্পিকার চালু করলে পাঠানো প্রশ্ন ও নতুন উত্তর স্বয়ংক্রিয়ভাবে শুনতে পারবেন। সূত্র দেখতে সূত্রের বিস্তারিত খুলুন। উত্তরের ভাষা বদলালেও আগের কথা থাকবে। কথোপকথন মুছুন বোতামে চাপলে এই ট্যাবের কথাগুলো মুছে যাবে। বার্তা সাধারণ তথ্য দেয়। নিজের চিকিৎসার জন্য স্বাস্থ্যকর্মীর সঙ্গে কথা বলুন। এই বিষয়গুলো নিয়ে শুরু করতে পারেন।"
    : "Welcome to PROHOR’s Barta. Choose the answer language. Type a question, or choose a speech language and use the microphone in the question box. Check the transcript before sending. Turn on the speaker to hear submitted questions and new replies automatically. Open Citation details to see the full source. Changing answer language keeps your conversation. Clear conversation removes the messages from this tab. Barta provides general information. Ask a health professional about your own care. Here are topics you can start with.";
  return [guide, ...educationTopicIds.map((topic) => educationTopics[topic][language])].join("\n");
}
