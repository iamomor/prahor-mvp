"use client";

import { VoiceDictationButton } from "@/features/adapt/components/VoiceDictationButton";
import { ACCESS_NEEDS } from "@/features/adapt/lib/access-card";
import { educationCopy } from "@/features/barta/barta-education-copy";
import { maxSpeechText } from "@/features/barta/barta-spoken-text";
import { useBartaAudio } from "@/features/barta/use-barta-audio";
import { useLanguage } from "@/i18n/use-language";
import { useHydrated } from "@/lib/use-hydrated";
import { Mic, PenLine } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useRef, useState, type ReactNode } from "react";
import { BraillePractice } from "./BraillePractice";

const copy = {
  en: {
    title: "Communication and access",
    open: "Open communication tools",
    brailleEntry: "Braille input and reading",
    signEntry: "Sign and written support",
    microphone: "Microphone and read aloud",
    language: "Speech language",
    readLanguage: "Read-aloud language",
    auto: "Auto from text",
    draft: "Editable text",
    start: "Start microphone",
    stop: "Stop microphone",
    read: "Read text aloud",
    silence: "Stop reading",
    next: "Load selected page text",
    page: "Load page excerpt",
    browser:
      "Dictation may send audio to your browser’s speech service. Turn on the microphone only when you’re ready. Review the text before using it.",
    local:
      "Read aloud uses an installed device voice. If a matching voice is unavailable, use the text or your screen reader.",
    noSelection: "Select text on the page or type into the box below.",
    copied: "Text added to the box. Review it before continuing.",
    braille: "Braille and screen readers",
    brailleHelp:
      "Connect your refreshable Braille display through your device’s screen reader. Choose its Bangla or English Braille table, then navigate headings, links and form controls as usual. Change the site language in Adapt if needed.",
    sign: "Sign language and written communication",
    signHelp:
      "Show either phrase to a care professional or use the Access Card to prepare for a visit.",
    signStatus: "Interpreter availability depends on the care facility.",
    settings: "Open Adapt and the Access Card",
    request: "Open Bondhon to request support",
    copyText: "Copy text",
    clipboardDone: "Text copied.",
    clipboardFallback:
      "Copy is unavailable. Select and copy the text manually.",
  },
  bn: {
    title: "যোগাযোগ ও প্রবেশগম্যতা",
    open: "যোগাযোগের সহায়ক টুল খুলুন",
    brailleEntry: "ব্রেইল লেখা ও পড়া",
    signEntry: "ইশারা ও লিখিত সহায়তা",
    microphone: "মাইক্রোফোন ও পড়ে শোনানো",
    language: "কথার ভাষা",
    readLanguage: "পড়ে শোনানোর ভাষা",
    auto: "লেখা থেকে স্বয়ংক্রিয়",
    draft: "সম্পাদনাযোগ্য লেখা",
    start: "মাইক্রোফোন চালু করুন",
    stop: "মাইক্রোফোন বন্ধ করুন",
    read: "লেখা পড়ে শোনান",
    silence: "পড়া বন্ধ করুন",
    next: "পাতা থেকে বাছাই করা লেখা আনুন",
    page: "পাতার কিছু লেখা আনুন",
    browser:
      "কথা থেকে লেখার জন্য ব্রাউজার তার সেবা-প্রদানকারীর কাছে অডিও পাঠাতে পারে। প্রস্তুত হলে মাইক্রোফোন চালু করুন। ব্যবহারের আগে লেখা দেখে নিন।",
    local:
      "পড়ে শোনাতে ডিভাইসে থাকা কণ্ঠ ব্যবহার করা হয়। এই ভাষার কণ্ঠ না থাকলে লেখা বা স্ক্রিন রিডার ব্যবহার করুন।",
    noSelection: "পাতার লেখা বাছাই করুন অথবা নিচের ঘরে লিখুন।",
    copied: "লেখা ঘরে যোগ হয়েছে। এগোনোর আগে দেখে নিন।",
    braille: "ব্রেইল ও স্ক্রিন রিডার",
    brailleHelp:
      "ডিভাইসের স্ক্রিন রিডারের মাধ্যমে রিফ্রেশেবল ব্রেইল ডিসপ্লে যুক্ত করুন। বাংলা বা ইংরেজি ব্রেইল টেবিল বাছাই করে শিরোনাম, লিংক ও ফর্মে চলাচল করুন। প্রয়োজন হলে Adapt-এ সাইটের ভাষা বদলান।",
    sign: "ইশারা ভাষা ও লিখিত যোগাযোগ",
    signHelp:
      "সেবাদানকারীকে নিচের যেকোনো বাক্য দেখান অথবা পরিদর্শনের আগে অ্যাক্সেস কার্ড তৈরি করুন।",
    signStatus: "দোভাষী পাওয়া যাবে কি না, তা সেবাকেন্দ্রের ওপর নির্ভর করে।",
    settings: "Adapt ও অ্যাক্সেস কার্ড খুলুন",
    request: "সহায়তার অনুরোধ করতে Bondhon খুলুন",
    copyText: "লেখা কপি করুন",
    clipboardDone: "লেখা কপি হয়েছে।",
    clipboardFallback: "কপি করা যায়নি। লেখা বাছাই করে নিজে কপি করুন।",
  },
} as const;

const toolClass =
  "inline-flex min-h-11 items-center gap-2 rounded-pill border-[1.5px] border-pro-control-border bg-pro-elevated py-1 ps-1.5 pe-4 text-start text-sm font-semibold text-pro-text transition-colors duration-[var(--pro-duration-fast)] hover:bg-pro-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus disabled:opacity-60 motion-reduce:transition-none data-[active=true]:border-pro-primary data-[active=true]:bg-pro-primary data-[active=true]:text-pro-on-primary data-[active=true]:hover:bg-pro-primary-hover";
const toolIcon =
  "grid size-8 shrink-0 place-items-center rounded-full bg-pro-surface text-pro-primary";
function BrailleDots() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="currentColor"
      aria-hidden="true"
    >
      {[7, 17].flatMap((x) =>
        [6, 12, 18].map((y) => (
          <circle key={x + "-" + y} cx={x} cy={y} r="2" />
        )),
      )}
    </svg>
  );
}
function ToolButton({
  icon,
  children,
  ...props
}: { icon: ReactNode; children: ReactNode } & React.ComponentProps<"button">) {
  return (
    <button type="button" className={toolClass} {...props}>
      <span className={toolIcon}>{icon}</span>
      {children}
    </button>
  );
}

const buttonClass =
  "inline-flex min-h-11 items-center rounded-lg border border-pro-control-border px-3 py-2 text-start text-pro-primary focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60";

export function ModuleCommunication({
  placement = "site",
}: { placement?: "site" | "barta" } = {}) {
  const pathname = usePathname() ?? "";
  const onBarta = pathname === "/ask" || pathname === "/app/ask";
  if ((placement === "barta") !== onBarta) return null;
  const segments = pathname.split("/").filter(Boolean);
  const modulePath =
    segments[0] === "demo" || (segments[0] === "app" && segments[1])
      ? "/" + segments[1]
      : "/" + (segments[0] ?? "");
  return (
    <CommunicationPanel
      key={pathname}
      modulePath={modulePath}
      authenticated={segments[0] === "app"}
      inPage={placement === "barta"}
    />
  );
}

function CommunicationPanel({
  modulePath,
  authenticated,
  inPage,
}: {
  modulePath: string;
  authenticated: boolean;
  inPage: boolean;
}) {
  const { language } = useLanguage();
  const ready = useHydrated();
  const [open, setOpen] = useState(false);
  const [brailleOpen, setBrailleOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const id = useId();
  const labels = copy[language];
  return (
    <section
      lang={language}
      aria-label={labels.title}
      className={
        inPage
          ? "min-w-0 text-pro-text"
          : "mx-auto w-full min-w-0 max-w-6xl px-4 py-4 text-pro-text"
      }
    >
      <div className="flex flex-wrap gap-2">
        <ToolButton
          icon={<Mic size={20} aria-hidden="true" />}
          disabled={!ready}
          data-active={open && !brailleOpen && !signOpen}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => {
            setBrailleOpen(false);
            setSignOpen(false);
            setOpen(!open);
          }}
        >
          {labels.open}
        </ToolButton>
        <ToolButton
          icon={<BrailleDots />}
          disabled={!ready}
          data-active={open && brailleOpen}
          aria-expanded={open && brailleOpen}
          aria-controls={id}
          onClick={() => {
            setSignOpen(false);
            setOpen(true);
            setBrailleOpen(!brailleOpen);
          }}
        >
          {labels.brailleEntry}
        </ToolButton>
        <ToolButton
          icon={<PenLine size={20} aria-hidden="true" />}
          disabled={!ready}
          data-active={open && signOpen}
          aria-expanded={open && signOpen}
          aria-controls={id}
          onClick={() => {
            setBrailleOpen(false);
            setOpen(true);
            setSignOpen(!signOpen);
          }}
        >
          {labels.signEntry}
        </ToolButton>
      </div>
      <div id={id} hidden={!open}>
        {open && (
          <CommunicationTools
            language={language}
            modulePath={modulePath}
            authenticated={authenticated}
            brailleOpen={brailleOpen}
            onBrailleToggle={setBrailleOpen}
            signOpen={signOpen}
            onSignToggle={setSignOpen}
          />
        )}
      </div>
    </section>
  );
}

function CommunicationTools({
  language,
  modulePath,
  authenticated,
  brailleOpen,
  onBrailleToggle,
  signOpen,
  onSignToggle,
}: {
  language: "en" | "bn";
  modulePath: string;
  authenticated: boolean;
  brailleOpen: boolean;
  onBrailleToggle: (open: boolean) => void;
  signOpen: boolean;
  onSignToggle: (open: boolean) => void;
}) {
  const toolsRoot = useRef<HTMLDivElement>(null);
  const [speechLanguage, setSpeechLanguage] = useState<"en" | "bn">(language);
  const [readLanguage, setReadLanguage] = useState<"auto" | "bn" | "en">(
    "auto",
  );
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const audio = useBartaAudio();
  const labels = copy[language];
  const speech = educationCopy[language];
  const settings = authenticated ? "/app/accessibility" : "/accessibility";

  function readDraft() {
    const text = draft.trim();
    const hasBangla = /[\u0980-\u09ff]/u.test(text);
    const hasLatin = /[a-z]/iu.test(text);
    const detected =
      hasBangla === hasLatin ? speechLanguage : hasBangla ? "bn" : "en";
    const readingLanguage = readLanguage === "auto" ? detected : readLanguage;
    audio.play("module-text", text, readingLanguage, true);
  }

  function loadSelection() {
    const selection = window.getSelection();
    const element = selection?.anchorNode?.parentElement;
    if (
      !selection ||
      !element?.closest("main") ||
      !element.closest("main")?.contains(selection.focusNode) ||
      toolsRoot.current?.contains(element) ||
      toolsRoot.current?.contains(selection.focusNode)
    ) {
      setStatus(labels.noSelection);
      return;
    }
    const selected = selection.toString().trim().slice(0, maxSpeechText);
    if (!selected) {
      setStatus(labels.noSelection);
      return;
    }
    setDraft(selected);
    setStatus(labels.copied);
  }

  function loadPageExcerpt() {
    const main = document.querySelector("main");
    const excerpt = Array.from(main?.querySelectorAll("h1, h2, h3, p") ?? [])
      .filter(
        (node) =>
          !toolsRoot.current?.contains(node) &&
          !node.closest('[hidden], [aria-hidden="true"], [inert], .sr-only') &&
          node.getClientRects().length > 0,
      )
      .map((node) => node.textContent?.trim())
      .filter(Boolean)
      .join("\n")
      .slice(0, maxSpeechText);
    if (excerpt) setDraft(excerpt);
    setStatus(excerpt ? labels.copied : labels.noSelection);
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft);
      setStatus(labels.clipboardDone);
    } catch {
      setStatus(labels.clipboardFallback);
    }
  }

  return (
    <div
      ref={toolsRoot}
      className="mt-3 grid min-w-0 gap-4 rounded-xl border border-pro-control-border bg-pro-elevated p-4 [overflow-wrap:anywhere]"
    >
      <details
        open={brailleOpen}
        onToggle={(event) => onBrailleToggle(event.currentTarget.open)}
        className="min-w-0 rounded-xl border border-pro-control-border bg-pro-bg px-3 sm:px-4"
      >
        <summary className="cursor-pointer py-3 font-semibold">
          {labels.braille}
        </summary>

        <BraillePractice
          language={language}
          modulePath={modulePath}
          buttonClass={buttonClass}
          disabled={audio.listening || draft.length >= maxSpeechText - 120}
          onInsert={(text) => {
            const next = [draft, text].filter(Boolean).join(" ");
            if (next.length > maxSpeechText) return;
            audio.resetAudio();
            setDraft(next);
            setStatus(labels.copied);
          }}
        />
        <p className="pb-4 text-pro-muted">{labels.brailleHelp}</p>
      </details>
      <details
        open={signOpen}
        onToggle={(event) => onSignToggle(event.currentTarget.open)}
        className="min-w-0 rounded-xl border border-pro-control-border bg-pro-bg px-3 pb-2 sm:px-4"
      >
        <summary className="cursor-pointer py-3 font-semibold">
          {labels.sign}
        </summary>
        <p>{labels.signHelp}</p>
        <ul className="list-disc space-y-2 ps-5">
          {ACCESS_NEEDS.filter(
            (need) =>
              need.id === "sign-interpreter" || need.id === "write-down",
          ).map((need) => (
            <li key={need.id}>
              <p lang="bn">{need.bn}</p>
              <p lang="en">{need.en}</p>
            </li>
          ))}
        </ul>
        <p>{labels.signStatus}</p>
        <div className="flex flex-wrap gap-2">
          <Link href={settings} className={buttonClass}>
            {labels.settings}
          </Link>
          {authenticated && (
            <Link href="/app/care/new" className={buttonClass}>
              {labels.request}
            </Link>
          )}
        </div>
      </details>
      <fieldset className="grid min-w-0 gap-3">
        <legend className="font-semibold">{labels.microphone}</legend>
        <p>{labels.browser}</p>
        <label className="grid gap-1">
          {labels.language}
          <select
            className={buttonClass}
            value={speechLanguage}
            disabled={audio.listening}
            onChange={(event) => {
              audio.resetAudio();
              setSpeechLanguage(
                event.currentTarget.value === "bn" ? "bn" : "en",
              );
            }}
          >
            <option value="bn" lang="bn">
              বাংলা
            </option>
            <option value="en" lang="en">
              English
            </option>
          </select>
        </label>
        <label className="grid gap-1">
          {labels.readLanguage}
          <select
            className={buttonClass}
            value={readLanguage}
            onChange={(event) => {
              const value = event.currentTarget.value;
              audio.stopSpeaking();
              setReadLanguage(
                value === "bn" || value === "en" ? value : "auto",
              );
            }}
          >
            <option value="auto">{labels.auto}</option>
            <option value="bn" lang="bn">
              বাংলা
            </option>
            <option value="en" lang="en">
              English
            </option>
          </select>
        </label>
        <label className="grid gap-1">
          {labels.draft}
          <textarea
            className="w-full min-w-0 rounded-lg border border-pro-control-border bg-pro-bg p-2"
            rows={3}
            lang={speechLanguage}
            maxLength={maxSpeechText}
            value={draft}
            readOnly={audio.listening}
            onChange={(event) => setDraft(event.currentTarget.value)}
          />
        </label>
        {audio.listening && (
          <p lang={speechLanguage}>
            {audio.transcript?.final}{" "}
            {audio.transcript?.interim && (
              <mark>{audio.transcript.interim}</mark>
            )}
          </p>
        )}
        {/* Same microphone as every other PROHOR field: works in browsers without a built-in speech service too. */}
        <VoiceDictationButton
          compact
          hideLanguageSelect
          hideCounter
          value={draft}
          maxLength={maxSpeechText}
          onChange={(next) => {
            setStatus("");
            setDraft(next);
          }}
          language={speechLanguage}
          uiLanguage={language}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={buttonClass}
            disabled={audio.listening || !draft.trim()}
            onClick={readDraft}
          >
            {audio.speaking ? labels.silence : labels.read}
          </button>
          <button
            type="button"
            className={buttonClass}
            disabled={audio.listening || !!draft}
            onPointerDown={(event) => {
              if (
                event.pointerType === "mouse" &&
                window.getSelection()?.toString()
              )
                event.preventDefault();
            }}
            onClick={loadSelection}
          >
            {labels.next}
          </button>
          <button
            type="button"
            className={buttonClass}
            disabled={audio.listening || !!draft}
            onClick={loadPageExcerpt}
          >
            {labels.page}
          </button>
          <button
            type="button"
            className={buttonClass}
            disabled={!draft.trim()}
            onClick={() => void copyDraft()}
          >
            {labels.copyText}
          </button>
        </div>
        <p>{labels.local}</p>
        <p role="status">
          {audio.notice
            ? audio.notice.kind === "noVoice" ||
              audio.notice.kind === "playError"
              ? labels.local
              : speech[audio.notice.kind]
            : status || (audio.listening ? speech.listening : "")}
        </p>
      </fieldset>
    </div>
  );
}
