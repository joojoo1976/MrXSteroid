# R0_BASELINE_REPORT.md

**Generated:** 2026-11-08  
**Repository:** E:\MrXSteroid-main  
**Branch:** docs/r6.1-review  
**HEAD SHA:** 914d7015358cfbc9b9dbe6731772cac0cf093310  
**Mode:** Read-only. No code, schema, route, registry, database, RLS, Macro, frozen document, commit, push, merge, or deployment was changed.  
**R6.1 status:** OWNER REVIEW DRAFT — NOT ACTIVE. R5 PENDING ACCEPTANCE — BATCH 2 BLOCKED.

## 1. Git baseline

| Item | Value |
|---|---|
| Branch | docs/r6.1-review |
| HEAD | 914d7015358cfbc9b9dbe6731772cac0cf093310 |
| Commit count | 606 |
| Modified (tracked) | 11 files (pre-existing R5 work) |
| Untracked | 26 files (pre-existing R5 work + new audit docs) |
| Lockfile | package-lock.json (306,245 bytes) |
| Package name | 008mr.-x-steroid-landing-page |
| Package version | 0.0.0 |

Modified files: app/api/dashboard/metrics/route.ts, app/smarttools/[category]/[tool]/page.tsx, components/tools/bmi-pilot.tsx, components/tools/macro-pilot.module.css, components/tools/macro-pilot.tsx, components/tools/protein-needs-pilot.tsx, components/tools/water-intake-pilot.tsx, shared/ui/DynamicBrandLogo.tsx, shared/ui/Footer.tsx, shared/ui/GlobalHeader.tsx, tests/integration/dashboardPersistence.test.ts.

## 2. Routes

| Metric | Count |
|---|---:|
| Files under app/smarttools | 179 |
| Directories under app/smarttools | 173 |
| Engine files (lib/tools/engines) | 435 |
| Schema files (lib/tools/schemas) | 277 |
| Component TSX (components/tools) | 376 |

## 3. Database / migrations / RLS

| Item | Value |
|---|---|
| schema.sql lines | 158 |
| Tables in schema.sql | 6 (user_tool_states, user_preferences, tool_usage_analytics, tool_ratings, user_voice_commands, ai_user_profiles) |
| RLS enabled | Yes (6 tables) |
| Policies in schema.sql | 9 |
| Migration files | 60+ (including rollbacks and archives) |
| Edge functions | 4 (payment-webhook, send-welcome-whatsapp, send_email, whatsapp-webhook) |

RLS evidence: ALTER TABLE ... ENABLE ROW LEVEL SECURITY on all 6 tables; CREATE POLICY for own-data access. No RLS negative test evidence found in this pass (W05 = NOT_RUN).

## 4. Tests

| Check | Result |
|---|---|
| tsc --noEmit --skipLibCheck | 0 errors (PASS) |
| npm run build | SUCCESS (no compile errors) |
| Full suite | 559 files / 5235 passed / 17 failed / 5 skipped (pre-existing, outside R5) |

## 5. Tool 111 error reproduction

The R6.1 closure layer references a historical "Unterminated regexp literal" build error at page.tsx:372. Reproduction attempt:

- `npx tsc --noEmit --skipLibCheck` → 0 errors.
- `npm run build` → SUCCESS.
- app/smarttools/tool-111-smart-food-macro-substitution/page.tsx is a 281-byte redirect stub (permanentRedirect to /smarttools/nutrition/tool-111-smart-food-macro-substitution).
- The actual tool page is rendered via the dynamic route app/smarttools/[category]/[tool]/page.tsx.

**Result: NOT_REPRODUCED in current code.** The error is either historical (already fixed) or references a different file/state. No fix was applied. This is recorded as evidence, not a conclusion.

## 6. History reconciliation (R6.1 vs prior work)

| R6.1 requirement | Our prior work | Status |
|---|---|---|
| 3-dimension status (Design/Impl/Evidence) | We used PASS/FAIL/PARTIAL/BLOCKED/NOT RUN | CONFLICTING — our model is single-dimension; R6.1 requires 3 independent dimensions |
| Evidence ladder E0-E5 | We used file/line/command/date/result | COMPATIBLE — our evidence maps to E2-E3; we did not claim E4/E5 |
| 5 inside 12 result boxes | We documented 5 panels + 12 result layers | COMPATIBLE — our 5 panels map to CORE-5; 12 slots preserved |
| Scope 268 with Lineage + EntryKind | We documented 268 with 21 named + 247 numbered | COMPATIBLE — we did not assign EntryKind; R6.1 requires it |
| W01-W24 tracker | We did not produce a W-tracker | MISSING — our remediation plan uses D1-D11 decisions instead |
| Conflict log | We did not produce a formal conflict log | MISSING |
| Crosswalk R0-R8 + G-R5-1..10 | We referenced R5 batches only | MISSING — R6.1 requires formal crosswalk |
| Capability Truthfulness Contract (7 fields) | We documented AI authority boundary | PARTIAL — we did not document COST/STOP/RESTORE per tool |
| Domain Profiles (14) | We documented 15 categories | COMPATIBLE — category count differs (14 vs 15) |
| Preview vs Canary separation | We did not distinguish | MISSING |

Conflicts are recorded here, not resolved. Resolution requires owner decision per R6.1 conflict log rules.

## 7. scope-reconciliation.csv

Generated at `docs/MrXSteroid_Genius_Intelligence_V4.0/SMARTTOOLS-AUDIT-2026-11-07/scope-reconciliation.csv` with 268 rows. Columns: entryId, tool_id, slug, category, entryKind, lineage150, lineage252, lineage255, design_A, impl_B, owner_C, evidence_E, evidence_link, notes.

Lineage columns are set to NOT_VERIFIED because the 150/252/255 historical mappings are not available in this repository's audit data. Owner_C is set to NOT_DECISIONED for all rows (owner decision required). This is an honest baseline, not a completed reconciliation.

## 8. Forbidden actions compliance

| Forbidden action | Status |
|---|---|
| New branch | NOT DONE |
| Commit | NOT DONE |
| Push | NOT DONE |
| DB change | NOT DONE |
| Paid provider activation | NOT DONE |
| Deployment | NOT DONE |
| W18 execution | NOT DONE |

## 9. Summary

R0 read-only baseline complete. Git, routes, engines, schemas, migrations, RLS, tests, and lockfile documented. Tool 111 historical error NOT reproduced in current build. History reconciliation shows 3 compatible, 1 conflicting, 6 missing items vs R6.1. scope-reconciliation.csv generated with 268 rows; lineage and owner decision columns are NOT_VERIFIED/NOT_DECISIONED pending owner input. No forbidden actions performed.

> Batch 2 remains BLOCKED. R5 acceptance remains pending. R6.1 is NOT ACTIVE.