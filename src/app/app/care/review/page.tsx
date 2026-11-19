import type { Metadata } from "next";
import { RequestReview } from "@/features/shonket/RequestReview";
import { ShonketCareNavigation } from "@/features/shonket/ShonketPublicFrame";
import { requireWorkspace } from "@/lib/auth/require-workspace";

export const metadata: Metadata = {
  title: "Review and send | Shonket",
  description: "Choose a recipient and what to share, then send your care request.",
};

export default async function CareRequestReviewPage() {
  const profile = await requireWorkspace("mother");
  return <><ShonketCareNavigation current="review" /><RequestReview account={profile.user_id} /></>;
}
