# Free Peptide Calculator

Free Peptide Calculator is a focused peptide reconstitution calculator powered by [PepPal](https://peppal.app). It helps users convert vial size, bacteriostatic water volume, target dose, and syringe size into a U-100 insulin syringe draw in units.

The app is intentionally small: one calculator experience, a saved-calculation email flow, and enough documentation to keep future changes predictable.

## What It Does

- Calculates syringe units from vial strength, water volume, dose, and syringe capacity.
- Supports common presets for Retatrutide, Tesamorelin, and BPC 157.
- Accepts custom vial, water, and dose values.
- Lets users reverse-calculate water volume from a desired syringe unit target.
- Saves calculation summaries locally in the browser and sends the user an email copy through Resend.
- Provides an internal email preview route for the saved-calculation email template.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Resend for contact, segment, topic, and email delivery
- ESLint and Prettier

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open `http://localhost:3000`.

Build for production:

```bash
pnpm build
```

Start the production build:

```bash
pnpm start
```

Run linting:

```bash
pnpm lint
```

Format the project:

```bash
pnpm prettier
```

## Environment Variables

The calculator UI runs without environment variables, but the save/email flow requires Resend settings:

```bash
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_WAITLIST_SEGMENT_NAME=
RESEND_WAITLIST_SEGMENT_ID=
RESEND_WAITLIST_TOPIC_ID=
```

`RESEND_WAITLIST_SEGMENT_NAME` or `RESEND_WAITLIST_SEGMENT_ID` must be configured. The route uses the ID directly when present and otherwise looks up the segment by name.

Keep `.env` files local. Do not commit secrets.

See [Environment Setup](docs/environment.md) for more detail.

## Project Structure

```text
app/
  api/
    email-preview/free-calc/route.ts
    waitlist/route.ts
  CalculatorClient.tsx
  globals.css
  layout.tsx
  page.tsx
lib/
  emails/freeCalcWelcomeEmail.ts
  spam.ts
  validations.ts
public/
  free-calc-og.png
docs/
```

Key files:

- `app/page.tsx` renders the server page shell.
- `app/CalculatorClient.tsx` owns calculator state, presets, formulas, modal behavior, localStorage, and the client-side call to `/api/waitlist`.
- `app/api/waitlist/route.ts` validates submissions, handles the honeypot field, syncs the Resend contact, opts the contact into the configured topic, and sends the saved-calculation email.
- `lib/emails/freeCalcWelcomeEmail.ts` renders the transactional-style saved calculation email.
- `app/api/email-preview/free-calc/route.ts` renders a browser preview of the saved-calculation email.

## Documentation

- [Environment Setup](docs/environment.md)
- [Architecture](docs/architecture.md)
- [Calculator Behavior](docs/calculator-behavior.md)
- [API and Email Flow](docs/api-and-email.md)
- [Project Maintenance](docs/maintenance.md)
- [Contributing](CONTRIBUTING.md)

## Product Notes

This project is an educational calculator. It should avoid medical claims, treatment recommendations, or dosing instructions beyond arithmetic outputs from user-provided inputs.

When changing copy, keep the calculator framed as a calculation aid. Do not imply that a peptide, dose, route, schedule, or protocol is safe or appropriate for a person.

## Deployment

The app is compatible with Vercel and standard Next.js hosting that supports App Router route handlers. Production deployments need the same Resend environment variables used locally for the save/email flow.
