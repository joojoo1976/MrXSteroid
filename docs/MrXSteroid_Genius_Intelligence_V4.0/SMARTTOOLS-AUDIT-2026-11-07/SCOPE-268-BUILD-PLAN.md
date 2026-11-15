# SCOPE 268 APPROVED — 4 PLANNED TOOLS BUILD PLAN

**Generated:** 2026-11-08  
**Repository / HEAD:** E:\MrXSteroid-main / 914d7015358cfbc9b9dbe6731772cac0cf093310  
**Mode:** Read-only analysis + build plan. No code changed yet.  
**R6.1 status:** OWNER REVIEW DRAFT — NOT ACTIVE. G-R6.1-0 APPROVED WITH CONDITIONS. G-R6.1-1 APPROVED PARTIAL WITH BLOCKER (W05). G-R6.1-2 APPROVED WITH 1 OBSERVATION. G-R6.1-3 APPROVED WITH 2 OBSERVATIONS. SCOPE 268 APPROVED.

---

## 1. Decision recorded

- Total verified tools: **268** (264 implemented + 4 planned)
- 18 UNVERIFIED entries excluded (not built, not counted)
- 286 NOT VERIFIED (not used)

## 2. The 4 planned tools — current state

| Tool | Slug | Category | Existing code | Domain complexity | Build feasibility |
|---|---|---|---|---|---|
| tool-132 | ai-pose-form-coach | training-recovery | v5 stub (1,069 bytes) | MediaPipe Pose + exercise checklist | Medium — needs MediaPipe integration or honest stub |
| tool-137 | peptide-hormone-reconstitution-calculator | injection-formulation | None | Peptide PK + reconstitution math | High — needs validated PK data |
| tool-138 | raw-powder-density-oil-formulation-engine | homebrew-chemistry | None | Density/oil formulation | High — needs material database |
| tool-139 | solvent-emulsifier-ratio-calculator | homebrew-chemistry | None | Solvent/emulsifier ratios | High — needs validated ratios |

### 2.1 Tool 132 — AI Pose Form Coach

**v5 stub found:** `v5-genius/engines/tools/132-pose-coach.v5.ts` (1,069 bytes)

The stub returns:
- `kneeAngle: 85, backAngle: 175, depth: 'good', tempo: { down: 2.0, up: 1.0 }`
- `formScore` from checklist (squat only)
- `personalizedCue` (Arabic text)
- `confidence: 90` (video) or `70` (no video)

**Issues:**
- MediaPipe is a stub (returns hardcoded values)
- Only squat exercise supported
- Confidence 90/70 is invented (not calibrated)
- No source for form score

**Proposed approach (Pure Frontend, honest):**
- Build as a stub with explicit NOT_AVAILABLE for video analysis (no MediaPipe in repo)
- Support checklist-based form scoring for common exercises (squat, deadlift, bench)
- Mark pose analysis as NOT_AVAILABLE (no real MediaPipe)
- Mark confidence as NOT_AVAILABLE (no calibrated model)
- Use Genius 12 boxes: C1 Medical (not medical advice), C7 Safety (form safety), C12 Next Step (link to exercise substitution)

### 2.2 Tool 137 — Peptide Hormone Reconstitution Calculator

**No existing code found.**

**Proposed approach (Pure Frontend, honest):**
- Build as a basic reconstitution calculator (peptide mg + solvent mL → concentration mg/mL)
- Mark all PK predictions as NOT_AVAILABLE (no validated PK data)
- Mark dosing recommendations as NOT_AVAILABLE (no clinical validation)
- Use Genius 12 boxes: C1 Medical (not medical advice), C2 General (concentration calc), C7 Safety (no dosing), C12 Next Step (link to peptide protocol)

### 2.3 Tool 138 — Raw Powder Density/Oil Formulation Engine

**No existing code found.**

**Proposed approach (Pure Frontend, honest):**
- Build as a density calculator (mass/volume → density g/mL)
- Mark formulation recommendations as NOT_AVAILABLE (no validated formulation data)
- Mark safety as NOT_AVAILABLE (no validated safety data)
- Use Genius 12 boxes: C1 Medical (not medical advice), C2 General (density calc), C7 Safety (no formulation guidance), C12 Next Step

### 2.4 Tool 139 — Solvent/Emulsifier Ratio Calculator

**No existing code found.**

**Proposed approach (Pure Frontend, honest):**
- Build as a ratio calculator (solvent A + solvent B → ratio)
- Mark formulation recommendations as NOT_AVAILABLE (no validated data)
- Use Genius 12 boxes: C1 Medical (not medical advice), C2 General (ratio calc), C7 Safety (no formulation guidance), C12 Next Step

---

## 3. Build plan (3 tools per batch, Pure Frontend only)

### Batch P1 (first batch of 3):
1. tool-132-ai-pose-form-coach (from v5 stub, honest NOT_AVAILABLE for video)
2. tool-137-peptide-hormone-reconstitution-calculator (basic concentration calc)
3. tool-138-raw-powder-density-oil-formulation-engine (basic density calc)

### Batch P2 (remaining 1):
4. tool-139-solvent-emulsifier-ratio-calculator (basic ratio calc)

### Each tool needs:
- Engine (pure module, no React/DOM/Supabase)
- Schema (Zod)
- Component (React with Genius 12 + DynamicStateBadge + ResultBoxes + Breadcrumb + Prev/Next)
- Page (App Router, or dynamic route entry)
- Contract (CAN/CANNOT/SOURCES/WHY/COST/STOP/RESTORE)
- Tests (at least 1 test file)
- tsc --noEmit = 0 errors
- npm run build = SUCCESS
- Commit to docs/r6.1-r0-evidence only

---

## 4. What I will NOT do

- No DB write, no Session, no real data, no Supabase touch
- No merge, no pilot, no canary
- No Tool 111 rewiring
- No W18 execution
- No Batch 2 (DB/cloud)
- No data invention (NOT_AVAILABLE for missing data)
- No building of 18 UNVERIFIED tools

---

## 5. Estimated scope

Building 4 tools from scratch with full Golden Template compliance is a significant task. Each tool requires:
- Engine: ~100-300 lines
- Schema: ~30-50 lines
- Component: ~200-400 lines
- Tests: ~50-100 lines
- Total: ~400-850 lines per tool, ~1,600-3,400 lines for 4 tools

This will require multiple batches (3 + 1) and multiple commits.

---

## 6. Required owner decision

Before I start building, confirm:
1. Accept 268 as verified total (already decided)
2. Approve build plan for 4 planned tools (Pure Frontend, honest NOT_AVAILABLE)
3. Approve 3-tools-per-batch pace

If approved, I will start with Batch P1 (tools 132, 137, 138).

> Batch 2 is BLOCKED. R6.1 is NOT ACTIVE. W05 is BLOCKED. W18 is NOT executed. No merge, no pilot, no canary. No DB write. No production deploy. No Tool 111 rewiring. No data invention.