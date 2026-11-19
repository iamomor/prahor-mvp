import { requireWorkspace } from "@/lib/auth/require-workspace";
import { Workspace } from "@/features/auth/Workspace";
import { MotherDashboard } from "@/features/dashboard/MotherDashboard";
export default async function Dashboard() {
  return <Workspace profile={await requireWorkspace("mother")}><MotherDashboard /></Workspace>;
}
