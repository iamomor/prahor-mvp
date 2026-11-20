import type { Metadata } from "next";
import { WarningSigns } from "@/features/shonket";

export const metadata: Metadata = { title: "Safety information | Shonket" };

export default function AppSafetyInformationPage() {
  return <WarningSigns />;
}
