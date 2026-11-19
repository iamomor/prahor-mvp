import type { Metadata } from "next";
import Link from "next/link";
import { BartaChatStarter } from "@/features/barta/BartaChatStarter";

export const metadata: Metadata = {
  title: "Ask PROHOR | Barta",
  description: "Ask a maternal-health education question in Bangla or English and see the sources.",
};

/** Barta inside the signed-in shell. The public /ask page stays available without sign-in. */
export default async function AppAskPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const initialQuestion = typeof q === "string" ? q.slice(0, 1200) : "";
  return (
    <div className="grid gap-6">
      <header className="grid max-w-prose gap-2">
        <p className="font-semibold text-pro-primary" lang="en">Barta</p>
        <h1 className="pro-editorial text-3xl text-pro-text sm:text-4xl">Ask PROHOR · <span lang="bn">প্রহরকে জিজ্ঞাসা করুন</span></h1>
        <p className="text-lg text-pro-muted">
          Ask about pregnancy, birth or newborn care and see the sources behind each answer.
          {" "}<span lang="bn">গর্ভাবস্থা, প্রসব বা নবজাতকের যত্ন নিয়ে প্রশ্ন করুন; প্রতিটি উত্তরের সূত্র দেখুন।</span>
        </p>
      </header>
      <p className="max-w-prose rounded-field border border-pro-border bg-pro-surface px-4 py-3 text-pro-text">
        <strong>Educational, not a diagnosis.</strong> Barta cannot diagnose, prescribe or contact a clinician for you.
        {" "}<span lang="bn">বার্তা রোগ নির্ণয়, ওষুধ দেওয়া বা চিকিৎসকের সঙ্গে যোগাযোগ করে না।</span>
      </p>
      <BartaChatStarter mode="education" initialQuestion={initialQuestion} />
      <section aria-labelledby="ask-help-title" className="grid max-w-prose gap-3 rounded-card border border-pro-border bg-pro-elevated p-5 shadow-pro-1">
        <h2 id="ask-help-title" className="text-xl font-semibold">Help without chat · <span lang="bn">চ্যাট ছাড়া সাহায্য</span></h2>
        <p>If you need urgent medical care, go to a hospital or maternity facility. Please do not wait for a chat reply.</p>
        <div className="flex flex-wrap gap-2">
          <a href="tel:999" className="pro-btn pro-btn-secondary">Call 999 · <span lang="bn">৯৯৯-এ কল করুন</span></a>
          <Link href="/safety" className="pro-btn pro-btn-secondary">Warning signs · <span lang="bn">সতর্কতার লক্ষণ</span></Link>
          <Link href="/app/care" className="pro-btn pro-btn-secondary">Ask a person · <span lang="bn">মানুষের সাহায্য</span></Link>
        </div>
      </section>
    </div>
  );
}
