import type { Metadata } from "next";
import { RequestReview } from "@/features/shonket/RequestReview";
import { ShonketCareNavigation } from "@/features/shonket/ShonketPublicFrame";

export const metadata: Metadata = {
  title: "Review message | Shonket",
  description: "Review the local Shonket human-help message preview.",
};

export default function CareRequestReviewPage() {
  return <><ShonketCareNavigation current="review" /><RequestReview /></>;
}
