# Calculator Math

This document covers the formulas the calculator uses, the unit conventions, and worked examples for common peptide vial setups. Nothing here is proprietary — this is the standard reconstitution math used in clinical pharmacy and the peptide research community. The point of a calculator is consistent unit handling, not novel arithmetic.

## Unit Conventions

- **Vial weight** — peptide manufacturers ship lyophilized vials labeled in milligrams (mg). Common sizes: 2 mg, 5 mg, 10 mg, 15 mg, 20 mg, 24 mg, 30 mg.
- **Dose** — peptide doses are usually expressed in micrograms (mcg) for short peptides like BPC-157 and milligrams (mg) for GLP-1 class peptides like tirzepatide and retatrutide. `1 mg = 1000 mcg`.
- **Water volume** — bacteriostatic water (BAC) is measured in milliliters (mL). Common reconstitution volumes are 1 mL, 2 mL, and 3 mL.
- **Syringe units** — U-100 insulin syringes use a unit scale where `1 mL = 100 units`. A "20 unit draw" is `0.20 mL`. The calculator returns syringe units because that is what users actually read off the syringe barrel.

## Core Formulas

The calculator runs three equations in sequence:

### 1. Concentration

```
Concentration (mcg/mL) = Total peptide (mcg) ÷ BAC water volume (mL)
```

This is what the vial actually contains per milliliter once the lyophilized powder is dissolved. Higher water volume means lower concentration.

### 2. Dose Volume

```
Dose volume (mL) = Desired dose (mcg) ÷ Concentration (mcg/mL)
```

This is the volume of solution that contains the target dose. It is the quantity the user actually draws into the syringe.

### 3. Syringe Units

```
U-100 syringe units = Dose volume (mL) × 100
```

This is the syringe-barrel reading. `0.10 mL` is `10 units`. `0.25 mL` is `25 units`.

### Reverse Math (Optional)

The calculator also supports a target-units mode. Given a desired draw size in syringe units and a target dose, it computes the required BAC water volume:

```
BAC water volume (mL) = Total peptide (mcg) × Target units ÷ (Desired dose (mcg) × 100)
```

This is the same three equations rearranged. Useful for users who prefer to draw a specific volume (for example, exactly 20 units) and want to know how much water to add to make that work.

## Worked Examples

### Example 1 — BPC-157, 5 mg vial, 250 mcg dose

A standard BPC-157 setup. Vial is 5 mg (5,000 mcg) of lyophilized peptide. Common community dose is 250 mcg once or twice daily.

Reconstitute with 2 mL BAC water:

```
Concentration = 5,000 mcg ÷ 2 mL = 2,500 mcg/mL
Dose volume   = 250 mcg ÷ 2,500 mcg/mL = 0.10 mL
Syringe units = 0.10 mL × 100 = 10 units
```

Result: draw to 10 units on a U-100 syringe for a 250 mcg dose. The vial contains 20 doses at this setup.

For the full BPC-157 dosing schedule, regulatory status, and typical loading vs. maintenance protocols, see the [BPC-157 protocol page](https://www.peptidedosingprotocols.com/protocol/bpc-157).

### Example 2 — TB-500, 10 mg vial, 2 mg loading dose

TB-500 is typically loaded at 2–2.5 mg twice weekly for 4–6 weeks, then maintained at lower frequency. Vial is 10 mg (10,000 mcg).

Reconstitute with 2 mL BAC water:

```
Concentration = 10,000 mcg ÷ 2 mL = 5,000 mcg/mL
Dose volume   = 2,000 mcg ÷ 5,000 mcg/mL = 0.40 mL
Syringe units = 0.40 mL × 100 = 40 units
```

Result: draw to 40 units for a 2 mg loading dose. The vial contains 5 loading doses at this setup.

A practical note: TB-500 has a reconstituted stability window of roughly 1–2 weeks refrigerated. If your dosing schedule means a vial would last longer than that, consider reconstituting with less water (which raises concentration and lowers dose volume) so the vial finishes inside the stability window. The [TB-500 protocol page](https://www.peptidedosingprotocols.com/protocol/tb-500) covers stability and dosing schedules in detail.

### Example 3 — Tirzepatide, 10 mg vial, 5 mg titration dose

Tirzepatide titrates from 2.5 mg weekly up to 15 mg weekly across roughly 20 weeks. The 5 mg dose is the typical week 9–12 step. Vial is 10 mg (10,000 mcg).

Reconstitute with 2 mL BAC water:

```
Concentration = 10,000 mcg ÷ 2 mL = 5,000 mcg/mL
Dose volume   = 5,000 mcg ÷ 5,000 mcg/mL = 1.00 mL
Syringe units = 1.00 mL × 100 = 100 units
```

Result: draw a full 1 mL syringe (100 units) for a 5 mg dose. The vial contains 2 doses at this setup.

A 1 mL draw on a U-100 syringe is the maximum the syringe holds — meaning this water volume gives no margin. For a 5 mg tirzepatide dose, most users prefer a 30 mg vial reconstituted with 3 mL (10,000 mcg/mL), which delivers 5 mg in 0.50 mL (50 units) and gives 6 doses per vial. The [tirzepatide protocol page](https://www.peptidedosingprotocols.com/protocol/tirzepatide) covers vial-size selection across the full titration schedule.

### Example 4 — Retatrutide, 24 mg vial, 2 mg titration dose

Retatrutide titrates from 2 mg weekly up to 12 mg weekly. The 2 mg dose is the standard starting point. Vial is 24 mg (24,000 mcg).

Reconstitute with 3 mL BAC water:

```
Concentration = 24,000 mcg ÷ 3 mL = 8,000 mcg/mL
Dose volume   = 2,000 mcg ÷ 8,000 mcg/mL = 0.25 mL
Syringe units = 0.25 mL × 100 = 25 units
```

Result: draw to 25 units for a 2 mg starting dose. The vial contains 12 doses at this setup, which works for a 12-week starting block before titrating up.

For the full retatrutide titration schedule and the TRIUMPH trial program context that drives the dosing logic, see the [retatrutide protocol page](https://www.peptidedosingprotocols.com/protocol/retatrutide).

## Multi-Peptide Vials

The math above is for **single-peptide vials only** — one peptide reconstituted in one vial. If you have two or more peptides reconstituted together (Wolverine, GLOW, KLOW, CJC-1295/Ipamorelin combo vials, or any custom blend), every component has its own concentration, and a single draw delivers a proportional amount of every peptide.

That math is different and not handled in this calculator. For blend math, use the [peptide stack and blend calculator](https://www.peppal.app/tools/peptide-stack-calculator), which handles 2–5 component blends with anchor-dose mode and per-component delivery breakdown.

## Common Sources of Error

A few mistakes that cause incorrect draws even when the formulas are applied correctly:

- **Mixing mg and mcg** — entering 250 when you meant 250 mcg vs. 250 mg is a 1,000× error. The calculator forces a unit selector to prevent this.
- **Ignoring stability windows** — reconstituting too much water gives more doses per vial than the peptide stays stable for. TB-500 (1–2 weeks refrigerated) is the most common limiter in stack vials.
- **Drawing on the wrong syringe scale** — not all insulin syringes are U-100. U-40 and U-50 syringes also exist. The math here assumes U-100. Verify your syringe label.
- **Rounding too aggressively** — drawing "about 10 units" instead of exactly 10 units changes the dose by 10–20% on a small draw. Use the markings.

## Verification

If you want to verify the calculator output against a trusted hosted reference, [PepPal's reconstitution tool](https://www.peppal.app/calculator) runs the same formulas and supports a wider preset library. Both tools should return identical values for any single-vial input set.
