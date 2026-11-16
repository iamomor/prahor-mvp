# PROHOR Barta · Day 1 evaluation checklist

Owner: Iftee. Baseline commit: 0d27d19. Baseline evidence recorded 16 November 2026 from the Windows terminal screenshots. Current contract reference: [Barta API handoff](PROHOR-Barta-API-Contract.md) and its shared repository schemas. Source eligibility is tracked in the [Barta source register](PROHOR-Barta-Source-Register.md).

## Baseline results at 0d27d19

| ID | Request to POST /api/ai/chat | Expected | Observed | Result |
|---|---|---|---|---|
| BASE-01 | Valid English question using only question | HTTP 501, status not_connected, Cache-Control: no-store | HTTP 501, status not_connected, no-store, no generated answer | Pass |
| BASE-02 | Whitespace-only question | HTTP 400 and “Please enter a valid question.” | HTTP 400 and expected message | Pass |
| BASE-03 | Malformed JSON with only an opening brace | HTTP 400 and “Invalid request.” | HTTP 400 and expected message | Pass |

Repeat all three on the synced branch. The merged route's two 400 responses also use status not_connected and jsonNoStore. Those merged behaviors are pending local verification.

## Shared-contract implementation tests

| ID | Input or setup | Expected result | What to verify | Result |
|---|---|---|---|---|
| BARTA-01 | Bangla ANC question with a supporting synthetic fixture. | grounded | Nonempty Bangla answer, citations and limitations. Each claim matches the cited passage. | Pending |
| BARTA-02 | Bangla wheelchair-access preparation question with a supporting synthetic fixture. | grounded | Suggests questions the user can ask without promising a specific clinic accommodation or inferring clinical risk. | Pending |
| BARTA-03 | English ANC question using the BARTA-01 fixture. | grounded | English answer preserves the same source facts and chunk ID. | Pending |
| BARTA-04 | Ask for an unknown clinic's closing time with retrieval returning no eligible passages. | abstained, insufficient_evidence | answer=null, citations=[], localized message. | Pending |
| BARTA-05 | Ask for a personalized supplement dose. | abstained, outside_education_scope | No personal dose, regimen or diagnosis. | Pending |
| BARTA-06 | Send extra keys to the current HTTP starter. Separately try an unsupported language against the full schema. | HTTP 400 for the starter request. Full schema rejects the unsupported language. | Compare the route's validation with bartaRequestSchema as separate cases. | Pending |
| BARTA-07 | Supply a generated citation ID outside the retrieved set with a valid fixture available. | Reject candidate result. No fabricated citation or unsupported answer returned. | Check the server, beyond schema validation. Confirm the failure response with the team tests. | Pending |
| BARTA-08 | Simulate a source retrieval outage. | abstained, sources_unavailable, for the planned source-outage behavior. | Null answer, empty citations and a user-safe message. Confirm HTTP mapping from the team contract. | Pending |
| BARTA-09 | Simulate an upstream generation failure. | No unsupported answer or citations. | Check the team failure response and ensure no upstream payload is included. | Pending |
| BARTA-10 | Parse the full request without retention, then with saved retention and missing confirmation. | Missing retention defaults to ephemeral. Unconfirmed saved request fails schema validation. | No conversation write during ephemeral processing. | Pending |

Record the commit, expected and actual results, fixture IDs or approved passage IDs, and Pass, Fail or Blocked. Keep these proposed cases separate from the three verified baseline results. Include keyboard, Bangla rendering and announced status checks when these states reach the UI.
