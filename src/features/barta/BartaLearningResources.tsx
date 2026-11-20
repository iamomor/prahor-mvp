import { useState } from "react";
import { ArrowUpRight, CirclePlay, Image as ImageIcon } from "lucide-react";
import type { Citation } from "@/lib/contracts/barta";
import type { Language } from "./barta-education-copy";
import { getBartaLearningResources } from "./learning-resources";
import styles from "./barta-education.module.css";

const copy = {
  en: { heading: "Pictures and videos", visual: "Illustrated guide", video: "Video", publisher: "UNICEF", newTab: "Opens in a new tab", load: "Load video from YouTube", close: "Close video", showImage: "Show picture", hideImage: "Hide picture" },
  bn: { heading: "ছবি ও ভিডিও", visual: "ছবিসহ নির্দেশিকা", video: "ভিডিও", publisher: "ইউনিসেফ", newTab: "নতুন ট্যাবে খুলবে", load: "ইউটিউব থেকে ভিডিও চালু করুন", close: "ভিডিও বন্ধ করুন", showImage: "ছবি দেখুন", hideImage: "ছবি লুকান" },
};

export function BartaLearningResources({ citations, locale }: { citations: readonly Citation[]; locale: Language }) {
  const [preview, setPreview] = useState<string>();
  const links = getBartaLearningResources(citations, locale);
  if (!links.length) return null;

  const text = copy[locale];
  return (
    <details className={styles.learningResources}
      onToggle={(event) => { if (!event.currentTarget.open) setPreview(undefined); }}>
      <summary>{text.heading} <span>({links.length.toLocaleString(locale === "bn" ? "bn-BD" : "en")})</span></summary>
      <ul>
        {links.map(({ kind, title, href, languageNote, publisher, videoId, imagePreview }) => {
          const showing = preview === href;
          const Icon = kind === "video" ? CirclePlay : ImageIcon;
          return (
            <li key={href}>
              <a href={href} target="_blank" rel="noopener noreferrer">
                <Icon size={18} aria-hidden="true" />
                <span>
                  <strong>{title[locale]}</strong>
                  <small>{publisher ?? text.publisher} · {text[kind]}{languageNote && ` · ${languageNote[locale]}`}
                    <span className={styles.announce}> ({text.newTab})</span>
                  </small>
                </span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              {(videoId || imagePreview) && (
                <button type="button" className={styles.read} aria-expanded={showing}
                  onClick={() => setPreview(showing ? undefined : href)}>
                  {videoId ? (showing ? text.close : text.load) : (showing ? text.hideImage : text.showImage)}
                </button>
              )}
              {showing && imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element -- Load this publisher preview only after the reader requests it.
                <img className={styles.learningImage} src={imagePreview.src} alt={imagePreview.alt[locale]}
                  loading="lazy" referrerPolicy="no-referrer" />
              )}
              {showing && videoId && (
                <iframe className={styles.learningVideo} title={title[locale]}
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                  referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
