import type { Metadata } from "next";
import { ShonketPublicFrame, WarningDetail } from "@/features/shonket";

export const metadata: Metadata = {
  title: "Information detail | Shonket",
  description: "A detail page ready for clinician-reviewed safety information.",
};

export default async function SafetyInformationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ShonketPublicFrame><WarningDetail slug={slug} /></ShonketPublicFrame>;
}
