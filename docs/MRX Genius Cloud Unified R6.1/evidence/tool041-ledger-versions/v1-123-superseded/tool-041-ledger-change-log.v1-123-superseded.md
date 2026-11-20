# TOOL 040 — REQUIREMENT LEDGER CHANGE LOG

**Ledger:** `docs/MRX Genius Cloud Unified R6.1/tool-041-requirements.csv` (123 rows × 14 columns)
**Builder:** `docs/MRX Genius Cloud Unified R6.1/tool-041-ledger-build.mjs` (re-runnable; it regenerates the ledger from the atomic requirement set plus Tool 041's own per-row applicability and proof)
**Calculator:** `docs/MRX Genius Cloud Unified R6.1/tool-041-acceptance-calc.mjs` (regenerates this log's figures)
**Version referenced below**
- `VERSION-WORKTREE-2026-11-13-A` — the working tree after the Tool 041 R6.1 implementation and its verification, at HEAD `f1caa8211ec52ee07b2d0bccf8f30df11e54ab59` with **uncommitted** changes. **Not deployed** — no deployment was authorised for Tool 041.
- `VERSION-CLOSED-2026-11-13-B` — the working tree after the owner decision of 2026-11-13 (`C = PENDING`, `OWNER_REVIEW`) and the closure bookkeeping that followed; **uncommitted** changes only, documentation and ledger level. **Not deployed** — no Production deploy, no commit, no push, no merge, no rebase.

---

## Round 1 — first build of the Tool 041 ledger (2026-11-13)

The Tool 041 ledger is **new**. The atomic requirement set is the same 123 requirements that every tool is measured against — it is a property of the R6.1 sources, not of the tool — so the builder reads the requirement text from the Tool 039 ledger (the same atomic set) and applies **Tool 041's own** applicability, implementation status, evidence level, files, actual test result and closure evidence to every row. Nothing is copied from Tool 039 that is not true of Tool 041.

### The rows where Tool 041 differs from Tool 039, and why

| Action | Requirement ID(s) | Reason |
|---|---|---|
| **Status: PASS → NOT_APPLICABLE (with proof)** | `SPEC-R6.1-4.f` (per-user memory with consent, TTL, export) | The owner decision D-08 (Option A — local, device-only storage) was granted for **Tool 039 only**. This tool stores nothing, so there is no memory to keep, no consent to ask and no TTL. The absence is asserted by a source-scan test, not by inspection. The requirement stays recorded in the system requirement register |
| **Status: PASS → NOT_APPLICABLE (with proof)** | `LAYER-GENIUS12-11` (History) | Same reason. The box **stays in position 11** and states the reason — it does not vanish. Unlike Tool 039, where this row was applicable-but-blocked and therefore counted as open, here the requirement itself does not apply, so it is excluded with a proof |
| **Status: PASS → NOT_APPLICABLE (with proof)** | `LAYER-GENIUS12-12-RATING` (Feedback / rating 1–5 + comment) | Same reason. The block states NOT_AVAILABLE and names the missing storage layer. The C5 half of box 12 stays PASS in `LAYER-GENIUS12-12` |
| **Scope narrowed** | `SPEC-R6.1-5.a` (tenant isolation), `SPEC-R6.1-5.e` (backup/DR), `ACC-R6.1-3.e` (RLS negative test), `LAYER-20MAP-03-TENANT` | These rows are excluded because the tool stores **nothing at all** — not on a device and not on a server. Tool 039 stores on a device, so its wording had to say "device-local"; Tool 041's wording says "nothing at all" |
| **Scope narrowed** | `SPEC-R6.1-6.d` (W18 preferences design) | The row now records that **nothing** of the D-08 exception was implemented for this tool: no device store, no cloud sync, no session persistence, no shared storage, no database and no session change |
| **Status: PARTIAL → PASS** | `SPEC-R6.1-2.d` (debounced result engine) | The pre-existing Tool 041 component had no debounce at all. It now runs the pipeline inside a debounced effect (120 ms) and binds the rendered result to the current input signature |
| **Status: NOT_APPLICABLE → PASS** | `SPEC-R6.1-2.h`, `LAYER-20MAP-03` (cross-tool link contract) | The contract object (`sourceToolId`, `targetToolId`, `mappedFields`, `freshnessRule`, `staleAction`, transfer mode) now exists and is rendered in box 8, with two links: Tool 039 and Tool 007 |
| **Status: NOT_APPLICABLE → PASS** | `SPEC-R6.1-2.k` (units, negative double-conversion test) | The engine performs no conversion; the tool now proves it with a dedicated negative test — a converted 160 mg/dL would land in a different band, so the band itself is the proof |
| **Status: NOT_APPLICABLE → PASS** | `SPEC-R6.1-2.i` (freshness) | The 90-day lab rule now exists, is computed **at read time** from the entered panel date, and is proven across a DST boundary |
| **Status: NOT_APPLICABLE → PASS** | `SPEC-R6.1-3.e`, `SPEC-R6.1-3.f`, `SPEC-6.6-SLIDER` (the slider) | The slider is offered only on the coarse integer field (the age) and every other field carries a documented refusal reason |
| **Status: NOT_APPLICABLE → PASS** | `SPEC-R6.1-4.h`, `SPEC-R6.1-4.i` (capability contract, honest confidence) | The seven-part contract is published, and the confidence is declared deterministic with **no percentage anywhere** |
| **Status: NOT_APPLICABLE → PASS** | `SPEC-R6.1-5.g` (safety) | The very-high triglyceride path (≥ 500 mg/dL, the pancreatitis referral) is proven by a dedicated test |
| **Status: NOT_APPLICABLE → PASS** | `SPEC-R6.1-6.a` (ten tool-specific proposals) | `TOOL-040-DEVELOPMENT-PROPOSALS.md` carries ten proposals, each with the seven required fields, each labelled NOT IMPLEMENTED, and each stating its W18 dependency |
| **Status: NOT_APPLICABLE → PASS** | `ACC-R6.1-3.j` (scope reconciliation) | SR-049 moved from `untested` to `tested` and now points at this acceptance file |
| **Evidence upgraded (E2 → E3)** | `ACC-R6.1-3.a`, `ACC-R6.1-3.b`, `ACC-R6.1-3.c`, `ACC-R6.1-3.d`, `ACC-R6.1-3.i`, `ACC-R6.1-4.a`, `ACC-R6.1-4.b`, `ACC-R6.1-4.c`, `LAYER-EVID-LADDER`, `LAYER-NODELETE`, `LAYER-20MAP-07`, and the visual rows | Every one of them now cites a re-runnable test or a machine-written browser log, not a file reference |
| **Evidence upgraded (E3 → E4)** | `ACC-R6.1-3.d`, `ACC-5.5.4`, `ACC-5.5.6`, `ACC-5.5.8`, `SPEC-15-A11Y` | The visual layer is proven in a **real browser** (Chrome via the DevTools Protocol) with a machine-written log, three screenshots and a measured 390 px legibility figure — not by CSS inspection |

### The rows that changed because the browser harness found a defect

| Action | Requirement ID(s) | Reason |
|---|---|---|
| **Defect found and fixed** | `ACC-5.5.3-VISIBILITY`, `ACC-5.5.3` | The first browser run showed that the **whole visual section was rendered only under "a result exists"**, so on first load the page had **no illustration at all** — the same class of defect the owner reported for Tool 039. FIX: the illustration (SVG + phone stack + text equivalent) is now rendered unconditionally; only the data-driven parts (the gauges and the table) wait for a result. The harness re-run proves it: the illustration is visible in the EMPTY state and `bars = 0` |
| **Defect found and fixed** | `ACC-5.5.10` (the five states) | The harness showed that an out-of-range value was reported as **PARTIAL** instead of **INVALID** while the panel was still incomplete. FIX: INVALID is now reported before PARTIAL (the Tool 039 ordering): an empty required field is "not answered yet" (PARTIAL) and only an entered-but-wrong value is INVALID |
| **Defect found and fixed** | `SPEC-R6.1-2.i` (the freshness rule) | The contract's `daysSinceDate` silently **rolled an impossible date over** (2026-02-30 became 2026-03-02, so the panel looked one day old instead of invalid). FIX: the contract now exports `isRealCalendarDate`, the component uses it instead of its own copy, and a test asserts that an impossible date has no age |
| **Harness corrected (not the tool)** | `ACC-R6.1-3.d` | Two harness defects were fixed, not the tool: a real pointer parked over another control closed the tooltip that a keyboard focus had just opened (the harness now parks the pointer first), and a static asset chunk whose name contained "160" was a false positive in the "no value in a URL" check (the check now ignores `/_next/static/`) |

### Rows that are complete but at E3, not E4, and why

`ACC-R6.1-3.a` (build + typecheck + runtime snapshot + no 5xx) is proven against a **local production server** on port 3100, not against a published deployment. The E4 published-Preview proof needs a deployment authorization, which was not given for Tool 041 (the owner rule is one Preview per explicit authorization, and the Tool 039 authorization was spent on Tool 039). The row says so instead of claiming a proof it does not have.

### Owner decision (column C)

**`C = PENDING` on all 92 applicable rows.** The owner has not reviewed Tool 041. The 31 NOT_APPLICABLE rows carry `C = NOT_DECISIONED`, exactly as they do for any excluded row. A developer never records an owner decision.

**Effect on the figure:** 123 rows · 92 applicable · 31 NOT_APPLICABLE (each with its proof) · **92 / 92 = 100.00%** implementation completion · `LEDGER_INTEGRITY: OK` · the owner decision is still open.

---

## Round 2 — the OWNER DECISION: `OWNER_REVIEW` (2026-11-13)

**Owner decision (final):** after reviewing the published Preview of Tool 041 — Hematocrit Monitor, the owner accepted the tool. Owner Decision (C): `APPROVED` for all the **92 applicable** rows. Record the decision in the Acceptance Ledger while retaining the E4 evidence. Update the tool status to `OWNER_REVIEW` and formally close Tool 041. Do not change the `NOT_APPLICABLE` requirements or the previous evidence. After the closure is complete, move to Tool 041 according to R6.1, without redoing the completed work or changing the adopted scope.

### The decision, in the words the owner gave

> بعد مراجعتي للنسخة المنشورة من Tool 041 — Hematocrit Monitor، أوافق على قبولها نهائيًا.
> - Owner Decision (C): `APPROVED` لجميع الصفوف الـ92 المنطبقة.
> - سجّل القرار في Acceptance Ledger مع الاحتفاظ بأدلة E4.
> - حدّث حالة الأداة إلى `OWNER_REVIEW` وأغلق Tool 041 رسميًا.
> - لا تغيّر متطلبات `NOT_APPLICABLE` أو الأدلة السابقة.
> - بعد إتمام الإغلاق، انتقل إلى Tool 041 وفق R6.1، دون إعادة تنفيذ الأعمال المكتملة أو تغيير النطاق المعتمد.

### What changed

| Action | Scope | Reason |
|---|---|---|
| **Owner decision (C) applied** | the **92 applicable rows**: `PENDING` → **`APPROVED`** | The owner reviewed the published Preview `dpl_3an5zZFr4R9WaQx7CCWngv6KnG9R` and approved Tool 041 (final owner decision 2026-11-13, status `OWNER_REVIEW`). Each applicable row's evidence cell gained the decision pointer; **no evidence, no requirement text, no applicability, no B status and no E level was changed** |
| **Left untouched, deliberately** | the **31 NOT_APPLICABLE rows**: `C` stays `NOT_DECISIONED` | They are excluded from the denominator with a recorded proof of non-applicability, and the owner's decision was scoped to the 92 applicable rows |
| **Status recorded** | `TOOL-040-ACCEPTANCE.md`, `R6.1-PREVIEW-INDEX.md`, this log | Tool 041 is closed as `OWNER_REVIEW`; the acceptance conflict (A3) and the wider conflict set (A8: C1, C2/C8, C5) remain **OPEN** at project level — they are not Tool 041's rows and are not closed by this pass |

### What was preserved exactly as it was

- The **123-row ledger** — one column changed (C on 92 rows). 123 rows · 92 applicable · 31 NOT_APPLICABLE with proof · **92 / 92 = 100.00%** implementation completion · `LEDGER_INTEGRITY: OK`.
- **All evidence**: `evidence/tool041/` (the local production run) and `evidence/tool041-published/` (the E4 run on the published Preview `dpl_3an5zZFr4R9WaQx7CCWngv6KnG9R`: deployment record, SHA-256 manifest, browser log **PASS=28**, three screenshots, measured 390 px legibility figure).
- **The change log round 1** — not rewritten; this round is appended.

### The acceptance-evidence test was updated, not weakened

While the decision was pending, `tests/unit/tool-041-acceptance-evidence.test.ts` asserted that no row carried `APPROVED` and that the acceptance file did not claim owner approval — the correct guard against a developer self-approving. It now asserts the opposite of what it used to guard against, and guards the closed state exactly:

- all **92** applicable rows are `APPROVED`, and no row is left `PENDING`;
- all **31** excluded rows are `NOT_DECISIONED` (no decision is required for a non-applicable row, and each still has a proof in the system requirement register);
- the acceptance document states `OWNER_REVIEW` and the scope of the decision.

**Tool 041 is closed. The next tool in sequence is Tool 041, under the R6.1 requirements, with the same implementation and verification methodology, without redoing the completed work and without changing any prior decision.**

---

## Open rows after round 2

**NONE at the implementation level.** Every applicable row is B=PASS with E>=E3, and the owner decision (C) is **APPROVED** on all 92 applicable rows (owner decision 2026-11-13, Tool 041 closed as `OWNER_REVIEW`).

What is open is **not** an implementation or an owner-decision gap:

- the **activation-status conflict** and the wider project-level conflict set (`HISTORY-CONTEXT-INTEGRATION-REPORT.md` §8: C1, C2/C8, C5) — they are not Tool 041's rows;
- the **final acceptance of Tool 041** — the next tool in sequence, to be done under the same R6.1 methodology without redoing Tool 041's completed work.

---

## Preservation

Nothing from Tool 039 was changed by this round. The Tool 039 ledger, its acceptance document, its change log and its evidence sets are untouched, and the owner decision of 2026-11-12 on Tool 039 stands exactly as it was recorded.
