# GENIUS dual-section investigation (Batch 2 tools 041, 042, 045–051)

## Cause

The dynamic route `app/smarttools/[category]/[tool]/page.tsx` decides whether to render the
shared `R6ToolShell` (which carries its own GENIUS boxes/badge/tooltips) or only the tool
component:

```
{r6 && !r6.hasOwnBoxes ? (
  <R6ToolShell entry={r6} locale={locale}>
    <ToolComponent />
  </R6ToolShell>
) : (
  <ToolComponent />
)}
```

`r6.hasOwnBoxes` is set in `lib/tools/r6/manifest.ts` from `R6_EXEMPT_SLUGS`:

```
hasOwnBoxes: R6_EXEMPT_SLUGS.has(tool.slug),
```

`R6_EXEMPT_SLUGS` currently contains only:

- `tool-111-smart-food-macro-substitution`
- `tool-132-ai-pose-form-coach`
- `tool-137-peptide-hormone-reconstitution-calculator`
- `tool-138-raw-powder-density-oil-formulation-engine`
- `tool-139-solvent-emulsifier-ratio-calculator`
- `tool-039-liver-enzyme-tracker`
- `tool-040-lipid-profile-optimizer`

Tools 041, 042 and 045–051 each render their **own** 12-box GENIUS layer (verified on the
Preview: `data-r6-genius="tool-NNN"` plus 12 `data-r6-box` articles), but they are **not** in
`R6_EXEMPT_SLUGS`, so `hasOwnBoxes === false` and the page additionally wraps them in
`R6ToolShell`, which renders a second GENIUS section. That is the observed dual-GENIUS.

## Affected tools (confirmed)

041-hematocrit-monitor, 042-estrogen-management, 045-cycle-break-planner, 046-trt-lifetime,
047-fertility-preservation, 048-cardiovascular-risk, 049-bone-density, 050-mental-health,
051-peptide-dosage-calculator.

## Proposed change (NOT applied — owner approval required)

Edit `lib/tools/r6/manifest.ts`, `R6_EXEMPT_SLUGS`, adding exactly these 9 slugs:

```
'tool-041-hematocrit-monitor',
'tool-042-estrogen-management',
'tool-045-cycle-break-planner',
'tool-046-trt-lifetime',
'tool-047-fertility-preservation',
'tool-048-cardiovascular-risk',
'tool-049-bone-density',
'tool-050-mental-health',
'tool-051-peptide-dosage-calculator',
```

Effect: those routes render only `<ToolComponent />` (own boxes), removing the duplicate
`R6ToolShell` GENIUS section while keeping the shared progress line (`R6Progress`) and the
safety notice. No engine, schema, adapter or component bytes change; no route/SSR change.

## Non-regression

- `R6_EXEMPT_SLUGS` is consumed only by `buildCache()` in `manifest.ts`; no other caller.
- Only the 9 listed slugs flip `hasOwnBoxes` from false to true; every other tool (including
  039, 040, which already behave this way) is unchanged.
- `tsc --noEmit`, targeted ESLint and `next build` are unaffected (the set is runtime data).
- The shared progress bar (`R6Progress`) still renders before and after the tool for all tools.

## Action required

Owner approval of the exact 9-slug addition above. Until then the Preview keeps both sections
and no code in `manifest.ts` is changed.
