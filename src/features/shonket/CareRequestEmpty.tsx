import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import styles from "./shonket.module.css";

export function CareRequestEmpty({ screen }: { screen: "review" | "status" }) {
  const isReview = screen === "review";
  return (
    <div className={styles.experience}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>HUMAN HELP</p>
        <h1 id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>{isReview ? "No message to review" : "No request status"}</h1>
        <p className={styles.lead}>{isReview ? "This review page needs a message prepared in the help form." : "No request has been sent from this device yet."}</p>
      </header>
      <div className={styles.emptyRoute}>
        <span className={styles.emptyIcon}><FileText size={25} aria-hidden="true" /></span>
        <p>{isReview ? "No help request has been prepared in this browser session." : "There is no sent request to show here."}</p>
        <Link href="/app/care" className={`pro-btn pro-btn-primary ${styles.cardAction}`}>Go to the help form <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
