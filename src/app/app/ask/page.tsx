import { ModuleCommunication } from "@/components/accessibility/ModuleCommunication";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, MessageCircle, Phone, ShieldCheck, TriangleAlert, UserRound } from "lucide-react";
import { BartaChatStarter } from "@/features/barta/BartaChatStarter";

export const metadata: Metadata = {
  title: "Ask PROHOR | Barta",
  description: "Ask a maternal-health education question in Bangla or English and see the sources.",
};

const helpLink = "flex min-h-16 items-start gap-3 rounded-card border px-4 py-3 font-semibold no-underline transition-colors duration-[var(--pro-duration-fast)] ease-pro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus";

/** Barta inside the signed-in shell. The public /ask page stays available without sign-in. */
export default async function AppAskPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const initialQuestion = typeof q === "string" ? q.slice(0, 1200) : "";
  return (
    <div className="grid gap-6">
      <header className="grid max-w-3xl gap-3">
        <p className="flex items-center gap-2.5 font-semibold text-pro-muted">
          <span className="grid size-10 place-items-center rounded-control bg-pro-surface text-pro-primary" aria-hidden="true">
            <MessageCircle size={20} />
          </span>
          Barta · Your questions matter
        </p>
        <h1>
          Ask PROHOR
          <span lang="bn" className="mt-1 block text-[0.68em] font-semibold text-pro-primary">প্রহরকে জিজ্ঞাসা করুন</span>
        </h1>
        <p className="max-w-[65ch] text-lg leading-relaxed text-pro-muted">
          Ask about pregnancy, birth or newborn care and see the sources behind each answer.
          {" "}<span lang="bn">গর্ভাবস্থা, প্রসব বা নবজাতকের যত্ন নিয়ে প্রশ্ন করুন; প্রতিটি উত্তরের সূত্র দেখুন।</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-card border border-pro-border bg-pro-elevated px-4 py-3">
          <p className="flex min-w-0 flex-[1_1_22rem] items-start gap-2.5 text-pro-text">
            <ShieldCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-pro-primary" />
            <span>
              <strong>Educational, not a diagnosis.</strong> Barta cannot diagnose, prescribe or contact a clinician for you.
              {" "}<span lang="bn">বার্তা রোগ নির্ণয়, ওষুধ দেওয়া বা চিকিৎসকের সঙ্গে যোগাযোগ করে না।</span>
            </span>
          </p>
          <a href="#ask-help" className="inline-flex min-h-11 items-center gap-1.5 rounded-control font-semibold text-pro-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus">
            Need help now? · <span lang="bn">এখনই সাহায্য</span><ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
      </header>
      <ModuleCommunication placement="barta" />
      <BartaChatStarter mode="education" initialQuestion={initialQuestion} />
      <section id="ask-help" tabIndex={-1} aria-labelledby="ask-help-title" className="grid max-w-3xl scroll-mt-6 gap-3 rounded-hero border border-pro-control-border bg-pro-elevated p-5 sm:p-6">
        <h2 id="ask-help-title" className="flex flex-wrap items-center gap-x-2.5 text-xl font-semibold">
          <TriangleAlert size={22} aria-hidden="true" className="shrink-0 text-pro-danger" />
          Help without chat · <span lang="bn">চ্যাট ছাড়া সাহায্য</span>
        </h2>
        <p className="max-w-[65ch]">If you need urgent medical care, go to a hospital or maternity facility. Please do not wait for a chat reply.</p>
        <div className="grid gap-2.5 sm:grid-cols-3">
          <a href="tel:999" className={`${helpLink} border-pro-danger bg-pro-danger text-pro-on-primary hover:bg-pro-danger/90`}>
            <Phone size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
            <span>Call 999 <span lang="bn" className="block font-normal">৯৯৯-এ কল করুন</span></span>
          </a>
          <Link href="/safety" className={`${helpLink} border-pro-control-border bg-pro-elevated text-pro-text hover:bg-pro-surface`}>
            <TriangleAlert size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-pro-primary" />
            <span>Warning signs <span lang="bn" className="block font-normal text-pro-muted">সতর্কতার লক্ষণ</span></span>
          </Link>
          <Link href="/app/care" className={`${helpLink} border-pro-control-border bg-pro-elevated text-pro-text hover:bg-pro-surface`}>
            <UserRound size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-pro-primary" />
            <span>Ask a person <span lang="bn" className="block font-normal text-pro-muted">মানুষের সাহায্য</span></span>
          </Link>
        </div>
      </section>
    </div>
  );
}
