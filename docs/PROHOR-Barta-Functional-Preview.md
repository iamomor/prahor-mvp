# Barta functional preview

## Try the full flow

Open `/ask` on a local development server and choose the answer language or Auto. Ask “What does ANC mean?”, then type “What happens there?” and “What about food?”. Barta carries the previous cited chunk ID between these turns. Try “exclusive breastfeeding mane ki?” in Auto and then clear the conversation.

The browser holds the conversation in this tab’s memory until it is cleared or the page reloads. Safety and scope replies remain visible as text. Temporary request failures keep the draft available for retry. New requests contain the current question and, when available, a previous public chunk ID. The API retains no conversation history. Use synthetic questions for Gemini testing and keep the server key local.

## Source register for this preview

Each entry has an original Bangla and English paraphrase with matched version, locator, topic, stage, audience and reuse record. The public sources listed below were checked by the project on 16 November 2026. The next source check is due by 16 May 2027. The runtime excludes that version upon expiration until a recheck is recorded. Project reference checks provide source attribution and scope information. Clinical review status is unassigned.

| Topic | Source and locator | Publication |
| --- | --- | --- |
| ANC definition and visit purpose | [WHO ANC executive summary](https://www.who.int/publications/i/item/WHO-RHR-16.12), Overview | 2016 |
| Nutrition discussions | [WHO ANC executive summary, PDF](https://iris.who.int/bitstream/handle/10665/250800/WHO-RHR-16.12-eng.pdf), Table 1, printed p. 3, A.1.1 | 2016 |
| Exclusive breastfeeding | [WHO breastfeeding Q&A](https://www.who.int/news-room/questions-and-answers/item/breastfeeding), first question | 2024 |
| Postnatal care | [WHO maternal and newborn postnatal guideline](https://www.who.int/publications/i/item/9789240045989), Overview | 2022 |
| Essential newborn care | [WHO essential newborn care course](https://www.who.int/publications/b/80293), second edition, Overview | 2025 |

For a new source, record its issuing body, applicable local context, version, stable URL, rights and the exact section or printed page. Use project-authored educational summaries where appropriate. Preserve the text and page mapping of any licensed excerpt through section extraction and OCR correction. Record approval, recheck date and Bangla/English equivalence before publishing a passage. Mark superseded passages withdrawn. Barta suppresses passages from older versions of the same source.

## Implementation and remaining work

| Area | Available in this preview | Outstanding |
| --- | --- | --- |
| Conversation | Bilingual topics, selected Banglish aliases, automatic or explicit answer language, local history, known follow-up patterns | Broader Banglish and dialect evaluation, flexible follow-ups, voice |
| Knowledge | Hand-selected WHO, Bangladesh DGHS and UNICEF Bangladesh references with source versions and expiry | Wider Bangladesh coverage, ingestion and OCR, review tools |
| Retrieval | Curated exact aliases, cross-language pairs, BM25 shortlist, optional Gemini selection in development | Multilingual embeddings, cross-encoder, broader paraphrase evaluation |
| Answers | Server returns verbatim project-reviewed passage with sentence-level links to its chunk and real source metadata. Gemini can select an allowed shortlist ID in synthetic local tests. | Sentence-level model-written answers would require claim-level evaluation and verification before they can be served |
| Uncertainty and safety | Existing safety gate runs before context resolution. Conflicting exact aliases produce an abstention with conflict copy. | Broader conflict detection and verified Bangladesh referral directory integration |
| Operations | No persistent transcript. Synthetic Gemini preview diagnostics report outcomes without logging question text or keys. | Authenticated approval dashboard, clinician queue, feedback and consent-based audit with access controls and retention policy |

## Checks

Run lint, typecheck and Barta contract tests. Preview the education and safety flows in a browser before pushing.

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:contracts -- barta
$env:PLAYWRIGHT_CHANNEL = 'chrome'
$env:PROHOR_TEST_URL = 'http://localhost:3000'
npm.cmd run test:e2e -- barta-conversation-flow.spec.ts barta-education.spec.ts barta-safety-api.spec.ts
```

## Handling incomplete questions and typos

The education route checks safety first. Selected misspellings of existing urgent cues go through the same fixed safety response. A complete education question can differ from a reviewed question by one character edit or transposition in one word. Ambiguous matches and topic fragments ask the user to clarify. In the local Gemini preview, model-only matches suggest a reviewed question for confirmation.

The education API returns `action_level`, `abstained`, `confidence` and the answer in the requested locale. Each answer claim lists the selected chunk ID. High confidence applies to the source match and does not describe a medical assessment. The current verifier checks that the displayed sentences reconstruct the selected passage. There is no clinical model in the urgent-care path.

## Hackathon walkthrough

1. In **Auto**, enter `pregnancy te ki ki khawa uchit?`. The Bengali answer cites the Bangladesh DGHS manual, printed page 113.
2. In **English**, enter `What are the stages of pregnancy? How do I prepare a birth plan?`. Each paragraph links to its own source.
3. Enter `Baccha ager moto norachora kortese na.` as a synthetic safety test. The urgent route bypasses retrieval and returns the fixed message.
4. Enter `Can I take this medicine?` to see the professional-care route, or `Breastfeeding` for a clarification.

Open **More questions** to explore the additional pregnancy topics. Twelve example questions cover ten categories.

| New evidence | Locator | Applicability |
| --- | --- | --- |
| [UNICEF Bangladesh, Your first trimester guide](https://www.unicef.org/bangladesh/en/parenting-bd/your-first-trimester-guide) | Explore stages of pregnancy | Family education in Bangladesh |
| [DGHS, Maternal and Newborn Health Service Accreditation Manual](https://hospitaldghs.gov.bd/wp-content/uploads/2023/05/MNH-Service-Accreditation-Manual_Clean_Cor-14-4-23.pdf) | Maternal nutrition poster, printed page 113 | Bangladesh maternal health |
| [WHO, Pre-eclampsia](https://www.who.int/news-room/fact-sheets/detail/pre-eclampsia) | Overview and Symptoms | General pregnancy education |
| [WHO, Perinatal mental health in maternal and child health services](https://www.who.int/publications/i/item/9789240057142) | Overview | Pregnancy and after birth |
| [WHO, Making plans for childbirth when pregnant](https://www.who.int/tools/your-life-your-health/life-phase/pregnancy--birth-and-after-childbirth/making-plans-for-childbirth-when-pregnant) | Tips and information | General birth preparedness |

The corpus contains short bilingual summaries with source links. Source reference checks are separate from clinical review. The severe-headache and reduced-movement test cases were checked against the [NHS guidance on headaches in pregnancy](https://www.nhs.uk/pregnancy/common-symptoms/headaches/) and [fetal movements](https://www.nhs.uk/pregnancy/keeping-well/your-babys-movements/). Barta uses its existing local care message. The demo does not use NHS service numbers.

The retrieval shortlist combines BM25 with character trigrams. Optional Gemini preview receives eligible passages and returns a passage ID or no match. A model-only match remains a suggested question. Direct answers and two-question summaries are assembled from active source text, with sentence-level citations. The demo does not use a dense embedding index or model-written clinical text.

## Conversation continuity and accessible audio

Changing answer language preserves the draft, the tab's transcript, and eligible follow-up context. Earlier answers keep their original language and citations. Clear conversation discards the transcript and stops active audio. The transcript lives in memory for this tab. Each API request still sends only the current question, language choice, and an optional public source chunk ID.

Use **Read aloud** to hear a reply using a matching browser voice. Barta prefers a local voice. Some browser-provided voices use an online service. Voice input requests microphone access only after **Start microphone**. The browser may send audio to its own speech service. The transcript is added to the draft, where the user can review or correct it before submitting. The full chat and help states are available as text. The question composer has a microphone and an independent speech language selector. Auto uses the current chat language for the next recording. Use the explicit Bengali or English setting when dictating in a different language. Each recording uses one recognition language.

The PDF test set and master question bank are evaluation inputs. Initial automated cases cover language switching, informal greetings, antenatal timing, ultrasound, food safety, mild nausea, ambiguous fragments, and urgent speech-transcript variants. Remaining rows include locally verified services, complex symptom combinations, and individualized care that needs its own evidence and human escalation. Draft routing labels in the files do not establish clinical approval.

| Added reference | Sections |
| --- | --- |
| [WHO, New guidelines on antenatal care](https://www.who.int/news/item/07-11-2016-new-guidelines-on-antenatal-care-for-a-positive-pregnancy-experience) | WHO contact model and ultrasound recommendations |
| [UNICEF Bangladesh, What to avoid when pregnant](https://www.unicef.org/bangladesh/en/parenting-bd/child-development/what-avoid-when-pregnant) | Foods to avoid and food safety |
| [NHS, Vomiting and morning sickness](https://www.nhs.uk/pregnancy/common-symptoms/vomiting-and-morning-sickness/) | Mild nausea guidance and getting medical help |
| [CDC, Urgent maternal warning signs](https://www.cdc.gov/hearher/maternal-warning-signs/index.html) | Breathing difficulty, inability to keep fluids down, and bleeding |

For a browser check, keep an English answer visible, switch to Bangla, and ask a follow-up. Then check microphone permission, draft editing, stopping playback, and the typing path on the intended demo device.


## Supplied question set coverage

Barta recognizes all 311 PDF case IDs and the 497 populated question variants from the 168 workbook rows. The runtime catalog records prompt text, source ID, topic, and the supplied draft expected outcome. A limited direct mapping links supported topics to verified education. Other recognized questions receive an appropriate safety reply, a suggestion, a service-verification message, or an explicit evidence gap. The question files do not establish medical evidence or validate the fixed safety messages. The exact warning examples are scoped to maternal and newborn signs checked against CDC, Bangladesh DGHS, and NHS guidance. Supportive reporting of harm incorporates the safety and support principles in the WHO violence handbook.

Additional source-backed questions cover [doing a pregnancy test](https://www.nhs.uk/pregnancy/trying-for-a-baby/doing-a-pregnancy-test/), [WHO guidance on iron and folic acid](https://www.who.int/tools/elena/interventions/daily-iron-pregnancy) and [expected and changed fetal movement](https://www.nhs.uk/pregnancy/keeping-well/your-babys-movements/). Personal symptoms and decisions can still require a health professional. The uploaded test files carry draft intent labels and do not replace these references.

## Server-generated read aloud

To use MP3 read-aloud when a system voice fails, enable an Azure Speech resource and set these server-side variables in `.env.local`. Restart Next.js and submit a fresh test question. Environment configuration is never committed.

```dotenv
BARTA_AZURE_SPEECH_KEY=your_azure_speech_resource_key
BARTA_AZURE_SPEECH_REGION=your_resource_region
```

With this configuration, answer cards request their MP3 only when the user clicks **Read aloud**. When it is ready, a native player appears with Play and volume controls. The audio endpoint accepts only text and language signed by the chat server. The speech provider receives just the answer text and voice settings. It never receives the question, transcript or microphone audio through this endpoint. Azure Speech uses the Bangla (Bangladesh) Nabanita voice or English Sonia voice at a slightly slower rate. If the service is unavailable, the user can try a browser voice. Browser playback stops waiting when the engine does not report a start.

A question such as `আমার পিরিয়ড চলতেছে আমি কি করবো` prompts the user to clarify whether this is their usual period, possible pregnancy with bleeding or recent childbirth. Normal cramps refer to [NHS period pain guidance](https://www.nhs.uk/symptoms/period-pain/). Possible pregnancy with bleeding and bleeding after birth use separate fixed guidance based on [NHS pregnancy bleeding](https://www.nhs.uk/pregnancy/common-symptoms/vaginal-bleeding/) and [NHS postnatal bleeding guidance](https://www.nhs.uk/pregnancy/labour-and-birth/early-days/).

## Expanded answers and compact references

The Bengali ANC visit explanation now uses the WHO maternal interventions handbook to cover booking, routine checks, later visits, birth preparation and questions to take away. Additional reviewed topics cover use of antenatal records, blood-pressure monitoring, exercise, a chosen birth companion, breastfeeding positioning, and a glucose tolerance test. The user’s care team determines which checks and preparations apply to them.

Source links show the publisher and year where known. Open Citation details for the full title and locator. The microphone and speech language controls remain visible under the draft and stack on narrow screens. If a browser voice fails, the notice appears beside the affected answer. Read aloud prepares the audio, then the Play button starts it. Starting the microphone pauses any active playback.

To check why an answer uses browser audio, submit a new question after restarting Next.js. The response from `/api/ai/chat` should contain `audioTicket` when the Azure Speech key and region are available to the server. Check the presence of this field only. Never include keys in screenshots or messages.

## Read aloud on Windows without a speech subscription

Install the free local speech engine with `winget install --id eSpeak-NG.eSpeak-NG -e`. Stop Next.js and open a new PowerShell window in the project folder. Run these commands in that same window.

```powershell
$espeakApp = Get-Command espeak-ng.exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
if ($espeakApp) {
    $env:BARTA_ESPEAK_PATH = $espeakApp.Source
} else {
    $env:BARTA_ESPEAK_PATH = Join-Path $env:ProgramFiles 'eSpeak NG\espeak-ng.exe'
}
if (-not (Test-Path -LiteralPath $env:BARTA_ESPEAK_PATH -PathType Leaf)) {
    throw 'eSpeak NG executable was not found. Set BARTA_ESPEAK_PATH to the full path to espeak-ng.exe.'
}
$env:BARTA_AUDIO_SIGNING_KEY = node -p "require('node:crypto').randomBytes(32).toString('hex')"
& $env:BARTA_ESPEAK_PATH --voices=bn
npm.cmd run dev
```

Open Barta and try **Read aloud** on a fresh Bangla reply and an English reply. Use **Listen to the Barta guide** for the controls and suggested topics. The local engine creates WAV files on demand and speaks full reply text, with citation details and suggested follow-ups where present. It uses a synthetic voice and needs no speech API subscription. The local voice uses a slower Bangla pace and speech-only pronunciation and pause adjustments for common initials and sentence boundaries. Local synthesis needs the executable on the machine hosting Next.js. PowerShell environment values apply to this session. Keep the signing key server-side and out of commits.
