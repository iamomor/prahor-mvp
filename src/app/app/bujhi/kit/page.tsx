import { requireWorkspace } from "@/lib/auth/require-workspace";
import { KitExperience } from "@/features/bujhi/KitExperience";

export const metadata = { title: "Bujhi | Pregnancy kit guide" };

export default async function AccountKitPage() {
  await requireWorkspace("mother");
  return <KitExperience mode="account" />;
}
