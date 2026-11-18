import type { HealthObservation } from "@/features/jibonrekha/demo-health";
import { fieldIssues, parseNumeric } from "./validation";
import { normalizeReport } from "./report-normalization";
import { reportFindings } from "./report-quality";
import type { ExtractedReport, ExtractedReportField } from "./types";
export function DataJudgement({ fields, report, existing = [] }: { fields: ExtractedReportField[]; report: ExtractedReport; existing?: HealthObservation[] }) {
  const findings = reportFindings(normalizeReport({ ...report, fields: fields.filter((field) => field.reviewStatus !== "rejected") }));
  return <section aria-label="Data Review and Guidance" className="grid min-w-0 gap-4 rounded-card border border-pro-border bg-pro-surface p-[var(--pro-pad-card)]">
    <h2 className="text-2xl font-semibold">Data Review &amp; Guidance — <span lang="bn">তথ্য যাচাই ও পরামর্শ</span></h2>
    <h3 className="text-xl font-semibold">Data quality assessment</h3>
    {findings.length > 0 && <ul className="list-disc pl-5">{findings.map((finding, index) => <li key={index}>{finding.message}</li>)}</ul>}
    <ul className="grid gap-3">{fields.map((field) => {
      const issues = fieldIssues(field, report.observedAt), numeric = parseNumeric(field.value);
      const duplicate = fields.some((other) => other.id !== field.id && other.label.trim().toLowerCase() === field.label.trim().toLowerCase() && other.value === field.value && other.destination === field.destination);
      const savedMatch = existing.some((item) => item.sourceReportId !== report.id && item.recordType === field.destination && item.label.trim().toLowerCase() === field.label.trim().toLowerCase() && item.value === field.value);
      return <li key={field.id} className="min-w-0"><strong>{field.label || "Unnamed field"}: {field.reviewStatus === "rejected" ? "Excluded" : issues.errors.length ? "Needs correction" : issues.warnings.length ? "Unable to determine — check source" : "Ready for review"}</strong>
        <ul className="list-disc pl-5">{[...issues.errors, ...issues.warnings, ...(duplicate ? ["Potential duplicate within this draft. Exclude repeated fields before saving."] : []), ...(savedMatch ? ["A saved observation has the same name, value, and destination. Dates may differ; check whether this is a duplicate before saving."] : [])].map((issue) => <li key={issue}>{issue}</li>)}</ul>
        {numeric.kind === "number" && numeric.normalized !== field.value && <p>Original: {field.value}. Candidate normalization: {numeric.normalized}. The original is kept; normalization requires your explicit selection.</p>}
      </li>;
    })}</ul>
    <h3 className="text-xl font-semibold">Medical review guidance</h3>
    <p>This information has not been clinically verified. Printed reference intervals depend on laboratory methods and clinical context. A healthcare professional should interpret results with symptoms, medical history, and other tests.</p>
    <p>Incomplete or uncertain extraction must be checked against the original report. No pregnancy diagnosis, gestational-age estimate, viability prediction, treatment decision, or safety judgement is made from Beta-hCG or any other value here.</p>
  </section>;
}
