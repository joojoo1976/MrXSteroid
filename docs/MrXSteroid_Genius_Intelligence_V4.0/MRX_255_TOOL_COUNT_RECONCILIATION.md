# MRX_255_TOOL_COUNT_RECONCILIATION.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only.

## 1. Verdict

There is no clean set of “nine extra tools” to remove. The number 9 is arithmetic, not identity. The catalog contains 268 entries: 264 implemented and 4 planned. The target of 255 can be interpreted as 255 implemented tools (9 more than target) or 255 catalog entries (13 more than target). Neither interpretation yields a unique, evidence-based deletion set without an owner scope rule.

## 2. Count arithmetic

| Item | Count |
|---|---:|
| Strategic target | 255 |
| Catalog entries | 268 |
| Implemented tools | 264 |
| Planned tools | 4 |
| Numbered catalog slots | 247 |
| Numbered implemented | 243 |
| Numbered planned | 4 |
| Missing numbered slots | 8 (1–5, 253–255) |
| Named (non-numbered) tools | 21 |
| Implemented surplus over 255 | 9 |
| Catalog surplus over 255 | 13 |
| Named tools minus missing numbered slots | 21 − 8 = 13, or 21 − 12 = 9 if planned tools are counted as missing implementation |

## 3. Why the 9 is not a deletion list

- The 21 named tools are not all duplicates. They include protected or distinct tools: `bmi`, `protein-needs`, `water-intake` (R5 pilots), `macro` (Macro V6), and named tools with unique engines and tests.
- The 9 surplus is the net of 21 named tools minus 12 missing numbered implementations. It is not a list of 9 removable tools.
- The 13 surplus over the catalog target cannot be covered by the 12 overlap candidates below.
- Deleting any tool would violate the preservation rule and would remove unique routes, IDs, and functionality.

## 4. Twelve functional-overlap candidates (not approved for removal)

| Named tool | Overlapping numbered tools | Evidence | Why not a deletion by itself |
|---|---|---|---|
| `genetic` | 020 exact title match | Same title and purpose | The named tool has a different input model (anthropometrics) |
| `halflife` | 016, 151, 157, 022, 034, 159 | Half-life family | Named tool is a visualization/simulator; numbered tools are calculators |
| `hpta-recovery` | 018, 063 | HPTA suppression/recovery | Named tool is a modeler; numbered tools are monitor/calculator |
| `lab` | 007, 024, 033, 164 | Bloodwork records/interpretation | Named tool is a reference; numbered tools are records/comparisons |
| `injection` | 009, 153, 036 | Injection site history/schedule | Named tool is a visual map; numbered tools are logs/schedules |
| `multi-ester-pharmacokinetics` | 022, 151, 157, 016 | Multi-ester PK | Named tool has a full serum timeline; numbered tools are simpler |
| `pct-timing` | 032, 056, 031 | PCT washout/scheduling | Named tool is a washout engine; numbered tools are planners |
| `cycle` | 030, 031, 032, 023 | Cycle planning | Named tool is a comprehensive architect; numbered tools are specialized |
| `timeline` | 131, 105 | Transformation scenario | Named tool is a visual journey planner |
| `master-calculator` | 013, 104, bmr-tdee, protein-needs, water-intake | All-in-one nutrition/cycle | Composite tool; not a duplicate of any single tool |
| `aromatization-risk` | 065 | Aromatization conversion | Named tool is an unvalidated scenario; 065 is a conversion estimator |
| `hcg-serm-protocol` | 032, 056, 021 | PCT/SERM/HCG | Named tool generates receptor-recovery protocol |

## 5. Possible owner scope rules

- Rule A: keep all 268 entries and redefine the strategic target as 268.
- Rule B: keep 255 implemented tools and mark 9 named tools as legacy aliases, without deleting routes or IDs.
- Rule C: keep all numbered tools and retain named tools as distinct legacy tools, accepting that the target is not a deletion quota.
- Rule D: merge duplicate functionality into canonical tools while preserving old routes as 301 redirects.

No rule is implemented without owner approval.

## 6. Owner decision required

D2: choose the scope rule. Until then, no tool is deleted, renumbered, renamed, or merged.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
