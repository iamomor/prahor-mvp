import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Brand } from "@/components/ui/Brand";
import { PageHeading } from "@/components/ui/PageHeading";
import { BartaChatStarter } from "@/features/barta/BartaChatStarter";

export const metadata: Metadata = {
  title: "Barta demo",
  robots: { index: false, follow: false },
};

export default function BartaDemoPage() {
  if (process.env.NODE_ENV !== "development" || process.env.PROHOR_BARTA_DEMO !== "1") {
    notFound();
  }

  return (
    <>
      <header className="border-b border-pro-border">
        <div className="pro-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <Brand />
          <Link href="/accessibility" className="pro-btn pro-btn-secondary">
            Accessibility
          </Link>
        </div>
      </header>
      <main className="pro-shell py-10 sm:py-16">
        <PageHeading
          eyebrow="PROHOR"
          title="Barta demo"
          description="Try a sample question in Bangla or English. This local demo uses a fictional visit form."
        />
        <BartaChatStarter />
      </main>
    </>
  );
}
