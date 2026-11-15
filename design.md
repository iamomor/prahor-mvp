---
name: prohor-design-system
version: 2.0.0-draft
status: Proposed. Needs product-owner approval (see section 17)
updated: 2026-11-14
product: PROHOR | প্রহর — Universal Adaptive AI Maternal & Child Care Ecosystem
tagline: Your care, your way. / আপনার যত্ন, আপনার মতো।
supersedes: DESIGN.md 1.0.0-draft (fixed single palette and fixed six-font roles)
sources:
  - PROHOR Product, Features, AI and UI/UX Master Blueprint v1.0
  - PROHOR UI/UX Kit (AGENTS.md, SKILL.md, docs/design-system/*, src/styles/prohor-tokens.css)
  - Reference study of https://www.maacare-ai.me/ (structure and patterns only)
---

# PROHOR Design System

This file is the visual and interaction source of truth for building PROHOR's UI. **Version 2 is built around one idea from the kit: colour, typeface, text size, spacing, density and motion are the mother's choices.** The design system therefore defines a _range_ of appearances and a set of guarantees that hold across all of them, not one fixed look.

It follows the nine-part DESIGN.md schema (theme, color, typography, components, layout, depth, do/don't, responsive, agent guide) and adds what a healthcare product needs: a preference model, accessibility, medical-content UX, provenance, consent, and bilingual content.

**What changed from version 1**

| Area         | Version 1 (retired)                               | Version 2                                                                                                                                                                                 |
| ------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colour       | One fixed "Forest" brand palette; other themes P2 | **Three user-selectable themes** (Quiet Garden default, Original Rose, Morning Mist), all P0 through shared tokens, plus an independent contrast overlay that keeps the chosen hue family |
| Typography   | Six families locked to fixed roles                | **Five user-selectable typeface presets** (Default, Rubik, Google Sans, Noto Serif, Roboto Slab). Components ask for a _role_, never a family                                             |
| Text         | Size only                                         | Size (3 steps) and **text spacing** (proposed), both independent                                                                                                                          |
| Density      | Three modes                                       | Same, now defined as tokens that components read                                                                                                                                          |
| Architecture | Tokens described                                  | **Preference model, resolution order, persistence and no-flash boot** specified (section 2 and 14)                                                                                        |
| Tokens file  | Patched kit file                                  | **Rewritten `prohor-tokens.css` ships with this document** (section 14.2)                                                                                                                 |

**What this file is not.** It is a design specification, not an accessibility certification or a clinical validation. Contrast ratios were computed with the WCAG 2.2 relative-luminance formula for the listed pairs only. Whole screens still need manual keyboard, screen-reader, and zoom testing.

**Status labels** used in tables: `Working` (real behavior), `Limited` (narrow real behavior), `Simulated` (demo data/provider, must be labelled on screen), `Future` (not in MVP). Priority labels `P0/P1/P2` follow the blueprint.

---

## 0. Precedence and resolved conflicts

### 0.1 Order of authority

1. Safety, medical-content, privacy, and consent rules (`AGENTS.md`, `AI_MEDICAL_CONTENT.md`)
2. Accessibility rules (`ACCESSIBILITY.md`, sections 2.5 and 10 here)
3. This file (preference model, visual language, components, layouts, voice)
4. `src/styles/prohor-tokens.css` (the v2 file shipped with this document is authoritative; the kit's v1 file is superseded)
5. Reference sites (inspiration only; never copied)

If a visual choice conflicts with 1 or 2, the visual choice loses. **No preference may ever override 1 or 2.**

### 0.2 Conflicts between the blueprint, the kit, and version 1, and how this file resolves them

| Topic                        | Blueprint / kit                                                                                                | Version 1                             | Decision in this file                                                                                                                                                                                                                                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colour model                 | Kit: three user-selectable themes + independent contrast. Blueprint: forest palette as a brand identity        | One fixed Forest palette, themes P2   | **Kit model wins.** Quiet Garden is the default; Original Rose and Morning Mist are P0 because they cost only token values. The blueprint's forest-green identity lives on as Quiet Garden's family. If the team wants the exact blueprint hexes (`#143F34` etc.), add them as a fourth theme using the checklist in section 4.8 |
| Contrast overlay             | Kit: one overlay with Quiet-Garden greens                                                                      | n/a                                   | **One overlay per theme**, so a mother who chose Original Rose keeps a rose family at higher contrast (as the earlier appearance discussion required)                                                                                                                                                                            |
| Fonts                        | Kit: Noto Sans Bengali + Manrope, "two families max". Request: add Google Sans, Rubik, Roboto Slab, Noto Serif | Six families, all loaded, fixed roles | **Presets.** One preset is active at a time, so the "two families" rule holds _per preset_ (Default uses a display + body + record trio by design). Only the active preset's fonts download                                                                                                                                      |
| Layout density               | Blueprint: compact + spacious. Kit: spacious                                                                   | Three modes                           | Three modes, as tokens (section 6.3)                                                                                                                                                                                                                                                                                             |
| Welcome layout               | Blueprint: four task cards. Kit: avoid icon-card grids                                                         | Four task rows of unequal weight      | Unchanged                                                                                                                                                                                                                                                                                                                        |
| Access panel action          | Blueprint: "Apply preference". Kit: live preview                                                               | Live preview + Done                   | Unchanged. No Apply step                                                                                                                                                                                                                                                                                                         |
| "Moner Sathi" label          | Retire                                                                                                         | Retired                               | Retired. Emotional wellness lives in Shusthota                                                                                                                                                                                                                                                                                   |
| Standard / Personalized Care | Retired                                                                                                        | Retired                               | Never appear in UI or code                                                                                                                                                                                                                                                                                                       |

---

## 1. Product and design context

**User job.** A mother finds the task she needs, uses the interaction method she prefers, understands the information, and stays in control of who sees her data.

**Assumed context (validate with users).** Adult mothers in Bangladesh from pregnancy through early motherhood; Bangla first, English available; mid-range Android browsers on unreliable connections; some mothers use screen readers, keyboards, switches, or external AAC. A second audience is authorized providers (CHW or clinician) using the provider portal.

### 1.1 The eight modules and their UI jobs

| Module     | Bangla    | UI job                                             | Signature component                         | Priority |
| ---------- | --------- | -------------------------------------------------- | ------------------------------------------- | -------- |
| Adapt      | অ্যাডাপ্ট | Let anyone change how they read and operate PROHOR | `AccessPreferencesPanel`                    | P0       |
| Barta      | বার্তা    | Source-grounded educational answers                | `AIAnswer` + `SourceTag`                    | P0       |
| Shonket    | সংকেত     | Reviewed warning-sign info and human help          | `UrgentHelpButton`, `SupportRequestTracker` | P0       |
| Jibonrekha | জীবনরেখা  | Separate but linked mother and baby records        | `CareRecordCard`, `TimelineEntry`           | P0       |
| Bujhi      | বুঝি      | Upload, extract, verify, explain reports           | `ReportVerifier`                            | P1       |
| Shusthota  | সুস্থতা   | Optional private wellness logging                  | `WellnessCheckIn`                           | P0       |
| Poth       | পথ        | Verified care directory, list first                | `FacilityCard`                              | P1       |
| Bondhon    | বন্ধন     | Consent, care requests, provider queue             | `ConsentReview`, provider queue             | P0       |

All modules share one app shell, one token set, one component library, and one set of access preferences. Modules are capabilities, not eight homepage buttons.

### 1.2 Design principles

1. **Same journey, different interaction.** One UI. Preferences change how it is presented, never what care is available.
2. **Task before taxonomy.** Lead with "Ask", "My health", "Find care", never with module names.
3. **Evidence is visible.** Sources, provenance, and "not enough information" are first-class UI, not footnotes.
4. **Honest state.** Never show "sent", "saved", "verified", or "delivered" unless that is true.
5. **Calm authority.** Premium, warm, adult. Quiet surfaces, strong typography, few colors.
6. **The mother holds the keys.** Sharing is explicit, granular, revocable, and reviewed before sending.
7. **Bangla is a first-class script**, not a translation layer. Layouts are tested with real Bangla strings.
8. **One memorable thing per screen.** Everything else stays quiet.
9. **Preferences are design material.** Colour, typeface, text size, spacing, density, and motion are chosen by the mother. Every screen must hold up under any combination (section 2).

---

## 2. Preference-driven design model

**Rule zero: no screen, component, illustration, or piece of copy may assume a particular colour, typeface, text size, spacing, or density.** Designers draw one layout and one component set. Preferences re-skin and re-scale it.

### 2.1 What a mother can change

| Preference             | Attribute on `<html>`         | Values (default first)                                         | What it changes                                      | Priority                          |
| ---------------------- | ----------------------------- | -------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------- |
| Colour theme           | `data-theme`                  | `quiet-garden`, `original-rose`, `morning-mist`                | Colour tokens                                        | P0                                |
| Higher contrast        | `data-contrast`               | _absent_ (standard), `more`                                    | Colour tokens, per theme                             | P0                                |
| Text size              | `data-text-scale`             | _absent_ (100%), `large` (112.5%), `extra-large` (125%)        | Root font size; everything in `rem` follows          | P0                                |
| Layout density         | `data-layout`                 | _absent_ (comfortable), `compact`, `spacious`                  | Control height, gaps, card padding                   | P0                                |
| Reduce motion          | `data-motion`                 | _absent_ (follow device), `reduce`                             | Durations and transforms                             | P0                                |
| Language               | `lang` on `<html>` and chunks | `bn`, `en`                                                     | Copy and Bangla typography rules                     | P0                                |
| Typeface               | `data-font`                   | `default`, `rubik`, `google-sans`, `noto-serif`, `roboto-slab` | Font roles (section 5)                               | P1                                |
| Text spacing           | `data-text-spacing`           | _absent_ (standard), `relaxed`                                 | Line height, word spacing, paragraph gap             | P1 (proposed addition to the kit) |
| Simpler reviewed text  | content flag                  | off, on                                                        | Which reviewed copy variant is shown                 | P1                                |
| Picture-and-text (AAC) | content flag                  | off, on                                                        | Adds AAC composition to Ask PROHOR and Human Support | P1                                |
| Read aloud             | content flag                  | off, on                                                        | Adds read-aloud controls where supported             | P1                                |

Appearance preferences (the first eight rows) change **only CSS variables**. Content preferences (the last three plus language) change what is offered, never what care is available.

### 2.2 Three layers, no coupling

```
Layer 1  Appearance   theme · typeface
Layer 2  Access       contrast · text size · text spacing · density · motion · language · simple text · AAC · read-aloud
Layer 3  Healthcare   the same eight modules and the same records for every mother
```

- Layer 1 and Layer 2 are **independent**: any theme works with any access setting.
- Layer 3 never reads layers 1 and 2 to decide what a mother may do. No preference changes consent, record access, urgency handling, or AI evidence rules.
- Higher contrast is **not a theme**. It is an overlay that sits on whichever theme is chosen and is removed without losing the choice.

Example combinations the system must support (fictional; none is inferred from ability):

| Mother  | Theme         | Typeface    | Text        | Other                          |
| ------- | ------------- | ----------- | ----------- | ------------------------------ |
| Ayesha  | Quiet Garden  | Default     | Default     | Comfortable layout             |
| Nusrat  | Quiet Garden  | Default     | Default     | AAC, Spacious                  |
| Farhana | Morning Mist  | Rubik       | Large       | Compact                        |
| Rima    | Original Rose | Noto Serif  | Default     | Higher contrast                |
| Salma   | Quiet Garden  | Google Sans | Extra large | Relaxed spacing, Reduce motion |

### 2.3 Resolution order

Each attribute is resolved top to bottom; the first rule that applies wins.

1. **Forced colours** (`forced-colors: active`): the operating system palette owns colour. Theme and overlay colours are ignored; structure, borders, and focus outlines remain.
2. **The mother's explicit choice** for that preference (stored locally, or on her account after she turned sync on).
3. **Device signals** used as _initial_ defaults only when she has not chosen: `prefers-contrast: more` selects the overlay, `prefers-reduced-motion: reduce` reduces motion. For motion, either source is enough to reduce; neither can force _more_ motion than the device allows.
4. **PROHOR defaults**: Quiet Garden, Default typeface, 100% text, standard spacing, comfortable layout.

An explicit "contrast: standard" choice beats the device signal. The UI shows "Matches your device" when the value is coming from step 3.

### 2.4 Persistence and privacy

- **Device first.** Preferences are saved on the device before sign-in (`localStorage`, key `prohor.prefs.v1`, wrapped in `try/catch`) and the UI says **"Saved on this device."**
- **Sync is opt-in.** After sign-in a single switch, off until chosen, syncs preferences to the account. Never sync silently.
- **Preferences are not health data, but they can be revealing** (AAC on, extra-large text). They are excluded from analytics, logs, AI prompts, and provider views. A provider sees only the preferred contact method the mother enters in Human Support.
- Stored values are validated against an allow-list on read; unknown values fall back per field, never to a broken state.
- Server-rendered HTML ships the defaults. A blocking boot script applies stored preferences before first paint (section 14.4), so there is no colour or size flash.

### 2.5 What preferences can never do

1. Hide, move, disable, or restyle **Urgent help**, consent controls, or provenance labels beyond the tokens defined here.
2. Reduce a control below 44px (at 100% text) or text below 1rem for body content.
3. Make any theme fail WCAG AA. Every theme must pass **without** the contrast overlay (section 4.6).
4. Change care rights, consent, or record visibility.
5. Be read to infer disability, cognition, literacy, or decision-making capacity.
6. Cause a form, draft, focus position, or route to be lost.

### 2.6 Theme-proof design rules (designers and developers)

1. **No literal colours or font names in feature code or Figma frames.** Use `--pro-*` tokens, Tailwind aliases, and font _roles_ (`font-display`, `font-heading`, `font-body`, `font-control`, `font-record`).
2. **Meaning never lives in colour.** Status, provenance, selection, links, chart series: always text plus an icon or shape.
3. **Size with `rem`, not `px`,** for text, control heights, padding and breakpoints that depend on text. No fixed heights on anything containing text.
4. **Illustrations and logos use tokens.** Inline SVG with `currentColor` or token fills; no baked-in colour.
5. **Never branch layout on a preference.** A component renders the same tree in every theme/typeface/scale. Only content preferences (language, simple text, AAC, read-aloud) may change what renders.
6. **Review every screen in the matrix** (section 15.2) before it is called done.
7. **Add a token before adding a one-off.** If a screen needs a new colour role, add it to all three themes and both contrast sets, or do not add it.

### 2.7 Figma setup

Mirror the CSS so designs cannot drift from code.

| Variable collection | Modes                                                 |
| ------------------- | ----------------------------------------------------- |
| `Theme`             | Quiet Garden, Original Rose, Morning Mist             |
| `Contrast`          | Standard, More (each theme has its own "More" values) |
| `Typeface`          | Default, Rubik, Google Sans, Noto Serif, Roboto Slab  |
| `Text scale`        | 100%, 112.5%, 125%                                    |
| `Density`           | Compact, Comfortable, Spacious                        |

Variable names equal the CSS names (`pro/bg`, `pro/primary`, `pro/font-body`). Components bind only to variables. Key screens (Welcome, Adjust panel, Dashboard, Barta, Mother and baby health, Human support) are delivered once, then checked by flipping modes, not redrawn.

---

## 3. Visual theme

**Theme statement: calm, grounded, literate. A botanical clinic reading room.** The _structure_ is constant for every mother: strong typographic hierarchy, quiet surfaces, generous space, rounded-rectangle shapes, and evidence shown as ornament. The _hue, type voice, scale and density_ are hers to change.

Source tags and provenance badges are the signature detail in every theme, because trust is what PROHOR offers.

### 3.1 Influences

| Source                   | What we take                                                                                                                                                                                                                                                   | What we leave                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Apon (from blueprint)    | Clarity, short paths, strong hierarchy                                                                                                                                                                                                                         | Anything that reads as generic SaaS                                                                                                                                                                                                                                                                                                                                                                                         |
| Mati (from blueprint)    | Earthy warmth, grounded tone                                                                                                                                                                                                                                   | Heavy texture or decoration                                                                                                                                                                                                                                                                                                                                                                                                 |
| maacare-ai.me (MaaSathi) | Hero that shows a real source-cited answer card; stats row that cites a source; two "windows" section (mother / provider); responsible-AI trio; sticky anchored nav; inline Bangla microcopy; plain "Not a replacement for a doctor" line; offline status chip | Fixed magenta/rose brand colour (PROHOR never assigns a colour to a person; Original Rose is one optional theme); red-flag CRIT/HIGH/LOW triage chips (PROHOR does not triage with AI); voice-first framing (PROHOR is text-first, voice optional); italic single-word accents in headings (Bengali has no true italic); all-caps numbered eyebrows like "01 — VOICE"; "Beta" chips; any numbers we cannot source ourselves |

### 3.2 Anti-patterns for this product

No glassmorphism, no gradient washes, no theme or colour assigned by gender or ability, no identical rounded card grids, no all-caps eyebrow above every heading, no numbered markers unless content is truly a sequence, no stock imagery of the wrong population, no decorative charts, no streaks or scores on wellness.

### 3.3 Wordmark (proposal, needs design approval)

- Lockup: `PROHOR` with a thin vertical divider and `প্রহর`, drawn as **outlined SVG paths in the brand serif (Noto Serif 700 / Noto Serif Bengali 600)** so the logo does not change with the typeface preference. Colour = `--pro-primary` on light surfaces, `--pro-on-primary` on primary bands, so it follows the theme.
- Mark idea: a sun-arc divided into watches. _Prohor_ is a traditional division of the day, and "keeping watch" over mother and baby across the day is the brand idea. Arc in `--pro-accent-strong`, dot in `--pro-primary`. No mark has been designed yet; treat this as a brief.
- Minimum wordmark height 24px. Never place on `--pro-surface-2` or `--pro-accent` fills.

---

## 4. Color

### 4.1 The three themes

All three themes use the **same token names** and the same component library. Values for Quiet Garden, Original Rose and Morning Mist's core roles come from the kit's `prohor-tokens.css`. Roles marked † are **new derived values** added in v2 so components do not need one-off colours; they need designer approval.

| Token                    | Quiet Garden (default) | Original Rose | Morning Mist | Role                                                     |
| ------------------------ | ---------------------- | ------------- | ------------ | -------------------------------------------------------- |
| `--pro-bg`               | `#fffcf5`              | `#fbf6f2`     | `#f8faf9`    | Page background                                          |
| `--pro-surface`          | `#e6f2e9`              | `#f2dfe4`     | `#dfeeee`    | Cards, panels                                            |
| `--pro-surface-2`        | `#d3e6d9`              | `#ecd3da`     | `#cbe2e2`    | Nested surfaces, selected rows, panel footers            |
| `--pro-elevated`         | `#ffffff`              | `#ffffff`     | `#ffffff`    | Inputs, dialogs, popovers                                |
| `--pro-text`             | `#23352d`              | `#432c36`     | `#17373b`    | Headings and body                                        |
| `--pro-muted`            | `#4a6358`              | `#62535b`     | `#4c6161`    | Secondary text (still body-contrast)                     |
| `--pro-primary`          | `#2f6b54`              | `#70445a`     | `#075b67`    | Primary action, links, key icons, primary bands          |
| `--pro-primary-hover`    | `#245441`              | `#5a3548`     | `#054852`    | Pressed/hover primary                                    |
| `--pro-on-primary`       | `#ffffff`              | `#ffffff`     | `#ffffff`    | Text on primary                                          |
| `--pro-on-primary-muted` | `#e1efe6`              | `#f6e6ec`     | `#dcf0f1`    | Secondary text on primary bands                          |
| `--pro-accent`           | `#f4c96b`              | `#e8bac7`     | `#e8b3c0`    | **Decorative** highlight fill                            |
| `--pro-on-accent`        | `#23352d`              | `#432c36`     | `#17373b`    | Text on accent                                           |
| `--pro-accent-strong`    | `#7a5200`              | `#8a3556`     | `#8a3350`    | Text-safe accent: text, icons, borders on light surfaces |
| `--pro-border`           | `#9aada2`              | `#aa949e`     | `#9cadaa`    | Decorative separators only                               |
| `--pro-control-border`   | `#5c7468`              | `#75616d`     | `#4e6c70`    | Essential outlines of inputs, checkboxes, switches       |
| `--pro-focus`            | `#145da0`              | `#165e9b`     | `#144db5`    | Focus ring                                               |
| `--pro-shadow-rgb`       | `35 53 45`             | `67 44 54`    | `23 55 59`   | Shadow/scrim tint (= theme text colour)                  |

† `--pro-surface-2`, `--pro-primary-hover`, `--pro-on-primary-muted`, `--pro-accent-strong`, `--pro-shadow-rgb`.

Themes are **light-only**. A dark theme is Future (section 17).

### 4.2 Role rules

| Token                                                            | Use it for                                                                                                       | Never                                                              |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `--pro-bg`, `--pro-surface`, `--pro-surface-2`, `--pro-elevated` | Backgrounds in increasing depth. Cards on `bg` use `surface`; things inside a card use `surface-2` or `elevated` | Text colour; a one-off surface in a feature                        |
| `--pro-text`, `--pro-muted`                                      | Body, headings, secondary text. `muted` still meets body contrast                                                | Disabled-looking text for essential info                           |
| `--pro-primary` / `--pro-on-primary`                             | Primary button, links, key icons, primary bands                                                                  | Large decorative areas on ordinary pages                           |
| `--pro-on-primary-muted`                                         | Secondary text on a primary band                                                                                 | Anything on a light surface                                        |
| `--pro-accent` / `--pro-on-accent`                               | **Decorative** highlight fill (callout, extracted-value badge). Text on it must be `--pro-on-accent`             | Text colour; icon colour; borders essential for meaning            |
| `--pro-accent-strong`                                            | Text, icons, and borders in the accent family on light surfaces                                                  | Fills                                                              |
| `--pro-border`                                                   | Decorative separators and card outlines                                                                          | Anything needed to identify a control (use `--pro-control-border`) |
| `--pro-control-border`                                           | Outlines of fields, checkboxes, radios, switches, secondary buttons                                              | Decoration                                                         |
| `--pro-focus`                                                    | The focus ring, always `outline`, 3px, offset 3px                                                                | Box-shadow focus; any other use                                    |
| `--pro-success/-warning/-danger/-info` (+ `-soft`)               | Status **text, icon, border**, always with a label                                                               | Status by colour alone                                             |

### 4.3 Status colours (shared by every theme)

Status colours are not themed. One set is verified against all twelve theme surfaces, so a clinical status never changes meaning when a mother changes theme.

| Status          | Standard value             | Lowest on any theme surface | On its `-soft` tint | Overlay value | Lowest (overlay, 7:1) |
| --------------- | -------------------------- | --------------------------: | ------------------: | ------------- | --------------------: |
| `--pro-success` | `#1a6848` (soft `#e3f1e8`) |                        4.78 |                5.78 | `#14532d`     |                  7.23 |
| `--pro-warning` | `#7c4a08` (soft `#fbeed2`) |                        5.25 |                6.43 | `#5c3a04`     |                  8.08 |
| `--pro-danger`  | `#a33138` (soft `#f8e1df`) |                        4.88 |                5.51 | `#8b1f1f`     |                  7.20 |
| `--pro-info`    | `#1b5e86` (soft `#e0eef6`) |                        4.98 |                5.93 | `#0f4a6e`     |                  7.49 |

Each status always appears as **icon + word + colour**. The soft tint is a fill behind that text, never a standalone signal.

### 4.4 Provenance tokens (core to PROHOR trust UX)

Every clinical value or statement shows exactly one badge. Each badge has an **icon, a text label, and a border style**, so meaning never depends on colour, and every badge is built from semantic tokens so it works in every theme.

| Provenance          | Label (EN)                          | Fill / text / border                                       | Icon        | Border       |
| ------------------- | ----------------------------------- | ---------------------------------------------------------- | ----------- | ------------ |
| Self-reported       | Recorded by you                     | `--pro-elevated` / `--pro-text` / `--pro-control-border`   | user        | solid 1.5px  |
| Extracted           | Extracted from report. Please check | `--pro-accent` / `--pro-on-accent` / `--pro-accent-strong` | scan-text   | dashed 1.5px |
| Clinician-entered   | Entered by clinician                | `--pro-elevated` / `--pro-text` / `--pro-text`             | stethoscope | solid 1.5px  |
| Clinician-confirmed | Clinician confirmed                 | `--pro-success-soft` / `--pro-success` / `--pro-success`   | badge-check | solid 2px    |
| Demo / synthetic    | Demo data                           | `--pro-elevated` / `--pro-text` / `--pro-control-border`   | flask       | dotted 1.5px |

### 4.5 Higher-contrast overlay (independent of theme)

`data-contrast="more"` overrides **colour tokens only**, never feature availability, and never the stored theme. Each theme has its own overlay values, so Original Rose stays rose-family and Morning Mist stays teal-family. Target is **7:1 for text**, 4.5:1 for essential borders and focus.

| Token                                           | Quiet Garden + overlay                        | Original Rose + overlay | Morning Mist + overlay |
| ----------------------------------------------- | --------------------------------------------- | ----------------------- | ---------------------- |
| `--pro-bg`                                      | `#ffffff`                                     | `#ffffff`               | `#ffffff`              |
| `--pro-surface`                                 | `#eef2ef`                                     | `#f5eef0`               | `#eef4f4`              |
| `--pro-surface-2`                               | `#dfe7e2`                                     | `#f0e6e9`               | `#dde9e9`              |
| `--pro-text`                                    | `#11271f`                                     | `#2a1520`               | `#0c2427`              |
| `--pro-muted`                                   | `#243d32`                                     | `#46303b`               | `#25403f`              |
| `--pro-primary`                                 | `#153e31`                                     | `#4d2640`               | `#053f48`              |
| `--pro-primary-hover`                           | `#0e2d23`                                     | `#3a1c30`               | `#03303a`              |
| `--pro-accent-strong`                           | `#5c3d00`                                     | `#6b2243`               | `#6b2238`              |
| `--pro-border`                                  | `#42574a`                                     | `#5d4651`               | `#3f5d5f`              |
| `--pro-control-border`                          | `#243d32`                                     | `#46303b`               | `#25403f`              |
| `--pro-focus`                                   | `#0041b5`                                     | `#0041b5`               | `#0041b5`              |
| `--pro-success` / `warning` / `danger` / `info` | `#14532d` / `#5c3a04` / `#8b1f1f` / `#0f4a6e` | same                    | same                   |

Rules:

- The overlay is selected by the mother, or by `prefers-contrast: more` when she has not chosen (section 2.3).
- Turning it off restores her theme exactly; the saved theme value is never rewritten.
- Under `forced-colors: active` the overlay is moot: the system palette wins; use outlines (not shadows) for focus, keep visible borders on cards and inputs, use `currentColor` for icons, and never set `forced-color-adjust: none`.

### 4.6 Verified contrast (computed, listed pairs only)

Computed with the WCAG relative-luminance formula. **300 pair checks across 3 themes × standard/overlay × 4 surfaces: 0 failing.** These are pairs, not screens: charts, disabled states, link visited states, and real renderings still need testing.

**Standard (each theme passes on its own, without the overlay)**

| Pair                                     | Quiet Garden | Original Rose | Morning Mist | Target |
| ---------------------------------------- | -----------: | ------------: | -----------: | -----: |
| Text on background                       |        12.66 |         11.84 |        12.17 |    4.5 |
| Text on surface / surface-2              |         9.94 |          9.02 |         9.43 |    4.5 |
| Muted on background                      |         6.37 |          6.73 |         6.28 |    4.5 |
| Muted on surface-2                       |         5.00 |          5.12 |         4.86 |    4.5 |
| Primary on background (links, headings)  |         6.11 |          7.35 |         7.42 |    4.5 |
| On-primary on primary (button label)     |         6.26 |          7.88 |         7.77 |    4.5 |
| On-primary on primary-hover              |         8.68 |         10.31 |        10.22 |    4.5 |
| On-primary-muted on primary (band text)  |         5.28 |          6.55 |         6.58 |    4.5 |
| On-accent on accent                      |         8.29 |          7.43 |         7.07 |    4.5 |
| Accent-strong on background              |         6.75 |          7.18 |         7.50 |    4.5 |
| Accent-strong on surface-2               |         5.30 |          5.47 |         5.81 |    4.5 |
| Control border on background             |         4.93 |          5.31 |         5.41 |    3.0 |
| Control border on surface-2              |         3.87 |          4.04 |         4.19 |    3.0 |
| Focus ring on background                 |         6.60 |          6.29 |         7.26 |    3.0 |
| Focus ring on surface-2                  |         5.19 |          4.79 |         5.62 |    3.0 |
| Page bg on primary (focus ring in bands) |         6.11 |          7.35 |         7.42 |    3.0 |

**Overlay on**

| Pair                         | Quiet Garden | Original Rose | Morning Mist | Target |
| ---------------------------- | -----------: | ------------: | -----------: | -----: |
| Text on background           |        15.74 |         17.12 |        16.19 |      7 |
| Muted on surface-2           |         9.32 |          9.85 |         8.97 |      7 |
| Primary on background        |        11.90 |         12.60 |        11.60 |      7 |
| On-primary on primary        |        11.90 |         12.60 |        11.60 |      7 |
| Accent-strong on surface-2   |         7.85 |          8.89 |         8.85 |      7 |
| Border on background         |         7.80 |          8.54 |         7.14 |    4.5 |
| Control border on background |        11.74 |         12.03 |        11.15 |    4.5 |
| Focus ring on surface-2      |         6.88 |          7.10 |         6.98 |    4.5 |

Rules that follow from the numbers:

- White on `--pro-accent` is never allowed (low contrast); use `--pro-on-accent`.
- `--pro-border` (about 2.2–2.6:1 on the page background) is decorative only. Essential outlines use `--pro-control-border` (≥ 4.9:1 on background, ≥ 3.8:1 on `surface-2`).
- Extend `scripts/check-color-contrast.mjs` with every pair above, run for each theme with the overlay off and on. A regression fails CI.

### 4.7 Theme-adaptive surfaces

- **Primary bands** (hero emphasis, footer, one per page): `--pro-primary` fill, `--pro-on-primary` text, `--pro-on-primary-muted` secondary text, primary button inverted to `--pro-bg` fill with `--pro-primary` text, focus ring `--pro-bg` (`.on-primary`).
- **Shadows and scrims** use `--pro-shadow-rgb`, so they take on the theme's tint.
- **Charts:** series are distinguished by **marker shape, dash pattern, and direct labels**, drawn from `--pro-primary`, `--pro-accent-strong`, and `--pro-text`. Colour is never the only separator. Every chart has a "View as table" alternative.
- **Selected states:** `--pro-surface-2` fill + `--pro-primary` mark + text. Never fill-colour alone.
- **Imagery:** photography is not recoloured; overlays and captions use tokens. Illustrations are inline SVG with tokens (section 7.3).

### 4.8 Adding or changing a theme (checklist)

A new theme (for example the blueprint's exact Forest `#143F34`) is accepted only when:

1. It defines **every** role in section 4.1 (no inheriting from Quiet Garden by accident).
2. It has its own overlay block with the same roles.
3. All pairs in 4.6 pass for the new theme with overlay off and on.
4. A matching Figma `Theme` mode exists.
5. Welcome, the Adjust panel, Dashboard, Barta, and Human Support have been screenshotted in the new theme at default and Extra large text.
6. The theme id is added to the allow-list in the preference schema and the boot script.

Free colour pickers (custom user colours) are **Future** because they cannot guarantee contrast; if added, contrast must be auto-checked and unsafe values blocked.

### 4.9 Usage proportions

Roughly: `bg`/`surface`/`elevated` 70%, `text` 20%, `primary` 8%, `accent` at most 2%. **`--pro-accent` appears at most once per screen.** One primary button per dominant action area. Links are `--pro-primary` **and underlined** in running text.

---

## 5. Typography

### 5.1 Typeface presets (user choice)

The mother picks a typeface in _Adjust how you use PROHOR_. Components never name a family; they use five **roles**, and each preset maps the roles to fonts. Only the active preset's fonts are downloaded by the browser (section 5.6).

| Preset          | `data-font`   | Character                          | Display (H1/H2) | Heading (H3/H4) | Body        | Control     | Record      | Bangla companion                                       | Priority                    |
| --------------- | ------------- | ---------------------------------- | --------------- | --------------- | ----------- | ----------- | ----------- | ------------------------------------------------------ | --------------------------- |
| **Default**     | `default`     | Editorial calm, plain working text | Noto Serif      | Manrope         | Manrope     | Manrope     | Roboto Slab | Noto Sans Bengali (display/record: Noto Serif Bengali) | P0                          |
| **Rubik**       | `rubik`       | Soft, rounded, friendly            | Rubik           | Rubik           | Rubik       | Rubik       | Rubik       | Noto Sans Bengali                                      | P1                          |
| **Google Sans** | `google-sans` | Clean, geometric, product-like     | Google Sans     | Google Sans     | Google Sans | Google Sans | Google Sans | Noto Sans Bengali                                      | P1, availability unverified |
| **Noto Serif**  | `noto-serif`  | Book-like, long reading            | Noto Serif      | Noto Serif      | Noto Serif  | Noto Serif  | Noto Serif  | Noto Serif Bengali                                     | P1                          |
| **Roboto Slab** | `roboto-slab` | Sturdy, document-stamp feel        | Roboto Slab     | Roboto Slab     | Roboto Slab | Roboto Slab | Roboto Slab | Noto Serif Bengali                                     | P1                          |

Kit-locked core: **Manrope + Noto Sans Bengali** (Default). Added on request: Google Sans, Rubik, Roboto Slab, Noto Serif (with Noto Serif Bengali as its necessary Bangla counterpart).

Why Default mixes three Latin families: serif = editorial voice for the few big titles; Manrope = quiet working text; slab = "this came from a record or source" for measurement values and citations. The other presets use **one family everywhere**, which is simpler and often easier to read. Only Default has this mix, so there is no six-family clutter for anyone.

A preset that cannot be loaded or licensed is **not offered** (the card is hidden), rather than silently falling back to look like Default.

### 5.2 Roles (what components use)

| Role      | Tailwind       | Used for                                                                     |
| --------- | -------------- | ---------------------------------------------------------------------------- |
| `display` | `font-display` | Welcome hero, H1, H2, pull quotes                                            |
| `heading` | `font-heading` | H3–H4, nav labels, card titles                                               |
| `body`    | `font-body`    | Body, forms, helper text, Barta answers                                      |
| `control` | `font-control` | Buttons, tabs, chips, badge labels, stepper labels                           |
| `record`  | `font-record`  | Measurement values, `SourceTag` citations, extracted-value cells, record IDs |

Never use two families inside one component unless the active preset does it through roles.

### 5.3 Bangla coverage (important)

Manrope, Rubik, and Roboto Slab have **no Bangla glyphs**. Google Sans Bengali coverage is **unverified**. Every stack therefore ends in an explicit Bengali family, and the browser falls back **per character**, so Bangla text always renders in a Bengali font whichever preset is active:

| Preset family                      | Bangla fallback    |
| ---------------------------------- | ------------------ |
| Manrope, Rubik, Google Sans (sans) | Noto Sans Bengali  |
| Noto Serif, Roboto Slab (serif)    | Noto Serif Bengali |
| Default display and record roles   | Noto Serif Bengali |

Rules for Bangla text:

- `lang="bn"` on every Bangla chunk (needed for line-height, hyphenation, and screen readers).
- Body line-height **1.75** (2.0 with Relaxed spacing), headings **1.35–1.45**. Matras and conjuncts need more room than Latin.
- **Letter-spacing is always 0**, even when Relaxed text spacing is on. No `text-transform`, no justify, no fake italic/bold (`font-synthesis: none`).
- No italics for Bangla emphasis. Use weight (600) or `--pro-primary` colour plus an icon.
- Allow wrapping everywhere; Bangla labels are often longer than English. No fixed-width buttons.
- Mixed-language strings: wrap English terms in `<span lang="en">`.

### 5.4 Type scale

Root `font-size: 100%` stays user-resizable. Sizes in rem. Latin line-height / Bangla line-height shown. The scale is identical across presets; only the family changes.

| Token        | Size                                   | Line-height (Latin / Bangla) | Weight  | Role    | Use                                          |
| ------------ | -------------------------------------- | ---------------------------- | ------- | ------- | -------------------------------------------- |
| `display`    | clamp(2.5rem, 1.9rem + 2.4vw, 3.75rem) | 1.10 / 1.30                  | 600     | display | Welcome hero only                            |
| `headline`   | clamp(1.875rem, 1.6rem + 1vw, 2.5rem)  | 1.20 / 1.35                  | 600     | display | Page title (H1)                              |
| `title`      | 1.5rem                                 | 1.28 / 1.40                  | 600     | display | Section (H2)                                 |
| `title-sm`   | 1.25rem                                | 1.35 / 1.50                  | 600     | heading | Card heading (H3)                            |
| `subtitle`   | 1.125rem                               | 1.40 / 1.55                  | 600     | heading | H4, emphasized lead                          |
| `body-lg`    | 1.125rem                               | 1.60 / 1.75                  | 400     | body    | Barta answers, lead paragraphs               |
| `body`       | 1rem                                   | 1.60 / 1.75                  | 400     | body    | Default text, form fields                    |
| `label`      | 1rem                                   | 1.40 / 1.60                  | 600     | body    | Field labels                                 |
| `control`    | 1rem                                   | 1.25 / 1.45                  | 600     | control | Buttons, tabs, chips                         |
| `record`     | 1.5rem                                 | 1.20 / 1.35                  | 600     | record  | Measurement values (tabular)                 |
| `record-sm`  | 1rem                                   | 1.30 / 1.50                  | 500     | record  | Table values                                 |
| `source-tag` | 1rem                                   | 1.30 / 1.50                  | 500     | record  | Citations in answers                         |
| `caption`    | 0.875rem                               | 1.45 / 1.65                  | 400–500 | body    | Non-critical metadata only, in `--pro-muted` |

Body never goes below 1rem. Caption never carries essential information. Weights 400, 500, 600, 700 only; if a preset lacks a weight, the nearest available weight is used (never synthesized).

### 5.5 Text size and text spacing preferences

| Preference              | Setting                       | Effect                                                                                                                                                |
| ----------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text size               | Default / Large / Extra large | Root font size 100% / 112.5% / 125%. Because type, controls, padding and breakpoints are in `rem`, the whole interface scales, including target sizes |
| Text spacing (proposed) | Standard / Relaxed            | Body line-height 1.6 → 1.85 (Bangla 1.75 → 2.0), word-spacing 0.08em, paragraph gap 1em → 1.5em, Latin letter-spacing 0.02em (Bangla stays 0)         |

Both stack with browser zoom and OS text scaling (root stays a percentage, never `px`). The interface must survive Extra large + Relaxed + Spacious + Bangla + 200% browser zoom at 320px width: no clipped text, no horizontal page scroll, controls wrap instead of truncating.

### 5.6 Loading and performance

- Declare all families once through `next/font` with `display: "swap"` and `bengali` + `latin` subsets only. Browsers download a font file **only when text uses it**, so inactive presets cost nothing.
- Preload only the Default critical set (Manrope + Noto Sans Bengali; Noto Serif + Noto Serif Bengali on routes with display type). Rubik, Google Sans, Roboto Slab, and alternate presets do not preload.
- Opening the typeface cards previews each family at weight 500 only; that is the one moment several families download. Closing the panel with Default still active leaves no extra load.
- After a mother selects a preset, its fonts load with `swap`; the fallback metrics (`adjustFontFallback`) keep layout shift within a line-height tolerance.
- Budget: aim for under about 300 KB of woff2 for first load on Default; measure in the real build, on a throttled mobile profile.
- Never ship font binaries inside design docs. Verify each font's licence at its source before shipping (Google Sans especially).

### 5.7 Text rules

- Reading measure: 60–70ch (Latin), cap Bangla at about 60ch. Left-aligned. Never justified.
- `font-variant-numeric: tabular-nums` for measurement columns and tables only.
- Headings: H1 and H2 use the `display` role, H3+ the `heading` role. One H1 per page; never skip levels.
- Sentence case for headings, buttons, and labels. No all-caps labels (acronyms excepted).
- **Numerals (open decision, see section 17):** recommend Bangla digits in Bangla prose and dates, and Latin digits for clinical measurements with units so they match lab reports and device displays. Test screen-reader pronunciation.
- Must survive WCAG 1.4.12 text-spacing overrides (line-height 1.5, paragraph spacing 2x, letter-spacing 0.12em, word-spacing 0.16em) without clipping.

---

## 6. Layout, spacing, shape

### 6.1 Grid and containers

| Viewport            | Columns | Gutter  | Notes                                                            |
| ------------------- | ------- | ------- | ---------------------------------------------------------------- |
| < 640px (mobile)    | 4       | 16–20px | Single column; bottom nav; sticky primary action allowed         |
| 640–1023px (tablet) | 8       | 24px    | Two columns where useful; top nav + drawer                       |
| ≥ 1024px (desktop)  | 12      | 32–48px | Left sidebar 264px; content max 1200px; forms stay single column |
| ≥ 1280px            | 12      | 32–48px | Optional right context panel 320px                               |

Test widths: 320, 360, 390, 430, 768, 1024, 1280, 1440. Honor safe areas (`env(safe-area-inset-*)`), soft keyboards, 200% text resize, and 400% zoom (320px reflow).

### 6.2 Spacing

Base unit **4px**, working rhythm **8px**. Tokens: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`.

| Context                                | Value                           |
| -------------------------------------- | ------------------------------- |
| Card padding                           | 20–24px (16px on 320px screens) |
| Gap between related fields             | 16px                            |
| Gap between form groups                | 24–32px                         |
| Section gap in the app                 | 32–48px                         |
| Section gap on public Welcome          | 64–96px desktop, 48px mobile    |
| Minimum space between adjacent targets | 8px                             |

### 6.3 Density modes (`data-layout`)

Density is a user preference. It changes tokens, never structure.

| Mode                  | `data-layout` | Control height (at 100% text)     | Field gap / group gap / section gap / card padding |
| --------------------- | ------------- | --------------------------------- | -------------------------------------------------- |
| Compact               | `compact`     | 44px (`2.75rem`, **never lower**) | 12 / 20 / 32 / 16px                                |
| Comfortable (default) | _(absent)_    | 48px (`3rem`)                     | 16 / 24 / 40 / 20px                                |
| Spacious              | `spacious`    | 56px (`3.5rem`)                   | 20 / 32 / 52 / 24px                                |

Components read `--pro-control-h`, `--pro-gap-*`, and `--pro-pad-card`. Because they are `rem` values, they grow again with the text-size preference. Density, text size, text spacing, theme, contrast, typeface, and motion combine independently.

### 6.4 Shape (radius tokens)

| Token                  | Value | Use                                     |
| ---------------------- | ----- | --------------------------------------- |
| `--pro-radius-control` | 10px  | Buttons                                 |
| `--pro-radius-field`   | 12px  | Inputs, selects, textareas              |
| `--pro-radius-card`    | 16px  | Cards, panels                           |
| `--pro-radius-hero`    | 24px  | Hero panels, large callouts             |
| `--pro-radius-pill`    | 999px | Badges, switches, segmented tracks only |

Do not introduce other radii. Nested elements use a smaller radius than their container.

### 6.5 Page templates

| Template            | Used by                                              | Structure                                                                  |
| ------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- |
| T1 Public / Welcome | Welcome, public Barta, Find care                     | Top bar, hero, task rows, evidence sections, primary-coloured footer band  |
| T2 Workspace page   | Dashboard, Health, Wellness, Reports, Appointments   | App shell, `PageHeader`, main content, optional context panel              |
| T3 Focused task     | Sign-in, care profile, Bondhon request, Bujhi verify | Minimal chrome, `Stepper`, one column (max 640px), sticky action bar       |
| T4 Reading          | Barta conversation, guidance pages                   | 65ch column, sources beside (desktop) or directly below (mobile)           |
| T5 Provider         | Provider portal                                      | App shell, dense table (rows ≥ 44px), detail panel, "Demo provider" banner |

---

## 7. Depth, imagery, icons, motion

### 7.1 Elevation (tonal first, shadow last)

| Level | Treatment                                                     | Used for                   |
| ----- | ------------------------------------------------------------- | -------------------------- |
| 0     | `--pro-bg` background, no border                              | Page                       |
| 1     | `--pro-surface` fill + 1px `--pro-border`                     | Cards, panels              |
| 2     | `--pro-elevated` fill + 1px `--pro-border` + `--pro-shadow-1` | Inputs, interactive cards  |
| 3     | `--pro-elevated` + `--pro-shadow-3`                           | Dialogs, drawers, popovers |
| Scrim | `--pro-scrim`                                                 | Behind dialogs and drawers |

Shadows are tinted with the active theme's text colour through `--pro-shadow-rgb`, never neutral black and never a hard-coded rgb. Focus is an outline, never a shadow. Cards keep a real border so they survive forced-colors mode.

### 7.2 Iconography

Outline icons on a 24px grid, 1.5px stroke, rounded joins (Lucide fits this). Icons inherit `currentColor`. An icon never stands alone for meaning: pair with a visible label (icon-only is allowed only for universally known controls such as close, with an `aria-label`). Icons in provenance badges, status notices, and navigation are mandatory, not decorative.

### 7.3 Imagery and illustration

- Photography: diverse **adult Bangladeshi mothers and clinicians**, shown with dignity; accurate depictions of assistive devices when present; informative images get real `alt`, decorative get `alt=""`.
- Illustration: restrained botanical or line art drawn **with theme tokens, not fixed colours**: strokes use `currentColor` or `--pro-primary`, fills use `--pro-surface-2`, and at most one `--pro-accent` element per illustration. Ship illustrations as inline SVG (or CSS-masked) so they re-colour in every theme and in the contrast overlay. No raster illustration with baked-in colours, no cartoon mothers.
- AI-generated imagery, if used, is labelled in the project docs. No text inside image files.
- No image carries instructions. Images are secondary to content.
- Real photos and rights are an open item (section 17); use placeholders marked "Placeholder image" until approved.

### 7.4 Motion

| Token                   | Duration | Use                                          |
| ----------------------- | -------- | -------------------------------------------- |
| `--pro-duration-fast`   | 160ms    | Press, hover, focus changes                  |
| `--pro-duration-normal` | 220ms    | Disclosure open, drawer slide, status change |
| Maximum                 | 320ms    | Context transitions                          |

- Easing: `cubic-bezier(0.2, 0, 0, 1)` out. Animate `opacity` and `transform` only.
- Pressed state: `scale(0.985)`. No bounce, no parallax, no staggered fade-ups on every section, no autoplay, no flashing.
- Allow **one** deliberate motion moment per page at most (for example the Welcome answer card settling in). It must be fully skippable.
- `prefers-reduced-motion: reduce` and `data-motion="reduce"` both collapse durations to ~0 and remove translation/scale. Motion never carries critical meaning alone.

---

## 8. Components

Every component: real HTML elements, visible persistent labels, `:focus-visible` outline (3px, offset 3px), 44px+ targets (48px primary), and designed loading, empty, error, success, and offline states where relevant.

### 8.1 Primitives

Every primitive uses semantic tokens only. The same markup renders correctly in all themes, typefaces, scales, densities, and contrast settings.

| Component                            | Spec                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Button**                           | Height `var(--pro-control-h)` (48px default; `lg` hero CTA = control height + 8px). Padding-x 20px, radius `--pro-radius-control`, `font-control`, weight 600. **Primary:** `--pro-primary` fill, `--pro-on-primary` text, hover `--pro-primary-hover`. **Secondary:** `--pro-elevated` fill, 1.5px `--pro-control-border`, `--pro-primary` text. **Quiet:** no fill, `--pro-primary` text, always underlined (not hover-dependent). **Destructive:** `--pro-danger` text + border; the confirming dialog button may fill `--pro-danger`. **Accent:** `--pro-accent` fill with `--pro-on-accent` text, used rarely (once per screen). Labels are verb + object ("Save health entry", never "Submit"). Loading: label changes ("Saving your entry…"), width stays stable, `aria-busy`. **Avoid disabled primaries**: use `aria-disabled="true"` plus visible reason text. Buttons wrap to two lines instead of clipping (long Bangla, large text). |
| **Link**                             | `--pro-primary`, underlined in running text, 2px underline offset, visited state not colour-only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Field** (text, textarea, select)   | Min height `var(--pro-control-h)`, radius `--pro-radius-field`, `--pro-elevated` fill, 1.5px `--pro-control-border`. Visible label above (never placeholder-only), optional hint, unit shown inside or beside the value, error text below with `aria-describedby`, `autocomplete` set. Required/optional stated in words. On error: 2px `--pro-danger` border + icon + message; value preserved.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Choice** (radio, checkbox, switch) | Native inputs, 24px visuals inside a 44px+ label hit area. Selected state = fill + checkmark glyph (not colour only). Switch always shows "On/Off" text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Segmented control / Tabs**         | `font-control`, `var(--pro-control-h)` height, selected = `--pro-primary` underline (tabs) or `--pro-elevated` pill on `--pro-surface-2` (segmented) **plus** `aria-selected` and weight change.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Badge / Chip**                     | Pill radius, `font-control` 0.875–1rem (never below 0.875), icon + text always.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Divider**                          | 1px `--pro-border`. Decorative.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

### 8.2 App-level components

| Component                     | Purpose and rules                                                                                                                                                                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AppShell**                  | Skip link first; header, nav, `main`, optional complementary landmark. Persistent `UrgentHelpButton` on every screen and breakpoint.                                                                                                                                                                          |
| **TopBar**                    | Height 64px. Brand lockup, current page title (workspace), language toggle (বাংলা / EN, with `lang`), **Adjust** (sliders icon + visible word "Adjust"; accessible name "Adjust how you use PROHOR"), `UrgentHelpButton`, account. Notifications show no private preview by default.                          |
| **SideNav (desktop)**         | 264px. Dashboard, Mother & Baby Health, Wellness, Ask PROHOR, Reports, Appointments, Human Support. Never lists 24 capabilities. Active item: `--pro-primary` text, `--pro-surface-2` fill, 3px `--pro-primary` left rule, `aria-current="page"`.                                                             |
| **BottomNav (mobile)**        | Home, My Health, Ask, Care (labelled, 64px + safe area). Help stays in the top bar.                                                                                                                                                                                                                           |
| **PageHeader**                | Breadcrumb (when depth > 1), H1, optional context line (source + freshness), at most one page-level action.                                                                                                                                                                                                   |
| **StatusNotice**              | Persistent text + icon, never a disappearing toast alone. States below.                                                                                                                                                                                                                                       |
| **AccessPreferencesPanel**    | Drawer (desktop, 420px) or full-height sheet (mobile). Live preview strip, grouped controls (Look, Text, Layout, Language, Motion, Communication), **Done** closes, **Reset to defaults** is quiet. Shows "Saved on this device". Contains no diagnosis or disability questions. Full anatomy in section 9.2. |
| **ThemeSelector**             | Radio group of theme cards: live mini-preview (built from the theme's own tokens, so it is always accurate), theme name, and a visible "Selected" text + check icon. Never colour-only selection. Changing it never clears a form or moves focus.                                                             |
| **AccessibleDialog / Drawer** | Labelled title, visible close, focus trap, `Esc`, focus returns to trigger, no custom scroll trap.                                                                                                                                                                                                            |
| **Stepper**                   | Text steps ("Step 2 of 4: How should we contact you?"), Back always available, progress saved.                                                                                                                                                                                                                |
| **Disclosure**                | Native `<details>` or button + region; sources are open by default.                                                                                                                                                                                                                                           |
| **DataTable**                 | Real `<table>`, sticky header optional, rows ≥ 44px, reflows or scrolls inside its own container on mobile, never the page.                                                                                                                                                                                   |
| **DraftRecovery**             | Banner when unsent/unsaved input is restored: "We kept your draft from 14 Nov, 10:32. Continue or discard."                                                                                                                                                                                                   |
| **DemoBanner**                | Persistent on any screen that uses synthetic data or a simulated provider: "Demo data. No real clinician will see this."                                                                                                                                                                                      |

**StatusNotice states** (text exact, Bangla in i18n files after native review):

| State          | Text                                                   | Icon           | Live region            |
| -------------- | ------------------------------------------------------ | -------------- | ---------------------- |
| `loading`      | Loading…                                               | spinner        | `role="status"` (once) |
| `saved-local`  | Saved on this device. Not sent.                        | hard-drive     | `role="status"`        |
| `saved-server` | Saved to your record at {time}.                        | check          | `role="status"`        |
| `sending`      | Sending your request…                                  | send           | `role="status"`        |
| `delivered`    | Delivered to demo care queue at {time}.                | inbox          | `role="status"`        |
| `acknowledged` | A provider acknowledged your request at {time}.        | check-check    | `role="status"`        |
| `failed`       | Not sent. {Reason}. Your draft is kept. [Try again]    | alert-triangle | `role="alert"`         |
| `offline`      | You're offline. Changes are saved on this device only. | wifi-off       | `role="status"`        |

Never display `delivered` or `acknowledged` unless the backend confirmed it.
| **QuickAdjust** | Popover from the TopBar Adjust button: text size (A− / A+ with current value in words), theme, higher contrast, and a link "More options" that opens the full panel. Same state as the panel; no separate save. |
| **FontSelector** | Radio group of typeface cards. Each card renders its own name in its own typeface plus a Bangla sample (`বাংলা`), so the preview is honest. Only offers presets whose fonts actually loaded (section 5.1). |
| **TextSizeControl** | Three labelled steps (Default / Large / Extra large) shown as a segmented control with `A` glyphs of increasing size **and** the word. Not a drag-only slider. |
| **PreferencePreview** | A small block inside the panel (heading, paragraph, primary + secondary button, one `ProvenanceBadge`) rendered with live tokens so the effect of every control is visible without leaving the panel. |
| **PreferencesProvider** | Client provider that owns the preference state, writes `data-*` attributes on `<html>`, persists locally, and never remounts the tree (section 14.5). |

### 8.3 PROHOR domain components

| Component                    | Anatomy                                                                                                                                                   | Key rules                                                                                                                                                                                                                | Status                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| **UrgentHelpButton**         | Label "Urgent help" + icon, `--pro-danger` outline (white-on-`--pro-danger` fill on mobile, 6.9:1 standard / 9.1:1 contrast overlay), top bar, every page | Opens reviewed warning-sign guidance (Shonket) that works **without AI**. Never icon-only. Same position on every screen (WCAG 3.2.6).                                                                                   | P0                      |
| **BoundaryNote**             | One persistent line above input/answers: "Educational information, not medical advice. For urgent symptoms, use Urgent help."                             | Not dismissible. Bangla and English.                                                                                                                                                                                     | P0                      |
| **AIAnswer**                 | Question echo, answer body (`body-lg`), "What this means for your visit" (P1), `SourceTag` list, boundary line, actions: Talk to a person, Save question  | Sources visible by default. If evidence is insufficient: "I don't have enough approved information to answer this." plus Talk to a person and Rephrase. No diagnosis, medication advice, reassurance, or triage wording. | P0 / Working target     |
| **SourceTag**                | Label in the `record` font role: issuer · title · section · last-reviewed date, link                                                                      | Only real retrieved sources. Never fabricated; demo sources are marked "Demo source".                                                                                                                                    | P0                      |
| **ProvenanceBadge**          | See section 4.4                                                                                                                                           | One per value/statement. Icon + label + border style.                                                                                                                                                                    | P0                      |
| **CareRecordCard**           | Title, value (`record`) + unit, observed date, `ProvenanceBadge`, optional note, "View history"                                                           | Shows recorded values only; never a generated "normal/abnormal" verdict.                                                                                                                                                 | P0                      |
| **MeasurementChart**         | Line/dot chart (2px stroke, distinct marker shapes, direct labels) + **adjacent "View as table"**                                                         | Table alternative always available; no color-only series; reference bands only if clinician-provided and sourced.                                                                                                        | P1                      |
| **TimelineEntry**            | Date, lane label ("Mother" / "Baby" in text), type, `CareRecordCard`                                                                                      | Mother and baby are separate records on one linked timeline.                                                                                                                                                             | P0 (mother) / P1 (baby) |
| **ReportVerifier**           | Source file preview, extracted fields (editable), uncertainty marker with text, per-field Confirm, Save to record                                         | Raw extraction kept separate from confirmed value. Cannot save until the user confirms. Limited to supported synthetic formats, disclosed in UI.                                                                         | P1 Limited              |
| **WellnessCheckIn**          | Mood, energy, activity, rest, private note; every field skippable; "Skip today"                                                                           | No streaks, scores, step targets, or comparisons. Activity list includes assisted and rest options. Diary excluded from sharing by default.                                                                              | P0                      |
| **FacilityCard**             | Name, services, contact methods, accessibility details each with **Verified / Not verified**, last-verified date                                          | Unknown = "Not verified". List is the primary view; map optional.                                                                                                                                                        | P1                      |
| **ConsentReview**            | Recipient, exact fields, purpose, expiry/revocation info, explicit "Send request" and "Cancel"                                                            | Private diary and AI chat history are off and not pre-selected. Recipient is named; demo recipient says "Demo care queue (simulated)".                                                                                   | P0                      |
| **SupportRequestTracker**    | Vertical steps: Not sent, Sending, Delivered, Acknowledged, Responded, each with time or "Pending"                                                        | Status text on every step, not color.                                                                                                                                                                                    | P0                      |
| **PreferredContactSelector** | Radio group: text message, in-app message, phone call (if user wants), AAC-composed message                                                               | Shown to providers as the mother's stated method. No voice requirement.                                                                                                                                                  | P0                      |

---

## 9. Screens and layouts

Wireframes are structure, not pixel specs. `[ ]` = control, `{ }` = dynamic content. Real content and citations replace placeholders; never ship placeholder citations.

### 9.1 Welcome (T1, P0): the one place to be bold

Memorable thing: the **bilingual headline pair set in the display typeface role** and a **source-cited answer card** that shows what PROHOR does.

```
DESKTOP ≥1024
┌───────────────────────────────────────────────────────────────────────────┐
│ PROHOR | প্রহর   Ask · Health · Wellness · Find care   [বাংলা|EN]          │
│                          [Adjust how you use PROHOR]  [Urgent help] [Sign in]│
├───────────────────────────────────────────────────────────────────────────┤
│ Hero on --pro-bg                                                            │
│  Your care, your way.                 ┌ AI answer card ──────────────────┐  │
│  আপনার যত্ন, আপনার মতো।               │ {Question}                       │  │
│  Understand your pregnancy, follow    │ {Answer from approved sources}   │  │
│  your health, and find support.       │ [Source: issuer · title · date]  │  │
│  [Ask PROHOR]  [Find care]            │ Educational information only.    │  │
│  Not a replacement for a doctor.      └──────────────────────────────────┘  │
│  ডাক্তারের পরামর্শের বিকল্প নয়।                                              │
├───────────────────────────────────────────────────────────────────────────┤
│ What would you like to do?                                                  │
│ ┌ Ask PROHOR (largest row) ────────────┐ ┌ My Health ───────────────────┐  │
│ │ Understand a health topic            │ │ Records and conditions       │  │
│ └──────────────────────────────────────┘ └──────────────────────────────┘  │
│ ┌ My Wellness ─────────────────────────┐ ┌ Find Care ───────────────────┐  │
│ │ Activity, rest and mood              │ │ Facilities and appointments  │  │
│ └──────────────────────────────────────┘ └──────────────────────────────┘  │
├───────────────────────────────────────────────────────────────────────────┤
│ How an answer is found (a real sequence, so numbered): 1 You ask → 2 PROHOR │
│ searches approved sources → 3 You get an answer with its sources           │
├───────────────────────────────────────────────────────────────────────────┤
│ One record for mother and baby · You decide who sees what (consent) ·       │
│ Built for different ways of using it (preferences, not categories)          │
├───────────────────────────────────────────────────────────────────────────┤
│ Primary band: Responsible by design (text list: reviewed sources, human     │
│ oversight, no AI diagnosis, your data stays yours) · For care providers →   │
├───────────────────────────────────────────────────────────────────────────┤
│ Footer: Demo data notice · Privacy · Clinical disclaimer · বাংলা            │
└───────────────────────────────────────────────────────────────────────────┘

MOBILE <640
Top bar: [PROHOR] [Urgent help] [☰ Menu]   → hero text → [Ask PROHOR] (full width)
Task rows stacked (min 64px tall) → [Adjust how you use PROHOR] pinned as a labelled row
No horizontal scrolling. Answer card sits below the hero text.
```

Behavior (from the blueprint): Ask PROHOR opens public education with no profile; My Health asks for sign-in only when private data is needed; My Wellness opens the check-in and asks to sign in only to save; Find Care opens the directory; preferences open without any disability question; returning signed-in users go to the dashboard.

Rules: no statistics unless we have our own cited source. Task rows are not identical tiles: Ask PROHOR is visually dominant because it needs no account.

Theme-proofing: the hero, the answer card, task rows, and the primary band are built only from `--pro-*` tokens, so Welcome is shown and reviewed in all three themes, in the contrast overlay, and at 125% text before sign-off. The answer card uses the `record` role for its `SourceTag`; whatever typeface the mother chose, the card stays legible and unclipped.

### 9.2 Adjust how you use PROHOR (drawer / sheet, P0)

The most important screen in a preference-driven product. It is reachable from the first screen, from every TopBar, and from inside critical tasks. It never interrupts a task and never asks about disability.

```
┌ Adjust how you use PROHOR                          [Close]┐
│ Changes apply right away.  Saved on this device.           │
│ ┌ Preview ───────────────────────────────────────────────┐ │
│ │ Sample heading · one paragraph (বাংলা + English)        │ │
│ │ [Primary button] [Secondary button]  (Recorded by you) │ │
│ └────────────────────────────────────────────────────────┘ │
│ LOOK                                                        │
│  Colour theme   (•) Quiet Garden  ( ) Original Rose  ( ) Morning Mist │
│                 each card = live mini-preview + name + "Selected"     │
│  Higher contrast   [ Off | On ]   hint: "Matches your device" if auto │
│ TEXT                                                        │
│  Text size   [ A Default | A Large | A Extra large ]        │
│  Typeface    cards, each shown in its own typeface:         │
│              Default · Rubik · Google Sans · Noto Serif · Roboto Slab │
│  Text spacing   [ Standard | Relaxed ]                      │
│ LAYOUT      [ Compact | Comfortable | Spacious ]            │
│ LANGUAGE    [ বাংলা | English ]   Simpler reviewed text (P1)│
│ MOTION      Reduce motion  [ Off | On ]                     │
│ COMMUNICATION  Picture-and-text (AAC) (P1) · Read aloud (P1)│
│ [Reset to defaults]                                 [ Done ]│
└─────────────────────────────────────────────────────────────┘
```

Behaviour rules:

1. **Live and honest.** Every control applies instantly through `data-*` attributes on `<html>` and the preview shows the real result. There is no Apply step.
2. **Independent.** Choosing a theme never changes contrast, typeface, or size. Turning contrast on never changes the stored theme; turning it off returns to it exactly.
3. **Nothing is lost.** Changing any preference preserves focus, scroll position, unsaved form values, and the current route. Only the language switch may re-render copy, and it must restore drafts (`DraftRecovery`).
4. **Announced, not noisy.** One polite live-region message per change ("Text size: Large"). Focus stays on the control that was used.
5. **Unbuilt features are omitted**, not shown disabled or "coming soon". If a typeface preset failed to load, that card is hidden.
6. **Reset to defaults** is a quiet button that resets every preference at once, announces it, and offers no confirmation dialog (the action is trivially reversible).
7. **Nothing hides urgent help.** `UrgentHelpButton` stays visible and reachable while the panel is open, at every size.
8. **Sync is opt-in.** After sign-in, a single labelled switch "Use these settings on my other devices" (off until chosen) syncs preferences to the account.
9. **Panel survives its own settings.** The panel itself must be fully usable at Extra large text, Relaxed spacing, Spacious layout, in every typeface, in every theme, and with Bangla labels. It scrolls inside itself; its footer (Reset / Done) stays visible.

Keyboard order: Close → Theme radios → Higher contrast → Text size → Typeface → Text spacing → Layout → Language → Motion → Communication → Reset → Done. `Esc` closes and returns focus to the Adjust button.

### 9.3 Dashboard (T2, P0)

```
H1: Good morning, {name}                      (display role; no streaks)
┌ Continue ─────────────────────┐ ┌ Next appointment ─────────────────────┐
│ {last task, one button}       │ │ {only if recorded} else empty state    │
└───────────────────────────────┘ └────────────────────────────────────────┘
┌ Ask PROHOR  [ type a question…            ] [Ask] ──────────────────────┐
┌ Mother ───────────────────────┐ ┌ Baby ─────────────────────────────────┐
│ Latest CareRecordCards         │ │ Latest baby records (or empty state)  │
│ {value · date · provenance}    │ │ {value · date · provenance}           │
└────────────────────────────────┘ └───────────────────────────────────────┘
┌ Support requests: {status via SupportRequestTracker summary} ───────────┐
```

Empty states are invitations ("No health entries yet. Add your first one."), never fake records. Every data card shows source and freshness.

### 9.4 Barta (T4, P0)

```
DESKTOP                                    MOBILE
BoundaryNote (persistent)                  BoundaryNote
┌ Conversation ──────────┐ ┌ Sources ──┐   Conversation
│ You: {question}        │ │ SourceTag │   Answer
│ PROHOR: {answer}       │ │ SourceTag │   Sources (open, below the answer)
│ [Talk to a person]     │ │ {metadata}│   [Talk to a person]
│ ┌ Ask ───────────────┐ │ └───────────┘   Sticky input:
│ │ [ type your question] [Ask] │            [type] [Speak P1] [Picture & text P1] [Ask]
└────────────────────────┘
```

States: **Loading** ("Looking through approved sources…"), **Insufficient evidence** (see `AIAnswer`), **Error** (retry, question preserved), **Offline** (question saved on this device, not sent). Read-aloud and voice are optional and never the only path. AAC composition shows the composed text for review before Ask.

### 9.5 Mother and baby health (T2, P0 mother / P1 baby)

```
H1: My health          [Mother | Baby | Both] (segmented, default Both)
Week 24 · Recorded by you   [Add health record]
Desktop: two lanes on a shared date axis        Mobile: single list, lane label in text
┌ Mother ───────────────┐ │ ┌ Baby ─────────────────┐
│ CareRecordCard         │ │ │ CareRecordCard         │
│ ProvenanceBadge        │ │ │ ProvenanceBadge        │
└────────────────────────┘ │ └────────────────────────┘
Chart (P1) with [View as table] directly beneath
```

Condition records show who confirmed them and when. A self-reported condition stays "Recorded by you" until a clinician confirms it. Baby records hold clinician-documented findings only; PROHOR never infers fetal conditions.

### 9.6 Human support request (T3, P0)

```
Stepper: 1 What do you need  2 How should we contact you  3 What to share  4 Review and send
Step 3: checkboxes of shareable items (none pre-selected). Private diary and AI chats are
        not listed unless "Show more private items" is opened, and remain unchecked.
Step 4 ConsentReview:
  To: Demo care queue (simulated)     Why: {request type}
  Sharing: {exact fields, dates}      You can stop sharing any time.
  [Send request]  [Back]  [Cancel]
After send: SupportRequestTracker with real states and timestamps (live region).
Offline: "Saved on this device. Not sent." with [Try again]. Never shown as delivered.
```

### 9.7 Remaining screens

| Screen                    | Template | Primary action                | Key components / notes                                                                                                                                                    |
| ------------------------- | -------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account (sign-in)         | T3       | Continue securely             | Password-manager friendly, paste allowed, no puzzle CAPTCHA, no needless code transcription (WCAG 3.3.8)                                                                  |
| Care profile              | T3       | Save care profile             | Only ask what a feature needs; no disability questions                                                                                                                    |
| Report reader (Bujhi)     | T3       | Confirm extracted information | `ReportVerifier`; steps: Upload → Extract → Check values → Read explanation → Choose record → Save                                                                        |
| Wellness                  | T2       | Save check-in                 | `WellnessCheckIn`; history without judgmental scoring                                                                                                                     |
| Find care (Poth)          | T1/T2    | View facility                 | Filter row + list first; map optional; `FacilityCard`                                                                                                                     |
| Urgent guidance (Shonket) | T4       | Request human support         | Reviewed content only; reachable in one action from anywhere; no LLM in the path                                                                                          |
| Provider portal           | T5       | Acknowledge request           | Demo banner; queue table (mother, request type, **preferred contact method**, received, status); detail shows only consented records; actions: Acknowledge, Update status |

### 9.8 State matrix (every screen needs all of these designed)

| State                    | Pattern                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------- |
| Loading                  | `StatusNotice` + skeleton of the real layout; announce once                           |
| Empty                    | One sentence + one action; never fake data                                            |
| Error                    | What failed, why (if known), what to do; field-level where possible; inputs preserved |
| Offline                  | `saved-local` text; honest "not sent" on anything outbound                            |
| Success                  | Concrete confirmation with time and destination                                       |
| Partial                  | `DraftRecovery` banner + "Save for later"                                             |
| Denied / revoked consent | Plain statement of what access ended and when; no blame                               |

---

## 10. Accessibility spec (design level)

Target **WCAG 2.2 AA**. Baseline access works with no setting enabled. Do not claim conformance until it is assessed with real assistive technology and, where possible, disabled users.

| WCAG 2.2                         | Design rule in PROHOR                                                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.4.1 Use of color               | Status, provenance, links, charts, and selection always add text, icon, or shape                                                           |
| 1.4.3 / 1.4.6 Contrast           | Text ≥ 4.5:1 (large ≥ 3:1); high-contrast overlay targets 7:1                                                                              |
| 1.4.4 / 1.4.10 Resize and reflow | Works at 200% text, at the Extra large (125%) preference on top of 200% browser zoom, and at 320px / 400% zoom; no fixed heights that clip |
| 1.4.11 Non-text contrast         | Essential borders, icons, and focus ≥ 3:1 (`--pro-control-border`, never the decorative `--pro-border`)                                    |
| 1.4.12 Text spacing              | Survives user overrides and the built-in Relaxed spacing preference; Bangla line-height already 1.75                                       |
| 1.4.13 Content on hover/focus    | Nothing essential appears only on hover; tooltips are dismissible and persistent                                                           |
| 2.1.1 / 2.1.2 Keyboard           | Every task keyboard-operable, no traps, no click-only divs                                                                                 |
| 2.4.1 / 2.4.3 / 2.4.6 / 2.4.7    | Skip link, logical order, descriptive headings/labels, visible focus                                                                       |
| 2.4.11 Focus not obscured        | Sticky header/bottom nav never hide focus (`scroll-padding`, `scroll-margin`)                                                              |
| 2.5.7 Dragging                   | No drag-only interaction; every drag has a button or keyboard path                                                                         |
| 2.5.8 Target size                | Floor 24px; **PROHOR standard 44px, primary 48px**                                                                                         |
| 2.2.1 Timing                     | No timeouts that lose data; save-and-return everywhere                                                                                     |
| 3.2.3 / 3.2.4 / 3.2.6            | Consistent navigation, identification, and **help in the same place on every page**                                                        |
| 3.3.1 / 3.3.2 / 3.3.3            | Errors identified, labels persistent, correction suggested                                                                                 |
| 3.3.7 Redundant entry            | Never ask for the same information twice in a flow; preferences and profile prefill                                                        |
| 3.3.8 Accessible authentication  | No cognitive-test CAPTCHA; paste and password managers work                                                                                |
| 4.1.3 Status messages            | `StatusNotice` uses `role="status"` / `role="alert"` sparingly and meaningfully                                                            |

Additional product rules:

- No task requires voice, hearing, sight, hover, precise gestures, or time pressure. AAC, speech, and read-aloud are additions, never the only path.
- Preference changes preserve focus, scroll position, and unsaved input.
- Charts always have a data-table alternative; images have meaningful `alt` or empty `alt`.
- Dialogs: labelled, focus trapped, `Esc` closes, focus returns to the trigger.
- Never infer disability, cognition, or decision-making ability from preferences or input method.

### 10.1 Preference-combination requirements

| Requirement                                                                       | Test                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Every theme passes AA by itself; the contrast overlay is an upgrade, not a rescue | Contrast script on all three themes with overlay off (section 4.6)                                                                                                             |
| Contrast overlay works inside every theme                                         | Same script with overlay on (7:1 text target)                                                                                                                                  |
| OS signals are honoured                                                           | `prefers-contrast: more` selects the overlay when the user's setting is "system"; `prefers-reduced-motion` reduces motion; `forced-colors: active` lets the system palette win |
| Preferences never remove access                                                   | No preference hides, disables, or relocates Urgent help, consent controls, or provenance labels                                                                                |
| Typeface never harms Bangla                                                       | Bangla glyphs render in a Bengali family in every preset; no fake bold/italic (`font-synthesis: none`)                                                                         |
| Preferences never classify the user                                               | No code path reads a preference to infer ability, cognition, or consent capacity                                                                                               |

---

## 11. Content and voice

**Voice:** warm, plain, adult. Speaks to the mother as the decision-maker. Never infantilizing, never clinical-cold, never cute.

### 11.1 Writing rules

- Sentence case. Active voice. Say what happens: "Save health entry", not "Submit".
- One action keeps one name across the flow (button "Send request" → status "Request sent" is wrong until delivery is confirmed; use the status dictionary below).
- Errors: **what happened + what to do**, non-blaming, no apologies, no vagueness. Example: "We couldn't send your request. Your draft is kept. Check your connection and try again."
- Empty states invite an action: "No health entries yet. Add your first one."
- Avoid: "normal", "safe", "healthy range" (unless a sourced, clinician-provided range), "AI diagnosed", "suffering from", "special needs", "disabled mode", "patient" in mother-facing copy.
- Use "you" and "your". In provider UI, say "mother" or "person", not "patient".
- Translate meaning, not words. Never concatenate translated fragments.

### 11.2 Vocabulary

| Use                               | Avoid                                         |
| --------------------------------- | --------------------------------------------- |
| Adjust how you use PROHOR         | Accessibility mode, special mode              |
| Recorded by you                   | Self-reported (jargon)                        |
| Clinician confirmed               | Verified (ambiguous)                          |
| Not enough approved information   | I don't know                                  |
| Delivered to demo care queue      | Sent to your doctor                           |
| Talk to a person                  | Escalate                                      |
| Urgent help                       | Emergency AI                                  |
| Colour theme, Typeface, Text size | Disability mode, Vision mode, Easy mode       |
| Saved on this device              | Saved to your profile (when it is local only) |

### 11.3 Status and label dictionary (Bangla is a draft)

Bangla strings below are drafts for the i18n files. **They require review by a native Bangla speaker and a clinician before shipping.**

| English                                      | Bangla (draft)                                       |
| -------------------------------------------- | ---------------------------------------------------- |
| Your care, your way.                         | আপনার যত্ন, আপনার মতো।                               |
| Ask PROHOR                                   | প্রহরকে জিজ্ঞাসা করুন                                |
| My health                                    | আমার স্বাস্থ্য                                       |
| My wellness                                  | আমার সুস্থতা                                         |
| Find care                                    | চিকিৎসাসেবা খুঁজুন                                   |
| Urgent help                                  | জরুরি সহায়তা                                        |
| Adjust how you use PROHOR                    | ব্যবহারের পছন্দ ঠিক করুন                             |
| Educational information, not medical advice. | এটি শিক্ষামূলক তথ্য, চিকিৎসকের পরামর্শের বিকল্প নয়। |
| Saved on this device. Not sent.              | এই ডিভাইসে সংরক্ষিত। এখনও পাঠানো হয়নি।              |
| Recorded by you                              | আপনি লিখেছেন                                         |
| Clinician confirmed                          | চিকিৎসক নিশ্চিত করেছেন                               |
| Demo data                                    | ডেমো তথ্য                                            |
| Save                                         | সংরক্ষণ করুন                                         |
| Appearance / Colour theme                    | রঙের থিম                                             |
| Text size                                    | লেখার আকার                                           |
| Typeface                                     | অক্ষরের ধরন                                          |
| Higher contrast                              | বেশি কনট্রাস্ট                                       |
| Reduce motion                                | নড়াচড়া কমান                                        |
| Reset to defaults                            | শুরুর অবস্থায় ফিরুন                                 |
| Done                                         | হয়েছে                                               |

### 11.4 Medical-content UX (non-negotiable)

- Barta, Bujhi, and Bondhon summaries never diagnose, prescribe, triage, or reassure.
- Show **source and freshness** on every clinical statement. Extracted values stay "Extracted from report. Please check" until confirmed.
- Bondhon summaries are drafts from authorized, source-labelled records only, reviewed by the mother before sending.
- Never invent facilities, accessibility features, appointment availability, clinical values, sources, or provider responses. Demo content is labelled "Demo".

---

## 12. Responsive behavior

| Element            | Mobile < 640                                                  | Tablet 640–1023     | Desktop ≥ 1024                      |
| ------------------ | ------------------------------------------------------------- | ------------------- | ----------------------------------- |
| Navigation         | Bottom nav (Home, My Health, Ask, Care) + top-bar Urgent help | Top nav + drawer    | 264px left sidebar                  |
| Urgent help        | Top bar, labelled, always visible                             | Same                | Same                                |
| Cards              | Stacked                                                       | 2 columns           | 2–3 columns by task, not decoration |
| Forms              | Single column, sticky action bar above keyboard               | Single column       | Single column (max 640px)           |
| Tables             | Reflow to labelled rows or scroll inside container            | Scroll in container | Full table                          |
| Barta sources      | Directly below answer                                         | Below               | Right panel                         |
| Mother / Baby      | One list with text lane labels                                | Two lanes           | Two lanes on shared date axis       |
| Access preferences | Full-height sheet                                             | Drawer              | 420px drawer                        |
| Context panel      | Folds after main content                                      | Folds               | Right panel ≥ 1280                  |

Rules: mobile-first CSS; never hide Urgent help in a submenu; soft keyboard must not cover the send control; long Bangla labels wrap; no horizontal page scroll at 320px.

Preference interplay: the breakpoint layouts above must hold at every text-size, spacing, density, and typeface combination. When Extra large text makes a bottom-nav label wrap, the bar grows taller rather than truncating labels; sidebars collapse to the tablet pattern earlier through `min-width` in `rem`, not `px`, so the layout follows text size.

---

## 13. Do and don't

### Do

- Lead every screen with the next meaningful action and one primary button.
- Use semantic tokens (`bg-pro-surface`, `text-pro-text`, `font-body`, `rounded-card`) for every colour, typeface, radius, and duration.
- Review every screen in at least the preference matrix of section 15.2.
- Show provenance on every clinical value and a source on every AI statement.
- Design and test with real Bangla strings, including long ones and mixed English terms.
- Pair every status, link, and selection with text plus an icon or shape.
- Let preferences combine freely and keep the mother's data, focus, and place when she changes them.
- Show preview-as-you-change in the panel, using real tokens.
- Mark demo data and simulated providers on screen.

### Don't

- Don't ask "Are you disabled?" or label users, modes, or themes by ability or gender, ever.
- Don't hard-code hex values, font names, ad-hoc radii, custom shadows, or `px` text sizes in feature code.
- Don't use `--pro-accent` for text, or `--pro-border` for an essential outline.
- Don't let a theme, typeface, or size choice hide, move, or disable Urgent help or consent controls.
- Don't branch layout on a preference, or remount the app tree when one changes.
- Don't show "delivered", "saved", "verified", or "confirmed" before it is true.
- Don't build streaks, scores, step targets, rankings, or "normal range" verdicts.
- Don't use disappearing toasts, hover-only content, drag-only controls, or icon-only buttons.
- Don't use italics or letter-spacing on Bangla, or synthesize bold.
- Don't read preferences to infer ability, cognition, or consent capacity.
- Don't copy the reference site's layouts, colours, or numbers; borrow patterns only.

---

## 14. Implementation

Stack: Next.js App Router, React, strict TypeScript, Tailwind CSS v4. Preferences are `data-*` attributes on `<html>` (section 2.1). They apply before first paint where possible, persist locally before sign-in, and sync to the account only with consent.

### 14.1 Files

| File                                                                                                                                 | Purpose                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `src/styles/prohor-tokens.css`                                                                                                       | **Shipped with this document.** All themes, overlays, typeface presets, scale, density, aliases, base rules |
| `src/lib/preferences/schema.ts`                                                                                                      | Types, allow-lists, defaults, `parsePreferences`                                                            |
| `src/lib/preferences/apply.ts`                                                                                                       | `applyPreferences(root, prefs)` writes the attributes                                                       |
| `src/lib/preferences/boot.ts`                                                                                                        | Inline pre-paint script (generated from the same allow-lists)                                               |
| `src/components/accessibility/PreferencesProvider.tsx`                                                                               | State, persistence, OS-signal listeners                                                                     |
| `src/components/accessibility/{AccessPreferencesPanel,QuickAdjust,ThemeSelector,FontSelector,TextSizeControl,PreferencePreview}.tsx` | UI (section 8.2)                                                                                            |
| `src/app/fonts.ts`                                                                                                                   | `next/font` declarations                                                                                    |

### 14.2 `src/styles/prohor-tokens.css` (structure)

Full file ships alongside this document (about 320 lines, generated from the verified values in section 4). Structure and the selector contract:

```css
@import "tailwindcss";

/* 1. Themes: default = Quiet Garden. Each defines ALL roles in 4.1 */
:root,
:root[data-theme="quiet-garden"] {
  color-scheme: light;
  --pro-bg: #fffcf5; /* … */
}
:root[data-theme="original-rose"] {
  --pro-bg: #fbf6f2; /* … */
}
:root[data-theme="morning-mist"] {
  --pro-bg: #f8faf9; /* … */
}

/* 2. Shared: status colours, radii, durations, shadows (from --pro-shadow-rgb), density + text-spacing defaults */

/* 3. Contrast overlay: one block per theme, declared AFTER the themes */
:root[data-contrast="more"] {
  /* Quiet Garden family */
}
:root[data-theme="original-rose"][data-contrast="more"] {
  /* Rose family */
}
:root[data-theme="morning-mist"][data-contrast="more"] {
  /* Mist family */
}

/* 4. Typeface presets: remap the five font roles */
:root,
:root[data-font="default"] {
  --pro-font-body:
    var(--font-manrope), var(--font-noto-sans-bengali), system-ui, sans-serif; /* … */
}
:root[data-font="rubik"] {
  --pro-font-body:
    var(--font-rubik), var(--font-noto-sans-bengali), system-ui, sans-serif; /* … */
}

/* 5. Text size, text spacing, density */
html[data-text-scale="large"] {
  font-size: 112.5%;
}
html[data-text-scale="extra-large"] {
  font-size: 125%;
}
:root[data-layout="compact"] {
  --pro-control-h: 2.75rem; /* … */
}
:root[data-layout="spacious"] {
  --pro-control-h: 3.5rem; /* … */
}

/* 6. @theme inline aliases → bg-pro-bg, text-pro-text, font-body, rounded-card … */
/* 7. @layer base: body, headings by role, :lang(bn), focus ring, min control height */
/* 8. Reduced motion (OS or data-motion) · 9. forced-colors */
```

Specificity contract: theme blocks and the base overlay are `:root[...]` (0,2,0); per-theme overlays are `:root[...][...]` (0,3,0) and must stay **after** the theme blocks. No rule may couple two preferences except these overlay blocks.

### 14.3 Preference model

```ts
// src/lib/preferences/schema.ts
export const THEMES = [
  "quiet-garden",
  "original-rose",
  "morning-mist",
] as const;
export const FONTS = [
  "default",
  "rubik",
  "google-sans",
  "noto-serif",
  "roboto-slab",
] as const;
export type Theme = (typeof THEMES)[number];
export type FontPreset = (typeof FONTS)[number];

export interface AccessPreferences {
  version: 1;
  theme: Theme;
  contrast: "system" | "standard" | "more";
  font: FontPreset;
  textScale: "default" | "large" | "extra-large";
  textSpacing: "standard" | "relaxed";
  layout: "compact" | "comfortable" | "spacious";
  motion: "system" | "reduce"; // can only reduce, never force more motion
  language: "bn" | "en";
  simpleLanguage: boolean; // content flag
  communication: "text" | "aac"; // content flag
  readAloud: boolean; // content flag
}

export const DEFAULT_PREFERENCES: AccessPreferences = {
  version: 1,
  theme: "quiet-garden",
  contrast: "system",
  font: "default",
  textScale: "default",
  textSpacing: "standard",
  layout: "comfortable",
  motion: "system",
  language: "bn",
  simpleLanguage: false,
  communication: "text",
  readAloud: false,
};

const pick = <T extends string>(
  v: unknown,
  allowed: readonly T[],
  fallback: T,
): T => (allowed.includes(v as T) ? (v as T) : fallback);

/** Never trust storage: validate every field, fall back per field. */
export function parsePreferences(raw: unknown): AccessPreferences {
  const r = (typeof raw === "object" && raw !== null ? raw : {}) as Record<
    string,
    unknown
  >;
  const d = DEFAULT_PREFERENCES;
  return {
    version: 1,
    theme: pick(r.theme, THEMES, d.theme),
    contrast: pick(
      r.contrast,
      ["system", "standard", "more"] as const,
      d.contrast,
    ),
    font: pick(r.font, FONTS, d.font), // intersect with AVAILABLE_FONTS at build time
    textScale: pick(
      r.textScale,
      ["default", "large", "extra-large"] as const,
      d.textScale,
    ),
    textSpacing: pick(
      r.textSpacing,
      ["standard", "relaxed"] as const,
      d.textSpacing,
    ),
    layout: pick(
      r.layout,
      ["compact", "comfortable", "spacious"] as const,
      d.layout,
    ),
    motion: pick(r.motion, ["system", "reduce"] as const, d.motion),
    language: pick(r.language, ["bn", "en"] as const, d.language),
    simpleLanguage: r.simpleLanguage === true,
    communication: pick(
      r.communication,
      ["text", "aac"] as const,
      d.communication,
    ),
    readAloud: r.readAloud === true,
  };
}
```

Preferences are **presentation values**, stored separately from medical records and consent grants. They never appear in the same table or payload as clinical data.

```ts
// src/lib/preferences/apply.ts: CSS only. No React state, no remount.
export function applyPreferences(
  root: HTMLElement,
  p: AccessPreferences,
): void {
  const set = (name: string, value: string | null) =>
    value === null
      ? root.removeAttribute(name)
      : root.setAttribute(name, value);
  const osMore = window.matchMedia("(prefers-contrast: more)").matches;

  set("data-theme", p.theme);
  set("data-font", p.font);
  set(
    "data-contrast",
    p.contrast === "more" || (p.contrast === "system" && osMore)
      ? "more"
      : null,
  );
  set("data-text-scale", p.textScale === "default" ? null : p.textScale);
  set("data-text-spacing", p.textSpacing === "relaxed" ? "relaxed" : null);
  set("data-layout", p.layout === "comfortable" ? null : p.layout);
  set("data-motion", p.motion === "reduce" ? "reduce" : null);
}
```

### 14.4 No-flash boot

Server HTML renders defaults. A small blocking script in `<head>` applies stored choices before first paint. It duplicates the allow-lists, so keep it generated from `schema.ts` and covered by a unit test.

```tsx
// src/app/layout.tsx
import { PREFERENCES_BOOT_SCRIPT } from "@/lib/preferences/boot";
import { fontVariables } from "./fonts";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      data-theme="quiet-garden"
      data-font="default"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        {/* nonce={nonce} when a CSP is enabled */}
        <script dangerouslySetInnerHTML={{ __html: PREFERENCES_BOOT_SCRIPT }} />
      </head>
      <body>
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}
```

```ts
// src/lib/preferences/boot.ts (must stay tiny, dependency-free, wrapped in try/catch)
export const PREFERENCES_BOOT_SCRIPT = `(function(){try{
var d=document.documentElement,p={};
try{p=JSON.parse(localStorage.getItem("prohor.prefs.v1")||"{}")||{}}catch(e){}
function pick(v,a,f){return a.indexOf(v)>-1?v:f}
var c=pick(p.contrast,["system","standard","more"],"system");
var more=c==="more"||(c==="system"&&matchMedia("(prefers-contrast: more)").matches);
var ts=pick(p.textScale,["default","large","extra-large"],"default");
var sp=pick(p.textSpacing,["standard","relaxed"],"standard");
var ly=pick(p.layout,["compact","comfortable","spacious"],"comfortable");
d.setAttribute("data-theme",pick(p.theme,["quiet-garden","original-rose","morning-mist"],"quiet-garden"));
d.setAttribute("data-font",pick(p.font,["default","rubik","google-sans","noto-serif","roboto-slab"],"default"));
if(more)d.setAttribute("data-contrast","more");
if(ts!=="default")d.setAttribute("data-text-scale",ts);
if(sp==="relaxed")d.setAttribute("data-text-spacing","relaxed");
if(ly!=="comfortable")d.setAttribute("data-layout",ly);
if(pick(p.motion,["system","reduce"],"system")==="reduce")d.setAttribute("data-motion","reduce");
}catch(e){}})();`;
```

If storage is blocked or throws, the app runs on defaults and the panel shows "Can't save on this device. Settings apply until you leave this page."

### 14.5 Provider and the "nothing is lost" rule

```tsx
"use client";
// src/components/accessibility/PreferencesProvider.tsx
export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [prefs, setPrefs] = useState(DEFAULT_PREFERENCES);
  const ref = useRef(prefs);

  useEffect(() => {
    // load once, after hydration
    const stored = parsePreferences(safeRead("prohor.prefs.v1"));
    ref.current = stored;
    setPrefs(stored);
    const mq = window.matchMedia("(prefers-contrast: more)");
    const onChange = () =>
      applyPreferences(document.documentElement, ref.current);
    mq.addEventListener("change", onChange); // follow the device while contrast = "system"
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const update = useCallback((patch: Partial<AccessPreferences>) => {
    const next = { ...ref.current, ...patch };
    ref.current = next;
    setPrefs(next); // panel UI only
    applyPreferences(document.documentElement, next); // CSS only: no remount, no focus loss
    safeWrite("prohor.prefs.v1", next); // try/catch inside; no analytics, no logs
  }, []);

  return (
    <PrefsContext
      value={{ prefs, update, reset: () => update(DEFAULT_PREFERENCES) }}
    >
      {children}
    </PrefsContext>
  );
}
```

Rules: never pass preferences as a `key`, never conditionally render the tree on them, never read them to gate a feature. Only `language`, `simpleLanguage`, `communication` and `readAloud` may change what is rendered, and a language change must restore drafts through `DraftRecovery`.

### 14.6 Fonts (`next/font`)

```ts
// src/app/fonts.ts
import {
  Manrope,
  Noto_Sans_Bengali,
  Noto_Serif,
  Noto_Serif_Bengali,
  Rubik,
  Roboto_Slab,
} from "next/font/google";
const swap = { display: "swap" as const };

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  ...swap,
});
export const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-noto-sans-bengali",
  ...swap,
});
export const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  ...swap,
});
export const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  variable: "--font-noto-serif-bengali",
  ...swap,
});
export const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  preload: false,
  ...swap,
});
export const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
  preload: false,
  ...swap,
});

// Google Sans: confirm availability and licence first. If it is not in next/font/google,
// self-host licensed files with next/font/local and set variable: "--font-google-sans".
// If it cannot be shipped, remove "google-sans" from FONTS so the card is not offered.
// If a family is not variable in your Next.js version, add weight: [...] for the weights in 5.4.

export const fontVariables = [
  manrope,
  notoSansBengali,
  notoSerif,
  notoSerifBengali,
  rubik,
  robotoSlab,
]
  .map((f) => f.variable)
  .join(" ");
```

Only `lang` per locale and the preference attributes are set on `<html>`; there is no per-font class switching in components.

### 14.7 Component recipes

```tsx
// Primary button: token classes only. Same markup in every theme, typeface, size, density.
<button
  type="submit"
  className="inline-flex min-h-(--pro-control-h) items-center justify-center gap-2 rounded-control bg-pro-primary px-5 font-control font-semibold text-pro-on-primary transition-colors duration-150 hover:bg-pro-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-pro-focus"
>
  Save health entry
</button>
```

```tsx
// Theme card: radio semantics, text + icon selection, preview built from the theme's own tokens.
<label className="rounded-card border border-pro-control-border bg-pro-elevated p-(--pro-pad-card) has-[:checked]:bg-pro-surface-2">
  <input
    type="radio"
    name="theme"
    value="original-rose"
    className="sr-only peer"
  />
  <span
    data-theme="original-rose"
    className="block rounded-field bg-pro-bg p-3 text-pro-text"
  >
    {/* mini preview */}
  </span>
  <span className="font-heading font-semibold">Original Rose</span>
  <span className="hidden peer-checked:inline-flex items-center gap-1 text-pro-primary">
    <CheckIcon aria-hidden /> Selected
  </span>
</label>
```

A nested `data-theme` on the preview element re-scopes the tokens for just that card, which is why every token must be defined by the theme block, not only by `:root`.

```tsx
// ProvenanceBadge: icon + text + border style, never colour alone
type Provenance =
  | "self"
  | "extracted"
  | "clinician-entered"
  | "clinician-confirmed"
  | "demo";
// Map each value to { label, icon, borderStyle, fillToken, textToken, borderToken } per section 4.4.
// Render a <span> with the icon (aria-hidden) and the visible text label.
```

### 14.8 Migration notes

| From                                                                                                       | To                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kit `prohor-tokens.css` (Quiet Garden, Rose, Mist, one overlay)                                            | Replace with the shipped v2 file. Quiet Garden, Rose and Mist **values are unchanged**; v2 adds roles, per-theme overlays, typeface presets, density tokens, and text-spacing                           |
| Kit `data-theme`, `data-contrast`, `data-text-scale`, `data-layout`, `data-motion`                         | Same attribute names. New: `data-font`, `data-text-spacing`                                                                                                                                             |
| `--pro-space-factor`                                                                                       | Removed. Use `--pro-control-h`, `--pro-gap-*`, `--pro-pad-card`                                                                                                                                         |
| Kit body rule `font-family: var(--font-latin, "Manrope")…`                                                 | Replaced by `--pro-font-*` roles. Remove any `--font-latin` / `--font-bangla` references                                                                                                                |
| Token naming mismatches inside the kit                                                                     | `SKILL.md` lists `--pro-text-muted` and `--pro-primary-on`; `TOKENS.md` lists `--pro-accent-on`. The CSS names are authoritative: `--pro-muted`, `--pro-on-primary`, `--pro-on-accent`. Update the docs |
| `AGENTS.md` typography line ("one Bangla-capable family with a restrained Latin family")                   | Replace with: "Typography is a user preference. Use the five font roles; never name a family in feature code. See DESIGN.md section 5."                                                                 |
| `SKILL.md` "Prefer two families maximum"                                                                   | Replace with: "Two families maximum **per preset**; see DESIGN.md 5.1"                                                                                                                                  |
| `CONTRAST_REPORT.md` and `scripts/check-color-contrast.mjs`                                                | Regenerate with the pairs in section 4.6, for each theme, overlay off and on                                                                                                                            |
| Version 1 draft's Forest-only palette, `data-theme="forest"`, `--pro-clay*` tokens, gold accent retirement | Discarded. Do not implement                                                                                                                                                                             |

---

## 15. Quality gate

Use `docs/design-system/QA_CHECKLIST.md` as the full list. Preference-driven specifics:

### 15.1 Contrast in CI

Extend `scripts/check-color-contrast.mjs` with every pair in 4.6 for **each theme, overlay off and on**. Any regression fails the build. Re-run when a token changes.

### 15.2 Preference matrix (screenshot and review)

Review Welcome, Adjust panel, Dashboard, Barta, Mother and baby health, Human support, and the Provider portal in each row.

| #   | Theme                 | Contrast                                                  | Typeface    | Text size   | Spacing  | Layout      | Other                                  |
| --- | --------------------- | --------------------------------------------------------- | ----------- | ----------- | -------- | ----------- | -------------------------------------- |
| 1   | Quiet Garden          | standard                                                  | Default     | 100%        | standard | comfortable | Bangla and English                     |
| 2   | Original Rose         | standard                                                  | Default     | Large       | standard | comfortable |                                        |
| 3   | Morning Mist          | standard                                                  | Rubik       | 100%        | standard | compact     |                                        |
| 4   | Quiet Garden          | standard                                                  | Google Sans | Extra large | standard | spacious    |                                        |
| 5   | Original Rose         | more                                                      | Noto Serif  | 100%        | standard | comfortable |                                        |
| 6   | Morning Mist          | standard                                                  | Roboto Slab | 100%        | relaxed  | comfortable | Bangla                                 |
| 7   | Quiet Garden          | more                                                      | Default     | 100%        | standard | comfortable | Reduce motion                          |
| 8   | Morning Mist          | more                                                      | Noto Serif  | Extra large | relaxed  | spacious    | Bangla, 200% browser zoom, 320px width |
| 9   | any                   | any                                                       | any         | any         | any      | any         | `forced-colors: active`                |
| 10  | no stored preferences | OS `prefers-contrast: more` + `prefers-reduced-motion` on |             |             |          |             | Defaults follow the device             |

### 15.3 Preference-change behaviour

- Type in a form (and tick a consent box), change **each** preference in turn: values, focus, scroll, and route must survive.
- Reload and sign in: preferences persist; sync stays off until switched on.
- Block storage: the app works on defaults; the panel says it cannot save.
- Throttle network and reload with each non-default stored theme: no flash of the default theme or size before paint; no hydration warnings.
- Toggle contrast on and off: the stored theme is unchanged.
- Block web fonts: each preset falls back to a system font with Bangla still rendering; no layout break.
- Urgent help is visible, labelled, and in the same place in every matrix row.

### 15.4 General

- **Bangla stress test:** longest label in every button, tab, and badge; mixed Bangla/English strings; shaping, line breaks, clipping.
- **Score 1–5 per screen:** task clarity, visual craft, accessibility, localization, safety, privacy, responsiveness, working implementation, **preference resilience**. Any score below 4 is fixed or documented.
- **Status honesty:** every feature and screen in a PR is labelled Working, Limited, Simulated, or Future.

---

## 16. Agent prompt guide

### 16.1 Invariants (always preserve)

1. One shared, task-first UI. Never classify users by ability or create "standard/personalized" tiers.
2. **Colour, typeface, text size, spacing, density, and motion are user preferences.** Use only `--pro-*` tokens, Tailwind aliases, and font roles from section 5. No hex values, font names, `px` text sizes, ad-hoc radii, shadows, or durations in feature code.
3. Every theme works on its own with the overlay off, and the overlay works inside every theme. Never couple one preference to another.
4. `--pro-accent` is decorative (once per screen); text in that family uses `--pro-accent-strong` or `--pro-on-accent`; essential outlines use `--pro-control-border`.
5. Components request roles (`font-display`, `font-heading`, `font-body`, `font-control`, `font-record`). Bangla uses a Bengali family through the stack; no italics, no letter-spacing on Bangla.
6. Preferences change CSS variables only. Never branch layout on them, never remount on change, never lose a draft, focus, or scroll position.
7. Every clinical value has a `ProvenanceBadge`; every AI statement has a real `SourceTag` or the "not enough approved information" state.
8. Status text must be true: `delivered` and `acknowledged` require backend confirmation. Offline means "Saved on this device. Not sent."
9. Urgent help is a labelled button in the same place on every screen, in every preference combination, and works without AI.
10. Targets ≥ 44px at 100% text (primary 48px), visible 3px focus ring, keyboard-complete, 320px reflow.
11. No streaks, scores, normal/abnormal verdicts, or AI diagnosis, triage, prescription, or reassurance.
12. Consent is explicit, granular, revocable, and reviewed. Private diary and AI chats are never shared by default. Preferences are never shared with providers or analytics.
13. Demo data and simulated providers are labelled on screen.

### 16.2 Prompt template for new screens

> Use PROHOR `DESIGN.md` v2. Build **{screen}** for **{user job}** using template **{T1–T5}**. List the primary action, entry and exit, and the module(s) involved. Use semantic tokens, font roles, and the component catalog in section 8 (reuse before creating). Provide mobile (390px) and desktop (1280px) layouts, all states from section 9.8, keyboard order, screen-reader labels, Bangla and English copy (mark Bangla as draft), provenance and consent behavior, and a status label (Working / Limited / Simulated / Future). **Show it in at least rows 1, 4 and 8 of the preference matrix (section 15.2) and state what changes per row.** Flag any medical-content or privacy risk. Do not invent data, sources, facilities, or provider responses.

---

## 17. Open decisions and assumptions

| #   | Decision / assumption                                                                                                                                  | Recommendation                                                                                                              | Needs                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1   | **Default palette:** kit's Quiet Garden values (verified here) instead of version 1's fixed blueprint Forest                                           | Keep. If the exact blueprint hexes are wanted, add them as a fourth theme via 4.8                                           | Product owner               |
| 2   | **Derived roles** (`surface-2`, `primary-hover`, `on-primary-muted`, `accent-strong`, `shadow-rgb`) and the **per-theme overlay values** are new in v2 | Approve, or adjust and re-run the contrast script                                                                           | Designer                    |
| 3   | **Typeface presets:** five options, including Roboto Slab and Noto Serif as full-UI choices                                                            | Keep Default P0; ship the others only if time allows (cheap, but each needs Bangla review)                                  | Owner + designer            |
| 4   | **Google Sans** availability, licence, Next.js export name, and Bangla coverage are unverified                                                         | Verify before building. If it cannot ship, hide the preset rather than substituting                                         | Developer                   |
| 5   | **Text size steps:** 100 / 112.5 / 125% may not be enough for low vision                                                                               | Consider a fourth step (150%) and test layouts at it                                                                        | Designer + testers          |
| 6   | **Text spacing** preference is a proposed addition to the kit                                                                                          | Keep as P1; it maps directly to WCAG 1.4.12                                                                                 | Owner                       |
| 7   | **Preference sync default**                                                                                                                            | Off until the mother turns it on                                                                                            | Owner                       |
| 8   | **Bangla vs Latin numerals**                                                                                                                           | Bangla digits in prose/dates, Latin digits for clinical values with units                                                   | Clinician + native reviewer |
| 9   | **Bangla copy** in section 11.3 is draft                                                                                                               | Native-speaker and clinician review                                                                                         | Team                        |
| 10  | **Wordmark and mark** not designed                                                                                                                     | Design from the brief in section 3.3                                                                                        | Designer                    |
| 11  | **Photography/illustration** sourcing and rights                                                                                                       | Use labelled placeholders until approved                                                                                    | Team                        |
| 12  | **Dark mode** not specified; all themes are light                                                                                                      | Future. It would be a fourth `data-theme` with its own overlay, following 4.8                                               | Owner                       |
| 13  | **Free colour/font pickers**                                                                                                                           | Future. Cannot guarantee contrast; would need automatic checks                                                              | Owner                       |
| 14  | **Welcome marketing sections** beyond the four tasks (evidence, consent, providers)                                                                    | P1; include for the demo if time allows                                                                                     | Owner                       |
| 15  | **Device and network assumptions** (mid-range Android, unreliable connection)                                                                          | Validate with real users and a font-payload measurement                                                                     | Team                        |
| 16  | **Hackathon scope**                                                                                                                                    | Ship P0: three themes, overlay, text size, density, motion, language, persistence. Typeface presets and text spacing are P1 | Team                        |

**This document does not claim:** WCAG certification, clinical validation, completed AAC or full Bangla localization, real provider integration, or working backend behavior. Everything here is a proposal until built and tested.

## 18. Public homepage exception (route `/` only)

The homepage is a marketing and storytelling surface. For `/` ONLY, these rules
override sections 3.2, 4.9 and 7.3. App screens keep the original rules.

- Allowed: one soft gradient per section background built from theme tokens
  (e.g. `--pro-bg` to `--pro-surface`), layered rounded panels, and subtle
  glass-style cards over photos. Not allowed: neon, purple, or non-token colours.
- Accent: `--pro-accent` may appear up to 3 times per viewport as highlights.
- Section rhythm: alternate three backgrounds (`--pro-bg`, `--pro-surface`, and
  ONE deep `--pro-primary` band with `--pro-on-primary` text). Never two
  adjacent sections on the same background.
- Section spacing: `py-20 md:py-28`. Container `max-w-6xl mx-auto px-5 md:px-8`.
  Nothing may touch a section edge.
- Type: hero headline clamp(3rem, 7vw, 5.5rem); section headings
  clamp(2rem, 4vw, 3.25rem); body 1.125rem; secondary text uses `--pro-muted`,
  never smaller than 1rem.
- Imagery: provided raster photos/illustrations from /public/images are allowed
  (alt text required, no baked-in text). Product previews are built as real
  HTML/CSS phone and browser frames using the existing tokens.
- Status labels: shown only in the "Prototype status" section and on mockup
  frames as one small "Preview" tag. Do not badge every card.
- Eyebrows: no numbered or all-caps eyebrows.
- Motion: gentle scroll-in fade/translate (opacity and transform only, under
  320ms) is allowed; fully disabled under reduced motion.
