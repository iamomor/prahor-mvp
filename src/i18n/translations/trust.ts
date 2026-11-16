export const aiIntegrity = {
    eyebrow: { en: "Responsible Clinical AI Architecture", bn: "দায়িত্বশীল ক্লিনিক্যাল এআই স্থাপত্য" },
    heading: { en: "AI grounded in clinical evidence, not probabilistic guesses", bn: "চিকিৎসা তথ্যের ভিত্তিতে এআই, অনুমানের ভিত্তিতে নয়" },
    desc: {
      en: "In pregnancy and infant care, a single hallucinated recommendation can lead to tragedy. PROHOR treats artificial intelligence not as a surrogate doctor, but as a transparent, source-citing comprehension companion.",
      bn: "মাতৃত্বকালীন সময়ে একটি ভুল পরামর্শও জীবন বিপন্ন করতে পারে। প্রহর এআইকে চিকিৎসকের বিকল্প মনে করে না, বরং এটি একটি সহায়ক ও নির্ভরযোগ্য তথ্যপ্রদানকারী মাধ্যম।",
    },
    bartaTitle: { en: "Barta (বার্তা)", bn: "বার্তা" },
    bartaSub: { en: "Grounded Maternal Intelligence", bn: "নির্ভরযোগ্য মাতৃত্ব বুদ্ধিমত্তা" },
    bartaBadge: { en: "Source-Linked RAG", bn: "উৎস-সংযুক্ত আরএজি" },
    bartaDesc: {
      en: "Barta connects exclusively to an authorized corpus of maternal clinical protocols from the World Health Organization (WHO), UNICEF, and the Directorate General of Health Services (DGHS) Bangladesh.",
      bn: "বার্তা শুধুমাত্র বিশ্ব স্বাস্থ্য সংস্থা (WHO), ইউনিসেফ এবং বাংলাদেশ সরকারের স্বাস্থ্য অধিদপ্তরের (DGHS) অনুমোদিত ক্লিনিক্যাল প্রটোকল থেকে তথ্য সংগ্রহ করে।",
    },
    bartaPoints: [
      { en: "Visible Citations: Every sentence links back to its clinical source chapter and publishing year.", bn: "স্পষ্ট রেফারেন্স: উত্তরের প্রতিটি তথ্যের সাথে বই ও অনুচ্ছেদের উল্লেখ থাকে।" },
      { en: "Honest Abstention: When evidence is insufficient, Barta clearly says: 'I cannot answer this with medical certainty.'", bn: "সততার সাথে অস্বীকৃতি: অনিশ্চিত বিষয়ে সরাসরি বলে: 'চিকিৎসাগত নিশ্চিতভাবে আমি এ বিষয়ে সিদ্ধান্ত দিতে অপারগ।'" },
      { en: "Zero Autonomous Triage: Never tells a mother 'you are fine' when danger signs are present.", bn: "কোনো কাল্পনিক আশ্বাস নয়: বিপদ সংকেত থাকলে কখনোই অহেতুক স্বস্তি দিয়ে হাসপাতালে যাওয়ার ক্ষেত্রে বিলম্ব ঘটায় না।" },
    ],
    bujhiTitle: { en: "Bujhi (বুঝি)", bn: "বুঝি" },
    bujhiSub: { en: "Diagnostic Report Comprehension", bn: "ডায়াগনস্টিক রিপোর্ট সহজীকরণ" },
    bujhiBadge: { en: "Human-in-the-Loop OCR", bn: "যাচাইকৃত ওসিআর" },
    bujhiDesc: {
      en: "In Bangladesh, paper ultrasound reports and blood tests are full of dense clinical abbreviations. Bujhi extracts values while forcing human confirmation before anything is permanently saved.",
      bn: "প্রেসক্রিপশন ও রিপোর্টের জটিল শর্টকাটগুলোকে বুঝি সহজ ভাষায় বুঝিয়ে দেয়, তবে ব্যবহারকারী নিজে যাচাই করার আগে তা স্থায়ীভাবে সংরক্ষণ করে না।",
    },
    bujhiPoints: [
      { en: "Optical Extraction with Confidence Scores: Uncertain text is flagged with visual warning indicators.", bn: "কনফিডেন্স স্কোর: অস্পষ্ট লেখার ক্ষেত্রে সতর্কবার্তা প্রদর্শন করে নিশ্চিত হতে বলে।" },
      { en: "Mandatory Mother Review: Extracted fields remain in a 'Pending Review' state until confirmed.", bn: "বাধ্যতামূলক পর্যালোচনা: মা নিজে যাচাই না করা পর্যন্ত তথ্যটি খসড়া হিসেবে থাকে।" },
      { en: "Plain Bengali & English Translation: Explains what 'Hb 10.2 g/dL' means for daily iron health.", bn: "সহজ ভাষায় ব্যাখ্যা: 'হিমোগ্লোবিন ১০.২' এর মতো সংখ্যা আপনার প্রতিদিনের শক্তির জন্য কী বোঝায় তা ব্যাখ্যা করে।" },
    ],
    disclaimer: {
      en: "Zero AI Diagnostic Autonomy: PROHOR AI never diagnoses diseases, prescribes medications, or alters doctor treatment orders. It serves solely to explain, organize, and bridge patient understanding.",
      bn: "এআই দ্বারা কোনো রোগ নির্ণয় নয়: প্রহর এআই নিজে রোগ নির্ণয় করে না বা কোনো ওষুধ প্রেসক্রাইব করে না। এটি শুধুমাত্র তথ্য ব্যাখ্যা ও চিকিৎসকের কাছে যাওয়ার প্রস্তুতিতে সহায়তা করে।",
    },
  } as const;

export const trust = {
    eyebrow: { en: "Privacy & Ethical AI Commitment", bn: "গোপনীয়তা ও নৈতিক এআই প্রতিশ্রুতি" },
    heading: { en: "A healthcare platform built on uncompromised trust", bn: "সম্পূর্ণ বিশ্বাসের ভিত্তিতে গড়ে ওঠা স্বাস্থ্যসেবা" },
    desc: {
      en: "Maternal data is among the most sensitive personal information in existence. We hold ourselves to strict ethical and clinical governance standards.",
      bn: "মাতৃত্বকালীন স্বাস্থ্যতথ্য অত্যন্ত সংবেদনশীল। আমরা সর্বোচ্চ নৈতিক ও নিরাপত্তা বজায় রেখে প্রতিটি তথ্য সুরক্ষিত রাখি।",
    },
    bannerTitle: { en: "Read our complete Privacy & Clinical Provenance Charter", bn: "আমাদের সম্পূর্ণ গোপনীয়তা ও ক্লিনিক্যাল সনদ পড়ুন" },
    bannerDesc: { en: "Understand our data encryption, informed consent protocol, and non-diagnostic AI safety rules.", bn: "জানুন কীভাবে আপনার তথ্য এনক্রিপ্ট থাকে এবং কীভাবে এআই চিকিৎসা প্রটোকল মেনে চলে।" },
    bannerBtn: { en: "View Trust Policy", bn: "ট্রাস্ট পলিসি দেখুন" },
    pillars: [
      {
        title: { en: "100% Mother Data Sovereignty", bn: "মায়ের তথ্যের সম্পূর্ণ মালিকানা" },
        desc: {
          en: "Your records belong solely to you. We never sell, monetize, or use personal health information for commercial advertising.",
          bn: "আপনার তথ্য শুধুই আপনার। আমরা কখনোই কোনো বিজ্ঞাপন কোম্পানি বা ঔষধ প্রস্তুতকারকের কাছে তথ্য বিক্রি করি না।",
        },
      },
      {
        title: { en: "Strict Medical Provenance", bn: "তথ্যের উৎসের স্বচ্ছতা" },
        desc: {
          en: "Every metric visibly shows its origin: Self-Reported, Bujhi-Extracted, or Clinician-Confirmed. No fake precision or synthetic lab values passed as real.",
          bn: "প্রতিটি তথ্য মা নিজে দিয়েছেন, নাকি ল্যাব টেস্ট রিপোর্ট থেকে এসেছে তা সবসময় পরিষ্কারভাবে দেখানো হয়।",
        },
      },
      {
        title: { en: "Zero-Spill Shared Phone Mode", bn: "যৌথ ফোনের গোপনীয়তা" },
        desc: {
          en: "Designed for families where phones are shared. Discreet notification previews and rapid logout protect private health records.",
          bn: "পরিবারে যৌথ ফোন ব্যবহারের কথা ভেবে লক-স্ক্রিনে কখনোই ব্যক্তিগত তথ্য দেখানো হয় না এবং দ্রুত লগআউটের সুবিধা থাকে।",
        },
      },
      {
        title: { en: "Transparent AI Boundaries", bn: "এআইয়ের সুস্পষ্ট সীমাবদ্ধতা" },
        desc: {
          en: "Barta answers from verified WHO and DGHS sources, safely refusing to prescribe medications or provide autonomous symptom diagnoses.",
          bn: "বার্তা শুধুমাত্র অনুমোদিত মেডিকেল গাইডলাইন থেকে তথ্য দেয় এবং কখনোই মনগড়া ওষুধ প্রেসক্রাইব করে না।",
        },
      },
    ],
  } as const;

export const faq = {
    eyebrow: { en: "Common Questions", bn: "সাধারণ জিজ্ঞাসা" },
    heading: { en: "Frequently Asked Questions", bn: "বহুল জিজ্ঞাসিত প্রশ্নসমূহ" },
    desc: {
      en: "Clear, honest answers about privacy, accessibility, clinical safety, and how PROHOR fits into your real healthcare journey.",
      bn: "গোপনীয়তা, অ্যাক্সেসযোগ্যতা, নিরাপত্তা এবং প্রহর কীভাবে আপনার সহায়তায় কাজ করে সে বিষয়ে সুস্পষ্ট উত্তর।",
    },
    moreLink: { en: "Have more questions? Read our comprehensive FAQ directory", bn: "আরও প্রশ্ন আছে? আমাদের সম্পূর্ণ প্রশ্নোত্তর পাতাটি দেখুন" },
    items: [
      {
        q: { en: "Do I need to sign up or create an account to explore PROHOR?", bn: "প্রহর ব্যবহার করতে কি প্রথমেই একাউন্ট বা সাইন-আপ করতে হবে?" },
        a: {
          en: "No. You can freely explore the platform, read educational health guidance, learn how the 8 modules work, and inspect accessible facility directories without creating an account. Sign-in is only requested when you want to save private medical records or link a personal pregnancy timeline.",
          bn: "না। আপনি কোনো একাউন্ট খোলা ছাড়াই প্ল্যাটফর্মের সব শিক্ষামূলক তথ্য পড়তে পারবেন, ৮টি মডিউলের কাজ জানতে পারবেন এবং হাসপাতালের তথ্য দেখতে পারবেন। কেবল ব্যক্তিগত স্বাস্থ্যতথ্য ও প্রেসক্রিপশন সেভ করার সময় লগইন প্রয়োজন হয়।",
        },
      },
      {
        q: { en: "How does PROHOR support mothers with disabilities without segregating them?", bn: "বিশেষ চাহিদাসম্পন্ন মায়েদের কীভাবে কোনো আলাদা স্তর ছাড়াই প্রহর সেবা দেয়?" },
        a: {
          en: "PROHOR uses universal adaptive design. Instead of creating a 'Disabled' vs 'Normal' mode, every single mother uses the exact same platform. You can independently adjust contrast, text scale, layout spacing, animation, and symbol-assisted AAC communication at any time without ever having to disclose or prove a medical condition.",
          bn: "প্রহরে কোনো 'স্বাভাবিক' বা 'অক্ষম' মোড বলে আলাদা কিছু নেই। সব মা একই প্ল্যাটফর্ম ব্যবহার করেন। আপনি নিজেই নিজের সুবিধামতো উচ্চ কনট্রাস্ট, বড় লেখা, বাটনের দূরত্ব বা ছবির মাধ্যমে যোগাযোগ নির্বাচন করতে পারেন।",
        },
      },
      {
        q: { en: "Does Barta AI diagnose illnesses or prescribe medication?", bn: "বার্তা এআই কি নিজে রোগ নির্ণয় করে বা ওষুধ প্রেসক্রাইব করে?" },
        a: {
          en: "Never. Barta is an educational companion powered by retrieval-augmented generation (RAG) strictly tied to clinical protocols from the World Health Organization (WHO) and Bangladesh DGHS. It cites its exact sources, transparently abstains when uncertain, and directs mothers to certified doctors or midwives for actual clinical triage.",
          bn: "কখনোই নয়। বার্তা কেবল একটি তথ্যপ্রদানকারী মাধ্যম যা বিশ্ব স্বাস্থ্য সংস্থা ও স্বাস্থ্য অধিদপ্তরের তথ্যের ভিত্তিতে উত্তর দেয়। এটি কোনো প্রেসক্রিপশন দেয় না এবং জটিল লক্ষণে সরাসরি ডাক্তারের কাছে যাওয়ার পরামর্শ দেয়।",
        },
      },
      {
        q: { en: "How does PROHOR protect my privacy if I share a phone with family?", bn: "পরিবারে ফোন ভাগাভাগি করে ব্যবহার করলে তথ্যের গোপনীয়তা কীভাবে রক্ষা পায়?" },
        a: {
          en: "PROHOR is engineered for the realities of Bangladesh, where phones are often shared among household members. We feature discreet lock-screen notifications, easy one-tap sign-out, and strict separation between medical records and private diary entries. Family supporters never gain access to your private reflections without explicit, revocable consent.",
          bn: "লক-স্ক্রিনে কখনোই ব্যক্তিগত রোগের তথ্য বা ডায়েরির অংশ দেখানো হয় না। এছাড়া দ্রুত লগআউটের সুবিধা রয়েছে এবং আপনার লিখিত ব্যক্তিগত ডায়েরি পরিবারের সদস্যরা দেখতে পারেন না।",
        },
      },
      {
        q: { en: "What should I do if I experience sudden maternal danger signs?", bn: "হঠাৎ কোনো বিপদ সংকেত দেখা দিলে আমার কী করা উচিত?" },
        a: {
          en: "Do not wait for AI replies. Sudden bleeding, severe continuous abdominal pain, high fever, or blurred vision are obstetric emergencies. Immediately call the National Health Line at 16263, National Emergency at 999, or travel to the nearest Upazila Health Complex or District Hospital.",
          bn: "কোনো মোবাইল অ্যাপ বা এআইয়ের উত্তরের জন্য অপেক্ষা করবেন না। অতিরিক্ত রক্তক্ষরণ, তীব্র পেটে ব্যথা বা খিঁচুনি হলে সাথে সাথে ১৬২৬৩ (স্বাস্থ্য বাতায়ন) বা ৯৯৯ এ কল করুন অথবা নিকটস্থ উপজেলা স্বাস্থ্য কমপ্লেক্স বা হাসপাতালে চলে যান।",
        },
      },
      {
        q: { en: "Is PROHOR free to access for Bangladeshi mothers?", bn: "প্রহর কি বাংলাদেশের সকল মায়ের জন্য সম্পূর্ণ বিনামূল্যে সেবা দেয়?" },
        a: {
          en: "Yes. All public maternal education, accessibility features, and health tracking tools are completely free to use. Our mission is health equity and dignity for every mother.",
          bn: "হ্যাঁ। সকল মাতৃত্বকালীন তথ্য, স্বাস্থ্য ট্র্যাকিং এবং বিশেষ সুবিধাসমূহ সম্পূর্ণ বিনামূল্যে উন্মুক্ত।",
        },
      },
    ],
  } as const;
