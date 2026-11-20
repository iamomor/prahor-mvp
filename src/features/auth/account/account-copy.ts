import type { SupporterScope } from "@/lib/contracts/account";
import {
  Baby, Bus, CalendarCheck, ClipboardList, HandHeart, HeartHandshake, House, Pill, Salad, Siren, Users, type LucideIcon,
} from "lucide-react";

export type T = (text: { en: string; bn: string }) => string;
type Text = { en: string; bn: string };

/** What a supporter can help a mother with, grouped the way a family thinks about it. Labels only: no record access. */
export const helpAreaGroups: { title: Text; areas: { id: SupporterScope; icon: LucideIcon; label: Text; hint: Text }[] }[] = [
  { title: { en: "Check-ups and health", bn: "চেকআপ ও স্বাস্থ্য" }, areas: [
    { id: "visit_preparation", icon: ClipboardList, label: { en: "Prepare for check-ups", bn: "চেকআপের প্রস্তুতি" },
      hint: { en: "Note questions, keep the card and reports ready", bn: "প্রশ্ন লিখে রাখা, কার্ড ও রিপোর্ট গুছিয়ে রাখা" } },
    { id: "appointment_company", icon: CalendarCheck, label: { en: "Go with me to check-ups", bn: "চেকআপে সঙ্গে যাওয়া" },
      hint: { en: "Be with me at the doctor or health centre", bn: "ডাক্তার বা স্বাস্থ্যকেন্দ্রে সঙ্গে থাকা" } },
    { id: "transport", icon: Bus, label: { en: "Arrange transport", bn: "যাতায়াতের ব্যবস্থা" },
      hint: { en: "A ride to the clinic or hospital", bn: "ক্লিনিক বা হাসপাতালে যাওয়ার গাড়ির ব্যবস্থা" } },
    { id: "medicine_reminders", icon: Pill, label: { en: "Remind me about medicines", bn: "ওষুধ মনে করিয়ে দেওয়া" },
      hint: { en: "Iron, folic acid, calcium or what the doctor gave", bn: "আয়রন, ফলিক অ্যাসিড, ক্যালসিয়াম বা ডাক্তারের দেওয়া ওষুধ" } },
  ] },
  { title: { en: "Everyday life", bn: "প্রতিদিনের জীবন" }, areas: [
    { id: "nutrition_meals", icon: Salad, label: { en: "Food and nutrition", bn: "খাবার ও পুষ্টি" },
      hint: { en: "Nutritious meals and enough water", bn: "পুষ্টিকর খাবার ও পর্যাপ্ত পানির খেয়াল রাখা" } },
    { id: "household_help", icon: House, label: { en: "Help with housework", bn: "ঘরের কাজে সাহায্য" },
      hint: { en: "So that I can rest", bn: "যাতে আপনি বিশ্রাম নিতে পারেন" } },
    { id: "emotional_support", icon: HandHeart, label: { en: "Emotional support", bn: "মানসিকভাবে পাশে থাকা" },
      hint: { en: "Listen and stay close when I feel low or worried", bn: "মন খারাপ বা দুশ্চিন্তার সময় কথা শোনা ও সঙ্গ দেওয়া" } },
    { id: "paperwork_costs", icon: ClipboardList, label: { en: "Paperwork and costs", bn: "কাগজপত্র ও খরচ" },
      hint: { en: "Admission, bills and documents", bn: "ভর্তি, বিল ও দরকারি কাগজপত্রের ব্যবস্থা" } },
    { id: "care_coordination", icon: Users, label: { en: "Keep family and carers informed", bn: "পরিবার ও সেবাদাতার সঙ্গে যোগাযোগ" },
      hint: { en: "Coordinate who does what", bn: "কে কোন কাজ করবেন, তা সমন্বয় করা" } },
  ] },
  { title: { en: "After birth", bn: "সন্তান জন্মের পর" }, areas: [
    { id: "baby_care", icon: Baby, label: { en: "Baby care", bn: "শিশুর যত্ন" },
      hint: { en: "Feeding, bathing, sleep and vaccination days", bn: "খাওয়ানো, গোসল, ঘুম ও টিকার দিনে সাহায্য" } },
  ] },
  { title: { en: "In an emergency", bn: "জরুরি অবস্থায়" }, areas: [
    { id: "emergency_contact", icon: Siren, label: { en: "Emergency contact", bn: "জরুরি যোগাযোগের মানুষ" },
      hint: { en: "The first person to call when something is urgent", bn: "জরুরি দরকারে প্রথমে যাঁকে জানানো যাবে" } },
  ] },
];
export const helpAreas = helpAreaGroups.flatMap((group) => group.areas);
export const helpAreaIcon = HeartHandshake;

export const careStages: { value: string; label: Text }[] = [
  { value: "planning", label: { en: "Planning a pregnancy", bn: "গর্ভধারণের পরিকল্পনা করছি" } },
  { value: "pregnant", label: { en: "Pregnant", bn: "গর্ভবতী" } },
  { value: "postpartum", label: { en: "After birth", bn: "সন্তান জন্মের পর" } },
  { value: "prefer_not_to_say", label: { en: "Prefer not to say", bn: "বলতে চাই না" } },
];
export const supporterTypes: { value: string; label: Text }[] = [
  { value: "family", label: { en: "Family member", bn: "পরিবারের সদস্য" } },
  { value: "caregiver", label: { en: "Caregiver", bn: "যত্নকারী" } },
  { value: "supporter", label: { en: "Friend or other supporter", bn: "বন্ধু বা অন্য সহায়তাকারী" } },
];

export const roleName = (role: string, t: T) =>
  role === "mother" ? t({ en: "Mother", bn: "মা" })
    : role === "provider" ? t({ en: "Care provider", bn: "সেবাদাতা" })
      : role === "supporter" ? t({ en: "Supporter", bn: "সহায়তাকারী" })
        : t({ en: "Account", bn: "অ্যাকাউন্ট" });

/** One place for every API result code shown on this page. */
export function accountMessage(code: string, t: T): string {
  const messages: Record<string, Text> = {
    "profile-saved": { en: "Your profile is saved.", bn: "আপনার প্রোফাইল সংরক্ষিত হয়েছে।" },
    saved: { en: "Saved.", bn: "সংরক্ষিত হয়েছে।" },
    "password-saved": { en: "Your password is changed. Use the new one next time you sign in.", bn: "পাসওয়ার্ড বদলানো হয়েছে। পরের বার নতুন পাসওয়ার্ড দিয়ে সাইন ইন করবেন।" },
    "check-email": { en: "We sent a confirmation link to the new address. Your current email keeps working until you open that link.", bn: "নতুন ঠিকানায় একটি নিশ্চিতকরণ লিংক পাঠানো হয়েছে। লিংকটি না খোলা পর্যন্ত বর্তমান ইমেইলই চালু থাকবে।" },
    "same-email": { en: "That is already your email address.", bn: "এটি তো আপনার বর্তমান ইমেইল।" },
    "email-taken": { en: "Another account already uses that email.", bn: "এই ইমেইল দিয়ে আরেকটি অ্যাকাউন্ট আছে।" },
    "email-rate-limited": { en: "Too many emails were sent. Wait a few minutes and try again.", bn: "অনেকবার ইমেইল পাঠানো হয়েছে। কয়েক মিনিট পরে আবার চেষ্টা করুন।" },
    "rate-limited": { en: "Too many tries. Wait a few minutes and try again.", bn: "অনেকবার চেষ্টা হয়েছে। কয়েক মিনিট পরে আবার চেষ্টা করুন।" },
    "wrong-password": { en: "Your current password is not correct.", bn: "বর্তমান পাসওয়ার্ডটি সঠিক নয়।" },
    "same-password": { en: "The new password must be different from the current one.", bn: "নতুন পাসওয়ার্ড বর্তমানটির থেকে আলাদা হতে হবে।" },
    "weak-password": { en: "Choose a stronger password: at least 12 characters, not a common word.", bn: "আরও শক্ত পাসওয়ার্ড দিন: অন্তত ১২ অক্ষর, সাধারণ কোনো শব্দ নয়।" },
    "roles-unavailable": { en: "This part of your account is not switched on yet. Nothing was changed.", bn: "অ্যাকাউন্টের এই অংশ এখনও চালু হয়নি। কিছু বদলানো হয়নি।" },
    "access-denied": { en: "That person or invitation is not available to your account. Check the ID or code.", bn: "এই ব্যক্তি বা আমন্ত্রণ আপনার অ্যাকাউন্টে পাওয়া যাচ্ছে না। আইডি বা কোড আবার দেখুন।" },
    "not-found": { en: "That invitation was not found, has expired or was cancelled.", bn: "আমন্ত্রণটি পাওয়া যায়নি, মেয়াদ শেষ হয়েছে বা বাতিল করা হয়েছে।" },
    "invalid-input": { en: "Some details are not valid. Check the highlighted fields and try again.", bn: "কিছু তথ্য ঠিক নেই। ঘরগুলো দেখে আবার চেষ্টা করুন।" },
    "account-changed": { en: "A different account signed in on this device. Reload the page before continuing.", bn: "এই ডিভাইসে অন্য একটি অ্যাকাউন্ট সাইন ইন হয়েছে। এগোনোর আগে পৃষ্ঠাটি আবার খুলুন।" },
    "session-required": { en: "Your session ended. Sign in again.", bn: "আপনার সেশন শেষ হয়েছে। আবার সাইন ইন করুন।" },
  };
  return t(messages[code] ?? { en: "We could not confirm that change. Your inputs are still here; check your connection and try again.", bn: "পরিবর্তনটি নিশ্চিত করা যায়নি। আপনার লেখা তথ্য রয়ে গেছে; সংযোগ দেখে আবার চেষ্টা করুন।" });
}
