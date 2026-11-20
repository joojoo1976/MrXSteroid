# MRX_255_TESTING_AND_REGRESSION_MATRIX.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only. R5 acceptance pending; Batch 2 blocked.

## 1. Verdict

Testing is uneven. 173 of 264 implemented tools have at least one test file, 91 have none, 108 have golden/numeric assertions, and 65 have tests but no numeric assertion. The full suite is not green: 559 files, 5235 passed, 17 failed, 5 skipped. The 17 failures are pre-existing and outside R5.

## 2. Current test counts

| Metric | Count |
|---|---:|
| Implemented tools | 264 |
| Tools with at least one test file | 173 |
| Tools with no test file | 91 |
| Tools with golden/numeric assertions | 108 |
| Tools with tests but no numeric/golden assertion | 65 |
| Full suite files | 559 |
| Full suite passed | 5235 |
| Full suite failed | 17 |
| Full suite skipped | 5 |

## 3. R5 test evidence

| Check | Result |
|---|---|
| Accessibility RED→GREEN | 13/13 |
| R5 batch files/tests | 17 files / 81 tests |
| Targeted regression | 45 tests |
| Shared `ui` | 20 tests |
| Header preferences | 84 tests |
| TypeScript | pass |
| Lint | pass |
| `validate-tools` | 5/5 |
| Build | 502 pages |
| Lighthouse accessibility BMI | 0.93 → 1.00 |
| Lighthouse accessibility Protein | 0.91 → 1.00 |
| Lighthouse accessibility Water | 0.91 → 1.00 |
| Failing axe audits | 0 |

## 4. Full-suite failures (not R5 regressions)

`checkoutCountryRouting` (8), `createInvoiceKashierDelegation` (1), `securityHardeningPosture` (1), `checkoutSessionService` (1), `instapayPreservationLock` (1), `merchantResolver` (1), `orderProducersStatusContract` (1), `paymentReceiptsAdmin` (3). These are outside R5 and remain a separate release gate.

## 5. Required test matrix per tool

### Calculation tests

- Golden cases.
- Known answers.
- Normal inputs.
- Boundary inputs.
- Decimal precision.
- Missing inputs.
- Invalid inputs.
- Impossible inputs.
- Non-finite values.
- Rounding.
- Unit conversion.
- Cross-field constraints.
- Regression tests.

### Input tests

- Slider movement.
- Manual entry.
- Keyboard input.
- Touch input.
- Paste.
- Minimum and maximum.
- Invalid values.
- Step behavior.
- Unit switching.
- Round-trip conversion.

### Result tests

- Result changes when inputs change.
- Interpretation changes correctly.
- Recommendations are data-linked.
- Report explains method.
- Scenarios use the same engine.
- Warnings appear under their conditions.
- Unsupported results are prevented.

### UI/accessibility tests

- Desktop, mobile, 375px.
- Arabic RTL, English LTR.
- Keyboard-only, screen reader.
- Accessible names and values.
- Focus order, contrast, touch targets.
- axe or equivalent.
- Reduced Motion.
- No horizontal overflow or clipped content.

## 6. Platform regression rule

Shared components must be fixed once, with all consumers identified, impact scoped, appropriate regression tests run, and results documented. Success in 3 tools does not prove success in all 264 tools.

## 7. Reporting rule

The full suite may not be called green while any failure exists. Old failures may not be attributed to new changes without evidence, and may not be ignored.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
