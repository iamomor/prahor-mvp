import type { Metadata } from "next";
import { ShonketPublicFrame, WarningSigns } from "@/features/shonket";

export const metadata: Metadata = {
  title: "Safety information | Shonket",
  description: "Source-linked safety information preview from PROHOR Shonket. Clinical review pending.",
};

export default function SafetyInformationPage() {
  return <ShonketPublicFrame><WarningSigns /></ShonketPublicFrame>;
}
