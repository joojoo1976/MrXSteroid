# Browser Evidence — 29 R6.1 Tools (Batches 1–4)

**Status: PREPARED — NOT RUN.**
The preview deployment is SSO-protected. No authorized browser session was provided, so no browser criterion is claimed as PASS. SSO was not bypassed and no credentials are stored anywhere in this folder.

## What is prepared

`r6-batch1-4-browser-verify.mjs` — a Chrome DevTools Protocol verifier (no new dependency) covering the 29 canonical routes in EN and AR:

| # | Tool | Canonical route |
|---:|---:|---|
| 1 | 006 | `/smarttools/hormonal-health/tool-006-estrogen-prolactin` |
| 2 | 008 | `/smarttools/medical-monitoring/tool-008-side-effect-tracker` |
| 3 | 014 | `/smarttools/body-composition/tool-014-water-retention` |
| 4 | 015 | `/smarttools/hormonal-health/tool-015-shbg-modulator` |
| 5 | 016 | `/smarttools/pharmacokinetics/tool-016-half-life-calculator` |
| 6 | 017 | `/smarttools/medical-monitoring/tool-017-drug-interaction` |
| 7 | 022 | `/smarttools/pharmacokinetics/tool-022-half-life-stacker` |
| 8 | 023 | `/smarttools/hormonal-health/tool-023-trt-optimization` |
| 9 | 025 | `/smarttools/medical-monitoring/tool-025-drug-interaction-pro` |
| 10 | 026 | `/smarttools/injection-formulation/tool-026-injection-pain` |
| 11 | 027 | `/smarttools/pharmacokinetics/tool-027-ester-conversion` |
| 12 | 029 | `/smarttools/medical-monitoring/tool-029-side-effect-early-warning` |
| 13 | 031 | `/smarttools/cycle-management/tool-031-cycle-length-optimizer` |
| 14 | 034 | `/smarttools/pharmacokinetics/tool-034-compound-clearance` |
| 15 | 035 | `/smarttools/pharmacokinetics/tool-035-hormone-conversion` |
| 16 | 037 | `/smarttools/medical-monitoring/tool-037-side-effect-probability` |
| 17 | 038 | `/smarttools/cycle-management/tool-038-stack-compatibility` |
| 18 | 040 | `/smarttools/medical-monitoring/tool-040-lipid-profile-optimizer` |
| 19 | 041 | `/smarttools/medical-monitoring/tool-041-hematocrit-monitor` |
| 20 | 042 | `/smarttools/hormonal-health/tool-042-estrogen-management` |
| 21 | 043 | `/smarttools/hormonal-health/tool-043-prolactin-management` |
| 22 | 044 | `/smarttools/medical-monitoring/tool-044-dht-side-effects` |
| 23 | 045 | `/smarttools/cycle-management/tool-045-cycle-break-planner` |
| 24 | 046 | `/smarttools/hormonal-health/tool-046-trt-lifetime` |
| 25 | 047 | `/smarttools/hormonal-health/tool-047-fertility-preservation` |
| 26 | 048 | `/smarttools/medical-monitoring/tool-048-cardiovascular-risk` |
| 27 | 049 | `/smarttools/medical-monitoring/tool-049-bone-density` |
| 28 | 050 | `/smarttools/medical-monitoring/tool-050-mental-health` |
| 29 | 051 | `/smarttools/injection-formulation/tool-051-peptide-dosage-calculator` |

Per route and locale it records: navigation, exactly one GENIUS shell, 12 boxes in fixed order 1–12, no hidden box, document direction, 390 px horizontal overflow, CORE-5 presence, console errors/exceptions, and the current state attribute.

## How to run (only after an authorized session exists)

1. Obtain the authorized origin from the owner. Pass it **at run time**:
   `node r6-batch1-4-browser-verify.mjs https://<authorized-origin> <out-dir>`
2. If the environment requires an authenticated cookie, supply it through the environment/browser profile — **never** commit it, never paste it into a report or log.
3. Archive `r6-batch1-4-browser-results.json` next to the tool ledger and update only the rows the run actually proves.

## What this script does not cover

- **PARTIAL / INVALID / FULL / DEGRADED** require tool-specific input fixtures. They remain manual until an approved fixture pack exists. The script proves the EMPTY render and the structural DOM rules only.
- Screenshots / traces are not captured yet; add them when the run is authorized.
- Tool-specific interaction contracts (tooltips hover/focus/touch, Escape, slider, what-if) still use the per-tool scripts (`tool-040-browser-verify.mjs`, `tool-041-browser-verify.mjs`) plus the per-tool component tests at E3.

## Ledger impact

None. Every browser row in the 29 ledgers stays `NOT_RUN / E0` until this script (or an equivalent authorized session) produces an artifact.
