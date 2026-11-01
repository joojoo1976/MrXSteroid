# SmartTools Batch Evidence Index

| Range | Report | State |
|---|---|---|
| 151–155 | [batch report](SMARTTOOLS_BATCH_151_155_REPORT.md) | Implemented and verified |
| 156–160 | [batch report](SMARTTOOLS_BATCH_156_160_REPORT.md) | Implemented and verified |
| 161–165 | [batch report](SMARTTOOLS_BATCH_161_165_REPORT.md) | Implemented and verified |
| 166–170 | [batch report](SMARTTOOLS_BATCH_166_170_REPORT.md) | Implemented and verified |
| 171–175 | [batch report](SMARTTOOLS_BATCH_171_175_REPORT.md) | Implemented and verified |
| 176–180 | [batch report](SMARTTOOLS_BATCH_176_180_REPORT.md) | Implemented and verified |
| 181–185 | [batch report](SMARTTOOLS_BATCH_181_185_REPORT.md) | Implemented and verified |
| 186–190 | [batch report](SMARTTOOLS_BATCH_186_190_REPORT.md) | Implemented and verified |
| 191–195 | [batch report](SMARTTOOLS_BATCH_191_195_REPORT.md) | Implemented and verified |
| 196–200 | [batch report](SMARTTOOLS_BATCH_196_200_REPORT.md) | Implemented and verified |
| 201–205 | [batch report](SMARTTOOLS_BATCH_201_205_REPORT.md) | Implemented and verified |
| 206–210 | [batch report](SMARTTOOLS_BATCH_206_210_REPORT.md) | Implemented and verified |
| 211–215 | [batch report](SMARTTOOLS_BATCH_211_215_REPORT.md) | Implemented and verified |
| 216–220 | [batch report](SMARTTOOLS_BATCH_216_220_REPORT.md) | Implemented and verified |
| 221–225 | [batch report](SMARTTOOLS_BATCH_221_225_REPORT.md) | Implemented and verified |
| 226–230 | [batch report](SMARTTOOLS_BATCH_226_230_REPORT.md) | Implemented and verified |
| 231–235 | [batch report](SMARTTOOLS_BATCH_231_235_REPORT.md) | Implemented and verified |
| 236–240 | [batch report](SMARTTOOLS_BATCH_236_240_REPORT.md) | Audited, implemented and verified |
| 241–245 | [batch report](SMARTTOOLS_BATCH_241_245_REPORT.md) | Audited and verified |
| 246–252 | [batch report](SMARTTOOLS_BATCH_246_252_REPORT.md) | Implemented and verified |

## Related audits

- [Final catalog audit](SMARTTOOLS_FINAL_CATALOG_AUDIT.md)
- [Planned tools 132, 137–139 scope review](SMARTTOOLS_PLANNED_132_137_139_SCOPE_REVIEW.md)

The index does not imply final release readiness. Browser/accessibility review, runtime Supabase/profile verification, and unrelated checkout/payment failures remain separate gates.

## Current verification checkpoint — 2026-10-27

- Published catalog audit: **264** unique tool IDs/slugs/hrefs; 0 missing component, engine, or schema files; 0 malformed SmartTools routes.
- SmartTools index/category focused regression: **12 files / 30 tests PASS**.
- Tools 145–150 focused regression: **11 files / 69 tests PASS**.
- `npm run validate-tools`: **5/5 PASS**; `npx tsc --noEmit`: **PASS**.
- `npm run build`: **PASS**, Next.js production build compiled and generated **502/502 static pages**. Build emitted existing stale Browserslist-data and missing `metadataBase` warnings.
- Build manifest audit: `/smarttools/page`, `/smarttools/[category]/page`, `/smarttools/[category]/[tool]/page`, and `/api/smarttools/tool-147/route` are present in `.next/server/app-paths-manifest.json` (282 total route entries).
- Full repository suite: **4760 passed, 16 failed, 5 skipped**; remaining failures are checkout/payment/admin contracts and are outside these SmartTools batches.
- Tool 151 bilingual/accessibility follow-up: **2 files / 8 tests PASS**, TypeScript and scoped ESLint PASS; latest production build generated **502/502 pages**. Details: [151–155 batch report](SMARTTOOLS_BATCH_151_155_REPORT.md).
- Tools 152–155 session-only record UX/header-preference follow-up: **2 files / 10 tests PASS**, TypeScript, scoped ESLint, `validate-tools` pass; production build **502/502 pages**. No data persistence was added; the UI now discloses page-session-only records.
- Tools 156–160 bilingual UI/global unit-preference follow-up: **2 files / 10 tests PASS**, TypeScript, scoped ESLint, `validate-tools` pass; production build **502/502 pages**. Canonical values are retained for kg/lb, mL/fl oz and cm/in conversions.
- Tools 161–165 bilingual session-record UI follow-up: **2 files / 10 tests PASS**, TypeScript, scoped ESLint, `validate-tools` pass; production build **502/502 pages**. The UI explicitly distinguishes current-page records from persistent storage.
- Tools 166–170 bilingual/input-contract UI follow-up: **3 files / 17 tests PASS**, TypeScript, scoped ESLint, `validate-tools` pass; production build **502/502 pages**. Tool 169 metadata now explicitly says signals are user-written and selected, with no curated medical warning rules.
- Tool 249 API boundary follow-up: **4 files / 30 tests PASS**, `validate-tools` **5/5**, TypeScript, scoped ESLint, and production build **502/502 pages**. The endpoint now caps request bodies at 4096 bytes and preserves `Retry-After` for 429/503 responses. See [246–252 batch report](SMARTTOOLS_BATCH_246_252_REPORT.md).
- Tool 251 input/header-unit follow-up: **3 files / 18 tests PASS**, `validate-tools` **5/5**, TypeScript, scoped ESLint, and production build **502/502 pages**. Invalid CSV rates are no longer dropped silently; validation is visible, and weight/rate drafts follow the global metric/imperial preference. See [246–252 batch report](SMARTTOOLS_BATCH_246_252_REPORT.md).
- Published-tool header preference audit: all **264/264** catalog entries resolve to direct preference hooks or verified shared wrappers/re-exports; no in-tool language/unit selector was found in published tool components. This is static evidence only; browser and accessibility checks remain open. See [final catalog audit](SMARTTOOLS_FINAL_CATALOG_AUDIT.md).
- Source provenance inventory: generated a **264-row / 264-unique-ID** crosswalk; evidence classification leaves every source URL unverified and flags 198 tools with no numbered source document, 32 direct docs without URLs, and 15 range docs without URLs for content review. Explicit mappings cover legacy Tool #002 and Tool #006. See [source provenance crosswalk](SMARTTOOLS_SOURCE_PROVENANCE_CROSSWALK.csv) and [final catalog audit](SMARTTOOLS_FINAL_CATALOG_AUDIT.md).
