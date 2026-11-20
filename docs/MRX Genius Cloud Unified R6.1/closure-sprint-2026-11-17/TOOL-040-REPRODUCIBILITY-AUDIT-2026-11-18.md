# Tool 040 — Reproducibility Audit of the Recorded 77/92 (2026-11-18)

**Recorded ledger result:** `77/92 = 83.70%` (preserved unchanged, per owner instruction 2026-11-18).
**Audit question:** can those 77 PASS rows be reproduced from a clean clone of the committed tree?
**Short answer:** no — **23 of the 77** PASS rows cite files that are **not tracked in git** and therefore absent from the clean export. They remain valid evidence of the working tree at `2a647fda`, but they are not clean-clone reproducible (E3) until those files are committed.

No status in the ledger was changed by this audit.

---

## 1. What is reproducible

The clean export `E:\p03-clean-build-20261118` (HEAD `37f047a4`) contains only tracked files plus the 33 P-03 files. Running Tool 040's available suites there:

| Suite | Tests | Result |
|---|---:|---|
| `lib/tools/engines/tool-040-lipid-profile-optimizer.test.ts` | 3 | PASS |
| `lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline.test.ts` | 11 | PASS |
| **Total** | **14** | **PASS, exit 0** |

The following Tool 040 files are **missing from the clean export** because they are untracked:

- `components/tools/tool-040-lipid-profile-optimizer.tsx`
- `components/tools/tool-040-lipid-profile-optimizer.genius.tsx`
- `components/tools/tool-040-lipid-profile-optimizer.visual.tsx`
- `components/tools/tool-040-lipid-profile-optimizer.test.tsx`
- `lib/tools/r6/tool-040-lipid-profile-optimizer-contract.ts`
- `lib/tools/r6/tool-040-lipid-profile-optimizer-contract.test.ts`
- `lib/tools/r6/tool-040-lipid-profile-optimizer-visual.ts`
- `tests/unit/tool-040-acceptance-evidence.test.ts`

Because the component itself is untracked, the clean export cannot even render the Tool 040 page from committed sources. The P-03 commit intentionally included only `tool-040-lipid-profile-optimizer-pipeline.ts`, matching the approved 33-file scope.

## 2. The 23 PASS rows that depend on untracked files

| Req ID | Untracked file(s) cited by the row |
|---|---|
| SPEC-R6.1-1.a | `components/tools/tool-040-lipid-profile-optimizer.genius.tsx` |
| SPEC-R6.1-1.f | `lib/tools/r6/tool-040-lipid-profile-optimizer-contract.ts` |
| SPEC-R6.1-1.g | `lib/tools/r6/tool-040-lipid-profile-optimizer-contract.ts` |
| SPEC-R6.1-2.a | contract.ts; contract.test.ts |
| SPEC-R6.1-2.c | pipeline.test.ts |
| SPEC-R6.1-2.i | contract.test.ts |
| SPEC-R6.1-2.k | pipeline.test.ts |
| SPEC-R6.1-3.a | genius.tsx |
| SPEC-R6.1-6.d | genius.tsx |
| ACC-R6.1-3.b | pipeline.test.ts; contract.test.ts; component test.tsx |
| ACC-R6.1-3.c | component test.tsx; pipeline.test.ts |
| ACC-R6.1-3.i | component test.tsx; genius.tsx |
| LAYER-DOMAIN-RULE | genius.tsx |
| LAYER-VISUAL-512 | genius.tsx; visual.tsx |
| LAYER-20MAP-01 | contract.ts |
| LAYER-20MAP-03 | contract.ts |
| LAYER-20MAP-04 | contract.ts; pipeline.test.ts |
| LAYER-20MAP-06 | genius.tsx |
| ACC-5.5.1 | visual.ts; visual.tsx |
| ACC-5.5.2 | visual.tsx |
| ACC-5.5.5 | visual.tsx |
| ACC-5.5.9 | visual.tsx |
| SPEC-7.1-CHART | visual.tsx |

Note: `pipeline.test.ts` is untracked too, even though the pipeline itself was committed in P-03.

## 3. Consequence for the percentage

The recorded **77/92 = 83.70%** stands as the working-tree evidence result at `2a647fda`; it is preserved as instructed. It must not be described as clean-clone E3 until the 040 artifacts are committed.

Options, both requiring owner authorization (not executed here):

1. **Commit the Tool 040 artifact set** (component, genius, visual, contract, tests) in a separate scoped commit, re-run the clean export, and re-issue the 040 ledger as E3.
2. **Keep the ledger as working-tree evidence** and label it `E2 (untracked artifacts)` in any external report.

Until then, any claim that Tool 040 is "83.70% verified from git" would be inaccurate.
