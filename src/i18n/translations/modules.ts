export const journey = {
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
  } as const;

export const modulesGrid = {
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
  } as const;

export const dualTimeline = {
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
  } as const;
