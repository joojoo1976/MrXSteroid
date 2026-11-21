# SOURCE PRESERVATION MANIFEST — MASTER EXECUTION PROMPT MERGE

**Archive directory:** `docs/MrXSteroid_Genius_Intelligence_V4.0/archive/pre-master-execution-merge-2026-11-07/`  
**Created:** 2026-11-07  
**Purpose:** Preserve both owner-supplied source prompts byte-for-byte before the unified master document was authored.  
**Rule:** No source prompt was edited, condensed, reordered, renamed in place, or deleted.

## 1. Archived sources

| Source | Archived filename | Origin | SHA-256 | Bytes |
|---|---|---|---|---|
| A | `SOURCE_A_R5_ACCURACY_REMEDIATION_AND_DYNAMIC_MEASUREMENT_SLIDERS_PROMPT.md` | Owner message, 2026-11-07 (inline text) | `74373675CDAA98A3DEB3D1EBCD4879E638A5C3D2769B57965829B52ADE3D1764` | 34,666 |
| B | `SOURCE_B_MRX_GI_255_TOOLS_INTELLIGENCE_ACCURACY_AND_UX_EXECUTION_PROMPT.md` | `docs/MrXSteroid_Genius_Intelligence_V4.0/MRX_GI_255_TOOLS_INTELLIGENCE_ACCURACY_AND_UX_EXECUTION_PROMPT.md` | `4525F3B089A75BCAD5A6CFF2A4F2B07891C68104BA8C69E9A89407506B714D7B` | 28,575 |

## 2. Byte-identity proof for Source B

| Check | Original | Archive | Result |
|---|---|---|---|
| SHA-256 | `4525F3B089A75BCAD5A6CFF2A4F2B07891C68104BA8C69E9A89407506B714D7B` | `4525F3B089A75BCAD5A6CFF2A4F2B07891C68104BA8C69E9A89407506B714D7B` | **IDENTICAL** |
| Copy method | — | `Copy-Item -LiteralPath ... -Force` | byte copy, no transformation |

The owner-supplied attachment at `E:\MRX_GI_255_TOOLS_INTELLIGENCE_ACCURACY_AND_UX_EXECUTION_PROMPT.md` also hashes to `4525F3B0…`, confirming all three copies are the same document.

## 3. Capture-integrity statement for Source A

Source A was delivered as inline text, not as a repository file. It was written to the archive exactly as supplied, including all 22 sections, Arabic/English wording, table, code spans and the closing owner-authorization block. No content was summarized. Its hash above is the frozen capture identity used by the merge report.

**Parity verification completed 2026-11-07:** `source-a-parity-audit.ps1` checked 126 distinctive phrases, conditions and examples spanning all 22 sections; all 126 passed. No paragraph, condition, request or example was found missing. The master coverage audit passed 120/120 and the merge completeness check passed 93/93. See `MRX_GI_MASTER_PARITY_AUDIT_REPORT.md` for the full reconciliation.

**Owner verification action:** compare the archived Source A against the prompt in the 2026-11-07 message. If any byte differs, the owner should reject the merge report and request re-capture before using the master document.

## 4. Existing repository files touched

| File | Action | SHA-256 before | SHA-256 after |
|---|---|---|---|
| `MRX_GI_255_TOOLS_INTELLIGENCE_ACCURACY_AND_UX_EXECUTION_PROMPT.md` | **None** (read + copied) | `4525F3B0…` | `4525F3B0…` |
| `SPEC.md` | **None** | — | unchanged |
| `PROMPT.md` | **None** | — | unchanged |
| `ACCEPTANCE_CRITERIA.md` | **None** | — | unchanged |

No Git commit, push, merge, deployment, Supabase change, migration, RLS change or production write was performed for this archive.

## 5. New files created by this merge task

1. `archive/pre-master-execution-merge-2026-11-07/SOURCE_A_R5_ACCURACY_REMEDIATION_AND_DYNAMIC_MEASUREMENT_SLIDERS_PROMPT.md`
2. `archive/pre-master-execution-merge-2026-11-07/SOURCE_B_MRX_GI_255_TOOLS_INTELLIGENCE_ACCURACY_AND_UX_EXECUTION_PROMPT.md`
3. `archive/pre-master-execution-merge-2026-11-07/SOURCE_MANIFEST.md` (this file)
4. `MRX_GI_MASTER_EXECUTION_PROMPT.md`
5. `MRX_GI_MASTER_PROMPT_MERGE_REPORT.md`
6. `archive/pre-master-execution-merge-2026-11-07/merge-completeness-check.ps1`
7. `archive/pre-master-execution-merge-2026-11-07/source-a-parity-audit.ps1`
8. `archive/pre-master-execution-merge-2026-11-07/master-parity-audit.ps1`
9. `MRX_GI_MASTER_PARITY_AUDIT_REPORT.md`

The master document's SHA-256 remained `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540` before and after the parity audit. No master content was added, removed or reworded.

## 6. Governance

`SPEC.md`, `PROMPT.md` and `ACCEPTANCE_CRITERIA.md` remain the governing authority. The master execution prompt is an execution directive derived from Sources A and B; it does not replace, amend or override the governing documents. Any conflict is resolved in favor of the governing documents, then the owner's explicit decision, then the master prompt, then the source prompts.
