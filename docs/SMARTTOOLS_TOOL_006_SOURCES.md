# Tool 006 — Estradiol & Prolactin Record: Evidence and Limits

**Review date:** 2026-10-27  
**Identity and route:** `tool-006-estrogen-prolactin` and its existing route are unchanged.  
**Evidence status:** no external source is claimed to validate the former risk rules or medication doses.

## Disposition

The previous engine assigned aromatization scores, applied fixed estradiol and prolactin thresholds, and produced aromatase-inhibitor and dopamine-agonist dose suggestions. No source-to-claim evidence was present in the checkout for those rules. They have been removed. The engine now always returns `NOT_ASSESSED`, with null risk/dose fields and no generated findings.

The tool is now a temporary page-session record for user-entered laboratory values and their displayed units. It does not convert units, compare values with reference ranges, infer a diagnosis, calculate risk, or recommend treatment. The selected units are preserved exactly as entered. Values are held only in React page state; there is no local storage, user-state persistence, Supabase request, or cross-tool sharing.

## Source boundary

No clinical source is used by this implementation because it makes no clinical interpretation. External guidance would be required before adding any reference interval, risk category, unit conversion that depends on an assay, diagnosis, or medication recommendation. A laboratory's own reference interval and assay information are not embedded in the tool.

## Verification

`lib/tools/engines/tool-006-estrogen-prolactin.test.ts` verifies that extreme input values do not change the `NOT_ASSESSED` result, that dose/risk fields remain unavailable, and that invalid numeric values and units fail schema validation.
