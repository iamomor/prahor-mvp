import Link from "next/link";
import { pregnancyReferenceGroups, pregnancyReferenceSources, type PregnancyReferenceSource } from "./pregnancy-reference-data";

function Sources({ keys }: { keys: readonly PregnancyReferenceSource[] }) {
  return <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-pro-border pt-3 text-sm" aria-label="এই তথ্যের উৎস">
    {keys.map((key) => <a key={key} href={pregnancyReferenceSources[key].url} target="_blank" rel="noopener noreferrer" className="min-h-11 content-center font-semibold text-pro-primary underline underline-offset-2 focus-visible:outline-3 focus-visible:outline-pro-focus">
      {pregnancyReferenceSources[key].label} · নতুন ট্যাব ↗
    </a>)}
  </div>;
}

/** A source-labelled reading library. No symptom scoring, inferred status or automatic clinical action. */
export function PregnancyReference({ week }: { week: number }) {
  return <section aria-labelledby="pregnancy-reference-title" className="grid min-w-0 gap-6 [overflow-wrap:anywhere]">
    <header className="grid gap-2">
      <p className="font-semibold text-pro-primary">জীবনরেখা · যত্নের পাঠাগার</p>
      <h2 id="pregnancy-reference-title" className="text-2xl font-semibold sm:text-3xl">গর্ভাবস্থা থেকে জন্মের পর</h2>
      <p className="max-w-[65ch] text-pro-muted">গর্ভকাল, সাধারণ অস্বস্তি, সতর্ক লক্ষণ, ভিজিট, প্রসব ও জন্মের পরের যত্ন এক জায়গায় পড়ুন। প্রতিটি বিষয়ের নিচে যাচাইযোগ্য উৎস আছে। এটি আপনার ব্যক্তিগত পরীক্ষা বা চিকিৎসা পরিকল্পনা নয়।</p>
    </header>

    {week >= 37 && <section className="grid gap-3 rounded-card border border-pro-info bg-pro-info-soft p-5 text-pro-info sm:p-6" aria-labelledby="near-birth-title">
      <h3 id="near-birth-title" className="text-xl font-semibold">৪০ সপ্তাহের দিকে: তারিখটি একটি অনুমান</h3>
      <p>৪০ সপ্তাহ বা ২৮০ দিনের হিসাব সন্তান জন্মের নির্দিষ্ট দিন বলে দেয় না। পরের ভিজিট, প্রসবের পরিকল্পনা এবং কখন আপনার মাতৃসেবা দলে যোগাযোগ করবেন তা আগে মিলিয়ে নিন। শিশুর নড়াচড়া কম বা অন্য উদ্বেগ হলে নির্ধারিত ভিজিট পর্যন্ত অপেক্ষা করবেন না।</p>
      <div className="flex flex-wrap gap-3"><Link href="/safety" className="inline-flex min-h-11 items-center rounded-field border border-pro-info px-4 py-2 font-semibold focus-visible:outline-3 focus-visible:outline-pro-focus">জরুরি সাহায্যের পথ</Link><a href={pregnancyReferenceSources.week40.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline">উৎস: NHS · Week 40 ↗</a></div>
    </section>}

    <div className="grid gap-4">
      {pregnancyReferenceGroups.map((group, index) => <details key={group.id} id={`reference-${group.id}`} className="group min-w-0 rounded-card border border-pro-border bg-pro-elevated open:bg-pro-surface">
        <summary className="flex min-h-16 cursor-pointer list-none items-start gap-4 p-5 focus-visible:outline-3 focus-visible:outline-pro-focus sm:p-6 [&::-webkit-details-marker]:hidden">
          <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-pro-control-border font-semibold text-pro-primary">{new Intl.NumberFormat("bn-BD").format(index + 1)}</span>
          <span className="min-w-0 flex-1"><strong className="block text-lg leading-snug">{group.title}</strong><span className="mt-1 block text-pro-muted">{group.intro}</span></span>
          <span aria-hidden="true" className="mt-1 text-xl font-semibold text-pro-primary group-open:rotate-45">＋</span>
        </summary>
        <div className="grid gap-4 border-t border-pro-border px-5 py-5 sm:px-6 sm:py-6">
          {group.id === "warning" && <p className="rounded-field border border-pro-danger bg-pro-danger-soft p-4 text-pro-danger">নিচের লক্ষণগুলো দেখে অ্যাপ রোগ নির্ণয় বা লাল-হলুদ-সবুজ ঝুঁকি শ্রেণি দেয় না। উদ্বেগ থাকলে সরাসরি মাতৃসেবা দল বা জরুরি চিকিৎসা নিন। <Link href="/safety" className="font-semibold underline">জরুরি সহায়তা দেখুন</Link>।</p>}
          <div className="grid gap-4 lg:grid-cols-2">
            {group.items.map((item) => <article key={item.title} className="grid min-w-0 content-start gap-3 rounded-card border border-pro-border bg-pro-elevated p-5">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p>{item.context}</p>
              <ul className="grid list-disc gap-2 pl-5 text-pro-muted">{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
              <Sources keys={item.sources} />
            </article>)}
          </div>
          {group.id === "monitoring" && <p className="text-pro-muted">এখন অ্যাকাউন্টে রক্তচাপ, তাপমাত্রা, ওজন, গ্লুকোজ, হিমোগ্লোবিন এবং সমর্থিত শিশুর তথ্য লেখা যায়। নাড়ি, প্রস্রাবের প্রোটিন, CTG, অ্যামনিওটিক তরল ও জরায়ুমুখের জন্য আলাদা যাচাইকৃত ফর্ম নেই; এগুলো এখানে স্বয়ংক্রিয়ভাবে মাপা বা বিচার করা হয় না।</p>}
          {group.id === "birth" && <div className="flex flex-wrap gap-3"><Link href="/app/poth" className="inline-flex min-h-11 items-center rounded-field border border-pro-control-border px-4 py-2 font-semibold text-pro-primary focus-visible:outline-3 focus-visible:outline-pro-focus">পথে সেবা খুঁজুন</Link><Link href="/app/bondhon" className="inline-flex min-h-11 items-center rounded-field border border-pro-control-border px-4 py-2 font-semibold text-pro-primary focus-visible:outline-3 focus-visible:outline-pro-focus">বন্ধনে সাহায্য চাইতে দেখুন</Link></div>}
          {group.id === "after-birth" && <p className="text-pro-muted">জীবনরেখায় মায়ের ও শিশুর আলাদা নথি রাখা যায়। পূর্ণ প্রসবোত্তর, টিকা ও শিশুর বৃদ্ধির নিবেদিত ট্র্যাকার এখনও তৈরি হয়নি; স্বাস্থ্যকর্মীর দেওয়া কাগজের নথি ও নির্ধারিত ফলো-আপ রাখুন।</p>}
        </div>
      </details>)}
    </div>
    <p className="max-w-[65ch] border-t border-pro-border pt-5 text-pro-muted">উৎস ও ব্যক্তিগত নথি আলাদা। এই পাঠাগারের কোনো লেখা আপনার অ্যাকাউন্টের চিকিৎসা-ফল হিসেবে সংরক্ষণ হয় না, এবং পাঠাগার আপনার তথ্য থেকে রোগ বা জরুরি অবস্থা নির্ণয় করে না।</p>
  </section>;
}
