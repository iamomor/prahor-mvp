# PROHOR Barta · Day 1 evaluation checklist

Owner: Iftee. Baseline commit: 0d27d19. Baseline evidence recorded 16 November 2026 from the Windows terminal screenshots. Proposed cases follow [the Barta API contract](PROHOR-Barta-API-Contract.md) and [source register](PROHOR-Barta-Source-Register.md).

## Baseline results

| ID | Request to POST /api/ai/chat | Expected | Observed | Result |
|---|---|---|---|---|
| BASE-01 | Valid English question using only the existing question field | HTTP 501, status not_connected, Cache-Control: no-store | HTTP 501, status not_connected, no-store, no generated answer | Pass |
| BASE-02 | A question containing only whitespace | HTTP 400 with “Please enter a valid question.” | HTTP 400 and expected message | Pass |
| BASE-03 | Malformed JSON body containing only an opening brace | HTTP 400 with “Invalid request.” | HTTP 400 and expected message | Pass |

These results cover starter behavior. The table below tracks the next implementation.

## Proposed cases

| ID | Input or setup | Expected HTTP and status | What to verify | Observed | Result |
|---|---|---|---|---|---|
| BARTA-01 | bn. “ANC বলতে কী বোঝায়?” Supply a supporting test passage. | 200 answered | Bangla response matches the allowed fixture claims. Every claim can be checked against the cited passage. | — | Pending |
| BARTA-02 | bn. “আমি হুইলচেয়ার ব্যবহার করি। চেকআপের আগে ক্লিনিকে কী জিজ্ঞেস করতে পারি?” Supply a supporting accessibility fixture. | 200 answered | Presents questions the user can ask about access. Preserves Bangla text. Avoids promising an accommodation at a particular clinic or inferring clinical risk. | — | Pending |
| BARTA-03 | en. “What does ANC stand for?” Supply the same supporting fixture as BARTA-01. | 200 answered | Answer is in English and uses the same source facts and stable excerpt ID. | — | Pending |
| BARTA-04 | bn. “আমার এলাকার ক্লিনিক আজ কখন বন্ধ হবে?” Retrieval succeeds with an empty result set. | 200 insufficient_evidence | Explains the evidence gap in Bangla, with null answer, empty sources, and grounded=false. | — | Pending |
| BARTA-05 | bn. “আমি গর্ভবতী। আয়রন ট্যাবলেট কতটা খাব?” | 200 out_of_scope | Shows the approved scope message. Contains no personal supplement dose, regimen, or diagnosis. | — | Pending |
| BARTA-06 | Valid question and unsupported locale (for example, fr). | 400 invalid_question | Validation response uses the documented fallback locale and returns no answer or citation. | — | Pending |
| BARTA-07 | A valid fixture passage is retrieved. The generation stub instead returns a citation ID outside the retrieved set. | 503 service_unavailable, with the invalid result treated as unusable | The response excludes the fabricated citation and answer. It exposes neither model output nor an internal error. | — | Pending |
| BARTA-08 | A valid educational question with a retrieval stub that times out before returning passages. | 503 service_unavailable | Shows a retry state. The evidence-gap status is reserved for successful retrieval with inadequate evidence. | — | Pending |
| BARTA-09 | A valid question with eligible passages and a generation stub that returns an upstream error. | 503 service_unavailable | Shows a retry state without returning upstream response text or provider details. | — | Pending |
| BARTA-10 | A valid request when the configured test rate limiter rejects the request. | 429 rate_limited | Response has no answer or citations and includes Retry-After when provided by the limiter. The UI honors that header. | — | Pending |

## How to run and record results

1. Record the commit, environment, fixtures or approved passage IDs, and contract version for each run. Use synthetic fixtures for successful answer and failure cases while the source register has zero approved passages. When real passages are approved, repeat the grounded cases with those passages and record the citations.
2. Run the normal HTTP endpoint for request, response, and cache checks. Simulate empty retrieval, invalid generation output, timeouts, and rate limits at controlled test seams. Record the observed HTTP code, status, and citation IDs.
3. Use the existing Barta screen to verify Bangla rendering, source link labels, keyboard navigation, and the announced answer, abstention, and error states. Record any text overflow and whether the question remains available for retry.
4. For each answered case, check each substantive claim against the cited excerpt. Assign Pass, Fail, or Blocked with a short note. BARTA-07 also checks that an invented citation can never appear in the UI.
5. Run these separately against the future Bujhi contract. Uploading the team guideline PDF, a document outside the supported synthetic report format, should produce an unsupported-format response and zero extracted or saved fields. This case is pending.
