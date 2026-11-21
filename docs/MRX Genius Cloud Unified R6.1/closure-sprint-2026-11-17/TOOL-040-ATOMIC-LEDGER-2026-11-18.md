# Tool 040 — Atomic Acceptance Ledger recomputation (2026-11-18)

**Source of criteria:** `docs/MRX Genius Cloud Unified R6.1/tool-040-requirements.csv` (123 rows, 14 columns) — the tool's own acceptance ledger, not a generic template.
**Branch/HEAD:** `feat/r6.1-tools-041-042` @ `2a647fdae7060b3d215d4663eb3220555cce978b`
**Recomputed:** 2026-11-18 (this sprint). Artifact: `tool-040-atomic-ledger-2026-11-18.csv`.

## Result

| Metric | Value |
|---|---|
| Total criteria rows | 123 |
| Applicable | 92 |
| Not-applicable (with recorded reason) | 31 |
| **PASS (fresh E3 evidence today)** | **77** |
| PARTIAL (prior E4 browser evidence, not re-executed today) | 15 |
| **Percentage (PASS / applicable)** | **77/92 = 83.7%** |

> The CSV's own historical figure was 92/92 (100%) recorded on 2026-11-13 at HEAD `5a87f3e`. That figure is **not reuseable as-is**: 15 criteria rest on a live-browser measurement that has not been reproduced on the current tree, and 63 rows reference at least one file that has changed since 2026-11-13.
> The drop from 100% to 83.7% is **evidence staleness**, not a code regression: every unit-level criterion re-ran green today.
>
> **Reproducibility qualification (2026-11-18):** 23 of the 77 PASS rows cite Tool 040 files that are **untracked in git** and absent from a clean clone. The 77/92 figure is therefore working-tree evidence at `2a647fda`; it is not clean-clone E3 until those artifacts are committed. See `TOOL-040-REPRODUCIBILITY-AUDIT-2026-11-18.md`. No status in this ledger was changed by that audit.

## Evidence reproduced today (actual commands)

| Command | Result |
|---|---|
| `vitest run components/tools/tool-040-*.test.tsx lib/tools/engines/tool-040-*.test.ts lib/tools/r6/tool-040-*.test.ts tests/unit/tool-040-acceptance-evidence.test.ts` | **6 files / 76 tests PASS**, exit 0 |
| `node docs/MRX Genius Cloud Unified R6.1/tool-040-i18n-check.mjs` | **I18N_PARITY: OK**, en 236 / ar 236, 0 missing, 0 extra, 0 empty, 0 CJK/Hangul, exit 0 |
| `tsc --noEmit` (clean export, HEAD + P-03 files) | exit 0 |
| `next build` (clean export, real node_modules, no symlink) | **exit 0**, 506/506 static pages |

## The 15 PARTIAL criteria (blocked on interactive browser evidence)

- **SPEC-R6.1-3.d** — CORE-5 must be correct, tested, translated AR/EN and accessible by keyboard and screen reader; an empty or cosmetic box rejects the tool
- **SPEC-R6.1-3.g** — Tool 111 checklist (source, build, settings, units, calculation, slider, tooltip, charts) plus breadcrumb, progress, prev/next and cross-tool graph
- **ACC-R6.1-3.d** — Acceptance test - Visual: compact 5, full 12, C1 parity, NOT_APPLICABLE with a reason, accessibility, mobile and desktop
- **LAYER-20MAP-07** — Implementation map #7 Navigation and deep links (index + categories + deep link + 111 works)
- **ACC-5.5.3** — Generated illustrations are labelled and never misrepresented as measurements or evidence (ACCEPTANCE_CRITERIA.md 5.5, SPEC 7.4)
- **ACC-5.5.4** — Tooltips work with hover, focus and touch (ACCEPTANCE_CRITERIA.md 5.5, SPEC 6.7)
- **ACC-5.5.6** — RTL/LTR and Arabic/English content do not break layout or units (ACCEPTANCE_CRITERIA.md 5.5, SPEC 15)
- **ACC-5.5.7** — Mobile and desktop layouts are usable (ACCEPTANCE_CRITERIA.md 5.5, SPEC 15)
- **ACC-5.5.8** — Keyboard access and focus states work (ACCEPTANCE_CRITERIA.md 5.5)
- **SPEC-6.7-TOOLTIP** — Tooltip contract: name, meaning, current value, unit, percentage/impact, explanation, source/formula, warning/recommendation; hover + keyboard focus +
- **SPEC-7.2-ARROWS** — SVG arrows and colour-to-box relationships: directional connectors from markers to the result box, hover/focus highlighting in both directions, textua
- **SPEC-7.4-ILLUSTRATION** — Images and generated illustrations: label illustrative artwork, provide text equivalents and accessible descriptions, respect licences and sources, ne
- **SPEC-15-A11Y** — Accessibility and responsive UX: no horizontal overflow, WCAG AA targets where applicable, tooltips by hover/focus/touch, charts with accessible names
- **ACC-5.5.7-LEGIBILITY** — Legibility of the explanatory diagram on a 390 px viewport (SPEC.md 15 "charts have accessible names, descriptions and equivalent data table" + "respo
- **ACC-5.5.3-VISIBILITY** — The explanatory illustration must be VISIBLE on the page, in every state (EMPTY, PARTIAL, INVALID, DEGRADED, FULL), on desktop and at 390 px - an illu

All 15 require one thing: a re-run of the tool's browser verification (`tool-040-browser-verify.mjs`) on an authorized deployment, capturing EN/AR, five states, 390 px + 1440 px, hover/focus/touch/Escape, and screenshots. Until then they stay PARTIAL — they are **not** converted to PASS.

## What this ledger does NOT claim

- It does not claim Tool 040 is closed or accepted. The owner decision of 2026-11-13 recorded in column C (`APPROVED`) is preserved as history, but closure requires the browser re-run plus the cross-cutting gates (D-C4 source packs, D-C5/D-CLIN wording review).
- Clinical copy inside the tool (referral text, thresholds, red flags) remains **PENDING SPECIALIST APPROVAL** under D-C4/D-C5; no self-approval is recorded here.
