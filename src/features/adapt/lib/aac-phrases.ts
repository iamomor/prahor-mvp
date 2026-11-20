/**
 * AAC (Augmentative and Alternative Communication) catalog and natural phrase generation.
 *
 * Rules:
 * - Natural, understandable Bengali and English sentence templates.
 * - Never create awkward concatenated strings like "😣 pain · 🫃 belly · 🙏 help".
 * - Preserve exact user intent — never invent symptoms, clinical diagnoses, or unsolicited advice.
 * - Support Symptoms, Body areas, Requests, Feelings, and Talking with me (how to communicate).
 */

export type AACCategory = "symptoms" | "body-areas" | "requests" | "feelings" | "talking";

export type AACPhraseItem = {
  id: string;
  category: AACCategory;
  emoji: string;
  labelEn: string;
  labelBn: string;
  /** Sentence fragment or predicate for natural composition */
  enFragment?: string;
  bnFragment?: string;
  /** Locative form for body areas ("in my abdomen", "পেটে") */
  enLocative?: string;
  bnLocative?: string;
};

export type AACCatalogCategory = {
  id: AACCategory;
  labelEn: string;
  labelBn: string;
  descriptionEn: string;
  descriptionBn: string;
  items: AACPhraseItem[];
};

export const AAC_CATALOG: AACCatalogCategory[] = [
  {
    id: "symptoms",
    labelEn: "Symptoms",
    labelBn: "লক্ষণ",
    descriptionEn: "Physical sensations and changes you notice",
    descriptionBn: "শারীরিক অনুভূতি ও পরিবর্তনসমূহ",
    items: [
      {
        id: "pain",
        category: "symptoms",
        emoji: "😣",
        labelEn: "Pain",
        labelBn: "ব্যথা",
        enFragment: "I have pain",
        bnFragment: "আমার ব্যথা হচ্ছে",
      },
      {
        id: "headache",
        category: "symptoms",
        emoji: "🤕",
        labelEn: "Headache",
        labelBn: "মাথাব্যথা",
        enFragment: "I have a headache",
        bnFragment: "আমার মাথাব্যথা করছে",
      },
      {
        id: "dizzy",
        category: "symptoms",
        emoji: "😵",
        labelEn: "Dizziness",
        labelBn: "মাথা ঘোরা",
        enFragment: "I feel dizzy",
        bnFragment: "আমার মাথা ঘুরছে",
      },
      {
        id: "fever",
        category: "symptoms",
        emoji: "🤒",
        labelEn: "Fever",
        labelBn: "জ্বর",
        enFragment: "I have a fever",
        bnFragment: "আমার জ্বর এসেছে",
      },
      {
        id: "nausea",
        category: "symptoms",
        emoji: "🤢",
        labelEn: "Nausea",
        labelBn: "বমি বমি ভাব",
        enFragment: "I feel nauseous",
        bnFragment: "আমার বমি বমি ভাব হচ্ছে",
      },
      {
        id: "bleed",
        category: "symptoms",
        emoji: "🩸",
        labelEn: "Bleeding",
        labelBn: "রক্তক্ষরণ",
        enFragment: "I am experiencing bleeding",
        bnFragment: "আমার রক্তপাত হচ্ছে",
      },
      {
        id: "swelling",
        category: "symptoms",
        emoji: "🦵",
        labelEn: "Swelling",
        labelBn: "ফোলা ভাব",
        enFragment: "I have swelling",
        bnFragment: "আমার ফোলা ভাব আছে",
      },
      {
        id: "weakness",
        category: "symptoms",
        emoji: "🥱",
        labelEn: "Weakness",
        labelBn: "দুর্বলতা",
        enFragment: "I feel weak and tired",
        bnFragment: "আমার খুব দুর্বল ও ক্লান্ত লাগছে",
      },
      {
        id: "baby_movement",
        category: "symptoms",
        emoji: "👶",
        labelEn: "Less movement",
        labelBn: "শিশুর নড়াচড়া কম",
        enFragment: "I feel my baby moving less",
        bnFragment: "আমার শিশুর নড়াচড়া কম অনুভব করছি",
      },
    ],
  },
  {
    id: "body-areas",
    labelEn: "Body areas",
    labelBn: "শরীরের অংশ",
    descriptionEn: "Where in your body you feel the sensation",
    descriptionBn: "শরীরের কোন স্থানে অনুভূতি হচ্ছে",
    items: [
      {
        id: "belly",
        category: "body-areas",
        emoji: "🫃",
        labelEn: "Abdomen",
        labelBn: "পেট",
        enLocative: "in my abdomen",
        bnLocative: "পেটে",
      },
      {
        id: "head",
        category: "body-areas",
        emoji: "🗣️",
        labelEn: "Head",
        labelBn: "মাথা",
        enLocative: "in my head",
        bnLocative: "মাথায়",
      },
      {
        id: "back",
        category: "body-areas",
        emoji: "🔙",
        labelEn: "Back",
        labelBn: "পিঠ",
        enLocative: "in my back",
        bnLocative: "পিঠে",
      },
      {
        id: "feet",
        category: "body-areas",
        emoji: "🦶",
        labelEn: "Feet / Legs",
        labelBn: "পা",
        enLocative: "in my legs or feet",
        bnLocative: "পায়ে",
      },
      {
        id: "chest",
        category: "body-areas",
        emoji: "🫁",
        labelEn: "Chest",
        labelBn: "বুক",
        enLocative: "in my chest",
        bnLocative: "বুকে",
      },
      {
        id: "pelvis",
        category: "body-areas",
        emoji: "🚻",
        labelEn: "Lower pelvis",
        labelBn: "তলপেট",
        enLocative: "in my lower pelvis",
        bnLocative: "তলপেটে",
      },
    ],
  },
  {
    id: "requests",
    labelEn: "Requests",
    labelBn: "অনুরোধ",
    descriptionEn: "What immediate help or support you need",
    descriptionBn: "আপনার কী ধরনের সাহায্য বা সহযোগিতা প্রয়োজন",
    items: [
      {
        id: "help",
        category: "requests",
        emoji: "🙏",
        labelEn: "Help please",
        labelBn: "সাহায্য চাই",
        enFragment: "Please help me.",
        bnFragment: "আমাকে সাহায্য করুন।",
      },
      {
        id: "doctor",
        category: "requests",
        emoji: "👩‍⚕️",
        labelEn: "See doctor / midwife",
        labelBn: "ডাক্তার বা ধাত্রী প্রয়োজন",
        enFragment: "I need to see a doctor or midwife.",
        bnFragment: "আমার একজন ডাক্তার বা ধাত্রীর সঙ্গে দেখা করা দরকার।",
      },
      {
        id: "water",
        category: "requests",
        emoji: "💧",
        labelEn: "Need water",
        labelBn: "পানি লাগবে",
        enFragment: "Please bring me some water.",
        bnFragment: "আমাকে একটু পানি দিন।",
      },
      {
        id: "rest",
        category: "requests",
        emoji: "😴",
        labelEn: "Need to rest",
        labelBn: "বিশ্রাম প্রয়োজন",
        enFragment: "I need to rest.",
        bnFragment: "আমার বিশ্রাম নেওয়া প্রয়োজন।",
      },
      {
        id: "question",
        category: "requests",
        emoji: "❓",
        labelEn: "Have a question",
        labelBn: "প্রশ্ন আছে",
        enFragment: "I have a question.",
        bnFragment: "আমার একটি প্রশ্ন আছে।",
      },
      {
        id: "call_family",
        category: "requests",
        emoji: "📞",
        labelEn: "Call family",
        labelBn: "পরিবারকে কল দিন",
        enFragment: "Please call my family.",
        bnFragment: "দয়া করে আমার পরিবারকে কল দিন।",
      },
    ],
  },
  {
    id: "feelings",
    labelEn: "Feelings",
    labelBn: "অনুভূতি",
    descriptionEn: "Emotional state or urgency you want to share",
    descriptionBn: "আপনার মানসিক অবস্থা বা জরুরি প্রয়োজনীয়তা",
    items: [
      {
        id: "anxious",
        category: "feelings",
        emoji: "😟",
        labelEn: "Anxious / Scared",
        labelBn: "ভয় বা দুশ্চিন্তা লাগছে",
        enFragment: "I feel anxious and worried.",
        bnFragment: "আমার ভয় ও দুশ্চিন্তা লাগছে।",
      },
      {
        id: "uncomfortable",
        category: "feelings",
        emoji: "😣",
        labelEn: "Uncomfortable",
        labelBn: "অস্বস্তি লাগছে",
        enFragment: "I feel uncomfortable.",
        bnFragment: "আমার অস্বস্তি লাগছে।",
      },
      {
        id: "urgent",
        category: "feelings",
        emoji: "🚨",
        labelEn: "Urgent concern",
        labelBn: "জরুরি সমস্যা",
        enFragment: "This is an urgent concern.",
        bnFragment: "আমার কাছে বিষয়টি জরুরি মনে হচ্ছে।",
      },
    ],
  },
  {
    id: "talking",
    labelEn: "Talking with me",
    labelBn: "আমার সঙ্গে কথা বলা",
    descriptionEn: "How to talk with me, and how I will answer",
    descriptionBn: "আমার সঙ্গে কীভাবে কথা বলবেন, আর আমি কীভাবে উত্তর দেব",
    items: [
      {
        id: "please_wait",
        category: "talking",
        emoji: "✋",
        labelEn: "Please wait",
        labelBn: "অপেক্ষা করুন",
        enFragment: "Please wait a moment for me.",
        bnFragment: "অনুগ্রহ করে আমার জন্য একটু অপেক্ষা করুন।",
      },
      {
        id: "say_again",
        category: "talking",
        emoji: "🔁",
        labelEn: "Say it again",
        labelBn: "আবার বলুন",
        enFragment: "Please say that again.",
        bnFragment: "অনুগ্রহ করে আবার বলুন।",
      },
      {
        id: "speak_slowly",
        category: "talking",
        emoji: "🐢",
        labelEn: "Speak slowly",
        labelBn: "ধীরে বলুন",
        enFragment: "Please speak slowly.",
        bnFragment: "অনুগ্রহ করে ধীরে ধীরে বলুন।",
      },
      {
        id: "write_it",
        category: "talking",
        emoji: "✍️",
        labelEn: "Write it down",
        labelBn: "লিখে দিন",
        enFragment: "Please write it down for me.",
        bnFragment: "অনুগ্রহ করে আমাকে লিখে দিন।",
      },
      {
        id: "show_me",
        category: "talking",
        emoji: "👉",
        labelEn: "Show me",
        labelBn: "দেখিয়ে বলুন",
        enFragment: "Please show me with a picture or by pointing.",
        bnFragment: "অনুগ্রহ করে ছবি বা আঙুল দিয়ে দেখিয়ে বলুন।",
      },
      {
        id: "explain",
        category: "talking",
        emoji: "💬",
        labelEn: "Explain please",
        labelBn: "বুঝিয়ে বলুন",
        enFragment: "Please explain what this means.",
        bnFragment: "অনুগ্রহ করে এর মানে বুঝিয়ে বলুন।",
      },
      {
        id: "not_understand",
        category: "talking",
        emoji: "🤔",
        labelEn: "I don't understand",
        labelBn: "বুঝতে পারছি না",
        enFragment: "I do not understand.",
        bnFragment: "আমি বুঝতে পারছি না।",
      },
      {
        id: "understand",
        category: "talking",
        emoji: "👍",
        labelEn: "I understand",
        labelBn: "বুঝেছি",
        enFragment: "I understand.",
        bnFragment: "আমি বুঝেছি।",
      },
      {
        id: "pause_talk",
        category: "talking",
        emoji: "⏸️",
        labelEn: "Stop for a moment",
        labelBn: "একটু থামুন",
        enFragment: "Please stop for a moment. I need a short break.",
        bnFragment: "অনুগ্রহ করে একটু থামুন। আমার একটু বিরতি দরকার।",
      },
      {
        id: "my_way",
        category: "talking",
        emoji: "⌨️",
        labelEn: "I answer by typing",
        labelBn: "লিখে উত্তর দেব",
        enFragment: "I will answer by typing or with pictures.",
        bnFragment: "আমি লিখে বা ছবি দিয়ে উত্তর দেব।",
      },
      {
        id: "privacy",
        category: "talking",
        emoji: "🚪",
        labelEn: "Talk in private",
        labelBn: "একান্তে কথা",
        enFragment: "I would like to talk in private.",
        bnFragment: "আমি একান্তে কথা বলতে চাই।",
      },
      {
        id: "interpreter",
        category: "talking",
        emoji: "🤟",
        labelEn: "Sign interpreter",
        labelBn: "ইশারা ভাষার দোভাষী",
        enFragment: "I need a sign language interpreter.",
        bnFragment: "আমার একজন ইশারা ভাষার দোভাষী দরকার।",
      },
    ],
  },
];

/** Lookup map for quick item resolution by ID */
export const AAC_ITEMS_BY_ID = new Map<string, AACPhraseItem>();
for (const cat of AAC_CATALOG) {
  for (const item of cat.items) {
    AAC_ITEMS_BY_ID.set(item.id, item);
  }
}

/**
 * Natural phrase generator for composed AAC selections.
 * Produces grammatically structured, dignified Bengali or English sentences.
 */
export function generateNaturalPhrase(
  items: AACPhraseItem[],
  language: "bn" | "en",
): string {
  if (items.length === 0) return "";

  const bodyAreas = items.filter((x) => x.category === "body-areas");
  const symptoms = items.filter((x) => x.category === "symptoms");
  const requests = items.filter((x) => x.category === "requests" || x.category === "talking");
  const feelings = items.filter((x) => x.category === "feelings");

  if (language === "bn") {
    const sentences: string[] = [];
    let remainingSymptoms = [...symptoms];
    const shouldMentionAreas = bodyAreas.length > 0;

    // Case 1: Pain with body locations
    const painSymptom = remainingSymptoms.find((s) => s.id === "pain");
    if (painSymptom && symptoms.length === 1 && bodyAreas.length > 0) {
      const locStr = bodyAreas.map((b) => b.bnLocative || b.labelBn).join(" এবং ");
      sentences.push(`আমার ${locStr} ব্যথা হচ্ছে।`);
      remainingSymptoms = remainingSymptoms.filter((s) => s.id !== "pain");
    }

    // Case 2: Swelling with body locations
    const swellingSymptom = remainingSymptoms.find((s) => s.id === "swelling");
    if (swellingSymptom && symptoms.length === 1 && bodyAreas.length > 0) {
      const locStr = bodyAreas.map((b) => b.bnLocative || b.labelBn).join(" এবং ");
      sentences.push(`আমার ${locStr} ফোলা ভাব দেখা যাচ্ছে।`);
      remainingSymptoms = remainingSymptoms.filter((s) => s.id !== "swelling");
    }

    // A location selection alone does not mean the person selected a symptom.
    // Case 4: Other symptoms
    for (const symptom of remainingSymptoms) {
      if (symptom.bnFragment) {
        sentences.push(
          symptom.bnFragment.endsWith("।")
            ? symptom.bnFragment
            : `${symptom.bnFragment}।`,
        );
      }
    }

    // Case 5: Feelings
    for (const feeling of feelings) {
      if (feeling.bnFragment) {
        sentences.push(
          feeling.bnFragment.endsWith("।")
            ? feeling.bnFragment
            : `${feeling.bnFragment}।`,
        );
      }
    }

    if (shouldMentionAreas && remainingSymptoms.length === symptoms.length) {
      const areaNames = bodyAreas.map((area) => area.labelBn).join(" ও ");
      sentences.push(`আমি ${areaNames}${sentences.length ? " নিয়েও" : " নিয়ে"} বলতে চাই।`);
    }

    // Case 6: Requests
    for (const request of requests) {
      if (request.bnFragment) {
        sentences.push(
          request.bnFragment.endsWith("।")
            ? request.bnFragment
            : `${request.bnFragment}।`,
        );
      }
    }

    return sentences.join(" ");
  }

  // English generator
  const sentences: string[] = [];
  let remainingSymptoms = [...symptoms];
  const shouldMentionAreas = bodyAreas.length > 0;

  // Case 1: Pain with body locations
  const painSymptom = remainingSymptoms.find((s) => s.id === "pain");
  if (painSymptom && symptoms.length === 1 && bodyAreas.length > 0) {
    const locStr = bodyAreas.map((b) => b.enLocative || b.labelEn).join(" and ");
    sentences.push(`I have pain ${locStr}.`);
    remainingSymptoms = remainingSymptoms.filter((s) => s.id !== "pain");
  }

  // Case 2: Swelling with body locations
  const swellingSymptom = remainingSymptoms.find((s) => s.id === "swelling");
  if (swellingSymptom && symptoms.length === 1 && bodyAreas.length > 0) {
    const locStr = bodyAreas.map((b) => b.enLocative || b.labelEn).join(" and ");
    sentences.push(`I have swelling ${locStr}.`);
    remainingSymptoms = remainingSymptoms.filter((s) => s.id !== "swelling");
  }

  // A location selection alone does not mean the person selected a symptom.
  // Case 4: Other symptoms
  for (const symptom of remainingSymptoms) {
    if (symptom.enFragment) {
      sentences.push(
        symptom.enFragment.endsWith(".")
          ? symptom.enFragment
          : `${symptom.enFragment}.`,
      );
    }
  }

  // Case 5: Feelings
  for (const feeling of feelings) {
    if (feeling.enFragment) {
      sentences.push(
        feeling.enFragment.endsWith(".")
          ? feeling.enFragment
          : `${feeling.enFragment}.`,
      );
    }
  }

  if (shouldMentionAreas && remainingSymptoms.length === symptoms.length) {
    const areaNames = bodyAreas.map((area) => area.enLocative?.replace(/^in /, "") ?? area.labelEn).join(" and ");
    sentences.push(`I want to mention ${areaNames}${sentences.length ? " too" : ""}.`);
  }

  // Case 6: Requests
  for (const request of requests) {
    if (request.enFragment) {
      sentences.push(
        request.enFragment.endsWith(".")
          ? request.enFragment
          : `${request.enFragment}.`,
      );
    }
  }

  return sentences.join(" ");
}
