import type { EducationTopic } from "./education-topics";

/**
 * Meaning layer for Barta: maps everyday Bangla, Banglish and English wording to reviewed topics,
 * recognises short social messages, and answers bare stage replies ("pore", "pregnancy", "baby").
 * It never produces health claims: it only picks reviewed topics to offer, or fixed conversation text.
 * Patterns are compiled after NFKC so they match input normalised the same way (see the NFKC finding).
 * Bangla wording is draft until native-speaker review.
 */
type Language = "bn" | "en";
const rx = (latin: string, bangla = "") =>
  new RegExp(`(?:\\b(?:${latin})\\b)${bangla ? `|(?:${bangla})` : ""}`.normalize("NFKC"), "u");

export function normalizeBartaText(text: string): string {
  return text.normalize("NFKC").toLowerCase().replace(/['‘’`]/gu, "")
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ").replace(/(\p{L})\1{2,}/gu, "$1$1").replace(/\s+/gu, " ").trim();
}

const babyWords = rx("baby|babies|newborn|new born|infant|baccha|bacchar|bachcha|bacha|bacca|nobojatok|shishu|my son|my daughter", "বাচ্চা|শিশু|নবজাতক");
const pregnancyWords = rx("pregnan\\w*|gorbho\\w*|gorbha\\w*|gorbo\\w*|expecting", "গর্ভ");

type Concept = {
  id: string;
  pattern: RegExp;
  topics: EducationTopic[];
  babyTopics?: EducationTopic[];
  requires?: RegExp;
  /** Named when reviewed sources do not cover the subject itself. */
  missing?: Record<Language, string>;
};

// Order matters: specific concepts first, broad ones last.
const concepts: Concept[] = [
  { id: "wheelchair", pattern: rx("wheel ?chair|cannot walk|cant walk|hatte pari na", "হুইলচেয়ার|হাঁটতে পারি না"), topics: ["accessWheelchair", "accessVisit"] },
  { id: "hearing", pattern: rx("deaf|hard of hearing|cannot hear|cant hear|kane shuni na|kane kom shuni|sign language|ishara", "বধির|কানে শুনি না|কানে কম শুনি|ইশারা ভাষা"), topics: ["accessHearing", "accessCommunication"] },
  { id: "vision", pattern: rx("blind|low vision|cannot see|cant see|chokhe dekhi na|chokhe kom dekhi", "দৃষ্টিপ্রতিবন্ধী|অন্ধ|চোখে দেখি না|চোখে কম দেখি"), topics: ["accessVision", "accessEasyRead"] },
  { id: "disability", pattern: rx("disab\\w*|protibondh\\w*|special needs|accessib\\w*", "প্রতিবন্ধ|প্রবেশগম্য"), topics: ["accessVisit", "accessBirthPlan", "accessSupportPerson"] },
  { id: "supportPerson", pattern: rx("bring (?:someone|somebody|my (?:husband|mother|sister|family))|support person|companion|(?:with me|stay|be there|be present) during (?:delivery|labou?r|birth)|husband (?:stay|be there|come)|ke thakte|sathe ke|shathe ke", "সঙ্গে কে|সাথে কে"), topics: ["birthCompanion", "accessSupportPerson"] },
  { id: "ancCard", pattern: rx("anc card|antenatal card|pregnancy card|health card|maa card|ma card", "এএনসি কার্ড|গর্ভকালীন কার্ড|কার্ড"), topics: ["ancCard"] },
  { id: "pregnancyTest", pattern: rx("pregnancy test|preg(?:nancy)? kit|test kit|hcg", "প্রেগন্যান্সি টেস্ট|গর্ভধারণ পরীক্ষা"), topics: ["pregnancyTest"] },
  { id: "ultrasound", pattern: rx("ultra ?sound\\w*|ultra ?sono\\w*|usg|scan\\w*", "আল্ট্রা"), topics: ["ultrasound"] },
  { id: "sugar", pattern: rx("sugar|diabet\\w*|glucose|gtt|ogtt", "ডায়াবেটিস|সুগার|গ্লুকোজ"), topics: ["glucoseCheck"] },
  { id: "bloodPressure", pattern: rx("blood ?pressure|pressure|bp|pre ?eclampsia|eclampsia|preeclamsia", "প্রেশার|রক্তচাপ|এক্লাম্পসিয়া"), topics: ["bloodPressureCheck", "maternalHealth", "warningSigns"] },
  { id: "headache", pattern: rx("head ?ache|head hurts|headache\\w*|matha ?betha|matha ?byatha|matha ?bytha|migraine", "মাথাব্যথা|মাথা ব্যথা"), topics: ["warningSigns", "maternalHealth", "bloodPressureCheck"] },
  { id: "swelling", pattern: rx("swell\\w*|swollen|puffy|fula|fule|phule|fulay|fola", "ফুলে|ফোলা"), topics: ["warningSigns", "maternalHealth"], missing: { en: "swelling", bn: "শরীর ফুলে যাওয়া" } },
  { id: "danger", pattern: rx("danger\\w*|warning signs?|red flags?|bipod\\w*|serious symptoms?|emergency signs?", "বিপদ|সতর্ক সংকেত"), topics: ["warningSigns", "maternalHealth"], babyTopics: ["newborn", "postnatalVisits"] },
  { id: "movement", pattern: rx("kick\\w*|move|moves|moving|movement\\w*|nora|nore|norache|norchhe|norachora|narachara", "নড়|নড়া|নড়াচড়া"), topics: ["fetalMovement"] },
  { id: "stages", pattern: rx("trimester\\w*|stages? of pregnancy|month by month|week by week", "ত্রৈমাসিক"), topics: ["pregnancyBasics"] },
  { id: "dueDate", pattern: rx("due date|edd|delivery date|delivery kobe|kobe delivery", "প্রসবের তারিখ|সম্ভাব্য তারিখ"), topics: ["ultrasound", "firstCheckup", "pregnancyBasics"], missing: { en: "working out a due date", bn: "প্রসবের সম্ভাব্য তারিখ হিসাব করা" } },
  { id: "twins", pattern: rx("twins?|jomoj|jumoj", "যমজ"), topics: ["ancVisits", "ultrasound"], missing: { en: "twin pregnancy", bn: "যমজ সন্তান" } },
  { id: "sex", pattern: rx("sex|intercourse|sohobash|shohobash", "সহবাস|যৌন"), topics: ["ancVisits", "everydayWellbeing"], missing: { en: "sex during pregnancy", bn: "গর্ভাবস্থায় সহবাস" } },
  { id: "fasting", pattern: rx("fast|fasting|ramadan|ramzan|roja|roza|rojar|rozar", "রোজা|রমজান"), topics: ["balancedMeals", "ancVisits"], missing: { en: "fasting during pregnancy", bn: "গর্ভাবস্থায় রোজা রাখা" } },
  { id: "labour", pattern: rx("labou?r|c ?section|caesarean|cesarean|sizar\\w*|sizer\\w*|cesar|normal delivery|delivery pain|prosob bedona", "সিজার|প্রসব বেদনা|নরমাল ডেলিভারি"), topics: ["birthPlan", "birthCompanion", "postnatal"], missing: { en: "labour and caesarean birth", bn: "প্রসব বেদনা ও সিজারিয়ান প্রসব" } },
  { id: "familyPlanning", pattern: rx("family planning|contracep\\w*|birth control|jonmo ?niyontron\\w*|condoms?|iud", "জন্মনিয়ন্ত্রণ|পরিবার পরিকল্পনা"), topics: ["postnatalVisits", "postnatal"], missing: { en: "family-planning methods", bn: "পরিবার পরিকল্পনার পদ্ধতি" } },
  { id: "vaccine", pattern: rx("vaccin\\w*|immuni[sz]\\w*|tika|tikka|epi", "টিকা"), topics: ["postnatalVisits", "newborn"], missing: { en: "the vaccination schedule", bn: "টিকার সময়সূচি" } },
  { id: "jaundice", pattern: rx("jaundice|jondis|yellow (?:skin|eyes)|holud hoye", "জন্ডিস"), topics: ["newborn", "postnatalVisits"], missing: { en: "newborn jaundice", bn: "নবজাতকের জন্ডিস" } },
  { id: "coldCough", pattern: rx("cold|cough\\w*|flu|sordi|kashi|kasi", "সর্দি|কাশি"), topics: ["everydayWellbeing", "warningSigns"], missing: { en: "colds and coughs", bn: "সর্দি-কাশি" } },
  { id: "fever", pattern: rx("fever|jor|temperature", "জ্বর"), topics: ["warningSigns", "pregnancyBackache"], babyTopics: ["newborn", "babyCrying"], missing: { en: "fever", bn: "জ্বর" } },
  { id: "stomachPain", pattern: rx("stomach (?:pain|ache)|belly (?:pain|ache)|tummy|pet ?betha|pete ?betha|pet ?byatha|abdominal pain", "পেট ব্যথা|পেটে ব্যথা"), topics: ["warningSigns", "pregnancyConstipation", "pregnancyHeartburn"], missing: { en: "belly pain", bn: "পেট ব্যথা" } },
  { id: "backache", pattern: rx("back ?(?:pain|ache|hurts?)|backache|lower back|komor\\w*|kumor|pith ?e? ?betha|pithe ?betha", "কোমর|পিঠে ব্যথা|পিঠ ব্যথা"), topics: ["pregnancyBackache"] },
  { id: "nausea", pattern: rx("nause\\w*|vomit\\w*|morning sickness|sick in the morning|throw(?:ing)? up|bomi\\w*", "বমি"), topics: ["morningSickness"] },
  { id: "heartburn", pattern: rx("heart ?burn|acidity|acid reflux|reflux|gastric|gastrik|buk ?jol\\w*|buk ?jala|ombol", "বুক জ্বাল|অম্বল|গ্যাস্ট্রিক"), topics: ["pregnancyHeartburn"] },
  { id: "constipation", pattern: rx("constipat\\w*|paykhana|paikhana|pai khana|kosthokathinno|kosto kathinno|hard stool", "কোষ্ঠ|পায়খানা"), topics: ["pregnancyConstipation"] },
  { id: "tired", pattern: rx("tired|exhaust\\w*|fatigue\\w*|weak|weakness|klanto|durbol", "ক্লান্ত|দুর্বল"), topics: ["everydayWellbeing", "ironFolate", "pregnancySleep"] },
  { id: "iron", pattern: rx("iron|folic|folate|anaemi\\w*|anemi\\w*|roktoshunno\\w*|rokto ?shunnota|rokto ?kom|haemoglobin|hemoglobin|hb", "আয়রন|ফলিক|রক্তশূন্য|রক্তস্বল্প"), topics: ["ironFolate"] },
  { id: "foodSafety", pattern: rx("avoid|safe to eat|can i eat|khawa jabe|khaoa jabe|khete parbo|raw|kacha|papaya|pepe|coffee|caffeine|fish|mach|alcohol|tea", "কাঁচা|এড়িয়ে|খাওয়া যাবে|খেতে পারব|পেঁপে|কফি|মাছ"), topics: ["foodSafety", "balancedMeals"], babyTopics: ["solidFood", "breastfeeding"] },
  { id: "solidFood", pattern: rx("solids?|solid food|complementary|weaning|khichuri|suji|cerelac|baby food|barti khabar", "খিচুড়ি|বাড়তি খাবার|সুজি"), topics: ["solidFood"] },
  { id: "babyWater", pattern: rx("water|pani", "পানি"), requires: babyWords, topics: ["babyWater"] },
  { id: "feedingAtWork", pattern: rx("work|office|job|chakri", "অফিস|চাকরি|কাজে"), requires: rx("breast\\w*|dudh|feed\\w*|pump\\w*", "দুধ"), topics: ["feedingAtWork"] },
  { id: "breastfeeding", pattern: rx("breast ?feed\\w*|breast ?milk|nursing|latch\\w*|bukh?er dudh|buker dudh|dudh khawa\\w*|dudh|milk supply|not enough milk", "বুকের দুধ|দুধ"), topics: ["breastfeedingPosition", "breastfeeding", "feedingAtWork"] },
  { id: "food", pattern: rx("eat|eating|food|foods|diet|meals?|khabo|khabar|khawa|khaoa|khete|nutrition|pushti", "খাব|খাওয়া|খাবার|পুষ্টি"), topics: ["balancedMeals", "foodSafety", "nutrition"], babyTopics: ["solidFood", "breastfeeding"] },
  { id: "babySleepOrPregnancySleep", pattern: rx("sleep\\w*|insomnia|ghum\\w*|shoyabo|shoyano|rest", "ঘুম|শোয়াব|শোয়ানো|বিশ্রাম"), topics: ["pregnancySleep", "everydayWellbeing"], babyTopics: ["babySleep", "homeSafety"] },
  { id: "exercise", pattern: rx("exercis\\w*|workout|yoga|walk\\w*|hata|hanta|hatahati|byayam|beam", "ব্যায়াম|হাঁটা|হাঁটাহাঁটি"), topics: ["exercise", "everydayWellbeing"] },
  { id: "travel", pattern: rx("travel\\w*|journey|trip|bus|train|plane|fly|flying|flight|jatra|bhromon|seat ?belt|rickshaw", "ভ্রমণ|যাত্রা|বাসে|ট্রেন|সিটবেল্ট"), topics: ["pregnancyTravel"] },
  { id: "birthPlan", pattern: rx("birth plan|delivery plan|prepar\\w*|prostuti|pack\\w*|hospital bag|ki niye jabo|what to bring", "প্রস্তুতি|ব্যাগ|কী নিয়ে যাব"), topics: ["birthPlan", "birthCompanion"] },
  { id: "bath", pattern: rx("bath\\w*|bathe|gosol\\w*|shower", "গোসল|স্নান"), topics: ["babyBath", "babyHygiene"] },
  { id: "cord", pattern: rx("cord|umbilical|navel|belly button|nabhi\\w*|nabi", "নাভি"), topics: ["cordCare"] },
  { id: "diaper", pattern: rx("diapers?|nappy|nappies|nappy rash|diaper rash", "ডায়াপার"), topics: ["diaper"] },
  { id: "crying", pattern: rx("cry|cries|crying|kande|kandche|kandse|kanna|fussy|colic", "কাঁদ|কান্না"), requires: babyWords, topics: ["babyCrying", "babySleep"] },
  { id: "play", pattern: rx("play\\w*|khela|khelbo|toys?|talk to (?:my )?baby", "খেলা|খেলনা"), requires: babyWords, topics: ["babyPlay"] },
  { id: "homeSafety", pattern: rx("baby ?proof\\w*|home safe|safe home|smok\\w*|dhoa|dhoya|dhua|cigarette", "ধোঁয়া|ধূমপান"), topics: ["homeSafety"] },
  { id: "hygiene", pattern: rx("hygien\\w*|clean\\w*|porishkar|poriskar|wash\\w*", "পরিষ্কার|পরিচ্ছন্ন"), requires: babyWords, topics: ["babyHygiene", "babyBath"] },
  { id: "weight", pattern: rx("weight|ojon|wazan", "ওজন"), topics: ["ancVisits", "balancedMeals"], babyTopics: ["newborn", "postnatalVisits"], missing: { en: "weight-gain targets", bn: "ওজন বাড়ার লক্ষ্য" } },
  { id: "period", pattern: rx("periods?|menstrua\\w*|masik|mashik|cramps?", "মাসিক|ঋতুস্রাব"), topics: ["periodCare"] },
  { id: "mood", pattern: rx("mood|mon kharap|stress\\w*|emotion\\w*|feel(?:ing)? low|depress\\w*|anxi\\w*|mental", "মন খারাপ|মানসিক|দুশ্চিন্তা"), topics: ["mentalWellbeing", "everydayWellbeing"] },
  { id: "postnatal", pattern: rx("after (?:birth|delivery|giving birth|the baby|baby)|postnatal|postpartum|post partum|delivery ?r? (?:por|pore)|delivery er pore|recover\\w*", "প্রসবের পর|সন্তান জন্মের পর|প্রসব পরবর্তী|ডেলিভারির পর"), topics: ["postnatalVisits", "postnatal", "everydayWellbeing"] },
  { id: "checkup", pattern: rx("check ?ups?|anc|antenatal|prenatal|doctor visit|see (?:a |the )?doctor|daktar dekh\\w*|doctor dekh\\w*|visits?", "চেকআপ|চেক আপ|প্রসবপূর্ব"), topics: ["firstCheckup", "ancVisits", "anc"], babyTopics: ["postnatalVisits", "newborn"] },
  { id: "newborn", pattern: rx("newborn|new born|nobojatok|infant", "নবজাতক"), topics: ["newborn", "babyHygiene", "cordCare"] },
];

export type BartaConceptMatch = { topics: EducationTopic[]; missing?: Record<Language, string> };

/** Reviewed topics that fit the wording, best first; undefined when nothing fits. */
export function findBartaConcepts(question: string): BartaConceptMatch | undefined {
  const text = normalizeBartaText(question);
  if (!text) return undefined;
  const baby = babyWords.test(text) && !pregnancyWords.test(text);
  const hits = concepts.filter((concept) => concept.pattern.test(text) && (!concept.requires || concept.requires.test(text)));
  if (!hits.length) return undefined;
  const topics = [...new Set(hits.flatMap((hit) => (baby && hit.babyTopics) || hit.topics))];
  return { topics, missing: hits.find((hit) => hit.missing)?.missing };
}

type Reply = { id: string; en: string; bn: string; topics?: EducationTopic[] };
const whole = (latin: string, bangla = "") =>
  new RegExp(`^(?:${latin}${bangla ? `|${bangla}` : ""})$`.normalize("NFKC"), "u");

// Bare answers to "pregnancy, after birth or something else?" and short statements of where she is.
const stageReplies: { pattern: RegExp; reply: Reply }[] = [
  {
    pattern: whole("(?:i )?(?:think|might be|may be) (?:i am |im )?pregnant|pregnant (?:kina|ki na)|ami (?:ki )?pregnant (?:kina|ki na)", "আমি কি গর্ভবতী|গর্ভবতী কিনা"),
    reply: { id: "maybe_pregnant", topics: ["pregnancyTest", "firstCheckup"],
      en: "Are you asking how pregnancy can be confirmed? These questions may help:",
      bn: "গর্ভধারণ নিশ্চিত করা যায় কীভাবে, সেটা কি জানতে চান? এই প্রশ্নগুলো কাজে আসতে পারে:" },
  },
  {
    pattern: whole("(?:i am|im|i m) pregnant(?: now)?|ami (?:ekhon )?(?:pregnant|gorbhoboti|gorboboti)|(?:i am|im) expecting", "আমি (?:এখন )?গর্ভবতী"),
    reply: { id: "is_pregnant", topics: ["firstCheckup", "ironFolate", "foodSafety"],
      en: "Thank you for telling me. Many people start with these:",
      bn: "জানানোর জন্য ধন্যবাদ। শুরুতে অনেকে এগুলো জানতে চান:" },
  },
  {
    pattern: whole("(?:i )?(?:just |recently )?(?:had|gave birth to) (?:a |my )?(?:baby|son|daughter)|(?:i am|im) a new (?:mom|mother)|amar (?:baby|baccha|bachcha|sontan) hoyeche|ami notun ma", "আমার (?:বাচ্চা|সন্তান) হয়েছে|আমি নতুন মা|সদ্য মা হয়েছি"),
    reply: { id: "new_baby", topics: ["postnatalVisits", "newborn", "breastfeedingPosition"],
      en: "Thank you for telling me. In the first weeks, these are often useful:",
      bn: "জানানোর জন্য ধন্যবাদ। প্রথম কয়েক সপ্তাহে এগুলো অনেক সময় কাজে আসে:" },
  },
  {
    pattern: whole("pore|porer|porer ta|porer somoy|after|after (?:birth|delivery|giving birth|the baby|baby)|postnatal|postpartum|delivery ?r? (?:por|pore)|delivery er pore|baby (?:howar|hobar|hoar) pore|prosober pore", "প্রসবের পরে?|সন্তান জন্মের পরে?|ডেলিভারির পরে?|পরে|পরের|পরের সময়"),
    reply: { id: "stage_after", topics: ["postnatalVisits", "postnatal", "everydayWellbeing"],
      en: "Here is what I can explain about the time after birth. If something feels very wrong, such as heavy bleeding, a very bad headache or a fever, get medical help now.",
      bn: "প্রসবের পরের সময় নিয়ে এগুলো বুঝিয়ে বলতে পারি। খুব বেশি রক্তপাত, খুব বেশি মাথাব্যথা বা জ্বরের মতো খারাপ কিছু মনে হলে এখনই চিকিৎসা নিন।" },
  },
  {
    pattern: whole("pregnancy|during pregnancy|in pregnancy|while pregnant|pregnant obosthay|pregnancy te|pregnancy r somoy|gorbhaboshtay|gorbhabosthay|gorbhabostha|gorbhaboshta|gorbhokalin", "গর্ভাবস্থায়|গর্ভাবস্থা|গর্ভকালীন|গর্ভকালে|গর্ভাবস্থার সময়"),
    reply: { id: "stage_pregnancy", topics: ["ancVisits", "balancedMeals", "warningSigns"],
      en: "Here is what I can explain about pregnancy. Tell me a few words more if you have something specific in mind.",
      bn: "গর্ভাবস্থা নিয়ে এগুলো বুঝিয়ে বলতে পারি। নির্দিষ্ট কিছু জানতে চাইলে আরও কয়েকটি শব্দ লিখুন।" },
  },
  {
    pattern: whole("baby|newborn|infant|my baby|baccha|bacchar|bachcha|bacca|baby r|nobojatok|shishu", "শিশু|শিশুর|বাচ্চা|বাচ্চার|নবজাতক|নবজাতকের"),
    reply: { id: "stage_baby", topics: ["newborn", "breastfeedingPosition", "babySleep"],
      en: "Here is what I can explain about caring for a baby. Tell me the baby’s age or what you want to know.",
      bn: "শিশুর যত্ন নিয়ে এগুলো বুঝিয়ে বলতে পারি। শিশুর বয়স বা কী জানতে চান, লিখুন।" },
  },
  {
    pattern: whole("other|something else|anything else|onno kichu|onnokichu|onno ta", "অন্য কিছু|অন্যকিছু"),
    reply: { id: "stage_other", topics: ["anc", "postnatal", "newborn"],
      en: "Okay. Tell me in a few words what you want to know, or choose a topic.",
      bn: "ঠিক আছে। কী জানতে চান, কয়েকটি শব্দে লিখুন, অথবা একটি বিষয় বেছে নিন।" },
  },
];

const functionWords = rx("i|im|me|my|you|your|u|is|are|am|the|a|to|and|still|so|very|much|lot|a lot|too|really|this|that|it|bot|app|doing|tumi|apni|ami|amar|tomar|apnar|ki|re|go|ekhono|akhono|onek|khub|ar|tumio|apnio|now|ekhon|kotha|keu|thik|ache|ase|paccho|pachho|parcho|paren|pachen|khair|kheir", "আমি|আমার|তুমি|আপনি|তোমার|আপনার|কি|কী|এখনো|অনেক|খুব|কথা|কেউ|ঠিক|আছে");
const fillers = rx("apu|apa|bhai|vai|bhaiya|sir|madam|maam|barta|prohor|ji|jee|please|pls|plz|dear|ok|okay|accha|achha|thik ache|hmm|well|so", "আপু|ভাই|বার্তা|প্রহর|জি|আচ্ছা|ঠিক আছে");
const social = {
  goodbye: rx("bye+|bye bye|tata|ta ta|good ?night|gn|allah ?hafe[zj]|khoda ?hafe[zj]|see (?:you|ya)|cya|take care|later|valo theko|bhalo theko|valo thakben|bhalo thakben|valo thaken|shuvo ratri|subho ratri|jai|gelam|pore kotha (?:hobe|bolbo|boli|hbe)|ekhon jai", "বিদায়|আল্লাহ হাফেজ|খোদা হাফেজ|শুভ ?রাত্রি|ভালো থেকো|ভালো থাকবেন|পরে কথা|যাই|এখন যাই"),
  thanks: rx("thanks?|thank ?(?:you|u|q)|thnx|thx|tnx|tq|ty|tysm|dhonno?bad|dhonyobad|dhonnyobad|shukriya|jazakallah\\w*(?: khair)?", "ধন্যবাদ|শুকরিয়া"),
  checkIn: rx("(?:tumi|apni) (?:kemon|kmn)|how are (?:you|u)|how r u|how re you|hru|kemon (?:acho|aso|achen|asen|achis|aco)|kmn (?:acho|aso|achen)|ki khobor|ki obostha|whats up|wassup|sup", "কেমন আছ|কী খবর|কি খবর|কী অবস্থা|কি অবস্থা"),
  wellSelf: rx("(?:i am|im|i m) (?:fine|good|ok|okay|well|great)|(?:ami )?(?:bhalo|valo) (?:achi|asi)|alhamdulillah", "ভালো আছি|ভাল আছি|আলহামদুলিল্লাহ"),
  presence: rx("are you there|you there|anyone there|any one there|anybody there|are you listening|listening|can you hear me|do you hear me|hear me|kotha shun\\w*|shunte (?:paccho|pachho|parcho|pachen|paren)|shuncho|shunchen|shunteso|shuntecho|shunchis|keu (?:acho|ache|achen)|ache keu|acho|achen|asho|asen|aso|bujh?te(?:so|cho|chen)|bujhte (?:parcho|paren|parteso)", "শুনছ|শুনছেন|শুনতে পাচ্ছ|আছেন|আছো|কেউ আছে|বুঝতে পারছ|বুঝছেন"),
  greeting: rx("hi+|hello+|helo+|hlw|hlo|hey+|hiya|yo|sala+m|as+ala+m\\w*|w?a?l[ae]i?ku[mn]|wa|rahmatullah\\w*|wa ?barakatuh|nomo?s?h?kar|namaskar|good (?:morning|afternoon|evening|day)|shuvo (?:shokal|sokal|bikel|sondha|shondha|sondhya|dupur)|subho \\w+", "সালাম|আসসালামু|আলাইকুম|ওয়ালাইকুম|রহমাতুল্লাহ|নমস্কার|হ্যালো|হাই|শুভ সকাল|শুভ সন্ধ্যা|শুভ বিকেল|সুপ্রভাত"),
  abilities: rx("ki ki (?:paro|paren|parba|korte paro|korte paren)|what (?:else )?can you do|what do you do|how can you help", "কী কী পারেন|কি কি পারেন|কী করতে পারেন|কি করতে পারেন|কী কী পারো"),
  confused: rx("bujhi nai|bujhini|bujhlam na|bujhte parini|bujhte parlam na|didnt (?:get|understand)|did not understand|not clear|confusing", "বুঝিনি|বুঝলাম না|বুঝতে পারিনি"),
  ack: rx("helpful|helped|that helped|it helped|got it|understood|makes sense|good|great|nice|bujhechi|bujhsi|bujhlam|clear now", "বুঝেছি|বুঝলাম|কাজে লাগল|ভালো লাগল"),
  rude: rx("useless|stupid|dumb|idiot|faltu|bekar|kichu(?:i)? jano na|kichu(?:i)? janen na|kono kaj er na|kaj er na|worst|rubbish|nonsense", "ফালতু|বেকার|কিছুই জানো না|কিছু জানো না|কোনো কাজের না"),
};
const socialReplies: Record<string, { en: string; bn: string }> = {
  goodbyeThanks: { en: "You’re welcome. Take care, and come back whenever you have a question.", bn: "আপনাকেও ধন্যবাদ। ভালো থাকবেন। প্রশ্ন থাকলে যেকোনো সময় আবার আসবেন।" },
  goodbye: { en: "Take care. Come back whenever you have a question.", bn: "ভালো থাকবেন। প্রশ্ন থাকলে যেকোনো সময় আবার আসবেন।" },
  thanks: { en: "You’re welcome. Is there anything else you’d like to know?", bn: "আপনাকেও ধন্যবাদ। আর কিছু জানতে চান?" },
  checkInWell: { en: "Glad to hear you’re well. I’m here and ready. What would you like to know today?", bn: "ভালো আছেন শুনে ভালো লাগল। আমি প্রস্তুত আছি। আজ কী জানতে চান?" },
  checkIn: { en: "Thanks for asking. I’m here and ready to help. What would you like to talk about?", bn: "জিজ্ঞেস করার জন্য ধন্যবাদ। আমি সাহায্য করতে প্রস্তুত। কী নিয়ে কথা বলতে চান?" },
  wellSelf: { en: "Glad to hear it. What would you like to know today?", bn: "শুনে ভালো লাগল। আজ কী জানতে চান?" },
  presence: { en: "Yes, I’m here and reading your messages. Type your question in a few words, or pick a topic.", bn: "হ্যাঁ, আমি আছি এবং আপনার কথা পড়ছি। কয়েকটি শব্দে প্রশ্ন লিখুন, অথবা একটি বিষয় বেছে নিন।" },
  greeting: { en: "Hello, I’m Barta. You can ask me about pregnancy, getting ready for birth, recovery after birth, or caring for your baby.", bn: "স্বাগতম, আমি বার্তা। গর্ভাবস্থা, প্রসবের প্রস্তুতি, প্রসবের পর সুস্থ হয়ে ওঠা বা শিশুর যত্ন নিয়ে প্রশ্ন করতে পারেন।" },
  abilities: { en: "I explain reviewed information about pregnancy check-ups, food, common discomforts, warning signs, birth preparation, recovery, breastfeeding and newborn care. I can’t diagnose or prescribe. What would you like to start with?", bn: "গর্ভকালীন চেকআপ, খাবার, সাধারণ অস্বস্তি, বিপদচিহ্ন, প্রসবের প্রস্তুতি, প্রসবের পর সুস্থ হওয়া, বুকের দুধ খাওয়ানো ও নবজাতকের যত্ন নিয়ে যাচাই করা তথ্য বুঝিয়ে বলি। রোগ নির্ণয় বা ওষুধ দিতে পারি না। কোনটি দিয়ে শুরু করবেন?" },
  confused: { en: "Sorry, let me try again. Which part was unclear? You can ask it in a few words, or choose a topic.", bn: "দুঃখিত, আবার চেষ্টা করি। কোন অংশটি বোঝা যায়নি? কয়েকটি শব্দে আবার জিজ্ঞেস করুন, অথবা একটি বিষয় বেছে নিন।" },
  rude: { en: "I’m sorry I haven’t helped yet. I answer only from reviewed sources, so I may miss things. Try a few different words, or choose a topic.", bn: "দুঃখিত, এখনো ঠিকভাবে সাহায্য করতে পারিনি। আমি শুধু যাচাই করা সূত্র থেকে উত্তর দিই, তাই কিছু বাদ পড়তে পারে। অন্য কয়েকটি শব্দে লিখুন, অথবা একটি বিষয় বেছে নিন।" },
  noise: { en: "I didn’t catch that. What would you like to ask? A few words are enough.", bn: "ঠিক বুঝতে পারিনি। কী জানতে চান? কয়েকটি শব্দই যথেষ্ট।" },
};

export function getBartaStageReply(question: string): Reply | undefined {
  const text = normalizeBartaText(question);
  return stageReplies.find(({ pattern }) => pattern.test(text))?.reply;
}

/** A fixed reply for short social messages or a stage menu. */
export function getBartaUnderstoodReply(question: string): Reply | undefined {
  const text = normalizeBartaText(question);
  if (!text) return undefined;
  if (/^(?:pore|porer(?: ta| somoy)?|after|পরে|পরের(?: সময়)?)$/u.test(text)) {
    return { id: "ambiguous_stage", topics: ["postnatalVisits", "ancVisits"],
      en: "Do you mean after giving birth, or something else? Tell me what you mean in a few words.",
      bn: "প্রসবের পরের কথা বলছেন, নাকি অন্য কিছু? কয়েকটি শব্দে বলুন।" };
  }
  // The follow-up path has already had its chance (route order), so a bare stage word gets the menu.
  const stage = getBartaStageReply(text);
  if (stage) return stage;

  const pick = (id: string) => ({ id, ...socialReplies[id] });
  const words = text.split(" ");
  if (words.length > 8 || findBartaConcepts(text)) return undefined;
  const has = (key: keyof typeof social) => social[key].test(text);
  let rest = text;
  for (const pattern of Object.values(social)) rest = rest.replace(new RegExp(pattern.source, "gu"), " ");
  // A leftover starting with a vowel sign is the tail of a Bangla word the patterns already matched.
  const leftover = rest.split(" ").filter((word) => word && !/^\p{M}/u.test(word) && !fillers.test(word) && !functionWords.test(word));
  // "hello, I am having fits" must reach the safety and knowledge paths, never a greeting.
  if (leftover.length) {
    return words.length === 1 && /^(?:asdf\w*|qwer\w*|zxcv\w*|[bcdfghjklmnpqrstvwxz]{5,})$/u.test(text) ? pick("noise") : undefined;
  }
  if (has("rude")) return pick("rude");
  if (has("confused")) return pick("confused");
  if (has("goodbye") && has("thanks")) return pick("goodbyeThanks");
  if (has("goodbye")) return pick("goodbye");
  if (has("thanks")) return pick("thanks");
  if (has("checkIn")) return pick(has("wellSelf") ? "checkInWell" : "checkIn");
  if (has("wellSelf")) return pick(/\b(?:apni|tumi|you|and you)\b|আপনি|তুমি/u.test(text) ? "checkInWell" : "wellSelf");
  if (has("abilities")) return pick("abilities");
  if (has("ack")) return pick("thanks");
  if (has("presence")) return pick("presence");
  if (has("greeting")) return pick("greeting");
  return undefined;
}
