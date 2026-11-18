import { requireWorkspace } from "@/lib/auth/require-workspace";
import { AccountRecords } from "@/features/jibonrekha/AccountRecords";

export default async function RecordsPage() {
  await requireWorkspace("mother");
  return <AccountRecords />;
}
