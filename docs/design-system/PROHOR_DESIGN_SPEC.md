# PROHOR design system — working specification (NOT final `design.md`)

## 1. Brand and positioning
PROHOR | প্রহর — *Your Care. Your Way.* An inclusive, Bangla-capable maternal and child healthcare platform. One accessible app with optional, independently combinable interaction preferences. The app integrates eight modules: Adapt, Barta, Shonket, Jibonrekha, Bujhi, Shusthota, Poth and Bondhon. Do not split users by disability or infer needs from diagnosis.

## 2. Product experience: direct tasks first
**Public landing:** language; “What would you like to do?” links to Ask PROHOR, Find Care, My Health, My Wellness, and a clearly visible “Adjust how you use PROHOR.” Public education and facility info should not demand sign-in if no private record is involved. Private records need authentication. Urgent-care reviewed guidance is findable immediately.
**Returning authenticated user:** continue recent task, next appointment if recorded, mother/baby record shortcuts, Ask PROHOR and help. Show source and freshness of data.
**Access preferences:** available on first page, top header and each critical task. Quick adjustments (text size, theme, contrast) and detailed communication/navigation choices. Accessible baseline never requires preference setup.

## 3. Design principles
1. **Dignity and autonomy:** accessible without stereotyping, infantilizing, or implying lower care quality. Address the mother, not her companion, except when the mother directs otherwise.
2. **Evidence and provenance:** medical content marked as educational, verified, self-reported, extracted or clinician-confirmed; never display week-specific fetal values as if measured.
3. **Progressive disclosure:** show the next meaningful action; avoid 24 feature buttons on the first screen.
4. **Continuity:** preserve unsaved entries across theme, text, interaction, orientation and route changes where practical.
5. **Predictability:** common navigation and information hierarchy across modules, roles and devices.
6. **Strong defaults + user control:** accessible in the default state, themes and additional access tools optional.
7. **Low-bandwidth realism:** provide visible offline/sync status, retry, and manual fallback without false success states.

## 4. Visual standards
**Style:** premium organic editorial minimalism; warm ivory, botanical greens, controlled warm accents, clean typography, restrained illustration. Use asymmetry only where it improves hierarchy. Avoid excessive icon cards, gradients, transparent glass surfaces, busy chart dashboards and decorative noise.
**Theme:** Quiet Garden as proposed default. Alternative candidates Original Rose and Morning Mist. Contrast boost separate from appearance theme. Exactly one shared component library/structure.
**Grid:** mobile 1 column; tablet responsive 2; desktop content max ~1200px, 12-column layout when useful; most forms single-column even on desktop. Content-first breakpoints rather than pixel-perfect reproductions.
**Whitespace:** 4px base; section gaps 24–48px; card padding 16–24px; dashboard content placed by user task rather than symmetric decoration.
**Elevation:** use border and soft tonal surfaces before box shadow; shadows only when differentiating layered surfaces. Focus outlines must not rely on shadows alone.
**Shapes:** fields 12px radius, cards 16px, large callouts 24px. Avoid arbitrarily mixing radii.
**Images:** diverse adult Bangladeshi mothers and clinicians depicted respectfully, with accurate assistive devices when shown; images secondary to content. No image-only instructional text. Accessible alt text if informative.

## 5. Components
**Top bar:** brand, contextual page title, Bangla/English, Access settings, account, notifications (no private previews by default).
**Navigation:** mobile core destinations Home, My Health/Journey, Ask, Care; other actions surfaced through clear links; desktop sidebar may expose more but labels remain recognizable. Shonket urgent guidance available through consistent help path.
**Button:** primary CTA only once per dominant action area; secondary/quiet alternatives and destructive confirmation. Verbs over vague “Submit.”
**Field:** visible label, optional hint, clear unit, input constraints, error text and correction; preserve values when validation fails.
**Status:** avoid green/amber/red-only indicators; words such as “Not sent,” “Saved on this device,” “Delivered,” “Acknowledged,” each with actual semantics.
**Report:** source file reference, extraction confidence/uncertainty marker, editable fields, verification before saving. Visual charts have data table alternatives.
**AI answer:** question, response, source references with distinguishable retrieval provenance, uncertainty/limitations, human help option; do not mimic a doctor's diagnosis.
**Permission review:** recipient, exact fields, reason, expiry/revocation information where relevant, active confirmation before sharing.
**Dialog:** labelled title, close control, keyboard/focus management, no inaccessible custom scroll trap.

## 6. Content and localization
Use friendly but adult language. Avoid “normal,” “special,” “suffering from,” or assigning disability types during onboarding. Provide “Adjust how you use PROHOR” rather than “Which kind of mother are you?” Translate meaning, not word-for-word. For Bangla, test rendering and line breaks, numeric units, date formats, screen-reader pronunciation, and longer CTA text. Do not overwrite clinician-provided wording when simplifying it; offer parallel reviewed explanations.

## 7. Safety and scope
The MVP is an **AI-assisted educational and care-coordination prototype**, not a diagnostic device, clinician substitute or emergency response system. Put actual reviewed urgent guidance before AI chat. Do not imply a request reaches a real professional unless it does; a hackathon provider must be named simulated/demo. Use synthetic data and protect permissions even in demo.

## 8. Implementation and sign-off
Reuse semantic token CSS, accessible React/TS components, Tailwind v4, and the repository `AGENTS.md`. All core paths need loading, empty, error, retry, offline and success states. Verify at least two different access pathways complete the same core care task; test with people with disabilities when available and document gaps. Do not issue a final `design.md` until the product owner approves specific typography, spacing and theme choices.

## 9. Key screen deliverables
1. Unified welcome / task selection
2. Optional Access Preferences with live preview
3. Accessible authentication + small care-profile form
4. Dashboard / continue task
5. Jibonrekha mother + baby linked timeline
6. Barta grounded Bangla AI with visible evidence
7. Bujhi upload → extract → verify → explain
8. Shusthota optional private check-in and diary
9. Poth verified directory (list first, map optional)
10. Shonket urgent-reviewed guidance + human request
11. Bondhon consent review + provider queue
12. Provider read/acknowledge screen for authorized demo account

For each screen specify: task, primary action, responsive layout, keyboard order, SR labels, validation, loading/empty/error/offline/success states, provenance, privacy and cross-module transitions.
