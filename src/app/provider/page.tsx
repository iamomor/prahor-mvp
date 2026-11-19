import { requireWorkspace } from "@/lib/auth/require-workspace";
import { Workspace } from "@/features/auth/Workspace";
import { BondhonWorkspace } from "@/features/bondhon/BondhonWorkspace";
import { ProviderQueue } from "@/features/shonket/ProviderQueue";
export default async function Provider() {
  const profile = await requireWorkspace("provider");
  return <Workspace profile={profile}><ProviderQueue /><BondhonWorkspace profile={profile} embedded /></Workspace>;
}
