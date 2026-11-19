import { requireWorkspace } from "@/lib/auth/require-workspace";
import { Workspace } from "@/features/auth/Workspace";
import { BondhonWorkspace } from "@/features/bondhon/BondhonWorkspace";
export default async function Provider() {
  const profile = await requireWorkspace("provider");
  return <Workspace profile={profile}><BondhonWorkspace profile={profile} embedded /></Workspace>;
}
