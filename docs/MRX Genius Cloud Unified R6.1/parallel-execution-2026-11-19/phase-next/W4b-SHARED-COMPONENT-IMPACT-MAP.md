# W4b — Shared Component Dependency & Change Impact Map (phase-next)

| Field | Value |
|---|---|
| Baseline HEAD | `37f047a4105d078b22edea2c857bf35aefdbdc7f` |
| Authoritative source | `lib/tools/r6/manifest.ts` → `R6_EXEMPT_SLUGS` (read 2026-11-19) |
| Mode | Read-only analysis. No shared file may be modified under this phase. |

## 1. Ownership split (verified from R6_EXEMPT_SLUGS)

| Group | Tools (in scope) | CORE-5 / GENIUS-12 rendering |
|---|---|---|
| **Tool-owned boxes (exempt)** | `040,041,042,045,046,047,048,049,050,051` (10) | Each tool renders its own boxes in `components/tools/tool-XXX.genius.tsx`; no shared box shell |
| **Shared shell (non-exempt)** | `006,008,014,015,016,017,022,023,025,026,027,029,031,034,035,037,038,043,044` (19) | `components/tools/r6/R6ToolShell.tsx` renders CORE-5 boxes 2/3/7/9/12 and the 12-box GENIUS section from `lib/tools/r6/boxes.ts` |
| **Reference only** | `039` (exempt, not counted) | Own boxes; benchmark baseline |

## 2. Shared components and blast radius

| Shared file | Consumed by | Change impact if modified |
|---|---|---|
| `components/tools/r6/R6ToolShell.tsx` | all **19** non-exempt tools + dynamic route | **HIGH** — any change touches 19 tools simultaneously. Requires full Change Impact Matrix + explicit scoped authorization before any edit. Slider/tooltip/a11y/RTL behavior lives here. |
| `lib/tools/r6/boxes.ts` | shared shell → all **19** non-exempt tools | **HIGH** — CORE-5/GENIUS-12 box content/order changes affect 19 tools. |
| `lib/tools/r6/manifest.ts` (`R6_EXEMPT_SLUGS`) | all tools via manifest | **CRITICAL** — changing exemption membership changes which shell renders for the affected tool(s) and can duplicate or drop boxes. No change authorized. |
| `lib/tools/registry.ts` | all tools, routes, cross-tool links | **CRITICAL** — canonical slugs/routes/links. No change authorized. |
| `app/smarttools/[category]/[tool]/page.tsx` | all 29 (canonical index route) | **HIGH** — breadcrumb, R6Progress, prev/next. |
| `lib/tools/r6/p03-*.test.ts` (structural gate committed; runtime-negative/control uncommitted/NOT_RUN in true-clean) | pipeline layer, all tools | **CRITICAL / approval-gated** — P-03 shared change requires tech-lead/owner approval; `p03-runtime-negative-coverage.test.ts` and `__p03-control.test.ts` are WT-only and must be preserved/inspected, never deleted. |
| `i18n/tool-XXX.json` | per tool | **LOW/LOCAL** — tool-owned; 051 Arabic fix is separate and scoped. |

## 3. Per-tool locality rule for implementation

- A change confined to `lib/tools/engines/tool-XXX*`, `lib/tools/r6/tool-XXX-*`, `lib/tools/schemas/tool-XXX.ts`, `components/tools/tool-XXX*`, `i18n/tool-XXX.json` is **local** to one tool → sequential single-tool implementation permitted after its audit.
- Any change to a file in §2 rows marked HIGH/CRITICAL is **shared** → requires (a) Change Impact Matrix listing every affected tool, (b) explicit scoped authorization, (c) regression across all affected tools. Not authorized in this phase.
- Two tools sharing a central file must never be modified concurrently.

## 4. Consequences for first-tool selection

1. Prefer a tool whose genuine gaps are **tool-local** (no shared-component edit), so it can be closed without a cross-team change.
2. Tool-owned-boxes tools (040–042, 045–051) avoid the 19-tool shared shell — smaller blast radius — but 041/042 carry owner-decision freezes and 045–051 carry external D-C4/C5/CLIN gates.
3. Shared-shell tools (the 19) can still be closed locally if their gaps are engine/contract/test/i18n only; do **not** touch `R6ToolShell.tsx`/`boxes.ts` to "match Tool 039".
4. `P03-PIPELINE` is shared and approval-gated for all 29 — it cannot be used to justify blocking an otherwise locally-closable tool, but it must remain recorded as unresolved until approved.

**Integrity:** no file outside this report directory was changed. No shared component was edited. Observed on-disk SHA-256 of this file is authoritative.
