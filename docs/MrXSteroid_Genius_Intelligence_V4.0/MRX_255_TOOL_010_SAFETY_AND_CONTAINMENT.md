# MRX_255_TOOL_010_SAFETY_AND_CONTAINMENT.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only. No containment change has been applied.

## 1. Publication status

Tool-010 is publicly routable in code and must be treated as publicly accessible until the owner confirms production deployment status.

Evidence:

- `lib/tools/smartToolsCatalog3.ts` line 6: `accessTier: 'free'`, no `status: 'planned'`.
- `lib/tools/registry.ts` line 51: `accessTier: 'free'`, `stackStatus: 'layered'`.
- `app/smarttools/[category]/[tool]/page.tsx` lines 10–11: `generateStaticParams()` uses `getPublishedCatalogTools()`.
- `app/smarttools/[category]/[tool]/page.tsx` lines 42–44: finds the entry and renders the component.
- `app/smarttools/sitemap.ts` lines 20–23: includes published tools.
- `middleware.ts` lines 122–125: locale routing only; no auth or feature gate.
- `getPublishedCatalogTools()` in `lib/tools/smartToolsCatalog4.ts` lines 80–81 filters only `status !== 'planned'`.

Production deployment status is NOT VERIFIED from the repository.

## 2. Unsafe content locations

- Component line 105: `CRITICAL aromatization risk — AI strongly recommends aromatase inhibitor support and bloodwork within 48 hours.`
- Component line 141: `High aromatization risk. Significant estrogen conversion likely; AI recommends supportive therapy.`
- Component line 142: `Critical aromatization risk. Immediate medical review and aromatase inhibitor consideration required.`
- Component line 158 and 191: `*Note: ... AI-powered explanation available when Supabase Edge Function service is operational.`
- Component line 146: `Estimated estradiol equivalent: ${estrogenEstimate} mg.`

## 3. Invalid or unsupported results

- The calculation is inline in `components/tools/tool-010-compound-stack-builder.tsx`; `lib/tools/engines/tool-010-compound-stack-builder.ts` contains only types.
- There is no typed input schema (`StackCompoundSchema` validates stored compounds but not the calculation input).
- There is no engine function, so the calculation cannot be independently tested.
- “Estradiol equivalent” is reported in milligrams, which is not a clinically meaningful unit.
- Aromatization weights and thresholds are unsourced constants.
- Synergy scoring is a simple heuristic, not a validated interaction model.

## 4. Minimum safe containment (requires owner approval)

1. Unpublish or hard-gate the tool, or replace it with an explicit “unavailable / under safety review” page.
2. Remove aromatase-inhibitor recommendations and “supportive therapy” language.
3. Remove stale Supabase Edge Function copy.
4. Remove or relabel the milligram “estradiol equivalent.”
5. Move calculation into a testable engine or relabel the tool as an unvalidated scenario.
6. Add regression tests for the removed advice and invalid units.
7. Keep all IDs, routes, and registry entries intact.

## 5. Required tests before any use is allowed

- No medical advice strings in rendered output.
- No stale Supabase/AI-provider claims.
- No estradiol result in milligrams.
- Calculation is either moved to a tested engine or the tool is labeled unvalidated.
- Component and engine tests pass.
- Locale and measurement behavior verified.
- Accessibility and 375px layout verified.

## 6. Classification

Release-Blocking Safety Issue. Batch 2 cannot start until this is contained and the owner approves the remediation.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
