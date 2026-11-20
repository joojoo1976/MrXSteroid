# MRX_255_DEFECT_PLAN_030_CYCLE_COST.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only. No formula or code changed.

## 1. Tool identity

- Tool ID: `mrx.tool.030-cycle-cost-calculator`
- Slug: `tool-030-cycle-cost-calculator`
- Title: Cycle Cost Calculator
- Category: cycle-management
- Status: implemented, `accessTier: free`

## 2. Responsible code

- Engine: `lib/tools/engines/tool-030-cycle-cost-calculator.ts` lines 40–103
- Schema: `lib/tools/schemas/tool-030-cycle-cost-calculator.ts`
- Component: `components/tools/tool-030-cycle-cost-calculator.tsx`
- Tests: `lib/tools/engines/tool-030-cycle-cost-calculator.test.ts`, `components/tools/tool-030-cycle-cost-calculator.test.tsx`

## 3. Current behavior

- User-entered compound and ancillary costs are summed.
- PCT cost is calculated as `clomidCost = pctWeeks * 50` and `nolvadexCost = pctWeeks * 60`, labeled “Assumed.”
- `budget_savings_tips` is always an empty array.
- `costPerWeek = grandTotal / (cycle_weeks + pctWeeks)`.

## 4. Defect

The PCT total looks authoritative but is based on unsourced assumed weekly prices. The savings-tips field is advertised but always empty. The denominator assumes PCT weeks are part of the cycle duration for averaging.

## 5. Suitable reference

No market price source exists in the repository. The correct behavior is to separate user-entered costs from assumptions and either require user-entered PCT costs or label the PCT estimate as an assumption with an editable value.

## 6. Proposed correct behavior

- Make PCT costs user-entered or an explicitly labeled editable assumption.
- Display the assumption source and allow override.
- Populate savings tips only from data-linked rules, or remove the field.
- Clarify that cost per week is an average over entered durations.
- Preserve user-entered costs without inferring market prices or doses.

## 7. Golden test cases

- Empty compounds.
- One compound.
- Multiple compounds and ancillaries.
- PCT weeks 0 and positive.
- Most expensive compound selection.
- Rounding to 2 decimals.
- Invalid input rejection.
- No assumed price presented as fact.

## 8. Risks and limits

- Cost data is user-provided and cannot be validated against markets.
- PCT drug prices vary by region and source.
- No financial advice or purchasing recommendation.

## 9. Rollback

Revert only the approved tool-030 files; preserve IDs, routes, and registry entries.

## 10. Owner approval required

No change is authorized until the owner approves.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
