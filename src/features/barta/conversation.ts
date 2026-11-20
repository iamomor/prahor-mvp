import { getBartaQuickReply } from "./chat-small-talk";
import { bartaAnswerSchema, type BartaAnswer, type BartaRequest } from "@/lib/contracts/barta";

const greetings = new Set([
  "hi", "hello", "hey", "good morning", "good evening", "hiya", "hey barta", "hello barta", "হ্যালো বার্তা",
  "assalamu alaikum", "assalamualaikum", "salam",
  "হ্যালো", "হাই", "সালাম", "আসসালামু আলাইকুম",
]);

const greetingReply = {
  en: "Hello! I’m Barta. I can help with general maternal-health information. Choose a suggested topic or ask a question.",
  bn: "স্বাগতম! আমি বার্তা। মাতৃস্বাস্থ্য নিয়ে সাধারণ তথ্য দিতে পারি। তালিকা থেকে একটি বিষয় বেছে নিন, অথবা আপনার প্রশ্ন লিখুন।",
};

const checkIn = new Set([
  "how are you", "how r u", "how are you doing", "how're you", "how are u",
  "kemon aso", "kemon acho", "kemon asen", "kemon achen", "কেমন আছো", "কেমন আছেন",
]);
const goodbye = new Set(["bye", "goodbye", "see you", "allah hafez", "আল্লাহ হাফেজ", "বিদায়"]);
const textOnly = new Set(["i cannot use voice please help me through text", "ami voice use korte pari na likhe help korun", "আমি ভয়েস ব্যবহার করতে পারি না লিখে সাহায্য করুন"]);
const thanks = new Set(["thanks", "thank you", "thanks barta", "ধন্যবাদ", "dhonnobad"]);
const help = new Set([
  "help", "who are you", "what can you do", "what can i ask", "তুমি কে", "আপনি কে",
  "কী জিজ্ঞেস করতে পারি", "কি জিজ্ঞেস করতে পারি", "ki jiggesh korte pari", "tumi ke",
]);
const voiceHelp = new Set([
  "how do i use the microphone", "how do i use voice input", "how do i read aloud",
  "মাইক্রোফোন কীভাবে ব্যবহার করব", "কথা বলে কীভাবে প্রশ্ন করব", "কীভাবে পড়ে শোনাবে",
  "mic kivabe use korbo", "mic kivabe chalabo",
]);

export function getBartaGreeting(question: string, language: BartaRequest["language"], hasPreviousAnswer = false): BartaAnswer | undefined {
  const withoutGreeting = stripOpeningGreeting(question);
  const quickReply = getBartaQuickReply(question, language, hasPreviousAnswer)
    ?? (withoutGreeting !== question ? getBartaQuickReply(withoutGreeting, language, hasPreviousAnswer) : undefined);
  if (quickReply) return quickReply;
  const text = question.normalize("NFKC").toLowerCase().trim()
    .replace(/[!.?।]+$/u, "").trim().replace(/\s+/gu, " ");
  const simple = text.replace(/[,،;]+/gu, "").replace(/\s+/gu, " ");
  const checkInText = simple.replace(/^(?:tumi|apni|তুমি|আপনি)\s+/u, "")
    .replace(/^(?:kmn|kmon)\b/u, "kemon");
  const affection = /^(?:(?:prohor|barta|প্রহর|বার্তা)[,، ]+)?(?:i love (?:you|u)|love (?:you|u)|ভালোবাসি|তোমাকে ভালোবাসি|ami tomake bhalobashi)(?:[,، ]+(?:prohor|barta|প্রহর|বার্তা))?$/iu;
  const message = voiceHelp.has(simple) ? {
    en: "Choose a speech language in the question box and start the microphone. Review the draft before sending. Turn on Speaker to hear questions and replies.",
    bn: "প্রশ্নের ঘরে কথার ভাষা বেছে নিয়ে মাইক্রোফোন চালু করুন। পাঠানোর আগে লেখাটি দেখে নিন। প্রশ্ন ও উত্তর শুনতে স্পিকার চালু করুন।",
  }[language] : affection.test(text) ? {
    en: "That’s kind of you. I’m glad you’re here. We can keep talking whenever you’re ready.",
    bn: "এত সুন্দর কথা বলার জন্য ধন্যবাদ। আপনি চাইলে আমরা কথা চালিয়ে যেতে পারি।",
  }[language] : checkIn.has(checkInText) ? {
    en: "Thanks for asking. I’m here if you have a question or want to continue where we left off.",
    bn: "জিজ্ঞেস করার জন্য ধন্যবাদ। নতুন প্রশ্ন করতে পারেন, অথবা আগের কথায় ফিরে যেতে পারেন।",
  }[language] : goodbye.has(text) ? {
    en: "Take care. You can come back to your questions any time while this tab is open.",
    bn: "ভালো থাকবেন। এই ট্যাব খোলা থাকলে আগের কথায় ফিরে আসতে পারবেন।",
  }[language] : textOnly.has(simple) ? {
    en: "Of course. You can type your questions, and every reply will appear as text.",
    bn: "অবশ্যই। আপনি লিখে প্রশ্ন করতে পারেন। সব উত্তর লেখায় দেখা যাবে।",
  }[language] : greetings.has(text) ? greetingReply[language]
    : thanks.has(text) ? {
      en: "You’re welcome. Ask another question whenever you’re ready.",
      bn: "আপনাকেও ধন্যবাদ। চাইলে আরেকটি প্রশ্ন করতে পারেন।",
    }[language] : help.has(text) ? greetingReply[language] : undefined;
  if (!message) return undefined;

  return bartaAnswerSchema.parse({
    status: "conversation",
    answer: null,
    citations: [],
    message,
  });
}

export function stripOpeningGreeting(question: string): string {
  const text = question.trim();
  const opening = text.match(/^([^,،\n]{1,35})[,،\n]\s*([\s\S]+)$/u);
  const prefix = opening?.[1].normalize("NFKC").toLowerCase().trim().replace(/\s+/gu, " ");
  if (opening && prefix && greetings.has(prefix)) return opening[2];

  const informal = text.match(/^(?:hi+|he+y+|hell?o+|heya|hiya|hlo|hlw|howdy|good (?:morning|afternoon|evening|day)|yo+|হ্যালো|হাই|সালাম|নমস্কার|আদাব|assalamu alaikum|আসসালামু আলাইকুম)(?:\s+(?:barta|prohor|বার্তা|প্রহর))?[\s,،!.?।:]+(\S[\s\S]*)$/iu);
  return informal?.[1] ?? question;
}
