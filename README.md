# PROHOR Premium UI/UX — Skill & Repository Starter Kit

**Status:** working design specification (tokens and implementation reference), **not** a finalized product `design.md`, certified accessibility audit or finished PROHOR app.

## What this includes
- `AGENTS.md`: repository-wide developer + AI agent rules.
- `.claude/skills/prohor-premium-uiux/SKILL.md`: portable Claude-style skill with YAML frontmatter.
- `docs/design-system/PROHOR_DESIGN_SPEC.md`: vision, UI principles and screen architecture.
- `docs/design-system/TOKENS.md` and `design-tokens.json`: three candidate appearance themes, semantic typescale, spacing and motion.
- `docs/design-system/ACCESSIBILITY.md`: baseline accessibility and assistive-tech coverage.
- `docs/design-system/UX_FLOWS.md`: task-first onboarding and linked module journeys.
- `docs/design-system/COMPONENT_STANDARDS.md`: React/Tailwind v4 components and states.
- `docs/design-system/AI_MEDICAL_CONTENT.md`: healthcare, RAG, reports, consent and safety boundaries.
- `docs/design-system/QA_CHECKLIST.md`: comprehensive review/checklist.
- `docs/design-system/CONTRAST_REPORT.md`: calculated **sample** contrast pairs, not whole-screen certification.
- `src/styles/prohor-tokens.css`: Tailwind CSS v4 semantic token implementation.
- `src/lib/access-preferences.ts`: independent, validated, locally saved access preferences.
- `src/components/accessibility/AccessPreferencesPanel.tsx`: accessible React reference panel.
- `scripts/check-color-contrast.mjs`: script for selected palette-pair tests.
- `.github/pull_request_template.md`: team review template.

## How to install into your existing repository
1. **Extract this ZIP at the repository root.** Review conflicting paths rather than overwriting a working project blindly.
2. Read `AGENTS.md` and `.claude/skills/prohor-premium-uiux/SKILL.md`; optionally invoke the enabled MagicPath skill named **PROHOR Premium UI/UX** for canvas designs.
3. Import the token file once. In Tailwind v4 / Next.js, the CSS example contains `@import "tailwindcss"`; remove the duplicate Tailwind import if your global CSS already has it, and load the file from your app root CSS. Do not import the same Tailwind preflight twice.
4. The example access panel imports `../../lib/access-preferences` relative to the supplied location. Reconcile with your project's path aliases.
5. The local preference example does **not** translate copy, provide full AAC, or persist settings to a database. Add real localization, supported AAC components and account synchronization before claiming them as functional.
6. For the initial release, prioritize keyboard- and screen-reader-accessible tasks, Bangla RAG with sources, persistent records, authorized care requests and error handling over multiple decorative themes.
7. From the repository root run `node scripts/check-color-contrast.mjs`. It checks specified color pairs only; full rendered UI still needs manual testing.

## How to use with Claude Code
Claude Code can discover the skill in `.claude/skills/prohor-premium-uiux/SKILL.md` by its name and description. Example request: “Use prohor-premium-uiux to build the accessible Barta question page. Follow AGENTS.md and report WCAG/medical privacy gaps.”

## How to use with MagicPath
Open MagicPath's Skills collection, locate **PROHOR Premium UI/UX**, verify it is enabled and apply it to any new PROHOR component/design. The MagicPath workspace skill is maintained separately from these local repo files; keep them aligned when team decisions change.

## Product decisions not to override
- One shared **task-first** entry for everyone; never ask “disabled or non-disabled?”
- Appearance themes Quiet Garden, Original Rose, Morning Mist are **provisional candidate skins**, not fixed clinical settings; an independent higher-contrast option is required.
- Readability, keyboard/screen reader, privacy and medically accurate source-labeled content matter more than decorations.
- Eight modules: Adapt / Barta / Shonket / Jibonrekha / Bujhi / Shusthota / Poth / Bondhon.
- 24 long-term capabilities are not all a six-day MVP commitment.
- Never present mocks or AI-generated clinical content as real medical care or provider access.

## References (documentation)
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI ARIA APG: https://www.w3.org/WAI/ARIA/apg/
- WAI cognitive supplemental guidance: https://www.w3.org/WAI/WCAG2/supplemental/
- Tailwind v4 theme variables: https://tailwindcss.com/docs/theme
- Next.js font optimization: https://nextjs.org/docs/app/getting-started/fonts

## Important note
This package intentionally does **not** create a final `design.md` or make unsupported claims about accessibility certification, validated medical information, full Bangla localization, completed AAC technology or working backend operations. Those require project-owner approval and actual implementation/tests.
