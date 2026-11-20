# Bujhi redesign implementation plan

Goal: Make report review and kit guidance clear, responsive and keyboard operable while retaining all existing safety and saving boundaries.

Design basis: repository DESIGN.md and docs/design-system (documented language, L1; no external design library connection). Use existing components, semantic tokens and default fonts. User requested direct execution, with no Claude application or quota use.

## Scope and approach
- Account landing: compact, language-aware report and kit choices; retain shared AuthShell navigation.
- Account report: upload, consent, processing, failure/manual fallback, source comparison, editable values, confirmation, retry and saved state. Preserve existing account commit validation and provenance.
- Kit: start, context, timing/symptoms, mark, result, guide, text, state reference, optional local note and saved state. One task column and one safety panel; urgent symptoms stay first.
- Local fallback: manual, voice and review/explain/save surfaces remain functional; no backend capability expansion.
- Mobile stacks in DOM order, desktop uses available width. Native inputs, visible focus, no new dependencies or animation.

## Execution
- [x] Inspect five reference screenshots, HTML, routes, design rules and existing changes.
- [x] Preserve newer shared-checkout report work discovered after pause.
- [x] Refine landing and kit composition; widen fallback review and frame speech input.
- [ ] Verify browser task paths, 320px reflow, theme combinations and axe.
- [ ] Run typecheck, lint and relevant tests; capture screenshots and document limits.

## Review focus
No unverified save, uncertain dates remain unsaved, offline errors retain inputs, urgent help independent of AI, access preferences retain form state. Real account persistence and actual screen-reader testing require separate verification.
