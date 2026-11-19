export type Coverage =
  | { type: "route"; route: "crisis_support" | "safeguarding_support" | "mental_health_support" }
  | { type: "reply"; id: string; en: string; bn: string; topics?: boolean };

const shorthand: Record<string, string> = {
  u: "you", ur: "your", r: "are", pls: "please", plz: "please",
  thx: "thanks", tq: "thanks", wat: "what", hw: "how",
  gm: "good morning", gn: "good night", idk: "i dont know",
};

function normalizeConversation(text: string): string {
  return text.normalize("NFKC").toLowerCase().replace(/['‘’`]/gu, "")
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/(\p{L})\1{2,}/gu, "$1$1")
    .replace(/\b(?:u|ur|r|pls|plz|thx|tq|wat|hw|gm|gn|idk)\b/gu, (word) => shorthand[word])
    .replace(/\s+/gu, " ").trim();
}

const wholeMessage = (...patterns: string[]) => new RegExp(`^(?:${patterns.join("|").normalize("NFKC")})$`, "u");

// Match disclosures, rather than the names of topics someone may ask about.
const crisis = /\b(?:i (?:want to (?:kill myself|end my life|die)|wish i (?:was|were) dead|am better off dead|dont want to be alive)|(?:everyone|they|my family) (?:would be|is) better off without me|(?:amar |ami )?(?:more|morte) (?:jete )?ichch?[eh] (?:kore|korche)|(?:amar |ami )?bachte ichch?[eh] korche na)\b|(?:আত্মহত্যা করতে চাই|আমি (?:মরতে চাই|বাঁচতে চাই না)|মরতে ইচ্ছে করে|বাঁচতে ইচ্ছে করে না)/u;
const unsafe = /\b(?:my (?:husband|partner|boyfriend|in laws?) (?:has )?(?:beats?|hits?|slaps?|threatens?|abuses?|tortures?|forced|raped) me|i (?:am scared of my (?:husband|partner)|was (?:raped|sexually assaulted))|(?:amar )?(?:shami|swami) (?:amake )?(?:mare|marpit kore))\b|(?:(?:আমার )?স্বামী (?:আমাকে )?(?:মারে|পেটায়|মারধর করে)|আমাকে (?:মারধর|ধর্ষণ|নির্যাতন) করেছে)/u;
const heavy = wholeMessage(
  "(?:im|i am|i feel|feeling) (?:really |so |very )?(?:depressed|hopeless|worthless)",
  "i (?:cant stop crying|cant cope|hate myself|hate my life|feel empty)",
  "(?:ami )?(?:khub )?hatash", "(?:আমি )?(?:খুব )?হতাশ",
  "কিছুই ভালো লাগে না", "kichui (?:valo|bhalo) lage na",
);
const worry = wholeMessage(
  "(?:(?:im|i am|i feel|feeling) )?(?:(?:getting|feeling|so|very|really|a bit|a little|too|kinda|kind of|pretty) )*(?:worried|scared|afraid|anxious|nervous|stressed|tense|upset|sad|lonely|alone|tired|exhausted|overwhelmed|confused|lost|frightened|panicking|crying)",
  "i (?:cant|cannot) sleep", "i feel anxious and worried", "আমার ভয় ও দুশ্চিন্তা লাগছে",
  "(?:(?:amar|amr|ami) )?(?:(?:khub|onek|ektu) )?(?:bhoy|voy|tension|chinta|mon kharap|bhalo lagche na|valo lagche na|ekla|kanna)(?: lagche| lagtese| hocche| hochhe| pacchi)?",
  "(?:আমার |আমি )?(?:খুব |অনেক |একটু )?(?:ভয়|ভয়|চিন্তা|টেনশন|মন খারাপ|ভালো লাগছে না|একা|কান্না|দুশ্চিন্তা)(?: লাগছে| হচ্ছে| পাচ্ছি| করছি)?",
);
const contactDetails = /(?<!\d)(?:\+?880[\s.-]*|0)1[3-9](?:[\s.-]*\d){8}(?!\d)|[\w.+-]+@[\w-]+(?:\.[\w-]+)+/u;
const contactReply: Coverage = {
  type: "reply",
  id: "pii",
  en: "Please send your question again without the phone number or email address. Barta doesn’t need your contact details.",
  bn: "ফোন নম্বর বা ইমেইল বাদ দিয়ে প্রশ্নটি আবার পাঠান। বার্তার আপনার যোগাযোগের তথ্য প্রয়োজন নেই।",
};

type ReplyRule = { id: string; pattern: RegExp; en: string; bn: string; topics?: boolean; contextual?: boolean };

const replies: ReplyRule[] = [
  { id: "worry", pattern: worry,
    en: "I’m glad you told me. What are you worried about? A short phrase is enough. You can tell me how you’re feeling or pick a topic.",
    bn: "আমাকে বলার জন্য ধন্যবাদ। কী নিয়ে চিন্তা হচ্ছে? কয়েকটি শব্দেই বলতে পারেন, অথবা একটি বিষয় বেছে নিন।", topics: true },
  { id: "need_help", pattern: wholeMessage("(?:i )?(?:need|want) (?:some )?help(?: now| please)?", "(?:please )?help me", "(?:somebody|someone) help", "help", "sahajjo (?:chai|lagbe)", "(?:আমাকে )?সাহায্য(?: চাই| করুন| লাগবে| দরকার)?"),
    en: "I’m here. Tell me what’s happening, or choose a topic. If it’s urgent, such as heavy bleeding, a seizure or feeling unsafe, get emergency help now. I can’t call anyone for you.",
    bn: "আমি আছি। কী হচ্ছে বলুন, বা একটি বিষয় বেছে নিন। রক্তপাত বেশি, খিঁচুনি বা নিরাপদ না মনে হলে এখনই জরুরি সাহায্য নিন। আমি কাউকে ফোন করতে পারি না।", topics: true },
  { id: "cannot_act", pattern: wholeMessage("(?:can you )?(?:call|book|schedule|find|send|message) (?:me )?(?:an? |the |my )?(?:ambulance|doctor|hospital|appointment|midwife|clinic)(?: for me)?", "ambulance (?:dorkar|lagbe|chai)", "(?:nearest|nearby) (?:hospital|clinic|doctor)", "(?:hospital|clinic) (?:kothay|near me)", "হাসপাতাল কোথায়"),
    en: "I can’t call, book or search for places. For an emergency, contact emergency services or go to the nearest hospital. The Find Care (Poth) section can help you look at care places, but confirm with the place first.",
    bn: "আমি ফোন, বুকিং বা জায়গা খোঁজা করতে পারি না। জরুরি হলে জরুরি সেবায় যোগাযোগ করুন বা নিকটস্থ হাসপাতালে যান। ‘Find Care (পথ)’ অংশে সেবাকেন্দ্র দেখতে পারেন, তবে আগে নিশ্চিত হয়ে নিন।" },
  { id: "aac_care_request", pattern: wholeMessage("i need to see a doctor or midwife", "(?:please )?call my family", "আমার একজন ডাক্তার বা ধাত্রীর সঙ্গে দেখা করা দরকার", "(?:দয়া করে )?আমার পরিবারকে কল দিন"),
    en: "Use Find care on this page to look for a health facility. To reach family, use your phone’s calling app.",
    bn: "স্বাস্থ্যকেন্দ্র খুঁজতে এই পাতার ‘সেবা খুঁজুন’ লিংক ব্যবহার করুন। পরিবারের সঙ্গে যোগাযোগ করতে ফোন থেকে কল করুন।" },
  { id: "aac_everyday_request", pattern: wholeMessage("please bring me some water", "i need to rest", "আমাকে একটু পানি দিন", "আমার বিশ্রাম নেওয়া প্রয়োজন"),
    en: "You can show your message to someone nearby. Is there anything about your care you’d like to ask?",
    bn: "কাছের কাউকে আপনার বার্তাটি দেখাতে পারেন। নিজের যত্ন নিয়ে কিছু জানতে চান?" },
  { id: "symptom_context", pattern: wholeMessage(
    "i have (?:pain|a headache|a fever|swelling)", "i feel (?:dizzy|nauseous|uncomfortable|weak and tired)",
    "আমার (?:ব্যথা হচ্ছে|মাথাব্যথা করছে|মাথা ঘুরছে|জ্বর এসেছে|বমি বমি ভাব হচ্ছে|ফোলা ভাব আছে|খুব দুর্বল ও ক্লান্ত লাগছে|অস্বস্তি লাগছে)",
  ),
    en: "When did this start? Are you asking about pregnancy, recovery after birth, or something else? A short answer is enough. For advice about a symptom you have, contact your care team.",
    bn: "এটা কখন শুরু হয়েছে? গর্ভাবস্থা, প্রসবের পরের সময়, নাকি অন্য কিছু নিয়ে জানতে চাচ্ছেন? কয়েকটি শব্দেই বলতে পারেন। নিজের লক্ষণ নিয়ে পরামর্শের জন্য সেবাদানকারী দলের সঙ্গে কথা বলুন।" },
  { id: "cannot_decide", pattern: wholeMessage("(?:should i|do i need to) (?:go|see|visit) (?:to )?(?:the |a )?(?:hospital|doctor)(?: now)?", "(?:is|are) (?:this|it|these) (?:normal|ok|okay|serious|an emergency|dangerous)", "(?:will|is) (?:my )?baby (?:be )?(?:ok|okay|fine|healthy)", "what (?:should|do) i do", "ami ki korbo", "ki korbo", "কী করব|কি করব"),
    en: "I can’t decide that for you. If you’re worried about yourself or your baby, please contact a doctor, midwife or health worker. If it feels like an emergency, go to the nearest hospital now.",
    bn: "এটা আমি আপনার হয়ে ঠিক করতে পারি না। নিজের বা শিশুর জন্য চিন্তা হলে ডাক্তার, মিডওয়াইফ বা স্বাস্থ্যকর্মীর সঙ্গে যোগাযোগ করুন। জরুরি মনে হলে এখনই নিকটস্থ হাসপাতালে যান।" },
  { id: "cannot_prescribe", pattern: wholeMessage("(?:give|suggest|recommend|prescribe) (?:me )?(?:some |a |any )?(?:medicine|tablet|pill|antibiotic|painkiller)s?", "(?:which|what) (?:medicine|tablet|pill|antibiotic)s?", "(?:ki|kon) (?:oshudh|osudh|medicine|tablet) khabo", "ওষুধ (?:দিন|দাও|বলুন)"),
    en: "I can’t prescribe or recommend medicines. Please ask a doctor, midwife or pharmacist.",
    bn: "আমি ওষুধ দিতে বা সুপারিশ করতে পারি না। ডাক্তার, মিডওয়াইফ বা ফার্মাসিস্টকে জিজ্ঞেস করুন।" },
  { id: "id_doctor", pattern: wholeMessage("are you (?:a |an )?(?:real )?(?:doctor|nurse|midwife)", "apni ki (?:doctor|daktar)", "আপনি কি ডাক্তার"),
    en: "No, I’m not a doctor, nurse or midwife, and I can’t diagnose. I share general information from reviewed sources.",
    bn: "না, আমি ডাক্তার, নার্স বা মিডওয়াইফ নই, রোগ নির্ণয়ও করতে পারি না। যাচাই করা সূত্র থেকে সাধারণ তথ্য দিই।" },
  { id: "id_bot", pattern: wholeMessage("are you (?:a |an )?(?:real |human |person )?(?:robot|bot|chatbot|ai|human|person|real|machine)(?: or (?:a )?(?:human|robot|bot|ai|person))?", "(?:am i|is this) (?:talking|chatting) (?:to|with) (?:a |an )?(?:real |human |person |robot |bot |ai )+", "(?:are you|r you) chatgpt", "apni ki (?:robot|manush|bot)", "আপনি কি (?:রোবট|মানুষ|বট)"),
    en: "I’m Barta, an AI assistant, not a person. I share general information from PROHOR’s reviewed sources about pregnancy, birth, recovery and baby care.",
    bn: "আমি বার্তা, একটি এআই সহকারী, মানুষ নই। গর্ভাবস্থা, প্রসব, সুস্থ হয়ে ওঠা ও শিশুর যত্ন নিয়ে PROHOR-এর যাচাই করা সূত্র থেকে সাধারণ তথ্য দিই।" },
  { id: "id_personal", pattern: wholeMessage("how old are you", "where (?:are you from|do you live)", "are you (?:a )?(?:boy|girl|male|female|married|single|alive|sad|happy|tired|hungry)", "do you (?:have|feel|sleep|eat|love|like|get)(?: \\w+)?", "what(?:s| is) your (?:age|gender|religion|favou?rite \\w+|name)", "tomar boyosh koto", "তোমার বয়স"),
    en: "I’m an AI assistant, so I don’t have an age, family or personal life. I’m here for questions about pregnancy, birth, recovery and baby care.",
    bn: "আমি একটি এআই সহকারী, তাই আমার বয়স, পরিবার বা ব্যক্তিগত জীবন নেই। গর্ভাবস্থা, প্রসব, সুস্থ হয়ে ওঠা ও শিশুর যত্ন নিয়ে প্রশ্নে সাহায্য করতে এখানে আছি।" },
  { id: "trust_sources", pattern: wholeMessage("(?:can|should) i (?:trust|believe) you", "are your answers (?:accurate|correct|reliable|safe)", "(?:where|how) do you (?:get|know) (?:your )?(?:information|info|answers)", "(?:what|which) (?:are )?(?:your )?sources", "how do you work", "who (?:made|built|created) you", "তথ্য কোথা থেকে পাও"),
    en: "Educational answers list the reviewed sources they use. I can still make mistakes or miss details, and I can’t replace a doctor or midwife. If my sources don’t cover something, I’ll say so.",
    bn: "শিক্ষামূলক উত্তরে ব্যবহৃত যাচাই করা সূত্রগুলো দেখানো হয়। তবু আমার ভুল হতে পারে বা কিছু বাদ পড়তে পারে, আর আমি ডাক্তার বা মিডওয়াইফের জায়গা নিতে পারি না। সূত্রে না থাকলে সেটাই জানিয়ে দিই।" },
  { id: "privacy", pattern: wholeMessage("is (?:this|my chat|my data|it) (?:private|safe|secure|saved|stored|recorded)", "do you (?:save|store|record|keep|remember|share) (?:my |our )?(?:chat|data|messages?|voice|information|conversation)", "who can see (?:my|this)(?: chat| messages?| data)?", "amar kotha ki save"),
    en: "Barta shows this conversation on the current page. Some questions may be sent to a service that helps match reviewed sources. Leave out names, contact details and reports. Use Clear conversation to clear the chat from this page.",
    bn: "বার্তা এই পাতায় কথোপকথন দেখায়। যাচাই করা সূত্রের সঙ্গে মেলাতে কিছু প্রশ্ন অন্য একটি সেবায় পাঠানো হতে পারে। নাম, যোগাযোগের তথ্য ও রিপোর্ট বাদ দিন। এই পাতা থেকে চ্যাট সরাতে কথোপকথন মুছুন চাপুন।" },
  { id: "about", pattern: wholeMessage("what(?:s| is) (?:prohor|this(?: app| site| website)?)", "what does barta mean", "tell me about (?:prohor|this app)", "prohor ki", "প্রহর কী|এটা কী অ্যাপ"),
    en: "PROHOR is an educational prototype for accessible mother-and-baby care in Bangladesh. I’m Barta (বার্তা, “message”), its question helper.",
    bn: "PROHOR বাংলাদেশে মা ও শিশুর সহজগম্য যত্নের একটি শিক্ষামূলক প্রোটোটাইপ। আমি বার্তা, এর প্রশ্নোত্তর সহকারী।" },
  { id: "language", pattern: wholeMessage("(?:do you )?(?:speak|know|understand) (?:bangla|bengali|english)", "(?:reply|answer|speak|talk|write) in (?:bangla|bengali|english)", "(?:bangla|english|bengali)(?:te| e)? (?:bolo|bolun|likho)", "বাংলায়|ইংরেজিতে", "change language"),
    en: "I can answer in Bangla and English. Use the Answer language menu under the question box to switch.",
    bn: "আমি বাংলা ও ইংরেজিতে উত্তর দিতে পারি। বদলাতে প্রশ্নের ঘরের নিচের ‘Answer language’ মেনু ব্যবহার করুন।" },
  { id: "how_to", pattern: wholeMessage("(?:what|how) can (?:i|you) (?:ask|do|help)(?: with| about| (?:for|with) (?:me|you)| (?:me|you))?", "what (?:topics|questions)(?: can you (?:answer|cover))?", "how (?:do i|to) (?:use|start)(?: this| you| barta)?", "(?:show|give) (?:me )?(?:some )?(?:examples?|topics|menu|options|ideas)", "menu|options|examples?|topics", "i (?:have|want to ask) a question", "can i ask (?:you )?(?:a question|something)", "amar ekta proshno ache", "আমার একটি প্রশ্ন আছে|একটা প্রশ্ন করতে পারি", "i dont (?:know|have) (?:what|anything) to ask", "where (?:do i|to) start", "ki jiggesh korte pari", "kivabe use korbo", "কী জিজ্ঞেস করতে পারি|কীভাবে ব্যবহার"),
    en: "You can type a question, tap a topic, or use the microphone. For example:",
    bn: "লিখে প্রশ্ন করতে পারেন, কোনো বিষয়ে চাপ দিতে পারেন বা মাইক্রোফোন ব্যবহার করতে পারেন। যেমন:", topics: true },
  { id: "voice", pattern: wholeMessage("(?:can you |do you )?(?:read|speak|talk|say)(?: (?:it|this|that|aloud|out loud|to me))*", "read aloud", "voice(?: mode| input)?", "(?:mic|microphone|audio|sound|voice) (?:is )?(?:not working|broken)", "(?:i )?(?:cant|cannot) (?:hear|listen|speak)", "মাইক কাজ করছে না|শুনতে পাচ্ছি না"),
    en: "Use Read aloud on a reply to hear it, or start the microphone to dictate. If the microphone fails, check browser permissions or type instead. If playback fails, try Use browser voice when offered.",
    bn: "উত্তর শুনতে পড়ে শোনান চাপুন বা কথা বলে লিখতে মাইক্রোফোন চালু করুন। মাইক কাজ না করলে ব্রাউজারের অনুমতি দেখুন অথবা লিখুন। শব্দ শোনাতে সমস্যা হলে, অপশনটি দেখালে ব্রাউজারের কণ্ঠ ব্যবহার করুন।" },
  { id: "clear", pattern: wholeMessage("(?:clear|delete|reset|restart|start over|new chat)(?: (?:the |this |my )?(?:chat|conversation|messages?|history))?", "chat (?:muche|delete|clear)", "(?:মুছ|ক্লিয়ার)(?:তে চাই)?|নতুন করে শুরু"),
    en: "Choose “Clear conversation” under the question box to clear this chat from your screen.",
    bn: "প্রশ্নের ঘরের নিচের ‘Clear conversation’ বোতাম চাপলে এই চ্যাট স্ক্রিন থেকে মুছে যাবে।" },
  { id: "simplify", contextual: true, pattern: wholeMessage("what", "huh", "sorry", "pardon", "(?:i )?(?:didnt|dont|cant) (?:understand|get it|follow)", "(?:say|explain|repeat) (?:it |that )?(?:again|simply|slowly)?", "(?:can you )?(?:explain|repeat|simplify)(?: more| again| please)?", "(?:in )?(?:simple|easy|short) (?:words|terms|language)", "(?:more|continue|go on|tell me more|why|how|really|are you sure)", "abar bolo|aro bolo|bujhini|bujhi ni|sohoj kore bolo", "আবার বলো|আবার বলুন|বুঝিনি|বুঝতে পারিনি|সহজ করে বলুন|আরও বলুন"),
    en: "Which part would you like me to explain? Please ask the question again, or choose a topic.",
    bn: "কোন অংশ বুঝিয়ে বলব? প্রশ্নটি আবার করুন বা একটি বিষয় বেছে নিন।", topics: true },
  { id: "boundary", pattern: wholeMessage("(?:i )?love you(?: \\w+)?", "marry me", "be my (?:girlfriend|boyfriend|wife|husband)", "(?:send|show) (?:me )?(?:a )?(?:nudes?|pic|photo|selfie)", "(?:sex|porn|nude|nsfw|horny|sexy)(?: \\w+)?", "you(?:re| are) (?:so )?(?:hot|sexy|beautiful|cute)", "tomake bhalobashi", "তোমাকে ভালোবাসি|বিয়ে করবে"),
    en: "Thanks for reaching out. I’m here to talk about pregnancy, birth, recovery, and baby care. Is there a question I can help with?",
    bn: "কথা বলার জন্য ধন্যবাদ। গর্ভাবস্থা, প্রসব, সুস্থ হয়ে ওঠা ও শিশুর যত্ন নিয়ে কথা বলতে পারি। কোনো প্রশ্নে কি সাহায্য করতে পারি?" },
  { id: "rude", pattern: wholeMessage("(?:you(?:re| are) )?(?:so |very |really )?(?:stupid|dumb|useless|idiot|worthless|trash|garbage|rubbish|boring|pathetic|bad|worst|a waste)(?: bot| app| ai)?", "(?:you )?(?:dont|do not|never) (?:understand|help|know|answer|get it)(?: me| anything)?", "(?:wrong|nonsense|useless|bullshit|bs|shit|crap|wtf)(?: answer)?", "(?:shut up|go away|stop|fuck(?: you| off)?|(?:i )?hate (?:you|tou|yuo)|you suck|stfu)", "(?:tui|tumi|apni) (?:boka|gadha|pagol|faltu|bekar|harami)", "boka|bokachoda|gadha|faltu|bekar|harami", "tui kisui bujhos na|tumi kichui bujho na", "তুমি কিছুই বুঝো না|আমি তোমাকে পছন্দ করি না", "বোকা|গাধা|পাগল|ফালতু|বাজে|বেকার|হারামি|ভুল উত্তর|কিছুই বোঝো না|চুপ"),
    en: "I’m sorry I wasn’t helpful. I can only answer from my reviewed sources. Try asking in different words, or choose a topic below.",
    bn: "আমি কাজে আসতে পারিনি, দুঃখিত। আমি শুধু যাচাই করা সূত্র থেকে উত্তর দিতে পারি। অন্যভাবে প্রশ্ন করে দেখুন বা নিচ থেকে একটি বিষয় বেছে নিন।", topics: true },
  { id: "chat", pattern: wholeMessage("(?:im |i am )?(?:so |very )?(?:bored|lazy|free|hungry|sleepy|busy)", "(?:lets|can we|want to) (?:chat|talk|gossip)", "chat with me|talk to me", "be my friend|i need a friend", "(?:adda|gappo|golpo|kotha) (?:dibo|korbo|bolo|korun|bolun)", "(?:একটু )?(?:কথা|গল্প|আড্ডা) (?:বলি|বলো|বলুন|করি|করো|করুন)", "বোর|বন্ধু হও"),
    en: "Happy to chat. I’m best with pregnancy, birth, recovery and baby care questions. What’s on your mind?",
    bn: "কথা বলতে ভালো লাগবে। গর্ভাবস্থা, প্রসব, সুস্থ হয়ে ওঠা ও শিশুর যত্ন নিয়ে প্রশ্নে আমি সবচেয়ে ভালো সাহায্য করি। কী ভাবছেন?", topics: true },
  { id: "laugh", pattern: wholeMessage("(?:ha){2,}h?|(?:he){2,}h?|lol|lmao|rofl|hehe|haha+|😂|🤣", "funny|joke|tell me a joke|কৌতুক|মজা"),
    en: "😊 Nice to share a smile. Is there anything you’d like to ask?",
    bn: "😊 একটু হাসি ভালো লাগল। কিছু জানতে চাইলে বলুন।" },
  { id: "praise", pattern: wholeMessage("(?:you(?:re| are) )?(?:so |very )?(?:good|great|nice|smart|helpful|kind|sweet|amazing|awesome|best|wonderful|cool)(?: bot| app| job| work)?", "(?:good|great|nice|well done|excellent|perfect|awesome|cool|wow|amazing)(?: job| work| answer)?", "(?:👍|👌|🙏|❤️|😊|🙂)+", "darun|osadharon|valo|bhalo|sundor|chomotkar", "দারুণ|অসাধারণ|ভালো|সুন্দর|চমৎকার|শাবাশ"),
    en: "Thank you, that’s kind. Ask me anything else whenever you’re ready.",
    bn: "ধন্যবাদ। প্রস্তুত হলে আরেকটি প্রশ্ন করতে পারেন।" },
  { id: "yes_no", contextual: true, pattern: wholeMessage("yes|no|ok|okay|sure|fine|maybe|alright|haan|ha|hmm|hm|na|nai|jee|ji|hya|accha|achha|thik ache|ঠিক আছে|হ্যাঁ|হুম|না|জি|আচ্ছা"),
    en: "Okay. What would you like to ask? You can type a question or choose a topic.",
    bn: "ঠিক আছে। কী জানতে চান? লিখে প্রশ্ন করুন বা একটি বিষয় বেছে নিন।", topics: true },
  { id: "empty", pattern: wholeMessage("\\?+|\\.+|!+|ki|kii|কী|কি|test|testing|asdf+|qwer\\w*|aaa+|\\d+"),
    en: "I didn’t catch that. What would you like to ask? You can type a question or choose a topic.",
    bn: "ঠিক বুঝতে পারিনি। কী জানতে চান? লিখে প্রশ্ন করুন বা একটি বিষয় বেছে নিন।", topics: true },
];
const leadingFiller = /^(?:(?:oh|ok|okay|so|well|hmm|um|hey|hi|hello|dear|please|apu|apa|bhai|vai|sir|madam|barta|বার্তা|আপু|ভাই) )+/u;
const trailingFiller = /(?: (?:please|apu|apa|bhai|vai|sir|madam|barta|bot|বার্তা|আপু|ভাই))+$/u;

export function getBartaCoverage(question: string, { hasPreviousAnswer = false } = {}): Coverage | undefined {
  const raw = question.normalize("NFKC").trim();
  const normalized = normalizeConversation(raw);
  if (crisis.test(normalized)) return { type: "route", route: "crisis_support" };
  if (unsafe.test(normalized)) return { type: "route", route: "safeguarding_support" };
  if (heavy.test(normalized)) return { type: "route", route: "mental_health_support" };
  const contactText = raw.replace(/[০-৯]/gu, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit)));
  if (contactDetails.test(contactText)) return contactReply;

  const withoutFiller = normalized.replace(leadingFiller, "").replace(trailingFiller, "").trim();
  const match = replies.find(({ pattern, contextual }) => !(hasPreviousAnswer && contextual)
    && (pattern.test(withoutFiller) || pattern.test(normalized) || pattern.test(raw.toLowerCase())));
  if (!match) return undefined;
  const { id, en, bn, topics } = match;
  return { type: "reply", id, en, bn, topics };
}
