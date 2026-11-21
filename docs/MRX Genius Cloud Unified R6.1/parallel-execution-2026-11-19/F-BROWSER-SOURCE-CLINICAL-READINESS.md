# F — Browser & Source/Clinical Readiness — R6.1 closure (Workstream F)

**Document:** `docs/MRX Genius Cloud Unified R6.1/parallel-execution-2026-11-19/F-BROWSER-SOURCE-CLINICAL-READINESS.md`
**Version:** 1.0 — **Date:** 2026-11-19
**Source SHA:** `37f047a4105d078b22edea2c857bf35aefdbdc7f` (verified = repo HEAD; branch `feat/r6.1-tools-041-042`)
**Scope:** 29 tools — 006, 008, 014, 015, 016, 017, 022, 023, 025, 026, 027, 029, 031, 034, 035, 037, 038, 040, 041, 042, 0043, 044, 045, 046, 047, 048, 049, 050, 051. Tool 039 excluded (reference only).
**Status:** READINESS SKELETON — **nothing executed; no runtime evidence claimed**. Every runtime cell = `NOT_RUN` (requires the access gate in §1).
**Sources read (read-only, HEAD `37f047a4`):** R6.1-BROWSER-EVIDENCE-INDEX.md, R6.1-SOURCE-AND-CLINICAL-REVIEW-INDEX.md, R6.1-PREVIEW-INDEX.md, R6.1-SHARED-DECISIONS-BLOCKERS.md, W01–W24-CONFLICT-TRACKER.md, `app/smarttools/[category]/[tool]/page.tsx`, `app/layout.tsx`, `lib/tools/r6/manifest.ts` (R6_EXEMPT_SLUGS), `lib/tools/r6/boxes.ts`, `components/tools/r6/R6ToolShell.tsx`, `i18n/tool-*.json` ×29, `components/tools/tool-*.tsx` / `*.genius.tsx` ×29.

> **Posture:** statically verifiable structure is pre-filled and verified against the working tree; everything that needs a browser is `NOT_RUN`. No fabrication of browser/source/clinical evidence. Exit criteria: every external dependency identified/assigned; access-gated items BLOCKED/NOT_AVAILABLE; nothing claimed executed.

---

## 1. Access gate — exact Browser E3/E4 precondition gate

- **E3 (local):** real Chrome (DevTools Protocol) against a local production build of the repo at the SHA — per R6.1-BROWSER-EVIDENCE-INDEX §1: HTTP 200 / SSR HTML alone are **not** sufficient for interaction, state, console or GENIUS-12 DOM closure.
- **E4 (published):** real Chrome via the DevTools Protocol against the Preview deployment **pinned to SHA `37f047a4…`**, reached through the authenticated proxy — precedent: Tool 040/041 runs in R6.1-PREVIEW-INDEX ("Published Preview (E4)").

**Dispatch state: gate NOT MET — nothing executed. Preconditions:**
1. **Authorized SSO session** — `vercel_authentication` enabled (R6.1-PREVIEW-INDEX); anonymous request → `302 → vercel.com/sso-api`. Owner's signed-in Vercel session (team `foryoutalk-9724`) required. **No bypass tokens exist at this SHA** — the earlier bypass was REVOKED 2026-11-11, temporary local copies DELETED, `REPO_SECRET_SCAN=CLEAN` (R6.1-PREVIEW-INDEX). No bypass was created or requested for this audit.
2. **Preview URL bound to SHA `37f047a4…` + Deployment ID** — **none at dispatch**: "No verified preview URL or Deployment ID for this SHA" (dispatch baseline). Owner must deploy a clean Preview from the working tree and record Deployment ID + direct URL.
3. **Test account** — not identified in sources (owner must provide).
4. **Evidence-capture format (R6.1-BROWSER-EVIDENCE-INDEX §3, §22; prepared artifacts `closure-sprint-2026-11-17/browser-evidence/` — `r6-batch1-4-browser-verify.mjs`, `README-BROWSER-EVIDENCE.md` — NOT RUN):** per tool: EN/AR/RTL; 390px; 1440px; EMPTY/PARTIAL/FULL/INVALID/DEGRADED; interactive controls; CORE-5; GENIUS-12 (fixed order, no duplicate shell/hidden boxes); keyboard; a11y; console; hydration; network (no secret/PHI); exports where applicable. Retain screenshots, logs, results, preview URL, Deployment ID, source SHA, date, browser/viewport.
5. Historic evidence for Tools 039/040/041 (other SHAs/deployments) is reference only — not usable for claims on this SHA without re-pinning.

---

## 2. 29-row browser matrix (skeleton)

Legend: `NOT_RUN` = runtime check, requires the §1 gate. `static` = verified against the working tree at HEAD `37f047a4`.
- **Route:** canonical index route (R6.1-BROWSER-EVIDENCE-INDEX); implemented by the dynamic route `app/smarttools/[category]/[tool]/page.tsx` (verified to exist). Flat `app/smarttools/<slug>/page.tsx` also exists for every tool.
- **EN/AR:** `i18n/tool-<id>.json` — parsed with `en` + `ar` objects; **en/ar keyDiff = 0 for every tool** (0167 file set where noted).
- **RTL:** `static` — `app/layout.tsx:59` (`<html dir={isRTL ? 'rtl' : 'ltr'}>`); `R6ToolShell.tsx:432` (slider `dir="rtl"` when ar); `R6ToolShell.tsx:161–163` (`[dir="rtl"]` CSS rules).
- **CORE-5:** exempt tools → tool-owned component (in `R6_EXEMPT_SLUGS`, lib/tools/r6/manifest.ts). Non-exempt tools → `R6ToolShell.tsx` shared (renders boxes 2/3/7/9/12 per the 039 CORE-5 definition: C1 = result+unit+reference limit+confidence; C2 = formula+assumptions+uncertainty; C3 = red flags+contraindications+referral; C4 = sources; C5 = next step/what-not-to-do/when-to-see-a-doctor — `lib/tools/r6/boxes.ts`).
- **GENIUS-12:** exempt → tool-owned. Non-exempt → `R6ToolShell.tsx` — "Genius results (12)" 12-box section.
- **Keyboard/A11y:** `static` — R6ToolShell tooltip keyboard handlers (lines 251–311: pointerover/pointerdown/focusin/focusout, Enter/Space/Escape, click-outside) and aria wiring (lines 242–246, 435, 516–537).
- **Export:** `yes` — CSV export present statically (e.g. tool-014 i18n `box10_button: "Download CSV"`, `box10_note`: "The file is created inside the browser only; it carries no session identifier"; scan: `export|download|csv` matched in tool files).
- **State labels:** static presence verified, e.g. tool-014 i18n: `state_empty`, `state_partial`, `state_full` ("Complete"), `state_invalid`, `state_degraded`.

| Tool | Route | EN | AR | RTL | 390px | 1440px | Empty | Partial | Full | Invalid | Degraded | CORE-5 | GENIUS-12 | Keyboard | A11y | Console | Hydration | Network | Export |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 006 | /smarttools/hormonal-health/tool-006-estrogen-prolactin | en 40 | ar 40 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 008 | /smarttools/medical-monitoring/tool-008-side-effect-tracker | en 105 | ar 105 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 014 | /smarttools/body-composition/tool-014-water-retention | en 59 | ar 59 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 015 | /smarttools/hormonal-health/tool-015-shbg-modulator | en 43 | ar 43 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 016 | /smarttools/pharmacokinetics/tool-016-half-life-calculator | en 129 (incl. tool-016-libido-calculator 7) | ar 129 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 017 | /smarttools/medical-monitoring/tool-017-drug-interaction | en 63 (incl. tool-017-injection-volume 8) | ar 63 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 022 | /smarttools/pharmacokinetics/tool-022-half-life-stacker | en 119 | ar 119 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 023 | /smarttools/hormonal-health/tool-023-trt-optimization | en 29 | ar 29 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 025 | /smarttools/medical-monitoring/tool-025-drug-interaction-pro | en 78 | ar 78 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 026 | /smarttools/injection-formulation/tool-026-injection-pain | en 70 | ar 70 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 027 | /smarttools/measurement-conversion/tool-027-ester-conversion | en 117 | ar 117 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 029 | /smarttools/medical-monitoring/tool-029-side-effect-early-warning | en 85 | ar 85 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 031 | /smarttools/cycle-management/tool-031-cycle-length-optimizer | en 131 | ar 131 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 034 | /smarttools/pharmacokinetics/tool-034-compound-clearance | en 116 | ar 116 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 035 | /smarttools/hormonal-health/tool-035-hormone-conversion | en 22 | ar 22 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 037 | /smarttools/medical-monitoring/tool-037-side-effect-probability | en 88 | ar 88 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 038 | /smarttools/cycle-management/tool-038-stack-compatibility | en 86 | ar 86 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 040 | /smarttools/medical-monitoring/tool-040-lipid-profile-optimizer | en 236 | ar 236 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | tool-040 (tool-owned) | tool-040 (tool-owned) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 041 | /smarttools/medical-monitoring/tool-041-hematocrit-monitor | en 172 | ar 172 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | tool-041 (tool-owned) | tool-041 (tool-owned) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 042 | /smarttools/hormonal-health/tool-042-estrogen-management | en 178 | ar 178 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | tool-042 (tool-owned) | tool-042 (tool-owned) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 043 | /smarttools/hormonal-health/tool-043-prolactin-management | en 9 | ar 9 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 044 | /smarttools/hormonal-health/tool-044-dht-side-effects | en 11 | ar 11 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | R6ToolShell (shared) | R6ToolShell (shared) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 045 | /smarttools/cycle-management/tool-045-cycle-break-planner | en 140 | ar 140 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | tool-045 (tool-owned) | tool-045 (tool-owned) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 046 | /smarttools/hormonal-health/tool-046-trt-lifetime | en 140 | ar 140 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | tool-046 (tool-owned) | tool-046 (tool-owned) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 047 | /smarttools/reproductive-wellbeing/tool-047-fertility-preservation | en 140 | ar 140 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | tool-047 (tool-owned) | tool-047 (tool-owned) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 048 | /smarttools/medical-monitoring/tool-048-cardiovascular-risk | en 169 | ar 169 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | tool-048 (tool-owned) | tool-048 (tool-owned) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 049 | /smarttools/medical-monitoring/tool-049-bone-density | en 174 | ar 174 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | tool-049 (tool-owned) | tool-049 (tool-owned) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 050 | /smarttools/medical-monitoring/tool-050-mental-health | en 158 | ar 158 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | tool-050 (tool-owned) | tool-050 (tool-owned) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |
| 051 | /smarttools/measurement-conversion/tool-051-peptide-dosage-calculator | en 122 | ar 122 | static | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | tool-051 (tool-owned) | tool-051 (tool-owned) | static | static | NOT_RUN | NOT_RUN | NOT_RUN | yes |

**Matrix counts:** statically-provable cells = Route, EN, AR, RTL, CORE-5, GENIUS-12, Keyboard, A11y, Export = 9 × 29 = **261**. Runtime cells (`NOT_RUN`) = 390px, 1440px, Empty, Partial, Full, Invalid, Degraded, Console, Hydration, Network = 10 × 29 = **290**. Nothing runtime claimed executed.

---

## 3. D-C4 — per-tool approved-source packs + claim matrix skeleton

Per R6.1-SOURCE-AND-CLINICAL-REVIEW-INDEX §2: D-C4 = approved per-tool/claim source pack (claim, source name, publisher, URL, publication/review dates, evidence level, supported claim, limitation, reviewer where applicable). **No approved pack exists for any of the 29 — status `NOT_AVAILABLE`** (conservative default per R6.1-SOURCE §2 row "D-C4 Source Packs: NOT_AVAILABLE — No approved per-tool packs recorded in closure-ready form"). Publisher / dates / evidence level are therefore `NOT_AVAILABLE` in every row; only the claim skeleton and unapproved *candidate* URLs (scraped from tool files, live-reachability noted below) are listed. Tool 042: `STOPPED` — do not advance activation (R6.1-SOURCE §3).

Live-reachability check (webfetch, read-only, 2026-11-19): `medlineplus.gov/lab-tests/cholesterol-levels/` — reachable (official NLM/NIH site); `dailymed.nlm.nih.gov/dailymed/` — reachable; `academic.oup.com/jcem/article/96/2/273/2597249` (006) — HTTP 403; `academic.oup.com/jcem/article/84/10/3666/2660507` (015) — 403; `academic.oup.com/jcem/article/95/6/2536/2596202` (035) — 403; `academic.oup.com/jcem/article/96/2/273/2597879` (043) — 403; `pubchem.ncbi.nlm.nih.gov/compound/testosterone` (035) — browser-check page (JS challenge, status unverified); `www.auanet.org/guidelines-and-quality/guidelines/testosterone-deficiency-guideline` (023) and `…/prostate-cancer-detection-guideline` (044) — request timeout. None are approved sources.

| Tool | Claim skeleton (unapproved; claim present per static scan) | Candidate source (unapproved) | Publisher | Date | Evidence level | Status |
|---|---|---|---|---|---|---|
| 006 | Estradiol & Prolactin Monitor — estrogen/prolactin panel status & alerts | https://academic.oup.com/jcem/article/96/2/273/2597249 | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 008 | Side Effect Tracker — side-effect tracking, alerts, history/exit UI | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 014 | Water Retention Tool — water-retention state panel + honest NOT_AVAILABLE framing | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 015 | Free Testosterone Calculator — free testosterone (SHBG-derived) calculation | https://academic.oup.com/jcem/article/84/10/3666/2660507 | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 016 | Half-Life Calculator — steroid half-life calculations | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 017 | Drug Interaction Checker — drug/compound interaction checks | https://dailymed.nlm.nih.gov/dailymed/ | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 022 | Compound Half-Life Stacker — half-life stacking calculations | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 023 | TRT Optimization Engine — TRT optimization | https://www.auanet.org/guidelines-and-quality/guidelines/testosterone-deficiency-guideline | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 025 | Medication & Compound Session List — medication/compound session lists | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 026 | Injection Experience Log — injection site/pain experience log | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 027 | Ester Conversion Calculator — ester conversion calculations | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 029 | Personal Measurement Summary — personal measurement summary | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 031 | Cycle Length Optimizer — cycle length optimization | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 034 | Compound Clearance Calculator — compound clearance calculations | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 035 | Testosterone and Estradiol Unit Converter — testosterone/estradiol unit conversion | https://academic.oup.com/jcem/article/95/6/2536/2596202; https://pubchem.ncbi.nlm.nih.gov/compound/testosterone | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 037 | Side Effect Probability Calculator — side-effect probability calculations | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 038 | Stack Compatibility Checker — stack compatibility checks | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 040 | Lipid Profile Optimizer — lipid profile optimization | https://medlineplus.gov/lab-tests/cholesterol-levels/ | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 041 | Hematocrit Monitor — hematocrit monitoring/reference framing | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 042 | Estrogen Management Pro — estrogen management (pro tier) | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 043 | Prolactin Management Pro — prolactin management (pro tier) | https://academic.oup.com/jcem/article/96/2/273/2597879 | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 044 | DHT Side Effect Predictor — DHT side-effect prediction | https://www.auanet.org/guidelines-and-quality/guidelines/prostate-cancer-detection-guideline | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 045 | Cycle Break Planner — cycle break planning | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 046 | TRT Lifetime Calculator — TRT lifetime calculations | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 047 | Fertility Preservation Guide — fertility preservation guidance | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 048 | Cardiovascular Risk Assessor — cardiovascular risk assessment | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 049 | Bone Density Optimizer — bone density optimization | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 050 | Mental Health Monitor — mental health monitoring | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |
| 051 | Peptide Dosage Calculator — peptide dosage calculations | — | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE | NOT_AVAILABLE |

---

## 4. D-C5 / D-CLIN — clinical claims matrix + reviewer checklists

**Which of the 29 make clinical claims (static evidence):** **All 29.** Static scans of tool files (components, `.genius.tsx`, i18n) found clinical-keyword matches in every tool (samples: risk, warning, alert, red flag, doctor, referral, contraindication, U/L, mg/dL, mmol/L, not diagnosed, limit use). Static counts per tool (seed of the check): 006=6, 008=7, 014=4, 015=3, 016=7, 017=9, 022=6, 023=6, 025=7, 026=5, 027=5, 029=7, 031=5, 034=5, 035=5, 037=7, 038=6, 040=10, 041=8, 042=8, 043=6, 044=6, 045=8, 046=7, 047=8, 048=8, 049=8, 050=6, 051=6.

**Per-tool D-C5 / D-CLIN status (per R6.1-SOURCE-AND-CLINICAL-REVIEW-INDEX §2–3 — conservative defaults):** D-C5 = `NOT_AVAILABLE` (no specialist-approved wording packs); D-CLIN = `BLOCKED` (no qualified sign-off recorded).

| Tool | Clinical claims (static) | D-C5 | D-CLIN | R6.1-SOURCE notes (§3) |
|---|---|---|---|---|
| 006 | Yes — static scan 6 | NOT_AVAILABLE | BLOCKED | — |
| 008 | Yes — static scan 7 | NOT_AVAILABLE | BLOCKED | Tracker/safety wording review as applicable |
| 014 | Yes — static scan 4 | NOT_AVAILABLE | BLOCKED | — |
| 015 | Yes — static scan 3 | NOT_AVAILABLE | BLOCKED | — |
| 016 | Yes — static scan 7 | NOT_AVAILABLE | BLOCKED/N-A per claim map | — |
| 017 | Yes — static scan 9 | NOT_AVAILABLE | BLOCKED | Interaction safety claims sensitive |
| 022 | Yes — static scan 6 | NOT_AVAILABLE | BLOCKED/N-A per claim map | — |
| 023 | Yes — static scan 6 | NOT_AVAILABLE | BLOCKED | TRT optimization claims sensitive |
| 025 | Yes — static scan 7 | NOT_AVAILABLE | BLOCKED | — |
| 026 | Yes — static scan 5 | NOT_AVAILABLE | BLOCKED | — |
| 027 | Yes — static scan 5 | NOT_AVAILABLE | N/A or BLOCKED per claim | Verify clinical framing (conversion domain) |
| 029 | Yes — static scan 7 | NOT_AVAILABLE | BLOCKED | Early-warning framing sensitive |
| 031 | Yes — static scan 5 | NOT_AVAILABLE | BLOCKED/N-A per claim map | — |
| 034 | Yes — static scan 5 | NOT_AVAILABLE | BLOCKED/N-A per claim map | — |
| 035 | Yes — static scan 5 | NOT_AVAILABLE | BLOCKED | — |
| 037 | Yes — static scan 7 | NOT_AVAILABLE | BLOCKED | Probability/risk language sensitive |
| 038 | Yes — static scan 6 | NOT_AVAILABLE | BLOCKED | — |
| 040 | Yes — static scan 10 | NOT_AVAILABLE | BLOCKED | Lipid/cardiometabolic claims sensitive |
| 041 | Yes — static scan 8 | NOT_AVAILABLE | BLOCKED | Hematocrit safety/referral sensitive |
| 042 | Yes — static scan 8 | NOT_AVAILABLE | BLOCKED | STOPPED — do not advance activation |
| 043 | Yes — static scan 6 | NOT_AVAILABLE | BLOCKED | — |
| 044 | Yes — static scan 6 | NOT_AVAILABLE | BLOCKED | — |
| 045 | Yes — static scan 8 | NOT_AVAILABLE | BLOCKED | Closest candidate but gates open |
| 046 | Yes — static scan 7 | NOT_AVAILABLE | BLOCKED | — |
| 047 | Yes — static scan 8 | NOT_AVAILABLE | BLOCKED | Fertility claims sensitive |
| 048 | Yes — static scan 8 | NOT_AVAILABLE | BLOCKED | Cardiovascular risk sensitive |
| 049 | Yes — static scan 8 | NOT_AVAILABLE | BLOCKED | Bone density claims sensitive |
| 050 | Yes — static scan 6 | NOT_AVAILABLE | BLOCKED | Mental health — highest sensitivity |
| 051 | Yes — static scan 6 | NOT_AVAILABLE | BLOCKED | Dosage guidance sensitive |

**Reviewer checklist — per tool, before E4 sign-off (do not self-approve):**
1. **Sources (D-C4):** every displayed claim traces to an approved source; the approved pack records publisher, dates, evidence level, supported claim, limitation, reviewer. Tools without approved packs stay `NOT_AVAILABLE`.
2. **Safety wording (D-C5):** red flags / warnings / referral / "what not to do" / "when to see a doctor" (AR + EN) are specialist-approved; otherwise `NOT_AVAILABLE`. Generic honest framing ("not a diagnosis") is not a substitute.
3. **Thresholds/bands:** reference ranges, thresholds, bands match approved sources.
4. **Honesty posture:** model-less tools keep honest NOT_AVAILABLE framing (e.g., tool-014: "No validated model or sourced thresholds are available…").
5. **Parity/RTL (E4):** en/ar keyDiff = 0 (verified); RTL rendering at 390px verified against approved expected metrics.
6. **CORE-5/GENIUS-12 (E4):** boxes 2/3/7/9/12 closures present per CORE-5 definition.
7. **Export (E4):** CSV export present/absent per contract; browser-only (no session identifier).
8. **No self-approval:** D-C5/D-CLIN remain `NOT_AVAILABLE`/`BLOCKED` until qualified clinical/specialist review signs off (R6.1-SOURCE §2–3).

---

## 5. W18 — owner-decision boundary (no unauthorized persistence/history)

- **Statically provable** (from i18n, verified present in all 29 tool files — static scan `\bhistory\b` = true for each):
  - tool-014 example: `box11_title: "History"`; `box11_na: "NOT_AVAILABLE — history requires the W18 storage decision. Nothing is saved or shown here."`
  - `box12_rating_not_saved: "Session-only rating — not saved."` (tool-014).
- **Boundary:** none of the 29 tools may have persistence, history, drafts, ratings, DB writes, session, cloud sync, or storage writes until the owner decision (R6.1-SOURCE §2, D-W18; W12 ACTIVE hard constraint — R6.1 commits NO_DB; W01 OPEN). Box 11 stays `NOT_AVAILABLE` on every tool until the decision.
- **Status:** `NOT_AVAILABLE by owner decision` — pending (R6.1-SOURCE §2 row "W18 History/Storage: NOT_AVAILABLE (owner decision)").

---

## 6. External-dependency register

| Item | Owner | Need | Status | Unblocks |
|---|---|---|---|---|
| Browser E3/E4 access — authorized SSO session, preview pinned to SHA `37f047a4…`, Deployment ID, test account, evidence-capture format | Owner (Vercel team `foryoutalk-9724`) | SSO session + Preview deploy from the working tree + Deployment ID recorded | BLOCKED | Owner grants SSO session; owner/Vercel deploys preview |
| Preview pinned to current SHA `37f047a4…` (clean Preview of the working tree) | Owner / Vercel | New Preview deploy; Deployment ID + direct URL captured per tool | NOT_AVAILABLE | Owner deploys |
| D-C4 approved source packs (29 tools) | Owner / qualified specialist | Approved pack per tool/claim (source, publisher, dates, level) | NOT_AVAILABLE (×29) | Specialist provides packs (§3) |
| D-C5 approved referral/warning wording packs (AR/EN) | Owner / qualified specialist | Specialist-approved wording per tool | NOT_AVAILABLE | Qualified review/approval |
| D-CLIN clinical/model review | Clinical reviewer | Sign-off notes per tool/requirement | BLOCKED (×29) | Reviewer reviews (§4) |
| W18 owner decision (storage/history/sync) | Owner | Decision on persistence boundary | NOT_AVAILABLE | Owner decides (§5) |
| D-P03 pipeline-layer result-schema enforcement | Tech lead / owner | Approval of shared R6 pipeline-layer change | NOT APPROVED | Tech lead/owner |
| Tool 042 activation (STOPPED) | Owner | 042 activation decision | STOPPED | Owner decision (R6.1-SOURCE §3) |
| Browser evidence capture re-run (`closure-sprint-2026-11-17/browser-evidence/` — batch1–4 verifier) | Owner | Run per tool on the Preview | NOT RUN | Owner runs (§1 evidence-capture format) |

---

## 7. First-run recommendation — Browser E3/E4 candidates when access exists

Recommend two tools (best first-run candidates): **Tool 045 — Cycle Break Planner** and **Tool 047 — Fertility Preservation Guide**.

**Tool 045 — Cycle Break Planner** (`/smarttools/cycle-management/tool-045-cycle-break-planner`; `app/smarttools/tool-045-cycle-break-planner/page.tsx`; tool-owned CORE-5/GENIUS-12):
- Justification (evidence): R6.1-BROWSER-EVIDENCE-INDEX row: **"None current (prior preview SSO noted)"** — signals a previously-authorized SSO access path to its preview, so access risk is lower; tool has static export, static state labels, tool-owned components, hist=true (box 11 = NOT_AVAILABLE — no storage/persistence complexity burning E3). R6.1-SOURCE flags 045 as "Closest candidate but gates open" — consistent with lowest E3 debt among Batch 2 tools.
- Run: E3 (local production build + Chrome/CDP: 12-box order, compact/full parity, AR RTL, 390px, keyboard/a11y, console, hydration, network) then E4 (published Preview via authenticated proxy: same + no PHI/secret leakage).

**Tool 047 — Fertility Preservation Guide** (`/smarttools/reproductive-wellbeing/tool-047-fertility-preservation`; tool-owned CORE-5/GENIUS-12):
- Justification: narrower clinical domain than 050 (mental health); static export present; state labels present; hist=true → box 11 NOT_AVAILABLE; no storage/sync burden beyond the W18 box. Complementary second candidate; its D-C5/D-CLIN gates are open, so its E3 debt is not inflated by missing approvals.
- Run: same E3/E4 method.

Method note: deploy each to a new Preview pinned to SHA `37f047a4…`, capture Deployment IDs, run E3 on the local production build and E4 on the published Preview through the authenticated proxy (per R6.1-PREVIEW-INDEX precedent), retain screenshots/logs/results per §1 evidence-capture format.

---

## 8. Unresolved items

1. **Browser access:** no SSO session and no verified preview for SHA `37f047a4…` at dispatch — **all runtime cells (390px, 1440px, Empty, Partial, Full, Invalid, Degraded, Keyboard, A11y, Console, Hydration, Network) remain NOT_RUN for all 29 tools.**
2. **Tool 042 — STOPPED** (R6.1-SOURCE §3; R6.1-PREVIEW-INDEX): do not advance activation until an owner decision.
3. **No test account** identified in sources — owner must provide one for E3/E4.
4. **No Deployment ID / direct Preview URL for SHA `37f047a4…` at dispatch** (dispatch baseline).
5. **D-C4:** 29 packs NOT_AVAILABLE (candidate sources listed in §3, with live-reachability notes).
6. **D-C5:** NOT_AVAILABLE for tools with referral/safety-action wording requirements.
7. **D-CLIN:** BLOCKED for all 29 (no qualified sign-off).
8. **W18:** NOT_AVAILABLE (owner decision pending).
9. **Tool 041's published preview `dpl_3an5zZFr4R9WaQx7CCWngv6KnG9R`** (Tool 041 doc, 2026-11-12) — historic; cannot support claims for the current SHA without re-pinning.
10. **Nothing executed:** no browser run, no SSO, no deploy; all runtime evidence = NOT_RUN.

---

## 9. SHA-256

To be computed after file write (F-BROWSER-SOURCE-CLINICAL-READINESS.md, HEAD `37f047a4`).
