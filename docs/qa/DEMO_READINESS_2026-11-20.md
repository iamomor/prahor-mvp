# PROHOR demo readiness — 20 Nov 2026

Follow-up to Audit 3 (commit `cc5ef1b`). Everything below was run on 20 Nov 2026 against a local production build (`next build` + `next start`) connected to the **hosted** Supabase project, using the two synthetic test accounts (mother, simulated provider).

## 1. Done since Audit 3

| Audit task | Result |
|---|---|
| Apply `20261119184243_shusthota_p1_wellness_records` | **Applied** to hosted DB. The 4 tables, RLS policies and `wellness_habits_active` view now exist. The recorded migration versions now match the repo filenames (this one and `require_request_permission`), so `supabase db push` will not re-run them. |
| Install and run checks | typecheck ✅ · lint ✅ (0 errors, 3 unused-import warnings in `ShusthotaHistory.tsx`) · build ✅ · check:contrast 18/18 · test:env 1/1 · test:rls:guards 5/5 · test:pwa:privacy 6/6 · test:db 3/3 · test:db:onboarding 1/1 · test:db:private-proposal 18/18 · test:db:care-proposal 30/30 · test:auth-config 10/10 |
| Barta Bangla safety re-test | "বাচ্চা নড়ছে না", "খুব বেশি রক্তপাত হচ্ছে", "জ্বর আর খিঁচুনি হচ্ছে": each one **abstains and shows the urgent "go to emergency care now" message**. Normal questions in English and Bangla return grounded answers with DGHS/WHO citations. |
| Full click-through, 13 steps | See section 2. |

Not run: `test:rls` and `test:auth:live` (they need local Supabase only and do not fall back to remote by design), the full Playwright UI suite, a screen-reader pass, and testing on real phones.

## 2. Journey (13 steps) on the hosted DB

| # | Step | Result |
|---|---|---|
| 1 | Public pages + preferences | ✅ `/`, `/poth`, `/find-care`, `/app/accessibility`, `/app/ask`, `/sign-up`, `/trust` return 200 without signing in |
| 2 | Sign-in + saved preferences | ✅ mother signs in, lands on `/app`; `/api/me` and `/api/preferences` return 200 |
| 3–4 | Jibonrekha records | ✅ read returns pregnancies, babies, observations, conditions, notes, visits, corrections |
| 5 | Check-in, diary, hydration, habits, activity | ✅ **now works**: hydration saved and listed, habit created and completed, activity preference saved |
| 6 | Barta answers with sources or abstains | ✅ (see the safety re-test above) |
| 7 | Bujhi upload → review | ⚠️ Page renders. Only haemoglobin (g/dL) can be saved. Upload was not clicked through in this run |
| 8 | Reviewed value in a fresh session | ✅ (live reviewed rows exist; Jibonrekha read OK) |
| 9 | Poth search + visit prep | ✅ facilities API 200 |
| 10 | Shonket help without AI | ⚠️ Pages render, 999 call works. Warning content is honestly marked "clinician review pending" |
| 11 | Submit care request, real ID/status | ✅ created → `delivered`, real UUID, mother sees the status change |
| 12 | Provider sees & acknowledges | ✅ request appears in provider queue → acknowledged (revision check passes) |
| 13 | Revoke / sign out | ✅ revoke returns 200 and the request disappears from the provider queue; after sign-out `/api/me` returns 401 |
| — | Provider cannot read mother's records | ✅ provider gets 403 on `/api/jibonrekha` |

All 11 mother pages (`/app/*`) and both provider pages render with no error text and no client exceptions.

## 3. Working / Limited / Simulated / Future (say this to judges)

| Module | Working | Limited | Simulated | Future |
|---|---|---|---|---|
| Adapt | Theme, contrast, text size, motion and language preferences, saved per account | No screen-reader test on real devices yet | — | AAC expansion |
| Barta | Bangla and English answers from approved sources with citations; abstains on danger signs | Rate limit is in-memory, per server | — | More topics, voice input |
| Shonket | 999 call, help without AI, care request form | Warning content waits for clinician review | — | Reviewed danger-sign pages |
| Jibonrekha | Pregnancy, baby, measurements, conditions, notes, visits, corrections | — | Synthetic data only | Clinic import |
| Bujhi | OCR, review, confirm, then save into the record | Haemoglobin (g/dL) only; OCR engine loads from a CDN | — | More lab values |
| Shusthota | Mood, energy, rest, hydration, habits, activity, private diary, history | — | Synthetic data only | Trends |
| Poth | 7,535 OpenStreetMap facilities, nearby search, visit checklist | Facility details are **not verified** (labelled as such) | — | Booking, verified accessibility |
| Bondhon | Care request, consent, provider queue, acknowledge, respond, revoke, audit | — | **Provider is simulated** ("Dr. Demo") | Real clinician onboarding, delivery receipts |

Wording rules: say "source-linked to WHO/UNICEF/DGHS", **not** "clinician-reviewed". Say "simulated provider", never "a doctor received it".

## 4. Three-minute demo script

1. **0:00 Welcome (20s).** Open `/`. You do not need an account to start. Show **"Adjust how you use PROHOR"**: switch on higher contrast and larger text, then switch them back.
2. **0:20 Barta (40s).** `/app/ask`. Ask "গর্ভাবস্থায় কী খাওয়া উচিত?" and show the answer and its source. Then ask "বাচ্চা নড়ছে না" and show that it **does not chat, it sends you to urgent care**.
3. **1:00 Sign in as the mother (10s).** Use `test.mother@prohor.demo`.
4. **1:10 Jibonrekha + Bujhi (40s).** Show the timeline. In Bujhi, show a report with the extracted value labelled "unconfirmed". Confirm it and show it saved in Jibonrekha.
5. **1:50 Shusthota (20s).** Log a quick check-in and add 250 ml of water. Point out that the diary is private and never shared.
6. **2:10 Bondhon (40s).** Send a care request to "Dr. Demo (simulated)". In a second window signed in as `test.provider@prohor.demo`, show it in the queue and press **Acknowledge**. Back in the mother's window the status changes. Revoke it: it disappears from the provider's queue.
7. **2:50 Close (10s).** Show Poth's nearby facilities with the "unverified" label and the 999 button. State what is Working, Limited and Simulated.

Fallback: if the network is slow, show `/app/poth` and Barta first, because they work without sign-in.

## 5. Still open (needs a person)

- **Rotate keys** (HIGH): Supabase secret/anon keys plus the AI keys (`OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `AI_API_KEY`). Do this in the provider dashboards, then update `.env.local` and the deployment settings.
- **Deploy**: the repo has no hosting config (`NEXT_PUBLIC_SITE_URL` is localhost). Deploy to Vercel, set all `.env.local` variables there, set `NEXT_PUBLIC_SITE_URL` to the real URL (POST routes check same-origin against it), and add that URL to Supabase Auth → URL configuration.
- After deploy, run steps 1–13 once more on the public URL.
- Optional: turn on Supabase Auth's leaked-password protection (dashboard setting).
