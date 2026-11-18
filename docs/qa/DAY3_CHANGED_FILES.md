# Start here: where the Day 3 changes are

Open **D:/prohor-day3-candidate** as your project folder. Its branch is
**omor-day3-conflict-resolution**. All edits are still uncommitted.
The separate **D:/prohor** folder remains on **omor** with its original files.
That is why Source Control in the original folder does not show these edits.

For VS Code:

```powershell
code -n D:\prohor-day3-candidate
```

In the candidate terminal, `git status --short` shows both modified and new files.
`git diff` shows existing-file edits; new untracked files are listed by status and
can be opened in your editor. They do not appear in an unstaged `git diff` yet.

## Six conflicts: what was implemented

| Conflict | Result in the candidate | Main file |
| --- | --- | --- |
| A: Barta chat | Preserve current Omor/Iftee chat behavior and add Apurbo's AAC/draft support. | [BartaChatStarter.tsx](../../src/features/barta/BartaChatStarter.tsx) |
| B: chat API | Keep Iftee's newer selector with Omor's validation, safety and response contracts. | [chat route](../../src/app/api/ai/chat/route.ts) |
| C: read-aloud | Share playback ownership across Adapt, Barta and the homepage. | [audio-session.ts](../../src/lib/audio-session.ts) |
| D: microphones | Keep separate question and medical-entry interfaces while coordinating microphone ownership. | [Barta hook](../../src/features/barta/use-barta-audio.ts), [Bujhi speech](../../src/features/bujhi/speech-service.ts) |
| E: generated audio | Keep one endpoint with Iftee's provider additions, ticket checks, fallback and output limits. | [audio route](../../src/app/api/ai/barta-audio/route.ts) |
| F: account preferences | Connect both panels to Omor's backend; correct mapping, ETags, failures and account switching. | [account-controller.ts](../../src/features/adapt/lib/account-controller.ts), [mapping](../../src/features/adapt/lib/account-mapping.ts) |

These are code fixes in the candidate, not changes already merged into omor,
develop or main. Live Supabase acceptance, hosted-provider and physical voice/device
checks remain; see [validation](DAY3_VALIDATION.md).

The refreshed remote tips still match the reviewed snapshots: Omor a38c00f,
Apurbo aea6bae, Iftee 7aa3ca0, Ifty d530dcd. Ifty's branch is older than his supplied
ZIP; the newer ZIP's record/review modules were selected. No Samin delivery was supplied.
Fresh typecheck, lint and all 175 contract tests passed during this recheck.

## Existing files changed (37)

- [docs/API_PREFERENCES.md](../../docs/API_PREFERENCES.md)
- [docs/architecture/api-contracts.md](../../docs/architecture/api-contracts.md)
- [package-lock.json](../../package-lock.json)
- [package.json](../../package.json)
- [src/app/(marketing)/accessibility/page.tsx](../../src/app/(marketing)/accessibility/page.tsx)
- [src/app/api/ai/barta-audio/route.ts](../../src/app/api/ai/barta-audio/route.ts)
- [src/app/api/ai/chat/route.ts](../../src/app/api/ai/chat/route.ts)
- [src/app/layout.tsx](../../src/app/layout.tsx)
- [src/components/accessibility/AccessPreferencesPanel.tsx](../../src/components/accessibility/AccessPreferencesPanel.tsx)
- [src/components/marketing/HomePreferences.tsx](../../src/components/marketing/HomePreferences.tsx)
- [src/components/marketing/HomeStory.tsx](../../src/components/marketing/HomeStory.tsx)
- [src/components/marketing/care/use-sample-speech.ts](../../src/components/marketing/care/use-sample-speech.ts)
- [src/components/marketing/preference-bootstrap.ts](../../src/components/marketing/preference-bootstrap.ts)
- [src/features/adapt/server/handlers.ts](../../src/features/adapt/server/handlers.ts)
- [src/features/barta/BartaAccessControl.tsx](../../src/features/barta/BartaAccessControl.tsx)
- [src/features/barta/BartaAudioFile.tsx](../../src/features/barta/BartaAudioFile.tsx)
- [src/features/barta/BartaChatStarter.tsx](../../src/features/barta/BartaChatStarter.tsx)
- [src/features/barta/BartaEducationChat.tsx](../../src/features/barta/BartaEducationChat.tsx)
- [src/features/barta/approved-knowledge.ts](../../src/features/barta/approved-knowledge.ts)
- [src/features/barta/audio-ticket.ts](../../src/features/barta/audio-ticket.ts)
- [src/features/barta/barta-education.module.css](../../src/features/barta/barta-education.module.css)
- [src/features/barta/chat-language.ts](../../src/features/barta/chat-language.ts)
- [src/features/barta/conversation.ts](../../src/features/barta/conversation.ts)
- [src/features/barta/education-corpus.ts](../../src/features/barta/education-corpus.ts)
- [src/features/barta/education-topics.ts](../../src/features/barta/education-topics.ts)
- [src/features/barta/use-barta-audio.ts](../../src/features/barta/use-barta-audio.ts)
- [src/features/bondhon/CareRequestStarter.tsx](../../src/features/bondhon/CareRequestStarter.tsx)
- [src/i18n/translations.ts](../../src/i18n/translations.ts)
- [src/lib/access-preferences.ts](../../src/lib/access-preferences.ts)
- [src/lib/contracts/adapt.ts](../../src/lib/contracts/adapt.ts)
- [src/lib/contracts/current-api.ts](../../src/lib/contracts/current-api.ts)
- [src/styles/prohor-tokens.css](../../src/styles/prohor-tokens.css)
- [tests/barta-audio.spec.ts](../../tests/barta-audio.spec.ts)
- [tests/barta-integration.spec.ts](../../tests/barta-integration.spec.ts)
- [tests/contracts/preferences.spec.ts](../../tests/contracts/preferences.spec.ts)
- [tests/homepage-care.spec.ts](../../tests/homepage-care.spec.ts)
- [tests/homepage.spec.ts](../../tests/homepage.spec.ts)

## New code, module files and tests (102)

- [src/app/(marketing)/accessibility/SettingsContent.tsx](../../src/app/(marketing)/accessibility/SettingsContent.tsx)
- [src/app/(marketing)/bujhi/page.tsx](../../src/app/(marketing)/bujhi/page.tsx)
- [src/app/(marketing)/demo/bujhi/page.tsx](../../src/app/(marketing)/demo/bujhi/page.tsx)
- [src/app/(marketing)/demo/jibonrekha/page.tsx](../../src/app/(marketing)/demo/jibonrekha/page.tsx)
- [src/app/(marketing)/jibonrekha/page.tsx](../../src/app/(marketing)/jibonrekha/page.tsx)
- [src/app/api/poth/facilities/route.ts](../../src/app/api/poth/facilities/route.ts)
- [src/app/api/poth/nearby/route.ts](../../src/app/api/poth/nearby/route.ts)
- [src/app/app/bujhi/page.tsx](../../src/app/app/bujhi/page.tsx)
- [src/app/app/jibonrekha/page.tsx](../../src/app/app/jibonrekha/page.tsx)
- [src/app/poth/page.tsx](../../src/app/poth/page.tsx)
- [src/components/accessibility/AccessPreferencesControl.tsx](../../src/components/accessibility/AccessPreferencesControl.tsx)
- [src/components/accessibility/ContrastPreferenceControl.tsx](../../src/components/accessibility/ContrastPreferenceControl.tsx)
- [src/components/accessibility/LiveRegion.tsx](../../src/components/accessibility/LiveRegion.tsx)
- [src/components/accessibility/ScreenReaderOnly.tsx](../../src/components/accessibility/ScreenReaderOnly.tsx)
- [src/components/ui/AppButton.tsx](../../src/components/ui/AppButton.tsx)
- [src/components/ui/AppCard.tsx](../../src/components/ui/AppCard.tsx)
- [src/components/ui/AppDialog.tsx](../../src/components/ui/AppDialog.tsx)
- [src/components/ui/AppInput.tsx](../../src/components/ui/AppInput.tsx)
- [src/components/ui/AppSelect.tsx](../../src/components/ui/AppSelect.tsx)
- [src/components/ui/StatusBadge.tsx](../../src/components/ui/StatusBadge.tsx)
- [src/features/adapt/components/AACComposer.tsx](../../src/features/adapt/components/AACComposer.tsx)
- [src/features/adapt/components/AdaptSettingsPanel.tsx](../../src/features/adapt/components/AdaptSettingsPanel.tsx)
- [src/features/adapt/components/CloudSyncSection.tsx](../../src/features/adapt/components/CloudSyncSection.tsx)
- [src/features/adapt/components/PreferenceConflictDialog.tsx](../../src/features/adapt/components/PreferenceConflictDialog.tsx)
- [src/features/adapt/components/PreferenceRuntime.tsx](../../src/features/adapt/components/PreferenceRuntime.tsx)
- [src/features/adapt/components/ReadAloudButton.tsx](../../src/features/adapt/components/ReadAloudButton.tsx)
- [src/features/adapt/hooks/useAdaptPreferences.ts](../../src/features/adapt/hooks/useAdaptPreferences.ts)
- [src/features/adapt/hooks/usePreferenceSync.ts](../../src/features/adapt/hooks/usePreferenceSync.ts)
- [src/features/adapt/hooks/useSpeechSynthesis.ts](../../src/features/adapt/hooks/useSpeechSynthesis.ts)
- [src/features/adapt/index.ts](../../src/features/adapt/index.ts)
- [src/features/adapt/lib/aac-events.ts](../../src/features/adapt/lib/aac-events.ts)
- [src/features/adapt/lib/aac-phrases.ts](../../src/features/adapt/lib/aac-phrases.ts)
- [src/features/adapt/lib/account-controller.ts](../../src/features/adapt/lib/account-controller.ts)
- [src/features/adapt/lib/account-mapping.ts](../../src/features/adapt/lib/account-mapping.ts)
- [src/features/adapt/lib/account-runtime.ts](../../src/features/adapt/lib/account-runtime.ts)
- [src/features/adapt/lib/preference-helpers.ts](../../src/features/adapt/lib/preference-helpers.ts)
- [src/features/adapt/lib/preference-sync.ts](../../src/features/adapt/lib/preference-sync.ts)
- [src/features/adapt/lib/speech-engine.ts](../../src/features/adapt/lib/speech-engine.ts)
- [src/features/adapt/types/adapt.types.ts](../../src/features/adapt/types/adapt.types.ts)
- [src/features/barta/bundled-speech.ts](../../src/features/barta/bundled-speech.ts)
- [src/features/barta/chat-small-talk.ts](../../src/features/barta/chat-small-talk.ts)
- [src/features/barta/fish-speech.ts](../../src/features/barta/fish-speech.ts)
- [src/features/barta/openrouter-intent.ts](../../src/features/barta/openrouter-intent.ts)
- [src/features/bujhi/AncReportEntry.tsx](../../src/features/bujhi/AncReportEntry.tsx)
- [src/features/bujhi/DataJudgement.tsx](../../src/features/bujhi/DataJudgement.tsx)
- [src/features/bujhi/ENTRY_INTEGRATION.md](../../src/features/bujhi/ENTRY_INTEGRATION.md)
- [src/features/bujhi/ImageMedicalEntry.tsx](../../src/features/bujhi/ImageMedicalEntry.tsx)
- [src/features/bujhi/ManualMedicalEntry.tsx](../../src/features/bujhi/ManualMedicalEntry.tsx)
- [src/features/bujhi/MedicalEntry.tsx](../../src/features/bujhi/MedicalEntry.tsx)
- [src/features/bujhi/ReportContextEditor.tsx](../../src/features/bujhi/ReportContextEditor.tsx)
- [src/features/bujhi/ReportReview.tsx](../../src/features/bujhi/ReportReview.tsx)
- [src/features/bujhi/ReportUpload.tsx](../../src/features/bujhi/ReportUpload.tsx)
- [src/features/bujhi/UPLOAD.md](../../src/features/bujhi/UPLOAD.md)
- [src/features/bujhi/VoiceMedicalEntry.tsx](../../src/features/bujhi/VoiceMedicalEntry.tsx)
- [src/features/bujhi/demo-report.ts](../../src/features/bujhi/demo-report.ts)
- [src/features/bujhi/medical-entry.browser.test.mjs](../../src/features/bujhi/medical-entry.browser.test.mjs)
- [src/features/bujhi/ocr-parser.ts](../../src/features/bujhi/ocr-parser.ts)
- [src/features/bujhi/ocr-service.ts](../../src/features/bujhi/ocr-service.ts)
- [src/features/bujhi/report-normalization.ts](../../src/features/bujhi/report-normalization.ts)
- [src/features/bujhi/report-quality.ts](../../src/features/bujhi/report-quality.ts)
- [src/features/bujhi/report-schema.ts](../../src/features/bujhi/report-schema.ts)
- [src/features/bujhi/speech-parser.ts](../../src/features/bujhi/speech-parser.ts)
- [src/features/bujhi/speech-service.ts](../../src/features/bujhi/speech-service.ts)
- [src/features/bujhi/types.ts](../../src/features/bujhi/types.ts)
- [src/features/bujhi/upload-validation.ts](../../src/features/bujhi/upload-validation.ts)
- [src/features/bujhi/upload.browser.test.mjs](../../src/features/bujhi/upload.browser.test.mjs)
- [src/features/bujhi/validation.test.mjs](../../src/features/bujhi/validation.test.mjs)
- [src/features/bujhi/validation.ts](../../src/features/bujhi/validation.ts)
- [src/features/jibonrekha/BabyHealthRecord.tsx](../../src/features/jibonrekha/BabyHealthRecord.tsx)
- [src/features/jibonrekha/ClinicalHistory.tsx](../../src/features/jibonrekha/ClinicalHistory.tsx)
- [src/features/jibonrekha/ConsentAndSummary.tsx](../../src/features/jibonrekha/ConsentAndSummary.tsx)
- [src/features/jibonrekha/HealthDashboard.tsx](../../src/features/jibonrekha/HealthDashboard.tsx)
- [src/features/jibonrekha/HealthHistory.tsx](../../src/features/jibonrekha/HealthHistory.tsx)
- [src/features/jibonrekha/INTEGRATION.md](../../src/features/jibonrekha/INTEGRATION.md)
- [src/features/jibonrekha/MaternalHealthForm.tsx](../../src/features/jibonrekha/MaternalHealthForm.tsx)
- [src/features/jibonrekha/PregnancyProfile.tsx](../../src/features/jibonrekha/PregnancyProfile.tsx)
- [src/features/jibonrekha/RecordsWorkspace.tsx](../../src/features/jibonrekha/RecordsWorkspace.tsx)
- [src/features/jibonrekha/V2_QA.md](../../src/features/jibonrekha/V2_QA.md)
- [src/features/jibonrekha/demo-health.test.mjs](../../src/features/jibonrekha/demo-health.test.mjs)
- [src/features/jibonrekha/demo-health.ts](../../src/features/jibonrekha/demo-health.ts)
- [src/features/jibonrekha/integration-contracts.ts](../../src/features/jibonrekha/integration-contracts.ts)
- [src/features/jibonrekha/records-model.ts](../../src/features/jibonrekha/records-model.ts)
- [src/features/jibonrekha/records-ui.tsx](../../src/features/jibonrekha/records-ui.tsx)
- [src/features/jibonrekha/records-v2.browser.test.mjs](../../src/features/jibonrekha/records-v2.browser.test.mjs)
- [src/features/jibonrekha/records-v2.test.mjs](../../src/features/jibonrekha/records-v2.test.mjs)
- [src/features/poth/PothCareCoverage.tsx](../../src/features/poth/PothCareCoverage.tsx)
- [src/features/poth/PothDirectoryMvp.tsx](../../src/features/poth/PothDirectoryMvp.tsx)
- [src/features/poth/PothEmergencySOS.tsx](../../src/features/poth/PothEmergencySOS.tsx)
- [src/features/poth/PothFacilityExplorer.tsx](../../src/features/poth/PothFacilityExplorer.tsx)
- [src/features/poth/PothNearbyMap.tsx](../../src/features/poth/PothNearbyMap.tsx)
- [src/features/poth/PothVisitPreparation.tsx](../../src/features/poth/PothVisitPreparation.tsx)
- [src/features/poth/bdDistricts.ts](../../src/features/poth/bdDistricts.ts)
- [src/features/poth/facilities.json](../../src/features/poth/facilities.json)
- [src/features/poth/nearbyCore.ts](../../src/features/poth/nearbyCore.ts)
- [src/features/poth/pothFacilityStore.ts](../../src/features/poth/pothFacilityStore.ts)
- [src/lib/audio-session.ts](../../src/lib/audio-session.ts)
- [src/lib/bounded-response.ts](../../src/lib/bounded-response.ts)
- [src/lib/contracts/poth-current.ts](../../src/lib/contracts/poth-current.ts)
- [src/lib/use-hydrated.ts](../../src/lib/use-hydrated.ts)
- [tests/contracts/day3-audio.spec.ts](../../tests/contracts/day3-audio.spec.ts)
- [tests/contracts/day3-integration.spec.ts](../../tests/contracts/day3-integration.spec.ts)
- [tests/day3-integration.spec.ts](../../tests/day3-integration.spec.ts)

## Other additions

- 152 bundled audio assets under `public/barta-voice/`.
- Documentation, screenshots and test logs under `docs/qa/`.
- The complete machine-readable file list is `workingChanges` in
  [DAY3_SOURCE_SELECTION.json](DAY3_SOURCE_SELECTION.json).

Read [the fix report](DAY3_FIX_REPORT.md) for the exact review/commit/PR process.
Nothing was committed, pushed, merged or deployed automatically.
