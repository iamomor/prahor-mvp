"use client";
import { useEffect, useId, useRef, useState } from "react";
import { transcribeSpeech, type SpeechLanguage, type SpeechSession } from "./speech-service";
import { parseSpokenFields } from "./speech-parser";
import { ManualMedicalEntry } from "./ManualMedicalEntry";
import { normalizeReport } from "./report-normalization";
import type { ExtractedReport, ExtractedReportField } from "./types";
export function VoiceMedicalEntry({ onDraft, active = true }: { active?: boolean; onDraft: (report: ExtractedReport) => void }) {
  const id = useId();
  const [language, setLanguage] = useState<SpeechLanguage>("en-US"), [allowRemote, setAllowRemote] = useState(false);
  const [listening, setListening] = useState(false), [transcript, setTranscript] = useState(""), [editable, setEditable] = useState<string | null>(null);
  const [status, setStatus] = useState("Microphone off. Type a transcript below or choose Start speech input."), [error, setError] = useState("");
  const pending = useRef<AbortController | null>(null);
  const session = useRef<SpeechSession | null>(null), generation = useRef(0);
  useEffect(() => () => { generation.current++; pending.current?.abort(); session.current?.cancel(); }, []);
  useEffect(() => { if (!active) { generation.current++; pending.current?.abort(); session.current?.cancel(); void Promise.resolve().then(() => setListening(false)); } }, [active]);
  async function start() {
    const current = ++generation.current;
    pending.current = new AbortController(); session.current = null;
    setListening(true); setError(""); setStatus("Checking speech support / requesting microphone access…");
    try {
      const active = await transcribeSpeech({ language, allowRemote, signal: pending.current.signal,
        onText: (text) => { if (current === generation.current) { setTranscript(text); setStatus("Transcript received. Check every word and number before creating an editable draft."); } },
        onError: (message) => { if (current === generation.current) { setError(message); setListening(false); } },
        onEnd: () => { if (current === generation.current) setListening(false); },
      });
      if (current !== generation.current) { active.cancel(); return; }
      session.current = active; setStatus("Listening. Stop when finished; nothing is saved automatically.");
    } catch (problem) { if (current === generation.current) { setListening(false); setError(problem instanceof Error ? problem.message : "Speech unavailable. Type your information."); } }
  }
  function createDraft() {
    const candidates = parseSpokenFields(transcript);
    if (candidates.length === 1) { setEditable(transcript); return; }
    const fields = candidates.map((field, index): ExtractedReportField => ({ label: "", value: "", unit: "", destination: "", ...field, id: "voice-" + (index + 1), reviewStatus: "pending" }));
    onDraft(normalizeReport({ id: crypto.randomUUID(), name: "কথা থেকে লেখা · Voice draft", source: "self_reported", inputMethod: "voice", status: "needs_review", observedAt: "", transcript, fields }));
  }
  return <section className="grid min-w-0 gap-4 rounded-card border border-pro-border bg-pro-elevated p-4 sm:p-6" aria-labelledby={`${id}-heading`}>
    <h2 id={`${id}-heading`} className="text-2xl font-semibold">Speak Your Health Information — <span lang="bn">কথা বলে তথ্য দিন</span></h2>
    <p>Speech recognition can use a browser-managed external service. Do not speak real patient details during development. No Azure or Gemini integration is active.</p>
    <label htmlFor={`${id}-language`} className="font-semibold">Speech language</label><select id={`${id}-language`} value={language} onChange={(event) => setLanguage(event.target.value as SpeechLanguage)} disabled={listening} className="rounded-field border border-pro-control-border bg-pro-bg p-3"><option value="en-US">English</option><option value="bn-BD">বাংলা (বাংলাদেশ)</option></select>
    <label className="flex items-start gap-3 rounded-field border border-pro-control-border bg-pro-surface p-4"><input className="mt-1 size-5 shrink-0" type="checkbox" checked={allowRemote} onChange={(event) => setAllowRemote(event.target.checked)} disabled={listening} />I allow browser-managed external speech processing if on-device recognition is unavailable. Audio may leave this device; PROHOR does not control the browser provider. Leave unchecked for local-only attempts.</label>
    <div className="flex flex-wrap gap-3"><button type="button" disabled={listening} onClick={() => void start()} className="min-h-12 rounded-control border border-pro-primary bg-pro-primary p-3 font-semibold text-pro-on-primary disabled:opacity-60">Start speech input</button><button type="button" disabled={!listening} onClick={() => { if (session.current) session.current.stop(); else pending.current?.abort(); setListening(false); setStatus("Microphone stopped. Review any received transcript."); }} className="min-h-12 rounded-control border border-pro-primary p-3 text-pro-primary disabled:opacity-60">Stop speech input</button></div>
    <p role="status">{status}</p><p role="alert" className="text-pro-danger">{error}</p>
    <label htmlFor={`${id}-transcript`} className="font-semibold">Transcript — speech or manual fallback</label><textarea id={`${id}-transcript`} rows={4} value={transcript} onChange={(event) => setTranscript(event.target.value)} className="w-full min-w-0 rounded-field border border-pro-control-border bg-pro-bg p-3" />
    <p>Ambiguous words and spoken Bangla numbers are not guessed. The complete transcript remains visible; correct all structured fields and select the record yourself. A measurement unit is never inferred.</p>
    <button type="button" disabled={!transcript.trim() || listening} onClick={createDraft} className="min-h-12 rounded-control border border-pro-primary bg-pro-primary p-3 font-semibold text-pro-on-primary disabled:opacity-60">Create editable speech draft</button>
    {editable && <ManualMedicalEntry key={editable} method="voice" sourceText={editable} initial={parseSpokenFields(editable)[0]} onDraft={onDraft} />}
  </section>;
}



