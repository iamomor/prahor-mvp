"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Camera, Check, Upload } from "lucide-react";
import { useLanguage } from "@/i18n/use-language";
import { validateReportFile, type ReportMediaKind } from "./upload-validation";

const digit = (n: number, language: string) => language === "bn" ? String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]) : String(n);
const focus = "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus";
const accept = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

type Copy = { en: string; bn: string };
type SelectedMedia = { file: File; kind: ReportMediaKind; url: string };

/** One numbered sub-step. The number is a visual aid; the heading carries the meaning for screen readers. */
function SubStep({ n, title, done, children }: { n: number; title: string; done: boolean; children: ReactNode }) {
  const { language } = useLanguage();
  return <li className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 gap-y-3">
    <span aria-hidden="true" className={`grid size-9 place-items-center rounded-pill text-sm font-bold ${done ? "bg-pro-primary text-pro-on-primary" : "border-2 border-pro-control-border bg-pro-bg text-pro-text"}`}>{done ? <Check className="size-5" /> : digit(n, language)}</span>
    <h4 className="min-h-9 self-center text-lg font-semibold leading-snug">{title}{done && <span className="sr-only"> ✓</span>}</h4>
    <div className="col-span-2 grid min-w-0 gap-3 sm:col-span-1 sm:col-start-2">{children}</div>
  </li>;
}

export function ReportUpload({ onContinue, consent, onConsentChange, continueLabel }: {
  onContinue: (file: File, kind: ReportMediaKind) => void;
  consent: boolean;
  onConsentChange: (next: boolean) => void;
  continueLabel?: string;
}) {
  const { t, language } = useLanguage();
  const id = useId();
  const [selected, setSelected] = useState<SelectedMedia | null>(null);
  const [error, setError] = useState<Copy | null>(null);
  const [validating, setValidating] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [message, setMessage] = useState<Copy | null>(null);
  const activeUrl = useRef<string | null>(null);
  const request = useRef(0);
  const cameraInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const galleryButton = useRef<HTMLButtonElement>(null);

  useEffect(() => () => {
    request.current++;
    if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
  }, []);

  function clearPreview() {
    if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
    activeUrl.current = null;
    setSelected(null);
    setPreviewReady(false);
  }
  async function choose(event: ChangeEvent<HTMLInputElement>, kind: ReportMediaKind) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = ""; // Allow choosing the same file again after removal or an error.
    if (!file) return;
    const current = ++request.current;
    clearPreview();
    setError(null);
    setValidating(true);
    setMessage({ en: "Checking your photo…", bn: "আপনার ছবিটি দেখা হচ্ছে…" });
    try {
      const problem = await validateReportFile(file, kind);
      if (current !== request.current) return;
      if (problem) { setError(problem); setMessage(null); return; }
      const url = URL.createObjectURL(file);
      activeUrl.current = url;
      setSelected({ file, kind, url });
      setMessage({ en: "Loading your photo…", bn: "ছবিটি দেখানো হচ্ছে…" });
    } catch {
      if (current === request.current) { setError({ en: "This file could not be opened. Choose it again, or choose another JPG, PNG or WebP photo.", bn: "ফাইলটি খোলা গেল না। আবার বাছুন, অথবা অন্য একটি JPG, PNG বা WebP ছবি বাছুন।" }); setMessage(null); }
    } finally {
      if (current === request.current) setValidating(false);
    }
  }
  function remove() {
    request.current++;
    clearPreview();
    setError(null);
    setValidating(false);
    setMessage({ en: "Photo removed. Nothing was saved or sent.", bn: "ছবিটি সরানো হয়েছে। কিছু সংরক্ষণ বা পাঠানো হয়নি।" });
    requestAnimationFrame(() => galleryButton.current?.focus());
  }
  function previewFailed() {
    setPreviewReady(false);
    setError({ en: "Your browser could not show this photo. It may be damaged. Remove it and choose another photo.", bn: "ব্রাউজার ছবিটি দেখাতে পারেনি। ছবিটি নষ্ট হতে পারে। এটি সরিয়ে অন্য একটি ছবি বাছুন।" });
    setMessage(null);
  }
  function ready() {
    setPreviewReady(true);
    setError(null);
    setMessage({ en: "Photo added.", bn: "ছবি যোগ হয়েছে।" });
  }

  const hasPhoto = Boolean(selected && previewReady && !error);
  const canRead = hasPhoto && consent && !validating;
  // Say exactly what is still missing, right under the button, instead of a far-away error after a click.
  const blocker: Copy | null = !hasPhoto
    ? { en: "First add a photo of your report (step 1).", bn: "প্রথমে রিপোর্টের একটি ছবি দিন (ধাপ ১)।" }
    : !consent
      ? { en: "Tick the box in step 2 to continue.", bn: "চালিয়ে যেতে ধাপ ২-এর বাক্সে টিক দিন।" }
      : null;

  const tile = `grid min-h-28 w-full min-w-0 content-center justify-items-center gap-1.5 rounded-card border-2 border-dashed border-pro-control-border bg-pro-bg p-4 text-center transition-colors duration-200 hover:border-pro-primary hover:bg-pro-surface motion-reduce:transition-none ${focus}`;

  return <section aria-labelledby={`${id}-heading`} className="grid min-w-0 gap-5">
    <h3 id={`${id}-heading`} className="sr-only">{t({ en: "Choose a photo", bn: "ছবি বাছুন" })}</h3>
    <ol className="grid min-w-0 gap-7" lang={language}>
      <SubStep n={1} done={hasPhoto} title={hasPhoto ? t({ en: "Check it is the right page", bn: "সঠিক পাতা কি না দেখে নিন" }) : t({ en: "Add a photo of your report", bn: "রিপোর্টের ছবি দিন" })}>
        {!selected && <>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <button type="button" className={tile} onClick={() => cameraInput.current?.click()}>
              <Camera aria-hidden="true" className="size-7 text-pro-primary" />
              <span className="font-semibold">{t({ en: "Take a photo", bn: "ছবি তুলুন" })}</span>
              <span className="text-sm text-pro-muted">{t({ en: "Opens your phone camera", bn: "ফোনের ক্যামেরা খুলবে" })}</span>
            </button>
            <button ref={galleryButton} type="button" className={tile} onClick={() => photoInput.current?.click()} aria-describedby={`${id}-photo-hint`}>
              <Upload aria-hidden="true" className="size-7 text-pro-primary" />
              <span className="font-semibold">{t({ en: "Choose from gallery or files", bn: "গ্যালারি বা ফাইল থেকে বাছুন" })}</span>
              <span className="text-sm text-pro-muted">{t({ en: "A photo already on your device", bn: "আগে থেকে রাখা ছবি" })}</span>
            </button>
          </div>
          <p id={`${id}-photo-hint`} className="text-sm text-pro-muted">{t({ en: "JPG, PNG or WebP, up to 10 MB. One page at a time. The photo stays on this device.", bn: "JPG, PNG বা WebP, সর্বোচ্চ ১০ MB। একবারে এক পাতা। ছবিটি এই ডিভাইসেই থাকে।" })}</p>
        </>}
        <input id="bujhi-photo-camera" ref={cameraInput} type="file" hidden capture="environment" accept={accept} onChange={(event) => void choose(event, "photo")} />
        <input id="bujhi-photo-gallery" ref={photoInput} type="file" hidden accept={accept} aria-label={t({ en: "Choose a report photo", bn: "রিপোর্টের ছবি বাছুন" })} onChange={(event) => void choose(event, "photo")} />
        {selected && <figure className="grid min-w-0 gap-3 rounded-card border border-pro-border bg-pro-bg p-3 sm:p-4">
          {/* Blob URLs stay in the browser; no image optimization request is needed. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={selected.url} src={selected.url} alt={t({ en: "Preview of the report photo you chose", bn: "আপনার বাছাই করা রিপোর্টের ছবির প্রিভিউ" })} className="h-auto max-h-80 w-full min-w-0 rounded-field bg-pro-surface object-contain" onLoad={ready} onError={previewFailed} />
          <figcaption className="grid gap-2">
            <span className="text-sm text-pro-muted [overflow-wrap:anywhere]">{selected.file.name}</span>
            <span>{t({ en: "Can you read the words and numbers clearly? If not, take a new photo in better light.", bn: "লেখা ও সংখ্যা কি পরিষ্কার পড়া যাচ্ছে? না গেলে ভালো আলোতে নতুন ছবি তুলুন।" })}</span>
            <button type="button" onClick={remove} className={`min-h-12 justify-self-start rounded-control px-1 font-semibold text-pro-primary underline underline-offset-4 ${focus}`}>{t({ en: "Remove and choose another photo", bn: "ছবিটি সরিয়ে অন্য ছবি বাছুন" })}</button>
          </figcaption>
        </figure>}
        <p role="status" aria-atomic="true" className="text-sm text-pro-muted empty:hidden">{message ? t(message) : ""}</p>
        <p role="alert" className="font-semibold text-pro-danger empty:hidden">{error ? t(error) : ""}</p>
      </SubStep>

      <SubStep n={2} done={consent} title={t({ en: "Allow the report reader", bn: "রিপোর্ট রিডার চালুর অনুমতি দিন" })}>
        <label className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-field border-2 p-4 transition-colors duration-200 motion-reduce:transition-none ${consent ? "border-pro-primary bg-pro-surface" : "border-pro-control-border bg-pro-bg"}`}>
          <input className="mt-1 size-5 shrink-0 accent-pro-primary" type="checkbox" checked={consent} onChange={(event) => onConsentChange(event.target.checked)} aria-describedby={`${id}-consent-hint`} />
          <span className="grid gap-1">
            <span className="font-semibold">{t({ en: "I agree to download the report reader to this device", bn: "রিপোর্ট রিডারটি এই ডিভাইসে ডাউনলোড করতে আমি রাজি" })}</span>
            <span id={`${id}-consent-hint`} className="text-pro-muted">{t({ en: "It needs internet once. Your photo is read on this device and is not sent anywhere.", bn: "একবার ইন্টারনেট লাগবে। আপনার ছবি এই ডিভাইসেই পড়া হয়, কোথাও পাঠানো হয় না।" })}</span>
          </span>
        </label>
      </SubStep>

      <SubStep n={3} done={false} title={t({ en: "Start reading", bn: "পড়া শুরু করুন" })}>
        <p className="max-w-[60ch] text-pro-muted">{t({ en: "We find the words and numbers in your photo. Then you compare them with your paper report.", bn: "ছবির লেখা ও সংখ্যা খুঁজে বের করা হবে। তারপর আপনি সেগুলো কাগজের রিপোর্টের সঙ্গে মিলিয়ে নেবেন।" })}</p>
        <button type="button" disabled={!canRead} aria-describedby={blocker ? `${id}-blocker` : undefined} onClick={() => { if (selected && canRead) onContinue(selected.file, selected.kind); }} className={`min-h-12 w-full rounded-control bg-pro-primary px-6 py-3 text-lg font-semibold text-pro-on-primary transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:w-auto sm:min-w-64 sm:justify-self-start ${focus}`}>{continueLabel ?? t({ en: "Read my report", bn: "রিপোর্ট পড়ুন" })}</button>
        {blocker && <p id={`${id}-blocker`} className="text-sm font-semibold">{t(blocker)}</p>}
      </SubStep>
    </ol>
  </section>;
}
