import { requireWorkspace } from "@/lib/auth/require-workspace";
import { Workspace } from "@/features/auth/Workspace";
export default async function Dashboard() {
  return <Workspace profile={await requireWorkspace("mother")} />;
}
