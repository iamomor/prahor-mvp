import Link from "next/link";
import { SettingsContent } from "./SettingsContent";
export const metadata = { title: "Adjust how you use PROHOR" };
export default function AccessibilityPage() {
  return <div className="pro-shell grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-6 py-8">
    <nav aria-label="Settings navigation" className="flex flex-wrap gap-x-5 gap-y-2">
      <Link href="/" className="inline-flex min-h-11 items-center text-pro-primary underline">Home · <span lang="bn">প্রথম পাতা</span></Link>
      <Link href="/ask" className="inline-flex min-h-11 items-center text-pro-primary underline">Ask PROHOR · <span lang="bn">প্রশ্ন করুন</span></Link>
      <Link href="/poth" className="inline-flex min-h-11 items-center text-pro-primary underline">Find care · <span lang="bn">সেবা খুঁজুন</span></Link>
      <Link href="/app" className="inline-flex min-h-11 items-center text-pro-primary underline">My PROHOR · <span lang="bn">আমার প্রহর</span></Link>
    </nav>
    <SettingsContent />
    <section aria-labelledby="bdsl-status" className="rounded-card border border-pro-border p-4">
      {/* Placeholder only: render real BdSL video here when Deaf signers or a trusted partner supply verified assets. */}
      <h2 id="bdsl-status" className="text-lg font-bold">Bangla Sign Language (BdSL) · <span lang="bn">বাংলা ইশারা ভাষা</span></h2>
      <p className="mt-2">No BdSL videos have been published yet. PROHOR does not use AI-generated signing. Essential safety information is available as text and symbols, and you can call 999 in an emergency.</p>
      <p className="mt-2" lang="bn">এখনো কোনো বাংলা ইশারা ভাষার ভিডিও প্রকাশিত হয়নি। প্রহর এআই-তৈরি ইশারা ব্যবহার করে না। জরুরি নিরাপত্তা তথ্য লেখা ও প্রতীকে পাওয়া যায়; জরুরি অবস্থায় ৯৯৯-এ কল করুন।</p>
      <h3 className="mt-4 font-semibold">Screen readers and Braille displays · <span lang="bn">স্ক্রিন রিডার ও ব্রেইল ডিসপ্লে</span></h3>
      <p className="mt-2">PROHOR uses semantic page structure, keyboard-operable controls, labels and status announcements. A refreshable Braille display may work through a compatible screen reader; this is not device certification, and physical display testing has not been completed.</p>
      <p className="mt-2" lang="bn">প্রহরে অর্থবহ পেজ কাঠামো, কিবোর্ডে ব্যবহারযোগ্য নিয়ন্ত্রণ, লেবেল ও অবস্থার ঘোষণা রয়েছে। সামঞ্জস্যপূর্ণ স্ক্রিন রিডারের মাধ্যমে রিফ্রেশযোগ্য ব্রেইল ডিসপ্লে কাজ করতে পারে; এটি কোনো ডিভাইস-সনদ নয়, এবং বাস্তব ডিসপ্লে দিয়ে পরীক্ষা এখনো হয়নি।</p>
    </section>
  </div>;
}
