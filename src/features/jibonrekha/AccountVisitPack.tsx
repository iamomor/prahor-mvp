"use client";

import Link from "next/link";
import { useState, type RefObject } from "react";
import { Printer } from "lucide-react";
import { SubviewHeader, ui } from "./jibonrekha-ui";
import "./account-visit-pack.css";

export type VisitPackRow = {
  id: string;
  subject: "mother" | "baby";
  label: string;
  value: string;
  unit: string | null;
  observedAt: string;
  source: string;
};

type Filter = "all" | "mother" | "baby";
const bn = (value: number) => new Intl.NumberFormat("bn-BD").format(value);
const groupPreview = 3;

export function AccountVisitPack({ rows, onBack, headingRef }: { rows: VisitPackRow[]; onBack: () => void; headingRef?: RefObject<HTMLHeadingElement | null> }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string[]>([]);
  const chosen = rows.filter((row) => selected.includes(row.id));
  const filtered = rows.filter((row) => filter === "all" || row.subject === filter);
  // Rows arrive newest-first; grouping keeps that order inside each group.
  const grouped = new Map<string, VisitPackRow[]>();
  for (const row of filtered) grouped.set(`${row.subject}:${row.label}`, [...(grouped.get(`${row.subject}:${row.label}`) ?? []), row]);
  const groups = [...grouped].map(([key, items]) => ({ key, items }));
  const count = (subject: Filter) => rows.filter((row) => subject === "all" || row.subject === subject).length;
  function setMany(ids: string[], on: boolean) {
    setSelected((previous) => on ? [...new Set([...previous, ...ids])] : previous.filter((id) => !ids.includes(id)));
    setReviewed(false);
  }
  function toggle(id: string) {
    setMany([id], !selected.includes(id));
  }
  const step = (n: string, label: string, active: boolean) => <li className={`flex items-center gap-2 ${active ? "font-semibold" : "text-pro-muted"}`} aria-current={active ? "step" : undefined}>
    <span className={`grid size-7 place-items-center rounded-full text-sm ${active ? "bg-pro-primary text-pro-on-primary" : "border-[1.5px] border-pro-control-border"}`} aria-hidden="true">{n}</span>{label}
  </li>;

  return <section className="grid max-w-4xl gap-6" lang="bn">
    <div className="account-visit-pack-controls grid gap-6">
      <SubviewHeader title="ভিজিটের প্যাকেট" headingRef={headingRef} onBack={onBack}
        description="শুধু আপনার বেছে নেওয়া তথ্য প্রিন্ট বা PDF হবে। নাম, যোগাযোগ, ডায়েরি ও কথোপকথন এতে থাকে না। কাউকে পাঠানো হয় না।" />
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="ধাপ">
        {step("১", "বেছে নিন", !reviewed)}
        <li className="text-pro-muted" aria-hidden="true">—</li>
        {step("২", "দেখে প্রিন্ট করুন", reviewed)}
      </ol>

      {!reviewed && (rows.length ? <>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <fieldset>
            <legend className="sr-only">কার তথ্য দেখাবেন</legend>
            <div className="flex w-fit flex-wrap gap-1 rounded-[1.75rem] border-[1.5px] border-pro-control-border bg-pro-elevated p-1">
              {([["all", "সব"], ["mother", "মা"], ["baby", "শিশু"]] as const).map(([value, label]) => <label key={value} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill px-4 font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-pro-focus ${filter === value ? "bg-pro-primary text-pro-on-primary" : "text-pro-primary hover:bg-pro-surface"}`}>
                <input type="radio" name="pack-filter" value={value} checked={filter === value} onChange={() => setFilter(value)} className="sr-only" />{label} ({bn(count(value))})
              </label>)}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setMany(filtered.map((row) => row.id), true)} className={`${ui.secondary} ${ui.small}`}>দেখানো সব বাছুন</button>
            <button type="button" disabled={!selected.length} onClick={() => setMany(selected, false)} className={`${ui.secondary} ${ui.small}`}>বাছাই মুছুন</button>
          </div>
        </div>

        <div className="grid gap-4">
          {groups.map(({ key, items }) => {
            const open = expanded.includes(key);
            const shown = open ? items : items.slice(0, groupPreview);
            const picked = items.filter((row) => selected.includes(row.id)).length;
            return <fieldset key={key} className="grid rounded-card border border-pro-border bg-pro-elevated px-4 pb-2 pt-3 sm:px-5">
              <legend className="float-left w-full">
                <span className="flex flex-wrap items-center gap-2 pb-2 text-lg font-semibold">
                  <span className={`inline-block size-3 shrink-0 ${items[0].subject === "mother" ? "rounded-full bg-pro-primary" : "border-2 border-pro-primary"}`} aria-hidden="true" />
                  {items[0].label} · {items[0].subject === "mother" ? "মা" : "শিশু"}
                  <span className={ui.tag}>{bn(items.length)}টি{picked ? ` · ${bn(picked)}টি বাছাই` : ""}</span>
                </span>
              </legend>
              {shown.map((row) => <label key={row.id} className="flex min-h-14 cursor-pointer items-center gap-3 border-t border-pro-surface-2 py-2 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-pro-focus">
                <input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggle(row.id)} className="size-5 shrink-0 accent-pro-primary" />
                <span className="grid min-w-0"><strong className="[overflow-wrap:anywhere]">{row.value} {row.unit}</strong><span className="text-sm text-pro-muted">{row.observedAt} · {row.source}</span></span>
              </label>)}
              <div className="flex flex-wrap gap-x-4 border-t border-pro-surface-2">
                {items.length > groupPreview && <button type="button" aria-expanded={open} onClick={() => setExpanded((previous) => open ? previous.filter((item) => item !== key) : [...previous, key])} className={ui.link}>{open ? "কম দেখান" : `আরও ${bn(items.length - groupPreview)}টি দেখুন`}</button>}
                <button type="button" onClick={() => setMany(items.map((row) => row.id), picked < items.length)} className={ui.link}>{picked < items.length ? "এই দলের সব বাছুন" : "এই দলের বাছাই মুছুন"}</button>
              </div>
            </fieldset>;
          })}
        </div>

        <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-card bg-pro-text p-3 pl-5 text-pro-bg shadow-pro-3">
          <p role="status" className="font-semibold">{selected.length ? `${bn(selected.length)}টি তথ্য বাছাই করা হয়েছে` : "এখনও কিছু বাছাই করা হয়নি"}</p>
          <button type="button" disabled={!chosen.length} onClick={() => setReviewed(true)} className="inline-flex min-h-12 items-center rounded-pill bg-pro-accent px-5 font-semibold text-pro-on-accent focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-bg disabled:cursor-not-allowed disabled:opacity-60 max-sm:w-full max-sm:justify-center">প্যাকেট দেখুন →</button>
        </div>
      </> : <div className="grid justify-items-start gap-3 rounded-card border border-dashed border-pro-control-border bg-pro-elevated p-5">
        <p className="text-pro-muted">এখনও বেছে নেওয়ার মতো নথি নেই। আগে তথ্য যোগ করুন।</p>
        <button type="button" onClick={onBack} className={`${ui.secondary} ${ui.small}`}>জীবনরেখায় ফিরুন</button>
      </div>)}

      {reviewed && <>
        <p role="status" className="rounded-field bg-pro-info-soft p-4 text-pro-info">{bn(chosen.length)}টি তথ্য বেছে নিয়েছেন। নিচে দেখে তারপর প্রিন্ট করুন। কোনো তথ্য সার্ভার বা সেবাদাতার কাছে পাঠানো হয়নি।</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => window.print()} className={`${ui.primary} max-sm:w-full`}><Printer className="size-5" aria-hidden="true" />প্রিন্ট / PDF খুলুন</button>
          <button type="button" onClick={() => setReviewed(false)} className={`${ui.secondary} max-sm:w-full`}>বাছাই বদলান</button>
        </div>
      </>}
      <p className="text-sm text-pro-muted">কাউকে অনুরোধ পাঠাতে চাইলে <Link href="/app/bondhon" className="font-semibold text-pro-primary underline underline-offset-4">বন্ধনে আলাদা সম্মতি দিন</Link>। এই প্যাকেট সেখানে নিজে থেকে যায় না।</p>
    </div>
    {reviewed && <article className="account-visit-pack-sheet rounded-card border border-pro-border bg-pro-elevated p-5 sm:p-8">
      <header className="border-b-2 border-pro-text pb-4"><h2 className="text-2xl font-semibold">জীবনরেখা · ভিজিটের প্যাকেট</h2><p>মায়ের বেছে নেওয়া নথি · পরিচয় বাদ দেওয়া হয়েছে</p></header>
      <div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><caption className="sr-only">বেছে নেওয়া তথ্য</caption><thead><tr className="border-b border-pro-text"><th scope="col" className="p-2">কার</th><th scope="col" className="p-2">তথ্য</th><th scope="col" className="p-2">মান</th><th scope="col" className="p-2">তারিখ</th><th scope="col" className="p-2">উৎস</th></tr></thead><tbody>{chosen.map((row) => <tr key={row.id} className="border-b border-pro-border"><td className="p-2">{row.subject === "mother" ? "মা" : "শিশু"}</td><td className="p-2">{row.label}</td><td className="p-2">{row.value} {row.unit}</td><td className="p-2">{row.observedAt}</td><td className="p-2">{row.source}</td></tr>)}</tbody></table></div>
      <p className="mt-8 border-t border-pro-border pt-4 text-sm">এই নথি মা নিজে বেছে তৈরি করেছেন। এটি চিকিৎসকের নিশ্চিত করা সারাংশ নয়। পাঠানো হয়নি।</p>
    </article>}
  </section>;
}
