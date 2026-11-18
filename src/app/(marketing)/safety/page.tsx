import type { Metadata } from "next";
import { ShonketExperience, ShonketPublicFrame } from "@/features/shonket";

export const metadata: Metadata = {
  title: "Shonket | Safety and Support",
  description: "Explore the PROHOR Shonket safety information and human-help preview.",
};

export default function SafetyPage() {
  return <ShonketPublicFrame><ShonketExperience /></ShonketPublicFrame>;
}
