import type { Metadata } from "next";
import { RequestStatus } from "@/features/shonket/RequestStatus";
import { ShonketCareNavigation } from "@/features/shonket/ShonketPublicFrame";

export const metadata: Metadata = {
  title: "Request status | Shonket",
  description: "Status of your care request, as saved in PROHOR.",
};

export default async function CareRequestStatusPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <><ShonketCareNavigation current="status" /><RequestStatus requestId={typeof id === "string" ? id : undefined} /></>;
}
