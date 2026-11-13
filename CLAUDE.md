# CLAUDE.md — PRAHORAR (প্রহর)

@AGENTS.md
@design.md

Claude Code specifics (everything else lives in AGENTS.md and design.md, so the rules never drift):

- Before writing UI, re-read the tokens and component list in `design.md`. Do not rely on your own default taste; generic "AI dashboard" styling is a failure here.
- Use plan mode for any task touching more than one module, and stop for Omar's approval before changing shared types, schema, API contracts or `design.md`.
- Build UI in Bangla first, then verify English. Run lint, typecheck and relevant tests before reporting.
- Report only what you actually ran. If a check could not be run, say 50
