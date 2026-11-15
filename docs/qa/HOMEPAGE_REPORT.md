# PROHOR public homepage redesign

14 November 2026 · Homepage only · Local optimized production build

## What changed

Replaced the previous 14-beat, repetitive composition with eight major sections: original care-workspace hero, concise problem story, working adaptive preview, five-step journey, four paired-module chapters, human/AI boundaries, everyday mobile use, and a primary-toned finale.

The previous hero reference was in `src/components/marketing/Homepage.tsx`, pointing to `public/images/marketing/hero-mother.jpg`. That reference and file were removed. The redesigned homepage contains no remote image hotlinks, borrowed photography, copied reference screens, clinical measurements or invented facilities. Its visuals are original semantic HTML, existing Lucide icons and token-based SVG motifs.

`src/app/(marketing)/page.tsx` remains the sole canonical `/` route. No internal module, API, authentication infrastructure or unrelated page was changed. Hash comparisons confirm that AGENTS.md, DESIGN.md, the PROHOR skill, prohor-tokens.css and the existing design-system Markdown files are unchanged.

Primary job: understand the problem, PROHOR’s difference and its present scope without signing in. Entry → explore the experience/modules → inspect the optional roadmap. Access controls stay available; the practice field retains its text through preference and language changes. Nothing in that field is sent or stored as a health record.

## Changed files

- `src/app/(marketing)/page.tsx`: homepage metadata.
- `src/components/marketing/Homepage.tsx`: eight-section composition and existing preference/locale lifecycle.
- `src/components/marketing/HomeStory.tsx`: new, focused narrative sections, real quick preferences and collapsed roadmap.
- `src/components/marketing/ProductExhibits.tsx`: new original care, education, records, wellness, consent and mobile exhibits.
- `src/components/marketing/HomeBrand.tsx`: new minimal wordmark and original sunrise symbol.
- `src/components/marketing/PublicNav.tsx`, `PublicFooter.tsx`: concise navigation and footer.
- `src/components/marketing/HomePreferences.tsx`: shorter Bangla dialog title for enlarged-text reading; preference behavior retained.
- `src/components/marketing/homepage.css`: replacement homepage-scoped styles and content-based reflow.
- `playwright.config.ts`: optional `PROHOR_TEST_URL` for testing a real production preview.
- `tests/homepage.spec.ts`, `tests/navigation.spec.ts`: updated product, interaction, clipping, accessibility and navigation checks.
- `docs/qa/`: refreshed screenshots, iteration evidence and this report.
- Removed `public/images/marketing/hero-mother.jpg`.
- Runtime repair: `public/sw.js`, `src/components/marketing/asset-recovery.ts` and `tests/public-assets.spec.ts`; the server page owns the CSS import and SVGs have intrinsic size limits.

## Visual review and iterations

Inspected the current repository’s before screenshots and all 12 visual pages of the user-supplied `C:/Users/omorf/Downloads/design-source.pdf`, with individual inspection of pages 1, 6, 11 and 12. The exact named `image(20261114-112900).png` was not found; the repository’s actual previous homepage capture supplied the before evidence. PDF imagery, layouts, colors and clinical claims were not imported.

1. **Initial render:** captured first viewports and full pages at 390, 768 and 1440px. Found a lone “you” in the hero and cramped tablet columns.
2. **First iteration:** balanced the heading, stacked the tablet hero, enlarged the access label and replaced the fourth repeated chapter arrangement with a wide consent exhibit.
3. **Second iteration and enlarged-text refinement:** corrected Bangla heading line height, decorative overflow, record-label clipping, cramped mobile-exhibit padding and narrow columns inside product previews. Container queries stack content at its actual available width. Rechecked the settings dialog at 320px with 200% Bangla text.

The closed desktop page is 6,865px high at 1440px width, compared with 10,967px in the previous repository capture. It is approximately 37% shorter while retaining all eight modules and the optional 24-capability inventory.

## Status and integrity

**Working:** homepage navigation, English/Bangla switching, theme/text/contrast quick controls, the settings dialog, appearance reset and local preference persistence where storage is available. Keyboard access and semantics do not require a preference.

**Limited:** Adapt’s local appearance and reading preferences, not a completed account-synced cross-module profile.

**Simulated:** all product-care exhibits. Each is visibly labelled “Illustrative demo.” No medical answer, provider delivery, appointment or clinical record is fabricated.

**Future:** the other 23 mapped capabilities, including clinical integrations, AAC, report processing, care directories, provider handoff, SMS and telemedicine. Clinical auto-flags explicitly require validation. The existing disconnected endpoints still return `not_connected` and `not_sent`. There is no sign-in route, so no broken sign-in link was added.

## Checks and actual results

| Check | Result |
| --- | --- |
| Production build | Pass; `/` is statically prerendered. |
| Typecheck | Pass. |
| Lint | No errors; one existing anonymous-default-export warning in `postcss.config.mjs`. |
| Browser tests | All 10 pass against the actual development origin `http://localhost:3000` in Microsoft Edge, including reload/navigation styling and migration from a stale service-worker cache. |
| Production asset regressions | Both new stylesheet/navigation and legacy-worker migration tests also pass against the optimized production server. |
| Token contrast script | All 18 existing pair checks pass. |
| Axe | No selected WCAG A/AA violations across three themes × normal/higher contrast, plus the dialog and Bangla page. Not a conformance certification. |
| Reflow | 320, 360, 390, 430, 768, 1024, 1280 and 1440px; repeated with Bangla, 200% root text, spacious layout and relaxed spacing. Page and key exhibit interiors have no horizontal clipping. |
| Keyboard | Skip link, native dialog containment, Escape, visible focus restoration and labelled native controls checked through Playwright keyboard input. |
| Preferences/draft | Practice text survives interaction mode, theme, contrast, font, layout and language changes. Reload retains preferences and clears practice text. No care API request is issued by the preview. |
| Other states | Mobile menu, offline/reconnect notice, forced colors and reduced motion checked. No page runtime errors in the tested journey. |
| Content | Exactly 8 major sections, 4 module chapters, 8 named modules and 24 unique capability IDs. Roadmap collapsed initially; 1 Limited and 23 Future capabilities. All anchors resolve. |

The user's subsequent screenshot exposed a real runtime failure that the earlier production-only verification missed. The v1 service worker cached `/_next/static/` responses by URL, including development bundles whose URLs are reused. That allows new server HTML to combine with old CSS/JavaScript; development logs also recorded a hydration mismatch. The v2 worker removes old PROHOR shell caches, leaves unrelated caches alone and never intercepts Next.js bundles. A server-rendered recovery script updates an existing PROHOR worker independently of cached React code. A pristine page reloads once when the worker upgrades; user input suppresses that reload. No new worker is registered by the recovery script.

The homepage stylesheet is now imported by the server page. Brand symbols have explicit 32×32 intrinsic dimensions; the decorative orbit is intrinsically zero-sized until CSS positions it. The regression test first demonstrates stale development CSS being served by the old worker, then proves the same URL receives fresh responses after migration. The actual localhost development page was visually inspected at 1920px with Morning Mist and Rubik, matching the user's selected appearance, with no page errors.

## Visual evidence

- [Desktop first viewport](homepage-production-hero.png) · [Desktop full page](homepage-desktop.png)
- [390px first viewport](homepage-mobile-first.png) · [390px full page](homepage-mobile.png)
- [768px first viewport](homepage-tablet-first.png) · [768px full page](homepage-tablet-full.png)
- [Bangla mobile](homepage-bangla-390.png) · [Bangla 200% settings](homepage-bangla-200-modal.png)
- [Adaptive experience](homepage-adapt.png) · [Records chapter](homepage-records.png)
- [All six theme/contrast combinations](themes/theme-overview.png)
- [Repaired localhost development page](development-fixed-1920.png) · [Full development capture](development-fixed-full.png)
- [Initial render](iterations/initial-desktop.png) · [First iteration](iterations/pass-1-desktop.png) · [Second iteration](iterations/pass-2-desktop.png)

## Remaining limitations

Screenshots and keyboard checks use automated Microsoft Edge on Windows. Physical phones, Safari, Firefox, NVDA, VoiceOver, braille and switch devices were not tested. Root-text resize checks do not establish every browser’s 400% zoom behavior. Google Fonts CDN requests were blocked in the test browser, so the existing fallback stacks rendered; unrestricted font loading still needs review. Bangla editorial and real-user accessibility review remain necessary. No publication, clinical validation or provider integration was performed.

Native access to the user's Brave window timed out at the app approval step. The repair was verified in a standalone browser at the same localhost origin and with the same selected theme/typeface; the user's existing Brave profile was not inspected or changed.

Self-review (1–5, limited to the homepage scope): hierarchy 4, typography 4, responsive layout 4, accessible task completion 4, error resilience 4, trust/consent 4, AI/source integrity 4, code quality 4. These are internal review scores, not independent assessments.
