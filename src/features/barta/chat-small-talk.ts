import type { BartaAnswer } from "@/lib/contracts/barta";

export const bartaSmallTalk = [
  {
    pattern: /^(?:(?:hi+|he+y+|hell?o+|heya|hiya|hlo|hlw|yo+|sup)(?: there| everyone| bro| sis)?(?: (?:hi+|he+y+|hello+))*|good morning|good afternoon|good evening|good day|howdy|ass?ala?mu alaikum|ass?ala?mualaikum|assalamu alaykum|as salamu alaykum|wa ?alaikum assalam|salaam|salam|nomoskar|namaskar|শুভ দুপুর|আদাব|আসসালামু আলাইকুম|আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ|ওয়ালাইকুম আসসালাম|সালাম|নমস্কার|হ্যালো|হাই|সুপ্রভাত|শুভ সকাল|শুভ সন্ধ্যা)$/u,
    en: "Hello. I’m Barta. You can ask me about pregnancy, getting ready for birth, your recovery, or caring for your baby.",
    bn: "স্বাগতম। আমি বার্তা। গর্ভাবস্থা, প্রসবের প্রস্তুতি, সুস্থ হয়ে ওঠা বা শিশুর যত্ন নিয়ে আমাকে প্রশ্ন করতে পারেন।",
  },
  {
    pattern: /^(?:(?:tumi|apni|তুমি|আপনি) )?(?:how are you|how are you doing|how are u|how r u|how's it going|how you doing|hru|what'?s up|wassup|wazzup|whats good|what'?s new|how have you been|how is your day|how has your day been|you good|shob thik|sob thik|সব ঠিক আছে তো|(?:kemon|kmn|kmon) (?:aso|acho|achen|asen)|ki obostha|ki khobor|কেমন আছো|কেমন আছেন|কি খবর|কী খবর|কী অবস্থা)$/u,
    en: "Thanks for asking. I’m here to help. What would you like to talk about today?",
    bn: "জিজ্ঞেস করার জন্য ধন্যবাদ। আমি সাহায্য করতে প্রস্তুত। আজ কী নিয়ে কথা বলতে চান?",
  },
  {
    pattern: /^(?:thanks|thank you|thanks a lot|thank you so much|thank you very much|thanks so much|thx|tnx|ty|tysm|cheers|dhonnobad|dhonyobad|dhonnobad apnake|onek dhonnobad|ধন্যবাদ|অনেক ধন্যবাদ|অসংখ্য ধন্যবাদ)$/u,
    en: "You’re welcome. Ask a follow-up whenever you’re ready.",
    bn: "স্বাগতম। আরও কিছু জানতে চাইলে আবার প্রশ্ন করুন।",
  },
  {
    pattern: /^(?:bye+|goodbye|good bye|bye bye|bye for now|see you|see you later|see you soon|see ya|talk to you later|catch you later|until next time|have a good day|have a nice day|im off|i'm off|cya|gtg|g2g|gotta go|ttyl|take care|good night|gn|nite|tata|ta ta|allah hafez|allah hafiz|khoda hafez|khoda hafiz|biday|ekhon jai|ami jai|pore kotha hobe|pore kotha bolbo|আল্লাহ হাফেজ|আল্লাহ হাফিজ|বিদায়|আবার কথা হবে|পরে কথা হবে|পরে কথা বলব|আজ এখানেই শেষ|ভালো থাকবেন|ভালো থেকো|আবার দেখা হবে|এখন যাই|শুভরাত্রি|শুভ রাত্রি)$/u,
    en: "Take care. You can come back whenever you have another question.",
    bn: "ভালো থাকবেন। নতুন কোনো প্রশ্ন থাকলে আবার আসতে পারেন।",
  },
  {
    pattern: /^(?:sorry|excuse me|my mistake|sori|maf korben|দুঃখিত|মাফ করবেন|ক্ষমা করবেন)$/u,
    en: "That’s okay. Take your time and ask whenever you’re ready.",
    bn: "কোনো সমস্যা নেই। সময় নিয়ে যখন ইচ্ছা প্রশ্ন করুন।",
  },
  {
    pattern: /^(?:ok+|okay+|okie|okey|k|kk|yep|yup|yeah|yes|nah|nope|no|got it|i understand|i got it|noted|sure|alright|aight|acha|accha|bujhlam|thik ache|hmm+|হুম|হ্যাঁ|না|ঠিক আছে|আচ্ছা|বুঝলাম)$/u,
    contextual: true,
    en: "Okay. Is there anything you’d like me to explain further?",
    bn: "ঠিক আছে। কোনো বিষয় আরও সহজ করে জানতে চাইলে বলুন।",
  },
  {
    pattern: /^(?:(?:i am|i'm|im|i feel|feeling) (?:(?:getting|feeling|so|really|very|a bit|a little|kinda|kind of|pretty) )*(?:worried|anxious|scared|nervous|stressed|overwhelmed|upset|sad|lonely|confused)|(?:worried|anxious|scared|nervous|so worried|i am not okay|i'm not ok|i don't feel okay|i dunno what to do|i don't know where to start|i feel like crying)|(?:(?:ami|amar|amr) )?(?:(?:khub|onek|ektu) )?(?:chinta hocche|chinta hochhe|chinta lagtese|chinta lagche|chintay achi|tension hocche|tension e achi|tension lagtese|voy lagche|bhoy lagche|voy lagtese|bhoy lagtese|mon kharap|bhalo lagche na|valo lagche na|bhalo nei|valo nei)|(?:আমার |আমি )?(?:(?:খুব|অনেক|একটু) )?(?:চিন্তা হচ্ছে|দুশ্চিন্তা হচ্ছে|দুশ্চিন্তায় আছি|ভয় লাগছে|ভয় লাগছে|ভালো লাগছে না|মন খারাপ|টেনশন হচ্ছে|টেনশনে আছি))$/u,
    en: "I’m glad you told me. What are you worried about? A short phrase is enough. You can start with how you’re feeling, pregnancy, birth, recovery, or caring for your baby.",
    bn: "আমাকে বলার জন্য ধন্যবাদ। কী নিয়ে চিন্তা হচ্ছে? কয়েকটি শব্দেই বলতে পারেন। নিজের অনুভূতি, গর্ভাবস্থা, প্রসব, প্রসবের পর সুস্থ হয়ে ওঠা বা শিশুর যত্ন দিয়ে শুরু করতে পারেন।",
  },
  {
    pattern: /^(?:(?:i am|i'm|im|i feel|feeling) (?:good|great|fine|okay|ok|happy|better|doing well)|(?:ami )?(?:bhalo achi|valo achi|bhalo asi|valo asi|alhamdulillah)|(?:আমি )?(?:ভালো আছি|ভাল আছি|আলহামদুলিল্লাহ))$/u,
    en: "Thanks for checking in. What would you like to talk about today?",
    bn: "জানানোর জন্য ধন্যবাদ। আজ কী নিয়ে কথা বলতে চান?",
  },
  {
    pattern: /^(?:lol+|lmao|rofl|haha+|hahaha+|hehe+|omg|oh my god|bruh|bro|sis|wow+|oof|oops|smh|wtf|damn|shit|fuck|fuck off|shut up|কি বলো|কী বলো|ওহ|হাহা|আরে)$/u,
    en: "What would you like to talk about? A short question or a few words is enough to get started.",
    bn: "কী নিয়ে কথা বলতে চান? ছোট একটি প্রশ্ন বা কয়েকটি শব্দ দিয়েই শুরু করতে পারেন।",
  },
  {
    pattern: /^(?:idk|dunno|i don't know|i dont know|i'm not sure|not sure|jani na|bujhte parchi na|জানি না|বুঝতে পারছি না|নিশ্চিত নই)$/u,
    en: "It’s okay to start with a few words. Tell me what’s on your mind, or pick a topic from Explore topics.",
    bn: "কয়েকটি শব্দ দিয়েই শুরু করতে পারেন। মনে কী আছে বলুন, অথবা বিষয়গুলোর তালিকা থেকে একটি বেছে নিন।",
  },
  {
    pattern: /^(?:brb|hold on|give me a minute|one sec|wait|ektu darao|ektu daran|একটু দাঁড়ান|একটু অপেক্ষা করুন)$/u,
    en: "Take your time. You can return to this conversation while the tab is open.",
    bn: "সময় নিয়ে লিখুন। এই ট্যাব খোলা থাকলে কথোপকথনে ফিরে আসতে পারবেন।",
  },
  {
    pattern: /^(?:say that again|repeat that|can you repeat that|what do you mean|i don't understand|i dont understand|can you explain more simply|explain in simple words|arekbar bolun|abar bolen|sohoj kore bolo|sohoj kore bolun|আবার বলুন|সহজ করে বলুন|বুঝতে পারিনি)$/u,
    contextual: true,
    en: "Which word or part would you like me to explain? You can paste it here or ask one short question about it.",
    bn: "কোন শব্দ বা অংশটি বুঝিয়ে বলতে চান? সেটি এখানে লিখতে পারেন, অথবা তা নিয়ে ছোট একটি প্রশ্ন করুন।",
  },
  {
    pattern: /^(?:are you real|are you human|are you a bot|are you ai|are you a doctor|are you a real person|tumi ki manush|apni ki doctor|তুমি কি মানুষ|আপনি কি মানুষ|আপনি কি ডাক্তার)$/u,
    en: "I’m Barta, an automated assistant for maternal-health education. I can help you find general information or prepare questions for a health professional.",
    bn: "আমি বার্তা, মাতৃস্বাস্থ্য শিক্ষা নিয়ে কাজ করা একটি ডিজিটাল সহকারী। সাধারণ তথ্য খুঁজতে বা স্বাস্থ্যকর্মীর জন্য প্রশ্ন গুছিয়ে নিতে সাহায্য করতে পারি।",
  },
  {
    pattern: /^(?:let'?s chat|can we talk|i just want to talk|can i talk to you|i am bored|i'm bored|just checking|are you free to talk|can we chat|just saying hi|testing|test|ektu kotha boli|kotha bolbo|একটু কথা বলি|কথা বলতে পারি)$/u,
    en: "Sure. What’s on your mind? You can start with a few words or pick something from Explore topics.",
    bn: "অবশ্যই। মনে কী আছে? কয়েকটি শব্দ দিয়ে শুরু করতে পারেন, অথবা তালিকা থেকে একটি বিষয় বেছে নিন।",
  },
  {
    pattern: /^(?:(?:can you|do you) (?:speak|understand|reply in|answer in) (?:bangla|bengali|english|banglish)|(?:bangla|english) te (?:bolun|bolo|answer din)|বাংলায় বলুন|বাংলায় বলুন|ইংরেজিতে বলুন|আপনি কি বাংলা বলতে পারেন)$/u,
    en: "You can type in Bangla, Banglish, or English. Use Answer language below the question box to choose Bangla or English for replies.",
    bn: "বাংলা, বাংলা উচ্চারণে ইংরেজি অক্ষর, বা ইংরেজিতে প্রশ্ন লিখতে পারেন। প্রশ্নের ঘরের নিচে উত্তরের ভাষা থেকে বাংলা বা ইংরেজি বেছে নিন।",
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

export function getBartaQuickReply(question: string, language: "en" | "bn", hasPreviousAnswer = false): BartaAnswer | undefined {
  const text = question.normalize("NFKC").trim()
    .replace(/^👋[\u{1F3FB}-\u{1F3FF}]?$/u, "hello")
    .replace(/^🙏[\u{1F3FB}-\u{1F3FF}]?$/u, "thanks")
    .replace(/^👍[\u{1F3FB}-\u{1F3FF}]?$/u, "okay")
    .replace(/^(?:😂|😄)+$/u, "haha");
  const normalized = text.toLowerCase().replace(/’/gu, "'")
    .replace(/[^\p{L}\p{M}\s']/gu, " ").trim().replace(/\s+/gu, " ")
    .replace(/^(?:barta|prohor|বার্তা|প্রহর)\s+/u, "").replace(/\s+(?:barta|prohor|বার্তা|প্রহর)$/u, "");
  const match = bartaSmallTalk.find((reply) =>
    (!hasPreviousAnswer || !("contextual" in reply)) && reply.pattern.test(normalized));
  return match ? { status: "conversation", answer: null, citations: [], message: match[language] } : undefined;
}
