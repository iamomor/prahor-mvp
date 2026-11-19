import type { Metadata } from "next";
import { AskForHelp } from "@/features/shonket/AskForHelp";
import { ShonketCareNavigation } from "@/features/shonket/ShonketPublicFrame";

export const metadata: Metadata = {
  title: "Prepare a message | Shonket",
  description: "Prepare a message for human support.",
};

export default function CareRequestPage() {
  return <><ShonketCareNavigation current="form" /><AskForHelp /></>;
}
