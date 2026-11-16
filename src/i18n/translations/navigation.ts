export const nav = {
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
  } as const;

export const emergencyBar = {
    urgentLabel: { en: "Urgent Help:", bn: "জরুরি সতর্কতা:" },
    urgentDesc: {
      en: "Sudden bleeding, severe continuous pain, or convulsions require immediate clinical care.",
      bn: "অতিরিক্ত রক্তক্ষরণ, তীব্র পেটে ব্যথা বা খিঁচুনি হলে অবিলম্বে হাসপাতালে যোগাযোগ করুন।",
    },
    shasthyaBatayan: { en: "Health Helpline 16263", bn: "স্বাস্থ্য বাতায়ন ১৬২৬৩" },
    emergency999: { en: "Emergency 999", bn: "জরুরি ৯৯৯" },
    guideLink: { en: "Danger signs guide", bn: "বিপদ সংকেত সহায়িকা" },
  } as const;

export const finalCta = {
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
  } as const;

export const footer = {
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
  } as const;
