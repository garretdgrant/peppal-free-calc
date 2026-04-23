# API and Email Flow

The save flow uses a Next.js route handler and Resend.

## Endpoint

```text
POST /api/waitlist
```

Request body:

```json
{
  "email": "user@example.com",
  "company": "",
  "calculation": {
    "peptideLabel": "Retatrutide",
    "units": 25,
    "syringeLabel": "1.0 mL",
    "doseLabel": "2 mg",
    "vialLabel": "24 mg",
    "waterLabel": "3 mL",
    "concentrationMcgPerMl": 8000,
    "doseVolumeMl": 0.25
  }
}
```

The `company` field is a honeypot. Normal users should submit it as an empty string.

## Success Response

```json
{
  "success": true
}
```

## Error Responses

Common responses:

- `400` when the honeypot is filled.
- `400` when email is missing.
- `400` when email is invalid.
- `500` when required Resend environment variables are missing.
- `500` when Resend operations fail.

Calculation payloads are optional for the route, but malformed calculation objects are ignored and the email renders without a calculation card.

## Resend Operations

The route:

1. Resolves the waitlist segment ID.
2. Creates the contact with the segment.
3. If the contact already exists, updates it and ensures segment membership.
4. Opts the contact into the configured topic.
5. Sends the saved-calculation email.

Rate-limit responses are retried with backoff using `retry-after` or `ratelimit-reset` headers when available.

## Email Template

The email template lives in:

```text
lib/emails/freeCalcWelcomeEmail.ts
```

It includes:

- Subject based on the peptide name when present.
- Calculation summary card.
- Draw units.
- Dose, vial, water, concentration, and dose volume details.
- Unsubscribe link placeholder for Resend.

The unsubscribe placeholder is:

```text
{{{RESEND_UNSUBSCRIBE_URL}}}
```

Do not remove unsubscribe support.

## Preview Route

Open this route locally to inspect the email without sending through Resend:

```text
/api/email-preview/free-calc
```

The preview route uses fixed example data and a dummy unsubscribe URL.
