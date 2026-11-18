# Local Barta integration — 17 November 2026

Iftee's `ba21ec4` was integrated into the current `omor` site, retaining Omor's
auth, Supabase, migrations and preferences foundation. No remote push, main-branch
change, database migration or deployment was performed.

## Journey and implementation

The user's job is to open public maternal education, ask a Bangla/English question,
and inspect the sources without creating an account. This is public information;
questions can still contain sensitive text, so the UI asks users to leave out
personal details and keeps the conversation in this tab's memory.

- Homepage hero and Barta card link to `/ask`.
- The chat calls the existing public `/api/ai/chat` endpoint. Successful supported
  questions return bundled passages and citations; unsupported questions abstain
  or ask for clarification. Errors retain the editable question for retry.
- A persistent adjustment button opens the shared `AccessPreferencesPanel` in a
  native modal. Saved appearance loads before paint. Escape/Close returns focus,
  and the existing chat stays mounted so its draft and transcript survive.
- A header link reaches general help text without making an AI request. This is
  not a clinician-reviewed Shonket module, care directory or delivery integration.
- English and Bangla notices explicitly identify an educational prototype,
  project reference checks and pending clinical review. No sign-in is required.
- API registry and documentation now describe the education payloads and optional
  audio endpoint. Chat reads at most 8 KiB of request JSON; audio reads at most
  16,000 bytes. Shared audio validation lives with Barta's contracts.
- Existing speech tests now mock the utterance along with synthetic voice objects.
  Error assertions are scoped to Barta; language checks respect inheritance.
  The stale callback smoke assertion now recognizes fail-closed missing site
  configuration and the current sign-in destination/private no-store response.

Component structure: `/ask` server page -> brand/navigation + `BartaAccessControl`
-> `AccessPreferencesPanel`; page content -> `BartaChatStarter` ->
`BartaEducationChat` -> answer/citations/audio controls. Existing semantic tokens
and components are reused. A narrow-screen adjustment-button overflow found with
enlarged text was fixed by allowing its label to wrap.

## Verification

| Check | Result |
| --- | --- |
| TypeScript and ESLint | Passed |
| Contract suite | 157 passed |
| Embedded DB regression tests | Passed: fresh, legacy/backfill and invalid-data rollback |
| Selected token contrast checks | Passed |
| Full public browser/HTTP suite, Edge against localhost:3000 | 51 passed, 1 navbar tooltip test failed once |
| Isolated retry of that unchanged navbar test | Passed; recorded as a flake, not a clean first-run full-suite pass |
| Barta browser tests in the full run | All passed, including the four formerly failing tests |
| New integration coverage | Homepage -> public chat, actual handler/catalog agreement, oversized-body rejection, keyboard submission, modal focus return, draft/transcript retention, help without chat |
| Barta access combinations | 320px, extra-large text, spacious layout, reduced motion, three themes x normal/higher contrast; no horizontal overflow; selected WCAG axe tags returned no violations |
| Production build | Passed; includes `/ask`, chat and optional audio route |
| Screenshot inspection | 320px and 1440px answered states inspected |

The full run's failed test was `navigation-polish.spec.ts`, "full-width navbar
stays flat and compact...", where Escape did not hide the tooltip within the
assertion timeout. The isolated retry passed without changing navigation code.

Screenshots:

- [320px](barta-local-integration/barta-320.png)
- [1440px](barta-local-integration/barta-1440.png)

## Capability boundaries and remaining QA

**Working, limited:** public text education, curated retrieval, bilingual answers,
source links, selected follow-ups, tab-local history and access settings.

**Optional / not verified live:** Gemini development preview, browser microphone
and real Bengali/English voices, Azure and local eSpeak. Browser tests use speech
mocks; they do not establish audio quality or live-service availability.

**Future / unavailable:** saved Barta transcripts, clinical review sign-off, live
clinical handoff and the full reviewed Shonket journey. The help text makes no
delivery claim. Public paid-service deployments still need durable abuse controls;
the existing audio throttle is process-local. No hosted Supabase test was run.

Manual screen-reader/device testing, 400% browser zoom and testing with people
with different access needs remain outstanding. No WCAG certification or clinical
validation is claimed. The earlier broader review remains at
`BARTA_INTEGRATION_REVIEW.md`; its findings describe the pre-integration snapshots.

Craft assessment for this limited local journey: hierarchy 4/5, typography 4/5,
responsive behavior 4/5, automated/keyboard access 4/5, error resilience 4/5,
privacy clarity 4/5, implementation 4/5. Clinical approval is incomplete and is
explicitly excluded from these implementation scores.
