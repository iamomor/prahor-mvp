import type { Metadata } from "next";
import { AdaptSettingsPanel } from "@/features/adapt/components/AdaptSettingsPanel";
import { AdaptAssistiveTools } from "@/features/adapt/components/AdaptAssistiveTools";

export const metadata: Metadata = {
  title: "Adjust how you use PROHOR | Adapt",
  description:
    "Change your appearance, text size, contrast, motion, language and communication preferences. All features stay available.",
};

/**
 * /app/adapt — Universal Access & Interaction settings page.
 *
 * This is the main Adapt module route inside the authenticated mother app shell.
 * The public accessibility information page is at /accessibility.
 *
 * Phase 2 P1: Assistive tools section (AAC, read-aloud, guided task demo)
 * rendered below the preference panel.
 */
export default function AdaptPage() {
  return (
    <div className="pro-shell py-8 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <AdaptSettingsPanel />
        {/* P1: Assistive tools — wired from preferences */}
        <AdaptAssistiveTools />
      </div>
    </div>
  );
}
