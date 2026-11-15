# Homepage module, roadmap and navigation polish

Reviewed on 15 November 2026 in Microsoft Edge on Windows against the production Next.js build. Scope is route `/`: the requested module-area typography, roadmap refinements and replacement navigation. Section order, existing copy, other section designs, canonical capability data and other routes were retained. `AGENTS.md`, `DESIGN.md` and `src/styles/prohor-tokens.css` remain unchanged.

## Requested changes

| Area | Result |
| --- | --- |
| Module cards | Existing display role gives Default-preset names Fraunces 600 at 20px. Bangla subtitles use Noto Sans Bengali at 14px and the muted token. Corners are 20px; hover lifts the card and arrow by 2px with a token-derived shadow. Reduced-motion preferences disable movement. |
| Provider pills and phone labels | Pills use Manrope 600 at 14px, a soft token fill, rounded shape, no border and decorative accent checks. Their bottom margin is 24px. Each phone name is Fraunces 600 at 18px with its sample tag directly beside it; the pair is centered over the phone. |
| Roadmap type | Capability names are display-role 600 at 18px; tab names are 600 at 16px. Numbers, counts and status chips use Manrope 600. The existing paragraph is Manrope 500 at 18px, muted, with a 420px maximum width. Bangla display text has an explicit existing Bengali fallback. |
| Roadmap behavior | Initial selection is computed by Working + Limited count, then total capabilities, then stable source order. The current data selects Adapt. Tabs with available capabilities have an accent dot and an accessible description. Working 0 and Simulated 0 remain visible with `aria-disabled` and cannot activate. Selecting a nonempty filter moves to a matching module when necessary; choosing a module without results resets that filter to All. This avoids empty-result dead ends. |
| Floating navigation | Centered 1100px pill, 16px mobile margins, 12px top offset, 85% token surface, blur, border and soft shadow. Height changes from 64px to 56px after the hero. Four existing anchors use scroll-spy and `aria-current="location"`. The segmented language control, soft Adjust entry and solid Sign in button appear in the requested order. |
| Mobile navigation | Below 768px the bar shows the existing logo, icon-only Adjust and menu button. The native modal sheet contains the four links, language control, Adjust and full-width Sign in. It locks document scrolling, cycles Tab/Shift+Tab, closes on Escape and restores menu-button focus. Preferences/sign-in handoffs retain focus correctly. Icon-only Adjust has an accessible name and a visible focus tooltip. |

All new colors derive from existing semantic tokens. The requested `--pro-primary-soft` is a navigation-local alias for the existing `--pro-surface-2`; the central token file was not edited. Disabled-filter text retains the muted token's readable contrast; only its chrome and decorative icons are dimmed. Existing font loading and typeface presets remain in place. No new font family or image asset was added.

## Screenshots

| Theme | 1440px | 390px | Open mobile menu | Scrolled, 56px navbar |
| --- | --- | --- | --- | --- |
| Quiet Garden | [Full page](quiet-garden-1440.png) | [Full page](quiet-garden-390.png) | [Menu](quiet-garden-390-menu.png) | [Desktop](quiet-garden-1440-scrolled.png), [mobile](quiet-garden-390-scrolled.png) |
| Original Rose | [Full page](original-rose-1440.png) | [Full page](original-rose-390.png) | [Menu](original-rose-390-menu.png) | [Desktop](original-rose-1440-scrolled.png), [mobile](original-rose-390-scrolled.png) |
| Morning Mist | [Full page](morning-mist-1440.png) | [Full page](morning-mist-390.png) | [Menu](morning-mist-390-menu.png) | [Desktop](morning-mist-1440-scrolled.png), [mobile](morning-mist-390-scrolled.png) |

| Higher contrast | 1440px | 390px | Open mobile menu | Scrolled navbar |
| --- | --- | --- | --- | --- |
| Quiet Garden | [Full page](quiet-garden-contrast-more-1440.png) | [Full page](quiet-garden-contrast-more-390.png) | [Menu](quiet-garden-contrast-more-390-menu.png) | [Desktop](quiet-garden-contrast-more-1440-scrolled.png), [mobile](quiet-garden-contrast-more-390-scrolled.png) |
| Original Rose | [Full page](original-rose-contrast-more-1440.png) | [Full page](original-rose-contrast-more-390.png) | [Menu](original-rose-contrast-more-390-menu.png) | [Desktop](original-rose-contrast-more-1440-scrolled.png), [mobile](original-rose-contrast-more-390-scrolled.png) |
| Morning Mist | [Full page](morning-mist-contrast-more-1440.png) | [Full page](morning-mist-contrast-more-390.png) | [Menu](morning-mist-contrast-more-390-menu.png) | [Desktop](morning-mist-contrast-more-1440-scrolled.png), [mobile](morning-mist-contrast-more-390-scrolled.png) |

Detail views: [module area](quiet-garden-1440-modules.png), [roadmap](quiet-garden-1440-roadmap.png), [mobile module area](quiet-garden-390-modules.png), [mobile roadmap](quiet-garden-390-roadmap.png), [320px menu](quiet-garden-320-menu.png), [200% Bangla](bangla-200-320.png), [200% Bangla menu](bangla-200-320-menu.png), [measurements](measurements.json), and [accessibility tree](accessibility-tree.yml). Each theme/contrast pair also has corresponding module, roadmap and first-viewport captures.

## Task and access review

The public discovery journey remains hero → existing feature/experience anchors → local sample task. The navigation provides a shorter route to that same content, language and preferences. Menu success is an accurate anchor jump or opening the existing preferences/sign-in dialog; no care request or sign-in success is implied. Existing unsaved question state survives appearance and language changes. Roadmap filters are local presentation state, independent of care rights and health information.

`PublicNav` owns its menu, collapsed-height state and scroll-spy. Its `LanguageControl` uses the existing homepage context. `RoadmapExplorer` uses the pure `preferredModuleIndex` helper against the existing groups; no statuses or capability mappings changed. The shared phone component gained only an optional language attribute for the module-name label. Other story components and section styles were not changed in this pass.

All navigation actions have at least 44px targets, and mobile links have at least 48px targets. The skip link remains the first focusable element. Native dialog semantics provide modal background isolation; explicit endpoint cycling keeps keyboard focus inside the sheet. At large text sizes the navigation adapts to the available relative width. The 320px/200% Bangla sheet reduces decorative spacing, preserves readable label width and allows vertical scrolling to every action.

## Validation

- `npm run lint`: pass with zero errors; one pre-existing anonymous-default-export warning in `postcss.config.mjs`.
- `npm run typecheck`: pass.
- `npm run build`: pass; all 17 routes compiled/generated.
- `npm run check:contrast`: all 18 semantic-token checks pass.
- Production Playwright suite: **19 tests pass**, covering existing journeys and asset recovery plus computed selection ties, disabled filters, availability markers, exact typography, centered inline labels, navbar sizing/shrink/scroll-spy, icon tooltip, modal focus cycling, scroll lock, language, dialog handoffs, and enlarged Bangla menu usability.
- axe: zero reported A/AA violations across all three themes with independent contrast, including the open mobile menu in all six combinations, Bangla and the existing dialogs. Dark-heading checks continue enforcing a 4.5:1 floor.
- Reflow: 320, 360, 390, 430, 768, 1024, 1280 and 1440px, plus 200% Bangla with spacious layout and relaxed spacing. No document or screen-content horizontal overflow. Existing phone/tab rows intentionally scroll horizontally.
- Captures verify 12 full layouts, six open mobile menus and the 56px scrolled navbar at both requested widths. Capture contexts use reduced motion and software rendering to avoid Edge's long-screenshot texture defect.
- Manual visual review covered normal/scrolled navigation, open menus, module-name/tag alignment, roadmap type/markers, long Bangla wrapping and the existing surrounding sections.

Native screen-reader speech, physical mobile devices and virtual keyboards, Safari/Firefox and native 400% zoom were not tested. These automated and keyboard checks are not WCAG certification. Existing missing hero/team images and prototype backend/AI/provider limitations remain as documented in the earlier review. No new clinical or service claim was introduced.

Required 1–5 self-review: hierarchy 4, typography 4, responsiveness 4, accessible task completion 4, error resilience 4, trust/consent 4, source integrity 4, code quality 4. Actual participant and assistive-technology validation remains future work.

## Changed files

- `src/app/(marketing)/page.tsx` — imports the scoped polish stylesheet.
- `src/components/marketing/PublicNav.tsx` — floating navigation, scroll-spy and modal sheet.
- `src/components/marketing/RoadmapExplorer.tsx` — computed selection, dots and unavailable filters.
- `src/components/marketing/roadmap-selection.ts` — pure ranking helper.
- `src/components/marketing/ProductScreens.tsx` — language attribute for the module label.
- `src/components/marketing/homepage-polish.css` — the three requested areas only.
- `tests/homepage.spec.ts` — updated filter expectations.
- `tests/navigation-polish.spec.ts` — targeted behavior, typography and menu tests.
- `scripts/capture-navigation-polish.mjs` — reproducible screenshots and measurements.
- This report and generated evidence under `docs/qa/navigation-polish/`.

No commit or PR was created in this checkout without Git metadata. The user's existing development server was left untouched. Reproduce against a running production preview with:

```powershell
$env:PROHOR_TEST_URL='http://127.0.0.1:3112'
$env:PLAYWRIGHT_CHANNEL='msedge'
npx.cmd playwright test
node scripts/capture-navigation-polish.mjs
```
