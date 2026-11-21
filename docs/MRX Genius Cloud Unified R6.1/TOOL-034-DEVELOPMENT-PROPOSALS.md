# TOOL 034 — DEVELOPMENT PROPOSALS AND PHASE STATUS

**Tool:** Tool 034 — Compound Clearance Calculator (`mrx.tool.034-compound-clearance`)

**Status:** implemented and tested, **owner review pending** — NOT ACCEPTED, NOT CLOSED

**Engine / Schema / Adapter:** unchanged (frozen for this phase)

---

## Register

| ID | Item | Layer | State | Reason / evidence |
|---|---|---|---|---|
| `P-01` | Replace the tool's SPEC C1–C12 slot with the closure-layer CORE-5 | UI | **IMPLEMENTED** | `components/tools/tool-034-compound-clearance.genius.tsx` renders C1–C5 |
| `P-02` | Render all 12 GENIUS boxes in the fixed closure order, never hiding one | UI | **IMPLEMENTED** | Box order `1…12`; box 11 present with `data-r6-box-source="not_available"` and the W18 reason |
| `P-03` | Enforce `ClearanceResultSchema` on the engine result before the envelope | Pipeline | **NOT IMPLEMENTED** | The pipeline layer is shared with the Slice C pilot and is frozen for this phase |
| `P-04` | Add schema-boundary tests for every input bound | Test | **IMPLEMENTED (test-only)** | Bounds mirrored in contract |
| `P-05` | Add a sourced clearance reference and provenance | Content | **BLOCKED** | No specialist-approved source exists. C4 renders `NOT_AVAILABLE` |
| `P-06` | Add referral wording, interpretation limits and a "not a diagnosis" sentence | Content | **PARTIAL (non-clinical only)** | Generic "not a prescription / not a diagnosis" live; referral and seek-care stay `NOT_AVAILABLE` |
| `P-07` | Review the clearance model clinically | Content | **BLOCKED** | Engine behaviour reproduced and pinned by tests; UI presents as calculation aid, never a medical clearance or safety standard |
| `P-08` | Localize states, errors and cross-tool copy | i18n | **IMPLEMENTED** | 116 keys × 2 locales, parity and contamination checked by `tool-034-i18n-check.mjs` |
| `P-09` | Make EMPTY/PARTIAL real, add INVALID/DEGRADED, remove fabricated defaults | State | **IMPLEMENTED** | Five states asserted; every field starts empty; `DEGRADED` proven with a failing pipeline guard |
| `P-10` | Complete accessibility and run Arabic RTL at 390 px | A11y / Responsive | **PARTIAL** | Structural a11y tested. Real 390 px RTL browser pass not run |

---

## Deliberate non-goals in this phase

- No engine, schema, adapter, registry or catalog edit.
- No new clearance threshold or clinical recommendation.
- No persistence: no draft, no dashboard snapshot, no session, no storage (W18 open).
- No database, Supabase, migration, RLS, Storage or Cloud Sync.

---

## Honest summary

Implemented and proven by the focused battery: the R6 pipeline path, the five states, CORE-5, the
12-box order, the CSV export, AR/EN parity, and the "invent nothing" rules.

Tool 034: **IMPLEMENTED — OWNER REVIEW PENDING — NOT ACCEPTED — NOT CLOSED.**
