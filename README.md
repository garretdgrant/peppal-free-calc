# Free Peptide Reconstitution Calculator

An open-source peptide reconstitution calculator built with Next.js, React, and TypeScript. Converts vial strength, bacteriostatic water volume, target dose, and syringe size into a U-100 insulin syringe draw expressed in units.

Live demo: [freepepcalc.com](https://www.freepepcalc.com)
Full-featured hosted version: [peppal.app/calculator](https://www.peppal.app/calculator)

This repository is the source for the lightweight calculator at freepepcalc.com. It exists as a focused, open-source reference implementation of the same reconstitution math that powers [PepPal](https://www.peppal.app), where the hosted product also handles saved calculations, multi-peptide blend math, supplier reference data, and a full peptide library.

## What It Calculates

Given a peptide vial, BAC water volume, and a target dose, the calculator returns:

- **Concentration** — `mcg/mL = total peptide (mcg) ÷ water volume (mL)`
- **Dose volume** — `mL = desired dose (mcg) ÷ concentration (mcg/mL)`
- **Syringe units** — `U-100 units = dose volume (mL) × 100`

It also supports reverse calculation: enter a target syringe unit draw and the calculator returns the BAC water volume that produces it. Built-in presets cover Retatrutide, Tesamorelin, and BPC-157 vial setups.

For the formula derivations and worked examples, see [`docs/CALCULATOR_MATH.md`](./docs/CALCULATOR_MATH.md).

## What This Repo Is Not

This repo is the single-vial calculator. It does not handle:

- Multi-peptide blend math (GLOW, KLOW, Wolverine, CJC/Ipamorelin combo vials) — for that, use the [peptide stack and blend calculator](https://www.peppal.app/tools/peptide-stack-calculator)
- Saved calculation history with custom names and notes
- Per-supplier vial size presets
- Discount code lookup or supplier directory

Those features live in the hosted PepPal product. If you want a richer experience or want to support the project, the [PepPal reconstitution calculator](https://www.peppal.app/calculator) is the canonical version.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Resend (transactional email for the optional "save calculation" flow)
- ESLint + Prettier

## Getting Started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

Production build:

```bash
pnpm build
pnpm start
```

Lint and format:

```bash
pnpm lint
pnpm prettier
```

The calculator UI runs without environment variables. The optional save/email flow requires Resend credentials — see [`docs/environment.md`](./docs/environment.md).

## Where The Math Comes From

Every formula in this calculator is the standard reconstitution math used in clinical pharmacy and the peptide research community. There is nothing proprietary about the arithmetic — concentration is total peptide divided by water volume, and dose volume is desired dose divided by concentration. The value of a calculator is consistent unit handling (mg vs mcg, mL vs U-100 units) and not making the user do the conversions by hand.

For the dosing context behind these calculations on specific peptides, see the dosing protocol references on Peptide Dosing Protocols. A few that pair well with reconstitution math:

- [BPC-157 protocol](https://www.peptidedosingprotocols.com/protocol/bpc-157) — standard 5 mg and 10 mg vial setups, common 250–500 mcg daily dosing
- [TB-500 protocol](https://www.peptidedosingprotocols.com/protocol/tb-500) — 10 mg vial setups with loading and maintenance dose math, plus the 1–2 week reconstituted stability window that drives water-volume choice
- [Tirzepatide protocol](https://www.peptidedosingprotocols.com/protocol/tirzepatide) — 10 mg, 30 mg, and 60 mg vials with titration math from 2.5 mg to 15 mg weekly
- [Retatrutide protocol](https://www.peptidedosingprotocols.com/protocol/retatrutide) — 10 mg and 24 mg vials with titration math up to 12 mg weekly

Each protocol page includes the full clinical dosing schedule that the reconstitution math operates against.

## Project Structure

```
app/
  api/
    email-preview/free-calc/route.ts
    waitlist/route.ts
  CalculatorClient.tsx
  globals.css
  layout.tsx
  page.tsx
docs/
  CALCULATOR_MATH.md
  api-and-email.md
  architecture.md
  calculator-behavior.md
  environment.md
  maintenance.md
lib/
  emails/freeCalcWelcomeEmail.ts
  spam.ts
  validations.ts
public/
  free-calc-og.png
```

Key files: `app/CalculatorClient.tsx` owns calculator state, formulas, presets, and the optional save-calculation flow. `lib/emails/freeCalcWelcomeEmail.ts` renders the saved-calculation email. `app/api/waitlist/route.ts` handles validation and Resend sync.

## Documentation

- [Calculator Math](./docs/CALCULATOR_MATH.md) — formulas, unit conventions, and worked examples for BPC-157, TB-500, tirzepatide, and retatrutide
- [Environment Setup](./docs/environment.md)
- [Architecture](./docs/architecture.md)
- [Calculator Behavior](./docs/calculator-behavior.md)
- [API and Email Flow](./docs/api-and-email.md)
- [Project Maintenance](./docs/maintenance.md)
- [Contributing](./CONTRIBUTING.md)

## Contributing

Pull requests for math corrections, additional vial-size presets, accessibility improvements, and bug fixes are welcome. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the contribution workflow and editorial standards.

## Use Notes

This is an educational calculator. It does the arithmetic — it does not recommend doses, validate that any peptide is appropriate for a person, or provide medical guidance. All copy in the app is intentionally framed as calculation output from user-provided inputs. Keep PRs aligned with that framing; the project does not accept changes that imply a peptide, dose, route, schedule, or protocol is safe or appropriate for any individual.

## License

MIT.

## Credits

Built and maintained by Garret Grant. Companion projects: [PepPal](https://www.peppal.app) (calculator suite, supplier directory, peptide blog) and [Peptide Dosing Protocols](https://www.peptidedosingprotocols.com) (open dosing protocol database).
