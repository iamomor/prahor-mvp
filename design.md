# PRAHORAR (প্রহর) — design.md

Status: **v0.4 PROPOSAL — Warm Clinical Editorial direction approved in principle; this revised specification awaits Omar's final review and lock. Do not treat this proposal as implementation authority until it is locked.**
Source of truth for all UI work. If this file and any agent's own taste disagree, this file wins.
Scope source: `PRAHORAR_Project_Context_Handoff.md` (24 capabilities, 8 MVP modules, safety boundaries). This file defines look and interaction only; it never changes scope.

## 0. What changed from v0.2 (decision record)

The owner has selected the **Warm Clinical Editorial** direction: Warm Ivory, Deep Forest, Accessible Teal and Restrained Coral. This v0.4 proposal replaces the v0.3 pink-toned palette. The reference screens remain structural inspiration only; their pink and purple colors are not carried forward. Matching handoff and agent-rule edits are included as proposals, not silently locked decisions. Typography, accessibility, responsive behavior, component intent, MVP scope and safety rules remain unchanged unless explicitly called out below.

## 0.1 Provenance of values (read this before trusting a number)

- **Owner-selected direction:** Warm Clinical Editorial, with the four named colors and hex values below. The direction is approved in principle; this document remains a proposal until Omar locks the final token specification.
- **Proposed values:** Warm Ivory `#F7F4EC`, Deep Forest `#244638`, Accessible Teal `#147D78`, Restrained Coral `#D97865`. These are design tokens, not clinical or brand-research findings.
- **Computed contrast:** ratios below were calculated using the WCAG relative-luminance formula for the exact listed hex pairs. They are contrast calculations only, not a complete WCAG audit or certification.
- **Unchanged constraints:** Noto Sans Bengali and Inter remain the preferred language fonts; 360×800 remains the first mobile design frame. Any external usage or device-stat claims from the previous draft must be independently re-verified before being repeated.
- **Validation still needed:** test the palette in real interface states, including focus, disabled, selected, error, urgent, high-contrast and 200% text-size modes. Coral is not suitable for small text or essential control boundaries on ivory at the proposed value.

---

## 1. Principles

1. **Access is the interface.** Every screen works in Listen, Read, Express and Simple modes. No feature ships with an "accessible version" elsewhere.
2. **Bangla first, English equal.** Layout is designed and tested in Bangla first at 360×800. Switching language never breaks layout.
3. **One thing per screen.** One primary action, plain words, predictable position. Minimal: if a user can ask "where do I tap?", the screen has failed.
4. **Color means something.** Deep Forest = brand, primary actions and strong structure. Accessible Teal = information, links and sources. Restrained Coral = limited decorative warmth only. Red = urgent only.
5. **Never a verdict.** The UI never labels a vital, report value or mood as "normal", "abnormal", "good" or "bad", and never shows a risk score.
6. **Honest labelling.** Synthetic demo data is always labelled. AI content always says it is AI and shows its source.
7. **Warm, not decorative.** Solid surfaces, borders over shadows, no gradients, no glass, no decorative motion.

## 2. Reference screens (design-source PDF, page order)

The owner chose pages 2, 3, 4, 6, 8. Structure is borrowed; assets, copy and illustrations are not.

| Page | Take | Reject |
|---|---|---|
| 8 (MomWell login / home / journey) | Hero card with week and day; 4×2 quick-tools grid; trimester tabs; symptom chips; timeline; 4-tab bottom nav | Gradient on the hero card (use solid), low-contrast gray captions, tiny tab labels |
| 6 (MOmsi) | get-started checklist; segmented stage progress; simple auth screen | Social-login-first, "Premium" badge, emoji markers |
| 4 (mint trio) | shortcut cards under search; article page with reviewer block → our source-citation block | Gradient backgrounds, floating nav, any "Reviewed by Dr." text we cannot back up |
| 2 (purple mobile trio) | Week strip on Home; kick counter ring, timer and history → Fetal Movement Log | Violet brand color, floating glass nav pill, 3D fetus render |
| 3 (Nurtura landing) | Section rhythm of a public landing page; tools grid; footer structure | Violet brand color, invented "10,000+ members" stats, testimonials, stock-doctor photos |

The selected direction moves away from a conventional pink maternal-app palette toward a calm, grounded and broadly healthcare-oriented identity. Reference screens inform information hierarchy and interaction patterns only; their former pink and purple colors are not PRAHORAR brand tokens.

Common weakness in all five: none is built for assistive technology. Small gray text, icon-only tabs and low-contrast pastels are not allowed here.

## 3. Color tokens

Contrast = ratio for the exact foreground/background pair stated. Targets: normal text ≥ 4.5:1; large text and meaningful UI components ≥ 3:1. Ratios are calculations, not a full accessibility audit.

| Token | Hex | Role | Computed contrast |
|---|---|---|---|
| `canvas` | `#F7F4EC` | Warm Ivory page background | — |
| `surface` | `#FFFFFF` | Cards, sheets, inputs | — |
| `ink` / `forest` | `#244638` | Deep Forest body text, headings, navigation and primary actions | 9.51:1 on canvas; white on forest 10.46:1 |
| `teal` | `#147D78` | Accessible Teal: information, links, source references and secondary informational emphasis | 4.51:1 on canvas; white on teal 4.96:1 |
| `coral` | `#D97865` | Restrained Coral: small decorative accents only | 2.80:1 on canvas; fails text/UI contrast targets |
| `danger` | `#A31621` | Urgent/emergency state only | Retain only with separately verified foreground/background pairing |
| `danger-tint` | `#FCE6E8` | Urgent notice surface | Re-verify all text and component pairings before use |
| `notice` | `#8A5A00` on `#FBF0D6` | Caution/disclosure | 5.23:1 (previously computed; re-check in implementation) |
| `control-border` | `#244638` | Input, checkbox, toggle and other meaningful control boundaries | 9.51:1 on canvas |
| `line` | `#244638` at 20% opacity | Decorative dividers only; never the sole indicator of a boundary or state | Not a text or meaningful-control token |

### Color-use rules

- Deep Forest is the default primary action, active navigation, headings and high-emphasis text. White text on Deep Forest computes to 10.46:1.
- Accessible Teal is for information, links, citations and secondary informational emphasis. White on Teal computes to 4.96:1; Teal on Warm Ivory computes to 4.51:1. Do not reduce opacity or use it on another background without recalculating.
- Restrained Coral is **not** for text, meaningful icons, focus rings, control borders, or primary/secondary buttons on Warm Ivory. Its computed 2.80:1 contrast is insufficient. Use it only as a small decorative accent that carries no information and is not required to understand or operate the interface.
- Color is never the only signal. Status always has text and a meaningful icon/shape.
- Urgent content must never rely on color alone: use a full-width banner, a clear warning icon and the words "জরুরি / Urgent". `danger` is reserved for UrgentBanner; Deep Forest is never used to imply an emergency.
- No gradients anywhere, including hero cards. Reference page 8 uses one; do not copy it.
- High-contrast mode (user setting): canvas `#FFFFFF`, ink and control boundaries `#000000`, solid fills. This separate mode must be tested before implementation.
- Do not invent additional brand colors. If a state cannot be expressed safely with these tokens plus the existing semantic `danger` and `notice` tokens, stop and ask Omar.

## 4. Typography

- Bangla: **Noto Sans Bengali**. English/Latin: **Inter**. Declare both in one stack so mixed text renders cleanly: `"Inter", "Noto Sans Bengali", system-ui, sans-serif` for `lang="en"`, and `"Noto Sans Bengali", "Inter", system-ui, sans-serif` for `lang="bn"`.
- Always set `lang` on `<html>` and on any inline text in the other language. Self-host the fonts and subset them; low-end phones and slow data matter.
- Bangla needs more vertical room than Latin: body line-height **1.7**, headings **1.4–1.5**. Latin may use 1.55 / 1.3.
- No ALL-CAPS labels, no letter-spacing on Bangla, no italics for emphasis in Bangla (use weight).
- Do not accent a single word of a heading in another color.
- Numerals follow locale: Bangla digits when `bn`, Latin when `en`; user setting overrides. Use `Intl` with `bn-BD`. Never hand-type digits.

| Style | Mobile | Desktop | Weight |
|---|---|---|---|
| display | 28 | 36 | 700 |
| h1 | 24 | 30 | 700 |
| h2 | 20 | 24 | 600 |
| h3 | 18 | 20 | 600 |
| body | 17 | 18 | 400 |
| body-lg (Simple mode) | 19 | 20 | 400 |
| caption | 14 (minimum anywhere) | 14 | 500 |

Text size setting: 100 / 125 / 150 / 200 %. Layout must reflow without horizontal scroll at 200 %.
Reading column: max ~60 characters for Bangla paragraphs.

## 5. Space, shape, elevation

- Base unit **8 px**. Layout gaps use 8 / 16 / 24 / 32 / 48 / 64. 4 px is allowed only for fine adjustments (icon-to-label, inside chips). Page gutter 16 / 24 / 32 (mobile / tablet / desktop).
- Radius hierarchy (not one radius for everything): controls and chips 8, cards 12, bottom sheets 16 (top corners), avatars full. Cards stay within 12–16. No oversized floating rounded cards.
- Elevation: none by default. Cards are `surface` + 1px `line`, or Warm Ivory with no border. One shadow level exists, for bottom sheets and menus only.
- Touch targets: **minimum 48×48 px** (stricter than the WCAG 2.2 AA minimum of 24 and than a 44 px "where practical" target). Primary actions 56 px tall. 8 px minimum gap between targets.
- Icons: one set (Lucide), 24 px, stroke 1.75, always with a visible text label for navigation and primary actions. No emoji as icons or markers.
- Illustration: if used, flat vector in this palette, showing varied bodies and mobility aids (wheelchair, cane, hearing aid). No stock photographs. Never present AI-drafted art as final without labelling.

## 6. Layout and navigation (PROPOSED, needs approval)

**Design frame: 360×800 first** (most common in Bangladesh), then check 393, 412, 768, 1280, 1440. Breakpoints: 360 (base) · 600 · 1024 · 1440. Content max width 1200.

- **Mobile (<600):** single column, fixed bottom navigation with 5 labeled items, language and access-mode controls reachable from the top bar on every screen.
- **Tablet (600–1023):** compact navigation rail, two-column where content allows.
- **Desktop (≥1024):** persistent left sidebar (labeled), content area up to 1200, right-hand context column only where it carries information (sources, handoff status). Not a stretched mobile layout.
- Provider portal uses the same shell and tokens with a denser table layout on desktop.

Proposed bottom navigation (Bangla / English):
1. হোম / Home
2. যাত্রা / Journey (pregnancy tracker, vitals, movement log, reports)
3. জিজ্ঞাসা / Ask (Bangla AI companion; name to be confirmed)
4. মনের সাথী / Moner Sathi
5. সেবা / Care (facilities, appointments, human support, Care Circle)

Home screen: solid Deep Forest hero card with current week and day, then a 4×2 grid whose eight tiles map to the eight MVP modules, then "next step" and any pending human-support status. Settings, profile and consent live behind the avatar in the top bar.

Language switch: segmented control `বাংলা | English` in the top bar, persisted to the accessibility profile, locale in the URL.

## 7. Universal adaptive access (cross-cutting)

Implemented as attributes on `<html>`; components read tokens, never branch on disability labels. Do not infer ability from a stated need.

| Attribute | Values |
|---|---|
| `data-lang` | `bn`, `en` |
| `data-mode` | `read` (default), `listen`, `express`, `simple` (combinable) |
| `data-text-size` | `100`, `125`, `150`, `200` |
| `data-contrast` | `standard`, `high` |
| `data-motion` | `full`, `reduced` (default follows OS `prefers-reduced-motion`) |
| `data-sensory` | `standard`, `calm` (no animation, fewer colors, quieter feedback) |
| `data-timeouts` | `standard`, `extended`, `none` |

Mode behavior:
- **Listen:** every content block and result has a read-aloud control; summaries are speakable; audio is never the only channel.
- **Read:** default; full text, screen-reader semantics.
- **Express:** text, quick phrases and pictogram/AAC input are always offered next to voice; no feature requires speaking.
- **Simple:** plain language, one step per screen, larger body, fewer choices per screen.
- Deaf/HoH: no audio-only information; visual and haptic alerts.
- Motor: full keyboard and switch operation, no drag-only or hold-only actions, no repeated fine-motor taps.
- Preferences are asked once at onboarding, editable any time, and applied to every module.

## 8. Components (must exist before screens)

Button (primary Deep Forest, quiet, danger) · Segmented control · Text field with label above and persistent helper/error text · Select/date picker with keyboard path · Checkbox/toggle with text · Chip · Card · Bottom sheet · Top bar · Bottom nav · Sidebar · Tabs · List row · Stepper (one step per screen) · Toast (never the only error channel) · Dialog · Empty state · Loading skeleton · Error state.

PRAHORAR-specific:
- **AccessControls** — language switch, text size, mode quick-toggle, always reachable.
- **ReadAloud** — play/pause/speed for any block.
- **SourceCitation** — source title, publisher, version/date, review status as stored (teal). Never invent a reviewer.
- **AIDisclosure** — "AI-generated from the sources below. Not a diagnosis." Shown with every AI answer.
- **SyntheticDataBanner** — visible on every screen of the public demo.
- **SafetyNotice** — fixed, plain wording, with a clear "contact a person" action. Emergency copy and workflow are defined by professionals, not by agents.
- **UrgentBanner** — the only component allowed to use `danger` (see section 3).
- **ConsentToggle** — who, what, until when, how to revoke.
- **HandoffStatus** — Requested → Received → Followed up, text plus icon, timestamps.
- **ExtractionReview** — report values as editable fields beside the source image; requires explicit "I confirmed these values".
- **MovementCounter** — large tap target, session timer, history list; no "enough / not enough" verdict.
- **VitalsEntry** — value, unit, date; shows history, never interprets.
- **MoodCheckIn** — large controls, text and pictogram options, optional note; private by default; no scores. Uses a calm Warm Ivory surface with Deep Forest structure.

## 9. Content and copy

- Sentence case. Active voice. Buttons say what happens: "Save reading", not "Submit".
- Plain Bangla (সহজ বাংলা); avoid transliterated English medical terms when a common Bangla word exists; keep the clinical term in brackets only where a provider uses it.
- Same action keeps the same name across the flow.
- Errors say what happened and how to fix it. They do not apologize and are never vague.
- Never write: diagnose, normal/abnormal, risk level, you are depressed/anxious, "safe", "dangerous". Never state or imply clinical validation.
- Empty states invite one action.
- Demo people, facilities and values are synthetic and labelled.

## 10. Motion

Only motion that answers a user action (open, expand, confirm), 150–200 ms. No entrance animations, parallax, auto-playing carousels or looping animation. Honor `prefers-reduced-motion` and `data-motion` / `data-sensory`.

## 11. Focus, keyboard, screen reader

- Visible focus on every interactive element: 3 px `forest` outline with 2 px `canvas` offset (Deep Forest on Warm Ivory 9.51:1; white-surface pairing must also be checked).
- Logical tab order, skip link, landmarks, one `h1` per page, labels programmatically tied to inputs.
- Dynamic updates announced via live regions.
- Modals trap and restore focus; sheets are dismissible by keyboard.

## 12. Do-not list (anti-slop)

- No gradients, glassmorphism, blurred backgrounds, neon glows, violet/purple brand color.
- No identical-card grids used as filler; no fake charts, stats, testimonials or member counts.
- No emoji as icons. No stock-photo hero of a generic pregnant woman.
- No tracked-out ALL-CAPS eyebrows above headings; no numbered markers unless content is a real sequence.
- No random radii or shadows; use only tokens here.
- No new colors, fonts or sizes outside this file. If a screen seems to need one, stop and ask Omar.
- No `Normal` / `Good` / `Bad` badges on health data.
- No Deep Forest for emergencies; no red for ordinary actions. Coral must never carry essential meaning or serve as a text/control color on Warm Ivory.

## 13. Figma ↔ code contract

- Figma variables and CSS variables share the names in section 3 (`--color-canvas`, `--color-ink`, `--color-forest`, `--color-teal`, `--color-coral` …), spacing `--space-1…8`, radii `--radius-control|card|sheet` (8 / 12 / 16).
- Tailwind config reads those CSS variables; no hard-coded hex in components.
- Components in code and Figma share names from section 8. A screen is not "done" until it exists in Bangla and English, at 360 / 768 / 1280 widths, at 200 % text size.

## 14. Open decisions (need the owner / Omar)

1. Final-lock the Warm Clinical Editorial palette and verify all semantic state pairings (this v0.4 proposal is not yet locked).
2. Approve the 5-item navigation and the Home 4×2 module grid.
3. Confirm the AI companion's name ("জিজ্ঞাসা" is a neutral placeholder).
4. Confirm the auth method for the demo. Not decided in the handoff.
5. Illustration: flat inclusive vector in palette, or none for MVP.
6. Native Bangla copy review before submission.
7. High-contrast and Simple-mode token sets to be drawn and re-verified.

## 15. Screen inventory (PROPOSED — covers all 8 MVP modules; needs approval)

Priority: **P0** = on the demo path, build and polish first. **P1** = needed for module completeness. **P2** = only if time remains. Every screen exists in Bangla and English and in all access modes.

| # | Route | Screen | Module | Priority |
|---|---|---|---|---|
| 1 | `/` | Welcome, language, install, quick access setup | 1 | P0 |
| 2 | `/onboarding` | Adaptive setup, multi-step (modes, text size, input, consent, pregnancy week) | 1 | P0 |
| 3 | `/auth` | Sign up / sign in (method undecided) | 1 | P0 |
| 4 | `/app/home` | Mother Home: week hero, 4×2 module grid, next step, human-support status | all | P0 |
| 5 | `/app/ask` | Bangla AI companion: conversation, voice, text, AAC phrases | 2 | P0 |
| 6 | `/app/ask/sources/[id]` | Source detail (title, publisher, version, review status) | 2 | P1 |
| 7 | `/app/journey` | Pregnancy journey: week, timeline, milestones | 4 | P0 |
| 8 | `/app/health` | Vitals history and movement log | 4 | P0 |
| 9 | `/app/health/new` | Add BP / weight reading | 4 | P0 |
| 10 | `/app/health/movement` | Baby movement counter session | 4 | P1 |
| 11 | `/app/reports` | Report list | 5 | P1 |
| 12 | `/app/reports/new` | Upload (synthetic) and processing state | 5 | P0 |
| 13 | `/app/reports/[id]/review` | Extracted values vs source image, confirm | 5 | P0 |
| 14 | `/app/reports/[id]` | Plain-language explanation, read-aloud | 5 | P0 |
| 15 | `/app/moner-sathi` | Moner Sathi home: today’s check-in, resources, diary entry point | 6 | P0 |
| 16 | `/app/moner-sathi/check-in` | Accessible mood check-in | 6 | P0 |
| 17 | `/app/moner-sathi/diary` | Diary list and new entry | 6 | P1 |
| 18 | `/app/moner-sathi/resources/[id]` | Coping resource detail | 6 | P1 |
| 19 | `/app/care` | Care home: facilities, appointments, human support | 7 | P0 |
| 20 | `/app/care/facilities` | Facility directory with filters | 7 | P1 |
| 21 | `/app/care/facilities/[id]` | Facility detail, contacts, access info | 7 | P1 |
| 22 | `/app/care/appointments/new` | Appointment request | 7 | P1 |
| 23 | `/app/care/appointments/[id]` | Appointment status | 7 | P1 |
| 24 | `/app/care/help/new` | Request human support (consent, topic, preferred channel) | 3 | P0 |
| 25 | `/app/care/help/[id]` | Support request status | 3 | P0 |
| 26 | `/app/support` | Care Circle: members, permissions | 8 | P1 |
| 27 | `/app/support/invite` | Invite and set what is shared | 8 | P1 |
| 28 | `/settings/accessibility` | Access preferences | 1 | P0 |
| 29 | `/settings/privacy` | Consent and sharing management | 8 | P1 |
| 30 | `/provider/dashboard` | Provider overview | 8 | P0 |
| 31 | `/provider/queue` | Follow-up queue | 8 | P0 |
| 32 | `/provider/mother/[id]` | Authorized mother overview | 8 | P0 |
| 33 | `/provider/requests/[id]` | Update request status | 3, 8 | P0 |
| 34 | `/offline` | Offline state with honest limits | PWA | P1 |
| 35 | `/access-denied` | No-consent state (provider or family) | 8 | P1 |
| 36 | `/not-found`, `/error` | System states | — | P2 |

Demo path (all P0): 1 → 2 → 3 → 4 → 5 → 9 → 12 → 13 → 14 → 16 → 24 → 25 → 31 → 32 → 33. Design every P0 screen at full fidelity in Figma first; P1 screens may be lower fidelity and reuse components.
