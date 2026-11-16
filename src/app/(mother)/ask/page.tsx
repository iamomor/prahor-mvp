import type { Metadata } from "next";
import { BartaChatStarter } from "@/features/barta/BartaChatStarter";
import { ModuleAccessBanner } from "@/components/accessibility/ModuleAccessBanner";

export const metadata: Metadata = {
  title: "Ask Barta — Maternal Guidance | PROHOR",
  description:
    "Evidence-grounded maternal health guidance in Bangla and English. Powered by Barta AI.",
};

/**
 * /ask — Barta maternal AI module route.
 *
 * Owner: Iftee (AI pipeline). Accessibility integration: Apurbo.
 * Status: Prototype — no real AI connected.
 *
 * Adapt integration:
 *   - Text scaling / contrast / layout: inherited via <html> data attributes (CSS cascade).
 *   - Read-aloud: ReadAloudButton rendered on AI response in BartaChatStarter.
 *   - AAC: AACComposer inserts into question textarea via "prohor-aac-insert" event.
 *   - Focused view: [data-focused="true"] CSS hides decorative chrome.
 *   - ModuleAccessBanner: live preference summary + link to Adapt.
 */
export default function AskBartaPage() {
  return (
    <div className="pro-shell space-y-8 py-8 sm:py-12">
      {/* Skip: "Skip to main content" in AppChrome already handles global skip */}

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Preference banner — client component */}
        <ModuleAccessBanner moduleName="Barta" hideWhenDefault />

        {/* Barta chat — client component */}
        <BartaChatStarter />
      </div>
    </div>
  );
}
