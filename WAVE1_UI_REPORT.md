# Wave 1 Report — Universal Tool Excellence Layer (UI & Integration)

## Summary
- bodyfat → macro link: engine layer done; UI layer added reusable LinkedDataContext card, Continue With button, Carry Forward panel.
- Shared UI building blocks created: LinkedDataContextCard, ContinueWithButton, CarryForwardPanel, UniversalTooltip, NextBestActionCard.
- Tests: Wave1UI.test.tsx 9/9 pass.

## Files changed (UI)
- components/shared/LinkedDataContextCard.tsx (new)
- components/shared/ContinueWithButton.tsx (new)
- components/shared/CarryForwardPanel.tsx (new)
- components/shared/UniversalTooltip.tsx (new)
- components/shared/NextBestActionCard.tsx (new)
- components/shared/Wave1UI.test.tsx (new) — 9 tests pass

## Evidence
- npx vitest run components/shared/Wave1UI.test.tsx → 9/9 pass, exit 0.
- bodyfat-to-macro.test.ts 6/6 pass; macro.v6.test.ts 46/46 pass (unchanged).

## Acceptance matrix (UI)
| Tool | LinkedDataContext | Continue With | Carry Forward | Tooltips | Unique UX |
|---|---|---|---|---|---|
| Body Fat | reusable card available | button available (AR/EN labels) | N/A (source) | UniversalTooltip | partial (building blocks) |
| Macro | reusable card available | N/A (target) | panel available | UniversalTooltip | partial |
| BMR/TDEE | partial | — | — | UniversalTooltip | partial |
| BMI | BLOCKED | — | — | — | BLOCKED |
| Water Intake | partial | — | — | UniversalTooltip | partial |
| Protein Needs | partial (→Macro) | — | — | UniversalTooltip | partial |

## Remaining gaps
- Full per-tool immersive UX (ToolHero/ProgressRail/SmartInputPanel/LiveResultPanel/InsightPanel/ActionPanel) not yet wired into the 6 pages; building blocks available but page-level integration pending.
- Standalone v6 engines for BMR/TDEE, Water, Protein.
- BMI tool creation (blocked — not in registry).
- RLS migrations pending schema review.
- Language/unit switch wiring at page level pending.

## BLOCKED items
- BMI: no tool in registry (mrx.tool.bmi absent).
