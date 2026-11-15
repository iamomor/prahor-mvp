# Feature ownership boundaries
- adapt (Iftee): optional preferences; core file already in `src/lib/access-preferences.ts`.
- barta (Ifty): knowledge retrieval / Bangla educational RAG; no fabricated citations.
- shonket (Omor + Samin): reviewed safety entry; never LLM triage.
- jibonrekha (Apubo): maternal/baby care timeline and source-labeled observations.
- bujhi (Ifty + Apubo): document extraction and review before saving.
- shusthota (Samin): optional private wellness; no compulsory fitness targets.
- poth (Samin): sourced facility directory; unknown accessibility -> Not verified.
- bondhon (Omor + Samin): consent-scoped care requests and authorized provider queue.
Create module folders rather than placing private domain logic in `app/` pages.
