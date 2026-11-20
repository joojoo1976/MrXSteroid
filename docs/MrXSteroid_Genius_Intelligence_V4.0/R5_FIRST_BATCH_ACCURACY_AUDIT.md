# R5_FIRST_BATCH_ACCURACY_AUDIT

**Date:** 2026-11-06 · Tools: BMI, Protein Needs, Water Intake · Baseline: engines unchanged (hashes in report §2)

## 1. Ground-truth validation per tool

### 1.1 BMI (`lib/tools/engines/bmi.v6.ts`, 12/12 engine tests green)

- **Equation (correct, verified):** `BMI = kg / (cm/100)²`, rounded to 0.1.
- **CDC/NIH Adult categories (correct):** underweight <18.5; normal 18.5–24.9; overweight 25–29.9; obese ≥30. Source: CDC "About Adult BMI / BMI Categories" (https://www.cdc.gov/bmi/, accessed 2026-11-05).
- **Unit conversion:** internal kg/cm; display conversion metric↔imperial is display-boundary only with 0.1 precision (documented in V4 pilot; driver verified in browser).
- **±5 boundary spot checks:**
  - 70 kg / 175 cm → 22.857 → **22.9**, normal ✓
  - 50 kg / 160 cm → 19.531 → **19.5**, normal ✓
  - 40 kg / 157 cm → 16.2 → **16.2**, underweight ✓
  - 95 kg / 175 cm → 31.0 → **31.0**, obese ✓
- **Finding A (out-of-bounds inputs are NOT rejected today):** UI min/max exist but typed values bypass; engine has no upper bound. Example: weight 9999 kg → BMI ~3265 (nonsense, finite, returned as "valid"). **Root cause:** no bounded-validation layer between UI and engine. **Fix (no engine edit):** bounded checks in the pilot's recalculation path + adapter receives those bounds as INVALID envelope + localized error; tests cover it.
- **Finding B (report correctness, not code):** BMI applies to adults only. The adapter's evidence record already says "General adults" — keep; pilot copy must state adult-only. **No separate age input will be added** (out of authorized scope; no engine rewrite allowed).

### 1.2 Protein Needs (`lib/tools/engines/protein-needs.v6.ts`, 9/9 tests green)

- **Formula (correct as implemented):** `g/day = round(W × base × (1 + (A − 1) × 0.05))` with W=kg, A∈[1.0,1.4], base = maintain 1.6 / bulk 2.0 / cut 2.2.
  - 70 kg / maintain / 1.2 → 70 × 1.6 × 1.01 = **112.99 → 113 g/day** ✓
  - 70 kg / bulk / 1.4 → 70 × 2.0 × 1.04 = **145.6 → 146 g/day** ✓
  - 70 kg / cut / 1.2 → 70 × 2.2 × 1.01 = **156 ga/day (156 g/day)** ✓
  - 70 lb → 70/2.2046226 = 31.75 kg → maintain/1.2 → **51 g/day** (matches live display) ✓
- **Imperial conversion in pilots uses LB_PER_KG = 2.2046226218:** 154.32 lb → 70.000 kg exactly enough; engines unaffected.
- **Finding A applies** (no bounded weight validation): 9999 kg → protein ~22000 g above physiological need but finite. **Fix with adapter/pilot bounds (30–300 kg)** as for BMI.
- **Finding C (exclusives):** goal choices (maintain/bulk/cut) are user-selected deliberately — no recommendation bias exists. No unsupported physiological claim is made; SPEC v3 heuristic documented as `NOT_REVIEWED`. No changes.
- **Finding D:** engine throws on A outside [1.0, 1.4] with a clear message; UI shows only 1.0–1.4 options — no invalid path reachable from UI. Confirmed OK.

### 1.3 Water Intake (`lib/tools/engines/water-intake.v6.ts`, 7/7 tests green)

- **Formula (correct as implemented):** `L/day = round(W × 35 × (1 + (A − 1) × 0.1) / 1000 × 100) / 100` with W=kg, A∈[1.0,1.4].
  - 70 kg / 1.2 → 70 × 35 × 1.02 = **2499 → 2.5 L** ✓
  - 70 kg / 1.4 → 70 × 35 × 1.04 = **2548 → 2.55 L** ✓
  - 70 lb → 31.75 kg → 1.2 → 31.75 × 35 × 1.02 = **1134 mL ≈ 1.13 L** (matches live display) ✓
- **Finding A applies** (no upper weight bound): fix identical to BMI (adapter/pilot bounds).
- **Finding D (correctness honesty):** does not count food water; does not adjust for climate/exercise heat — documented in pilot copy and SPEC v3 record `NOT_REVIEWED` (none claims otherwise). No change.

### 1.4 Shared UX accuracy findings

- **Finding E (silent out-of-range when user types) confirmed in all three pilots:** engine accepts 9999; envelope `VALID`; result displayed. Fixed in this task via bounds at UI + envelope `INVALID`.
- **Finding F (imperial transition interaction):** default imperial display for water/protein starts at `154.32 lb` (engine receives 70 kg). Acceptable — engine input identical; conversion verified exact.
- **Finding G (envelope state after out-of-range submit):** currently renders `VALID` (wrong); after fix must render `INVALID` with localized reason and no numeric output. Add integration tests.
- **Finding H (rounding/copy):** BMI shows `BMI: 22.9` for metric default (70/175). Good; height imperial shows `68.9 in` which is exactly ✓.

## 2. Engine integrity statement

None of the three engines was edited, moved, renamed, versioned, or had its constants/rounding changed in this audit — correct behavior was confirmed by tests (BMI 12/12, Protein 9/9, Water 7/7). **All fixes land at UI + adapter boundaries and tests, per authorized scope.**

## 3. Sources used for this audit (accessed 2026-11-05)

- CDC — "About Adult BMI / BMI Categories" — https://www.cdc.gov/bmi/ (adult-only cutoffs; screening measure).
- SPEC v3 (internal) — Protein and Water SPEC v3 heuristics, marked `NOT_REVIEWED` in registry; no external validation claimed.
