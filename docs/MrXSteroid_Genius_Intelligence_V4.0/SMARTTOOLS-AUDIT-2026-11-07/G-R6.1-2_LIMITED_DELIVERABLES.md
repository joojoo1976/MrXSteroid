# G-R6.1-2 LIMITED — DELIVERABLES (Pure Frontend, No DB)

**Generated:** 2026-11-08  
**Repository / HEAD:** E:\MrXSteroid-main / 914d7015358cfbc9b9dbe6731772cac0cf093310  
**Branch:** docs/r6.1-r0-evidence  
**Mode:** Read-only + Pure Frontend analysis. No DB write, no Session, no real data, no Supabase touch.  
**R6.1 status:** OWNER REVIEW DRAFT — NOT ACTIVE. G-R6.1-0 APPROVED WITH CONDITIONS. G-R6.1-1 APPROVED PARTIAL WITH BLOCKER (W05 = BLOCKED). G-R6.1-2 LIMITED in progress.

**Owner decision:** W05 يفضل BLOCKED. No DB writes, even in Staging. G-R6.1-2 LIMITED = Pure Frontend only (Dynamic + Visual + Navigation).

---

## 1. W05 RLS — BLOCKED (Owner Decision)

**Status: BLOCKED — NOT_RUN**

The owner explicitly declined DB writes, even in Staging. W05 remains BLOCKED.

**What IS verified (read-only, no DB write):**
- RLS policy definition: `user_tool_states` has policy "User own states", cmd=ALL, qual=`auth.uid() = user_id`
- RLS simulation: `SET ROLE authenticated` + `set_config('request.jwt.claims', ...)` → `SELECT count(*) FROM user_tool_states` returned 0 rows (filter applied correctly)
- Policy is correctly defined for own-data access

**What is NOT verified (requires DB write — forbidden):**
- Cross-tenant isolation: User A cannot see User B's data
- Cross-tenant write rejection: User A cannot insert/update User B's data
- Admin override: admin role can see all data

**Conclusion:** W05 = BLOCKED. Policy definition is correct, but cross-tenant isolation is unproven. No DB write was performed per owner instruction.

---

## 2. Dynamic Contract + Result Engine (Empty/Partial/Full + MVO) — Pure Frontend, No DB

**Status: NOT_IMPLEMENTED (documented as design, not code)**

### 2.1 What exists (R5 pilots only)

The R5 pilots (BMI, Protein Needs, Water Intake) demonstrate:
- Empty state: no result shown when inputs are missing
- Partial state: minimum viable output (MVO) shown with missing field indicators
- Full state: complete result with insights, advice, scenarios
- Live recalculation on input change
- MVO = primary result only (e.g., BMI value without categories if height missing)

### 2.2 What's missing in the 20-tool sample

| # | Tool | Has Empty/Partial/Full? | Has MVO? | Has Live Recalc? | Notes |
|---:|---|---|---|---|---|
| 1 | macro | Partial (V4 envelope) | Yes (BMR) | Yes | V4 adapter maps Empty/Partial/Full |
| 2 | bodyfat | No | No | Yes | Native inputs, no state badges |
| 3 | injection | No | No | No | Visual guide only |
| 4 | halflife | No | No | No | Visualization only |
| 5 | lab | No | No | No | Reference ranges only |
| 6 | genetic | No | No | No | Heuristic score |
| 7 | cycle | No | No | No | Arithmetic only |
| 8 | timeline | No | No | Partial | Constant-rate scenario |
| 9 | master-calculator | No | No | No | Composite |
| 10 | multi-ester-pharmacokinetics | No | No | No | Serum timeline |
| 11 | hpta-recovery | No | No | No | Unvalidated model |
| 12 | aromatization-risk | No | No | No | Unvalidated scenario |
| 13 | pct-timing | No | No | No | Washout arithmetic |
| 14 | hcg-serm-protocol | No | No | No | Rule-based protocol |
| 15 | bmi | Yes (R5) | Yes | Yes | R5 pilot |
| 16 | one-rep-max | No | No | Yes | Simple calc |
| 17 | strength-standards | No | No | Yes | Ratio comparison |
| 18 | rest-timer | No | No | Yes | Simple calc |
| 19 | bmr-tdee | No | No | Yes | Simple calc |
| 20 | protein-needs | Yes (R5) | Yes | Yes | R5 pilot |

**Summary:** 3 of 20 tools (bmi, protein-needs, water-intake not in sample but bmi and protein-needs are) have Empty/Partial/Full + MVO. 17 tools lack this pattern.

### 2.3 Proposed Dynamic Contract (design only, no code)

For each tool, the Dynamic Contract should define:
- **Empty state:** What to show when required inputs are missing (MVO or "insufficient data" message)
- **Partial state:** What to show when some inputs are present but not all (MVO + missing field indicators)
- **Full state:** Complete result with all panels
- **MVO (Minimum Viable Output):** The one number/result that can be shown with minimal inputs
- **Live Recalculation:** Result updates on every input change (no submit button)
- **What-If:** Slider or input change shows scenario comparison

**Blocker for implementation:** None for pure frontend. Can be implemented as a shared component + per-tool configuration. But requires owner approval before code changes.

---

## 3. Visual 5/12 (Compact 5 + Full 12 + C1 matching) — Pure Frontend, No DB

**Status: NOT_IMPLEMENTED (documented as design, not code)**

### 3.1 CORE-5 (Compact view — always shown)

| # | Box | Content | Status in 20-tool sample |
|---:|---|---|---|
| C1 | Primary Result | Number + unit + range + confidence | Present in 15 of 20 (basic result display) |
| C2 | How Calculated | Formula + inputs + assumptions + uncertainty | Present in 2 of 20 (bmi, protein-needs R5 pilots) |
| C3 | Safety & Warnings | Warnings + red flags + contraindications + referral | Present in 1 of 20 (aromatization-risk has warnings) |
| C4 | Evidence & Sources | Source name + publisher + date + evidence level + link | Present in 0 of 20 |
| C5 | Next Actions | One clear next step + what not to do + when to see doctor | Present in 0 of 20 |

### 3.2 GENIUS-12 (Full page — 12 boxes in fixed order)

| # | Box | Relation to CORE-5 | Status in 20-tool sample |
|---:|---|---|---|
| 1 | KPI Strip | Summary of C1 | 0 of 20 |
| 2 | Primary Result | = C1 fully | 15 of 20 (basic) |
| 3 | Formula / How Calculated | = C2 fully | 2 of 20 |
| 4 | Inputs Summary | Detail of C2 | 0 of 20 |
| 5 | What-If | Enrichment: alternative scenarios | 1 of 20 (bmi has scenarios) |
| 6 | Sensitivity | Enrichment: which input matters most | 0 of 20 |
| 7 | Warnings / Safety | = C3 fully | 1 of 20 |
| 8 | Cross-Tool Links | Enrichment: related tools + freshness | 0 of 20 |
| 9 | Evidence / Sources | = C4 fully | 0 of 20 |
| 10 | Export | Enrichment: PDF/ICS/CSV | 0 of 20 |
| 11 | History | Enrichment: previous results + freshness | 0 of 20 |
| 12 | Feedback / Rating + Next Actions | = C5 + 1-5 rating + comment | 0 of 20 |

### 3.3 C1 Matching Test (Compact vs Full)

**Status: NOT_TESTED** — No Compact/Full view separation exists in any tool. The C1 (Primary Result) in a compact card view must be identical to C1 in the full page view. This requires:
1. A shared result component that renders C1 identically in both views.
2. A test that compares C1 output in Compact vs Full mode.
3. No view-specific formatting that changes the displayed value.

**What exists:** R5 pilots display results in a single view (no Compact/Full separation).  
**What's missing:** View mode separation + C1 matching test.  
**Blocker:** None for pure frontend.

---

## 4. Navigation (Breadcrumb + Prev/Next + Single/Double Click) — Pure Frontend, No DB

**Status: PARTIAL (breadcrumb exists; Prev/Next missing)**

### 4.1 Breadcrumb

**Exists:** `app/smarttools/[category]/[tool]/page.tsx` L72-74 renders breadcrumb with Home > SmartTools > Category > Tool.

**Defect:** Uses `titleEn` in both locales (English-only, shared defect affecting all tools).

**Fix needed (shared chrome):** Use locale-aware title. Requires owner approval (affects all 268 tools).

### 4.2 Prev/Next links

**Status: NOT_IMPLEMENTED**

Historical docs reference Prev/Next (Tool 111 has Prev 110 / Next 112), but the dynamic route does not render Prev/Next links. The `getToolNeighbors` function exists in `lib/tools/registry.ts` (tested in `lib/tools/registry.test.ts` L147-169).

**Evidence:**
- `lib/tools/registry.test.ts` L147: `expect(links.nextTool.slug).toBe('aromatization-risk')`
- `lib/tools/registry.test.ts` L150-151: walks forward from aromatization-risk into hpta-recovery
- `lib/tools/registry.test.ts` L159: links Tool #001 backwards to Tool #002

**What exists:** `getToolNeighbors(slug)` function with tests.  
**What's missing:** Prev/Next rendering in the dynamic route page.  
**Blocker:** None for pure frontend.

### 4.3 Single Click (smooth scroll to category)

**Status: NOT_VERIFIED**

Referenced in V5/V6 docs ("Single Click = smooth scroll to category") but not verified in current code. The category page (`app/smarttools/[category]/page.tsx`) may or may not implement smooth scroll.

**Evidence:** Not found in current codebase search.  
**Status:** NOT_VERIFIED (not NOT_IMPLEMENTED — may exist but not confirmed).

### 4.4 Double Click (router.push to category page)

**Status: NOT_VERIFIED**

Referenced in V5/V6 docs ("Double Click = router.push to category page") but not verified in current code.

**Evidence:** Not found in current codebase search.  
**Status:** NOT_VERIFIED.

---

## 5. Summary

| # | Deliverable | Status |
|---|---|---|
| 1 | Dynamic Contract + Result Engine (Empty/Partial/Full + MVO) | NOT_IMPLEMENTED (design documented; 3/20 tools have partial) |
| 2 | Visual 5/12 + C1 matching | NOT_IMPLEMENTED (design documented; 0/20 have Compact/Full) |
| 3 | Navigation (Breadcrumb + Prev/Next + Single/Double Click) | PARTIAL (breadcrumb exists with locale defect; Prev/Next function exists but not rendered; Single/Double Click NOT_VERIFIED) |
| 4 | RLS Negative Test (cross-tenant) | BLOCKED (W05 — policy verified, cross-tenant NOT_RUN) |

**Forbidden actions:** none performed. Batch 2 BLOCKED. R6.1 NOT ACTIVE. W18 NOT executed. No merge, no pilot, no canary, no DB write, no Tool 111 rewiring. W05 BLOCKED per owner decision. G-R6.1-2 LIMITED PENDING (Dynamic + Visual + Navigation as Pure Frontend only).