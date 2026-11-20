"use client";
import { useL, categoryLabel, sourceLabel } from "./use-l";
import { ReadAloudButton } from "@/features/adapt";
import { AccessPreferencesControl } from "@/components/accessibility/AccessPreferencesControl";
import { useEffect, useId, useState, type ReactNode } from "react";
import {
  demoBaby,
  demoMother,
  getDemoObservations,
  allObservationCategories,
  type HealthObservation,
  type RecordType,
} from "./demo-health";
import { DEFAULT_EPISODE_ID, episodeOf, dhakaToday, gestationalDating, type PregnancyEpisode, type BabyRecord } from "./records-model";
import { MaternalHealthForm } from "./MaternalHealthForm";
import { BabyHealthRecord } from "./BabyHealthRecord";

const cardClass = "min-w-0 rounded-card border border-pro-border bg-pro-elevated p-[var(--pro-pad-card)]";


function matchesRecord(observation: HealthObservation, recordType: RecordType, pregnancyId: string, babyId: string): boolean {
  const recordId = recordType === "mother" ? demoMother.id : babyId;
  return !observation.archived && episodeOf(observation) === pregnancyId && observation.recordType === recordType && observation.recordId === recordId;
}

function observationTime(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function RecordSummary({ recordType, count, loading, children, recordLabel }: {
  recordLabel?: string;
  recordType: RecordType;
  count: number;
  children?: ReactNode;
  loading: boolean;
}) {
  const L = useL();
  const isMother = recordType === "mother";
  return (
    <section className={`${cardClass} ${isMother ? "border-t-4 border-t-pro-primary" : "border-t-4 border-t-pro-control-border"}`}>
      <h2 className="text-xl font-semibold">{isMother ? L("Mother's Health", "মায়ের স্বাস্থ্য") : L("Baby's Health", "শিশুর স্বাস্থ্য")}</h2>
      <p className="mt-2 break-words text-pro-muted">{recordLabel ?? (isMother ? demoMother.name : demoBaby.label)}</p>
      {loading ? <p className="mt-4 text-pro-muted">{L("Loading observations…", "পর্যবেক্ষণ লোড হচ্ছে…")}</p> : (
        <>
          <p className="mt-4"><strong className="text-3xl font-semibold tabular-nums">{count}</strong> {count === 1 ? L("saved observation", "টি পর্যবেক্ষণ সংরক্ষিত") : L("saved observations", "টি পর্যবেক্ষণ সংরক্ষিত")}</p>
          <p className="mt-2 text-pro-muted">{count === 0
            ? (isMother ? L("No maternal observations yet. Add your first fictional note below.", "এখনো মায়ের কোনো পর্যবেক্ষণ নেই। নিচে প্রথম কাল্পনিক নোটটি যোগ করুন।") : L("No baby observations yet. Add a fictional observation using the baby form below.", "এখনো শিশুর কোনো পর্যবেক্ষণ নেই। নিচের ফর্মে একটি কাল্পনিক পর্যবেক্ষণ যোগ করুন।"))
            : L("Saved entries and their sources are listed in your health timeline below.", "সংরক্ষিত তথ্য ও তার উৎস নিচের স্বাস্থ্য সময়রেখায় দেখা যাবে।")}</p>
        </>
      )}
      {children}
    </section>
  );
}

function ObservationTimeline({ observations, loading, headingId }: {
  observations: HealthObservation[];
  loading: boolean;
  headingId: string;
}) {
  const L = useL();
  return (
    <section className={cardClass} aria-labelledby={headingId} aria-busy={loading}>
      <h2 id={headingId} className="text-2xl font-semibold">{L("Health Timeline", "স্বাস্থ্যের সময়রেখা")}</h2>
      <p className="mt-2 text-pro-muted">{L("Mother and baby entries, newest first. Each stays in its own record.", "মা ও শিশুর তথ্য, নতুন আগে। প্রতিটি নিজ নিজ নথিতে থাকে।")}</p>
      {loading ? <p className="mt-6" role="status">{L("Loading saved demo observations…", "সংরক্ষিত ডেমো পর্যবেক্ষণ লোড হচ্ছে…")}</p>
        : observations.length === 0 ? (
          <div className="mt-6 rounded-field border border-dashed border-pro-border p-5">
            <h3 className="font-semibold">{L("Your timeline starts with one note", "আপনার সময়রেখা একটি নোট দিয়ে শুরু হয়")}</h3>
            <p className="mt-2 text-pro-muted">{L("Add a fictional observation using the form. Your saved entry will appear here with its record and source.", "ফর্মে একটি কাল্পনিক পর্যবেক্ষণ যোগ করুন। সংরক্ষিত তথ্যটি তার নথি ও উৎসসহ এখানে দেখা যাবে।")}</p>
          </div>
        ) : (
          <ol className="mt-6 divide-y divide-pro-border">
            {observations.map((observation, index) => {
              const validDate = !Number.isNaN(Date.parse(observation.observedAt));
              return (
                <li key={`${observation.id}-${index}`} className="min-w-0 py-5 first:pt-0 last:pb-0">
                  <span className="inline-block rounded-control border border-pro-border bg-pro-surface px-3 py-1 font-medium">
                    {observation.recordType === "mother" ? L("Mother's record", "মায়ের নথি") : L("Baby's record", "শিশুর নথি")}
                  </span>
                  <h3 className="mt-3 break-words text-lg font-semibold [overflow-wrap:anywhere]">{observation.label}</h3>
                  <p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{observation.value}{observation.unit ? ` ${observation.unit}` : ""}</p>
                  <p className="mt-2 text-pro-muted">
                    {validDate ? <time dateTime={observation.observedAt}>{new Intl.DateTimeFormat("en-BD", {
                      dateStyle: "medium", ...(/^\d{4}-\d{2}-\d{2}$/.test(observation.observedAt) ? {} : { timeStyle: "short" as const }), timeZone: "Asia/Dhaka",
                    }).format(new Date(observation.observedAt))} ({L("Dhaka time", "ঢাকার সময়")})</time> : L("Date unavailable", "তারিখ পাওয়া যায়নি")}
                  </p>
                  <ReadAloudButton language={L.bn ? "bn" : "en"} text={L(`${observation.label}: ${observation.value}${observation.unit ? " " + observation.unit : ""}. Recorded for ${observation.recordType === "mother" ? "the mother" : "the baby"}. Date: ${observation.observedAt}. Self-reported entries are not clinically verified.`, `${observation.label}: ${observation.value}${observation.unit ? " " + observation.unit : ""}। ${observation.recordType === "mother" ? "মায়ের" : "শিশুর"} নথি। তারিখ: ${observation.observedAt}। নিজে দেওয়া তথ্য চিকিৎসাগতভাবে যাচাই করা হয়নি।`)} />
                  <p className="mt-1 text-pro-muted">{L("Category", "ধরন")}: {observation.category ? categoryLabel(observation.category, allObservationCategories[observation.category], L.bn) : L("Not recorded", "লেখা নেই")}</p>
                  <p className="mt-1 text-pro-muted">{L("Source", "উৎস")}: {sourceLabel(L, observation)}</p>
                </li>
              );
            })}
          </ol>
        )}
    </section>
  );
}

export function HealthDashboard({ records, onSaved, episode, baby, motherName = demoMother.name, embedded = false }: { records?: HealthObservation[]; onSaved?: (records: HealthObservation[]) => void; episode?: PregnancyEpisode; baby?: BabyRecord; motherName?: string; embedded?: boolean } = {}) {
  const L = useL();
  const id = useId();
  const [localObservations, setLocalObservations] = useState<HealthObservation[]>([]);
  const observations = records ?? localObservations;
  const setObservations = (next: HealthObservation[]) => { setLocalObservations(next); onSaved?.(next); };
  const pregnancyId = episode?.id ?? DEFAULT_EPISODE_ID;
  const dating = episode ? gestationalDating(episode, episode.endDate || dhakaToday()) : null;
  const week = dating?.weeks;
  const edd = episode?.edd ?? demoMother.estimatedDueDate;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // Load through the service after mount; keep server and first client render identical.
    void Promise.resolve().then(() => {
      if (active) {
        setLocalObservations(getDemoObservations());
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const motherObservations = observations.filter((item) => matchesRecord(item, "mother", pregnancyId, baby?.id ?? demoBaby.id));
  const babyObservations = observations.filter((item) => matchesRecord(item, "baby", pregnancyId, baby?.id ?? demoBaby.id));
  const timeline = [...motherObservations, ...babyObservations]
    .sort((a, b) => observationTime(b.observedAt) - observationTime(a.observedAt));

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 [overflow-wrap:anywhere] gap-[var(--pro-gap-section)] px-4 py-6 text-base text-pro-text sm:px-6 sm:py-10 lg:px-8">
      {!embedded && <><aside className="rounded-field border border-pro-border bg-pro-surface px-4 py-3" aria-label="Demo information">
        <p className="font-semibold">{L("Demo mode — fictional health information only.", "ডেমো মোড — শুধু কাল্পনিক স্বাস্থ্য তথ্য।")}</p>
        <p className="mt-1 text-pro-muted">{L("Authentication and the medical database are not connected yet. Entries stay in temporary browser storage; do not enter real patient information.", "লগইন ও চিকিৎসা ডাটাবেস এখনো যুক্ত নেই। তথ্য ব্রাউজারের অস্থায়ী সংরক্ষণে থাকে; বাস্তব রোগীর তথ্য দেবেন না।")}</p>
      </aside>

      <header>
        <h1 className="text-3xl font-semibold leading-snug sm:text-4xl">Jibonrekha — <span lang="bn">জীবনরেখা</span></h1>
        <p className="mt-3 text-pro-muted">{L("Your pregnancy journey and linked health records.", "আপনার গর্ভকালের যাত্রা ও যুক্ত স্বাস্থ্য নথি।")}</p>
        <AccessPreferencesControl />
      </header></>}

      <section className="min-w-0 rounded-hero border border-pro-border bg-pro-surface p-[var(--pro-pad-card)] sm:p-8" aria-labelledby={`${id}-overview`}>
        <h2 id={`${id}-overview`} className="text-2xl font-semibold">{L("Pregnancy Overview", "গর্ভকালের সারসংক্ষেপ")}</h2>
        <p className="mt-3 break-words text-xl">{motherName}</p>
        <dl className="mt-6 grid gap-6 sm:grid-cols-3">
          <div><dt className="text-pro-muted">{L("Current pregnancy week", "বর্তমান গর্ভসপ্তাহ")}</dt><dd className="mt-1 text-2xl font-semibold">{week !== undefined ? `${week} weeks ${dating?.days ?? 0} days` : "Dating unavailable"}</dd></div>
          <div><dt className="text-pro-muted">{L("Estimated due date", "সম্ভাব্য প্রসবের তারিখ")}</dt><dd className="mt-1 text-lg font-semibold"><time dateTime={edd}>{edd || "Unknown"}</time></dd></div>
          <div><dt className="text-pro-muted">{L("Linked baby record", "যুক্ত শিশুর নথি")}</dt><dd className="mt-1 text-lg font-semibold">{baby ? `${baby.label} (linked to selected pregnancy)` : "No baby recorded for this pregnancy"}</dd></div>
        </dl>
        {week !== undefined && <div className="mt-7">
          <label htmlFor={`${id}-progress`} className="font-semibold">Pregnancy timeline · {week} weeks of a 40-week reference</label>
          <progress id={`${id}-progress`} value={Math.min(week, 40)} max={40} aria-describedby={`${id}-progress-note`} className="mt-3 block h-3 w-full" style={{ accentColor: "var(--pro-primary)" }} />
          <p id={`${id}-progress-note`} className="mt-3 text-pro-muted">{L("Estimate based on recorded dating. No diagnosis or prediction of delivery.", "লিপিবদ্ধ তারিখের ভিত্তিতে অনুমান। এটি রোগনির্ণয় বা প্রসবের পূর্বাভাস নয়।")}</p>
        </div>}
        <p className="mt-3 text-pro-muted">{L("EDD source", "প্রসবের তারিখের উৎস")}: {episode?.eddSource ?? L("Unknown", "অজানা")}. {dating?.warning}</p>
      </section>

      <div className="grid min-w-0 grid-cols-1 items-start gap-[var(--pro-gap-group)] md:grid-cols-2">
        <RecordSummary recordLabel={motherName} recordType="mother" count={motherObservations.length} loading={loading}><MaternalHealthForm key={pregnancyId} pregnancyId={pregnancyId} motherName={motherName} onSaved={setObservations} disabled={loading} /></RecordSummary>
        {baby && <BabyHealthRecord key={baby.id} baby={baby} pregnancyId={pregnancyId} motherName={motherName} observations={observations} loading={loading} onSaved={setObservations} />}
      </div>

      <ObservationTimeline observations={timeline} loading={loading} headingId={`${id}-timeline`} />
    </div>
  );
}

export default HealthDashboard;
