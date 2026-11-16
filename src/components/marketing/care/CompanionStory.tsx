"use client";

import { HeartHandshake, MessageCircle, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { copy } from "../home-content";
import { useHome } from "../HomeContext";
import { SectionEyebrow } from "../SectionEyebrow";
import { BartaPreview } from "./BartaPreview";
import { ShonketPreview } from "./ShonketPreview";
import { AdaptPreview } from "./AdaptPreview";
import { BondhonPreview } from "./BondhonPreview";

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
