# TOOL 041 - REQUIREMENT LEDGER CHANGE LOG (CURRENT)

**Tool:** Tool 041 - Hematocrit Monitor (`mrx.tool.041-hematocrit-monitor`)

**Status:** `OWNER_REVIEW` - **NOT ACCEPTED** - **NOT CLOSED**

**Current ledger:** `tool-041-requirements.csv` - 138 rows x 14 columns

**Current result:** 138 rows / 132 applicable / 6 `NOT_APPLICABLE` / 76 `PASS` / **76 / 132 = 57.58%**

**Owner decision (C):** `PENDING` (132) / `NOT_DECISIONED` (6). No `APPROVED` or `REJECTED` value exists.

**Tool 042:** STOPPED.

---

## 1. Purpose

This log records the transition between the historical 123-row ledger and the current 138-row ledger. It
preserves the old version as a `superseded` snapshot. It does not rewrite prior history and it does not mix the
two versions' numbers.

---

## 2. Version history

| Version | Role | Rows | Applicable | `NOT_APPLICABLE` | `B=PASS` | Completion | Ledger SHA-256 |
|---|---|---:|---:|---:|---:|---:|---|
| v1-123 | Historical, **superseded** | 123 | 92 | 31 | 92 | 92 / 92 = 100.00% | `a5f3c5a5eea7f7087edf4b5464fe8c9cfaa77bcbe46aefd592ec97aba923038f` |
| v2-138 | **Current running review** | 138 | 132 | 6 | 76 | 76 / 132 = 57.58% | `ed1e330faf571789872a8456e1caac723458912eecee8136263bc1076296450d` |

The v1-123 files are preserved byte-for-byte at:

`docs/MRX Genius Cloud Unified R6.1/evidence/tool041-ledger-versions/v1-123-superseded/`

| v1 file | Bytes | SHA-256 |
|---|---:|---|
| `tool-041-requirements.v1-123-superseded.csv` | 104,899 | `a5f3c5a5eea7f7087edf4b5464fe8c9cfaa77bcbe46aefd592ec97aba923038f` |
| `TOOL-041-ACCEPTANCE.v1-123-superseded.md` | 181,310 | `690a01ac95f37b2362b4e92db9d9efd2cab6d9f584728a4b122556a45da9e932` |
| `tool-041-ledger-change-log.v1-123-superseded.md` | 13,758 | `9e0c277962f114b476dc8523715a9487863814cc5f9ef271ce2a17fe6eb1d9e5` |
| `tool-041-acceptance-calc.v1-123-superseded.mjs` | 10,242 | `d79c51ffe699140330a1c204f6e09d9a48d2fe2eb6d39241ff065a92b714b95a` |
| `tool-041-acceptance.template.v1-123-superseded.md` | 48,850 | `aa26bef1b7af4781385d27320e5c7bf749b4976989330fc9db84070718d1f8a3` |
| `tool-041-ledger-build.v1-123-superseded.mjs` | 85,843 | `ebd99e21752b3c20bb0b572c688c3c9a2290bb5827e25a4c3cd37b5d19dff555` |
| `TOOL-041-GENIUS12-CROSSWALK.v1-123-superseded.md` | 16,575 | `db5f3489711fca4451e85c43e10be16f7692057f8283733b0ccaa6bbe98d8e6c` |
| `TOOL-041-DEVELOPMENT-PROPOSALS.v1-123-superseded.md` | 13,941 | `6811ecadd704e41eea9d64d2e773ad3166bed5292989a369e904f36fe60b87c3` |

---

## 3. Round 0 - v1-123 historical package (`superseded`)

**When:** package dated up to 2026-11-14 02:16.

**What existed:**

- 123 rows, 92 applicable, 31 `NOT_APPLICABLE`, 92 `PASS`, 92/92 = 100.00%.
- B values only `PASS` (92) and `NOT_APPLICABLE` (31).
- No `PARTIAL`, `FAIL`, `NOT_AVAILABLE`, `BLOCKED` or `NOT_RUN` rows.
- E: `E3` 89, `E2` 29, `E4` 5.
- C: `PENDING` 92, `NOT_DECISIONED` 31.

**Historical defects (preserved, not repaired):**

| ID | Defect |
|---|---|
| `HD-01` | Report title says "TOOL 040". |
| `HD-02` | Report toolId says `mrx.tool.040-hematocrit-monitor`. |
| `HD-03` | Report claims `OWNER_ACCEPTED` while C is `PENDING` on all 92 applicable rows. |
| `HD-04` | Report claims the owner approved all 92 rows without a recorded decision. |
| `HD-05` | Report cites the stale Preview URL `mrxsteroid-cwyf07kr2...`. |
| `HD-06` | Report uses the coarse 123/92/100.00% rule. |
| `HD-07` | Companion template/crosswalk/proposals/change log also say "TOOL 040". |

**Disposition:** retained verbatim as historical evidence; replaced at canonical filenames by the current
v2-138 package. The old report must not be cited as current acceptance evidence.

---

## 4. Round 1 - v2-138 current ledger

**When:** 2026-11-14 (before the reconciliation).

**What changed:**

- Fully re-atomized the requirement inventory from 123 to 138 rows.
- Introduced the mandated non-completion states (`PARTIAL`, `FAIL`, `NOT_AVAILABLE`, `BLOCKED`, `NOT_RUN`).
- Reduced `NOT_APPLICABLE` from 31 to 6, each with a specific reason and proof.
- Re-scored every applicable row with the `B=PASS and E>=E3` rule.
- Result: 76/132 = 57.58%.

**Ledger fingerprint:** `ed1e330faf571789872a8456e1caac723458912eecee8136263bc1076296450d` (78,528 bytes).

**Reproducibility:** regenerated deterministically from
`C:\Users\foryo\AppData\Local\Temp\opencode\gen-tool041-csv.mjs` (SHA-256
`6911cd4b989848e784327b4185892c2b28006f82a2d374fd3e5a8fe7c8bf62cd`), producing the exact hash above.

**Important:** the old and current `req_id` schemes are disjoint. Exact `req_id` intersection = 0; exact
normalized requirement-text intersection = 0. Therefore no per-ID change table is asserted. See
`TOOL-041-LEDGER-VERSION-RECONCILIATION.md` section 2 and defect `GD-01`.

---

## 5. Round 2 - version reconciliation (2026-11-14)

**Trigger:** owner directive accepting the Phase 3/7 package only as "submitted for review", and requiring a
documented transition between the two ledger versions.

### 5.1 What was done

| Step | Action | Result |
|---|---|---|
| 1 | Preserved all 8 old canonical files verbatim | `v1-123-superseded/`; byte-identical hashes |
| 2 | Restored the 138-row ledger from the deterministic generator | 138 rows; SHA-256 `ed1e330f...` |
| 3 | Rebuilt the calculator | integrity `OK`; 76/132 = 57.58% |
| 4 | Generated the `applicability x B x E` cross-tabulation | 138 rows; 13 non-empty cells |
| 5 | Wrote the version reconciliation | `TOOL-041-LEDGER-VERSION-RECONCILIATION.md` |
| 6 | Wrote the remediation plan (A-F, not executed) | `TOOL-041-REMEDIATION-PLAN.md` |
| 7 | Wrote the owner decisions list | `TOOL-041-OWNER-DECISIONS.md` |
| 8 | Replaced the canonical acceptance report | `TOOL-041-ACCEPTANCE.md` (`OWNER_REVIEW`) |
| 9 | Replaced the stale template/crosswalk/proposals | current versions |
| 10 | Updated the ledger integrity test to the current JSON schema | 4/4 PASS |
| 11 | Built a combined 261-row version inventory | `tool-041-ledger-version-inventory.csv` |

### 5.2 Numeric change in Round 2

**None.** The current running figure remains:

- 138 rows
- 132 applicable
- 6 `NOT_APPLICABLE`
- 76 `PASS`
- **76 / 132 = 57.58%**
- integrity `OK`

### 5.3 Findings recorded in Round 2

| ID | Finding | Status |
|---|---|---|
| `GD-01` | Disjoint ID namespaces: 0 common `req_id`; per-ID diff not determinable. | Open; OD-01 |
| `GD-02` | Current local working tree drifted from the deployed Preview snapshot. | Open; OD-07 |
| `GD-03` | Old report claimed `OWNER_ACCEPTED` and filled C=APPROVED without an owner decision. | Preserved as historical defect |
| `GD-04` | Old report/companions mislabeled Tool 041 as Tool 040. | Preserved as historical defect |

### 5.4 Source drift detail

| File | Deployed `uid` (recorded) | Current local SHA-1 |
|---|---|---|
| Component | `2eb85043c8764fec0137e9de6ae45585ddb1a455` | `4a304d7926b869ae77e19edcfff312eaf99d9649` |
| Pipeline | `47253c5d7be22b7af10bc8582fbe84583a06cb6d` | `4f94589e42fd8653340972d5c2b68e14373a5f1b` |
| Schema | `cbda2e027393af356651d27b17c2e6ea0d9471f6` | `7f65c599de97c5f683f4df7edf4881908730d7b8` |

The Preview proves the earlier working-tree snapshot, not the current local files. The current local files are
not in HEAD `f1caa8211ec52ee07b2d0bccf8f30df11e54ab59`; the component and schema are modified and the pipeline
is untracked. No deploy, redeploy, commit, push, merge or rebase was performed.

The ledger's `head` column carries the same historical provenance: 77 rows cite component `2eb85043...`, 18 cite
pipeline `47253c5d...`, 10 cite schema `cbda2e02...`, 23 say "engine tracked and unmodified", and 10 cite HEAD
only. 105 of 138 rows therefore cite a historical `wt-sha1`; those rows are snapshot-bound to the earlier working
tree and do not assert that the current local files still match.

---

## 6. Change entries

| # | Date | Change | Before | After | Reason | Evidence |
|---|---|---|---|---|---|---|
| `C-01` | 2026-11-14 | Preserve old package | Old files at canonical names | 8 files in `v1-123-superseded/` | Keep history without rewriting it | SHA-256 equality |
| `C-02` | 2026-11-14 | Restore current ledger | Old 123-row file | 138-row file | Restore the running-review baseline | `ed1e330f...` |
| `C-03` | 2026-11-14 | Rebuild calculator | Old 10,242-byte calculator | Current calculator | Match the 138-row schema and state semantics | integrity `OK` |
| `C-04` | 2026-11-14 | Add cross-tabulation | None | `.md` / `.csv` / `.json` | Show `applicability x B x E` for all 138 rows | 138 rows, 13 cells |
| `C-05` | 2026-11-14 | Add reconciliation | None | `TOOL-041-LEDGER-VERSION-RECONCILIATION.md` | Document the version transition honestly | set ops + bridge |
| `C-06` | 2026-11-14 | Add remediation plan | None | `TOOL-041-REMEDIATION-PLAN.md` | Plan A-F without executing | 56 non-completion rows |
| `C-07` | 2026-11-14 | Add owner decisions | None | `TOOL-041-OWNER-DECISIONS.md` | List open decisions | OD-01..OD-11 |
| `C-08` | 2026-11-14 | Replace old acceptance report | `OWNER_ACCEPTED`, Tool 040 header | `OWNER_REVIEW`, Tool 041 | Correct status without hiding history | `TOOL-041-ACCEPTANCE.md` |
| `C-09` | 2026-11-14 | Replace stale companions | Tool 040 headers, 123/100% | Tool 041, current figures | Remove contradictory canonical content | template/crosswalk/proposals |
| `C-10` | 2026-11-14 | Update ledger test | Old JSON field names | Current JSON schema | Keep test aligned with calculator | 4/4 PASS |

---

## 7. Current file manifest

| File | Bytes | SHA-256 |
|---|---:|---|
| `tool-041-requirements.csv` | 78,528 | `ed1e330faf571789872a8456e1caac723458912eecee8136263bc1076296450d` |
| `tool-041-acceptance-calc.mjs` | 17,113 | `fc3d933c00b4e4c1af5a46a36481308d5ae3a9052c559fa350d845225de05066` |
| `tool-041-acceptance-calc.json` | 7,246 | `bbb7fab993fe16699a39873f4f017949d7aed4da589924eef8e76e975807af6e` |
| `tool-041-ledger-crosstab.mjs` | 1,266 | `6f36307771fddd1e5d66f5e2157c97dcbd41bbc3530c3b4052305207defc607c` |
| `tool-041-ledger-crosstab.md` | 21,930 | `6aa8846ccca6e6840ec25b402223fa95d2660de828f8d65b2dc8a1c416515971` |
| `tool-041-ledger-crosstab.csv` | 19,285 | `e5668e867ebfc1f609c4b83258eccaef6a047dd27b6943534b8432df93298a16` |
| `tool-041-ledger-crosstab.json` | 52,693 | `7a8357ae4f869d56dae7d97c69f45f89fc428dcb1985ec22cbfd5d8d2284d74c` |
| `tool-041-ledger-version-inventory.csv` | 64,481 | `05a0fa198924a91e8c3a043830422b64a90a2aba651b06bc2a7070e4aee52236` |
| `TOOL-041-LEDGER-VERSION-RECONCILIATION.md` | 25,852 | `934b2cdd1c7650f9b70a81bb0dee804834c1b2db6624bd628a6e107f5378883b` |
| `TOOL-041-REMEDIATION-PLAN.md` | 19,249 | `3d28ed32bc15dac2e5d637f45e7a34f2f7c4f55655eebe39c2593534e4e7bc7e` |
| `TOOL-041-OWNER-DECISIONS.md` | 12,626 | `608cb24a1d8d13103d99fa961edca9984c9005789112570eaa1f039a48cedcdd` |
| `TOOL-041-ACCEPTANCE.md` | 8,961 | `b1c8f485f6a8529d6b65c8ab0fa9f92beba2ef46b137e702122980320af9f4b4` |
| `tool-041-acceptance.template.md` | 2,126 | `e2924d9fbee7020840e3d7aa225c847fd23ec07315110a87445d60eb42bd2068` |
| `TOOL-041-GENIUS12-CROSSWALK.md` | 3,795 | `0d0950f0e9d71c7ce2b887e27ace84656dfc2a3efb78bb2c8886f7a7e0183bf9` |
| `TOOL-041-DEVELOPMENT-PROPOSALS.md` | 2,698 | `8d4a4028693f2fb7f2540aff80729c5d44e1629828e538d7a8b69214b46c3c06` |
| `tests/unit/tool-041-acceptance-evidence-ledger.test.ts` | see manifest | `c7e32ea586aa88cdfd12a03281af28185abf2cd89ac39f5a32ce39d93943ac24` |

The change log's own hash is recorded in `tool-041-deliverable-manifest.json`.

---

## 8. What did not change

- No source code under `components/`, `lib/`, `app/` was modified by Round 2.
- No Engine, Schema, Registry or Catalog change.
- No database, Supabase, RLS, W18, Session or Cloud Sync change.
- No commit, push, merge, rebase, deploy or redeploy.
- No Tool 042 start.
- No owner decision was recorded or filled.
- The completion figure did not change: **76 / 132 = 57.58%**.

---

## 9. Open items

| Item | Owner |
|---|---|
| `OD-01` ID-continuity policy and review baseline | Owner |
| `OD-02` Ratify v1-123 as `superseded` | Owner |
| `OD-03` Ratify state semantics | Owner |
| `OD-04` CORE-5/GENIUS-12 closure target | Owner |
| `OD-05` Medical review mandate | Owner |
| `OD-06` Code-change authorization | Owner |
| `OD-07` Local/Preview drift | Owner |
| `OD-08` History/W18 storage exception | Owner |
| `OD-09` DEGRADED state | Owner |
| `OD-10` Final acceptance | Owner |
| `OD-11` Treatment of the mislabeled old report | Owner |

---

## 10. Status

**Tool 041:** `OWNER_REVIEW` - **NOT ACCEPTED** - **NOT CLOSED**.

**Tool 042:** **STOPPED**.

**Implementation:** none authorized, none performed.
