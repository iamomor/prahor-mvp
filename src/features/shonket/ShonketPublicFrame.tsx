import { BookOpenText, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { homepagePreferenceBootstrap } from "@/components/marketing/preference-bootstrap";
import { Brand } from "@/components/ui/Brand";
import { ShonketFocusHeading } from "./ShonketFocusHeading";
import styles from "./shonket.module.css";

export function ShonketPublicFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ShonketFocusHeading />
      <script dangerouslySetInnerHTML={{ __html: homepagePreferenceBootstrap }} />
      <a href="#shonket-main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-pro-bg focus:p-3">Skip to Shonket</a>
      <header className={styles.publicHeader}>
        <div className="pro-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <Brand />
          <nav className={styles.publicNav} aria-label="Shonket pages">
            <Link href="/safety/information"><BookOpenText size={16} aria-hidden="true" /> Information</Link>
            <Link href="/app/care"><HeartHandshake size={16} aria-hidden="true" /> Human help</Link>
          </nav>
        </div>
      </header>
      <main id="shonket-main" tabIndex={-1} className="pro-shell py-8 sm:py-12">{children}</main>
    </>
  );
}

export function ShonketCareNavigation({ current }: { current: "form" | "review" | "status" }) {
  const labels = { form: "Prepare message", review: "Review", status: "Status" };
  return (
    <nav className={styles.careNavigation} aria-label="Care request steps">
      <ShonketFocusHeading />
      <Link href="/safety">Shonket home</Link>
      <span aria-hidden="true">/</span>
      <Link href="/app/care">Human help</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{labels[current]}</span>
    </nav>
  );
}
