"use client";

import { ArrowUpRight } from "lucide-react";
import { HomeBrand } from "./HomeBrand";
import { useHome } from "./HomeContext";
import { copy } from "./home-content";

export function PublicFooter() {
  const { t, openPreferences } = useHome();
  return (
    <footer className="home-footer home-container">
      <div className="home-footer-top">
        <HomeBrand />
        <p>{t(copy("Thoughtfully made for Bangladesh.", "বাংলাদেশের জন্য যত্ন নিয়ে তৈরি।"))}</p>
        <nav aria-label={t(copy("Footer", "ফুটার নেভিগেশন"))}>
          <a href="#trust">{t(copy("Trust & privacy", "আস্থা ও গোপনীয়তা"))}<ArrowUpRight size={16} aria-hidden="true" /></a>
          <button onClick={openPreferences} aria-haspopup="dialog">{t(copy("Adjust how you use PROHOR", "প্রহর ব্যবহারের ধরন বদলান"))}</button>
        </nav>
      </div>
      <div className="home-footer-bottom">
        <p>© {new Date().getFullYear()} PROHOR · {t(copy("A product prototype.", "একটি পণ্যের প্রোটোটাইপ।"))}</p>
        <p>{t(copy("Educational and product demonstration only. Not a diagnostic or emergency service. Clinical services, provider connections and clinical validation are not available in this prototype.", "শুধু শিক্ষা ও পণ্যের ধারণা প্রদর্শনের জন্য। রোগ নির্ণয় বা জরুরি সেবা নয়। এই প্রোটোটাইপে চিকিৎসাসেবা, সেবাদাতার সংযোগ ও চিকিৎসাগত যাচাই নেই।"))}</p>
      </div>
    </footer>
  );
}
