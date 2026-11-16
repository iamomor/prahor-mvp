"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Baby, BookOpen, Check, ChevronRight, Heart, HeartHandshake, House, LockKeyhole, MapPin, MessageCircle, Pause, Play, SlidersHorizontal, Sun, UserRound } from "lucide-react";
import { ProhorSymbol } from "./HomeBrand";
import { useHome } from "./HomeContext";
import { copy } from "./home-content";

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
  media.addEventListener("change", callback);
  return () => { observer.disconnect(); media.removeEventListener("change", callback); };
}
function reducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduce";
}

function SampleSource() {
  // This decorative citation uses the same verified source as ProductScreens.
  return <span className="hero-source"><BookOpen size={12} /><span>WHO · Antenatal care, 2016</span><ArrowUpRight size={12} /></span>;
}

function SampleAnswer() {
  return <><p className="hero-question" lang="bn">আমার পছন্দও কি গুরুত্বপূর্ণ?</p><p className="hero-answer" lang="bn">আপনার অভিজ্ঞতাও যত্নের অংশ।</p><SampleSource /></>;
}

function SampleTimeline() {
  return <div className="hero-timeline">
    <div><span className="hero-timeline-icon"><UserRound size={16} /></span><span><strong>Mother</strong><small>Visit questions</small></span></div>
    <div><span className="hero-timeline-icon"><Baby size={16} /></span><span><strong>Baby</strong><small>Separate record</small></span></div>
  </div>;
}

function PhoneHome() {
  return <div className="hero-screen hero-screen-home" data-screen="home">
    <span className="hero-screen-eyebrow">YOUR CARE. YOUR WAY.</span>
    <p className="hero-phone-greeting" lang="bn">আজ কী করতে চান?</p>
    <p className="hero-phone-gloss">What would you like to do?</p>
    <div className="hero-task-grid">{[
      { icon: MessageCircle, label: "Ask PROHOR", bn: "প্রশ্ন করুন" },
      { icon: Heart, label: "My Health", bn: "আমার স্বাস্থ্য" },
      { icon: Sun, label: "My Wellness", bn: "আমার সুস্থতা" },
      { icon: MapPin, label: "Find Care", bn: "সেবা খুঁজুন" },
    ].map(({ icon: Icon, label, bn }) => <div className="hero-task" key={label}><span><Icon size={21} strokeWidth={1.6} /></span><strong>{label}</strong><small lang="bn">{bn}</small></div>)}</div>
    <div className="hero-phone-adjust"><SlidersHorizontal size={15} /><span>Your language. Your pace.</span><ChevronRight size={14} /></div>
    <p className="hero-phone-private"><LockKeyhole size={12} />Private by your choice</p>
  </div>;
}

function ProductPhone() {
  return <div className="hero-phone-entrance hero-entrance">
    <div className="hero-product-phone">
      <div className="hero-phone-hardware"><span /></div>
      <div className="hero-phone-brand"><ProhorSymbol /><strong>PROHOR</strong><span lang="bn">প্রহর</span></div>
      <div className="hero-phone-screens" aria-hidden="true">
        <PhoneHome />
        <div className="hero-screen hero-screen-ask" data-screen="ask"><span className="hero-screen-eyebrow">BARTA · বার্তা</span><p className="hero-phone-title" lang="bn">আপনার ভাষায়, সূত্রসহ।</p><p className="hero-phone-gloss">Room for your questions.</p><div className="hero-phone-answer"><MessageCircle size={22} /><SampleAnswer /></div><p className="hero-phone-education">Sample educational answer.<br />People provide clinical care.</p><div className="hero-phone-compose"><span lang="bn">আপনার প্রশ্ন লিখুন</span><ArrowUpRight size={17} /></div></div>
        <div className="hero-screen hero-screen-health" data-screen="health"><span className="hero-screen-eyebrow">JIBONREKHA · জীবনরেখা</span><p className="hero-phone-title">One journey.<br />Two care stories.</p><p className="hero-phone-gloss">Your records, connected.</p><div className="hero-phone-week"><Heart size={19} /><strong>Week 24</strong><span>Sample journey</span></div><SampleTimeline /><div className="hero-phone-record"><BookOpen size={17} /><span>Visit questions<small>Recorded by you</small></span><ChevronRight size={15} /></div><p className="hero-phone-private"><LockKeyhole size={12} />You choose what to share</p></div>
      </div>
      <div className="hero-phone-nav"><span><House size={17} />Home</span><span><MessageCircle size={17} />Ask</span><span><Heart size={17} />Health</span><span><HeartHandshake size={17} />Care</span></div>
      <div className="hero-phone-homebar"><span /></div>
    </div>
  </div>;
}

export function HeroProductScene() {
  const { t } = useHome();
  const container = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeMotion, reducedMotionSnapshot, () => false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setStarted(true); observer.disconnect(); }
    }, { threshold: 0.15 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={container} className="hero-showcase" data-started={started} data-paused={paused}>
    <div className="hero-product-scene" role="img" aria-label={t(copy("Illustration of the PROHOR app with sample answers, records and sharing controls", "নমুনা উত্তর, রেকর্ড ও শেয়ার করার নিয়ন্ত্রণসহ প্রহর অ্যাপের চিত্র"))}>
      <div className="hero-scene-art" aria-hidden="true" lang="en">
        <div className="hero-scene-rings"><span /><span /><span /></div>
        <div className="hero-scene-panel hero-entrance" />
        <span className="hero-scene-sample"><span />Sample data</span>
        <ProductPhone />
        <div className="hero-card-position hero-barta-position hero-entrance"><div className="hero-float hero-float-barta"><div className="hero-scene-card hero-barta-card"><span className="hero-card-accent hero-accent-barta" /><div className="hero-card-heading"><MessageCircle size={16} /><strong>Barta</strong><span lang="bn">বার্তা</span></div><SampleAnswer /></div></div></div>
        <div className="hero-card-position hero-records-position hero-entrance"><div className="hero-float hero-float-records"><div className="hero-scene-card hero-records-card"><span className="hero-card-accent hero-accent-records" /><div className="hero-card-heading"><Heart size={16} /><strong>Jibonrekha</strong></div><div className="hero-card-week"><strong>Week 24</strong><span>Your care story</span></div><SampleTimeline /></div></div></div>
        <div className="hero-card-position hero-consent-position hero-entrance"><div className="hero-float hero-float-consent"><div className="hero-scene-card hero-consent-card"><div className="hero-card-heading"><HeartHandshake size={16} /><strong>Bondhon</strong><LockKeyhole size={13} /></div><div className="hero-consent-row"><span>Visit questions</span><span className="hero-sample-toggle hero-sample-toggle-on"><Check size={11} /></span></div><div className="hero-consent-row"><span>Selected reports</span><span className="hero-sample-toggle" /></div><div className="hero-consent-private"><LockKeyhole size={12} /><span>Diary &amp; AI conversations: <strong>Private</strong></span></div></div></div></div>
        <div className="hero-card-position hero-adapt-position hero-entrance"><div className="hero-float hero-float-adapt"><div className="hero-scene-card hero-adapt-card"><span className="hero-card-accent hero-accent-adapt" /><div className="hero-card-heading"><SlidersHorizontal size={15} /><strong>Adapt</strong></div><div className="hero-adapt-options"><span>A</span><span>A+</span></div><div className="hero-theme-dots"><i /><i /><i /></div></div></div></div>
      </div>
    </div>
    <button type="button" className="hero-motion-button" aria-pressed={paused || reducedMotion} disabled={reducedMotion} onClick={() => setPaused(value => !value)}>
      {paused && !reducedMotion ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
      {reducedMotion ? t(copy("Animation off · reduced motion", "অ্যানিমেশন বন্ধ · গতি কমানো")) : paused ? t(copy("Resume animation", "অ্যানিমেশন চালু করুন")) : t(copy("Pause animation", "অ্যানিমেশন থামান"))}
    </button>
  </div>;
}
