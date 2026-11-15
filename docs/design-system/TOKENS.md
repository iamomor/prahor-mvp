# PROHOR design tokens — provisional foundation

The brand palette can have multiple **appearance themes** while sharing one coherent layout, hierarchy, component library and healthcare service. **Accessibility controls are independent of theme.** Tokens are proposed until product review. Do not claim whole-product compliance from pairwise color contrast alone.

## 1. Three candidate themes

| Role | Quiet Garden — default candidate | Original Rose | Morning Mist |
| --- | --- | --- | --- |
| Background | `#FFFCF5` | `#FBF6F2` | `#F8FAF9` |
| Surface | `#E6F2E9` | `#F2DFE4` | `#DFEEEE` |
| On-background text | `#23352D` | `#432C36` | `#17373B` |
| Muted text | `#4A6358` | `#62535B` | `#4C6161` |
| Primary button | `#2F6B54` | `#70445A` | `#075B67` |
| On-primary text | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| Accent | `#F4C96B` | `#E8BAC7` | `#E8B3C0` |

**Measured example WCAG contrasts:** White on Quiet Garden primary 6.26:1; Rose primary 7.88:1; Mist primary 7.77:1; Quiet Garden deep green on ivory 12.66:1; deep green on pale mint 11.27:1; on soft yellow 8.29:1. Values apply only to these pairs, not entire themes. Do not use white text on the soft yellow accent (1.57:1).

## 2. Semantic roles
- `--pro-bg` application background; `--pro-surface` nested cards; `--pro-elevated` interactive surfaces.
- `--pro-text` headings and body; `--pro-muted` secondary information (still normal text contrast).
- `--pro-primary` / `--pro-primary-on` primary action pair; `--pro-accent` decorative/highlight only; `--pro-accent-on` accessible text.
- `--pro-border` visible separators; `--pro-control-border` essential control outline; `--pro-focus` strong focus ring.
- `--pro-success`, `--pro-warning`, `--pro-danger` + text labels for clinical/nonclinical state; no relying on color alone.
- `--pro-radius-*`, `--pro-space-*`, `--pro-shadow-*`, `--pro-duration-*` avoid feature-specific magic values.
- `data-theme` selects the appearance; `data-contrast="more"` enhances all three without erasing the stored selection.

## 3. Type system
**Bangla:** Noto Sans Bengali or a similarly legible supported Bengali family, reviewed for shaping and glyph coverage. **Latin:** Manrope or a restrained humanist equivalent. Load minimal weights (400, 500, 600, 700) and use optimized `next/font` or self-hosted assets under normal license terms. No font binaries are included in this package.

| Role | Base rem | Line-height | Typical weight |
| --- | --- | --- | --- |
| Small metadata | 0.875 (only where noncritical) | 1.45 | 400–500 |
| Body | 1.000 | 1.60 | 400 |
| Body emphasized | 1.125 | 1.55 | 500–600 |
| Card heading | 1.250 | 1.35 | 600 |
| Section | 1.500 | 1.28 | 600–700 |
| Page | 2.000–2.500 `clamp` | 1.15–1.2 | 700 |

Root font-size must remain resizeable; prefer rem, avoid disabling zoom or clipping overflow with fixed heights. Do not tightly letter-space Bengali text.

## 4. Spacing, shape, elevation
Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px. Gutter mobile 16–20px, tablet 24px, desktop 32–48px. Reading width ~60–70ch; main content usually <=1200px.
Radius: control 10px; field 12px; card 16px; hero 24px. Control height >=44px for common interactive targets; aim 48px on primary mobile controls. Build 44px+ interactions as product usability goal; WCAG 2.2 SC 2.5.8 is generally 24px minimum with exceptions.
Focus ring must remain visible against every theme and the high contrast overlay. Prefer a 2–3px solid outline and an offset, with tested contrast.

## 5. Motion
Tap feedback 120–180ms, small state transition 180–240ms, context transition up to 320ms; never delay a task for animation. Reduced-motion setting and OS preference disable unnecessary translation/zoom animations. No auto-playing audio.

## 6. Validation needed before freezing `design.md`
Check every theme, high-contrast overlay, long Bangla strings, errors, chart labels, badges, selected controls, focus, disabled states, mobile/desktop and 200/400% resizing. Measure contrast programmatically and test assistive tech manually. Do not treat decorative brand approval as a substitute for accessibility approval.
