"use client";

import { BookOpen, Check, CheckCircle2, HeartHandshake, Info, LockKeyhole, MessageCircle, UserRound } from "lucide-react";
import { useEffect, useRef } from "react";
import { copy } from "../home-content";
import { useHome } from "../HomeContext";
import { sampleQuestion } from "../product/content";
import { SectionEyebrow } from "../SectionEyebrow";
import { SourceTag } from "./SourceTag";
import { SampleTag } from "../product/ScreenFrame";

export function SupportStory() {
  const { t } = useHome();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = panel.current;
    if (
      !element ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.motion === "reduce"
    )
      return;
    element.dataset.reveal = "ready";
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.dataset.reveal = "visible";
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const steps = [
    {
      icon: MessageCircle,
      title: copy("She asks", "তিনি প্রশ্ন করেন"),
      body: copy(
        "Her words are the starting point.",
        "তাঁর কথাই শুরুর জায়গা।",
      ),
      detail: (
        <>
          <p className="care-step-question" lang="bn">
            {sampleQuestion}
          </p>
          <p className="care-step-gloss" lang="en">
            How can I prepare for my next visit?
          </p>
        </>
      ),
    },
    {
      icon: BookOpen,
      title: copy("Evidence is found", "সূত্র খুঁজে দেখা হয়"),
      body: copy(
        "Sources, with their limits in view.",
        "সূত্রের সঙ্গে তার সীমাও স্পষ্ট।",
      ),
      detail: (
        <>
          <SourceTag />
          <span className="care-dark-chip care-insufficient font-tag">
            <Info size={15} />
            {t(copy("Not enough evidence", "যথেষ্ট প্রমাণ নেই"))}
          </span>
        </>
      ),
    },
    {
      icon: LockKeyhole,
      title: copy("She chooses what to share", "কী শেয়ার করবেন, তিনি বাছেন"),
      body: copy(
        "Her review. Her recipient. Her say.",
        "তাঁর পর্যালোচনা, প্রাপক ও সিদ্ধান্ত।",
      ),
      detail: (
        <div className="care-sharing">
          <span className="care-dark-chip font-tag">
            <Check size={16} />
            {t(copy("My visit question", "আমার সাক্ষাতের প্রশ্ন"))}
          </span>
          <span className="care-dark-chip font-tag">
            <LockKeyhole size={16} />
            {t(copy("My diary stays private", "আমার ডায়েরি ব্যক্তিগত"))}
          </span>
        </div>
      ),
    },
    {
      icon: HeartHandshake,
      title: copy("A person follows up", "একজন মানুষ সাড়া দেন"),
      body: copy(
        "A clear handoff, with a human reply.",
        "স্পষ্ট হস্তান্তর, মানুষের সাড়া।",
      ),
      detail: (
        <>
          <div className="care-provider-row">
            <span className="care-provider-avatar">
              <UserRound size={20} />
            </span>
            <span>{t(copy("Request from Nila", "নীলার অনুরোধ"))}</span>
            <span className="care-dark-chip font-tag">
              <CheckCircle2 size={14} />
              {t(copy("Acknowledged", "প্রাপ্তি স্বীকার"))}
            </span>
          </div>
          <p className="care-provider-note">
            {t(
              copy(
                "Only what she chose reaches them.",
                "শুধু তাঁর বাছাই করা তথ্যই পৌঁছায়।",
              ),
            )}
          </p>
        </>
      ),
    },
  ];
  return (
    <section
      id="how-it-works"
      tabIndex={-1}
      className="upgrade-support story-section care-support"
      aria-labelledby="support-title"
    >
      <div className="home-container">
        <div ref={panel} className="upgrade-support-panel care-support-panel">
          <div className="care-panel-meta">
            <SectionEyebrow>
              {t(copy("A thoughtful path through", "ভেবেচিন্তে একটি পথ"))}
            </SectionEyebrow>
            <SampleTag />
          </div>
          <div className="care-support-heading">
            <h2 id="support-title">
              {t(copy("How one question becomes ", "একটি প্রশ্ন থেকে "))}
              <em>
                {t(
                  copy(
                    "safe, shared support.",
                    "নিরাপদ, সম্মতিসহ সহায়তার পথে।",
                  ),
                )}
              </em>
            </h2>
            <p>
              {t(
                copy(
                  "The question starts with her. Evidence makes its limits clear. Permission shapes what reaches another person.",
                  "প্রশ্ন শুরু হয় তাঁর কথা থেকে। প্রমাণের সীমা স্পষ্ট থাকে। অন্য মানুষের কাছে কী পৌঁছাবে, তা নির্ধারণ করে অনুমতি।",
                ),
              )}
            </p>
          </div>
          <div className="care-support-flow">
            <svg
              className="care-connector"
              viewBox="0 0 1000 2"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 1 H1000" pathLength="1" />
            </svg>
            <ol className="care-support-steps">
              {steps.map(({ icon: Icon, title, body, detail }, index) => (
                <li key={title.en}>
                  <div className="care-step-top">
                    <span className="care-step-icon">
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <span className="font-tag">
                      {t(copy(`Step ${index + 1}`, `ধাপ ${index + 1}`))}
                    </span>
                  </div>
                  <h3>{t(title)}</h3>
                  <p className="care-step-body">{t(body)}</p>
                  <div
                    className="care-step-detail"
                    role="img"
                    aria-label={t(
                      copy(
                        `Sample illustration for step ${index + 1}. ${index === 3 ? "A synthetic request from Nila is acknowledged. This is not a real provider response." : title.en}`,
                        `ধাপ ${index + 1}-এর নমুনা। ${index === 3 ? "নীলার কাল্পনিক অনুরোধের প্রাপ্তি স্বীকার দেখানো হয়েছে। এটি প্রকৃত সেবাদাতার উত্তর নয়।" : title.bn}`,
                      ),
                    )}
                  >
                    <div aria-hidden="true" inert>
                      {detail}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
