# Replace the local save in ReportReview.tsx (account mode only)

Today (about lines 107-140) `save()` builds HealthObservation[] and calls `saveDemoObservations(observations)` = browser storage.
Keep that for the public demo (/demo/bujhi). On /app/bujhi (authenticated) do this instead:

```ts
// once per review attempt (useRef so a retry reuses it)
const reportId = useRef(crypto.randomUUID()).current;

async function saveToAccount() {
  const decisions = fields
    .filter(f => f.destination === "mother")              // only fields the mother routed
    .map(f => isSupportedHemoglobin(f)                    // label via isHemoglobinLabel(), unit g/dL
      ? { fieldId: f.id, decision: f.edited ? "corrected" : "accepted", kind: "hemoglobin",
          value: f.value, unit: "g/dL", observedOn: f.observedOn,
          rawLabel: f.rawLabel, rawValue: f.rawValue, rawUnit: f.rawUnit }
      : { fieldId: f.id, decision: "rejected", rawLabel: f.rawLabel, rawValue: f.rawValue, rawUnit: f.rawUnit }); // hCG etc.
  const r1 = await fetch("/api/reports/reviews", { method: "POST", headers: {"content-type":"application/json"},
    body: JSON.stringify({ reportId, pregnancyId, engine: "tesseract.js", engineVersion: "7", sourceSha256: sourceFileId,
                           decisions, reviewedByMother: true }) });
  if (!r1.ok) return showError(r1.status);
  const { review } = await r1.json();
  const r2 = await fetch("/api/reports/commit", { method: "POST", headers: {"content-type":"application/json"},
    body: JSON.stringify({ reviewId: review.id, expectedReviewRevision: review.revision, confirmSave: true }) });
  if (!r2.ok) return showError(r2.status);   // 409 = already changed, 404 = not yours
  setDone("saved to your account");           // only AFTER the 200
}
```
Rules: success text only after the commit returns 200; on failure keep the review on screen and say "not saved". The words "saved on this device" stay only for the demo.
Needs: a pregnancyId. Until Jibonrekha tables exist, Ifty/Omor must expose one (or create a default pregnancy_records row).
