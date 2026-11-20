---
name: prohor-premium-uiux
description: >
  Design, implement, critique, or audit original premium, inclusive maternal healthcare UI for PROHOR.
  Trigger for onboarding, accessibility personalization, app shell, mother/baby timelines, Bangla RAG,
  report reader, wellness, facility navigation, consent-based care handoff, design tokens,
  React/Tailwind work, design.md preparation, responsive and accessibility QA.
---

# PROHOR Premium UI/UX

## Mission
Create **one inclusive maternal healthcare application** with universal baseline accessibility and independently combinable optional preferences. Make daily care tasks fast, understandable and dignity-preserving; maintain medical provenance and privacy.

**Before doing work** read repository `AGENTS.md` and the design-system references listed at the bottom. Use this skill in MagicPath and as a Codex-style local skill. If older screenshots or prompts say “Standard Care”, “Personalized Care”, “disabled section”, or “Moner Sathi”, use our final UX decisions instead: task-first onboarding, no user classification, and **Shusthota**.

## Fixed product architecture
Modules: Adapt (accessibility), Barta (evidence-grounded education AI), Shonket (reviewed safety + help), Jibonrekha (separate mother and baby records, connected journey), Bujhi (report extraction and review), Shusthota (optional activity, rest, mood, diary), Poth (verified care directory), Bondhon (consent and provider requests). **All modules share authentication, records, privacy, and access preferences.**

## Hard constraints — do not violate
1. Never label people by ability or create unequal care tiers. One entry; offer **“Adjust how you use PROHOR”** before/during any task.
2. Full baseline keyboard and screen-reader access without enabling a setting; prefer semantic HTML and tested accessible primitives.
3. Appearances are optional. Candidate themes: **Quiet Garden** (default candidate), **Original Rose**, **Morning Mist**; independent **High Contrast** setting. Don't assign colors to disability groups. Never make the default themes inaccessible.
4. Don't use AI to infer disability, cognition, medical urgency, diagnoses or treatment. Evidence-based educational responses only; reviewed safety content and explicit human escalation.
5. Never show invented clinical measurements, report interpretation, provider acknowledgement, location accessibility, or unavailable AI functionality as real.
6. No caregiver automatically gains access to maternal records; require granular, revocable consent.
7. Make saving/syncing/offline/retry states explicit; preserve partially completed care tasks through configuration changes.

## Required design thinking workflow
**Discover**: state the user's immediate job-to-be-done, access context, language, urgency/sensitivity, and definition of success; do not ask repeat questions answered by PROHOR context.
**Structure**: show information hierarchy and primary path before embellishment; use progressive disclosure and short pathways. Public AI education and facility information may not need sign-in; private records do.
**Design**: use semantic tokens, purposeful editorial hierarchy, warm but adult imagery and generous, meaningful whitespace. Design mobile-first and then scale. Provide realistic empty, loading, validation, offline, success, and permission states.
**Build**: React/TypeScript components and Tailwind v4 semantic token utilities; no placeholders that behave like finished functions.
**Verify**: test task completion, contrast and reflow, keyboard, screen reader, Bangla layouts, themes/contrast combinations, privacy/consent, failure recovery, and factual clinical content.
**Explain**: indicate prototype vs working implementation, describe known limitations, and list what must be tested with actual disabled users.

## Design language
Premium organic minimalism. Apon's clarity + Mati's grounded warmth, not a copied competitor aesthetic. Strong typographic hierarchy, clean lines, editorial section titles used sparingly, functional iconography, subtle borders, limited shadows, contextual illustrations. Prefer task-first content over crowded card grids. Avoid pastel low-contrast body text, pink-only gendered cues, shiny gradients, glassmorphism, generic “AI slop,” dense hospital spreadsheets, gratuitous animation.

### Theme and semantic token rules
Choose **one recognizable brand default**, but support user-selectable themes and independent accessibility preferences.
- Quiet Garden: `#2F6B54` primary, `#FFFCF5` background, `#E6F2E9` surface, `#F4C96B` accent, `#23352D` text.
- Original Rose (candidate): `#70445A` primary, `#FBF6F2` background, `#F2DFE4` surface, `#432C36` text.
- Morning Mist (candidate): `#075B67` primary, `#F8FAF9` background, `#DFEEEE` surface, `#17373B` text.
- Higher contrast separately overrides semantic foreground/borders/focus, not feature availability or selected theme memory.
- Key tokens: `--pro-bg`, `--pro-surface`, `--pro-text`, `--pro-text-muted`, `--pro-primary`, `--pro-primary-on`, `--pro-border`, `--pro-focus`, `--pro-success`, `--pro-danger`, `--pro-warning`.
- No one-off feature hardcodes. Store preferences as presentation values, separate from medical and consent data.

### Spacing, typography, shape
Use 4px spacing base and deliberate 8px rhythm; page gutters mobile 16–20px, tablet 24px, desktop 32–48px. Reading columns ~60–70ch, content max 1200px when helpful. Forms predominantly single column. Radius 10px controls, 14–16px cards, 20–24px hero panels; outline/border before heavy shadow.
Bangla body: Noto Sans Bengali or suitable licensed alternative; Latin: Manrope or similarly readable humanist sans. Prefer two families maximum; body **>=16px / 1rem** line-height 1.5–1.7; headings 1.15–1.3. Honor text scaling and long Bangla labels, and use proper `lang` attributes. No embedded text inside decorative image files.

### Accessibility baseline
Target **WCAG 2.2 AA**; do not claim certified conformance until assessed. Text contrast 4.5:1, large 3:1, meaningful nontext UI 3:1; 44–48px product target for major controls (WCAG 2.2 SC 2.5.8 minimum is 24px with exceptions); visible focus and focus not obscured; keyboard/no trap; accessible names and errors; 200% text resize and 320px reflow; `prefers-reduced-motion`, `forced-colors:active`, screen readers, captions/transcripts, appropriate role/state announcements and data tables for charts. All help access works without speech. Multiple access preferences may coexist.

### Responsive behavior
Design at 320, 360, 390, 430, 768, 1024, 1280, 1440 CSS widths; test soft keyboards, safe areas, 200% text and 400% zoom. Mobile bottom navigation for frequent tasks when beneficial; desktop sidebar only when it improves scanning. Consistent route names and destinations. Do not hide urgent/help access in more than one submenu. Test low-bandwidth and intermittent connectivity, draft retention, explicit 'not sent' vs 'delivered' state.

### Microinteractions
Purpose-driven motion only: press feedback 120–180ms, state changes 180–240ms, larger transitions <=320ms; use opacity/transform with careful easing, no blocked interaction. Hover not required to reveal content. All pending/saved/error states have persistent readable labels, not just color or a disappearing toast. Reduced-motion alternatives required. No flashing alarms or autoplay audio.

### Clinical and AI UX
Barta responses: plain source-grounded text, visible citations to retrieved evidence, clear 'not enough information', direct links to human care where appropriate. Bujhi: upload → OCR → user verifies extracted values and units → accessible explanation → authorized save. Jibonrekha: distinguish self-entered from extracted and clinician-confirmed observations. Shusthota: inclusive activity choices, no compulsory step goals or mood diagnosis. Poth: verified facility attributes and accessible list alternative to map. Bondhon: user-scoped record selection, recipient and purpose review, explicit Send, accurate status; private diary hidden by default.

### React/Tailwind v4 implementation
- Strict TS; Next.js App Router where used; minimal 'use client'; server-side AI and protected requests.
- Import `src/styles/prohor-tokens.css` in global styles and define Tailwind v4 aliases with `@theme inline`; use utilities `bg-pro-bg`, `text-pro-text`, `bg-pro-primary`, etc.
- Theme root: `data-theme="quiet-garden|original-rose|morning-mist"`; independent `data-contrast="more"`, `data-text-scale`, `data-motion`, `data-layout`. Respect OS preferences and forced colors.
- Preference settings load before key UI paint where possible, avoid hydration flashes; persist locally for pre-auth, optionally sync to account with consent after auth; protect unsaved forms.
- Use accessible buttons, links, labels, fieldset/legend, headings and landmarks, native fields; explicit validation; `focus-visible`; correct dialogs (focus trap, escape, return). Avoid icon-only unlabeled buttons and click-handler divs.
- Modular components, typed props, separation of API and UI state. Reuse AppShell, PageHeader, FormField, AppButton, ThemeSelector, AccessPreferences, StatusNotice, DraftRecovery, ConsentReview, CareRequestForm and AIReference.

## Output contract for UI tasks
Return: user job, prioritized screen IA, mobile and desktop layout, component tree, copy, key UI/interaction states, keyboard/screen reader behavior, token usage, privacy/medical risks, test cases, implementation/code if requested, and honest prototype/working status. When asked to visually design, make original layouts that match PROHOR's token and access rules.

## Definition of done
Run the checklist in `docs/design-system/QA_CHECKLIST.md` including accessibility and clinical safety; no red/critical defects on demo journey. Score hierarchy, typography, responsive behavior, accessible task completion, error resilience, trust/consent, AI/source integrity, and code quality from 1–5; any <4 must be fixed or explicitly documented. Do not invent compliance claims.

## References
`AGENTS.md`, `docs/design-system/PROHOR_DESIGN_SPEC.md`, `docs/design-system/TOKENS.md`, `docs/design-system/UX_FLOWS.md`, `docs/design-system/ACCESSIBILITY.md`, `docs/design-system/COMPONENT_STANDARDS.md`, `docs/design-system/AI_MEDICAL_CONTENT.md`, `docs/design-system/QA_CHECKLIST.md`.
