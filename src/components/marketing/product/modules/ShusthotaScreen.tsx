"use client";

import { useState } from "react";
import { Heart, LockKeyhole, MessageCircle, Sun } from "lucide-react";
import { useHome } from "../../HomeContext";
import { copy } from "../../home-content";
import { ScreenTitle } from "../ScreenFrame";

export function ShusthotaScreen() {
  const { t } = useHome();
  const [mood, setMood] = useState("quiet");
  return <><ScreenTitle icon={<Sun size={25} />} small="Shusthota · সুস্থতা" title={t(copy("How are you, today?", "আজ আপনি কেমন আছেন?"))} />
    <fieldset className="story-mood-picker"><legend>{t(copy("A moment for yourself", "নিজের জন্য একটু সময়"))}</legend><div>{[
      ["quiet", copy("Quiet", "শান্ত"), Sun], ["tired", copy("Tired", "ক্লান্ত"), Heart], ["unsure", copy("Unsure", "অনিশ্চিত"), MessageCircle],
    ].map(([value, label, Icon]) => { const MoodIcon = Icon as typeof Sun; const moodLabel = label as ReturnType<typeof copy>; return <label key={value as string}><input type="radio" name="sample-mood" aria-label={t(moodLabel)} value={value as string} checked={mood === value} onChange={() => setMood(value as string)} /><MoodIcon size={26} aria-hidden="true" /><span>{t(moodLabel)}</span></label>; })}</div></fieldset>
    <div className="story-rest-note"><Heart size={27} aria-hidden="true" /><h4>{t(copy("A little room to rest.", "বিশ্রামের জন্য একটু জায়গা।"))}</h4><p>{t(copy("Your pace. No score to keep.", "আপনার গতি। কোনো স্কোরের চাপ নেই।"))}</p></div>
    <p className="story-screen-lock"><LockKeyhole size={18} aria-hidden="true" />{t(copy("Your diary is yours.", "আপনার ডায়েরি আপনারই।"))}</p></>;
}
