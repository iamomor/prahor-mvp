# PROHOR Barta API contract

Draft for Day 1 review · Owner: Iftee · Reviewers: Omor and Apurbo

## Verified starter behavior

At baseline commit 0d27d19, POST /api/ai/chat accepted a JSON object with a question. A valid question returned HTTP 501 with status not_connected and Cache-Control: no-store. A whitespace-only question returned HTTP 400 with “Please enter a valid question.” Malformed JSON returned HTTP 400 with “Invalid request.” The verified starter provided no generated answer. The proposed contract below documents the next implementation.

## Request

- Method and path: POST /api/ai/chat
- Media type: application/json; encode Bangla as UTF-8.
- question: required string, trimmed, 1–1,200 characters under the existing validation rule.
- locale: optional, one of bn or en. The updated UI should send its selected locale. Proposed default: bn for callers that omit locale, preserving the existing {question} request shape.
- Public route for general educational questions. Request processing uses the question and locale and retrieves approved public passages. Patient records, report attachments, and user identifiers are outside this contract.

~~~json
{"question":"ANC বলতে কী বোঝায়?","locale":"bn"}
~~~

## Response

Each proposed response contains status, locale, grounded, answer, and sources. A non-answer response also contains message. For input or parsing errors, use bn when the requested locale cannot be validated. The response is JSON and always uses Cache-Control: no-store.

| HTTP | Status | Trigger | Client display |
|---|---|---|---|
| 200 | answered | Approved retrieved evidence supports the entire answer. | Display answer and its source links. |
| 200 | insufficient_evidence | No approved passage supports the question, or support is incomplete. | Display the localized evidence message. |
| 200 | out_of_scope | The question seeks an individualized diagnosis, treatment, dosing, triage, or report interpretation. | Display the approved localized scope message. |
| 400 | invalid_request | JSON parsing fails. | Display the request message. |
| 400 | invalid_question | A valid JSON body fails request validation, including a blank question or invalid locale. | Display validation feedback and retain the input. |
| 501 | not_connected | The deployment has Barta generation disabled or unconfigured. | Display the existing unavailable state. |
| 503 | service_unavailable | Retrieval or generation fails, times out, or returns an unusable result. | Display a localized temporary failure message and allow retry. |
| 429 | rate_limited | The configured public request limit is reached. | Display a localized retry message and honor Retry-After when provided. |

Only answered has grounded=true, a nonempty answer, and at least one source. Every other response has grounded=false, answer=null, and sources=[]. The 400 and 501 starter shapes are still in use at baseline. During rollout the UI should handle those bodies as well as the proposed shape. Use status for the UI state and message as its fallback text.

### Cited answer example

This is a synthetic test response. The example.invalid URL is a test placeholder. Production source URLs come from the approved passage register.

~~~json
{
  "status": "answered",
  "locale": "bn",
  "grounded": true,
  "answer": "এটি পরীক্ষার জন্য তৈরি একটি নমুনা উত্তর।",
  "sources": [
    {
      "title": "Synthetic fixture",
      "url": "https://example.invalid/barta-fixture",
      "excerptId": "FIXTURE-PASSAGE-01"
    }
  ]
}
~~~

### Insufficient evidence example

~~~json
{
  "status": "insufficient_evidence",
  "locale": "bn",
  "grounded": false,
  "answer": null,
  "sources": [],
  "message": "এই প্রশ্নের উত্তর দেওয়ার মতো যাচাই করা তথ্য পাওয়া যায়নি।"
}
~~~

### Service failure example

~~~json
{
  "status": "service_unavailable",
  "locale": "en",
  "grounded": false,
  "answer": null,
  "sources": [],
  "message": "Barta is temporarily unavailable. Please try again."
}
~~~

## Retrieval and interface acceptance criteria

1. Retrieve only approved passages from the source register. Build source title, URL, and stable excerptId from server-managed metadata. Reject citations outside the current retrieved set. Citation membership and passage support are separate checks. The evaluation set should assess whether each substantive claim is supported.
2. With retrieval available and zero eligible results, return insufficient_evidence. Return service_unavailable when retrieval itself fails. A deployment with generation disabled continues to report not_connected. The Day 1 source register has zero approved passages, so integration tests for answered must use isolated, visibly synthetic fixtures until real passages are approved.
3. Use the existing site typography, approved labels, layout, and interaction patterns. Display source links from the server response. Retain the user’s input and make answer, abstention, and error messages available to assistive technology.
4. Keep provider credentials on the server. Keep raw questions, patient data, upstream errors, and prompts out of public responses and routine logs.
5. Test the existing {question} request, UTF-8 Bangla, English locale, invalid input, a supported answer, an evidence gap, a rejected unsupported citation, and an upstream failure. Include the uploaded materials’ accessibility and dosing evaluation cases from PROHOR-Barta-Source-Register.md.

Omor reviews server behavior and failure states. Apurbo reviews locale and rendering. Confirm the proposed default locale before implementation. Bujhi will have its own file-processing contract.
