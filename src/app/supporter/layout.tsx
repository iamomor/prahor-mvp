import { requireWorkspace } from "@/lib/auth/require-workspace";
import { AuthShell } from "@/features/auth/AuthShell";
export const dynamic = "force-dynamic";
export default async function SupporterLayout({ children }: { children: React.ReactNode }) {
  await requireWorkspace("supporter");
  return <AuthShell>{children}</AuthShell>;
}
