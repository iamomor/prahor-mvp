"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Circle, Clock3, HeartHandshake, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { copy } from "../home-content";
import { useHome } from "../HomeContext";
import { Preview } from "./Preview";

export function BondhonPreview() {
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
      <Link href="/bondhon" className="pro-btn pro-btn-secondary">{t(copy("Open Bondhon", "বন্ধন খুলুন"))}</Link>
    </Preview>
  );
}
