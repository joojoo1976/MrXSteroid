# SDD ledger — plan: docs/superpowers/plans/2026-11-09-r6-bulk-tool-upgrade.md (Phase 1)

Baseline: ab6f728a (Phase 0 + Pilot 28 accepted)

## Pre-flight
- Phase 1 = fix 18 bespoke routes + Batch 02 next 28. No merge, no production, no DB, R6.1 NOT ACTIVE.
- Shared interfaces: dynamic route `app/smarttools/[category]/[tool]/page.tsx` (shell, progress) consumed by bespoke pages; `getToolComponent` loader (slug-file) vs catalog `componentPath` — 2 divergences found (macro, tool-146 compat ok, tool-108 pilot vs canonical).

## Rulings
- Phase 1 - Ruling: DELETE 17 bespoke hierarchical pages (126-131, 133-136, 140, 143-145, 148, 149, 146) — bespoke renders identical component to dynamic (146 via compat re-export). Cost if wrong: route 404 if loader misses one; guarded by verify-routes over all 18.
- Phase 1 - Ruling: WRAP tool-108 bespoke page with shell (preserve `body-composition-vision-pilot`) instead of deleting — deleting would silently swap engine from `body-composition-vision.v6` to `tool-108-...` engine and change tool output. Cost if wrong: catalog componentPath vs route component divergence remains; follow-up needed to pick canonical engine.
- Phase 1 - Ruling: LEAVE `app/smarttools/nutrition/macro/page.tsx` bespoke untouched — slug `macro` (19th shadow) is outside owner's 18; deleting would switch pilot (catalog) to legacy `macro.tsx`. Cost if wrong: macro stays shell-less until follow-up; coverage 267/268 in Phase 1.
- Phase 1 - Ruling: Batch 02 = next 28 codemod targets from nutrition/body-composition/training categories per plan Task 7, excluding batch-01 23 + frozen 5 + bespoke 18 already shell-covered by route fix. Cost if wrong: none; codemod is opt-in tagged fields only.

## Tasks
