# Contributing

Thanks for considering a contribution. This project is small on purpose — a single-vial peptide reconstitution calculator with a save-calculation email flow. The goal is to keep the math correct, the UI fast, and the framing strictly educational.

## What We Accept

- Math corrections and additional unit-tested edge cases
- New vial-size presets for peptides where the math is well-documented in primary sources
- Accessibility fixes (keyboard navigation, screen reader labels, color contrast)
- Bug fixes (UI, validation, edge-case rounding, mobile layout)
- Documentation improvements in `docs/`
- Performance improvements (bundle size, hydration, render path)

## What We Don't Accept

- Copy changes that imply a peptide, dose, schedule, route, or protocol is safe or appropriate for a person
- Medical recommendations, treatment language, or marketing claims
- Affiliate links or supplier promotion (the live PepPal product handles supplier reference data)
- New features that duplicate the hosted [PepPal calculator suite](https://www.peppal.app/calculator) — this repo is the lightweight reference implementation, not a competing fork

For multi-peptide blend math (Wolverine, GLOW, KLOW, CJC/Ipamorelin combo vials), point users to the [stack and blend calculator on PepPal](https://www.peppal.app/tools/peptide-stack-calculator) rather than adding blend support here.

## Workflow

1. Open an issue describing the problem or change before opening a PR for anything beyond a typo or a one-line fix.
2. Fork, branch from `main`, and keep the diff focused on one change.
3. Run `pnpm lint` and `pnpm prettier` before pushing.
4. Add or update tests where math behavior changes.
5. In the PR description, link any sources you used to verify peptide-specific values (PubMed, manufacturer prescribing information, peer-reviewed reviews).

## Methodology Reference

For the editorial standards and source-tier system that guide what counts as a verifiable claim across this ecosystem, see the [PepPal methodology page](https://www.peppal.app/about). The same Tier 1–4 source hierarchy applies to anything you cite in a PR for peptide-specific values.

## Code of Conduct

Be direct, technical, and respectful. Disagree with code, not with people. Maintainers reserve the right to close PRs that don't align with the project's educational-only framing.
