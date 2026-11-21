# W2 — Canonical Denominator Source Inventory (rounds 3–4 tools)

| Field | Value |
|---|---|
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` |
| Date | 2026-11-19 |
| Mode | Read-only inventory. No source file modified. |
| Purpose | Freeze which authoritative source supplies the canonical atomic denominator for each remaining audit, so the 18-row register is never mistaken for the official denominator. |

## 1. Finding: denominators are NOT uniform

The 18-row closure register is an **operational review grid only*. For many tools a richer authoritative denominator already exists on disk. Auditors must map original ID → canonical requirement from the richest authoritative source and explicitly reconcile it against the 18-row grid.

| Tool | Canonical denominator source (authoritative) | B3 review denominator (from BARRIER-2/3) | Secondary sources |
|---|---|---|---|
| `034` | `closure-sprint-2026-11-17/tool-034-closure-ledger.md/.csv` (18-row only) | 0/18 E3+ | `tool-034-i18n-check.mjs` |
| `035` | `closure-sprint-2026-11-17/tool-035-closure-ledger.md/.csv` (18-row only) | 0/18 E3+ | — |
| `037` | `closure-sprint-2026-11-17/tool-037-closure-ledger.md/.csv` (18-row only) | 0/18 E3+ | `tool-037-i18n-check.mjs` |
| `038` | `closure-sprint-2026-11-17/tool-038-closure-ledger.md/.csv` (18-row only) | 0/18 E3+ | `tool-038-i18n-check.mjs` |
| `040` | `tool-040-requirements.csv` + `tool-040-acceptance-calc.mjs` + `tool-040-acceptance.template.md` + `tool-040-ledger-change-log.md` + `tool-040-ledger-build.mjs` | 2/92 | browser evidence (`evidence/tool040-published/` + `evidence/tool040/`), `tool-040-browser-verify.mjs`, `tool-040-i18n-check.mjs`, closure ledger |
| `041` | `tool-041-requirements.csv` + `tool-041-acceptance-calc.mjs`/`.json` + `tool-041-acceptance.template.md` + `tool-041-ledger-change-log.md` + `tool-041-remediation-matrix.csv` + `tool-041-evidence-fingerprint-matrix.csv` + `tool-041-deliverable-manifest.json` + `tool-041-ledger-crosstab.*` | 70–76/132 | browser evidence (`evidence/tool041-published/` + `evidence/tool041/`), superseded v1-123 version set under `evidence/tool041-ledger-versions/v1-123-superseded/` (preserve; do NOT adopt), `tool-041-ledger-version-inventory.csv`, closure ledger. **Status: OWNER_REVIEW — NOT ACCEPTED — NOT CLOSED** |
| `042` | `closure-sprint-.../tool-042-closure-ledger.md/.csv` + `tool-042-atomic-ledger-2026-11-18.csv` + `tool-042-i18n-check.mjs` | 44/53 | **STOPPED — ORDER 580**; do not advance activation |
| `043` | `closure-sprint-.../tool-043-closure-ledger.md/.csv` (18-row only) | 0/18 E3+ (B2b) | — (note F draft typo `0043` → `043`) |
| `044` | `closure-sprint-.../tool-044-closure-ledger.md/.csv` (18-row only) | 0/18 E3+ (B2b) | — |
| `045` | `closure-sprint-.../tool-045-atomic-ledger-2026-11-18.md/.csv` + closure ledger | 59/68 | `tool-045-i18n-check.mjs` |
| `046` | `tool-046-atomic-ledger-2026-11-18.md/.csv` + closure ledger | 56/66 | `tool-046-i18n-check.mjs` |
| `047` | `tool-047-atomic-ledger-2026-11-18.md/.csv` + closure ledger | 59/68 | `tool-047-i18n-check.mjs` |
| `048` | `tool-048-atomic-ledger-2026-11-18.md/.csv` + closure ledger | 62/72 | `tool-048-i18n-check.mjs` |
| `049` | `tool-049-atomic-ledger-2026-11-18.md/.csv` + closure ledger | 61/71 | `tool-049-i18n-check.mjs` |
| `050` | `tool-050-atomic-ledger-2026-11-18.md/.csv` + closure ledger | 7/26 | `tool-050-i18n-check.mjs` — correct E2 misclassification without erasing history |
| `051` | `tool-051-atomic-ledger-2026-11-18.md/.csv` + closure ledger | 11/31 | `tool-051-i18n-check.mjs` — Arabic i18n fix is separate/scoped; correct E2 misclassification |

## 2. Rules for rounds 3–4 auditors

1. Verify observed SHA-256 of every source actually reused; embed it in the report header.
2. For 040/041: parse the requirement CSV and calculator **without running the calculator if it writes output** (read-only reconciliation). Record the calculator's own PASS logic and the recorded result, but do not overwrite acceptance files.
3. For 041: preserve the superseded v1-123 ledger and the owner-review freeze; do not treat any acceptance figure as owner-accepted.
4. For 045–051: the atomic ledger row count supersedes 18 for the canonical denominator; map each atomic row, preserving the historical E2 classifications as history while recording correct current levels.
5. For 042: STOPPED — audit only, no activation, no development tasks that imply restart.
6. For all: 18-row closure ledger ≠ official denominator; state relationship explicitly in Section B.

**Integrity:** inventory only; observed on-disk SHA-256 of this file is authoritative.
