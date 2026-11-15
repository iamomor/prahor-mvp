# Accessibility engineering — PROHOR

## Baseline contract
Target WCAG 2.2 AA; do not claim conformance from a check-list or automated scan alone. Accessibility is present in *every* route before a user opens preferences. No separate disability portal. Functional preferences serve user-selected barriers rather than medical labels; they never reduce functionality or change consent rights.

## Keyboard, navigation and input
- All links, buttons, fields and dialogs operable with keyboard alone; visible focus ring, logical tab sequence, no keyboard trap, no click-only `div`.
- Skip-to-main link, meaningful heading order, landmark regions, consistent destination labels. After a modal closes, focus returns to its trigger; errors and route changes preserve context.
- No gesture-only tasks, drag-only widgets or time-critical multi-tap sequences. Offer review/edit/Undo for consequential actions.
- Form labels persist, with required/optional state, units, examples, and error recovery. Errors must be programmatically associated and understandable without color.
- Support external AAC composition into ordinary inputs and provide simple in-app picture/text phrase composition where implemented. Do not auto-translate AAC into diagnoses or assumptions about cognition.

## Perceptual access
- Body contrast >=4.5:1, large text >=3:1, essential non-text controls/borders >=3:1 against adjacent colors as applicable; test *every* theme, state and contrast overlay.
- Essential meaning conveyed by text and structure, not solely color, icon, sound, motion or infographic.
- Data trends include accessible table of dated source-labelled values; nondecorative images have meaningful alternatives.
- Caption/transcript alternatives to pre-recorded audio/video. Do not require voice calling. Read-aloud opt-in; prevent overlapping screen-reader audio.
- Support resize to 200%; reflow at 320 CSS px equivalent / 400% zoom with exceptions for truly two-dimensional data. Long Bengali labels must wrap.

## Cognitive / learning / sensory access
- Plain, adult-appropriate wording; optional reviewed simplified Bangla, without removing safety information or overriding source data.
- Predictable navigation, focused task panels, clear progress, saved drafts, identifiable back/skip, confirmation, repeatable instructions and no arbitrary timeouts.
- Reduced motion by default when OS requests it, optional app override that can only reduce movement; animations never convey critical meaning alone.
- Avoid automatic sound and unexpected keyboard focus shifts. Let users disable unneeded notifications.

## Deafblind / combined access needs
Semantic text, correct labels and DOM order create the basis for screen reader and braille display compatibility; test with actual assistive tech and people when available. Don't advertise complete deafblind support from semantic HTML alone. Combined visual, motor, speech and cognitive preferences must remain independent.

## Authentication and privacy
Accessible authentication without puzzle-only CAPTCHA or needlessly memorizing/transcribing codes where alternatives are feasible. Support password managers and copy/paste where relevant. If a supporter assists, do not grant them access automatically. Privacy-controlled preview notifications and logged consent actions.

## Technology behavior
- HTML language declaration per active locale; mark text spans with other language when needed.
- Root theme and preference values should apply before the page flashes in an unsuitable theme; server-rendered preference or a minimal safe pre-paint script where used. Respect browser/OS high-contrast forced colors.
- Avoid full-page rerender that loses focus, resets input, or changes medical data whenever a presentation control changes.
- If offline, text must say “Saved on this device — not sent” versus “Delivered”; urgency/help must not depend on unverified offline dispatch.

## Manual test matrix
1. Keyboard-only welcome → Ask Barta → evidence → human help.
2. NVDA + Chrome or equivalent, VoiceOver + Safari: screen names, headings, AI answer, source links, alert states.
3. 200% text and 400% zoom; 320px viewport; Bengali long labels and mixed English terms.
4. Each of three appearance themes × normal/stronger contrast; key action, errors, charts, text and focus.
5. Reduced motion and OS forced colors; no essential movement or color-only meanings.
6. AAC/text request path; no voice requirement; message review before send.
7. Motor accessibility: no drag-only, distant controls reachable via keyboard, no precision tasks.
8. Cognitive guidance: one step at a time, remember inputs, understandable recovery.
9. Offline/reconnect: no false delivery, no lost drafts, safe retries.
10. Privacy: provider/supporter cannot read unshared notes; revoked consent actually blocks access.

## Canonical references
- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/ARIA/apg/
- https://www.w3.org/WAI/people-use-web/
- https://www.w3.org/WAI/WCAG2/supplemental/
