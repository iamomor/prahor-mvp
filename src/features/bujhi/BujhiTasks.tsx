
import Link from "next/link";
import { FileCheck2, FlaskConical, ScanLine, ShieldCheck } from "lucide-react";
import { AccessPreferencesControl } from "@/components/accessibility/AccessPreferencesControl";

export function BujhiTasks() {
  return <section className="mx-auto grid max-w-6xl min-w-0 gap-6 px-4 pb-6 [overflow-wrap:anywhere] pt-8 text-pro-text sm:px-6 sm:pt-12" aria-labelledby="bujhi-task-title">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold text-pro-primary">প্রহর / বুঝি</p><AccessPreferencesControl /></div>
    <div className="grid min-w-0 grid-cols-1 gap-6 rounded-hero border border-pro-border bg-pro-surface p-5 sm:p-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12 lg:p-10">
      <div className="grid min-w-0 content-start gap-5">
        <p className="flex items-center gap-2 font-semibold text-pro-primary"><ScanLine aria-hidden="true" className="size-5 shrink-0" />REPORT UNDERSTANDING · রিপোর্ট বুঝুন</p>
        <h1 id="bujhi-task-title" className="text-3xl font-semibold leading-snug sm:text-4xl" lang="bn">রিপোর্টের কঠিন ভাষা,<br className="hidden sm:block" /> এবার সহজ করে বুঝি।</h1>
        <p className="max-w-[55ch] text-lg text-pro-muted" lang="bn">ছবি দিন, পড়া তথ্য মিলিয়ে দেখুন, তারপর সহজ ভাষায় বুঝে নিন। প্রতিটি ধাপে সিদ্ধান্ত আপনার।</p>
        <a href="#report-review" className="inline-flex min-h-12 w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-control bg-pro-primary px-5 py-3 text-center font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus"><FileCheck2 aria-hidden="true" className="size-5 shrink-0" />রিপোর্ট যাচাই করি</a>
        <p className="flex items-start gap-2 text-pro-muted"><ShieldCheck aria-hidden="true" className="mt-1 size-5 shrink-0" />ছবিটি এই ব্রাউজারে পড়া হয়। যাচাই ছাড়া কিছু সংরক্ষণ হয় না।</p>
      </div>
      <div className="grid min-w-0 content-center gap-4 border-t border-pro-border pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        <h2 className="text-xl font-semibold" lang="bn">আপনার বোঝার সুবিধার জন্য</h2>
        <ul className="grid gap-4 text-pro-muted" lang="bn"><li className="border-b border-pro-border pb-4"><strong className="block text-pro-text">মূল রিপোর্ট পাশে রাখুন</strong>ভুল পড়লে ঠিক করুন, না বুঝলে বাদ রাখুন।</li><li className="border-b border-pro-border pb-4"><strong className="block text-pro-text">ব্যাখ্যার উৎস দেখুন</strong>অনিশ্চিত বা অনুপস্থিত তথ্য স্পষ্টভাবে জানুন।</li><li><strong className="block text-pro-text">পরের সাক্ষাতের প্রস্তুতি নিন</strong>চিকিৎসককে কী জিজ্ঞেস করবেন, গুছিয়ে নিন।</li></ul>
      </div>
    </div>
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-card border border-pro-border bg-pro-elevated p-5">
      <div className="flex min-w-0 items-start gap-3"><FlaskConical aria-hidden="true" className="mt-1 size-6 shrink-0 text-pro-primary" /><div><h2 className="text-xl font-semibold" lang="bn">ঘরে করা কিটের ফল?</h2><p className="mt-1 text-pro-muted" lang="bn">ছবি ছাড়াই কিটে দেখা চিহ্ন মিলিয়ে নিন।</p></div></div>
      <Link href="/app/bujhi/kit" className="inline-flex min-h-12 items-center rounded-control border border-pro-control-border px-4 py-3 font-semibold text-pro-primary focus-visible:outline-3 focus-visible:outline-pro-focus">কিটের ফল বুঝি</Link>

    </div>
  </section>;
}
