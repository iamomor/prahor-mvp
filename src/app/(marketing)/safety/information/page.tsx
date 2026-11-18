import type { Metadata } from "next";
import { ShonketPublicFrame, WarningSigns } from "@/features/shonket";

export const metadata: Metadata = {
  title: "Safety information | Shonket",
  description: "Clinician-reviewed safety information preview from PROHOR Shonket.",
};

export default function SafetyInformationPage() {
  return <ShonketPublicFrame><WarningSigns /></ShonketPublicFrame>;
}
