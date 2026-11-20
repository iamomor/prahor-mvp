import type { Metadata } from "next";
import { ShonketExperience } from "@/features/shonket";

export const metadata: Metadata = { title: "Warning signs and help | Shonket" };

/** Same reviewed Shonket content as the public /safety page, inside the signed-in shell. */
export default function AppSafetyPage() {
  return <ShonketExperience />;
}
