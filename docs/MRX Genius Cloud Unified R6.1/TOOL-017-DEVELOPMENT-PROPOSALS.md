# TOOL 017 — DEVELOPMENT PROPOSALS AND PHASE STATUS

**Tool:** Tool 017 — Drug Interaction Checker (`mrx.tool.017-drug-interaction`)

**Status:** implemented and tested, **owner review pending** — NOT ACCEPTED, NOT CLOSED

**Engine / Schema / Adapter / R6 Pipeline:** unchanged (frozen for this phase)

---

## Register

| ID | Item | Layer | State | Reason / evidence |
|---|---|---|---|---|
| `P-01` | Closure-layer CORE-5 | UI | **IMPLEMENTED** | `tool-017-drug-interaction.genius.tsx` |
| `P-02` | All 12 GENIUS boxes in fixed order | UI | **IMPLEMENTED** | Box 11 `not_available` (W18) |
| `P-03` | Result schema enforcement in pipeline | Pipeline | **NOT IMPLEMENTED** | Pipeline frozen (Slice C) |
| `P-04` | Schema-boundary tests | Test | **PARTIAL** | Existing pipeline tests preserved |
| `P-05` | Verified interaction source and provenance | Content | **BLOCKED** | No verified maintained source configured; C4 `NOT_AVAILABLE` |
| `P-06` | Referral wording / not-a-diagnosis / no-safety-claim | Content | **PARTIAL** | No-safety-claim and general guidance links shown; referral/seek-care `NOT_AVAILABLE` pending specialist approval |
| `P-07` | Clinical model review | Content | **BLOCKED** | Engine fails closed by design |
| `P-08` | AR/EN localization and parity | i18n | **IMPLEMENTED** | `tool-017-i18n-check.mjs` |
| `P-09` | Five states, no fabricated defaults/safety claims | State | **IMPLEMENTED** | FULL shows honest engine NOT_AVAILABLE result |
| `P-10` | A11y and Arabic RTL at 390 px | A11y / Responsive | **PARTIAL** | Structural only; real 390 px RTL not run |

No engine, schema, adapter, pipeline, registry or catalog edit. No storage/DB. No invented interaction data.

Tool 017: **IMPLEMENTED — OWNER REVIEW PENDING — NOT ACCEPTED — NOT CLOSED.**
