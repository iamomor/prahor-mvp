import type { Metadata } from "next";
import { BondhonIntroduction } from "@/features/bondhon/BondhonIntroduction";
export const metadata: Metadata = { title: "Bondhon · PROHOR", description: "Review and manage consent-controlled simulated care requests." };
export default function BondhonIntroductionPage() { return <BondhonIntroduction />; }
