import Link from "next/link";
import { SettingsContent } from "./SettingsContent";
export const metadata = { title: "Adjust how you use PROHOR" };
export default function AccessibilityPage() {
  return <main className="pro-shell grid max-w-3xl gap-6 py-8">
    <nav aria-label="Settings navigation" className="flex flex-wrap gap-x-5 gap-y-2">
      <Link href="/" className="inline-flex min-h-11 items-center text-pro-primary underline">Home · <span lang="bn">প্রথম পাতা</span></Link>
      <Link href="/ask" className="inline-flex min-h-11 items-center text-pro-primary underline">Ask PROHOR · <span lang="bn">প্রশ্ন করুন</span></Link>
      <Link href="/poth" className="inline-flex min-h-11 items-center text-pro-primary underline">Find care · <span lang="bn">সেবা খুঁজুন</span></Link>
      <Link href="/app" className="inline-flex min-h-11 items-center text-pro-primary underline">My PROHOR · <span lang="bn">আমার প্রহর</span></Link>
    </nav>
    <SettingsContent />
  </main>;
}
