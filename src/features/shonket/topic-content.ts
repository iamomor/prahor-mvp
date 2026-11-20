/**
 * Source-linked DRAFT content for the four Shonket topics.
 * Every statement below is taken from the WHO/UNFPA/UNICEF/World Bank "Pregnancy, childbirth, postpartum and
 * newborn care: a guide for essential practice" (PCPNC, 3rd ed., (c) WHO 2015), read on 2026-11-20 from the
 * canonical IRIS PDF. See docs/qa/final-2026-11-20/SHONKET_SOURCE_REGISTER.md for claim-to-page mapping.
 * It is NOT clinician-approved and has no Bangla medical-translation sign-off: approval metadata is deliberately absent.
 */
type Text = { en: string; bn: string };
export type TopicGroup = { id: string; urgency: "now" | "soon" | "plan"; title: Text; items: Text[]; cite: string };
export type TopicContent = { intro: Text; groups: TopicGroup[] };

export const SOURCE = {
  title: "Pregnancy, childbirth, postpartum and newborn care: a guide for essential practice (3rd ed.)",
  org: "WHO, UNFPA, UNICEF, World Bank Group",
  year: "2015",
  url: "https://iris.who.int/items/cd2796dd-aafb-4ffd-8964-99f5aaaf1e7c",
  checked: "2026-11-20",
} as const;

const now: Text = { en: "Go to a hospital or health centre immediately, day or night, without waiting, if you have:", bn: "নিচের যেকোনো লক্ষণ থাকলে দিন বা রাত যাই হোক, অপেক্ষা না করে এখনই হাসপাতাল বা স্বাস্থ্যকেন্দ্রে যান:" };
const soon: Text = { en: "Go to a health centre as soon as possible if you have:", bn: "নিচের যেকোনো লক্ষণ থাকলে যত দ্রুত সম্ভব স্বাস্থ্যকেন্দ্রে যান:" };

export const topicContent: Record<string, TopicContent> = {
  pregnancy: {
    intro: { en: "These are the danger signs the WHO guide tells women to watch for in pregnancy.", bn: "গর্ভাবস্থায় কোন বিপদচিহ্নের দিকে নজর রাখতে হবে, ডব্লিউএইচও-র নির্দেশিকা অনুযায়ী তা এখানে দেওয়া হলো।" },
    groups: [
      { id: "now", urgency: "now", title: now, cite: "WHO PCPNC C15, PDF p.44", items: [
        { en: "Vaginal bleeding", bn: "যোনিপথে রক্তপাত" },
        { en: "Convulsions (fits)", bn: "খিঁচুনি" },
        { en: "Severe headache with blurred vision", bn: "তীব্র মাথাব্যথার সঙ্গে ঝাপসা দেখা" },
        { en: "Fever and too weak to get out of bed", bn: "জ্বর এবং এত দুর্বল যে বিছানা থেকে উঠতে পারছেন না" },
        { en: "Severe abdominal pain", bn: "তীব্র পেটব্যথা" },
        { en: "Fast or difficult breathing", bn: "দ্রুত বা কষ্টকর শ্বাস" },
      ] },
      { id: "soon", urgency: "soon", title: soon, cite: "WHO PCPNC C15, PDF p.44", items: [
        { en: "Fever", bn: "জ্বর" },
        { en: "Abdominal pain", bn: "পেটব্যথা" },
        { en: "Feeling ill", bn: "অসুস্থ বোধ করা" },
        { en: "Swelling of the fingers, face or legs", bn: "আঙুল, মুখ বা পায়ে ফোলা" },
      ] },
    ],
  },
  "labour-and-childbirth": {
    intro: { en: "The WHO guide lists signs of labour, and when a birth companion should call for help.", bn: "প্রসবের লক্ষণ এবং কখন সঙ্গী ব্যক্তির সাহায্য ডাকা উচিত, ডব্লিউএইচও-র নির্দেশিকায় তা দেওয়া আছে।" },
    groups: [
      { id: "labour", urgency: "plan", title: { en: "Go to the facility or contact the skilled birth attendant if you have:", bn: "নিচের লক্ষণ দেখা দিলে প্রসবের জন্য নির্ধারিত স্বাস্থ্যকেন্দ্রে যান বা দক্ষ প্রসব সহায়তাকারীর সঙ্গে যোগাযোগ করুন:" }, cite: "WHO PCPNC C15, PDF p.44", items: [
        { en: "A bloody, sticky discharge", bn: "রক্তমিশ্রিত আঠালো স্রাব" },
        { en: "Painful contractions every 20 minutes or less", bn: "প্রতি ২০ মিনিট বা তার কম সময় পরপর ব্যথাযুক্ত সংকোচন" },
        { en: "Waters have broken", bn: "পানি ভেঙে যাওয়া" },
      ] },
      { id: "now", urgency: "now", title: now, cite: "WHO PCPNC C15, PDF p.44", items: [
        { en: "Vaginal bleeding", bn: "যোনিপথে রক্তপাত" },
        { en: "Convulsions (fits)", bn: "খিঁচুনি" },
        { en: "Severe headache with blurred vision", bn: "তীব্র মাথাব্যথার সঙ্গে ঝাপসা দেখা" },
        { en: "Fever and too weak to get out of bed", bn: "জ্বর এবং এত দুর্বল যে বিছানা থেকে উঠতে পারছেন না" },
        { en: "Severe abdominal pain", bn: "তীব্র পেটব্যথা" },
        { en: "Fast or difficult breathing", bn: "দ্রুত বা কষ্টকর শ্বাস" },
      ] },
      { id: "companion", urgency: "now", title: { en: "During labour, the birth companion should call for help if:", bn: "প্রসব চলাকালে সঙ্গী ব্যক্তির সাহায্য ডাকা উচিত, যদি:" }, cite: "WHO PCPNC D7, PDF p.63", items: [
        { en: "The woman is bearing down with contractions", bn: "সংকোচনের সঙ্গে প্রসবকারী নিজে থেকেই চাপ দিতে থাকেন" },
        { en: "There is vaginal bleeding", bn: "যোনিপথে রক্তপাত হয়" },
        { en: "She is suddenly in much more pain", bn: "হঠাৎ অনেক বেশি ব্যথা শুরু হয়" },
        { en: "She loses consciousness or has fits", bn: "তিনি জ্ঞান হারান বা খিঁচুনি হয়" },
        { en: "There is any other concern", bn: "অন্য কোনো দুশ্চিন্তার কারণ থাকে" },
      ] },
    ],
  },
  postpartum: {
    intro: { en: "These are the danger signs the WHO guide lists for the mother after birth.", bn: "সন্তান জন্মের পর মায়ের জন্য ডব্লিউএইচও-র নির্দেশিকায় উল্লেখ করা বিপদচিহ্নগুলো এখানে দেওয়া হলো।" },
    groups: [
      { id: "now", urgency: "now", title: now, cite: "WHO PCPNC D28, PDF p.64; M4, PDF p.165", items: [
        { en: "Heavy vaginal bleeding: more than 2 or 3 pads soaked in 20–30 minutes after delivery, or bleeding that increases instead of decreasing", bn: "অতিরিক্ত রক্তপাত: প্রসবের পর ২০–৩০ মিনিটে ২ বা ৩টির বেশি প্যাড ভিজে যাওয়া, অথবা রক্তপাত কমার বদলে বাড়তে থাকা" },
        { en: "Convulsions (fits)", bn: "খিঁচুনি" },
        { en: "Fast or difficult breathing", bn: "দ্রুত বা কষ্টকর শ্বাস" },
        { en: "Fever and too weak to get out of bed", bn: "জ্বর এবং এত দুর্বল যে বিছানা থেকে উঠতে পারছেন না" },
        { en: "Severe abdominal pain", bn: "তীব্র পেটব্যথা" },
        { en: "Severe headache with blurred vision", bn: "তীব্র মাথাব্যথার সঙ্গে ঝাপসা দেখা" },
        { en: "Calf pain, redness or swelling; shortness of breath or chest pain", bn: "পায়ের ডিমে ব্যথা, লালচে ভাব বা ফোলা; শ্বাসকষ্ট বা বুকে ব্যথা" },
      ] },
      { id: "soon", urgency: "soon", title: soon, cite: "WHO PCPNC D28, PDF p.64; M4, PDF p.165", items: [
        { en: "Fever, abdominal pain, or feeling ill", bn: "জ্বর, পেটব্যথা বা অসুস্থ বোধ করা" },
        { en: "Swollen, red or tender breasts, or sore nipples", bn: "স্তন ফোলা, লাল হওয়া বা ব্যথা, অথবা স্তনের বোঁটায় ব্যথা" },
        { en: "Urine dribbling or pain when passing urine", bn: "প্রস্রাব চুঁইয়ে পড়া বা প্রস্রাবের সময় ব্যথা" },
        { en: "Pain in the perineum or pus draining from it", bn: "যোনি ও মলদ্বারের মাঝের অংশে ব্যথা বা পুঁজ বের হওয়া" },
        { en: "Foul-smelling vaginal discharge (lochia)", bn: "দুর্গন্ধযুক্ত যোনিস্রাব" },
        { en: "Severe depression or suicidal thoughts or behaviour (ideas or attempts)", bn: "তীব্র বিষণ্নতা, অথবা আত্মহত্যার চিন্তা বা চেষ্টা" },
      ] },
    ],
  },
  "perinatal-mental-health": {
    intro: { en: "The WHO guide describes feelings that may need support after birth. It does not diagnose anything; a health worker does that.", bn: "সন্তান জন্মের পর কোন অনুভূতিতে সহায়তা লাগতে পারে, ডব্লিউএইচও-র নির্দেশিকা তা বর্ণনা করে। এটি রোগনির্ণয় করে না; সেটি স্বাস্থ্যকর্মীর কাজ।" },
    groups: [
      { id: "feelings", urgency: "plan", title: { en: "Talk to a health worker if, for two weeks or more, you notice two or more of these, as a change from how you usually are:", bn: "দুই সপ্তাহ বা তার বেশি সময় ধরে, আপনার স্বাভাবিক অবস্থা থেকে পরিবর্তন হিসেবে নিচের দুই বা তার বেশি লক্ষণ থাকলে স্বাস্থ্যকর্মীর সঙ্গে কথা বলুন:" }, cite: "WHO PCPNC E7, PDF p.94", items: [
        { en: "Inappropriate guilt, or a persistently sad or anxious mood, or irritability", bn: "অযথা অপরাধবোধ, অথবা টানা বিষণ্ন বা উদ্বিগ্ন মেজাজ, অথবা খিটখিটে ভাব" },
        { en: "Low interest in or pleasure from activities you used to enjoy", bn: "যে কাজে আগে আনন্দ পেতেন তাতে আগ্রহ বা আনন্দ কমে যাওয়া" },
        { en: "Difficulty carrying out usual work or domestic or social activities", bn: "স্বাভাবিক কাজ, ঘরের কাজ বা সামাজিক কাজ করতে অসুবিধা" },
        { en: "Negative or hopeless feelings about yourself or your newborn", bn: "নিজের বা নবজাতকের বিষয়ে নেতিবাচক বা আশাহীন অনুভূতি" },
        { en: "Several aches, pains, palpitations or numbness with no clear physical cause", bn: "স্পষ্ট শারীরিক কারণ ছাড়া নানা ব্যথা, বুক ধড়ফড় বা অসাড়তা" },
      ] },
      { id: "soon", urgency: "soon", title: { en: "The WHO guide lists this among postpartum signs to go to a health centre for as soon as possible:", bn: "ডব্লিউএইচও-র নির্দেশিকা প্রসবের পর যত দ্রুত সম্ভব স্বাস্থ্যকেন্দ্রে যাওয়ার লক্ষণের তালিকায় এটি রেখেছে:" }, cite: "WHO PCPNC D28, PDF p.64", items: [
        { en: "Severe depression or suicidal thoughts or behaviour (ideas or attempts)", bn: "তীব্র বিষণ্নতা, অথবা আত্মহত্যার চিন্তা বা চেষ্টা" },
      ] },
    ],
  },
};
