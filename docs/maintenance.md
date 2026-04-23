# Project Maintenance

## Routine Checks

Run these before deploying or handing off meaningful changes:

```bash
pnpm lint
pnpm build
```

Run formatting when files have broad style drift:

```bash
pnpm prettier
```

## Dependency Manager

This repo has both `package-lock.json` and `pnpm-lock.yaml`, but the scripts and existing workflow use `pnpm`. Prefer `pnpm` unless the project standard changes deliberately.

If the team standardizes on one package manager later, remove the unused lockfile in a separate cleanup change.

## Manual QA

Check these paths:

```text
/
/api/email-preview/free-calc
```

Calculator QA:

- Change syringe sizes.
- Use each preset.
- Enter custom vial, water, and dose values.
- Toggle mg and mcg.
- Enter target units and confirm water reverse-calculation updates.
- Confirm a too-large draw warns against the selected syringe capacity.
- Confirm tiny draws are flagged.
- Save a valid calculation with Resend variables configured.
- Try saving with an invalid email.

Responsive QA:

- Mobile narrow viewport.
- Tablet width.
- Desktop width.

## Documentation Maintenance

Update docs when:

- Environment variables change.
- Calculation formulas or rounding change.
- Save, waitlist, contact, topic, or email behavior changes.
- Setup commands change.
- Deployment assumptions change.

Keep the root README concise. Put detailed maintainer context in this folder.

## Security Notes

- Keep Resend secrets server-side.
- Do not add `NEXT_PUBLIC_` to private API keys.
- Do not log user emails or calculation payloads unless there is an explicit debugging need, and remove temporary logging before shipping.
- Treat calculation emails as user data.

## Product Copy Guardrails

The project can say what the calculator computes. It should not tell a user what they should take, how often to take it, or whether a dose is right for them.
