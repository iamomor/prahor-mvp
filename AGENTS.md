# AGENTS.md — PROHOR repository instructions

> Applies to every human developer and coding/design agent working in this repository.
> Product: **PROHOR | প্রহর** — Universal Adaptive AI Maternal & Child Care Ecosystem.
> Status: **design and hackathon MVP specification**, not a claim of clinical validation or WCAG certification.

## Mission and outcome
Deliver an original, calm, trustworthy, responsive, Bangla-capable maternal healthcare experience in which mothers with different access preferences complete **the same care journeys**. Optimize for task completion, user autonomy, understandable information, verified sources, privacy, and real human-care handoff. The product must never categorize people as “normal/disabled” or “standard/special.”

## Mandatory skill
Read `.claude/skills/prohor-premium-uiux/SKILL.md` before designing, modifying, reviewing, or generating any UI. Follow its linked references and `docs/design-system/`. In MagicPath, enable/use the **PROHOR Premium UI/UX** skill. Existing repository patterns win over generic examples where compatible with these rules.

## Product modules (fixed names)
1. **Adapt** — universal accessibility and interaction preferences.
2. **Barta** — source-grounded Bangla maternal education AI.
3. **Shonket** — reviewed safety information and human handoff entry.
4. **Jibonrekha** — connected but distinct maternal and baby records.
5. **Bujhi** — supported medical report extraction, correction, and understanding.
6. **Shusthota** — optional physical, emotional, and daily-life wellness; private diary.
7. **Poth** — accessible care directory and visit preparation.
8. **Bondhon** — consent-controlled supporters, care requests, provider queue, audit.
The 24-feature full roadmap does **not** imply 24 MVP features; mark mock, limited, working, and future capabilities accurately.

## Product-level UX decisions
- One unified, **task-first** welcome page; public educational content and care directory may be explored without a pregnancy profile. Request authentication only when necessary for private records.
- No separate disability or care-tier sign-up and no forced accessibility questionnaire. From the first screen provide a clearly labelled **“Adjust how you use PROHOR”** entry; it stays available across all modules.
- Essential baseline access always works: keyboard, screen reader, semantic HTML, robust form labels, captions/transcripts where relevant, no voice-only task.
- Optional preferences combine independently: theme, higher contrast, text scale, spacious layout, reduced motion, simplified *reviewed* text, read-aloud, AAC and language. Changing them must not lose unsaved inputs or change care rights.
- **Theme ≠ accessibility.** Three candidate appearance themes: Quiet Garden (default candidate), Original Rose, Morning Mist. Higher contrast is an independent overlay; all default themes must be accessible. Their final design tokens are provisional until approved.
- Mother controls data sharing. Disability status never automatically authorizes caregivers. Do not share private diary or AI conversation contents by default.
- Safety/help information must be reachable without AI. Never claim a clinician received a request until actual delivery/acknowledgement is verified.

## Design craft rules
- Build mobile-first at 320/360/390/430px, then tablet and desktop; honor safe areas, browser zoom, text wrapping and 400% reflow.
- Prefer distinct hierarchy, ample but deliberate whitespace, clear content-group boundaries, warm but professional adult tone, readable Bengali text, and restrained illustrations. Original designs only; Dribbble/image references are *inspiration*, not source code or layouts to copy.
- Use central semantic tokens from `src/styles/prohor-tokens.css`; never scatter literal brand colors in feature components.
- Components: real HTML button/link/form elements, persistent labels, focus-visible outlines, understandable error text, review/undo for important actions, empty/loading/error/success/offline states.
- Typography: one Bangla-capable family (e.g. Noto Sans Bengali) with a restrained Latin family (e.g. Manrope), sensible fallbacks, root font scalable, body >= 1rem, line-height 1.5–1.7, content width ~65ch where reading. **Do not ship font files to users.**
- For animated UI, use understated CSS transitions (typically 120–240ms) with reduced-motion alternatives; no flashing, automatically playing voice, or decorative delays before urgent information.

## Technical patterns
- Next.js App Router + React + TypeScript strict + Tailwind CSS v4 preferred. Keep server/client boundaries explicit. Prefer server-only AI/API secrets and validated data schemas.
- Separate domain data, access preferences, appearance tokens, and clinical provenance. Shared code must not infer diagnoses or competence from preferences.
- Suggested folders: `src/app`, `src/components/ui`, `src/components/accessibility`, `src/features/{adapt,barta,shonket,jibonrekha,bujhi,shusthota,poth,bondhon}`, `src/lib`, `src/styles`, `src/i18n`, `tests`, `docs/design-system`.
- Use tokens with Tailwind v4 `@theme inline` semantic aliases. Theme on `html[data-theme]`, independent contrast on `html[data-contrast]`. Honor `prefers-reduced-motion` and `forced-colors: active`.
- Maintain keyboard focus across dialog open/close, route transitions, validation, theme changes and AAC composition. Do not build click-only divs or drag-only controls.
- Use synthetic health data for demos, clearly marked; do not place PHI into analytics, client logs, source control, or unapproved AI services.

## AI and medical integrity
- Barta: approved-source RAG; show real citations, uncertainty, abstention, error paths. No unvalidated AI diagnosis, symptom triage, medication prescribing, treatment or reassurance.
- Bujhi: OCR/extraction is uncertain until reviewed; clearly label extracted data and confirm before saving into the correct maternal/baby record.
- Shonket: clinician-reviewed urgent information + appropriate immediate-care options; do not route emergency decisions through an unvalidated LLM.
- Bondhon: summaries may draft **only from authorized, source-labelled records**, require mother review and explicit consent before sharing.
- Do not invent facilities, accessibility features, appointment availability, clinical values, sources, or provider responses.

## How to work (required before modifying UI)
1. Identify primary user's job and risk (public info / personal data / safety-critical).
2. Map entry, primary action, success state, failure state, accessibility paths, and cross-module link.
3. Reuse existing components and tokens. Build functional markup first; refine visuals after.
4. Provide narrow, typed React components with clear props and no unnecessary state duplication.
5. Test at least one preferred interaction path plus a keyboard-only path.
6. Document limitations as **working / limited / prototype / future**; never describe a mockup as live.

## Definition of done
- All key tasks keyboard operable and screen-reader discoverable; visible, unobscured focus.
- WCAG 2.2 AA target: body 4.5:1, large text 3:1, relevant essential nontext UI 3:1; no color-only status.
- 200% text resize, 320px reflow (or 400% browser zoom), long Bangla labels, no clipped content.
- User-selected contrast/layout/motion/theme combinations do not break forms, data, or navigation.
- Form errors understandable and announced; confirmation accurately reflects backend state; offline status honest.
- Auth/data permission checks exist server-side; consent respected; generated AI claims verified/qualified.
- Run typecheck, lint, tests, axe where configured, and manual keyboard plus screen reader checks. Record untested devices/access needs rather than claiming universal conformance.
- PR includes screenshots/short capture for key states and a plain-language test report.

## Team and Git workflow
Omor: PM + shared architecture, auth, backend, integration, release. Iftee: UI system and Adapt. Ifty: Barta/Bujhi AI. Apubo: Jibonrekha/Bujhi verification UI. Samin: Shusthota/Poth/Shonket and Bondhon UI + end-to-end QA. All members review and test.
One repository. Work on named member branches; PR into protected `develop`; release `develop` to protected `main`. Never commit real secrets or medical data. Freeze major features before final QA and demo.

## Read these references
- `docs/design-system/PROHOR_DESIGN_SPEC.md`
- `docs/design-system/TOKENS.md`
- `docs/design-system/UX_FLOWS.md`
- `docs/design-system/ACCESSIBILITY.md`
- `docs/design-system/COMPONENT_STANDARDS.md`
- `docs/design-system/AI_MEDICAL_CONTENT.md`
- `docs/design-system/QA_CHECKLIST.md`

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
