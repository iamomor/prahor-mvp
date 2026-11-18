# Iftee code quality and performance review

Reviewed 17 November 2026 against local `omor` after integration commit `efbe998`.
Scope is **all 54 files** in `git diff --name-only 64bc196...ba21ec4`:
29 application/data files, 19 test files and six documents. This identifies Iftee's
branch contribution relative to its common base, rather than treating Omor's
newer platform files as deletions. The inventory is in
[iftee-file-inventory.json](barta-performance/iftee-file-inventory.json).

The user's existing uncommitted formatting changes in `/ask/page.tsx` were
preserved. No dependency upgrade, database migration, commit, push or main-branch
change was made during this review.

## Compatibility conclusion

Compatible with the **installed** Next.js 16.4.6, React 19.3.1, TypeScript 5.9.3
and Node 24.17.0 environment. This is not a claim about the newest upstream
release. App Router pages, route handlers, React hooks and CSS Modules compile.
The `/ask` page is statically generated; chat/audio execute on the server. Browser
APIs execute in effects or interaction handlers under a client boundary. Node
crypto/process/filesystem dependencies remain in the server audio path.

No obsolete Pages Router integration, additional Barta dependency installation,
AI secret in a client component or Supabase requirement for public text chat was
identified. The corpus and 808-question bank were not found in the built client
JavaScript when checked by their distinctive source-title/question-ID markers.

## Reproduced findings and fixes

| Priority | Finding and consequence | Action |
| --- | --- | --- |
| P2 | Typing re-rendered every previous answer and topic button. A synthetic 40-turn conversation materially increased browser scripting. | Memoized answers/options with stable, dependency-correct callbacks; memoized the locale-specific spoken guide. Earlier turns remain accessible and are not silently discarded. |
| P2 | The client accepted a valid non-grounded JSON response even with HTTP 503, appended a failed turn and erased the draft. | Non-success HTTP education responses retain the editable question and announce an error. A regression test failed before the fix and passes afterward. |
| P2 | Navigating home left the pending chat fetch alive, including its timeout and eventual state work. | Abort on unmount, ignore obsolete completions and prevent duplicate simultaneous submissions. A navigation-cancellation regression failed before the fix and passes afterward. |
| P2 | The visible shared brand link eagerly prefetched the entire homepage while Barta was opening. | Disabled speculative homepage prefetch on the brand link. Normal home navigation remains available; this is a small shared-component change outside Iftee's original 54 files. |
| P2 | English and Bangla postnatal passages each repeated the same two sentences. Text and read-aloud repeated them. | Removed only the exact duplicates, preserving every unique sentence. Added a duplicate-sentence content regression across the corpus. No new medical wording or clinical approval was added. |
| P3 | Day 1 API/source documents described obsolete setup behavior as current. | Marked the older handoffs historical and linked current contract/preview instructions. |

## Measurements

Production `next start`, loopback, installed Edge. API cases use 25 sequential
requests each; warm statistics exclude the first request. Browser typing uses a
synthetic 40-turn transcript with long cited answers, 4x CPU throttling, the same
64-character typing sequence and three repetitions. Figures below are medians
of aggregate browser work for that sequence, **not per-key input latency, INP,
clinical-response speed, field telemetry or a guarantee on real devices**.

| Measure | Before | After |
| --- | ---: | ---: |
| Browser scripting, typing at 1 turn | 276 ms | 138 ms |
| Browser scripting, typing at 40 turns | 1,107 ms | 148 ms |
| Browser total task time, typing at 40 turns | 1,990 ms | 626 ms |
| Observed Next JS transfer while opening Barta | 223,970 bytes | 181,759 bytes |
| Exact ANC API, warm median | 13.5 ms | 10.5 ms |
| Unsupported-question API, warm median | 15.1 ms | 15.6 ms |

That is about **87% less scripting** in the long-conversation sample and **19%
less observed JavaScript transfer**. Network/CPU/cache variability applies; the
API was already fast locally and is not the reproduced typing bottleneck.
No server retrieval optimization or AI response cache was introduced.

Raw results: [before](barta-performance/before.json),
[after](barta-performance/after.json). Reproduce with a separate local production
server on port 3012 and `node scripts/profile-barta.mjs <simple-label>`; set
`PROHOR_PROFILE_URL` for a different loopback port. The script uses synthetic
questions and speech-free synthetic answers, never real health records.

Separate initial-load samples before the fixes measured homepage TTFB ~21 ms,
DOMContentLoaded ~535 ms and fonts ready ~780 ms; Barta TTFB ~7 ms,
DOMContentLoaded ~265 ms and fonts ready ~562 ms. These are local samples, not
mobile-network/Lighthouse scores. The homepage's multiple font families and
Google Fonts CSS predate Iftee's changes. Development compilation, font/network
delays, large real conversations and device CPU remain distinct possible causes
of perceived slowness. Measure user-facing performance with `build` + `start`,
separately from `dev` first-route compilation.

The after benchmark preceded the final exact-duplicate cleanup in the two
postnatal passages. Its ANC/unsupported cases and synthetic typing responses do
not use those passages, so their inputs are unchanged by that cleanup.

## Remaining findings requiring review

- **P2, question-bank taxonomy:** 808 rows collapse to 796 normalized questions;
  eight overlapping records have differing topic/expectation metadata. Runtime
  currently selects the first record. Some differences are naming synonyms, but
  others mix labels such as educational and symptom assessment. They must be
  reconciled by Iftee/Omor and the content reviewer before claiming validated
  routing. No medical decision was changed automatically. Record pairs are in
  [question-bank-overlaps.json](barta-performance/question-bank-overlaps.json).
- **P2, optional speech resources:** Azure audio is buffered with `arrayBuffer()`
  before its two-megabyte check. The limit detects excess after allocation, rather
  than bounding the upstream stream. Audio's 12/minute counter is process-local,
  shared by callers and not a distributed production abuse control. These paths
  were not configured live and are not established causes of current typing lag.
- **Limited clinical/content status:** publisher allowlists, source dates,
  deterministic safety regexes and passing fixtures do not establish clinical
  review, complete symptom coverage, multilingual equivalence or source rights.
  Project reference checks remain distinct from clinician approval.
- **Long-session limit:** history remains in memory with all turns in the DOM.
  Memoization removes repeated answer rendering while typing, but does not make
  arbitrarily large sessions free. Consider an explicitly designed accessible
  history/pagination policy if field use regularly produces very long transcripts.
- **Live audio:** microphone permissions, installed voices, browser speech
  services, Azure and eSpeak can introduce their own waits. Existing timeouts and
  text fallbacks are present; real audio quality/network behavior was not tested.

## Every-file disposition

"Compatible" means the file fits the installed project and no additional concrete
integration defect was identified in this review. It is not certification or a
claim that the file cannot contain bugs. Data review here is structural and
editorial; medical/source assertions were not independently revalidated online.

| File | Review result |
| --- | --- |
| `src/app/(marketing)/ask/page.tsx` | Compatible server page; public entry, metadata and client chat boundary. User formatting preserved. |
| `src/app/(marketing)/barta-demo/page.tsx` | Compatible; development/flag guard, noindex and synthetic-only content. |
| `src/app/api/ai/barta-audio/route.ts` | Compatible Node route; strict signed text/guide input, SSML escaping, no-store and timeouts. Resource limitations above. |
| `src/app/api/ai/chat/route.ts` | Compatible public route; bounded body, safety before retrieval, daily per-process corpus cache, strict responses. Warm latency measured. |
| `src/components/marketing/care/CompanionStory.tsx` | Compatible; adds a public `/ask` link without importing chat/corpus into the homepage. |
| `src/features/barta/BartaAudioFile.tsx` | Compatible; user-triggered generation, native controls, abort and object-URL cleanup. Audio buffers remain per loaded turn until unmounted. |
| `src/features/barta/BartaChatStarter.tsx` | Fixed HTTP failure handling, request cleanup and duplicate-in-flight guard; stable selection callback. |
| `src/features/barta/BartaEducationChat.tsx` | Fixed history/option re-render work and repeated guide construction; native forms, citation details and live notices retained. |
| `src/features/barta/ai-intent-preview.ts` | Compatible; development-only external selector, server secret, bounded input, eight-second timeout and allowed-ID verification. Not tested live. |
| `src/features/barta/approved-corpus.ts` | Compatible server-only corpus assembly; project review basis explicit, no client database or clinical approval invented. |
| `src/features/barta/approved-knowledge.ts` | Compatible validated corpus/index; duplicate IDs/conflicting aliases, versions, expiry and paired translations checked. Unmatched questions scan aliases; no slow warm path reproduced. |
| `src/features/barta/audio-ticket.ts` | Compatible server HMAC; exact text/language/expiry binding, constant-time signature comparison and six-hour validity. |
| `src/features/barta/barta-education-copy.ts` | Compatible bilingual UI copy and fallback notices; header/shell localization remains limited. |
| `src/features/barta/barta-education.module.css` | Compatible token-based CSS Module; focus/reflow rules, no JS animation loop. Some secondary text below 1rem remains a design-policy follow-up. |
| `src/features/barta/barta-spoken-text.ts` | Compatible pure formatting; speech guide bounded and now memoized at its component call site. |
| `src/features/barta/bleeding-clarification.ts` | Compatible pure deterministic routing; clinical sign-off remains outstanding. |
| `src/features/barta/chat-language.ts` | Compatible bounded regex heuristics; selected Banglish aliases, not universal language detection. |
| `src/features/barta/conversation.ts` | Compatible localized exact greeting/help matches; mixed safety questions are not swallowed. |
| `src/features/barta/demo-questions.ts` | Compatible small shared synthetic prompt dictionary; safe in client demo controls. |
| `src/features/barta/education-corpus.ts` | Fixed repeated postnatal sentences in both languages; structural source/passage tests pass; clinical review still pending. |
| `src/features/barta/education-topics.ts` | Compatible 44-topic bilingual dictionary and typed IDs; no runtime network request. |
| `src/features/barta/local-speech.ts` | Compatible Node-only process; shell disabled, Windows hidden, timeout, output signature/size checks and owned temporary-directory cleanup. Not executed live. |
| `src/features/barta/question-bank-prompts.json` | Server data, 808 synthetic prompts; overlapping label records require reconciliation above. |
| `src/features/barta/question-bank-routing.ts` | Compatible deterministic lookup, but first-row collision policy needs content-owner review; no fabricated facility data. |
| `src/features/barta/question-matching.ts` | Compatible `Intl.Segmenter` typo matching; one-word edit constraints and protected intent words. Installed Node supports it. |
| `src/features/barta/safety-gate.ts` | Compatible bounded-input fixed-response path; no LLM urgency decision. Regex coverage is not clinical validation. |
| `src/features/barta/synthetic-demo.ts` | Compatible exact/normalized synthetic fixture answers with explicit fictional provenance; gated by route configuration. |
| `src/features/barta/use-barta-audio.ts` | Stabilized callbacks for memoization; voice timers, recognition cleanup, explicit start and text fallback retained. |
| `src/lib/contracts/barta.ts` | Compatible strict Zod discriminated unions and inferred types; shared audio contract; schemas alone do not prove citation support. |
| `tests/barta-audio.spec.ts` | Reviewed speech fixtures and controls; passes with the previously repaired native-utterance mocks. |
| `tests/barta-conversation-flow.spec.ts` | Reviewed real HTTP follow-ups, keyboard clarification, mobile context and reference expansion; passes. |
| `tests/barta-education.spec.ts` | Reviewed bilingual context/draft continuity and outage display; passes after current error handling. |
| `tests/barta-everyday-care.spec.ts` | Reviewed Auto/Banglish and 360px composer behavior; passes. |
| `tests/barta-safety-api.spec.ts` | Reviewed actual no-store fixed-response routing and rejection of private extra fields; passes. |
| `tests/contracts/barta-ai-retrieval.spec.ts` | Reviewed approved-shortlist selection, unknown IDs and upstream failure; passes. |
| `tests/contracts/barta-bleeding.spec.ts` | Reviewed deterministic clarification routing cases; passes; not clinical evidence. |
| `tests/contracts/barta-conversation.spec.ts` | Reviewed localized greeting, mixed-scope and help cases; passes. |
| `tests/contracts/barta-demo.spec.ts` | Reviewed synthetic bilingual fixtures, paraphrases and abstention; passes. |
| `tests/contracts/barta-education-corpus.spec.ts` | Reviewed source membership, translation pairing, expiry/host allowlist and retrieval ordering; passes. |
| `tests/contracts/barta-everyday-care.spec.ts` | Reviewed language heuristics, topic clarification and supported daily-care mappings; passes. |
| `tests/contracts/barta-expanded-education.spec.ts` | Reviewed content/subtopic assertions; passes; text assertions are not independent medical verification. |
| `tests/contracts/barta-hackathon.spec.ts` | Reviewed compound answers, claim/citation membership, synthetic urgency cases and corpus-wide prompts; passes. |
| `tests/contracts/barta-knowledge.spec.ts` | Reviewed version/review/expiry metadata, ambiguity, pending translations and project-vs-account review distinctions; passes. |
| `tests/contracts/barta-question-bank.spec.ts` | Reviewed bilingual aliases, noisy inputs and follow-up context; passes. |
| `tests/contracts/barta-resilience.spec.ts` | Reviewed constrained typo recovery, missing context and model-suggested clarification; passes. |
| `tests/contracts/barta-safety.spec.ts` | Reviewed fixed-message precedence/scope fixtures; passes; does not establish comprehensive safety coverage. |
| `tests/contracts/barta-spoken-text.spec.ts` | Reviewed source/choice narration, guide coverage/length and numeric preservation; passes. |
| `tests/contracts/barta-supplied-prompts.spec.ts` | Reviewed all 808 rows being recognized and selected routing examples; passes but does not reject conflicting duplicate metadata. |
| `docs/PROHOR-Barta-ANC-Review.md` | Reviewed terminology scope and project-reference basis; clinical sign-off not claimed. |
| `docs/PROHOR-Barta-API-Contract.md` | Marked obsolete Day 1 transport handoff historical; linked current contracts. |
| `docs/PROHOR-Barta-Evaluation.md` | Reviewed explicitly historical baseline and pending acceptance cases; not current pass evidence. |
| `docs/PROHOR-Barta-Functional-Preview.md` | Reviewed setup, optional services and source/prototype limitations; current failure-retention behavior now matches documentation. |
| `docs/PROHOR-Barta-Source-Register.md` | Marked historical candidate register; current project corpus distinguished from clinical approval. |
| `docs/PROHOR-Bujhi-Extraction-Handoff.md` | Reviewed synthetic extraction proposal; no executable OCR/upload implementation and no effect on site loading. |

## Validation record

- Typecheck and ESLint passed; no final lint warnings.
- 158 contract tests passed, including the added duplicate-sentence regression.
- 18 Barta browser/HTTP tests passed against the development site, including both
  new lifecycle regressions, keyboard/draft preservation and six access combinations.
- Final production build passed after the editorial corpus cleanup.
- Full production browser/HTTP regression: **54 passed**, using installed Edge,
  two workers, against an isolated `next start` server on port 3012. This includes
  homepage/navigation, all Barta journeys and lifecycle tests, keyboard/axe,
  theme/contrast combinations, reflow and public asset/service-worker checks.
- Real Gemini/Azure/eSpeak, physical microphone/voices, hosted Supabase, manual
  screen reader and field/mobile-network performance were not tested.

Fixes are local and uncommitted for review. Existing `/ask` formatting is retained;
the public site remains a limited educational prototype. No deployment is implied.
The temporary production profiling server was stopped after verification; the
existing development server was left running.
