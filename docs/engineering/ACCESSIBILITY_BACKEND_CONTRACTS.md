# Accessibility backend contracts — 20 November 2026

These are the paths in the current source tree. All account POSTs require the configured site origin; private responses use no-store. The new migration files must be applied in a reviewed staging rollout before their new RPC-backed paths can succeed. No hosted database was changed here.

## Bujhi account review and save

`POST /api/reports/reviews` accepts `reportId`, `pregnancyId`, `fieldId` (UUIDs), `sourceSha256` (64 lowercase hex), `rawLabel`, `rawValue`, `rawUnit`, `reviewedValue`, `reviewedUnit`, `observedOn` (ISO date), and `decision` (`verified`, `pending`, `rejected`). It requires a signed-in mother who owns the pregnancy. A successful `201` returns `{ reviewId, fieldId, decision, savedToAccount: false }`. The decision is immutable for that report and field; a changed retry returns `409 review-conflict`. `400` means bad input, `403` denied, `503` unavailable. The browser must require a deliberate mother review action before sending `decision: verified`. The server records the authenticated reviewer and time, with the raw OCR value and corrected value separately.

`POST /api/reports/commit` accepts `{ reviewId, fieldId, confirmSave: true }`. It reads the stored decision and owner. Only a verified maternal hemoglobin field with reviewed unit `g/dL` can commit. Pending, rejected, hCG and other fields remain outside account storage. Success `200` returns `{ saved: true, observationId }`; a retry returns the same observation. Errors use `400`, `403`, `409`, or `503` and do not mean saved. `GET /api/jibonrekha` is the account read path after save. `AccountReportReview` now calls the review endpoint and then this commit endpoint; device-local Bujhi demo saves remain separate and clearly labelled.

## Phone authentication

`POST /api/auth/phone` with `{ action: "request", phone: "+8801XXXXXXXXX" }` asks Supabase Auth to send an SMS OTP. `202 { code: "otp-request-accepted", delivered: false }` means the request was accepted; it does not verify delivery. `503 auth-unconfigured` or `otp-unavailable`, and `429 rate-limited` are possible. `{ action: "verify", phone, token }` calls Supabase SMS verification and returns `200 { code: "phone-verified", accountId, onboardingRequired: true }` only when Supabase returns a session. Bad OTP returns `400 verification-failed`. A provider and post-verification onboarding/recovery integration are still required before phone registration is operational. `assistedBy` returns `501 assisted-registration-unavailable`: no care worker is granted the mother's identity or records. The screen supports a helper explaining steps while the mother enters her own number and code; it is not worker-authorized registration.

## Supporter invitations

Existing `POST /auth/account` supports `invite` with `supporterId`, `scopes`, `expiresAt`; it returns an opaque one-time `invitation.code` and ID after consent. `accept` with `code`, and `revoke` with `connectionId`, are backed by `prohor_invite_supporter`, `prohor_accept_supporter`, and `prohor_revoke_supporter`. `GET /auth/account` returns the mother's or supporter's connections. These RPCs enforce approved roles, expiry, scoped access, and account event records. The frontend sends `X-Prohor-Account` matching the current session. Phone-number discovery and QR rendering are not implemented; the code can be represented as QR only after a private, safe delivery design is agreed. No relationship alone grants medical record access.

## Notifications

Bondhon remains in-app polling. The additive `notification_opt_in` migration and `/api/notifications/preferences` store per-user SMS/push choices. There is no provider adapter or delivery receipt; the frontend says that opting in records the preference only. No notification is sent or marked delivered. In-app messages stay the source of truth.

## Poth access evidence

`GET /api/poth/access-evidence?facilityId=dghs/123` accepts up to 20 repeated facility IDs. `200` returns `{ claims: [...], absentClaims: "unknown" }`. Each verified claim has `facility_id`, `attribute`, `value`, `verification_status`, `verification_source`, `verified_by`, `verified_on`, `updated_at`. The additive `poth_access_evidence` table permits public reads only for verified rows and no direct table writes. A reviewer UI and database RPC are implemented; reviewer membership is administered directly by a database administrator. No reviewer has been enrolled in staging. Imported directory attributes remain reported or unknown, never automatically verified.

### Reviewer enrollment and removal

Only an authorized database administrator may do this in the confirmed staging project's SQL editor or a trusted admin session, after separately verifying the person's identity, reviewer authority and provider profile. Never expose these statements through an application endpoint or give ordinary users write access to `poth_access_reviewers`.

```sql
-- Enroll only a manually verified provider UUID; no row is inserted if the profile is absent or not a provider.
insert into public.poth_access_reviewers (user_id)
select user_id
from public.profiles
where user_id = '<verified-provider-uuid>'::uuid
  and role = 'provider'
on conflict (user_id) do nothing;

-- Remove that same manually verified UUID when reviewer authority ends.
delete from public.poth_access_reviewers
where user_id = '<verified-provider-uuid>'::uuid;
```

Confirm the affected-row count and query the membership row using the administrator session. Do not run against production during this task; no hosted database was modified.

## Offline

Service worker cache `prohor-public-shell-v5` installs `/offline`, `/offline-safety.txt`, and icons. It attempts to cache anonymous `/safety` only when response headers permit; otherwise the text file remains available. Previously visited allowed safety pages may be cached. AI conversations, account pages, medical reports and APIs are excluded. The bilingual static offline page links to 999, 16263 and the cached plain-text safety resource. Offline means no request or care message was sent.

## Remaining governance and external dependencies

- Easy Read has a versioned code registry and publishes only entries with reviewer attribution/date. It has no author/reviewer administration interface, and no human approval is recorded yet.
- Clinical source/review metadata is represented for selected content; clinical approval must be supplied by a real qualified reviewer before publication. No name, credential or review date is fabricated.
- BdSL registry/publication workflow and human-produced signed videos are not implemented. Do not claim BdSL content is available.
- Phone/QR supporter discovery and care-worker authorization are not implemented. Existing supporter invitations are opaque one-time codes with scope, expiry and revocation; the QR/phone delivery path remains unavailable.
- The five `2026112021*.sql` migrations were reviewed locally but not applied. No hosted Supabase project was identified or changed.
