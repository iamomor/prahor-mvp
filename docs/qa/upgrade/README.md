# PROHOR homepage upgrade — verification

Reviewed on 15 November 2026 using the production Next.js build in Microsoft Edge on Windows. Scope: route `/`. No other route, API, authentication flow, design specification, or shared token file was changed.

## Result

The homepage now has the requested Fraunces display hierarchy, four product figures, compact live UI cards, eight-module overview, four journey phones, three-step support panel, two audience windows, responsible-AI cards, team, expandable roadmap, and rounded final CTA. The existing three-phone visit-question experience remains interactive.

The Default preset uses `next/font/google` Fraunces 500/600 with real normal and italic styles, Latin subset and `display: swap`. Manrope remains the English body/heading/control family; Bangla uses Noto Sans/Serif Bengali with normal, unsynthesized emphasis. This exception is scoped to the homepage. The other four preset role definitions were not changed. `AGENTS.md`, `DESIGN.md` and `src/styles/prohor-tokens.css` have matching before/after SHA-256 hashes.

All visual colors, gradients, borders and shadows derive from the existing semantic tokens. On light backgrounds, headings use primary where the accent does not reach the large-text contrast target. Dark sections use the accent for emphasis and on-primary text for paragraphs.

## Screenshots

These are full-page production screenshots. The matching `*-hero.png` files show an unscaled first viewport. Edge software rendering avoids a GPU capture defect that repeated content after 16,384 pixels in the long mobile screenshots; it does not alter the page layout.

| Theme | 1440px | 390px | Higher contrast, 1440px | Higher contrast, 390px |
| --- | --- | --- | --- | --- |
| Quiet Garden | [Desktop](quiet-garden-1440.png) | [Mobile](quiet-garden-390.png) | [Desktop](quiet-garden-contrast-more-1440.png) | [Mobile](quiet-garden-contrast-more-390.png) |
| Original Rose | [Desktop](original-rose-1440.png) | [Mobile](original-rose-390.png) | [Desktop](original-rose-contrast-more-1440.png) | [Mobile](original-rose-contrast-more-390.png) |
| Morning Mist | [Desktop](morning-mist-1440.png) | [Mobile](morning-mist-390.png) | [Desktop](morning-mist-contrast-more-1440.png) | [Mobile](morning-mist-contrast-more-390.png) |

Detailed section captures are available at both widths: [product figures](product-1440.png), [problem](problem-1440.png), [Adapt](adapt-1440.png), [companion cards](companion-1440.png), [journey](journey-1440.png), [support](support-1440.png), [two windows](windows-1440.png), [responsible AI](responsible-1440.png), [team](team-1440.png), [expanded roadmap](roadmap-1440.png), and [CTA](cta-1440.png). Replace `1440` with `390` for the corresponding mobile file.

Additional evidence: [Bangla mobile](bangla-390.png), [Bangla at 200% text and 320px](bangla-200-320.png), [layout measurements](measurements.json), and [accessibility tree](accessibility-tree.yml). All twelve theme/contrast captures have the correct document width, seven phones, no page errors, and a three-line desktop hero.

## User journey and behavior

The primary job is public product discovery and preparing a visit question without an account. Entry is the hero; Explore PROHOR goes to the feature overview and See how it works goes to the shared-question experience. A mother can type the same question in touch/text, larger-text, or picture-and-text presentations, then review it. Review explicitly announces that nothing was sent. Presentation and language changes preserve the question; reloading restores sample content rather than saving a health record.

The structure is `Homepage → PublicNav → main → twelve story sections → StoryFooter`, with native preference and sign-in dialogs. `HomepageStory` contains the hero, problem, Adapt and roadmap; `HomepageUpgrade` contains the compact product-story sections; `ProductScreens` supplies typed phone frames, timeline, evidence chip, consent controls and browser windows. Copy is available in English and Bangla, with explicit language attributes on mixed-language content.

Working local interactions include theme, text-size and contrast controls, the persistent preferences dialog, language selection, visit-question review, two-example facility filtering, a mood radio group, consent toggles and roadmap disclosure. Themes preserve language, reading density and unsaved question text. Picture choices replace a complete phrase rather than appending repeated prefixes. No AI, record save, report upload, provider request or clinical delivery is simulated as a successful backend operation.

Keyboard verification covers the skip link, editing/review, modal focus containment, Escape and return focus, navigation and unobscured focus with enlarged Bangla text. Semantic labels, fieldsets, radio/checkbox states, live status messages and native disclosure controls are represented in the accessibility tree. Reduced motion and forced colors remain usable. Offline feedback says only already-loaded content is available and does not claim a request was sent. Facility filtering includes an announced empty result. Sign in opens the existing honest availability notice.

## Facts, source integrity and consent

The four prominent figures come only from the PROHOR specification: 8 modules, 24 planned capabilities, 0 disability categories, and 2 distinct records in one journey. The existing roadmap data has **1 Limited and 23 Future** capabilities. Status chips appear only in that roadmap. The optional working-count figure was omitted.

Two small contextual facts appear only beneath the problem points:

- About 4,000 maternal deaths in Bangladesh in 2023, with a maternal mortality **ratio** 79% lower than in 2000. The ratio distinction corrects an ambiguity in the supplied wording. Source: [UNICEF Bangladesh, UN estimates, 2025](https://www.unicef.org/bangladesh/en/press-releases/uncertainty-aid-commitments-threatens-bangladeshs-progress-maternal-health-unicef).
- One in three women who died of maternal causes had sought care at three or more places. Source: [BMMS 2016 analysis, Journal of Global Health, 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10248997/).

Sample educational text links to [WHO antenatal care, 2016](https://www.who.int/publications/i/item/9789241549912). Warning-sign examples link to [CDC Hear Her](https://www.cdc.gov/hearher/maternal-warning-signs/index.html). The 999 call link uses the Bangladesh national emergency number, corroborated by the [Bangladesh Police directory](https://www.police.gov.bd/en/hot_line_number). No clinician participation or PROHOR-specific clinical review is claimed. The facility examples link directly to the official DGHS registry for [Dhaka Medical College Hospital](https://hrm.dghs.gov.bd/public/facility-registry/facilities/31/profile) and [Sir Salimullah Medical College Mitford Hospital](https://hrm.dghs.gov.bd/public/facility-registry/facilities/52/profile); availability, appointments and access facilities are not invented.

Each phone has one Sample data tag. The mother/provider windows and mini UI samples also identify sample content. The provider window represents a concept, not a connected provider. Diary and AI conversation content remain outside default sharing; toggles do not grant server authorization. Evidence, abstention, mother review and consent are visible in the support story. No diagnosis, severity score or AI triage is offered.

## Validation

| Check | Result |
| --- | --- |
| `npm run build` | Pass; 17 routes generated/compiled |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass with 0 errors; one existing anonymous-default-export warning in `postcss.config.mjs` |
| `npm run check:contrast` | All 18 semantic-token checks pass |
| Production Playwright suite | 12 tests pass, including all homepage, navigation and asset recovery checks |
| axe WCAG A/AA rules | Zero reported violations in all 3 themes × 2 contrast modes, Bangla, and both dialogs |
| Responsive checks | 320, 360, 390, 430, 768, 1024, 1280 and 1440px; English and 200% Bangla with spacious layout/relaxed spacing; no horizontal overflow |
| Fonts | Real Fraunces italic, Manrope body, normal Bangla emphasis, Default-only display override, exactly 3 hero lines at 1440px |
| Task and persistence | Keyboard question review; repeated phrases do not duplicate; drafts survive theme/language/reading changes; appearance changes preserve language on reload |
| Local privacy | Sample interactions send no API requests; diary remains private; no false saved/delivered state |
| Runtime and recovery | No page errors in captures; stylesheet reload, return navigation and obsolete-worker recovery tests pass |

Visual review compared the reference's level of product presentation and polish with the original PROHOR result, without copying its composition, assets, colors or text. The review corrected dark-band text contrast, oversized nested preview headings, hero wrapping, Bangla display-font specificity, enlarged-text overflow and the long-screenshot GPU defect. Section captures were checked for gutters, Bangla wrapping, floating-card overlap and alternating background rhythm.

## Missing assets and untested conditions

`public/images/hero-mother.jpg` is absent. The hero and problem section therefore use clean token-colored abstract compositions, without a placeholder label. All five optional team images are absent: `public/team/omor.jpg`, `iftee.jpg`, `ifty.jpg`, `apubo.jpg`, and `samin.jpg`; initials are used. No images were searched for, generated or downloaded for the page. The existing PWA manifest permits the light add-to-home-screen mention; full offline clinical functionality is not claimed.

Native screen-reader speech with NVDA/JAWS/VoiceOver, physical mobile devices and virtual keyboards, Safari/Firefox, native 400% browser zoom, constrained mobile-network performance, participant accessibility research and clinical/Bangla content review were not tested. Semantic tree inspection, axe and keyboard checks do not constitute WCAG certification. The full care ecosystem, clinical review workflow, authentication and provider delivery remain outside this public-page task.

Self-review on the required 1–5 scale: hierarchy 4, typography 4, responsive behavior 4, accessible task completion 4, error resilience 4, trust/consent 4, AI/source integrity 4 and code quality 4. These are implementation-review judgments, not user-research or clinical-validation results.

## Files changed

- `src/app/(marketing)/page.tsx`
- `src/components/marketing/Homepage.tsx`
- `src/components/marketing/HomepageStory.tsx`
- `src/components/marketing/HomepageUpgrade.tsx`
- `src/components/marketing/ProductScreens.tsx`
- `src/components/marketing/homepage.css`
- `src/components/marketing/homepage-story.css`
- `src/components/marketing/homepage-upgrade.css`
- `tests/homepage.spec.ts`
- `tests/public-assets.spec.ts`
- `scripts/capture-homepage-upgrade.mjs`
- `docs/qa/upgrade/README.md` and generated screenshot/measurement evidence in this directory

The existing navigation tests were run as part of the full suite. This checkout has no `.git` directory, so no branch, commit or PR was created.

To reproduce the evidence against a running production preview:

```powershell
$env:PROHOR_TEST_URL='http://127.0.0.1:3112'
$env:PLAYWRIGHT_CHANNEL='msedge'
npx.cmd playwright test
node scripts/capture-homepage-upgrade.mjs
```
