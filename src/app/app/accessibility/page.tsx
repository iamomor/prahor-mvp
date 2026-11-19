import type { Metadata } from "next";
import { requireWorkspace } from "@/lib/auth/require-workspace";
import { SettingsContent } from "@/app/(marketing)/accessibility/SettingsContent";

export const metadata: Metadata = {
  title: "Accessibility | Adapt",
  description: "Adjust how you use PROHOR.",
};

export default async function AppAccessibilityPage() {
  await requireWorkspace("mother");
  return (
    <div className="w-full">
      <SettingsContent />
    </div>
  );
}
