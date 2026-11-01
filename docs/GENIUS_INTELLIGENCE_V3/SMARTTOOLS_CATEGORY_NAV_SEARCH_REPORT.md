# SmartTools Category Navigation and Search — 2026-10-25

## Delivered behavior

- The registered categories appear at the top of the SmartTools index, ahead of the search field; published tools remain grouped beneath category headings.
- Each category card's main link has two gestures: one click scrolls to that category section in the same page, while a quick double-click opens the dedicated category route. Every card also includes a visible direct page link for one-click navigation.
- Tool links preserve the hierarchical form `/smarttools/{category}/{tool-slug}`. Category pages use `/smarttools/{category}`.
- Search runs immediately across bilingual tool names and descriptions, tool slug and ID, catalog chapter/topic metadata, and category names/descriptions. It normalizes case, whitespace, punctuation, and Arabic diacritics, requires all query terms to occur in indexed text, and groups matches under their categories.
- The index reads the shared language and RTL preferences and adds no tool-local language or measurement selector.

## Evidence and checks

| Check | Result |
|---|---|
| `npx vitest run components/smarttools/SmartToolsIndex.test.tsx lib/tools/categories.test.ts` | PASS: 2 files, 10 tests at the original implementation checkpoint. Covers category grouping and canonical paths, bilingual/RTL display, search by explanation/topic and Arabic category name, no-result state, one-click section jump, and double-click category navigation. |
| `npx tsc --noEmit` | PASS, exit 0. |
| `npx eslint components/smarttools/SmartToolsIndex.tsx components/smarttools/SmartToolsIndex.test.tsx` | PASS, 0 errors. The repository ESLint ignore rules skip the test file and emit one ignored-file warning. |
| `npm run validate-tools` | PASS, 5/5. |
| `npm run build` | PASS, exit 0; 385/385 static pages. Existing Browserslist and `metadataBase` warnings remain. |
| Production preview | `/smarttools` returned HTTP 200 and rendered 11 category jump links, 11 direct category-page links, and the search field after category navigation. `/smarttools/medical-monitoring` and its Tool 017 child route returned HTTP 200. The legacy flat Tool 017 route returned HTTP 308 to `/smarttools/medical-monitoring/tool-017-drug-interaction`. |

## Search boundary

This is a deterministic local text index, not an AI model or external semantic-search service. It covers published catalog text and topic metadata. It does not crawl each tool's complete component source, runtime-generated output, or every field label; the repository does not currently expose those strings through one unified catalog index.

## Change boundary

The feature touched SmartTools index/category page components and focused tests. No database operation, migration, staging, commit, push, or deployment was performed.

## Double-click timing follow-up — 2026-10-25

- Increased the category gesture window from 320 ms to 500 ms so the second click has a more forgiving interval before the first click scrolls the page. Single-click still scrolls in place; two clicks on the same category open its category page.
- Updated the single-click timer assertion to advance beyond the new window. `npx vitest run components/smarttools/SmartToolsIndex.test.tsx` passed: 1 file, 7 tests.
- This follow-up did not alter the search index: it still covers names, explanations, category names/descriptions, slug/ID, and chapter/topic metadata from the published catalog. The index does not crawl complete tool component source or runtime-generated text; see Search boundary above.

## Arabic query normalization follow-up — 2026-10-25

- Added normalization for Arabic alef forms (`أ`, `إ`, `آ`, `ٱ`), alef maksura (`ى`), and taa marbuta (`ة`) in addition to diacritics, tatweel, punctuation, whitespace, and case normalization.
- The bilingual search placeholder now explicitly names tool category search.
- Verification: `npx vitest run components/smarttools/SmartToolsIndex.test.tsx` — PASS, 1 file / 7 tests. The Arabic category query test now uses `المراقبه الطبيه` to find `المراقبة الطبية والسلامة`.
- This remains deterministic local catalog search. It does not infer semantic similarity, use an AI service, or search full component source/runtime output.

## Localized tool-copy search expansion — 2026-10-26

- The SmartTools index now adds string values from each tool's dedicated `i18n/*.json` resource to its searchable text, in addition to catalog names, descriptions, IDs, categories, and chapter/topic metadata. This allows search to find a tool from localized UI copy such as the Tool 111 label “Data Provenance” / “مصدر البيانات.”
- The loader accepts only lowercase slug characters before constructing a file path, supports both `<slug>.json` and `tool-<slug>.json`, strips a UTF-8 BOM, caches extracted text, and fails visibly on malformed present JSON instead of silently building an incomplete index. Missing translation files remain allowed for legacy tools.
- Dedicated i18n resources are present for 122 of the 166 catalog entries. The additional index therefore improves coverage but does not mean every visible string from every tool is searchable; strings embedded only in components, generated at runtime, or held outside those JSON resources remain outside the index.
- Regression coverage: `npx vitest run app/smarttools/page.test.tsx lib/tools/smartToolsI18nSearchIndex.test.ts components/smarttools/SmartToolsIndex.test.tsx tests/unit/smartToolsCatalog.test.ts --reporter=dot` — PASS, 4 files / 19 tests. The page-level test verifies English and Arabic UI-copy search finds Tool 111. Helper tests cover Arabic/English nested copy, missing resources, invalid slugs, and BOM parsing.
- `npx tsc --noEmit` — PASS, exit 0. `npx eslint app/smarttools/page.tsx lib/tools/smartToolsI18nSearchIndex.ts components/smarttools/SmartToolsIndex.tsx` — PASS, exit 0.
- Local production preview `http://127.0.0.1:3101/smarttools` — HTTP 200; rendered HTML contained both “Data Provenance” and “مصدر البيانات.” The production build had already passed after the runtime source change (395/395 pages); subsequent change was limited to the page integration test.
- Search remains deterministic full-text matching over indexed strings. It does not perform semantic inference or AI retrieval. No database operation, migration, staging, commit, push, or deployment was performed.
