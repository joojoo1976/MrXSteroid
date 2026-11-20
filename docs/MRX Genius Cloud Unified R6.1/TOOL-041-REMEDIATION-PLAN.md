# TOOL 041 - REMEDIATION PLAN (NOT EXECUTED)

**Tool:** Tool 041 - Hematocrit Monitor (`mrx.tool.041-hematocrit-monitor`)

**Status:** `OWNER_REVIEW` - **NOT ACCEPTED** - **NOT CLOSED**

**Plan date:** 2026-11-14

**Ledger:** `tool-041-requirements.csv` - 138 rows / 132 applicable / 6 `NOT_APPLICABLE` / 76 `PASS` / **57.58%**

**Execution state:** **NONE OF THE CHANGES BELOW ARE IMPLEMENTED OR AUTHORIZED.** This is a planning document only.

> **Authoritative companions (2026-11-14):** the exact `req_id` lists and the unique-count proof live in
> `TOOL-041-REMEDIATION-MATRIX.md` / `.csv`; the per-requirement source binding lives in
> `TOOL-041-EVIDENCE-FINGERPRINT-MATRIX.md` / `.csv`; the six exceptions live in
> `TOOL-041-NOT-APPLICABLE-PINNING.md`; Phase 1 content and authorization live in
> `TOOL-041-PHASE1-CORE5-GENIUS12-CONTENT-SPEC.md` and `TOOL-041-PHASE1-AUTHORIZATION-REQUEST.md`.
> If a list in this plan disagrees with the matrix, the matrix governs.

> Authorization boundary: no commit, push, merge, rebase, deploy or redeploy; no Engine, Schema, Registry or
> Catalog change; no database, Supabase, RLS, W18, Session or Cloud Sync change; no Tool 042 start.
> Every code change requires a separate, explicit owner authorization after this plan is reviewed.

---

## 0. Scope

The plan covers the **56 applicable non-completion rows** in the current ledger:

| B state | Rows |
|---|---:|
| `PARTIAL` | 32 |
| `FAIL` | 9 |
| `NOT_AVAILABLE` | 12 |
| `BLOCKED` | 2 |
| `NOT_RUN` | 1 |
| **Total non-completion** | **56** |

The 6 `NOT_APPLICABLE` rows (`NA-01`..`NA-06`) are out of scope. The 76 `PASS` rows are out of scope unless a
change in groups A-F would invalidate their evidence.

### 0.1 Group summary

| Group | Theme | Unique rows | Code authorization | Owner decision | Medical review |
|---|---|---:|---|---|---|
| A | CORE-5 / GENIUS-12 | 22 | Yes | Yes (closure target) | Yes for C3/C4/C5 |
| B | Output contract / schema enforcement | 7 | Yes | No | No |
| C | Medical sources and clinical semantics | 6 | Yes | Yes | **Yes (mandatory)** |
| D | Arabic / English localization | 6 | Yes | No | Yes for clinical terms |
| E | EMPTY / DEGRADED and accessibility | 9 (+1 overlap) | Yes | Yes (DEGRADED exception) | No |
| F | Engine / schema boundary tests | 6 | Yes | No | No |

The groups are independent enough to plan separately, but not independent enough to merge without a
regression run. `CORE-08` appears in group A and is cross-referenced by group E; it is counted once.

---

## A. CORE-5 / GENIUS-12

### A.1 Affected requirements (22)

| req_id | B | E | Gap |
|---|---|---|---|
| `CORE-01` | PARTIAL | E3 | C1 Primary Result lacks range and confidence |
| `CORE-02` | NOT_AVAILABLE | E3 | C2 How Calculated is absent |
| `CORE-03` | PARTIAL | E3 | C3 Safety lacks translated warnings, red flags, referral |
| `CORE-04` | NOT_AVAILABLE | E3 | C4 Evidence and Sources is absent |
| `CORE-05` | NOT_AVAILABLE | E3 | C5 Next Actions is absent |
| `CORE-06` | FAIL | E3 | Compact/full mode does not embed the closure CORE-5 |
| `CORE-07` | PARTIAL | E3 | CORE-5 content is not fully bilingual |
| `CORE-08` | PARTIAL | E3 | CORE-5 keyboard/screen-reader accessibility incomplete |
| `G12-01` | PARTIAL | E4 | Twelve closure boxes are not rendered in fixed order |
| `G12-02` | NOT_AVAILABLE | E2 | Box 1 KPI Strip absent |
| `G12-03` | PARTIAL | E3 | Box 2 Primary Result does not equal C1 |
| `G12-04` | NOT_AVAILABLE | E3 | Box 3 Formula does not equal C2 |
| `G12-05` | PARTIAL | E3 | Box 4 Inputs Summary absent / invented defaults |
| `G12-06` | NOT_AVAILABLE | E3 | Box 5 What-If absent |
| `G12-07` | NOT_AVAILABLE | E3 | Box 6 Sensitivity absent |
| `G12-08` | PARTIAL | E3 | Box 7 Warnings/Safety does not equal C3 |
| `G12-09` | NOT_AVAILABLE | E3 | Box 8 Cross-Tool Links absent |
| `G12-10` | NOT_AVAILABLE | E3 | Box 9 Evidence/Sources does not equal C4 |
| `G12-11` | NOT_AVAILABLE | E3 | Box 10 Export absent |
| `G12-12` | BLOCKED | E2 | Box 11 History blocked on W18/storage decision |
| `G12-13` | NOT_AVAILABLE | E3 | Box 12 Feedback/Next Actions absent |
| `STATE-09` | PARTIAL | E2 | Result panel lacks unit/reference range/confidence |

### A.2 Files that would be affected

- `components/tools/tool-041-hematocrit-monitor.tsx`
- `components/tools/tool-041-hematocrit-monitor.genius.tsx`
- `components/tools/tool-041-hematocrit-monitor.visual.tsx`
- `components/tools/r6/R6ToolShell.tsx` (shared shell; only if the tool-local slot cannot satisfy the contract)
- the Tool 041 i18n dictionary
- render tests under `tests/unit/`

### A.3 Minimal change

1. Decide the closure target: full CORE-5 + GENIUS-12, or an owner-approved exception per box.
2. Replace the current SPEC §5.2 C1-C12 slot content with the closure-layer CORE-5 content.
3. Add the missing C2 formula box, C4 evidence list and C5 next-actions block.
4. Map the 12 GENIUS boxes to the same content without duplicating calculation logic.
5. Add range and confidence to the primary result (`STATE-09`).
6. Keep the engine and pipeline outputs unchanged; this group is presentation and information architecture.

### A.4 Tests required

- render test: CORE-5 C1-C5 present in compact and full mode;
- render test: GENIUS-12 boxes present in fixed order, with no duplicate primary result;
- render test: formula box values come from engine constants, not hard-coded prose;
- render test: evidence list renders name/publisher/date/level/link;
- render test: next actions render one step, what not to do, and when to seek care;
- keyboard and screen-reader pass;
- AR/EN render pass;
- published harness re-run only after an authorized deployment.

### A.5 Risks and dependencies

- The shared `R6ToolShell` is used by other tools; changing it can regress them.
- "Which twelve boxes govern Tool 041" is a design decision, not a coding decision.
- C3/C4/C5 depend on medical sources and specialist review (group C).
- C1/C2 depend on stable provenance and engine constants.
- G12-12 is blocked on W18/storage and cannot be closed by UI work alone.

### A.6 Authorization

- Owner decision: **yes** (closure target and exceptions).
- Medical review: **yes** for C3, C4, C5 and any clinical wording.
- Separate code authorization: **yes**.

---

## B. Output Contract / Schema enforcement

### B.1 Affected requirements (7)

| req_id | B | E | Gap |
|---|---|---|---|
| `SCH-02` | PARTIAL | E2 | Readings count boundary 2..24 is not tested |
| `SCH-04` | PARTIAL | E2 | ISO-8601 date parsing is not tested for malformed/empty |
| `SCH-07` | PARTIAL | E2 | `weeks_remaining` 0..52 boundary is not tested |
| `SCH-08` | FAIL | E3 | Engine result is not validated by `HematocritResultSchema` |
| `SCH-09` | PARTIAL | E2 | `HematocritOutputSchema` is not enforced or explicitly documented |
| `PIPE-09` | PARTIAL | E2 | `seoLinks` construction is not asserted |
| `PIPE-12` | FAIL | E3 | Pipeline does not parse engine output with `HematocritResultSchema` |

### B.2 Files that would be affected

- `lib/tools/schemas/tool-041-hematocrit-monitor.ts`
- `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.ts`
- `tests/unit/tool-041-hematocrit-monitor-pipeline.test.ts`
- schema boundary tests

### B.3 Minimal change

1. Call `HematocritResultSchema.safeParse(engineResult)` before building the envelope; return `ok:false` on failure.
2. Either enforce `HematocritOutputSchema` in the same path or document `isToolOutput` as the sole envelope
   guard, with a test proving the choice.
3. Add boundary tests: 2 and 24 readings accepted, 25 rejected; malformed/empty dates; `weeks_remaining`
   `-1`, `0`, `52`, `53`, `1.5`.
4. Assert the `seoLinks` payload or remove the unused field.
5. Remove the currently unused `HematocritResultSchema` import only as part of the enforcement change.

### B.4 Tests required

- schema accepts 2 and 24 readings, rejects 25 and 1;
- malformed and empty dates rejected with a typed issue;
- `weeks_remaining` boundary matrix;
- pipeline fails closed on a malformed engine result;
- valid engine output still passes unchanged (golden output);
- `isToolOutput` / `HematocritOutputSchema` decision is covered by a test.

### B.5 Risks and dependencies

- Fail-closed validation can turn silent malformed behavior into user-visible errors.
- Enforcing a second schema may duplicate validation or change the public envelope.
- `seoLinks` may be consumed elsewhere; removing it needs a usage check.
- No engine math change is required for this group.

### B.6 Authorization

- Owner decision: no, unless the envelope contract changes.
- Medical review: no.
- Separate code authorization: **yes**.

---

## C. Medical sources and clinical semantics

### C.1 Affected requirements (6)

| req_id | B | E | Gap |
|---|---|---|---|
| `PIPE-07` | PARTIAL | E3 | `provenance.referenceRange` lacks a sex-specific band and citation |
| `MED-02` | PARTIAL | E3 | No explicit escalation/referral path |
| `MED-03` | PARTIAL | E3 | No interpretation limits / "not a diagnosis" statement |
| `MED-04` | FAIL | E2 | Reference bands and intervention line lack named sources |
| `MED-06` | PARTIAL | E3 | Displayed range does not clearly match the clinical band |
| `MED-07` | BLOCKED | E2 | `donate_eligible` clinical validity/label is unreviewed |

### C.2 Files that would be affected

- `lib/tools/engines/tool-041-hematocrit-monitor.ts` (constants and source metadata; **no threshold change without separate authorization**)
- `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.ts` (provenance)
- `components/tools/tool-041-hematocrit-monitor.tsx` (referral, limits, band label)
- a structured medical evidence file (new, documentation only)
- engine/pipeline tests

### C.3 Minimal change

1. Obtain specialist-approved citations for the male `50/54` and female `44.5/48` bands.
2. Populate `provenance.referenceRange` with a sex-specific band plus citation, or label the current field as
   display bounds and stop implying it is the clinical band.
3. Add a reviewed referral/escalation block with urgency and contact guidance.
4. Add interpretation limits and an explicit "not a diagnosis" statement.
5. Review `donate_eligible` wording and clinical validity; do not change the rule or label without a separate
   explicit authorization.

### C.4 Tests required

- provenance includes source name, publisher, date and link;
- displayed band equals the sourced band, or is explicitly labeled as display bounds;
- referral block renders with urgency and contact guidance;
- interpretation-limits block renders in AR and EN;
- `donate_eligible` label matches the reviewed wording;
- golden engine outputs unchanged unless a threshold change is separately authorized.

### C.5 Risks and dependencies

- This is the highest-risk group: a wrong band, threshold or eligibility label can cause clinical harm.
- Sex-specific logic may not exist in the current engine; adding it changes behavior.
- `donate_eligible` is a clinical claim, not a UI label.
- Specialist availability is an external dependency.
- Any threshold change must be a separate, explicit decision with its own tests and rollback plan.

### C.6 Authorization

- Owner decision: **yes**.
- Medical review: **yes, mandatory**.
- Separate code authorization: **yes** for provenance/UI; **separate explicit authorization** for any threshold,
  band or eligibility-rule change.

---

## D. Arabic / English localization

### D.1 Affected requirements (6)

| req_id | B | E | Gap |
|---|---|---|---|
| `SCH-10` | PARTIAL | E1 | Schema errors are not bilingual |
| `STATE-07` | PARTIAL | E2 | Validation errors are not field-specific and localized |
| `I18N-02` | FAIL | E3 | Band values are not translated |
| `I18N-03` | FAIL | E3 | Warning codes are not translated |
| `I18N-04` | FAIL | E2 | Validation/error text is not available in Arabic |
| `I18N-05` | PARTIAL | E3 | Mixed-language labels can appear |

Cross-referenced but counted in group A: `CORE-07` (CORE-5 bilingual) and the translation half of
`CORE-03` / `G12-08` (warning translation).

### D.2 Files that would be affected

- the Tool 041 i18n dictionary / catalog entry
- `lib/tools/schemas/tool-041-hematocrit-monitor.ts` (issue-to-message mapping)
- `components/tools/tool-041-hematocrit-monitor.tsx`
- AR/EN render tests and harness scripts

### D.3 Minimal change

1. Map band values and warning codes to AR/EN dictionary keys before render.
2. Map schema issues to field-specific AR/EN messages.
3. Route every displayed string through the dictionary; remove inline mixed-language labels.
4. Keep raw codes in logs only, never in the UI.

### D.4 Tests required

- AR/EN dictionary parity for all keys used by the tool;
- band labels and warning messages render localized, with no raw codes;
- validation errors render in Arabic for an Arabic locale;
- no mixed-language label in either locale;
- Arabic RTL render at 390 px (shared with group E `RESP-05`).

### D.5 Risks and dependencies

- The dictionary may be shared; key collisions can affect other tools.
- Medical terms need specialist-approved translations, not literal translation.
- Arabic text shaping/RTL can expose layout defects.
- Depends on the medical wording decisions in group C.

### D.6 Authorization

- Owner decision: no, unless clinical wording changes.
- Medical review: **yes for clinical terms**.
- Separate code authorization: **yes**.

---

## E. EMPTY / DEGRADED states and accessibility

### E.1 Affected requirements (9, plus `CORE-08` cross-reference)

| req_id | B | E | Gap |
|---|---|---|---|
| `STATE-01` | FAIL | E3 | EMPTY is not explicit/reachable |
| `STATE-02` | PARTIAL | E3 | PARTIAL is not a genuine state |
| `STATE-05` | NOT_AVAILABLE | E3 | DEGRADED state is absent |
| `STATE-06` | PARTIAL | E3 | Missing inputs can be invented |
| `STATE-10` | FAIL | E2 | aria-live regions are absent |
| `A11Y-06` | PARTIAL | E2 | Touch targets at 390 px are not verified |
| `A11Y-07` | PARTIAL | E2 | Repeated input rows lack programmatic labels |
| `A11Y-08` | PARTIAL | E2 | Focus indication is incomplete |
| `RESP-05` | NOT_RUN | E0 | Arabic RTL at 390 px is not run |
| `CORE-08` | PARTIAL | E3 | CORE-5 keyboard/screen-reader accessibility (also group A) |

### E.2 Files that would be affected

- `components/tools/tool-041-hematocrit-monitor.tsx`
- `components/tools/tool-041-hematocrit-monitor.visual.tsx`
- shared shell only if state rendering lives there
- accessibility styles / focus-visible classes
- browser harness script and evidence capture

### E.3 Minimal change

1. Start from blank readings with no invented defaults; make EMPTY reachable.
2. Make PARTIAL genuine by making the relevant fields optional, or remove the claim.
3. Add a DEGRADED branch with a defined trigger, or record an owner-approved exception.
4. Add `aria-live="polite"` for results and `aria-live="assertive"` for errors.
5. Add indexed accessible names to repeated reading rows.
6. Add visible focus rings and verify with the harness.
7. Measure touch targets at 390 px and enlarge to at least 44 px where needed.
8. Run and capture Arabic RTL at 390 px.

### E.4 Tests required

- empty render: no invented values;
- partial render: only supplied fields are shown;
- degraded render: defined trigger and message;
- result/error live-region assertions;
- keyboard tab order and focus-visible check;
- touch-target measurement at 390 px;
- Arabic RTL 390 px with screenshot and no horizontal overflow.

### E.5 Risks and dependencies

- Changing the state model can affect calculation gating and user-visible errors.
- DEGRADED needs a precise trigger; without one it becomes an empty label.
- Accessibility changes can conflict with the shared shell's layout.
- `RESP-05` is currently `NOT_RUN` (`E0`); it cannot pass without executing the harness.

### E.6 Authorization

- Owner decision: **yes for the DEGRADED exception**, if one is chosen.
- Medical review: no, unless the state message makes a clinical claim.
- Separate code authorization: **yes**.

---

## F. Engine / Schema boundary tests

### F.1 Affected requirements (6)

| req_id | B | E | Gap |
|---|---|---|---|
| `ENG-02` | PARTIAL | E3 | Engine uses `Date` / ambient time |
| `ENG-04` | PARTIAL | E2 | Input-order independence is not tested |
| `ENG-10` | PARTIAL | E2 | 180-day projection horizon is not tested |
| `ENG-11` | PARTIAL | E3 | Already-above / flat-trend suppression is not asserted |
| `ENG-14` | PARTIAL | E2 | `rising_trend_30d` is not tested |
| `ENG-16` | PARTIAL | E2 | Empty/unparseable reading set is not tested directly |

### F.2 Files that would be affected

- `lib/tools/engines/tool-041-hematocrit-monitor.ts`
- `tests/unit/tool-041-hematocrit-monitor-pipeline.test.ts`
- new or expanded engine unit tests

### F.3 Minimal change

1. Add the missing tests first (order independence, 180-day horizon, already-above suppression,
   `rising_trend_30d`, empty/invalid readings).
2. For `ENG-02`, replace `Date` usage with an injected clock or pure ISO arithmetic; this is a code change,
   not a test-only change.
3. Keep thresholds and formulas unchanged unless group C separately authorizes a clinical change.

### F.4 Tests required

- reversed and shuffled readings produce the same result;
- projection is `null` beyond 180 days;
- projection is `null` when flat or already above the line;
- `rising_trend_30d` emitted for a steep series;
- empty and wholly unparseable sets fail safely with `no_valid_readings`;
- no `Date`/`new Date`/`Date.parse` in the engine after the purity change;
- golden outputs unchanged for existing valid cases.

### F.5 Risks and dependencies

- Removing `Date` can change results near the 30-day/180-day boundaries.
- Clock injection changes the engine API and may affect the pipeline.
- Test-only additions can close `ENG-04`, `ENG-10`, `ENG-11`, `ENG-14`, `ENG-16` without behavior change.
- `ENG-02` requires an engine change and a separate regression run.

### F.6 Authorization

- Owner decision: no, unless a clinical behavior changes.
- Medical review: no for pure tests; yes if thresholds or eligibility change.
- Separate code authorization: **yes**.

---

## 4. Suggested sequencing (not started)

This is a recommendation, not an execution order approved by the owner.

1. **F tests only** - low risk, may close 5 rows without behavior change.
2. **B** - fail-closed schema enforcement plus boundary tests.
3. **D** - localization, after the medical wording in C is stable.
4. **E** - states and accessibility, including the unrun Arabic RTL check.
5. **A** - CORE-5/GENIUS-12, after the owner chooses the closure target.
6. **C** - medical sources and clinical semantics last, with specialist sign-off.

Groups A and C overlap on C3/C4/C5; groups A and D overlap on CORE-07 and warning translation; groups A and E
overlap on CORE-08. The overlaps must be scheduled together or explicitly de-duplicated.

---

## 5. What this plan does not do

- It does not change any source file.
- It does not change any threshold, band or eligibility rule.
- It does not add a dependency.
- It does not create a database table, RLS policy, session or cloud-sync path.
- It does not deploy or redeploy.
- It does not start Tool 042.
- It does not accept Tool 041.

---

## 6. Authorization checklist

Before any group starts, the owner must provide:

- [ ] an explicit code authorization naming the group and the files;
- [ ] a decision on the CORE-5/GENIUS-12 closure target (group A);
- [ ] a named medical reviewer and a review scope (group C and clinical wording in A/D);
- [ ] a decision on the DEGRADED state (group E);
- [ ] a decision on the local/Preview drift and whether a new Preview is authorized (OD-07);
- [ ] a statement that Tool 042 remains stopped.

Until then: **no implementation**.
