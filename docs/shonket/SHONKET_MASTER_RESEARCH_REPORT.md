# PROHOR SHONKET — Complete Master Research & Development Knowledge Base

**Research and verification date:** 18 November 2026.  
**Status:** This is a research and development knowledge base. It contains **no clinically approved content**. Every proposed clinical or Bangla wording must pass maternal-health clinical review, Bangla medical-translation review, accessibility review, and—where applicable—legal/service-owner review before publication.

PROHOR SHONKET should provide clinician-reviewed maternal safety information, accessible non-voice help requests, and honest service navigation. It must not present itself as an emergency dispatcher, diagnosis service, hospital network, or live healthcare-provider service; the existing Bondhon starter returns HTTP 501 with `not_sent`, so no request can truthfully be represented as sent, received, assigned, acknowledged, or answered. 

***

## 1. Executive Summary

SHONKET’s minimum viable product should focus on **verified safety education, accessible help-seeking, truthful status communication, and a minimal privacy-protective request workflow**. It should not attempt to become a general medical chatbot, diagnostic tool, or emergency-dispatch platform.

### What SHONKET needs

| Need | Practical implication |
|---|---|
| Clinician-reviewed warning-sign education | Publish only approved pregnancy, childbirth, and postpartum warning information with exact source citations |
| Bangladesh-specific navigation | Use verified DGHS/MoHFW services and avoid inventing facility availability or referral guarantees |
| Accessible human help | Provide text-first, AAC-friendly, screen-reader-compatible request options; do not require voice |
| Perinatal mental-health support | Provide non-diagnostic, non-stigmatizing support information and clear professional-help guidance |
| Honest request status | Distinguish draft, not sent, submitted, persisted, assigned, notified, acknowledged, response, closure, failure, and unverified delivery |
| Privacy by design | Collect only necessary information, obtain informed consent, restrict access, and retain audit evidence |

### What is not currently established

- A real human-care recipient, provider network, or acknowledgement workflow.
- A verified live facility directory or referral guarantee.
- A verified 999 maternal-emergency dispatch workflow.
- A complete Bangladesh legal implementation map for health-data processing.
- Sufficient direct user research with pregnant and postpartum mothers, including mothers with disabilities.

### Verified core services

The official Bangladesh government emergency-hotline page confirms that **999** is the national emergency service number, operates 24 hours, is free from any phone, and can connect users to police, fire service, ambulance service, or related information.  The official DGHS Shastho Batayon page confirms that **16263** provides direct doctor advice, health/hospital information, complaints, and ambulance **information**; it operates 24 hours and does not add a charge beyond normal mobile billing. [bangladesh.gov](https://bangladesh.gov.bd/site/page/aaebba14-f52a-4a3d-98fd-a3f8b911d3d9/%E0%A6%9C%E0%A6%B0%E0%A7%81%E0%A6%B0%E0%A6%BF-%E0%A6%B9%E0%A6%9F%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%A8-)

***

## 2. Master Official Source Register

| Source ID | Title | Organization | Jurisdiction | Date / version | Language | URL | Relevant SHONKET use | Exact location | Reliability | Currency |
|---|---|---|---|---|---|---|---|---|---|---|
| BD-01 | National Action Plan for Maternal Health 2020–2030 | Ministry of Health and Family Welfare | Bangladesh | 27 June 2020 | English | [https://old.dghs.gov.bd/images/docs/Strategy/National%20Action%20Plan%20for%20Maternal%20Health%202020.pdf](https://old.dghs.gov.bd/images/docs/Strategy/National%20Action%20Plan%20for%20Maternal%20Health%202020.pdf) | Maternal-health strategy, ANC, PPH, eclampsia, referral, MPDSR | Strategic directions and thematic areas; exact pages require PDF extraction | Official government policy | Current policy baseline; confirm newer implementation updates |
| BD-02 | DGHS eToolkit: Antenatal Care | DGHS | Bangladesh | Portal lists 2018–2019 resources | Bangla | http://etoolkits.dghs.gov.bd/toolkits/bangladesh-mnch/antenatal-care | Bangla danger signs, ANC, safe motherhood | “গর্ভ ও প্রসবকালীন ৫টি বিপদচিহ্ন বিষয়ক কার্ড”; “মা ও নবজাতক বাঁচানোর সাফ কথা” | Official DGHS patient education | Portal current; underlying materials require date verification |
| BD-03 | Shastho Batayon 16263 | DGHS, MoHFW | Bangladesh | Live page; accessed 18 Nov 2026 | Bangla | [https://16263.dghs.gov.bd/](https://16263.dghs.gov.bd/) | Doctor advice, health information, ambulance information, complaints | Homepage and IVR menu | Official DGHS service page | Current |
| BD-04 | National Ambulance Information Repository | DGHS | Bangladesh | Live page; accessed 18 Nov 2026 | Bangla | http://16263.dghs.gov.bd/ambulance/ambulance/ | Ambulance information | Homepage | Official DGHS page | Current; not proof of dispatch |
| BD-05 | National Emergency Hotline directory | Government of Bangladesh | Bangladesh | Page updated 29 June 2025 | Bangla | [https://bangladesh.gov.bd/site/page/aaebba14-f52a-4a3d-98fd-a3f8b911d3d9/%E0%A6%9C%E0%A6%B0%E0%A7%81%E0%A6%B0%E0%A6%BF-%E0%A6%B9%E0%A6%9F%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%A8-](https://bangladesh.gov.bd/site/page/aaebba14-f52a-4a3d-98fd-a3f8b911d3d9/%E0%A6%9C%E0%A6%B0%E0%A7%81%E0%A6%B0%E0%A6%BF-%E0%A6%B9%E0%A6%9F%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%A8-) | 999 service scope, availability, cost | 999 row | Official government directory | Current |
| BD-06 | Personal Data Protection Ordinance, 2025 | Ministry of Law, Justice and Parliamentary Affairs | Bangladesh | Ordinance No. 61 of 2025; 6 November 2025; repealed by the Personal Data Protection Act, 2026 (Act No. 63 of 2026) | Bangla | [https://bdlaws.minlaw.gov.bd/act-1574.html](https://bdlaws.minlaw.gov.bd/act-1574.html) | Personal data, sensitive data, consent, rights, security, retention, breach, audit, cross-border transfer | Chapters II–VIII; sections 5–35 | Official gazetted legal source | **The 2025 Ordinance is repealed by the 2026 Act; the currently applicable Act must be independently reviewed before legal publication** |
| WHO-01 | Pregnancy, Childbirth, Postpartum and Newborn Care: A Guide for Essential Practice, 3rd edition | WHO | International | 2016 edition; PDF revised December 2017 | English | [https://www.afro.who.int/sites/default/files/2019-06/07%2012%2017%20EDITTED%20PCPNC%20GUIDELINES%203RD%20EDITION%202016%20Dec%202017.pdf](https://www.afro.who.int/sites/default/files/2019-06/07%2012%2017%20EDITTED%20PCPNC%20GUIDELINES%203RD%20EDITION%202016%20Dec%202017.pdf) | Danger signs, referral urgency, PPH, eclampsia, sepsis | Danger-sign sections; exact pages require extraction | WHO clinical practice guide | Current enough for source mapping; Bangladesh adaptation required |
| WHO-02 | Managing complications in pregnancy and childbirth | WHO | International | 2016 operational guidance | English | [https://platform.who.int/docs/default-source/mca-documents/policy-documents/operational-guidance/OMN-CC-31-03-OPERATIONALGUIDANCE-2016-eng-Pregnancy-Childbirth-Management-Guide-L1-2ndEd.pdf](https://platform.who.int/docs/default-source/mca-documents/policy-documents/operational-guidance/OMN-CC-31-03-OPERATIONALGUIDANCE-2016-eng-Pregnancy-Childbirth-Management-Guide-L1-2ndEd.pdf) | Antenatal danger signs, PPH, pre-eclampsia/eclampsia, sepsis | Danger Signs list | WHO provider-facing guidance | Current enough; not direct patient instruction |
| WHO-03 | WHO recommendations on maternal and newborn care for a positive postnatal experience | WHO | International | 2022 | English | [https://www.who.int/publications/i/item/9789240057142](https://www.who.int/publications/i/item/9789240057142) | Postnatal care and maternal wellbeing | Full guideline | WHO guideline | Current |
| WHO-04 | WHO postpartum-care guidance excerpt | WHO | International | 2016 guidance excerpt | English | [https://platform.who.int/docs/default-source/mca-documents/policy-documents/guideline/PSE-MN-48-01-GUIDELINE-2016-eng-Standard-PPC-Guidelines.pdf](https://platform.who.int/docs/default-source/mca-documents/policy-documents/guideline/PSE-MN-48-01-GUIDELINE-2016-eng-Standard-PPC-Guidelines.pdf) | Postpartum bleeding, fever, sepsis/shock, severe headache, blurred vision, seizures | Danger-sign list | WHO clinical guidance | Current enough; exact page mapping required |
| WCAG-01 | Web Content Accessibility Guidelines 2.2 | W3C | International | WCAG 2.2 | English | [https://www.w3.org/TR/WCAG/](https://www.w3.org/TR/WCAG/) | Accessibility requirements | Success criteria and understanding documents | Primary accessibility standard | Current |
| BDHS-01 | Bangladesh Demographic and Health Survey 2022 | NIPORT / ICF / DHS Program | Bangladesh | 2022 survey; final report publication date to verify from report | English | [https://dhsprogram.com/pubs/pdf/GF62/GF62Dhaka.pdf](https://dhsprogram.com/pubs/pdf/GF62/GF62Dhaka.pdf) | ANC use, postnatal care, digital access, maternal service use | Maternal-health and internet-use chapters; exact pages require extraction | National household survey | Current national evidence base |
| UN-01 | Bangladesh country programme and maternal-health resources | UNICEF Bangladesh / UNFPA Bangladesh | Bangladesh | To be verified per publication | English / Bangla | [https://www.unicef.org/bangladesh/](https://www.unicef.org/bangladesh/) ; [https://bangladesh.unfpa.org/](https://bangladesh.unfpa.org/) | Access barriers, disability inclusion, referral, respectful care | Specific publications must be selected and verified | Recognized development organizations | Publication-specific |

**Source rule:** No Bangladesh or WHO PDF may be cited by page number in the published database until the exact page, heading, and passage have been extracted and archived.

***

## 3. Verified Pregnancy Warning-Sign Catalogue

WHO guidance identifies vaginal bleeding, convulsions, severe headache with blurred vision, fever with severe weakness, severe abdominal pain, and fast or difficult breathing as signs for which a pregnant woman should go to a hospital or health centre immediately, day or night, without waiting.  WHO operational guidance also lists persistent vomiting, chills/fever, drainage of liquor, generalized swelling, reduced fetal movements, and urinary symptoms among antenatal danger signs. 

| ID | Clinical term | English title | Proposed Bangla title | Source-supported action | Urgency explicitly supported? | Source | Bangladesh / international | Patient- or provider-facing | Review status |
|---|---|---|---|---|---|---|---|---|---|
| MAT-001 | Vaginal bleeding in pregnancy | Vaginal bleeding during pregnancy | গর্ভাবস্থায় যোনিপথে রক্তপাত | Go to a hospital or health centre immediately, day or night, without waiting.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | Patient-facing draft | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-002 | Convulsions / eclampsia risk | Fits or convulsions | খিঁচুনি | Go to a hospital or health centre immediately, day or night, without waiting.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | Patient-facing draft | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-003 | Severe headache with visual disturbance | Severe headache with blurred vision | তীব্র মাথাব্যথা ও ঝাপসা দৃষ্টি | Go to a hospital or health centre immediately, day or night, without waiting.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | Patient-facing draft | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-004 | Severe abdominal pain | Severe abdominal pain | তীব্র পেটব্যথা | Go to a hospital or health centre immediately, day or night, without waiting.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | Patient-facing draft | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-005 | Fast or difficult breathing | Difficulty breathing | শ্বাস নিতে কষ্ট বা দ্রুত শ্বাস | Go to a hospital or health centre immediately, day or night, without waiting.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | Patient-facing draft | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-006 | Fever with severe weakness | Fever and too weak to get out of bed | জ্বরের সঙ্গে এত দুর্বল যে বিছানা থেকে উঠতে কষ্ট | Go to a hospital or health centre immediately, day or night, without waiting.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | Patient-facing draft | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-007 | Reduced fetal movements | Reduced or absent fetal movement | শিশুর নড়াচড়া কমে যাওয়া বা বন্ধ হয়ে যাওয়া | WHO lists reduced fetal movements as an antenatal danger sign; exact public action and gestational context require Bangladesh clinical review.  | **NOT VERIFIED — DO NOT PUBLISH** | WHO-02 | International; Bangladesh adaptation required | Patient-facing draft | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-008 | Leakage of amniotic fluid | Fluid leaking from the vagina | যোনিপথ দিয়ে পানি ছড়ানো | WHO lists drainage of liquor as an antenatal danger sign; public action requires Bangladesh clinical review.  | **NOT VERIFIED — DO NOT PUBLISH** | WHO-02 | International; Bangladesh adaptation required | Patient-facing draft | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-009 | Persistent vomiting | Severe or persistent vomiting | অতিরিক্ত বা থামছে না এমন বমি | WHO lists persistent vomiting as an antenatal danger sign; public action requires Bangladesh clinical review.  | **NOT VERIFIED — DO NOT PUBLISH** | WHO-02 | International; Bangladesh adaptation required | Patient-facing draft | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-010 | Generalized swelling | Swelling of the face or hands | মুখ বা হাত ফুলে যাওয়া | WHO lists generalized body swelling as an antenatal danger sign; public action requires Bangladesh clinical review.  | **NOT VERIFIED — DO NOT PUBLISH** | WHO-02 | International; Bangladesh adaptation required | Patient-facing draft | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-027 | Urinary symptoms | Pain or burning while passing urine | প্রস্রাবের সময় ব্যথা বা জ্বালাপোড়া | WHO lists urinary symptoms among antenatal danger signs; public action requires Bangladesh clinical review.  | **NOT VERIFIED — DO NOT PUBLISH** | WHO-02 | International; Bangladesh adaptation required | Patient-facing draft | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |

**Correction to prior report:** The prior report correctly separated “severe headache” from “severe headache with blurred vision.” This remains necessary: the immediately urgent WHO wording captured is **severe headache with blurred vision**, not headache alone. 

***

## 4. Verified Labour and Childbirth Catalogue

WHO lists vaginal bleeding, convulsions, severe abdominal pain, fast or difficult breathing, and fever with severe weakness as immediate care-seeking signs in the childbirth context.  Bangladesh’s National Action Plan identifies antepartum haemorrhage, postpartum haemorrhage, eclampsia, and pre-eclampsia as priority maternal-health areas. 

| ID | Clinical term | English title | Proposed Bangla title | Source-supported action | Urgency explicitly supported? | Source | Bangladesh / international | Review status |
|---|---|---|---|---|---|---|---|---|
| MAT-011 | Vaginal bleeding during labour | Heavy or unexpected bleeding during labour | প্রসবের সময় অতিরিক্ত বা অপ্রত্যাশিত রক্তপাত | Seek emergency obstetric care immediately; WHO lists vaginal bleeding as an immediate care-seeking sign.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-012 | Convulsions | Fits or convulsions during labour | প্রসবের সময় খিঁচুনি | Seek emergency obstetric care immediately; WHO lists convulsions as an immediate care-seeking sign.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-013 | Severe abdominal pain | Severe abdominal pain during labour | প্রসবের সময় তীব্র পেটব্যথা | Go to a hospital or health centre immediately, day or night, without waiting.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-014 | Fast or difficult breathing | Difficulty breathing during labour | প্রসবের সময় শ্বাস নিতে কষ্ট | Go to a hospital or health centre immediately, day or night, without waiting.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-015 | Fever with severe weakness | Fever and too weak to get out of bed during labour | প্রসবের সময় জ্বর ও অতিরিক্ত দুর্বলতা | Go to a hospital or health centre immediately, day or night, without waiting.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-016 | Prolonged or obstructed labour | Labour that is not progressing | প্রসব দীর্ঘ হচ্ছে বা এগোচ্ছে না | **CONFLICTING EVIDENCE — CLINICAL REVIEW REQUIRED.** Bangladesh policy recognizes emergency obstetric care as a priority, but this research has not verified a patient-facing definition, time threshold, or action.  | **NOT VERIFIED — DO NOT PUBLISH** | BD-01 | Bangladesh policy; no patient-facing wording verified | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-017 | Abnormal fetal presentation | Baby’s position may be unusual | শিশুর অবস্থান অস্বাভাবিক হতে পারে | **NOT VERIFIED — DO NOT PUBLISH.** No reliable patient-facing Bangladesh source passage has been captured for public wording or action. | Not verified | None captured | Not verified | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |

***

## 5. Verified Postpartum Catalogue

WHO identifies heavy or suddenly increasing vaginal bleeding, convulsions or loss of consciousness, fast or difficult breathing, fever with severe weakness, and severe abdominal pain as postpartum signs requiring immediate care.  WHO also describes postpartum haemorrhage signs as sudden/profuse or persistent increased blood loss, faintness, dizziness, and palpitations/tachycardia. 

| ID | Clinical term | English title | Proposed Bangla title | Source-supported action | Urgency explicitly supported? | Source | Bangladesh / international | Review status |
|---|---|---|---|---|---|---|---|---|
| MAT-018 | Postpartum haemorrhage | Heavy bleeding after childbirth | প্রসবের পর অতিরিক্ত রক্তপাত | Seek emergency care immediately. WHO describes more than 2–3 pads soaked in 20–30 minutes after delivery, or bleeding that increases rather than decreases, as immediate care-seeking signs.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-019 | Postpartum eclampsia risk | Fits, convulsions, or loss of consciousness after childbirth | প্রসবের পর খিঁচুনি বা জ্ঞান হারানো | Seek emergency care immediately; WHO lists convulsions as an immediate postpartum danger sign.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-020 | Postpartum infection / sepsis risk | Fever after childbirth | প্রসবের পর জ্বর | Seek care at a hospital or health centre immediately, day or night, without waiting, when fever occurs with severe weakness.  | Yes — immediate care-seeking for fever with severe weakness | WHO-01 | International; Bangladesh adaptation required | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-021 | Severe abdominal pain | Severe abdominal pain after childbirth | প্রসবের পর তীব্র পেটব্যথা | Go to a hospital or health centre immediately, day or night, without waiting.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-022 | Fast or difficult breathing | Difficulty breathing after childbirth | প্রসবের পর শ্বাস নিতে কষ্ট | Go to a hospital or health centre immediately, day or night, without waiting.  | Yes — immediate care-seeking | WHO-01 | International; Bangladesh adaptation required | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-023 | Severe headache / visual symptoms | Severe headache or blurred vision after childbirth | প্রসবের পর তীব্র মাথাব্যথা বা ঝাপসা দৃষ্টি | WHO identifies severe headache with blurred vision as a postpartum pre-eclampsia/eclampsia warning sign; exact public action requires clinical review.  | **NOT VERIFIED — DO NOT PUBLISH** | WHO-04 | International; Bangladesh adaptation required | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-024 | Foul-smelling vaginal discharge | Foul-smelling discharge after childbirth | প্রসবের পর দুর্গন্ধযুক্ত স্রাব | **NOT VERIFIED — DO NOT PUBLISH.** A plausible infection-related concern, but the captured WHO passage does not establish public action or urgency. | Not verified | None captured | Not verified | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-025 | Leg pain, swelling, chest pain, or shortness of breath | Leg swelling or pain, chest pain, or breathing difficulty | পা ফুলে যাওয়া/ব্যথা, বুকে ব্যথা বা শ্বাস নিতে কষ্ট | WHO lists calf pain, redness or swelling, shortness of breath, or chest pain among postpartum warning signs.  | **NOT VERIFIED — DO NOT PUBLISH** | WHO-01 | International; Bangladesh adaptation required | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MAT-026 | Wound infection concerns | Wound redness, discharge, or worsening pain | ক্ষত লাল হওয়া, স্রাব বা ব্যথা বাড়া | **NOT VERIFIED — DO NOT PUBLISH.** No reliable primary-source passage has been captured for public wording or action. | Not verified | None captured | Not verified | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |

**Time-window rule:** Do not publish a universal “postpartum period” definition. Each source’s defined period must be recorded separately; the captured WHO material does not establish one universal app-wide time window.

***

## 6. Perinatal Mental-Health Catalogue

| ID | Topic | English title | Proposed Bangla title | Research position | Source / evidence status | Review status |
|---|---|---|---|---|---|---|
| MENTAL-001 | Emotional distress | Feeling very sad, anxious, or overwhelmed | খুব মন খারাপ, দুশ্চিন্তা বা চাপ অনুভব করা | Provide supportive information and encourage contact with a trusted health worker or qualified mental-health professional. Do not diagnose. | WHO postnatal guidance supports attention to maternal wellbeing; exact wording requires review. [WHO-03] | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MENTAL-002 | Persistent low mood or anxiety | Sadness or worry that does not go away | যে মন খারাপ বা দুশ্চিন্তা কমছে না | Encourage professional support; do not create an unvalidated screening tool or diagnostic label. | Requires clinical review and Bangladesh referral verification | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MENTAL-003 | Severe mental-health symptoms | Thoughts of harming yourself | নিজের ক্ষতি করার কথা মনে আসা | **CONFLICTING EVIDENCE — CLINICAL REVIEW REQUIRED.** Urgent-risk wording, crisis pathway, and safe escalation require perinatal mental-health review and verification of an operational Bangladesh crisis service. | Not verified for Bangladesh service pathway | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |
| MENTAL-004 | Family support | Support from a trusted person | বিশ্বস্ত কারো সহায়তা নেওয়া | Offer optional, consent-based support-person involvement; never disclose health information without appropriate permission. | Product-design recommendation; legal review required | **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION** |

WHO postpartum guidance identifies abnormal behaviour including depression and psychosis among urgent postpartum concerns in one clinical guidance source, but SHONKET must not convert this into a diagnostic or screening claim without clinical and Bangladesh-service verification. 

***

## 7. Bilingual English / Bangla Drafts

All drafts below are **PENDING CLINICAL APPROVAL — NOT FOR PUBLICATION**.

| ID | English medical term | Simple English | Proposed Bangla | Possible misunderstanding | Translation-review note |
|---|---|---|---|---|---|
| MAT-001 | Vaginal bleeding | Bleeding from the vagina during pregnancy | গর্ভাবস্থায় যোনিপথে রক্তপাত | May be confused with normal discharge | Use “রক্ত” clearly; avoid euphemisms |
| MAT-002 | Convulsions | Fits or seizures | খিঁচুনি | May be misunderstood as fainting | Add “শরীর কাঁপা বা জ্ঞান হারানো” only if clinically approved |
| MAT-003 | Blurred vision | Vision becoming unclear | ঝাপসা দৃষ্টি | May be confused with tired eyes | Explain “চোখে অস্পষ্ট দেখা” |
| MAT-008 | Amniotic fluid leakage | Fluid leaking from the vagina | যোনিপথ দিয়ে পানি ছড়ানো | May be confused with urine or discharge | Clinical distinction must be reviewed |
| MAT-018 | Postpartum haemorrhage | Heavy bleeding after childbirth | প্রসবের পর অতিরিক্ত রক্তপাত | “অতিরিক্ত” may be vague | Pair with source-defined pad/bleeding description |
| MAT-020 | Sepsis | Serious infection | সংক্রমণজনিত গুরুতর অসুস্থতা | “সেপসিস” alone may be unfamiliar | Keep English term alongside Bangla explanation |
| MENTAL-001 | Emotional distress | Feeling very sad, anxious, or overwhelmed | খুব মন খারাপ, দুশ্চিন্তা বা চাপ অনুভব করা | Avoid implying weakness or fault | Use respectful, non-stigmatizing language |
| MENTAL-003 | Self-harm thoughts | Thoughts of harming yourself | নিজের ক্ষতি করার কথা মনে আসা | Must not sound accusatory | Requires specialist wording review |

**Accessibility note:** Use short sentences, high-contrast icons, text alternatives, and no colour-only urgency signals. Avoid English-only abbreviations such as ANC, PPH, or PTSD without a Bangla explanation.

***

## 8. Bangladesh Emergency and Referral Directory

| Service type | Official name | Number / URL | Responsible authority | Verified service | Hours | Cost | Language | Verification status |
|---|---|---|---|---|---|---|---|---|
| Emergency response | National Emergency Service 999 | 999 / [https://www.999.gov.bd/](https://www.999.gov.bd/) | Bangladesh Police-operated call centre, per official government directory | Police, fire service, ambulance service, or related information | 24 hours | Free from any phone | Not verified beyond Bangla government page | **Verified service scope and availability; maternal-specific dispatch workflow not verified**  [bangladesh.gov](https://bangladesh.gov.bd/site/page/aaebba14-f52a-4a3d-98fd-a3f8b911d3d9/%E0%A6%9C%E0%A6%B0%E0%A7%81%E0%A6%B0%E0%A6%BF-%E0%A6%B9%E0%A6%9F%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%A8-) |
| Medical advice helpline | স্বাস্থ্য বাতায়ন / Shastho Batayon | 16263 / [https://16263.dghs.gov.bd/](https://16263.dghs.gov.bd/) | DGHS, MoHFW | Direct doctor advice, health/hospital information, complaints, ambulance information | 24 hours | No extra charge beyond normal mobile billing | Bangla service page; broader language support not verified | **Verified**  |
| Ambulance information | জাতীয় অ্যাম্বুলেন্স তথ্য ভাণ্ডার | Via 16263 | DGHS | Information about government and private ambulances | Not verified | Not verified | Not verified | **Verified as information service; not verified as dispatch**  |
| Routine maternal-health service | Community Clinics, Union Health and Family Welfare Centres, Upazila Health Complexes, District Hospitals, Medical College Hospitals | Facility-specific | DGHS / DGFP / local health authorities | Routine and referral maternal services vary by facility | Facility-specific | Facility-specific | Facility-specific | **NOT VERIFIED — DO NOT PUBLISH** facility-level claims |
| Emergency obstetric care | CEmONC / BEmONC facilities | Facility-specific | DGHS / local health authorities | Emergency obstetric and newborn care capacity varies by facility | Facility-specific | Facility-specific | Facility-specific | **NOT VERIFIED — DO NOT PUBLISH** without current verification |
| Psychosocial support | To be identified | To be verified | To be verified | To be verified | To be verified | To be verified | To be verified | **NOT VERIFIED — DO NOT PUBLISH** |
| Protection and violence support | National Helpline Center for violence against women and children | 109 | Ministry of Women and Children Affairs, per official government directory | Support services for women and children experiencing violence | Not verified in captured source | Not verified | Not verified | **Verified existence of 109; operational details require confirmation**  [bangladesh.gov](https://bangladesh.gov.bd/site/page/aaebba14-f52a-4a3d-98fd-a3f8b911d3d9/%E0%A6%9C%E0%A6%B0%E0%A7%81%E0%A6%B0%E0%A6%BF-%E0%A6%B9%E0%A6%9F%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%A8-) |

**Referral-pathway rule:** Bangladesh’s National Action Plan describes a continuum from ANC through delivery, emergency obstetric and newborn care, postpartum care, and postpartum family planning.  This does **not** establish a current, patient-facing referral map or guarantee that a particular facility will accept a maternal emergency.

***

## 9. Disability-Inclusive Accessibility Guide

SHONKET should use WCAG 2.2 as its baseline and provide equivalent non-voice pathways for every essential task. [WCAG-01]

| User context | Practical SHONKET requirement |
|---|---|
| Visual disability | Semantic headings, meaningful link text, text alternatives, high contrast, no colour-only meaning, screen-reader testing |
| Hearing disability | All essential information in text; no audio-only instructions; visual confirmation of actions |
| Speech disability | Text-based requests, selectable AAC phrases, optional written follow-up; no mandatory phone call |
| Motor disability | Large touch targets, keyboard support, no time-limited actions, forgiving error recovery |
| Cognitive disability | Plain Bangla, one action per screen, progress indicators, repeated key information |
| Limited literacy | Simple Bangla, icons paired with text, avoid English-only abbreviations, allow trusted-person support with consent |
| Temporary limitations | Do not assume permanent disability; allow flexible communication and assistance preferences |
| Multiple disabilities | Let users combine preferences; never force a single accessibility mode |

### Core UI rules

- Make every essential action available through text and keyboard.
- Do not require speaking, hearing, seeing, typing long messages, or precise gestures.
- Provide visible focus indicators and accessible error messages.
- Allow text resizing without loss of function.
- Provide reduced-motion options and avoid unnecessary animation.
- Design for low-end devices and slow networks: lightweight pages, clear loading states, and offline-friendly static content where feasible.
- Do not create a separate, reduced “disability mode”; make the core experience accessible to everyone.

***

## 10. Human-Help Form Specification

This is a **proposed user-facing form specification only**. It does not define or assume the backend API contract.

| Field | Classification | Mandatory? | Purpose | Intended recipient | Privacy sensitivity | Consent / disclosure | Can workflow function without it? |
|---|---|---|---|---|---|---|---|
| Type of assistance requested | Essential | Yes | Routes request to appropriate human workflow | Authorized PROHOR care-support recipient, once established | Possibly | Explain who will see it and why | No |
| Preferred communication method | Essential | Yes | Enables non-voice support and respects preference | Authorized recipient | Low | Explain communication limitations | No |
| Short description of concern | Optional | No | Helps human responder understand request | Authorized recipient | High | Explicit consent before sharing; minimum necessary | Yes |
| Preferred contact method | Optional | No | Enables callback, text, or another approved channel | Authorized recipient | High | Separate consent; do not infer consent | Yes |
| Pregnancy stage | Optional | No | Helps routing when necessary | Authorized recipient | High | Explicit consent; collect only if necessary | Yes |
| Accessibility support needs | Optional | No | Enables appropriate support format | Authorized recipient | Possibly high | Explicit consent | Yes |
| Trusted support person | Optional | No | Enables consent-based family involvement | Authorized recipient and support person, only with consent | High | Separate consent for each disclosure | Yes |
| Emergency acknowledgement | Essential | Yes | Makes clear PROHOR is not an emergency dispatcher | User | No | Must state urgent symptoms require direct emergency/local care-seeking | No |

### Fields not to collect by default

- Precise location.
- Diagnosis, medical records, photographs, or clinical documents.
- Third-party personal data.
- Details of violence, abuse, coercion, or protection needs.
- Mental-health details beyond what the user chooses to share.
- Data “just in case” it may be useful later.

### Required user-facing disclosure

“PROHOR can help you prepare and submit a request for human support. PROHOR is not an emergency service and cannot guarantee that a healthcare provider will receive, read, or respond to your request. For urgent symptoms, contact your local emergency service or seek immediate care.”

This wording requires legal, clinical, and product-owner approval.

***

## 11. Request Status and Service Transparency Rules

| Status | Technical evidence required before display | Current PROHOR position |
|---|---|---|
| Draft created | User has completed or partially completed a local draft | Available |
| Not sent | No successful backend submission has occurred | Available; current Bondhon starter returns HTTP 501 `not_sent`  |
| Submitted | Backend confirms receipt of the request payload | Not available |
| Persisted | Backend confirms durable storage, ideally with a request ID | Not available |
| Assigned | Backend confirms assignment to a specific authorized recipient | Not available |
| Provider notified | Backend confirms delivery/notification event to the recipient | Not available |
| Acknowledged | Recipient system or authorized user confirms receipt/review | Not available |
| Response given | Backend confirms a response from an authorized recipient | Not available |
| Completed | Backend confirms closure with an auditable event | Not available |
| Failed | Backend returns a defined failure state | Available if backend provides it |
| Delivery unverified | No end-to-end delivery or acknowledgement evidence exists | Must be used rather than claiming success |

**Rule:** A frontend button click is not proof of submission. An API acceptance response is not proof that a healthcare worker saw the request. The current Bondhon starter’s HTTP 501 `not_sent` response must be displayed as **not sent**, not as pending, received, or in progress. 

***

## 12. Bangladesh Privacy and Legal Findings

### Confirmed legal source

The official Bangladesh legislative database lists the **Personal Data Protection Ordinance, 2025** (Ordinance No. 61 of 2025), dated 6 November 2025, and states that it was repealed by the **Personal Data Protection Act, 2026** (Act No. 63 of 2026).  The Ordinance’s structure includes lawful processing, sensitive personal data, data-subject rights, security, retention, breach, audit, cross-border transfer, complaints, and penalties. [old.dghs.gov](https://old.dghs.gov.bd/images/docs/Strategy/National%20Action%20Plan%20for%20Maternal%20Health%202020.pdf)

| Area | Confirmed / unconfirmed | Practical implication for SHONKET |
|---|---|---|
| Current applicable law | **The 2025 Ordinance is repealed by the 2026 Act; the currently applicable Act must be independently reviewed** | Do not publish legal claims based only on the repealed Ordinance  [old.dghs.gov](https://old.dghs.gov.bd/images/docs/Strategy/National%20Action%20Plan%20for%20Maternal%20Health%202020.pdf) |
| Consent | The repealed Ordinance includes consent-based processing provisions; current Act mapping required | Obtain clear, informed, revocable consent for health-sensitive processing |
| Sensitive data | The repealed Ordinance includes a sensitive-personal-data chapter; current Act mapping required | Treat pregnancy, disability, mental-health, and contact data as sensitive by default |
| Data-subject rights | The repealed Ordinance includes access, portability, correction, withdrawal, and deletion-related rights; current Act mapping required | Provide understandable user rights and a documented process |
| Security and breach | The repealed Ordinance includes security standards, breach, audit, and data-protection planning; current Act mapping required | Implement role-based access, encryption in transit, audit logs, and incident response |
| Retention | The repealed Ordinance includes retention conditions and record-keeping; current Act mapping required | Define purpose-bound retention and deletion schedules |
| Cross-border transfer | The repealed Ordinance includes classification, storage, and transfer provisions; current Act mapping required | Do not transfer health data abroad without legal review and approved safeguards |

**NOT VERIFIED — LEGAL REVIEW REQUIRED** for every specific legal duty, section number, enforcement mechanism, and current applicability under the 2026 Act. Bangladesh-qualified legal review is mandatory before publication.

***

## 13. Bangladesh Maternal User Research

The 2022 Bangladesh Demographic and Health Survey is a national survey covering women aged 15–49 and children aged 0–4, and it collected maternal-health and internet-use information.  The survey found that 88% of women who gave birth in the two years before the 2022 BDHS received at least one antenatal check-up from a medically trained provider, up from 82% in 2017–18. [bdlaws.minlaw.gov](https://bdlaws.minlaw.gov.bd/act-1574.html)

| Topic | Verified finding | Year / scope | Source | Use in SHONKET |
|---|---|---|---|---|
| Antenatal care | 88% of women with a birth in the preceding two years received at least one ANC visit from a medically trained provider | 2022; national BDHS |  [microdata.worldbank](https://microdata.worldbank.org/catalog/6290) | Supports ANC importance; do not infer individual user behaviour |
| Internet use | BDHS collected internet-use frequency among women aged 15–49 | 2022; national BDHS |  [bdlaws.minlaw.gov](https://bdlaws.minlaw.gov.bd/act-1574.html) | Supports need for low-bandwidth, text-first design; exact prevalence requires report extraction |
| Digital access and ANC | Peer-reviewed analysis using BDHS 2022 data found internet use was reported by 32.33% of respondents and was associated with higher ANC attendance | 2022 BDHS-derived analysis; 5,005 ever-married women aged 15–49 with at least one live birth in previous three years |  [microdata.worldbank](https://microdata.worldbank.org/catalog/6290/pdf-documentation) | Use cautiously as contextual evidence; not a SHONKET user persona |
| Health-facility use and media | A peer-reviewed analysis found internet use and television viewership were associated with higher health-facility use | Publication-specific; exact population and year require verification |  [file-chittagong.portal.gov](https://file-chittagong.portal.gov.bd/uploads/6b9a9df8-2650-4326-bbfd-55418d77e00d/66d/6ea/cb7/66d6eacb7573c516412807.pdf) | **NOT VERIFIED — DO NOT PUBLISH** as a SHONKET-specific claim |

### Research gaps requiring direct interviews

- Actual reading level and comprehension of proposed Bangla warning-sign wording.
- Device, connectivity, and data-cost constraints among target mothers.
- Privacy concerns and willingness to share health information.
- Family involvement and autonomy in help-seeking.
- Disability-specific barriers and assistive-technology use.
- Trust in digital maternal-health information.
- Understanding of 999 versus 16263.

***

## 14. Clinical Content Approval Checklist

For every SHONKET content item:

- [ ] Source is primary, authoritative, and current.
- [ ] Exact source title, organization, version, date, URL, and page/section are recorded.
- [ ] Bangladesh-specific applicability is distinguished from international guidance.
- [ ] Clinical claim is supported by the cited passage.
- [ ] No diagnosis, medication, dosage, treatment, or home remedy is recommended.
- [ ] No delay in professional care is implied for a possible emergency.
- [ ] Urgency wording matches the source exactly.
- [ ] English draft is plain, respectful, and non-stigmatizing.
- [ ] Bangla draft is natural, simple, and faithful to the English clinical meaning.
- [ ] Bangla medical translator has reviewed terminology and comprehension.
- [ ] Maternal-health clinician has approved clinical accuracy.
- [ ] Obstetrician/gynaecologist has approved obstetric content where appropriate.
- [ ] Perinatal mental-health specialist has approved mental-health content where applicable.
- [ ] Accessibility reviewer has approved wording, structure, icons, and non-text alternatives.
- [ ] Privacy/legal reviewer has approved consent and data-sharing language.
- [ ] DGHS/service owner has approved service and emergency-contact claims.
- [ ] Reviewer reference, role, review date, approval status, and next review date are recorded.
- [ ] Change history is retained.
- [ ] Obsolete content is withdrawn, not merely edited silently.

***

## 15. Shonket Screen-by-Screen Product Specification

| Screen | Purpose | Required content | Clinical approval | Source dependency | Backend dependency | Works without backend | Must remain unavailable until verified |
|---|---|---|---|---|---|---|---|
| `/safety` | Safety home | Approved categories, emergency-service links, non-dispatch disclaimer | Yes | Approved content and verified services | No for static content | Yes | Live facility availability, connected provider response |
| `/safety/information` | Browse safety topics | Approved pregnancy, childbirth, postpartum, mental-health categories | Yes | Approved content | No | Yes | Personalized diagnosis or triage |
| `/safety/information/[slug]` | Warning-sign detail | Approved detail, source citation, reviewer badge, care-seeking action | Yes | Exact source passage | No | Yes | Treatment instructions, medication advice |
| `/app/care` | Human-help entry | Request type, communication preference, consent disclosure | Yes for wording | Approved consent language | Yes for submission | Draft only | Actual submission, provider assignment, acknowledgement |
| `/app/care/review` | Review before submission | User-reviewable fields, consent confirmation | Yes for wording | Approved consent language | Yes for submission | Draft review only | Claim that a provider has received the request |
| `/app/care/status` | Honest status | Current truthful status, retry/failure guidance | Yes for wording | Approved status language | Yes for status events | `Draft created`, `Not sent`, `Failed`, `Delivery unverified` | `Received`, `Assigned`, `Notified`, `Acknowledged`, `Response given`, `Closed` |
| Emergency contacts | Verified service navigation | 999, 16263, verified service descriptions | Yes for wording | Official service pages | No | Yes | Live availability, dispatch guarantee, facility directory |

***

## 16. Developer Handoff

### Proposed modular content structure

```text
src/features/shonket/
  content/
    pregnancy/
    labour-childbirth/
    postpartum/
    perinatal-mental-health/
    source-metadata/
    review-metadata/
    service-directory/
  services/
    safety-content-loader/
    human-help-request/
    service-directory/
  components/
    SafetyHome/
    WarningSignCard/
    WarningSignDetail/
    SourceCitation/
    ReviewerBadge/
    HumanHelpEntry/
    CommunicationPreference/
    RequestReview/
    RequestStatus/
    EmergencyContacts/
```

### Required data concepts

The developer must inspect `src/lib/contracts/shonket.ts` and the existing `safetyGuidanceSchema` before implementation. Do **not** invent TypeScript field names. Map research records to the schema’s actual fields for:

- Reviewed text.
- HTTPS source information.
- Reviewer reference.
- Review timestamp.
- Approved status.

### Required source metadata

Each content record needs:

- Content ID.
- Stage.
- Clinical term.
- English and Bangla titles.
- English and Bangla body text.
- Source title, organization, version, publication date, URL, and exact page/section.
- Retrieval date.
- Urgency only where explicitly stated by the source.
- Recommended care-seeking action only where supported.
- Service level only where specified.
- Reviewer reference and review date.
- Approval status.
- Next review date.
- Change history.

### Approved data-loading behaviour

- Load only records with `approved` status from the actual schema.
- Do not render drafts marked `pending_clinical_review`.
- Do not render content with missing source URL, reviewer reference, review timestamp, or approval status.
- Show a clear “Information temporarily unavailable” state rather than fabricating content.
- Preserve source citations beside clinical statements.
- Do not cache stale emergency-service claims without a verification timestamp and expiry rule.

### UI states

| Screen | Can work without backend | Must remain unavailable until verified |
|---|---|---|
| `/safety` | Approved safety information, emergency-service links, clear non-dispatch disclaimer | Live facility availability, connected provider response |
| `/safety/information` | Approved category navigation and search | Personalized diagnosis or triage |
| `/safety/information/[slug]` | Approved detail page, source citation, reviewer badge | Treatment instructions, medication advice |
| `/app/care` | Draft request form, consent disclosure, communication preferences | Actual submission, provider assignment, acknowledgement |
| `/app/care/review` | User review of draft fields and consent | Claim that a provider has received the request |
| `/app/care/status` | `Draft created`, `Not sent`, `Submission failed`, `Delivery unverified` | `Received`, `Assigned`, `Notified`, `Acknowledged`, `Response given`, `Closed` |

### Backend dependency rule

A status may be displayed only when the backend returns evidence sufficient to support it. A frontend click is not proof of submission; an HTTP 200 response is not proof that a human provider saw the request. The current Bondhon starter’s HTTP 501 `not_sent` response must be displayed as **not sent**, not as pending, received, or in progress. 

***

## 17. MVP vs Future Scope

| Area | Hackathon MVP | Requires later approval / infrastructure |
|---|---|---|
| Safety information | Clinician-approved, source-linked pregnancy, childbirth, and postpartum warning information | Ongoing clinical review and version control |
| Bangla content | Reviewed simple Bangla drafts for approved items | Certified Bangla medical translation and clinical sign-off |
| Mental health | Non-diagnostic support information and help-seeking guidance | Perinatal mental-health specialist review and verified crisis pathway |
| Emergency contacts | Verified 16263 information and carefully framed 999 information only after official verification | Real-time availability, dispatch integration, facility directory |
| Human help | Draft request form, consent disclosure, truthful `Not sent` status | Omor backend, provider contracts, recipient workflow, acknowledgement events |
| Accessibility | WCAG 2.2-informed core UI, text-first help, keyboard and screen-reader support | User testing with disabled mothers and assistive-technology users |
| Privacy | Minimal fields, explicit consent copy, access-control design | Legal review, retention schedule, audit-log policy, breach process |
| Referral | General, verified service information only | Facility-level referral network and live availability |

***

## 18. Unresolved Questions and Responsible Reviewer

| Question | Responsible reviewer |
|---|---|
| Which exact Bangladesh clinical guideline is the controlling source for each published danger sign and urgency wording? | Maternal-health clinician and DGHS/MoHFW content owner |
| Which DGHS Bangla patient materials are current enough to use as public wording references? | DGHS content owner and Bangla medical translator |
| Does 999 provide maternal emergency dispatch, and under what conditions? | DGHS/service owner and relevant emergency-service authority |
| Does 16263 charge callers, and which languages does it support? | DGHS/Shastho Batayon service owner |
| Which facilities are currently able to receive maternal emergencies in each target district? | DGHS, local health authority, and PROHOR service owner |
| Is there a contracted human-care recipient for PROHOR requests? | Omor/backend owner and product/team lead |
| What backend events prove submission, delivery, provider assignment, acknowledgement, and response? | Omor/backend owner |
| What are the exact applicable Bangladesh legal duties for health data, consent, retention, deletion, audit logs, and third-party sharing? | Bangladesh-qualified legal reviewer |
| Are proposed Bangla terms understandable across regions, literacy levels, and assistive-technology users? | Bangla medical translator, accessibility reviewer, and user researchers |
| What are the actual barriers, device constraints, and support preferences of target mothers? | User researchers and product/team lead |

***

## 19. DO NOT PUBLISH YET — Critical Restrictions

Do not publish any of the following until the required verification and approval are complete:

- Every clinical warning-sign draft in this report, including MAT-001 through MAT-027 and MENTAL-001 through MENTAL-004.
- Any claim that 999 provides maternal-specific ambulance dispatch, particular language support, or guaranteed response.
- Any claim that 16263 dispatches ambulances; the verified official page describes ambulance **information**, not guaranteed dispatch. 
- Any facility-specific availability, opening hours, referral acceptance, or contact details.
- Any statement that PROHOR has sent, delivered, assigned, or received a human-care request while the Bondhon starter returns HTTP 501 `not_sent`.
- Any legal claim about Bangladesh health-data consent, retention, deletion, audit logs, breach notification, or cross-border transfer without primary legal-source verification under the currently applicable 2026 Act. [old.dghs.gov](https://old.dghs.gov.bd/images/docs/Strategy/National%20Action%20Plan%20for%20Maternal%20Health%202020.pdf)
- Any claim that a Bangla translation is clinically accurate before qualified clinical and translation review.
- Any mental-health crisis pathway without verification of an operational, appropriate Bangladesh service and clinical approval.
- Any content that implies PROHOR can diagnose a condition, provide treatment, or replace emergency care.

***

## Bibliography

- Ministry of Health and Family Welfare, Government of Bangladesh. *National Action Plan for Maternal Health 2020–2030*. 27 June 2020. [https://old.dghs.gov.bd/images/docs/Strategy/National%20Action%20Plan%20for%20Maternal%20Health%202020.pdf](https://old.dghs.gov.bd/images/docs/Strategy/National%20Action%20Plan%20for%20Maternal%20Health%202020.pdf) 
- Directorate General of Health Services. *DGHS eToolkit: Antenatal Care*. http://etoolkits.dghs.gov.bd/toolkits/bangladesh-mnch/antenatal-care 
- Directorate General of Health Services. *স্বাস্থ্য বাতায়ন: ১৬২৬৩*. Accessed 18 November 2026. [https://16263.dghs.gov.bd/](https://16263.dghs.gov.bd/) 
- Directorate General of Health Services. *জাতীয় অ্যাম্বুলেন্স তথ্য ভাণ্ডার*. Accessed 18 November 2026. http://16263.dghs.gov.bd/ambulance/ambulance/ 
- Government of Bangladesh. *জরুরি হটলাইন*. Updated 29 June 2025. [https://bangladesh.gov.bd/site/page/aaebba14-f52a-4a3d-98fd-a3f8b911d3d9/%E0%A6%9C%E0%A6%B0%E0%A7%81%E0%A6%B0%E0%A6%BF-%E0%A6%B9%E0%A6%9F%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%A8-](https://bangladesh.gov.bd/site/page/aaebba14-f52a-4a3d-98fd-a3f8b911d3d9/%E0%A6%9C%E0%A6%B0%E0%A7%81%E0%A6%B0%E0%A6%BF-%E0%A6%B9%E0%A6%9F%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%A8-) [bangladesh.gov](https://bangladesh.gov.bd/site/page/aaebba14-f52a-4a3d-98fd-a3f8b911d3d9/%E0%A6%9C%E0%A6%B0%E0%A7%81%E0%A6%B0%E0%A6%BF-%E0%A6%B9%E0%A6%9F%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%A8-)
- Ministry of Law, Justice and Parliamentary Affairs. *ব্যক্তিগত উপাত্ত সুরক্ষা অধ্যাদেশ, ২০২৫* (Ordinance No. 61 of 2025; repealed by the Personal Data Protection Act, 2026). [https://bdlaws.minlaw.gov.bd/act-1574.html](https://bdlaws.minlaw.gov.bd/act-1574.html) [old.dghs.gov](https://old.dghs.gov.bd/images/docs/Strategy/National%20Action%20Plan%20for%20Maternal%20Health%202020.pdf)
- World Health Organization. *Pregnancy, Childbirth, Postpartum and Newborn Care: A Guide for Essential Practice*, 3rd edition. 2016; PDF revised December 2017. [https://www.afro.who.int/sites/default/files/2019-06/07%2012%2017%20EDITTED%20PCPNC%20GUIDELINES%203RD%20EDITION%202016%20Dec%202017.pdf](https://www.afro.who.int/sites/default/files/2019-06/07%2012%2017%20EDITTED%20PCPNC%20GUIDELINES%203RD%20EDITION%202016%20Dec%202017.pdf) 
- World Health Organization. *Managing complications in pregnancy and childbirth*. 2016. [https://platform.who.int/docs/default-source/mca-documents/policy-documents/operational-guidance/OMN-CC-31-03-OPERATIONALGUIDANCE-2016-eng-Pregnancy-Childbirth-Management-Guide-L1-2ndEd.pdf](https://platform.who.int/docs/default-source/mca-documents/policy-documents/operational-guidance/OMN-CC-31-03-OPERATIONALGUIDANCE-2016-eng-Pregnancy-Childbirth-Management-Guide-L1-2ndEd.pdf) 
- World Health Organization. *WHO recommendations on maternal and newborn care for a positive postnatal experience*. 2022. [https://www.who.int/publications/i/item/9789240057142](https://www.who.int/publications/i/item/9789240057142) [WHO-03]
- World Health Organization. *Guidelines for Standard Postpartum Care*. 2016. [https://platform.who.int/docs/default-source/mca-documents/policy-documents/guideline/PSE-MN-48-01-GUIDELINE-2016-eng-Standard-PPC-Guidelines.pdf](https://platform.who.int/docs/default-source/mca-documents/policy-documents/guideline/PSE-MN-48-01-GUIDELINE-2016-eng-Standard-PPC-Guidelines.pdf) 
- W3C. *Web Content Accessibility Guidelines (WCAG) 2.2*. [https://www.w3.org/TR/WCAG/](https://www.w3.org/TR/WCAG/) [WCAG-01]
- National Institute of Population Research and Training, ICF, and DHS Program. *Bangladesh Demographic and Health Survey 2022*. [https://dhsprogram.com/pubs/pdf/GF62/GF62Dhaka.pdf](https://dhsprogram.com/pubs/pdf/GF62/GF62Dhaka.pdf) [dspace.bracu.ac](https://dspace.bracu.ac.bd/server/api/core/bitstreams/fb2b8cbd-ef0a-480c-8f8a-b1c470331eb9/content)
- Bangladesh Demographic and Health Survey 2022. [https://microdata.worldbank.org/catalog/6290](https://microdata.worldbank.org/catalog/6290) [bdlaws.minlaw.gov](https://bdlaws.minlaw.gov.bd/act-1574.html)