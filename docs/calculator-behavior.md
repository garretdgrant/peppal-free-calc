# Calculator Behavior

The calculator converts peptide vial amount, reconstitution water, intended dose, and syringe size into U-100 insulin syringe units.

## Core Assumptions

- Vial amount is entered in milligrams.
- Water amount is entered in milliliters.
- Dose can be entered in milligrams or micrograms.
- Internally, dose is normalized to micrograms.
- U-100 syringe math is used: `100 units = 1 mL`.

## Forward Calculation

Inputs:

- `vialMg`
- `waterMl`
- `doseMcg`
- `syringeVolumeMl`

Formulas:

```text
totalMcg = vialMg * 1000
concentrationMcgPerMl = totalMcg / waterMl
doseVolumeMl = doseMcg / concentrationMcgPerMl
units = doseVolumeMl * 100
maxUnits = syringeVolumeMl * 100
```

Display rounding:

```text
unitsRounded = units < 10 ? round to nearest 0.5 : round to nearest whole unit
```

## Reverse Water Calculation

When a user enters target syringe units, the calculator solves for water volume:

```text
requiredWaterMl = targetUnits * vialMg * 10 / doseMcg
```

If the result matches a water preset within `0.01 mL`, the preset is selected. Otherwise the calculator switches to custom water and fills the rounded custom value.

## Presets

The app currently includes:

| Preset      |    Dose |  Vial | Water |
| ----------- | ------: | ----: | ----: |
| Retatrutide |    2 mg | 24 mg |  3 mL |
| Tesamorelin |    2 mg | 15 mg |  3 mL |
| BPC 157     | 500 mcg | 10 mg |  2 mL |

Preset selection is cleared when the user manually changes a calculator input.

## Error and Edge States

The calculator should preserve these states:

- Missing values return no calculated result.
- Zero or negative values return an invalid input state.
- A result above syringe capacity is flagged as exceeding the selected syringe.
- A result above zero but below `0.5` units is flagged as tiny.

## Product Boundary

The calculator performs arithmetic only. It does not decide whether a dose, peptide, route, schedule, or protocol is appropriate.
