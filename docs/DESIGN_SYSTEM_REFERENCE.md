# PROHOR design system — working reference

Consult this whenever accessible alongside the current code before future UI work. Reviewed and expanded 20 Nov 2026 (Asia/Dhaka), on `omor-mvp-closure` @ `b6351ed`, including existing local changes. Sources: all 1,572 lines of `design.md` (v2.0.0-draft), both files in `src/styles`, `src/app/globals.css`, all documents and token JSON in `docs/design-system`, `README.md`, `AGENTS.md`, the repository PROHOR Premium UI/UX skill and relevant active components/styles. Companion: `docs/PROJECT_KNOWLEDGE.md`. Recheck source before changing it; this reference does not authorize UI changes or imply persistent memory when the workspace is inaccessible.

Labels: **[spec]** = documented rule; **[code]** = what the code does; **⚠** = an inconsistency to resolve (do not guess; ask, or follow the precedence below).

---

## 0. Authority and status

- **Precedence (design.md §0.1):** (1) safety, medical, privacy and consent rules (`AGENTS.md`, `AI_MEDICAL_CONTENT.md`) → (2) accessibility (`ACCESSIBILITY.md`, design.md §2.5 and §10) → (3) `design.md` → (4) `src/styles/prohor-tokens.css` → (5) reference sites (inspiration only). A visual choice that conflicts with 1 or 2 loses.
- **Status:** `design.md` is "Proposed. Needs product-owner approval" (§17 lists 16 open decisions). README and `TOKENS.md` call the tokens "provisional". `PROHOR_DESIGN_SPEC.md` says "NOT final design.md". Existing use is implementation evidence, **not approval-in-practice or sign-off**. Do not infer that a later visual implementation resolves a documented conflict.
- **Homepage exception (design.md §18):** the `/` route only may use token-built soft gradients, glass cards over photos, up to 3 accents per viewport, alternating bg/surface/one primary band, `py-20 md:py-28`, a hero headline of `clamp(3rem,7vw,5.5rem)`, raster images from `/public/images`, and gentle scroll-in motion (<320 ms, off under reduced motion). App screens keep the normal rules.
- **Core principles:** same journey with different interaction; task before taxonomy; evidence is visible; honest state; calm authority; the mother holds the keys; Bangla is first-class; one memorable thing per screen; preferences are design material. **Rule zero:** no screen may assume a particular colour, typeface, text size, spacing or density.
- **Visual theme:** "calm, grounded, literate: a botanical clinic reading room." Premium organic editorial minimalism. **Anti-patterns:** glassmorphism, gradient washes, a colour assigned by gender or ability, identical rounded card grids, an all-caps eyebrow above every heading, numbered markers unless the content is a real sequence, wrong-population stock imagery, decorative charts, streaks or scores.

---

## 1. Preference model (all appearance = CSS variables on `<html>`)

| Preference | Attribute | Values (default first) | Spec | Implemented [code] |
|---|---|---|---|---|
| Theme | `data-theme` | `quiet-garden`, `original-rose`, `morning-mist` | P0 | ✅ server default `quiet-garden` in `src/app/layout.tsx` |
| Higher contrast | `data-contrast` | absent, `more` | P0 | ✅ code also writes `standard` for an explicit opt-out (CSS ignores it; it only blocks the OS signal) |
| Text size | `data-text-scale` | absent (100%), `large` (112.5%), `extra-large` (125%) | P0 | ✅ |
| Density | `data-layout` | absent/`comfortable`, `compact`, `spacious` | P0 | ✅ code writes `comfortable` explicitly (CSS has no rule for it, so the defaults apply) |
| Reduce motion | `data-motion` | absent (follow OS), `reduce` | P0 | ✅ |
| Typeface | `data-font` | `default`, `rubik`, `google-sans`, `noto-serif`, `roboto-slab` | P1 | ⚠ UI and bootstrap offer only default/rubik/noto-serif/roboto-slab (no Google Sans, matching the spec rule "hide a preset that can't load") — but see §3 on font loading |
| Text spacing | `data-text-spacing` | absent, `relaxed` | P1 | ✅ (stored in the reading store `prohor-home-reading-v1`) |
| Focused view | `data-focused` | `true` | not in design.md | ✅ code-only P1: hides `.prohor-decorative` and `.prohor-marketing-flourish`, flattens `.prohor-secondary-panel` |
| Language | `lang` | `bn` (app), `en` (homepage default) | P0 | bootstrap sets `lang` before paint on `/app*`, `/ask`, `/find-care` and `/` |
| Simpler text / AAC / read-aloud | content flags | off | P1 | AAC and opt-in read-aloud implementations exist; actual speech depends on browser/provider support. `simplifiedContent` is stored without a general reviewed Easy Read implementation |

- Resolution order: `forced-colors` → the mother's explicit choice → device signals (`prefers-contrast: more`, `prefers-reduced-motion`) → PROHOR defaults.
- No-flash boot: `src/components/marketing/preference-bootstrap.ts` (inline script in the root layout and the homepage). Runtime apply: `src/lib/access-preferences.ts` `applyPreferences()` + `src/features/adapt/lib/preference-helpers.ts` `applyAllPreferences()`.
- Storage: `prohor-access-preferences-v1` (schema v3) and `prohor-home-reading-v1`. ⚠ design.md §2.4 names the key `prohor.prefs.v1` and §14.1 proposes `src/lib/preferences/{schema,apply,boot}.ts`, `PreferencesProvider.tsx`, `QuickAdjust`, `ThemeSelector`, `FontSelector`, `TextSizeControl`, `PreferencePreview` and `src/app/fonts.ts`. **None of those files exist.** The real equivalents are `access-preferences.ts`, the bootstrap, `features/adapt/components/AdaptSettingsPanel.tsx`, `components/accessibility/AccessPreferencesPanel.tsx` / `AccessPreferencesControl.tsx` / `ContrastPreferenceControl.tsx`, and `PreferenceRuntime.tsx`.
- Sync is opt-in (`CloudSyncSection`, `/api/preferences`). ⚠ The account v2 schema (`contracts/adapt.ts`) lacks `layoutDensity` and `focusedView` and adds `textSpacing` and `readAloud`. The shapes differ from local v1.
- **Preferences can never** hide or move Urgent help, consent or provenance; take controls below 44px or body text below 1rem; make a theme fail AA; change care rights; infer ability; or lose a draft, focus, scroll position or route. **Never branch layout on a preference** (only content preferences may change what renders).

---

## 2. Colour

### 2.1 Theme tokens — actual values in `src/styles/prohor-tokens.css`
| Token | Quiet Garden (default) | Original Rose | Morning Mist |
|---|---|---|---|
| `--pro-bg` | `#fffcf5` | `#fbf6f2` | `#f8faf9` |
| `--pro-surface` | `#e6f2e9` | `#f2dfe4` | `#dfeeee` |
| `--pro-surface-2` | `#d3e6d9` | `#ecd3da` | `#cfe4e4` ⚠ |
| `--pro-elevated` | `#ffffff` | `#ffffff` | `#ffffff` |
| `--pro-text` | `#23352d` | `#432c36` | `#17373b` |
| `--pro-muted` | `#4a6358` | `#62535b` | `#466168` ⚠ |
| `--pro-primary` | `#2f6b54` | `#70445a` | `#075b67` |
| `--pro-primary-hover` | `#245441` | `#5a3548` | `#064a55` ⚠ |
| `--pro-on-primary` | `#ffffff` | `#ffffff` | `#ffffff` |
| `--pro-on-primary-muted` | `#e1efe6` | `#f6e6ec` | `#d9ecee` ⚠ |
| `--pro-accent` | `#f4c96b` | `#e8bac7` | `#e8bac7` ⚠ |
| `--pro-on-accent` | `#23352d` | `#432c36` | `#17373b` |
| `--pro-accent-strong` | `#7a5200` | `#8a3556` | `#7a3656` ⚠ |
| `--pro-border` | `#9aada2` | `#aa949e` | `#96b4b6` ⚠ |
| `--pro-control-border` | `#5c7468` | `#75616d` | `#53777b` ⚠ |
| `--pro-focus` | `#145da0` | `#165e9b` | `#144db5` |
| `--pro-shadow-rgb` | `35 53 45` | `67 44 54` | `23 55 59` |

⚠ **Morning Mist drift:** **eight** CSS values differ from `design.md` §4.1: surface-2, muted, primary-hover, on-primary-muted, accent, accent-strong, border and control-border. The spec values are respectively `#cbe2e2`, `#4c6161`, `#054852`, `#dcf0f1`, `#e8b3c0`, `#8a3350`, `#9cadaa`, `#4e6c70`. The smaller `TOKENS.md`/JSON tables include only some of these roles and disagree on muted/accent/control-border. Current selected CSS pairs were computed afresh in §13; the existing JSON-based report does not validate all shipped values. Approval of the intended palette remains unresolved.

### 2.2 Shared status colours (not themed)
`--pro-success #1a6848` / soft `#e3f1e8`; `--pro-warning #7c4a08` / `#fbeed2`; `--pro-danger #a33138` / `#f8e1df`; `--pro-info #1b5e86` / `#e0eef6`. Under the overlay: `#14532d`, `#5c3a04`, `#8b1f1f`, `#0f4a6e`. Always **icon + word + colour**; the soft tint is only a fill behind the text.

### 2.3 Higher-contrast overlay
`data-contrast="more"`, one block per theme (so Rose stays rose and Mist stays teal). bg `#ffffff`, text 7:1 target, focus `#0041b5`, `--pro-on-primary-muted` becomes `#ffffff`. It never rewrites the stored theme. Under `forced-colors: active` the system palette wins: keep real borders, use outline focus (`Highlight`), never `forced-color-adjust: none`.

### 2.4 Role rules
- Depth: `bg` → `surface` (cards) → `surface-2` (nested or selected) / `elevated` (inputs, dialogs).
- `--pro-accent` is **decorative only, at most once per screen** (3 per viewport on `/`). Text on it uses `--pro-on-accent`; accent-family text and icons use `--pro-accent-strong`. Never white on accent.
- `--pro-border` (~2.3:1) is decorative only. Essential outlines of fields, checkboxes, switches and secondary buttons use `--pro-control-border`.
- Links: `--pro-primary` **and underlined** in running text (offset 2px; `globals.css` sets `0.18em`).
- Selected state: `surface-2` fill + primary mark + text, never fill alone. Shadows use `rgb(var(--pro-shadow-rgb) / a)`.
- Proportions: ~70% bg/surfaces, 20% text, 8% primary, ≤2% accent. One primary button per dominant action area.
- Tailwind aliases (`@theme inline`): `bg-pro-*`, `text-pro-*`, `border-pro-*` for mapped colour tokens; `rounded-{control,field,card,hero,pill}`; `shadow-pro-1`, `shadow-pro-3`; `ease-pro`; `text-display`, `text-headline`; `font-{display,heading,body,control,record,tag}`. ⚠ `--pro-scrim` has no color alias although `AppDialog` uses `backdrop:bg-pro-scrim`. `--font-tag` refers to `--pro-font-tag`, which is defined **inside `.pro-home` by `homepage-care.css`, not globally for app routes**. Generated utility/computed-style behavior was not browser-verified here.
- [code] No hex literals in `src/features/**` or `src/components/{ui,accessibility}` (grep on 20 Nov). Hex and rgba literals exist in `globals.css` (hero, floating card, phone frame `#1C2420`/`#0D1210`, `rgba(...)` shadows) and in the marketing CSS.

### 2.5 Provenance badges (trust signature) [spec §4.4]
| Provenance | Label | Fill / text / border | Icon | Border |
|---|---|---|---|---|
| Self-reported | Recorded by you · আপনি লিখেছেন | elevated / text / control-border | user | solid 1.5px |
| Extracted | Extracted from report. Please check | accent / on-accent / accent-strong | scan-text | **dashed** 1.5px |
| Clinician-entered | Entered by clinician | elevated / text / text | stethoscope | solid 1.5px |
| Clinician-confirmed | Clinician confirmed | success-soft / success / success | badge-check | solid 2px |
| Demo | Demo data · ডেমো তথ্য | elevated / text / control-border | flask | **dotted** 1.5px |

⚠ No shared `ProvenanceBadge` component exists; modules render their own labels (e.g. Jibonrekha `sourceLabel()`, Bujhi "from report · you verified"). `StatusBadge` (`components/ui/StatusBadge.tsx`) covers only working/prototype/limited/future (and its "Simulated" label is missing).

---

## 3. Typography

### 3.1 Spec [design.md §5]
- Five **roles**: `display` (H1/H2, hero), `heading` (H3/H4, card titles, nav), `body`, `control` (buttons, tabs, chips, badges), `record` (measurements, citations, record IDs). Components name roles, **never families**.
- Presets: **Default** = Noto Serif display + Manrope heading/body/control + Roboto Slab record, with Noto Sans Bengali (display and record use Noto Serif Bengali). Rubik, Google Sans, Noto Serif and Roboto Slab presets each use one family for every role. Every stack ends in a Bengali family.
- Scale (rem): display `clamp(2.5,1.9+2.4vw,3.75)` · headline (H1) `clamp(1.875,1.6+1vw,2.5)` · title (H2) 1.5 · title-sm (H3) 1.25 · subtitle 1.125 · body-lg 1.125 · body 1 · label 1/600 · control 1/600 · record 1.5/600 · record-sm 1 · caption 0.875 (non-essential, muted). Weights 400–700, `font-synthesis: none`.
- Line height Latin/Bangla: body 1.6/1.75 (relaxed 1.85/2.0); H1–H2 1.2/1.35; H3–H4 1.35/1.45.
- Bangla: `lang="bn"` on every chunk; **letter-spacing 0, no uppercase, no italics, no justify**; emphasis with weight 600 or primary colour + icon; wrap everything; English terms inside `<span lang="en">`; LTR (never `dir="rtl"`). Measure 60–70ch (Bangla ~60ch). Sentence case. Numerals are an open decision (proposed: Bangla digits in prose and dates, Latin digits for clinical values with units).
- Loading [spec]: `next/font`, `swap`, Latin/Bengali subsets, preload Default only; alternate previews load when used, with a proposed ~300 KB first-load font budget. **Conflict:** AGENTS.md literally says “Do not ship font files to users”; design.md instead specifies downloadable fonts and only forbids binaries inside design docs. Do not weaken or silently reinterpret the AGENTS rule as merely “no binaries in the repo.”

### 3.2 What the code actually does ⚠ (largest drift area)
1. `globals.css` line 1 loads **Google Fonts by CSS `@import`** (Noto Sans Bengali, Noto Serif Bengali, Roboto Slab, Rubik). It does not use `next/font`. Manrope and Noto Serif are not loaded on app routes.
2. Token stacks reference `--font-manrope`, `--font-noto-serif`, `--font-noto-sans-bengali`, `--font-noto-serif-bengali` and `--font-google-sans`. No definitions for these canonical names were found under `src`. `globals.css` defines differently named Bengali aliases and Rubik/Roboto Slab aliases, plus `--font-latin`/`--font-display`/`--font-bangla`. **Do not assume trailing Georgia/system-ui survives a missing `var()`**: unresolved variables without a fallback can invalidate the entire declaration. Exact effective families require computed-style/render verification; later unlayered and route-specific rules also apply.
3. `globals.css` sets `body { font-family: var(--font-rubik) … }` **outside `@layer`**, so it overrides the token base rule: **the app's effective body face is Rubik**, and Bangla is forced to Noto Sans Bengali with line-height **1.7** (spec 1.75). The Typeface preference therefore changes only elements that use the `font-*` role utilities.
4. Display styles in practice: `.pro-display`, `.pro-editorial` and legacy `.pro-hero-h1` explicitly name **Roboto Slab**, weight 700, with negative tracking. Some MotherDashboard headings also name Roboto Slab/Bengali fallback directly but specify normal weight; `.app-module` can override H1 weight/size. These paths bypass parts of the proposed Noto Serif/role model; do not infer one effective style for every heading.
5. The homepage uses its own `next/font` set (`--font-prohor-*`): **Fraunces (incl. italic)**, Manrope, **JetBrains Mono**, Noto Sans/Serif Bengali. `homepage-upgrade.css` calls this a requested route-local font exception; `design.md` §18 does not itself list these extra families. It explicitly resets Bangla heading emphasis to non-italic. Keep the local implementation distinct from the unresolved system-wide typography/approval policy.
6. `AdaptSettingsPanel` font-card previews use inline `fontFamily` with the same undefined variables.
7. `.pro-eyebrow` and `.module-hero > p:first-child` are **0.72–0.75rem, uppercase, letter-spaced** for English (Bangla is reset correctly). This conflicts with "no all-caps eyebrows" and "caption ≥0.875rem".
8. `AppInput`/`AppSelect` labels are `text-sm` and hints/errors `text-xs` (spec: label 1rem/600, nothing essential below 1rem). `StatusBadge` is `text-xs` (spec: badge ≥0.875rem). There are a few arbitrary sizes: `text-[9px]`, `text-[10px]`.
9. App H1 (`app-module.css`) = `clamp(1.75rem,3.4vw,2.375rem)`/600 (spec headline `clamp(1.875rem,…,2.5rem)`).

**Decision needed:** which font system is canonical (token roles + `next/font` per spec, or the shipped Rubik + Roboto Slab look)? Until it's decided, new app UI should use the role utilities (`font-body`, `font-display`, `font-record`…) and the existing `pro-*` classes for visual consistency, and must not add new family names.

---

## 4. Layout, spacing, shape, depth

- **Spacing:** 4px base, 8px rhythm; tokens 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96. Card padding 20–24px (16px at 320px), field gap 16px, group gap 24–32px, app section gap 32–48px, ≥8px between adjacent targets.
- **Density tokens** (read these, don't hard-code): `--pro-control-h` 2.75 / **3** / 3.5rem; `--pro-gap-field` .75/1/1.25; `--pro-gap-group` 1.25/1.5/2; `--pro-gap-section` 2/2.5/3.25; `--pro-pad-card` 1/1.25/1.5rem (compact / comfortable / spacious). Base rule: every `button, input, select, textarea` gets `min-block-size: var(--pro-control-h)`.
- **Radius:** control 10px, field 12px, card 16px, hero 24px, pill 999px (badges, switches, segmented tracks only). Nested elements use smaller radii. ⚠ In practice buttons are **pills**: `.pro-btn` uses 9999px, `AppButton` uses `rounded-pill`, `.module-chip` is a pill, and `.app-module .pro-btn` is 0.875rem. Features also use `rounded-full` (35×), `rounded-lg/xl/2xl` (24×), and the hero frame 28px/38px. The Jibonrekha `records-ui.tsx` button uses `rounded-control` (spec-correct).
- **Grid** [spec]: <640 4 columns, 16–20px gutters, bottom nav; 640–1023 8 columns, 24px, top nav + drawer; ≥1024 12 columns, 32–48px, 264px sidebar, content ≤1200px, forms single-column ≤640px; ≥1280 optional 320px context panel. [code] `AuthShell`: sidebar `w-64` (16rem, 256px at a 16px root) from `lg`, mobile drawer bounded to 85vw, fixed bottom nav below `lg` with safe-area padding, main `max-w-[1200px] px-4 sm:px-6 lg:px-10 pb-28`. Marketing generic containers `.pro-shell` max 1240px (`--pro-max`) and `.pro-shell-wide` 1360px. Read the active `.pro-home` container rules separately; these are not all the same layout.
- **Templates:** T1 Public/Welcome · T2 Workspace · T3 Focused task (stepper, 1 column ≤640px, sticky action bar) · T4 Reading (65ch, sources beside or below) · T5 Provider (dense table, rows ≥44px, Demo provider banner).
- **Elevation:** tonal first. L1 surface + border; L2 elevated + border + `shadow-pro-1`; L3 elevated + `shadow-pro-3` (dialogs); scrim `--pro-scrim`. Cards keep real borders for forced-colors. ⚠ `.pro-btn-primary` adds coloured glow shadows and `color-mix(... black)` hover; `.pro-btn-secondary` border is `--pro-border` (decorative) at rest; `.pro-floating-card` uses `backdrop-filter` blur (glass); the bottom nav uses `backdrop-blur-sm`.
- **Icons:** Lucide outline, 24px grid, 1.5px stroke, `currentColor`, always with a visible label (icon-only only for close and similar, with `aria-label`).
- **Imagery:** adult Bangladeshi mothers and clinicians shown with dignity; illustrations as inline SVG using tokens (`currentColor`, `--pro-primary`, `--pro-surface-2`, ≤1 accent); no text in images; "Placeholder image" until rights are approved.

---

## 5. Motion

- Tokens: `--pro-duration-fast` 160ms, `--pro-duration-normal` 220ms, max 320ms; `--pro-ease` `cubic-bezier(0.2,0,0,1)`. Animate opacity and transform only; pressed `scale(0.985)`; no bounce, parallax, autoplay or flashing; at most one deliberate motion moment per page.
- Reduced motion: OS media query **or** `data-motion="reduce"` collapses all durations (tokens §8).
- ⚠ [code] `.pro-btn:hover` lifts by translateY(-2px) (only disabled inside `.app-module`); `AppButton` uses `active:scale-[0.98]`; infinite `pro-floaty`/`pro-wv` loops exist (disabled under OS reduced motion in `globals.css`; the token rule also covers `data-motion`).

---

## 6. Components

### 6.1 Shared primitives [code]
| Component | File | Notes / gaps vs spec |
|---|---|---|
| `AppButton` | `components/ui/AppButton.tsx` | variants primary/secondary/**ghost** (spec: primary/secondary/quiet/destructive/accent); sizes sm/md/lg use 2.75/3/3.5rem minimum heights, independent of density token; pill radius; `whitespace-nowrap` ⚠; opacity-disabled; secondary border `pro-border` ⚠; no built-in pending state, caller must supply loading text/aria/state |
| `Button` | `components/ui/button.tsx` | homepage-only (`home-button`), used by `HomepageStory` |
| `.pro-btn` / `-primary` / `-secondary` | `globals.css` | most-used button class across modules; 3.1rem, pill, nowrap; overridden inside `.app-module` to 2.75rem, radius 0.875rem, wrapping, no lift |
| `records-ui.tsx` `button`/`primary`/`control`/`card`/`Field`/`Choice`/`RecordForm` | `features/jibonrekha` | closest to spec (rounded-control, control-border, outline-offset-3, "(required)/(optional)" in words, focus moved to the error) |
| `AppCard` | `components/ui/AppCard.tsx` | elevated fill, `pro-border`, `--pro-pad-card`, shadow-1 (or 3 when `elevated`) |
| `AppInput` / `AppSelect` | `components/ui/` | visible label, hint, `aria-describedby`, `aria-invalid`, error `role="alert"` + icon; height `--pro-control-h`; ⚠ small label/hint/error text; error border 1px (spec 2px) |
| `AppDialog` | `components/ui/AppDialog.tsx` | native `<dialog>` `showModal`, Esc, focus return, body scroll lock, backdrop click closes; `rounded-hero`, `shadow-pro-3` |
| `StatusBadge` | `components/ui/StatusBadge.tsx` | icon + word + colour; working/prototype/limited/future |
| `PageHeading` | `components/ui/PageHeading.tsx` | eyebrow + `.pro-editorial` H1 + muted lead (public pages) |
| `Brand` | `components/ui/Brand.tsx` | heart icon tile + text, explicit font families, 9px strapline, `rounded-2xl`, focus `outline-2`; a separate `marketing/HomeBrand.tsx` supplies the token/currentColor sun-arc `ProhorSymbol` used by AuthShell. Neither proves approval of §3.3's outlined-path wordmark proposal |
| Accessibility | `components/accessibility/{AccessPreferencesControl,AccessPreferencesPanel,ContrastPreferenceControl,LiveRegion,ScreenReaderOnly}.tsx` | the panel is used by `AuthShell` and `PothDirectoryMvp` |
| Adapt | `features/adapt/components/{AdaptSettingsPanel,AACComposer,ReadAloudButton,CloudSyncSection,PreferenceConflictDialog,PreferenceRuntime}.tsx` | full settings page `/accessibility`, `/app/accessibility` |
| `AppChrome`, `ModulePreview` | `components/layout`, `components/ui` | `AppChrome` is **not mounted** (see `docs/CODE_MAP.md`) |

### 6.2 App shell [code] `src/features/auth/AuthShell.tsx` + `src/styles/app-module.css`
- Skip link → 16rem sidebar (≥lg) with nav groups → top bar (current page, help, language/access/account) → `<main id="auth-main" class="app-module">` → bottom nav **Home · Journey · Ask · Care** below lg plus menu drawer (`role="dialog"`, focus-management code). **Conflict:** mother-shell Urgent help text is `sr-only md:not-sr-only`, so below md only the icon is visible, despite the spec requiring a visible label. The access pill similarly hides its visible word below sm but retains screen-reader text. Source semantics are not manual accessibility acceptance.
- Mother nav: Overview, My pregnancy, Ask PROHOR, Care & support, Sharing & supporters, Reports, Wellbeing & diary, Find care, Warning signs, Accessibility.
- `app-module.css` standardises the module H1, `.module-hero` (eyebrow, H1, lead ≤48rem), `.module-chip` (pill task links, 2.75rem), button size and shape inside modules, and a whisper shadow on cards and panels (matched by substring: `[class*="panel"]`, `[class*="statusCard"]`, `[class*="experience"]`, so it can catch unintended elements ⚠).
- Module CSS modules exist per feature (`barta-education.module.css`, `bondhon.module.css`, `poth.module.css`, `ShusthotaOverview.module.css`, `shonket.module.css` (~1,700 lines)) and the auth styles in `features/auth/auth.css` (~1,000 lines). Check these before restyling a module.

### 6.3 Spec catalogue to build or reuse (design.md §8)
Primitives: Button, Link, Field, Choice (native, 24px visual in a 44px hit area, Switch shows On/Off), Segmented/Tabs, Badge/Chip, Divider. App: AppShell, TopBar (64px), SideNav (264px, active = primary text + surface-2 + 3px left rule + `aria-current`), BottomNav, PageHeader, **StatusNotice** (loading, saved-local "Saved on this device. Not sent.", saved-server, sending, delivered "Delivered to demo care queue at {time}", acknowledged, failed `role=alert` "draft is kept", offline), AccessPreferencesPanel (420px drawer / full sheet, live preview, Reset quiet, Done), ThemeSelector, FontSelector, TextSizeControl, QuickAdjust, Stepper, Disclosure, DataTable, DraftRecovery, DemoBanner. Domain: UrgentHelpButton, BoundaryNote, AIAnswer, SourceTag (record font), ProvenanceBadge, CareRecordCard, MeasurementChart (+ "View as table"), TimelineEntry, ReportVerifier, WellnessCheckIn, FacilityCard (Verified / Not verified), ConsentReview, SupportRequestTracker, PreferredContactSelector. ⚠ Many have no shared implementation (StatusNotice, ProvenanceBadge, SourceTag, DemoBanner, Stepper, DraftRecovery); modules implement their own versions. Reuse an existing module pattern before inventing a new one, and propose extracting it.

### 6.4 Interaction states (every component and screen)
- Focus: `:focus-visible` outline **3px `--pro-focus`, offset 3px** (base rule); on primary bands use `.on-primary` (ring = `--pro-bg`). ⚠ Components vary: offset 2px (`AppButton`, inputs, `.module-chip`), `outline-2` (`Brand`). Never use box-shadow focus.
- Hover: primary → `--pro-primary-hover`; secondary → surface fill + control-border; quiet links stay underlined. Nothing essential is hover-only.
- Pressed: scale ≈0.98. Loading: the label changes ("Saving your entry…"), width stays stable, `aria-busy`. Disabled: prefer `aria-disabled` + visible reason over grey-out.
- Error: 2px danger border + icon + message below, value kept, `aria-describedby`, focus moves to the error summary on submit.
- Selected: fill + check/mark + text, plus `aria-selected`/`aria-pressed`/`aria-current`.
- Screen states (§9.8): loading (skeleton + announce once; `/app/loading.tsx` is the pattern), empty (one sentence + one action, never fake data), error (what, why, what to do; inputs kept), offline ("Saved on this device. Not sent."), success (time + destination), partial (DraftRecovery), denied or revoked consent (plain statement).
- Status truth: never show saved/delivered/acknowledged before the server confirms it.

---

## 7. Responsive rules

- Mobile-first. Test 320, 360, 390, 430, 768, 1024, 1280, 1440; safe areas; soft keyboard must not cover the send control; 200% text, 400% zoom / 320px reflow, with Extra-large + Relaxed + Spacious + Bangla combined; no horizontal page scroll; labels wrap instead of truncating; the bottom nav grows rather than truncating.
- Navigation: bottom nav (<lg in code; spec says <640) + top-bar Urgent help; tablet top nav + drawer; desktop sidebar. ⚠ Code switches at Tailwind `lg` (1024px) for sidebar vs bottom nav; spec tablet (640–1023) wants top nav + drawer, code shows bottom nav + drawer.
- Cards stack → 2 columns → 2–3 by task. Tables reflow or scroll inside their container. Barta sources go below (mobile) or in a right panel (desktop). Mother/Baby: one list with text lane labels on mobile, two lanes on desktop.
- Spec wants rem-based, content-sensitive breakpoints. Tailwind defaults use rem (`lg` = 64rem), while globals and several route styles use px breakpoints. **Do not promise that changing the root font-size alone moves a rem media query:** media-query relative units are based on the browser's initial font sizing, not simply the current html font-size. Some homepage styles also use container queries. Reflow must be tested, not inferred from units.

---

## 8. Accessibility rules (definition of done)

WCAG 2.2 AA target, with no certification claim. Body 4.5:1, large 3:1, essential non-text 3:1 (overlay: 7:1 text). Nothing conveyed by colour, sound or motion alone. Keyboard-complete with no traps and no click-only divs; skip link; one H1 and no skipped levels; landmarks; focus not obscured (`scroll-padding-top: 5rem` on `html`); no drag-only controls; targets ≥44px (primary 48px); no data-losing timeouts; consistent help location (WCAG 3.2.6); labelled and announced errors; no puzzle CAPTCHA, paste allowed; `role=status/alert` used sparingly; dialogs labelled with focus trap, Esc and focus return; charts have tables; captions or transcripts; read-aloud opt-in and never autoplaying; preferences combine independently and keep drafts and focus. Manual test matrix: `ACCESSIBILITY.md` (10 items) and `QA_CHECKLIST.md` (score 1–5; any <4 blocks "ready").

---

## 9. Content and voice

Warm, plain, adult. Sentence case, active voice, verb + object buttons ("Save health entry", not "Submit"). Errors = what happened + what to do, no blame. Avoid "normal", "safe", "healthy range", "AI diagnosed", "special needs", "disabled mode", and "patient" in mother-facing copy. Preferred terms: *Adjust how you use PROHOR · Recorded by you · Clinician confirmed · Not enough approved information · Delivered to demo care queue · Talk to a person · Urgent help · Saved on this device*. A bilingual status dictionary is in design.md §11.3; **all Bangla is a draft** pending native and clinician review. Mark demo data and the simulated provider on screen. Helplines: 999 only, unless a number is verified (Shonket also shows 16263 with a caveat).

---

## 10. Inconsistency register (resolve with the owner; don't guess)

| # | Topic | Conflict |
|---|---|---|
| D1 | Font system | Spec: role tokens + `next/font` (Noto Serif / Manrope / Roboto Slab default). Code: CSS-`@import` Google Fonts, undefined `--font-*` variables, Rubik body forced by `globals.css`, Roboto Slab display hard-coded; homepage adds Fraunces (italic) + JetBrains Mono |
| D2 | Morning Mist values | Eight roles differ from design.md; JSON/TOKENS contain a smaller overlapping subset. Selected actual-CSS pairs computed in §13 pass, but intended approval is unknown |
| D3 | Button shape and behaviour | Spec 10px radius, wraps, no glow, `aria-disabled`; code pills, `nowrap`, glow shadows, lift on hover, opacity-disabled; two button systems (`AppButton` vs `.pro-btn`) plus homepage `Button` |
| D4 | Eyebrows | Spec forbids all-caps eyebrows and text below 0.875rem; `.pro-eyebrow` and the module-hero eyebrow are uppercase, tracked, 0.72–0.75rem (EN) |
| D5 | Small text | Form labels `text-sm`, hints/errors/badges `text-xs`, `text-[9px]`/`[10px]` exist; spec label 1rem, badge ≥0.875rem |
| D6 | Focus ring | Spec 3px / offset 3px everywhere; components use offset 2px or `outline-2` |
| D7 | Bangla line height | Spec/tokens 1.75; `globals.css` `:lang(bn)` 1.7; SKILL.md says 1.5–1.7 |
| D8 | Typography docs | AGENTS.md "one Bangla family + restrained Latin" and SKILL.md "two families max" vs design.md presets (design.md §14.8 says to update them; not done) |
| D9 | Token names in docs | SKILL.md `--pro-text-muted`/`--pro-primary-on`, TOKENS.md `--pro-primary-on`/`--pro-accent-on`/`--pro-space-*`; CSS uses `--pro-muted`, `--pro-on-primary`, `--pro-on-accent` and has no `--pro-space-*` |
| D10 | Contrast evidence | design.md claims 300 pair checks; `CONTRAST_REPORT.md` / `check:contrast` cover 18 pairs, not the overlay, surface-2 or focus pairs |
| D11 | Alias scope | `--pro-font-tag` defined only under `.pro-home`; no color alias for `--pro-scrim` (used as `backdrop:bg-pro-scrim`) |
| D12 | Proposed files | design.md §14.1 files (`src/lib/preferences/*`, `PreferencesProvider`, `QuickAdjust`, `ThemeSelector`, `FontSelector`, `TextSizeControl`, `PreferencePreview`, `src/app/fonts.ts`) don't exist; the storage key differs (`prohor.prefs.v1` vs `prohor-access-preferences-v1`) |
| D13 | Glass and blur | Anti-pattern in app screens, but used in `.pro-floating-card` and the bottom nav `backdrop-blur-sm` (the floating card is homepage-only, so allowed by §18; the bottom nav is in the app) |
| D14 | Nav breakpoints | Spec: bottom nav <640, top nav + drawer 640–1023, sidebar ≥1024 (264px). Code: bottom nav + drawer <1024, sidebar 256px |
| D15 | Shared domain components | ProvenanceBadge, StatusNotice, SourceTag, DemoBanner, Stepper, DraftRecovery are specified but implemented per module |
| D16 | `focusedView` / `data-focused` | Implemented, but not in design.md; not in the account v2 schema |
| D17 | Homepage scale | §18 hero `clamp(3rem,7vw,5.5rem)` versus active `homepage-hero.css` `.story-hero h1` `clamp(3rem,5.3vw,4.65rem)` with mobile/container overrides down to 2rem. The older `.pro-hero-h1` rule is not evidence of the active hero's computed style |
| D18 | Mobile help label | Mother shell hides the visible Urgent help words below md. Screen-reader text exists, but this differs from the always-visible labelled-help requirement |
| D19 | Theme-card preview | Full Adapt cards all use `var(--pro-primary)` from the current theme for swatches, without scoping each to its candidate theme. This is not §9.2's faithful candidate preview. Marketing AdaptPreview does use explicit preview scopes |
| D20 | Nested theme recipe | design.md §14.7 sets only nested data-theme and claims it re-scopes tokens. Actual selectors require root or `[data-prohor-preview][data-theme]`; copying that recipe without the preview marker would not select candidate colors |
| D21 | Panel variants | Compact AccessPreferencesPanel, full AdaptSettingsPanel and marketing HomePreferences are separate implementations, not one wrapper. Feature/control parity, English-only copy and presentation differ; they share stores, not identical markup |
| D22 | Prop forwarding | AppCard accepts only children/className/as/elevated and does not forward DOM attributes. Adapt SettingsSection passes aria-labelledby to it; that relationship is not emitted by AppCard. AppCard's comment also says default border-only although code uses shadow-pro-1 |
| D23 | Motion reduction | Token rules collapse durations but do not remove every transform. OS-specific globals remove legacy button transforms; app-module disables hover lift; homepage has its own reduced final state. Do not assume data-motion universally removes AppButton active scale |
| D24 | Offline/state copy | Spec examples say saved locally and draft kept. Some real forms retain only in-memory text, and a lost response may have committed. Use persistence/transport evidence rather than copying a blanket saved-local or not-sent message |
| D25 | Private-item wireframe | design.md §9.6 suggests diary/chat can appear under Show more private items; current sharing contract excludes them entirely, and the safety/privacy documentation takes precedence. Never add those scopes from the wireframe |
| D26 | Preset loading | Full settings offers Noto Serif while canonical font variables are absent; no general availability check hides failed presets. A font-card label or CSS stack is not proof that the named font loaded |

---

## 11. Checklist for new UI work

1. Read `AGENTS.md`, the `prohor-premium-uiux` skill, this file, and the current code of the module you're touching (its CSS module and the shared primitives).
2. Use `--pro-*` tokens and Tailwind aliases only; font **roles**, not families; radius tokens; `--pro-control-h` and the density gaps; durations and `ease-pro`.
3. Match the established module rhythm: `.module-hero` header → `.module-chip` task links → cards on `pro-border` + `shadow-pro-1`; the app H1 from `app-module.css`.
4. Keep Urgent help, Adjust and language in the shell; don't hide them.
5. Design every state (§6.4), Bangla + English copy (Bangla marked draft), provenance on clinical values, a demo/simulated label, and honest status.
6. Check 320/390/768/1280, 200% text, the Extra-large + Spacious + Relaxed combination, all three themes ± contrast, reduced motion, forced colors, keyboard-only and a screen reader. Record what was **not** tested.
7. If a rule here conflicts with code, follow the precedence in §0. If it's still unclear, add the issue to §10 and ask rather than picking a side.

## Change log
- 2026-11-20: created from docs + code review; no existing files changed.
- 2026-11-20: expanded/revalidated at b6351ed; corrected approval language, eight-token Mist drift count, font-variable/fallback claims, homepage tag scope and active hero rules; added current panel, mobile-help, state and verification evidence. Only this explicitly requested reference was updated; application/design source files were left unchanged.

## 12. Active implementation map and how to reuse it

This section distinguishes the specified component catalogue from the current route tree. Reuse a working pattern after checking its context; do not replace a module from a stale starter example.

| UI concern | Start here | Observed implementation / caution |
|---|---|---|
| Global CSS/tokens | `src/app/layout.tsx`, `src/app/globals.css`, `src/styles/prohor-tokens.css` | Root imports globals, globals imports token CSS (which owns Tailwind). Token base is layered; globals is unlayered and overrides several type/button rules. Root SSR language is en; bootstrap/runtime subsequently apply choices |
| Signed-in visual rhythm | `src/features/auth/AuthShell.tsx`, `src/styles/app-module.css`, `src/features/auth/auth.css` | Header/sidebar/drawer/bottom nav, `.app-module`, H1 and broad card/panel selectors. AuthShell currently has local edits; preserve them. Entry/auth and provider/supporter shells are different branches from mother nav |
| Marketing composition/cascade | `src/app/(marketing)/page.tsx`, `src/components/marketing/Homepage.tsx` | Import order: homepage → story → upgrade → refinement → polish → hero → navigation → care CSS. Later matching rules matter; the most recently imported file need not win a more-specific selector |
| Full access settings | `src/features/adapt/components/AdaptSettingsPanel.tsx`, `src/app/(marketing)/accessibility/SettingsContent.tsx` | Uses SettingsSection/AppCard, native groups and radios, inline preview styles, language helper and announcements; full page also includes CloudSyncSection and an AAC draft composer |
| Compact in-place settings | `src/components/accessibility/AccessPreferencesPanel.tsx`, `AccessPreferencesControl.tsx`, AuthShell details popover | Compact panel has theme, contrast, text size, spacious-layout alias, motion/simple-text, communication/language, reset and cloud controls. It does not embed the full font/density/text-spacing/focused-view page. Native dialog keeps the current task mounted; header details is not a modal sheet |
| Marketing settings | `src/components/marketing/HomePreferences.tsx` | Separate homepage dialog/reading controls; not the full Adapt page or compact header component. Inspect its own focus/return and body scroll handling |
| Shared store and boot | `src/lib/access-preferences.ts`, `features/adapt/hooks/useAdaptPreferences.ts`, `features/adapt/lib/preference-helpers.ts`, `components/marketing/preference-bootstrap.ts`, `PreferenceRuntime.tsx` | useSyncExternalStore, stable snapshots, events, local memory fallback, schema migration, independently applied root attributes. Actual storage keys differ from spec examples. Do not create a competing PreferencesProvider/store from §14 snippets |
| Explicit account choice | `features/adapt/lib/account-{controller,mapping,runtime}.ts`, `components/CloudSyncSection.tsx`, `PreferenceConflictDialog.tsx` | Account v2 ten-field shape maps supported local differences; font/compact/focused settings are not all cloud fields. Load/compare/review/save differ from continuous automatic sync; 409 requires re-review |
| Read-aloud and AAC | `features/adapt/components/{AACComposer,ReadAloudButton}.tsx`, Adapt speech hooks/lib, `src/lib/audio-session.ts` | AAC has select/remove/reorder/undo/clear, editable phrase and explicit insert; speech is optional. API/provider behavior is distinct from the visual controls. No voice-only task or automatic send |
| Barta | `features/barta/{BartaChatStarter,BartaEducationChat}.tsx`, `barta-education.module.css`, `src/app/app/ask/page.tsx` | Current composer card includes a labelled textarea, counter, microphone/symbol/send controls, language selectors, disclosure and inline symbol panel. Answer sources/errors/help have explicit text. Desktop columns start at 56rem; they are conversation plus topics, not literally §9.4's sources-only side panel |
| Records | `features/jibonrekha/{AccountRecords,AccountVisitPack,LifelineArc,CareGuide}.tsx`, `records-ui.tsx` | Account Today/arc, separate subjects, task forms/review, history and selected-only print; local Lifeline/RecordsWorkspace uses its own CSS/demo storage. Clinical and source labels remain essential; do not infer backend status from an attractive demo |
| Report and kit flows | `features/bujhi/{AccountReportReview,ReportReview,SourcePreview,WorkflowProgress,KitExperience}.tsx` | Source-beside-reviewed values, text progress, explicit uncertainty/review/save, native choices, focus after transitions. Account hemoglobin, fixed-PDF demo, and local medical-entry flows differ; keep limits visible |
| Consent and care states | `features/bondhon/{CareRequestForm,CareRequestDetail,SharingNow,RevokeDialog,BondhonRequestTracker}.tsx`, `bondhon.module.css` | Native forms/dialogs, evidence tracker, exact scopes and review, expiry/revoke, unknown outcomes. No instant recall of viewed information or implied real clinician contact |
| Public safety | `features/shonket/{SafetyHome,WarningSigns,WarningDetail}.tsx`, `shonket.module.css` | Shared public frame and explicit emergency/help actions; clinical draft/publication conflict is recorded in PROJECT_KNOWLEDGE. The CSS promotes some legacy decorative-border classes to control-border within the experience |
| Wellness and Poth | `features/shusthota/ShusthotaOverview.tsx`, its CSS module, `features/poth/PothDirectoryMvp.tsx`, `poth.module.css` | Task sections, semantic choices, truthful unavailable/empty/unknown data, list alternative to maps, source notices. User-chosen activity is not a score; unknown facility access is not verified |

**Theme preview contract:** root uses `:root[data-theme]`; local preview uses both `data-prohor-preview` and `data-theme`, optionally `data-contrast`. `marketing/care/AdaptPreview.tsx` is an actual scoped example. Do not place only `data-theme` on a nested element and expect the root selectors to match it. Preview status colors inherit separately from the root unless explicitly overridden; check mixed contrast contexts.

**Font cascade:** homepage's route-local `--font-prohor-*` declarations, `homepage-upgrade.css` and `homepage-care.css` are separate from the global missing canonical `--font-*` names. The tag role exists under `.pro-home`. Do not conclude that a working homepage preset proves the same font stack works in an account module. Actual downloads, fallback glyphs, shaping, weight synthesis, shift and effective families were not measured in this read-only review.

**Brand implementations:** `Brand.tsx` uses a heart tile and a stacked text lockup; `HomeBrand.tsx`/`ProhorSymbol` uses a currentColor sun-arc and bilingual text, including the mother app shell. The design proposal asks for outlined serif wordmark paths and lists mark approval as open. Existing assets are evidence of use, not approval of that exact brief.

**Density coverage is partial:** AppCard and inputs consume density variables; numerous module gaps/buttons instead use explicit Tailwind rem sizes or CSS literals. Text scaling still changes rem dimensions, but the independent density preference is not guaranteed to alter every control. Preserve functional markup while verifying combined choices; do not assume a token's existence means every component consumes it.

## 13. Fresh checks and limitations for this reference

Performed on 20 Nov 2026, branch `omor-mvp-closure` at `b6351ed`, with existing dirty source files preserved:

- Read the complete design draft, both `src/styles` files, globals, README/AGENTS, the eight design-system Markdown files and `design-tokens.json`. Inspected shared primitives, access panels/store/boot, shell, active homepage cascade and representative module patterns.
- `node scripts/check-color-contrast.mjs`: **18 passed**, exit 0. This script reads `docs/design-system/design-tokens.json`; it does **not** parse shipped CSS or test overlay/surface-2/focus/full screens. Passing it does not validate all current Morning Mist colors or §4.6's 300 claimed checks.
- A separate read-only calculation extracted actual CSS hex values and computed selected WCAG luminance ratios for all three base/contrast combinations. Results below are pair checks only, rounded to two decimal places. Every selected base text pair exceeds 4.5, base control/focus pair exceeds 3; selected overlay text exceeds 7 and control/focus exceeds 4.5. No full-screen conformance follows.
- Source search found no hex literals matching the scan pattern in `src/features`, `src/components/ui` or `src/components/accessibility`. This does not mean those files use every semantic token correctly: literal sizes, font names, custom radii, derived shadows and opacity choices still exist, and globals/marketing contain literal colors.

| Actual CSS theme | Text / bg | Muted / surface-2 | On-primary / primary | On-accent / accent | Control-border / surface-2 | Focus / surface-2 |
|---|---:|---:|---:|---:|---:|---:|
| Quiet Garden | 12.66 | 5.00 | 6.26 | 8.29 | 3.87 | 5.19 |
| Quiet Garden + more | 15.74 | 9.32 | 11.90 | 10.06 | 9.32 | 6.88 |
| Original Rose | 11.84 | 5.12 | 7.88 | 7.43 | 4.04 | 4.79 |
| Original Rose + more | 17.12 | 9.85 | 12.60 | 10.01 | 9.85 | 7.10 |
| Morning Mist | 12.17 | 5.01 | 7.77 | 7.46 | 3.70 | 5.75 |
| Morning Mist + more | 16.19 | 8.97 | 11.60 | 8.97 | 8.97 | 6.98 |

No UI/code/token/design-source fix, package change, build, deployment or remote action was performed. No fresh screenshot, browser/computed-style inspection, manual keyboard/screen reader, 200%/400% zoom, device, native Bangla or clinical review was performed. Static source, the pair calculations and earlier project QA reports cannot establish that every interaction/state combination works. This is a reusable design reference, not an accessibility certification or a finished visual audit.

The intended durable change in this task is **only `docs/DESIGN_SYSTEM_REFERENCE.md`**, the explicitly requested output. Existing application and source documents are preserved. The earlier change-log entry refers to the original reference's creation; it is not a claim that this already-existing output was untouched during this update.

Final SHA-256 comparison matched every snapshotted file under `src` and `docs/design-system`, plus `design.md`, `README.md` and `AGENTS.md`, against the start of this review. The pre-existing dirty application changes remained intact.

## 14. Future UI workflow and unresolved approval decisions

Before future UI work, consult this file and PROJECT_KNOWLEDGE, then inspect current code and local changes. Read the mandatory PROHOR Premium UI/UX skill. Identify the user's job/risk, entry/action/success/failure, keyboard/screen-reader path and cross-module handoff. Reuse current semantic primitives and tokens where compatible with safety/access requirements; record a mismatch rather than reproducing it blindly.

Keep these decisions explicit:

1. **Typography:** AGENTS font-delivery/family constraints, the draft's role/preset model and the current global versus homepage systems disagree. Which policy and actual active family mappings are approved? Google Sans availability/licence/Bangla remains unresolved and the preset is not offered.
2. **Palette:** current Morning Mist versus provisional spec/JSON, plus derived roles and per-theme overlays need an approval record. Update source and contrast evidence together only when authorized; don't “correct” tokens from an old report.
3. **Controls:** whether shared app buttons retain pills/ghost or adopt the draft's radius/quiet/destructive/accent variants; wrapping, density, essential borders, focus and honest pending/error behavior must still work.
4. **Navigation/access presentation:** visible mobile help, consistent Adjust naming, full versus compact panel parity, tablet navigation and approved brand lockup remain reconciliation items. Do not remove help/provenance/consent to fit a layout.
5. **Content:** numerals, native Bangla review, clinical wording, image rights and named source review are not implied by this reference. Simplified content may only expose reviewed variants.
6. **State persistence:** record what is actually in memory/device/account and which confirmation the server supplies. Never add local-save, delivery, expiry or reset promises from design examples without implementation support.

For any future authorized change, test the actual task and keyboard path; then relevant themes × contrast × text size/spacing/density × Bangla/English, reduced motion, forced colors, errors/offline and focus recovery. Screen widths: 320/360/390/430/768/1024/1280/1440; text 200%, reflow 400%/320 CSS px, including the combined stress case. The draft's ten-row matrix is a minimum review design, not existing acceptance evidence; substitute only genuinely available presets and record unavailable ones honestly.

Update this reference with date/commit, affected source paths, resolved or newly discovered conflicts and verification limits whenever future work changes the system. Preserve the distinction between documented requirement, source implementation, measured behavior and owner approval.
