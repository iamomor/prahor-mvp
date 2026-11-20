# Barta accessibility runbook: one Barta for every mother

Status: 20 Nov 2026. Main is 84588e5. Owners: Ifty (Barta) and Iftee (Adapt). Visual boards: https://claude.ai/artifact/XXHbzMRcnDU4tRLvdQrd45 (14 boards).

Honesty rules still apply. Bangla is a draft until a native speaker reviews it. Health wording is not clinically reviewed. 999 is the only helpline. The provider is simulated.

---

## 1. The principle

Barta has no separate "disability version". She chooses how she asks (type, speak, tap a topic, picture symbols, emoji, or ask a person) and how she receives the answer (text, read-aloud, bigger and calmer screen). Barta never asks which disability she has. **A danger sign is caught however she asks.**

## 2. Who it covers

The Rights and Protection of Persons with Disabilities Act 2013, Section 3, names 12 types. The shares below are of the 2.94 M registered persons with disabilities (Ministry of Social Welfare, Oct 2022 presentation).

| Type                            | Share  | How Barta serves her today                                                                              | Status                                                                 |
| ------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Physical                        | 52.99% | Voice or tap; large targets; Adapt spacing                                                              | Partly (switch access is roadmap)                                      |
| Visual                          | 14.43% | Screen-reader labels, `role="status"` answer announcement, Bangla read-aloud, text scale, high contrast | Built (no screen-reader log yet)                                       |
| Multiple                        | 8.41%  | All preferences combine freely                                                                          | Built                                                                  |
| Intellectual                    | 7.35%  | Topic buttons, "explain simply"                                                                         | Partly (Easy Read is roadmap; `simplifiedContent` is saved but unused) |
| Speech                          | 6.54%  | AAC with 24 symbols, emoji, typing; voice is never required                                             | Built                                                                  |
| Cerebral palsy                  | 3.99%  | AAC; tolerance for unclear speech-to-text                                                               | Partly                                                                 |
| Hearing                         | 3.95%  | Text first; interpreter accommodation in Bondhon                                                        | Partly (vibration alert is roadmap)                                    |
| Mental illness                  | 3.87%  | Crisis path is rule-based, not AI; 999                                                                  | Partly (calm mode is roadmap)                                          |
| Autism                          | 2.75%  | Predictable layout; no sound plays on its own                                                           | Partly                                                                 |
| Other                           | 0.66%  | Independent preferences                                                                                 | Built                                                                  |
| Deaf-blindness                  | 0.45%  | Plain structured text should reach a braille display                                                    | Roadmap (untested)                                                     |
| Down syndrome                   | 0.21%  | Read-aloud and topics                                                                                   | Partly                                                                 |
| No disability, or a hard moment | —      | The same features help low literacy, noise, one free hand, a shared phone, weak data                    | Built                                                                  |

Context: Bangladesh has a shortage of BdSL interpreters. BdSL text-to-sign is under-researched and has no public parallel dataset. For these reasons there is **no AI signing avatar**.

## 3. What is built (file map)

- **Adapt preferences:** `src/features/adapt/`. Covers theme, highContrast, textScale, layoutDensity, spaciousLayout, reducedMotion, simplifiedContent, communication (text/aac), language and focusedView.
- **AAC:** `src/features/adapt/lib/aac-phrases.ts`. 24 items: 9 symptoms, 6 body areas, 6 requests, 3 feelings. `generateNaturalPhrase` writes them in English and Bangla. `AACComposer` is used in BartaChatStarter (opens automatically when communication is `aac`) and in the Bondhon CareRequestForm.
- **Emoji:** `emoji-questions.ts`.
- **Voice:** dictation with automatic Bangla/English detection. Read-aloud uses bundled and Fish Bangla clips.
- **Rights answers:** 11 bilingual corpus entries. Topics: accessibility support, wheelchair exam room, interpreter, Easy Read, AAC device, quiet room, birth-plan accommodations, supporter and decisions, accessible postnatal care, trusted person, text instead of calls.
- **Bondhon accommodations:** `written`, `interpreter`, `step_free`, `quiet`, `easy_read`, `support_person` (`src/lib/contracts/coordination.ts`).
- **Safety chain:** `src/app/api/ai/chat/route.ts`. Order: bank safety → urgent/crisis gate → coverage → bleeding clarification → symptom context → knowledge/AI.

## 4. Finding fixed tonight: AAC users lost safety routing

AACComposer joins the symbols she taps into several short sentences. The safety gate tested the whole message, so some combinations of two or more symbols got an ordinary answer.

| Symbols tapped      | main 84588e5 | With M2 patch          |
| ------------------- | ------------ | ---------------------- |
| fever + weakness    | answer       | **urgent_care**        |
| swelling + headache | answer       | **urgent_care**        |
| bleed + pelvis      | answer       | bleeding clarification |
| headache + dizzy    | answer       | headache clarification |

The results are the same in English and Bangla. The full 26-row table is in `M2-barta-AAC-safety-run.md`.

**The fix, in `M2-barta.patch`:**

- `safety-gate.ts`: new rules for fever + too weak and swelling + headache. A sentence-level fallback (`routeBySentence`) runs only when the whole message did not route, and only escalates (crisis, then urgent).
- `bleeding-clarification.ts` and `symptom-follow-up.ts`: also try each sentence.
  **Evidence:**
- `tests/unit/barta-danger-signs.test.mjs`: 7 pass.
- Safety run: 65/65 phrases.
- 808-question bank: 0 routing changes.
- Multi-sentence everyday messages are not escalated.

## 5. Roadmap with gates

**Phase 0, tonight:**

- Merge M2.
- Demo only what is built.
- Say "roadmap" out loud for Easy Read, signing and braille.
  **Phase 1, weeks 1–2:**
- Make `simplifiedContent` do something: human-written Easy Read for the 20 top topics.
- Add 12 AAC symbols (section 6).
- One-tap "Ask with an interpreter" from Barta to Bondhon.
- Urgent alert in every sense: text, sound, vibration and flash.
- TalkBack and NVDA logs.
  **Phase 2, months 1–3:**
- Co-design with organisations of persons with disabilities.
- Braille display and switch-access testing.
- Calm mode.
- Clinician and Easy Read reviewer sign-off.
  **Phase 3, research:**
- Human-signed BdSL videos for the top danger signs, made with Deaf signers.
- SMS/IVR channel.
  **Gates for every phase:**

1. Tested with at least 2 people from the target group.
2. Safety run unchanged (65/65, 808 bank with 0 regressions, AAC combinations routed).
3. Reviewer sign-off.
4. Status shown honestly in the UI and the README.

## 6. Data to add

**Proposed AAC symbols.** All are drafts; Bangla needs native review, and the wording is not clinically reviewed.

| key            | English sentence                    | Bangla sentence (draft)                 | Route expected                       |
| -------------- | ----------------------------------- | --------------------------------------- | ------------------------------------ |
| labour_pain    | I think labour has started.         | আমার মনে হচ্ছে প্রসব ব্যথা শুরু হয়েছে। | answer                               |
| waters         | My water broke.                     | আমার পানি ভেঙে গেছে।                    | urgent                               |
| fits           | I had a fit or convulsion.          | আমার খিঁচুনি হয়েছে।                    | urgent                               |
| blurred_vision | My vision is blurred.               | আমি ঝাপসা দেখছি।                        | clarification / urgent with headache |
| breathless     | I cannot breathe well.              | আমার শ্বাস নিতে কষ্ট হচ্ছে।             | urgent                               |
| sad            | I feel very sad.                    | আমার খুব মন খারাপ লাগছে।                | answer (mental-wellbeing)            |
| unsafe         | I do not feel safe.                 | আমি নিরাপদ বোধ করছি না।                 | crisis support                       |
| baby_feeding   | My baby is not feeding.             | আমার শিশু দুধ খাচ্ছে না।                | answer                               |
| baby_fever     | My baby has a fever.                | আমার শিশুর জ্বর।                        | clarification                        |
| medicine       | I have a question about medicine.   | ওষুধ নিয়ে আমার প্রশ্ন আছে।             | answer                               |
| interpreter    | I need a sign language interpreter. | আমার একজন ইশারা ভাষার দোভাষী দরকার।     | rights answer + Bondhon              |
| yes_no         | Yes / No                            | হ্যাঁ / না                              | reply tiles                          |

Every new string needs a test row in `barta-danger-signs.test.mjs` for its expected route.

**Easy Read template, one topic per card:**

1. Title of 5 words or fewer.
2. 3–5 sentences of at most 12 words each. One idea per sentence. Present tense. "You".
3. One picture per sentence, on the left.
4. A box headed "Go now if" listing the danger signs, followed by Call 999.
5. No percentages, no abbreviations and no metaphors.
6. Written by a person and checked by an Easy Read reviewer with a person with intellectual disability. Never generated by AI.

## 7. Test personas and scripts

| Persona                       | Setup               | Script                                                           | Pass                                                                          |
| ----------------------------- | ------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Rina, blind, Android          | TalkBack, Bangla    | Ask "পেটে ব্যথা" by voice; listen to the answer; stop read-aloud | Every control is announced; the answer is announced; nothing silent           |
| Shathi, Deaf                  | Text, high contrast | Type "baby moving less"                                          | 999 card is visible without sound; the interpreter rights answer is reachable |
| Mitu, cannot speak (CP)       | communication = aac | Tap fever + weakness                                             | Urgent card with 999                                                          |
| Lima, intellectual disability | simplified on       | Tap topic "danger signs"                                         | Short answer; Go-now box (Phase 1)                                            |
| Nasrin, low vision            | textScale max       | Full chat                                                        | No clipped text; targets ≥ 44 px                                              |
| Keya, anxious                 | reducedMotion       | Type the crisis phrase                                           | Crisis support, no AI text, 999                                               |
| Ruma, no disability           | defaults            | Banglish "pet betha hocche"                                      | Correct topic answer                                                          |

## 8. Acceptance criteria for the demo

- [ ] M2 patch merged; `node --test tests/unit/*.test.mjs` shows 52 pass.
- [ ] AAC fever + weakness shows the urgent card in both languages.
- [ ] Read-aloud plays a Bangla clip and stops on tap.
- [ ] Answer arrival is announced (`role="status"`).
- [ ] Rights question "wheelchair exam room" returns the corpus answer.
- [ ] Bondhon request with `interpreter` shows on the simulated provider queue.
- [ ] README states clearly what is roadmap.

## 9. What makes it different

1. One Barta, no disability version.
2. Safety that does not depend on the mode (now proven for AAC).
3. Bangla first, with real audio, Banglish and broken speech-to-text tolerance.
4. Rights answers are part of care (11).
5. A human interpreter, not a fake avatar.
6. Her accommodations travel to the provider through Bondhon.
7. Private by default.
8. The curb-cut effect.

## 10. Verified and not verified

**Verified:**

- 7 Barta unit tests and 52 total in `tests/unit` on 84588e5 with the patch.
- Offline runs: 65-phrase safety, 808-question bank, and 26 AAC compositions.
  **Not verified:**
- No screen-reader, braille or switch testing.
- No `npm run build`.
- No Playwright run.
- The visual boards were not rendered or checked.
- Bangla strings are not native-reviewed.
- Health wording is not clinically reviewed.
  **Sources:** bdlaws.minlaw.gov.bd (Act 2013 s.3); Ministry of Social Welfare (Oct 2022); TBS News (BdSL interpreter shortage); ACL 2026 (BdSL text-to-gloss); WHO PCPNC (NBK304178); WHO/JHU FP Handbook (urgent signs).
