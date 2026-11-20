# R5 FIRST BATCH FINAL PREVIEW AND ACCEPTANCE REPORT

**Owner decision record — not yet signed**

Generated: 2026-11-07 · HEAD `108d3063bdcbca9604ad9b7b48844b85763d51a0` · master SHA-256 `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`

> Read-only audit. No code, schema, route, registry, database, RLS, Macro or frozen document was changed. No commit, push, merge or deployment was performed.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.

## 1. Current status

**AWAITING OWNER ACCEPTANCE.** The implementation, remediation and verification are complete for the R5 scope. This document is the decision record; it must not be marked accepted until the owner explicitly signs it. Batch 2 remains blocked.

## 2. Preview

Run the app and open the three routes in the selected language and measurement system:

- `/smarttools/body-composition/bmi`
- `/smarttools/nutrition/protein-needs`
- `/smarttools/nutrition/water-intake`

Check: default values, slider and precise input, metric↔imperial, EN↔AR, result interpretation, advice, what-if rows, 375px layout, keyboard focus and the safety notice. The recorded evidence is in `R5_FIRST_BATCH_EVIDENCE_REPORT.md`; the change list is in `R5_FIRST_BATCH_CORRECTION_AND_REMEDIATION_REPORT.md`.

## 3. Acceptance checklist

| # | Criterion | Evidence | Status |
|---:|---|---|---|
| 1 | The three tools use real engines; no hardcoded result | engine imports + live values | PASS |
| 2 | BMI 70 kg/175 cm → 22.9; imperial 154.3 lb/68.9 in → 22.9 | live | PASS |
| 3 | Protein 70 kg/1.2 → 113 g/day; scenarios 113/141/156 | live | PASS |
| 4 | Water 70 kg/1.2 → 2.5 L/day; 2.45/2.5/2.55; 85 US fl oz | live | PASS |
| 5 | Measurement switch preserves canonical value and rescales display | live, repeated toggles | PASS |
| 6 | Arabic/RTL result and guidance; no English fragment in the R5 tool body | live + tests | PASS |
| 7 | Slider and precise input synchronized; 44px target | tests + computed CSS | PASS |
| 8 | Imperial stops physically valid; invalid values rejected | boundary tests 6/9 RED → PASS | PASS |
| 9 | Lighthouse accessibility 1.00; zero failing axe audits | Lighthouse 12.2.1 | PASS |
| 10 | One `<main>` per R5 route; breadcrumb contrast/current page | 13/13 a11y tests | PASS |
| 11 | Shared header/footer/logo regressions checked | 20 + 84 + 45 tests | PASS |
| 12 | TypeScript, lint, build | `tsc`, lint, 502 static pages | PASS |
| 13 | Tool validator | 5/5 | PASS |
| 14 | Full suite | 17 failed / 5235 passed / 5 skipped | **NOT GREEN — known pre-existing failures** |
| 15 | Shared `SafetyNotice` bilingual defect | still renders AR+EN with fixed dir | **OPEN — not part of R5 acceptance** |
| 16 | Route breadcrumb/metadata localized | still English | **OPEN — shared scope** |
| 17 | Real-device 375px, Safari/Firefox, human screen reader | not run | **NOT RUN** |

## 4. Residual risks

1. The full suite is not green. The 17 failures are confined to eight payment/checkout/security/merchant files and do not touch R5, but they remain a separate release gate.
2. The 375px proof is a same-origin iframe; a real device may reveal different wrapping.
3. The R5 tool bodies are localized, but the shared breadcrumb/metadata and `SafetyNotice` are not. A user can still see English chrome in Arabic mode.
4. No human screen-reader session has been recorded.
5. Formula accuracy for the rest of the catalog is not covered by this acceptance.

## 5. Owner decision

> **R5 acceptance is a separate, explicit decision. It cannot be inferred from a passing test run, a preview, or this report.**

- [ ] **ACCEPT R5.** I accept the three pilots as the baseline for Batch 2.
- [ ] **REJECT / RETURN WITH DEFECTS.** The defects are listed below.

Owner: ______________________  Date: __________

Defects / conditions (if any):

______________________________________________________________________________

______________________________________________________________________________

## 6. Effect of the decision

| Decision | Effect |
|---|---|
| ACCEPT | Batch 2 may be scheduled. The first Batch 2 action is the tool-010 safety remediation and the 020/030/100/106 formula decisions; no formula constant changes without a source. |
| REJECT | Batch 2 remains blocked; the returned defects are fixed and re-verified under the same gate. |
| NO DECISION | Batch 2 remains blocked. No code changes. |

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
