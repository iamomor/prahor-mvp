export const adaptability = {
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
  } as const;

export const persona = {
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
  } as const;
