<!-- Paste into README.md under a "Hackathon submission" heading. Update any row the click-through proves wrong. -->

## What works today (honest status, 20 Nov 2026)

All data in this demo is **synthetic**. No real mother's information was used. Barta and Shonket content is **source-linked to WHO/UNICEF, not clinician-reviewed**.

| Module | Working | Limited | Simulated | Future (not claimed) |
|---|---|---|---|---|
| 1 Adapt | Text size, language, contrast, motion, layout saved per account | — | — | AAC symbol boards, braille-specific output |
| 2 Barta | Bangla/English answers linked to WHO/UNICEF; abstains when unsure; danger signs route to urgent care before any AI | Rate limit is per server instance | — | Voice-first chat, more topics |
| 3 Shonket | Help request without AI; 999 one tap; every warning topic links to 999, a person and Barta | Warning content awaits clinician review | — | Automatic clinical alerts |
| 4 Jibonrekha | Pregnancy, baby, measurement, condition, note, visit, correction with source and units | — | All data synthetic | Clinician-entered records |
| 5 Bujhi | Upload → OCR → review → confirm → save | Only haemoglobin (g/dL) is saved; OCR engine loads from a CDN | Sample report | More lab values, prescriptions |
| 6 Shusthota | Mood, energy, activity, rest, hydration, habits, preferences, private diary, history | Entries cannot be edited or deleted yet | All data synthetic | Server reminders, trend summaries |
| 7 Poth | 7,535 mapped facilities, search, maternity filter, visit prep, 999 | Facilities not verified (labelled); straight-line distance | — | Booking, verified accessibility, SMS |
| 8 Bondhon | Mother-chosen sharing with expiry, revoke, request status, history | — | Provider and provider queue | Real clinics, community, analytics |

## Try it in 3 minutes
1. Open the site, switch to বাংলা and large text (Adapt).
2. Sign in as the demo mother; open Jibonrekha (records with sources).
3. Bujhi: upload `public/bujhi/prohor-synthetic-lab-v1.png`, review, confirm.
4. Barta: ask "বাচ্চা নড়ছে না" → urgent-care message first.
5. Shusthota: one tap mood; private diary.
6. Find care: filter Maternity.
7. Bondhon: share 2 records for 1 hour → provider acknowledges → stop sharing.

## Run locally
```bash
npm ci
cp .env.example .env.local   # fill Supabase URL + anon key; never commit keys
npm run check:env
npm run dev
node --test tests/unit/*.mjs # 62 unit tests, no services needed
```

## Safety checks we ran
- 65-phrase danger-sign run through Barta's decision chain (Bangla, English, Banglish): 65/65 route correctly; 10 everyday questions are not escalated.
- RLS guard and PWA-privacy tests pass; diary and AI chat have no sharing scope.
