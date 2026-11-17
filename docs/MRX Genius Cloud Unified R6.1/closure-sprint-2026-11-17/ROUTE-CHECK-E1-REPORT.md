# E1 HTTP/SSR Route Check — 29 Tools (Batches 1–4)

**Date (checked):** 2026-11-18 (see `route-check-e1.json.checkedAt`)  
**Deployment:** `dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL` (project `mrxsteroid`, preview, **Ready**, 506/506 build)  
**Base URL:** `https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app`  
**Method:** `vercel curl <route> --deployment dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL` (Vercel CLI, authorized account) — **HTTP/SSR response fetch**, not interactive browser automation.  
**Evidence files:** `route-check-e1.json`, `route-check-e1.stdout.log`, `route-check-e1.stderr.log`, `check-routes-e1.mjs`

## Summary
- **Total:** 29
- **HTTP HTML returned (no "Application error"):** 29
- **Failures/app errors:** 0
- **`data-r6-state` marker present in fetched HTML:** 3 routes (041,042,045) — absence in others likely indicates client-rendered markers not in initial SSR payload; **not** evidence of runtime console/hydration/visual correctness.

## Classification (evidence level)
- This is **HTTP/SSR reachability & basic server-render response** evidence (route resolves, HTML document returned, no application error page detected in response).  
- **Not** equivalent to: interactive browser pass, EN/AR runtime toggle verification, 5-state exercise, RTL 390px visual/layout, duplicate/hidden GENIUS-12 DOM audit, Console errors, or SSR/Hydration runtime verification. Those remain **NOT_RUN** pending authorized Preview browser access (automation bypass secret in env / shareable session) and must be captured as E3/E4 per criteria.

## Per-route results
(From `route-check-e1.json`)

| Route | HTML | App Error | r6State in HTML | r6Genius in HTML | Title |
|---|:---:|:---:|:---:|:---:|---|
| `/smarttools/hormonal-health/tool-006-estrogen-prolactin` | true | false | false | false | (see json) |
| `/smarttools/hormonal-health/tool-015-shbg-modulator` | true | false | false | false | (see json) |
| `/smarttools/hormonal-health/tool-023-trt-optimization` | true | false | false | false | (see json) |
| `/smarttools/hormonal-health/tool-035-hormone-conversion` | true | false | false | false | (see json) |
| `/smarttools/medical-monitoring/tool-040-lipid-profile-optimizer` | true | false | false | false | (see json) |
| `/smarttools/medical-monitoring/tool-041-hematocrit-monitor` | true | false | **true** | false | (see json) |
| `/smarttools/hormonal-health/tool-042-estrogen-management` | true | false | **true** | false | (see json) |
| `/smarttools/hormonal-health/tool-043-prolactin-management` | true | false | false | false | (see json) |
| `/smarttools/hormonal-health/tool-044-dht-side-effects` | true | false | false | false | (see json) |
| `/smarttools/cycle-management/tool-045-cycle-break-planner` | true | false | **true** | false | (see json) |
| `/smarttools/cycle-management/tool-046-trt-lifetime-calculator` | true | false | false | false | (see json) |
| `/smarttools/cycle-management/tool-047-fertility-preservation` | true | false | false | false | (see json) |
| `/smarttools/medical-monitoring/tool-048-cardiovascular-risk-assessor` | true | false | false | false | (see json) |
| `/smarttools/medical-monitoring/tool-049-bone-density-optimizer` | true | false | false | false | (see json) |
| `/smarttools/medical-monitoring/tool-050-mental-health-monitor` | true | false | false | false | (see json) |
| `/smarttools/injection-formulation/tool-051-peptide-dosage-calculator` | true | false | false | false | (see json) |
| `/smarttools/cycle-management/tool-016-half-life-calculator` | true | false | false | false | (see json) |
| `/smarttools/cycle-management/tool-022-oral-vs-injectable` | true | false | false | false | (see json) |
| `/smarttools/cycle-management/tool-027-ester-conversion` | true | false | false | false | (see json) |
| `/smarttools/cycle-management/tool-031-blast-cruise` | true | false | false | false | (see json) |
| `/smarttools/cycle-management/tool-034-compound-clearance` | true | false | false | false | (see json) |
| `/smarttools/medical-monitoring/tool-008-side-effect-tracker` | true | false | false | false | (see json) |
| `/smarttools/body-composition/tool-014-water-retention` | true | false | false | false | (see json) |
| `/smarttools/medical-monitoring/tool-017-drug-interaction` | true | false | false | false | (see json) |
| `/smarttools/medical-monitoring/tool-025-drug-interaction-pro` | true | false | false | false | (see json) |
| `/smarttools/injection-formulation/tool-026-injection-pain` | true | false | false | false | (see json) |
| `/smarttools/medical-monitoring/tool-029-side-effect-early-warning` | true | false | false | false | (see json) |
| `/smarttools/medical-monitoring/tool-037-side-effect-probability` | true | false | false | false | (see json) |
| `/smarttools/cycle-management/tool-038-stack-compatibility` | true | false | false | false | (see json) |

> Full titles and lengths in `route-check-e1.json`.

## Commands run
```bash
node "docs/MRX Genius Cloud Unified R6.1/closure-sprint-2026-11-17/check-routes-e1.mjs"
```
(Internally runs `vercel curl "<route>" --deployment dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL` per route; stdout/stderr captured to `route-check-e1.stdout.log`/`.stderr.log`.)

## Open items (not closed by this check)
- Interactive browser verification on accessible Preview: EN/AR, 5 states, RTL 390px, no duplicate/hidden GENIUS-12, Console/SSR-Hydration — **NOT_RUN** (SSO/bypass not available in this environment).
- P-03 implementation/verification — in progress (mapping/plan committed; code change pending).
- Atomic per-tool ledgers from actual Acceptance Criteria — pending.
- D-C4/C5/CLIN approvals — pending specialist/owner inputs.
