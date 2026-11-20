**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**PROHOR  |  প্রহর** 

# **TEAM ROLES & PROJECT BLUEPRINT** 

**প াঁচ সদস্সের দ য়িত্ব, ছি য়দস্ের execution plan, সম্পূর্ণ project brief ও technical structure** 

_Your Care. Your Way._ 

#### **FINAL TEAM ASSIGNMENT — CONFIRMED BY THE USER** 

Omor অপরিবরতিত | Apurbo নেবব Iftee-এি আবেি Frontend/Design/Accessibility কাজ | Iftee নেবব Ifty-এি আবেি AI/Barta কাজ | Ifty নেবব Apurbo-এি আবেি Maternal & Baby Health কাজ | Samin অপরিবরতিত 

প্রস্ **ত** ুকৃত: ১৪ েবেম্বি ২০২৬ 

রেরি: PROHOR 6 Day Hackathon.md, PROHOR_MASTER_DEVELOPMENT_PROMPT.md এবং PROHOR accessibility blueprint PDF 

এই handbook-এ দারিবেি েতুে mapping বযবহাি কিা হবিবে। পুবিাবো ফাইবে থাকা role-owner োমগুবোবক এই েতুে mapping অেুযািী সংব াধে কিা হবিবে; module scope ও 

technical rules অপরিবরতিত িাখা হবিবে। 

PROHOR  |  1 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**START HERE** 

## **এই ডকুস্েন্ট কীভ স্ে েেেহ র করস্ে** 

এটি team handoff এবং six-day execution-এি working reference। Task owner, dependency এবং acceptance condition রমরেবি কাজ োে কিবব। 

|**অংশ**|**য়েষি**|
|---|---|
|**01**|Project briefওproduct vision|
|**02**|একটিshared product: accessibilityওuser experience|
|**03**|আটটিmoduleও েি রদবেিMVP scope|
|**04**|চূড়ান্ত প**া**চজবেিrole ownership|
|**05–09**|প্রবতযক সদবসযি সম্পূর্ি দারিে ওdeliverables|
|**10**|Shared handoffওownership matrix|
|**11–16**|Day 1নথবকDay 6: member-wise execution plan|
|**17**|Technology stackওrepository architecture|
|**18**|Routes, APIs, database ownershipওdata contracts|
|**19**|Git workflow, task board, meetingsওDefinition of Done|
|**20**|Safety, privacy, accessibilityওrelease quality gates|
|**21**|Public homepage-এি ১৫-section blueprint|
|**22**|২৪-capability long-term roadmap|
|**23**|Final demo, handoff checklistওsource notes|



### **দ য়িত্ব পয়রের্ণস্ের চূড় ন্ত য়হস ে** 

|**সদসে**|**আস্ের role owner**|**এখেক র দ য়িত্ব**|
|---|---|---|
|**Omor**|Omor|একই: Project Manager, Technical Lead, Platform Engineer|
|**Apurbo**|Iftee|Frontend, Design System, AdaptওAccessibility|
|**Iftee**|Ifty|AI Engineer, Barta, Medical InformationওBujhi extraction engine|
|**Ifty**|Apurbo|Maternal & Baby Health, JibonrekhaওBujhi review interface|
|**Samin**|Samin|একই: Wellness, Care ServicesওWorkflow|



PROHOR  |  2 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

#### **IMPORTANT: ে স্ের ে ে ে ও ownership** 

এই PDF-নত team member রহবসবব Omor, Apurbo, Iftee, Ifty এবং Samin নেখা হবিবে। Iftee ও Ifty আোদা সদসয। তাবদি েতুে দারিে ইচ্ছাকৃতোবব এবক অবেযি সবে অদেবদে কিা হবিবে; Apurbo নপবিবে Iftee-এি পুবিাবো কাজ। 

### **Source hierarchy** 

- PROHOR_MASTER_DEVELOPMENT_PROMPT.md: product vision, final architecture, 8 modules, 24 capabilities, technical and safety rules. 

- PROHOR 6 Day Hackathon.md: six-day MVP, original workload and detailed day-wise execution, API/database ownership, board and release process. 

- All_about_prohor...pdf: accessibility interaction, inclusive UX, all-module usability and error-handling blueprint. 

- Latest user instruction in this conversation: revised team ownership mapping. This supersedes the earlier member-to-role mapping only; it does not change module scope. 

PROHOR  |  3 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**01 | PRODUCT OVERVIEW** 

## **PROHOR কী?** 

Short project brief — judges, teammates এবং েতুে contributor-নদি একই োষাি project নবাঝাবোি জেয। 

PROHOR | প্রহি হবো Bangladesh-focused, universal adaptive AI maternal and child healthcare ecosystem। এটি শুধু pregnancy tracker বা generic chatbot েি। একজে মাবিি pregnancy journey, maternal health, baby records, medical report understanding, optional well-being, healthcare discovery এবং human follow-up - সবরকেুবক একটি connected care journey-নত যুক্ত কিাি েক্ষ্য রেবি ততরি হবচ্ছ। 

#### **CORE PROMISE** 

একজে মা কীোবব নদবখে, ন াবেে, নযাোবযাে কবিে, চোবফিা কবিে বা তথয process কবিে - তা রেরবিব বষ রতরে একই healthcare services বযবহাি কিবত পািববে; interaction method রেবজি প্রবিাজে অেুযািী বদোবত পািববে। 

### **PROHOR কক ে সেসে গুস্ সে ধ ে করস্র্ চ ি?** 

- Pregnancy, maternal condition এবং baby-related তথয েরড়বি-রেটিবি থাকা; সমবিি সবে record continuity হারিবি যাওিা। 

- Medical report ও health terminology সাধাির্ বযবহািকািীি জেয কঠিে হওিা। 

- Voice-only, map-only, chart-only বা small-control interface-এি কািবর্ রবরেন্ন access need থাকা মাবিি কাজ ন ষ কিবত অসুরবধা হওিা। 

- AI answer-এি evidence ো থাকা বা AI সীমাবদ্ধতা পরিষ্কাি ো হওিা। 

- পরিবাি বা provider-নক সাহাবযযি জেয যুক্ত কিবত রেবি consent ও privacy control দুবিে হওিা। 

### **Target outcome** 

**একটি deployed, responsive, installable web/PWA MVP কেখ স্ে shared mother-care journey, persistent data, real Bangla source-grounded AI interaction, meaningful accessibility এেং clearly simulated provider handoff ক জ কস্র।** 

### **Project principles** 

|**েীয়র্**|**প্রস্ি ে**|
|---|---|
|**Independence**|মা যতটা সম্ভব রেবজইtaskন ষ কিবত পািববে; preferred technologyবযবহাি কিববে।|
|**Dignity**|নকাবো বযবহািকািীবক কম সক্ষ্ম বাinferior experience-এি বযবহািকািী রহবসবব নদখাবো হবব ো।|
|**Choice**|Reading, communication, navigationওpresentation preferences independentlyনববে নেওিা যাবব।|
|**Consistency**|একইhealthcare information, action, terminologyএবংmodule structureবজাি থাকবব।|
|**Safety**|Error, poor connectivity, urgent concernওhuman handoff-এ পরিষ্কািbehaviourথাকবব।|
|**Privacy & control**|নকাে তথয,কাবক,কী উবেব যshareহবব-মা তা রেিন্ত্**র** কিববে।|



PROHOR  |  4 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**02 | SHARED EXPERIENCE** 

## **একটি PROHOR — অস্েকভ স্ে েেেহ র** 

Accessibility আোদা app বা আোদা medical entitlement েি; এটি shared product-এি built-in interaction model। 

### **কী কর ে স্ে ে** 

- “Disabled mother” বোম “normal mother” - এমে user category কিা যাবব ো। 

- পুবিাবো “Standard Care” ও “Personalized Care” োম public label রহবসবব বযবহাি কিা যাবব ো। 

- Onboarding-এ disability type ন াষর্া বাধযতামূেক কিা যাবব ো। 

- একটি preset-এ সব access need রমবট যাবব - এমে ধবি নেওিা যাবব ো। 

- Preference বদোবে অেয setting বা current form/task অপ্রতযার তোবব বদবে/হারিবি যাবব ো। 

### **Entry ও personalization model** 

প্রথবম বযবহািকািীবক healthcare task-এ প্রবব কিবত দাও। Header বা entry point-এ স্পষ্ট “Adjust how you use PROHOR” action থাকবব। বযবহািকািী চাইবে text scale, spacing, appearance, contrast, motion, language, clear-language এবং communication preferences independently বদোববে। নযবকাবো সমি preference পরিবতিে কিা যাবব। 

### **Baseline accessibility (preference setting-এর আস্েই ক জ করস্ে)** 

- Semantic HTML, keyboard navigation, screen-reader-compatible structure, meaningful labels এবং visible focus. 

- Accessible error messages, dialogs, status announcements এবং correct focus management. 

- পাঠবযােয default typography এবং Bangla/English language metadata. 

- Responsive layout, zoom/reflow এবং chart/media-ি text alternative. 

- Reduced motion এবং OS forced-colors compatibility. 

### **Independently configurable preferences** 

|**Area**|**েেেহ রক রী কী েদ  স্র্ প রস্েে**|
|---|---|
|**Language**|বাংো/ English|
|**Reading**|Text size, line/paragraph spacing, clear-language option|
|**Appearance**|Existing approved themeওhigher contrast|
|**Layout**|Compact / comfortable / spacious densityনযখাবেdesign systemসমথিে কবি|
|**Motion & comfort**|Reduced motion, reduced visual distraction|
|**Communication**|Text, supported AAC/picture composition; audio/read-aloud only where implemented|
|**Guidance**|Guided steps, optional explanationএবংhuman support|



### **Access needs ে  design ও testing-এ ধরস্র্ হস্ে** 

Blindness/screen readers, low vision, colour-vision differences, deafness, hard of hearing, deafblindness, nonspeaking/AAC, limited mobility/dexterity, tremors, cognitive and learning differences, dyslexia, ADHD/attention, autism-related sensory preferences, memory/executive-function needs, psychosocial needs, chronic illness/fatigue/fluctuating conditions এবং একারধক access need-এি combination। 

PROHOR  |  5 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

#### **প্রকৃর্ inclusion-এর প্রে র্** 

Accessibility panel নদখা েি; একজে বযবহািকািী রেবজি প্রবিাজে অেুযািী settings বযবহাি কবি profile, health record, report review, AI question এবং support request-এি মবতা বাস্তব কাজ ন ষ কিবত পািবেে রক ো - নসটাই test কিবত হবব। 

PROHOR  |  6 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**03 | PRODUCT MODULES** 

## **আটটি connected module** 

Architecture-এ আটটি module থাকবব; েি রদবে নকােটি functional core আি নকােটি limited prototype হবব, তা আোদা কবি নদখাবো হবিবে। 

|**Module**|**Purpose**|**MVP scope**|**6-day level**|
|---|---|---|---|
|**01 | Adapt**|Accessibilityও<br>communication|Shared accessibility baseline, persistent preferences,<br>theme/contrast/text/layout/motion/language, keyboard and screen-reader support;<br>optional guided steps, simple language, read-aloudওAAC.|Functional core|
|**02 | Barta**|Evidence-grounded<br>maternal AI|Bangla/English maternal education chat, approved-source RAG, real citations/source<br>metadata, uncertainty/abstention, safe limitations.|Functional core|
|**03 | Shonket**|Reviewed safetyওhelp|Clinician-reviewed warning-sign information, accessible non-voice help, structured<br>care request, selected communication method, request statusওhuman support path.|Functional core|
|**04 | Jibonrekha**|Motherওbaby health<br>records|Pregnancy profile/timeline, maternal observations, conditions with provenance,<br>editable history, distinct but linked fetal/newborn/baby records.|Functional core|
|**05 | Bujhi**|Medical report<br>understanding|One supported synthetic report upload/OCR/extraction workflow,<br>confidence/uncertainty, mandatory mother review/correction, accessible<br>explanation and authorized save.|Limited<br>prototype|
|**06 | Shusthota**|Physicalওemotional<br>well-being|Optional mood, fatigue, rest/sleep, user-chosen mobility-neutral activity, hydration,<br>private diary and user-controlled reminders.|Functional core|
|**07 | Poth**|Finding healthcare|Searchable facility directory/list, sample facility/contact details, accessibility<br>metadata marked verified or not verified; optional map only if reliable.|Limited<br>prototype|
|**08 | Bondhon**|Consent-controlled<br>care coordination|Mother-approved sharing, granular/revocable permissions, authorized simulated<br>provider queue, request status and scoped follow-up.|Functional core|



### **Module-গুস্  র েস্ধে data flow** 

মা Bujhi-নত report upload কিববে → OCR/extraction source-tagged fields ততরি কিবব → মা extracted value review/correct কিববে → অেুবমারদত field Jibonrekha timeline-এ save হবব → Barta নকবে অেুবমারদত/প্রাসরেক evidence বযবহাি কবি explanation রদবত পািবব → মা চাইবে Bondhon রদবি রেরদিষ্ট তথয share কিববে → Shonket/Bondhon request flow-এ human follow-up হবব। 

#### **Module boundary** 

Barta medical education ও source-grounded Q&A; Bujhi document extraction/review। AI extraction engine Iftee-এি দারিে, report review UI এবং health record integration Ifty-এি দারিে। 

### **একটি demo-কর্ কী কদখ স্র্ হস্ে?** 

Demo-ি পূর্ি flow: accessibility settings → pregnancy/health record save → wellness log → source-linked Bangla Barta answer → mother- 

approved support request → authorized simulated provider acknowledgement. এই flow Day 3-এ end-to-end কাজ কিবত হবব। 

PROHOR  |  7 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**04 | LONG-TERM PRODUCT SCOPE** 

## **২৪টি capability roadmap** 

এই ২৪টি capability product roadmap-এ preserve কিবত হবব। েি রদবেি prototype-এ সব capability complete হবিবে বো যাবব ো। 

|**#**|**Capability**|**Owning module**|**Indicative priority**|
|---|---|---|---|
|**01**|Universal Accessibility Profile|Adapt|P0 foundation|
|**02**|Bangla Multimodal AI Companion|Barta|P1/P2 staged|
|**03**|Evidence-grounded Maternal RAG|Barta|P0 core|
|**04**|Maternal Safety & Human Handoff|Shonket + Bondhon|P0 core flow; clinical triage future|
|**05**|40-week Pregnancy Tracker|Jibonrekha|P0 core|
|**06**|Vitals & Baby Movement Logging|Jibonrekha|P0 core / limited data|
|**07**|AI Report & Prescription Reader|Bujhi|P1 restricted prototype|
|**08**|Accessible Diary & Notes|Shusthota|P0 core|
|**09**|Accessible Appointments|Poth|P1 / where implemented|
|**10**|Maternal Facility Map & Referral|Poth|P1/P2 staged|
|**11**|Inclusive Mothers' Community|Bondhon|P2 future|
|**12**|Consent-based Family Link|Bondhon|P0 scoped consent core|
|**13**|Feature-phone SMS Fallback|Poth|P2 future|
|**14**|Emotional Wellness Companion|Shusthota|P0 limited check-in|
|**15**|Accessible Telemedicine|Poth|P2 future|
|**16**|Postpartum & Early Motherhood Support|Jibonrekha + Shusthota|P2 expansion|
|**17**|Doctor/CHW Follow-up Queue|Bondhon|P0 simulated queue|
|**18**|Per-mother Health Timeline|Jibonrekha|P0 core|
|**19**|Cohort AI Assistant|Bondhon|P2 future|
|**20**|Evidence & Protocol Overlay|Barta|P1/P2 expansion|
|**21**|District-level Aggregate Analytics|Bondhon|P2 future/governance|
|**22**|Voice-to-SOAP Provider Notes|Bondhon|P2 future/governance|
|**23**|Clinical Signal Auto-flags|Shonket|P2; clinical validation required|
|**24**|Accessible Care Continuity & Audit|Bondhon|P1/P2 expansion|



_Priority label_ গুবোেিরদবেি _plan-_ এিসবেরমরেবিসাজাবো _planning aid। Master Prompt-_ এিমূে _roadmap item_ ও _module mapping_ একইিাখাহবিবে _; actual status evidence_ অেুযািী _`planned`, `in progress`, `limited prototype`, `working`_ বা _`validated`_ হবব। 

PROHOR  |  8 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**05 | FINAL TEAM STRUCTURE** 

## **চূড় ন্ত প াঁচজস্ের ownership** 

সববচবি গুরুেপূর্ি revision: Apurbo, Iftee এবং Ifty-এি কাজ েতুেোবব assign হবিবে। রেবচি mapping-ই এই handbook-এি সবিত্র অেুসির্ কিা হবিবে। 

|**সদসে**|**চূড় ন্ত role**|**প্রধ ে ownership**|
|---|---|---|
|**Omor**|Project Manager + Technical<br>Lead + Platform Developer|Architecture, shared platform/backend, Auth, Supabase, RLS, PWA, API contracts, care-<br>request backend, integration, deployment, Git/review, project management.|
|**Apurbo**|Frontend + Design System +<br>Accessibility Lead|Adapt, shared UI components, public/welcome/dashboard shell, navigation, responsive<br>layout, accessibility preferences, Bangla/English typography and accessibility testing.|
|**Iftee**|AI Engineer + Medical<br>Information Lead|Barta, approved knowledge inventory, RAG retrieval, Bangla AI responses, real source<br>citations, abstention/safety, restricted Bujhi extraction engine and AI evaluation.|
|**Ifty**|Maternal & Baby Health<br>Engineer|Jibonrekha, pregnancy timeline, maternal conditions, observations, baby records, health<br>forms, Bujhi report-review/verification UI and health-data integrity.|
|**Samin**|Wellness + Care Services +<br>Workflow Developer|Shusthota, Poth sample directory, Shonket help UI, Bondhon provider queue UI, end-to-<br>end workflow testing, failure scenarios and demo coordination.|



### **Handoff-এর য়র্েটি গুরুত্বপূর্ণ কজ ড়** 

|**কে ক জ**|**প্রথে owner**|**ে র সস্ে handoff**|
|---|---|---|
|**Shared design systemও Adapt**|Apurbo|Omor (preferences API/types),সবfeature owner (shared components)|
|**Barta RAG + Bujhi extraction**|Iftee|Ifty (report review UI), Omor (server secrets/API/auth)|
|**Jibonrekha + report review**|Ifty|Iftee (extracted output contract), Omor (DB/RLS/API)|
|**Care request & provider handoff**|Omor (backend)|Samin (mother/provider-facing workflow)|
|**Wellnessও facility list**|Samin|Omor (data/API), Apurbo (shared UI/accessibility)|



#### **Team rule** 

প্রবতযক member-এি একটি primary owner থাকবব। অেয member সাহাযয কিবত পাবি, রকন্তু shared API, schema, migration বা design system পরিবতিবেি আবে সংরিষ্ট owner-এি সবে contract agree কিবত হবব। 

PROHOR  |  9 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**06 | MEMBER PLAYBOOK** 

## **Omor — Project Manager, Technical Lead & Platform Developer** 

নতামাি কাজ হবো পুবিা project-এি foundation এবং integration রেরিত কিা; অেয চািজবেি feature code রেবজি াবড় রেবি নেওিা েি। 

#### **MEMBER 1  |  OMOR — Platform, architecture and delivery** 

তুরম system-এি shared foundation, authentication, database security, API boundaries, provider workflow backend, Git integration এবং final release-এি owner। 

#### **A. Architecture ও repository foundation** 

- একটি single GitHub repository maintain কিবব; Next.js App Router + TypeScript project scaffold কিবব। Existing repository থাকবে আবে inspect কবি non-destructiveোবব কাজ কিবব। 

- Folder boundaries, routes, feature ownership, server boundaries এবং naming convention রেবখ team-নক নদবব। 

- `main` protected release branch এবং `develop` integration branch ততরি কিবব; প **া** চজবেি আোদা feature branch ও PR workflow স্থাপে কিবব। 

- CI-নত lint, typecheck, build এবং প্রবিাজেীি tests চাোবোি বযবস্থা কিবব। `.env.example`-এ variable names িাখবব; real secret commit কিবব ো। 

- PWA foundation: manifest, icon path, installability checks এবং safe offline fallback; private medical content public cache-এ িাখবব ো। 

#### **B. Supabase, authentication ও security** 

- Supabase project, PostgreSQL schema plan এবং server/browser client boundary ঠিক কিবব। 

- Auth, current profile, mother/provider role, user ownership এবং server-side authorization implement কিবব। 

- Exposed tables-এ RLS enable কবি allow/deny policy রেখবব; UI-নত button hide কিাবক security ধবি নেবব ো। 

- Production migration sequence Omor maintain কিবব; teammates requirement ও migration PR রদবত পািবব, রকন্তু sequence review োড়া production apply হবব ো। 

- Synthetic patient data বযবহাি কিবব; production AI key, service-role key বা private health detail client bundle/log-এ যাবব ো। 

#### **C. Shared backend ও API contract** 

- `GET /api/me`, `PATCH /api/preferences`, health/wellness/AI/report/facility/care-request/provider request endpoints-এি contract agree কিবব। 

- Care-request submission, consent check, provider-role authorization, provider request listing এবং request status update backend তুরম own কিবব। 

- প্ **র** তটি endpoint-এি request, success response, error response, auth rule ও validation schema রেখবব; Zod contract share কিবব। 

- Omor API key ও privileged operations server-side-এ িাখবব; clients নকবে authorized endpoint call কিবব। 

#### **D. Integration, release ও project management** 

- প্ **র** তরদে PR review, merge conflict resolution, dependency blocker এবং feature status track কিবব। 

- একটি GitHub Project board maintain কিবব: Backlog → Ready → In Progress → In Review → Testing → Done। 

- Day 3-এ mother-to-provider vertical slice কাজ কিবে রক ো রেরিত কিবব। Day 5-এ feature freeze এবং Day 6-এ production smoke test/release নেতৃে নদবব। 

- Deployment, environment variables, README/setup instructions, GitHub release tag, one-page summary এবং submission verification coordinate কিবব। 

- একজে রপরেবি নেবে scope কমাবব বা রেরদিষ্ট task reassign কিবব; সবাি unfinished কাজ েীিবব রেবজ রেবি নেবব ো। 

PROHOR  |  10 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

### **Omor-এর deliverables** 

- Runnable shared app foundation and documented architecture 

- Git branches, PR template, CI checks and task board 

- Supabase Auth, profile, roles, ownership and RLS 

- Approved database migrations and common API/Zod contracts 

- Care-request backend + authorized simulated provider access/status 

- PWA manifest/offline-safe shell, deployment and release 

- Integrated working demo, README, environment example and submission readiness 

#### **Omor-এর acceptance test** 

প **া** চজেই clean checkout নথবক app চাোবত পাবি; মা login/profile ততরি কিবত পাবি; রেবজি data োড়া অবেযি record access কিবত পাবি ো; support 

request submit হবে authorized provider queue-নত যাি; provider acknowledgement database status update কবি। 

PROHOR  |  11 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**07 | MEMBER PLAYBOOK** 

## **Apurbo — Frontend, Design System & Accessibility Lead** 

Apurbo এখে Iftee-এি আবেি সম্পূর্ি frontend/design/Adapt ownership নেবব। 

#### **MEMBER 2  |  APURBO — Frontend, design system and Adapt** 

তুরম PROHOR-এি shared visual system এবং user-facing application shell-এি owner। সব module-এি interface একই language, component behaviour এবং accessibility baseline অেুসির্ কিবব। 

#### **A. Design system ও shared UI components** 

- প্রথবম `AGENTS.md`, `DESIGN.md`, `.claude/skills/prohor-premium-uiux/SKILL.md`, `src/styles/prohor-tokens.css`, `docs/designsystem/QA_CHECKLIST.md` ও সংরিষ্ট docs inspect কিবব। 

- Existing colors, themes (Quiet Garden, Original Rose, Morning Mist), fonts, line heights, spacing scale, CSS variables বা accessibility rules েতুে কবি define/replace কিবব ো। 

- `AppButton`, `AppInput`, `AppTextarea`, `AppSelect`, `AppCard`, `AppDialog`, `PageHeader`, `EmptyState`, `LoadingState`, `ErrorMessage`, `MainSidebar`, `AccessPreferencesPanel`-এি মবতা shared primitives ততরি/maintain কিবব। 

- সব control-এ label, helper text, validation error, focus/hover/active/disabled/loading state এবং keyboard interaction ঠিক থাকবব। 

- Feature owner-নদি component contract জাোবব; অেয developer নযে রেজস্ব inconsistent button/form/card ো বাোি। 

#### **B. Welcome, dashboard ও navigation** 

- PROHOR welcome/entry interface ততরি কিবব; primary task access আবে, accessibility adjustment স্পষ্টোবব discoverable িাখবব। 

- “Adjust how you use PROHOR” preference entry িাখবব; disability type selection বা বাধযতামূেক questionnaire কিবব ো। 

- Mother app shell, dashboard, responsive navigation, mobile menu, page title, breadcrumbs/back behaviour ও consistent layout ততরি কিবব। 

- Public homepage-এি visual/component collaboration কিবব; public marketing scope Omor-led থাকবব, রকন্তু approved design tokens ও shared components তুরম maintain কিবব। 

- একটি meaningful task একই feature-set-এ রেন্ন interaction preference রদবি কিা যাি - এমে preview বা screen behaviour নদখাবব। 

#### **C. Adapt accessibility preference engine** 

- Bangla/English, text scale, layout spacing/density, appearance/theme, high contrast, reduced motion, reduced distraction, clearlanguage preference এবং communication mode-এি settings UI ততরি কিবব। 

- Preferences independently selectable হবব; একটি change অেয setting automatically বদোবব ো। 

- Preview, save, restore/default, undo/reversal এবং current form/task preserve কিাি behaviour থাকবব। 

- Keyboard navigation, screen reader structure, visible focus, focus management, semantic controls, zoom/reflow এবং 320px mobile width test কিবব। 

- Audio/read-aloud/AAC feature only when supported and implemented রহবসবব নদখাবব; unsupported option-নক available ববে দারব কিবব ো। 

#### **D. Cross-module integration ও testing** 

- Adapt preferences Barta, Jibonrekha, Bujhi, Shusthota, Shonket, Poth এবং Bondhon screens-এ কাজ কিবে রক ো test কিবব। 

- Charts-এি text/table alternatives, form validation, error announcements, dialog focus, touch-target size ও Bangla typography inspect কিবব। 

- Empty, loading, offline, success, failure এবং long-content state-এি visual pattern consistent কিবব। 

- Iftee-এি AI chat response, Ifty-এি health data এবং Samin-এি workflows shared components রদবি render হবচ্ছ রক ো coordinate কিবব। 

PROHOR  |  12 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

### **Apurbo-এর deliverables** 

- Approved design tokens unchanged নিবখ shared component library 

- Welcome/entry, dashboard, responsive app shell and navigation 

- Adapt settings panel with independent persistent preferences 

- Keyboard/screen-reader/contrast/text-scale/reduced-motion support 

- Cross-module reusable forms, dialogs, errors and state patterns 

- Accessibility test results and original screenshots 

#### **Apurbo-এর acceptance test** 

শুধু preference panel েি: user preference change কবি page reload কিবেও তা থাবক; keyboard রদবি সব primary task কিা যাি; screen reader form label ও error বুঝবত পাবি; chart-এি data text/table আকাবিও পাওিা যাি; 320px-এ core journey usable থাবক। 

PROHOR  |  13 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**08 | MEMBER PLAYBOOK** 

## **Iftee — AI Engineer & Medical Information Lead** 

Iftee এখে Ifty-এি আবেি AI/Barta/medical-information ownership নেবব। 

**MEMBER 3  |  IFTEE — AI, Barta and evidence-grounded medical information** 

তুরম AI-এি answer quality, source retrieval, Bangla response, safe uncertainty এবং limited Bujhi extraction engine-এি owner। 

#### **A. Knowledge source inventory ও evidence control** 

- Bangladesh maternal and child health education-এি জেয উপযুক্ত, approved/credible reference সংগ্রহ কিবব; source title, publisher, date, URL, section/page ও review state record কিবব। 

- প্ **র** তটি ingested document/source-এি metadata সংিক্ষ্র্ কিবব; stale, duplicate, unsupported বা unapproved content আোদা িাখবব। 

- নকাে প্রবে evidence পাওিা যাি, নকাে প্রবেি evidence নেই - তা distinguish কিাি retrieval contract ততরি কিবব। 

- AI answer-এ বাস্তব retrieved source passage/reference নদখাবব; fake citation, invented source বা unsupported clinical statement গ্রহর্বযােয েি। 

#### **B. PROHOR Barta — Bangla/English RAG assistant** 

- Barta-ি server-side AI endpoint এবং UI-এি সবে যুক্ত response contract implement কিবব। 

- প্রে → approved knowledge retrieval → relevant passages → grounded answer → visible source references এই pipeline ততরি কিবব। 

- Bangla প্রবেি clear, readable response এবং প্রবিাজে অেুযািী English support নদবব; medical facts preserve নিবখ simple wording বযবহাি কিবব। 

- Insufficient evidence, model unavailable, retrieval failure, rate limit বা malformed response হবে graceful abstention/error state নদবব। 

- Public educational Q&A generic থাকবব; অেুমরত োড়া private personal health records context রহবসবব বযবহাি কিবব ো। 

- AI individualized diagnosis, prescription, emergency urgency classification বা clinician decision replace কিবব ো। 

#### **C. Bujhi restricted extraction engine** 

- একটি supported synthetic report format-এি সীরমত OCR/extraction workflow ততরি কিবব। 

- Extracted fields, raw text/original document reference, confidence/uncertainty, units, field labels এবং source metadata structured output-এ নদবব। 

- Low-confidence বা ambiguous field-নক unverified রহবসবব রচরিত কিবব; missing value রেবজ নথবক পূির্ কিবব ো। 

- Extraction endpoint/UI contract Ifty-নক নদবব, যাবত Ifty মা-নক value review/correct এবং authorized record-এ save কিাি interface কিবত পাবি। 

- Bujhi সব report/prescription support কবি - এমে claim কিবব ো; MVP scope একটি supported synthetic example-এ সীরমত থাকবব। 

#### **D. AI evaluation, safety ও documentation** 

- Bangla question set, evidence-available/evidence-absent প্রে এবং unsafe/diagnosis-seeking প্রে রদবি evaluation চাোবব। 

- Citation accuracy, answer groundedness, language clarity, hallucination/abstention, extraction mistakes ও failure behaviour report কিবব। 

- AI provider/model/tool disclosure, knowledge provenance, limitations এবং known failure cases document কিবব। 

- API keys server-only িাখবব; prompt, retrieval log বা error log-এ private health data unnecessarily িাখবব ো। 

### **Iftee-এর deliverables** 

- Approved maternal-health source inventory and ingestion/retrieval structure 

- Working Bangla RAG/Barta endpoint with real source references 

- Barta answer/abstention/error contract and safety boundaries 

PROHOR  |  14 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

- Restricted Bujhi extraction endpoint for one supported synthetic report 

- Structured extracted output with uncertainty and verification-required status 

- AI evaluation results, source provenance and limitation notes 

#### **Iftee-এর acceptance test** 

Known-answer questions source-linked answer নদি; evidence নেই এমে প্রবে AI পরিষ্কািোবব uncertainty/abstention জাোি; citation সরতযকাবিি retrieved source-এ যাি; extracted report value review োড়া confirmed health record হি ো; API failure-এ fake answer নদখাি ো। 

PROHOR  |  15 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**09 | MEMBER PLAYBOOK** 

## **Ifty — Maternal & Baby Health Engineer** 

Ifty এখে Apurbo-এি আবেি maternal/baby health ownership নেবব, সবে report review ও record integrity। 

#### **MEMBER 4  |  IFTY — Jibonrekha, mother/baby records and Bujhi review** 

তুরম মাবিি pregnancy journey ও baby-related record-এি data model, health forms, timeline, source labels এবং report verification UIএি owner। 

#### **A. Pregnancy profile ও Jibonrekha timeline** 

- Pregnancy profile data structure: relevant pregnancy information, start/reference date where provided, stage/week calculation rules এবং editable profile ততরি কিবব। 

- Maternal health observations - নযমে blood pressure বা অেয entered measurement - date/time, unit এবং sourceসহ save কিবব। 

- Condition history, symptoms/notes ও appointments-এি record িাখবব; user-entered information automatically clinician diagnosis হবব ো। 

- Chronological history/timeline ততরি কিবব; user নযে record edit/correct কিবত পাবি এবং source/provenance নদখবত পাবি। 

#### **B. Mother ও baby record separation** 

- Mother record এবং fetal/newborn/baby record আোদা entity/table রহবসবব িাখবব; প্রবিাজে অেুযািী linkage থাকবব, রকন্তু values/identity mix হবব ো। 

- Pregnancy week নথবক fetal measurement, growth, health status বা “normal development” অেুমাে কিবব ো। 

- Baby record-এি নকাবো measurement শুধু actual user-entered, document-extracted বা clinician-entered source নথবক আসবব; source provenance বজাি থাকবব। 

- Mother/baby view-নত নকাে record কাি, date কী, unit কী - তা unambiguous কিবব। 

#### **C. Bujhi report-review ও verification interface** 

- Iftee-এি extraction output গ্রহর্ কবি field-by-field report review UI ততরি কিবব। 

- প্ **র** তটি extracted field-এি label, extracted value, unit, original document/source, confidence/uncertainty এবং verification status নদখাবব। 

- মা value correct, edit, reject বা save/cancel কিবত পািববে; unverified field-নক confirmed/clinician-entered রহবসবব mark কিা যাবব ো। 

- Approved record mother timeline-এ যাবব োরক baby timeline-এ যাবব তা explicitly choose/validate কিবব। 

- একটি report upload নথবক duplicate বা mistaken observation ততরি হবচ্ছ রক ো handle কিবব। 

#### **D. Data integrity ও integration** 

- Health data model-এ `self_reported`, `document_extracted`, `clinician_entered`, `clinician_confirmed` provenance state বজাি িাখবব। 

- Unit, date/time, required field, range format, invalid input এবং correction flow validate কিবব। 

- Supabase persistence-এি সবে record save/reload/edit/delete (নযখাবে allowed) test কিবব। 

- Iftee-এি report output contract এবং Omor-এি health/document API schema অেুযািী integrate কিবব। 

- সব example patient/medical data synthetic হবব; video/demo-নত real personal health information থাকবব ো। 

### **Ifty-এর deliverables** 

- Pregnancy profile and maternal condition/observation forms 

- Mother timeline and distinct linked baby/fetal/newborn records 

- Health observations with date, unit and provenance 

- Bujhi report review/correction/verification interface 

PROHOR  |  16 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

- Verified-only save to correct mother/baby timeline 

- Synthetic patient story and data integrity test evidence 

**Ifty-এর acceptance test** 

Synthetic mother profile save/reload হি; mother এবং baby records আোদা থাবক; unit/date/source visible; report extract unverified থাবক যতক্ষ্র্ ো মা review কবিে; accepted value সঠিক timeline-এ save হি; pregnancy week নথবক নকাবো fictional baby measurement ততরি হি ো। 

PROHOR  |  17 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**10 | MEMBER PLAYBOOK** 

## **Samin — Wellness, Care Services & Workflow Developer** 

Samin-এি original ownership অপরিবরতিত। তুরম wellness ও user-facing care workflows একবত্র কাজ কিাবব। 

#### **MEMBER 5  |  SAMIN — Shusthota, Poth, Shonket/Bondhon UI and demo workflow** 

তুরম wellness tracking, help/support entry, facility list এবং provider queue-এি user-facing flow-এি owner; care request backend Omor-এি সবে integrate কিবব। 

#### **A. Shusthota — physical ও emotional wellness** 

- Optional mood check-in, fatigue/rest/sleep, hydration, diary এবং user-chosen activity/mobility-neutral log form ততরি কিবব। 

- Mood/diary private by default হবব; user রেবজ ো চাইবে Bondhon caregiver/provider-এি সবে share হবব ো। 

- Wheelchair use, fewer steps বা missed check-in-নক poor health/depression রহবসবব interpret কিবব ো। 

- Universal exercise target, step quota, guilt-based streak বা compulsory goal নযাে কিবব ো। 

- Wellness history accessible list/table format-এ নদখাবব; user-controlled reminders only where implemented। 

#### **B. Poth — basic facility directory** 

- Searchable facility list ততরি কিবব; MVP-নত clearly labeled sample/synthetic facility data বযবহাি কিবব। 

- Facility name, location, contact, available contact methods, visit preparation এবং accessibility information field নদখাবব। 

- Accessibility information verified ো হবে “Not verified” নদখাবব; verified ো থাকা তথযবক accessible ববে promote কিবব ো। 

- Map থাকবে তাি parallel text list থাকবব; map-only navigation েি। Real-time appointment slot/distance invent কিবব ো। 

#### **C. Shonket — help/support interface** 

- Help options, reviewed safety-information entry, structured concern/support request form এবং alternative contact methods নদখাবব। 

- Voice call বযবহাি সম্ভব ো হবে text-based/other accessible channel নদখাবব, যরদ channel বাস্তবব supported থাবক। 

- User-এি chosen communication method, request details এবং share selection Omor-এি API-নত পাঠাবব। 

- AI diagnosis বা automatic urgency classification কিবব ো; urgent information clinician-reviewed content রহবসবব নদখাবত হবব। 

#### **D. Bondhon provider queue UI** 

- Authorized simulated provider-এি request list ও request detail screen ততরি কিবব। 

- Submitted/delivered/acknowledged/responded/closed status পরিষ্কািোবব নদখাবব; status update Omor-এি authorized API রদবি হবব। 

- Provider নকবে authorized, consent-scoped information নদখবব; private mood diary বা unrelated record automatic access পাবব ো। 

- Mother-facing request status এবং provider-side queue একই database state reflect কিবব। 

#### **E. Testing ও demo coordination** 

- Wellness, support request, provider response, empty list, network failure, duplicate submit ও error message end-to-end test কিবব। 

- Day 5-এ workflow regression test কিবব; Day 6-এ 3-minute video assemble, captions, summary draft, evidence ও demo sequence coordinate কিবব। 

- Synthetic patient story অেুযািী demo steps সাজাবব এবং simulated provider স্পষ্টোবব simulated রহবসবব label কিবব। 

### **Samin-এর deliverables** 

- Shusthota forms/history for optional mood, rest, fatigue and activity 

- Poth searchable sample directory with honest accessibility metadata 

PROHOR  |  18 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

- Shonket help/support entry and structured request UI 

- Bondhon authorized provider queue and status interface 

- End-to-end failure/empty/error test report 

- Three-minute demo video, captions and demo coordination 

#### **Samin-এর acceptance test** 

একজে মা wellness entry save কিবত পাবিে; facility list text-searchable; unknown accessibility clearly marked; care request submit কবি provider queue-নত নদখা যাি; provider response mother status-এ reflect কবি; consent োড়া private diary নদখা যাি ো। 

PROHOR  |  19 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**11 | CROSS-TEAM CONTRACTS** 

## **ক স্জর handoff ও dependency** 

প্রবতযক কাবজি সীমা আবে agree কিবে parallel development-এ duplicate logic ও broken integration কমবব। 

|**ক জ/Artifact**|**Primary owner**|**Collaborator**|**Handoffকী**|
|---|---|---|---|
|**Design tokens & shared UI**|Apurbo|Omor + all|Existing token references, component props, form/error<br>patterns|
|**Access preferences**|Apurbo|Omor|Preference schema, persistence endpoint, default values|
|**Auth/profile/RLS**|Omor|All|Current user, role, ownership and authorized access contract|
|**Barta RAG**|Iftee|Omor + Apurbo|Server endpoint, answer + source references + abstention<br>states|
|**Bujhi extraction**|Iftee|Ifty + Omor|Structured extraction fields, confidence, source and<br>unverified status|
|**Bujhi review UI**|Ifty|Iftee + Apurbo|Review/edit/reject/save workflow and shared form<br>primitives|
|**Jibonrekha health data**|Ifty|Omor|Pregnancy, observations, conditions, mother/baby records +<br>APIs|
|**Shusthota/Poth/help UI**|Samin|Omor + Apurbo|Wellness/facility/support contract, accessible shared<br>components|
|**Care-request backend**|Omor|Samin|Submit/authorization/status transitions/provider list APIs|
|**Provider queue UI**|Samin|Omor|Queue screens and status update interaction|
|**Integration & release**|Omor|All|PRs, build status, smoke tests, deployment, release|



### **Rules for shared files** 

- `src/app/layout.tsx`, global CSS, design token CSS, Supabase migrations, API schema, shared types এবং global navigation একারধক member একসবে edit কিবব ো। 

- একটি shared file edit কিাি আবে owner-এি সবে discussion এবং review রেবত হবব। 

- Frontend mock response contract final হওিাি আবে বযবহাি কিা নযবত পাবি; রকন্তু mock data-নক real response বো যাবব ো। 

- একটি module complete বোি আবে owner UI/service test evidence PR-এ যুক্ত কিবব। 

PROHOR  |  20 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**12 | SIX-DAY SPRINT** 

## **Day 1 — Foundation ও contracts** 

রদবেি েক্ষ্য: প **া** চজেই একই app locally run কিবব এবং এবক অবেযি API/data contract ো guess কবি কাজ শুরু কিবত পািবব। 

|**সদসে**|**য়দে ১-এর য়েয়দণষ্ট ক জ**|**য়দেস্শস্ষর প্রে র্**|
|---|---|---|
|**Omor**|GitHub repo, main/develop/member branches; Next.js initialize; Supabase/env<br>template; initial schema/API/Zod contracts; route map; PR rules; CI/preview<br>deployment/task board.|প**া**চজেclean setupনথবকapp runকিবত পাবি;<br>repo/branch/task board ready.|
|**Apurbo**|Bengali/English typography setup (existing tokensঅেুযািী); design tokens consume<br>কিা; shared buttons/forms/cards; welcomeওdashboard shell; accessibility<br>behaviour contract.|Welcome/dashboard shellএবংshared<br>component starter PR.|
|**Iftee**|Approved maternal-health source inventory; source metadata structure;<br>retrieval/RAG input-output contract; sample-docরেরিকserver-side Barta endpoint<br>শুরু.|Source list, RAG contractএবংsample-based<br>endpoint skeleton.|
|**Ifty**|Pregnancy, maternal condition, observation, baby record, report metadata-এিtype;<br>consistent fictional health data; mother health formওtimeline componentsশুরু.|Shared health data typesএবংsynthetic data +<br>first form/timeline PR.|
|**Samin**|Wellness-entryএবংsupport-request schema; mood/activity form; assistance<br>request flow; provider queue UI outline; sample facility data.|Wellness/help/provider/facility contractও<br>initial UI outline.|



#### **All-team deliverable** 

Runnable app, agreed data contracts, initial screen layouts, এবং প্রবতযক member-এি অন্ **ত** একটি commit/PR। Omor checkpoint: প্রবতযবক রেবজি machine-এ project চারেবি নদখাবব। 

### **Day 1 sequence for Omor** 

- Repository create/inspect and choose one package manager; lockfile commit. 

- Create protected `main`, integration `develop`, and member branches. 

- Scaffold Next.js App Router + strict TypeScript + Tailwind; do not replace existing design tokens. 

- Add Supabase configuration and `.env.example` names only. 

- Agree data ownership, API request/response/error contracts and Zod schemas. 

- Create GitHub issues and PR template; configure lint/typecheck/build CI. 

- Verify all five can clone, install and run. 

PROHOR  |  21 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**13 | SIX-DAY SPRINT** 

## **Day 2 — Main features parallel build** 

রদবেি েক্ষ্য: প্ **র** তটি workstream agreed contract বযবহাি কবি functioning screen বা service ততরি কিবব। 

|**সদসে**|**য়দে ২-এর ক জ**|**প্রে র্/acceptance**|
|---|---|---|
|**Omor**|Auth, initial migrations, user profiles, preference persistence, RLS/ownership;<br>team-এি জেযcommon data-access helpers.|Login/current-user/profile; protected data<br>access rules draft/test.|
|**Apurbo**|Welcome, accessible navigation, preference panel, dashboard; text size, layout<br>density, reduced motion, contrast controls.|Preferences interactকবি; UI shared<br>componentsবযবহাি কবি.|
|**Iftee**|Curated-document retrieval, initial grounded Bangla answer, source references,<br>insufficient-evidence behaviour, error handling.|Barta question → retrieved source → cited<br>answer/abstention.|
|**Ifty**|Pregnancy profile, maternal observations Supabase-এconnect; health history;<br>linked but distinct baby record views.|Record save/reload; mother/baby data<br>separation.|
|**Samin**|Wellness forms/history, help-request form (API pendingহবেclearly mock), facility<br>list foundation.|Wellness UIএবংhelp form usable; sample<br>facility directory render.|



#### **All-team deliverable** 

Mother dashboard-এ নপ াঁোবত পাবি; main forms বযবহাি কিবত পাবি; completed backend integration নযখাবে আবে নসখাবে data persist হি। Omor actual deployed preview review কিবব, শুধু Figma েি। 

PROHOR  |  22 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**14 | SIX-DAY SPRINT** 

## **Day 3 — প্রথে complete care journey** 

এই রদেটি critical milestone। Full journey কাজ ো কিবে advanced Bujhi, animation বা voice feature শুরু কিবব ো। 

|**সদসে**|**য়দে ৩-এর ক জ**|**প্রে র্/acceptance**|
|---|---|---|
|**Omor**|Care-request submission, authorization, provider access, simulated provider<br>accountওrequest-status update; integration PR merge.|Mother request DB-নত যাি; authorized<br>providerনদখবত ওstatus updateকিবত পাবি.|
|**Apurbo**|Accessibility preferences health, wellness, chat, support screens-এapply; keyboard,<br>focus, labelsএবংform testing.|একইtask preferencesবদবেওusable; focusও<br>errors accessible.|
|**Iftee**|Barta UI connect, Bangla RAG test, source visibility, model failure stateওsafety<br>boundary.|Actual endpointনথবকsource-linked Bangla<br>answer; failure/abstention state.|
|**Ifty**|Conditions, source labels, mother/baby timeline integration; health record<br>save/reload/edit verification.|Synthetic mother profile, observation and<br>linked baby data persist.|
|**Samin**|Wellness database connection, help-request UI Omor API-নতconnect, provider<br>queue list UI.|Wellness entry save; care request provider<br>list-এ নদখা যাি.|



#### **Day 3 non-negotiable** 

Mother profile/health record save কিবব → wellness entry কিবব → Barta-নক Bangla প্রে কিবব → assistance request নদবব → authorized simulated provider request acknowledge কিবব। এই পুবিা journey একবাি end-to-end pass ো কিবে scope বাড়াবব ো। 

PROHOR  |  23 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**15 | SIX-DAY SPRINT** 

## **Day 4 — আট module-এর demonstration complete** 

রদবেি েক্ষ্য: সীরমত module-গুবোবক honest, working workflow-নত যুক্ত কিা এবং আট module-এ meaningful entry point নদওিা। 

|**সদসে**|**য়দে ৪-এর ক জ**|**প্রে র্/acceptance**|
|---|---|---|
|**Omor**|Authorization/integration stabilize; deployment, shared API, consent enforcement<br>ওDB error check.|Core journey stable; unauthorized requests<br>denied.|
|**Apurbo**|Responsive layout, support screens, empty/error states, accessibility preferences<br>polish; core stableহবেsimple AAC composition prototype.|Cross-screen accessibility preference;<br>mobile/reduced-motion behaviour.|
|**Iftee**|একটিsupported synthetic report format-এিlimited extraction attempt; extraction<br>output Ifty-এিreview component-এconnect; AI evaluation evidence.|Extracted fields + confidence/uncertainty +<br>unverified state.|
|**Ifty**|Report verification/save-to-timeline integration; editable extracted fields;<br>unverified data confirmed recordো হওিািguard.|Mother review/correct/reject; accepted field<br>correct timeline-এsave.|
|**Samin**|Searchable sample facility directory; visit-preparation page; reviewed safety<br>information page; provider request-status UI.|Poth list, Shonket help info, Bondhon request<br>status usable.|



#### **Day 4 cutoff rule** 

Bujhi reliably supported report extract কিবত ো পািবে extraction expand কিবব ো; limited prototype রহবসবব label কিবব। Barta এবং core care journey sacrifice কিবব ো। 

PROHOR  |  24 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**16 | SIX-DAY SPRINT** 

## **Day 5 — Feature freeze, testing ও integration** 

রদবেি েক্ষ্য: েতুে feature বন্ধ কবি release candidate stable কিা। 

|**সদসে**|**য়দে ৫-এর ক জ**|**প্রে র্/acceptance**|
|---|---|---|
|**Omor**|Reviewed PR merge, integration defects, API security, permissions, production env,<br>regression test.|Release candidate; known issue severity list;<br>auth/RLS verified.|
|**Apurbo**|Keyboard, screen-reader, responsive, zoom, contrast checks; shared UI/onboarding<br>issues fix.|Accessibility findings + fixes + screenshots.|
|**Iftee**|AI evaluation: unsupported question, inaccurate citation, inconsistent Bangla,<br>extraction mistakes. Limitations document.|AI test cases, cited evidence validation,<br>model/source disclosure.|
|**Ifty**|Record sources, units, edit flows, pregnancy timeline, mother/baby separation,<br>report-to-record consistency.|Health data integrity test report.|
|**Samin**|Wellness, care request/provider response E2E; failed request, empty list, feedback<br>checks; video plan.|Workflow regression test results and demo<br>script outline.|



#### **Feature freeze** 

Day 5 ন বষ েতুে major feature েি। শুধু critical bug fix, test, documentation এবং release preparation। 

PROHOR  |  25 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**17 | SIX-DAY SPRINT** 

## **Day 6 — Final release ও submission** 

রদবেি েক্ষ্য: deployed site, verified demo এবং submission-ready materials। 

|**সদসে**|**য়দে ৬-এর ক জ**|**প্রে র্/acceptance**|
|---|---|---|
|**Omor**|Final release, production smoke test, GitHub release tag, team sign-off, submission<br>check, critical deployment fix.|Deployed app, release tag, verified<br>submission.|
|**Apurbo**|Screens polish, original screenshot, typography/contrast/navigation consistency;<br>accessibility settings demo.|Final UI, original screenshots, preference<br>demo.|
|**Iftee**|AI architecture diagram, source references, AI/tool disclosure, technical<br>explanation, stable Barta demo sequence.|AI evidence/provenance and source<br>references.|
|**Ifty**|Fictional patient story, video health data verification, mother/baby continuity<br>explanation.|Synthetic demo data consistency and<br>explanation.|
|**Samin**|3-minute video assembly, captions, project-summary draft, test evidence, final<br>demonstration sequence.|Accessible video + captions + summary/test<br>materials.|



#### **All-team deliverable** 

Deployed website, verified demonstration, one-page project summary, three-minute video, documented limitations, source provenance and final release. 

### **কশষ ১৮ ঘণ্ট** 

যরদ buffer time থাবক, েতুে feature নযাে কিাি অেুমরত রহবসবব েি; final upload, deployment issue, video export বা organizer portal-এি correction-এি জেয emergency buffer রহবসবব বযবহাি কিবব। Deadline official portal-এ reconfirm কিবব। 

PROHOR  |  26 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

##### **18 | TECHNICAL ARCHITECTURE** 

## **Technology stack ও architecture** 

এটাই proposed target architecture। Existing repository inspect ো কবি existing file overwrite, duplicate tree বা রিতীি token system ততরি কিা যাবব ো। 

|**Layer**|**Technology / policy**|
|---|---|
|**Application**|Next.js App Router, React, mobile-first responsive web app + installable PWA|
|**Language**|Strict TypeScript|
|**Styling**|Tailwind CSS v4; existing PROHOR tokens readকিবব|
|**UI icons**|Lucide|
|**Database**|Supabase PostgreSQL|
|**Authentication**|Supabase Auth|
|**Authorization**|Server enforcement + Supabase RLS/storage rules|
|**AI**|Server-side hosted LLM; approved-source RAG|
|**Validation**|Zod request/response schemas|
|**Forms**|React Hook Form + Zod resolver (as proposed in six-day plan)|
|**Testing**|Playwright + axe; unit/integration/E2E/accessibility tests|
|**Deployment**|Vercel or compatible hosting; HTTPS for PWA installability|
|**Version control**|GitHub PR workflow: feature branches → develop → protected main|



### **Target repository — root ও documentation** 

- prohor/ ├── AGENTS.md                         # existing; do not modify ├── DESIGN.md                         # existing; do not modify ├── .claude/skills/prohor-premium-uiux/SKILL.md ├── .github/ │   ├── CODEOWNERS │   ├── pull_request_template.md │   ├── ISSUE_TEMPLATE/ │   └── workflows/ci.yml, accessibility.yml ├── docs/ │   ├── design-system/                 # existing specs; preserve │   ├── product/ │   │   ├── feature-inventory.md       # 8 modules + 24 capabilities │   │   ├── mvp-vs-roadmap.md │   │   ├── user-journeys.md │   │   └── homepage-outline.md │   ├── architecture/ │   │   ├── overview.md, routes.md, data-model.md │   │   ├── api-contracts.md, access-control.md │   │   ├── ai-rag-and-documents.md, pwa-and-offline.md │   ├── sprint/day-1-foundation.md │   ├── sprint/team-ownership.md │   ├── sprint/release-checklist.md │   └── evidence/ai-provenance.md, medical-sources.md, │       accessibility-results.md <mark>├</mark> ── public/ 

PROHOR  |  27 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**18 | TECHNICAL ARCHITECTURE** 

## **Repository tree — application routes** 

Next.js route group `(name)` URL-এ group name নযাে কবি ো। Route file-গুবো actual page/API surface রেধিাির্ কিবব। 



<!-- Start of picture text -->
│   ├── icons/                         # owned/original install icons<br>│   ├── images/marketing/              # licensed/original assets<br>│   ├── illustrations/<br>│   └── offline.html                   # public fallback only<br>├── src/<br>│   ├── app/<br>│   │   ├── layout.tsx<br>│   │   ├── globals.css<br>│   │   ├── manifest.ts<br>│   │   ├── error.tsx, not-found.tsx<br>│   │   ├── (marketing)/<br>│   │   │   ├── page.tsx               # /<br>│   │   │   ├── how-it-works/page.tsx<br>│   │   │   ├── features/page.tsx<br>│   │   │   ├── privacy/page.tsx<br>│   │   │   └── terms/page.tsx<br>│   │   ├── (public)/<br>│   │   │   ├── ask/page.tsx           # Barta public education<br>│   │   │   ├── find-care/page.tsx     # Poth<br>│   │   │   ├── safety/page.tsx        # Shonket<br>│   │   │   └── accessibility/page.tsx # Adapt<br>│   │   ├── (auth)/<br>│   │   │   ├── sign-in/page.tsx<br>│   │   │   ├── sign-up/page.tsx<br>│   │   │   └── auth/callback/route.ts<br>│   │   ├── (mother)/app/<br>│   │   │   ├── layout.tsx, page.tsx<br>│   │   │   ├── journey/page.tsx<br>│   │   │   ├── journey/mother/page.tsx<br>│   │   │   ├── journey/baby/page.tsx<br>│   │   │   ├── reports/page.tsx<br>│   │   │   ├── reports/[documentId]/page.tsx<br>│   │   │   ├── wellbeing/page.tsx<br>│   │   │   ├── wellbeing/diary/page.tsx<br>│   │   │   ├── appointments/page.tsx<br>│   │   │   ├── care/page.tsx<br>│   │   │   ├── care/requests/page.tsx<br>│   │   │   ├── care/circle/page.tsx<br>│   │   │   └── settings/page.tsx<br>│   │   └── (provider)/provider/<br>│   │       ├── layout.tsx, page.tsx<br>│   │       ├── requests/page.tsx<br>│ │        └── requests/[requestId]/page.tsx<br><!-- End of picture text -->

PROHOR  |  28 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

##### **18 | TECHNICAL ARCHITECTURE** 

## **Repository tree — API, features ও infrastructure** 

Feature folder হবো domain boundary; database/AI/security logic page component-এি মবধয েরড়বি নদবব ো। 

│   └── api/ │       ├── profile/route.ts │       ├── preferences/route.ts │       ├── pregnancy/route.ts │       ├── health/observations/route.ts │       ├── health/conditions/route.ts │       ├── baby/records/route.ts │       ├── wellness/route.ts │       ├── ai/education/route.ts │       ├── ai/visit-summary/route.ts │       ├── documents/extract/route.ts │       ├── documents/[documentId]/route.ts │       ├── facilities/route.ts │       ├── appointments/route.ts │       ├── care-requests/route.ts │       ├── consent/route.ts │       └── provider/requests/[requestId]/route.ts │ 

- │   ├── components/ │   │   ├── ui/                         # shared semantic components │   │   ├── layout/                     # public/mother/provider shells │   │   ├── marketing/                  # original public homepage │   │   ├── accessibility/              # shared access primitives │   │   ├── forms/ │   │   └── feedback/                   # state/error/loading/offline │   ├── features/ │   │   ├── adapt/                      # Apurbo │   │   ├── barta/                      # Iftee │   │   ├── shonket/                    # Samin UI │   │   ├── jibonrekha/                 # Ifty │   │   ├── bujhi/                      # Iftee extraction + Ifty review │   │   ├── shusthota/                  # Samin │   │   ├── poth/                       # Samin │   │   └── bondhon/                    # Samin UI; Omor backend │   ├── server/ │   │   ├── auth/                       # Omor │   │   ├── database/                   # Omor/reviewed repositories │   │   ├── ai/                         # Iftee │   │   ├── medical/                    # approved source guardrails │   │   ├── consent/                    # Omor │   │   └── audit/                      # Omor │   ├── lib/supabase/                   # Omor │   ├── lib/validators/                 # shared Zod contracts │   ├── lib/pwa/                        # service worker/indicators │   ├── i18n/en.json, bn.json, index.ts │   ├── hooks/, types/ │   └── styles/prohor-tokens.css        # existing; do not modify 

- ├── supabase/migrations/                # reviewed migrations ├── supabase/seeds/                     # synthetic only ├── supabase/tests/                     # RLS tests ├── tests/unit/, integration/, e2e/, accessibility/ 

- ├── scripts/check-contrast.*, check-env.* 

- ├── .env.example, .gitignore, package.json, 

<mark>│</mark> tsconfig.json, README.md 

### **Feature folder ownership after the revised assignment** 

|**Path/domain**|**Owner**|**Notes**|
|---|---|---|
|**components/ui, marketing, accessibility**|Apurbo|Shared UI and public/home app shell collaboration.|
|**features/adapt**|Apurbo|Accessibility preferences and communication UI.|
|**features/barta + server/ai**|Iftee|RAG, source provenance, AI endpoints.|
|**features/bujhi AI extraction**|Iftee|Extraction engine, OCR/structured output.|



PROHOR  |  29 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

|**Path/domain**|**Owner**|**Notes**|
|---|---|---|
|**features/jibonrekha**|Ifty|Pregnancy, mother/baby records and timeline.|
|**features/bujhi review UX**|Ifty|Review/correction and save to timeline.|
|**features/shusthota, poth, shonket UI, bondhon UI**|Samin|Wellness, directory and user-facing care workflows.|
|**server/auth, database, consent, supabase, PWA,**<br>**deploy**|Omor|Shared platform/security/integration; migrations owner.|



PROHOR  |  30 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**19 | ROUTES & API CONTRACTS** 

## **েূ  routes ও shared API** 

API contract implement কিাি আবে request shape, response shape, authorization rule ও error behaviour agree কিবত হবব। 

### **Public, mother ও provider routes** 

|**Route group**|**Routes**|**উস্েশে**|
|---|---|---|
|**Marketing**|`/`, `/how-it-works`, `/features`, `/privacy`, `/terms`|Pre-login product explanation.|
|**Public**|`/ask`, `/find-care`, `/safety`, `/accessibility`|Public education, directory, reviewed safety info and<br>access settings.|
|**Auth**|`/sign-in`, `/sign-up`, `/auth/callback`|Identity/authentication.|
|**Mother**|`/app`, `/app/journey`, `/app/journey/mother`, `/app/journey/baby`,<br>`/app/reports`, `/app/wellbeing`, `/app/appointments`, `/app/care`,<br>`/app/settings`|Private mother workspace and records.|
|**Provider**|`/provider`, `/provider/requests`, `/provider/requests/[requestId]`|Authorized provider request queue and review.|



### **Shared API endpoints (proposed contract)** 

|**Endpoint**|**Owner**|**Purpose**|
|---|---|---|
|**GET /api/me**|Omor|Current user profile/role.|
|**PATCH /api/preferences**|Omor + Apurbo|Persist access preferences.|
|**GET/POST /api/health**|Ifty + Omor platform|Read/save health observations with source and owner checks.|
|**GET/POST /api/wellness**|Omor API; Samin feature|Read/save wellness entries.|
|**POST /api/ai/chat**|Iftee|Grounded Bangla/English Barta response.|
|**POST /api/reports/extract**|Iftee|Restricted report extraction.|
|**GET /api/facilities**|Samin|Sample/verified facility directory.|
|**POST /api/care-requests**|Omor + Samin|Create mother-approved support request.|
|**GET /api/provider/requests**|Omor|Authorized provider queue.|
|**PATCH /api/provider/requests/:id**|Omor|Authorized request status update.|



### **প্রস্র্েক API response-এ ে থ ক দরক র** 

- Typed success payload + stable entity ID. 

- Validation error with field-level detail; unauthorized/forbidden response distinct. 

- Not-found, conflict, rate-limit, unavailable-service and server-error states. 

- Request must enforce user ownership/role on the server; client-provided userId trust কিবব ো. 

- Medical field source/provenance and date/unit loss কিা যাবব ো. 

- Mock/demo response হবে UI ও API documentation-এ clearly label কিবত হবব. 

PROHOR  |  31 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**20 | DATABASE & DATA CONTRACTS** 

## **Database tables ও ownership** 

Feature owner requirements define কিবব; migration sequence এবং RLS policy review Omor coordinate কিবব। 

|**Table**|**Requirement owner (revised)**|**Migration maintainer**|
|---|---|---|
|**profiles**|Omor|Omor|
|**access_preferences**|Apurbo|Omor|
|**pregnancy_records**|Ifty|Omor|
|**maternal_conditions**|Ifty|Omor|
|**baby_records**|Ifty|Omor|
|**health_observations**|Ifty|Omor|
|**wellness_entries**|Samin|Omor|
|**medical_documents**|Ifty + Iftee|Omor|
|**support_requests**|Samin + Omor|Omor|
|**consent_grants**|Omor|Omor|
|**facility_directory**|Samin|Omor|
|**knowledge_sources**|Iftee|Omor|



### **Shared TypeScript contract examples** 

type AccessPreferences = { language: "bn" | "en"; textScale: "default" | "large" | "extra-large"; layout: "compact" | "spacious"; highContrast: boolean; reducedMotion: boolean; simpleLanguage: boolean; communication: "text" | "aac"; }; type RecordSource = | "self_reported" | "document_extracted" | "clinician_entered" | "clinician_confirmed"; type HealthObservation = { id: string; userId: string; type: string; value: string; unit?: string; observedAt: string; source: RecordSource; }; type CareRequestStatus = | "submitted" | "delivered" | "acknowledged" | "responded" | "closed"; 

PROHOR  |  32 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

#### **Data provenance is mandatory** 

মা রেবজ নকাবো condition রেখবে নসটি self-reported। OCR extraction হবে document_extracted। Clinician enter কিবে clinician_entered। Clinician review/confirmation ো হবে clinician_confirmed কিা যাবব ো। 

### **Consent & provider access** 

- Mother-controlled granular consent: নকাে record, নকাে recipient, নকাে purpose এবং কতরদবেি জেয share হবব তা define কিবত হবব। 

- Consent revocable; access log/audit history থাকবত হবব। 

- Provider role authorization + request relationship server-side verify কিবত হবব। 

- Private mood journal defaultোবব caregiver/provider share হবব ো। 

- একটি request-এি জেয যতটুকু information প্রবিাজে, তাি নবর  provider view-এ defaultোবব নদখাবো যাবব ো। 

PROHOR  |  33 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**21 | ENGINEERING WORKFLOW** 

## **GitHub, issue board ও team routine** 

এই workflow five-way parallel work-নক mergeable এবং reviewable িাখবব। 

### **Branches** 

main                 # protected final release develop              # protected integration omor-platform        # Omor iftee-frontend       # Iftee (branch name kept by identity) ifty-ai              # Ifty (branch name kept by identity) apubo-health         # Apurbo (branch name kept by identity) samin-services       # Samin 

_Branch_ োমগুবো _member identity_ অেুযািী _;_ েতুেদারিবেিকািবর্ _branch_ োম _change_ বাধযতামূেকেি। _Feature_ কাজ _role_ অেুযািী _issue_ ও _PR-_ নত _assign_ হবব। 

### **Team rules** 

- নকউ সিাসরি `main`-এ develop কিবব ো। 

- সব feature branch `develop` নথবক ততরি হবব এবং PR `develop`-এ যাবব। 

- PR lint/build/typecheck এবং প্রবিাজেীি test pass কিবব; অন্ **ত** একজে reviewer থাকবব। 

- Shared component, API contract, database migration এবং global token change relevant owner review কিবব। 

- প্রবতযবক `develop` নথবক রেিরমত sync কিবব; `.env.local`, API key, private health data commit কিবব ো। 

### **GitHub Project board** 

**Backlog → Ready → In Progress → In Review → Testing → Done** 

প্ **র** তটি issue-নত owner, priority, expected output, route/API, dependency, acceptance criteria এবং test evidence থাকবব। 

### **Starter issue ownership (revised)** 

|**Ticket**|**Task**|**Owner**|
|---|---|---|
|**PRO-001**|Repository, CI, branch protections|Omor|
|**PRO-002**|Authentication, DB schema, authorization|Omor|
|**PRO-003**|Support-request API and provider access|Omor|
|**PRO-004**|Shared design system and navigation|Apurbo|
|**PRO-005**|Welcome and access preferences|Apurbo|
|**PRO-006**|Accessibility and responsive testing|Apurbo|
|**PRO-007**|Barta knowledge retrieval|Iftee|
|**PRO-008**|Grounded Bangla AI service|Iftee|
|**PRO-009**|Limited Bujhi extraction|Iftee|
|**PRO-010**|Pregnancy profile and timeline|Ifty|
|**PRO-011**|Maternal/baby records and conditions|Ifty|
|**PRO-012**|Report review and record association|Ifty|
|**PRO-013**|Wellness logging|Samin|



PROHOR  |  34 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

|**Ticket**|**Task**|**Owner**|
|---|---|---|
|**PRO-014**|Help-request UI and provider queue|Samin|
|**PRO-015**|Sample facility directory|Samin|
|**PRO-016**|Integrated end-to-end demonstration|All|
|**PRO-017**|AI, privacy and accessibility evaluation|All|
|**PRO-018**|Summary, video and final release|All|



### **Meeting routine** 

|**সেি**|**Duration**|**Purpose**|
|---|---|---|
|**Start of work**|15 min|Progress, today task, blocker|
|**Midday**|10–15 min|API/design/integration dependency resolve|
|**End of work**|30 min|Working demo, PR review, next-day task|



### **Definition of Done** 

- Agreed behaviour genuinely works; code builds; errors/empty states handled. 

- Keyboard/accessibility checks relevant to feature pass. 

- Data saves/retrieves correctly with authorization. 

- Relevant unit/integration/E2E tests pass. 

- PR reviewed and merged into develop. 

- A code push alone does not mean task is Done. 

PROHOR  |  35 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**22 | NON-NEGOTIABLE QUALITY** 

## **Safety, privacy, accessibility ও release gates** 

Healthcare product-এ সুন্দি interface যবথষ্ট েি; failure state, data ownership, source provenance এবং honest demo equally important। 

### **Healthcare + AI safeguards** 

- Barta approved-source RAG কিবব, retrieved evidence cite কিবব, uncertainty/abstention নদখাবব; individualized diagnosis/prescription নদবব ো। 

- Bujhi OCR/extraction field mandatory user review/correction োড়া confirmed health data হবব ো। 

- Unvalidated LLM diagnosis বা clinical urgency classification কিবব ো। Emergency-related information clinician-reviewed হবত হবব। 

- Self-reported, document-extracted, clinician-entered এবং clinician-confirmed data source, date/time ও unitসহ আোদা থাকবব। 

- AI API key server-only; absent key হবে unavailable/source-only state নদখাবব, fake answer েি। 

### **Privacy + permissions** 

- Supabase RLS/storage rules এবং server-side ownership/role validation সব exposed data path-এ থাকবব। 

- Caregiver automatic access পাবব ো; mother-approved granular, revocable consent োেবব। 

- Provider নকবে authorized request এবং scoped records নদখবব; consent preview/summary থাকবত হবব। 

- Private diary, AI history, OCR upload, medical record বা auth token public Cache Storage-এ cache কিা যাবব ো। 

- Synthetic medical data োড়া public development/demo environment-এ real health record বযবহাি কিবব ো। 

### **Accessibility & responsive QA** 

|**Test area**|**Minimum gate**|
|---|---|
|**Keyboard**|সবprimary action tab/keyboardরদবি; visible focus; focus trap/returnঠিক।|
|**Screen reader**|Labels, headings, status, errors, dialog purposeওchart text alternative announcement.|
|**Text/contrast**|Text scale, high contrast, existing themesএবংall actual text/control combinations.|
|**Responsive**|320px minimum; zoom/reflowএবংmobile soft-keyboard behaviour.|
|**Motion**|Reduced motion obey; non-essential animation off; no auto audio.|
|**Bangla**|Glyph/line-height, wrapping, input placeholder, numbers/unit and language metadata.|
|**Forms/data**|Date, unit, required fields, edit/undo, data provenance and failed submit.|
|**PWA/offline**|Manifest/installability/HTTPS; public shell only; clear offline/queued/sent labels.|



### **Release cut-off rules** 

- Day 3 core journey ো চেবে Bujhi extraction ও advanced UI enhancement postpone. 

- Day 4 core unstable হবে voice feature/expanded facility search বন্ধ. 

- Day 5-এি পি new major feature েি; critical fix, test, docs, release only. 

- Prerecorded/fake response-নক live AI রহবসবব নদখাবো যাবব ো। 

- Demo-ি simulated provider, sample facility, synthetic report স্পষ্ট label কিবত হবব. 

- Unimplemented clinician partnership, diagnosis, emergency triage, telemedicine বা full offline AI available ববে দারব কিবব ো. 

PROHOR  |  36 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**23 | PUBLIC WEBSITE** 

## **Public homepage-এর ১৫টি section** 

MaaCare-এি public homepage নকবে storytelling inspiration; PROHOR-এি copy, layout, visuals এবং interactions original হবব। Internal app-এ MaaCare-এি design copy কিা যাবব ো। 

|**#**|**Section**|**Purpose / requirements**|
|---|---|---|
|**01**|Accessible header + skip link|Brand, short anchors,বাংো/English, adjust access, sign-in, mobile menu.|
|**02**|Signature editorial hero|Original headline, concise product value, authentic licensed visual/illustration, task entry CTA.|
|**03**|Immediate task shortcuts|Ask PROHOR, track health, understand report, wellbeing, find care, request support.|
|**04**|Bangladesh context: unmet need|Fragmented records, difficult documents, communication/access barriers; stats only with verified<br>source/year.|
|**05**|One PROHOR, many ways to use it|একইhealthcare feature; screen reader/keyboardওoptional text/contrast/reduced motion/AAC etc.|
|**06**|Connected care journey|Task → record/review → source-grounded education → choose share → human follow-up.|
|**07**|Eight-module gallery|Use comfortably / understand and record / care for yourself / stay connected.|
|**08**|Mother + baby records spotlight|Distinct but linked records; synthetic data; clinician-confirmed vs self-reported source.|
|**09**|AI + report understanding|Barta retrieval/citation; Bujhi upload/OCR/review/explain/save; honest working/limited/future<br>labels.|
|**10**|Well-being without assumptions|Mood, fatigue, rest, optional mobility-neutral activity; no ranking/compulsory target.|
|**11**|Human connection + permissions|Mother controls what is shared; provider portal only if implemented or clearly simulated.|
|**12**|Find care + PWA|Facility list, verified/unknown accessibility attributes, visit prep, honest offline status.|
|**13**|Responsible AI, privacy, clinical<br>limits|Source-grounded answers, extracted-value review, consent, human medical decision-making.|
|**14**|FAQ + future roadmap|Sign-up, settings, medical advice boundary, privacy, offline; P0/P1/P2 honesty.|
|**15**|Final conversion + footer|Explore PROHOR, public education, sign-in, team and only real legal/privacy/contact links.|



#### **Homepage ownership** 

Public website ও engineering foundation Omor-led; Apurbo shared design system, components, accessibility primitives ও visual consistency-নত কাজ কিবব। Internal mother/provider dashboards সবসমি PROHOR DESIGN.md অেুসির্ কিবব। 

PROHOR  |  37 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

### **Public pages (pre-login)** 

|**URL**|**পৃষ্ঠ**|
|---|---|
|**/**|Homepage|
|**/how-it-works**|How It Works|
|**/features**|Explore Features|
|**/privacy**|Privacy|
|**/terms**|Terms|
|**/ask**|Public Barta education|
|**/find-care**|Poth public directory|
|**/safety**|Shonket reviewed safety information|
|**/accessibility**|Adapt access settings|



নোট _:_ েিরদবেিপুবিাবো _draft-_ এ _`/about`, `/for-mothers`, `/for-providers`, `/trust`, `/faq`-_ সহঅরতরিক্ত _public routes_ প্রস্তাবরেে। _Master Development Prompt-_ এি _canonical tree-_ নতউপবিি _route set_ আবে _;_ অরতরিক্ত _route_ নযাবেিআবে _team approval_ ও _route contract update_ কিবতহবব। 

### **Public route access rules** 

|**Route / action**|**Access ruleও truthful behaviour**|
|---|---|
|**Marketing pages**|Mission, product, how-it-works and feature information sign-inোড়াই পড়া যাবব.|
|**/ask — Barta**|Public generic maternal education allowed; private profile/health data consentোড়াretrieval contextহবব ো.|
|**/find-care — Poth**|Public searchable facility information; sample/unverified fieldsস্পষ্টlabelকিবত হবব.|
|**/safety — Shonket**|Reviewed educational safety information; AI diagnosisবাautomated urgency decisionেি.|
|**/accessibility — Adapt**|Access settings discoverable; user-নকdisability category declareকিবত হবব ো.|
|**Private mother records**|Profile, pregnancy, report, diary and private health actions-এি আবেjust-in-time authentication.|
|**Provider portal**|Provider role, request relationship and mother-approved consent server-side verifyো হবেaccess deny.|



#### **Public vs private boundary** 

Public website visitors-নক PROHOR নবাঝাবব। Authenticated mother/provider app আোদা experience shell-এ চেবব। Public homepage-এি CTA বাস্তবব কাবজি route-এ যাবব; placeholder button বা unimplemented service-নক active রহবসবব নদখাবব ো। 

PROHOR  |  38 

**PROHOR  |  TEAM EXECUTION HANDBOOK** INTERNAL WORKING DOCUMENT 

**24 | FINAL REFERENCE** 

## **Team sign-off checklist** 

এই checklist বযবহাি কবি role, implementation, integration এবং release readiness review কিবব। 

### **Team setup** 

- ☐ প **া** চজেই একই repo clone/install/run কিবত পাবি। 

- ☐ প্রবতযক member রেবজি branch ও assigned issue জাবে। 

- ☐ Revised ownership: Apurbo=Frontend; Iftee=AI; Ifty=Health records; Omor/Samin unchanged। 

- ☐ Shared component, API, DB schema ও migration owner সবাই জাবে। 

### **Core product** 

- ☐ Eight modules app shell-এ connected; scope labels honest। 

- ☐ Mother profile/health records save ও reload হি। 

- ☐ Bangla Barta real retrieved source cite কবি। 

- ☐ Bujhi extraction review-required; unverified value confirmed েি। 

- ☐ Wellness optional/private; care request authorized provider queue-নত যাি। 

### **Security & safety** 

- ☐ RLS/ownership/role policy tests pass। 

- ☐ Caregiver consent granular/revocable; provider scope enforced। 

- ☐ No real patient data in demo; no API secrets in frontend/Git। 

- ☐ No diagnosis, fake clinical advice, fake appointment or fake provider response। 

### **Release** 

- ☐ Build/lint/typecheck/tests pass and evidence attached। 

- ☐ Keyboard/screen-reader/contrast/320px/Bangla checks complete। 

- ☐ PWA install and safe offline state verified। 

- ☐ Deployed production smoke test complete। 

- ☐ One-page summary, 3-minute captioned video, AI/data provenance ready। 

### **Source documents used** 

- PROHOR 6 Day Hackathon.md — original six-day execution plan, first team role mapping, day-wise task tables, MVP scope, technical stack, data/API ownership, GitHub strategy, quality gates, public website and design review. 

- PROHOR_MASTER_DEVELOPMENT_PROMPT.md — authoritative project vision, naming, full eight-module capability inventory, 24-capability roadmap, repository tree, folder ownership, technical non-negotiables and six-day handoffs. 

- All_about_prohor(combining_disable_non_disable_section_work)Covering_moduls_too.pdf — inclusive UX, accessibility needs, eight-module interaction expectations and failure/error handling blueprint. 

- User-confirmed final team revision in this conversation — Apurbo receives Iftee’s former frontend/design/accessibility work; Iftee receives Ifty’s former AI/Barta work; Ifty receives Apurbo’s former maternal/baby health work; Omor and Samin remain unchanged. 

PROHOR  |  39 

