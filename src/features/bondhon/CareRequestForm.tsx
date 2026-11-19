"use client";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { AACComposer, ReadAloudButton, mergeAacText } from "@/features/adapt";
import { useLanguage } from "@/i18n/use-language";
import { careRecipientsSchema, createSupportRequestRequestSchema, supportRequestSchema, type SupportRequest, type CreateSupportRequestRequest } from "@/lib/contracts/bondhon";
import { availableRecordSchema, bondhonTermsVersion, type Accommodation } from "@/lib/contracts/coordination";
import { shareableRecordSchema } from "@/lib/contracts/sharing";
import { careFetch, CareError } from "./client";
import { accommodations, displayValue, fieldNames, recordNames, words } from "./bondhon-copy";
import styles from "./bondhon.module.css";

type RecordOption = z.infer<typeof availableRecordSchema>;
const recordKey = (record: { type: string; id: string }) => `${record.type}/${record.id}`;
type PendingSubmission = { key: string; body: CreateSupportRequestRequest };
export function CareRequestForm({ account, onCreated }: { account: string; onCreated: (request: SupportRequest) => void }) {
  const { language, t } = useLanguage();
  const id = useId();
  const [step, setStep] = useState(0);
  const composeHeading = useRef<HTMLHeadingElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const messageInput = useRef<HTMLTextAreaElement>(null);
  const [recipients, setRecipients] = useState<z.infer<typeof careRecipientsSchema>>([]);
  const [records, setRecords] = useState<RecordOption[]>([]);
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState<"text" | "aac" | "call">("text");
  const [hours, setHours] = useState("24");
  const [allowReplies, setAllowReplies] = useState(false);
  const [needs, setNeeds] = useState<Accommodation[]>([]);
  const [selection, setSelection] = useState<Record<string, string[]>>({});
  const [review, setReview] = useState<PendingSubmission | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [recordError, setRecordError] = useState(false);
  const [retryLoad, setRetryLoad] = useState(0);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState("");
  const [incoming, setIncoming] = useState("");
  const submitting = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    void Promise.allSettled([
      careFetch("/api/care-recipients", careRecipientsSchema, account, { signal: controller.signal }),
      careFetch("/api/care-records", z.array(availableRecordSchema).max(100), account, { signal: controller.signal }),
    ]).then(([people, items]) => {
      if (controller.signal.aborted) return;
      if (people.status === "fulfilled") setRecipients(people.value); else setFailed(true);
      if (items.status === "fulfilled") setRecords(items.value); else setRecordError(true);
      setLoading(false);
    });
    return () => controller.abort();
  }, [account, retryLoad]);
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (message || purpose || recipient || needs.length || Object.values(selection).some(fields => fields.length) || uncertain) { event.preventDefault(); }
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [message, purpose, recipient, needs, selection, uncertain]);
  function toggleField(recordId: string, field: string) {
    setSelection(previous => {
      const fields = previous[recordId] ?? [];
      return { ...previous, [recordId]: fields.includes(field) ? fields.filter(value => value !== field) : [...fields, field] };
    });
  }
  function preview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (step < 3) {
      setStep(value => value + 1);
      window.requestAnimationFrame(() => composeHeading.current?.focus());
      return;
    }
    const chosen = records.filter(item => selection[recordKey(item.record)]?.length).map(item =>
      shareableRecordSchema.parse({ type: item.record.type, id: item.record.id, fields: selection[recordKey(item.record)] }));
    const parsed = createSupportRequestRequestSchema.safeParse({ recipientUserId: recipient, purpose, message, method,
      consentGrantIds: [], reviewConfirmed: true,
      coordination: { termsVersion: bondhonTermsVersion, expiresAt: new Date(Date.now() + Number(hours) * 3600000).toISOString(),
        allowReplies, language, accommodations: needs, records: chosen } });
    if (!parsed.success) {
      setError(t(words("Choose a recipient and enter a purpose and message before reviewing.", "পর্যালোচনার আগে প্রাপক বাছুন এবং উদ্দেশ্য ও বার্তা লিখুন।")));
      return;
    }
    setReview({ key: crypto.randomUUID(), body: parsed.data }); setConfirmed(false);
    window.requestAnimationFrame(() => heading.current?.focus());
  }
  async function send() {
    if (!review || !confirmed || submitting.current) return;
    submitting.current = true; setBusy(true); setError("");
    try {
      const result = await careFetch("/api/care-requests", supportRequestSchema, account, { post: true, key: review.key, body: review.body });
      setUncertain(false); setMessage(""); onCreated(result);
    } catch (cause) {
      const ambiguous = !(cause instanceof CareError) || cause.status >= 500;
      setUncertain(ambiguous);
      if (!ambiguous) setConfirmed(false);
      if (cause instanceof CareError && cause.status === 409) {
        setReview(null); setStep(0); setConfirmed(false);
        setLoading(true); setFailed(false); setRecordError(false); setRetryLoad(value => value + 1);
        window.requestAnimationFrame(() => composeHeading.current?.focus());
      }
      setError(ambiguous ? t(words("Submission unconfirmed. Keep this page open and retry the same reviewed request. Your retry key is preserved.", "জমা দেওয়া নিশ্চিত হয়নি। এই পাতা খোলা রাখুন এবং একই পর্যালোচিত অনুরোধ আবার পাঠান। একই পুনঃচেষ্টার চাবি রাখা হয়েছে।")) :
        cause instanceof CareError && cause.status === 401 ? t(words("Your session expired. Sign in again in another tab, then retry here.", "সেশনের মেয়াদ শেষ। অন্য ট্যাবে আবার সাইন ইন করে এখানে চেষ্টা করুন।")) :
        t(words("This attempt was rejected. Review your account, recipient and expiry. Your text is kept here.", "এই চেষ্টা গ্রহণ করা হয়নি। অ্যাকাউন্ট, প্রাপক ও মেয়াদ দেখুন। আপনার লেখা এখানে রাখা আছে।")));
    } finally { submitting.current = false; setBusy(false); }
  }
  const receiver = recipients.find(item => item.id === recipient);
  const selected = records.filter(item => selection[recordKey(item.record)]?.length);
  const summary = review ? [receiver?.displayName, review.body.purpose, review.body.message,
    t(words("Permission expires", "অনুমতির মেয়াদ শেষ")), new Date(review.body.coordination!.expiresAt).toLocaleString(language === "bn" ? "bn-BD" : "en-GB"),
    ...selected.flatMap(item => Object.entries(item.record.fields).filter(([key]) => selection[recordKey(item.record)]?.includes(key))
      .map(([key, value]) => `${t(fieldNames[key] ?? words(key, key))} ${displayValue(value)}`))].join(". ") : "";
  const stepNames = [words("Message", "বার্তা"), words("Recipient", "প্রাপক"), words("Records and access needs", "রেকর্ড ও সহায়তার চাহিদা"), words("Duration and replies", "মেয়াদ ও উত্তর"), words("Review and approve", "পর্যালোচনা ও অনুমতি")];
  const quickRequests = [
    words("I would like help preparing for a routine pregnancy visit.", "গর্ভকালীন সাধারণ সাক্ষাতের প্রস্তুতিতে সহায়তা চাই।"),
    words("I would like to discuss care after childbirth.", "প্রসবের পরের সেবা নিয়ে আলোচনা করতে চাই।"),
    words("I would like help preparing questions about feeding my baby.", "শিশুকে খাওয়ানো নিয়ে প্রশ্ন প্রস্তুত করতে সহায়তা চাই।"),
    words("Please communicate with me in writing.", "আমার সঙ্গে লিখিতভাবে যোগাযোগ করুন।"),
    words("Please explain things in plain language and give me time to respond.", "সহজ ভাষায় ব্যাখ্যা করুন এবং উত্তর দেওয়ার সময় দিন।"),
    words("I would like to discuss access arrangements before my visit.", "সাক্ষাতের আগে প্রবেশ ও ব্যবহারের সুবিধা নিয়ে আলোচনা করতে চাই।"),
  ];
  if (review) return <section className={styles.panel} aria-labelledby={`${id}-review`}>
    <p>{t(words("Step 5 of 5 · Review and approve", "ধাপ ৫/৫ · পর্যালোচনা ও অনুমতি"))}</p>
    <h2 id={`${id}-review`} ref={heading} tabIndex={-1}>{t(words("Review your sharing decision", "তথ্য শেয়ারের সিদ্ধান্ত পর্যালোচনা করুন"))}</h2>
    <p>{t(words("Only the information below will be sent to this named simulated recipient.", "শুধু নিচের তথ্য এই নামের সিমুলেটেড প্রাপকের কাছে যাবে।"))}</p>
    <dl className={styles.values}>
      <div>
      <dt>{t(words("Recipient", "প্রাপক"))}</dt>
      <dd>{receiver?.displayName} · {t(words("Simulated", "সিমুলেটেড"))}</dd>
      </div>
      <div>
      <dt>{t(words("Purpose", "উদ্দেশ্য"))}</dt>
      <dd>{review.body.purpose}</dd>
      </div>
      <div>
      <dt>{t(words("Message", "বার্তা"))}</dt>
      <dd>{review.body.message}</dd>
      </div>
      <div>
      <dt>{t(words("Communication", "যোগাযোগ"))}</dt>
      <dd>{t(method === "aac" ? words("Picture-and-text / AAC", "ছবি ও লেখা / এএসি") : method === "call" ? words("Call preference only; this demo places no calls", "কলে কথা বলার পছন্দ; এই ডেমো কল করে না") : words("Text", "লেখা"))}</dd>
      </div>
      <div>
      <dt>{t(words("Permission ends", "অনুমতির শেষ সময়"))}</dt>
      <dd>{new Date(review.body.coordination!.expiresAt).toLocaleString(language === "bn" ? "bn-BD" : "en-GB")}</dd>
      </div>
      <div>
      <dt>{t(words("Allowed actions", "অনুমোদিত কাজ"))}</dt>
      <dd>{t(allowReplies ? words("View selected information and exchange messages within this purpose", "বাছাই করা তথ্য দেখা ও এই উদ্দেশ্যে বার্তা বিনিময়") : words("View selected information only", "শুধু বাছাই করা তথ্য দেখা"))}</dd>
      </div>
      <div>
      <dt>{t(words("Requested accommodations", "ব্যবহারের সুবিধার অনুরোধ"))}</dt>
      <dd>{needs.length ? needs.map(item => t(accommodations[item])).join(" · ") : t(words("None selected", "কিছু বাছা হয়নি"))}</dd>
      </div>
    </dl>
    {selected.map(item => <div className={styles.record} key={item.record.id}>
      <h3>{t(recordNames[item.record.type])}</h3>
      <dl className={styles.values}>
      {Object.entries(item.record.fields).filter(([key]) => selection[recordKey(item.record)]?.includes(key)).map(([key, value]) =>
        <div key={key}>
      <dt>{t(fieldNames[key] ?? words(key, key))}</dt>
      <dd>{displayValue(value)}</dd>
      </div>)}
    </dl>
      </div>)}
    {!selected.length && <p>{t(words("No health-record fields selected. Only this message, purpose, communication preference and selected accommodations are shared.", "স্বাস্থ্য রেকর্ডের কোনো তথ্য বাছা হয়নি। শুধু এই বার্তা, উদ্দেশ্য, যোগাযোগের পছন্দ ও বাছাই করা সুবিধার অনুরোধ শেয়ার হবে।"))}</p>}
    <p className={styles.notice}>{t(words("You can stop future access. Information already seen, copied or downloaded cannot be recalled. This prototype keeps consent receipts and history; withdrawal does not erase them. Diary entries, AI conversations and raw files are excluded from this sharing tool.", "ভবিষ্যতের প্রবেশাধিকার বন্ধ করতে পারবেন। আগে দেখা, কপি বা ডাউনলোড করা তথ্য ফিরিয়ে নেওয়া যায় না। এই প্রোটোটাইপে সম্মতির রসিদ ও ইতিহাস থাকে; প্রত্যাহারে তা মুছে যায় না। ডায়েরি, এআই কথোপকথন ও মূল ফাইল এই শেয়ার ব্যবস্থার বাইরে।"))}</p>
    <ReadAloudButton text={summary} language={language} label={t(words("Read my sharing summary", "শেয়ারের সারাংশ পড়ে শোনান"))} />
    <label className={styles.check}>
      <input type="checkbox" checked={confirmed} disabled={busy || uncertain} onChange={event => setConfirmed(event.target.checked)} />
      <span>{t(words("I approve sharing exactly this information with this simulated recipient until the stated time.", "উল্লিখিত সময় পর্যন্ত এই সিমুলেটেড প্রাপকের সঙ্গে ঠিক এই তথ্য শেয়ারে আমি সম্মত।"))}</span>
      </label>
    <div className={styles.actions}>
      <button type="button" className="pro-btn pro-btn-primary" disabled={!confirmed || busy} onClick={() => void send()}>{t(busy ? words("Confirming submission…", "জমা নিশ্চিত হচ্ছে…") : uncertain ? words("Retry the same request", "একই অনুরোধ আবার পাঠান") : words("Approve and send to simulated queue", "অনুমতি দিয়ে সিমুলেটেড তালিকায় পাঠান"))}</button>
      <button type="button" className="pro-btn pro-btn-secondary" disabled={busy || uncertain} onClick={() => { setReview(null); setConfirmed(false); setStep(0); setError(""); window.requestAnimationFrame(() => composeHeading.current?.focus()); }}>{t(words("Back to edit", "সম্পাদনায় ফিরুন"))}</button>
    </div>
    {error && <p role="alert" className={styles.error}>{error}</p>}
  </section>;
  return <form onSubmit={preview} className={styles.panel}>
    <h2 ref={composeHeading} tabIndex={-1}>{t(words("New routine care request", "নতুন সাধারণ সেবার অনুরোধ"))}</h2>
    <p role="status">{t(words("Step", "ধাপ"))} {step + 1}/5 · {t(stepNames[step])}</p>
    <ol className={styles.formSteps} aria-label={t(words("Request steps", "অনুরোধের ধাপ"))}>{stepNames.map((name, index) => <li key={name.en} aria-current={index === step ? "step" : undefined}>{index + 1}. {t(name)}</li>)}</ol>
    <p>{t(words("Use synthetic examples for this hackathon. Select what to share, then review before sending.", "এই হ্যাকাথনে নমুনা তথ্য ব্যবহার করুন। কী শেয়ার করবেন বেছে নিয়ে পাঠানোর আগে পর্যালোচনা করুন।"))}</p>
    {loading && <p role="status">{t(words("Loading approved simulated recipients…", "অনুমোদিত সিমুলেটেড প্রাপক আসছে…"))}</p>}
    {failed && <div className={styles.notice}>
      <p role="alert">{t(words("The recipient directory is unavailable. Check your connection and account configuration.", "প্রাপকের তালিকা পাওয়া যাচ্ছে না। সংযোগ ও অ্যাকাউন্টের সেটিং দেখুন।"))}</p>
      <button type="button" className="pro-btn pro-btn-secondary" onClick={() => { setLoading(true); setFailed(false); setRecordError(false); setRetryLoad(value => value + 1); }}>{t(words("Retry loading", "আবার আনুন"))}</button>
      </div>}
    {!loading && !failed && !recipients.length && <p className={styles.notice}>{t(words("No approved simulated provider is available. An administrator must approve a demo provider account before you can send.", "অনুমোদিত সিমুলেটেড সেবাদাতা নেই। পাঠানোর আগে প্রশাসককে একটি ডেমো সেবাদাতার অ্যাকাউন্ট অনুমোদন করতে হবে।"))}</p>}
    {step === 0 && <>    <fieldset className={styles.choices}>
      <legend className={styles.legend}>{t(words("Optional starting phrases", "শুরু করার ঐচ্ছিক বাক্য"))}</legend>
      <p>{t(words("Choose a phrase to add, then edit it in your own words. Nothing is sent until you review and approve.", "যোগ করার জন্য একটি বাক্য বাছুন, তারপর নিজের ভাষায় সম্পাদনা করুন। পর্যালোচনা ও অনুমতি ছাড়া কিছু পাঠানো হয় না।"))}</p>
      <div className={styles.quickChoices}>{quickRequests.map(phrase => <button key={phrase.en} type="button" className="pro-btn pro-btn-secondary" onClick={() => {
        const incomingText = t(phrase);
        const next = message ? `${message}\n${incomingText}` : incomingText;
        if (next.length <= 1000) { setMessage(next); setIncoming(""); messageInput.current?.focus(); }
        else setIncoming(incomingText);
      }}>{t(phrase)}</button>)}</div>
    </fieldset>
    <label className={styles.field}>
      <span>{t(words("Purpose of this request", "এই অনুরোধের উদ্দেশ্য"))}</span>
      <input className="pro-input" required maxLength={300} value={purpose} onChange={event => setPurpose(event.target.value)} placeholder={t(words("For example, prepare for a routine visit", "যেমন, সাধারণ সাক্ষাতের প্রস্তুতি"))} />
      </label>
    <label className={styles.field}>
      <span>{t(words("Preferred communication", "যোগাযোগের পছন্দ"))}</span>
      <select className="pro-input" value={method} onChange={event => setMethod(event.target.value as typeof method)}>
      <option value="text">{t(words("Text", "লেখা"))}</option>
      <option value="aac">{t(words("Picture-and-text / AAC", "ছবি ও লেখা / এএসি"))}</option>
      <option value="call">{t(words("Call preference (demo does not place calls)", "কলের পছন্দ (ডেমো কল করে না)"))}</option>
      </select>
      </label>
    {method === "aac" && <AACComposer onInsert={text => { const next = mergeAacText(message, text); if (next.length > 1000) setIncoming(text); else { setMessage(next); setIncoming(""); messageInput.current?.focus(); } }} targetLabel={t(words("Insert into request", "অনুরোধে যোগ করুন"))} />}
    <label className={styles.field}>
      <span>{t(words("Message for this recipient", "এই প্রাপকের জন্য বার্তা"))}</span>
      <textarea ref={messageInput} required rows={4} className="pro-input" maxLength={1000} value={message} onChange={event => setMessage(event.target.value)} aria-describedby={`${id}-privacy`} />
      </label>
    <p id={`${id}-privacy`}>{t(words("Everything you type in this message is shared after approval. Include only information needed for this purpose. Drafts stay in memory in this tab.", "অনুমতির পর এই বার্তায় লেখা সব তথ্য শেয়ার হবে। এই উদ্দেশ্যে প্রয়োজনীয় তথ্যই লিখুন। খসড়া এই ট্যাবের মেমরিতে থাকে।"))}</p>
    {incoming && <p role="alert">{t(words("The combined message exceeds 1000 characters. Your existing text is kept. Incoming text", "মিলিত বার্তা ১০০০ অক্ষর ছাড়িয়েছে। আগের লেখা রাখা আছে। নতুন লেখা"))} {incoming}</p>}
</>}
    {step === 1 && <>    <label className={styles.field}>
      <span>{t(words("Named simulated recipient", "নামসহ সিমুলেটেড প্রাপক"))}</span>
      <select required className="pro-input" value={recipient} onChange={event => setRecipient(event.target.value)} disabled={loading || failed}>
      <option value="">{t(words("Choose a recipient", "প্রাপক বাছুন"))}</option>{recipients.map(item => <option key={item.id} value={item.id}>{item.displayName}</option>)}
    </select>
      </label>
</>}
    {step === 2 && <>    <fieldset className={styles.choices}>
      <legend className={styles.legend}>{t(words("Optional accommodations", "ব্যবহারের সুবিধার ঐচ্ছিক অনুরোধ"))}</legend>
      <p>{t(words("Requests describe assistance you want. Availability must be confirmed separately.", "এখানে আপনার চাওয়া সহায়তা বাছুন। সুবিধা পাওয়া যাবে কি না আলাদাভাবে নিশ্চিত করতে হবে।"))}</p>
      {Object.entries(accommodations).map(([key, label]) => <label key={key} className={styles.check}>
      <input type="checkbox" checked={needs.includes(key as Accommodation)} onChange={event => setNeeds(previous => event.target.checked ? [...previous, key as Accommodation] : previous.filter(item => item !== key))} />
      <span>{t(label)}</span>
      </label>)}
    </fieldset>
    <details>
      <summary className="pro-btn pro-btn-secondary">{t(words("Choose individual health-record fields (optional)", "স্বাস্থ্য রেকর্ডের তথ্য আলাদা করে বাছুন (ঐচ্ছিক)"))}</summary>
      <p>{t(words("Nothing is preselected. These are your latest 100 available synthetic records. Wellbeing entries may contain sensitive information.", "কিছুই আগে থেকে বাছা নেই। এগুলো আপনার সর্বশেষ উপলব্ধ ১০০টি নমুনা রেকর্ড। ভালো থাকার নোটে সংবেদনশীল তথ্য থাকতে পারে।"))}</p>
      {recordError && <p role="status">{t(words("Record selection is unavailable. You can still review a message-only request.", "রেকর্ড বাছাই এখন পাওয়া যাচ্ছে না। শুধু বার্তার অনুরোধ পর্যালোচনা করতে পারেন।"))}</p>}
      {!records.length && !recordError && <p>{t(words("No shareable records are available. No example records will be sent automatically.", "শেয়ারের উপযোগী রেকর্ড নেই। স্বয়ংক্রিয়ভাবে কোনো নমুনা রেকর্ড পাঠানো হবে না।"))}</p>}
      <div className={styles.records}>{records.map(item => <fieldset key={item.record.id} className={styles.record}>
      <legend>{t(recordNames[item.record.type])} · {new Date(item.recordedAt).toLocaleDateString(language === "bn" ? "bn-BD" : "en-GB")}</legend>
        {Object.entries(item.record.fields).map(([field, value]) => <label className={styles.check} key={field}>
      <input type="checkbox" checked={selection[recordKey(item.record)]?.includes(field) ?? false} onChange={() => toggleField(recordKey(item.record), field)} />
      <span>
      <strong>{t(fieldNames[field] ?? words(field, field))}</strong>
      <br />{displayValue(value)}</span>
      </label>)}
      </fieldset>)}</div>
    </details>
</>}
    {step === 3 && <>    <label className={styles.field}>
      <span>{t(words("Permission duration", "অনুমতির মেয়াদ"))}</span>
      <select className="pro-input" value={hours} onChange={event => setHours(event.target.value)}>
      <option value="1">{t(words("1 hour", "১ ঘণ্টা"))}</option>
      <option value="24">{t(words("24 hours", "২৪ ঘণ্টা"))}</option>
      <option value="168">{t(words("7 days", "৭ দিন"))}</option>
      <option value="720">{t(words("30 days", "৩০ দিন"))}</option>
    </select>
      </label>
    <label className={styles.check}>
      <input type="checkbox" checked={allowReplies} onChange={event => setAllowReplies(event.target.checked)} />
      <span>{t(words("Allow the simulated provider to reply and allow follow-up messages about this same purpose.", "সিমুলেটেড সেবাদাতার উত্তর ও এই একই উদ্দেশ্যে পরবর্তী বার্তার অনুমতি দিন।"))}</span>
      </label>
</>}
    <div className={styles.actions}>
      {step > 0 && <button type="button" className="pro-btn pro-btn-secondary" onClick={() => { setStep(value => value - 1); setError(""); window.requestAnimationFrame(() => composeHeading.current?.focus()); }}>{t(words("Previous step", "আগের ধাপ"))}</button>}
      <button className="pro-btn pro-btn-primary" disabled={step > 0 && (loading || failed || !recipients.length)}>{t(step < 3 ? words("Continue", "পরের ধাপ") : words("Review information and permissions", "তথ্য ও অনুমতি পর্যালোচনা করুন"))}</button>
    </div>
    {error && <p role="alert" className={styles.error}>{error}</p>}
  </form>;
}
