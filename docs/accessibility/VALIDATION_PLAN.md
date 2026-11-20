# PROHOR accessibility — external validation still required

None of the checks below has been done. Code and automated tests cannot replace them. Tick a box only with a real result, a date and a name. Link evidence (notes, screenshots, recordings stored with consent) in [EVIDENCE.md](EVIDENCE.md#external-validation).

## 1. Bangla language review (native speaker)
- [ ] The 12 new AAC phrases (`docs/accessibility/README.md` §3): natural, clear, respectful, culturally appropriate. Check spoken form with read-aloud.
- [ ] The Easy Read draft `adapt-settings-intro` (Bangla side).
- [ ] Access Card and urgent card Bangla lines (`src/features/adapt/lib/access-card.ts`).
- [ ] Preset names and hints; "Saved on this device only" notes.
- [ ] Sign the worksheet's R3 row.

## 2. Clinical review
Done by a qualified clinician only (worksheet R2).
- [ ] **Rule 1, fever + too weak → urgent care.** Confirm that "fever" with "too weak / weak and tired / very weak" (Bangla: খুব দুর্বল, অনেক দুর্বল, দুর্বল ও ক্লান্ত) should send her to urgent care. Basis given: WHO PCPNC "fever and too weak to get out of bed". Note that it also escalates typed text such as "I had a fever last week and now I feel very weak" (checked 20 Nov 2026).
- [ ] **Rule 2, swelling + headache → urgent care.** Confirm that any swelling with any headache should escalate (pre-eclampsia warning), including when pregnancy is not stated. Typed text like "I have swollen ankles and a headache" also escalates, while "my feet are swollen" alone does not (checked 20 Nov 2026).
- [ ] **Sentence fallback.** Confirm that escalating when *any* sentence of a multi-sentence message is urgent is acceptable.
- [ ] **Clarification stages.** Confirm `bleed + pelvis` → bleeding clarification and `headache + dizzy` → headache follow-up are the right next steps.
- [ ] Confirm the existing urgent and crisis wording was not changed. (It was not: only routing changed.)
- [ ] Note on evidence: automated tests show consistency with the recorded baseline (65 phrases, 808 bank). They do not show clinical correctness.

## 3. Easy Read review
- [ ] An Easy Read reviewer checks `adapt-settings-intro` against the runbook §6 template.
- [ ] Review with at least one person with intellectual disability: can they say back what it means and what to do next?
- [ ] Only then set `status: "approved"`, `reviewedBy`, `reviewedAt` in `src/features/adapt/lib/easy-read.ts`, and update the "0 approved" assertion in `easy-read.test.mjs` in the same change.

## 4. Assistive technology and device checks
Use the 13-step click-through (worksheet sheet 4) plus the M1 kit scripts. Record device, OS, AT and browser versions for each.
- [ ] **Keyboard only** (M1 A1): all 13 steps, focus always visible, no trap, focus returns after dialogs.
- [ ] **Android TalkBack** in Bangla (A2): names, roles and states read; status and error messages read without focus moving; Bangla read in Bangla.
- [ ] **NVDA** with Firefox/Chrome on screens 1 and 5.
- [ ] **VoiceOver** (iOS Safari), when a device is available.
- [ ] **200% text and 400% zoom** at 1280px (A3): no sideways scroll, no clipped Bangla.
- [ ] **Windows forced colours / High Contrast:** controls, focus and status still visible.
- [ ] **Reduced motion** at the OS level (A5).
- [ ] **Switch access** (Android Switch Access or a hardware switch): reach and use AAC symbols, presets, the Access Card and Call 999.
- [ ] **Braille display** (e.g. with NVDA or TalkBack): read a Barta urgent reply, the Access Card and a Jibonrekha record.
- [ ] **Signed-in routes** not covered by automated tests: Shusthota, the Bondhon workspace and provider queue, Jibonrekha and Bujhi accounts, Shonket requests.

## 5. Testing with mothers (target users)
The runbook gate requires at least 2 people from each target group before any user-testing claim.

**Recruit** through organisations of persons with disabilities and maternal-health partners. Ask about access needs only in terms of tasks ("Do you use a screen reader / picture symbols / sign language?"). **Never ask for a diagnosis.**

**Consent and privacy**
- Plain-language consent in Bangla, read aloud and given in her chosen way (spoken, signed, written, or with a supporter while she decides).
- She can stop at any time.
- Use a synthetic demo account and synthetic health data only. Record no real medical information.
- Store notes without names; keep recordings only with separate consent.

**Tasks (pick per session; she chooses her own settings first)**
1. Change how PROHOR looks and sounds; try a preset; undo it.
2. Ask Barta a question by typing, voice or symbols; listen to the answer.
3. Find what to do for a danger sign and where Call 999 is.
4. Make and print a visit card.
5. Find a facility without using location.
6. Add a measurement in Jibonrekha; correct it.
7. Send a Bondhon request with an accommodation; then stop sharing.

**Record for each task:** completed / with help / not completed; time; where she got stuck; what she said; her own suggestion.

**Severity**
| Level | Meaning |
|---|---|
| Critical | Blocks a safety task (999, urgent reply) or exposes private data |
| High | Blocks a core task with no workaround |
| Medium | Task done with difficulty or help |
| Low | Annoyance or wording issue |

**Fix workflow:** file each barrier with its severity and the setting combination used → fix critical and high before the next session → retest with the same task → record in EVIDENCE.md.
