"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { AACComposer, clearStoredAacDraft, getStoredAacDraft, mergeAacText, useAdaptPreferences } from "@/features/adapt";
import { bartaAnswerSchema, type BartaAnswer } from "@/lib/contracts/barta";
import { NetworkStatus } from "@/components/pwa/NetworkStatus";
import { detectBartaLanguage } from "./chat-language";
import { BartaEducationChat } from "./BartaEducationChat";
import { educationCopy, type Language } from "./barta-education-copy";
import { bartaDemoQuestions, getBartaDemoLanguage } from "./demo-questions";
import styles from "./barta-education.module.css";

type ChatState =
  | { status: "idle" | "checking" }
  | { status: "response"; result: BartaAnswer; language: "bn" | "en" }
  | { status: "error"; message: string; language: "en" | "bn" };

type Turn = { question: string; questionLanguage?: string; result: BartaAnswer; language: Language };
const subscribeDraft = (callback: () => void) => {
  window.addEventListener("prohor-aac-draft-change", callback);
  return () => window.removeEventListener("prohor-aac-draft-change", callback);
};

function readErrorMessage(body: unknown): string {
  return body !== null && typeof body === "object" && "message" in body
    && typeof body.message === "string" && body.message.trim()
    ? body.message
    : "Barta is unavailable. Try again.";
}

/** `initialQuestion` only pre-fills the editable draft (e.g. from the dashboard); it is never sent automatically. */
export function BartaChatStarter({ mode = "demo", initialQuestion = "" }: { mode?: "demo" | "education"; initialQuestion?: string }) {
  const demo = mode === "demo";
  const { prefs } = useAdaptPreferences();
  const [incoming, setIncoming] = useState("");
  const storedDraft = useSyncExternalStore(subscribeDraft, getStoredAacDraft, () => null);
  const [answerLanguage, setAnswerLanguage] = useState<Language | "auto">("auto");
  const questionInput = useRef<HTMLTextAreaElement>(null);
  const pendingRequest = useRef<AbortController | null>(null);
  const [question, setQuestion] = useState(() => initialQuestion.slice(0, 1200));
  const [turns, setTurns] = useState<Turn[]>([]);
  const formLanguage = answerLanguage === "auto" ? turns.at(-1)?.language ?? "en" : answerLanguage;
  const [previousChunkId, setPreviousChunkId] = useState<string>();
  const [state, setState] = useState<ChatState>({ status: "idle" });
  const busy = state.status === "checking";
  const reply = state.status === "response" ? state.result : undefined;
  const language = state.status === "response" ? state.language : undefined;
  const educationReply = state.status === "response" ? state : undefined;
  const educationError = state.status === "error" ? state : undefined;

  function insertText(text: string) {
    const next = mergeAacText(question, text);
    if (next.length > 1200) { setIncoming(text); return; }
    setQuestion(next); setIncoming(""); clearStoredAacDraft();
    questionInput.current?.focus();
  }
  const chatCopy = educationCopy[formLanguage];
  // Always open: asking with pictures is a first-class way to ask, not a hidden mode.
  const aacSection = <section id="barta-symbol-input" tabIndex={-1} className={styles.symbolPanel} aria-label={chatCopy.useSymbols} lang={formLanguage}>
    <AACComposer bare initialLanguage={formLanguage} onInsert={insertText} targetLabel={chatCopy.insertQuestion} />
    {storedDraft && <div className={styles.savedDraft}><p>{chatCopy.savedAacDraft}: {storedDraft}</p>
      <div className={styles.helpActions}>
        <button type="button" className="pro-btn pro-btn-secondary" onClick={() => insertText(storedDraft)}>{chatCopy.insertSavedAac}</button>
        <button type="button" className="pro-btn pro-btn-secondary" onClick={clearStoredAacDraft}>{chatCopy.dismissSavedAac}</button>
      </div></div>}
    {incoming && <div role="alert" className={styles.savedDraft}><p>{chatCopy.aacLimit}</p><p className="whitespace-pre-wrap">{incoming}</p></div>}
  </section>;

  useEffect(() => () => {
    pendingRequest.current?.abort();
    pendingRequest.current = null;
  }, []);

  const fillQuestion = useCallback((text: string) => {
    setQuestion(text);
    questionInput.current?.focus();
  }, []);

  function clearConversation() {
    setQuestion("");
    setState({ status: "idle" });
    setTurns([]);
    setPreviousChunkId(undefined);
    questionInput.current?.focus();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (busy || pendingRequest.current || !text) return;

    const previousReply = turns.at(-1)?.result;
    const followUpContext = previousReply?.status === "clarification" ? previousReply.followUpContext : undefined;
    const detected = detectBartaLanguage(text);
    const requestedLanguage = answerLanguage === "auto" ? detected ?? formLanguage : answerLanguage;
    setState({ status: "checking" });
    const controller = new AbortController();
    pendingRequest.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 60_000);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demo
          ? { question: text }
          : {
            question: text,
            language: requestedLanguage,
            retention: { mode: "ephemeral" },
            ...(previousChunkId && { previousChunkId }),
            ...(followUpContext && { followUpContext }),
          }),
      });
      const body: unknown = await response.json();
      if (pendingRequest.current !== controller) return;
      const parsed = bartaAnswerSchema.safeParse(body);
      if (!demo && parsed.success && parsed.data.status === "not_connected") {
        setState({ status: "error", message: parsed.data.message, language: requestedLanguage });
        return;
      }
      if (!demo && !response.ok) {
        setState({ status: "error", language: requestedLanguage,
          message: parsed.success && parsed.data.status !== "grounded"
            ? parsed.data.message : educationCopy[requestedLanguage].failure });
        return;
      }
      if (parsed.success && response.ok) {
        const result = parsed.data;
        const replyText = result.status === "grounded" ? result.answer : result.message;
        if (!demo) {
          // Keep the thread in memory for this tab. Send only the current
          // question, an optional public chunk ID and a fixed follow-up code.
          const questionLanguage = /[\u0980-\u09ff]/u.test(text) ? "bn" : detected === "bn" ? "bn-Latn" : detected;
          setTurns((history) => [...history, { question: text, questionLanguage, result, language: requestedLanguage }]);
          if (result.status !== "grounded" && result.status !== "conversation" && result.status !== "clarification") {
            setPreviousChunkId(undefined);
          }
          if (result.status === "grounded") setPreviousChunkId(result.citations[0].chunkId);
          setQuestion("");
        }
        setState({
          status: "response",
          result,
          language: demo ? getBartaDemoLanguage(replyText) : requestedLanguage,
        });
        return;
      }

      setState({
        status: "error",
        message: demo && !response.ok ? readErrorMessage(body) : educationCopy[demo ? "en" : requestedLanguage].failure,
        language: demo ? "en" : requestedLanguage,
      });
    } catch {
      if (pendingRequest.current !== controller) return;
      setState({
        status: "error",
        message: controller.signal.aborted
          ? educationCopy[demo ? "en" : requestedLanguage].timeout
          : educationCopy[demo ? "en" : requestedLanguage].failure,
        language: demo ? "en" : requestedLanguage,
      });
    } finally {
      window.clearTimeout(timeout);
      if (pendingRequest.current === controller) pendingRequest.current = null;
    }
  }

  if (!demo) {
    return (
      <><NetworkStatus message={educationCopy[formLanguage].offline} /><BartaEducationChat symbolPanel={aacSection} languageChoice={answerLanguage} formLanguage={formLanguage} hasPrefill={Boolean(initialQuestion)}
        question={question} questionInput={questionInput} turns={turns} reply={educationReply} error={educationError} busy={busy}
        onLanguage={setAnswerLanguage}
        onQuestion={setQuestion}
        onDictation={insertText}
        onSelect={fillQuestion} onClear={clearConversation} onSubmit={submit} /></>
    );
  }

  return (
    <section className="max-w-3xl rounded-2xl border border-pro-border bg-pro-elevated p-4 sm:p-6">
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-2" lang="en">
          <label htmlFor="barta-question" className="font-semibold">Your question (Bangla or English)</label>
          <details className="text-pro-muted">
            <summary className="w-fit cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-pro-focus">
              Choose a sample question
            </summary>
            <ul className="mt-2 space-y-1">
              {Object.values(bartaDemoQuestions).flatMap((examples) =>
                (["en", "bn"] as const).map((locale) => (
                  <li key={examples[locale]}>
                    <button type="button" lang={locale}
                      className="min-h-11 rounded px-2 text-start text-pro-primary underline focus-visible:outline-2 focus-visible:outline-pro-focus"
                      disabled={busy} onClick={(event) => {
                        setQuestion(examples[locale]);
                        setState({ status: "idle" });
                        event.currentTarget.form?.querySelector<HTMLTextAreaElement>("#barta-question")?.focus();
                      }}>
                      {examples[locale]}
                    </button>
                  </li>
                )),
              )}
            </ul>
          </details>
          <textarea id="barta-question" ref={questionInput} readOnly={busy}
            className="min-h-32 w-full rounded-xl border border-pro-control-border bg-pro-bg p-3 text-pro-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
            value={question} onChange={(event) => {
              setQuestion(event.currentTarget.value);
              setState({ status: "idle" });
            }}
            maxLength={1200} required />
        </div>
        <button type="submit" className="pro-btn pro-btn-primary w-fit" disabled={busy || !question.trim()} lang="en">
          {busy ? "Checking…" : "Ask PROHOR"}
        </button>
      </form>
      <div role="status" aria-atomic="true">
        {busy && <p lang="en" className="mt-6 text-pro-muted">Checking the demo source…</p>}
        {state.status === "error" && <p lang={state.language} className="mt-6">{state.message}</p>}
        {reply && reply.status !== "grounded" && <p lang={language} className="mt-6">{reply.message}</p>}
        {reply?.status === "grounded" && (
          <div className="mt-6 space-y-3 border-t border-pro-border pt-5">
            <h2 lang="en" className="text-lg font-semibold">Sample answer</h2>
            <p lang={language}>{reply.answer}</p>
            <h3 lang="en" className="font-semibold">Synthetic source</h3>
            <ul className="list-disc space-y-1 ps-5">
              {reply.citations.map((citation) => (
                <li key={citation.chunkId}>{citation.title}. {citation.locator}.</li>
              ))}
            </ul>
            <ul lang={language} className="list-disc space-y-1 ps-5 text-pro-muted">
              {reply.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
