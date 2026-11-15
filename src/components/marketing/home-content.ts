export type Locale = "en" | "bn";
export type Copy = Readonly<{ en: string; bn: string }>;
export const copy = (en: string, bn: string): Copy => ({ en, bn });
export type CapabilityStatus = "Limited" | "Future";
export type Capability = { id: number; title: Copy; status: CapabilityStatus };
export type CapabilityGroup = { name: string; description: Copy; features: Capability[] };

// Status comes from this checkout, not the product specification. Only presentation
// preferences are connected here. A designed preview is not an implemented service.
export const capabilityGroups: CapabilityGroup[] = [
  { name: "Adapt", description: copy("Your preferences, throughout your journey.", "আপনার পছন্দ, পুরো যত্নের যাত্রাজুড়ে।"), features: [
    { id: 1, title: copy("Universal Accessibility Profile", "সবার জন্য ব্যবহার-পছন্দের প্রোফাইল"), status: "Limited" },
  ] },
  { name: "Barta", description: copy("Grounded education, with visible evidence.", "সূত্রসহ তথ্যভিত্তিক স্বাস্থ্যশিক্ষা।"), features: [
    { id: 2, title: copy("Bangla Multimodal AI Companion", "বাংলা বহুমাধ্যম এআই সহায়ক"), status: "Future" },
    { id: 3, title: copy("Evidence-grounded Maternal RAG", "প্রামাণ্য সূত্রভিত্তিক মাতৃস্বাস্থ্য তথ্য অনুসন্ধান"), status: "Future" },
    { id: 20, title: copy("Evidence & Protocol Overlay", "প্রমাণ ও প্রোটোকলের তথ্যস্তর"), status: "Future" },
  ] },
  { name: "Shonket + Bondhon", description: copy("Reviewed information and authorized human support. Clinical auto-flags require clinical validation before use.", "পর্যালোচিত তথ্য ও অনুমতিভিত্তিক মানবিক সহায়তা। স্বয়ংক্রিয় ক্লিনিক্যাল সংকেত ব্যবহারের আগে চিকিৎসাগত যাচাই প্রয়োজন।"), features: [
    { id: 4, title: copy("Maternal Safety & Human Handoff", "মাতৃস্বাস্থ্য সুরক্ষার তথ্য ও মানুষের কাছে সহায়তা চাওয়া"), status: "Future" },
    { id: 23, title: copy("Clinical Signal Auto-flags · requires validation", "স্বয়ংক্রিয় ক্লিনিক্যাল সংকেত · যাচাই প্রয়োজন"), status: "Future" },
  ] },
  { name: "Jibonrekha", description: copy("Connected continuity; distinct mother and baby records. Postpartum support connects with Shusthota.", "যত্নের ধারাবাহিকতা; মা ও শিশুর আলাদা রেকর্ড। প্রসব-পরবর্তী সহায়তায় সুস্থতাও যুক্ত থাকবে।"), features: [
    { id: 5, title: copy("40-week Pregnancy Tracker", "৪০ সপ্তাহের গর্ভকালীন যাত্রা"), status: "Future" },
    { id: 6, title: copy("Vitals & Baby Movement Logging", "স্বাস্থ্য পরিমাপ ও শিশুর নড়াচড়ার নোট"), status: "Future" },
    { id: 16, title: copy("Postpartum & Early Motherhood Support", "প্রসব-পরবর্তী ও মাতৃত্বের শুরুর সহায়তা"), status: "Future" },
    { id: 18, title: copy("Per-mother Health Timeline", "প্রত্যেক মায়ের নিজস্ব স্বাস্থ্য সময়রেখা"), status: "Future" },
  ] },
  { name: "Bujhi", description: copy("Supported formats only. Extraction needs correction and verification before saving; it does not validate a prescription.", "শুধু সমর্থিত নথির জন্য। সংরক্ষণের আগে তুলে নেওয়া তথ্য সংশোধন ও যাচাই করতে হবে; এটি প্রেসক্রিপশন অনুমোদন করে না।"), features: [
    { id: 7, title: copy("AI Report & Prescription Reader", "এআই রিপোর্ট ও প্রেসক্রিপশন পাঠক"), status: "Future" },
  ] },
  { name: "Shusthota", description: copy("Optional well-being, without universal targets or compulsory streaks.", "সবার জন্য একই লক্ষ্য বা বাধ্যতামূলক ধারাবাহিকতা ছাড়া ঐচ্ছিক ভালো থাকার সহায়তা।"), features: [
    { id: 8, title: copy("Accessible Diary & Notes", "সহজে ব্যবহারযোগ্য ডায়েরি ও নোট"), status: "Future" },
    { id: 14, title: copy("Emotional Support Companion", "মানসিক সুস্থতার সহায়ক"), status: "Future" },
  ] },
  { name: "Poth", description: copy("Verified care information and visit preparation. No live bookings, telemedicine or SMS service in this prototype.", "যাচাইকৃত সেবার তথ্য ও সাক্ষাতের প্রস্তুতি। এই প্রোটোটাইপে সরাসরি বুকিং, টেলিমেডিসিন বা এসএমএস সেবা নেই।"), features: [
    { id: 9, title: copy("Accessible Appointments", "সবার জন্য ব্যবহারযোগ্য সাক্ষাৎ ব্যবস্থা"), status: "Future" },
    { id: 10, title: copy("Maternal Facility Map & Referral", "মাতৃসেবা প্রতিষ্ঠানের মানচিত্র ও রেফারাল"), status: "Future" },
    { id: 13, title: copy("Feature-phone SMS Fallback", "সাধারণ ফোনের জন্য এসএমএস বিকল্প"), status: "Future" },
    { id: 15, title: copy("Accessible Telemedicine", "সবার জন্য ব্যবহারযোগ্য টেলিমেডিসিন"), status: "Future" },
  ] },
  { name: "Bondhon", description: copy("Selective, revocable permissions. No provider delivery or acknowledgement is connected yet.", "নির্দিষ্ট তথ্যের অনুমতি দেওয়া ও প্রত্যাহারের ব্যবস্থা। এখনো সেবাদাতার কাছে অনুরোধ পৌঁছানো বা প্রাপ্তি স্বীকারের সংযোগ নেই।"), features: [
    { id: 11, title: copy("Inclusive Mothers’ Community", "সবার জন্য মায়েদের কমিউনিটি"), status: "Future" },
    { id: 12, title: copy("Consent-based Family Link", "সম্মতিভিত্তিক পরিবারের সংযোগ"), status: "Future" },
    { id: 17, title: copy("Doctor / CHW Follow-up Queue", "চিকিৎসক ও কমিউনিটি স্বাস্থ্যকর্মীর ফলোআপ তালিকা"), status: "Future" },
    { id: 19, title: copy("Cohort AI Assistant", "অনুমোদিত গোষ্ঠীর তথ্যের এআই সহায়ক"), status: "Future" },
    { id: 21, title: copy("District-level Aggregate Analytics", "জেলাভিত্তিক সমষ্টিগত তথ্য বিশ্লেষণ"), status: "Future" },
    { id: 22, title: copy("Voice-to-SOAP Provider Notes", "সেবাদাতার কণ্ঠ থেকে কাঠামোবদ্ধ চিকিৎসা নোট"), status: "Future" },
    { id: 24, title: copy("Accessible Care Continuity & Audit", "ব্যবহারযোগ্য যত্নের ধারাবাহিকতা ও কার্যকলাপের ইতিহাস"), status: "Future" },
  ] },
];

export const statusLabels = {
  Working: copy("Working", "চলমান"),
  Limited: copy("Limited", "সীমিত"),
  Simulated: copy("Simulated", "নমুনা"),
  Future: copy("Future", "ভবিষ্যৎ"),
};

export const journey = [
  { module: "Adapt", title: copy("Make it yours", "আপনার মতো করে নিন"), detail: copy("Choose how you read and interact.", "কীভাবে পড়বেন ও ব্যবহার করবেন, বেছে নিন।") },
  { module: "Jibonrekha", title: copy("Keep your story", "আপনার তথ্য রাখুন"), detail: copy("Keep maternal and baby records distinct.", "মা ও শিশুর রেকর্ড আলাদা রাখুন।") },
  { module: "Barta · Bujhi", title: copy("Understand more", "আরও বুঝুন"), detail: copy("Explore sources; review extracted information.", "সূত্র দেখুন; নথি থেকে নেওয়া তথ্য যাচাই করুন।") },
  { module: "Shusthota", title: copy("Notice your well-being", "নিজের ভালো থাকার খোঁজ নিন"), detail: copy("Make room for rest, mood and daily life.", "বিশ্রাম, মনের অবস্থা ও দৈনন্দিন জীবনের জন্য সময় রাখুন।") },
  { module: "Poth · Shonket", title: copy("Prepare for care", "সেবার জন্য প্রস্তুত হোন"), detail: copy("Find reviewed information and plan your visit.", "পর্যালোচিত তথ্য খুঁজুন ও সাক্ষাতের প্রস্তুতি নিন।") },
  { module: "Bondhon", title: copy("Connect on your terms", "নিজের শর্তে যুক্ত হোন"), detail: copy("Review exactly what you choose to share.", "যা শেয়ার করতে চান, তা নিজে পর্যালোচনা করুন।") },
];
