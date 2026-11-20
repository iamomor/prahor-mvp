import type { Metadata } from "next";
import { MyRequests } from "@/features/shonket/MyRequests";
import { ShonketCareNavigation } from "@/features/shonket/ShonketPublicFrame";
import { requireWorkspace } from "@/lib/auth/require-workspace";

export const metadata: Metadata = { title: "My requests | Shonket" };

export default async function MyRequestsPage() {
  await requireWorkspace("mother");
  return <><ShonketCareNavigation current="status" /><MyRequests /></>;
}
