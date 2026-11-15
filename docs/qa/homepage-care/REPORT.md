# PROHOR homepage: companion cards and support flow

Verified 15 November 2026 (Asia/Dhaka). These changes cover the two requested homepage sections. The only styling outside them is the explicitly requested shared font role for sample and status tags. AGENTS.md and DESIGN.md were not edited.

## What changed

- A 12-column bento uses Barta/Shonket at 7/5 columns and Adapt/Bondhon at 5/7, with a 20px gap and equal desktop heights. Mobile uses one column.
- **Font edit:** default card titles use Fraunces 600 at 24px; support-step titles use Fraunces 600 at 20px. Descriptions use Manrope 500 at 15–16px and 1.55 line height. JetBrains Mono 500 is loaded through `next/font/google`, Latin subset, `display: swap`, for the new `font-tag` role at 13px. The four alternative presets use their body font for that role. Bangla uses Noto Sans Bengali. Existing section headings retain their display font.
- Mini screens show sample education, sources, warning signs, truthful request statuses and mother-controlled sharing. Decorative screens have accessible summaries and inert contents, so their controls cannot call, send, share or revoke anything.
- Adapt's local preview changes its own text size, theme and contrast. AAC buttons select a sample phrase; read-aloud is opt-in and announces unavailable/error states. These controls do not update page preferences, storage or care records.
- The dark panel has four steps and a connecting line. Its first entrance draws the line in 1.2 seconds with 120ms step staggering. OS or application reduced motion keeps everything static and visible. The observer handles tall, resized layouts without requiring a fixed percentage of the entire panel to fit in the viewport.

## User journey and states

The public visitor's job is to understand the product and try access preferences without signing in or entering personal health information. Entry is normal homepage scrolling or module/how-it-works anchors. The primary interactive path is Adapt's local controls. Success is a visibly changed sample with the rest of the page and an existing visit-question draft preserved. Unsupported speech, missing Bangla voices and speech errors produce readable status text. Every task also works without speech.

The component tree is `CompanionStory → four module cards → decorative Preview / interactive AdaptPreview`, and `SupportStory → heading → four ordered steps`. Existing module anchors are retained for cross-module navigation. Screen-reader summaries identify synthetic care examples; button pressed states, switch state, persistent labels and live status text describe Adapt's controls.

**Working:** local text scaling, local appearance/contrast, phrase selection, keyboard controls, responsive layout and motion preferences. **Limited:** read-aloud depends on browser support and installed voices; audible English/Bangla output was not evaluated. **Prototype:** education, warning-sign presentation, consent, audit log, request statuses and provider acknowledgement. No backend delivery or clinical review is represented as live. **Future:** actual authorized care sharing and provider workflows.

## Verification

| Check | Result |
| --- | --- |
| `npm.cmd run lint` | Pass: zero errors; one existing warning in `postcss.config.mjs` about an anonymous default export |
| `npm.cmd run typecheck` | Pass |
| `npm.cmd run build` | Pass: production compilation, TypeScript and all 17 generated pages |
| Focused Playwright suite, `tests/homepage-care.spec.ts` | **5 passed**, 19.4 seconds, against the isolated production snapshot |
| Keyboard-only sample interaction | Pass: text size, theme, contrast and AAC selection; focus and typed visit-question draft retained |
| Scoped axe scans | Pass: three page themes × two contrast settings, three local theme previews, and enlarged Bangla |
| Reflow | Pass: changed sections at 320, 360, 390, 430, 768, 1024 and 1440px with 200% Bangla text, relaxed spacing and spacious layout |
| Reduced motion / forced colors | Pass in browser emulation; steps visible and connector static |
| Typography | Pass: Fraunces 600 titles, Manrope 500 descriptions, JetBrains Mono tags and body-font mapping for all four alternate presets |
| Small text | Minimum **13px** across every screenshot configuration |
| Equal desktop cards | All four **723.42px** tall in each theme and contrast combination |
| Support heading at 1440px | **Two lines** in every theme/contrast combination |
| Screenshot/runtime assets | 24 captures; no page errors, failed Next assets or section overflow |

The screenshot script measures text, including inert decorative content, against its composited ancestor backgrounds. This complements axe, which intentionally excludes decorative content.

| Page theme | Lowest measured text contrast | With higher contrast |
| --- | --- | --- |
| Quiet Garden | 4.69:1 | 6.26:1 |
| Original Rose | 5.61:1 | 6.26:1 |
| Morning Mist | 5.37:1 | 6.26:1 |

The minimum in higher-contrast captures includes Adapt's independently selected normal-contrast sample palette. The root page preference never overwrites that local preview.

## Evidence and limitations

[Open the 24-image gallery](index.html). Each of the three themes has both sections at 1440px and 390px, with normal and higher contrast. Four `matrix-*.png` contact sheets place Quiet Garden, Original Rose and Morning Mist left to right; normal contrast is the top row and higher contrast the bottom row. [Raw measurements](measurements.json) include fonts, sizes, heights, contrast and runtime errors.

Concurrent builds were replacing the shared `.next` assets during an initial broad test/capture attempt. That attempt was interrupted and its captures replaced. Final evidence comes from a separate production snapshot at `D:/prohor-care-preview-20261115`, served on port 3011. SHA-256 comparisons confirmed that the changed section components, stylesheet, token file and route font configuration match the repository source. A full repository-suite pass is **not** claimed: older tests also contain roadmap/navigation/hero expectations outside this task's two-section scope.

Native NVDA/JAWS, VoiceOver, Braille displays, physical touch devices, audible speech and testing with mothers with different access needs were not performed. Automated checks and semantic summaries do not establish clinical validation or WCAG certification. No new medical claims, facilities, clinicians or provider responses were invented.

Self-review (1–5): hierarchy 4, typography 5, responsiveness 4, keyboard task completion 4, error resilience 4, trust/consent 4, source integrity 4, code quality 4. Clinical validation and native assistive-technology coverage remain separate validation work.
