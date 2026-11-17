import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import { PageHeading } from "@/components/ui/PageHeading";
import { BartaChatStarter } from "@/features/barta/BartaChatStarter";

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
          <Link href="/accessibility" className="pro-btn pro-btn-secondary">Accessibility</Link>
        </div>
      </header>
      <main className="pro-shell py-10 sm:py-16">
        <PageHeading
          eyebrow="PROHOR"
          title="Ask Barta"
          description="Ask about pregnancy, birth, or newborn care and see the sources behind each answer."
        />
        <BartaChatStarter mode="education" />
      </main>
    </>
  );
}
