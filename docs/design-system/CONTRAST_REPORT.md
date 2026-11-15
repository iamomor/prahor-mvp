# PROHOR — automated candidate palette checks

This report checks **only selected pairs**; it does **not** certify WCAG conformance of full screens. Ratios use WCAG relative luminance. Non-text borders are tested at 3:1 as a project rule for essential control identification; contextual exemptions may apply.

| Theme | Pair | Foreground | Background | Ratio | Target | Result |
|---|---|---|---|---:|---:|---|
| quiet-garden | Body text | `#23352D` | `#FFFCF5` | 12.66:1 | 4.5:1 | PASS |
| quiet-garden | Muted text | `#4A6358` | `#FFFCF5` | 6.37:1 | 4.5:1 | PASS |
| quiet-garden | Text on surface | `#23352D` | `#E6F2E9` | 11.27:1 | 4.5:1 | PASS |
| quiet-garden | Primary button label | `#FFFFFF` | `#2F6B54` | 6.26:1 | 4.5:1 | PASS |
| quiet-garden | Accent text | `#23352D` | `#F4C96B` | 8.29:1 | 4.5:1 | PASS |
| quiet-garden | Control border on background | `#5C7468` | `#FFFCF5` | 4.93:1 | 3:1 | PASS |
| original-rose | Body text | `#432C36` | `#FBF6F2` | 11.84:1 | 4.5:1 | PASS |
| original-rose | Muted text | `#62535B` | `#FBF6F2` | 6.73:1 | 4.5:1 | PASS |
| original-rose | Text on surface | `#432C36` | `#F2DFE4` | 9.96:1 | 4.5:1 | PASS |
| original-rose | Primary button label | `#FFFFFF` | `#70445A` | 7.88:1 | 4.5:1 | PASS |
| original-rose | Accent text | `#432C36` | `#E8BAC7` | 7.43:1 | 4.5:1 | PASS |
| original-rose | Control border on background | `#75616D` | `#FBF6F2` | 5.31:1 | 3:1 | PASS |
| morning-mist | Body text | `#17373B` | `#F8FAF9` | 12.17:1 | 4.5:1 | PASS |
| morning-mist | Muted text | `#4C6161` | `#F8FAF9` | 6.28:1 | 4.5:1 | PASS |
| morning-mist | Text on surface | `#17373B` | `#DFEEEE` | 10.69:1 | 4.5:1 | PASS |
| morning-mist | Primary button label | `#FFFFFF` | `#075B67` | 7.77:1 | 4.5:1 | PASS |
| morning-mist | Accent text | `#17373B` | `#E8B3C0` | 7.07:1 | 4.5:1 | PASS |
| morning-mist | Control border on background | `#4E6C70` | `#F8FAF9` | 5.41:1 | 3:1 | PASS |

## Required follow-ups
Check secondary colored states, link text, selected/pending/disabled controls, focus outlines, chart strokes, severity labels and interactive controls in actual renderings. Stronger contrast and OS forced-colors require separate functional review.
