# PROHOR accessibility — how it is built

One PROHOR for every mother. There is no separate disability version and no question about her disability or diagnosis. She chooses how she reads, sees, asks and listens, and every choice combines with every other.

- **Status of claims:** see [EVIDENCE.md](EVIDENCE.md). Target is WCAG 2.2 AA. Nothing here is certified or externally validated yet.
- **What still needs people and devices:** see [VALIDATION_PLAN.md](VALIDATION_PLAN.md).
- **Engineering contract:** [../design-system/ACCESSIBILITY.md](../design-system/ACCESSIBILITY.md).

---

## 1. Shared Adapt foundation

All modules use one preference system. No module reimplements it.

| Piece | File |
|---|---|
| Preference model, defaults, sanitizer, migration (schema v4) | `src/lib/access-preferences.ts` |
| Server contract (10 fixed keys, also enforced in SQL `day2_valid_preferences`) | `src/lib/contracts/adapt.ts` |
| The only device ↔ account translator | `src/features/adapt/lib/account-mapping.ts` |
| Account sync, conflicts (etag/409), shared-device isolation | `src/features/adapt/lib/account-controller.ts`, `account-runtime.ts` |
| Before-first-paint script (root `data-*` attributes) | `src/components/marketing/preference-bootstrap.ts` |
| Runtime: applies changes, cross-tab updates, refresh on window focus | `src/features/adapt/components/PreferenceRuntime.tsx` (mounted once in `src/app/layout.tsx`) |
| Hook for components | `src/features/adapt/hooks/useAdaptPreferences.ts` |

**Presentation** preferences become root attributes (`data-theme`, `data-contrast`, `data-text-scale`, `data-layout`, `data-motion`, `data-focused`, `data-font`, `data-text-spacing`) that the tokens in `src/styles/prohor-tokens.css` read. **Behaviour** preferences (`communication`, `readAloud`, `simplifiedContent`) are read through the hook.

### Who owns each preference

| Preference | Values | Saved where | Note |
|---|---|---|---|
| theme | quiet-garden / original-rose / morning-mist | account | |
| highContrast | `true` / `false` / `null` | account when `true`/`false`; `null` stays on the device | `null` = follow the operating system. Never sent as `false`. |
| textScale | default / large / extra-large | account | |
| layoutDensity | comfortable / compact / spacious | spacious ↔ account; **compact is device-only** | Server field `spaciousLayout` is a derived alias. |
| reducedMotion | boolean | account | `false` still follows the OS reduce-motion signal. |
| focusedView | boolean | **device-only** | Hides only `.prohor-decorative`; never safety actions. |
| font (typeface) | 4 presets | **device-only** | |
| textSpacing | standard / relaxed | account | Lives in the reading store. |
| communication | text / aac | account | AAC is offered first; typing always works. |
| language | bn / en | account | Changing it never remounts a form. |
| readAloud | `true` / `false` / `null` | account when chosen | `null` = not chosen here, so it never switches off her account choice. Never autoplays. |
| simplifiedContent | boolean | account | Has no effect until an Easy Read entry is approved (§4). |

**Shared phone:** when one mother signs out or another signs in, the device returns to its signed-out settings. One mother's account settings never reach another (`account-sync.test.mjs`).

### Access Presets — `src/features/adapt/lib/access-presets.ts`, `components/AccessPresets.tsx`

Bundles named by what they change, never by who they are for. Each one previews the exact changes, applies them through the normal save path, and can be undone. None changes language or theme.

| Id | Changes |
|---|---|
| `large-clear` | Extra-large text, more contrast, spacious layout |
| `calm-simple` | Reduced motion, focused view (this *is* "calm mode"; there is no separate preference) |
| `pictures-text` | Picture-and-text (AAC) communication, Listen buttons |

### Access Card — `src/features/adapt/lib/access-card.ts`, `components/AccessCardBuilder.tsx`

A bilingual "My visit card" she prints or shows. It has a fixed field allowlist: needs from a closed list, optional name, helper name, helper phone (Bangla digits accepted) and a note. **It never holds a diagnosis or a disability type.** It has a separate urgent card that always says "Please call 999 for me." **It is not saved anywhere** (no storage, no network), and it says "This card is not a medical record."

---

## 2. Eight-module integration

The same shared system is used everywhere. Module-specific changes are listed in [EVIDENCE.md](EVIDENCE.md#module-by-module). Changes that affect every module:

- `.pro-btn` and `AppButton` labels wrap instead of overflowing at 320px or large text (`src/app/globals.css`, `src/components/ui/AppButton.tsx`).
- Her own Reduced motion choice stops button and float movement the same way the OS setting does.
- Forms are never keyed on language or preferences, so typed text survives any change.

---

## 3. AAC (picture-and-text communication)

`src/features/adapt/lib/aac-phrases.ts` is the catalog and sentence generator. `components/AACComposer.tsx` is the UI, used in Barta (`BartaChatStarter`) and in Bondhon (`CareRequestForm`). Symbols are native buttons with `aria-pressed`, grouped in a tab list. Each has a text label in both languages, and an emoji is never the only label. Tapping builds an **editable** sentence. Nothing is sent until she presses Insert and then Send herself.

### Inventory (verified by `tests/unit/aac-catalog-safety.test.mjs`)

| Category | Items |
|---|---|
| Symptoms | 9 |
| Body areas | 6 |
| Requests | 6 |
| Feelings | 3 |
| **Talking with me (new, STEP 04)** | **12** |
| **Total** | **36** (was 24) |

The original 24 are compared field for field with the committed HEAD catalog. Their order, ids and wording are unchanged.

### The 12 new items — Bangla awaiting native review

| id | English | Bangla (draft) |
|---|---|---|
| please_wait | Please wait a moment for me. | অনুগ্রহ করে আমার জন্য একটু অপেক্ষা করুন। |
| say_again | Please say that again. | অনুগ্রহ করে আবার বলুন। |
| speak_slowly | Please speak slowly. | অনুগ্রহ করে ধীরে ধীরে বলুন। |
| write_it | Please write it down for me. | অনুগ্রহ করে আমাকে লিখে দিন। |
| show_me | Please show me with a picture or by pointing. | অনুগ্রহ করে ছবি বা আঙুল দিয়ে দেখিয়ে বলুন। |
| explain | Please explain what this means. | অনুগ্রহ করে এর মানে বুঝিয়ে বলুন। |
| not_understand | I do not understand. | আমি বুঝতে পারছি না। |
| understand | I understand. | আমি বুঝেছি। |
| pause_talk | Please stop for a moment. I need a short break. | অনুগ্রহ করে একটু থামুন। আমার একটু বিরতি দরকার। |
| my_way | I will answer by typing or with pictures. | আমি লিখে বা ছবি দিয়ে উত্তর দেব। |
| privacy | I would like to talk in private. | আমি একান্তে কথা বলতে চাই। |
| interpreter | I need a sign language interpreter. | আমার একজন ইশারা ভাষার দোভাষী দরকার। |

These are everyday communication requests, not symptoms. On their own they route as an ordinary message. Combined with a danger sign, the danger sign still escalates. The runbook's proposed *clinical* symbols (waters, fits, breathless…) were **not** added: each one needs a safety-routing decision and clinical review first.

---

## 4. Easy Read — human-reviewed only

`src/features/adapt/lib/easy-read.ts` holds the registry. `components/EasyRead.tsx` renders it.

- **States:** `draft` → `review` → `approved` → `retired`. Only `approved` can ever show.
- **Approval needs evidence:** `reviewedBy` (a real reviewer) and `reviewedAt` (an ISO date). An entry marked approved without both is refused.
- **Template (runbook §6), enforced in code:** title of 1–5 words; 3–5 sentences of at most 12 words each, in both languages.
- **May contain:** interface and navigation explanations grounded in existing approved copy.
- **Must never contain, and is never generated for:** clinical advice, medicines or doses, emergency instructions, report values, risk or diagnosis information, AI answers. Nothing is rewritten at runtime.
- **What she sees:** an approved version is labelled "Easy Read · reviewed by …, date", with "Show the original text" one tap away. Without an approved version the original shows unchanged.
- **The setting (`simplifiedContent`) is offered only when at least one entry is approved.** Today there are **0 approved entries**, so the setting is hidden, and an "on" value stored earlier has no effect.
- **Current draft:** `adapt-settings-intro` (Adapt settings intro, from `translations.adapt.intro`). It waits for an Easy Read reviewer, together with a person with intellectual disability, and a native Bangla speaker.

---

## 5. Safety feedback and the Barta AAC fix

**Urgent replies in Barta** (`BartaEducationChat.tsx`) are text-first:
- a written "Urgent" label, never colour alone;
- the message in `role="alert"`;
- a Call 999 link;
- a Listen button that only plays when pressed.

There is no flashing or vibration. Nothing claims a call was placed. **Shonket** (`SafetyHome.tsx`) shows 999 and 16263 as text links. The digits follow the language, so the spoken name matches what is shown. A Listen button appears only when she chose "Show Listen buttons", and it reads the existing wording unchanged. Without a speech engine, Listen is disabled and the reason is shown. Vibration was deliberately **not** added: unasked buzzing is unsafe, and there is no evidence it helps someone already reading the screen.

**AAC safety fix (STEP 04).** AAC builds several short sentences ("I have a fever. I feel weak and tired."). The kit's M2 fix was only partly merged, so these combinations got an ordinary answer. Ported from the verified M2 patch:

| File | Change | Effect |
|---|---|---|
| `safety-gate.ts` | `fever + too weak` and `swelling + headache` rules | → urgent care |
| `safety-gate.ts` | `routeBySentence`: if the whole message did not route, check each sentence and **only** return crisis or urgent | multi-symbol messages keep their danger sign |
| `bleeding-clarification.ts` | per-sentence check | `bleed + pelvis` → bleeding clarification |
| `symptom-follow-up.ts` | per-sentence headache check | `headache + dizzy` → headache follow-up |

**Escalation-only:** each change is an extra `OR` on an urgent condition, or a fallback that runs only when nothing else routed. No existing rule was removed or narrowed. **These two rules are not clinically reviewed** — see [VALIDATION_PLAN.md](VALIDATION_PLAN.md#2-clinical-review).

---

## 6. Bondhon accommodation requests

`CareRequestForm.tsx` offers an **optional** fieldset from a closed list (`src/lib/contracts/coordination.ts`): `written`, `interpreter`, `step_free`, `quiet`, `easy_read`, `support_person`. No diagnosis or disability field exists; the strict schema rejects one.

- Accommodations travel only inside a request she reviews and consents to, and they stop when she revokes it.
- The form says "Availability must be confirmed separately". The provider sees "These are requests. Confirm separately whether you can meet them."
- Nothing shows an interpreter or service as assigned. Naming a support person gives them no account access.
- "More time" and "other" were not added: that would change the contract and SQL.

---

## 7. Switch and braille readiness

**Prepared:**
- native `button`, `a`, `input`, `select`, `details/summary` controls;
- persistent labels; fieldsets for grouped choices; `aria-pressed` and `aria-selected` for state;
- no drag-only or click-only `div`/`span` controls on the checked routes;
- visible focus in all three themes;
- `role="status"` and `role="alert"` for dynamic changes;
- headings, lists and tables that give a braille display its structure.

**Not tested:** no switch device, braille display or physical screen reader has been used. Hardware support is not claimed.
