import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import { PageHeading } from "@/components/ui/PageHeading";
import { BartaChatStarter } from "@/features/barta/BartaChatStarter";
import { BartaAccessControl } from "@/features/barta/BartaAccessControl";
import { homepagePreferenceBootstrap } from "@/components/marketing/preference-bootstrap";

export const metadata: Metadata = {
  title: "Ask Barta",
  description: "Ask a general maternal-health education question in Bangla or English.",
};

export default function AskBartaPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: homepagePreferenceBootstrap }} />
      <a href="#barta-main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-pro-bg focus:p-3">Skip to Barta</a>
      <header className="border-b border-pro-border">
        <div className="pro-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <Brand />
          <nav className="flex max-w-full min-w-0 flex-wrap gap-3" aria-label="Barta navigation">
            <Link href="#barta-help" className="pro-btn pro-btn-secondary">Help without chat</Link>
            <BartaAccessControl />
          </nav>
        </div>
      </header>
      <main id="barta-main" tabIndex={-1} className="pro-shell py-10 sm:py-16">
        <PageHeading
          eyebrow="PROHOR"
          title="Ask Barta"
          description="Ask about pregnancy, birth, or newborn care and see the sources behind each answer."
        />
        <div className="pro-note mb-6 max-w-prose space-y-2">
          <p><strong>Educational prototype · No sign-in needed.</strong> Sources have project reference checks; clinical review is pending. Barta cannot diagnose, prescribe, or contact a clinician for you.</p>
          <p lang="bn">শিক্ষামূলক প্রোটোটাইপ। সাইন ইন করতে হবে না। সূত্র প্রকল্পের পক্ষ থেকে যাচাই করা হয়েছে; চিকিৎসাবিষয়ক পর্যালোচনা বাকি আছে। বার্তা রোগ নির্ণয়, ওষুধ দেওয়া বা চিকিৎসকের সঙ্গে যোগাযোগ করে না।</p>
        </div>
        <BartaChatStarter mode="education" />
        <section id="barta-help" tabIndex={-1} aria-labelledby="barta-help-title" className="pro-card mt-8 max-w-prose space-y-3">
          <h2 id="barta-help-title" className="text-xl font-semibold">Help without chat</h2>
          <p>If you need urgent medical care, seek help at a hospital or maternity facility. Please do not wait for a chat reply. This prototype does not send care requests or notify a clinician.</p>
          <p lang="bn">জরুরি চিকিৎসা প্রয়োজন হলে হাসপাতাল বা মাতৃসেবা কেন্দ্রে সহায়তা নিন। চ্যাটের উত্তরের জন্য অপেক্ষা করবেন না। এই প্রোটোটাইপ চিকিৎসকের কাছে অনুরোধ বা বার্তা পাঠায় না।</p>
        </section>
      </main>
    </>
  );
}
