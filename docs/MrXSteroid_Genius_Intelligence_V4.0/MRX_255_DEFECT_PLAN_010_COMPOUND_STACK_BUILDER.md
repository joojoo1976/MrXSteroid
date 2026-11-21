# MRX_255_DEFECT_PLAN_010_COMPOUND_STACK_BUILDER.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only. No formula or code changed.

## 1. Tool identity

- Tool ID: `mrx.tool.010-compound-stack-builder`
- Slug: `tool-010-compound-stack-builder`
- Title: Compound Stack Builder
- Category: cycle-management
- Route: `/smarttools/cycle-management/tool-010-compound-stack-builder`
- Status: implemented, publicly routable, `accessTier: free`

## 2. Responsible code

- Component: `components/tools/tool-010-compound-stack-builder.tsx`
- Engine: `lib/tools/engines/tool-010-compound-stack-builder.ts` (types only)
- Schema: `lib/tools/schemas/tool-010-compound-stack-builder.ts`
- Catalog: `lib/tools/smartToolsCatalog3.ts` line 6
- Registry: `lib/tools/registry.ts` line 51
- Route renderer: `app/smarttools/[category]/[tool]/page.tsx` lines 10–11, 42–44, 76–77
- Sitemap: `app/smarttools/sitemap.ts` lines 20–23
- Locale gate: `middleware.ts` lines 122–125 (locale only)

## 3. Current behavior

- `calculateAromatizationTier()` is defined inside the component.
- Aromatization weights are hardcoded and unsourced.
- `estrogen_estimate_mg = round(totalWeightedAromatization / 100, 1)`.
- Tier thresholds: `>0.8`, `>0.6`, `>0.4`.
- Critical tier pushes unsafe aromatase-inhibitor advice at component line 105.
- Tier descriptions at lines 141–142 recommend supportive therapy and aromatase inhibitor consideration.
- Lines 158 and 191 contain stale Supabase Edge Function copy.
- Synergy scoring is a simple heuristic.

## 4. Defect

1. Release-blocking medical advice in UI.
2. Stale AI/provider claim.
3. Invalid “estradiol equivalent” in milligrams.
4. No engine function; calculation is untestable.
5. No typed input schema.
6. No source provenance or assumptions.

## 5. Suitable reference

No verified clinical source exists in the repository for aromatase conversion, estrogen levels, or aromatase-inhibitor use. The correct behavior is to remove medical advice and either use a validated, sourced pharmacokinetic model or relabel the tool as an unvalidated scenario. The existing `lib/tools/engines/aromatization-risk.ts` is explicitly unvalidated and returns `not_assessed` for clinical scores; it must not be treated as validated either.

## 6. Proposed correct behavior

- Remove all aromatase-inhibitor and supportive-therapy recommendations.
- Remove stale Supabase Edge Function copy.
- Remove or relabel the milligram estradiol equivalent.
- Move any retained arithmetic into a testable engine, or relabel the tool as an unvalidated scenario.
- Disclose that weights and thresholds are arbitrary model parameters.
- Keep the tool read-only and non-prescriptive.

## 7. Golden test cases

- No compounds → minimal tier, no medical advice.
- Critical tier → no aromatase-inhibitor recommendation.
- Rendered output contains none of the unsafe strings.
- No stale Supabase Edge Function string.
- No “mg” estradiol claim.
- Locale and measurement behavior verified.

## 8. Risks and limits

- Any retained aromatization model remains unvalidated.
- No clinical dosing or treatment guidance may be generated.
- Keeping the tool public without containment is unsafe.

## 9. Rollback

Revert only the approved tool-010 files; preserve IDs, routes, and registry entries. If containment unpublishes the tool, restore publication only after owner approval.

## 10. Owner approval required

No containment or remediation is authorized until the owner approves.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
