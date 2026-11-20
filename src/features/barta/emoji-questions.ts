import { AAC_CATALOG, generateNaturalPhrase } from "../adapt/lib/aac-phrases";
import type { BartaAnswer, BartaRequest } from "@/lib/contracts/barta";
import { educationTopics } from "./education-topics";

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const pictograph = /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3/u;
const emojiKey = (symbol: string) => symbol.replace(/[\uFE0E\uFE0F\p{Emoji_Modifier}]/gu, "");
const catalog = AAC_CATALOG.flatMap(({ items }) => items);
const greetings = new Set(["👋", "🙋", "🙋‍♀", "🙋‍♂"]);
const reactions = new Set(["👍", "👌", "❤", "😊", "🙂", "😄", "😂", "🤣", "🙌", "🎉", "👏", "✨", "💚"]);
const socialSuffix = /(?:\s*(?:👋|👍|👌|❤️?|😊|🙂|😄|😂|🤣|🙌|🎉|👏|✨|💚)[\uFE0F\p{Emoji_Modifier}]*)+$/u;

export function stripBartaSocialSuffix(question: string): string {
  return question.replace(socialSuffix, "").trim() || question;
}

export function getBartaEmojiReply(question: string, language: BartaRequest["language"]): BartaAnswer | undefined {
  const segments = [...segmenter.segment(question.trim())].map(({ segment }) => segment);
  const symbols = [...new Set(segments.filter((segment) => pictograph.test(segment)).map(emojiKey))];
  if (!symbols.length || segments.some((segment) => !pictograph.test(segment) && !/^[\s\p{P}]+$/u.test(segment))) {
    return undefined;
  }

  if (symbols.every((symbol) => greetings.has(symbol) || reactions.has(symbol))) {
    const greeting = symbols.some((symbol) => greetings.has(symbol));
    return {
      status: "conversation", answer: null, citations: [],
      message: language === "bn"
        ? (greeting ? "হ্যালো! আমি বার্তা। আজ কী জানতে চান?" : "ধন্যবাদ! আর কিছু জানতে চাইলে বলুন।")
        : (greeting ? "Hi, I’m Barta! What would you like to ask today?" : "Thanks! Let me know if you’d like to ask anything else."),
    };
  }

  const items = catalog.filter((item) => symbols.includes(emojiKey(item.emoji)));
  const urgent = items.some((item) => item.id === "urgent");
  // An urgent symbol can be a request for help, but a typed symbol alone is ambiguous.
  const ordered = urgent ? [...items.filter((item) => item.id === "urgent"), ...items.filter((item) => item.id !== "urgent")] : items;
  const choices = ordered.map((item) => generateNaturalPhrase([item], language));
  if (symbols.includes("👶")) choices.push(educationTopics.newborn[language]);
  if (symbols.includes("🙏")) choices.push(language === "bn" ? "ধন্যবাদ।" : "Thank you.");
  const suggestions = [...new Set(choices)].slice(0, 3);

  return {
    status: "clarification", answer: null, citations: [], suggestions,
    message: language === "bn"
      ? (urgent
        ? "এখনই জরুরি সাহায্যের প্রয়োজন হলে চ্যাট ছাড়াই সাহায্য নিন। অন্যথায় কী বোঝাতে চেয়েছেন বলুন, অথবা নিচের একটি বাক্য বেছে নিন।"
        : suggestions.length
          ? "ইমোজি দিয়ে কী বোঝাতে চেয়েছেন? নিচের একটি বাক্য বেছে নিয়ে দেখে পাঠাতে পারেন, অথবা নিজের ভাষায় বলুন।"
          : "ইমোজি দিয়ে কী বোঝাতে চেয়েছেন? কয়েকটি শব্দে লিখুন অথবা ছবি ও লেখা ব্যবহার করে বার্তা তৈরি করুন।")
      : (urgent
        ? "If you need urgent help now, use Help without chat. Otherwise, tell me what you meant or choose a phrase below."
        : suggestions.length
          ? "What did you mean by the emoji? Choose a phrase below to review before sending, or tell me in your own words."
          : "What did you mean by the emoji? Type a few words or use Picture-and-text communication to build a message."),
  };
}
