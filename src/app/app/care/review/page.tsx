import type { Metadata } from "next";
import { RequestReview } from "@/features/shonket/RequestReview";
import { ShonketCareNavigation } from "@/features/shonket/ShonketPublicFrame";

export const metadata: Metadata = {
  title: "Review and send | Shonket",
  description: "Choose a recipient and what to share, then send your care request.",
};

export default function CareRequestReviewPage() {
  return <><ShonketCareNavigation current="review" /><RequestReview /></>;
}
