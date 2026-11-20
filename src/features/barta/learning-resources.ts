import type { Citation } from "@/lib/contracts/barta";
import type { Language } from "./barta-education-copy";

type Resource = {
  kind: "visual" | "video";
  title: Record<Language, string>;
  href: string;
  publisher?: "WHO" | "NHS" | "CDC";
  imagePreview?: { src: string; alt: Resource["title"] };
  videoId?: string;
  languageNote?: Record<Language, string>;
};
type ResourceGroup = {
  chunkIds: readonly string[];
  resources: Record<Language, readonly Resource[]>;
};

const unicefBangladesh = "https://www.unicef.org/bangladesh";

function unicefGuide(
  kind: Resource["kind"],
  path: string,
  title: Resource["title"],
  videoId?: string,
): Record<Language, readonly Resource[]> {
  return {
    en: [{ kind, title, videoId, href: `${unicefBangladesh}/en/parenting-bd/${path}` }],
    bn: [{
      kind, title, videoId, href: `${unicefBangladesh}/parenting-bd/${path}`,
      ...(kind === "video" ? { languageNote: { en: "Bangla transcript", bn: "বাংলায় লিখিত পাঠ" } } : {}),
    }],
  };
}

const positioning = unicefGuide("visual", "food-nutrition/breastfeeding-positions", {
  en: "Breastfeeding positions in pictures",
  bn: "বুকের দুধ খাওয়ানোর অবস্থান, ছবিসহ",
});
const breastfeeding = unicefGuide("video", "breastfeeding-mini-parenting-master-class", {
  en: "Common breastfeeding questions",
  bn: "বুকের দুধ খাওয়ানো নিয়ে সাধারণ প্রশ্ন",
}, "mTm9zvz5-Dc");

const cryingVideo = {
  kind: "video",
  title: { en: "How to soothe a baby", bn: "কান্নার সময় শিশুকে শান্ত করা" },
  href: "https://www.unicef.org/parenting/child-care/how-soothe-baby",
  videoId: "CFiJLzuh0k0",
  languageNote: { en: "English video", bn: "ইংরেজি ভিডিও" },
} as const;

const newbornVideo = {
  kind: "video",
  title: { en: "Newborn health and everyday care", bn: "নবজাতকের স্বাস্থ্য ও প্রতিদিনের যত্ন" },
  href: "https://www.unicef.org/bangladesh/en/parenting-bd/health/newborn-baby-health",
  videoId: "SSoKsJ8NYd4",
  languageNote: { en: "English video and transcript", bn: "ইংরেজি ভিডিও ও লিখিত পাঠ" },
} as const;

const whoPregnancy = "https://www.who.int/tools/your-life-your-health/life-phase/pregnancy--birth-and-after-childbirth";
const whoNewborn = "https://www.who.int/tools/your-life-your-health/life-phase/newborns-and-children-under-5-years";

function englishGuide(
  publisher: NonNullable<Resource["publisher"]>,
  kind: Resource["kind"],
  href: string,
  title: Resource["title"],
  videoId?: string,
): Record<Language, readonly Resource[]> {
  const resource: Resource = {
    publisher, kind, title, href, videoId,
    languageNote: { en: "English", bn: "ইংরেজি" },
  };
  return { en: [resource], bn: [resource] };
}

const newbornCare = englishGuide("WHO", "visual", `${whoNewborn}/caring-for-newborns`, {
  en: "Newborn warmth, first bath and cord care", bn: "নবজাতকের উষ্ণতা, প্রথম গোসল ও নাভির যত্ন",
});
const bathingVideo = englishGuide("NHS", "video", "https://www.nhs.uk/best-start-in-life/baby/baby-basics/caring-for-your-baby/bathing-your-baby/", {
  en: "How to bathe a baby safely", bn: "শিশুকে নিরাপদে গোসল করানোর উপায়",
}, "_9rg-DEkBQQ");
const handwashingPoster: Resource = {
  kind: "visual", publisher: "CDC",
  title: { en: "Handwashing reminder poster", bn: "হাত ধোয়ার স্মারক পোস্টার" },
  href: "https://www.cdc.gov/natural-disasters/communication-resources/wash-your-hands-poster.html",
  languageNote: { en: "English poster", bn: "ইংরেজি পোস্টার" },
  imagePreview: {
    src: "https://www.cdc.gov/natural-disasters/media/images/2024/04/wash-your-hands-poster.JPG",
    alt: { en: "CDC poster showing a person washing their hands with soap and running water.",
      bn: "সাবান ও প্রবাহমান পানি দিয়ে একজনের হাত ধোয়ার ছবি, সিডিসির পোস্টার।" },
  },
};

// Supplementary media is selected by the cited passage, never by the prompt
// or model output. The official publisher pages host the images and videos.
export const bartaLearningResources = [
  {
    chunkIds: [
      "5fb06b54-29aa-424c-968f-bcea163c636a", "b1452c85-a9ee-4409-9f63-af1517f03e4f",
      "d3c1cbff-9eea-4188-a4aa-4ab204ac65a5", "bea85817-0508-4315-84f1-cfba212e9719",
    ],
    resources: unicefGuide("visual", "your-first-trimester-guide", {
      en: "First trimester and the first check-up",
      bn: "গর্ভাবস্থার প্রথম তিন মাস ও প্রথম চেকআপ",
    }),
  },
  {
    chunkIds: ["b43a365a-5a09-4503-af14-d3ce3d66058d", "35d5e2ff-88f1-4228-9246-e5b5e9d641ee"],
    resources: unicefGuide("visual", "pregnancy-milestones", {
      en: "Pregnancy milestones by trimester",
      bn: "তিন ধাপে গর্ভাবস্থার পরিবর্তন",
    }),
  },
  {
    chunkIds: ["6346fea0-da42-409d-b9fe-4a13b508e90a", "15dfb4a5-822c-4be7-aa1c-cb695d2a05a3"],
    resources: positioning,
  },
  {
    chunkIds: [
      "52ac151f-159b-4537-ac06-c18ef32f1d74", "b1c0ab8d-03ad-4adf-959f-1ab5e777c529",
      "3672a64c-168d-43fd-ad1f-2777ca08c77e", "307df713-b3b8-4552-992d-12ba57cbf1d7",
    ],
    resources: { en: [...breastfeeding.en, ...positioning.en], bn: [...breastfeeding.bn, ...positioning.bn] },
  },
  {
    chunkIds: ["52c7e800-08dd-4e02-8f35-668ec6a2ce79", "3a730cce-6dfb-4f04-9bea-4d7fead127db"],
    resources: { en: [newbornVideo], bn: [newbornVideo] },
  },
  {
    chunkIds: ["97ec5ab3-b5f4-53f0-a6c9-bf37361578f1", "1fe745b6-fda7-5b4b-aee1-8fc31ee58540"],
    resources: unicefGuide("video", "food-and-nutrition/your-babys-first-foods", {
      en: "Introducing your baby’s first foods",
      bn: "শিশুর প্রথম খাবার শুরু করা",
    }, "YBr6BZ6qL18"),
  },
  {
    chunkIds: ["9e67848e-10c2-5125-a2ce-c9fc2bcfdd1c", "fae467fb-47a1-525c-9069-c9be467b3c1e"],
    resources: unicefGuide("video", "child-development/building-babies-brains-through-play-class", {
      en: "Learning through play",
      bn: "খেলার মাধ্যমে শিশুর শেখা",
    }, "fpiYNkkNmEo"),
  },
  {
    chunkIds: ["f0fc4a2b-8c8d-59d6-bd15-24f33dd16712", "b32f6eff-46b9-5f5e-b8de-3c3fae28f879"],
    resources: { en: [cryingVideo], bn: [cryingVideo] },
  },
  {
    chunkIds: [
      "089fc74c-53c4-404a-9268-fcf317841932", "eb43f5f3-e53d-4e92-90bb-0987112d9889",
      "da1faefa-8a70-41ad-8f8c-156ffdc7e239", "df5b438f-5e4c-4dd8-b914-aa9455feb224",
    ],
    resources: unicefGuide("visual", "what-to-eat-when-pregnant", {
      en: "Eating well during pregnancy", bn: "গর্ভাবস্থায় পুষ্টিকর খাবার",
    }),
  },
  {
    chunkIds: ["767e92f4-4c7a-4e32-a44d-b50291ad123f", "2fa57214-aecc-4b9b-9cf5-ecd2b0582b8e"],
    resources: unicefGuide("visual", "child-development/what-avoid-when-pregnant", {
      en: "Food safety during pregnancy", bn: "গর্ভাবস্থায় নিরাপদ খাবার",
    }),
  },
  {
    chunkIds: [
      "3a195fa5-514f-44a2-a0d0-f48a56f94d09", "2e68370e-057b-4e13-9133-d78ef77c9992",
      "88f208d4-c4f2-4608-bd4b-73970b728388", "e0238aba-e06f-4011-9c0c-a222a1a45672",
    ],
    resources: englishGuide("WHO", "visual", `${whoPregnancy}/making-plans-for-childbirth-when-pregnant`, {
      en: "Preparing for childbirth", bn: "প্রসবের প্রস্তুতি",
    }),
  },
  {
    chunkIds: [
      "07e4ddd7-06b5-4f5b-8bb3-ab2edbb049bb", "95833c18-92de-420e-b046-adacb585ba0e",
      "1c58faf9-818d-554a-b80e-ff67f98f3806", "2406a699-58d8-56db-b409-e63884e3347c",
    ],
    resources: englishGuide("WHO", "visual", `${whoPregnancy}/getting-the-health-services-you-need-after-childbirth`, {
      en: "Follow-up care after childbirth", bn: "প্রসবের পরের স্বাস্থ্যসেবা ও চেকআপ",
    }),
  },
  {
    chunkIds: [
      "9ef3d06d-c7c4-5625-9d17-a1b0f19f85a6", "72c7624e-34f0-5d29-934b-7918a1ce6e67",
      "1ce87124-71f2-49ea-ab75-37202ec4bdd2", "b1c4a62b-71b9-4f57-8c75-25e214e2bc1f",
      "c60c159b-5396-4639-90b0-80e6fb030913", "c48d0411-5fc4-4a96-845a-c7a0e5cd729a",
    ],
    resources: englishGuide("WHO", "visual", `${whoPregnancy}/keeping-well-during-pregnancy-and-after-childbirth`, {
      en: "Physical and emotional well-being around birth", bn: "গর্ভাবস্থায় ও প্রসবের পর শরীর ও মনের যত্ন",
    }),
  },
  {
    chunkIds: ["bf70c796-a1e0-509a-86b0-06bc116f0297", "22aa6a71-bf0c-5353-8a08-aae3bcd14591"],
    resources: {
      en: [...newbornCare.en, ...bathingVideo.en],
      bn: [...newbornCare.bn, ...bathingVideo.bn],
    },
  },
  {
    chunkIds: ["5f6d50b9-a0a7-5ba2-a810-8d43527b35aa", "367ffb34-7b53-509b-a7de-6b416b4a864c"],
    resources: newbornCare,
  },
  {
    chunkIds: [
      "1215fc7d-552d-575f-afd1-a7a9d4796eb3", "c7e88a66-456e-53d9-bdae-8d759d5d5242",
      "4bf89a8a-6614-5a97-bc17-e23913e11062", "92e87642-7cd1-5c7a-a2ef-ccafcb7ed718",
    ],
    resources: englishGuide("WHO", "visual", `${whoNewborn}/newborns-and-children-under-5-years-clean-and-safe`, {
      en: "Keeping newborns clean and safe", bn: "নবজাতককে পরিষ্কার ও নিরাপদ রাখা",
    }),
  },
  {
    chunkIds: ["7b612b40-bb10-5213-b45e-fa2952529e72", "76565af0-388e-574c-87cf-e084f3fcff17"],
    resources: englishGuide("NHS", "video", "https://www.nhs.uk/best-start-in-life/baby/baby-basics/caring-for-your-baby/changing-a-nappy/", {
      en: "Changing a nappy, step by step", bn: "ধাপে ধাপে ডায়াপার বদলানো",
    }, "XEV-oQmGDto"),
  },
  {
    chunkIds: ["a139a316-c1c9-5894-a544-c159edc9e610", "792b2cd1-05b7-575f-a9db-8f4ea2e3a7e1"],
    resources: unicefGuide("visual", "food-nutrition/breastfeeding-workplace", {
      en: "Breastfeeding when returning to work", bn: "কাজে ফেরার পর বুকের দুধ খাওয়ানো",
    }),
  },
  {
    chunkIds: ["9ff66837-63dd-5921-a969-063bde0b3818", "a8584a2e-90be-51ab-a392-942ed604156a"],
    resources: englishGuide("NHS", "visual", "https://bsw.icb.nhs.uk/wp-content/uploads/sites/6/2026/03/Safer-sleep-guide-for-parents.pdf", {
      en: "Safer sleep guide for parents (PDF)", bn: "শিশুর নিরাপদ ঘুমের নির্দেশিকা (PDF)",
    }),
  },
  {
    chunkIds: [
      "33da842a-2baf-5a5b-ab7f-d9262ee32afb", "dd2cf6f4-ecd0-58c5-a239-9b8bb1d63e4b",
      "5f229068-cf9b-48cf-9a55-55f504031c45", "f87cbe47-a758-42bf-b409-36b216fe7cb0",
    ],
    resources: unicefGuide("visual", "your-first-trimester-guide", {
      en: "Common early-pregnancy changes", bn: "গর্ভাবস্থার প্রথম দিকের সাধারণ পরিবর্তন",
    }),
  },
  {
    chunkIds: ["79880bd7-4d6a-4eed-94c8-f1a1263266cd", "f721f445-b6db-47d5-9a15-26ccf16f96dd"],
    resources: { en: [handwashingPoster], bn: [handwashingPoster] },
  },
  {
    chunkIds: ["81194bb7-90d1-5127-bcdb-e79bdd350857", "087ad1ab-08c3-580f-bcec-ab90d6ff2dd5"],
    resources: englishGuide("NHS", "visual", "https://www.nhsinform.scot/ready-steady-baby/pregnancy/looking-after-yourself-and-your-baby/travelling-when-pregnant/", {
      en: "Travelling when pregnant, with a seat-belt picture", bn: "গর্ভাবস্থায় ভ্রমণ ও সিটবেল্ট পরার ছবি",
    }),
  },
  {
    chunkIds: ["322b1711-4f3e-4267-947d-1b90818dd774", "704d585a-4c67-4d0f-a79b-3541f6f8ef45"],
    resources: englishGuide("NHS", "video", "https://www.nhs.uk/pregnancy/your-pregnancy-care/ultrasound-scans/", {
      en: "What happens at an ultrasound scan", bn: "আল্ট্রাসাউন্ড পরীক্ষায় কী হয়",
    }),
  },
  {
    chunkIds: ["40a02a7e-3337-4624-89dd-77618d1051ec", "0b5505da-505e-4261-97bb-91e09a36fc65"],
    resources: englishGuide("NHS", "video", "https://www.leedsth.nhs.uk/patients/resources/glucose-tolerance-testing-in-pregnancy-video/", {
      en: "What a glucose tolerance test involves (UK example)", bn: "গ্লুকোজ টলারেন্স টেস্টে কী হয় (যুক্তরাজ্যের উদাহরণ)",
    }),
  },
  {
    chunkIds: [
      "2bc801cc-318a-42a7-bf7a-e600a61a3f5c", "3686ab5c-f89a-457c-8bd4-8845e667a29f",
      "9cea9abc-77eb-45b5-a514-0db47daa1a8f", "f7724c05-14a3-4ad2-bc2f-45f9d2db37f3",
    ],
    resources: englishGuide("WHO", "visual", `${whoPregnancy}/getting-the-health-services-you-need-during-pregnancy`, {
      en: "Getting care and keeping records in pregnancy", bn: "গর্ভাবস্থায় সেবা নেওয়া ও তথ্য সংরক্ষণ",
    }),
  },
] satisfies readonly ResourceGroup[];

export function getBartaLearningResources(citations: readonly Pick<Citation, "chunkId">[], locale: Language) {
  const chunkIds = new Set(citations.map(({ chunkId }) => chunkId));
  const resources = new Map<string, Resource>();
  for (const group of bartaLearningResources) {
    if (!group.chunkIds.some((id) => chunkIds.has(id))) continue;
    for (const resource of group.resources[locale]) resources.set(resource.href, resource);
  }
  return [...resources.values()].slice(0, 2);
}
