# TOOL 041 — EVIDENCE FINGERPRINT MATRIX (PER REQUIREMENT)

**Tool:** Tool 041 — Hematocrit Monitor (`mrx.tool.041-hematocrit-monitor`)

**Status:** `OWNER_REVIEW` — **NOT ACCEPTED** — **NOT CLOSED**

**Artifact date:** 2026-11-14

**Companion CSV:** `tool-041-evidence-fingerprint-matrix.csv` (138 rows, one per ledger requirement)

**Rule enforced by this artifact:** evidence produced on one source version is **not** counted as evidence for a
different version. Every row below is bound to the fingerprint the ledger cited, compared with the fingerprint of
the code that exists **now** — separately for the published Preview and for the current Working Tree.

> This artifact changes no source file, no engine, no schema, no threshold, and no ledger state. It does not
> promote a single row to `PASS`. The declared arithmetic remains `76 / 132 = 57.58%`.

---

## 0. Why this table exists

The ledger's `head` column was written at different times against different source snapshots. Six source
fingerprints appear across its 138 rows:

- three **historical Working Tree snapshots** (`wt-sha1` for the component, the pipeline and the schema);
- the **engine as "HEAD tracked"**;
- **HEAD only**, with no file snapshot;
- rows with no file binding at all (`NA-04`).

The published Preview was built from one of those snapshots. The current Working Tree has since drifted: the
component and schema are modified, the pipeline and its tests are untracked, and the engine and i18n dictionary are
unchanged. Treating any historical row as automatic proof of the current code would be a false claim, so this
matrix separates the two.

---

## 1. Measured fingerprints (2026-11-14)

### 1.1 Source under review

| File | HEAD blob | Current local SHA-1 | Git state | Delta vs ledger snapshot |
|---|---|---|---|---|
| `components/tools/tool-041-hematocrit-monitor.tsx` | `5a8c7a0a93892cc924e6a8eba176677f89c7c64f` | `4a304d7926b869ae77e19edcfff312eaf99d9649` | `M` (modified) | **DRIFT** from `2eb85043…` |
| `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.ts` | — (not in HEAD) | `4f94589e42fd8653340972d5c2b68e14373a5f1b` | `??` (untracked) | **DRIFT** from `47253c5d…` |
| `lib/tools/schemas/tool-041-hematocrit-monitor.ts` | `f1a07b95ba80f39e4b6868fe3976b1734c76ad8d` | `7f65c599de97c5f683f4df7edf4881908730d7b8` | `M` (modified) | **DRIFT** from `cbda2e02…` |
| `lib/tools/engines/tool-041-hematocrit-monitor.ts` | `db55a023f747ba79d0509f88523ba4e538942abb` | `db55a023f747ba79d0509f88523ba4e538942abb` | clean | **MATCH** (HEAD = local) |
| `i18n/tool-041-hematocrit-monitor.json` | `c937cb02df4ead2bfadd93ceb25c2347673713d3` | `c937cb02df4ead2bfadd93ceb25c2347673713d3` | clean | **MATCH** (HEAD = local) |

### 1.2 Test files executed for the current-local battery

| Test file | HEAD blob | Current local SHA-1 | Git state |
|---|---|---|---|
| `lib/tools/engines/tool-041-hematocrit-monitor.test.ts` | `4981e76372…` | `4981e76372…` | clean |
| `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.test.ts` | — (not in HEAD) | `f0d7f5ca4d…` | `??` (untracked) |
| `tests/unit/tool-041-acceptance-evidence.test.ts` | — (not in HEAD) | `634b66cabc…` | `??` (untracked) |
| `tests/unit/tool-041-acceptance-evidence-ledger.test.ts` | — (not in HEAD) | `c72068020f…` | `??` (untracked) |
| `components/tools/tool-041-060-header-preferences.test.tsx` | `73f1decf32…` | `73f1decf32…` | clean |

### 1.3 Snapshot fingerprints cited by the ledger

| Source | Ledger `wt-sha1` | Current HEAD | Current local | Status |
|---|---|---|---|---|
| Component | `2eb85043c8764fec0137e9de6ae45585ddb1a455` | `5a8c7a0a…` | `4a304d79…` | historical snapshot only |
| Pipeline | `47253c5d7be22b7af10bc8582fbe84583a06cb6d` | not in HEAD | `4f94589e…` | historical snapshot only |
| Schema | `cbda2e027393af356651d27b17c2e6ea0d9471f6` | `f1a07b95…` | `7f65c599…` | historical snapshot only |

**No cited snapshot equals HEAD, and none equals the current local file.**

---

## 2. Evidence classes (all 138 rows)

| Evidence class | Rows | Applies to current local? | Meaning |
|---|---:|---|---|
| `WT_VERIFICATION_LOG` | 50 | No — historical Working Tree run, not re-run per row | Working Tree verification log (historical run) |
| `PREVIEW_PUBLISHED` | 21 | No — bound to the deployed Preview | Published Preview artifact (deployment `dpl_3an5zZFr4R9WaQx7CCWngv6KnG9R`) |
| `WT_LOCAL_HARNESS` | 57 | No — historical Working Tree run, not re-run per row | Working Tree local harness JSON |
| `DOC_OR_REGISTER` | 10 | No — metadata/register only, not execution evidence | Deployment metadata, system register, or git forensic log |

Only the 21 `PREVIEW_PUBLISHED` rows have a deployed-URL artifact. The other 117 rows rest on Working Tree logs,
local harness JSON, deployment metadata or the system register. **None of the four classes is native to the
current local code**; the current-local battery is a separate, new artifact (section 4).

---

## 3. Binding status (all 138 rows)

| Binding status | Rows | Meaning |
|---|---:|---|
| `DRIFT` | 83 | Ledger cites a component or schema snapshot that differs from both current HEAD and current local. |
| `DRIFT_LOCAL_UNTRACKED` | 17 | Ledger cites a pipeline snapshot; the pipeline file is not in HEAD and its local content differs from the cited snapshot. |
| `HEAD_TRACKED_MATCH` | 23 | Ledger cites the engine as HEAD-tracked; current local engine SHA-1 equals HEAD. |
| `HEAD_ONLY_UNTRACKED` | 9 | Ledger cites HEAD only, with no file snapshot to bind the evidence to. |
| `NOT_APPLICABLE` | 6 | Tool-level exception; see the NA pinning document. |

Read plainly:

- **100 applicable rows** (83 `DRIFT` + 17 `DRIFT_LOCAL_UNTRACKED`) cite a file snapshot that is neither HEAD nor
  the current local file. Their evidence is historical and must be re-derived before it can count.
- **23 rows** are engine-tracked; the engine is byte-identical between HEAD and local, so those rows are the only
  ones whose cited source still exists unchanged.
- **9 rows** cite `HEAD` only and have no file fingerprint to bind to at all.
- **6 rows** are `NOT_APPLICABLE` and are pinned in `TOOL-041-NOT-APPLICABLE-PINNING.md`.

---

## 4. Current-local Working Tree evidence (new, 2026-11-14)

Captured in `evidence/tool041-verification-current/`:

| Check | Command | Result | Log |
|---|---|---|---|
| Focused battery | `npx vitest run` on 5 Tool 041 test files | **5 files / 34 tests PASS** | `tool041-focused-tests-current.log` |
| TypeScript | `npx tsc --noEmit` | exit `0` | `tool041-tsc-current.log` |
| ESLint | `npx eslint` on the 5 source/test files | exit `0`, **0 errors**, 3 warnings | `tool041-eslint-current.log` |
| Storage/network scan | `Select-String` over the 5 source files | **no storage, network, session or DB call** (one comment says "no Supabase") | `tool041-storage-network-scan-current.txt` |
| Fingerprints | `git hash-object` vs `git rev-parse HEAD:` | recorded above | `source-fingerprints-current.json` |

ESLint warnings, all non-blocking and recorded without suppression:

1. `components/tools/tool-041-hematocrit-monitor.tsx:58` — `setState` called synchronously in an effect
   (`set-validation-error` pattern).
2. The same file's test-file warning is ignored by project config (not a Tool 041 behavior).
3. `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.ts:21` — unused `HematocritResultSchema` import (this is the
   exact gap behind `SCH-08` / `PIPE-12`).

**Scope limit of the battery:** it proves the cited test files execute and pass against the current local tree. It
does **not** prove each individual requirement at assertion level, and it does **not** update the ledger. It is
classified per row as `TEST_FILE_EXECUTED_CURRENT_LOCAL`, never as `PASS`.

---

## 5. Published Preview evidence (21 rows)

Deployment: `dpl_3an5zZFr4R9WaQx7CCWngv6KnG9R` — `READY`, target `preview`, `productionUrl: null`, protection
enabled. URL: `https://mrxsteroid-be8zay3tl-georges-projects-78ef250b.vercel.app`.

A `TEST_FILE_EXECUTED_CURRENT_LOCAL` mark on a Preview row means only that a test file cited in that row also exists
locally and ran in the current battery. It does **not** revalidate the Preview artifact itself.

| req_id | B | E | Preview artifact | Binding | Current-local status |
|---|---|---|---|---|---|
| ID-03 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `NO_CURRENT_LOCAL_TEST_FILE` |
| ID-06 | PASS | E4 | `tool-041-browser-verification.json` | `HEAD_ONLY_UNTRACKED` | `NO_CURRENT_LOCAL_TEST_FILE` |
| SCH-03 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `TEST_FILE_EXECUTED_CURRENT_LOCAL` |
| STATE-03 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `TEST_FILE_EXECUTED_CURRENT_LOCAL` |
| STATE-04 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `TEST_FILE_EXECUTED_CURRENT_LOCAL` |
| STATE-08 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `TEST_FILE_EXECUTED_CURRENT_LOCAL` |
| CORE-08 | PARTIAL | E3 | `tool-041-browser-verification.json` | `DRIFT` | `TEST_FILE_EXECUTED_CURRENT_LOCAL` |
| G12-01 | PARTIAL | E4 | `tool-041-browser-verification.json` | `DRIFT` | `NO_CURRENT_LOCAL_TEST_FILE` |
| A11Y-01 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `TEST_FILE_EXECUTED_CURRENT_LOCAL` |
| A11Y-03 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `NO_CURRENT_LOCAL_TEST_FILE` |
| A11Y-04 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `NO_CURRENT_LOCAL_TEST_FILE` |
| A11Y-05 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `NO_CURRENT_LOCAL_TEST_FILE` |
| A11Y-06 | PARTIAL | E2 | `tool-041-browser-verification.json` | `DRIFT` | `TEST_FILE_EXECUTED_CURRENT_LOCAL` |
| RESP-01 | PASS | E4 | `tool-041-desktop-1440.png` | `DRIFT` | `NO_CURRENT_LOCAL_TEST_FILE` |
| RESP-02 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `NO_CURRENT_LOCAL_TEST_FILE` |
| RESP-03 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `NO_CURRENT_LOCAL_TEST_FILE` |
| RESP-04 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `NO_CURRENT_LOCAL_TEST_FILE` |
| PRIV-05 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `NO_CURRENT_LOCAL_TEST_FILE` |
| PRIV-06 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `NO_CURRENT_LOCAL_TEST_FILE` |
| TEST-09 | PASS | E4 | `tool-041-browser-verification.json` | `DRIFT` | `NO_CURRENT_LOCAL_TEST_FILE` |
| DEP-07 | PASS | E3 | `tool-041-browser-verification.json` | `DRIFT` | `NO_CURRENT_LOCAL_TEST_FILE` |

These 21 rows are valid **Preview** evidence for the deployed snapshot. They are **not** current-local evidence,
and none of them is re-labelled by this artifact.

---

## 6. Per-requirement matrix (138 rows)

Columns:

- `Evidence class` — `PREVIEW_PUBLISHED` / `WT_VERIFICATION_LOG` / `WT_LOCAL_HARNESS` / `DOC_OR_REGISTER`.
- `Ledger binding` — which source the ledger's `head` cites.
- `Snapshot SHA-1` / `Current local SHA-1` — the compared fingerprints.
- `Binding` — `DRIFT`, `DRIFT_LOCAL_UNTRACKED`, `HEAD_TRACKED_MATCH`, `HEAD_ONLY_UNTRACKED`, `NOT_APPLICABLE`.
- `Preview evidence` / `WT evidence` — mutually exclusive by class.
- `Current-local status` — `TEST_FILE_EXECUTED_CURRENT_LOCAL` (the cited test file is in the current battery and
  passed), `NO_CURRENT_LOCAL_TEST_FILE`, or `NOT_APPLICABLE`.

| req_id | B | E | Evidence class | Ledger binding | Snapshot SHA-1 | Current local SHA-1 | Binding | Preview evidence | WT evidence | Current-local test file(s) | Current-local status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ID-01 | PASS | E3 | WT_VERIFICATION_LOG | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ID-02 | PASS | E3 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ID-03 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | — | NO_CURRENT_LOCAL_TEST_FILE |
| ID-04 | PASS | E3 | WT_LOCAL_HARNESS | HEAD_ONLY | — | — | HEAD_ONLY_UNTRACKED | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| ID-05 | PASS | E3 | WT_VERIFICATION_LOG | HEAD_ONLY | — | — | HEAD_ONLY_UNTRACKED | — | `tool041-i18n-registry-checks.log` | — | NO_CURRENT_LOCAL_TEST_FILE |
| ID-06 | PASS | E4 | PREVIEW_PUBLISHED | HEAD_ONLY | — | — | HEAD_ONLY_UNTRACKED | `tool-041-browser-verification.json` | — | — | NO_CURRENT_LOCAL_TEST_FILE |
| ID-07 | PASS | E3 | WT_LOCAL_HARNESS | HEAD_ONLY | — | — | HEAD_ONLY_UNTRACKED | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| ID-08 | PASS | E3 | WT_LOCAL_HARNESS | HEAD_ONLY | — | — | HEAD_ONLY_UNTRACKED | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| ID-09 | PASS | E3 | WT_LOCAL_HARNESS | HEAD_ONLY | — | — | HEAD_ONLY_UNTRACKED | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| ID-10 | PASS | E3 | WT_LOCAL_HARNESS | HEAD_ONLY | — | — | HEAD_ONLY_UNTRACKED | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| ID-11 | PASS | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ID-12 | PASS | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| SCH-01 | PASS | E3 | WT_VERIFICATION_LOG | SCHEMA_SNAPSHOT | cbda2e027393… | 7f65c599de97… | DRIFT | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| SCH-02 | PARTIAL | E2 | WT_VERIFICATION_LOG | SCHEMA_SNAPSHOT | cbda2e027393… | 7f65c599de97… | DRIFT | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| SCH-03 | PASS | E4 | PREVIEW_PUBLISHED | SCHEMA_SNAPSHOT | cbda2e027393… | 7f65c599de97… | DRIFT | `tool-041-browser-verification.json` | — | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| SCH-04 | PARTIAL | E2 | WT_LOCAL_HARNESS | SCHEMA_SNAPSHOT | cbda2e027393… | 7f65c599de97… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| SCH-05 | PASS | E3 | WT_VERIFICATION_LOG | SCHEMA_SNAPSHOT | cbda2e027393… | 7f65c599de97… | DRIFT | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| SCH-06 | PASS | E3 | WT_VERIFICATION_LOG | SCHEMA_SNAPSHOT | cbda2e027393… | 7f65c599de97… | DRIFT | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| SCH-07 | PARTIAL | E2 | WT_LOCAL_HARNESS | SCHEMA_SNAPSHOT | cbda2e027393… | 7f65c599de97… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| SCH-08 | FAIL | E3 | WT_VERIFICATION_LOG | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool041-eslint.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| SCH-09 | PARTIAL | E2 | WT_LOCAL_HARNESS | SCHEMA_SNAPSHOT | cbda2e027393… | 7f65c599de97… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| SCH-10 | PARTIAL | E1 | WT_LOCAL_HARNESS | SCHEMA_SNAPSHOT | cbda2e027393… | 7f65c599de97… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-01 | PASS | E3 | WT_VERIFICATION_LOG | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-02 | PARTIAL | E3 | WT_LOCAL_HARNESS | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-03 | PASS | E3 | WT_VERIFICATION_LOG | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-04 | PARTIAL | E2 | WT_LOCAL_HARNESS | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-05 | PASS | E3 | WT_VERIFICATION_LOG | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-06 | PASS | E3 | WT_VERIFICATION_LOG | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-07 | PASS | E3 | WT_VERIFICATION_LOG | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-08 | PASS | E3 | WT_VERIFICATION_LOG | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-09 | PASS | E3 | WT_VERIFICATION_LOG | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-10 | PARTIAL | E2 | WT_LOCAL_HARNESS | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-11 | PARTIAL | E3 | WT_VERIFICATION_LOG | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-12 | PASS | E3 | WT_VERIFICATION_LOG | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-13 | PASS | E3 | WT_VERIFICATION_LOG | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-14 | PARTIAL | E2 | WT_LOCAL_HARNESS | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-15 | PASS | E3 | WT_VERIFICATION_LOG | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| ENG-16 | PARTIAL | E2 | WT_LOCAL_HARNESS | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PIPE-01 | PASS | E3 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-acceptance-evidence.tes… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PIPE-02 | PASS | E3 | WT_VERIFICATION_LOG | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PIPE-03 | PASS | E3 | WT_VERIFICATION_LOG | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PIPE-04 | PASS | E3 | WT_VERIFICATION_LOG | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PIPE-05 | PASS | E3 | WT_VERIFICATION_LOG | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PIPE-06 | PASS | E3 | WT_VERIFICATION_LOG | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PIPE-07 | PARTIAL | E3 | WT_LOCAL_HARNESS | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PIPE-08 | PASS | E3 | WT_VERIFICATION_LOG | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PIPE-09 | PARTIAL | E2 | WT_LOCAL_HARNESS | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PIPE-10 | PASS | E3 | WT_VERIFICATION_LOG | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PIPE-11 | PASS | E3 | WT_LOCAL_HARNESS | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PIPE-12 | FAIL | E3 | WT_VERIFICATION_LOG | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool041-eslint.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| STATE-01 | FAIL | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| STATE-02 | PARTIAL | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| STATE-03 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| STATE-04 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| STATE-05 | NOT_AVAILABLE | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| STATE-06 | PARTIAL | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| STATE-07 | PARTIAL | E2 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| STATE-08 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| STATE-09 | PARTIAL | E2 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| STATE-10 | FAIL | E2 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| CORE-01 | PARTIAL | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| CORE-02 | NOT_AVAILABLE | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| CORE-03 | PARTIAL | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| CORE-04 | NOT_AVAILABLE | E3 | WT_LOCAL_HARNESS | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| CORE-05 | NOT_AVAILABLE | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| CORE-06 | FAIL | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| CORE-07 | PARTIAL | E3 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool041-i18n-registry-checks.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| CORE-08 | PARTIAL | E3 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| G12-01 | PARTIAL | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | — | NO_CURRENT_LOCAL_TEST_FILE |
| G12-02 | NOT_AVAILABLE | E2 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| G12-03 | PARTIAL | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| G12-04 | NOT_AVAILABLE | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| G12-05 | PARTIAL | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| G12-06 | NOT_AVAILABLE | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| G12-07 | NOT_AVAILABLE | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| G12-08 | PARTIAL | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| G12-09 | NOT_AVAILABLE | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| G12-10 | NOT_AVAILABLE | E3 | WT_LOCAL_HARNESS | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| G12-11 | NOT_AVAILABLE | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| G12-12 | BLOCKED | E2 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-acceptance-evidence.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| G12-13 | NOT_AVAILABLE | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| A11Y-01 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| A11Y-02 | PASS | E3 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool041-focused-tests.log` | tool-041-060-header-preferences.test.tsx | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| A11Y-03 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | — | NO_CURRENT_LOCAL_TEST_FILE |
| A11Y-04 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | — | NO_CURRENT_LOCAL_TEST_FILE |
| A11Y-05 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | — | NO_CURRENT_LOCAL_TEST_FILE |
| A11Y-06 | PARTIAL | E2 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| A11Y-07 | PARTIAL | E2 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| A11Y-08 | PARTIAL | E2 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| I18N-01 | PASS | E3 | WT_VERIFICATION_LOG | SCHEMA_SNAPSHOT | cbda2e027393… | 7f65c599de97… | DRIFT | — | `tool041-i18n-registry-checks.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| I18N-02 | FAIL | E3 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool041-i18n-registry-checks.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| I18N-03 | FAIL | E3 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool041-i18n-registry-checks.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| I18N-04 | FAIL | E2 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| I18N-05 | PARTIAL | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| RESP-01 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-desktop-1440.png` | — | — | NO_CURRENT_LOCAL_TEST_FILE |
| RESP-02 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | — | NO_CURRENT_LOCAL_TEST_FILE |
| RESP-03 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | — | NO_CURRENT_LOCAL_TEST_FILE |
| RESP-04 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | — | NO_CURRENT_LOCAL_TEST_FILE |
| RESP-05 | NOT_RUN | E0 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| PRIV-01 | PASS | E3 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-acceptance-evidence.tes… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PRIV-02 | PASS | E3 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool041-focused-tests.log` | tool-041-acceptance-evidence.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PRIV-03 | PASS | E3 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool041-focused-tests.log` | tool-041-acceptance-evidence.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PRIV-04 | PASS | E3 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool041-focused-tests.log` | tool-041-acceptance-evidence.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| PRIV-05 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | — | NO_CURRENT_LOCAL_TEST_FILE |
| PRIV-06 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | — | NO_CURRENT_LOCAL_TEST_FILE |
| PRIV-07 | PASS | E3 | WT_LOCAL_HARNESS | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| MED-01 | PASS | E3 | WT_VERIFICATION_LOG | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| MED-02 | PARTIAL | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| MED-03 | PARTIAL | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| MED-04 | FAIL | E2 | WT_LOCAL_HARNESS | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| MED-05 | PASS | E3 | WT_VERIFICATION_LOG | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| MED-06 | PARTIAL | E3 | WT_LOCAL_HARNESS | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| MED-07 | BLOCKED | E2 | WT_LOCAL_HARNESS | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| MED-08 | PASS | E3 | DOC_OR_REGISTER | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `git status --porcelain=v1 (session fore…` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| TEST-01 | PASS | E3 | WT_VERIFICATION_LOG | ENGINE_HEAD_TRACKED | db55a023f747… | db55a023f747… | HEAD_TRACKED_MATCH | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| TEST-02 | PASS | E3 | WT_VERIFICATION_LOG | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | DRIFT_LOCAL_UNTRACKED | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| TEST-03 | PASS | E3 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool041-focused-tests.log` | tool-041-060-header-preferences.test.tsx | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| TEST-04 | PASS | E3 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool041-focused-tests.log` | tool-041-acceptance-evidence.test.ts | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| TEST-05 | PASS | E3 | WT_VERIFICATION_LOG | HEAD_ONLY | — | — | HEAD_ONLY_UNTRACKED | — | `tool041-tsc.log` | — | NO_CURRENT_LOCAL_TEST_FILE |
| TEST-06 | PASS | E3 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool041-eslint.log` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| TEST-07 | PASS | E4 | DOC_OR_REGISTER | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `dpl_3an5zZFr4R9WaQx7CCWngv6KnG9R` | — | NO_CURRENT_LOCAL_TEST_FILE |
| TEST-08 | PASS | E3 | WT_LOCAL_HARNESS | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `tool-041-browser-verification.json` | — | NO_CURRENT_LOCAL_TEST_FILE |
| TEST-09 | PASS | E4 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | — | NO_CURRENT_LOCAL_TEST_FILE |
| TEST-10 | PASS | E3 | DOC_OR_REGISTER | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `Vercel v6 deployments files API for dpl…` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | TEST_FILE_EXECUTED_CURRENT_LOCAL |
| TEST-11 | PASS | E3 | WT_VERIFICATION_LOG | HEAD_ONLY | — | — | HEAD_ONLY_UNTRACKED | — | `tool041-focused-tests.log` | — | NO_CURRENT_LOCAL_TEST_FILE |
| DEP-01 | PASS | E4 | DOC_OR_REGISTER | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `dpl_3an5zZFr4R9WaQx7CCWngv6KnG9R` | — | NO_CURRENT_LOCAL_TEST_FILE |
| DEP-02 | PASS | E4 | DOC_OR_REGISTER | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `dpl_3an5zZFr4R9WaQx7CCWngv6KnG9R` | — | NO_CURRENT_LOCAL_TEST_FILE |
| DEP-03 | PASS | E4 | DOC_OR_REGISTER | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `dpl_3an5zZFr4R9WaQx7CCWngv6KnG9R` | — | NO_CURRENT_LOCAL_TEST_FILE |
| DEP-04 | PASS | E4 | DOC_OR_REGISTER | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `dpl_3an5zZFr4R9WaQx7CCWngv6KnG9R` | — | NO_CURRENT_LOCAL_TEST_FILE |
| DEP-05 | PASS | E3 | DOC_OR_REGISTER | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `Vercel v6 deployments files API for dpl…` | — | NO_CURRENT_LOCAL_TEST_FILE |
| DEP-06 | PASS | E4 | DOC_OR_REGISTER | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | — | `dpl_3an5zZFr4R9WaQx7CCWngv6KnG9R` | — | NO_CURRENT_LOCAL_TEST_FILE |
| DEP-07 | PASS | E3 | PREVIEW_PUBLISHED | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | DRIFT | `tool-041-browser-verification.json` | — | — | NO_CURRENT_LOCAL_TEST_FILE |
| NA-01 | NOT_APPLICABLE | E2 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | NOT_APPLICABLE | — | `tool041-focused-tests.log` | tool-041-acceptance-evidence.test.ts | NOT_APPLICABLE |
| NA-02 | NOT_APPLICABLE | E2 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | NOT_APPLICABLE | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-acceptance-evidence.tes… | NOT_APPLICABLE |
| NA-03 | NOT_APPLICABLE | E2 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | NOT_APPLICABLE | — | `tool041-focused-tests.log` | tool-041-acceptance-evidence.test.ts | NOT_APPLICABLE |
| NA-04 | NOT_APPLICABLE | E2 | DOC_OR_REGISTER | HEAD_ONLY | — | — | NOT_APPLICABLE | — | `system register line 22` | — | NOT_APPLICABLE |
| NA-05 | NOT_APPLICABLE | E2 | WT_LOCAL_HARNESS | PIPELINE_SNAPSHOT | 47253c5d7be2… | 4f94589e42fd… | NOT_APPLICABLE | — | `tool-041-browser-verification.json` | tool-041-hematocrit-monitor.test.ts; tool-041-hematocrit-monitor-pipe… | NOT_APPLICABLE |
| NA-06 | NOT_APPLICABLE | E2 | WT_VERIFICATION_LOG | COMPONENT_SNAPSHOT | 2eb85043c876… | 4a304d7926b8… | NOT_APPLICABLE | — | `tool041-focused-tests.log` | tool-041-hematocrit-monitor.test.ts; tool-041-acceptance-evidence.tes… | NOT_APPLICABLE |

---

## 7. What this matrix proves and does not prove

**Proves:**

- every requirement is now bound to an explicit source fingerprint;
- Preview evidence and current-local evidence are separated and never substituted for each other;
- 100 applicable rows depend on historical snapshots that no longer exist in HEAD or local;
- 23 engine rows are the only ones whose cited source is unchanged;
- the current local tree compiles, lints without errors, and passes its focused battery;
- no storage, network, session or database path exists in the Tool 041 source.

**Does not prove:**

- that any `DRIFT` or `HEAD_ONLY_UNTRACKED` row is still satisfied by the current code;
- that the 34-test battery covers every requirement at assertion level;
- that the 21 Preview rows hold on the current local tree;
- that `57.58%` is final acceptance.

---

## 8. Effect on the ledger

| Metric | Value | Change from this artifact |
|---|---:|---|
| Ledger rows | 138 | none |
| Applicable rows | 132 | none |
| `NOT_APPLICABLE` rows | 6 | none |
| `PASS` rows | 76 | none |
| Declared arithmetic | `76 / 132 = 57.58%` | none |

No row is promoted. No evidence is re-dated. No historical artifact is counted against current code.

**Status remains:** `OWNER_REVIEW` — NOT ACCEPTED — NOT CLOSED.
