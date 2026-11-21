# TOOL 041 - LEDGER VERSION RECONCILIATION

**Tool:** Tool 041 - Hematocrit Monitor (`mrx.tool.041-hematocrit-monitor`)

**Status:** `OWNER_REVIEW` - **NOT ACCEPTED** - **NOT CLOSED**

**Owner decision (C):** `PENDING` on every applicable row; `NOT_DECISIONED` on every excluded row.

**Date of reconciliation:** 2026-11-14

**Tool 042:** **STOPPED** - not started, not unblocked by this document.

> This document reconciles two ledger versions. It does not accept Tool 041, it does not close Tool 041,
> and it does not authorize any code, schema, engine, registry, catalog, database, session or deployment change.
> The current 138-row calculation is the **running review calculation**. The old 123-row calculation is a
> **historical `superseded` snapshot**.

---

## 0. Executive result

| Item | Old snapshot (superseded) | Current ledger (running review) |
|---|---:|---:|
| Ledger role | Historical, superseded | Current review baseline |
| Rows | 123 | 138 |
| Applicable | 92 | 132 |
| `NOT_APPLICABLE` | 31 | 6 |
| `B=PASS` | 92 | 76 |
| Completion | 92 / 92 = **100.00%** | 76 / 132 = **57.58%** |
| Owner decision (C) | PENDING 92 / NOT_DECISIONED 31 | PENDING 132 / NOT_DECISIONED 6 |
| Ledger SHA-256 | `a5f3c5a5eea7f7087edf4b5464fe8c9cfaa77bcbe46aefd592ec97aba923038f` | `ed1e330faf571789872a8456e1caac723458912eecee8136263bc1076296450d` |

The two versions **must not be mixed**. The old figure is not the current figure, and the current figure is not
an acceptance result.

### Critical finding (read before using any per-ID table)

The two ledgers use **disjoint `req_id` namespaces**:

- exact `req_id` intersection = **0**;
- exact normalized requirement-text intersection = **0**;
- old-only IDs = 123; new-only IDs = 138; union = 261; Jaccard overlap = 0.

Therefore the requested row-by-row lists:

- "the fifteen new requirements",
- "every requirement whose applicability changed",
- "every requirement whose B changed",
- "every requirement whose E changed",

are **NOT DETERMINABLE** from the two files without inventing a mapping. Any such per-ID table would be
fabricated. This document instead provides:

1. exact set operations;
2. an arithmetic aggregate bridge;
3. a family/topic crosswalk (explicitly **not** an ID mapping);
4. the full 138-row current cross-tabulation;
5. a governance defect and an owner decision to fix the ID policy.

This is recorded as **GD-01 (governance defect)** and **OD-01 (owner decision)**.

---

## 1. Provenance and fingerprints

### 1.1 Historical snapshot (superseded, preserved verbatim)

All old files were copied byte-for-byte to:

`docs/MRX Genius Cloud Unified R6.1/evidence/tool041-ledger-versions/v1-123-superseded/`

| Old file | Preserved snapshot | Bytes | SHA-256 |
|---|---|---:|---|
| `tool-041-requirements.csv` | `tool-041-requirements.v1-123-superseded.csv` | 104,899 | `a5f3c5a5eea7f7087edf4b5464fe8c9cfaa77bcbe46aefd592ec97aba923038f` |
| `TOOL-041-ACCEPTANCE.md` | `TOOL-041-ACCEPTANCE.v1-123-superseded.md` | 181,310 | `690a01ac95f37b2362b4e92db9d9efd2cab6d9f584728a4b122556a45da9e932` |
| `tool-041-ledger-change-log.md` | `tool-041-ledger-change-log.v1-123-superseded.md` | 13,758 | `9e0c277962f114b476dc8523715a9487863814cc5f9ef271ce2a17fe6eb1d9e5` |
| `tool-041-acceptance-calc.mjs` | `tool-041-acceptance-calc.v1-123-superseded.mjs` | 10,242 | `d79c51ffe699140330a1c204f6e09d9a48d2fe2eb6d39241ff065a92b714b95a` |
| `tool-041-acceptance.template.md` | `tool-041-acceptance.template.v1-123-superseded.md` | 48,850 | `aa26bef1b7af4781385d27320e5c7bf749b4976989330fc9db84070718d1f8a3` |
| `tool-041-ledger-build.mjs` | `tool-041-ledger-build.v1-123-superseded.mjs` | 85,843 | `ebd99e21752b3c20bb0b572c688c3c9a2290bb5827e25a4c3cd37b5d19dff555` |
| `TOOL-041-GENIUS12-CROSSWALK.md` | `TOOL-041-GENIUS12-CROSSWALK.v1-123-superseded.md` | 16,575 | `db5f3489711fca4451e85c43e10be16f7692057f8283733b0ccaa6bbe98d8e6c` |
| `TOOL-041-DEVELOPMENT-PROPOSALS.md` | `TOOL-041-DEVELOPMENT-PROPOSALS.v1-123-superseded.md` | 13,941 | `6811ecadd704e41eea9d64d2e773ad3166bed5292989a369e904f36fe60b87c3` |

Preservation method: copy only; no text correction; the old contradictions are retained as historical evidence.

The old ledger itself is genuinely a Tool 041 ledger: it contains 14 "Tool 041" mentions, 0 "Tool 040"
mentions and 145 hematocrit references. The **old report header and some old companion files are mislabeled
Tool 040**; see section 7.

### 1.2 Current ledger (running review calculation)

| File | Bytes | Rows | SHA-256 |
|---|---:|---:|---|
| `tool-041-requirements.csv` | 78,528 | 138 | `ed1e330faf571789872a8456e1caac723458912eecee8136263bc1076296450d` |
| `tool-041-acceptance-calc.mjs` | see manifest | - | see manifest |
| `tool-041-acceptance-calc.json` | see manifest | - | see manifest |
| `tool-041-ledger-crosstab.csv` | see manifest | 138 | see manifest |
| `tool-041-ledger-crosstab.md` | see manifest | 138 | see manifest |
| `tool-041-ledger-crosstab.json` | see manifest | - | see manifest |

The 138-row ledger was regenerated deterministically from the preserved generator:

- generator: `C:\Users\foryo\AppData\Local\Temp\opencode\gen-tool041-csv.mjs`
- generator SHA-256: `6911cd4b989848e784327b4185892c2b28006f82a2d374fd3e5a8fe7c8bf62cd`
- regeneration result: 138 rows, 138 unique IDs, 78,528 bytes, SHA-256 `ed1e330f...` (exact match to the
  running-review ledger fingerprint recorded before the old files displaced it).

No row was edited after regeneration.

### 1.3 Document roles

| Document | Role |
|---|---|
| `TOOL-041-LEDGER-VERSION-RECONCILIATION.md` | This reconciliation |
| `tool-041-ledger-change-log.md` | Current change log, including Round 2 reconciliation |
| `tool-041-ledger-crosstab.md` / `.csv` / `.json` | 138-row `applicability x B x E` cross-tabulation |
| `tool-041-ledger-version-inventory.csv` | Combined 261-row inventory: 123 old + 138 current, version-labelled |
| `TOOL-041-REMEDIATION-PLAN.md` | Groups A-F, not executed |
| `TOOL-041-OWNER-DECISIONS.md` | Owner decisions required |
| `TOOL-041-ACCEPTANCE.md` | Current review report (OWNER_REVIEW, not acceptance) |
| `evidence/tool041-ledger-versions/v1-123-superseded/` | Historical snapshot, never to be edited |

---

## 2. Exact set operations

### 2.1 `req_id` set comparison

| Operation | Count |
|---|---:|
| Old rows / unique old IDs | 123 |
| New rows / unique new IDs | 138 |
| Common `req_id` | **0** |
| Old-only `req_id` | 123 |
| New-only `req_id` | 138 |
| Union | 261 |
| Jaccard overlap | 0.00 |

### 2.2 Requirement-text comparison

Requirements were normalized (lowercase; non-alphanumerics collapsed to single spaces) and compared exactly:

| Operation | Count |
|---|---:|
| New rows with an exact normalized match in the old ledger | **0** |
| New rows with no exact text match | 138 |
| Multi-old-match collisions | 0 |

The current ledger is not a renumbering of the old ledger. It is a **full re-atomization with new wording**.

### 2.3 Consequence

A `req_id`-keyed change table cannot be produced truthfully. The only truthful per-row statement is:

> Every old row is `old-only`; every new row is `new-only`; no row has a proven identity across versions.

The full inventories are preserved in the two CSV files so the owner can inspect every row directly. A single
combined inventory, `tool-041-ledger-version-inventory.csv`, stacks all 261 rows (123 old + 138 current) with a
`version` column, the same applicability classification and the same completion rule. It makes the absence of
row identity auditable without asserting a mapping.

---

## 3. Aggregate arithmetic bridge (no row attribution)

This bridge is arithmetic, not a row-level flow. It deliberately does **not** claim that a specific old row
became a specific new row.

| Metric | Old | Delta | Current |
|---|---:|---:|---:|
| Rows | 123 | +15 | 138 |
| Applicable (denominator) | 92 | +40 | 132 |
| `NOT_APPLICABLE` | 31 | -25 | 6 |
| `B=PASS` | 92 | -16 | 76 |
| `B=PARTIAL` | 0 | +32 | 32 |
| `B=FAIL` | 0 | +9 | 9 |
| `B=NOT_AVAILABLE` | 0 | +12 | 12 |
| `B=BLOCKED` | 0 | +2 | 2 |
| `B=NOT_RUN` | 0 | +1 | 1 |
| `C=PENDING` | 92 | +40 | 132 |
| `C=NOT_DECISIONED` | 31 | -25 | 6 |
| `E0` | 0 | +1 | 1 |
| `E1` | 0 | +1 | 1 |
| `E2` | 29 | -3 | 26 |
| `E3` | 89 | -3 | 86 |
| `E4` | 5 | +19 | 24 |
| Completion numerator | 92 | -16 | 76 |
| Completion denominator | 92 | +40 | 132 |
| Completion percent | 100.00% | -42.42 pp | 57.58% |

### 3.1 Arithmetic identity

`applicable_new = applicable_old + rows_delta + released_NA`

`132 = 92 + 15 + 25`

The +40 applicable rows are explained exactly by the +15 net rows plus the 25 old `NOT_APPLICABLE` rows that
the current ledger no longer excludes. This is an accounting identity, not a claim about individual rows.

### 3.2 Where the 100.00% went

The old ledger recorded only two B values: `PASS` (92) and `NOT_APPLICABLE` (31). It had **zero**
`PARTIAL`, `FAIL`, `NOT_AVAILABLE`, `BLOCKED` or `NOT_RUN` rows.

The current ledger records all mandated non-completion states on applicable rows:

`PARTIAL 32 + FAIL 9 + NOT_AVAILABLE 12 + BLOCKED 2 + NOT_RUN 1 = 56`

`76 PASS + 56 non-completion = 132 applicable`

The drop from 100.00% to 57.58% is therefore explained by:

1. a larger and stricter denominator (132 vs 92);
2. explicit non-completion states that the old ledger did not use;
3. evidence-level discipline (`E>=E3`) applied to every applicable row.

It is **not**, by itself, proof of a code regression. It is proof that the old 123-row ledger used a coarser
pass rule. Whether any specific behavior regressed requires the separate remediation verification in
`TOOL-041-REMEDIATION-PLAN.md`.

### 3.3 E-level bridge

| State | Old | Current | Delta |
|---|---:|---:|---:|
| `E0` | 0 | 1 | +1 |
| `E1` | 0 | 1 | +1 |
| `E2` | 29 | 26 | -3 |
| `E3` | 89 | 86 | -3 |
| `E4` | 5 | 24 | +19 |
| Total | 123 | 138 | +15 |

The `E4` increase (+19) is consistent with the published Preview evidence captured for the current review
package. It is evidence strength, **not** acceptance. See section 8 for the snapshot-drift caveat.

---

## 4. State semantics (pinned)

These meanings are binding for the current calculation. Changing them requires an explicit owner decision.

| State | Meaning | In denominator? | Counts as completion? |
|---|---|---|---|
| `APPLICABLE` | The requirement applies to Tool 041. | Yes | Only via `PASS` + `E>=E3` |
| `NOT_APPLICABLE` | The requirement does not apply, with a specific reason and its own proof. | No | No |
| `PASS` | The requirement is satisfied and independently evidenced. | Yes | Yes, only with `E>=E3` |
| `PARTIAL` | Some implementation or evidence exists, but the requirement is not fully met. | Yes | **No** |
| `FAIL` | The requirement is not met. | Yes | **No** |
| `BLOCKED` | The requirement cannot be completed because an external decision or dependency is missing. | Yes | **No** |
| `NOT_RUN` | The required verification was not executed. | Yes | **No** |
| `NOT_AVAILABLE` | The requirement applies, but the function or its evidence is unavailable. | **Yes** | **No** |

Evidence levels:

| Level | Meaning |
|---|---|
| `E0` | No evidence / not run |
| `E1` | Static claim or code inspection only |
| `E2` | Partial code or partial test evidence |
| `E3` | Reproducible local test / build / runtime evidence |
| `E4` | Published Preview or runtime evidence |

`E4` is the strongest evidence level and still **does not equal acceptance**. Acceptance is the owner's
decision (C), not an evidence level.

Owner decision column:

| C value | Meaning |
|---|---|
| `PENDING` | Applicable; the owner has not decided. |
| `NOT_DECISIONED` | Excluded as `NOT_APPLICABLE`; the owner has not decided. |
| `APPROVED` / `REJECTED` | Reserved for the owner only. The calculator and all generated documents leave these at zero. |

### 4.1 Completion formula

`completion = (applicable rows with B=PASS and E>=E3) / applicable rows x 100`

`76 / 132 x 100 = 57.5757...% -> 57.58%`

The denominator excludes **only** `NOT_APPLICABLE` rows that carry a specific reason and their own proof.
`NOT_AVAILABLE` stays inside the denominator.

### 4.2 Current `NOT_APPLICABLE` exclusions (6 rows)

| req_id | Requirement | Exclusion basis |
|---|---|---|
| `NA-01` | Draft autosave and restore | Compute-and-display only; no draft path; proof in acceptance-evidence test. |
| `NA-02` | Dashboard snapshot commit | No dashboard projection implemented or approved. |
| `NA-03` | Session and cloud sync | W18 has not approved session/cloud sync; no Supabase client in the component. |
| `NA-04` | Per-user memory with consent, TTL, view and delete | The tool stores nothing. |
| `NA-05` | Row-level-security negative test for a Tool 041 write path | No database write path or table exists. |
| `NA-06` | Backup and disaster recovery for Tool 041 data | The tool persists no data. |

Each row carries its own `reason:` text and closure evidence in the ledger.

---

## 5. Current 138-row cross-tabulation

Full per-row data: `tool-041-ledger-crosstab.csv`, `tool-041-ledger-crosstab.md`,
`tool-041-ledger-crosstab.json`.

### 5.1 `applicability x B x E`

| Applicability | B | E | Rows |
|---|---|---|---:|
| APPLICABLE | PASS | E3 | 53 |
| APPLICABLE | PASS | E4 | 23 |
| APPLICABLE | PARTIAL | E1 | 1 |
| APPLICABLE | PARTIAL | E2 | 14 |
| APPLICABLE | PARTIAL | E3 | 16 |
| APPLICABLE | PARTIAL | E4 | 1 |
| APPLICABLE | FAIL | E2 | 3 |
| APPLICABLE | FAIL | E3 | 6 |
| APPLICABLE | NOT_AVAILABLE | E2 | 1 |
| APPLICABLE | NOT_AVAILABLE | E3 | 11 |
| APPLICABLE | BLOCKED | E2 | 2 |
| APPLICABLE | NOT_RUN | E0 | 1 |
| NOT_APPLICABLE | NOT_APPLICABLE | E2 | 6 |
| **Total** | | | **138** |

### 5.2 Marginals

| B | Rows |
|---|---:|
| PASS | 76 |
| PARTIAL | 32 |
| FAIL | 9 |
| NOT_AVAILABLE | 12 |
| BLOCKED | 2 |
| NOT_RUN | 1 |
| NOT_APPLICABLE | 6 |

| E | All rows | Applicable only |
|---|---:|---:|
| E0 | 1 | 1 |
| E1 | 1 | 1 |
| E2 | 26 | 20 |
| E3 | 86 | 86 |
| E4 | 24 | 24 |

| C | Rows |
|---|---:|
| PENDING | 132 |
| NOT_DECISIONED | 6 |

### 5.3 Family distribution

| Family | Rows | Applicable | NOT_APPLICABLE | B=PASS | Counted completion |
|---|---:|---:|---:|---:|---:|
| A11Y | 8 | 8 | 0 | 5 | 5 |
| CORE | 8 | 8 | 0 | 0 | 0 |
| DEP | 7 | 7 | 0 | 7 | 7 |
| ENG | 16 | 16 | 0 | 10 | 10 |
| G12 | 13 | 13 | 0 | 0 | 0 |
| I18N | 5 | 5 | 0 | 1 | 1 |
| ID | 12 | 12 | 0 | 12 | 12 |
| MED | 8 | 8 | 0 | 3 | 3 |
| NA | 6 | 0 | 6 | 0 | 0 |
| PIPE | 12 | 12 | 0 | 9 | 9 |
| PRIV | 7 | 7 | 0 | 7 | 7 |
| RESP | 5 | 5 | 0 | 4 | 4 |
| SCH | 10 | 10 | 0 | 4 | 4 |
| STATE | 10 | 10 | 0 | 3 | 3 |
| TEST | 11 | 11 | 0 | 11 | 11 |
| **Total** | **138** | **132** | **6** | **76** | **76** |

The 76/132 = 57.58% result is retained because every calculation rule in section 4 remains valid and the
calculator integrity check passes.

---

## 6. Family-level semantic crosswalk (NOT an ID mapping)

The following table is offered only to explain the change in atomization. It does **not** assert that an old
row became a new row.

### 6.1 Old families (123 rows)

| Old family | Rows | Applicable | NOT_APPLICABLE | B=PASS |
|---|---:|---:|---:|---:|
| `SPEC-R6.1` | 46 | 30 | 16 | 30 |
| `SPEC-6.6`, `6.7`, `7.1`, `7.2`, `7.4`, `15` | 6 | 6 | 0 | 6 |
| `ACC-R6.1` | 23 | 12 | 11 | 12 |
| `ACC-5.5.1` ... `ACC-5.5.11` | 13 | 13 | 0 | 13 |
| `LAYER-CORE5` | 5 | 5 | 0 | 5 |
| `LAYER-GENIUS12` | 13 | 11 | 2 | 11 |
| `LAYER-5IN12` | 3 | 3 | 0 | 3 |
| `LAYER-DOMAIN` | 2 | 2 | 0 | 2 |
| `LAYER-VISUAL` | 1 | 1 | 0 | 1 |
| `LAYER-CAP` | 1 | 1 | 0 | 1 |
| `LAYER-EVID` | 1 | 1 | 0 | 1 |
| `LAYER-NODELETE` | 1 | 1 | 0 | 1 |
| `LAYER-20MAP` | 7 | 6 | 1 | 6 |
| `LAYER-TOOL111` | 1 | 0 | 1 | 0 |
| **Total** | **123** | **92** | **31** | **92** |

### 6.2 Current families (138 rows)

| Current family | Rows | Old counterpart? | Note |
|---|---:|---|---|
| `ID` | 12 | Partial (identity rules inside `SPEC`/`ACC`) | Tool identity, slug, route, registry. |
| `SCH` | 10 | Partial (input contract inside `SPEC-R6.1-2`) | Split into schema-level atomic rows. |
| `ENG` | 16 | Partial (engine purity inside `SPEC-R6.1-1`) | Split into engine-boundary atomic rows. |
| `PIPE` | 12 | Partial (pipeline implied by `SPEC`/`ACC`) | New dedicated pipeline family. |
| `STATE` | 10 | Partial (`SPEC-R6.1-1.e`) | Five states expanded to ten atomic rows. |
| `CORE` | 8 | Yes, semantic (`LAYER-CORE5`) | 5 old rows -> 8 atomic rows. |
| `G12` | 13 | Yes, semantic (`LAYER-GENIUS12`) | Same count, different IDs and wording. |
| `A11Y` | 8 | Partial (`SPEC-15-A11Y`, `ACC-5.5`) | Expanded accessibility family. |
| `I18N` | 5 | No dedicated family | Arabic/English localization atomized. |
| `RESP` | 5 | Partial (`SPEC-15-A11Y`) | Responsive/RTL atomized. |
| `PRIV` | 7 | Partial (`ACC` privacy rows) | No-storage/privacy atomized. |
| `MED` | 8 | Partial (`SPEC-6.7`, `ACC-5.5`) | Medical safety/source atomized. |
| `TEST` | 11 | Partial (`ACC` proof rows) | Verification atomized. |
| `DEP` | 7 | Partial (dependency rules in `SPEC`) | Dependencies atomized. |
| `NA` | 6 | Yes, semantic (old 31 exclusion rows) | Exclusions reduced from 31 to 6. |

### 6.3 The +15 net rows

The net change is **+15 rows**. It is the result of replacing a coarse 123-row inventory with a 138-row
atomized inventory. It is **not** a proven addition of 15 new obligations to the governing standard.

The families with no one-to-one old counterpart (`I18N` 5, `RESP` 5, `PRIV` 7, `MED` 8, `TEST` 11, `DEP` 7)
show where atomization expanded. Their row counts do **not** sum to 15, and they should not be presented as
"the 15 new requirements".

**Truthful statement for the record:** the current ledger has 15 more rows than the old ledger; the specific
15 rows cannot be isolated because no row identity survives the version change. Resolving this requires OD-01.

---

## 7. Historical defects in the superseded snapshot (not repaired)

The old files are preserved exactly as found. They contain material contradictions:

| ID | Defect | Evidence | Consequence |
|---|---|---|---|
| `HD-01` | Old report title says "TOOL 040" | Old `TOOL-041-ACCEPTANCE.md` line 1 | Misidentifies the tool. |
| `HD-02` | Old report toolId says `mrx.tool.040-hematocrit-monitor` | Old report line 3 | Wrong canonical ID. |
| `HD-03` | Old report claims `CURRENT STATUS: OWNER_ACCEPTED` while per-row C is `PENDING` on all 92 applicable rows | Old report lines 11 and 177 | Self-contradictory status. |
| `HD-04` | Old report claims the owner "APPROVED on all 92" | Old report lines 629, 646, 651 | Fills the owner decision on the owner's behalf. |
| `HD-05` | Old report cites Preview URL `mrxsteroid-cwyf07kr2...` | Old report line 9 | Stale/inconsistent with the authoritative `be8zay3tl...` URL. |
| `HD-06` | Old report uses 123 rows / 92 applicable / 100.00% | Old report lines 34, 245, 257 | Coarse pass rule; superseded. |
| `HD-07` | Old companion template/crosswalk/proposals/change log also say "TOOL 040" | Old files, line 1 | Package-wide labeling defect. |

These defects are **historical evidence**, not current status. They were not silently corrected in the snapshot.
They are corrected only in the current canonical documents, which explicitly say Tool 041 and `OWNER_REVIEW`.

`TOOL-040-ACCEPTANCE.md` (the real Tool 040 closure document) is a separate, legitimate artifact and is not
modified by this reconciliation.

---

## 8. Working Tree <-> Preview linkage (preserved, with drift disclosed)

### 8.1 Authoritative Preview metadata

| Field | Value |
|---|---|
| Deployment ID | `dpl_3an5zZFr4R9WaQx7CCWngv6KnG9R` |
| Status | `READY` |
| Target | `preview` (no production deploy, no promotion) |
| Production URL | `null` |
| Deployment protection | `vercel_authentication` enabled and unchanged |
| Created | 2026-11-13 22:44:14 +0200 |
| Preview URL | `https://mrxsteroid-be8zay3tl-georges-projects-78ef250b.vercel.app` |
| Source HEAD field | `f1caa8211ec52ee07b2d0bccf8f30df11e54ab59` (changes were in the local working tree, not HEAD) |
| Published harness | 18/18 PASS (`evidence/tool041-published/`) |

### 8.2 Historical deployed-file evidence (preserved as recorded)

| File | Deployed `uid` (recorded) | Meaning |
|---|---|---|
| `components/tools/tool-041-hematocrit-monitor.tsx` | `2eb85043c8764fec0137e9de6ae45585ddb1a455` | Byte-identical to the working tree at deployment time |
| `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.ts` | `47253c5d7be22b7af10bc8582fbe84583a06cb6d` | Byte-identical at deployment time |
| `lib/tools/schemas/tool-041-hematocrit-monitor.ts` | `cbda2e027393af356651d27b17c2e6ea0d9471f6` | Byte-identical at deployment time |

These values are recorded in `R6.1-PREVIEW-INDEX.md` (lines 513-516) and in `TOOL-040-ACCEPTANCE.md`
(lines 99-109). They are retained here as historical linkage evidence.

### 8.3 Current working-tree fingerprints (observed at reconciliation time)

| File | Current local SHA-1 | HEAD `f1caa821` blob | Git status |
|---|---|---|---|
| `components/tools/tool-041-hematocrit-monitor.tsx` | `4a304d7926b869ae77e19edcfff312eaf99d9649` | `5a8c7a0a93892cc924e6a8eba176677f89c7c64f` | Modified |
| `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.ts` | `4f94589e42fd8653340972d5c2b68e14373a5f1b` | (untracked; no HEAD blob) | Untracked |
| `lib/tools/schemas/tool-041-hematocrit-monitor.ts` | `7f65c599de97c5f683f4df7edf4881908730d7b8` | `f1a07b95ba80f39e4b6868fe3976b1734c76ad8d` | Modified |

### 8.4 Drift finding (important)

At reconciliation time, the current local SHA-1s do **not** match the deployed `uid`s recorded in section 8.2:

| File | Deployed (recorded) | Current local | Match? |
|---|---|---|---|
| Component | `2eb85043...` | `4a304d79...` | **No** |
| Pipeline | `47253c5d...` | `4f94589e...` | **No** |
| Schema | `cbda2e02...` | `7f65c599...` | **No** |

Therefore:

1. The Preview proves the **earlier working-tree snapshot** that was deployed, not the current local files.
2. The current local files are **not** in Git HEAD; HEAD blobs differ and the pipeline is untracked.
3. No claim is made that local code is part of HEAD.
4. Any `E4` evidence is snapshot-bound. Re-validating the current local files requires a new Preview
   deployment, which is **not authorized** by this step.
5. No deployment, redeployment, promotion, commit, push, merge or rebase was performed.

This drift is recorded as **GD-02** and requires **OD-07**.

### 8.5 Ledger `head`-column provenance

The current ledger's `head` column still carries the historical working-tree fingerprints:

| `head` value | Rows |
|---|---:|
| `f1caa821 HEAD; wt-sha1 2eb85043...` (component) | 77 |
| `f1caa821 HEAD; wt-sha1 47253c5d...` (pipeline) | 18 |
| `f1caa821 HEAD; wt-sha1 cbda2e02...` (schema) | 10 |
| `f1caa821 HEAD; engine tracked and unmodified` | 23 |
| `f1caa821 HEAD` (no wt-sha1) | 10 |

105 of 138 rows cite a `wt-sha1` value. Those values document the working-tree snapshot used for the evidence
capture; they are **not** a claim that the current local files still equal them. Because the current local
SHA-1s differ (section 8.3), every row that cites `wt-sha1 2eb85043...`, `47253c5d...` or `cbda2e02...` is
snapshot-bound to the earlier working tree. This is part of `GD-02`.

---

## 9. What is proven and what is not proven

### Proven

- The old snapshot is 123 rows, 92 applicable, 31 `NOT_APPLICABLE`, 92 `PASS`, 100.00%.
- The current ledger is 138 rows, 132 applicable, 6 `NOT_APPLICABLE`, 76 `PASS`, 57.58%.
- The current calculator integrity check passes.
- Every current applicable row has `C=PENDING`; every excluded row has `C=NOT_DECISIONED`.
- The current ledger contains no `C=APPROVED` or `C=REJECTED` value.
- `NOT_AVAILABLE` rows are in the denominator and are not counted as PASS.
- `PARTIAL`, `FAIL`, `BLOCKED` and `NOT_RUN` are not counted as completion.
- The Preview metadata in section 8.1 matches the preserved index.
- The old and current ledgers have zero common `req_id` values and zero exact text matches.

### Not proven

- Any per-`req_id` identity, applicability change, B change or E change across versions.
- That the "15 new requirements" are 15 specific rows.
- That the current local working tree is the deployed Preview source (it is not, per section 8.4).
- That Tool 041 is accepted, complete, or closed.
- That any remediation group is authorized or implemented.

---

## 10. Governance defects and boundaries

| ID | Defect / boundary | Status |
|---|---|---|
| `GD-01` | Disjoint ID namespaces prevent a truthful per-ID diff. | Open; OD-01 required. |
| `GD-02` | Local working tree drifted from the deployed Preview snapshot. | Open; OD-07 required. |
| `GD-03` | Old report claimed `OWNER_ACCEPTED` and filled C=APPROVED without an owner decision. | Preserved as historical defect; not repeated in current docs. |
| `GD-04` | Old report/companion files mislabeled Tool 041 as Tool 040. | Preserved as historical defect; current docs corrected. |

Authorization boundaries observed in this step:

- No commit, push, merge, rebase, deploy or redeploy.
- No Engine, Schema, Registry or Catalog change.
- No database, Supabase, RLS, W18, Session or Cloud Sync change.
- No Tool 042 start.
- Documentation and evidence files only.

---

## 11. Required next decisions

The owner decisions are listed in full in `TOOL-041-OWNER-DECISIONS.md`. The reconciliation itself requires at
minimum:

1. **OD-01** - ratify the current ledger as the sole review baseline and decide the ID-continuity policy.
2. **OD-02** - ratify the old 123-row snapshot as `superseded`.
3. **OD-03** - ratify the state semantics in section 4.
4. **OD-07** - decide how to handle the local/Preview drift before any new `E4` claim.

Until an explicit independent acceptance decision is issued:

**Tool 041 = `OWNER_REVIEW` - NOT ACCEPTED - NOT CLOSED.**

**Tool 042 = STOPPED.**
