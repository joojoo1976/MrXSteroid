# ARCHIVE — SUPERSEDED MIGRATIONS (NOT FOR EXECUTION)

## ⚠️ Do NOT run anything in this directory

Files here are preserved for **historical reference only**. They are outside
`supabase/migrations/`, so the Supabase CLI will not apply them. Do not move them
back.

---

## `20260918170000_seo_intelligence_v3_backbone.sql`

**Status: NEVER APPLIED TO PRODUCTION.**

A read-only Production probe (2026-09-30) confirmed none of its 10 tables exist
in Production:

```
seo_keyword_sources          ABSENT
seo_topic_clusters           ABSENT
seo_keyword_source_links     ABSENT
seo_keyword_pins             ABSENT
seo_keyword_blocks           ABSENT
seo_competitors              ABSENT
seo_competitor_observations  ABSENT
seo_seasonal_calendar        ABSENT
seo_cannibalization_alerts   ABSENT
seo_keyword_audit_log        ABSENT
```

Because it was never applied, there is no Production state to roll back from and
no data written by it to clean up.

### Why it was superseded

The file declares:

```sql
add column if not exists market text default 'global',
```

That `DEFAULT` is applied on INSERT, so every future row that omits a market
would silently receive the literal string `'global'`. That manufactures a fake
market in Production and is precisely the placeholder the market readiness gate
must reject. It also granted an unnecessary public-read policy on
`seo_keyword_source_links`, which would have exposed per-keyword source
attribution.

### Replacement

`supabase/migrations/20260930140000_seo_v3_backbone_revised.sql` (A′) is the
approved revision. It differs by:

| Concern | Original A | Revised A′ |
|---|---|---|
| `market` | `text default 'global'` | `text` (nullable, **no default**) |
| `country_code` | no backfill | deterministic backfill from `locale` |
| Market backfill | none | closed mapping, `NULL` when unresolved |
| `seo_keyword_source_links` RLS | public read | **admin/service only** |
| `seo_competitor_observations` RLS | admin/service | admin/service, rationale documented |

### Preservation

- **Historical preservation: YES** — the file is byte-identical to its original
  state; only its location changed.
- **Active execution: NO** — it lives here, not in `supabase/migrations/`.
- Do not delete it. Do not restore it to the active directory.
