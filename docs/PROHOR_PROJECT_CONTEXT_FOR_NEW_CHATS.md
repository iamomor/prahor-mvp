# PROHOR | প্রহর — Master Project Context for New AI Chats

**Purpose:** Paste or attach this document at the start of a new ChatGPT, Codex, or Claude conversation. It provides authoritative project context without requiring the full conversation history.

**Context date:** 14 November 2026. **Project type:** Bangladesh-focused, inclusive maternal and child healthcare web application and installable PWA, developed for the International AI Builders Congress / CloudCamp Bangladesh hackathon. **Status:** Product architecture and requirements are defined; implementation status of any particular module must be verified from the current repository. Nothing in this context file proves a capability is working.

> **Instructions to the next AI assistant:** Treat this as background, not a request to implement the entire product. Follow the user's *current* task and scope precisely. Do not conflate the public marketing homepage with the authenticated healthcare application. Do not assume planned features are implemented, invent clinical claims, or modify protected design files without explicit permission. If the user asks for code, first inspect the actual repository. If the user asks for a prompt, give a prompt—not a completed app.

## 1. Identity, mission, and why it exists

- **Name:** PROHOR | প্রহর.
- **Official product description:** Universal Adaptive AI Maternal & Child Care Ecosystem.
- **Tagline:** *Your Care. Your Way.* / *আপনার যত্ন, আপনার মতো।*
- **Audience:** Adult mothers in Bangladesh across pregnancy, postpartum recovery, and early motherhood, including mothers with visual, hearing, communication, motor, cognitive, sensory, or overlapping access needs; authorized clinicians/community health workers and consented supporters are additional roles.
- **Mission:** Make maternal and child health information, connected records, wellness support, and access to human care understandable and usable across abilities, communication methods, locations, and stages of motherhood.
- **Problem:** Pregnancy information, records, appointments, reports, and human support are often fragmented. Bangladesh presents significant differences in connectivity, language access, health literacy, and care availability. Common interfaces may introduce additional barriers for some mothers. These are product motivations, not measured impact claims.
- **What PROHOR is NOT:** Just a pregnancy tracker; just a chatbot; a separate disability-specific app; just a fitness/mental-health tracker; just a hospital booking site; or an AI doctor.
- **Differentiation:** One cohesive, inclusive, accessible-by-default care journey spanning adaptive interaction, source-grounded education, mother and baby longitudinal records, report understanding, daily wellness, care navigation, and mother-controlled human support. No single component should be portrayed as unprecedented; the proposed connected experience is the distinction.

**Core design/product rule:** *PROHOR adapts the interaction method, not a mother's healthcare rights or access to features.*

## 2. Locked product decisions

1. **One unified application** for all mothers. Retire public choices labeled “Standard Care,” “Personalized Care,” “Normal Mother,” “Disabled Mother,” and disability-category onboarding.
2. **Task-first entry:** People should be able to discover care-related tasks immediately without completing a disability questionnaire or a lengthy profile.
3. **Accessible by default:** Keyboard operation, screen-reader semantics, readable contrast, text alternatives, predictable forms, and non-voice pathways exist before settings are enabled.
4. **Optional, independent preferences:** A mother can mix appearance and interaction choices; no theme or AAC choice is tied to an inferred disability or assumed cognitive ability.
5. **Eight integrated modules** and **24 original long-term capabilities**. The 24 are a roadmap/inventory, not a claim that 24 features are built during a short hackathon sprint.
6. **Mother and baby records remain clinically distinct**, even when shown along one longitudinal care timeline.
7. **Evidence and provenance are visible:** Personal observations, extracted report fields, clinician-entered facts, and clinician-confirmed facts are distinguished.
8. **No unvalidated clinical AI:** The initial system is educational and supportive, not an autonomous diagnostician, medication prescriber, or medical triage service.
9. **Consent-controlled data sharing:** Family and provider access is explicit, scoped, revocable, audited, and enforced server-side. A mother retains decision-making autonomy regardless of access preferences.
10. **Bangla-first, English-supported**, accessible mobile-first web app and PWA built for responsive screens.
11. **Clinical and provider demo transparency:** Synthetic health data and simulated providers must be labeled; never portray them as real doctors, real delivery, or verified outcomes.

## 3. Eight modules — role, features, and AI involvement

Priority convention: **P0** = essential intended MVP, **P1** = restricted/expanded MVP if time permits, **P2** = longer-term, requires extra evidence/validation. **These are planning priorities, not current implementation status.**

### 01 — Adapt (অ্যাডাপ্ট): Universal Access & Interaction Engine
**Purpose:** Changes *how* every other module is used; does not diagnose or classify disability.

- **P0:** Semantic/keyboard/screen-reader baseline; Bangla/English; text size and readable spacing; independent theme and contrast; layout density/spacing; reduced motion; persistent reading and interaction preferences.
- **P1:** Reviewed simpler Bangla, picture-and-text AAC composition, supported read-aloud, guided multi-step tasks, expanded preference controls.
- **P2:** Broader external assistive-input/switch/speech compatibility testing.
- **AI:** Low or optional; accessibility must not depend on AI. Critical medical wording cannot be rewritten without review.
- **Cross-cutting:** Preferences persist across all modules without resetting unsaved drafts, focus, route, or consent.

### 02 — Barta (বার্তা): Evidence-Grounded Bangla AI Companion
**Purpose:** Helps mothers understand educational maternal-health content and prepare for consultations.

- **P0:** Bangla question entry; curated source retrieval/RAG; source-linked educational explanation; explicit insufficient-evidence/abstention state; accessible answers.
- **P1:** Consultation-question preparation; AAC-generated questions after user approval; optional Bangla voice input and read-aloud; permission-controlled history.
- **P2:** Expanded reviewed postpartum content.
- **AI:** Core/important. A language model plus source retrieval explains approved information. Sources must be real and actually retrieved; never fabricate citations. No diagnoses, prescriptions, self-certifying clinical reassurance, or risk-classification claims.

### 03 — Shonket (সংকেত): Maternal Safety & Human Assistance
**Purpose:** Reviewed warning-sign guidance and understandable, accessible communication of concerns to humans.

- **P0:** Clinician-reviewed urgent-warning information; prominent help path not dependent on AI; text/structured concern reporting; accessible human-help requests; precise request status (not sent/submitted/delivered/acknowledged/responded); preferred contact method.
- **P1:** Concern history; user-reviewed summaries for human communication.
- **P2:** Clinical signal detection/decision support only with separate professional validation and governance.
- **AI:** Not necessary for safety. Do not force a mother through chatbot triage before urgent-help information. Never mark an unsent request as delivered.

### 04 — Jibonrekha (জীবনরেখা): Connected Mother & Baby Health Records
**Purpose:** Continuity of pregnancy, maternal conditions, documented baby information, visits, and postpartum care.

- **Maternal P0:** Pregnancy timeline; dated measurements with units; clinician-confirmed maternal conditions stored with source; symptoms/notes; appointments; chronological history.
- **Maternal P1:** Verified report linkage; record of clinician-prescribed medications/instructions without altering them.
- **Maternal P2:** Expanded postpartum recovery.
- **Baby P0:** Separate linked fetal/baby record.
- **Baby P1:** Clinician-documented fetal assessments/concerns, baby-movement observations, report linkage.
- **Baby P2:** Newborn growth, visits, vaccination records, longitudinal newborn care.
- **Condition examples for record keeping:** Gestational diabetes, pregnancy-related hypertension, anemia, existing conditions documented by a clinician. The platform stores facts, not diagnoses generated from user measurements.
- **AI:** Optional verified record summaries, never essential to storage integrity.

### 05 — Bujhi (বুঝি): Accessible Medical Report Understanding
**Purpose:** Help users extract and understand supported document information without losing accuracy.

- **P1 first limited implementation:** Upload supported PDF/image; OCR/extraction of selected text/values/units; mark confidence/uncertainty; user/authorized reviewer edits; plain-language terminology explanation with approved sources; accessible structured view; select mother/baby record; save only after verification.
- **P2:** Broader report formats and more comprehensive document support.
- **Workflow:** **Upload → Extract → Review → Explain → Save to correct record.** Never silently turn OCR into clinician-confirmed clinical facts.
- **AI:** Core for flexible extraction and explanation, constrained by validation and human confirmation.

### 06 — Shusthota (সুস্থতা): Physical, Daily-Life & Emotional Well-being
**Purpose:** Voluntary, respectful wellness logging that works for different abilities and circumstances.

- **P0:** Private mood check-in; energy/fatigue; activity of varying types; rest/sleep observations; private diary/reflection; all skippable.
- **P1:** Optional hydration/habits; ability-aware activity choices; history; professionally reviewed relaxation information; explicit optional provider sharing.
- **P2:** Non-diagnostic AI trend summaries; medically reviewed individualized activity plans where appropriate.
- **Inclusion:** Walking, wheelchair use, assisted activity, resting, or not logging are all valid. No compulsory step targets, streak guilt, body comparisons, or unreviewed pregnancy exercise prescriptions.
- **Privacy:** Diary is private by default, not auto-shared with family, caregivers, or providers.

### 07 — Poth (পথ): Accessible Healthcare Navigation
**Purpose:** Find care with useful service, communication, and verified accessibility information rather than distance alone.

- **P1:** Facility directory/filtering; location-aware discovery where available; accessible list view; verified/not-verified accessibility fields; reliable contact options; available appointment request pathways; visit-preparation checklist.
- **P2:** Referrals, supported telemedicine integration, feature-phone SMS/low-bandwidth fallbacks.
- **AI:** Minimal/optional. Directory and bookings should be honest standard software features. Never invent facilities, their accessibility features, or appointment slots.

### 08 — Bondhon (বন্ধন): Mother-Controlled Care Coordination
**Purpose:** Consent-based links among mother, selected supporters, and authorized providers.

- **P0:** Care request submission; authorized demo provider follow-up queue; acknowledged/pending statuses based on real backend evidence; explicit preferred communication method.
- **P1:** Granular consent to selected records; supporter permissions that are limited and revocable; permitted longitudinal provider view; activity/audit history; user-verified AI-assisted care summary.
- **P2:** Inclusive mother community; provider note automation; cohort assistant; privacy-preserving aggregate analytics.
- **AI:** Optional drafting from *authorized, source-labeled* facts. Permissions and delivery must not depend on AI. Never auto-share diary or AI chat history.

## 4. Original 24 capabilities and final module mapping

01. Universal Accessibility Profile → Adapt.
02. Bangla Multimodal AI Companion → Barta.
03. Evidence-grounded Maternal RAG → Barta.
04. Maternal Safety & Human Handoff → Shonket + Bondhon.
05. 40-week Pregnancy Tracker → Jibonrekha.
06. Vitals & Baby Movement Logging → Jibonrekha.
07. AI Report & Prescription Reader → Bujhi; extracted text requires verification.
08. Accessible Diary & Notes → Shusthota.
09. Accessible Appointments → Poth.
10. Maternal Facility Map & Referral → Poth.
11. Inclusive Mothers' Community → Bondhon, **future**.
12. Consent-based Family Link → Bondhon.
13. Feature-phone SMS Fallback → Poth, **future**.
14. Emotional Support Companion → Shusthota (retire old public name “Moner Sathi”).
15. Accessible Telemedicine → Poth, **future**.
16. Postpartum & Early Motherhood Support → Jibonrekha + Shusthota.
17. Doctor/CHW Follow-up Queue → Bondhon.
18. Per-mother Health Timeline → Jibonrekha.
19. Cohort AI Assistant → Bondhon, **future**.
20. Evidence & Protocol Overlay → Barta.
21. District-level Aggregate Analytics → Bondhon, **future**.
22. Voice-to-SOAP Provider Notes → Bondhon, **future**.
23. Clinical Signal Auto-flags → Shonket, **future pending clinical validation**.
24. Accessible Care Continuity & Audit → Bondhon.

Additional mother/baby condition records and inclusive movement/wellness features belong within the eight modules; do not invent additional modules solely for those items.

## 5. One coherent user journey

1. **Discover PROHOR** in a public, accessible, bilingual homepage. No disability declaration.
2. **Choose a task**: Ask PROHOR, My Health, My Wellness, Find Care, or Human Support.
3. **Optionally adjust interaction** at any time: appearance, text, AAC/read-aloud when supported, language, spacing, motion. Defaults already work with common assistive technology.
4. **Sign in just in time** when accessing or saving private information; public educational content and public service information should not demand a personal medical profile.
5. **Create/review a pregnancy record** in Jibonrekha, showing source, date, units, and mother/baby separation.
6. **Ask an educational question** in Barta; review real retrieved sources or an explicit insufficient-evidence message.
7. **Optionally upload a supported report** through Bujhi; inspect/correct extracted values before choosing where to save.
8. **Record optional wellness information** in Shusthota; diary stays private.
9. **Find care and prepare for a visit** using Poth, with verification status on facility/access information.
10. **Express a concern/request support** via Shonket + Bondhon; review what is shared, choose contact method, and see accurate queue state.
11. **Authorized provider** sees only consented data; requests may be marked acknowledged only after corresponding action occurs.
12. **Continue after childbirth** using linked but distinct mother/newborn records and wellness history.

**Signature hackathon demonstration:** Two fictional mothers—one using conventional touch/text, another using keyboard and optional AAC—complete the same meaningful care journey in the same application, with equal records, services, and consent rights. The second scenario is not a different “disabled mode.” Use clearly labeled synthetic records and simulated provider accounts.

## 6. UX architecture, visual standards and public homepage

### Public information vs authenticated application

**Public area:** Homepage, product/about, how it works, feature explanations, inclusion/accessibility, trust/responsible AI, and educational/public care info where implemented. This is *not* the authenticated mother dashboard.

**Mother's workspace:** Dashboard, Mother & Baby Health, Ask PROHOR, Wellness, Reports, Appointments/Find Care, Human Support, Preferences.

**Provider workspace:** Separate *role-authorized* dashboard for requests and consented records, not a different mother app.

### Crucial current scope distinction for the project manager

**Omor owns two separate workstreams**:
- **A. Public marketing website:** Exceptional original homepage and pre-login informational pages presenting the *whole* PROHOR product, its Bangladesh problem, adaptive accessibility, eight modules, AI, trust, roadmap, and connected journey. **This does not mean Omor must implement the other teammates' modules.**
- **B. Day-1 shared boilerplate:** Set up the *entire repository's structural foundation*: Next.js/TypeScript/Tailwind, PWA, app route groups, eight module folder boundaries, shared types/contracts, Supabase integration skeleton, branch/PR workflow, CI and deployment plan. This does not mean Omor writes all feature implementations.

**Homepage inspiration:** https://www.maacare-ai.me/ only for high-level product storytelling (strong promise, human context, demonstrated benefits, clear sequencing, trust, calls to action). **Do not copy its image, hero arrangement, code, branding, clinical triage claims, or other layouts.** A prior generated homepage was rejected because it used a competitor-like image, tiny text, repetitive pale card sections, too many equal-weight explanations, and weak visual hierarchy.

**Preferred visual direction:** Original premium modern editorial minimalism; polished human-centered composition, bold but readable typography, sophisticated whitespace, art-directed maternal imagery, convincing real product previews, visually varied sections, and impeccable mobile rendering. Research/reference images include a 12-page uploaded design-source PDF and a preferred minimalist UI image. These are inspiration for craftsmanship only, not palettes, code, or copied screens. Avoid too many identical rounded tiles and endless copy.

**Public homepage narrative:** Problem in Bangladesh → Why PROHOR → One care experience with different interaction methods → Connected maternal/baby journey → Eight modules organized into meaningful groups → AI and evidence → Mother-controlled human support and privacy → Working/simulated/future capabilities → Clear invitation. Cover all eight modules and account for 24 capabilities without making 24 huge cards. Explain functionality accurately. Optimize the **first impression** for mothers and hackathon judges.

### Design system and tokens

User has built `AGENTS.md`, `DESIGN.md`, PROHOR Premium UI/UX skill (`SKILL.md`), and `prohor-tokens.css`. **Treat the actual attached/repository versions as authoritative. Do not silently rewrite these files.** The v2 draft design materials describe:
- Three independently selectable themes: **Quiet Garden** (default), **Original Rose**, **Morning Mist**.
- Higher-contrast overlay independent of theme; retain the original chosen hue family.
- User preferences for text scale, typography preset, text spacing, density, motion, and language; AAC/read-aloud/simpler-language are separate content/interaction options.
- Typography roles rather than hard-coded font names inside individual components; robust Bengali glyph shaping and `lang` tags.
- Theme tokens such as `--pro-bg`, `--pro-surface`, `--pro-text`, `--pro-primary`, `--pro-on-primary`, `--pro-control-border`, `--pro-focus` rather than arbitrary hex values.
- Accessible-by-default behavior; target WCAG 2.2 AA; ordinary text contrast at least 4.5:1, essential non-text at least 3:1, 44–48px comfortable targets, visible keyboard focus, 200% text and 400% zoom/reflow, reduced motion, screen readers, and accessible Bangla/English.
- The design documentation and CSS have undergone revisions. **Inspect the files in the current repo** before claiming the exact presets/tokens are final. Do not assume a prior generated `DESIGN.md` is approved; the product owner criticized previous visual outputs. A screenshot-ready quality bar matters more than simply passing lint.

## 7. Technical architecture

- **Frontend:** Next.js App Router, React, TypeScript strict, Tailwind CSS v4, responsive mobile-first web app.
- **PWA:** One installable application with manifest, icons, safe service worker scope and offline fallback. Do not cache confidential records/diary/provider data on shared devices without adequate privacy engineering. Do not advertise offline healthcare synchronization or notifications unless implemented.
- **Backend:** Next.js server routes/functions and Supabase PostgreSQL with row-level security; Supabase Auth or equivalent.
- **AI:** Server-side orchestrated hosted model, curated indexed references and RAG for Barta; supported OCR/extraction with review for Bujhi; optional non-diagnostic summaries.
- **Testing:** TypeScript, lint, build, Playwright end-to-end, axe-core automated a11y plus actual keyboard/screen-reader/zoom checks, negative auth/RLS checks, controlled Bangla AI test questions.
- **Deployment:** Managed Next.js host with staging and production; document environment variables; no client-exposed service-role or AI keys.
- **Collaboration:** One GitHub repo, protected `main` release branch, reviewed `develop` integration branch, separate branches and small PRs for each teammate.

### Suggested boundaries

`src/app/(marketing)` public pages; `src/app/(auth)` sign-in; `src/app/(mother)` private experience; `src/app/(provider)` role-based provider; `src/app/api` routes; `src/features/{adapt,barta,shonket,jibonrekha,bujhi,shusthota,poth,bondhon}` module code; `src/components/{ui,layout,marketing,accessibility,pwa}` reusable components; `src/server/{auth,database,ai,permissions,services}`; `src/lib/{supabase,validation,utils}`; `src/styles/prohor-tokens.css`; `src/i18n` Bangla/English; `supabase/migrations`; `tests/{unit,integration,e2e,accessibility}`; `docs/{architecture,api,team,design-system}`; `public/{images,icons,pwa}`. Avoid duplicate home routes: only one `page.tsx` should resolve to `/`.

### Main entities/contracts

`user_profiles`, `access_preferences`, `pregnancy_records`, `maternal_conditions`, `health_observations`, `baby_records`, `medical_documents`, `wellness_entries`, `appointments`, `facility_directory`, `support_requests`, `consent_grants`, `knowledge_sources`, `audit_events`.

Clinical provenance enum: **self-reported**, **document-extracted**, **clinician-entered**, **clinician-confirmed**; retain timestamps, units, identifiers, and source references.

Possible API boundaries: profile, preferences, health records, wellness, AI educational chat, report extraction, facility directory, care requests, provider request queue. Actual route names must be agreed by the team before implementation; they are not automatically live because they appear in a specification.

## 8. Five-person team and ownership

Project manager and primary platform developer **Omor** speaks for the product in some chats.

| Team member | Primary responsibility | Integration relationship |
|---|---|---|
| **Omor** | Project management, repo foundation/boilerplate, public homepage and pre-login content, platform architecture, auth/security, PWA, care-request backend integration, staging/release, API contracts | Establish shared foundation and unblock others, not code every module |
| **Iftee** | Inclusive UI/accessibility (Adapt), shared app components and frontend consistency | Collaborates with Omor's marketing UI and all module owners |
| **Ifty** | Barta AI/RAG, source retrieval, report-extraction intelligence for Bujhi | Omor provides secure service/API integration; Apubo owns report review UI |
| **Apubo** | Jibonrekha, pregnancy/maternal/baby health models and record UI, Bujhi review interface | Works with Omor on schema/auth and Ifty on extraction contracts |
| **Samin** | Shusthota wellness, Poth facility/care navigation, Shonket/Bondhon user-facing interactions | Works with Omor on support-request persistence and provider handoff |

**Git flow:** `member-branch` → PR reviewed → `develop` (integration) → approved release PR → `main`. Avoid direct development on `main`; protect shared files; review relevant API contracts before merging. Example branch names: `omor-platform`, `iftee-frontend`, `ifty-ai`, `apubo-health`, `samin-services`.

## 9. Six-day working plan / release coordination

The conversations contain both a **six-day implementation sprint** and an earlier **seven-day plan** with an extra submission day. Treat the current practical working target as **six build/test days**, and confirm the actual competition submission deadline separately; never silently assume an extension.

| Day | Omor/platform responsibilities | Team-wide target |
|---|---|---|
| **Day 1 – Foundation** | Next.js + PWA repo setup; preserve design docs/tokens; initial marketing structure; shared route/module folders; Git branches and CI; API contracts and env templates | All five can clone/run locally, know their folders and first deliverables |
| **Day 2 – Core services** | Auth, Supabase, initial migrations, row-level security, typed service boundaries | Individual module UIs/forms begin integrating with shared contracts |
| **Day 3 – Vertical slice** | Integrate health observation, real educational AI endpoint if ready, support request and simulated provider queue; inspect permissions | First demonstrable mother → record → educational AI → human support flow |
| **Day 4 – Integration/PWA** | Mobile install behavior, safe offline fallback, AI error paths, security/integration help | Modules connect; accessibility preferences work across journeys |
| **Day 5 – Feature freeze** | PR merges, staging deployment, test/bug triage, authorization and AI checks | Stable release candidate, no new risky features |
| **Day 6 – QA/release** | Final accessible mobile testing, security checks, smoke tests, deployed demo, rollback/tag | Truthful one-page summary, three-minute demo, documented evidence and limitations |

**Project management rule:** Day 1 establishes foundations; it does not require Omor to build the full product. After Day 5, fix broken user journeys instead of introducing features.

## 10. CloudCamp / hackathon positioning

- **Domain:** HealthSphere AI.
- **Previously recommended challenge:** **PersonalMD**, because personalized longitudinal health records, tailored interaction preferences, privacy, and educational AI fit the current architecture. **CareAnywhere** is a meaningful alternative emphasizing geographical access, low bandwidth, safe human handoff and virtual care; do not claim those capabilities without implementation. The actual registered challenge may be fixed; confirm before writing submission materials.
- **Product title:** PROHOR — Universal Adaptive AI Maternal & Child Care Ecosystem.
- **Proposed submission materials from an earlier check:** one-page structured summary and three-minute concept/prototype video; source disclosure, team/project information and truthful AI evidence; repo/deployment links, architecture and tests are useful supporting materials. **Reverify current official rules/deadlines when needed**, as these are time-sensitive and not fully confirmed here.
- **Judging story:** *Why mothers face barriers → why connected inclusive care is needed → what changes with PROHOR → demonstrate two interaction methods completing the same task → show actual evidence-grounded AI and careful document verification → show mother-controlled human support → state tested results/limitations.*
- **Avoid claims:** reduced maternal mortality, clinical diagnostic accuracy, real provider partnerships, certified accessibility, verified facility properties, or real appointment availability unless evidence exists.

## 11. Design and engineering QA rules

- Every theme must pass contrast requirements on its own; stronger contrast cannot be a rescue for inaccessible defaults.
- Test responsive layout at 320, 360, 390, 430, 768, 1024, 1280, 1440px and at increased zoom/text sizes. No clipped Bangla or hidden controls.
- Keyboard order, focus visibility, screen-reader headings, alternative text, and disclosure/multi-step focus behavior are first-class.
- Health measurements require units, dates, source/provenance. Every claim of 'saved', 'delivered', 'acknowledged' must match real storage/transport state.
- No AI answer without valid evidence should masquerade as medical fact. Abstain and direct users to appropriate professional help where necessary.
- Provider permissions enforced server-side and with tested RLS, not merely by hiding UI. Use synthetic health data for demonstrations.
- Document true status per feature as **Working / Limited / Simulated / Future**; nothing in the master blueprint indicates completed implementation.
- Homepage creative QA: hero original (do not recycle MaaCare assets), typography and image art-direction coherent, 1–2 signature visual moments, not 14 identical cards, readable normal-size copy, strong mobile responsive composition. Inspect actual screenshots and iterate instead of trusting source code alone.

## 12. How to use this context in a new conversation

A good opening message is:

> **Use the attached `PROHOR_PROJECT_CONTEXT_FOR_NEW_CHATS.md` as the project background. I am Omor, PROHOR's PM/platform developer. My current task is: [describe one specific task]. Follow the existing repository's `AGENTS.md`, `DESIGN.md`, `SKILL.md`, and `prohor-tokens.css`, don't silently edit them, and leave teammates' module code alone unless requested. If something in this context is a plan rather than verified implementation, say so.**

Possible specific tasks:
- “Help me implement the premium **public homepage only** with original product storytelling; no internal modules.”
- “Help me create **Day-1 Next.js/PWA boilerplate and module folder boundaries only**; don't build module features.”
- “Review our Barta API evidence handling and source attribution.”
- “Audit Jibonrekha/Bondhon request permissions using two synthetic accounts.”
- “Update only the design token usage, not the token definitions.”

**Scope discipline:** This file explains the full product so AI tools know the context. It does **not** authorize doing the entire project in response to a narrow request.
