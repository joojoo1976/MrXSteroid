# TOOL 037 — DEVELOPMENT PROPOSALS AND PHASE STATUS

**Tool:** Tool 037 — Side Effect Probability Calculator (`mrx.tool.037-side-effect-probability`)

**Status:** implemented and tested, **owner review pending** — NOT ACCEPTED, NOT CLOSED

**Engine / Schema / Adapter / R6 Pipeline:** unchanged (frozen for this phase)

---

## Register

| ID | Item | Layer | State | Reason / evidence |
|---|---|---|---|---|
| `P-01` | Closure-layer CORE-5 | UI | **IMPLEMENTED** | `tool-037-side-effect-probability.genius.tsx` |
| `P-02` | All 12 GENIUS boxes in fixed order | UI | **IMPLEMENTED** | Box 11 `not_available` (W18) |
| `P-03` | Result schema enforcement in pipeline | Pipeline | **NOT IMPLEMENTED** | Pipeline frozen (Slice C) |
| `P-04` | Schema-boundary tests | Test | **PARTIAL** | Existing pipeline tests preserved; bounds mirrored in contract |
| `P-05` | Sourced reference and provenance | Content | **BLOCKED** | Heuristic population-average model; C4 `NOT_AVAILABLE` |
| `P-06` | Referral wording / not-a-diagnosis | Content | **PARTIAL** | Generic "not a diagnosis/prescription" and heuristic note live; referral/seek-care `NOT_AVAILABLE` |
| `P-07` | Clinical model review | Content | **BLOCKED** | Engine behavior preserved as-is; UI presents as heuristic, never personal medical prediction |
| `P-08` | AR/EN localization and parity | i18n | **IMPLEMENTED** | `tool-037-i18n-check.mjs` |
| `P-09` | Five states, no fabricated defaults | State | **IMPLEMENTED** | EMPTY/PARTIAL/INVALID/FULL/DEGRADED implemented |
| `P-10` | A11y and Arabic RTL at 390 px | A11y / Responsive | **PARTIAL** | Structural only; real 390 px RTL not run |

No engine, schema, adapter, pipeline, registry or catalog edit. No storage/DB. No new clinical thresholds.

Tool 037: **IMPLEMENTED — OWNER REVIEW PENDING — NOT ACCEPTED — NOT CLOSED.**
