import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShonketPublicFrame, WarningDetail } from "@/features/shonket";

const warningTopics = new Set(["pregnancy", "labour-and-childbirth", "postpartum", "perinatal-mental-health"]);

export const dynamicParams = false;
export function generateStaticParams() {
  return [...warningTopics].map(slug => ({ slug }));
}

export const metadata: Metadata = {
  title: "Information detail | Shonket",
  description: "A detail page ready for clinician-reviewed safety information.",
};

export default async function SafetyInformationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!warningTopics.has(slug)) notFound();
  return <ShonketPublicFrame><WarningDetail slug={slug} /></ShonketPublicFrame>;
}
