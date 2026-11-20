import { homepagePreferenceBootstrap } from "@/components/marketing/preference-bootstrap";
import { Brand } from "@/components/ui/Brand";
import { ShonketFocusHeading } from "./ShonketFocusHeading";
import { ShonketPublicNavigation, ShonketSkipLink } from "./ShonketPublicNavigation";
import { ShonketOfflineStatus } from "./ShonketOfflineStatus";
import styles from "./shonket.module.css";

export function ShonketPublicFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ShonketFocusHeading />
      <script dangerouslySetInnerHTML={{ __html: homepagePreferenceBootstrap }} />
      <ShonketSkipLink />
      <header className={styles.publicHeader}>
        <div className="pro-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <Brand />
          <ShonketPublicNavigation />
        </div>
      </header>
      <div id="shonket-main" tabIndex={-1} className="pro-shell py-8 sm:py-12">
        <ShonketOfflineStatus />
        {children}
      </div>
    </>
  );
}

export { ShonketCareNavigation } from "./ShonketCareNavigation";
