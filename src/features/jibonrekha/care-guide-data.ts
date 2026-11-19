export const careGuideSources = {
  who: {
    label: "WHO · Antenatal care recommendations",
    url: "https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/handbooks/programme-manager-s-handbook-mncah/recommendations-on-interventions-along-life-course/maternal",
  },
  nice: {
    label: "NICE · Antenatal care (NG201)",
    url: "https://www.nice.org.uk/guidance/ng201/chapter/Recommendations",
  },
  acog: {
    label: "ACOG · Routine tests during pregnancy",
    url: "https://www.acog.org/womens-health/faqs/routine-tests-during-pregnancy",
  },
  surveillance: {
    label: "ACOG · Antenatal fetal surveillance",
    url: "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2021/06/indications-for-outpatient-antenatal-fetal-surveillance",
  },
  early: {
    label: "NICE · Ectopic pregnancy and miscarriage (NG126)",
    url: "https://www.nice.org.uk/guidance/NG126/chapter/diagnosis-of-viable-intrauterine-pregnancy-and-of-tubal-ectopic-pregnancy",
  },
  preterm: {
    label: "NICE · Preterm labour and birth (NG25)",
    url: "https://www.nice.org.uk/guidance/ng25/chapter/Recommendations",
  },
} as const;

export type CareGuideSource = keyof typeof careGuideSources;
export type CareGuideItem = {
  id: string;
  firstWeek: number;
  lastWeek: number;
  title: string;
  why: string;
  detail: string;
  status: "discuss" | "optional" | "if-needed";
  source: CareGuideSource;
  additionalSource?: CareGuideSource;
};

export const careGuideItems: CareGuideItem[] = [
  { id: "confirm", firstWeek: 3, lastWeek: 5, title: "গর্ভধারণ নিশ্চিত করা", why: "মাসিক বন্ধ হলে বা গর্ভধারণের সম্ভাবনা থাকলে পরীক্ষা ও প্রথম যোগাযোগের পরিকল্পনা করা।", detail: "প্রস্রাবের পরীক্ষার সময় ও ফল চিকিৎসকের সঙ্গে মিলিয়ে নিন। রক্তের β-hCG বারবার মাপা সবার জন্য প্রয়োজন হয় না; চিকিৎসক পরিস্থিতি অনুযায়ী বলেন।", status: "discuss", source: "who" },
  { id: "early-scan", firstWeek: 5, lastWeek: 9, title: "প্রাথমিক আল্ট্রাসাউন্ড নিয়ে আলোচনা", why: "অবস্থান বা উপসর্গ নিয়ে প্রশ্ন থাকলে চিকিৎসক স্ক্যানের প্রয়োজন নির্ধারণ করতে পারেন।", detail: "খুব তাড়াতাড়ি স্ক্যানে সব কিছু দেখা নাও যেতে পারে। একটি স্ক্যান দিয়ে একাই গর্ভের সুস্থতা নিশ্চিত বলে ধরা যাবে না।", status: "if-needed", source: "early" },
  { id: "booking", firstWeek: 6, lastWeek: 12, title: "প্রথম গর্ভকালীন ভিজিট ও রক্ত–প্রস্রাব পরীক্ষা", why: "মায়ের স্বাস্থ্য, রক্তের গ্রুপ ও Rh, রক্তশূন্যতা এবং গুরুত্বপূর্ণ সংক্রমণ নিয়ে আলোচনা ও পরীক্ষা করা।", detail: "CBC, রক্তের গ্রুপ/Rh, প্রস্রাব এবং HIV, সিফিলিস, হেপাটাইটিস B পরীক্ষার মতো বিষয় চিকিৎসকের সঙ্গে মিলিয়ে নিন। TSH বা অন্য পরীক্ষা ব্যক্তিগত কারণ অনুযায়ী যোগ হতে পারে।", status: "discuss", source: "nice" },
  { id: "dating", firstWeek: 11, lastWeek: 14, title: "তারিখ নির্ধারণের স্ক্যান ও বেছে নেওয়া স্ক্রিনিং", why: "গর্ভকাল, একাধিক শিশু ও শিশুর গঠন সম্পর্কে প্রাথমিক তথ্য পাওয়া।", detail: "NICE-এর নির্ধারিত স্ক্যান সময় ১১ সপ্তাহ ২ দিন থেকে ১৪ সপ্তাহ ১ দিন। NT বা রক্তভিত্তিক ক্রোমোজোম স্ক্রিনিংয়ের পছন্দ, সময় ও ফলের সীমা চিকিৎসকের সঙ্গে আলোচনা করুন; স্ক্রিনিং রোগনির্ণয় নয়।", status: "optional", source: "nice" },
  { id: "cervix", firstWeek: 16, lastWeek: 24, title: "জরায়ুমুখের দৈর্ঘ্য: প্রয়োজন হলে", why: "আগে অকাল প্রসব বা অন্য নির্দিষ্ট কারণ থাকলে বাড়তি মূল্যায়নের প্রয়োজন হতে পারে।", detail: "NICE-এ প্রাসঙ্গিক মূল্যায়নের সময় ১৬–২৪ সপ্তাহ। এটি সবার জন্য বাধ্যতামূলক স্ক্যান নয়; রিপোর্টের সংখ্যা দেখে নিজে চিকিৎসা শুরু করবেন না।", status: "if-needed", source: "preterm" },
  { id: "anatomy", firstWeek: 18, lastWeek: 22, title: "শিশুর গঠন ও প্লাসেন্টার স্ক্যান", why: "শিশুর অঙ্গের গঠন ও প্লাসেন্টার অবস্থান দেখা।", detail: "NICE সাধারণত ১৮ সপ্তাহ থেকে ২০ সপ্তাহ ৬ দিনের মধ্যে স্ক্যান অফার করে; স্থানীয় সেবায় সময় কিছুটা আলাদা হতে পারে। স্বাভাবিক স্ক্রিনিংও সব অবস্থা বাদ দেয় না।", status: "optional", source: "nice" },
  { id: "glucose", firstWeek: 24, lastWeek: 28, title: "গর্ভকালীন ডায়াবেটিস ও রক্তশূন্যতা নিয়ে পরীক্ষা", why: "রক্তে শর্করার সমস্যা ও হিমোগ্লোবিনের অবস্থা জানা, প্রয়োজন হলে যত্নের পরিকল্পনা করা।", detail: "সাধারণত ২৪–২৮ সপ্তাহে গ্লুকোজ স্ক্রিনিং হয়। কোন পদ্ধতি ব্যবহার হবে এবং ফল কী বোঝায়, তা স্থানীয় চিকিৎসক ঠিক করবেন। Rh-নেগেটিভ হলে অ্যান্টিবডি ও Anti-D পরিকল্পনা নিয়েও কথা বলুন।", status: "discuss", source: "acog", additionalSource: "nice" },
  { id: "growth", firstWeek: 28, lastWeek: 32, title: "ভিজিটে মায়ের রক্তচাপ ও শিশুর বৃদ্ধি পর্যালোচনা", why: "আগের ফল, রক্তচাপ, প্রস্রাবের প্রোটিন ও বৃদ্ধির তথ্য একসঙ্গে দেখা।", detail: "জটিলতাহীন একক গর্ভে ২৮ সপ্তাহের পর সবার জন্য নিয়মিত আল্ট্রাসাউন্ডের পরামর্শ নেই। বৃদ্ধি নিয়ে উদ্বেগ থাকলে চিকিৎসক স্ক্যানের সিদ্ধান্ত নিতে পারেন।", status: "discuss", source: "nice" },
  { id: "doppler", firstWeek: 33, lastWeek: 35, title: "ডপলার বা অতিরিক্ত পরীক্ষা: কারণ থাকলে", why: "শিশুর বৃদ্ধি বা মায়ের নির্দিষ্ট স্বাস্থ্য সমস্যায় বাড়তি মূল্যায়ন করা।", detail: "ডপলার, লিভার/কিডনি পরীক্ষা বা ঘন ঘন নজরদারি রুটিন নয়। কেন, কখন এবং কীভাবে ফল ব্যবহার হবে—চিকিৎসককে জিজ্ঞেস করুন।", status: "if-needed", source: "surveillance" },
  { id: "birth", firstWeek: 36, lastWeek: 38, title: "প্রসবের প্রস্তুতি ও প্রয়োজনীয় নজরদারি", why: "প্রসবের পরিকল্পনা, শিশুর অবস্থান, আগের ফল ও কোথায় সহায়তা পাবেন তা পর্যালোচনা করা।", detail: "NST/CTG, BPP বা শেষের স্ক্যান সবার জন্য স্বয়ংক্রিয় পরীক্ষা নয়। নির্দিষ্ট কারণ থাকলে চিকিৎসক বলেন; কেবল স্ক্যান দিয়ে প্রসবের ধরন নিশ্চিত করা যায় না।", status: "discuss", source: "nice" },
  { id: "late", firstWeek: 39, lastWeek: 41, title: "শেষ সপ্তাহের যোগাযোগ ও প্রসব-পরবর্তী পরিকল্পনা", why: "যদি এখনো প্রসব না হয়, পরবর্তী ভিজিট, প্রসবের পথ ও শিশুর জন্মের পরের যত্ন নিয়ে আলোচনা করা।", detail: "সম্ভাব্য প্রসবের তারিখ নিশ্চিত দিন নয়। ৪০ সপ্তাহের পর পরিকল্পনা চিকিৎসক ও মায়ের যৌথ সিদ্ধান্তে হবে; নতুন সমস্যা হলে নির্ধারিত ভিজিটের অপেক্ষা করবেন না।", status: "discuss", source: "who" },
];

export const guideWeekRange = { first: 1, last: 41 } as const;
export const whoModelContactWeeks = [12, 20, 26, 30, 34, 36, 38, 40] as const;

export function careForWeek(week: number) {
  if (!Number.isInteger(week) || week < guideWeekRange.first || week > guideWeekRange.last) throw new RangeError("Care guide week outside 1–41");
  return careGuideItems.filter(item => item.firstWeek <= week && week <= item.lastWeek);
}
