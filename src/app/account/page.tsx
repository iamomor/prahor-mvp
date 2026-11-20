import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/auth/require-workspace";
import { AccountWorkspace } from "@/features/auth/AccountWorkspace";
// Mothers have one account URL inside their signed-in workspace; other roles keep this shell.
export default async function AccountPage() {
  const profile = await requireAccount();
  if (profile.role === "mother") redirect("/app/account");
  return <AccountWorkspace />;
}
