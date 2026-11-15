# Homepage navigation redesign

Created in MagicPath and applied to route `/` on 15 November 2026. The rejected floating capsule has been replaced by a full-width header with a subtle bottom divider, aligned to the homepage content. Adjust uses one 44px sliders button with its full accessible name and a dismissible hover/focus tooltip. Language uses understated text controls; the active section has an underline. Navigation controls use the existing control radius instead of pill corners.

The desktop header is 72px tall and becomes 64px after the hero. Mobile is 64px tall, with the wordmark, Adjust and menu. The mobile sheet retains all four links, language, the full Adjust label and Sign in. It uses native dialog semantics, explicit Tab/Shift+Tab cycling, Escape, scroll locking and focus restoration, including handoffs to existing dialogs. Tablet switches to the sheet before links become crowded. At enlarged text sizes the bar can reflow into two rows and stop sticking so it does not obscure the page.

The user's task is public navigation: understand the product, reach a section, change presentation or open the existing sign-in preview. Entry is the wordmark and four anchors; success is the destination section or the existing dialog with focus preserved. Language and appearance remain local presentation choices. This pass adds no health-data processing, clinical claims, sharing or backend functionality.

## Screenshots

Captured 52 images. Visual review covered normal and scrolled headers, menus in every theme and contrast mode, and enlarged Bangla for alignment, readable contrast and unclipped text. These are viewport captures of the isolated production snapshot, including surrounding work from the other active homepage session.

| Theme | Desktop | Mobile | Mobile menu | Scrolled desktop |
| --- | --- | --- | --- | --- |
| Quiet Garden | [1440px](quiet-garden-1440.png) · [Header](quiet-garden-1440-header.png) | [390px](quiet-garden-390.png) | [Open](quiet-garden-390-menu.png) | [64px header](quiet-garden-1440-scrolled.png) |
| Original Rose | [1440px](original-rose-1440.png) · [Header](original-rose-1440-header.png) | [390px](original-rose-390.png) | [Open](original-rose-390-menu.png) | [64px header](original-rose-1440-scrolled.png) |
| Morning Mist | [1440px](morning-mist-1440.png) · [Header](morning-mist-1440-header.png) | [390px](morning-mist-390.png) | [Open](morning-mist-390-menu.png) | [64px header](morning-mist-1440-scrolled.png) |

| Higher contrast | Desktop | Mobile | Mobile menu | Scrolled desktop |
| --- | --- | --- | --- | --- |
| Quiet Garden | [1440px](quiet-garden-contrast-more-1440.png) | [390px](quiet-garden-contrast-more-390.png) | [Open](quiet-garden-contrast-more-390-menu.png) | [Scrolled](quiet-garden-contrast-more-1440-scrolled.png) |
| Original Rose | [1440px](original-rose-contrast-more-1440.png) | [390px](original-rose-contrast-more-390.png) | [Open](original-rose-contrast-more-390-menu.png) | [Scrolled](original-rose-contrast-more-1440-scrolled.png) |
| Morning Mist | [1440px](morning-mist-contrast-more-1440.png) | [390px](morning-mist-contrast-more-390.png) | [Open](morning-mist-contrast-more-390-menu.png) | [Scrolled](morning-mist-contrast-more-1440-scrolled.png) |

[Focus tooltip](quiet-garden-1440-tooltip.png), [320px menu](quiet-garden-320-menu.png), [Bangla menu](bangla-320-menu.png), [200% Bangla](bangla-200-320.png), [200% Bangla menu](bangla-200-320-menu.png). Raw layout evidence is in [measurements.json](measurements.json), and the menu accessibility structure is in [accessibility-tree.yml](accessibility-tree.yml).

## Verification and limits

- Lint: zero errors, one existing warning in `postcss.config.mjs`.
- Typecheck: passed in the workspace and the isolated preview.
- Production build: passed in the isolated preview; all 17 routes compiled. The snapshot includes the other session's hero and care styles once its previously missing stylesheet appeared. No imports were omitted from that final successful build.
- All six navigation/module/roadmap tests passed. The two existing public navigation/API tests also passed. Tests verify the flat full-width header, 44px Adjust control, tooltip dismissal, 72→64px sizing, scroll-spy, skip link, modal focus, scroll lock, language, preference/sign-in handoffs, reduced motion, 200% Bangla and available roadmap content.
- Header reflow and 44px targets passed at 320, 360, 390, 430, 768, 1024, 1280 and 1440px in English and Bangla.
- Scoped axe checks reported zero A/AA violations for the header in both languages across all three themes and independent higher contrast. Open-menu axe checks also passed all six theme/contrast combinations. All 18 existing token contrast checks passed.
- Capture measurements verify 12 theme/contrast/width combinations, 52 PNGs, exact header geometry and no runtime errors in those captures.
- Native screen-reader speech, physical devices, Safari/Firefox and native browser 400% zoom were not tested. This is not a claim of WCAG certification.

The shared working tree is being edited by another session, confirmed by the user. Its work was preserved, including its changes to the central token file. To avoid competing builds and test output, final navigation verification ran against a frozen production copy at `D:\prohor-nav-preview-20261115`, with its own output folder. The user's development server was left untouched.

The broader snapshot run reported **22 passing / 9 failing tests** outside the navigation implementation: hero decorative-node and animation expectations; hero/document reflow at 1024px; care read-aloud/reflow; an existing preferences-label selector; transient animated hero contrast; and an asset regression test that still expects the replaced `.story-product-label`/`.story-floating-answer` hero markup. These failures were not hidden or fixed by changing the other session's sections. The focused run, recorded in [navigation-tests.json](navigation-tests.json), includes the obsolete hero-asset test so its failure remains visible alongside passing navigation tests.

Self-review (1–5): hierarchy 4, typography 4, responsive navigation 4, keyboard task completion 4, error resilience 4, trust/consent 4, source integrity 4, code quality 4. Broader page regressions above remain outside this navigation-only pass.

## Files changed in this pass

- `src/components/marketing/PublicNav.tsx` — compact Adjust, clean-header hook and dismissible tooltip; existing navigation behavior retained.
- `src/components/marketing/homepage-navigation.css` — scoped header, control and sheet styles using existing tokens.
- `src/app/(marketing)/page.tsx` — adds the navigation stylesheet import only; concurrent changes preserved.
- `tests/navigation-polish.spec.ts` — updates rejected pill geometry expectations and checks tooltip dismissal.
- `tests/navigation-redesign.spec.ts` — both-language reflow, target sizes and theme/contrast accessibility checks.
- `scripts/capture-navigation-redesign.mjs` — reproducible screenshots and measurements.
- `scripts/prepare-magicpath-navigation.mjs` — stages the MagicPath navigation preview from the existing component and canonical tokens.
- This report and evidence in `docs/qa/navigation-redesign/`.

This pass did not edit `AGENTS.md`, `DESIGN.md` or `src/styles/prohor-tokens.css`, change other routes, or modify the other homepage sections. The navigation component was built and visually checked in MagicPath with the enabled PROHOR Premium UI/UX skill. No image search, image generation or new image assets were needed.
