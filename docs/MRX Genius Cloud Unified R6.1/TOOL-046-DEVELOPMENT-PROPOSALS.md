# TOOL 046 — DEVELOPMENT PROPOSALS AND PHASE STATUS

**Tool:** Tool 046 — TRT Lifetime Calculator (`mrx.tool.046-trt-lifetime`)

**Status:** implemented and tested, **owner review pending** — NOT ACCEPTED, NOT CLOSED

**Engine / Schema / Adapter:** unchanged (frozen for this phase)

> These items are **not** part of any completion percentage. A proposal does not become a
> requirement by being listed here, and `PARTIAL` / `BLOCKED` / `NOT_AVAILABLE` is never counted
> as complete. Nothing in this file records an owner decision.

---

## Register

| ID | Item | Layer | State | Reason / evidence |
|---|---|---|---|---|
| `P-01` | Replace the tool's SPEC C1–C12 slot with the closure-layer CORE-5 | UI | **IMPLEMENTED** | `components/tools/tool-046-trt-lifetime.genius.tsx` renders C1–C5; component test asserts `data-r6-core` for C1, C2, C3, C4, C5 |
| `P-02` | Render all 12 GENIUS boxes in the fixed closure order, never hiding one | UI | **IMPLEMENTED** | Box order asserted `1…12`; box 11 present with `data-r6-box-source="not_available"` and the W18 reason |
| `P-03` | Enforce `TrtLifetimeResultSchema` on the engine result before the envelope | Pipeline | **NOT IMPLEMENTED** | The pipeline layer is shared with the Slice C pilot and is frozen for this phase; Tools 041, 042 and 045 carry the identical open item |
| `P-04` | Add schema-boundary tests for every input bound | Test | **IMPLEMENTED (test-only)** | `lib/tools/r6/tool-046-trt-lifetime-contract.test.ts` proves age 18/90, weekly 25/300, years 0/60, both costs, the method enum and the three horizons against `TrtLifetimeInputSchema`; no schema file was edited |
| `P-05` | Add a sourced cost/monitoring reference and provenance | Content | **BLOCKED** | No specialist-approved source exists in the repository. C4 renders `NOT_AVAILABLE — no approved source recorded`; `TOOL_046_SOURCES` is empty by design. The adapter's old "typical TRT cost bands" wording is deliberately not reused |
| `P-06` | Add referral wording, interpretation limits and a "not a diagnosis" sentence | Content | **PARTIAL (non-clinical only)** | The generic "not a prescription" line and "pending medical review" are live; the referral sentence stays `NOT_AVAILABLE — it requires specialist approval` |
| `P-07` | Review the monitoring cadence and the cost model clinically/financially | Content | **BLOCKED** | The engine behaviour is reproduced and pinned by tests, but no clinical or financial review of the rule itself exists; the UI presents it as the engine's documented arithmetic, not as guidance |
| `P-08` | Localize warnings, states, errors, age bands and cross-tool copy | i18n | **IMPLEMENTED** | 140 keys × 2 locales, parity and contamination checked by `tool-046-i18n-check.mjs`; no raw engine warning code is ever printed |
| `P-09` | Make EMPTY/PARTIAL real, add INVALID/DEGRADED, remove fabricated defaults | State | **IMPLEMENTED** | Five states asserted; every field starts empty; a typed `0` for years or cost is a real value; `DEGRADED` proven with a failing pipeline guard |
| `P-10` | Complete accessibility and run Arabic RTL at 390 px | A11y / Responsive | **PARTIAL** | Structural a11y is tested (labels, `aria-live`, `aria-invalid`, `aria-describedby`, rating group, no fixed width). A real 390 px RTL browser pass has **not** been run in this phase and is not claimed |

---

## Deliberate non-goals in this phase

- No engine, schema, adapter, registry or catalog edit.
- No new threshold, monitoring rule, dose, cost band or diagnosis; the engine's existing warnings
  are preserved verbatim and only mapped to localisation keys.
- No persistence: no draft, no dashboard snapshot, no session, no storage (W18 open).
- No database, Supabase, migration, RLS, Storage or Cloud Sync.
- No medical, owner or acceptance decision recorded by the developer.

---

## Honest summary

Implemented and proven by the focused battery: the R6 pipeline path, the five states, CORE-5, the
12-box order, the CSV export, AR/EN parity, and the "invent nothing" rules (no cost reference band,
no invented source, no clinical referral).

Still open and **not** counted as complete: a specialist-approved source (C4), the clinical
referral sentence (C5), a real 390 px Arabic RTL browser run, the result-schema enforcement item
(P-03), and the storage-dependent history box (W18).

Tool 046: **IMPLEMENTED — OWNER REVIEW PENDING — NOT ACCEPTED — NOT CLOSED.**
