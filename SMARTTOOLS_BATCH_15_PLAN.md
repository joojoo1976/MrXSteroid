# SmartTools Batch 15 Plan — Catalog tools 137–142

Status: `TOOL 140 IMPLEMENTED AND VERIFIED; TOOLS 137–139 AND 141–142 REMAIN PLANNED PENDING SEPARATE EVIDENCE AND SAFETY REVIEW`.

## Audit

- Catalog 10 contains identities 137–142. Tool 140 is now implemented; no route, component, schema or engine existed for the other five at the start of this batch.
- Tool 140's catalog description says universal laboratory unit conversion, while its title contains “Dosage.” Scope it to analyte-specific laboratory result conversions, preserving its catalog ID/slug, and label the UI clearly as a lab result converter. It must not convert medication doses.
- Labcorp and Mayo Clinic Laboratories publish analyte-specific conventional-to-SI factors. The supported allowlist and factors are documented in `docs/SMARTTOOLS_UNIT_CONVERSION_SOURCES.md`; only exact listed analyte/unit pairs are accepted.
- Tools 137, 138, 139, 141 and 142 concern reconstituting injectable substances, powder/oil formulation, solvent proportions, injection-pressure estimation, and purity-adjusted active yield. These are not ordinary unit conversions. Leave their catalog identities planned and do not add calculations or user-facing operational instructions in this batch.

## Scope

- Tool 140 is implemented as an explicit, bilingual unit conversion UI using a typed, analyte-specific allowlist, finite/range validation, published factors, transparent formula/source display and no reference-range or medical interpretation.
- Registry/Page/route integration, adapter/provenance, engine/schema/DOM tests and source governance documentation are complete.
- Preserve the other five IDs, catalog titles and planned statuses pending a separately scoped safety and evidence review.

## Verification and non-goals

- Factor direction, inverse conversion, invalid analyte/unit pair, nonfinite/negative/large values, source method and stale-output/reset behavior are covered. Evidence is recorded in `SMARTTOOLS_BATCH_15_REPORT.md`.
- Focused tests, catalog/route checks, TypeScript and targeted lint are recorded in the report. Production build and manual accessibility verification remain separate gates.
- Do not implement drug dose conversion, injectable preparation, concentration-to-volume instructions, solvent/formulation calculations, injection pressure, substance yield, dosage recommendations or health interpretation.
- No database access/write, migration, commit, push or deployment.
