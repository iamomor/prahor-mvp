
import { ArrowRight, ArrowUp, ArrowUpRight, BookOpen, ChevronDown, HeartHandshake, LayoutGrid, Lock, Mic, ShieldCheck, Volume2, VolumeX } from "lucide-react";

import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import type { BartaAnswer } from "@/lib/contracts/barta";
import { educationCopy, type Language } from "./barta-education-copy";
import { educationTopics, type EducationTopic } from "./education-topics";
import { detectBartaLanguage } from "./chat-language";
import { buildBartaSpeechText, getBartaSpokenGuide } from "./barta-spoken-text";
import { BartaAudioFile } from "./BartaAudioFile";
import { BartaLearningResources } from "./BartaLearningResources";
import { useBartaAudio } from "./use-barta-audio";
import { useBartaReplyAudio } from "./use-barta-reply-audio";
import styles from "./barta-education.module.css";
import { useHydrated } from "@/lib/use-hydrated";
import { saveVisitQuestion, visitQuestionsHref } from "@/features/shared/visit-questions";

type Turn = { question: string; questionLanguage?: string; result: BartaAnswer; language: Language };
type Reply = { result: BartaAnswer; language: Language };

const topicGroups = [
  { name: "pregnancy", topics: ["anc", "ancVisits", "nutrition"] },
  { name: "afterBirth", topics: ["postnatal", "breastfeeding", "newborn"] },
] as const satisfies readonly { name: "pregnancy" | "afterBirth"; topics: readonly EducationTopic[] }[];

const additionalTopics = [
  "pregnancyBasics", "balancedMeals", "warningSigns", "maternalHealth", "mentalWellbeing", "birthPlan",
  "firstCheckup", "ultrasound", "foodSafety", "morningSickness",
  "pregnancyTest", "ironFolate", "fetalMovement",
  "ancCard", "bloodPressureCheck", "exercise", "birthCompanion", "breastfeedingPosition", "milkSupply", "glucoseCheck",
  "babySleep", "babyBath", "cordCare", "diaper", "solidFood", "babyPlay", "homeSafety", "babyWater",
  "feedingAtWork", "babyCrying", "postnatalVisits", "everydayWellbeing", "babyHygiene",
  "pregnancySleep", "pregnancyHeartburn", "pregnancyBackache", "pregnancyTravel", "pregnancyConstipation",
] as const satisfies readonly EducationTopic[];


const QuestionOption = memo(function QuestionOption({ prompt, onSelect, disabled }: {
  prompt: string;
  onSelect: (question: string) => void;
  disabled: boolean;
}) {
  return (
    <button type="button" className={styles.option} disabled={disabled} onClick={() => onSelect(prompt)}>
      <span>{prompt}</span>
      <ArrowRight size={17} aria-hidden="true" />
    </button>
  );
});

function shortPublisher(publisher: string, locale: Language): string {
  switch (publisher) {
    case "World Health Organization": return locale === "bn" ? "বিশ্ব স্বাস্থ্য সংস্থা" : "WHO";
    case "Directorate General of Health Services, Bangladesh": return locale === "bn" ? "স্বাস্থ্য অধিদপ্তর" : "DGHS Bangladesh";
    default: return publisher;
  }
}

function SpeakerSwitch({ enabled, locale, disabled, onToggle }: {
  enabled: boolean; locale: Language; disabled: boolean; onToggle: () => void;
}) {
  const copy = educationCopy[locale];
  return (
    <button type="button" role="switch" aria-checked={enabled} className={styles.read}
      lang={locale} disabled={disabled} onClick={onToggle}>
      {enabled ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
      {copy.speaker} <span aria-hidden="true">{enabled ? copy.speakerOn : copy.speakerOff}</span>
    </button>
  );
}

function isUrgent(result: BartaAnswer) {
  return result.status === "abstained" && (result.reason === "urgent_care" || result.reason === "crisis_support");
}

const Answer = memo(function Answer({ result, locale, question, turnId, showOptions, onSelect, busy, speakerEnabled, speakerDisabled, onToggleSpeaker }: {
  result: BartaAnswer;
  locale: Language;
  question?: string;
  turnId: string;
  showOptions: boolean;
  onSelect: (question: string) => void;
  busy: boolean;
  speakerEnabled: boolean;
  speakerDisabled: boolean;
  onToggleSpeaker: () => void;
}) {
  const ready = useHydrated();
  const copy = educationCopy[locale];
  const [saveStatus, setSaveStatus] = useState<ReturnType<typeof saveVisitQuestion>>();
  const urgent = isUrgent(result);
  const careHandoff = urgent || (result.status === "abstained"
    && (result.reason === "outside_education_scope" || result.reason === "mental_health_support"));
  const optionHeading = result.status === "grounded" ? copy.followUp : copy.clarify;
  const options = showOptions
    ? result.status === "clarification" || result.status === "abstained" ? (result.suggestions ?? [])
      : result.status === "grounded" && result.followUp ? [result.followUp] : []
    : [];

  return (
    <div className={styles.answer} lang={locale} data-urgent={urgent || undefined}>
      <header className={styles.answerHeading}>
        <span className={styles.mark}><HeartHandshake size={18} aria-hidden="true" /></span>
        <strong lang={locale === "bn" ? "bn" : "en"}>{locale === "bn" ? "বার্তা" : "Barta"}</strong>
        {urgent && <strong className={styles.urgentLabel}>{copy.urgent}</strong>}
        <SpeakerSwitch enabled={speakerEnabled} locale={locale} disabled={speakerDisabled} onToggle={onToggleSpeaker} />
      </header>
      {result.status === "grounded" ? (
        <>
          {result.claims ? result.citations.map((citation, index) => {
            const claims = result.claims?.filter((claim) => claim.chunkId === citation.chunkId);
            if (!claims?.length) return null;
            const number = index + 1;
            return (
              <div key={citation.chunkId} className={styles.answerBody}>
                {claims.map((claim, claimIndex) => (
                  <p key={claimIndex} className={styles.answerText}>
                    {claim.text}{" "}
                    {claimIndex === claims.length - 1 && (
                      <a className={styles.marker} href={`#${turnId}-source-${number}`}
                        aria-label={`${copy.source} ${number}`}>[{number}]</a>
                    )}
                  </p>
                ))}
              </div>
            );
          }) : <p className={styles.answerText}>{result.answer}</p>}
          <section className={styles.sources} aria-label={copy.sources}>
            <h3><BookOpen size={16} aria-hidden="true" /> {copy.sources}</h3>
            <ul>
              {result.citations.map((citation, index) => (
                <li key={citation.chunkId} id={`${turnId}-source-${index + 1}`}>
                  <a className={styles.sourceLink} href={citation.url}
                    aria-describedby={`${turnId}-source-${index + 1}-title`}>
                    <span className={styles.sourceNumber} aria-hidden="true">{index + 1}</span>
                    <span>{shortPublisher(citation.publisher, locale)}
                      {citation.publicationYear ? ` · ${citation.publicationYear}` : ""}
                    </span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                  <details className={styles.citationDetails}>
                    <summary>{copy.referenceDetails}</summary>
                    <p lang="en" id={`${turnId}-source-${index + 1}-title`}>{citation.title}</p>
                    <p>{citation.locator}{citation.page ? ` · ${copy.page} ${citation.page}` : ""}</p>
                    <p>{copy.sourceVersion} <bdi>{citation.sourceVersion}</bdi></p>
                  </details>
                </li>
              ))}
            </ul>
          </section>
          <BartaLearningResources citations={result.citations} locale={locale} />
        </>
      ) : <p className={styles.answerText} role={urgent && showOptions ? "alert" : undefined}>{result.message}</p>}
      {careHandoff && (
        <div className="mt-3 flex flex-wrap gap-2">
          {urgent && <a href="tel:999" className={styles.read}>{copy.callEmergency}</a>}
          <Link href="/find-care" className={styles.read}>{copy.findCare}</Link>
        </div>
      )}
      {result.status === "grounded" && question && (
        <div className="mt-3 space-y-2">
          <p id={`${turnId}-visit-privacy`}>{copy.visitQuestionPrivacy}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={styles.read} disabled={!ready}
              aria-describedby={`${turnId}-visit-privacy`}
              onClick={() => setSaveStatus(saveVisitQuestion(question))}>
              {copy.saveVisitQuestion}
            </button>
            {(saveStatus === "saved" || saveStatus === "full") && (
              <Link href={visitQuestionsHref} className={styles.read}>{copy.reviewVisitQuestions}</Link>
            )}
          </div>
          <p role="status">{saveStatus && copy.visitQuestionStatus[saveStatus]}</p>
        </div>
      )}
      {options.length > 0 && (
        <section className={styles.next} aria-label={optionHeading}>
          <h3>{optionHeading}</h3>
          <ul>
            {options.map((prompt) => <li key={prompt}><QuestionOption prompt={prompt} onSelect={onSelect} disabled={!ready || busy} /></li>)}
          </ul>
        </section>
      )}
    </div>
  );
});

export function BartaEducationChat({
  languageChoice, formLanguage, question, questionInput, turns, reply, error, busy, hasPrefill,
  onLanguage, onQuestion, onDictation, symbolPanel, onSelect, onClear, onSubmit,
}: {
  languageChoice: Language | "auto";
  formLanguage: Language;
  hasPrefill: boolean;
  question: string;
  questionInput: RefObject<HTMLTextAreaElement | null>;
  turns: Turn[];
  reply?: Reply;
  error?: { message: string; language: Language };
  busy: boolean;
  onLanguage: (language: Language | "auto") => void;
  onQuestion: (question: string) => void;
  onDictation: (question: string) => void;
  /** The AAC symbol builder, shown inside the composer card. */
  symbolPanel?: ReactNode;
  onSelect: (question: string) => void;
  onClear: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const ready = useHydrated();
  const copy = educationCopy[formLanguage];
  const audio = useBartaAudio();
  const { play: playAudio, stopSpeaking } = audio;
  const { start: startReplyAudio, stop: stopReplyAudio, blocked, retry } = useBartaReplyAudio();
  const [speakerEnabled, setSpeakerEnabled] = useState(false);
  const delivered = useRef<BartaAnswer | string | undefined>(undefined);
  const spokenGuide = useMemo(() => getBartaSpokenGuide(formLanguage), [formLanguage]);
  const [voiceLanguage, setVoiceLanguage] = useState<Language | "auto">("auto");
  const micLanguage = voiceLanguage === "auto" ? detectBartaLanguage(question) ?? "en" : voiceLanguage;
  const layout = useRef<HTMLDivElement>(null);
  const transient = reply && reply.result !== turns.at(-1)?.result ? reply : undefined;
  const latest = useRef<HTMLDivElement>(null);
  const playbackMessage = (id: string) => audio.notice?.replyId === id
    ? educationCopy[audio.notice.language][audio.notice.kind] : undefined;
  const hasThread = turns.length > 0 || reply || busy || error;

  useEffect(() => {
    if (reply || error) latest.current?.scrollIntoView({ block: "nearest" });
  }, [reply, error]);

  const pauseAudio = useCallback((except?: HTMLAudioElement) => {
    layout.current?.querySelectorAll("audio").forEach((player) => {
      if (player !== except && !player.paused) player.pause();
    });
  }, []);

  const readAnswer = useCallback((id: string, text: string, language: Language) => {
    pauseAudio();
    playAudio(id, text, language);
  }, [playAudio, pauseAudio]);

  const readReply = useCallback(({ result, language }: Reply) => {
    const text = (result.status === "not_connected" ? undefined : result.audioText) ?? buildBartaSpeechText(result, language);
    const ticket = result.status === "not_connected" ? undefined : result.audioTicket;
    const clipUrl = result.status === "not_connected" ? undefined : result.audioClipUrl;
    pauseAudio();
    stopSpeaking();
    if (ticket || clipUrl) {
      startReplyAudio({ text, language, ticket, clipUrl }, () => playAudio("barta-reply", text, language));
    } else {
      stopReplyAudio();
      playAudio("barta-reply", text, language);
    }
  }, [pauseAudio, stopSpeaking, startReplyAudio, stopReplyAudio, playAudio]);

  useEffect(() => {
    if (!speakerEnabled || audio.listening) return;
    const next = reply?.result ?? error?.message;
    if (!next || delivered.current === next) return;
    if (audio.speaking === "barta-question" && !(reply && isUrgent(reply.result))) return;
    delivered.current = next;
    if (reply) readReply(reply);
    else if (error) playAudio("barta-reply", error.message, error.language);
  }, [speakerEnabled, audio.listening, audio.speaking, reply, error, readReply, playAudio]);

  function toggleSpeaker(selected = busy ? undefined : reply ?? turns.at(-1)) {
    setSpeakerEnabled(!speakerEnabled);
    if (speakerEnabled) {
      stopReplyAudio();
      stopSpeaking();
      pauseAudio();
    } else if (selected) {
      delivered.current = reply?.result ?? error?.message;
      readReply(selected);
    } else if (error) {
      delivered.current = error.message;
      playAudio("barta-reply", error.message, error.language);
    }
  }

  return (
    <div ref={layout} className={styles.layout} onPlayCapture={(event) => {
      if (!(event.target instanceof HTMLAudioElement)) return;
      stopReplyAudio();
      stopSpeaking();
      pauseAudio(event.target);
    }}>
      <section className={styles.chat} aria-label={formLanguage === "bn" ? "বার্তার কথোপকথন" : "Barta conversation"}>


        <div className={styles.speakerBar}>
          <SpeakerSwitch enabled={speakerEnabled} locale={formLanguage}
            disabled={!ready || (!speakerEnabled && audio.listening)} onToggle={() => toggleSpeaker()} />
          <p lang={formLanguage}>{copy.speakerHint}</p>
        </div>

        {hasThread ? (

          <div className={styles.thread}>
            {turns.map((turn, index) => (
              <div key={index} className={styles.turn} ref={!transient && !error && index === turns.length - 1 ? latest : undefined}>
                <div className={styles.question} lang={turn.language}>
                  <span>{educationCopy[turn.language].you}</span>
                  <p lang={turn.questionLanguage}>{turn.question}</p>
                </div>
                <Answer result={turn.result} locale={turn.language} question={turn.question} turnId={`barta-turn-${index}`}
                  showOptions={reply?.result === turn.result} onSelect={onSelect} busy={busy || audio.listening}
                  speakerEnabled={speakerEnabled} speakerDisabled={!ready || (!speakerEnabled && (busy || audio.listening))}
                  onToggleSpeaker={() => toggleSpeaker(turn)} />
              </div>
            ))}
            {transient && <div ref={latest}>
              <Answer result={transient.result} locale={transient.language} turnId="barta-current"
                showOptions onSelect={onSelect} busy={busy || audio.listening}
                speakerEnabled={speakerEnabled} speakerDisabled={!ready || (!speakerEnabled && (busy || audio.listening))}
                onToggleSpeaker={() => toggleSpeaker(transient)} />
            </div>}
            {speakerEnabled && blocked && (
              <div className={styles.playbackNotice} lang={blocked}>
                <p role="status">{educationCopy[blocked].speakerBlocked}</p>
                <button type="button" className={styles.read} onClick={retry}>{educationCopy[blocked].playAudio}</button>
              </div>
            )}
            {speakerEnabled && audio.notice?.replyId === "barta-question" && (
              <p role="status" className={styles.playbackNotice} lang={audio.notice.language}>
                {educationCopy[audio.notice.language].questionVoiceUnavailable}
              </p>
            )}
            {speakerEnabled && playbackMessage("barta-reply") && (
              <p role="status" className={styles.playbackNotice} lang={audio.notice?.language}>{playbackMessage("barta-reply")}</p>
            )}
            {busy && <p className={styles.notice} lang={formLanguage}>{copy.checking}</p>}
            {error && <div ref={latest}><p className={styles.notice} lang={error.language} role="alert">{error.message}</p></div>}
          </div>
        ) : (
          <div className={styles.welcome} lang={formLanguage}>
            <div className={styles.welcomeHead}>
              <span className={styles.avatar} aria-hidden="true"><HeartHandshake size={22} /></span>
              <div>
                <h2>{formLanguage === "bn" ? "হ্যালো, আমি বার্তা" : "Hi, I’m Barta"}</h2>
                <p>{formLanguage === "bn"
                  ? "গর্ভাবস্থা, প্রসব বা নবজাতকের যত্ন নিয়ে নিজের ভাষায় প্রশ্ন করুন। প্রতিটি উত্তরের সূত্র দেখতে পাবেন।"
                  : "Ask about pregnancy, birth or caring for your newborn, in your own words. Every answer shows where it comes from."}</p>
              </div>
            </div>
          </div>
        )}

        <p className={styles.announce} role="status" lang={reply?.language ?? formLanguage}>
          {busy ? copy.checking : reply && (reply.result.status !== "abstained" || !["urgent_care", "crisis_support"].includes(reply.result.reason))
            ? educationCopy[reply.language].replyReady : ""}
        </p>

        <div className={styles.composerCard}>
          <form className={styles.form} lang={formLanguage} onSubmit={(event) => {
            if (audio.listening) { event.preventDefault(); return; }
            if (speakerEnabled && !busy && question.trim()) {
            delivered.current = undefined;
            stopReplyAudio();
            pauseAudio();
            const submittedText = question.trim();
            const language = /[\u0980-\u09ff]/u.test(submittedText) ? "bn" : "en";
            playAudio("barta-question", submittedText, language, true);
          }
          onSubmit(event);
          }}>
            <div className={styles.formHead}>
              <label htmlFor="barta-question">{copy.question}</label>
              <span>{formLanguage === "bn" ? "বাংলা বা ইংরেজিতে" : "Bangla or English"}</span>
            </div>
            {hasPrefill && <p className="text-sm text-pro-muted">{copy.prefillExplanation}</p>}
            <div className={styles.composer} data-listening={audio.listening || undefined}>
              <textarea id="barta-question" ref={questionInput} value={question}
                placeholder={copy.placeholder} aria-describedby="barta-privacy"
                onChange={(event) => onQuestion(event.currentTarget.value)} readOnly={!ready || busy} maxLength={1200} required />
            {audio.listening && (
              <div className={styles.dictationPreview} role="region" aria-label={copy.liveTranscript}>
                <strong>{copy.liveTranscript}</strong>
                <p lang={audio.transcript?.language ?? micLanguage}>
                  {audio.transcript?.final && <span>{audio.transcript.final} </span>}
                  {audio.transcript?.interim && <mark>{audio.transcript.interim}</mark>}
                  {!audio.transcript?.final && !audio.transcript?.interim && (
                    <span lang={formLanguage}>{copy.transcriptWaiting}</span>
                  )}
                </p>
              </div>
            )}
              <div className={styles.composerBar}>
                {symbolPanel && (
                  <a href="#barta-symbol-input" className={styles.tool}>
                    <LayoutGrid size={18} aria-hidden="true" />
                    {copy.useSymbols}
                  </a>
                )}
                <button type="button" className={styles.tool} disabled={!ready || busy}
                  aria-describedby="barta-voice-hint barta-voice-more" data-active={audio.listening || undefined}
                  onClick={() => {
                    pauseAudio();
                    audio.dictate(micLanguage, formLanguage, (transcript) => {
                      onDictation(transcript);
                    });
                  }}>
                  {audio.listening
                    ? <span className={styles.liveDot} aria-hidden="true" />
                    : <Mic size={18} aria-hidden="true" />}
                  {audio.listening ? copy.stopListening : copy.startListening}
                </button>
                <div className={styles.sendGroup}>
                <span className={styles.counter} data-near={question.length > 1100 || undefined}>
                  <bdi>{question.length}</bdi>/1200
                </span>
                <button type="submit" className={styles.send}
                  disabled={!ready || busy || audio.listening || !question.trim()}>
                  {copy.submit}<ArrowUp size={18} aria-hidden="true" />
                </button>
                </div>
              </div>
            </div>
            <div className={styles.chatPreferences}>

              <label className={styles.language}>
                <span>{copy.voiceLanguage}</span>
                <select value={voiceLanguage} disabled={!ready || busy || audio.listening} aria-describedby="barta-voice-hint"
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    if (value === "auto" || value === "bn" || value === "en") setVoiceLanguage(value);
                  }}>
                  <option value="auto">{copy.voiceAuto}</option>
                  <option value="bn" lang="bn">বাংলা</option>
                  <option value="en" lang="en">English</option>
                </select>
              </label>
              <label className={styles.language}>
                <span>{copy.answerLanguage}</span>
                <select value={languageChoice} disabled={!ready || busy || audio.listening}
                  onChange={(event) => {
                    const selected = event.currentTarget.value;
                    onLanguage(selected === "en" || selected === "auto" ? selected : "bn");
                  }}>
                  <option value="auto">{formLanguage === "bn" ? "স্বয়ংক্রিয়" : "Auto"}</option>
                  <option value="bn" lang="bn">বাংলা</option>
                  <option value="en">English</option>
                </select>
              </label>
              {(turns.length > 0 || reply || error) && (
                <button type="button" className={styles.clear} disabled={!ready || busy} onClick={() => { audio.resetAudio(); onClear(); }} lang={formLanguage}>{copy.clear}</button>
              )}
            </div>

            <div className={styles.hints}>
              <p id="barta-privacy"><Lock size={16} aria-hidden="true" /><span>{copy.privacy}</span></p>
              <p id="barta-voice-hint"><Mic size={16} aria-hidden="true" /><span>
                {voiceLanguage === "auto"
                  ? <>{copy.voiceAutoHint} <span lang={micLanguage}>{micLanguage === "bn" ? "বাংলা" : "English"}</span>.</>
                  : copy.voicePrivacy}
              </span></p>
              <details className={styles.voiceMore}>
                <summary>{formLanguage === "bn" ? "ভয়েস ইনপুট কীভাবে কাজ করে" : "How voice input works"}<ChevronDown size={16} aria-hidden="true" /></summary>
                <p id="barta-voice-more">
                  {copy.voicePrivacy}{" "}
                  {formLanguage === "bn"
                    ? "মাইক্রোফোনের অনুমতি লাগবে। মাইক কাজ না করলে এখানেই টাইপ করুন।"
                    : "Microphone permission is required. If dictation is unavailable, type in this same field."}
                </p>
              </details>
            </div>
            <p role="status" lang={audio.notice?.language ?? formLanguage} className={styles.audioStatus}>
              {audio.notice && !audio.notice.replyId ? educationCopy[audio.notice.language][audio.notice.kind] : audio.listening ? copy.listening : ""}
            </p>
          </form>
          {symbolPanel}
        </div>

      </section>

      <aside className={styles.sidebar} lang={formLanguage}>
        <div className={styles.topicPanel}>
          <h2><BookOpen size={20} aria-hidden="true" /> {copy.topics}</h2>
          {topicGroups.map((group) => (
            <section key={group.name} className={styles.topicGroup}>
              <h3>{copy[group.name]}</h3>
              <ul>
                {group.topics.map((topic) => (
                  <li key={topic}><QuestionOption prompt={educationTopics[topic][formLanguage]} onSelect={onSelect} disabled={!ready || busy || audio.listening} /></li>
                ))}
              </ul>
            </section>
          ))}
          <details className={styles.moreTopics}>
            <summary>{formLanguage === "bn" ? "মাতৃসেবায় প্রবেশগম্যতা ও সহায়তা" : "Accessible maternity care"}<ChevronDown size={16} aria-hidden="true" /></summary>
            <ul>
              {(["accessVisit","accessWheelchair","accessHearing","accessVision","accessEasyRead","accessCommunication","accessSensory","accessBirthPlan","accessConsent","accessAfterBirth","accessSupportPerson","accessFollowUp"] as const).map(topic => (
                <li key={topic}><QuestionOption prompt={educationTopics[topic][formLanguage]} onSelect={onSelect} disabled={!ready || busy || audio.listening} /></li>
              ))}
            </ul>
            <button type="button" className={`${styles.read} ${styles.collapseTopics}`}
              onClick={(event) => {
                const details = event.currentTarget.closest("details");
                if (!details) return;
                details.open = false;
                details.querySelector("summary")?.focus();
              }}>
              {formLanguage === "bn" ? "সহায়তার তালিকা গুটিয়ে নিন" : "Collapse accessibility questions"}
            </button>
          </details>
          <details className={styles.moreTopics}>
            <summary>{copy.moreTopics}<ChevronDown size={16} aria-hidden="true" /></summary>
            <ul>
              {additionalTopics.map((topic) => (
                <li key={topic}><QuestionOption prompt={educationTopics[topic][formLanguage]} onSelect={onSelect} disabled={!ready || busy || audio.listening} /></li>
              ))}
            </ul>
            <button type="button" className={`${styles.read} ${styles.collapseTopics}`}
              onClick={(event) => {
                const details = event.currentTarget.closest("details");
                if (!details) return;
                details.open = false;
                details.querySelector("summary")?.focus();
              }}>
              {formLanguage === "bn" ? "প্রশ্নের তালিকা গুটিয়ে নিন" : "Collapse questions"}
            </button>
          </details>
        </div>
        <div className={styles.sideNote}>
        <BartaAudioFile key={formLanguage} guideLabel={copy.readGuide}
          text={spokenGuide} language={formLanguage} disabled={!ready || busy || audio.listening}
          browserReading={audio.speaking === "barta-guide"}
          browserFailed={audio.notice?.replyId === "barta-guide"}
          onBrowserRead={() => {
            stopReplyAudio();
            readAnswer("barta-guide", spokenGuide, formLanguage);
          }} />
        {playbackMessage("barta-guide") && (
          <p role="status" className={styles.playbackNotice}>{playbackMessage("barta-guide")}</p>
        )}
        <p className={styles.scope}><ShieldCheck size={19} aria-hidden="true" /><span>{copy.scope}</span></p>
        </div>
      </aside>
    </div>
  );
}
