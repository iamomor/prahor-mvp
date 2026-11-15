export type Language = "bn" | "en";

export const translations = {
  // Navigation & Chrome
  nav: {
    features: { en: "Features", bn: "বৈশিষ্ট্যসমূহ" },
    howItWorks: { en: "How It Works", bn: "কীভাবে কাজ করে" },
    accessibility: { en: "Accessibility", bn: "অ্যাক্সেসযোগ্যতা" },
    about: { en: "About", bn: "আমাদের সম্পর্কে" },
    trust: { en: "Trust & AI", bn: "নিরাপত্তা ও এআই" },
    forMothers: { en: "For Mothers", bn: "মা ও পরিবারের জন্য" },
    forProviders: { en: "For Providers", bn: "স্বাস্থ্যকর্মীদের জন্য" },
    faq: { en: "FAQ", bn: "সাধারণ জিজ্ঞাসা" },
    adjustAccess: { en: "Adjust Access", bn: "ব্যবহার সুবিধা" },
    accessShort: { en: "Access", bn: "সুবিধা" },
    signIn: { en: "Sign In", bn: "লগইন" },
    dangerSigns: { en: "Danger Signs", bn: "বিপদ সংকেত" },
    emergencyGuide: { en: "Emergency maternal guide:", bn: "জরুরি স্বাস্থ্য নির্দেশিকা:" },
  },

  // Emergency Top Bar
  emergencyBar: {
    urgentLabel: { en: "Urgent Help:", bn: "জরুরি সতর্কতা:" },
    urgentDesc: {
      en: "Sudden bleeding, severe continuous pain, or convulsions require immediate clinical care.",
      bn: "অতিরিক্ত রক্তক্ষরণ, তীব্র পেটে ব্যথা বা খিঁচুনি হলে অবিলম্বে হাসপাতালে যোগাযোগ করুন।",
    },
    shasthyaBatayan: { en: "Health Helpline 16263", bn: "স্বাস্থ্য বাতায়ন ১৬২৬৩" },
    emergency999: { en: "Emergency 999", bn: "জরুরি ৯৯৯" },
    guideLink: { en: "Danger signs guide", bn: "বিপদ সংকেত সহায়িকা" },
  },

  // Hero Section
  hero: {
    badge: {
      en: "Universal Adaptive AI Maternal & Child Care Ecosystem",
      bn: "সার্বজনীন অভিযোজনযোগ্য এআই মাতৃত্ব ও শিশু যত্ন ইকোসিস্টেম",
    },
    headline1: {
      en: "Maternal care designed around your life, ",
      bn: "আপনার জীবনের সাথে মানানসই মাতৃত্বকালীন যত্ন, ",
    },
    headlineAccent: {
      en: "not your limitations.",
      bn: "কোনো সীমাবদ্ধতার বাধা ছাড়াই।",
    },
    subheading: {
      en: "One unified, calm ecosystem for Bangladeshi mothers. Understand your pregnancy with evidence-grounded AI, keep mother and baby records connected, and interact your way—without ever having to declare or prove a disability.",
      bn: "বাংলাদেশের মায়েদের জন্য একটি শান্ত ও নির্ভরযোগ্য প্ল্যাটফর্ম। নির্ভরযোগ্য এআইয়ের সাহায্যে মাতৃত্বকালীন তথ্য জানুন, মা ও শিশুর স্বাস্থ্যতথ্য একসাথে রাখুন এবং নিজের সুবিধামতো ব্যবহার করুন—কোনো অক্ষমতা প্রকাশ বা প্রমাণ করা ছাড়াই।",
    },
    proofPillars: {
      zeroTiers: { en: "Zero disability tiers", bn: "কোনো ভেদাভেদ বা আলাদা স্তর নেই" },
      groundedAi: { en: "Evidence-grounded AI", bn: "চিকিৎসা প্রটোকল-ভিত্তিক এআই" },
      consent: { en: "Mother-controlled consent", bn: "মায়ের পূর্ণ নিয়ন্ত্রণ ও সম্মতি" },
    },
    ctaExplore: { en: "Explore the Ecosystem", bn: "প্ল্যাটফর্ম ঘুরে দেখুন" },
    ctaSignIn: { en: "Sign In to Records", bn: "রেকর্ডে লগইন করুন" },
    taglineLabel: { en: "Platform Tagline:", bn: "আমাদের মূলমন্ত্র:" },
    taglineText: { en: "Your Care. Your Way.", bn: "আপনার যত্ন। আপনার মতো।" },
    taglineSub: { en: "Non-diagnostic educational & care support.", bn: "রোগ নির্ণয় নয়, নির্ভরযোগ্য তথ্য ও যত্ন সমন্বয় সহায়িকা।" },
    previewCard: {
      title: { en: "Jibonrekha Preview", bn: "জীবনরেখা প্রিভিউ" },
      subtitle: { en: "24 Weeks ANC Journey", bn: "২৪তম সপ্তাহ গর্ভকালীন সেবা" },
      modeStandard: { en: "Standard", bn: "স্বাভাবিক" },
      modeContrast: { en: "High Contrast", bn: "উচ্চ কনট্রাস্ট" },
      modeAac: { en: "AAC Symbol", bn: "ছবি প্রতীক (AAC)" },
      milestoneEyebrow: { en: "Maternal Milestone", bn: "মাতৃত্বকালীন মাইলফলক" },
      milestoneTitle: { en: "Week 24 • 2nd Trimester", bn: "২৪তম সপ্তাহ • দ্বিতীয় ত্রৈমাসিক" },
      verifiedBadge: { en: "Verified ANC 2", bn: "যাচাইকৃত ANC ২" },
      bpLabel: { en: "Blood Pressure", bn: "রক্তচাপ" },
      bpStatus: { en: "Normal range", bn: "স্বাভাবিক মাত্রা" },
      fhrLabel: { en: "Fetal Heart Rate", bn: "ভ্রূণের হৃদস্পন্দন" },
      fhrStatus: { en: "Documented in clinic", bn: "ক্লিনিকে লিপিবদ্ধ" },
      guidanceTitle: { en: "Barta Grounded Guidance", bn: "বার্তা নির্ভরযোগ্য পরামর্শ" },
      guidanceBody: {
        en: "“Mild ankle swelling can be normal in week 24. Rest with legs elevated. If swelling occurs suddenly in your face or hands, check your blood pressure immediately.”",
        bn: "“২৪তম সপ্তাহে পায়ে সামান্য ফোলাভাব সাধারণ হতে পারে। পা কিছুটা উঁচুতে রেখে বিশ্রাম নিন। তবে মুখ বা হাতে হঠাৎ বেশি ফোলাভাব দেখা দিলে অবিলম্বে রক্তচাপ পরীক্ষা করান।”",
      },
      sourceLabel: {
        en: "Source: WHO Antenatal Care Guidelines • Verified by DGHS protocol",
        bn: "উৎস: বিশ্ব স্বাস্থ্য সংস্থা (WHO) ও স্বাস্থ্য অধিদপ্তর (DGHS) নির্দেশিকা",
      },
      nextVisit: { en: "Next Visit: 28 Weeks", bn: "পরবর্তী পরীক্ষা: ২৮তম সপ্তাহ" },
      demoLabel: { en: "Simulated demo card", bn: "সিমুলেটেড নমুনা কার্ড" },
      previewFooter: {
        en: "Interactive preview: The same patient data adapts seamlessly across all view modes without changing care rights.",
        bn: "ইন্টারঅ্যাক্টিভ প্রিভিউ: একই স্বাস্থ্যতথ্য সব মোডে সুন্দরভাবে প্রদর্শিত হয়, যত্নের মানে কোনো পরিবর্তন ছাড়াই।",
      },
    },
  },

  // Task Action Strip
  taskStrip: {
    eyebrow: { en: "Direct Pathways", bn: "সরাসরি ব্যবহারের পথ" },
    heading: { en: "Start with the task you need right now", bn: "আপনার প্রয়োজনীয় তথ্য দিয়ে এখনই শুরু করুন" },
    desc: {
      en: "Learn, explore features, or find support without creating an account first.",
      bn: "কোনো অ্যাকাউন্ট বা প্রোফাইল তৈরি ছাড়াই সরাসরি তথ্য জানুন ও সহায়তা নিন।",
    },
    signInPrompt: { en: "Already have an account? Sign In", bn: "অ্যাকাউন্ট আছে? লগইন করুন" },
    learnMore: { en: "Learn more", bn: "বিস্তারিত দেখুন" },
    items: [
      {
        title: { en: "Explore 8 Modules", bn: "৮টি মডিউল দেখুন" },
        desc: {
          en: "Discover how Adapt, Barta, and Jibonrekha connect care seamlessly.",
          bn: "অভিযোজন, বার্তা এবং জীবনরেখা কীভাবে যত্নকে সংযুক্ত করে তা জানুন।",
        },
        badge: { en: "System Map", bn: "সিস্টেম নকশা" },
      },
      {
        title: { en: "Grounded Health AI", bn: "নির্ভরযোগ্য স্বাস্থ্য এআই" },
        desc: {
          en: "See how Barta provides source-referenced maternal guidance.",
          bn: "বার্তা কীভাবে উৎস-নির্ভর ও নিরাপদ মাতৃত্ব বিষয়ক তথ্য প্রদান করে।",
        },
        badge: { en: "Evidence-Based", bn: "প্রমাণভিত্তিক" },
      },
      {
        title: { en: "Universal Inclusion", bn: "সার্বজনীন অন্তর্ভুক্তি" },
        desc: {
          en: "Explore independent contrast, text scale, and AAC communication.",
          bn: "উচ্চ কনট্রাস্ট, বড় লেখা এবং ছবির মাধ্যমে ভাব প্রকাশের সুবিধা।",
        },
        badge: { en: "Zero Tiers", bn: "বৈষম্যহীন" },
      },
      {
        title: { en: "For Care Providers", bn: "স্বাস্থ্যকর্মীদের জন্য" },
        desc: {
          en: "Understand structured referral queues and mother-controlled consent.",
          bn: "রোগীর গোছানো স্বাস্থ্য সারাংশ এবং অনুমতিভিত্তিক রেফারেল ব্যবস্থা।",
        },
        badge: { en: "Clinical Handoff", bn: "ক্লিনিক্যাল সমন্বয়" },
      },
    ],
  },

  // Bangladesh Context Section
  context: {
    eyebrow: { en: "Documented Healthcare Reality", bn: "বাংলাদেশের স্বাস্থ্যসেবার বাস্তব চিত্র" },
    heading: {
      en: "Why PROHOR exists: Bridging the maternal care divide in Bangladesh",
      bn: "প্রহর কেন প্রয়োজন: বাংলাদেশের মাতৃত্বকালীন সেবার দূরত্ব দূর করতে",
    },
    desc: {
      en: "Maternal healthcare in Bangladesh is improving, but deep barriers persist in timely information, communication access, rural continuity, and disability inclusion. We build for the actual conditions mothers live in.",
      bn: "বাংলাদেশে মাতৃত্বকালীন স্বাস্থ্যসেবার উন্নতি হচ্ছে, কিন্তু সঠিক সময়ে তথ্য পাওয়া, যোগাযোগের সীমাবদ্ধতা, প্রত্যন্ত অঞ্চলের বিচ্ছিন্নতা এবং বিশেষ চাহিদাসম্পন্ন মায়েদের অন্তর্ভুক্তিতে বড় বাধা রয়ে গেছে। আমরা মায়েদের বাস্তব জীবনের কথা ভেবেই প্রহর তৈরি করেছি।",
    },
    stats: [
      {
        value: "41%",
        label: { en: "ANC 4+ Completion", bn: "৪টি ANC পরীক্ষার পূর্ণতা" },
        desc: {
          en: "Only 41% of pregnant women in Bangladesh complete the minimum 4 recommended antenatal check-ups with a skilled provider.",
          bn: "বাংলাদেশে মাত্র ৪১% গর্ভবতী মা দক্ষ স্বাস্থ্যকর্মীর কাছে ন্যূনতম ৪টি গর্ভকালীন চেক-আপ সম্পন্ন করতে পারেন।",
        },
        citation: { en: "BDHS 2022 (Demographic & Health Survey)", bn: "বিডিএইচএস ২০২২ (বাংলাদেশ জনমিতি ও স্বাস্থ্য জরিপ)" },
      },
      {
        value: "35%",
        label: { en: "Deliveries Outside Facilities", bn: "হাসপাতালের বাইরে প্রসব" },
        desc: {
          en: "Over one-third of births occur at home, where early warning signs and emergency obstetric complications often go unmonitored.",
          bn: "এক-তৃতীয়াংশের বেশি প্রসব বাড়িতে সম্পন্ন হয়, যেখানে জরুরি জটিলতা দ্রুত শনাক্তের সুযোগ সীমিত।",
        },
        citation: { en: "National Health Report / BDHS 2022", bn: "জাতীয় স্বাস্থ্য প্রতিবেদন / বিডিএইচএস ২০২২" },
      },
      {
        value: "153",
        label: { en: "Maternal Deaths per 100k", bn: "মাতৃমৃত্যুর হার (প্রতি লাখে)" },
        desc: {
          en: "Maternal mortality ratio remains high at ~153 deaths per 100,000 live births, primarily from preventable hemorrhage and eclampsia.",
          bn: "প্রতি ১ লাখ জীবিত জন্মে মাতৃমৃত্যুর হার প্রায় ১৫৩, যার সিংহভাগই অতিরিক্ত রক্তক্ষরণ ও এক্লাম্পশিয়ার মতো প্রতিরোধযোগ্য কারণে ঘটে।",
        },
        citation: { en: "BMMS 2023 / WHO Monitoring", bn: "বিএমএমএস ২০২৩ / ডব্লিউএইচও মনিটরিং" },
      },
      {
        value: "34%",
        label: { en: "Mobile Internet Gender Gap", bn: "মোবাইল ইন্টারনেটে জেন্ডার ব্যবধান" },
        desc: {
          en: "Women in South Asia face significant barriers in personal smartphone ownership; phones are frequently shared among family members.",
          bn: "দক্ষিণ এশিয়ায় নারীদের ব্যক্তিগত স্মার্টফোন ব্যবহারের হার তুলনামূলক কম; পরিবারে ফোন ভাগাভাগি করে ব্যবহার করা সাধারণ বিষয়।",
        },
        citation: { en: "GSMA Mobile Gender Gap Report 2024", bn: "জিএসএমএ মোবাইল জেন্ডার গ্যাপ রিপোর্ট ২০২৪" },
      },
    ],
    pillars: [
      {
        title: { en: "1. The Disability Inclusion Void", bn: "১. বিশেষ চাহিদাসম্পন্ন মায়েদের অন্তর্ভুক্তি" },
        desc: {
          en: "Mothers with speech, hearing, visual, physical, or neurodivergent needs are routinely excluded by standard health portals. PROHOR offers multi-modal interaction so every mother receives the same quality care.",
          bn: "দৃষ্টি, শ্রবণ, বাক বা শারীরিক সীমাবদ্ধতা সম্পন্ন মায়েরা সাধারণ স্বাস্থ্য পোর্টাল থেকে প্রায়ই বঞ্চিত হন। প্রহর বহুমুখী ইন্টারঅ্যাকশন প্রদান করে যাতে সবাই সমান সেবা পান।",
        },
      },
      {
        title: { en: "2. Shared Device Privacy", bn: "২. যৌথ ডিভাইসে ব্যক্তিগত গোপনীয়তা" },
        desc: {
          en: "When phones are shared across in-laws or spouses, private diary reflections and personal health questions need strict safeguarding. PROHOR keeps private records protected with explicit consent gates.",
          bn: "পরিবারে ফোন ভাগাভাগি করা হলে ব্যক্তিগত ডায়েরি ও স্বাস্থ্য সংক্রান্ত তথ্য গোপন রাখা জরুরি। প্রহর সম্মতিভিত্তিক সুরক্ষায় এসব তথ্য সম্পূর্ণ ব্যক্তিগত রাখে।",
        },
      },
      {
        title: { en: "3. AI Safety & Grounded Sources", bn: "৩. এআই নিরাপত্তা ও তথ্যসূত্র" },
        desc: {
          en: "Generic chatbots generate hallucinations that endanger lives. PROHOR's Barta AI uses retrieval-augmented generation tied to WHO and Bangladesh DGHS clinical guidelines, abstaining from dangerous diagnoses.",
          bn: "সাধারণ চ্যাটবটের মনগড়া উত্তর জীবনের ঝুঁকি তৈরি করে। প্রহরের বার্তা এআই বিশ্ব স্বাস্থ্য সংস্থা ও স্বাস্থ্য অধিদপ্তরের নির্দেশিকা মেনে চলে এবং অনুমানের ভিত্তিতে প্রেসক্রিপশন দেয় না।",
        },
      },
    ],
  },

  // Adaptability Showcase
  adaptability: {
    eyebrow: { en: "Core Architectural Differentiator", bn: "আমাদের মৌলিক স্থাপত্য" },
    heading: { en: "One shared platform. Many ways to interact.", bn: "একটিমাত্র প্ল্যাটফর্ম। ব্যবহারের বহু মাধ্যম।" },
    desc: {
      en: "We reject the flawed model of having a 'Standard Care' app for some mothers and a 'Special/Disabled' portal for others. In PROHOR, every mother uses the same care journeys through the interaction methods she chooses.",
      bn: "আমরা মায়েদের 'সাধারণ' বা 'বিশেষ' স্তরে বিভক্ত করার ধারণাকে সম্পূর্ণ প্রত্যাখ্যান করি। প্রহরে সব মা একই স্বাস্থ্যসেবা গ্রহণ করেন, নিজের পছন্দের মাধ্যমে।",
    },
    principles: [
      {
        bold: { en: "No Forced Medical Disclosure:", bn: "কোনো অক্ষমতা প্রকাশের বাধ্যবাধকতা নেই:" },
        text: {
          en: "You never have to state or certify a disability. Preferences live locally and adapt on demand.",
          bn: "আপনাকে কোনো মেডিকেল সার্টিফিকেট দিতে হবে না। সুবিধাসমূহ আপনার ডিভাইসেই সংরক্ষিত থাকে।",
        },
      },
      {
        bold: { en: "Independent Controls:", bn: "স্বাধীন নিয়ন্ত্রণ ব্যবস্থা:" },
        text: {
          en: "Theme, contrast, font scaling, motion, and AAC combine freely without resetting inputs or changing care access.",
          bn: "থিম, কনট্রাস্ট, ফন্ট সাইজ এবং ছবির মাধ্যমে যোগাযোগ স্বাধীনভাবে মিলিয়ে ব্যবহার করা যায়।",
        },
      },
      {
        bold: { en: "Full Keyboard & Screen-Reader Parity:", bn: "স্ক্রিন রিডার ও কীবোর্ড সহায়তা:" },
        text: {
          en: "Baseline semantic HTML works seamlessly with NVDA, VoiceOver, and TalkBack.",
          bn: "সব ব্রাউজারে টকব্যক, এনভিডিএ বা ভয়েসওভার দিয়ে অনায়াসে চালানো যায়।",
        },
      },
    ],
    simulator: {
      title: { en: "Test Live Adaptability Modes", bn: "ব্যবহারের বিভিন্ন মোড পরীক্ষা করুন" },
      badge: { en: "Interactive Simulator", bn: "লাইভ সিমুলেটর" },
      taskEyebrow: { en: "Care Task • Antenatal Check-up 3 (ANC 3)", bn: "স্বাস্থ্যসেবা কাজ • ৩য় গর্ভকালীন পরীক্ষা (ANC ৩)" },
      taskTitleStandard: { en: "Third Trimester Health & Ultrasound Review", bn: "তৃতীয় ত্রৈমাসিকের স্বাস্থ্য ও আল্ট্রাসাউন্ড পর্যালোচনা" },
      taskTitleSimplified: { en: "ডাক্তার দেখানোর প্রস্তুতি (২৮তম সপ্তাহ)", bn: "ডাক্তার দেখানোর প্রস্তুতি (২৮তম সপ্তাহ)" },
      simplifiedList: [
        { en: "Count baby movements regularly in week 28.", bn: "২৮তম সপ্তাহে শিশুর নড়াচড়া নিয়মিত পর্যবেক্ষণ করুন।" },
        { en: "Report dizziness, severe headache or blurred vision immediately.", bn: "মাথা ঘোরা, তীব্র মাথাব্যথা বা চোখে ঝাপসা দেখলে সাথে সাথে স্বাস্থ্যকর্মীকে জানান।" },
        { en: "Bring all previous test reports to your clinic visit.", bn: "ক্লিনিকে যাওয়ার সময় আগের সব পরীক্ষার রিপোর্ট সাথে রাখুন।" },
      ],
      aacPrompt: {
        en: "Picture-and-text tiles enable non-speaking or non-reading mothers to express symptoms and review visit items with clinical dignity:",
        bn: "ছবি ও লেখার প্রতীক ব্যবহার করে কথা বলতে না পারা বা পড়তে না পারা মায়েরা নিজের লক্ষণ প্রকাশ করতে পারেন:",
      },
      tiles: [
        { emoji: "🩺", label: { en: "Check Heartbeat", bn: "হৃদস্পন্দন পরীক্ষা" }, bnSub: "হৃদস্পন্দন পরীক্ষা" },
        { emoji: "🩸", label: { en: "Blood Pressure", bn: "রক্তচাপ মাপা" }, bnSub: "রক্তচাপ মাপা" },
        { emoji: "🦶", label: { en: "Swollen Feet", bn: "পা ফুলে যাওয়া" }, bnSub: "পা ফুলে যাওয়া" },
        { emoji: "❓", label: { en: "Ask Question", bn: "প্রশ্ন করা" }, bnSub: "প্রশ্ন করা" },
      ],
      standardBody: {
        en: "In your 28th week, monitoring fetal movement counts after meals is recommended. Ensure your complete blood count (CBC) test report is reviewed for gestational anemia.",
        bn: "২৮তম সপ্তাহে খাবারের পর শিশুর নড়াচড়া খেয়াল রাখা প্রয়োজন। রক্তস্বল্পতা (অ্যানিমিয়া) আছে কি না তা জানতে সিবিসি টেস্টের রিপোর্ট ডাক্তারকে দেখান।",
      },
      cardFooter: {
        en: "Same Database Record • Zero Degraded Tiers",
        bn: "একই ডাটাবেজ রেকর্ড • মানের কোনো তারতম্য নেই",
      },
    },
  },

  // Journey Walkthrough
  journey: {
    eyebrow: { en: "The Mother Journey", bn: "মায়ের সার্বিক যাত্রা" },
    heading: { en: "How PROHOR accompanies you at every stage", bn: "প্রহর কীভাবে প্রতিটি ধাপে আপনার পাশে থাকে" },
    desc: {
      en: "From the initial curiosity of early pregnancy to postpartum infant care, every step is built around autonomy, verified medical provenance, and human-in-the-loop safety.",
      bn: "গর্ভধারণের প্রথম মুহূর্ত থেকে শুরু করে সন্তান জন্মের পর যত্ন পর্যন্ত প্রতিটি ধাপেই আপনার স্বাধীনতা, সঠিক তথ্য ও চিকিৎসকের পরামর্শ নিশ্চিত করা হয়।",
    },
    stepXof4: { en: "Step %d of 4", bn: "ধাপ %d (মোট ৪টি)" },
    readFullGuide: { en: "Read our detailed step-by-step care journey guide", bn: "আমাদের বিস্তারিত স্বাস্থ্যসেবা সহায়িকা পড়ুন" },
    steps: [
      {
        step: "01",
        title: { en: "Set Your Comfort", bn: "আপনার সুবিধা নির্ধারণ" },
        module: { en: "Adapt Engine", bn: "অভিযোজন ইঞ্জিন" },
        desc: {
          en: "From the very first screen, adjust font scale, contrast, audio read-aloud, or symbol communication. No medical sign-up or disability disclosure is required.",
          bn: "প্রথম স্ক্রিন থেকেই লেখার সাইজ, কনট্রাস্ট বা প্রতীক নির্বাচন করুন। কোনো মেডিকেল শর্ত বা তথ্য দেওয়ার প্রয়োজন নেই।",
        },
      },
      {
        step: "02",
        title: { en: "Learn with Grounded AI", bn: "নির্ভরযোগ্য এআই দিয়ে জানুন" },
        module: { en: "Barta Assistant", bn: "বার্তা সহকারী" },
        desc: {
          en: "Ask pregnancy questions in conversational Bangla or English. Barta answers with verified citations from WHO and DGHS Bangladesh, safely refusing to hallucinate diagnoses.",
          bn: "সহজ বাংলায় মাতৃত্ব সংক্রান্ত প্রশ্ন করুন। বার্তা বিশ্ব স্বাস্থ্য সংস্থা ও স্বাস্থ্য অধিদপ্তরের তথ্যের ভিত্তিতে নিরাপদ উত্তর প্রদান করে।",
        },
      },
      {
        step: "03",
        title: { en: "Track Records Together", bn: "স্বাস্থ্যতথ্য সংরক্ষণ" },
        module: { en: "Jibonrekha & Bujhi", bn: "জীবনরেখা ও বুঝি" },
        desc: {
          en: "Scan diagnostic papers and lab reports. Bujhi assists with OCR extraction while ensuring human verification before saving into separate maternal and infant timelines.",
          bn: "প্রেসক্রিপশন ও রিপোর্টের ছবি তুলুন। বুঝি এগুলো পড়ে প্রয়োজনীয় তথ্য সাজিয়ে দেয়, যা যাচাই করে তবেই সেভ করা হয়।",
        },
      },
      {
        step: "04",
        title: { en: "Connect with Human Care", bn: "স্বাস্থ্যকর্মীর সাথে যোগাযোগ" },
        module: { en: "Bondhon & Poth", bn: "বন্ধন ও পথ" },
        desc: {
          en: "Locate accredited clinics with verified ramp and female doctor availability. Share health summaries with trusted companions or community health workers under explicit consent.",
          bn: "হুইলচেয়ার র‍্যাম্প ও নারী ডাক্তার আছে এমন হাসপাতাল খুঁজুন। আপনার অনুমতি অনুযায়ী পরিবারের সদস্যদের সাথে স্বাস্থ্য সারাংশ শেয়ার করুন।",
        },
      },
    ],
  },

  // 8 Modules Editorial Grid
  modulesGrid: {
    eyebrow: { en: "The Product Ecosystem", bn: "প্রোডাক্ট ইকোসিস্টেম" },
    heading: { en: "Eight interconnected modules working as one calm experience", bn: "৮টি সংযুক্ত মডিউল কাজ করে একটি শান্ত প্ল্যাটফর্ম হিসেবে" },
    desc: {
      en: "Engineered as specialized domains that share a single authentication system, universal access engine, and maternal consent model.",
      bn: "প্রতিটি মডিউল একটি মূল প্ল্যাটফর্মের সাথে যুক্ত, যেখানে রয়েছে একক সাইন-ইন, সার্বজনীন সুবিধা এবং মায়ের অনুমতিভিত্তিক নিয়ন্ত্রণ।",
    },
    exploreBtn: { en: "Explore Feature Breakdown", bn: "মডিউলগুলোর বিস্তারিত দেখুন" },
    impactLabel: { en: "Real-World Impact", bn: "বাস্তব জীবনের উপকারিতা" },
    pillars: [
      {
        title: { en: "Pillar 1: Inclusive Access & Grounded AI", bn: "স্তম্ভ ১: অন্তর্ভুক্তি ও নির্ভরযোগ্য এআই" },
        modules: [
          {
            name: "Adapt",
            bnName: "অভিযোজন",
            tagline: { en: "Universal Interaction Preferences", bn: "সার্বজনীন ব্যবহার সুবিধা ইঞ্জিন" },
            status: { en: "Working MVP", bn: "সক্রিয় এমভিপি" },
            summary: {
              en: "Allows mothers to adjust contrast, layout spacing, text size, animation, and symbol-assisted communication on demand without ever being classified into a disability tier.",
              bn: "মায়েদের কনট্রাস্ট, স্পেসিং, ফন্ট সাইজ বা প্রতীকভিত্তিক যোগাযোগ ব্যবহারের স্বাধীনতা দেয়, কোনো অক্ষমতার লেবেল ছাড়াই।",
            },
            impact: {
              en: "A mother with low vision or hand tremors navigates with the same speed and autonomy as any other user.",
              bn: "কম দৃষ্টিশক্তি বা হাত কাঁপাকাঁপির সমস্যা থাকা একজন মা-ও সমান গতি ও স্বাধীনতায় অ্যাপটি ব্যবহার করতে পারেন।",
            },
          },
          {
            name: "Barta",
            bnName: "বার্তা",
            tagline: { en: "Source-Grounded Maternal Education", bn: "উৎস-নির্ভর মাতৃত্বকালীন শিক্ষা এআই" },
            status: { en: "RAG Prototype", bn: "আরএজি প্রোটোটাইপ" },
            summary: {
              en: "Conversational Bangla-first maternal AI answering questions with direct citations to WHO and DGHS clinical protocols. Safely abstains from ungrounded symptom triage.",
              bn: "বাংলা ভাষায় মাতৃত্ব বিষয়ক প্রশ্নের উত্তর দেয় সরাসরি বিশ্ব স্বাস্থ্য সংস্থা ও স্বাস্থ্য অধিদপ্তরের গাইডলাইনের রেফারেন্স সহ।",
            },
            impact: {
              en: "Instant clarification on nutrition, medication safety, or trimester changes with visible clinical citations.",
              bn: "খাদ্যতালিকায় পুষ্টি, ওষুধের নিরাপত্তা বা ত্রৈমাসিকের পরিবর্তন বিষয়ে তাৎক্ষণিক নির্ভরযোগ্য ব্যাখ্যা।",
            },
          },
        ],
      },
      {
        title: { en: "Pillar 2: Emergency Safety & Report Understanding", bn: "স্তম্ভ ২: জরুরি নিরাপত্তা ও রিপোর্ট অনুধাবন" },
        modules: [
          {
            name: "Shonket",
            bnName: "সংকেত",
            tagline: { en: "Emergency Signals & Rapid Care Escalation", bn: "জরুরি সংকেত ও তাৎক্ষণিক সহায়তা" },
            status: { en: "Clinician Reviewed", bn: "চিকিৎসক দ্বারা পরীক্ষিত" },
            summary: {
              en: "Direct, reviewed safety checklists and immediate national hotline links (16263, 999). Never forces critical life-threatening decisions through a chatbot.",
              bn: "বিপদ সংকেতের স্পষ্ট তালিকা এবং সরাসরি ১৬২৬৩ ও ৯৯৯ হটলাইনে কল করার ব্যবস্থা। জরুরি পরিস্থিতিতে চ্যাটবটের ওপর নির্ভরশীল করে না।",
            },
            impact: {
              en: "Instant clarity on when bleeding, severe fever, or vision changes require an emergency ambulance.",
              bn: "রক্তক্ষরণ, তীব্র জ্বর বা চোখে ঝাপসা দেখলে কখন জরুরি হাসপাতালে যেতে হবে তার তাৎক্ষণিক নির্দেশনা।",
            },
          },
          {
            name: "Bujhi",
            bnName: "বুঝি",
            tagline: { en: "Accessible Diagnostic Report Comprehension", bn: "সহজ ভাষায় মেডিকেল রিপোর্ট অনুধাবন" },
            status: { en: "OCR Demonstration", bn: "ওসিআর ডেমো" },
            summary: {
              en: "Assists mothers in scanning paper lab reports, extracting diagnostic values, and translating complex medical jargon into plain Bangla. Requires user verification before saving.",
              bn: "কাগজের রিপোর্ট স্ক্যান করে জটিল মেডিকেল পরিভাষাকে সহজ বাংলায় বুঝিয়ে দেয় এবং যাচাইয়ের পর তা সংরক্ষণ করে।",
            },
            impact: {
              en: "Mothers understand their hemoglobin or ultrasound results before stepping into the doctor's office.",
              bn: "ডাক্তারের কাছে যাওয়ার আগেই মায়েরা নিজের হিমোগ্লোবিন বা আল্ট্রাসাউন্ড রিপোর্টের অর্থ বুঝতে পারেন।",
            },
          },
        ],
      },
      {
        title: { en: "Pillar 3: Dual Records & Daily Wellbeing", bn: "স্তম্ভ ৩: মা-শিশুর দ্বৈত রেকর্ড ও দৈনন্দিন সুস্থতা" },
        modules: [
          {
            name: "Jibonrekha",
            bnName: "জীবনরেখা",
            tagline: { en: "Connected Maternal & Infant Longitudinal Timeline", bn: "মা ও শিশুর সংযুক্ত স্বাস্থ্য টাইমলাইন" },
            status: { en: "Core Architecture", bn: "মূল স্থাপত্য" },
            summary: {
              en: "Maintains distinct medical records for the mother and her baby while linking them in one unified timeline. Differentiates self-entered notes from verified clinical tests.",
              bn: "মা ও সন্তানের আলাদা মেডিকেল তথ্য একটি অভিন্ন টাইমলাইনে সাজিয়ে রাখে, স্ব-লিখিত নোট ও ক্লিনিক্যাল টেস্টকে আলাদাভাবে চিহ্নিত করে।",
            },
            impact: {
              en: "No lost antenatal paperwork when shifting from pregnancy check-ups to pediatric vaccinations.",
              bn: "গর্ভকালীন চেক-আপ থেকে শিশুর টিকা নেওয়ার সময় পুরোনো রিপোর্ট হারানোর কোনো ভয় থাকে না।",
            },
          },
          {
            name: "Shusthota",
            bnName: "সুস্থতা",
            tagline: { en: "Adaptive Wellness & Private Emotional Diary", bn: "অভিযোজিত সুস্থতা ও ব্যক্তিগত ডায়েরি" },
            status: { en: "Working Prototype", bn: "সক্রিয় প্রোটোটাইপ" },
            summary: {
              en: "Gentle physical rest, hydration, and emotional mood check-ins without competitive step goals. The private diary remains strictly confidential and is never shared by default.",
              bn: "১০,০০০ স্টেপের কোনো বাধ্যবাধকতা নেই; বিশ্রাম, পর্যাপ্ত পানি পান ও মানসিক স্বস্তির খোঁজ নেওয়া হয়। ব্যক্তিগত ডায়েরি সম্পূর্ণ গোপন থাকে।",
            },
            impact: {
              en: "Postpartum emotional support without judgment, guilt, or unwanted family visibility.",
              bn: "প্রসব-পরবর্তী মানসিক অনুভূতিগুলো কোনো ভয় বা পরিবারের অযাচিত নজরদারি ছাড়া প্রকাশ করার সুযোগ।",
            },
          },
        ],
      },
      {
        title: { en: "Pillar 4: Care Navigation & Consent Circle", bn: "স্তম্ভ ৪: ক্লিনিক খোঁজ ও আত্মীয়-সহায়তা বৃত্ত" },
        modules: [
          {
            name: "Poth",
            bnName: "পথ",
            tagline: { en: "Verified Healthcare Facility Directory", bn: "যাচাইকৃত স্বাস্থ্যকেন্দ্র ডিরেক্টরি" },
            status: { en: "Directory Framework", bn: "ডিরেক্টরি কাঠামো" },
            summary: {
              en: "Geo-aware clinic finder displaying verified physical accessibility (wheelchair ramps, accessible toilets, female doctor availability, emergency obstetric care readiness).",
              bn: "হুইলচেয়ার র‍্যাম্প, উপযুক্ত টয়লেট, নারী ডাক্তার এবং জরুরি প্রসব সেবার উপস্থিতি যাচাই করে ক্লিনিকের তথ্য প্রদর্শন করে।",
            },
            impact: {
              en: "Eliminates the anxiety of traveling to a clinic only to discover stairs without ramp access.",
              bn: "ক্লিনিকে পৌঁছানোর পর সিঁড়ি দেখে ফিরে আসার মতো দুর্ভোগ আর পোহাতে হয় না।",
            },
          },
          {
            name: "Bondhon",
            bnName: "বন্ধন",
            tagline: { en: "Granular Consent & Care Circle Handoff", bn: "সম্মতিভিত্তিক সহায়তা ও স্বাস্থ্যকর্মী সমন্বয়" },
            status: { en: "Consent Architecture", bn: "সম্মতি স্থাপত্য" },
            summary: {
              en: "Allows the mother to authorize family supporters or community health workers to view specific records. Every share requires explicit consent with instant one-tap revocation.",
              bn: "মা নিজেই নির্ধারণ করেন পরিবারের কোন সদস্য কোন রিপোর্ট দেখতে পাবেন। যেকোনো সময় এক ক্লিকেই অনুমতি বাতিল করা যায়।",
            },
            impact: {
              en: "Husbands or midwives can assist with visit prep without gaining access to private emotional logs.",
              bn: "স্বামী বা মিডওয়াইফ প্রয়োজনীয় রিপোর্ট দেখে সহায়তা করতে পারেন, কিন্তু মায়ের ব্যক্তিগত ডায়েরি গোপনই থাকে।",
            },
          },
        ],
      },
    ],
  },

  // Dual Timeline Spotlight
  dualTimeline: {
    eyebrow: { en: "Jibonrekha Care Continuity", bn: "জীবনরেখা স্বাস্থ্য ধারাবাহিকতা" },
    heading: { en: "Connected yet distinct: Honoring both mother and child", bn: "সংযুক্ত কিন্তু পৃথক: মা ও শিশু উভয়ের প্রতি শ্রদ্ধা" },
    desc: {
      en: "In conventional systems, maternal healthcare often disappears after delivery, with all focus shifting to the newborn. PROHOR models the mother and child as distinct medical entities who share an unbreakable biological and emotional journey.",
      bn: "সাধারণ সিস্টেমে সন্তান প্রসবের পর মায়ের স্বাস্থ্যের খোঁজ কেউ রাখে না, সব মনোযোগ শিশুর দিকে চলে যায়। প্রহরে মা এবং শিশু দুজনকেই আলাদা গুরুত্ব দিয়ে একসাথে দেখা হয়।",
    },
    cardTitle: { en: "Jibonrekha Architecture", bn: "জীবনরেখা স্থাপত্য" },
    cardSub: { en: "Dual Longitudinal Records", bn: "দ্বৈত ধারাবাহিক রেকর্ড" },
    maternalTrack: { en: "Maternal Record", bn: "মায়ের স্বাস্থ্য রেকর্ড" },
    infantTrack: { en: "Infant Record", bn: "শিশুর স্বাস্থ্য রেকর্ড" },
    features: [
      {
        title: { en: "1. Separate Medical Records", bn: "১. পৃথক মেডিকেল রেকর্ড" },
        desc: {
          en: "The mother owns her personal records, lab results, and mental wellness. Her baby has their own distinct immunization passport, growth tracker, and pediatric notes.",
          bn: "মায়ের নিজের ল্যাব টেস্ট, রক্তচাপ ও মানসিক স্বাস্থ্যের রেকর্ড সংরক্ষিত থাকে; আর শিশুর জন্য থাকে আলাদা টিকার তালিকা ও বৃদ্ধির চার্ট।",
        },
      },
      {
        title: { en: "2. Clear Provenance Labeling", bn: "২. তথ্যের উৎসের স্পষ্ট বিবরণ" },
        desc: {
          en: "Every entry clearly identifies whether it was Self-Reported by the mother, Extracted via Bujhi OCR, or Confirmed by a Clinician.",
          bn: "প্রতিটি তথ্য মা নিজে লিখেছেন, বুঝি ওসিআর দিয়ে স্ক্যান করা হয়েছে, নাকি ডাক্তার নিশ্চিত করেছেন—তা স্পষ্টভাবে উল্লেখ থাকে।",
        },
      },
      {
        title: { en: "3. Lifetime Export & Portability", bn: "৩. লাইফটাইম এক্সপোর্ট ও প্রিন্ট" },
        desc: {
          en: "Export the entire pregnancy and newborn history in an accessible, printable PDF format before visiting a new clinic or moving between districts.",
          bn: "অন্য হাসপাতালে যাওয়ার আগে যেকোনো সময় পুরো প্রেগন্যান্সি ও শিশুর টিকাদান হিস্ট্রি এক ক্লিকে পিডিএফ ডাউনলোড করা যায়।",
        },
      },
    ],
    readMoreLink: { en: "Read how Jibonrekha prevents postpartum drop-off", bn: "জীবনরেখা কীভাবে প্রসব-পরবর্তী সেবায় সহায়তা করে জানুন" },
  },

  // AI Integrity Section
  aiIntegrity: {
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
  },

  // Persona Demonstration
  persona: {
    eyebrow: { en: "Accessibility in Action", bn: "বাস্তবে অন্তর্ভুক্তি" },
    heading: { en: "Two mothers. One shared healthcare journey.", bn: "দুজন মা। একটি অভিন্ন স্বাস্থ্যসেবা যাত্রা।" },
    desc: {
      en: "See how two Bangladeshi mothers with completely different sensory and communication preferences complete the exact same clinical care preparation without ever encountering a separate or inferior interface.",
      bn: "দেখুন কীভাবে ভিন্ন ভিন্ন শারীরিক বা যোগাযোগের চাহিদা থাকা দুজন মা একই মানের স্বাস্থ্যসেবা প্রস্তুতি গ্রহণ করছেন, কোনো সীমাবদ্ধতা ছাড়াই।",
    },
    fatima: {
      name: { en: "Fatima, 26 • Sylhet", bn: "ফাতেমা, ২৬ • সিলেট" },
      pref: { en: "Preferences: High Contrast + Audio Read-Aloud + Large Text", bn: "পছন্দ: উচ্চ কনট্রাস্ট + ভয়েস রিড-আউট + বড় লেখা" },
      desc: {
        en: "Fatima has congenital low vision and prefers high-contrast dark-mode surfaces with large scalable typography and screen reader speech narration.",
        bn: "ফাতেমার দৃষ্টিশক্তি কিছুটা ক্ষীণ; তিনি উচ্চ কনট্রাস্টের কালো ব্যাকগ্রাউন্ড এবং স্ক্রিন রিডারের মাধ্যমে শুনে শুনে তথ্য পড়তে পছন্দ করেন।",
      },
      points: [
        { en: "Enables Higher Contrast and Extra-Large Font in 1 tap from the top navigation.", bn: "টপ নেভিগেশন থেকে এক ক্লিকেই উচ্চ কনট্রাস্ট ও বড় ফন্ট নির্বাচন করেন।" },
        { en: "Navigates the Jibonrekha timeline using full keyboard tab stops and standard TalkBack gestures.", bn: "কীবোর্ড ও টকব্যক স্ক্রিন রিডার ব্যবহার করে সহজেই টাইমলাইন ব্রাউজ করেন।" },
        { en: "Listens to Barta explain her hemoglobin lab test using synthesized clear Bengali speech.", bn: "বার্তা থেকে স্পষ্ট বাংলায় নিজের রক্তের হিমোগ্লোবিন রিপোর্টের ব্যাখ্যা শোনেন।" },
      ],
      sampleOutput: {
        en: "“Next ANC visit scheduled: 28 Weeks at Sylhet MAG Osmani Medical College.”",
        bn: "“পরবর্তী গর্ভকালীন ভিজিট: ২৮তম সপ্তাহে, সিলেট এমএজি ওসমানী মেডিকেল কলেজ হাসপাতালে।”",
      },
    },
    nusrat: {
      name: { en: "Nusrat, 29 • Dhaka", bn: "নুসরাত, ২৯ • ঢাকা" },
      pref: { en: "Preferences: Standard Palette + Symbol AAC + Spacious Layout", bn: "পছন্দ: সাধারণ থিম + ছবি প্রতীক (AAC) + প্রশস্ত বাটন" },
      desc: {
        en: "Nusrat has cerebral palsy affecting motor speech and fine motor control. She uses spacious touch targets and symbol-assisted AAC to express symptoms.",
        bn: "নুসরাতের সেরেব্রাল পলসি থাকার কারণে স্পষ্ট কথা বলা ও নিখুঁত স্পর্শে সমস্যা হয়। তিনি ছবির প্রতীক ও বড় বাটন ব্যবহার করে নিজের লক্ষণ প্রকাশ করেন।",
      },
      points: [
        { en: "Enables Spacious Layout to enlarge button gaps to 48px+ for comfortable touch accuracy.", bn: "ভুল জায়গায় স্পর্শ এড়াতে প্রশস্ত লেআউট সক্রিয় করে বাটনের দূরত্ব বাড়িয়ে নেন।" },
        { en: "Selects AAC symbol tiles (Nausea, Swollen Ankle, Blood Pressure) to assemble doctor questions without typing.", bn: "টাইপ করার বদলে ছবি ও চিহ্নের মাধ্যমে ডাক্তারের জন্য নিজের প্রশ্নমালা তৈরি করেন।" },
        { en: "Generates a clean, printed clinic summary to hand directly to her attending obstetrician.", bn: "ক্লিনিকে গিয়ে সরাসরি ডাক্তারের হাতে তুলে দেওয়ার মতো একটি পরিচ্ছন্ন সারাংশ প্রিন্ট করেন।" },
      ],
    },
    takeaway: {
      en: "Both Fatima and Nusrat access the exact same medical database, receive the same quality of healthcare insights, and retain total sovereignty over their maternal journey.",
      bn: "ফাতেমা এবং নুসরাত উভয়েই একই মেডিকেল ডাটাবেজ ব্যবহার করেন এবং নিজেদের স্বাস্থ্যযাত্রায় পূর্ণ মর্যাদা ও স্বাধীনতা উপভোগ করেন।",
    },
  },

  // Shusthota Section
  shusthota: {
    eyebrow: { en: "Adaptive Maternal Wellbeing", bn: "অভিযোজিত মাতৃত্বকালীন সুস্থতা" },
    heading: { en: "Wellness without guilt, pressure, or universal step targets", bn: "কোনো চাপ বা বাধ্যতামূলক ১০,০০০ স্টেপের টার্গেট ছাড়াই সুস্থতা" },
    desc: {
      en: "Standard health apps penalize mothers who cannot walk 10,000 steps a day due to pelvic pain, bed rest, or physical disabilities. PROHOR’s Shusthota module reframes wellness around your body’s actual capacity for rest, hydration, and emotional peace.",
      bn: "সাধারণ ফিটনেস অ্যাপগুলোতে দিনে ১০ হাজার পা হাঁটার জন্য তাগাদা দেওয়া হয়, যা অনেক মা বা বিশেষ চাহিদাসম্পন্ন মানুষের পক্ষে অসম্ভব। প্রহরে সুস্থতা মানে পর্যাপ্ত ঘুম, পানি পান এবং মানসিক প্রশান্তি।",
    },
    points: [
      {
        bold: { en: "Zero Movement Shaming:", bn: "চলাচলে কোনো চাপ নেই:" },
        text: { en: "Restful hours on bedrest are celebrated as essential maternal self-care, not missed exercise quotas.", bn: "বিছানায় বিশ্রাম নেওয়াকে ঘাটতি নয়, বরং জরুরি যত্ন হিসেবে গুরুত্ব দেওয়া হয়।" },
      },
      {
        bold: { en: "Private Emotional Diary:", bn: "গোপন মানসিক ডায়েরি:" },
        text: { en: "A sacred personal space for thoughts, fears, and postpartum reflections that is never shared with doctors or companions by default.", bn: "নিজের অনুভূতি ও ভয় প্রকাশ করার নিরাপদ স্থান, যা কখনোই অন্য কারো কাছে শেয়ার করা হয় না।" },
      },
      {
        bold: { en: "Voluntary & Non-Diagnostic:", bn: "স্বেচ্ছাধীন ও রোগনির্ণয়হীন:" },
        text: { en: "Mood logs never produce algorithmic clinical diagnoses. If persistent sadness is logged, PROHOR gently surfaces trusted human counseling contacts.", bn: "মন খারাপ হলে কোনো জটিল অ্যালগরিদম রোগ ঘোষণা করে না, বরং প্রয়োজনে মানসিক কাউন্সেলিং হটলাইনের সন্ধান দেয়।" },
      },
    ],
    cardTitle: { en: "Shusthota Daily Log", bn: "সুস্থতা দৈনিক নোট" },
    cardSub: { en: "Gentle Holistic Check-in", bn: "সহজ ও শান্ত খোঁজখবর" },
    waterVal: { en: "6 Glasses", bn: "৬ গ্লাস পানি" },
    waterLabel: { en: "Hydration Goal", bn: "পানি পানের মাত্রা" },
    sleepVal: { en: "8.5 Hours", bn: "৮.৫ ঘণ্টা" },
    sleepLabel: { en: "Rest & Sleep", bn: "বিশ্রাম ও ঘুম" },
    moodVal: { en: "Calm & Hopeful", bn: "শান্ত ও আশাবাদী" },
    moodLabel: { en: "Today's Feeling", bn: "আজকের অনুভূতি" },
    diaryTitle: { en: "Private Mother's Diary", bn: "মায়ের ব্যক্তিগত ডায়েরি" },
    confidential: { en: "Strictly Confidential", bn: "সম্পূর্ণ গোপন" },
    diaryQuote: {
      en: "“Felt the baby kick twice during evening tea today. It brought so much joy after an exhausting morning...”",
      bn: "“আজ বিকেলে চা খাওয়ার সময় পেটে ছোট্ট নড়াচড়া অনুভব করলাম। সকালের ক্লান্তিটা এক নিমেষেই মুছে গেল...”",
    },
    diaryFooter: {
      en: "Encrypted locally • Hidden from companions • Never sent to AI",
      bn: "আপনার ফোনে এনক্রিপ্ট করা • অন্য কেউ দেখতে পারবে না • এআইয়ের কাছে পাঠানো হয় না",
    },
  },

  // Bondhon Section
  bondhon: {
    eyebrow: { en: "Dignified Human Care Handoff", bn: "সম্মানজনক স্বাস্থ্যকর্মী সমন্বয়" },
    heading: { en: "Technology supports. Humans deliver the actual care.", bn: "প্রযুক্তি পাশে থাকে। যত্ন পৌঁছে দেন চিকিৎসক ও স্বজনেরাই।" },
    desc: {
      en: "No digital application replaces the compassionate touch of a certified midwife or obstetrician. PROHOR is engineered to strengthen real human connections between mothers, families, and healthcare providers.",
      bn: "কোনো মোবাইল অ্যাপই একজন অভিজ্ঞ মিডওয়াইফ বা ডাক্তারের বিকল্প হতে পারে না। প্রহর মা, পরিবার ও স্বাস্থ্যকর্মীর মধ্যকার যোগাযোগকে আরও সহজ করে দেয়।",
    },
    cardTitle: { en: "Bondhon Circle of Care", bn: "বন্ধন সেবা বৃত্ত" },
    cardSub: { en: "Mother-Governed Permissions", bn: "মায়ের সম্মতিভিত্তিক অনুমতি" },
    husbandRole: { en: "Tariq (Husband / Family Companion)", bn: "তারিক (স্বামী / পরিবারের সঙ্গী)" },
    husbandDuty: { en: "Role: Transportation & Clinic Accompaniment", bn: "দায়িত্ব: ক্লিনিকে যাতায়াত ও সঙ্গী হওয়া" },
    midwifeRole: { en: "Rahima Begum (Community Midwife)", bn: "রহিমা বেগম (কমিউনিটি মিডওয়াইফ)" },
    midwifeAffil: { en: "Affiliation: Upazila Health Complex", bn: "কর্মস্থল: উপজেলা স্বাস্থ্য কমপ্লেক্স" },
    authorized: { en: "Authorized", bn: "অনুমোদিত" },
    revocationLabel: { en: "One-Click Revocation", bn: "এক ক্লিকে অনুমতি বাতিল" },
    auditNote: { en: "Audit trail timestamped", bn: "সময়সহ অডিট ট্রেইল সংরক্ষিত" },
    points: [
      {
        title: { en: "Consent Sovereignty", bn: "মায়ের একক সম্মতি" },
        desc: {
          en: "Being pregnant or having a disability never automatically authorizes family members or caregivers to access your medical records. The mother retains full discretion over who sees what.",
          bn: "গর্ভবতী হওয়া বা বিশেষ চাহিদা থাকার কারণে পরিবারের কেউ সরাসরি সব রিপোর্ট দেখতে পারবেন না। কে কতটুকু দেখবেন তা মা নিজেই ঠিক করবেন।",
        },
      },
      {
        title: { en: "Structured Provider Queues", bn: "স্বাস্থ্যকর্মীদের জন্য সুশৃঙ্খল সারাংশ" },
        desc: {
          en: "Community health workers receive clean, structured health summaries instead of messy unverified messages, allowing them to prepare tailored advice before home visits.",
          bn: "মাঠে কাজ করা মিডওয়াইফরা অগোছালো মেসেজের বদলে পরিষ্কার মেডিকেল হিস্ট্রি দেখতে পান, যাতে তারা বাড়ি যাওয়ার আগেই প্রস্তুতি নিতে পারেন।",
        },
      },
      {
        title: { en: "Honest Transmission Status", bn: "সঠিক মেসেজ স্ট্যাটাস" },
        desc: {
          en: "PROHOR never claims a doctor received a request until the receiving hospital server explicitly acknowledges delivery.",
          bn: "হাসপাতাল বা স্বাস্থ্যকর্মী মেসেজ বা রিপোর্ট পেয়েছেন কি না, তা নিশ্চিত না হয়ে কখনোই মিথ্যা 'পৌঁছে গেছে' সংকেত দেয় না।",
        },
      },
    ],
  },

  // Poth Section
  poth: {
    eyebrow: { en: "Care Navigation & PWA Resilience", bn: "ক্লিনিক পথপ্রদর্শক ও অফলাইন সুবিধা" },
    heading: { en: "Verified clinic navigation with honest offline readiness", bn: "যাচাইকৃত হাসপাতাল ও বাস্তব অফলাইন সুবিধা" },
    desc: {
      en: "Finding a clinic in Bangladesh shouldn't involve guessing whether you will face stairs without ramps or whether a female doctor is on duty. Poth provides clear, verified accessibility metadata and low-bandwidth resilience.",
      bn: "বাংলাদেশে হাসপাতালে যাওয়ার আগে সিঁড়ি ভেঙে উঠতে হবে কি না কিংবা নারী ডাক্তার আছেন কি না তা নিয়ে দ্বিধাদ্বন্দ্বে পড়ার দিন শেষ। পথ মডিউলে এসব তথ্য স্পষ্টভাবে যাচাই করে দেওয়া হয়।",
    },
    facilityTitle: { en: "Upazila Health Complex, Sreemangal", bn: "শ্রীমঙ্গল উপজেলা স্বাস্থ্য কমপ্লেক্স" },
    facilitySub: { en: "Moulvibazar • 4.2 km away", bn: "মৌলভীবাজার • ৪.২ কিমি দূরে" },
    verifiedFacility: { en: "Verified Facility", bn: "যাচাইকৃত কেন্দ্র" },
    attributes: [
      { label: { en: "Physical Entrance Ramp", bn: "হুইলচেয়ার প্রবেশের র‍্যাম্প" }, status: { en: "Verified Present", bn: "নিশ্চিতভাবে বিদ্যমান" } },
      { label: { en: "Female OB/GYN on Duty", bn: "অন-ডিউটি নারী গাইনোকোলজিস্ট" }, status: { en: "Morning & Afternoon Shift", bn: "সকাল ও বিকেল শিফট" } },
      { label: { en: "Accessible Restroom", bn: "উপযুক্ত টয়লেট সুবিধা" }, status: { en: "Ground Floor", bn: "নিচতলায় বিদ্যমান" } },
      { label: { en: "Emergency Obstetric Blood Bank", bn: "জরুরি প্রসবকালীন ব্লাড ব্যাংক" }, status: { en: "Referral to District Hospital", bn: "জেলা হাসপাতালে রেফারেন্স" } },
    ],
    offlineTitle: { en: "Honest Offline Architecture", bn: "বাস্তবসম্মত অফলাইন সুবিধা" },
    offlineSub: { en: "No false claims of offline miracles", bn: "অফলাইনে কোনো অবাস্তব দাবি নয়" },
    offlineDesc: {
      en: "When mobile reception drops in rural areas during monsoons, PROHOR ensures critical safety features stay functional on your device:",
      bn: "বৃষ্টি বা নেটওয়ার্ক বিচ্ছিন্ন থাকলে আপনার ফোনে সবচেয়ে জরুরি বিষয়গুলো চালু থাকে:",
    },
    offlinePoints: [
      { en: "Cached Emergency Hotlines: 16263 and 999 are always dialable in one tap.", bn: "জরুরি হটলাইন: ১৬২৬৩ এবং ৯৯৯ ইন্টারনেট ছাড়াও এক ক্লিকে কল করা যায়।" },
      { en: "Downloaded Clinic Summaries: Previously generated visit notes remain readable.", bn: "ডাউনলোড করা সারাংশ: পূর্বে সেভ করা ডাক্তারের প্রেসক্রিপশন অফলাইনেও পড়া যায়।" },
      { en: "Transparent Limitation: Barta live AI querying requires active network and will transparently inform you when offline.", bn: "স্বচ্ছ সীমাবদ্ধতা: বার্তার লাইভ প্রশ্নের জন্য ইন্টারনেট লাগবে, অফলাইনে থাকলে তা স্পষ্টভাবে জানিয়ে দেওয়া হয়।" },
    ],
    pwaTitle: { en: "Install as a Native PWA", bn: "মোবাইল অ্যাপের মতো ইন্সটল করুন" },
    pwaDesc: { en: "Works seamlessly on Android, iOS, and low-spec browsers.", bn: "অ্যান্ড্রয়েড, আইওএস বা যেকোনো ব্রাউজারে অনায়াসে ব্যবহারযোগ্য।" },
    pwaSize: { en: "Lightweight (~2MB)", bn: "মাত্র ২ মেগাবাইট" },
  },

  // Trust Section
  trust: {
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
  },

  // FAQ Section
  faq: {
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
  },

  // Final CTA
  finalCta: {
    badge: { en: "Start Your Care Journey", bn: "আপনার স্বাস্থ্যসেবা শুরু করুন" },
    heading: { en: "Experience maternal care designed around your life.", bn: "আপনার জীবনের সাথে মানানসই মাতৃত্বকালীন যত্ন।" },
    desc: {
      en: "Whether you are preparing for your first antenatal check-up, managing an ongoing pregnancy, or supporting a family member—PROHOR is ready for you, exactly as you are.",
      bn: "আপনি প্রথম সন্তানসম্ভবা হোন, বা পরিবারের কাউকে সহায়তা করছেন—প্রহর আপনার পাশে আছে, ঠিক যেমনটি আপনার প্রয়োজন।",
    },
    btnExplore: { en: "Explore the Mother Journey", bn: "মায়ের সেবাযাত্রা দেখুন" },
    btnSignIn: { en: "Sign In to Records", bn: "রেকর্ডে লগইন করুন" },
    footerNote: {
      en: "Free, disability-inclusive, and secure. Built for the mothers of Bangladesh.",
      bn: "বিনামূল্যে, সবার জন্য উন্মুক্ত ও সুরক্ষিত। বাংলাদেশের সকল মায়ের জন্য তৈরি।",
    },
  },

  // Public Footer
  footer: {
    desc: {
      en: "Universal Adaptive AI Maternal & Child Care Ecosystem for Bangladesh. Designed for every mother to complete the same dignified care journey regardless of sensory, mobility, or communication preferences.",
      bn: "বাংলাদেশের মায়েদের জন্য সার্বজনীন অভিযোজনযোগ্য এআই মাতৃত্ব ও শিশু যত্ন প্ল্যাটফর্ম। যেকোনো শারীরিক বা যোগাযোগ চাহিদাসম্পন্ন মা যেন মর্যাদার সাথে স্বাস্থ্যসেবা গ্রহণ করতে পারেন।",
    },
    col1Title: { en: "Platform & Features", bn: "প্ল্যাটফর্ম ও মডিউল" },
    col1Links: [
      { label: { en: "All 8 Connected Modules", bn: "৮টি সংযুক্ত মডিউল" }, href: "/features" },
      { label: { en: "The Mother Journey", bn: "মায়ের যত্ন যাত্রা" }, href: "/how-it-works" },
      { label: { en: "Accessibility & Inclusion", bn: "অ্যাক্সেসযোগ্যতা ও অন্তর্ভুক্তি" }, href: "/accessibility" },
      { label: { en: "Barta Maternal AI", bn: "বার্তা মাতৃত্ব এআই" }, href: "/features#barta" },
      { label: { en: "Jibonrekha Health Records", bn: "জীবনরেখা স্বাস্থ্য রেকর্ড" }, href: "/features#jibonrekha" },
    ],
    col2Title: { en: "Audiences & Care", bn: "ব্যবহারকারী ও সেবা" },
    col2Links: [
      { label: { en: "For Mothers & Families", bn: "মা ও পরিবারের জন্য" }, href: "/for-mothers" },
      { label: { en: "For Healthcare Providers", bn: "স্বাস্থ্যকর্মীদের জন্য" }, href: "/for-providers" },
      { label: { en: "Bondhon Support Circle", bn: "বন্ধন সেবা বৃত্ত" }, href: "/features#bondhon" },
      { label: { en: "Poth Facility Directory", bn: "পথ হাসপাতাল ডিরেক্টরি" }, href: "/features#poth" },
      { label: { en: "Mission & Team", bn: "লক্ষ্য ও টিম" }, href: "/about" },
    ],
    col3Title: { en: "Trust & Emergency", bn: "নিরাপত্তা ও জরুরি হেল্পলাইন" },
    col3Links: [
      { label: { en: "Privacy & Responsible AI", bn: "গোপনীয়তা ও দায়িত্বশীল এআই" }, href: "/trust" },
      { label: { en: "Frequently Asked Questions", bn: "সাধারণ জিজ্ঞাসা (FAQ)" }, href: "/faq" },
      { label: { en: "Medical Provenance", bn: "মেডিকেল তথ্যের উৎস" }, href: "/trust#medical-provenance" },
    ],
    hotlinesBox: {
      title: { en: "Emergency National Helplines:", bn: "জরুরি জাতীয় হেল্পলাইন:" },
      healthBatayan: { en: "Health Helpline: 16263", bn: "স্বাস্থ্য বাতায়ন: ১৬২৬৩" },
      emergency999: { en: "Emergency Service: 999", bn: "জরুরি সেবা: ৯৯৯" },
      womenChild109: { en: "Women & Child Helpline: 109", bn: "নারী ও শিশু হেল্পলাইন: ১০৯" },
    },
    disclaimerStrong: { en: "Medical Integrity Disclaimer:", bn: "চিকিৎসাগত সততা সতর্কবার্তা:" },
    disclaimerBody: {
      en: "PROHOR is an educational and supportive maternal care web ecosystem. It is not an automated medical diagnostic tool, clinical triage system, or prescription dispenser. All clinical reports and pregnancy milestones require human review and confirmed clinical consultation. Fictional demo data is used for preview illustration.",
      bn: "প্রহর একটি শিক্ষামূলক ও সহযোগিতামূলক মাতৃত্বকালীন প্ল্যাটফর্ম। এটি কোনো স্বয়ংক্রিয় রোগ নির্ণয়কারী যন্ত্র বা প্রেসক্রিপশন প্রদানকারী সফটওয়্যার নয়। যেকোনো মেডিকেল তথ্যের জন্য বিশেষজ্ঞ চিকিৎসকের পরামর্শ অপরিহার্য।",
    },
    wcagNote: {
      en: "Designed for WCAG 2.2 Level AA target accessibility. PROHOR never categorizes users into 'normal' or 'disabled' tiers—all mothers receive identical rights to quality healthcare journeys.",
      bn: "WCAG ২.২ লেভেল AA অ্যাক্সেসিবিলিটি মানদণ্ডে তৈরি। প্রহর কখনোই ব্যবহারকারীদের 'সাধারণ' বা 'অক্ষম' শ্রেণিতে ভাগ করে না—সকল মা সমান মর্যাদায় সেবা পাওয়ার অধিকারী।",
    },
    copyright: {
      en: "PROHOR | প্রহর. Open architecture for maternal health equity in Bangladesh.",
      bn: "প্রহর | বাংলাদেশে মাতৃত্বকালীন স্বাস্থ্য সমতার জন্য উন্মুক্ত প্ল্যাটফর্ম।",
    },
    legalLinks: {
      privacy: { en: "Privacy Promise", bn: "গোপনীয়তা নীতি" },
      accessibility: { en: "Accessibility Statement", bn: "অ্যাক্সেসিবিলিটি বিবৃতি" },
      mission: { en: "Health Mission", bn: "স্বাস্থ্য মিশন" },
    },
  },
} as const;
