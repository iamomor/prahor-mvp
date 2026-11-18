"use client";
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
  const isMother = recordType === "mother";
  return (
    <section className={`${cardClass} ${isMother ? "border-t-4 border-t-pro-primary" : "border-t-4 border-t-pro-control-border"}`}>
      <h2 className="text-xl font-semibold">{isMother ? "Mother's Health" : "Baby's Health"}</h2>
      <p className="mt-2 break-words text-pro-muted">{recordLabel ?? (isMother ? demoMother.name : demoBaby.label)}</p>
      {loading ? <p className="mt-4 text-pro-muted">Loading observations…</p> : (
        <>
          <p className="mt-4"><strong className="text-3xl font-semibold tabular-nums">{count}</strong> saved {count === 1 ? "observation" : "observations"}</p>
          <p className="mt-2 text-pro-muted">{count === 0
            ? (isMother ? "No maternal observations yet. Add your first fictional note below." : "No baby observations yet. Add a fictional observation using the baby form below.")
            : "Saved entries and their sources are listed in your health timeline below."}</p>
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
  return (
    <section className={cardClass} aria-labelledby={headingId} aria-busy={loading}>
      <h2 id={headingId} className="text-2xl font-semibold">Health Timeline</h2>
      <p className="mt-2 text-pro-muted">Mother and baby entries, newest first. Each stays in its own record.</p>
      {loading ? <p className="mt-6" role="status">Loading saved demo observations…</p>
        : observations.length === 0 ? (
          <div className="mt-6 rounded-field border border-dashed border-pro-border p-5">
            <h3 className="font-semibold">Your timeline starts with one note</h3>
            <p className="mt-2 text-pro-muted">Add a fictional observation using the form. Your saved entry will appear here with its record and source.</p>
          </div>
        ) : (
          <ol className="mt-6 divide-y divide-pro-border">
            {observations.map((observation, index) => {
              const validDate = !Number.isNaN(Date.parse(observation.observedAt));
              return (
                <li key={`${observation.id}-${index}`} className="min-w-0 py-5 first:pt-0 last:pb-0">
                  <span className="inline-block rounded-control border border-pro-border bg-pro-surface px-3 py-1 font-medium">
                    {observation.recordType === "mother" ? "Mother's record" : "Baby's record"}
                  </span>
                  <h3 className="mt-3 break-words text-lg font-semibold [overflow-wrap:anywhere]">{observation.label}</h3>
                  <p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{observation.value}{observation.unit ? ` ${observation.unit}` : ""}</p>
                  <p className="mt-2 text-pro-muted">
                    {validDate ? <time dateTime={observation.observedAt}>{new Intl.DateTimeFormat("en-BD", {
                      dateStyle: "medium", ...(/^\d{4}-\d{2}-\d{2}$/.test(observation.observedAt) ? {} : { timeStyle: "short" as const }), timeZone: "Asia/Dhaka",
                    }).format(new Date(observation.observedAt))} (Dhaka)</time> : "Date unavailable"}
                  </p>
                  <p className="mt-1 text-pro-muted">Category: {observation.category ? allObservationCategories[observation.category] : "Not recorded"}</p>
                  <p className="mt-1 text-pro-muted">Source: {observation.source === "self_reported" ? "Self-reported" : observation.reviewStatus === "verified" && observation.reviewedAt && Number.isFinite(Date.parse(observation.reviewedAt)) && observation.reviewedBy?.trim() ? "Medical report (user-reviewed)" : observation.reviewStatus === "verified" ? "Medical report (review status unknown)" : "Medical report (not yet reviewed)"} · Not clinically verified</p>
                </li>
              );
            })}
          </ol>
        )}
    </section>
  );
}

export function HealthDashboard({ records, onSaved, episode, baby, motherName = demoMother.name, embedded = false }: { records?: HealthObservation[]; onSaved?: (records: HealthObservation[]) => void; episode?: PregnancyEpisode; baby?: BabyRecord; motherName?: string; embedded?: boolean } = {}) {
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
        <p className="font-semibold">Demo mode — fictional health information only.</p>
        <p className="mt-1 text-pro-muted">Authentication and the medical database are not connected yet. Entries stay in temporary browser storage; do not enter real patient information.</p>
      </aside>

      <header>
        <h1 className="text-3xl font-semibold leading-snug sm:text-4xl">Jibonrekha — <span lang="bn">জীবনরেখা</span></h1>
        <p className="mt-3 text-pro-muted">Your pregnancy journey and linked health records.</p>
        <AccessPreferencesControl />
      </header></>}

      <section className="min-w-0 rounded-hero border border-pro-border bg-pro-surface p-[var(--pro-pad-card)] sm:p-8" aria-labelledby={`${id}-overview`}>
        <h2 id={`${id}-overview`} className="text-2xl font-semibold">Pregnancy Overview</h2>
        <p className="mt-3 break-words text-xl">{motherName}</p>
        <dl className="mt-6 grid gap-6 sm:grid-cols-3">
          <div><dt className="text-pro-muted">Current pregnancy week</dt><dd className="mt-1 text-2xl font-semibold">{week !== undefined ? `${week} weeks ${dating?.days ?? 0} days` : "Dating unavailable"}</dd></div>
          <div><dt className="text-pro-muted">Estimated due date</dt><dd className="mt-1 text-lg font-semibold"><time dateTime={edd}>{edd || "Unknown"}</time></dd></div>
          <div><dt className="text-pro-muted">Linked baby record</dt><dd className="mt-1 text-lg font-semibold">{baby ? `${baby.label} (linked to selected pregnancy)` : "No baby recorded for this pregnancy"}</dd></div>
        </dl>
        {week !== undefined && <div className="mt-7">
          <label htmlFor={`${id}-progress`} className="font-semibold">Pregnancy timeline · {week} weeks of a 40-week reference</label>
          <progress id={`${id}-progress`} value={Math.min(week, 40)} max={40} aria-describedby={`${id}-progress-note`} className="mt-3 block h-3 w-full" style={{ accentColor: "var(--pro-primary)" }} />
          <p id={`${id}-progress-note`} className="mt-3 text-pro-muted">Estimate based on recorded dating. No diagnosis or prediction of delivery.</p>
        </div>}
        <p className="mt-3 text-pro-muted">EDD source: {episode?.eddSource ?? "Unknown"}. {dating?.warning}</p>
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






