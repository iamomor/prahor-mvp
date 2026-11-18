# PROHOR Barta API contract

> Historical Day 1 handoff for `f9a2957`, retained for provenance. The route below
> has since been integrated as a limited public education service. Use the
> [canonical API contract](architecture/api-contracts.md#barta-and-shonket-public-information)
> and `src/lib/contracts/current-api.ts` for current requests, statuses and optional
> audio. Question-only requests remain a compatibility path, not the public chat UI.

Implementation handoff · Iftee · Reviewed against the Barta files merged from Omor's main update (f9a2957, containing 07e8d83).

## What the current route does

POST /api/ai/chat uses a strict question-only pick of bartaRequestSchema. Send a JSON body with exactly the question field to exercise this route today.

~~~json
{"question":"ANC বলতে কী বোঝায়?"}
~~~

| Request | Current route outcome |
|---|---|
| Valid question only | HTTP 501, status not_connected, with the existing unavailable message. |
| Malformed JSON | HTTP 400, status not_connected, message “Invalid request.” |
| Invalid question or extra key | HTTP 400, status not_connected, message “Please enter a valid question.” |

The route uses jsonNoStore for all three branches. These outcomes follow from the merged code and are pending a repeat smoke test on the synced checkout. Earlier baseline results are in [the evaluation checklist](PROHOR-Barta-Evaluation.md).

## Shared contract for implementation

Use src/lib/contracts/barta.ts for runtime validation and TypeScript types. The route's question-only schema is the current transport. The complete request has question, required language validated by languageSchema, and retention. The default retention is ephemeral. A saved request requires confirmed=true and a conversationId or null. A retention choice is separate from authorization. Persisted conversations are outside the first fixture milestone.

| Field or status | Shared shape |
|---|---|
| grounded | Nonempty answer, 1–20 citations, and 1–10 nonempty limitations. |
| abstained | answer=null, citations=[], message, and reason insufficient_evidence, outside_education_scope, or sources_unavailable. |
| not_connected | answer=null and message under bartaAnswerSchema. The existing HTTP starter route returns its smaller status/message body. |
| Citation | sourceId, chunkId, sourceVersion, title, publisher, HTTPS url, locator and reviewedAt. |

The earlier Day 1 draft proposed locale, answered, grounded as a boolean, and sources. Replace those draft names with the shared contract's language, grounded status and citations. Confirm the accepted language values from src/lib/contracts/common.ts before building request fixtures. HTTP mappings for grounded, abstained and service failures are implementation decisions to check against the shared route tests and architecture docs.

## First implementation milestone

1. Read tests/api.spec.ts and the Barta sections of tests/contracts before editing. Keep the current question-only request working while the client still uses it. Use the established UI language wiring when the complete request is connected.
2. Build the smallest server-side answer path with a synthetic passage and deterministic output. Validate its result with bartaAnswerSchema. In a normal live deployment, only passages approved in [the source register](PROHOR-Barta-Source-Register.md) are eligible. There are no approved passages yet. Use test-only fixtures or a visibly labeled demo that cannot pass for patient guidance.
3. Build citations from retrieved, versioned passage metadata. Verify source approval, citation membership and support for each substantive claim. The schema's required fields alone cannot prove that a citation exists or supports an answer.
4. For insufficient support or personal advice, construct the canonical abstention with its documented reason. For source unavailability, keep the answer and citations empty and use a user-safe message. Confirm operational failure behavior against the team API tests.
5. Keep the existing site layout and localized display patterns. Add the approved answer, citations, limitation and abstention states to the product UI as the implementation is integrated. Keep patient records, raw questions, provider credentials and upstream payloads out of public responses and routine logs.
