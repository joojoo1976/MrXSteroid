# TOOL 041 - ACCEPTANCE MATRIX TEMPLATE (CURRENT)

**Status:** `OWNER_REVIEW` - NOT ACCEPTED - NOT CLOSED

**Tool:** Tool 041 - Hematocrit Monitor (`mrx.tool.041-hematocrit-monitor`)

**Use:** this template describes the current 138-row calculation. It is not an acceptance record.

---

## Required fields

| Field | Value |
|---|---|
| Ledger | `tool-041-requirements.csv` |
| Rows | 138 |
| Unique `req_id` | 138 |
| Applicable | 132 |
| `NOT_APPLICABLE` (reason + proof) | 6 |
| `B=PASS` and `E>=E3` | 76 |
| Completion | `76 / 132 = 57.58%` |
| Ledger SHA-256 | `ed1e330faf571789872a8456e1caac723458912eecee8136263bc1076296450d` |
| Calculator | `tool-041-acceptance-calc.mjs` |
| Calculator JSON | `tool-041-acceptance-calc.json` |
| Cross-tabulation | `tool-041-ledger-crosstab.md` / `.csv` / `.json` |
| Owner decision | `PENDING` (132) / `NOT_DECISIONED` (6) |
| Tool 042 | STOPPED |

## Mandatory statements

1. Completion = `(applicable rows with B=PASS and E>=E3) / applicable rows x 100`.
2. `NOT_AVAILABLE` stays in the denominator and is not PASS.
3. `NOT_APPLICABLE` is excluded only with a specific reason and its own proof.
4. `PARTIAL`, `FAIL`, `BLOCKED` and `NOT_RUN` are never completion.
5. `E4` is evidence, not acceptance.
6. The developer never fills C. Only the owner decides.
7. No row may be marked `C=APPROVED` without a recorded owner decision.
8. Tool 041 remains `OWNER_REVIEW` until an explicit independent acceptance decision.
9. Tool 042 remains stopped.

## Required sections

- Identity and route
- Ledger fingerprint
- Completion calculation
- State distribution (B, E, C)
- `applicability x B x E` cross-tabulation
- Family distribution
- Evidence inventory
- Preview linkage and drift disclosure
- Proven / not proven
- Owner decisions required

## Prohibited content

- Any `OWNER_ACCEPTED` claim without a recorded owner decision.
- Any Tool 040 label or `mrx.tool.040-hematocrit-monitor` ID.
- Any mixing of the old 123-row figures with the current 138-row figures.
- Any claim that local working-tree code is part of Git HEAD.
- Any claim that this template constitutes acceptance.
