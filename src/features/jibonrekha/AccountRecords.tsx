"use client";

import { AccessPreferencesControl } from "@/components/accessibility/AccessPreferencesControl";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";


type Pregnancy = {
  id: string;
  label: string;
  estimated_due_date: string | null;
  last_menstrual_period_date: string | null;
};
type Baby = {
  id: string;
  pregnancy_id: string | null;
  label: string;
  birth_date: string | null;
};
type Observation = {
  id: string;
  subject: "mother" | "baby";
  pregnancy_id?: string | null;
  baby_id?: string;
  kind: string;
  value: string;
  unit: string | null;
  observed_at: string;
  source: string;
  verification: string;
};
type Condition = {
  id: string;
  pregnancy_id: string | null;
  label: string;
  documented_at: string;
  source_note: string | null;
};
type SymptomNote = {
  id: string;
  pregnancy_id: string | null;
  note: string;
  occurred_at: string;
};
type Visit = {
  id: string;
  subject: "mother" | "baby";
  pregnancy_id: string | null;
  baby_id: string | null;
  occurred_at: string;
  place_note: string | null;
  note: string | null;
};
type Correction = {
  id: string;
  subject: "mother" | "baby";
  old_observation_id: string;
  new_observation_id: string;
  reason: string;
  corrected_at: string;
};
type Records = {
  pregnancies: Pregnancy[];
  babies: Baby[];
  observations: Observation[];
  conditions: Condition[];
  symptomNotes: SymptomNote[];
  visits: Visit[];
  corrections: Correction[];
};
const box = "rounded-card border border-pro-border bg-pro-surface p-4 sm:p-6";
const input =
  "min-h-11 w-full rounded-field border border-pro-border bg-pro-bg px-3 py-2 text-pro-text focus-visible:outline-3 focus-visible:outline-pro-focus";
const action =
  "min-h-11 rounded-field bg-pro-primary px-4 py-2 font-semibold text-pro-on-primary focus-visible:outline-3 focus-visible:outline-pro-focus disabled:opacity-60";
const labels: Record<string, string> = {
  weight: "Weight",
  temperature: "Temperature",
  systolic_blood_pressure: "Systolic blood pressure",
  diastolic_blood_pressure: "Diastolic blood pressure",
  hemoglobin: "Hemoglobin",
  glucose: "Glucose",
  fetal_heart_rate: "Fetal heart rate",
  note: "Note",
};
const choices = {
  mother: [
    ["weight", "kg"],
    ["temperature", "Cel"],
    ["systolic_blood_pressure", "mm[Hg]"],
    ["diastolic_blood_pressure", "mm[Hg]"],
    ["hemoglobin", "g/dL"],
    ["glucose", "mmol/L"],
    ["note", ""],
  ],
  baby: [
    ["weight", "kg"],
    ["temperature", "Cel"],
    ["fetal_heart_rate", "/min"],
    ["note", ""],
  ],
} as const;
];

function today() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date())
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
}

export function AccountRecords() {
  const [records, setRecords] = useState<Records | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [subject, setSubject] = useState<"mother" | "baby">("mother");
  const [kind, setKind] = useState("weight");
  const [unit, setUnit] = useState("kg");
  const [pregnancyId, setPregnancyId] = useState("");
  const [babyId, setBabyId] = useState("");
  const [task, setTask] = useState<Task>("home");
  const [noteKind, setNoteKind] = useState<"symptom" | "condition">("symptom");
  const taskHeading = useRef<HTMLHeadingElement>(null);
  const errorFocus = useRef<HTMLDivElement>(null);
  const pendingRequest = useRef<{ payload: string; key: string } | null>(null);
  const [correctingId, setCorrectingId] = useState<string | null>(null);
  function openTask(next: Task) {
    setTask(next);
    requestAnimationFrame(() => taskHeading.current?.focus());
  }
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/jibonrekha", { cache: "no-store" });
      if (!response.ok)
        throw new Error("Account records could not be loaded. Try again.");
      const next = (await response.json()) as Records;
      setRecords(next);
      setBabyId((previous) => previous || next.babies[0]?.id || "");
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Account records could not be loaded.",
      );
      requestAnimationFrame(() => errorFocus.current?.focus());
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  async function save(payload: unknown, form: HTMLFormElement, label: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const body = JSON.stringify(payload);
      if (pendingRequest.current?.payload !== body)
        pendingRequest.current = { payload: body, key: crypto.randomUUID() };
      const response = await fetch("/api/jibonrekha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": pendingRequest.current.key,
        },
        body,
      });
      const result = (await response.json()) as {
        saved?: boolean;
        id?: string;
        message?: string;
      };
      if (!response.ok || !result.saved || !result.id)
        throw new Error(
          result.message ||
            "Nothing was saved. Check the fields and try again.",
        );
      pendingRequest.current = null;
      setMessage(`${label} saved to your account. Fictional demo data only.`);
      form.reset();
      setCorrectingId(null);
      await load();
      openTask("records");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Nothing was saved. Check your connection and try again.",
      );
      requestAnimationFrame(() => errorFocus.current?.focus());
    } finally {
      setBusy(false);
    }
  }
  function selectSubject(next: "mother" | "baby") {
    setSubject(next);
    setKind("weight");
    setUnit("kg");
  }

  function historyFor(id: string) {
    const history: { record: Observation; reason: string }[] = [];
    let current = id;
    while (records && history.length < 20) {
      const correction = records.corrections.find(
        (item) => item.new_observation_id === current,
      );
      if (!correction) break;
      const previous = records.observations.find(
        (item) => item.id === correction.old_observation_id,
      );
      if (!previous) break;
      history.push({ record: previous, reason: correction.reason });
      current = previous.id;
    }
    return history;
  }

        </div>
      )}
      {loading ? (
        <p role="status">Loading account records…</p>
      ) : (
        records && (
          <>
            <nav
              aria-label="Jibonrekha quick actions"
              className="grid gap-2 sm:grid-cols-2"
            >
              {task !== "home" && (
                <button
                  type="button"
                  onClick={() => openTask("home")}
                  className="min-h-12 rounded-field border border-pro-border bg-pro-bg px-4 py-2 text-left font-semibold focus-visible:outline-3 focus-visible:outline-pro-focus sm:col-span-2"
                >
                  ← All options
                </button>
              )}
              {task !== "home" && (
                <label className="grid gap-1 sm:col-span-2">
                  Jump to another task
                  <select
                    value={task}
                    onChange={(event) => openTask(event.target.value as Task)}
                    className={input}
                  >
                    {tasks.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {task === "home" &&
                tasks.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openTask(item.id)}
                    className={`min-h-16 rounded-card border border-pro-border px-4 py-3 text-left focus-visible:outline-3 focus-visible:outline-pro-focus ${index === 0 ? "bg-pro-primary text-pro-on-primary" : "bg-pro-elevated text-pro-text"}`}
                  >
                    <span className="block font-semibold">{item.label} →</span>
                    <span
                      className={`block text-sm ${index === 0 ? "text-pro-on-primary-muted" : "text-pro-muted"}`}
                    >
                      {item.hint}
                    </span>
                  </button>
                ))}
              {task === "home" && (
                <Link
                  href="/app/bujhi"
                  className="flex min-h-16 flex-col justify-center rounded-card border border-pro-border bg-pro-elevated px-4 py-3 text-left focus-visible:outline-3 focus-visible:outline-pro-focus"
                >
                  <span className="font-semibold">Review a report →</span>
                  <span className="text-sm text-pro-muted">
                    Open Bujhi before saving extracted values
                  </span>
                </Link>
              )}
            </nav>
            <section
              hidden={task !== "home"}
              className={`${box} grid gap-3`}
              aria-label="Recent account activity"
            >
              <h2 className="text-xl font-semibold">At a glance</h2>
              <p>
                {records.pregnancies.length} pregnancies ·{" "}
                {records.babies.length} baby records ·{" "}
                {activeObservations.length} measurements and notes ·{" "}
                {records.visits.length} visits
              </p>
              {activeObservations.length ? (
                <div>
                  <h3 className="font-semibold">Most recent</h3>
                  <ul className="grid gap-2">
                    {activeObservations.slice(0, 3).map((item) => (
                      <li
                        key={item.id}
                        className="border-t border-pro-border pt-2"
                      >
                        {item.subject === "baby" ? "Baby" : "Mother"} ·{" "}
                        {labels[item.kind] ?? item.kind}: {item.value}
                        {item.unit ? ` ${item.unit}` : ""} ·{" "}
                        {formatDate(item.observed_at)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>
                  No account observations yet. Choose “Add a measurement” to
                  begin.
                </p>
              )}
            </section>
            <h2
              ref={taskHeading}
              tabIndex={-1}
              className="text-2xl font-semibold focus-visible:outline-3 focus-visible:outline-pro-focus"
              hidden={task === "home"}
            >
              {tasks.find((item) => item.id === task)?.label}
            </h2>
            <section
              hidden={task !== "pregnancy"}
              aria-label="Create a pregnancy record"
            >
              <form
                className={`${box} grid gap-3`}
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  void save(
                    {
                      type: "pregnancy",
                      record: {
                        label: data.get("label"),
                        estimatedDueDate: data.get("due") || null,
                        lastMenstrualPeriodDate: data.get("period") || null,
                      },
                    },
                    form,
                    "Pregnancy",
                  );
                }}
              >
                <h2 className="text-xl font-semibold">Add a pregnancy</h2>
                <label className="grid gap-1">
                  Name for this pregnancy
                  <input
                    name="label"
                    maxLength={100}
                    required
                    className={input}
                    placeholder="e.g. Pregnancy 1"
                  />
                </label>
                <label className="grid gap-1">
                  Estimated due date (optional)
                  <input name="due" type="date" className={input} />
                </label>
                <label className="grid gap-1">
                  First day of last period (optional)
                  <input name="period" type="date" className={input} />
                </label>
                <p className="text-pro-muted">
                  Dates are recorded as you entered them. PROHOR does not
                  calculate or confirm a clinical due date.
                </p>
                <button disabled={busy} className={action}>
                  Save pregnancy
                </button>
              </form>
            </section>
            <section hidden={task !== "baby"} aria-label="Create a baby record">
              <form
                className={`${box} grid gap-3`}
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  void save(
                    {
                      type: "baby",
                      record: {
                        label: data.get("label"),
                        pregnancyId: data.get("pregnancy") || null,
                        birthDate: data.get("birth") || null,
                      },
                    },
                    form,
                    "Baby record",
                  );
                }}
              >
                <h2 className="text-xl font-semibold">Add a baby record</h2>
                <label className="grid gap-1">
                  Baby record name
                  <input
                    name="label"
                    maxLength={100}
                    required
                    className={input}
                    placeholder="e.g. Baby A"
                  />
                </label>
                <label className="grid gap-1">
                  Related pregnancy (optional)
                  <select name="pregnancy" className={input}>
                    <option value="">No pregnancy selected</option>
                    {records.pregnancies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1">
                  Birth date (optional)
                  <input
                    name="birth"
                    type="date"
                    max={today()}
                    className={input}
                  />
                </label>
                <p className="text-pro-muted">
                  Each baby has a separate record. More than one baby can be
                  linked to the same pregnancy.
                </p>
                <button disabled={busy} className={action}>
                  Save baby record
                </button>
              </form>
            </section>
            <section
              hidden={task !== "observation"}
              className={`${box} grid gap-4`}
              aria-label="Record a measurement or note"
            >
              <p>
                Choose a person, enter the value, then save. Your entry keeps
                its date and source.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  Whose record?
                  <select
                    value={subject}
                    onChange={(event) =>
                      selectSubject(event.target.value as "mother" | "baby")
                    }
                    className={input}
                  >
                    <option value="mother">Mother</option>
                    <option value="baby">Baby</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  Pregnancy context
                  <select
                    value={pregnancyId}
                    onChange={(event) => setPregnancyId(event.target.value)}
                    className={input}
                  >
                    <option value="">No pregnancy selected</option>
                    {records.pregnancies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {subject === "baby" && (
                <label className="grid gap-1">
                  Baby
                  <select
                    value={selectedBabyId}
                    onChange={(event) => setBabyId(event.target.value)}
                    className={input}
                  >
                    <option value="">Choose a baby</option>
                    {visibleBabies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <form
                className="grid gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  const date = String(data.get("date"));
                  void save(
                    {
                      type: "observation",
                      record: {
                        destination:
                          subject === "mother"
                            ? { subject, pregnancyId: pregnancyId || null }
                            : { subject, babyId: selectedBabyId },
                        measurement: {
                          kind,
                          value: data.get("value"),
                          unit: kind === "note" ? null : unit,
                        },
                        observedAt: `${date}T00:00:00+06:00`,
                        sourceNote: null,
                      },
                    },
                    form,
                    "Observation",
                  );
                }}
              >
                <label className="grid gap-1">
                  Type
                  <select
                    value={kind}
                    onChange={(event) => {
                      const selected = choices[subject].find(
                        (choice) => choice[0] === event.target.value,
                      );
                      setKind(selected?.[0] ?? "weight");
                      setUnit(selected?.[1] ?? "kg");
                    }}
                    className={input}
                  >
                    {choices[subject].map(([value]) => (
                      <option key={value} value={value}>
                        {labels[value]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1">
                  {kind === "note" ? "Note" : `${labels[kind]} value`}
                  {kind === "note" ? (
                    <textarea
                      name="value"
                      required
                      maxLength={2000}
                      className={input}
                    />
                  ) : (
                    <input
                      name="value"
                      required
                      inputMode="decimal"
                      pattern="-?[0-9]{1,9}(\.[0-9]{1,6})?"
                      className={input}
                    />
                  )}
                </label>
                {kind !== "note" &&
                  (unitOptions[kind] ? (
                    <label className="grid gap-1">
                      Unit
                      <select
                        value={unit}
                        onChange={(event) => setUnit(event.target.value)}
                        className={input}
                      >
                        {unitOptions[kind].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <p>Unit: {unit}</p>
                  ))}
                <label className="grid gap-1">
                  Date observed
                  <input
                    name="date"
                    type="date"
                    defaultValue={today()}
                    max={today()}
                    required
                    className={input}
                  />
                </label>
                <p className="text-pro-muted">
                  Blood pressure numbers are saved separately. Enter values as
                  recorded; no diagnosis or automatic interpretation is
                  provided.
                </p>
                <button
                  disabled={busy || (subject === "baby" && !selectedBabyId)}
                  className={action}
                >
                  Save to account
                </button>
              </form>
            </section>
            <section
              hidden={task !== "note"}
              className="grid gap-4 sm:grid-cols-2"
              aria-label="Write a health note"
            >
              <form
                className={`${box} grid gap-3`}
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  void save(
                    {
                      type: "condition",
                      record: {
                        pregnancyId: data.get("pregnancy") || null,
                        label: data.get("label"),
                        documentedAt: `${data.get("date")}T00:00:00+06:00`,
                        sourceNote: data.get("sourceNote") || null,
                      },
                    },
                    form,
                    "Self-noted condition",
                  );
                }}
              >
                <h2 className="text-xl font-semibold">Condition you noted</h2>
                <p>
                  This is your own note. It does not create a clinical
                  diagnosis.
                </p>
                <label className="grid gap-1">
                  What would you like to record?
                  <input
                    name="label"
                    maxLength={300}
                    required
                    className={input}
                  />
                </label>
                <label className="grid gap-1">
                  Pregnancy (optional)
                  <select name="pregnancy" className={input}>
                    <option value="">No pregnancy selected</option>
                    {records.pregnancies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1">
                  Date noted
                  <input
                    name="date"
                    type="date"
                    defaultValue={today()}
                    max={today()}
                    required
                    className={input}
                  />
                </label>
                <label className="grid gap-1">
                  Where did this information come from? (optional)
                  <input name="sourceNote" maxLength={500} className={input} />
                </label>
                <button disabled={busy} className={action}>
                  Save your note
                </button>
              </form>
              <form
                className={`${box} grid gap-3`}
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  void save(
                    {
                      type: "symptom_note",
                      record: {
                        pregnancyId: data.get("pregnancy") || null,
                        note: data.get("note"),
                        occurredAt: `${data.get("date")}T00:00:00+06:00`,
                      },
                    },
                    form,
                    "Symptom note",
                  );
                }}
              >
                <h2 className="text-xl font-semibold">Symptom note</h2>
                <p>
                  Keep words for a future conversation with a care professional.
                </p>
                <label className="grid gap-1">
                  Your note
                  <textarea
                    name="note"
                    maxLength={2000}
                    required
                    className={input}
                  />
                </label>
                <label className="grid gap-1">
                  Pregnancy (optional)
                  <select name="pregnancy" className={input}>
                    <option value="">No pregnancy selected</option>
                    {records.pregnancies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1">
                  Date
                  <input
                    name="date"
                    type="date"
                    defaultValue={today()}
                    max={today()}
                    required
                    className={input}
                  />
                </label>
                <button disabled={busy} className={action}>
                  Save symptom note
                </button>
              </form>
            </section>
            <section
              hidden={task !== "visit"}
              className={`${box} grid gap-3`}
              aria-label="Record a visit"
            >
              <p>
                Keep a record of a visit that happened. This does not book an
                appointment or confirm a provider response.
              </p>
              <form
                className="grid gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form);
                  void save(
                    {
                      type: "visit",
                      record: {
                        subject,
                        parentId:
                          subject === "mother"
                            ? pregnancyId || null
                            : selectedBabyId || null,
                        occurredAt: `${data.get("date")}T00:00:00+06:00`,
                        placeNote: data.get("place") || null,
                        note: data.get("note") || null,
                      },
                    },
                    form,
                    "Visit",
                  );
                }}
              >
                <label className="grid gap-1">
                  Whose visit?
                  <select
                    value={subject}
                    onChange={(event) =>
                      selectSubject(event.target.value as "mother" | "baby")
                    }
                    className={input}
                  >
                    <option value="mother">Mother</option>
                    <option value="baby">Baby</option>
                  </select>
                </label>
                {subject === "mother" ? (
                  <label className="grid gap-1">
                    Pregnancy (optional)
                    <select
                      value={pregnancyId}
                      onChange={(event) => setPregnancyId(event.target.value)}
                      className={input}
                    >
                      <option value="">No pregnancy selected</option>
                      {records.pregnancies.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="grid gap-1">
                    Baby
                    <select
                      value={selectedBabyId}
                      onChange={(event) => setBabyId(event.target.value)}
                      className={input}
                    >
                      <option value="">Choose a baby</option>
                      {visibleBabies.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="grid gap-1">
                  Visit date
                  <input
                    name="date"
                    type="date"
                    defaultValue={today()}
                    max={today()}
                    required
                    className={input}
                  />
                </label>
                <label className="grid gap-1">
                  Place (optional)
                  <input name="place" maxLength={300} className={input} />
                </label>
                <label className="grid gap-1">
                  What would you like to remember? (optional)
                  <textarea name="note" maxLength={2000} className={input} />
                </label>
                <button
                  disabled={busy || (subject === "baby" && !selectedBabyId)}
                  className={action}
                >
                  Save visit
                </button>
              </form>
            </section>
            <section
              hidden={task !== "records"}
              className={`${box} grid gap-4`}
              aria-label="Saved account records"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  Show records for
                  <select
                    value={subject}
                    onChange={(event) =>
                      selectSubject(event.target.value as "mother" | "baby")
                    }
                    className={input}
                  >
                    <option value="mother">Mother</option>
                    <option value="baby">Baby</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  Pregnancy
                  <select
                    value={pregnancyId}
                    onChange={(event) => setPregnancyId(event.target.value)}
                    className={input}
                  >
                    <option value="">All pregnancies</option>
                    {records.pregnancies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                {subject === "baby" && (
                  <label className="grid gap-1">
                    Baby
                    <select
                      value={selectedBabyId}
                      onChange={(event) => setBabyId(event.target.value)}
                      className={input}
                    >
                      <option value="">Choose a baby</option>
                      {visibleBabies.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <h3 className="font-semibold">
                {subject === "mother" ? "Mother’s" : "Selected baby’s"}{" "}
                observations
              </h3>
              {visible.length ? (
                <ul className="grid gap-2">
                  {visible.map((item) => (
                    <li
                      key={item.id}
                      className="grid gap-2 rounded-field border border-pro-border p-3"
                    >
                      <strong>
                        {labels[item.kind] ?? item.kind}: {item.value}
                        {item.unit ? ` ${item.unit}` : ""}
                      </strong>
                      <p>
                        <time dateTime={item.observed_at}>
                          {formatDate(item.observed_at)}
                        </time>{" "}
                        ·{" "}
                        {item.source === "document_extracted"
                          ? "Extracted from report · checked by you · not clinician-verified"
                          : "Recorded by you · not clinician-verified"}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setCorrectingId(
                            item.id === correctingId ? null : item.id,
                          )
                        }
                        className="w-fit min-h-11 rounded-field border border-pro-border px-3 py-2 font-semibold text-pro-primary"
                      >
                        {item.id === correctingId
                          ? "Cancel correction"
                          : "Correct this entry"}
                      </button>
                      {item.id === correctingId && (
                        <form
                          className="grid gap-3 border-t border-pro-border pt-3"
                          onSubmit={(event) => {
                            event.preventDefault();
                            const form = event.currentTarget;
                            const data = new FormData(form);
                            void save(
                              {
                                type: "correction",
                                record: {
                                  subject: item.subject,
                                  observationId: item.id,
                                  value: data.get("value"),
                                  unit:
                                    item.kind === "note"
                                      ? null
                                      : data.get("unit"),
                                  reason: data.get("reason"),
                                },
                              },
                              form,
                              "Correction",
                            );
                          }}
                        >
                          <p>
                            The original entry will remain in history. A
                            corrected report value becomes self-reported.
                          </p>
                          <label className="grid gap-1">
                            Correct value
                            <input
                              name="value"
                              defaultValue={item.value}
                              required
                              maxLength={2000}
                              className={input}
                            />
                          </label>
                          {item.kind !== "note" && (
                            <label className="grid gap-1">
                              Unit
                              <select
                                name="unit"
                                defaultValue={item.unit ?? ""}
                                className={input}
                              >
                                {(
                                  unitOptions[item.kind] ?? [item.unit ?? ""]
                                ).map((value) => (
                                  <option key={value} value={value}>
                                    {value}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}
                          <label className="grid gap-1">
                            Reason for correction
                            <input
                              name="reason"
                              required
                              maxLength={500}
                              className={input}
                            />
                          </label>
                          <button disabled={busy} className={action}>
                            Save correction
                          </button>
                        </form>
                      )}
                      {historyFor(item.id).length > 0 && (
                        <details>
                          <summary className="cursor-pointer font-semibold">
                            Correction history ({historyFor(item.id).length})
                          </summary>
                          <ul className="grid gap-2 pt-2">
                            {historyFor(item.id).map((previous) => (
                              <li
                                key={previous.record.id}
                                className="border-t border-pro-border pt-2"
                              >
                                Previous: {previous.record.value}
                                {previous.record.unit
                                  ? ` ${previous.record.unit}`
                                  : ""}{" "}
                                · {formatDate(previous.record.observed_at)}
                                <br />
                                Reason: {previous.reason}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No observations in this selected record.</p>
              )}
              <details className="border-t border-pro-border pt-3">
                <summary className="cursor-pointer font-semibold">
                  Pregnancies and babies
                </summary>
                <div className="grid gap-4 pt-3 sm:grid-cols-2">
                  <div>
                    <h4 className="font-semibold">Pregnancies</h4>
                    {records.pregnancies.length ? (
                      <ul className="list-disc pl-5">
                        {records.pregnancies.map((item) => (
                          <li key={item.id}>
                            {item.label}
                            {item.estimated_due_date
                              ? ` · Due date entered: ${item.estimated_due_date}`
                              : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No account pregnancy yet.</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">Babies</h4>
                    {records.babies.length ? (
                      <ul className="list-disc pl-5">
                        {records.babies.map((item) => (
                          <li key={item.id}>
                            {item.label}
                            {item.birth_date
                              ? ` · Born ${item.birth_date}`
                              : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No account baby record yet.</p>
                    )}
                  </div>
                </div>
              </details>
              <Link
                href="/app/bujhi"
                className="font-semibold text-pro-primary underline"
              >
                Review a report in Bujhi
              </Link>
            </section>
          </>
        )
      )}
      {records && (
        <section
          hidden={task !== "records"}
          className={`${box} grid gap-4`}
          aria-label="Self-noted history"
        >
          <h3 className="font-semibold">Your self-noted history</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="font-semibold">Conditions you noted</h4>
              {records.conditions.length ? (
                <ul className="grid gap-2">
                  {records.conditions.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-field border border-pro-border p-3"
                    >
                      <strong>{item.label}</strong>
                      <p>
                        {formatDate(item.documented_at)} · Self-reported · Not a
                        confirmed diagnosis
                      </p>
                      {item.source_note && (
                        <p>Source note: {item.source_note}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nothing noted yet.</p>
              )}
            </div>
            <div>
              <h4 className="font-semibold">Symptom notes</h4>
              {records.symptomNotes.length ? (
                <ul className="grid gap-2">
                  {records.symptomNotes.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-field border border-pro-border p-3"
                    >
                      <p>{item.note}</p>
                      <p>{formatDate(item.occurred_at)} · Recorded by you</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No symptom notes yet.</p>
              )}
            </div>
          </div>
          <h3 className="font-semibold">Visits you recorded</h3>
          {records.visits.length ? (
            <ul className="grid gap-2">
              {records.visits.map((item) => (
                <li
                  key={item.id}
                  className="rounded-field border border-pro-border p-3"
                >
                  <strong>
                    {item.subject === "baby" ? "Baby" : "Mother"} ·{" "}
                    {formatDate(item.occurred_at)}
                  </strong>
                  <p>
                    Recorded by you · No appointment or provider response
                    confirmed
                  </p>
                  {item.place_note && <p>Place: {item.place_note}</p>}
                  {item.note && <p>{item.note}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No account visits recorded yet.</p>
          )}
        </section>
      )}
      <details className="rounded-field border border-pro-border px-4 py-3">
        <summary className="cursor-pointer font-semibold">
          About this prototype
        </summary>
        <p className="pt-2">
          Account records hold synthetic data only. The nine-section Jibonrekha
          demonstration has additional fields saved in this browser only.
        </p>
        <Link
          href="/demo/jibonrekha"
          className="font-semibold text-pro-primary underline"
        >
          Open the device-only demo
        </Link>
      </details>
    </div>
  );
}
