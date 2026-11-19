import type { Metadata } from "next";
import { PothDirectoryMvp } from "@/features/poth/PothDirectoryMvp";

export const metadata: Metadata = {
  title: "Find care | Poth",
  description: "Search maternal care facilities and prepare for a visit.",
};

/** Poth inside the signed-in shell. The public /poth page stays available without sign-in. */
export default function AppPothPage() {
  return <PothDirectoryMvp embedded />;
}
