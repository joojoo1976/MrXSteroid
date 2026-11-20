# Tool 041 — Evidence Refresh at P-03 `37f047a4` (2026-11-18)

**Recorded result (unchanged):** `76/132 = 57.58%` — from `tool-041-requirements.csv`.
**Purpose:** confirm the Tool 041 evidence still reproduces at the P-03 commit, without reusing the old generic `92/92` report.

## What was run (clean export `E:\p03-clean-build-20261118`)

| Suite | Tests | Result |
|---|---:|---|
| `lib/tools/engines/tool-041-hematocrit-monitor.test.ts` | — | PASS |
| `lib/tools/r6/tool-041-hematocrit-monitor-contract.test.ts` | — | PASS |
| `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.test.ts` | — | PASS |
| `components/tools/tool-041-hematocrit-monitor.test.tsx` | — | PASS |
| `components/tools/tool-041-060-header-preferences.test.tsx` | — | PASS (after the 051 heading fix below) |
| `lib/tools/adapters/tool-041-045-batch.test.ts` | — | PASS |
| `tests/unit/tool-041-i18n-evidence.test.ts` | — | PASS |
| **Total** | **73** | **73/73 PASS, exit 0** |

JSON report: `ledger-evidence/tool-041-tests.json` (in the clean export).

## Two test-proven findings

1. **Tool 051 Arabic heading mismatch.**
   `components/tools/tool-041-060-header-preferences.test.tsx` failed at HEAD: Tool 051 rendered `حاسبة جرعة الببتيد`, while the canonical name in the spec, registry and V7 catalogue is `حاسبة جرعة الببتيدات`.
   Fix: `i18n/tool-051-peptide-dosage-calculator.json` → `ar.tool_name` corrected to the canonical plural form.
   After the fix: header test **20/20 PASS**, `tool-051-i18n-check.mjs` still `I18N_PARITY: OK`, and the clean-export Tool 041 suite **73/73 PASS**.
   A fresh clean-export build after the fix also passed: **EXITCODE=0, 506/506 static pages** (`evidence-clean-build-2026-11-18/next-build-after-051-i18n-fix.out`).
   The fix is **uncommitted** (working tree + clean-export snapshot) and needs a scoped commit approval.

2. **Untracked acceptance-evidence test.**
   6 of the 76 PASS rows (`PIPE-01`, `PRIV-01…04`, `TEST-04`) cite `tests/unit/tool-041-acceptance-evidence.test.ts`, which is **untracked** and therefore absent from a clean clone.
   Those 6 rows remain valid working-tree evidence but are not clean-clone E3 until the file is committed. The other 70 PASS rows are reproducible from tracked files.

## Status

- Percentage preserved at **76/132 = 57.58%**; no row was promoted by this refresh.
- Remaining blockers are the same: browser evidence (`NOT_RUN`), D-C4 / D-C5 / D-CLIN, W18.
- No self-approval; no clinical wording was changed.
