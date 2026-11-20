# SHUSTHOTA (সুস্থতা) — Physical & emotional well-being: design + build spec

Canvas (10 boards): https://claude.ai/artifact/KxahcL9pNegcqiSJuqrhWR
Boards: 1 Today · 2 Check-in (interactive) · 3 Private diary · 4 Movement · 5 Reminders · 6 History · 7 Calm & help · 8 "My way" settings · 9 All states · 10 Desktop
Planned route per V2 workflow: `/app/wellbeing` (protected; Samin UI + wellness domain handler; Omor auth/RLS/DTO). Not yet verified against the repo's current routes.

## 1. Concept: "my pace, my day"

Not a tracker. A private place that adapts to the mother, never scores her.

- **Day ribbon**: five dots (mind, energy, rest, movement, water). Filled = she wrote it. Dashed = not written. Dashed is neutral, never a failure colour.
- **My pace** (top of Today): Normal · Slowly (one question at a time) · "Not today" (everything quiet, no reminders).
- **"I am now…"** (Settings): pregnant · after birth · after losing a pregnancy · baby in hospital · prefer not to say. Changes wording and hides what could hurt (e.g. baby prompts after loss). Never shared.
- **One-tap mood** on Today; the full check-in is optional.

## 2. Principles (from the module brief)

1. Everything optional and skippable; "prefer not to say" is an answer, a skipped step records nothing.
2. No scores, streaks, targets, step goals, body comparisons, verdicts.
3. Diary is owner-only. Never auto-shared, never in a Bondhon scope, never fed to AI chat.
4. Activity is user-chosen; walking, wheelchair, assisted, breathing, rest, or switching it off are equal.
5. Clinician restrictions win; the app shows them, never overrides them. No pregnancy exercise prescriptions until reviewed (P2).
6. Honest status: "Saved" only after the server confirms; offline = "on this device, not sent".
7. Help for hard moments is a visible, non-AI path (Shonket/safety info + Bondhon human request).
8. 16px+ body, 44px+ targets, icon+word for every state, voice entry.

## 3. Feature coverage

| Area                     | What the mother gets                                        | Tier                 | Contract today                                              |
| ------------------------ | ----------------------------------------------------------- | -------------------- | ----------------------------------------------------------- |
| Mood                     | 4 options + prefer-not                                      | P0                   | `mood` enum (comfortable/mixed/difficult/prefer_not_to_say) |
| Energy                   | low/medium/high/prefer-not                                  | P0                   | `energy` enum                                               |
| Rest/sleep               | duration chips, quality chips, note                         | P0                   | **only `restNote` text**; structured sleep = P1 extension   |
| Movement                 | user-chosen list, "rest is my activity", custom, switch off | P0                   | `activityNote` text; chosen list/prefs = P1                 |
| Hydration                | glass counter, no goal                                      | P1                   | **not in contract**; fold into `activityNote` for now       |
| Private diary            | text + voice, soft prompts, lock, export, delete            | P0                   | `diaryEntry` owner_only, separate resource                  |
| Reminders                | own reminders, quiet hours, pause all, snooze, tone         | P1                   | **not in contract**; needs table + delivery                 |
| History                  | day dots, own counts, filters, no scores                    | P1                   | derive from entries                                         |
| Calm resources           | breathing, sleep wind-down, body scan (text+audio)          | P1                   | content needs clinician + Bangla review                     |
| Hard moments             | help info, human request, postpartum info                   | P0 path / P1 content | links to Shonket + Bondhon                                  |
| Provider share           | pick days → Bondhon grant (wellness only)                   | P1                   | `wellness_entry` is shareable; diary is not                 |
| AI trend summary         | optional, descriptive only                                  | P2                   | n/a                                                         |
| Clinician-approved plans | shown, never edited                                         | P2                   | n/a                                                         |

## 4. Workflows

**Daily (30 sec or less):** Today → tap a mood (1 tap) → done. Or full check-in: mind → energy → rest → movement → water+note, each with "skip this", save at the end. Saved screen lists what was written and what was skipped ("that's fine").
**Low-energy day:** pace "Slowly" or "Not today". Check-in shows one question at a time; "Not today" silences reminders.
**Diary:** type or speak → save → owner-only. Lock, hide preview, export mine, delete (confirm).
**Hard day:** Today/Calm → "Help info" (non-AI) or "Talk to someone" (Bondhon request, consented).
**Share with doctor:** History → pick days → Bondhon scope (wellness fields only, time-limited). Diary absent from the picker.
**Reminders:** create → pick what/time/days/own words → quiet hours → pause all anytime. No auto-created reminders; silence after 3 unanswered days.

## 5. Every mother (coverage matrix)

| Mother                         | What the design does                                                             |
| ------------------------------ | -------------------------------------------------------------------------------- |
| First-time, pregnant           | Weekly wording, visit-prep reminder, simple check-in                             |
| After birth                    | Sleep-deprived mode: shortest check-in, feeding/rest words, postpartum mood info |
| After pregnancy loss           | Gentle wording, baby prompts/reminders hidden, no "streaks", Calm & help first   |
| Baby in hospital               | One-tap check-in, self-care nudges only if she chose them                        |
| Low literacy                   | Faces + icons + words, read-aloud, voice note instead of typing                  |
| Blind / low vision             | Real radios/switches with names, no colour-only meaning, audio resources         |
| Motor difficulty               | 44–60px targets, one question per screen, voice input                            |
| Wheelchair / assisted movement | Chair, assisted, breathing, rest = equal choices                                 |
| Deaf / hard of hearing         | All audio has text; vibration-only reminders                                     |
| Cognitive / fatigue            | One question at a time, "skip", no timers, no penalties                          |
| Teen mother                    | Same private model; no assumptions about family seeing anything                  |
| Rural / low connectivity       | Offline save-on-device with honest "not sent" state                              |
| Mother who wants no tracking   | Every section switchable off; "Not today" mode; delete all                       |
| Shared phone                   | Diary lock + hide previews; notification text neutral (setting)                  |

## 6. State & data rules

- Entry: at least one of mood/energy/activityNote/restNote (contract refine). UI must not create an empty entry (helper `buildCheckIn` returns null).
- `activityNote`/`restNote` ≤1000; diary text ≤10000.
- Diary resource separate, `privacy: owner_only`. Sharing guard: `isShareable("diary_entry") === false`.
- Reminder fire rule: on, not paused, not snoozed, right weekday, outside quiet hours (helper `isDue`).
- Deletion: confirm; removes from device and server. Export: owner only.

## 7. Contract gaps (need Omor/Samin decision before building those boards)

1. Structured sleep (hours, quality), water count, and chosen-activity list are not in `wellness.ts`. Options: keep text-only for MVP (my helper packs them into notes) or extend the schema + migration.
2. Reminders need a table, owner-only RLS, and a delivery channel (in-app only for the demo; push/SMS = future).
3. "I am now…" / pace / what-to-track preferences need a home (`access_preferences` or a new wellbeing prefs row).
4. Audit of diary reads is not required, but export and delete need endpoints.
   I did not check endpoint or table names against the repo beyond `wellness.ts` and `sharing.ts`.

## 8. Component plan

New (proposed names): DayRibbon, MoodFace, CheckInStep, MovementPicker, DiaryComposer, ReminderCard, PaceSelector, HardDayCard, DayDots history. Reuse: StatusNotice, DemoBanner, record provenance badges where entries appear in timeline.
Code: `code/shusthota-helpers.ts` + `.test.mjs` (buildCheckIn, countDays, isShareable, isDue) — not wired into the app.

## 9. PR plan

1. Omor: migration/RLS for diary (if not present) + wellbeing prefs/reminders (if approved), DTOs. 2. Samin: Today + Check-in + History on existing wellness API. 3. Samin: Diary + Movement + Personalise. 4. Samin: Reminders (in-app) + Calm resources (reviewed content only). 5. Joint: Bondhon wellness-share picker; QA.

## 10. QA / negative acceptance

- Empty check-in cannot save; skip-all leads to a neutral message, no entry.
- "Prefer not to say" stored as an answer; skipped step stored as null.
- Diary never appears in: Bondhon picker, provider view, summaries, Barta context.
- No screen shows a score, streak, target, "good/bad day", red/green judgement.
- Offline save never shows "Saved"; timeout shows "unconfirmed" before retry.
- Reminders respect pause/quiet/snooze; none created automatically.
- Loss mode hides baby/pregnancy-week content everywhere including notifications.
- Keyboard-only; screen reader names on radios/switches; 200% zoom; contrast.
- Crisis box does not route through AI.

## 11. Bangla copy and safety content

All Bangla is draft; native speaker + clinician review required, especially: postpartum info, calm resources, hard-moment text. Emergency number 999 shown; a mental-health support line number is a placeholder to be verified and approved. Calm resources are marked "review pending". No exercise prescriptions, no diagnoses.

## 12. Status

Design: done (10 boards). Working in contracts: mood, energy, activity/rest notes, owner-only diary. Needs extension: structured sleep, water, reminders, prefs. Future: AI summaries, clinician plans, push/SMS reminders.
