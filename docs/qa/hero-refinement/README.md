# PROHOR homepage hero review

15 November 2026 · Windows · Microsoft Edge / Playwright · production build at `http://127.0.0.1:3113`.

[Open the theme and timing gallery](index.html). Choose 0s, 1s, 2.5s or 5s to compare the three themes at 1440px and 390px. Mobile images show the entire hero; sticky navigation and the skip link are hidden only while taking those cropped screenshots. Desktop screenshots include the existing navigation.

| Theme | Desktop, complete entrance | Mobile, complete entrance | Higher contrast |
| --- | --- | --- | --- |
| Quiet Garden | [1440px](quiet-garden-1440-2500ms.png) | [390px](quiet-garden-390-2500ms.png) | [Desktop](quiet-garden-1440-contrast-more.png), [mobile](quiet-garden-390-contrast-more.png) |
| Original Rose | [1440px](original-rose-1440-2500ms.png) | [390px](original-rose-390-2500ms.png) | [Desktop](original-rose-1440-contrast-more.png), [mobile](original-rose-390-contrast-more.png) |
| Morning Mist | [1440px](morning-mist-1440-2500ms.png) | [390px](morning-mist-390-2500ms.png) | [Desktop](morning-mist-1440-contrast-more.png), [mobile](morning-mist-390-contrast-more.png) |

Reduced motion: [desktop](quiet-garden-1440-reduced-motion.png), [mobile](quiet-garden-390-reduced-motion.png). [Bangla at 320px and 200% text size](quiet-garden-320-200-percent.png).

The user's job is to understand PROHOR and choose a public next step without an account. The hierarchy is eyebrow → headline → Bangla tagline → definition → two navigation actions → five capability pills → account-free reassurance. “Explore PROHOR” reaches `#features`; “See how it works” reaches `#how-it-works`. Existing offline messaging and public destinations remain responsible for their existing states.

**Working:** hero copy and localization, semantic navigation links, shared rounded Button, sample scene animation, pause/resume, hover/focus pause, and OS/site reduced motion. **Prototype:** everything displayed inside the phone and floating cards. The scene does not fetch health data, send a care request, change consent, or imply provider acknowledgement.

The component structure is `HeroStory` → `Button` × 2 + `HeroProductScene` → `ProductPhone`, four decorative cards, and a separate native pause button. The image has one short accessible description; all sample internals are hidden from assistive technology and contain no focus targets. Keyboard focus remains on the toggle when its label changes. Theme changes preserve pause state. The site's preference and OS reduced-motion signals independently disable motion and keep Home visible.

All colors come from existing `--pro-*` tokens. Fraunces remains the default display font; English hero copy uses Manrope and Bangla scene text uses Noto Sans Bengali. No font binaries were added. Outside the hero, this task changes only button radii. Concurrent navigation/care work was explicitly confirmed by the user and left untouched. `AGENTS.md` and `DESIGN.md` were not edited.

The sample question and answer illustrate person-centred care; their source is the existing [WHO antenatal-care guideline, 2016](https://www.who.int/publications/i/item/9789241549912), checked against the publisher's page. The source chip is decorative; actual source links in the rest of the site retain their existing behavior. No individualized medical advice or clinical measurements were added.

Validation:

- `npm.cmd run lint`: no errors; one existing `import/no-anonymous-default-export` warning in `postcss.config.mjs`.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run build`: passed; all 17 routes generated.
- Hero tests: six checks cover copy/navigation, the entrance and three-screen cycle, matching accent rings, keyboard pause/resume, hover/focus pause, OS/site reduced motion, responsive layout, and axe in all six theme/contrast combinations.
- Existing asset tests were updated for the replacement hero card and verify reload, back navigation, and stale-worker recovery.
- Text contrast was also measured inside the decorative scene, which axe deliberately ignores. Minimums: Quiet Garden 5.44:1 / higher contrast 9.89:1; Original Rose 6.18:1 / 10.85:1; Morning Mist 6.28:1 / 10.43:1. [Measured text pairs](contrast.json). Reproduce with `node scripts/check-hero-contrast.mjs`.
- The scene's reserved width/height stays constant at all four captured animation times. Desktop phone: 260px wide, 9:19, 6px bezel. CTA height: 48px; horizontal padding: 24px; radius: 999px. [Measurements](measurements.json).
- At 320px, the entrance is clipped at the hero boundary so horizontal slide-in motion cannot create a page scrollbar. Animated Bangla and 200% text are included in the hero regression test.

The capture script samples actual CSS animations using the Web Animations API; it does not change their keyframes. It produces 33 hero screenshots: 24 requested theme/width/timing combinations, six higher-contrast views, two reduced-motion views and one 320px/200% view. Reproduce with `node scripts/capture-hero-refinement.mjs` and `PROHOR_TEST_URL` pointing to the production preview.

Accessibility trees were inspected: [desktop](hero-accessibility-1440.yml), [mobile](hero-accessibility-390.yml). Keyboard input and axe were tested in Edge. NVDA, VoiceOver, physical touch devices, Safari, and actual 400% browser zoom were not manually tested; 320px reflow was tested. This is not a claim of WCAG certification or clinical validation. Bangla wording still benefits from a fluent content review.

Design review scores: task clarity 5/5, hierarchy/typography 4/5, responsive behavior 4/5, keyboard/semantic access 4/5, localization 4/5, safety/provenance 4/5, privacy 5/5. Real assistive-technology and user validation remain necessary.

Full-suite status and any remaining failures are recorded in `regression-results.md`.
