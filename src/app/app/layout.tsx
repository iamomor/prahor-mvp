import { requireWorkspace } from "@/lib/auth/require-workspace";
import { AuthShell } from "@/features/auth/AuthShell";
export const dynamic = "force-dynamic";
export default async function MotherLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireWorkspace("mother");
  return <AuthShell nav="mother" userName={profile.display_name}>{children}</AuthShell>;
}
