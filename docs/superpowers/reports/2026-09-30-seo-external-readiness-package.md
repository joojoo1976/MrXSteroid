# Readiness Package · Dynamic Keyword Intelligence (Phase 2 — External)

**Status:** prepared, not executed.
**Authorised work in this phase:** documentation + read-only SQL only.
**Not done, by instruction:** commit, push, deploy, Production migration, new features.

This package exists so the next phase is mechanical rather than exploratory. Every
variable name, function name and SQL statement below was read out of the current
source tree, not inferred. Where a fact could not be verified from code, it is
marked **UNVERIFIED** rather than filled in.

---

## 0. A finding that changes how Phase 2 must be scoped

The seven source adapters **do not read `process.env` directly**. Each takes an
injected `env: Record<string, string | undefined>` and an injected transport, and
each exposes a `resolve*Blocked()` function returning the **exact missing
dependency name** rather than a generic failure.

Verified by reading each adapter:

| Adapter | Reads `process.env`? | How config arrives |
|---|---|---|
| `gscAdapter.ts` | No | `GscQuery` + injected `env` |
| `googleAdsAdapter.ts` | No | `GoogleAdsConfig` + injected `env` |
| `googleTrendsAdapter.ts` | No | `TrendsConfig` + injected `env` |
| `bingAdapter.ts` | No | `BingConfig` + injected `env` |
| `commonCrawlAdapter.ts` | No | constant endpoint only |
| `competitorCrawler.ts` | No | `CrawlOptions` |
| `csvImportPipeline.ts` | No | file input + `ImportConfig` |

**Consequence for Phase 2.** Setting environment variables alone will **not**
activate any source. Something must construct the config object and pass it in.
No such wiring exists in any route today — the adapters are registered and
unit-tested but not invoked by a runtime path, in the same way `weeklyEngine` and
`snapshotDiff` were not invoked before this round.

Phase 2 therefore has two halves, and **the first is code, not credentials**:

1. **A DI seam** that reads the environment and calls each adapter.
2. **Credentials**, once the seam exists.

This must not be discovered after credentials are procured. It is why
`EXTERNAL SOURCE VERIFIED` would still be `BLOCKED` even with every credential in
place — the same class of hidden blocker this round removed for the weekly engine.

---

## 1. Required environment variables (names only — no values)

Names below are the literal strings passed to `readEnv(env, ...)` in source.

### 1.1 Platform / database (needed first)

| Variable | Read by | Purpose |
|---|---|---|
| `SUPABASE_URL` | `server/seo/seoService.ts` | DB endpoint |
| `NEXT_PUBLIC_SUPABASE_URL` | `server/seo/seoService.ts` | Fallback endpoint |
| `SUPABASE_SERVICE_ROLE_KEY` | `server/seo/seoService.ts` | Server-side writes |
| `CRON_SECRET` | `app/api/seo/refresh/route.ts:80` | Authorises refresh + weekly scheduler |

**Do not paste values into any report.** Confirm presence only. The service-role
key bypasses RLS; treat its disclosure as an incident.

### 1.2 Per provider

| Provider | Variables (verified names) | Missing one reported as |
|---|---|---|
| GSC | `GSC_SITE_URL`, `GSC_ACCESS_TOKEN` | `site_property` / `oauth_token` |
| Google Ads | `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_ACCESS_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID` | `credential` |
| Bing | `BING_WEBMASTER_API_KEY`, `BING_WEBMASTER_SITE_URL` | `credential` |
| Google Trends | *(none)* | `Google Trends API alpha access (no public endpoint)` |
| Common Crawl | *(none)* | network reachability only |
| Competitor web | *(none)* | a crawl must actually be run |
| CSV import | *(none)* | a file supplied via a route |

`GSC_ACCESS_TOKEN` requires scope

---

## 2. Verification method per provider

Each has a **narrow** definition of PASS. A 200 response is not enough.

| Provider | PASS condition | Explicitly NOT sufficient |
|---|---|---|
| GSC | One real Search Analytics query returns >= 1 row; a provenance row is written with `source_backed = true`; non-Google metric fields stay `null` | HTTP 200 with zero rows |
| Google Ads | A real Keyword Ideas request returns >= 1 idea with a volume figure | A URL-seed request succeeding alone |
| Bing | A real query-stats request returns >= 1 row, stored in `bingImpressions`/`bingClicks` only | Any merge into Google fields — a contract violation |
| Trends | A CSV is imported and yields a 0-100 index labelled `relative` | Storing an index as a volume |
| Common Crawl | One live index request returns crawl metadata | Fixture-verified parsing |
| Competitor web | One robots-compliant crawl of a permitted URL returns extracted evidence | Fetching a disallowed URL |
| CSV import | A file imports, rows validate, per-row provenance is assigned | A file parsing without provenance |

**Cross-cutting PASS condition.** A provider is `VERIFIED` only when the row it
produced survives the whole chain: persisted → provenance → weekly state → diff →
API. A provider that returns data but whose rows fail to persist is `PARTIAL`,
not `VERIFIED`. This mirrors the persistence-failure semantics already pinned in
`tests/integration/seoRuntimeChain.test.ts`.

**Independence rule.** A provider is not marked `VERIFIED` because another one
is. `common_crawl` fetching competitor pages does not verify `competitor_web`.

---

## 3. Production DB queries (read-only)

Delivered as a runnable file: **`docs/superpowers/sql/2026-09-30-seo-external-readiness.sql`**

Every statement is a `select`. There is no DDL and no DML in the file, so it is
safe against Production: the worst outcome is printed rows.

| Section | Purpose | PASS condition |
|---|---|---|
| 0.1 | Current unique key on `seo_keywords` | Still `(language, normalized_keyword)`; **anything else means STOP** |
| 0.2 | Gate functions exist | All three present, or the migration is unapplied |
| 0.3 | Snapshot unique key | Unchanged `(year, week_number, language)` |
| 1 | Row counts, source distribution, language/market split, trend status | Count > 0; distribution names real sources |
| 2 | Provenance coverage + per-source `source_backed` split | Every keyword has >= 1 provenance row |
| 3.1/3.2 | `seo_market_backfill_readiness()` | **Zero rows** |
| 3.3 | `seo_market_identity_collisions()` | **Zero `spelling_collision`** |
| 4 | Weekly states, snapshots, refresh runs | Non-empty proves the loop runs in Production |

**How to read a non-empty result.** An empty `seo_keyword_weekly_states` means the
refresh has never run there. That is a *fact to report*, not a defect to paper
over. It is the empirical counterpart of "RUNTIME CHAIN CLOSED" — code closure is
necessary, not sufficient.

---

## 4. Market backfill / collision commands (read-only)

The §81 sequence, with the gate each step must clear:

```
STEP 1  BACKFILL    → run seo_market_backfill_readiness()
                      gate: every row resolves a market from data ON the row
STEP 2  VALIDATE    → same query
                      gate: ZERO ROWS RETURNED
STEP 3  COLLISIONS  → run seo_market_identity_collisions()
                      gate: zero spelling_collision
                           every legacy_multi_market human-reviewed
STEP 4  VERIFY      → human sign-off, recorded
STEP 5  CONSTRAINT  → separate reviewed change        [NOT IN THIS PHASE]
```

```bash
# Read-only. Nothing below writes.
psql "$DATABASE_URL" -f docs/superpowers/sql/2026-09-30-seo-external-readiness.sql
```

Both functions are `stable` and `select`-only. `seo_market_backfill_readiness()`
never guesses a market: a row whose locale is not one of the seven supported

---

## 5. What stays BLOCKED if a given provider fails

Stated up front so a partial result cannot be presented as success.

| Scenario | Result |
|---|---|
| GSC fails | `GSC VERIFIED = BLOCKED`. Others still verifiable. Registry keeps the exact missing dependency. Weekly engine records it as a value and finishes `PARTIAL_SUCCESS`. |
| All external providers fail | `EXTERNAL SOURCE VERIFIED = BLOCKED` **and** `PRODUCTION DB VERIFIED = BLOCKED` — the latter stays blocked regardless, per §6. |
| `seo_market_backfill_readiness()` returns rows | Market constraint stays `BLOCKED / PENDING EVIDENCE`. No backfill is auto-applied. |
| Collision report non-empty | Step 5 stays blocked until human review. |
| Weekly-state write fails in Production | Refresh finalises `failed` (already implemented and tested). A `PARTIAL_SUCCESS` must not be reported as success. |
| DI seam never built | **Every provider stays `BLOCKED` even with valid credentials.** See §0. |

**A provider is never upgraded to `VERIFIED` as collateral.** Each requires its
own evidence, and `VERIFIED SOURCES: 0` stays `0` until that is literally true.

---

## 6. Two blockers, tracked separately

`EXTERNAL SOURCE CONNECTIVITY` and `PRODUCTION DB REALITY` are independent.
Clearing credentials for GSC does **not** clear `PRODUCTION DB REALITY`, because
that needs the §3 queries run and the §4 gates passed.

**Even with every credential in place, `PRODUCTION DB VERIFIED` remains
`BLOCKED`** until the read-only SQL above is executed against real data and the
market sequence is reviewed.

---

## 7. Phase 2 entry checklist

- [ ] DI seam written, so adapters can be reached from a route *(code, not credentials)*
- [ ] Token refresh strategy decided for `GSC_ACCESS_TOKEN` and `GOOGLE_ADS_ACCESS_TOKEN`
- [ ] Additive weekly-states migration confirmed applied (creates a table; touches no constraint)
- [ ] `seo-external-readiness.sql` executed; full output captured
- [ ] Backfill query returns zero rows
- [ ] Collision query reviewed row by row
- [ ] Per-provider PASS criteria met with recorded evidence
- [ ] One provider verified end-to-end (persist → provenance → weekly state → diff → API) before any are called verified

---

## 8. Explicit non-claims

- No source is `VERIFIED`.
- No Production DB fact is asserted; none has been queried.
- No market constraint is safe to apply; the evidence does not exist yet.
- `545/545` tests prove code behaviour only. They prove nothing about Google's
  servers or the Production database.
- **Dynamic Keyword Intelligence is not Production-verified.**

**P0 / P1 / H4: untouched.** The 17 unrelated checkout/payment test failures are
`PRE-EXISTING / OUT OF SEO SCOPE` (proved by re-running with these changes
stashed) and were not addressed.

values is *reported*, because inventing one would fabricate data.

**Two collision kinds, deliberately distinguished:**

- `spelling_collision` — **data-loss risk**. Two spellings occupy one identity
  slot today and would collapse. Must be zero.
- `legacy_multi_market` — **expected split**. One row legitimately becoming
  several. May be non-zero; that is the change working. Each needs sign-off.

**The constraint itself is absent from every file in this phase.** Confirm this
before approving any migration: search for
`unique (language, market, normalized_keyword)` and expect no `ALTER` statement.

`https://www.googleapis.com/auth/webmasters.readonly` (`GSC_SCOPE`,
`gscAdapter.ts:64`). `GSC_SITE_URL` must be URL-prefix form
(`https://example.com/`) or `sc-domain:example.com`.

### 1.3 Tokens that need a human, not a copy-paste

- **`GSC_ACCESS_TOKEN`** — OAuth 2.0, short-lived. A stored value will expire,
  and the source will silently degrade to `BLOCKED` later. **Decide the refresh
  strategy before wiring.**
- **`GOOGLE_ADS_ACCESS_TOKEN`** — same expiry problem, plus a developer-token
  approval queue that can take days.
