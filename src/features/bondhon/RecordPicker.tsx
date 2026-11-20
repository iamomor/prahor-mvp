"use client";
import { useId, useState } from "react";
import type { z } from "zod";
import { useLanguage } from "@/i18n/use-language";
import type { availableRecordSchema } from "@/lib/contracts/coordination";
import { displayValue, fieldNames, recordNames, words } from "./bondhon-copy";
import { digits, formatWhen } from "./bondhon-view";
import { recordDescription, type JourneySelection } from "./bondhon-journey";
import styles from "./bondhon.module.css";
type RecordOption = z.infer<typeof availableRecordSchema>;
export function RecordPicker({ records, selection, onChange }: {
  records: readonly RecordOption[]; selection: JourneySelection; onChange: (next: JourneySelection) => void;
}) {
  const { language, t } = useLanguage();
  const id = useId();
  const [query, setQuery] = useState("");
  const needle = query.trim().normalize("NFKC").toLocaleLowerCase();
  const visible = records.filter(({ record }) => [t(recordNames[record.type]), recordDescription(record, language) ?? "", displayValue(record.fields)]
    .join(" ").normalize("NFKC").toLocaleLowerCase().includes(needle));
  function choose(key: string, fields: string[]) {
    const next = { ...selection };
    if (fields.length) next[key] = fields; else delete next[key];
    onChange(next);
  }
  return <section className={styles.choices} aria-labelledby={`${id}-title`}>
    <h3 id={`${id}-title`}>{t(words("Choose your records", "আপনার রেকর্ড বাছুন"))}</h3>
    <p>{t(words("Optional. Choose a record, or open its details to share individual fields. Nothing is selected automatically.", "ঐচ্ছিক। একটি রেকর্ড বাছুন, অথবা খুলে নির্দিষ্ট তথ্য বাছুন। কোনো কিছু স্বয়ংক্রিয়ভাবে বাছা হয় না।"))}</p>
    {records.length > 0 && <label className={styles.field}><span>{t(words("Find a record", "রেকর্ড খুঁজুন"))}</span>
      <input className="pro-input" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t(words("For example, blood pressure or haemoglobin", "যেমন রক্তচাপ বা হিমোগ্লোবিন"))} />
    </label>}
    <p role="status" className={styles.meta}>{t(words(`${visible.length} of ${records.length} available records`, `উপলব্ধ ${digits(records.length, "bn")}টি রেকর্ডের মধ্যে ${digits(visible.length, "bn")}টি`))}</p>
    {needle && !visible.length && <p>{t(words("No matching record. Try another word or clear your search.", "মিলে এমন রেকর্ড নেই। অন্য শব্দ লিখুন বা খোঁজার লেখা মুছুন।"))}</p>}
    <div className={styles.records}>{visible.map(({ record, recordedAt }) => {
      const key = `${record.type}/${record.id}`, fields = Object.keys(record.fields), selected = selection[key] ?? [];
      const title = recordDescription(record, language);
      return <article key={key} data-record-key={key} className={styles.record}>
        <label className={styles.check}>
          <input type="checkbox" checked={fields.length > 0 && fields.every(field => selected.includes(field))}
            aria-checked={selected.length && !fields.every(field => selected.includes(field)) ? "mixed" : undefined}
            onChange={event => choose(key, event.target.checked ? fields : [])} />
          <span><strong>{title ?? t(recordNames[record.type])}</strong><br />
            <span className={styles.meta}>{t(recordNames[record.type])} · {formatWhen(recordedAt, language, Number.NaN)}</span><br />
            {t(words(`Selected fields: ${selected.length} of ${fields.length}`, `বাছা তথ্য: ${digits(fields.length, "bn")}টির মধ্যে ${digits(selected.length, "bn")}টি`))}
          </span>
        </label>
        <details><summary>{t(words("Review values and choose individual fields", "মান দেখুন ও নির্দিষ্ট তথ্য বাছুন"))}</summary>
          {Object.entries(record.fields).map(([field, value]) => <label className={styles.check} key={field}>
            <input type="checkbox" checked={selected.includes(field)} onChange={event => choose(key, event.target.checked ? [...selected, field] : selected.filter(item => item !== field))} />
            <span><strong>{t(fieldNames[field] ?? words(field, field))}</strong><br />{displayValue(value)}</span>
          </label>)}
        </details>
      </article>;
    })}</div>
  </section>;
}
