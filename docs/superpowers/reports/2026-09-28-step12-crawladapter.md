# Step 12 — Common Crawl / Public Competitor Discovery Adapter

> **Status:** `BLOCKED` — no live Common Crawl access; fixture-verified design only.
> **No network requests, no credentials, no production changes.**
> **Adapter design verified by 18 fixture-based tests.**

---

## 1. Adapter Design (`server/seo/sources/commonCrawlAdapter.ts`)

### 1.1 Adapter Overview
- `source`: `common_crawl`
- `source_type`: `public_web_corpus`
- `source_reference`: `https://index.commoncrawl.org/`
- `language`: `en` (supports `ar` via detected language)
- `market`: `undefined` (remains undefined unless explicitly proven)
- `evidence`: `public_web_observed`
- `status`: `BLOCKED` — live Common Crawl access NOT PROVEN
- `confidence`: `50` — fixture-verified design only

### 1.2 Key Design Decisions
- **No live API calls**: `fetchDiscoveredKeywords()` returns `[]`; no network requests ever implemented
- **Fixture-based only**: All tests use fixture data, not live Common Crawl corpus
- **No fake SEO metrics**: No `search_volume`, `ranking`, `ctr`, `position`, or `demand` metrics
- **Conservative competitor classification**: `classifyCompetitorCandidate` only classifies as `verified_competitor` when domain is in an explicit competitor set; `competitor_candidate` only when clear competitor indicators exist; otherwise `public_web_page_discovered`
- **Market remains undefined** unless explicitly proven — no guessing from domain/language
- **Provenance preserved**: Every record carries `source: 'common_crawl'` and `evidence: 'public_web_observed'`

---

## 2. Adapter Functions

### `mapCommonCrawlCapture(capture)`
Maps a `CommonCrawlCapture` record to the adapter contract fields:
- `source`, `source_type`, `source_reference`, `language`, `market`, `discovered_at`, `discovery_method`, `confidence`, `parent_seed`, `evidence`, `status: 'public_web_observed'`
- Optional `detectedLanguage` → maps to `language`; if absent, `language` is `undefined`

### `validateCommonCrawlCapture(capture)`
Basic validation:
- Requires `url`, `domain`, `crawlId`, `capturedAt`
- Simple MIME type check (`text/html`, `application/pdf`, `application/xml`, or empty)
- Returns `{ valid: boolean, reason?: string }`

### `deduplicateCommonCrawlCaptures(captures)`
Removes duplicates by `crawlId + url` key.

### `classifyCompetitorCandidate(domain, existingCompetitors)`
Conservative classification:
- `verified_competitor` — domain in explicit competitor set
- `competitor_candidate` — domain contains competitor-related keywords ( ' competitor ', ' vs ', ' alternative ')
- `public_web_page_discovered` — default; no competitor evidence

### `extractCommonCrawlProvenance()`
Returns `{ status: 'BLOCKED', evidence: 'public_web_observed', source: 'common_crawl' }`.

---

## 3. Integration Gate Tests (18 passed)

| Test | Purpose |
|---|---|
| `adapter is BLOCKED for live Common Crawl access` | Confirms `status: 'BLOCKED'` |
| `adapter source_type is public_web_corpus` | Confirms correct source type |
| `adapter evidence is public_web_observed` | Confirms correct evidence type |
| `mapCommonCrawlCapture maps capture fields correctly` | Maps all capture fields to adapter contract |
| `validateCommonCrawlCapture valid capture` | Basic validation passes |
| `validateCommonCrawlCapture missing URL` | Missing URL rejected |
| `validateCommonCrawlCapture missing domain` | Missing domain rejected |
| `deduplicateCommonCrawlCaptures removes duplicates` | Deduplication works |
| `deduplicateCommonCrawlCaptures preserves unique captures` | Unique captures preserved |
| `classifyCompetitorCandidate verified_competitor` | Classifies when domain in competitor set |
| `classifyCompetitorCandidate competitor_candidate` | Classifies as candidate when no explicit competitor set |
| `classifyCompetitorCandidate public_web_page_discovered` | Default: public web page discovered |
| `extractCommonCrawlProvenance returns BLOCKED status` | Provenance status correct |
| `no fake SEO metrics in adapter config` | No fake metrics in adapter |
| `language handling: Arabic detected as ar` | Arabic language detection |
| `language handling: English detected as en` | English language detection |
| `language handling: no detected language returns undefined` | No language → undefined |
| `market remains undefined when not proven` | Market undefined by default |

---

## 3. Fixture Scenarios Tested

| # | Scenario | Purpose |
|---|---|---|
| 1 | valid HTML page capture | Basic capture mapping |
| 2 | Arabic page | Arabic language detection |
| 3 | English page | English language detection |
| 4 | duplicate capture for same page | Deduplication |
| 5 | non-200 response | Status handling |
| 6 | non-HTML MIME type | MIME validation |
| 7 | missing language | Language detection fallback |
| 8 | missing URL | Validation rejection |
| 9 | malformed record | Fails closed |
| 10 | same domain with multiple captures | Deduplication quality |
| 11 | candidate competitor domain | Competitor classification |
| 12 | page that must remain only `public_web_page_discovered` | Not promoted to competitor |

---

## 4. No Pipeline Changes

- `scoringEngine`, `seoService`, `normalization`, `intentClassifier`, `clustering`, `destinationMapper`: **untouched**
- `refresh/route.ts`, `report/route.ts`: **untouched**
- `types.ts`, `migrations`: **untouched**
- `docs/superpowers/`: audit reports preserved
- **No Fourthwall files modified**

---

## 5. No Production Impact

- **Zero DB writes**: No schema changes, no migrations, no `ALTER` / `INSERT` / `UPDATE` / `DELETE`
- **Zero network calls**: No Common Crawl API requests, no WARC downloads
- **Zero scheduler / refresh**: No production refresh execution
- **Zero deployment**: No `commit`, `push`, `deploy`
- **Zero external providers**: GSTAYSBLOCKED; no Google Ads / Bing / Trends / Competitor
- **Zero credentials**: No API keys, tokens, or secrets
- **Zero Fourthwall files**: All 20 tracked `M` files unchanged

---

## 6. Evidence Classification Summary

| Classification | Status | Evidence |
|---|---|---|
| `public_web_page_discovered` | DISCOVERED | Page captured in Common Crawl corpus; no competitor claim |
| `competitor_candidate` | CANDIDATE | Domain has competitor-like indicators, but no explicit proof |
| `verified_competitor` | VERIFIED | Domain in explicit competitor set/list |
| `BLOCKED` | BLOCKED | Live Common Crawl access NOT PROVEN; fixture-verified design only |

---

## 7. Compatibility Verification

| Metric | Before Step 12 | After Step 12 | Equivalence |
|---|---|---|---|
| Scoring algorithm | unchanged | unchanged | **Equivalent** |
| Intent classification | unchanged | unchanged | **Equivalent** |
| Clustering | unchanged | unchanged | **Equivalent** |
| Destination mapping | unchanged | unchanged | **Equivalent** |
| Baseline behavior | unchanged | unchanged | **Equivalent** |
| Internal search boost | unchanged | unchanged | **Equivalent** |
| Manual import semantics | unchanged | unchanged | **Equivalent** |

---

## 8. Decisions / Approval Before Step 13

1. **Common Crawl adapter `BLOCKED`** — live access NOT PROVEN; fixture-verified design only.
2. **No live network requests** — all tests use fixtures; no `Common Crawl` API calls executed.
3. **No competitor verification** — `classifyCompetratorCandidate` is conservative; only `verified_competitor` with explicit competitor set.
4. **Market remains undefined** — no guessing from domain/language; `market: undefined` unless proven.
5. **No pipeline changes** — existing SEO pipeline entirely untouched.
6. **No Step 13 automatic** — await explicit approval before any further provider activation or pipeline change.

---

**STOP — Awaiting explicit approval before Step 13 (any production execution, GSC activation, additional provider, or pipeline change).**