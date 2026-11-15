"use client";

import {
  ArrowRight, Baby, BookOpen, Check, FileCheck2, FileText,
  Heart, Leaf, LockKeyhole, MessageCircle, ScanText, ShieldCheck,
  SlidersHorizontal, Sun, UserRound,
} from "lucide-react";
import { ProhorSymbol } from "./HomeBrand";
import { useHome } from "./HomeContext";
import { copy } from "./home-content";

export function DemoLabel() {
  const { t } = useHome();
  return <span className="home-demo-label">{t(copy("Illustrative demo", "নমুনা প্রদর্শন"))}</span>;
}

export function CareWorkspace() {
  const { t } = useHome();
  return (
    <figure className="home-hero-stage">
      <svg className="home-care-orbit" width="0" height="0" viewBox="0 0 650 650" fill="none" aria-hidden="true">
        <circle cx="325" cy="325" r="280" />
        <path d="M46 327c0-155 125-280 279-280s280 125 280 280M88 327a237 237 0 0 1 474 0" />
        <circle className="home-orbit-dot" cx="325" cy="45" r="12" />
      </svg>
      <div className="home-workspace">
        <div className="home-workspace-top"><span><ProhorSymbol /><b lang="en">PROHOR</b></span><DemoLabel /></div>
        <div className="home-workspace-title"><p>{t(copy("Your care, in one place", "আপনার যত্ন, এক জায়গায়"))}</p><h2>{t(copy("A little clarity.", "একটু বোঝাপড়া।"))}<br /><span>{t(copy("A little more connection.", "আরও একটু সংযোগ।"))}</span></h2><Sun size={38} strokeWidth={1.3} aria-hidden="true" /></div>
        <div className="home-workspace-body">
          <div className="home-workspace-menu" aria-hidden="true"><Heart /><BookOpen /><MessageCircle /></div>
          <div className="home-workspace-content">
            <p className="home-workspace-label">{t(copy("What matters to you today?", "আজ আপনার কী প্রয়োজন?"))}</p>
            <div className="home-workspace-task"><span className="home-icon-tile"><BookOpen size={23} aria-hidden="true" /></span><div><h3>{t(copy("Understand my health", "আমার স্বাস্থ্য বুঝতে চাই"))}</h3><p>{t(copy("Bangla information, with its sources", "সূত্রসহ বাংলায় তথ্য"))}</p></div><ArrowRight size={19} aria-hidden="true" /></div>
            <div className="home-workspace-task"><span className="home-icon-tile"><FileText size={23} aria-hidden="true" /></span><div><h3>{t(copy("Keep my care connected", "আমার যত্নের তথ্য একসঙ্গে চাই"))}</h3><p>{t(copy("Records, questions and visit preparation", "রেকর্ড, প্রশ্ন ও সাক্ষাতের প্রস্তুতি"))}</p></div><ArrowRight size={19} aria-hidden="true" /></div>
            <div className="home-linked-records"><span><UserRound size={19} aria-hidden="true" />{t(copy("Mother", "মা"))}</span><span className="home-link-thread" aria-hidden="true" /><span><Baby size={20} aria-hidden="true" />{t(copy("Baby", "শিশু"))}</span></div>
            <p className="home-workspace-footnote">{t(copy("Connected journey. Separate health records.", "সংযুক্ত যাত্রা। আলাদা স্বাস্থ্য রেকর্ড।"))}</p>
          </div>
        </div>
        <div className="home-workspace-bottom"><SlidersHorizontal size={17} aria-hidden="true" /><span>{t(copy("Your language. Your preferences. Your permissions.", "আপনার ভাষা। আপনার পছন্দ। আপনার অনুমতি।"))}</span></div>
      </div>
      <figcaption>{t(copy("A preview of the vision. No health data or live care services.", "পরিকল্পনার নমুনা। স্বাস্থ্য তথ্য বা সরাসরি সেবা নেই।"))}</figcaption>
    </figure>
  );
}

export function EducationExhibit() {
  const { t } = useHome();
  return (
    <div className="home-education-exhibit">
      <div className="home-exhibit-bar"><span><BookOpen size={20} aria-hidden="true" />{t(copy("Understand, in your own language", "নিজের ভাষায় বুঝুন"))}</span><DemoLabel /></div>
      <div className="home-education-content">
        <div className="home-question-area"><span className="home-product-label" lang="en">Barta / Adapt</span><p className="home-bangla-question" lang="bn">পরবর্তী সাক্ষাতের জন্য<br />কীভাবে প্রস্তুতি নেব?</p><span className="home-question-translation">{t(copy("How can I prepare for my next visit?", "পরিকল্পিত বাংলা প্রশ্নের নমুনা"))}</span></div>
        <div className="home-source-area"><span className="home-icon-tile"><BookOpen size={26} aria-hidden="true" /></span><h4>{t(copy("An explanation you can trace.", "যে ব্যাখ্যার সূত্র দেখা যায়।"))}</h4><p>{t(copy("The source should be visible. Uncertainty should be clear. Your reading preferences should stay with you.", "সূত্র দৃশ্যমান থাকবে। অনিশ্চয়তা স্পষ্ট থাকবে। পড়ার পছন্দ সঙ্গে থাকবে।"))}</p><p className="home-provenance"><FileText size={17} aria-hidden="true" />{t(copy("No approved source connected · no AI answer generated", "অনুমোদিত সূত্র সংযুক্ত নয় · এআই উত্তর তৈরি হয়নি"))}</p></div>
      </div>
    </div>
  );
}

export function RecordExhibit() {
  const { t } = useHome();
  return (
    <div className="home-record-exhibit">
      <div className="home-exhibit-bar"><span>{t(copy("One journey. Two distinct records.", "এক যাত্রা। দুটি আলাদা রেকর্ড।"))}</span><DemoLabel /></div>
      <div className="home-record-lanes">
        <div><span className="home-record-owner"><UserRound size={21} aria-hidden="true" />{t(copy("Mother’s record", "মায়ের রেকর্ড"))}</span><div className="home-record-entry"><Heart size={21} aria-hidden="true" /><h4>{t(copy("An observation, in context", "প্রসঙ্গসহ একটি পর্যবেক্ষণ"))}</h4><p>{t(copy("Recorded by you · demo entry", "আপনার লেখা · নমুনা নোট"))}</p></div></div>
        <div><span className="home-record-owner"><Baby size={23} aria-hidden="true" />{t(copy("Baby’s record", "শিশুর রেকর্ড"))}</span><div className="home-record-entry home-record-entry-baby"><Baby size={23} aria-hidden="true" /><h4>{t(copy("A separate history, from the start", "শুরু থেকেই আলাদা ইতিহাস"))}</h4><p>{t(copy("Clinician entries when available · planned", "পাওয়া গেলে চিকিৎসকের নথি · পরিকল্পিত"))}</p></div></div>
      </div>
      <div className="home-report-gate"><span className="home-icon-tile"><ScanText size={27} aria-hidden="true" /></span><div><h4>{t(copy("A report is not a verified record. Yet.", "রিপোর্টের তথ্য এখনো যাচাইকৃত রেকর্ড নয়।"))}</h4><p>{t(copy("Upload → extract → review → explain → confirm save to the right record", "নথি দিন → তথ্য নিন → যাচাই → বুঝুন → সঠিক রেকর্ডে নিশ্চিত করে রাখুন"))}</p></div><FileCheck2 size={28} aria-hidden="true" /></div>
    </div>
  );
}

export function EverydayExhibit() {
  const { t } = useHome();
  return (
    <div className="home-day-exhibit">
      <div className="home-exhibit-bar"><span><Leaf size={21} aria-hidden="true" />{t(copy("A day at your pace", "দিনটা আপনার নিজের গতিতে"))}</span><DemoLabel /></div>
      <div className="home-day-layout"><div className="home-day-symbol" aria-hidden="true"><Sun strokeWidth={1} /><span /><Leaf strokeWidth={1.2} /></div><div><h4>{t(copy("Make space for yourself.", "নিজের জন্যও জায়গা রাখুন।"))}</h4><ul className="home-simple-list"><li><Check size={18} aria-hidden="true" />{t(copy("Rest, energy & mood · optional", "বিশ্রাম, শক্তি ও মনের অবস্থা · ঐচ্ছিক"))}</li><li><Check size={18} aria-hidden="true" />{t(copy("Questions to take to your visit", "সাক্ষাতে সঙ্গে নেওয়ার প্রশ্ন"))}</li><li><Check size={18} aria-hidden="true" />{t(copy("Communication & access needs to check", "যোগাযোগ ও ব্যবহারযোগ্যতার যে তথ্য যাচাই করতে হবে"))}</li></ul></div></div>
      <div className="home-day-note"><LockKeyhole size={18} aria-hidden="true" /><span>{t(copy("Diary private by default · planned", "ডায়েরি ব্যক্তিগত থাকবে · পরিকল্পিত"))}</span><span>{t(copy("Facility details: not verified", "প্রতিষ্ঠানের তথ্য: যাচাই হয়নি"))}</span></div>
    </div>
  );
}

export function ConsentExhibit() {
  const { t } = useHome();
  return (
    <div className="home-consent-exhibit">
      <div className="home-exhibit-bar"><span><ShieldCheck size={21} aria-hidden="true" />{t(copy("Before a request is shared", "অনুরোধ শেয়ার করার আগে"))}</span><DemoLabel /></div>
      <div className="home-consent-path"><div><span className="home-path-number">01</span><h4>{t(copy("A direct path to help", "সহায়তার সরাসরি পথ"))}</h4><p>{t(copy("Reviewed safety information, without an AI gate.", "এআইয়ের বাধা ছাড়া পর্যালোচিত সুরক্ষার তথ্য।"))}</p><ShieldCheck size={28} aria-hidden="true" /></div><ArrowRight className="home-consent-arrow" size={25} aria-hidden="true" /><div><span className="home-path-number">02</span><h4>{t(copy("A sharing decision that is yours", "শেয়ারের সিদ্ধান্ত আপনার"))}</h4><ul><li><Check size={17} aria-hidden="true" />{t(copy("Selected visit notes", "বাছাই করা সাক্ষাতের নোট"))}</li><li><LockKeyhole size={17} aria-hidden="true" />{t(copy("Diary & AI chats excluded", "ডায়েরি ও এআই কথোপকথন বাদ"))}</li></ul></div></div>
      <p className="home-not-sent"><LockKeyhole size={17} aria-hidden="true" />{t(copy("No recipient connected. Nothing sent. Access must be explicit and revocable.", "প্রাপক সংযুক্ত নয়। কিছু পাঠানো হয়নি। অনুমতি হবে স্পষ্ট ও প্রত্যাহারযোগ্য।"))}</p>
    </div>
  );
}

export function MobileExhibit() {
  const { t } = useHome();
  return (
    <figure className="home-mobile-exhibit">
      <div className="home-mobile-sheet">
        <div className="home-mobile-sheet-top"><span><ProhorSymbol /><b lang="en">PROHOR</b></span><span lang="bn">বাংলা</span></div>
        <DemoLabel />
        <div className="home-mobile-welcome"><ProhorSymbol /><h3 lang="bn">আপনার যত্ন,<br />আপনার মতো।</h3><p lang="bn">আজ কী করতে চান?</p></div>
        <div className="home-mobile-choice"><BookOpen size={23} aria-hidden="true" /><span lang="bn">স্বাস্থ্যতথ্য বুঝুন</span><ArrowRight size={19} aria-hidden="true" /></div>
        <div className="home-mobile-choice"><Heart size={23} aria-hidden="true" /><span lang="bn">আমার যত্নের যাত্রা</span><ArrowRight size={19} aria-hidden="true" /></div>
        <div className="home-mobile-private"><LockKeyhole size={18} aria-hidden="true" /><span lang="bn">আমার তথ্য, আমার নিয়ন্ত্রণে।</span></div>
      </div>
      <figcaption>{t(copy("An interface concept. No private record is open.", "পর্দার ধারণা। কোনো ব্যক্তিগত রেকর্ড খোলা নেই।"))}</figcaption>
    </figure>
  );
}
