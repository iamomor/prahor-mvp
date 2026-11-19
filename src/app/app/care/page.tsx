import type { Metadata } from "next";
import { CareHub } from "@/features/shonket/CareHub";

export const metadata: Metadata = {
  title: "Care & support | Shonket",
  description: "Reach a person, manage who can see your information and find reviewed safety information.",
};

export default function CareHubPage() {
  return <CareHub />;
}
