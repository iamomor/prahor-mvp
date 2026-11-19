import { requireWorkspace } from "@/lib/auth/require-workspace";
import { Workspace } from "@/features/auth/Workspace";
import { MotherDashboard } from "@/features/dashboard/MotherDashboard";
export default async function Dashboard() {
  const profile = await requireWorkspace("mother");
  return <Workspace profile={profile}><MotherDashboard profile={profile} /></Workspace>;
}
