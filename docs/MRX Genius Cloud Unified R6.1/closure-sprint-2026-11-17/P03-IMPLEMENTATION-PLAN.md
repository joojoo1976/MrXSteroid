# D-P03 — Shared R6 Pipeline Result-Schema Enforcement (Limited Scope)

**Owner decision:** Approved (limited). Verify **engine result schema before creating Result Envelope** in shared R6 pipeline layer.  
**Constraints:** independent scoped commit; no engine/result changes unless a real defect is proven by tests; tests for valid/missing/invalid results; regression for all affected tools; Clean Export from clean commit; documented rollback plan; no merge to `main`, no Production promotion.

## Mapping (29 in-scope tools, Batches 1–4)

Source: `p03-pipeline-mapping.json` (generated 2026-11-18 from `lib/tools/r6/*-pipeline.ts`).

| Tool | Pipeline | Has `run*` | Result schema in pipeline | Result validation before envelope | Applicability / note |
|---:|---|:---:|---|:---:|---|
| 006 | `tool-006-estrogen-prolactin-pipeline.ts` | yes | not imported (schema exists: `AromatizationScoreSchema` in schema file) | no | **Applicable** — add import + validation |
| 008 | `tool-008-side-effect-tracker-pipeline.ts` | yes | result == input type `SideEffectLog` (`SideEffectLogSchema`) | no | **Applicable** — validate result against `SideEffectLogSchema` (or equivalent) before envelope |
| 014 | `tool-014-water-retention-pipeline.ts` | yes | `WaterRetentionResultSchema` | no | **Applicable** |
| 015 | `tool-015-shbg-modulator-pipeline.ts` | yes | `SHBGResultSchema` | no | **Applicable** |
| 016 | `tool-016-half-life-pipeline.ts` | no (run missing per mapping) | not imported (`HalfLifeResultSchema` exists in schema file) | no | **Applicable with care** — add validation in compute/build path or add guarded run path consistent with others; verify no engine/result change |
| 017 | `tool-017-drug-interaction-pipeline.ts` | yes | `DrugInteractionResultSchema` | no | **Applicable** |
| 022 | `tool-022-half-life-stacker-pipeline.ts` | yes | `StackTimingResultSchema` | no | **Applicable** |
| 023 | `tool-023-trt-optimization-pipeline.ts` | yes | `TrtResultSchema` | no | **Applicable** |
| 025 | `tool-025-drug-interaction-pro-pipeline.ts` | yes | `MedicationSessionResultSchema` | no | **Applicable** |
| 026 | `tool-026-injection-pain-pipeline.ts` | yes | `InjectionExperienceResultSchema` | no | **Applicable** |
| 027 | `tool-027-ester-conversion-pipeline.ts` | yes | not imported (`MolarMassConversionResultSchema` exists) | no | **Applicable** — add import + validation |
| 029 | `tool-029-side-effect-early-warning-pipeline.ts` | yes | `MeasurementSummaryResultSchema` | no | **Applicable** |
| 031 | `tool-031-cycle-length-optimizer-pipeline.ts` | yes | `CycleLengthResultSchema` | no | **Applicable** |
| 034 | `tool-034-compound-clearance-pipeline.ts` | yes | `ClearanceResultSchema` | no | **Applicable** |
| 035 | `tool-035-hormone-conversion-pipeline.ts` | yes | `ConversionResultSchema` | no | **Applicable** |
| 037 | `tool-037-side-effect-probability-pipeline.ts` | yes | `SideEffectRiskResultSchema` | no | **Applicable** |
| 038 | `tool-038-stack-compatibility-pipeline.ts` | yes | `StackCompatibilityResultSchema` | no | **Applicable** |
| 040 | `tool-040-lipid-profile-optimizer-pipeline.ts` | yes | `LipidOptimizerResultSchema` | no | **Applicable** |
| 041 | `tool-041-hematocrit-monitor-pipeline.ts` | yes | `HematocritResultSchema` | no | **Applicable** |
| 042 | `tool-042-estrogen-management-pipeline.ts` | yes | `EstrogenResultSchema` | no | **Applicable** |
| 043 | `tool-043-prolactin-management-pipeline.ts` | yes | `ProlactinResultSchema` | no | **Applicable** |
| 044 | `tool-044-dht-side-effects-pipeline.ts` | yes | `DhtResultSchema` | no | **Applicable** |
| 045 | `tool-045-cycle-break-planner-pipeline.ts` | yes | not imported (`CycleBreakResultSchema` exists) | no | **Applicable** — add import + validation |
| 046 | `tool-046-trt-lifetime-pipeline.ts` | yes | not imported (`TrtLifetimeResultSchema` exists) | no | **Applicable** — add import + validation |
| 047 | `tool-047-fertility-preservation-pipeline.ts` | yes | not imported (verify schema export) | no | **Applicable if schema exists; otherwise document N/A with justification** |
| 048 | `tool-048-cardiovascular-risk-pipeline.ts` | yes | not imported (verify schema export) | no | **Applicable if schema exists; otherwise document N/A with justification** |
| 049 | `tool-049-bone-density-pipeline.ts` | yes | not imported (verify schema export) | no | **Applicable if schema exists; otherwise document N/A with justification** |
| 050 | `tool-050-mental-health-pipeline.ts` | yes | not imported (verify schema export) | no | **Applicable if schema exists; otherwise document N/A with justification** |
| 051 | `tool-051-peptide-dosage-pipeline.ts` | yes | not imported (verify schema export) | no | **Applicable if schema exists; otherwise document N/A with justification** |

**Non-applicable (to be justified explicitly if any):** only where a tool has no definable result schema contract for the envelope result (must be evidenced per tool; do not assume). Current scan shows result schemas exist for most sampled cases (006,008,016,027,045,046).

## Implementation pattern (minimal, consistent)
1. In `run*` (and any path that computes then envelopes): `const engineResult = ...`; validate with result schema (`schema.safeParse` / existing `tryParse` wrapper semantics) **before** `build*Output/createToolOutput`.
2. On validation failure: return `{ ok: false, error: <zod/parse error> }` (fail safely), do **not** create envelope.
3. Preserve engine behavior and returned successful results byte-for-byte in meaning (no normalization unless defect proven by test).
4. Where ResultSchema not imported but exists, import from schema module (no engine/schema logic change).

## Tests (required)
- **Valid:** existing happy-path pipeline tests continue to pass (result unchanged).
- **Missing/invalid result:** inject/force invalid engine result shape where feasible (unit-level around run/build) → expect `{ ok:false }` and no envelope; assert no throw escapes contract.
- **Regression:** run focused suites for all 29 in-scope tools (pipelines/contracts/components as applicable) + targeted broader R6 regression if fast enough.

## Clean export / rollback
- **Clean export:** perform change on a clean checkout/worktree from committed HEAD (or isolated export) so commit contains only P-03 files; record clean `tsc --noEmit`, targeted tests, and build evidence.
- **Rollback plan:** revert the single P-03 commit (`git revert <sha>`), re-run affected pipeline tests, redeploy clean preview. No schema/engine migration involved.

## Status
- Mapping: **done** (`p03-pipeline-mapping.json`).
- Code change/tests/commit/clean export: **pending** (to execute as independent scoped commit per constraints).

## Risks / notes
- Dirty working tree has many unrelated modified files; P-03 commit must stage only its files.
- 016 lacks `run*` per mapping — needs careful, minimal handling.
- 047–051 schema exports must be verified before assuming applicability.
- Do not update ledgers to “P-03 closed” until implementation+regression+clean export evidence exists per tool.
