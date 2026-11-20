"use client";

import Link from "next/link";
import { useState, type RefObject } from "react";

import { ArrowUpRight, ChevronLeft, ChevronRight, LifeBuoy, MessageCircle, PenLine } from "lucide-react";

import type { GuideSelection } from "./account-records-model";
import { careForWeek, careGuideSources, guideWeekRange, whoModelContactWeeks } from "./care-guide-data";
import { PregnancyReference } from "./PregnancyReference";
import { SubviewHeader, ui } from "./jibonrekha-ui";

type Props = {
  currentWeek: number | null;
  currentDay: number;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onAddNote: () => void;
  bujhiHref?: string;
  selection?: GuideSelection | null;
  onSelectionChange?: (selection: GuideSelection | null) => void;
};

const bn = (value: number) => new Intl.NumberFormat("bn-BD").format(value);
const weekOptions = Array.from({ length: guideWeekRange.last }, (_, index) => index + 1);
const sourceLink = "inline-flex w-fit min-h-11 items-center gap-1 text-sm font-semibold text-pro-primary underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-pro-focus";

export function CareGuide({ currentWeek, currentDay, headingRef, onBack, onAddNote, bujhiHref = "/app/bujhi", selection, onSelectionChange }: Props) {
  const defaultWeek = currentWeek === null ? 12 : Math.min(Math.max(currentWeek, guideWeekRange.first), guideWeekRange.last);
  const defaultDay = currentWeek === null ? 0 : currentDay;
  const [localSelection, setLocalSelection] = useState<GuideSelection | null>(null);
  const active = onSelectionChange ? selection ?? null : localSelection;
  const week = active?.week ?? defaultWeek;
  const day = active?.day ?? defaultDay;
  function choose(next: GuideSelection | null) {
    if (onSelectionChange) onSelectionChange(next);
    else setLocalSelection(next);
  }
  const items = careForWeek(week);
  const nextModelContact = whoModelContactWeeks.find(value => value >= week);

  const stage = week <= 12 ? "প্রথম ত্রৈমাসিক" : week <= 27 ? "দ্বিতীয় ত্রৈমাসিক" : "তৃতীয় ত্রৈমাসিক";
  const isCurrent = currentWeek !== null && week === defaultWeek && day === currentDay;

  return <div className="mx-auto grid min-w-0 max-w-5xl gap-8 [overflow-wrap:anywhere]" lang="bn">
    <SubviewHeader eyebrow="মায়ের যত্ন · ১–৪১ সপ্তাহ" title="সপ্তাহভিত্তিক যত্নের পথ" headingRef={headingRef} onBack={onBack}
      description="শিক্ষামূলক তথ্য। আপনার পরীক্ষার সময়, প্রয়োজন ও ফল চিকিৎসক ঠিক করবেন। প্রতিদিন নতুন আল্ট্রাসাউন্ড বা পরীক্ষা দরকার হয় না।" />
    <a href="#pregnancy-reference-title" className="w-fit min-h-11 content-center font-semibold text-pro-primary underline underline-offset-2 focus-visible:outline-3 focus-visible:outline-pro-focus">গর্ভাবস্থা, প্রসব ও জন্মের পরের বিষয়গুলো দেখুন ↓</a>

    <section aria-label="সপ্তাহ বেছে নিন" className="grid gap-4 rounded-card bg-pro-surface p-4 sm:p-5">
      <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-4">
        <button type="button" disabled={week === guideWeekRange.first} onClick={() => choose({ week: week - 1, day })} className={`${ui.secondary} justify-self-start px-4 sm:px-5`} aria-label="আগের সপ্তাহ"><ChevronLeft className="size-5" aria-hidden="true" /><span aria-hidden="true">{bn(Math.max(week - 1, guideWeekRange.first))}</span></button>
        <div className="order-first col-span-2 text-center sm:order-none sm:col-span-1">
          <p role="status" className="text-[clamp(1.375rem,5vw,1.875rem)] font-semibold leading-tight">{bn(week)} সপ্তাহ {bn(day)} দিন</p>
          <p className="mt-1 flex flex-wrap items-center justify-center gap-2 text-pro-muted">{stage}{isCurrent && <span className="inline-flex items-center rounded-control bg-pro-accent px-2.5 py-0.5 text-sm font-semibold text-pro-on-accent">আপনার বর্তমান সপ্তাহ</span>}</p>
        </div>
        <button type="button" disabled={week === guideWeekRange.last} onClick={() => choose({ week: week + 1, day })} className={`${ui.secondary} justify-self-end px-4 sm:px-5`} aria-label="পরের সপ্তাহ"><span aria-hidden="true">{bn(Math.min(week + 1, guideWeekRange.last))}</span><ChevronRight className="size-5" aria-hidden="true" /></button>
      </div>
      <div className="flex flex-wrap items-end gap-3 border-t border-pro-border pt-4">
        <label className={`${ui.field} min-w-[9rem] flex-1 sm:flex-none`}>গর্ভকালের সপ্তাহ
          <select value={week} onChange={event => choose({ week: Number(event.target.value), day })} className={ui.input}>{weekOptions.map(value => <option key={value} value={value}>{bn(value)} সপ্তাহ</option>)}</select>
        </label>
        <label className={`${ui.field} min-w-[7rem] flex-1 sm:flex-none`}>দিন
          <select value={day} onChange={event => choose({ week, day: Number(event.target.value) })} className={ui.input}>{[0, 1, 2, 3, 4, 5, 6].map(value => <option key={value} value={value}>{bn(value)} দিন</option>)}</select>

        </label>
        {currentWeek !== null && <button type="button" disabled={isCurrent} onClick={() => choose(null)} className={`${ui.secondary} max-sm:w-full`}>আমার বর্তমান সপ্তাহ</button>}
      </div>

      <p className="text-sm text-pro-muted">{nextModelContact ? `WHO-এর আট যোগাযোগের উদাহরণে পরের সময় ${bn(nextModelContact)} সপ্তাহের কাছাকাছি।` : "৪০ সপ্তাহের পরের যোগাযোগ ও প্রসব পরিকল্পনা চিকিৎসকের সঙ্গে মিলিয়ে নিন।"} এটি আপনার বুক করা ভিজিট নয়; ব্যক্তিগত সময়সূচি আলাদা হতে পারে।</p>
      {currentWeek === null && <p className="text-sm text-pro-muted">আপনার গর্ভকালের তারিখ জানা নেই। এখানে বেছে নেওয়া সপ্তাহ শুধুই গাইড দেখানোর জন্য; ব্যক্তিগত তারিখ অনুমান করা হয়নি।</p>}

    </section>

    <section aria-labelledby="daily-care-heading" className={`${ui.card} grid gap-4`}>
      <h2 id="daily-care-heading" className="text-xl font-semibold">প্রতিদিন যা মনে রাখবেন</h2>

      <ul className="grid list-disc gap-2 pl-5">
        <li>প্রশ্ন, উপসর্গ বা আগের রিপোর্ট নিয়ে উদ্বেগ লিখে রাখুন; নির্ধারিত ভিজিটে আলাপ করুন।</li>
        <li>নতুন বা জরুরি উদ্বেগে ভিজিটের অপেক্ষা করবেন না।</li>
        {week >= 24 && <li>শিশুর নড়াচড়া নিয়ে উদ্বেগ বা কম মনে হলে যেকোনো সময় মাতৃসেবা দলের সঙ্গে যোগাযোগ করুন; নোট লেখা সাহায্য চাওয়ার বিকল্প নয়।</li>}
      </ul>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onAddNote} className={`${ui.primary} max-sm:w-full`}><PenLine className="size-5" aria-hidden="true" />আজকের নোট লিখুন</button>
        <Link href="/safety" className={`${ui.danger} max-sm:w-full`}><LifeBuoy className="size-5" aria-hidden="true" />জরুরি সহায়তা</Link>
      </div>
      <a href={careGuideSources.nice.url} target="_blank" rel="noreferrer" className={sourceLink}>উৎস: {careGuideSources.nice.label}<ArrowUpRight className="size-4" aria-hidden="true" /><span className="sr-only">(নতুন ট্যাবে খুলবে)</span></a>
    </section>

    <section aria-labelledby="week-tests-heading" className="grid gap-3">
      <div><h2 id="week-tests-heading" className="text-xl font-semibold">এই সময়ের পরীক্ষা ও আলোচনা</h2><p className="mt-1 text-pro-muted">সময়গুলো পরিকল্পনার জানালা, নির্দিষ্ট দিনে করতেই হবে এমন তালিকা নয়।</p></div>
      {items.length === 0 && <div className="rounded-card border border-dashed border-pro-control-border bg-pro-elevated p-5"><h3 className="font-semibold">এই সপ্তাহে নতুন নির্দিষ্ট পরীক্ষা নেই</h3><p className="mt-2">পিডিএফ বা যাচাই করা গাইডলাইনে এই সপ্তাহের জন্য আলাদা রুটিন পরীক্ষা নেই। আগের ফল, পরের ভিজিট ও প্রশ্নগুলো চিকিৎসকের সঙ্গে মিলিয়ে নিন।</p></div>}
      {items.map(item => <article key={item.id} className={`${ui.card} grid gap-3`}>
        <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-lg font-semibold">{item.title}</h3><span className={ui.tag}><MessageCircle className="size-4" aria-hidden="true" />{item.status === "if-needed" ? "নির্দিষ্ট কারণ থাকলে" : item.status === "optional" ? "আলোচনা করে বেছে নিন" : "চিকিৎসকের সঙ্গে আলোচনা"}</span></div>

        <p className="text-sm font-semibold text-pro-muted">{bn(item.firstWeek)}–{bn(item.lastWeek)} সপ্তাহ</p>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2"><div><dt className="font-semibold">কেন</dt><dd>{item.why}</dd></div><div><dt className="font-semibold">কী জানা দরকার</dt><dd>{item.detail}</dd></div></dl>
        <div className="flex flex-wrap gap-x-5">
          <a href={careGuideSources[item.source].url} target="_blank" rel="noreferrer" className={sourceLink}>উৎস: {careGuideSources[item.source].label}<ArrowUpRight className="size-4" aria-hidden="true" /><span className="sr-only">(নতুন ট্যাবে খুলবে)</span></a>
          {item.additionalSource && <a href={careGuideSources[item.additionalSource].url} target="_blank" rel="noreferrer" className={sourceLink}>আরও উৎস: {careGuideSources[item.additionalSource].label}<ArrowUpRight className="size-4" aria-hidden="true" /><span className="sr-only">(নতুন ট্যাবে খুলবে)</span></a>}
        </div>
      </article>)}
    </section>


    <section className="grid gap-3 rounded-card border border-pro-info bg-pro-info-soft p-5 text-pro-info" aria-labelledby="report-caveat-heading">
      <h2 id="report-caveat-heading" className="text-lg font-semibold">রিপোর্টের ফল নিজে সিদ্ধান্তের জন্য নয়</h2>
      <p>পিডিএফে দেওয়া একক “স্বাভাবিক” সীমা প্রত্যেক ব্যক্তির জন্য প্রযোজ্য নয়। রিপোর্টের মান, একক, সময় ও আগের ইতিহাস মিলিয়ে চিকিৎসক ব্যাখ্যা করবেন। বুঝি-তে রিপোর্ট থেকে নেওয়া লেখা আগে যাচাই করতে হয়।</p>
      <Link href={bujhiHref} className="inline-flex min-h-12 w-fit items-center gap-2 rounded-pill border-[1.5px] border-pro-info bg-pro-elevated px-5 font-semibold text-pro-info focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus max-sm:w-full max-sm:justify-center">বুঝি-তে রিপোর্ট যাচাই করুন<ArrowUpRight className="size-4" aria-hidden="true" /></Link>

    </section>
    <PregnancyReference week={week} />
  </div>;
}
