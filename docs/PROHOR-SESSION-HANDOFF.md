# PROHOR — session handoff (paste into a new Claude chat)

Written 19 Nov 2026, 18:45 Dhaka. Attach the Project "Prohor" in the new chat; the runbooks below are saved there.

## 1. Who and what

I am on the PROHOR hackathon team: a Bangla-first, mobile-first PWA for maternal and child care in Bangladesh. Stack: Next.js 16, React 19, TypeScript, Zod 4, Supabase. Repo `iamomor/prahor-mvp`, branch `develop`; a local copy was at `/home/claude/zipx/prahor-mvp-develop` (that path exists only in the old session). Demo is synthetic: fictional providers, no real patient data, no clinical claims.
Team (per `PROHOR_48_HOUR_MVP_TEAM_WORKFLOW_V2.pdf`): Samin/Apurbo UI, Ifty health domain, Omor auth/RLS/DTO, Iftee Barta and Bujhi extraction engine. Message the owner before touching their files.

## 2. What I ask Claude to do

For each module: a masterclass, unique design on the existing PROHOR theme, a spec or runbook, tested helper code, and hand-ready materials. Deliver files to me and save the runbook to the Project with `project_write`. Every final reply must say what was and was not tested. The "ponytail" skill is on: smallest complete change, say what was skipped or unchecked.

## 3. Design system (do not break)

`html[data-theme]` themes: Quiet Garden (default, bg `#fffcf5`, primary `#2f6b54`), Original Rose, Morning Mist. `--pro-*` tokens. Noto Serif display, Manrope body, Roboto Slab for records. Body >= 16px, targets >= 44px, status colours with soft tints plus icon plus word (never colour alone). Provenance badges: self, ext (dashed), clin, conf, demo. Honest status text ("saving…" until the server confirms). No verdicts ("normal/high/low/risk"). Bangla is draft until native and clinician review. Non-AI urgent-help path always present (999). No invented helpline numbers; any support number is a placeholder.

## 4. Delivered so far

| Module                     | Deliverables                                              | Where                                                                               |
| -------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Barta, Poth, Shonket       | playbooks + workbooks (earlier)                           | `/home/claude/out/PROHOR_*_Playbook.pdf`, `*_Workbook.xlsx`                         |
| Barta coverage v2          | small-talk, abuse, PII, worry routes; route patch         | `/home/claude/out/barta-coverage/`                                                  |
| Barta master (latest)      | `BARTA_MASTER_RUNBOOK.md`, 63-case eval, runner, NFKC fix | `/home/claude/out/barta-master/`; Project `claude/BARTA_MASTER_RUNBOOK.md`          |
| Bujhi report understanding | 9 boards, master runbook, `bujhi-review.ts` + test        | artifact below; Project `claude/BUJHI_MASTER_RUNBOOK.md`                            |
| Bujhi pregnancy-kit result | 6 boards, runbook, `kit-result.ts` + test                 | same artifact; Project `claude/BUJHI_KIT_RESULT_RUNBOOK.md`                         |
| Jibonrekha                 | 13 boards, master runbook, `lifeline-record.ts` + test    | Project `claude/JIBONREKHA_MASTER_RUNBOOK.md`, `claude/JIBONREKHA_LIFELINE_SPEC.md` |
| Shusthota                  | 10 boards, spec, `shusthota-helpers.ts` + test            | Project `claude/SHUSTHOTA_SPEC.md`                                                  |
| Bondhon                    | 8 boards, spec, `bondhon-status.ts` + test                | Project `claude/BONDHON_SPEC.md`                                                    |

Design canvas artifacts (type slug `bcd2878f-a88d-4094-a616-8e39d8a5fd8a`):

- Bondhon `ad066877-cb13-4525-90cd-f81779bec5c7` https://claude.ai/artifact/NNDnLtVpuNQSaRfSTXJUE2
- Shusthota `99872bf3-dd8d-4fef-862b-98a6fca7db32` https://claude.ai/artifact/KxahcL9pNegcqiSJuqrhWR
- Jibonrekha `ddb84f8a-309c-4fbc-8a68-5901eb85a5e5` https://claude.ai/artifact/UNyi5cqQSaRwKrHDkyBU1i
- Bujhi (report + kit) `0f431478-15f3-482f-bb79-a2c864f5e2e8` https://claude.ai/artifact/2tJs7Ck43mEbWBFHrbQRrP, last version `1795086564-600d`
  Module concepts: Bondhon bond ring and request cord; Shusthota day ribbon and "my pace"; Jibonrekha baby timeline, correction chain, A4 pack; Bujhi "source beside meaning" per-field review where "looks right" is blocked when the unit is unknown; kit wizard "tell us what you see", no photo, no verdict.

## 5. Key technical facts

- Contracts in `src/lib/contracts/`: barta.ts (knowledgeSource, citation, request with retention ephemeral|saved+confirmed, answer union grounded/abstained/clarification/conversation/not_connected), bujhi.ts (PDF-only `prohor-synthetic-lab-v1` <= 5 MB; review decisions accepted/corrected/rejected with `reviewedByMother:true`; commit needs `confirmSave:true`), health.ts (weight, temperature, BP, hemoglobin, glucose, fetal_heart_rate, note; **hCG not supported, never map it to another type**), wellness, sharing, bondhon, common.
- Canvas build method: Python generators emit inline-styled `.dc.html` boards; publish with `publish_files` (`mode:"patch"`, `base_version` chained, `canvas.json` included when layout changes). Do not screenshot or render unless asked. Literal `{{ hole }}` only works in non-f-strings; use a helper H("name").
- Node 22 `stripTypeScriptTypes` runs dependency-free `.test.mjs` tests (an experimental warning is expected). `project_write` with `local_path` needs the whole file read first (one Read call with a large limit), otherwise pass `content`.
- Network is off in the sandbox: no pip/npm. The repo had no `node_modules`.

## 6. Open items and findings (most important first)

1. **Barta safety-gate bug (verified):** the gate NFKC-normalises input but three Bangla regex literals use single-code-point য়/ড়, so they never match: "বাচ্চা হওয়ার পর মন খারাপ", "নবজাতক সাড়া দিচ্ছে না", "রোগ নির্ণয় করে". Fix: `nfkc-regex-codemod.py` (4 lines in `safety-gate.ts`); eval 56 pass/3 fail before, 59/0 after. Similar flagged lines in `bleeding-clarification.ts` and `approved-knowledge.ts` are **unverified**.
2. Barta corpus is "project reference check", not clinician approved (`reviewedByUserId: null`). Retrieval is lexical, not semantic. Contract has duplicate spellings (`answer` vs `answer_bn/en`, `actionLevel` vs `action_level`) and no `mode` field (source-only / selector / hosted).
3. **Bujhi kit wizard:** urgent-symptom box appears after the result; the States board says it appears before. Add one yes/no symptom question before building. Wizard logic is inline and duplicates `explainKit`; production should call the helper. Kit result has no `health.ts` kind, so MVP stores a `note` with provenance self. Kit health text came from commercial/blog searches; replace with NHS/ACOG/WHO at clinician review; the "how reliable" figures are blank.
4. **Bujhi contract:** PDF-only server contract vs the V2 workflow's synthetic English image with browser Tesseract; pick one path.
5. Jibonrekha route: repo has `src/app/app/jibonrekha/page.tsx`, INTEGRATION.md says `(mother)/jibonrekha`.
6. Shusthota: sleep, water and reminders are not in the wellness contract.
7. Nothing was rendered or clicked on any canvas board; layout and wizard interaction are unseen. All Bangla and health wording is draft.
8. No git commit or PR was requested. If one is, commits end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01ACEWs4vDkf2iZmHGApr4VL`; PR bodies end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)` plus the session link.

## 7. Likely next steps

Apply the Barta codemod and run `--check` on the other Barta files; add knowledge-lookup and citation tests once `node_modules` exists; fix the kit wizard symptom question; choose the Bujhi PDF-vs-image path; get a named clinical reviewer and native Bangla reviewer; remaining modules not yet given a full masterclass pass: Adapt, Poth refresh, Shonket refresh.

## 8. How to resume

"Read the Project 'Prohor' docs (runbooks listed above), then continue from section 7 of the handoff. Keep the design system, honesty rules and ponytail style. Say what was and was not tested."
