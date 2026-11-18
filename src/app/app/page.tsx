import { requireWorkspace } from "@/lib/auth/require-workspace";
import { AuthShell } from "@/features/auth/AuthShell";
import { Workspace } from "@/features/auth/Workspace";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const profile = await requireWorkspace("mother");
  return (
    <AuthShell>
      <Workspace profile={profile} />
    </AuthShell>
  );
}
