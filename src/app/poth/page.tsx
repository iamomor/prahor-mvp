import type { Metadata } from "next";
import { PothDirectoryMvp } from "@/features/poth/PothDirectoryMvp";

export const metadata: Metadata = {
  title: "Poth | Find Care",
  description: "PROHOR Poth accessible healthcare directory preview.",
};

export default function PothPage() {
  return <main id="poth-main"><PothDirectoryMvp /></main>;
}
