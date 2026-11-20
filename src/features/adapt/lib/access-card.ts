/**
 * Access Card: a visit card she fills in and prints to show staff what helps her.
 * It holds only the fixed fields below — never a diagnosis, disability type or anything she did not choose.
 * It is a communication aid, not a medical record. No runtime imports (see access-card.test.mjs).
 */
export type AccessCardLang = "en" | "bn";
export type AccessNeedGroupId = "talk" | "place" | "decide";

export const ACCESS_NEED_GROUPS: { id: AccessNeedGroupId; en: string; bn: string }[] = [
  { id: "talk", en: "How to talk with me", bn: "আমার সঙ্গে যেভাবে কথা বলবেন" },
  { id: "place", en: "Getting in and waiting", bn: "ভেতরে আসা ও অপেক্ষা" },
  { id: "decide", en: "Time and decisions", bn: "সময় ও সিদ্ধান্ত" },
];

export const ACCESS_NEEDS: { id: string; group: AccessNeedGroupId; en: string; bn: string }[] = [
  { id: "face-me", group: "talk", en: "Please face me when you speak.", bn: "কথা বলার সময় অনুগ্রহ করে আমার দিকে মুখ করে বলুন।" },
  { id: "write-down", group: "talk", en: "Please write important things down for me.", bn: "জরুরি কথাগুলো অনুগ্রহ করে লিখে দিন।" },
  { id: "sign-interpreter", group: "talk", en: "I use Bangla Sign Language. Please arrange an interpreter.", bn: "আমি বাংলা ইশারা ভাষা ব্যবহার করি। অনুগ্রহ করে একজন দোভাষীর ব্যবস্থা করুন।" },
  { id: "simple-words", group: "talk", en: "Please use short, simple words.", bn: "অনুগ্রহ করে ছোট ও সহজ কথায় বলুন।" },
  { id: "show-me", group: "talk", en: "Please show me pictures or point.", bn: "অনুগ্রহ করে ছবি দেখিয়ে বা আঙুল দিয়ে দেখিয়ে বলুন।" },
  { id: "picture-board", group: "talk", en: "I talk with a picture board or device. Please wait for me.", bn: "আমি ছবির বোর্ড বা যন্ত্র দিয়ে কথা বলি। অনুগ্রহ করে আমার জন্য অপেক্ষা করুন।" },
  { id: "describe-around", group: "place", en: "Please tell me what is around me and guide me.", bn: "আমার চারপাশে কী আছে বলুন এবং পথ দেখিয়ে দিন।" },
  { id: "step-free", group: "place", en: "I need a way in without stairs.", bn: "আমার সিঁড়ি ছাড়া ঢোকার পথ দরকার।" },
  { id: "seat", group: "place", en: "I need to sit down while I wait.", bn: "অপেক্ষার সময় আমার বসার জায়গা দরকার।" },
  { id: "quiet-place", group: "place", en: "I need a quiet place to wait.", bn: "অপেক্ষার জন্য আমার একটি শান্ত জায়গা দরকার।" },
  { id: "extra-time", group: "decide", en: "Please give me extra time.", bn: "অনুগ্রহ করে আমাকে একটু বেশি সময় দিন।" },
  { id: "ask-me", group: "decide", en: "Please ask me, not only my helper.", bn: "অনুগ্রহ করে শুধু আমার সহায়ককে নয়, আমাকে জিজ্ঞাসা করুন।" },
  { id: "helper-stays", group: "decide", en: "I want my helper to stay with me.", bn: "আমি চাই আমার সহায়ক আমার সঙ্গে থাকুক।" },
  { id: "time-alone", group: "decide", en: "I may want time alone with the doctor.", bn: "আমি হয়তো ডাক্তারের সঙ্গে একা কথা বলতে চাইব।" },
];

export type AccessCard = {
  version: 1; needs: string[]; name: string; helperName: string; helperPhone: string; note: string; updatedAt: string;
};
export type AccessCardError =
  | "unknown_need" | "no_needs" | "name_too_long" | "helper_name_too_long" | "note_too_long" | "helper_phone_invalid";
export type AccessCardResult = { ok: true; card: AccessCard } | { ok: false; errors: AccessCardError[] };

export const ACCESS_CARD_ERROR_COPY: Record<AccessCardError, { en: string; bn: string }> = {
  unknown_need: { en: "One choice is not on the list. Please choose again.", bn: "একটি পছন্দ তালিকায় নেই। আবার বেছে নিন।" },
  no_needs: { en: "Choose at least one thing that helps you.", bn: "আপনাকে সাহায্য করে এমন অন্তত একটি বিষয় বেছে নিন।" },
  name_too_long: { en: "Use 80 characters or fewer for your name.", bn: "নাম ৮০ অক্ষরের মধ্যে লিখুন।" },
  helper_name_too_long: { en: "Use 80 characters or fewer for your helper's name.", bn: "সহায়কের নাম ৮০ অক্ষরের মধ্যে লিখুন।" },
  note_too_long: { en: "Use 300 characters or fewer for your note.", bn: "আপনার কথা ৩০০ অক্ষরের মধ্যে লিখুন।" },
  helper_phone_invalid: { en: "Check the phone number. Use digits only, for example 01711000000.", bn: "ফোন নম্বরটি দেখুন। শুধু সংখ্যা লিখুন, যেমন ০১৭১১০০০০০০।" },
};

const LIMITS = { name: 80, helperName: 80, note: 300 };
const tidy = (value: unknown) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");
const toAsciiDigits = (value: string) => value.replace(/[০-৯]/g, digit => String(digit.charCodeAt(0) - 0x09e6));

/** Bangla or ASCII digits, optional leading +, common separators; 6–15 digits. Anything else is refused. */
export function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const compact = toAsciiDigits(value).replace(/[\s\-().]/g, "");
  return /^\+?\d{6,15}$/.test(compact) ? compact : null;
}

/** Validate untrusted input into the fixed card shape; unknown fields are dropped, needs kept in catalog order. */
export function parseAccessCard(input: unknown, now: Date = new Date()): AccessCardResult {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const chosen = Array.isArray(raw.needs) ? raw.needs : [];
  const errors: AccessCardError[] = [];
  if (chosen.some(id => !ACCESS_NEEDS.some(need => need.id === id))) errors.push("unknown_need");
  const needs = ACCESS_NEEDS.filter(need => chosen.includes(need.id)).map(need => need.id);
  if (!needs.length) errors.push("no_needs");
  const name = tidy(raw.name), helperName = tidy(raw.helperName), note = tidy(raw.note);
  if (name.length > LIMITS.name) errors.push("name_too_long");
  if (helperName.length > LIMITS.helperName) errors.push("helper_name_too_long");
  if (note.length > LIMITS.note) errors.push("note_too_long");
  const phoneInput = tidy(raw.helperPhone);
  const helperPhone = phoneInput ? normalizePhone(phoneInput) : "";
  if (helperPhone === null) errors.push("helper_phone_invalid");
  if (errors.length) return { ok: false, errors };
  return { ok: true, card: { version: 1, needs, name, helperName, helperPhone: helperPhone ?? "", note, updatedAt: now.toISOString() } };
}

/** Only the chosen needs, grouped in the fixed group order; empty groups are left out. */
export function accessCardSections(card: AccessCard, lang: AccessCardLang) {
  return ACCESS_NEED_GROUPS.map(group => ({
    id: group.id,
    title: group[lang],
    items: ACCESS_NEEDS.filter(need => need.group === group.id && card.needs.includes(need.id)).map(need => need[lang]),
  })).filter(section => section.items.length);
}

const COPY = {
  title: { bn: "আমার সাক্ষাৎ কার্ড", en: "MY VISIT CARD" },
  name: { bn: "নাম", en: "Name" },
  note: { bn: "আমার কথায়", en: "In my words" },
  helper: { bn: "আমার সহায়ক", en: "My helper" },
  footer: { bn: "এই কার্ডে লেখা আছে কী আমাকে সাহায্য করে। এটি কোনো মেডিকেল রেকর্ড নয়।", en: "This card shows what helps me. It is not a medical record." },
};

/** Plain printable text. "both" puts Bangla first; optional lines appear only when she filled them in. */
export function accessCardText(card: AccessCard, lang: AccessCardLang | "both"): string {
  const pick = (copy: { bn: string; en: string }) => (lang === "both" ? `${copy.bn} / ${copy.en}` : copy[lang]);
  const lines = [pick(COPY.title)];
  if (card.name) lines.push(`${pick(COPY.name)}: ${card.name}`);
  for (const group of ACCESS_NEED_GROUPS) {
    const chosen = ACCESS_NEEDS.filter(need => need.group === group.id && card.needs.includes(need.id));
    if (!chosen.length) continue;
    lines.push("", pick(group));
    for (const need of chosen) lines.push(`- ${pick(need)}`);
  }
  if (card.note) lines.push("", `${pick(COPY.note)}: ${card.note}`);
  const helper = [card.helperName, card.helperPhone].filter(Boolean).join(", ");
  if (helper) lines.push("", `${pick(COPY.helper)}: ${helper}`);
  lines.push("");
  if (lang === "both") lines.push(COPY.footer.bn, COPY.footer.en);
  else lines.push(COPY.footer[lang]);
  return lines.join("\n");
}

export type UrgentCardOptions = {
  stage?: "pregnant" | "recently-gave-birth"; cannotHear?: boolean; contactName?: string; contactPhone?: string;
};
const URGENT = {
  help: { en: "I need urgent help.", bn: "আমার জরুরি সাহায্য দরকার।" },
  pregnant: { en: "I am pregnant.", bn: "আমি গর্ভবতী।" },
  "recently-gave-birth": { en: "I gave birth recently.", bn: "আমি সম্প্রতি সন্তান জন্ম দিয়েছি।" },
  cannotHear: { en: "I cannot hear. Please write or show me.", bn: "আমি শুনতে পাই না। অনুগ্রহ করে লিখে বা দেখিয়ে বলুন।" },
  call999: { en: "Please call 999 for me.", bn: "অনুগ্রহ করে আমার জন্য ৯৯৯-এ কল করুন।" },
  alsoCall: { en: "Please also call", bn: "অনুগ্রহ করে এঁকেও কল করুন" },
};

/** Always asks for 999; adds only the lines she chose. A contact is added only with a valid number. */
export function urgentCardLines(options: UrgentCardOptions, lang: AccessCardLang): string[] {
  const lines = [URGENT.help[lang]];
  if (options.stage === "pregnant" || options.stage === "recently-gave-birth") lines.push(URGENT[options.stage][lang]);
  if (options.cannotHear === true) lines.push(URGENT.cannotHear[lang]);
  lines.push(URGENT.call999[lang]);
  const phone = normalizePhone(options.contactPhone);
  if (phone) lines.push(`${URGENT.alsoCall[lang]}: ${[tidy(options.contactName), phone].filter(Boolean).join(", ")}`);
  return lines;
}
