import type { BartaAnswer } from "@/lib/contracts/barta";

export const bartaSmallTalk = [
  {
    pattern: /^(?:(?:hello|hi|hey|good morning|good afternoon|good evening|ass?ala?mu alaikum|ass?ala?mualaikum|as salamu alaykum|walaikum assalam|salam|nomoskar|আসসালামু আলাইকুম|আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ|ওয়ালাইকুম আসসালাম|সালাম|নমস্কার|হ্যালো|হাই|সুপ্রভাত|শুভ সকাল|শুভ সন্ধ্যা))$/u,
    en: "Hello. I’m Barta. You can ask me about pregnancy, getting ready for birth, your recovery, or caring for your baby.",
    bn: "স্বাগতম। আমি বার্তা। গর্ভাবস্থা, প্রসবের প্রস্তুতি, সুস্থ হয়ে ওঠা বা শিশুর যত্ন নিয়ে আমাকে প্রশ্ন করতে পারেন।",
  },
  {
    pattern: /^(?:(?:tumi|apni|তুমি|আপনি) )?(?:how are you|how are you doing|how are u|how r u|what's up|(?:kemon|kmn|kmon) (?:aso|acho|achen|asen)|কেমন আছো|কেমন আছেন)$/u,
    en: "Thanks for asking. I’m here to help. What would you like to talk about today?",
    bn: "জিজ্ঞেস করার জন্য ধন্যবাদ। আমি সাহায্য করতে প্রস্তুত। আজ কী নিয়ে কথা বলতে চান?",
  },
  {
    pattern: /^(?:thanks|thank you|thanks a lot|thank you so much|thank you very much|thx|dhonnobad|dhonyobad|onek dhonnobad|ধন্যবাদ|অনেক ধন্যবাদ|অসংখ্য ধন্যবাদ)$/u,
    en: "You’re welcome. Ask a follow-up whenever you’re ready.",
    bn: "স্বাগতম। আরও কিছু জানতে চাইলে আবার প্রশ্ন করুন।",
  },
  {
    pattern: /^(?:bye|goodbye|good bye|bye bye|see you|see you later|see you soon|take care|good night|nite|allah hafez|allah hafiz|biday|pore kotha hobe|আল্লাহ হাফেজ|আল্লাহ হাফিজ|বিদায়|পরে কথা হবে|ভালো থাকবেন|শুভরাত্রি|শুভ রাত্রি)$/u,
    en: "Take care. You can come back whenever you have another question.",
    bn: "ভালো থাকবেন। নতুন কোনো প্রশ্ন থাকলে আবার আসতে পারেন।",
  },
  {
    pattern: /^(?:sorry|excuse me|my mistake|sori|maf korben|দুঃখিত|মাফ করবেন|ক্ষমা করবেন)$/u,
    en: "That’s okay. Take your time and ask whenever you’re ready.",
    bn: "কোনো সমস্যা নেই। সময় নিয়ে যখন ইচ্ছা প্রশ্ন করুন।",
  },
  {
    pattern: /^(?:ok|okay|got it|i understand|i got it|acha|accha|bujhlam|thik ache|ঠিক আছে|আচ্ছা|বুঝলাম)$/u,
    en: "Okay. Is there anything you’d like me to explain further?",
    bn: "ঠিক আছে। কোনো বিষয় আরও সহজ করে জানতে চাইলে বলুন।",
  },
  {
    pattern: /^(?:who are you|what is your name|what's your name|what can you do|what can i ask|how can you help|help me get started|can you help me|i am new here|i'm new here|tumi ke|tomar nam ki|ki jiggesh korte pari|তুমি কে|আপনি কে|আপনার নাম কী|কী প্রশ্ন করতে পারি|আপনি কীভাবে সাহায্য করেন|আমি নতুন)$/u,
    en: "I’m Barta. I can explain pregnancy visits, birth preparation, recovery, feeding, and everyday newborn care. I can also help you prepare questions to take to your next check-up. Which topic should we start with?",
    bn: "আমি বার্তা। গর্ভকালীন চেকআপ, প্রসবের প্রস্তুতি, সুস্থ হয়ে ওঠা, শিশুকে খাওয়ানো ও প্রতিদিনের নবজাতক যত্ন বুঝিয়ে বলতে পারি। পরের চেকআপে কী প্রশ্ন করবেন, সেটিও গুছিয়ে নিতে সাহায্য করতে পারি। কোন বিষয় দিয়ে শুরু করবেন?",
  },
  {
    pattern: /^(?:can you set (?:a )?reminders?|can you remind me|do you send reminders|tumi ki reminder dite paro|আপনি কি রিমাইন্ডার দিতে পারেন|আমাকে কি মনে করিয়ে দিতে পারবেন)$/u,
    en: "You can set an alert in your phone calendar or reminders app. I can help you make a checklist of what to bring and ask at a check-up.",
    bn: "ফোনের ক্যালেন্ডার বা রিমাইন্ডার অ্যাপে মনে করিয়ে দেওয়ার সময় ঠিক করতে পারেন। চেকআপে কী সঙ্গে নেবেন ও কী প্রশ্ন করবেন, তার তালিকা গুছিয়ে নিতে আমি সাহায্য করতে পারি।",
  },
] as const;

export function getBartaQuickReply(question: string, language: "en" | "bn"): BartaAnswer | undefined {
  const normalized = question.normalize("NFKC").toLowerCase().replace(/’/gu, "'")
    .replace(/[^\p{L}\p{M}\s']/gu, " ").trim().replace(/\s+/gu, " ")
    .replace(/^(?:barta|prohor|বার্তা|প্রহর)\s+/u, "").replace(/\s+(?:barta|prohor|বার্তা|প্রহর)$/u, "");
  const match = bartaSmallTalk.find(({ pattern }) => pattern.test(normalized));
  return match ? { status: "conversation", answer: null, citations: [], message: match[language] } : undefined;
}
