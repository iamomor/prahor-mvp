import { ArrowRight, BookOpenText, HeartHandshake, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AppCard } from "@/components/ui/AppCard";
import styles from "./shonket.module.css";

export function SafetyHome() {
  return (
    <div className={styles.experience}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>SHONKET · SAFETY &amp; SUPPORT</p>
          <h1 id="shonket-screen-title" tabIndex={-1} className={`${styles.title} pro-editorial`}>Support, at your pace.</h1>
          <p className={styles.lead}>Find reviewed information when it is available, or prepare a message for human support. Choose what feels useful to you.</p>
          <Link href="/app/care" className={`pro-btn pro-btn-primary ${styles.heroAction}`}>
            <HeartHandshake size={19} aria-hidden="true" /> Ask for human help <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.heroArt} aria-hidden="true">
          <div className={styles.artCircle}><ShieldCheck size={58} strokeWidth={1.4} /></div>
          <span className={styles.artLeaf} />
          <span className={styles.artDot} />
        </div>
        <p className={styles.heroCaption}><ShieldCheck size={16} aria-hidden="true" /> Your choices stay yours.</p>
      </header>

      <section className={styles.emergencyServices} aria-labelledby="bangladesh-services-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>BANGLADESH · DIRECT SERVICES</p><h2 id="bangladesh-services-title" className={`${styles.sectionTitle} pro-editorial`}>Emergency and health support</h2></div>
          <p className={styles.sectionIntro}>Call the service directly. PROHOR does not contact or dispatch these services.</p>
        </div>
        <div className={styles.serviceGrid}>
          <AppCard as="article" className={styles.serviceCard}>
            <div className={styles.serviceTop}><span className={`${styles.serviceIcon} ${styles.emergencyIcon}`}><Phone size={22} aria-hidden="true" /></span><span className={styles.serviceKind}>EMERGENCY SERVICE</span></div>
            <h3 className={styles.cardTitle}>National Emergency Service</h3>
            <a className={styles.serviceNumber} href="tel:999" aria-label="Call National Emergency Service at 999">999</a>
            <p className={styles.cardText}>Reach the national emergency call service for police, fire service, ambulance service or related information. The directory says it operates 24 hours and calls are free from any phone.</p>
            <p className={styles.serviceBangla} lang="bn">জাতীয় জরুরি সেবার সঙ্গে সরাসরি কথা বলতে ৯৯৯ নম্বরে কল করুন। এটি প্রহর থেকে করা কল নয়।</p>
            <div className={styles.serviceCaveat}>A call does not guarantee ambulance availability or dispatch. This is not a maternal-specific dispatch service.</div>
            <div className={styles.serviceLinks}><a href="tel:999" className={`pro-btn pro-btn-primary ${styles.serviceCall}`}><Phone size={17} aria-hidden="true" /> Call 999</a><a href="https://bangladesh.gov.bd/pages/static-pages/69a55ba386514399668e4e89" target="_blank" rel="noreferrer">Official government directory <ArrowRight size={15} aria-hidden="true" /></a></div>
            <p className={styles.sourceDate}>Government directory checked 18 November 2026.</p>
          </AppCard>
          <AppCard as="article" className={styles.serviceCard}>
            <div className={styles.serviceTop}><span className={styles.serviceIcon}><HeartHandshake size={22} aria-hidden="true" /></span><span className={styles.serviceKind}>DOCTOR CONSULTATION &amp; HEALTH INFORMATION</span></div>
            <h3 className={styles.cardTitle}>DGHS Shastho Batayon</h3>
            <a className={styles.serviceNumber} href="tel:16263" aria-label="Call DGHS Shastho Batayon at 16263">16263</a>
            <p className={styles.cardText}>Call for direct doctor consultation and general health or hospital information. The service also provides ambulance information and says it operates 24 hours.</p>
            <p className={styles.serviceBangla} lang="bn">ডাক্তারের পরামর্শ ও স্বাস্থ্যতথ্যের জন্য স্বাস্থ্য বাতায়ন ১৬২৬৩ নম্বরে সরাসরি কল করুন।</p>
            <p className={styles.serviceCaveat}>Ambulance information is not a guarantee of ambulance dispatch. Mobile call charges may apply; this service is not connected to PROHOR.</p>
            <div className={styles.serviceLinks}><a href="tel:16263" className={`pro-btn pro-btn-secondary ${styles.serviceCall}`}><Phone size={17} aria-hidden="true" /> Call 16263</a><a href="https://16263.dghs.gov.bd/" target="_blank" rel="noreferrer">Official DGHS website <ArrowRight size={15} aria-hidden="true" /></a></div>
            <p className={styles.sourceDate}>DGHS service page checked 18 November 2026.</p>
          </AppCard>
        </div>
        <p className={styles.dispatchDisclosure}>PROHOR is not an emergency dispatch service. Calls are started by you from your device; PROHOR does not place calls or guarantee a response.</p>
      </section>

      <section className={styles.homeNextSteps} aria-labelledby="safety-choices-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>START HERE</p><h2 id="safety-choices-title" className={`${styles.sectionTitle} pro-editorial`}>What would help right now?</h2></div>
          <p className={styles.sectionIntro}>Two clear paths. You can return here any time.</p>
        </div>
        <div className={styles.homeActionGrid}>
          <AppCard as="article" className={styles.helpCard}>
            <div className={`${styles.choiceIcon} ${styles.helpIcon}`}><HeartHandshake size={23} aria-hidden="true" /></div>
            <p className={styles.actionKicker}>HUMAN SUPPORT</p>
            <h3 className={styles.cardTitle}>Prepare a message</h3>
            <p className={styles.cardText}>Choose a communication method, write what you want to say and review it.</p>
            <Link href="/app/care" className={`pro-btn pro-btn-primary ${styles.cardAction}`}>Start a message <ArrowRight size={17} aria-hidden="true" /></Link>
          </AppCard>
          <div className={styles.informationPath}>
            <div className={`${styles.choiceIcon} ${styles.infoIcon}`}><BookOpenText size={23} aria-hidden="true" /></div>
            <div>
              <p className={styles.actionKicker}>REVIEWED INFORMATION</p>
              <h3 className={styles.cardTitle}>Explore safety information</h3>
              <p className={styles.cardText}>Clinician-reviewed content will be shown with its source and review details when approved content is available.</p>
            </div>
            <Link href="/safety/information" className={styles.textLink}>Visit information <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className={styles.trustStrip} aria-label="About this preview">
        <div><span className={styles.trustIcon}><BookOpenText size={18} aria-hidden="true" /></span><p><strong>Reviewed content</strong><span>Shown only after clinical review.</span></p></div>
        <div><span className={styles.trustIcon}><HeartHandshake size={18} aria-hidden="true" /></span><p><strong>Your words, reviewed by you</strong><span>This preview does not send a request.</span></p></div>
        <p className={styles.previewNotice}>Preview · No emergency service or care worker is connected.</p>
      </section>
    </div>
  );
}
