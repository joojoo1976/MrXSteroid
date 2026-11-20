# PHASE R1 — REGISTRY RECONCILIATION

**Date:** 2026-11-01
**Phase:** R1 — Controlled Architecture Foundation
**Status:** COMPLETE — PENDING OWNER REVIEW

---

## 1. Count Sources

| Count | Value | Source | Explanation |
|-------|-------|--------|-------------|
| Catalog entries | 268 | `smartToolsCatalog*.ts` (30 files) | All catalog entries including 4 planned |
| Published tools | 264 | `getPublishedCatalogTools()` | Excludes 4 planned (#132, #137, #138, #139) |
| Planned tools | 4 | Catalog entries with `status: 'planned'` | #132, #137, #138, #139 |
| v7 Registry | 252 | `tools.registry.v7.252.ts` | V7 target (14 categories) |
| TypeScript Registry | 267 | `registry.ts` | Includes legacy + layered tools |
| Supabase tool_registry | 10 | DB table | Only 10 tools seeded |

## 2. Source of Truth

| Source | Authority | Notes |
|--------|-----------|-------|
| `lib/tools/registry.ts` | **Primary** for app routing and identity | 267 entries, validated by `validateRegistry()` |
| `lib/tools/smartToolsCatalog*.ts` | **Primary** for Hub display | 268 entries (264 published + 4 planned) |
| `tools.registry.v7.252.ts` | **Reference** for v7 target | 252 entries, aspirational |
| DB `tool_registry` | **NOT authoritative** | Only 10 tools, RLS deny-all, not used by app |

## 3. Why Counts Differ

1. **Catalog (268) vs Published (264):** 4 tools have `status: 'planned'` and are excluded from published selector
2. **Catalog (268) vs v7 Registry (252):** Catalog has 16 more tools than v7 target (v7 expansion beyond 252)
3. **TypeScript Registry (267) vs Catalog (268):** 1 catalog entry not in TS registry (minor sync gap)
4. **DB (10) vs Code (267+):** DB was only seeded with 10 tools; never synced with codebase

## 4. Registry-Only and Catalog-Only Slugs

### Catalog-Only (4 slugs not in TypeScript Registry)
1. `tool-132-ai-pose-form-coach`
2. `tool-137-peptide-hormone-reconstitution-calculator`
3. `tool-138-raw-powder-density-oil-formulation-engine`
4. `tool-139-solvent-emulsifier-ratio-calculator`

### Registry-Only (0 slugs)
All 264 TypeScript Registry slugs appear in the catalog.

## 5. DB tool_registry Analysis

### Table Structure
| Column | Type | Notes |
|--------|------|-------|
| sequence_number | integer | 1-10 |
| slug | character varying | 10 unique slugs |
| name_ar | character varying | Arabic name |
| name_en | character varying | English name |
| is_active | boolean | All true |

### RLS Status
- RLS enabled: Yes
- Policies: **NONE** → deny-all access
- Effectively inaccessible to all users

### Seeded Tools (10)
1. macro-calculator
2. body-fat-analyzer
3. accumulation-simulator
4. pct-timing
5. hcg-serm-protocol
6. estrogen-prolactin
7. bloodwork-analyzer
8. side-effect-tracker
9. injection-rotator
10. stack-builder

### Assessment
The DB `tool_registry` table is **not used by the application**. The app uses `lib/tools/registry.ts` (TypeScript) as the source of truth. The DB table is redundant and out of sync.

**Recommendation (future, not now):** Either sync DB with codebase (insert all 268 tools) or deprecate the DB table and use TypeScript registry as sole source.

## 6. No Changes Made

- No Registry entries deleted, merged, or rewritten
- No database writes performed
- No catalog entries modified
- No new tables created