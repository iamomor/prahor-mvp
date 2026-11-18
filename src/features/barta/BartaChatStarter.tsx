"use client";

import { InlineLiveRegion } from "@/components/accessibility/LiveRegion";
import {
    AACComposer,
    AAC_INSERT_EVENT,
    clearStoredAacDraft,
    getStoredAacDraft,
    mergeAacText,
    useAdaptPreferences,
} from "@/features/adapt";
import { ReadAloudButton } from "@/features/adapt/components/ReadAloudButton";
import { bartaAnswerSchema, type BartaAnswer } from "@/lib/contracts/barta";
import { MessageSquareDot, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { BartaEducationChat } from "./BartaEducationChat";
import { educationCopy, type Language } from "./barta-education-copy";
import { detectBartaLanguage } from "./chat-language";
import { bartaDemoQuestions, getBartaDemoLanguage } from "./demo-questions";

type ChatState =
    | { status: "idle" | "checking" }
    | { status: "response"; result: BartaAnswer; language: "bn" | "en" }
    | { status: "error"; message: string; language: "en" | "bn" };

type Turn = { question: string; questionLanguage?: string; result: BartaAnswer; language: Language };

function readErrorMessage(body: unknown): string {
    return body !== null &&
        typeof body === "object" &&
        "message" in body &&
        typeof body.message === "string" &&
        body.message.trim()
        ? body.message
        : "Barta is unavailable. Try again.";
}

function subscribeDraft(callback: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("storage", callback);
    window.addEventListener("prohor-aac-draft-change", callback);
    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener("prohor-aac-draft-change", callback);
    };
}

function getDraftSnapshot(): string | null {
    return getStoredAacDraft();
}

function getServerDraftSnapshot(): string | null {
    return null;
}

export function BartaChatStarter({ mode = "demo" }: { mode?: "demo" | "education" }) {
    const demo = mode === "demo";
    const { prefs } = useAdaptPreferences();
    const [answerLanguage, setAnswerLanguage] = useState<Language | "auto">("auto");
    const questionInput = useRef<HTMLTextAreaElement>(null);
    const [question, setQuestion] = useState("");
    const [turns, setTurns] = useState<Turn[]>([]);
    const formLanguage =
        answerLanguage === "auto"
            ? (turns.at(-1)?.language ?? (prefs.language === "en" ? "en" : "bn"))
            : answerLanguage;
    const [previousChunkId, setPreviousChunkId] = useState<string>();
    const [state, setState] = useState<ChatState>({ status: "idle" });
    const [announcement, setAnnouncement] = useState("");

    // Cross-page draft subscription with zero hydration mismatch
    const storedDraft = useSyncExternalStore(subscribeDraft, getDraftSnapshot, getServerDraftSnapshot);
    const [dismissedDraft, setDismissedDraft] = useState<string | null>(null);
    const pendingDraft = storedDraft && storedDraft !== dismissedDraft ? storedDraft : null;

    // Show inline AAC composer if user prefers AAC, or toggles it open
    const [userAacToggle, setUserAacToggle] = useState<boolean | null>(null);
    const showAacComposer = userAacToggle ?? prefs.communication === "aac";

    /* ── AAC insert listener ─────────────────────────────────────────── */
    useEffect(() => {
        function handleAACInsert(event: Event) {
            const e = event as CustomEvent<{ text: string }>;
            if (!e.detail?.text) return;
            const textToInsert = e.detail.text;
            setQuestion(prev => mergeAacText(prev, textToInsert));
            setAnnouncement("AAC message inserted into your question field. You can review and edit below.");
            questionInput.current?.focus();
        }

        window.addEventListener(AAC_INSERT_EVENT, handleAACInsert);
        return () => window.removeEventListener(AAC_INSERT_EVENT, handleAACInsert);
    }, []);

    function handleDirectAacInsert(text: string) {
        setQuestion(prev => mergeAacText(prev, text));
        setAnnouncement("AAC message inserted into your question field. You can review and edit below.");
        clearStoredAacDraft();
        setDismissedDraft(text);
        questionInput.current?.focus();
    }

    function handleConsumeDraft() {
        if (!pendingDraft) return;
        setQuestion(prev => mergeAacText(prev, pendingDraft));
        const consumed = pendingDraft;
        clearStoredAacDraft();
        setDismissedDraft(consumed);
        setAnnouncement("Saved AAC draft inserted into your question field.");
        questionInput.current?.focus();
    }

    function handleDismissDraft() {
        const dismissed = pendingDraft;
        clearStoredAacDraft();
        if (dismissed) setDismissedDraft(dismissed);
        setAnnouncement("Saved draft dismissed.");
    }

    const busy = state.status === "checking";
    const reply = state.status === "response" ? state.result : undefined;
    const language = state.status === "response" ? state.language : undefined;
    const educationReply = state.status === "response" ? state : undefined;
    const educationError = state.status === "error" ? state : undefined;

    function fillQuestion(text: string) {
        setQuestion(text);
        questionInput.current?.focus();
    }

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
        if (busy || !text) return;

        const detected = detectBartaLanguage(text);
        const requestedLanguage = answerLanguage === "auto" ? (detected ?? formLanguage) : answerLanguage;
        setState({ status: "checking" });
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 60_000);
        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                signal: controller.signal,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    demo
                        ? { question: text }
                        : {
                              question: text,
                              language: requestedLanguage,
                              retention: { mode: "ephemeral" },
                              ...(previousChunkId && { previousChunkId }),
                          },
                ),
            });
            const body: unknown = await response.json();
            const parsed = bartaAnswerSchema.safeParse(body);
            if (!demo && parsed.success && parsed.data.status === "not_connected") {
                setState({ status: "error", message: parsed.data.message, language: requestedLanguage });
                return;
            }
            if (parsed.success && (response.ok || parsed.data.status !== "grounded")) {
                const result = parsed.data;
                const replyText = result.status === "grounded" ? result.answer : result.message;
                if (!demo) {
                    // Keep the thread in memory for this tab. Send only the current
                    // question and an optional public chunk ID to the API.
                    const questionLanguage = /[\u0980-\u09ff]/u.test(text)
                        ? "bn"
                        : detected === "bn"
                          ? "bn-Latn"
                          : detected;
                    setTurns(history => [
                        ...history,
                        { question: text, questionLanguage, result, language: requestedLanguage },
                    ]);
                    if (
                        result.status !== "grounded" &&
                        result.status !== "conversation" &&
                        result.status !== "clarification"
                    ) {
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
                message: readErrorMessage(body) !== "Barta is unavailable. Try again."
                    ? readErrorMessage(body)
                    : educationCopy[demo ? "en" : requestedLanguage].failure,
                language: demo ? "en" : requestedLanguage,
            });
        } catch {
            setState({
                status: "error",
                message: controller.signal.aborted
                    ? educationCopy[demo ? "en" : requestedLanguage].timeout
                    : educationCopy[demo ? "en" : requestedLanguage].failure,
                language: demo ? "en" : requestedLanguage,
            });
        } finally {
            window.clearTimeout(timeout);
        }
    }

    const aacSection = (
        <>
            {/* Saved draft recovery banner */}
            {pendingDraft && (
                <div
                    role="region"
                    aria-label="Pending AAC draft notice"
                    className="mb-4 rounded-card border border-pro-primary bg-pro-surface p-3.5 space-y-2"
                >
                    <div className="flex items-start gap-2">
                        <Sparkles size={18} className="text-pro-primary shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-pro-text">
                                You composed a message using AAC symbols:
                            </p>
                            <p className="mt-1 text-xs text-pro-text bg-pro-elevated p-2 rounded border border-pro-border">
                                &ldquo;{pendingDraft}&rdquo;
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1 pl-6">
                        <button
                            type="button"
                            onClick={handleConsumeDraft}
                            className="pro-btn pro-btn-primary !min-h-9 !px-3 text-xs"
                        >
                            Insert into question field
                        </button>
                        <button
                            type="button"
                            onClick={handleDismissDraft}
                            className="pro-btn pro-btn-secondary !min-h-9 !px-3 text-xs"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* AAC Composer Toggle */}
            <div className="mb-4 space-y-3">
                <button
                    type="button"
                    onClick={() => setUserAacToggle(!showAacComposer)}
                    aria-expanded={showAacComposer}
                    className={[
                        "inline-flex min-h-11 items-center gap-2 rounded-pill px-4 text-xs font-semibold transition-all",
                        "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pro-focus",
                        showAacComposer
                            ? "bg-pro-primary text-pro-on-primary shadow-xs"
                            : "border border-pro-control-border bg-pro-elevated text-pro-text hover:bg-pro-surface",
                    ].join(" ")}
                >
                    <MessageSquareDot size={16} aria-hidden="true" />
                    <span>
                        {showAacComposer
                            ? prefs.language === "bn"
                                ? "প্রতীক বোর্ড লুকান"
                                : "Hide AAC Symbol Board"
                            : prefs.language === "bn"
                              ? "প্রতীক বোর্ড ব্যবহার করুন"
                              : "Use AAC Symbol Board"}
                    </span>
                </button>

                {showAacComposer && (
                    <div className="rounded-card border border-pro-border bg-pro-elevated p-3 sm:p-4">
                        <AACComposer
                            targetLabel="Insert into question / প্রশ্নে যুক্ত করুন"
                            onInsert={handleDirectAacInsert}
                        />
                    </div>
                )}
            </div>

            <InlineLiveRegion message={announcement} />
        </>
    );

    if (!demo) {
        return (
            <div className="space-y-4">
                {aacSection}
                <BartaEducationChat
                    languageChoice={answerLanguage}
                    formLanguage={formLanguage}
                    question={question}
                    questionInput={questionInput}
                    turns={turns}
                    reply={educationReply}
                    error={educationError}
                    busy={busy}
                    onLanguage={setAnswerLanguage}
                    onQuestion={setQuestion}
                    onDictation={text => {
                        setQuestion(draft => [draft.trimEnd(), text].filter(Boolean).join(" ").slice(0, 1200));
                        questionInput.current?.focus();
                    }}
                    onSelect={fillQuestion}
                    onClear={clearConversation}
                    onSubmit={submit}
                />
            </div>
        );
    }

    return (
        <section className="max-w-3xl rounded-2xl border border-pro-border bg-pro-elevated p-4 sm:p-6">
            {aacSection}
            <form onSubmit={submit} className="grid gap-4">
                <div className="grid gap-2" lang="en">
                    <label htmlFor="barta-question" className="font-semibold">
                        Your question (Bangla or English)
                    </label>
                    <details className="text-pro-muted">
                        <summary className="w-fit cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-pro-focus">
                            Choose a sample question
                        </summary>
                        <ul className="mt-2 space-y-1">
                            {Object.values(bartaDemoQuestions).flatMap(examples =>
                                (["en", "bn"] as const).map(locale => (
                                    <li key={examples[locale]}>
                                        <button
                                            type="button"
                                            lang={locale}
                                            className="min-h-11 rounded px-2 text-start text-pro-primary underline focus-visible:outline-2 focus-visible:outline-pro-focus"
                                            disabled={busy}
                                            onClick={event => {
                                                setQuestion(examples[locale]);
                                                setState({ status: "idle" });
                                                event.currentTarget.form
                                                    ?.querySelector<HTMLTextAreaElement>("#barta-question")
                                                    ?.focus();
                                            }}
                                        >
                                            {examples[locale]}
                                        </button>
                                    </li>
                                )),
                            )}
                        </ul>
                    </details>
                    <textarea
                        id="barta-question"
                        ref={questionInput}
                        readOnly={busy}
                        className="min-h-32 w-full rounded-xl border border-pro-control-border bg-pro-bg p-3 text-pro-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
                        value={question}
                        onChange={event => {
                            setQuestion(event.currentTarget.value);
                            setState({ status: "idle" });
                        }}
                        maxLength={1200}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="pro-btn pro-btn-primary w-fit"
                    disabled={busy || !question.trim()}
                    lang="en"
                >
                    {busy ? "Checking…" : "Ask PROHOR"}
                </button>
            </form>
            <div role="status" aria-atomic="true">
                {busy && (
                    <p lang="en" className="mt-6 text-pro-muted">
                        Checking the demo source…
                    </p>
                )}
                {state.status === "error" && (
                    <p lang={state.language} className="mt-6">
                        {state.message}
                    </p>
                )}
                {reply && reply.status !== "grounded" && (
                    <p lang={language} className="mt-6">
                        {reply.message}
                    </p>
                )}
                {reply?.status === "grounded" && (
                    <div className="mt-6 space-y-3 border-t border-pro-border pt-5">
                        <div className="flex items-center justify-between gap-2">
                            <h2 lang="en" className="text-lg font-semibold">
                                Sample answer
                            </h2>
                            <ReadAloudButton text={reply.answer} language={language ?? "en"} />
                        </div>
                        <p lang={language}>{reply.answer}</p>
                        <h3 lang="en" className="font-semibold">
                            Synthetic source
                        </h3>
                        <ul className="list-disc space-y-1 ps-5">
                            {reply.citations.map(citation => (
                                <li key={citation.chunkId}>
                                    {citation.title}. {citation.locator}.
                                </li>
                            ))}
                        </ul>
                        <ul lang={language} className="list-disc space-y-1 ps-5 text-pro-muted">
                            {reply.limitations.map(limitation => (
                                <li key={limitation}>{limitation}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}
