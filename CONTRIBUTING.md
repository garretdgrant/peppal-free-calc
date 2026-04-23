# Contributing

This project is a small Next.js app, so contributions should stay focused and easy to verify. Prefer direct improvements over broad rewrites.

## Local Setup

Install dependencies:

```bash
pnpm install
```

Run locally:

```bash
pnpm dev
```

Before opening or merging a change, run:

```bash
pnpm lint
pnpm build
```

Use Prettier for formatting:

```bash
pnpm prettier
```

## Branch Workflow

1. Create a branch for the change.
2. Keep commits scoped to one user-facing or technical purpose.
3. Update documentation when behavior, setup, environment variables, or maintainer workflow changes.
4. Run lint and build before handing off.

## Code Standards

- Follow the existing App Router structure.
- Keep interactive state inside client components. The current calculator entry point is `app/CalculatorClient.tsx`.
- Keep server-only integrations in route handlers or server-side helpers.
- Never expose Resend secrets or other private values to the browser.
- Prefer clear validation and explicit error responses for API routes.
- Keep UI copy concise and calculation-focused.

## Next.js Version Note

This project uses Next.js 16. Before changing Next.js APIs, routing conventions, metadata, route handlers, or configuration, read the matching local guide in `node_modules/next/dist/docs/`.

Useful local docs for this app:

- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`

## Calculator Changes

Calculator changes should preserve the core U-100 convention:

- `100 units = 1 mL`
- `doseVolumeMl = doseMcg / concentrationMcgPerMl`
- `units = doseVolumeMl * 100`

When changing formula behavior, update [Calculator Behavior](docs/calculator-behavior.md) and manually test normal, tiny, invalid, and syringe-overflow states.

## Email and Waitlist Changes

The save flow posts to `/api/waitlist`, stores a local browser copy, and sends an email summary through Resend.

When changing this flow:

- Test invalid email submissions.
- Test honeypot submissions.
- Test missing environment variable behavior.
- Preview the email at `/api/email-preview/free-calc`.
- Keep unsubscribe support in the email template.

## Copy and Compliance

Free Peptide Calculator is powered by [PepPal](https://peppal.app), but this repo should not create medical advice. Avoid:

- Treatment recommendations.
- Claims that a peptide or dose is safe or effective.
- Protocol instructions.
- User-specific medical guidance.

Acceptable copy describes arithmetic, calculator inputs, saved calculations, and product status.

## Pull Request Checklist

- Lint passes.
- Production build passes.
- Relevant docs are updated.
- Environment variables are documented when changed.
- UI changes have been checked on mobile and desktop widths.
- Email changes have been checked through the preview route.
