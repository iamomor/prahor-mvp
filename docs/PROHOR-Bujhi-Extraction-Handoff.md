# PROHOR Bujhi · Day 1 extraction handoff

Draft for review · Iftee owns extraction · Ifty owns review and record integration · Omor reviews auth and deployment scope.

## First supported format

Start with one single-page, machine-printed synthetic PNG report, template PROHOR-SYNTH-LAB-V1. Create a clearly marked sample with a fixed layout, fictional values, and no name, patient ID, address, or other personal information. Use one allowlisted field, Hemoglobin, with the template label HGB and printed unit g/dL. Values are transcribed for review. Clinical interpretation is outside the extraction contract.

The proposed local upload limit is one PNG up to 1 MiB and 2,048 pixels per side. Check the file signature, dimensions, successful decoding, and the expected synthetic marker and layout. The marker identifies the format and is insufficient to prove a file is free of personal data. For the first public preview, offer a fixed synthetic example and keep arbitrary uploads disabled. PDF, JPEG, handwriting, and additional report templates are outside this version.

## API proposal

POST /api/reports/extract accepts multipart/form-data with a single file part called report for authenticated, authorized testing. Omor confirms the authorization rule and upload limits before integration. Return JSON with Cache-Control: no-store. Hold the image for the extraction request, discard it after processing, and keep its contents and filename out of logs. No database write or automatic record creation occurs during extraction.

| HTTP | Status | Trigger |
|---|---|---|
| 200 | needs_review | Supported synthetic image with one field ready for human review, which may still be unreadable or ambiguous. |
| 400 | invalid_request | Missing or duplicate file part, or an unreadable multipart request. |
| 401 | unauthenticated | No valid session. |
| 403 | forbidden | Valid session without the required authorization. |
| 413 | file_too_large | File exceeds the configured byte or dimension limits. |
| 415 | unsupported_format | Upload is not a decodable PNG in the supported synthetic template. |
| 503 | extraction_unavailable | The extraction component fails or times out. |

Errors return status and a user-safe message, without fields. A supported image with an uncertain field can still return needs_review.

## Example response

The numeric string below is fictional. Keeping it as a string preserves the report's decimal formatting. The source page and label refer to the user's current in-memory preview.

~~~json
{
  "status": "needs_review",
  "templateId": "PROHOR-SYNTH-LAB-V1",
  "fields": [
    {
      "id": "hemoglobin",
      "label": "Hemoglobin",
      "rawText": "11.4",
      "value": "11.4",
      "unit": "g/dL",
      "extractionState": "readable",
      "verificationState": "unverified",
      "source": { "page": 1, "label": "HGB" }
    }
  ]
}
~~~

For an ambiguous token, return extractionState=ambiguous and value=null. Show the original field token if it was legible enough to capture. When the token cannot be read, return extractionState=unreadable, rawText=null, and value=null. If the printed unit is uncertain, return unit=null, value=null, and extractionState=ambiguous unless the case is unreadable. Keep verificationState=unverified in every extraction response. Never guess a digit, infer a unit, or fill in a missing value.

Example rejection for the uploaded guideline PDF:

~~~json
{
  "status": "unsupported_format",
  "message": "Use the supported synthetic PNG example."
}
~~~

## Review handoff for Ifty

1. Render the image preview beside the extracted field. Show the raw token, unit, and an accessible verification label using the existing layout and typography.
2. Keep the extracted value editable and in review until the user explicitly accepts it. Missing or ambiguous fields start empty and can be corrected manually or discarded. Keep unit and decimal handling visible in the review.
3. If a later, authorized flow saves the result, preserve its extraction provenance and any user corrections. User review does not represent clinician verification. Agree on the destination record and enforce the write authorization separately from extraction.
4. Public preview acceptance uses the built-in synthetic fixture. Keep the preview's claims limited to the format and fields actually supported.

## Acceptance checks

| Case | Expected outcome |
|---|---|
| Readable synthetic HGB field | 200 needs_review. Show the exact token and unit as unverified. Zero records written during extraction. |
| One unclear digit | 200 needs_review, ambiguous, value=null. The review task can be completed manually. |
| Printed unit is unreadable | 200 needs_review with unit=null and value=null. No default unit applied. |
| Uploaded clinical guideline PDF | 415 unsupported_format. Zero extracted fields and zero records written. |
| PNG with the wrong template | 415 unsupported_format. |
| Unauthenticated request | 401 with no fields and no extraction work. |
| Authorized attempt, extractor times out | 503 extraction_unavailable with a retry message. |

All cases are proposed and pending. Day 1 sign-off is agreement on the PNG template and output fields with Ifty, plus auth and scope review with Omor.
