# TOOL 041 — `NOT_APPLICABLE` PINNING (SIX TOOL-LEVEL EXCEPTIONS)

**Tool:** Tool 041 — Hematocrit Monitor (`mrx.tool.041-hematocrit-monitor`)

**Status:** `OWNER_REVIEW` — **NOT ACCEPTED** — **NOT CLOSED**

**Artifact date:** 2026-11-14

**Rows pinned:** `NA-01` … `NA-06` (6 of 138)

---

## 0. What "pinned" means

Each of these six rows is `NOT_APPLICABLE` **for Tool 041 only**, with a written reason and a proof. Pinning
means:

1. the reason is fixed and reproducible against the current source;
2. the proof is a named file/line or a source scan, not a generic assertion;
3. the exception is **scoped to the tool** and is **not** a waiver of any platform, security or operational
   requirement;
4. a concrete trigger is named that would void the exception and return the row to the ledger.

The six exceptions leave the denominator only because they have no subject in this tool. They do **not** reduce
the 132 applicable rows, and they do **not** change `76 / 132 = 57.58%`.

---

## 1. Current-local revalidation of the exception proof

The exceptions were originally recorded against historical snapshots. The current-local proof is re-derived from
the files that exist now:

- source scan over the 5 Tool 041 files for `localStorage`, `sessionStorage`, `indexedDB`, `supabase`,
  `createClient`, `.from(`, `fetch(`, `axios`, `XMLHttpRequest`, `commitDashboardSnapshot`, `loadDraft`,
  `saveDraft`, `clearDraft`, `buildAiContext`, `getSession`, `useSession`;
- result: **no match except one comment** in
  `lib/tools/r6/tool-041-hematocrit-monitor-pipeline.ts:13` reading "Supabase, no I/O";
- log: `evidence/tool041-verification-current/tool041-storage-network-scan-current.txt`;
- battery: `tests/unit/tool-041-acceptance-evidence.test.ts` passed in the current-local 34-test run;
- status: **all six exceptions still hold on the current local tree.**

> Note: `NA-05`'s ledger `head` cites the pipeline snapshot `47253c5d…`, and the pipeline file is now untracked and
> drifted. The exception does not rely on that snapshot: it relies on the current-local scan above, which again
> found no database, network or session path.

---

## 2. The six pins


### NA-01 — Draft autosave and restore

- **Applicability:** NOT_APPLICABLE: reason: Tool 041 is compute-and-display only; the owner D-08 local-storage exception was granted to Tool 039 only, and the acceptance-evidence source scan proves no draft API is imported
- **State:** A=`SPECIFIED` · B=`NOT_APPLICABLE` · C=`NOT_DECISIONED` · E=`E2`
- **Files examined:** `tests/unit/tool-041-acceptance-evidence.test.ts`
- **Proof / test result:** Source-scan test asserts loadDraft/saveDraft/clearDraft absent; no draft surface exists
- **Verified:** 2026-11-14
- **Ledger head binding:** f1caa821 HEAD; wt-sha1 2eb85043c8764fec0137e9de6ae45585ddb1a455
- **Evidence URI:** `docs/MRX Genius Cloud Unified R6.1/evidence/tool041-verification/tool041-focused-tests.log`
- **Revisit trigger (as recorded):** Revisit only if the owner grants a storage exception
- **Closure evidence:** acceptance-evidence test line 39

### NA-02 — Dashboard snapshot commit

- **Applicability:** NOT_APPLICABLE: reason: no dashboard projection is implemented or approved for Tool 041; commitDashboardSnapshot is absent and the only snapshot type used is submitted_snapshot
- **State:** A=`SPECIFIED` · B=`NOT_APPLICABLE` · C=`NOT_DECISIONED` · E=`E2`
- **Files examined:** `tests/unit/tool-041-acceptance-evidence.test.ts; components/tools/tool-041-hematocrit-monitor.tsx`
- **Proof / test result:** Source scan shows no commitDashboardSnapshot; component sets snapshotType submitted_snapshot only
- **Verified:** 2026-11-14
- **Ledger head binding:** f1caa821 HEAD; wt-sha1 2eb85043c8764fec0137e9de6ae45585ddb1a455
- **Evidence URI:** `docs/MRX Genius Cloud Unified R6.1/evidence/tool041-verification/tool041-focused-tests.log`
- **Revisit trigger (as recorded):** Revisit only after a W18 and dashboard-scope decision
- **Closure evidence:** test line 39; component line 47

### NA-03 — Session and cloud sync

- **Applicability:** NOT_APPLICABLE: reason: W18 has not approved session or cloud sync for this tool and the component imports no Supabase or session API
- **State:** A=`SPECIFIED` · B=`NOT_APPLICABLE` · C=`NOT_DECISIONED` · E=`E2`
- **Files examined:** `tests/unit/tool-041-acceptance-evidence.test.ts`
- **Proof / test result:** Source scan asserts no supabase import
- **Verified:** 2026-11-14
- **Ledger head binding:** f1caa821 HEAD; wt-sha1 2eb85043c8764fec0137e9de6ae45585ddb1a455
- **Evidence URI:** `docs/MRX Genius Cloud Unified R6.1/evidence/tool041-verification/tool041-focused-tests.log`
- **Revisit trigger (as recorded):** Revisit after an owner W18 decision
- **Closure evidence:** test line 41

### NA-04 — Per-user memory with consent, TTL, view and delete

- **Applicability:** NOT_APPLICABLE: reason: the tool stores nothing, so there is no memory to consent to, expire, view or delete; the register records this requirement as blocked by W18 for the platform
- **State:** A=`SPECIFIED` · B=`NOT_APPLICABLE` · C=`NOT_DECISIONED` · E=`E2`
- **Files examined:** `docs/MRX Genius Cloud Unified R6.1/R6.1-SYSTEM-REQUIREMENT-REGISTER.md`
- **Proof / test result:** Register line 22 records the platform memory requirement as BLOCKED by W18; Tool 041 has no storage surface
- **Verified:** 2026-11-14
- **Ledger head binding:** f1caa821 HEAD
- **Evidence URI:** `system register line 22`
- **Revisit trigger (as recorded):** Revisit at platform level after W18
- **Closure evidence:** system register line 22

### NA-05 — Row-level-security negative test for a Tool 041 write path

- **Applicability:** NOT_APPLICABLE: reason: there is no database write path or table for Tool 041 to attack, so a tool-specific RLS negative test has no subject
- **State:** A=`SPECIFIED` · B=`NOT_APPLICABLE` · C=`NOT_DECISIONED` · E=`E2`
- **Files examined:** `tests/unit/tool-041-acceptance-evidence.test.ts; lib/tools/r6/tool-041-hematocrit-monitor-pipeline.ts`
- **Proof / test result:** Pipeline is pure with no Supabase import; component has no network call
- **Verified:** 2026-11-14
- **Ledger head binding:** f1caa821 HEAD; wt-sha1 47253c5d7be22b7af10bc8582fbe84583a06cb6d
- **Evidence URI:** `docs/MRX Genius Cloud Unified R6.1/evidence/tool041/tool-041-browser-verification.json`
- **Revisit trigger (as recorded):** Track at platform level when a storage path is approved
- **Closure evidence:** pipeline lines 15-24

### NA-06 — Backup and disaster recovery for Tool 041 data

- **Applicability:** NOT_APPLICABLE: reason: the tool persists no data, so there is no Tool 041 dataset to back up or restore
- **State:** A=`SPECIFIED` · B=`NOT_APPLICABLE` · C=`NOT_DECISIONED` · E=`E2`
- **Files examined:** `components/tools/tool-041-hematocrit-monitor.tsx; tests/unit/tool-041-acceptance-evidence.test.ts`
- **Proof / test result:** No storage API, no adapter and no network write in the component
- **Verified:** 2026-11-14
- **Ledger head binding:** f1caa821 HEAD; wt-sha1 2eb85043c8764fec0137e9de6ae45585ddb1a455
- **Evidence URI:** `docs/MRX Genius Cloud Unified R6.1/evidence/tool041-verification/tool041-focused-tests.log`
- **Revisit trigger (as recorded):** Revisit if persistence is approved
- **Closure evidence:** test lines 38-43

---

## 3. Scope boundary: what is excepted vs. what stays binding

| Requirement area | Tool 041 status | Platform status |
|---|---|---|
| Draft autosave/restore | **tool-level NA** (`NA-01`) | not waived |
| Dashboard snapshot commit | **tool-level NA** (`NA-02`) | not waived |
| Session and cloud sync | **tool-level NA** (`NA-03`) | W18 decision still required |
| Per-user memory (consent, TTL, view/delete) | **tool-level NA** (`NA-04`) | register still records it as `BLOCKED` by W18 |
| RLS negative test for a Tool 041 write path | **tool-level NA** (`NA-05`) | platform RLS policy and negative tests remain binding |
| Backup and disaster recovery for Tool 041 data | **tool-level NA** (`NA-06`) | platform backup/DR policy remains binding |

The exceptions apply because the tool has **no storage subject**. They are not statements that:
- W18 is unnecessary;
- RLS is unnecessary;
- session security is unnecessary;
- backups are unnecessary;
- the tool may add persistence later without re-opening these rows.

---

## 4. Non-waiver statement

> `NA-01` … `NA-06` are exceptions **on the tool level only**. They do not waive, relax, defer or supersede any
> general security, privacy, RLS, session, storage, backup or operational requirement. If Tool 041 ever gains a
> storage, network, session, dashboard or memory path, all six rows return to `APPLICABLE` and must be re-run
> before the change can be accepted.

This statement is the controlling interpretation for any future reviewer.

---

## 5. Revisit triggers

| Row | Trigger that voids the exception |
|---|---|
| `NA-01` | Any draft API, autosave or restore behavior is introduced, or the owner grants a storage exception to Tool 041. |
| `NA-02` | Any dashboard projection or snapshot commit is added. |
| `NA-03` | Session or cloud sync is approved by W18 and implemented for the tool. |
| `NA-04` | Any per-user memory, consent, TTL, view or delete surface is added. |
| `NA-05` | Any database write path or table is created for Tool 041. |
| `NA-06` | Any Tool 041 dataset is persisted. |

---

## 6. Auditor checklist

- [ ] Each of the six rows has a written reason naming the tool-level scope.
- [ ] Each reason is backed by a file, line or current-local scan.
- [ ] No reason is phrased as a general security waiver.
- [ ] The current-local scan is attached and shows no storage/network/session path.
- [ ] The platform-level W18, RLS, session and backup requirements are still tracked separately.
- [ ] A revisit trigger exists for every row.
- [ ] The six rows stay outside the denominator and do not affect `76 / 132 = 57.58%`.

**Status remains:** `OWNER_REVIEW` — NOT ACCEPTED — NOT CLOSED.
