# PROHOR homepage — pass 1

Implemented on 14 November 2026. Scope ends immediately after Adapt. The header and four main sections are the five requested sections; later storytelling sections and the footer are not rendered.

## Screenshots

Captured from the optimized production build in headless Microsoft Edge. Each row has a full page and a first viewport at each requested width. All twelve full pages were visually inspected for contrast, section boundaries, gutters, readable Bangla, and overlapping or clipped content. The additional enlarged-text review identified and fixed an obscuring sticky header.

| Appearance | 1440px full page | 390px full page | First viewports |
| --- | --- | --- | --- |
| Quiet Garden | [Desktop](quiet-garden-1440.png) | [Mobile](quiet-garden-390.png) | [Desktop](quiet-garden-1440-hero.png), [mobile](quiet-garden-390-hero.png) |
| Original Rose | [Desktop](original-rose-1440.png) | [Mobile](original-rose-390.png) | [Desktop](original-rose-1440-hero.png), [mobile](original-rose-390-hero.png) |
| Morning Mist | [Desktop](morning-mist-1440.png) | [Mobile](morning-mist-390.png) | [Desktop](morning-mist-1440-hero.png), [mobile](morning-mist-390-hero.png) |
| Quiet Garden + more contrast | [Desktop](quiet-garden-contrast-more-1440.png) | [Mobile](quiet-garden-contrast-more-390.png) | [Desktop](quiet-garden-contrast-more-1440-hero.png), [mobile](quiet-garden-contrast-more-390-hero.png) |
| Original Rose + more contrast | [Desktop](original-rose-contrast-more-1440.png) | [Mobile](original-rose-contrast-more-390.png) | [Desktop](original-rose-contrast-more-1440-hero.png), [mobile](original-rose-contrast-more-390-hero.png) |
| Morning Mist + more contrast | [Desktop](morning-mist-contrast-more-1440.png) | [Mobile](morning-mist-contrast-more-390.png) | [Desktop](morning-mist-contrast-more-1440-hero.png), [mobile](morning-mist-contrast-more-390-hero.png) |

Additional evidence: [Bangla at 390px](bangla-390.png), [Bangla at 320px and 200% text](bangla-200-320.png), [the enlarged-text task](bangla-200-320-task.png), [section measurements](measurements.json), and [the accessibility tree](accessibility-tree.yml).

## Experience and implementation

The primary job is public product discovery: understand connected maternal care, then try presenting the same visit question in different ways. No health profile or account is needed. This page collects no medical records and makes no care or AI service requests.

The component tree is `Homepage → PublicNav → main(HeroSection, TrustStrip, ProblemSection, AdaptSection)`, with preferences and account-availability dialogs opened on demand. The hero has two HTML previews over a rounded image panel. Adapt renders the same local question state through three `VisitPhone` presentations.

The primary path is Explore PROHOR → the three phone frames → type or compose a question → Review my question. An empty review asks for a question. A completed review displays the local question in all three frames and announces that nothing was sent. Theme, contrast, spacing, language and layout changes retain the draft. Reload clears practice text. Picture buttons are illustrative phrase composition, not a completed AAC system.

The four header links resolve to existing targets in these sections. Responsible AI leads to the visibly sourced static Barta sample. Sign in opens an honest availability dialog because this checkout has no connected sign-in page. It does not collect credentials.

All appearance uses existing semantic color tokens and existing font variables. The source token file is unchanged. The section sequence is the requested background-to-surface hero gradient, background trust strip, surface problem section, and one primary Adapt band. Section padding measures 80px on mobile and 112px on desktop. Frames use semantic controls, persistent labels, and token-based borders and focus rings. Header layout expands with text; at narrow enlarged-text widths it scrolls with the page so it cannot hide the task.

## Verification

| Check | Result |
| --- | --- |
| `npm.cmd run lint` | Passed, zero errors. One existing `import/no-anonymous-default-export` warning in `postcss.config.mjs`. |
| `npm.cmd run typecheck` | Passed after the production build. |
| `npm.cmd run build` | Passed with the production webpack build. |
| Playwright | 10 tests passed against the production build. |
| axe | No violations in the configured WCAG A/AA rules across three themes, each independent contrast overlay, Bangla, preferences and account dialogs. |
| Contrast token script | All 18 configured checks passed. |
| Reflow | No horizontal overflow at 320, 360, 390, 430, 768, 1024, 1280 and 1440px, including 200% Bangla text, relaxed spacing and spacious layout. |
| Keyboard | Skip link, question entry, review, modal containment, Escape and returned visible focus verified. Enlarged-text focus sweep checked at 320, 768 and 1440px; the 768px overlap case has a regression check. |
| Other states | Mobile menu, offline feedback, reduced motion, forced colors, local draft retention, stored preferences, missing-image placeholders and unavailable sign-in verified. |
| Existing regressions | Styles survive reload and back navigation; the old service worker upgrades without retaining stale CSS. Disconnected API endpoints still report 501 and their actual status. |

No new feature sends practice text to an API or stores it in browser storage. User-selected appearance preferences continue to be remembered locally where storage is available.

## Missing assets and limits

Both supplied image paths are absent from this checkout:

- `public/images/hero-mother.webp`
- `public/images/mother-baby-soft.webp`

The requested token-colored placeholders are rendered instead. No images were searched for, downloaded, generated, or substituted. The server checks the two fixed paths; adding the approved files and rebuilding enables their image panels. Their visual crop and exact alt-text accuracy need review when the files exist.

The Barta text is a static Bangla sample based on the real [WHO antenatal-care guideline](https://www.who.int/publications/i/item/9789241549912), not a generated answer or a claim of clinical approval. The timeline is clearly fictional. Account access, real records, clinical AI, provider handoff and a complete AAC experience remain outside this pass.

Automated accessibility and keyboard evidence do not establish WCAG certification. Native screen-reader speech, real mobile hardware, Safari/Firefox, native 400% browser zoom, native-speaker copy review and testing with people with different access needs were not performed.

Craft self-review, on a 1–5 scale: hierarchy 4; typography 4; responsive behavior 4; accessible task completion 4; error resilience 4; trust and consent 4; code quality 4. Photographic warmth remains limited by the two missing supplied assets. Bangla copy and the educational sample require native-speaker and clinical review before release.

## Files changed in this pass

- `src/app/(marketing)/page.tsx`
- `src/components/marketing/Homepage.tsx`
- `src/components/marketing/HomeContext.tsx`
- `src/components/marketing/HomeBrand.tsx`
- `src/components/marketing/PublicNav.tsx`
- `src/components/marketing/PassOneStory.tsx` (new)
- `src/components/marketing/SignInNotice.tsx` (new)
- `src/components/marketing/homepage.css`
- `tests/homepage.spec.ts`
- `tests/navigation.spec.ts`
- `tests/public-assets.spec.ts`
- `scripts/capture-homepage-pass-one.mjs` (new)
- `docs/qa/pass-1/README.md`, `measurements.json`, `accessibility-tree.yml`, and the PNG evidence linked above (new)

`AGENTS.md`, `DESIGN.md` and `src/styles/prohor-tokens.css` were read and left unchanged, verified by SHA-256 checksums before and after the work.

To repeat the screenshot capture, point `PROHOR_TEST_URL` at a running build and run `node scripts/capture-homepage-pass-one.mjs`. The capture uses Edge by default; `PLAYWRIGHT_CHANNEL` can select an installed alternative.
