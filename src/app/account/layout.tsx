import { requireAccount } from "@/lib/auth/require-workspace";
import { AuthShell } from "@/features/auth/AuthShell";
export const dynamic = "force-dynamic";
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireAccount();
  return <AuthShell>{children}</AuthShell>;
}
