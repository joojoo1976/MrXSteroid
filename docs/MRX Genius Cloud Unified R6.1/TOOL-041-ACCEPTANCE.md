# TOOL 041 - ACCEPTANCE MATRIX (R6.1) - EVIDENCE RECONCILIATION

**Tool:** Tool 041 - Hematocrit Monitor (`mrx.tool.041-hematocrit-monitor`)

**Canonical route:** `/smarttools/medical-monitoring/tool-041-hematocrit-monitor`

**Status:** `OWNER_REVIEW` - **NOT ACCEPTED** - **NOT CLOSED**

**Owner decision (C):** `PENDING` on all 132 applicable rows; `NOT_DECISIONED` on all 6 excluded rows.

**Report date:** 2026-11-14

**Tool 042:** **STOPPED** - not started.

> This report supersedes the mislabeled 123-row report that claimed `OWNER_ACCEPTED`. The old report is preserved
> verbatim at `evidence/tool041-ledger-versions/v1-123-superseded/TOOL-041-ACCEPTANCE.v1-123-superseded.md`.
> The old report is historical evidence, not current status.

---

## 1. Identity and scope

| Field | Value |
|---|---|
| Tool ID | `mrx.tool.041-hematocrit-monitor` |
| Canonical slug | `tool-041-hematocrit-monitor` |
| Route | `/smarttools/medical-monitoring/tool-041-hematocrit-monitor` |
| Registry entry | present (`lib/tools/registry.ts`, `lib/tools/smartToolsCatalog6.ts`) |
| Authoritative engine | `lib/tools/engines/tool-041-hematocrit-monitor.ts` |
| Single calculation pipeline | `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.ts` |
| Input/schema contract | `lib/tools/schemas/tool-041-hematocrit-monitor.ts` |
| UI | `components/tools/tool-041-hematocrit-monitor.tsx` and its genius/visual variants |
| Ledger | `tool-041-requirements.csv` - 138 rows x 14 columns |

---

## 2. Ledger and fingerprint

| Field | Value |
|---|---|
| Rows | 138 |
| Unique `req_id` | 138 |
| Applicable | 132 |
| `NOT_APPLICABLE` (with reason + proof) | 6 |
| Ledger SHA-256 | `ed1e330faf571789872a8456e1caac723458912eecee8136263bc1076296450d` |
| Ledger bytes | 78,528 |
| Calculator | `tool-041-acceptance-calc.mjs` |
| Calculator result | `tool-041-acceptance-calc.json` |
| Cross-tabulation | `tool-041-ledger-crosstab.md` / `.csv` / `.json` |
| Reconciliation | `TOOL-041-LEDGER-VERSION-RECONCILIATION.md` |
| Remediation plan | `TOOL-041-REMEDIATION-PLAN.md` |
| Owner decisions | `TOOL-041-OWNER-DECISIONS.md` |

---

## 3. Completion calculation

**Formula:**

`(applicable rows with B=PASS and E>=E3) / applicable rows x 100`

**Calculation:**

`76 / 132 x 100 = 57.5757...% -> 57.58%`

| Metric | Value |
|---|---:|
| Completion numerator | 76 |
| Completion denominator | 132 |
| Completion | **57.58%** |
| Integrity | **OK** |

The denominator excludes **only** `NOT_APPLICABLE` rows that carry a specific reason and their own proof.
`NOT_AVAILABLE` stays in the denominator. `PARTIAL`, `FAIL`, `BLOCKED` and `NOT_RUN` are never completion.

---

## 4. State distribution

### 4.1 B states

| B | Rows |
|---|---:|
| `PASS` | 76 |
| `PARTIAL` | 32 |
| `FAIL` | 9 |
| `NOT_AVAILABLE` | 12 |
| `BLOCKED` | 2 |
| `NOT_RUN` | 1 |
| `NOT_APPLICABLE` | 6 |
| **Total** | **138** |

### 4.2 E levels

| E | All rows | Applicable only |
|---|---:|---:|
| `E0` | 1 | 1 |
| `E1` | 1 | 1 |
| `E2` | 26 | 20 |
| `E3` | 86 | 86 |
| `E4` | 24 | 24 |

### 4.3 Owner decision (C)

| C | Rows |
|---|---:|
| `PENDING` | 132 |
| `NOT_DECISIONED` | 6 |
| `APPROVED` | 0 |
| `REJECTED` | 0 |

No owner approval is recorded anywhere in the current ledger.

---

## 5. Cross-tabulation summary (`applicability x B x E`)

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

The full per-row table is in `tool-041-ledger-crosstab.md` and `tool-041-ledger-crosstab.csv`.

---

## 6. Family distribution

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

---

## 7. Evidence inventory

| Evidence | Path | Result |
|---|---|---|
| Focused unit tests | `evidence/tool041-verification/tool041-focused-tests.log` | 30/30 PASS (4 files) |
| TypeScript | `evidence/tool041-verification/` | `tsc --noEmit` exit 0 |
| ESLint | `evidence/tool041-verification/` | exit 0, 0 errors, 5 warnings |
| i18n parity | `evidence/tool041-verification/` | AR/EN 15/15 |
| Local harness | `evidence/tool041/` | 18/18 PASS |
| Published Preview harness | `evidence/tool041-published/` | 18/18 PASS |
| Desktop / mobile / Arabic screenshots | `evidence/tool041-published/` | captured |
| Calculator | `tool-041-acceptance-calc.mjs` | integrity OK |
| Cross-tabulation | `tool-041-ledger-crosstab.*` | 138 rows |
| Ledger test | `tests/unit/tool-041-acceptance-evidence-ledger.test.ts` | 4/4 PASS |

`E4` is evidence strength, not acceptance. `E4` does not equal `OWNER_ACCEPTED`.

All verification evidence above was captured against the earlier working-tree snapshot whose `wt-sha1` values
are recorded in section 8. It is **not** a re-run against the current local files. See `GD-02` / `OD-07`.

---

## 8. Preview and source linkage (with drift disclosure)

| Field | Value |
|---|---|
| Deployment ID | `dpl_3an5zZFr4R9WaQx7CCWngv6KnG9R` |
| Status | READY |
| Target | `preview` (no production, no promotion) |
| `productionUrl` | `null` |
| Protection | `vercel_authentication` enabled and unchanged |
| Created | 2026-11-13 22:44:14 +0200 |
| URL | `https://mrxsteroid-be8zay3tl-georges-projects-78ef250b.vercel.app` |
| Source HEAD field | `f1caa8211ec52ee07b2d0bccf8f30df11e54ab59` (changes were in the working tree) |

Recorded deployed `uid` values (historical linkage evidence):

| File | Deployed `uid` |
|---|---|
| Component | `2eb85043c8764fec0137e9de6ae45585ddb1a455` |
| Pipeline | `47253c5d7be22b7af10bc8582fbe84583a06cb6d` |
| Schema | `cbda2e027393af356651d27b17c2e6ea0d9471f6` |

Current local SHA-1 values (observed at reconciliation time):

| File | Current local SHA-1 | Matches deployed? |
|---|---|---|
| Component | `4a304d7926b869ae77e19edcfff312eaf99d9649` | No |
| Pipeline | `4f94589e42fd8653340972d5c2b68e14373a5f1b` | No |
| Schema | `7f65c599de97c5f683f4df7edf4881908730d7b8` | No |

**Finding:** the local working tree has drifted from the deployed Preview snapshot. The Preview proves the
earlier snapshot, not the current local files. The local files are not in Git HEAD: the component and schema are
modified and the pipeline is untracked. No claim is made that local code is part of HEAD.

The ledger's own `head` column corroborates this: 77 rows cite component `wt-sha1 2eb85043...`, 18 cite pipeline
`47253c5d...`, 10 cite schema `cbda2e02...`, 23 say "engine tracked and unmodified", and 10 cite HEAD only.
105 of 138 rows therefore cite a historical working-tree fingerprint. They document the snapshot used for the
evidence capture, not the current local files.

No commit, push, merge, rebase, deploy or redeploy was performed in this step. Re-validating the current local
files would require a new Preview under a separate authorization (OD-07).

---

## 9. What this report proves

- The current ledger has 138 rows, 132 applicable, 6 `NOT_APPLICABLE`, 76 `PASS`, and 57.58% completion.
- The calculator integrity check passes.
- Every applicable row keeps `C=PENDING`; every excluded row keeps `C=NOT_DECISIONED`.
- No `C=APPROVED` or `C=REJECTED` value exists.
- `NOT_AVAILABLE` is in the denominator and is not PASS.
- `PARTIAL`, `FAIL`, `BLOCKED` and `NOT_RUN` are not completion.
- The old 123-row ledger is a historical `superseded` snapshot.
- The old report's `OWNER_ACCEPTED` claim is a historical defect, not a current status.

## 10. What this report does not prove

- That Tool 041 is accepted, complete or closed.
- That the current local code is the deployed Preview source.
- That the "15 new requirements" are 15 individually identifiable rows.
- That any remediation group is authorized or implemented.

---

## 11. Current status

**Tool 041:** `OWNER_REVIEW` - **NOT ACCEPTED** - **NOT CLOSED**.

**Owner decision:** `PENDING` (132) / `NOT_DECISIONED` (6).

**Tool 042:** **STOPPED**.

**Next step:** the owner reviews `TOOL-041-LEDGER-VERSION-RECONCILIATION.md`,
`TOOL-041-REMEDIATION-PLAN.md` and `TOOL-041-OWNER-DECISIONS.md`, then records decisions in
`TOOL-041-OWNER-DECISIONS.md`.
