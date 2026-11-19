"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight, BookOpenText, FileSearch, HandHeart, HeartPulse, LifeBuoy, MapPin, MessageCircleQuestion,
  NotebookPen, ShieldCheck, SlidersHorizontal, Sprout,
} from "lucide-react";
import { useLanguage } from "@/i18n/use-language";
import { supportRequestSchema, type SupportRequest } from "@/lib/contracts/bondhon";
import { readRequestIds } from "@/features/bondhon/request-history";
import { RequestTracker } from "@/features/bondhon/RequestTracker";

type Observation = { id: string; subject: "mother" | "baby"; kind: string; value: string; unit: string | null; observed_at: string; source: string; verification: string };
type Records = { pregnancies: { id: string }[]; babies: { id: string }[]; observations: Observation[]; corrections: { old_observation_id: string }[] };
type CheckIn = { id: string; occurred_at: string; mood: string | null; energy: string | null; activity_note: string | null; rest_note: string | null };
type Load<T> = { state: "loading" } | { state: "error" } | { state: "ready"; data: T };

const card = "min-w-0 rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card,1.25rem)]";
const quietLink = "inline-flex min-h-11 items-center gap-1.5 font-semibold text-pro-primary underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-pro-focus";
const when = (value: string) => new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeZone: "Asia/Dhaka" }).format(new Date(value));
const kindLabel = (kind: string) => kind === "systolic_blood_pressure" ? "Blood pressure (systolic)" : kind === "diastolic_blood_pressure" ? "Blood pressure (diastolic)"
  : kind.charAt(0).toUpperCase() + kind.slice(1).replaceAll("_", " ");

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(String(response.status));
  return response.json() as Promise<T>;
}

export function MotherDashboard() {
  const { t } = useLanguage();
  const [records, setRecords] = useState<Load<Records>>({ state: "loading" });
  const [wellness, setWellness] = useState<Load<CheckIn[]>>({ state: "loading" });
  const [requests, setRequests] = useState<Load<SupportRequest[]>>({ state: "loading" });

  const load = useCallback(() => {
    getJson<Records>("/api/jibonrekha").then(data => setRecords({ state: "ready", data }), () => setRecords({ state: "error" }));
    getJson<{ entries: CheckIn[] }>("/api/wellness").then(data => setWellness({ state: "ready", data: data.entries }), () => setWellness({ state: "error" }));
    // Status always comes from the server; IDs we cannot read (other account, deleted) are dropped.
    Promise.all(readRequestIds().slice(0, 3).map(id => getJson<{ data: unknown }>(`/api/care-requests/${id}`)
      .then(body => supportRequestSchema.safeParse(body.data)).then(parsed => parsed.success ? parsed.data : null, () => null)))
      .then(items => setRequests({ state: "ready", data: items.filter((item): item is SupportRequest => item !== null) }));
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const superseded = new Set(records.state === "ready" ? records.data.corrections.map(item => item.old_observation_id) : []);
  const latest = (subject: Observation["subject"]) => records.state === "ready"
    ? records.data.observations.filter(item => item.subject === subject && !superseded.has(item.id)).slice(0, 3) : [];
  const provenance = (item: Observation) => item.source === "document_extracted"
    ? t({ en: "From a report, checked by you", bn: "রিপোর্ট থেকে, আপনি যাচাই করেছেন" })
    : t({ en: "Recorded by you", bn: "আপনি লিখেছেন" });

  return <div className="grid gap-6">
    <p className="rounded-field border border-pro-border bg-pro-surface px-4 py-3 text-sm">
      <strong>{t({ en: "Demo data only.", bn: "শুধু ডেমো তথ্য।" })}</strong>{" "}
      {t({ en: "Use fictional details. Providers here are simulated; no real clinician sees your requests.", bn: "কাল্পনিক তথ্য ব্যবহার করুন। এখানের সেবাদাতারা সিমুলেটেড; কোনো আসল চিকিৎসক আপনার অনুরোধ দেখেন না।" })}
    </p>

    {/* Primary row: Ask PROHOR is dominant (no account needed); help sits beside it, never hidden. */}
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <section aria-labelledby="dash-ask" className="grid content-between gap-6 rounded-hero bg-pro-primary p-6 text-pro-on-primary sm:p-8">
        <div className="grid gap-3">
          <MessageCircleQuestion size={28} aria-hidden="true" />
          <h2 id="dash-ask" className="pro-editorial text-2xl font-semibold sm:text-3xl">{t({ en: "Have a question about your pregnancy?", bn: "গর্ভাবস্থা নিয়ে কোনো প্রশ্ন আছে?" })}</h2>
          <p className="max-w-[60ch] text-pro-on-primary-muted">{t({ en: "Barta answers from approved sources and shows them. It says so when it does not know. Educational information, not medical advice.", bn: "বার্তা অনুমোদিত সূত্র থেকে উত্তর দেয় এবং সূত্র দেখায়। না জানলে তা জানায়। এটি শিক্ষামূলক তথ্য, চিকিৎসা পরামর্শ নয়।" })}</p>
        </div>
        <Link href="/ask" className="inline-flex min-h-12 w-fit items-center gap-2 rounded-control bg-pro-bg px-5 font-semibold text-pro-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus">
          {t({ en: "Ask PROHOR", bn: "প্রহরকে জিজ্ঞাসা করুন" })} <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
      <section aria-labelledby="dash-help" className={`${card} grid content-between gap-4 border-2 border-pro-danger`}>
        <div className="grid gap-2">
          <LifeBuoy size={26} aria-hidden="true" className="text-pro-danger" />
          <h2 id="dash-help" className="text-xl font-semibold">{t({ en: "Need help now?", bn: "এখনই সাহায্য দরকার?" })}</h2>
          <p>{t({ en: "Warning signs work without AI. For an emergency, call 999 or go to the nearest hospital.", bn: "সতর্কতার লক্ষণ এআই ছাড়াই দেখা যায়। জরুরি অবস্থায় ৯৯৯ নম্বরে কল করুন বা নিকটস্থ হাসপাতালে যান।" })}</p>
        </div>
        <div className="flex flex-wrap gap-x-5">
          <Link href="/safety" className={quietLink}>{t({ en: "Warning signs", bn: "সতর্কতার লক্ষণ" })}</Link>
          <Link href="/app/care" className={quietLink}>{t({ en: "Ask a person", bn: "একজন মানুষকে জানান" })}</Link>
        </div>
      </section>
    </div>

    {/* Mother and baby stay separate records on one page (design.md §9.3). */}
    <div className="grid gap-4 md:grid-cols-2">
      {(["mother", "baby"] as const).map(subject => <section key={subject} aria-labelledby={`dash-${subject}`} className={`${card} grid content-start gap-4`}>
        <CardHeading id={`dash-${subject}`} icon={subject === "mother" ? <HeartPulse size={20} aria-hidden="true" /> : <Sprout size={20} aria-hidden="true" />}>
          {subject === "mother" ? t({ en: "Your health", bn: "আপনার স্বাস্থ্য" }) : t({ en: "Baby", bn: "শিশু" })}
        </CardHeading>
        {records.state === "loading" && <p role="status">{t({ en: "Loading records…", bn: "রেকর্ড আসছে…" })}</p>}
        {records.state === "error" && <Retry onRetry={load} text={t({ en: "Records could not be loaded.", bn: "রেকর্ড আনা যায়নি।" })} />}
        {records.state === "ready" && (latest(subject).length
          ? <ul className="grid gap-3">{latest(subject).map(item => <li key={item.id} className="grid gap-0.5 border-t border-pro-border pt-3 first:border-0 first:pt-0">
              <span className="text-sm text-pro-muted">{kindLabel(item.kind)} · {when(item.observed_at)}</span>
              <span className="text-xl font-semibold">{item.value}{item.unit ? <span className="text-base font-normal"> {item.unit}</span> : null}</span>
              <span className="w-fit rounded-pill border border-pro-border px-2.5 py-0.5 text-sm">{provenance(item)}</span>
            </li>)}</ul>
          : <p>{subject === "mother"
              ? t({ en: "No health entries yet. Add your first one.", bn: "এখনো কোনো স্বাস্থ্য তথ্য নেই। প্রথমটি যোগ করুন।" })
              : records.data.babies.length
                ? t({ en: "No baby measurements yet.", bn: "এখনো শিশুর কোনো পরিমাপ নেই।" })
                : t({ en: "No baby record yet. Baby records stay separate from yours.", bn: "এখনো শিশুর রেকর্ড নেই। শিশুর রেকর্ড আপনার রেকর্ড থেকে আলাদা থাকে।" })}</p>)}
        <Link href="/app/jibonrekha" className={quietLink}>{t({ en: "Open records", bn: "রেকর্ড খুলুন" })} <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>)}
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <section aria-labelledby="dash-wellness" className={`${card} grid content-start gap-4`}>
        <CardHeading id="dash-wellness" icon={<Sprout size={20} aria-hidden="true" />}>{t({ en: "Wellbeing", bn: "সুস্থতা" })}</CardHeading>
        {wellness.state === "loading" && <p role="status">{t({ en: "Loading check-ins…", bn: "চেক-ইন আসছে…" })}</p>}
        {wellness.state === "error" && <Retry onRetry={load} text={t({ en: "Check-ins could not be loaded.", bn: "চেক-ইন আনা যায়নি।" })} />}
        {wellness.state === "ready" && (wellness.data[0]
          ? <p>{t({ en: "Last check-in", bn: "শেষ চেক-ইন" })}: {when(wellness.data[0].occurred_at)}
              {wellness.data[0].mood && <> · {t({ en: "mood", bn: "মন" })}: {wellness.data[0].mood.replaceAll("_", " ")}</>}
              {wellness.data[0].energy && <> · {t({ en: "energy", bn: "শক্তি" })}: {wellness.data[0].energy.replaceAll("_", " ")}</>}</p>
          : <p>{t({ en: "No check-ins yet. Every question is optional.", bn: "এখনো কোনো চেক-ইন নেই। প্রতিটি প্রশ্ন ঐচ্ছিক।" })}</p>)}
        <p className="flex items-center gap-2 text-sm text-pro-muted"><NotebookPen size={16} aria-hidden="true" />{t({ en: "Your diary is private and is never shown here or shared.", bn: "আপনার ডায়েরি ব্যক্তিগত; এখানে দেখানো বা শেয়ার হয় না।" })}</p>
        <Link href="/app/wellbeing" className={quietLink}>{t({ en: "Check in or write in diary", bn: "চেক-ইন বা ডায়েরি লিখুন" })} <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>

      <section aria-labelledby="dash-requests" className={`${card} grid content-start gap-4`}>
        <CardHeading id="dash-requests" icon={<HandHeart size={20} aria-hidden="true" />}>{t({ en: "Support requests", bn: "সহায়তার অনুরোধ" })}</CardHeading>
        {requests.state === "loading" && <p role="status">{t({ en: "Checking request status…", bn: "অনুরোধের অবস্থা দেখা হচ্ছে…" })}</p>}
        {requests.state === "ready" && (requests.data[0]
          ? <div className="grid gap-3">
              <p className="line-clamp-2">“{requests.data[0].message}”</p>
              <RequestTracker status={requests.data[0].status} updatedAt={requests.data[0].updatedAt} />
              <Link href={`/app/care/status?id=${requests.data[0].id}`} className={quietLink}>{t({ en: "View status", bn: "অবস্থা দেখুন" })} <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          : <>
              <p>{t({ en: "No requests sent from this device.", bn: "এই ডিভাইস থেকে কোনো অনুরোধ পাঠানো হয়নি।" })}</p>
              <Link href="/app/care" className={quietLink}>{t({ en: "Ask a person for support", bn: "একজন মানুষের সহায়তা চান" })} <ArrowRight size={16} aria-hidden="true" /></Link>
            </>)}
      </section>
    </div>

    <ModuleDirectory />
  </div>;
}

function CardHeading({ id, icon, children }: { id: string; icon: ReactNode; children: ReactNode }) {
  return <h2 id={id} className="flex items-center gap-2 text-xl font-semibold"><span className="grid size-9 place-items-center rounded-pill bg-pro-surface text-pro-primary">{icon}</span>{children}</h2>;
}

function Retry({ text, onRetry }: { text: string; onRetry: () => void }) {
  const { t } = useLanguage();
  return <div role="alert" className="grid gap-2"><p className="text-pro-danger">{text}</p>
    <button type="button" onClick={onRetry} className="w-fit min-h-11 rounded-control border-[1.5px] border-pro-control-border px-4 font-semibold text-pro-primary focus-visible:outline-3 focus-visible:outline-pro-focus">{t({ en: "Try again", bn: "আবার চেষ্টা করুন" })}</button></div>;
}

/** All eight modules, grouped by the mother's job, with honest status words (AGENTS.md: working / limited / simulated). */
function ModuleDirectory() {
  const { t } = useLanguage();
  const groups = [
    { en: "Understand and record", bn: "বুঝুন ও লিখে রাখুন", items: [
      { href: "/app/jibonrekha", name: "Jibonrekha", Icon: HeartPulse, en: "Mother and baby records, visits and corrections", bn: "মা ও শিশুর রেকর্ড, ভিজিট ও সংশোধন", status: "Working" },
      { href: "/app/bujhi", name: "Bujhi", Icon: FileSearch, en: "Read one supported report, check values, then save", bn: "একটি সমর্থিত রিপোর্ট পড়ুন, যাচাই করে সংরক্ষণ করুন", status: "Limited" },
      { href: "/ask", name: "Barta", Icon: BookOpenText, en: "Answers from approved sources, with citations", bn: "অনুমোদিত সূত্র থেকে উত্তর, সূত্রসহ", status: "Working" },
    ] },
    { en: "Care for yourself", bn: "নিজের যত্ন", items: [
      { href: "/app/wellbeing", name: "Shusthota", Icon: Sprout, en: "Optional check-ins and a private diary", bn: "ঐচ্ছিক চেক-ইন ও ব্যক্তিগত ডায়েরি", status: "Working" },
      { href: "/accessibility", name: "Adapt", Icon: SlidersHorizontal, en: "Adjust text, contrast, language and motion", bn: "লেখা, কনট্রাস্ট, ভাষা ও গতি বদলান", status: "Working" },
    ] },
    { en: "Get help and stay connected", bn: "সাহায্য ও যোগাযোগ", items: [
      { href: "/safety", name: "Shonket", Icon: LifeBuoy, en: "Warning signs and a path to human help", bn: "সতর্কতার লক্ষণ ও মানুষের সাহায্য", status: "Working" },
      { href: "/poth", name: "Poth", Icon: MapPin, en: "Facility directory from OpenStreetMap, not verified", bn: "ওপেনস্ট্রিটম্যাপের সেবাকেন্দ্র তালিকা, যাচাই করা নয়", status: "Limited" },
      { href: "/app/care", name: "Bondhon", Icon: ShieldCheck, en: "You choose what to share; simulated provider", bn: "কী শেয়ার করবেন আপনি ঠিক করেন; সিমুলেটেড সেবাদাতা", status: "Simulated" },
    ] },
  ];
  return <section aria-labelledby="dash-modules" className="grid gap-4">
    <h2 id="dash-modules" className="pro-editorial text-2xl font-semibold">{t({ en: "Everything in PROHOR", bn: "প্রহরের সবকিছু" })}</h2>
    <div className="grid gap-4 lg:grid-cols-3">
      {groups.map(group => <div key={group.en} className="grid content-start gap-2">
        <h3 className="pro-eyebrow text-pro-muted">{t({ en: group.en, bn: group.bn })}</h3>
        <ul className="grid gap-2">{group.items.map(({ href, name, Icon, en, bn, status }) => <li key={name}>
          <Link href={href} className="group flex min-h-16 items-center gap-3 rounded-card border border-pro-border bg-pro-bg px-4 py-3 transition-colors duration-150 hover:border-pro-primary focus-visible:outline-3 focus-visible:outline-pro-focus motion-reduce:transition-none">
            <Icon size={20} aria-hidden="true" className="shrink-0 text-pro-primary" />
            <span className="grid min-w-0 flex-1 gap-0.5">
              <span className="flex flex-wrap items-center gap-2 font-semibold">{name}<span className="rounded-pill border border-pro-border px-2 text-xs font-semibold text-pro-muted">{status}</span></span>
              <span className="text-sm text-pro-muted">{t({ en, bn })}</span>
            </span>
            <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-pro-primary" />
          </Link>
        </li>)}</ul>
      </div>)}
    </div>
  </section>;
}
