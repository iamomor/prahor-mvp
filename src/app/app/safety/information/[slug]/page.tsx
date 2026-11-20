import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WarningDetail } from "@/features/shonket";

const warningTopics = new Set(["pregnancy", "labour-and-childbirth", "postpartum", "perinatal-mental-health"]);
export const metadata: Metadata = { title: "Information detail | Shonket" };

export default async function AppSafetyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!warningTopics.has(slug)) notFound();
  return <WarningDetail slug={slug} />;
}
