import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import { PageHeading } from "@/components/ui/PageHeading";
import { ModuleAccessBanner } from "@/components/accessibility/ModuleAccessBanner";
import { BartaChatStarter } from "@/features/barta/BartaChatStarter";
import { AskBartaNotice } from "./AskBartaNotice";

export const metadata: Metadata = {
  title: "Ask Barta",
  description: "Ask a general maternal-health education question in Bangla or English.",
};

export default function AskBartaPage() {
  return (
    <>
      <header className="border-b border-pro-border">
        <div className="pro-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <Brand />
          <Link href="/app/adapt" aria-label="Adjust how you use PROHOR" className="pro-btn pro-btn-secondary">Adjust how you use PROHOR</Link>
        </div>
      </header>
      <main className="pro-shell space-y-6 py-10 sm:py-16" lang="en">
        <AskBartaNotice />
        <PageHeading
          eyebrow="PROHOR"
          title="Ask Barta"
          description="Ask about pregnancy, birth, or newborn care and see the sources behind each answer."
        />
        <ModuleAccessBanner moduleName="Barta" />
        <BartaChatStarter mode="education" />
      </main>
    </>
  );
}
