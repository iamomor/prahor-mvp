# PROHOR — linked user journeys and navigation

## Universal entry (one journey, two optional actions)
1. Any mother opens `/` and receives a fully keyboard- and screen-reader-accessible page.
2. Choose a direct task: Ask PROHOR, My Health, My Wellness, Find Care, or request help. The optional “Adjust how you use PROHOR” button is available immediately.
3. If the task is public educational content, proceed without health-profile gate. If it saves/opens private records, ask for accessible authentication just-in-time.
4. If preferences are changed, preserve draft state and task destination.
5. Offer a basic care profile only when a specific feature needs information; do not force unnecessary disability questions.
6. Later visits resume on the dashboard/last relevant task with preferences retained.

## Example A — default presentation
Ayesha opens `/` → chooses My Health → signs in only when asked to view private data → records self-reported observation → sees an accurate save confirmation → returns to dashboard. She may enable any preference later; no category called “non-disabled.”

## Example B — alternate interaction
Nusrat opens the same `/` → selects “Adjust how you use PROHOR” → enables AAC question-composition and a spacious layout, but NOT automatically simplified language → continues to Ask PROHOR → reviews composed message → receives source-grounded text response → selects Human Support → reviews approved record fields and preferred non-voice communication method → sends to a *simulated* provider → sees actual delivery and acknowledgment states.

## Additional edge journeys
**Blind / screen reader:** start page is already structured; navigate headings, labeled fields, question and evidence; view chart via table alternative; report view is structured text. Never require sight to turn on access.
**Deaf / hard of hearing:** all essential interactions and help alternatives in text; no mandatory audio or calls.
**Deafblind / braille:** semantic text and keyboard behavior support compatible assistive technology; full device coverage must be tested rather than asserted.
**Limited dexterity / tremor:** no drag-only input; forgiving control targets, spaced destructive controls, clear Undo/review.
**Cognitive support:** allow simple reviewed language and guided steps without changing consent rights or hiding critical facts.
**Fatigue / unreliable network:** optional save-and-return, draft recovery; if request remains on device, label “Not sent” accurately.

## Cross-module map
- Adapt → presentation, communication and accessibility applied throughout.
- Barta → knowledge answers with references; link to Shonket when users seek human guidance, not AI clinical triage.
- Shonket → reviewed urgent-care info and Bondhon care-request creation.
- Jibonrekha → separate maternal and baby record sets with shared pregnancy journey; records linked to Bujhi verification and Bondhon authorized sharing.
- Bujhi → upload supported report → extract → user verify → educational explanation → file under correct mother/baby history.
- Shusthota → private optional wellness entries with user-selected sharing; no compulsory movement target.
- Poth → searchable verified facility list, accessible list and directions, contact/visit preparation; never invent availability.
- Bondhon → request type, approved summary, chosen recipient and consent, send, accurate status, authorized provider queue.

## Essential interaction states per flow
**Loading:** accessible status with content skeleton where useful; avoid repeating announcements.
**Empty:** plain-language next action and example, never fake records.
**Error:** field-specific action to correct plus retry; preserve inputs.
**Offline:** clear local-only vs remotely saved distinction; do not mislabel queued help as sent.
**Success:** concrete evidence of completed action, timestamp and destination where relevant.
**Consent:** recipient + specific information + purpose + explicit confirmation and revocation path.
