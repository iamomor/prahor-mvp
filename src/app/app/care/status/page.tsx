import type { Metadata } from "next";
import { RequestStatus } from "@/features/shonket/RequestStatus";
import { ShonketCareNavigation } from "@/features/shonket/ShonketPublicFrame";

export const metadata: Metadata = {
  title: "Message status | Shonket",
  description: "Truthful not-sent status for the local Shonket preview.",
};

export default function CareRequestStatusPage() {
  return <><ShonketCareNavigation current="status" /><RequestStatus /></>;
}
