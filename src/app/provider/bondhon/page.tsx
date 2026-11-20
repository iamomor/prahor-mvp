import { requireWorkspace } from "@/lib/auth/require-workspace";
import { BondhonWorkspace } from "@/features/bondhon/BondhonWorkspace";
export default async function ProviderBondhonPage() {
  return <BondhonWorkspace profile={await requireWorkspace("provider")} />;
}
