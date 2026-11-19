import type { Metadata } from "next";
import { requireWorkspace } from "@/lib/auth/require-workspace";
import { Wellbeing } from "@/features/shusthota/Wellbeing";

export const metadata: Metadata = { title: "Wellbeing | Shusthota", description: "Optional check-ins and a private diary." };

export default async function WellbeingPage() {
  await requireWorkspace("mother");
  return <Wellbeing />;
}
