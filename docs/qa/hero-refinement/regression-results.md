# Regression results

Final production-build run on 15 November 2026: **30 passed, 1 failed** in 1.2 minutes.

Command: `npm.cmd run test:e2e -- --workers=2 --output=tmp/hero-verification`, with `PLAYWRIGHT_CHANNEL=msedge` and `PROHOR_TEST_URL=http://127.0.0.1:3113`.

All six hero checks passed. Both asset/reload checks passed. The full homepage reflow check passed, including 320px, 200% Bangla, spacious layout and relaxed spacing. Full-page axe, navigation, keyboard focus, theme combinations, local previews and offline feedback also passed their configured tests.

The remaining failure is in `tests/homepage.spec.ts:146`, in “complete phrases never duplicate and drafts survive live controls, language and preferences.” Its exact label selector is `Higher contrast ? independent of theme`, while the actual control label in `HomePreferences.tsx:100` is `Higher contrast · independent of theme`. The test times out looking for the question-mark version before completing the rest of that journey. This is a stale selector; this run does not establish whether all later assertions in that test pass.

That selector belongs to the concurrently edited preferences/care coverage. The user explicitly requested those edits be left untouched. It was therefore recorded rather than changed. [Failure screenshot](preferences-selector-failure.png).

The transient hero entrance overflow found during earlier runs was fixed with horizontal clipping at the hero boundary. The final suite's full reflow test and the hero's sampled animated Bangla/200% checks both passed. The asset test's old hero selectors were updated to the replacement HTML/CSS scene and passed reload/back-navigation verification.

`lint`, `typecheck`, and the optimized production build passed. Lint retains one existing warning in `postcss.config.mjs`. [Visual evidence, contrast values, and untested assistive technologies](README.md).
