"use client";

import { useState, type FormEvent } from "react";
import { bartaAnswerSchema, type BartaAnswer } from "@/lib/contracts/barta";

type ChatState =
  | { status: "idle" | "checking" }
  | { status: "response"; result: BartaAnswer; language: "bn" | "en" }
  | { status: "error"; message: string };

function readErrorMessage(body: unknown): string {
  return body !== null && typeof body === "object" && "message" in body
    && typeof body.message === "string" && body.message.trim()
    ? body.message
    : "Barta is unavailable. Try again.";
}

export function BartaChatStarter() {
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<ChatState>({ status: "idle" });
  const busy = state.status === "checking";
  const reply = state.status === "response" ? state.result : undefined;
  const language = state.status === "response" ? state.language : undefined;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (busy || !text) return;

    setState({ status: "checking" });
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        setState({ status: "error", message: readErrorMessage(body) });
        return;
      }

      const parsed = bartaAnswerSchema.safeParse(body);
      setState(parsed.success
        ? { status: "response", result: parsed.data, language: /[\u0980-\u09ff]/u.test(text) ? "bn" : "en" }
        : { status: "error", message: "Barta returned an unreadable response. Try again." });
    } catch {
      setState({ status: "error", message: "Barta could not load a response. Try again." });
    }
  }

  return (
    <section className="max-w-3xl rounded-2xl border border-pro-border bg-pro-elevated p-4 sm:p-6">
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="barta-question" className="font-semibold">
            Your question (Bangla or English)
          </label>
          <div id="barta-example" className="text-pro-muted">
            <p>Try a sample:</p>
            <ul className="list-disc ps-5">
              <li>What is on the sample visit form?</li>
              <li lang="bn">নমুনা ফর্মে কী আছে?</li>
            </ul>
          </div>
          <textarea
            id="barta-question"
            aria-describedby="barta-example"
            className="min-h-32 w-full rounded-xl border border-pro-control-border bg-pro-bg p-3 text-pro-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pro-focus"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={1200}
            required
          />
        </div>
        <button type="submit" className="pro-btn pro-btn-primary w-fit" disabled={busy || !question.trim()}>
          {busy ? "Checking…" : "Ask PROHOR"}
        </button>
      </form>

      <div role="status" aria-atomic="true">
        {busy && <p className="mt-6 text-pro-muted">Checking the demo source…</p>}
        {state.status === "error" && <p className="mt-6">{state.message}</p>}
        {reply && reply.status !== "grounded" && <p className="mt-6">{reply.message}</p>}
        {reply?.status === "grounded" && (
          <div className="mt-6 space-y-3 border-t border-pro-border pt-5">
            <h2 className="text-lg font-semibold">Sample answer</h2>
            <p lang={language}>{reply.answer}</p>
            <h3 className="font-semibold">Synthetic source</h3>
            <ul className="list-disc space-y-1 ps-5">
              {reply.citations.map((citation) => (
                <li key={citation.chunkId}>
                  {citation.title}. {citation.locator}.
                </li>
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
