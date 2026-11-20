import type { Metadata } from "next";
import { ConcernForm } from "@/features/shonket/ConcernForm";
import { ShonketCareNavigation } from "@/features/shonket/ShonketPublicFrame";
import { requireWorkspace } from "@/lib/auth/require-workspace";

export const metadata: Metadata = {
  title: "Prepare a message | Shonket",
  description: "Prepare a message for human support.",
};

export default async function CareRequestPage() {
  await requireWorkspace("mother");
  return <><ShonketCareNavigation current="form" /><ConcernForm /></>;
}
