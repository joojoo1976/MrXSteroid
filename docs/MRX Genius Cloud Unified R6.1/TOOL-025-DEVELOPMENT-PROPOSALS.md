# TOOL 025 — DEVELOPMENT PROPOSALS AND PHASE STATUS

**Tool:** Tool 025 — Medication & Compound Session List (`mrx.tool.025-drug-interaction-pro`)

**Status:** implemented and tested, **owner review pending** — NOT ACCEPTED, NOT CLOSED

**Engine / Schema / Adapter / R6 Pipeline:** unchanged (frozen for this phase)

---

## Register

| ID | Item | Layer | State | Reason / evidence |
|---|---|---|---|---|
| `P-01` | Closure-layer CORE-5 | UI | **IMPLEMENTED** | `tool-025-drug-interaction-pro.genius.tsx` |
| `P-02` | All 12 GENIUS boxes in fixed order | UI | **IMPLEMENTED** | Box 11 `not_available` (W18) |
| `P-03` | Result schema enforcement in pipeline | Pipeline | **NOT IMPLEMENTED** | Pipeline frozen (Slice C) |
| `P-04` | Schema-boundary tests | Test | **PARTIAL** | Existing pipeline/schema tests preserved |
| `P-05` | Verified interaction source and provenance | Content | **BLOCKED** | Interaction assessment is `NOT_AVAILABLE`; C4 `NOT_AVAILABLE` |
| `P-06` | Referral wording / not-a-diagnosis | Content | **PARTIAL** | Generic "not a diagnosis" live; referral/seek-care `NOT_AVAILABLE` |
| `P-07` | Clinical model review | Content | **BLOCKED** | No interaction model; session record only |
| `P-08` | AR/EN localization and parity | i18n | **IMPLEMENTED** | `tool-025-i18n-check.mjs` |
| `P-09` | Five states, no fabricated defaults | State | **IMPLEMENTED** | EMPTY/PARTIAL/INVALID/FULL/DEGRADED implemented |
| `P-10` | A11y and Arabic RTL at 390 px | A11y / Responsive | **PARTIAL** | Structural only; real 390 px RTL not run |

No engine, schema, adapter, pipeline, registry or catalog edit. No storage/DB. No interaction inference.

Tool 025: **IMPLEMENTED — OWNER REVIEW PENDING — NOT ACCEPTED — NOT CLOSED.**
