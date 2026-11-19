import { requireWorkspace } from "@/lib/auth/require-workspace";
import { Workspace } from "@/features/auth/Workspace";
import { ProviderQueue } from "@/features/bondhon/ProviderQueue";
export default async function Provider() {
  return <Workspace profile={await requireWorkspace("provider")}><ProviderQueue /></Workspace>;
}
