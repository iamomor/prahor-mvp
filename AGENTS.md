# AGENTS.md — PRAHORAR (প্রহর)

Applies to every coding agent (Codex, Claude Code, Cursor, Windsurf, Antigravity, others).

## Read first, in this order
1. `README.md`, shared TypeScript types, DB schema, API contracts.
2. `design.md` — the **only** source for UI: colors, type, spacing, components, navigation, copy rules, access modes.
3. `PRAHORAR_Project_Context_Handoff.md` — scope and safety boundaries.

If these conflict, stop and ask Omar. Do not resolve conflicts by choosing yourself.

## Product in one line
PRAHORAR: disability-first, Bangla/English maternal-care PWA. Accessibility is built into every module, not a separate feature. Track: CareAnywhere (recommended, pending official confirmation).

## Decision status
- The Warm Clinical Editorial palette has been selected by the owner in principle. The synchronized v0.4 document set is presented for final approval; until Omar locks `design.md`, existing implementation must not be assumed to have migrated.

## Scope rules
- Build only your assigned module on your feature branch.
- Do not edit shared types, schema, API contracts or `design.md` without Omar's approval. Owner approval-in-principle of the palette is not permission to implement before the final design-file lock.
- Do not add features, dependencies, backend services (no FastAPI/microservices) or architecture patterns beyond what is assigned.
- Stack: Next.js App Router, TypeScript, Tailwind + controlled components, Supabase (Postgres, Auth, private Storage, `@supabase/ssr`), Zod, server-side LLM calls, Vercel, PWA.

## UI rules (from design.md)
- Use only design tokens. No hard-coded hex, font sizes, radii or shadows.
- **Palette proposal (not yet locked):** Warm Ivory `#F7F4EC`, Deep Forest `#244638`, Accessible Teal `#147D78`, Restrained Coral `#D97865`, as described in the v0.4 proposal in `design.md`. Do not implement this revised palette until Omar explicitly locks the updated `design.md`. Design frame remains 360×800 first.
- Red (`danger`) is only for the UrgentBanner; never use Deep Forest for emergencies. Restrained Coral is decorative only and must not be used for text, meaningful icons, focus, controls or actions on Warm Ivory (2.80:1 contrast).
- Every screen: Bangla and English, 360 / 768 / 1280 widths, 200 % text size, keyboard operable, visible focus, 48 px targets, loading / error / empty states.
- No gradients, glassmorphism, emoji icons, fake stats or charts, "Normal/Good/Bad" labels on health data.
- Do not invent new colors or components. If one seems needed, stop and ask.

## Safety rules (non-negotiable)
- AI must not diagnose, prescribe, change medication, predict complications, or triage emergencies.
- No psychiatric diagnosis or risk score. Self-harm or immediate-danger content must route to a human/emergency pathway defined by professionals, not AI-only handling.
- Clinical content is curated, versioned and cited. Never invent sources or reviewers.
- OCR/report values require mother confirmation.
- Public demo uses synthetic data only, always labelled.
- Never claim a feature is complete, integrated or tested unless it actually is. Do not claim real hospital, CHW, ambulance, SMS carrier or telemedicine integration. Do not claim WCAG certification.
- Maturity labels: Implemented / Prototype-Limited / Planned.

## Security
- Service-role and AI keys server-side only; never `NEXT_PUBLIC_*`.
- RLS plus server-side ownership checks. Consent is explicit and revocable.
- Private file storage, no public URLs. Do not cache private health data in the service worker.
- Minimize logging; never log raw health narratives. Rate-limit AI and file endpoints.

## Definition of done
Works end to end with real data flow; types, lint and relevant tests pass; loading/error/empty states exist; responsive and accessible per `design.md`; acceptance criteria met.

## Final report format
List files changed, commands/tests actually run with results, known limitations, and integration steps. Do not report anything as done that you did not run.
