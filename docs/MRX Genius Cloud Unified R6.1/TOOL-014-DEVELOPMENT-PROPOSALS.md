# TOOL 014 — DEVELOPMENT PROPOSALS AND PHASE STATUS

**Tool:** Tool 014 — Water Retention Tool (`mrx.tool.014-water-retention`)

**Status:** implemented and tested, **owner review pending** — NOT ACCEPTED, NOT CLOSED

**Engine / Schema / Adapter / R6 Pipeline:** unchanged (frozen for this phase)

---

## Register

| ID | Item | Layer | State | Reason / evidence |
|---|---|---|---|---|
| `P-01` | Closure-layer CORE-5 | UI | **IMPLEMENTED** | `tool-014-water-retention.genius.tsx` |
| `P-02` | All 12 GENIUS boxes in fixed order, never hiding one | UI | **IMPLEMENTED** | Box 11 `not_available` (W18) |
| `P-03` | Result schema enforcement in pipeline | Pipeline | **NOT IMPLEMENTED** | Pipeline frozen (Slice C) |
| `P-04` | Schema-boundary tests | Test | **PARTIAL** | Existing pipeline tests preserved; no user-input bounds |
| `P-05` | Sourced model/threshold and provenance | Content | **BLOCKED** | Engine returns `NOT_AVAILABLE/NO_VALIDATED_MODEL` by design; C4 `NOT_AVAILABLE` |
| `P-06` | Referral wording / interpretation limits / not-a-diagnosis | Content | **PARTIAL** | Generic "not a diagnosis" live; referral/seek-care `NOT_AVAILABLE` |
| `P-07` | Clinical model review | Content | **BLOCKED** | No validated model exists |
| `P-08` | AR/EN localization and parity | i18n | **IMPLEMENTED** | `tool-014-i18n-check.mjs` |
| `P-09` | Five states, no fabricated defaults | State | **IMPLEMENTED** | FULL shows honest engine NOT_AVAILABLE result; DEGRADED path covered |
| `P-10` | A11y and Arabic RTL at 390 px | A11y / Responsive | **PARTIAL** | Structural only; real 390 px RTL not run |

---

No engine, schema, adapter, pipeline, registry or catalog edit. No storage/DB. No invented model/thresholds.

Tool 014: **IMPLEMENTED — OWNER REVIEW PENDING — NOT ACCEPTED — NOT CLOSED.**
