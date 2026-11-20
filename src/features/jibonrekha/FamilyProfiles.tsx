"use client";

import type { RefObject } from "react";
import { Baby, Check, Pencil, Plus, UserRound } from "lucide-react";
import { ui } from "./jibonrekha-ui";
import { useL } from "./use-l";

type BabyProfile = { id: string; label: string; birth_date: string | null };

const bnNumber = (value: number) => new Intl.NumberFormat("bn-BD").format(value);
const formatDate = (value: string, bn: boolean) =>
  new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", { dateStyle: "medium", timeZone: "Asia/Dhaka" }).format(new Date(value));

/** First-visit guide: tells a new mother exactly what to fill in, in order. Hidden once the essentials exist. */
export function GettingStarted({ hasDates, hasEntries, hasBaby, onAddPregnancy, onAddEntry, onAddBaby }: {
  hasDates: boolean;
  hasEntries: boolean;
  hasBaby: boolean;
  onAddPregnancy: () => void;
  onAddEntry: () => void;
  onAddBaby: () => void;
}) {
  const L = useL();
  if (hasDates && hasEntries) return null;
  const steps = [
    { done: hasDates, title: L("Add your pregnancy dates", "গর্ভকালের তারিখ দিন"), hint: L("Due date or first day of last period — we show your week from it.", "প্রসবের সম্ভাব্য তারিখ বা শেষ মাসিকের প্রথম দিন — এ থেকে আপনার সপ্তাহ দেখানো হবে।"), action: onAddPregnancy, cta: L("Add dates", "তারিখ দিন") },
    { done: hasEntries, title: L("Write your first measurement", "প্রথম মাপ বা নোট লিখুন"), hint: L("Weight, blood pressure, haemoglobin — as written on your card.", "ওজন, রক্তচাপ, হিমোগ্লোবিন — কার্ডে যেমন লেখা আছে।"), action: onAddEntry, cta: L("Add entry", "লিখুন") },
    { done: hasBaby, optional: true, title: L("After birth: open your baby's profile", "সন্তান জন্মালে শিশুর প্রোফাইল খুলুন"), hint: L("Optional · each baby gets a separate record under you.", "ঐচ্ছিক · প্রতিটি শিশুর নথি আপনার নিচে আলাদা থাকে।"), action: onAddBaby, cta: L("Add baby", "শিশু যোগ করুন") },
  ];
  const doneCount = steps.filter((step) => step.done).length;
  return <section className="grid gap-4 rounded-hero border-[1.5px] border-pro-primary bg-pro-surface p-5 sm:p-6" aria-labelledby="start-title">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 id="start-title" className="text-2xl font-semibold">{L("Start here", "এখান থেকে শুরু করুন")}</h2>
      <p className="text-sm font-semibold text-pro-muted">{L(`${doneCount} of 3 done`, `৩টির মধ্যে ${bnNumber(doneCount)}টি সম্পন্ন`)}</p>
    </div>
    <ol className="grid gap-3">
      {steps.map((step, index) => <li key={step.title} className="flex flex-wrap items-center gap-3 rounded-card border border-pro-border bg-pro-elevated p-4">
        <span className={`grid size-10 shrink-0 place-items-center rounded-full font-semibold ${step.done ? "bg-pro-primary text-pro-on-primary" : "border-2 border-pro-primary text-pro-primary"}`} aria-hidden="true">
          {step.done ? <Check className="size-5" /> : bnNumber(index + 1)}
        </span>
        <span className="grid min-w-[12rem] flex-1">
          <span className="font-semibold">{step.title}{step.done && <span className="ml-2 text-sm font-semibold text-pro-success">· {L("Done", "সম্পন্ন")}</span>}</span>
          <span className="text-sm text-pro-muted">{step.hint}</span>
        </span>
        {!step.done && <button type="button" onClick={step.action} className={`${index === steps.findIndex((s) => !s.done) ? ui.primary : ui.secondary} ${ui.small} max-sm:w-full`}>
          <Plus className="size-4" aria-hidden="true" />{step.cta}
        </button>}
      </li>)}
    </ol>
  </section>;
}

/** Mother profile with each baby's profile nested under it. Every card has its own "add" action, so it is always clear where data goes. */
export function FamilyProfiles({ pregnancyId, pregnancyLabel, weekText, dueDate, babies, onAddForMother, onEditPregnancy, onNewPregnancy, onAddForBaby, onEditBaby, onAddBaby, headingRef }: {
  pregnancyId: string | null;
  pregnancyLabel: string | null;
  weekText: string | null;
  dueDate: string | null;
  babies: BabyProfile[];
  onAddForMother: () => void;
  onEditPregnancy: (id: string) => void;
  onNewPregnancy: () => void;
  onAddForBaby: (babyId: string) => void;
  onEditBaby: (babyId: string) => void;
  onAddBaby: () => void;
  headingRef?: RefObject<HTMLHeadingElement | null>;
}) {
  const L = useL();
  return <section id="profiles" className="grid scroll-mt-24 gap-4" aria-labelledby="profiles-title">
    <div className="grid gap-1">
      <h2 id="profiles-title" ref={headingRef} tabIndex={-1} className="text-2xl font-semibold focus-visible:outline-3 focus-visible:outline-pro-focus">{L("Mother & baby profiles", "মা ও শিশুর প্রোফাইল")}</h2>
      <p className="max-w-[65ch] text-pro-muted">{L("Each baby has a separate profile under yours. Use the button on a card to add information to that person.", "আপনার প্রোফাইলের নিচে প্রতিটি শিশুর আলাদা প্রোফাইল। যার কার্ডে বোতাম চাপবেন, তথ্য তার নথিতেই যাবে।")}</p>
    </div>

    <article className={`${ui.card} grid gap-4`} aria-labelledby="mother-card-title">
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-pro-primary text-pro-on-primary" aria-hidden="true"><UserRound className="size-7" /></span>
        <div className="grid min-w-0 flex-1 gap-1">
          <h3 id="mother-card-title" className="text-xl font-semibold">{L("Mother (you)", "মা (আপনি)")}</h3>
          <p className="[overflow-wrap:anywhere]">{pregnancyLabel ?? L("No pregnancy record yet", "এখনও গর্ভকালের নথি নেই")}</p>
          <dl className="flex flex-wrap gap-2 text-sm">
            <div className={ui.tag}><dt className="sr-only">{L("Week", "সপ্তাহ")}</dt><dd>{weekText ?? L("Week not shown — dates missing", "তারিখ নেই, সপ্তাহ দেখানো যাচ্ছে না")}</dd></div>
            {dueDate && <div className={ui.tag}><dt>{L("Estimated due date:", "প্রসবের আনুমানিক তারিখ:")}</dt><dd>{formatDate(dueDate, L.bn)}</dd></div>}
          </dl>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onAddForMother} className={`${ui.primary} ${ui.small} max-sm:w-full`}><Plus className="size-4" aria-hidden="true" />{L("Add mother's info", "মায়ের তথ্য যোগ করুন")}</button>
        {pregnancyId && <button type="button" onClick={() => onEditPregnancy(pregnancyId)} className={`${ui.secondary} ${ui.small} max-sm:w-full`}><Pencil className="size-4" aria-hidden="true" />{L("Edit name & dates", "নাম ও তারিখ বদলান")}</button>}
        <button type="button" onClick={onNewPregnancy} className={`${ui.secondary} ${ui.small} max-sm:w-full`}><Plus className="size-4" aria-hidden="true" />{pregnancyId ? L("Add another pregnancy", "নতুন গর্ভকাল যোগ করুন") : L("Add pregnancy dates", "গর্ভকালের তারিখ দিন")}</button>
      </div>
    </article>

    {/* The left rule shows the babies belong to the mother's profile. */}
    <div className="ml-6 grid gap-3 border-l-2 border-dashed border-pro-control-border pl-4 sm:ml-7 sm:pl-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold"><Baby className="size-5 text-pro-primary" aria-hidden="true" />{L("Babies", "শিশু")}{babies.length > 0 && <span className="text-pro-muted"> · {L.bn ? bnNumber(babies.length) : babies.length}</span>}</h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {babies.map((baby) => <li key={baby.id} className={`${ui.card} grid content-start gap-3 sm:p-5`}>
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-field border-2 border-pro-primary text-pro-primary" aria-hidden="true"><Baby className="size-5" /></span>
            <div className="grid min-w-0">
              <p className="text-lg font-semibold [overflow-wrap:anywhere]">{baby.label}</p>
              <p className="text-sm text-pro-muted">{baby.birth_date ? `${L("Born", "জন্ম")}: ${formatDate(baby.birth_date, L.bn)}` : L("Birth date not added", "জন্মের তারিখ লেখা নেই")}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onAddForBaby(baby.id)} className={`${ui.secondary} ${ui.small} max-sm:w-full`}><Plus className="size-4" aria-hidden="true" />{L(`Add info for ${baby.label}`, `${baby.label}-এর তথ্য যোগ করুন`)}</button>
            <button type="button" onClick={() => onEditBaby(baby.id)} className={`${ui.secondary} ${ui.small} max-sm:w-full`}><Pencil className="size-4" aria-hidden="true" />{L(`Edit ${baby.label}`, "বদলান")}<span className="sr-only">{L.bn ? ` · ${baby.label}` : ""}</span></button>
          </div>
        </li>)}
        <li>
          <button type="button" onClick={onAddBaby} className="flex min-h-full w-full items-center gap-3 rounded-card border-[1.5px] border-dashed border-pro-control-border bg-pro-elevated p-5 text-left font-semibold text-pro-primary transition-colors duration-150 hover:bg-pro-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus">
            <span className="grid size-11 shrink-0 place-items-center rounded-field bg-pro-surface" aria-hidden="true"><Plus className="size-5" /></span>
            <span className="grid">
              <span>{L("Add a baby profile", "শিশুর প্রোফাইল যোগ করুন")}</span>
              <span className="text-sm font-normal text-pro-muted">{L("After birth, or for each twin", "জন্মের পর, বা যমজ হলে প্রত্যেকের জন্য")}</span>
            </span>
          </button>
        </li>
      </ul>
    </div>
  </section>;
}
