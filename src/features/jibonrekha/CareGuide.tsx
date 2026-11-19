"use client";

import Link from "next/link";
import { useState, type RefObject } from "react";
import { careForWeek, careGuideSources, guideWeekRange, whoModelContactWeeks } from "./care-guide-data";

type Props = {
  currentWeek: number | null;
  currentDay: number;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onAddNote: () => void;
};

const bn = (value: number) => new Intl.NumberFormat("bn-BD").format(value);
const selectClass = "min-h-12 w-full rounded-field border border-pro-control-border bg-pro-elevated px-3 py-2 text-pro-text focus-visible:outline-3 focus-visible:outline-pro-focus";
const buttonClass = "min-h-11 rounded-field border border-pro-control-border bg-pro-elevated px-4 py-2 font-semibold text-pro-primary focus-visible:outline-3 focus-visible:outline-pro-focus disabled:opacity-50";
const weekOptions = Array.from({ length: guideWeekRange.last }, (_, index) => index + 1);

export function CareGuide({ currentWeek, currentDay, headingRef, onBack, onAddNote }: Props) {
  const defaultWeek = currentWeek === null ? 12 : Math.min(Math.max(currentWeek, guideWeekRange.first), guideWeekRange.last);
  const [week, setWeek] = useState(defaultWeek);
  const [day, setDay] = useState(currentWeek === null ? 0 : currentDay);
  const items = careForWeek(week);
  const nextModelContact = whoModelContactWeeks.find(value => value >= week);
  const stage = week <= 12 ? "প্রথম ত্রৈমাসিক" : week <= 27 ? "দ্বিতীয় ত্রৈমাসিক" : "তৃতীয় ত্রৈমাসিক";

  return <div className="mx-auto grid max-w-3xl gap-6" lang="bn">
    <button type="button" onClick={onBack} className="w-fit min-h-11 font-semibold text-pro-primary underline">← জীবনরেখায় ফিরুন</button>
    <header className="grid gap-2">
      <p className="font-semibold text-pro-primary">মায়ের যত্ন · ১–৪১ সপ্তাহ</p>
      <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold">সপ্তাহভিত্তিক যত্নের পথ</h1>
      <p className="max-w-[65ch] text-pro-muted">পিডিএফের বিষয়গুলো সময় অনুযায়ী সাজানো হয়েছে। এটি শিক্ষামূলক তথ্য; আপনার পরীক্ষার তারিখ, প্রয়োজন ও ফল চিকিৎসক নির্ধারণ করবেন। প্রতিদিন নতুন আল্ট্রাসাউন্ড বা পরীক্ষা দরকার হয় না।</p>
    </header>

    <section aria-label="সপ্তাহ ও দিন বেছে নিন" className="grid gap-4 rounded-card border border-pro-border bg-pro-surface p-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <label className="grid gap-1 font-semibold">গর্ভকালের সপ্তাহ
          <select value={week} onChange={event => setWeek(Number(event.target.value))} className={selectClass}>{weekOptions.map(value => <option key={value} value={value}>{bn(value)} সপ্তাহ</option>)}</select>
        </label>
        <label className="grid gap-1 font-semibold">সপ্তাহের দিন
          <select value={day} onChange={event => setDay(Number(event.target.value))} className={selectClass}>{[0, 1, 2, 3, 4, 5, 6].map(value => <option key={value} value={value}>{bn(value)} দিন</option>)}</select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={week === guideWeekRange.first} onClick={() => setWeek(value => value - 1)} className={buttonClass}>← আগের সপ্তাহ</button>
        <button type="button" disabled={week === guideWeekRange.last} onClick={() => setWeek(value => value + 1)} className={buttonClass}>পরের সপ্তাহ →</button>
        {currentWeek !== null && <button type="button" onClick={() => { setWeek(defaultWeek); setDay(currentDay); }} className={buttonClass}>আমার বর্তমান সপ্তাহ</button>}
      </div>
      <p role="status" className="font-semibold">{bn(week)} সপ্তাহ {bn(day)} দিন · {stage}</p>
      <p className="text-sm text-pro-muted">{nextModelContact ? `WHO-এর আট যোগাযোগের উদাহরণে পরের সময় ${bn(nextModelContact)} সপ্তাহের কাছাকাছি।` : "৪০ সপ্তাহের পরের যোগাযোগ ও প্রসব পরিকল্পনা চিকিৎসকের সঙ্গে মিলিয়ে নিন।"} এটি আপনার বুক করা ভিজিট নয়; ব্যক্তিগত সময়সূচি আলাদা হতে পারে।</p>
      {currentWeek === null && <p className="text-sm text-pro-muted">আপনার গর্ভকালের তারিখ জানা নেই। এখানে বেছে নেওয়া সপ্তাহ শুধুই গাইড দেখানোর জন্য; ব্যক্তিগত তারিখ অনুমান করা হয়নি।</p>}
    </section>

    <section aria-labelledby="daily-care-heading" className="grid gap-3 rounded-card border border-pro-border bg-pro-elevated p-5">
      <h2 id="daily-care-heading" className="text-xl font-semibold">প্রতিদিন যা মনে রাখবেন</h2>
      <p>আজ কোনো প্রশ্ন, উপসর্গ বা আগের রিপোর্ট নিয়ে উদ্বেগ থাকলে লিখে রাখুন। নির্ধারিত গর্ভকালীন ভিজিটে এগুলো নিয়ে কথা বলুন। নতুন বা জরুরি উদ্বেগে ভিজিটের অপেক্ষা করবেন না।</p>
      {week >= 24 && <p>শিশুর নড়াচড়া নিয়ে উদ্বেগ বা কম মনে হলে যেকোনো সময় মাতৃসেবা দলের সঙ্গে যোগাযোগ করুন; এখানে নোট লেখা সাহায্য চাওয়ার বিকল্প নয়।</p>}
      <div className="flex flex-wrap gap-3"><button type="button" onClick={onAddNote} className={buttonClass}>আজকের নোট লিখুন</button><Link href="/faq" className={`${buttonClass} inline-flex items-center`}>জরুরি সহায়তা</Link></div>
      <a href={careGuideSources.nice.url} target="_blank" rel="noreferrer" className="w-fit text-sm font-semibold text-pro-primary underline">উৎস: {careGuideSources.nice.label} ↗</a>
    </section>

    <section aria-labelledby="week-tests-heading" className="grid gap-3">
      <div><h2 id="week-tests-heading" className="text-xl font-semibold">এই সময়ের পরীক্ষা ও আলোচনা</h2><p className="mt-1 text-pro-muted">সময়গুলো পরিকল্পনার জানালা, নির্দিষ্ট দিনে করতেই হবে এমন তালিকা নয়।</p></div>
      {items.length === 0 && <div className="rounded-card border border-pro-border bg-pro-elevated p-5"><h3 className="font-semibold">এই সপ্তাহে নতুন নির্দিষ্ট পরীক্ষা নেই</h3><p className="mt-2">পিডিএফ বা যাচাই করা গাইডলাইনে এই সপ্তাহের জন্য আলাদা রুটিন পরীক্ষা নেই। আগের ফল, পরের ভিজিট ও প্রশ্নগুলো চিকিৎসকের সঙ্গে মিলিয়ে নিন।</p></div>}
      {items.map(item => <article key={item.id} className="grid gap-3 rounded-card border border-pro-border bg-pro-elevated p-5">
        <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-lg font-semibold">{item.title}</h3><span className="rounded-pill border border-pro-control-border px-3 py-1 text-sm font-semibold">{item.status === "if-needed" ? "নির্দিষ্ট কারণ থাকলে" : item.status === "optional" ? "আলোচনা করে বেছে নিন" : "চিকিৎসকের সঙ্গে আলোচনা"}</span></div>
        <p className="text-sm font-semibold text-pro-muted">{bn(item.firstWeek)}–{bn(item.lastWeek)} সপ্তাহ</p>
        <dl className="grid gap-2"><dt className="font-semibold">কেন</dt><dd>{item.why}</dd><dt className="font-semibold">কী জানা দরকার</dt><dd>{item.detail}</dd></dl>
        <a href={careGuideSources[item.source].url} target="_blank" rel="noreferrer" className="w-fit text-sm font-semibold text-pro-primary underline">উৎস: {careGuideSources[item.source].label} ↗</a>
        {item.additionalSource && <a href={careGuideSources[item.additionalSource].url} target="_blank" rel="noreferrer" className="w-fit text-sm font-semibold text-pro-primary underline">আরও উৎস: {careGuideSources[item.additionalSource].label} ↗</a>}
      </article>)}
    </section>

    <section className="grid gap-3 rounded-card border border-pro-info bg-pro-info-soft p-5 text-pro-info">
      <h2 className="text-lg font-semibold">রিপোর্টের ফল নিজে সিদ্ধান্তের জন্য নয়</h2>
      <p>পিডিএফে দেওয়া একক “স্বাভাবিক” সীমা প্রত্যেক ব্যক্তির জন্য প্রযোজ্য নয়। রিপোর্টের মান, একক, সময় ও আগের ইতিহাস মিলিয়ে চিকিৎসক ব্যাখ্যা করবেন। বুঝি-তে রিপোর্ট থেকে নেওয়া লেখা আগে যাচাই করতে হয়।</p>
      <Link href="/demo/bujhi" className="w-fit min-h-11 font-semibold underline">রিপোর্ট বুঝতে বুঝি খুলুন →</Link>
    </section>
  </div>;
}
