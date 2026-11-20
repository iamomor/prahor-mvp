"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Download, Info, Keyboard, Lightbulb, RotateCcw, ShieldCheck, SearchX } from "lucide-react";

import { useLanguage } from "@/i18n/use-language";
import { ReportUpload } from "./ReportUpload";
import { ReportOverviewCard } from "./ReportOverviewCard";
import { recognizeReportImage } from "./ocr-service";
import { WorkflowProgress } from "./WorkflowProgress";
import type { ExtractedReport } from "./types";

import { isHemoglobinLabel } from "./validation";
type Copy = { en: string; bn: string };
const focus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus";

export function ImageMedicalEntry({ onDraft, active = true, onManual, onManualFile, showProgress = true, renderSave, onStage }: { renderSave?: (rawText: string) => ReactNode; onStage?: (stage: "read" | "start") => void; showProgress?: boolean; active?: boolean; onDraft: (report: ExtractedReport, source?: File) => void; onManual?: () => void; onManualFile?: (file: File) => void }) {
  const { t } = useLanguage();
  const [fallbackFile, setFallbackFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false), [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0), [status, setStatus] = useState<Copy | null>(null), [error, setError] = useState<Copy | null>(null);
  const [readText, setReadText] = useState(""), [nothingRead, setNothingRead] = useState(false), [uploadKey, setUploadKey] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!active) {
      controller.current?.abort();
      void Promise.resolve().then(() => { setBusy(false); setStatus(null); });
    }
  }, [active]);

  async function scan(file: File) {
    if (!consent || busy) return; // The button explains what is missing; it stays disabled until both are done.
    const signal = new AbortController(); controller.current = signal;
    setBusy(true); setError(null); setNothingRead(false); setReadText(""); setFallbackFile(file); setProgress(0);
    setStatus({ en: "Getting the reader ready…", bn: "রিডার প্রস্তুত করা হচ্ছে…" });
    try {
      const draft = await recognizeReportImage(file, (message, fraction) => { setStatus(message === "matching results" ? { en: "Sorting what was found…", bn: "যা পাওয়া গেছে তা সাজানো হচ্ছে…" } : message === "recognizing text" ? { en: "Reading the words in your photo…", bn: "ছবির লেখা পড়া হচ্ছে…" } : { en: "Getting the reader ready…", bn: "রিডার প্রস্তুত করা হচ্ছে…" }); setProgress(Math.round(fraction * 100)); }, signal.signal);
      const noSaveableValue = !draft.fields.length || (onManualFile && !draft.fields.some((field) => isHemoglobinLabel(field.label)));
      if (noSaveableValue) {
        setNothingRead(true); setReadText((draft.rawText ?? "").trim()); onStage?.("read");
        setStatus({ en: "Reading finished. No test value that can be saved was found.", bn: "পড়া শেষ। সংরক্ষণ করা যায় এমন কোনো পরীক্ষার মান পাওয়া যায়নি।" });
        requestAnimationFrame(() => resultHeading.current?.focus());
      } else {
        setStatus({ en: "Reading finished. Now compare what was found with your paper report.", bn: "পড়া শেষ। এবার যা পাওয়া গেছে তা কাগজের রিপোর্টের সঙ্গে মিলিয়ে নিন।" });
        onDraft(draft, file);
      }
    } catch {
      if (!signal.signal.aborted) {
        setError({ en: "The photo could not be read. Check your internet and try again, or type the value from your report yourself.", bn: "ছবিটি পড়া যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন, অথবা রিপোর্ট দেখে নিজে মান লিখুন।" });
        setStatus(null);
        requestAnimationFrame(() => resultHeading.current?.focus());
      }
    } finally { if (!signal.signal.aborted) setBusy(false); }
  }
  function cancel() { controller.current?.abort(); setBusy(false); setStatus({ en: "Stopped. Nothing is saved.", bn: "থামানো হয়েছে। কিছু সংরক্ষণ হয়নি।" }); }
  function startOver() { onStage?.("start"); setNothingRead(false); setError(null); setReadText(""); setFallbackFile(null); setStatus(null); setUploadKey((key) => key + 1); }

  const showResult = !busy && (nothingRead || Boolean(error));
  const secondary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-control border-2 border-pro-primary px-5 py-3 font-semibold text-pro-primary ${focus}`;
  const primary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-pro-primary px-5 py-3 font-semibold text-pro-on-primary ${focus}`;

  return <section className="grid min-w-0 gap-6" data-testid="bujhi-image-entry" aria-label={t({ en: "Add a report photo", bn: "রিপোর্টের ছবি দিন" })}>
    {showProgress && <WorkflowProgress current="add" language="bn" />}

    {/* Step 1 — choose, allow, read. Hidden (not unmounted) while reading so the chosen photo is kept. */}
    <div hidden={busy || showResult} className="min-w-0">
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-8">
        <div className="grid min-w-0 gap-6">
          <div className="flex min-w-0 items-start gap-3 rounded-card border border-pro-info bg-pro-info-soft p-4">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <div className="grid min-w-0 gap-1">
              <p>{t({ en: "This is a demo. It reads blood-test reports printed in English. Please use a sample report, not a real one.", bn: "এটি একটি ডেমো। ইংরেজিতে ছাপা রক্তপরীক্ষার রিপোর্ট পড়তে পারে। আসল রিপোর্ট নয়, নমুনা রিপোর্ট ব্যবহার করুন।" })}</p>
              <a href="/bujhi/prohor-synthetic-lab-v1.png" download className={`inline-flex min-h-12 w-fit items-center gap-2 font-semibold text-pro-primary underline underline-offset-4 ${focus}`}><Download aria-hidden="true" className="size-4 shrink-0" />{t({ en: "Download a sample report to try", bn: "চেষ্টা করতে নমুনা রিপোর্ট ডাউনলোড করুন" })}</a>
            </div>
          </div>
          <fieldset disabled={busy} className="min-w-0">
            <legend className="sr-only">{t({ en: "Choose a report photo", bn: "রিপোর্টের ছবি বাছুন" })}</legend>
            <ReportUpload key={uploadKey} consent={consent} onConsentChange={setConsent} onContinue={(file) => void scan(file)} />
          </fieldset>
          {onManual && <button type="button" onClick={onManual} className={`min-h-12 justify-self-start rounded-control px-1 font-semibold text-pro-primary underline underline-offset-4 ${focus}`}>{t({ en: "No photo? Type the values yourself", bn: "ছবি নেই? নিজে মান লিখুন" })}</button>}
        </div>
        <aside className="grid min-w-0 gap-5 rounded-card border border-pro-border bg-pro-surface p-5 sm:p-6 lg:sticky lg:top-24" aria-label={t({ en: "Photo tips and privacy", bn: "ছবির পরামর্শ ও গোপনীয়তা" })}>
          <div className="grid gap-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><Lightbulb aria-hidden="true" className="size-5 shrink-0 text-pro-primary" />{t({ en: "Tips for a clear photo", bn: "পরিষ্কার ছবির জন্য টিপস" })}</h3>
            <ul className="list-disc space-y-2 pl-5 text-pro-muted">
              <li>{t({ en: "Lay the report flat in good light.", bn: "রিপোর্ট সমতলে, ভালো আলোতে রাখুন।" })}</li>
              <li>{t({ en: "Fit the whole page in the photo. Avoid shadows and glare.", bn: "পুরো পাতা ছবিতে রাখুন। ছায়া বা আলোর ঝলক এড়িয়ে চলুন।" })}</li>
              <li>{t({ en: "Take one page at a time.", bn: "একবারে এক পাতার ছবি দিন।" })}</li>
            </ul>
          </div>
          <div className="grid gap-3 border-t border-pro-border pt-5">
            <h3 className="font-semibold">{t({ en: "What happens next", bn: "এরপর কী হবে" })}</h3>
            <ol className="list-decimal space-y-2 pl-5 text-pro-muted">
              <li>{t({ en: "We show what was read next to your photo.", bn: "ছবির পাশে দেখানো হবে কী পড়া গেছে।" })}</li>
              <li>{t({ en: "You compare it with the paper and fix any mistake.", bn: "আপনি কাগজের সঙ্গে মিলিয়ে ভুল থাকলে ঠিক করবেন।" })}</li>
              <li>{t({ en: "You decide whether to save it.", bn: "সংরক্ষণ করবেন কি না, সেটা আপনিই ঠিক করবেন।" })}</li>
            </ol>
          </div>
          <p className="flex items-start gap-2 border-t border-pro-border pt-5 text-pro-muted"><ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" /><span>{t({ en: "Nothing is saved without your check. This is not a doctor's review.", bn: "আপনার যাচাই ছাড়া কিছু সংরক্ষণ হয় না। এটি চিকিৎসকের পর্যালোচনা নয়।" })}</span></p>
        </aside>
      </div>
    </div>

    {busy && <div className="grid gap-4 rounded-card border border-pro-border bg-pro-surface p-5 sm:p-7">
      <h3 className="text-xl font-semibold">{t({ en: "Reading your report…", bn: "আপনার রিপোর্ট পড়া হচ্ছে…" })}</h3>
      <p>{t({ en: "This can take up to a minute. Keep this page open. Your photo stays on this device.", bn: "এক মিনিট পর্যন্ত লাগতে পারে। পেজটি খোলা রাখুন। আপনার ছবি এই ডিভাইসেই থাকে।" })}</p>
      <progress value={progress} max={100} aria-label={t({ en: "Reading progress", bn: "পড়ার অগ্রগতি" })} className="h-3 w-full overflow-hidden rounded-pill accent-pro-primary [&::-moz-progress-bar]:bg-pro-primary [&::-webkit-progress-bar]:bg-pro-border [&::-webkit-progress-value]:bg-pro-primary" />
      <p aria-hidden="true" className="text-sm text-pro-muted">{status ? t(status) : ""} {progress}%</p>
      <button type="button" onClick={cancel} className={`${secondary} sm:justify-self-start`}>{t({ en: "Stop reading", bn: "পড়া থামান" })}</button>
    </div>}

    {showResult && <div className="grid min-w-0 gap-6 rounded-card border border-pro-border bg-pro-elevated p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <SearchX aria-hidden="true" className="mt-1 size-6 shrink-0 text-pro-primary" />
        <div className="grid gap-2">
          <h3 ref={resultHeading} tabIndex={-1} className={`text-xl font-semibold ${focus}`}>{error ? t({ en: "The photo could not be read", bn: "ছবিটি পড়া যায়নি" }) : t({ en: "No test value we can save was found", bn: "সংরক্ষণ করা যায় এমন কোনো পরীক্ষার মান পাওয়া যায়নি" })}</h3>
          <p className="max-w-[65ch] text-pro-muted">{error ? t(error) : t({ en: "This doesn't mean anything is wrong. Right now we can only save hemoglobin from a blood-test report. You can still type the value yourself, or try another photo.", bn: "এর মানে এই নয় যে কোনো সমস্যা আছে। এখন শুধু রক্তপরীক্ষার রিপোর্ট থেকে হিমোগ্লোবিন সংরক্ষণ করা যায়। আপনি নিজে মান লিখতে পারেন, অথবা অন্য ছবি দিতে পারেন।" })}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {onManualFile && fallbackFile && <button type="button" onClick={() => onManualFile(fallbackFile)} className={primary}><Keyboard aria-hidden="true" className="size-5 shrink-0" />{t({ en: "Type the hemoglobin value myself", bn: "নিজে হিমোগ্লোবিনের মান লিখব" })}</button>}
        {onManual && <button type="button" onClick={onManual} className={primary}><Keyboard aria-hidden="true" className="size-5 shrink-0" />{t({ en: "Type the values myself", bn: "নিজে মান লিখব" })}</button>}
        <button type="button" onClick={startOver} className={secondary}><RotateCcw aria-hidden="true" className="size-5 shrink-0" />{t({ en: "Try another photo", bn: "অন্য ছবি দিন" })}</button>
      </div>
      {readText && <div className="grid gap-6 border-t border-pro-border pt-6"><ReportOverviewCard rawText={readText} />{renderSave?.(readText)}</div>}
      {nothingRead && <details className="rounded-field border border-pro-border bg-pro-bg px-4">
        <summary className={`min-h-12 cursor-pointer py-3 font-semibold text-pro-primary ${focus}`}>{t({ en: "Why wasn't a value found?", bn: "কেন মান পাওয়া যায়নি?" })}</summary>
        <ul className="list-disc space-y-2 pb-4 pl-5 text-pro-muted">
          <li>{t({ en: "The reader understands a few blood-test results printed in English, such as hemoglobin or glucose.", bn: "রিডারটি ইংরেজিতে ছাপা কয়েকটি রক্তপরীক্ষার ফল বুঝতে পারে, যেমন হিমোগ্লোবিন বা গ্লুকোজ।" })}</li>
          <li>{t({ en: "Tables of visits, referrals or checklists can be explained, but not saved yet.", bn: "ভিজিট, রেফারেল বা চেকলিস্টের টেবিল বোঝানো যায়, কিন্তু এখনো সংরক্ষণ করা যায় না।" })}</li>
          <li>{t({ en: "A blurry, tilted or dark photo may not be read. Try a flat photo in good light.", bn: "ঝাপসা, বাঁকা বা অন্ধকার ছবি পড়া না-ও যেতে পারে। সমতলে রেখে ভালো আলোতে তোলা ছবি দিন।" })}</li>
        </ul>
        {readText && <details className="mb-4 border-t border-pro-border pt-2"><summary className={`min-h-12 cursor-pointer py-3 font-semibold text-pro-primary ${focus}`}>{t({ en: "Show all words read from the photo", bn: "ছবি থেকে পড়া সব লেখা দেখুন" })}</summary><p className="whitespace-pre-wrap text-pro-muted [overflow-wrap:anywhere]">{readText}</p></details>}
      </details>}
    </div>}

    <p role="status" aria-atomic="true" className="sr-only">{status ? t(status) : ""}</p>
  </section>;
}
