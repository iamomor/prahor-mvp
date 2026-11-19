# Barta conversation and source coverage

| Supplied material | Implementation |
| --- | --- |
| Coverage brief and screenshot | Barta asks one clear stage question, offers editable Bangla/English choices, and understands a typed answer such as “pore” after a headache report. A timing-only reply keeps the clarification open. A completed stage reply uses the reported symptom and links to relevant reviewed topics. |
| Concept map and stage replies | Everyday English, Bangla and Banglish phrasing maps to reviewed passages or relevant clarification choices. A bare “pore” without context asks what the user meant. |
| Short conversational messages | Greetings, thanks, check-ins, and similar messages have fixed localized replies. Existing emoji, symbol input, citation, and audio paths stay in use. |
| Knowledge fallback | Exact reviewed passages take priority. An inferred topic is offered for confirmation. An uncovered subject is named plainly instead of being presented as covered by a related passage. |
| Safety and scope | Current disclosures take priority over conversation state. The supplied breathing, seizure, postpartum distress and medication wording is covered. A separate regression check covers severe or persistent headache after birth and Bangla reports of a baby not breathing. |
| Supplied evaluation set | Both fixtures are retained without edits. Grades distinguish cited answers, relevant options, an honest scope reply, and escalation. An explicit answer in the wrong category fails the corresponding test. |

The browser sends the current question, the existing optional public citation ID, and, when needed, one allowlisted follow-up code from the previous reply in that tab. It sends no previous question text or transcript. The follow-up code is cleared when the flow ends or the conversation is cleared. It changes which clarification is shown and never authorizes access to records.

The symptom path uses fixed help wording and points to existing sources for education. References for checking urgency language include [CDC maternal warning signs](https://www.cdc.gov/hearher/maternal-warning-signs/), [NHS help for babies and young children](https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/), and [NHS postnatal depression guidance](https://www.nhs.uk/mental-health/conditions/postnatal-depression/).

## Gaps in the reviewed corpus

The supplied materials identify swelling, due-date calculation, twin pregnancy, sex in pregnancy, fasting in Ramadan, labour and caesarean birth, family planning, vaccination schedules, newborn jaundice, colds and coughs, fever, belly pain, weight-gain targets, and milk supply. The concept map can recognize these subjects. A dedicated answer requires a source with the appropriate audience and stage, an accurate Bangla translation, and review under the project’s existing evidence requirements before activation. Related material can still be offered with the gap stated explicitly.

## Verification

- Run the Barta contract suite, including both supplied fixtures, with `npm run test:contracts -- barta`.
- Run the conversation flow, everyday care, and safety API browser suites against the running app. The new browser test checks the exact request sent on “pore” and the resulting Bangla reply.
- Run the full app build before pushing. The contract suite can run independently of Vercel, so a passing contract run does not verify deployment or spoken audio.
