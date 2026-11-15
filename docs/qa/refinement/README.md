# PROHOR homepage refinement

Reviewed 15 November 2026 in Microsoft Edge on Windows against the production Next.js build. Scope: the seven requested refinements on `/`. The supplied PDF was treated as an annotated visual reference. Existing section order, copy outside the requested replacements, Fraunces display typography, theme choices and local interactions were retained.

## Seven-item review

| Request | Implementation and evidence |
| --- | --- |
| Reusable line detail | `SectionEyebrow` renders a decorative 32px accent line and a 14px, weight-600 Manrope label. All eleven section eyebrows use it. The product strip has full-width top/bottom hairlines and column dividers, replaced by horizontal separators on mobile. [Desktop strip](product-1440.png), [mobile strip](product-390.png). |
| Swap Why PROHOR | Text and its existing source lines precede the visual in the DOM. Text is left on desktop and first on mobile. [Desktop](problem-1440.png), [mobile](problem-390.png). |
| Compact companion cards | Content-sized 2×2 grid, 20px padding/gap, section max-width 1100px, 19px titles, 14px descriptions and 13px mini UI. Desktop card heights are approximately 313, 293, 286 and 319px. English uses the body role; Bangla mini UI explicitly uses Noto Sans Bengali. Bordered mini panels have 13px corners. [Desktop](companion-1440.png), [mobile](companion-390.png). |
| Three matching phones | All frames are 260 × 548.875px at the default size, with a 9:19 ratio, 6px bezel and 32px gaps. Labels and sample tags align above them. The larger-text version uses fewer decorative elements within the same frame. Mobile uses horizontal scroll-snap. [Desktop](adapt-1440.png), [mobile row](adapt-390.png), [picture/text phone](phone-3-390.png). |
| Four matching phones | The same frame, padding and base type scale apply to all four. Frames and bilingual captions align; provider pills have their own row and 32px separation. Desktop has four columns, tablet two, and mobile scroll-snap. [Desktop](journey-1440.png), [mobile](journey-390.png), [Poth screen](phone-7-390.png). |
| Visible roadmap | Adapt is selected initially. Five filter buttons show computed totals, including the four status counts. Eight ARIA tabs support arrow keys, Home and End. Rows show number, original title/status and a short explanatory line. Empty filters offer a clear reset. [Initial view](roadmap-1440.png), [Bondhon selected](roadmap-bondhon-1440.png), [mobile](roadmap-390.png). |
| Footer | Deep-primary, full-width footer with four desktop columns, bilingual tagline, preferences entry, all eight module anchors, exploration links and sign-in action. Mobile stacks groups and gives module links two columns. A separated bottom bar includes the requested prototype/emergency line and working language switch. Text is at least 14px; links have 44px targets. [Desktop](footer-1440.png), [mobile](footer-390.png). |

The original roadmap source data in `home-content.ts` is unchanged: Working **0**, Limited **1**, Simulated **0**, Future **23**. Module counts remain Adapt 1, Barta 3, the shared Shonket + Bondhon group 2, Jibonrekha 4, Bujhi 1, Shusthota 2, Poth 4, and Bondhon 7. The shared group is labelled Shonket in the tab and retains its full original name inside the panel. No capability was duplicated or reassigned.

## Theme screenshots

| Theme | 1440px | 390px | Higher contrast 1440px | Higher contrast 390px |
| --- | --- | --- | --- | --- |
| Quiet Garden | [Desktop](quiet-garden-1440.png) | [Mobile](quiet-garden-390.png) | [Desktop](quiet-garden-contrast-more-1440.png) | [Mobile](quiet-garden-contrast-more-390.png) |
| Original Rose | [Desktop](original-rose-1440.png) | [Mobile](original-rose-390.png) | [Desktop](original-rose-contrast-more-1440.png) | [Mobile](original-rose-contrast-more-390.png) |
| Morning Mist | [Desktop](morning-mist-1440.png) | [Mobile](morning-mist-390.png) | [Desktop](morning-mist-contrast-more-1440.png) | [Mobile](morning-mist-contrast-more-390.png) |

Each layout also has a matching `*-hero.png` first viewport. Additional evidence includes [Bangla mobile](bangla-390.png), [200% Bangla at 320px](bangla-200-320.png), [measurements](measurements.json), [accessibility tree](accessibility-tree.yml), and seven individual mobile phone captures named `phone-1-390.png` through `phone-7-390.png`. Long captures use Edge software rendering to avoid its GPU texture repetition defect.

## Interaction, accessibility and integrity

The primary job remains public discovery and preparing a visit question without creating an account. The hero leads to features or the same-question demo. Review retains the existing explicit nothing-sent confirmation. Form drafts survive language, appearance and reading-preference changes. All sample controls remain local; no health records, provider messages or AI requests were added.

`Homepage` composes the existing twelve sections in their existing order. New narrow components are `SectionEyebrow`, `RoadmapExplorer` and `HomepageFooter`. `PhoneFrame` provides the shared dimensions and a labelled scrollable screen. Screen content can grow and scroll when text is enlarged, preserving every task. At 200% text and 320px, previews use the full row and simplify their decorative header; all seven retain a 341px usable screen area. Keyboard focus in main content is corrected after native scrolling so the sticky header does not obscure it. Layout changes do not remount the question inputs.

All colors, gradients, borders and shadows use existing semantic tokens. Large accent phrases on dark backgrounds received token-derived lighter tints to meet the requested **4.5:1 text floor**, beyond the usual 3:1 large-text check. Normal-theme measured dark-band ratios are approximately 4.69:1 / 5.61:1 / 5.37:1 for Quiet Garden / Original Rose / Morning Mist. CTA accent text is checked against the primary background with its accent-circle overlay: approximately 4.64:1 / 5.51:1 / 5.64:1. The corresponding higher-contrast checks pass too. Decorative hairlines may have lower contrast because they carry no essential meaning.

## Verification

- `npm run build`: pass, all 17 routes generated/compiled.
- `npm run typecheck`: pass.
- `npm run lint`: zero errors; one existing anonymous-default-export warning in `postcss.config.mjs`.
- `npm run check:contrast`: all 18 semantic-token checks pass.
- Production Playwright suite: **14 tests pass**. Coverage includes roadmap totals/filter reset/shared mapping/ARIA tabs; actual desktop/mobile divider styles; phone sizes and alignment; compact card sizing and Bangla family; footer anchors/language switching; question review/draft preservation; modal focus; asset recovery; offline/reduced-motion/forced-colors behavior.
- axe: zero reported A/AA violations across three themes × two contrast states, Bangla and both dialogs. Additional checks enforce the requested 4.5:1 floor on dark accent headings.
- Reflow: 320, 360, 390, 430, 768, 1024, 1280 and 1440px, plus 200% Bangla with spacious layout and relaxed spacing. No page or phone-screen horizontal overflow. Horizontal phone/tab rows scroll intentionally.
- Keyboard: review path, modal trapping/Escape/restoration, tabs with arrows/Home/End, and visible focus through the enlarged-text path. All twelve screenshot layouts have no page errors and retain three desktop hero lines.
- `AGENTS.md`, `DESIGN.md` and `src/styles/prohor-tokens.css`: unchanged SHA-256 hashes. No other route, API, source-data file, or shared token definition changed.

The existing missing hero/team images continue to use the approved abstract artwork and initials. Native screen-reader speech, physical touch devices/virtual keyboards, Safari/Firefox and native 400% browser zoom were not tested. Keyboard automation, semantic tree inspection and axe do not establish WCAG certification or clinical validation. The sign-in/backend/AI/provider limitations of the existing prototype remain in place.

Required self-review, 1–5: hierarchy 4, typography 4, responsive behavior 4, accessible task completion 4, error resilience 4, trust/consent 4, AI/source integrity 4, code quality 4. These are implementation-review judgments; validation with actual users and assistive technologies remains future work.

## Changed files

- `src/app/(marketing)/page.tsx` — route-local refinement stylesheet import.
- `src/components/marketing/Homepage.tsx` — unobscured preview focus after native scrolling.
- `src/components/marketing/HomepageStory.tsx` — shared eyebrows, problem DOM order, roadmap/footer delegation.
- `src/components/marketing/HomepageUpgrade.tsx` — shared eyebrows, compact consent wrapper and labelled phone row.
- `src/components/marketing/ProductScreens.tsx` — labelled, keyboard-accessible screen regions.
- `src/components/marketing/SectionEyebrow.tsx` — new reusable eyebrow.
- `src/components/marketing/RoadmapExplorer.tsx` — new tabs, filters and computed summaries.
- `src/components/marketing/HomepageFooter.tsx` — new footer.
- `src/components/marketing/homepage-refinement.css` — requested responsive and visual refinements.
- `tests/homepage.spec.ts` — updated roadmap and new refinement/contrast checks.
- `scripts/capture-homepage-refinement.mjs` — reproducible evidence capture.
- This report and generated evidence in `docs/qa/refinement/`.

No commit or PR was created because this checkout has no Git metadata. The user's existing development server was left untouched. To reproduce captures against a running production preview:

```powershell
$env:PROHOR_TEST_URL='http://127.0.0.1:3112'
$env:PLAYWRIGHT_CHANNEL='msedge'
npx.cmd playwright test
node scripts/capture-homepage-refinement.mjs
```
