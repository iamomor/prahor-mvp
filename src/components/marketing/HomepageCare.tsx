"use client";

import type { ProhorTheme } from "@/lib/access-preferences";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  HeartHandshake,
  Info,
  LockKeyhole,
  MessageCircle,
  Phone,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { copy } from "./home-content";
import { useHome } from "./HomeContext";
import { sampleQuestion, SampleTag, WHO_SOURCE } from "./ProductScreens";
import { SectionEyebrow } from "./SectionEyebrow";

const WARNING_SOURCE =
  "https://www.cdc.gov/hearher/maternal-warning-signs/index.html";

function SourceTag({ warning = false }: { warning?: boolean }) {
  return (
    <Link
      className="care-source font-tag"
      href={warning ? WARNING_SOURCE : WHO_SOURCE}
      target="_blank"
      rel="noreferrer"
      lang="en"
    >
      <BookOpen size={15} aria-hidden="true" />
      <span>
        {warning ? "CDC · Warning signs" : "WHO · Antenatal care, 2016"}
      </span>
      <ArrowUpRight size={14} aria-hidden="true" />
      <span className="home-sr-only">Opens in a new tab</span>
    </Link>
  );
}

function Preview({
  children,
  description,
}: {
  children: ReactNode;
  description: string;
}) {
  return (
    <div
      className="care-screen"
      role="img"
      aria-label={`Sample data. ${description}`}
    >
      <div className="care-screen-tag">
        <SampleTag />
      </div>
      <div className="care-static-screen" aria-hidden="true" inert>
        {children}
      </div>
    </div>
  );
}

function BartaPreview() {
  const { t } = useHome();
  return (
    <Preview
      description={t(
        copy(
          "A Bangla question and educational answer, WHO and CDC sources, and an explicit insufficient-evidence fallback. This is a product preview, not a live AI answer.",
          "বাংলা প্রশ্ন ও শিক্ষামূলক উত্তর, বিশ্ব স্বাস্থ্য সংস্থা ও সিডিসির সূত্র এবং প্রমাণ অপর্যাপ্ত হলে তার স্পষ্ট বার্তা। এটি পণ্যের নমুনা, সরাসরি এআই উত্তর নয়।",
        ),
      )}
    >
      <div className="care-conversation">
        <p className="care-question" lang="bn">
          আমার যত্নে আমার পছন্দও কি গুরুত্বপূর্ণ?
        </p>
        <div className="care-answer">
          <span className="care-answer-label font-tag" lang="en">
            <MessageCircle size={15} />
            Barta
          </span>
          <p lang="bn">
            মায়ের শারীরিক ও মানসিক সুস্থতার পাশাপাশি তাঁর অভিজ্ঞতাও গর্ভকালীন
            যত্নের অংশ।
          </p>
        </div>
      </div>
      <div className="care-sources">
        <SourceTag />
        <SourceTag warning />
      </div>
      <p className="care-evidence-note">
        <Info size={18} />
        <span>
          {t(
            copy(
              "Not enough approved evidence? PROHOR says so and suggests asking a clinician.",
              "অনুমোদিত প্রমাণ যথেষ্ট নয়? প্রহর তা জানায় এবং চিকিৎসকের কাছে জানতে পরামর্শ দেয়।",
            ),
          )}
        </span>
      </p>
    </Preview>
  );
}

function ShonketPreview() {
  const { t } = useHome();
  const statuses = [
    copy("Submitted", "জমা হয়েছে"),
    copy("Delivered", "পৌঁছেছে"),
    copy("Acknowledged", "প্রাপ্তি স্বীকার"),
    copy("Responded", "উত্তর এসেছে"),
  ];
  return (
    <Preview
      description={t(
        copy(
          "Reviewed-warning-signs layout with three CDC examples, a sample Call 999 button, and request tracking. Only Submitted is complete; Delivered, Acknowledged and Responded are pending. No care request has been sent.",
          "সিডিসির তিনটি সতর্কসংকেতের নমুনা, কল ৯৯৯ বোতাম ও অনুরোধের অগ্রগতি। শুধু জমা হয়েছে ধাপটি সম্পূর্ণ; পৌঁছানো, প্রাপ্তি স্বীকার ও উত্তর অপেক্ষমাণ। কোনো অনুরোধ পাঠানো হয়নি।",
        ),
      )}
    >
      <strong className="care-screen-heading">
        {t(copy("Warning signs, reviewed", "পর্যালোচিত সতর্কসংকেত"))}
      </strong>
      <ul className="care-warning-list">
        {[
          copy("A severe headache that persists", "তীব্র মাথাব্যথা যা কমছে না"),
          copy("Trouble breathing", "শ্বাস নিতে কষ্ট"),
          copy("Heavy bleeding", "অতিরিক্ত রক্তপাত"),
        ].map((item) => (
          <li key={item.en}>
            <ShieldCheck size={17} />
            <span>{t(item)}</span>
          </li>
        ))}
      </ul>
      <div className="care-help-actions">
        <SourceTag warning />
        <button type="button" className="care-call">
          <Phone size={18} />
          {t(copy("Call 999", "কল ৯৯৯"))}
          <ArrowUpRight size={17} />
        </button>
      </div>
      <ol className="care-request-steps">
        {statuses.map((status, index) => (
          <li key={status.en} data-complete={index === 0}>
            <span className="care-request-node">
              {index === 0 ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
            </span>
            <span className="font-tag">{t(status)}</span>
            <span className="font-tag care-request-state">
              {t(
                index === 0
                  ? copy("Complete", "সম্পূর্ণ")
                  : copy("Pending", "অপেক্ষমাণ"),
              )}
            </span>
          </li>
        ))}
      </ol>
      <p className="care-status-caption">
        {t(
          copy(
            "A request is never shown as delivered until it is.",
            "সত্যি না পৌঁছানো পর্যন্ত অনুরোধ পৌঁছেছে দেখানো হয় না।",
          ),
        )}
      </p>
    </Preview>
  );
}

const previewThemes: { value: ProhorTheme; label: string; letter: string }[] = [
  { value: "quiet-garden", label: "Quiet Garden", letter: "Q" },
  { value: "original-rose", label: "Original Rose", letter: "R" },
  { value: "morning-mist", label: "Morning Mist", letter: "M" },
];
const phrases = [
  { icon: HeartHandshake, text: copy("I need help", "আমার সাহায্য দরকার") },
  {
    icon: MessageCircle,
    text: copy("I have a question", "আমার একটি প্রশ্ন আছে"),
  },
];

function AdaptPreview() {
  const { t, locale } = useHome();
  const [scale, setScale] = useState(0);
  const [theme, setTheme] = useState<ProhorTheme>("quiet-garden");
  const [contrast, setContrast] = useState(false);
  const [phrase, setPhrase] = useState<number | null>(null);
  const [speechStatus, setSpeechStatus] = useState("");
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  useEffect(
    () => () => {
      if (utterance.current) {
        utterance.current.onend = null;
        utterance.current.onerror = null;
        window.speechSynthesis?.cancel();
      }
    },
    [],
  );

  function readAloud() {
    if (!window.speechSynthesis) {
      setSpeechStatus(
        t(
          copy(
            "Read aloud is unavailable in this browser. The text is here to read.",
            "এই ব্রাউজারে পড়ে শোনানো যায় না। লেখাটি এখানেই পড়তে পারবেন।",
          ),
        ),
      );
      return;
    }
    window.speechSynthesis.cancel();
    const text =
      phrase === null
        ? t(copy("Your care. Your way.", "আপনার যত্ন, আপনার মতো।"))
        : t(phrases[phrase].text);
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = locale === "bn" ? "bn-BD" : "en-GB";
    if (
      locale === "bn" &&
      !window.speechSynthesis
        .getVoices()
        .some((voice) => voice.lang.startsWith("bn"))
    ) {
      setSpeechStatus("বাংলা কণ্ঠ পাওয়া যায়নি। লেখাটি এখানেই পড়তে পারবেন।");
      return;
    }
    speech.onend = () => {
      utterance.current = null;
      setSpeechStatus(
        t(
          copy(
            "Finished reading. Nothing was sent.",
            "পড়া শেষ। কিছু পাঠানো হয়নি।",
          ),
        ),
      );
    };
    speech.onerror = () => {
      utterance.current = null;
      setSpeechStatus(
        t(
          copy(
            "Read aloud could not finish. The text is here to read.",
            "পড়ে শোনানো শেষ হয়নি। লেখাটি এখানেই পড়তে পারবেন।",
          ),
        ),
      );
    };
    utterance.current = speech;
    setSpeechStatus(
      t(
        copy(
          "Reading this sample aloud. Nothing is sent.",
          "নমুনাটি পড়ে শোনানো হচ্ছে। কিছু পাঠানো হচ্ছে না।",
        ),
      ),
    );
    window.speechSynthesis.speak(speech);
  }

  return (
    <div
      className="care-screen care-adapt-preview"
      data-prohor-preview
      data-theme={theme}
      data-contrast={contrast ? "more" : undefined}
      role="group"
      aria-label={t(copy("Try Adapt locally", "এখানেই অ্যাডাপ্ট চেষ্টা করুন"))}
    >
      <div className="care-screen-tag">
        <SampleTag />
      </div>
      <div className="care-control-row">
        <span className="font-tag">{t(copy("Text size", "লেখার আকার"))}</span>
        <div
          className="care-size-control"
          role="group"
          aria-label={t(copy("Sample text size", "নমুনা লেখার আকার"))}
        >
          {["A", "A+", "A++"].map((label, index) => (
            <button
              type="button"
              key={label}
              aria-label={t(
                copy(`${label} sample text size`, `${label} নমুনা লেখার আকার`),
              )}
              aria-pressed={scale === index}
              onClick={() => setScale(index)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="care-text-sample" data-size={scale}>
        <p lang="bn">আপনার যত্ন, আপনার মতো।</p>
        <p lang="en">Your care. Your way.</p>
      </div>
      <div className="care-control-row care-appearance-controls">
        <span className="font-tag">{t(copy("Theme", "থিম"))}</span>
        <div
          className="care-theme-control"
          role="group"
          aria-label={t(copy("Sample theme", "নমুনা থিম"))}
        >
          {previewThemes.map((item) => (
            <button
              type="button"
              key={item.value}
              className="care-theme-swatch"
              data-prohor-preview
              data-theme={item.value}
              aria-label={item.label}
              title={item.label}
              aria-pressed={theme === item.value}
              onClick={() => setTheme(item.value)}
            >
              {theme === item.value ? (
                <Check size={18} aria-hidden="true" />
              ) : (
                item.letter
              )}
            </button>
          ))}
        </div>
      </div>
      <label className="care-contrast-switch">
        <span>{t(copy("Higher contrast", "বেশি কনট্রাস্ট"))}</span>
        <input
          type="checkbox"
          role="switch"
          checked={contrast}
          onChange={(event) => setContrast(event.target.checked)}
        />
        <span className="care-switch-track" aria-hidden="true">
          <span />
        </span>
      </label>
      <div
        className="care-aac-tiles"
        role="group"
        aria-label={t(copy("Choose a sample phrase", "নমুনা বাক্য বাছুন"))}
      >
        {phrases.map(({ icon: Icon, text }, index) => (
          <button
            type="button"
            key={text.en}
            aria-pressed={phrase === index}
            onClick={() => {
              setPhrase(index);
              setSpeechStatus(
                t(
                  copy(
                    "Sample phrase selected. Nothing was sent.",
                    "নমুনা বাক্য বাছা হয়েছে। কিছু পাঠানো হয়নি।",
                  ),
                ),
              );
            }}
          >
            <Icon size={23} aria-hidden="true" />
            <span>{t(text)}</span>
          </button>
        ))}
      </div>
      <div className="care-read-row">
        <button type="button" className="care-read-button" onClick={readAloud}>
          <Volume2 size={17} aria-hidden="true" />
          {t(copy("Read aloud", "পড়ে শোনান"))}
        </button>
        <span className="font-tag">
          {t(copy("Try it here only", "শুধু এই নমুনায়"))}
        </span>
      </div>
      <p className="care-speech-status" role="status">
        {speechStatus ||
          (phrase === null
            ? t(
                copy(
                  "Page settings stay as you chose them.",
                  "পাতার সেটিংস আপনার পছন্দমতোই থাকবে।",
                ),
              )
            : t(phrases[phrase].text))}
      </p>
    </div>
  );
}

function BondhonPreview() {
  const { t } = useHome();
  return (
    <Preview
      description={t(
        copy(
          "Mother to chosen supporter to provider. Visit questions selected, reports unselected. Diary and AI conversations stay private. A synthetic access log and Revoke access button illustrate consent; no records are shared.",
          "মা থেকে বাছাই করা সহায়ক, তারপর সেবাদাতা। সাক্ষাতের প্রশ্ন বাছা, রিপোর্ট বাছা নয়। ডায়েরি ও এআই কথোপকথন ব্যক্তিগত। নমুনা কার্যকলাপ ও অনুমতি প্রত্যাহারের বোতাম সম্মতির ধারণা দেখায়; কোনো রেকর্ড শেয়ার হয় না।",
        ),
      )}
    >
      <div className="care-consent-path">
        {[
          { icon: UserRound, label: copy("Mother", "মা") },
          {
            icon: HeartHandshake,
            label: copy("Chosen supporter", "বাছাই করা সহায়ক"),
          },
          { icon: ShieldCheck, label: copy("Provider", "সেবাদাতা") },
        ].map(({ icon: Icon, label }, index) => (
          <div key={label.en}>
            <Icon size={20} />
            <span className="font-tag">{t(label)}</span>
            {index < 2 && <ArrowRight className="care-path-arrow" size={16} />}
          </div>
        ))}
      </div>
      <div className="care-consent-options">
        {[
          copy("Visit questions", "সাক্ষাতের প্রশ্ন"),
          copy("Selected reports", "বাছাই করা রিপোর্ট"),
        ].map((label, index) => (
          <div key={label.en}>
            <span>{t(label)}</span>
            <span className="care-demo-toggle" data-on={index === 0}>
              {index === 0 ? <Check size={13} /> : <Circle size={13} />}
            </span>
            <span className="font-tag">
              {t(index === 0 ? copy("On", "চালু") : copy("Off", "বন্ধ"))}
            </span>
          </div>
        ))}
      </div>
      <div className="care-private-row">
        <LockKeyhole size={18} />
        <span>
          {t(copy("Diary & AI conversations", "ডায়েরি ও এআই কথোপকথন"))}
        </span>
        <span className="font-tag">{t(copy("Private", "ব্যক্তিগত"))}</span>
      </div>
      <p className="care-consent-note">
        <ShieldCheck size={17} />
        {t(
          copy(
            "Your review comes before sharing.",
            "শেয়ারের আগে আপনার পর্যালোচনা।",
          ),
        )}
      </p>
      <p className="care-audit font-tag">
        <Clock3 size={15} />
        <span>
          {t(
            copy(
              "Access log: supporter viewed appointment, today",
              "কার্যকলাপ: সহায়ক আজ সাক্ষাতের তথ্য দেখেছেন",
            ),
          )}
        </span>
      </p>
      <button type="button" className="care-revoke">
        {t(copy("Revoke access", "অনুমতি প্রত্যাহার"))}
        <ArrowUpRight size={16} />
      </button>
    </Preview>
  );
}

export function CompanionStory() {
  const { t } = useHome();
  const cards = [
    {
      name: "Barta",
      bn: "বার্তা",
      icon: MessageCircle,
      title: copy(
        "A question deserves clarity.",
        "প্রশ্নের পাশে থাকুক স্পষ্টতা।",
      ),
      text: copy(
        "Bangla explanations, with sources to open and read.",
        "বাংলায় ব্যাখ্যার সঙ্গে খুলে পড়ার মতো সূত্র।",
      ),
      screen: <BartaPreview />,
    },
    {
      name: "Shonket",
      bn: "সংকেত",
      icon: ShieldCheck,
      title: copy("Help beyond the chatbot.", "চ্যাটবটের বাইরেও সহায়তা।"),
      text: copy(
        "Reviewed warning signs. A direct path to help.",
        "পর্যালোচিত সতর্কসংকেত। সহায়তার সরাসরি পথ।",
      ),
      screen: <ShonketPreview />,
    },
    {
      name: "Adapt",
      bn: "অ্যাডাপ্ট",
      icon: SlidersHorizontal,
      title: copy(
        "Your preferences belong here.",
        "এখানে জায়গা আছে আপনার পছন্দের।",
      ),
      text: copy(
        "Your text, theme and contrast. The same care.",
        "নিজের লেখার আকার, থিম ও কনট্রাস্ট। যত্ন একই।",
      ),
      screen: <AdaptPreview />,
    },
    {
      name: "Bondhon",
      bn: "বন্ধন",
      icon: HeartHandshake,
      title: copy("Connection, with permission.", "অনুমতি নিয়েই সংযোগ।"),
      text: copy(
        "Choose the people and records before sharing.",
        "শেয়ারের আগে মানুষ ও রেকর্ড বেছে নিন।",
      ),
      screen: <BondhonPreview />,
    },
  ];
  return (
    <section
      className="upgrade-companion story-section care-companion"
      aria-labelledby="companion-title"
    >
      <div className="home-container">
        <div className="story-section-heading">
          <div>
            <SectionEyebrow>
              {t(copy("Care that makes room for life", "জীবনের কথা ভেবে যত্ন"))}
            </SectionEyebrow>
            <h2 id="companion-title">
              {t(copy("Not just a tracker. ", "শুধু ট্র্যাকার নয়। "))}
              <em>{t(copy("A care companion.", "যত্নের সঙ্গী।"))}</em>
            </h2>
          </div>
          <p>
            {t(
              copy(
                "Understanding, access, safety and human connection. Thoughtful tools for the moments between appointments, too.",
                "বোঝাপড়া, ব্যবহারযোগ্যতা, সুরক্ষা ও মানুষের সংযোগ। সাক্ষাতের মাঝের সময়ের জন্যও বিবেচনাপূর্ণ উপায়।",
              ),
            )}
          </p>
        </div>
        <div className="care-bento">
          {cards.map(({ name, bn, icon: Icon, title, text, screen }) => (
            <article
              className={`care-card care-card-${name.toLowerCase()}`}
              key={name}
              id={`module-${name.toLowerCase()}`}
              tabIndex={-1}
            >
              <div className="care-card-top">
                <span className="care-icon">
                  <Icon size={23} aria-hidden="true" />
                </span>
                <span className="care-module-tag font-tag" lang="en">
                  {name}
                  <span aria-hidden="true">·</span>
                  <span lang="bn">{bn}</span>
                </span>
              </div>
              <h3>{t(title)}</h3>
              <p className="care-card-description">{t(text)}</p>
              {screen}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

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
