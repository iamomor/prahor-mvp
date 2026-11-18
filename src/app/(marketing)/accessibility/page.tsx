import Link from "next/link";
import { SettingsContent } from "./SettingsContent";
export const metadata = { title: "Adjust how you use PROHOR" };
export default function AccessibilityPage() {
  return <main className="pro-shell grid max-w-3xl gap-6 py-8">
    <nav aria-label="Settings navigation" className="flex flex-wrap gap-4">
      <Link href="/">Home</Link><Link href="/ask">Ask Barta</Link>
      <Link href="/demo/jibonrekha">Synthetic records demo</Link>
      <Link href="/demo/bujhi">Synthetic report-review demo</Link>
    </nav>
    <SettingsContent />
  </main>;
}
