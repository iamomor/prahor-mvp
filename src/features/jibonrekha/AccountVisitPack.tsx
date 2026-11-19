"use client";

import Link from "next/link";
import { useState } from "react";
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

export function AccountVisitPack({ rows, onBack }: { rows: VisitPackRow[]; onBack: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const chosen = rows.filter((row) => selected.includes(row.id));
  function toggle(id: string) {
    setSelected((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]);
    setReviewed(false);
  }
  return <section className="grid gap-5" aria-labelledby="visit-pack-title" lang="bn">
    <div className="account-visit-pack-controls grid gap-2">
      <h2 id="visit-pack-title" className="text-2xl font-semibold">ভিজিটের প্যাকেট</h2>
      <p>শুধু আপনার বেছে নেওয়া তথ্য প্রিন্ট বা PDF হবে। নাম, যোগাযোগ, ডায়েরি ও কথোপকথন এতে নেই। কাউকে পাঠানো হবে না।</p>
      {!reviewed && <fieldset className="grid gap-3"><legend className="text-lg font-semibold">কোন তথ্য রাখবেন?</legend>
        {rows.length ? rows.map((row) => <label key={row.id} className="flex min-h-14 items-start gap-3 rounded-card border border-pro-border bg-pro-elevated p-4">
          <input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggle(row.id)} className="mt-1 size-5 accent-pro-primary" />
          <span><strong>{row.subject === "mother" ? "● মা" : "□ শিশু"} · {row.label}: {row.value} {row.unit}</strong><span className="block text-sm text-pro-muted">{row.observedAt} · {row.source}</span></span>
        </label>) : <p className="rounded-card border border-pro-border bg-pro-elevated p-5">এখনও বেছে নেওয়ার মতো নথি নেই। আগে তথ্য যোগ করুন।</p>}
      </fieldset>}
      {reviewed && <p role="status" className="rounded-field border border-pro-info bg-pro-info-soft p-4 text-pro-info">{chosen.length}টি তথ্য বেছে নিয়েছেন। নিচে দেখে তারপর প্রিন্ট করুন। কোনো তথ্য সার্ভার বা সেবাদাতার কাছে পাঠানো হয়নি।</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onBack} className="min-h-11 rounded-field border border-pro-control-border px-4 font-semibold text-pro-primary">← জীবনরেখায় ফিরুন</button>
        {reviewed ? <><button type="button" onClick={() => setReviewed(false)} className="min-h-11 rounded-field border border-pro-control-border px-4 font-semibold text-pro-primary">নির্বাচন বদলান</button><button type="button" onClick={() => window.print()} className="min-h-11 rounded-field bg-pro-primary px-4 font-semibold text-pro-on-primary">প্রিন্ট / PDF খুলুন</button></> : <button type="button" disabled={!chosen.length} onClick={() => setReviewed(true)} className="min-h-11 rounded-field bg-pro-primary px-4 font-semibold text-pro-on-primary disabled:opacity-50">প্যাকেট পর্যালোচনা করুন</button>}
      </div>
      <p className="text-sm text-pro-muted">কাউকে অনুরোধ পাঠাতে চাইলে <Link href="/app/bondhon" className="font-semibold text-pro-primary underline">বন্ধনে আলাদা সম্মতি দিন</Link>। এই প্যাকেট সেখানে নিজে থেকে যায় না।</p>
    </div>
    {reviewed && <article className="account-visit-pack-sheet rounded-card border border-pro-border bg-pro-elevated p-5 sm:p-8">
      <header className="border-b-2 border-pro-text pb-4"><h3 className="text-2xl font-semibold">জীবনরেখা · ভিজিটের প্যাকেট</h3><p>মায়ের বেছে নেওয়া নথি · পরিচয় বাদ দেওয়া হয়েছে</p></header>
      <div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><thead><tr className="border-b border-pro-text"><th className="p-2">কার</th><th className="p-2">তথ্য</th><th className="p-2">মান</th><th className="p-2">তারিখ</th><th className="p-2">উৎস</th></tr></thead><tbody>{chosen.map((row) => <tr key={row.id} className="border-b border-pro-border"><td className="p-2">{row.subject === "mother" ? "মা" : "শিশু"}</td><td className="p-2">{row.label}</td><td className="p-2">{row.value} {row.unit}</td><td className="p-2">{row.observedAt}</td><td className="p-2">{row.source}</td></tr>)}</tbody></table></div>
      <p className="mt-8 border-t border-pro-border pt-4 text-sm">এই নথি মা নিজে বেছে তৈরি করেছেন। এটি চিকিৎসকের নিশ্চিত করা সারাংশ নয়। পাঠানো হয়নি।</p>
    </article>}
  </section>;
}
