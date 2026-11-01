# SmartTool 098 — Sodium-to-Potassium Ratio Calculator

Tool 098 preserves its numeric identity and nutrition category but is narrowed to one transparent operation: `sodium amount (mg) / potassium amount (mg)`. The result is a direct `CALCULATED` ratio from user-entered amounts.

It does not classify electrolyte balance, infer potassium deficiency, assess cardiovascular strain or blood pressure, account for aldosterone/AAS exposure, provide a dietary target, or issue clinical recommendations. Those claims require validated context and are outside this calculator.

Sodium is finite and non-negative; potassium is finite and strictly positive because it is the denominator. Unknown fields, NaN, Infinity, negative values, and division by zero are rejected by the strict Zod schema. Values are dietary amounts entered in milligrams; no serum electrolyte interpretation is performed.

The adapter marks the result as manually entered, with `confidence: null`, `dataQuality: not_assessed`, and no reference range. The ratio is not a medical measurement or recommendation. The UI displays these limits in Arabic and English and uses the shared header language preference; it creates no local language or unit controls.

## Current-checkout verification — 2026-10-26

| Check | Result |
|---|---|
| Tool 098 engine + 096–100 adapter tests | **PASS**, 2 files / 12 tests |
| `npx tsc --noEmit` | **PASS**, exit 0 |
| Scoped ESLint for Tool 098 source | **PASS**, exit 0 |
| `npm run validate-tools` | **PASS**, 5/5 tests |
| `npm run build` | **PASS**, 395/395 pages; existing Browserslist and `metadataBase` warnings remain |
| Local canonical route | **PASS**, HTTP 200 with the new title |
| Local flat route | **PASS**, HTTP 307 to the category-first route |

Browser accessibility, live dashboard/profile persistence, and live Supabase/RLS behavior remain **NOT VERIFIED**.
