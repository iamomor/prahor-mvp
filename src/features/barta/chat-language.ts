import type { Language } from "./barta-education-copy";

const banglish = /\b(?:pore\s+kotha\s+hobe|allah\s+ha(?:fe|fi)z|nomoskar|maf\s+korben|bujhlam|thik\s+ache|dhonyobad|sori|tomar\s+nam\s+ki|kemon|kmn|kmon|kemne|kivabe|kibhabe|kivbay|kokhon|koybar|koto|korbo|kormu|jiggesh|jiggasha|bujhiye|shokale|bomi|kora|ereye|gorbokalin|bacchar|baccar|bachchar|khabar|khaowano|khawa|khabo|gorboboti|gorbhobosthay|baccha|bacha|bacca|bachcha|matha|nora ?chora|prostuti|shudhu|nobojatoker|salam|assalamualaikum|sekhane|dhonnobad|mane\s+ki|ki\s+hoy|buker\s+dudh|tumi\s+ke)\b/iu;
const banglishPhrases = /\b(?:ami|amar|amr|apni|tumi|tomar)\b.{0,80}\b(?:ki|valo|bhalo|jabe|achi|asi|aso|acho|asen|lage|lagbe|nebo|nibo|debo|dibo)\b/iu;
const english = /\b(?:what|why|when|where|which|how|can|could|should|is|are|does|did|hello|hi|hey|thanks|thank you|please|goodbye|bye|good (?:morning|evening)|my|your|i am|i['’]m|i need|i have|tell me|explain|breastfeeding|postnatal|antenatal|newborn|diaper)\b/iu;

const accessBanglishQuestions = new Set<string>(["pregnancy checkup e disability support kivabe chaibo","wheelchair niye pregnancy checkup e ki ki jiggesh korbo","deaf mother pregnancy appointment e interpreter kivabe chaibe","low vision pregnancy information digital text kivabe pabo","midwife ke sohoj vashay bujhiye bolte kivabe bolbo","kotha bolte oshubidha hole antenatal visit e ki korbo","labour e alo ba shobde osubidha hole ki support chaibo","birth plan e disability support kivabe likhbo","support person thakle nijer care decision kivabe janabo","delivery er por bari jawar age ki disability support chaibo","pregnancy visit e trusted support person niye jete parbo","postnatal reminder phone er bodole sms kivabe chaibo"]);
const banglishSmallTalk = /\b(?:chinta (?:hocche|hochhe|lagtese|lagche)|chintay achi|tension (?:hocche|e achi|lagtese)|(?:bhoy|voy) (?:lagche|lagtese)|mon kharap|(?:bhalo|valo) (?:achi|asi|lagche na|nei)|ki (?:khobor|obostha)|sohoj kore (?:bolo|bolun)|jani na|bujhte parchi na|ektu kotha boli)\b/iu;
const englishSmallTalk = /^(?:hiii+|heyyy+|hellooo+|heya|hiya|yo+|sup|wassup|wazzup|hru|thx|tnx|tysm|cya|ttyl|idk|dunno|brb|bruh|lol+|lmao|wtf)[?!.]*$/iu;
const banglishCoverage = /\b(?:adda (?:dibo|korbo)|shami (?:amake )?mare|sahajjo (?:chai|lagbe)|more jete ichche|(?:ami |khub )hatash|amar kotha ki save|tomar boyosh koto|apni ki (?:robot|daktar))\b/iu;

export function detectBartaLanguage(text: string): Language | undefined {
  const normalized = text.normalize("NFKC").trim();
  if (accessBanglishQuestions.has(normalized.toLowerCase().replace(/[?!.]+$/u, ""))) return "bn";
  if (/[\u0980-\u09ff]/u.test(normalized) || banglish.test(normalized) || banglishPhrases.test(normalized)
    || banglishSmallTalk.test(normalized) || banglishCoverage.test(normalized)) return "bn";
  if (english.test(normalized) || englishSmallTalk.test(normalized)) return "en";
}
