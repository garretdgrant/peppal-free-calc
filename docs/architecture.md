# Architecture

Free Peptide Calculator is a compact Next.js App Router application. The core page is mostly static server-rendered structure with a single client component for the interactive calculator.

## Request Flow

```text
User
  -> app/page.tsx
  -> app/CalculatorClient.tsx
  -> optional POST /api/waitlist
  -> Resend contact, segment, topic, and email APIs
```

## Frontend

`app/page.tsx` renders the page shell and imports `CalculatorClient`.

`app/CalculatorClient.tsx` is a client component because it uses React state, event handlers, `fetch`, and `window.localStorage`. It owns:

- Syringe, vial, water, dose, and unit state.
- Preset application.
- Forward unit calculation.
- Reverse water calculation from target units.
- Save modal validation.
- Browser localStorage persistence for saved calculations.
- POST request to `/api/waitlist`.

The current storage key is:

```text
bare-calc:saved-calculations
```

Changing this key will orphan previous local saved calculations unless a migration is added.

## Server Routes

`app/api/waitlist/route.ts` handles calculation saves.

Responsibilities:

- Read and validate JSON request bodies.
- Reject spam honeypot submissions.
- Validate email format.
- Normalize and validate calculation payloads.
- Resolve a Resend segment ID from env or segment name.
- Create or update the Resend contact.
- Ensure the contact belongs to the waitlist segment.
- Opt the contact into the configured topic.
- Send a saved-calculation email.
- Retry Resend rate-limit responses with backoff.

`app/api/email-preview/free-calc/route.ts` returns static example HTML for local email preview.

## Shared Helpers

`lib/validations.ts` contains email validation.

`lib/spam.ts` contains the honeypot check.

`lib/emails/freeCalcWelcomeEmail.ts` builds the saved-calculation email subject and HTML.

## Styling

Global design tokens live in `app/globals.css`.

The UI currently uses Tailwind CSS utility classes directly in `app/CalculatorClient.tsx`. Keep visual edits localized unless a repeated pattern becomes painful enough to extract.

## Metadata

`app/layout.tsx` defines application metadata and Open Graph image configuration. The primary OG asset is:

```text
public/free-calc-og.png
```

Metadata exports must stay in server components.
