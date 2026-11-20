import { requireWorkspace } from "@/lib/auth/require-workspace";
import { BondhonWorkspace } from "@/features/bondhon/BondhonWorkspace";
export default async function BondhonPage() {
  return <BondhonWorkspace profile={await requireWorkspace("mother")} />;
}
