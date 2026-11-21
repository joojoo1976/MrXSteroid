# E1 HTTP/SSR Canonical Route Check — 29 Tools (Batches 1–4)

**Checked:** 2026-11-17T23:27:06.957Z  
**Deployment:** dpl_E1n1DmQYYQRnuofhbcHiAjPT8LsL (mrxsteroid, preview, Ready)  
**Base:** https://mrxsteroid-bml67hgvb-georges-projects-78ef250b.vercel.app  
**Source:** canonical slugs/categories from lib/tools/categories.ts and smartToolsCatalog4.ts  
**Method:** `vercel curl` per canonical route (HTTP/SSR fetch, not interactive browser). Evidence: `route-check-e1-canonical.json`, `route-check-e1-canonical-summary.json`.

## Summary (computed from JSON)
- **Total:** 29 | **HTML:** 29 | **App errors:** 0
- **r6State in HTML:** 22 | **Generic title:** 0
- **Consistency:** counts derived from `route-check-e1-canonical.json`.

## Key finding
Correct canonical category/slug URLs resolve successfully for all 29 tools (**29/29 HTML, 0 app errors, 0 generic hub titles**). Earlier generic-title results in `route-check-e1.json` were due to **non-canonical paths** tested in that pass (wrong category/slug for 12 tools), not confirmed broken tool rendering.

## Per-route
| ID | Route | HTML | AppErr | r6State | r6Genius | Title |
|---:|---|:---:|:---:|:---:|:---:|---|
| 006 | `/smarttools/hormonal-health/tool-006-estrogen-prolactin` | true | false | false | false | Estradiol &amp; Prolactin Record |
| 015 | `/smarttools/hormonal-health/tool-015-shbg-modulator` | true | false | false | false | SHBG Modulator |
| 023 | `/smarttools/hormonal-health/tool-023-trt-optimization` | true | false | false | false | TRT Optimization |
| 035 | `/smarttools/pharmacokinetics/tool-035-hormone-conversion` | true | false | false | false | Testosterone and Estradiol Unit Converter |
| 040 | `/smarttools/medical-monitoring/tool-040-lipid-profile-optimizer` | true | false | false | false | Lipid Profile Optimizer |
| 041 | `/smarttools/medical-monitoring/tool-041-hematocrit-monitor` | true | false | true | true | Hematocrit Monitor |
| 042 | `/smarttools/hormonal-health/tool-042-estrogen-management` | true | false | true | true | Estrogen Management Pro |
| 043 | `/smarttools/hormonal-health/tool-043-prolactin-management` | true | false | false | false | Prolactin Management Pro |
| 044 | `/smarttools/medical-monitoring/tool-044-dht-side-effects` | true | false | false | false | DHT Side Effect Predictor |
| 045 | `/smarttools/cycle-management/tool-045-cycle-break-planner` | true | false | true | true | Cycle Break Planner |
| 046 | `/smarttools/hormonal-health/tool-046-trt-lifetime` | true | false | true | true | TRT Lifetime Calculator |
| 047 | `/smarttools/hormonal-health/tool-047-fertility-preservation` | true | false | true | true | Fertility Preservation Guide |
| 048 | `/smarttools/medical-monitoring/tool-048-cardiovascular-risk` | true | false | true | true | Cardiovascular Risk Assessor |
| 049 | `/smarttools/medical-monitoring/tool-049-bone-density` | true | false | true | true | Bone Density Optimizer |
| 050 | `/smarttools/medical-monitoring/tool-050-mental-health` | true | false | true | true | Mental Health Monitor |
| 051 | `/smarttools/injection-formulation/tool-051-peptide-dosage-calculator` | true | false | true | true | Peptide Dosage Calculator |
| 016 | `/smarttools/pharmacokinetics/tool-016-half-life-calculator` | true | false | true | true | Half-Life Calculator |
| 022 | `/smarttools/pharmacokinetics/tool-022-half-life-stacker` | true | false | true | true | Half-Life Stacker |
| 027 | `/smarttools/pharmacokinetics/tool-027-ester-conversion` | true | false | true | true | User-Provided Molar Mass Calculator |
| 031 | `/smarttools/cycle-management/tool-031-cycle-length-optimizer` | true | false | true | true | Cycle Length Optimizer |
| 034 | `/smarttools/pharmacokinetics/tool-034-compound-clearance` | true | false | true | true | Single-dose Fractional Decay Scenario |
| 008 | `/smarttools/medical-monitoring/tool-008-side-effect-tracker` | true | false | true | true | Side Effect Tracker |
| 014 | `/smarttools/body-composition/tool-014-water-retention` | true | false | true | true | Water Retention Assessor |
| 017 | `/smarttools/medical-monitoring/tool-017-drug-interaction` | true | false | true | true | Drug Interaction Checker |
| 025 | `/smarttools/medical-monitoring/tool-025-drug-interaction-pro` | true | false | true | true | Medication &amp; Compound Session List |
| 026 | `/smarttools/injection-formulation/tool-026-injection-pain` | true | false | true | true | Injection Experience Log |
| 029 | `/smarttools/medical-monitoring/tool-029-side-effect-early-warning` | true | false | true | true | Personal Measurement Summary |
| 037 | `/smarttools/medical-monitoring/tool-037-side-effect-probability` | true | false | true | true | Side Effect Probability Calculator |
| 038 | `/smarttools/cycle-management/tool-038-stack-compatibility` | true | false | true | true | Stack Compatibility Checker |

> r6State/r6Genius absent in SSR HTML for some routes may reflect client-rendered markers. HTTP/SSR evidence only (not EN/AR, 5 states, RTL 390px, console/hydration runtime).
