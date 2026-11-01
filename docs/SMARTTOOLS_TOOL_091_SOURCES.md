# SmartTool 091 — Female Health Observation Log

Tool 091 preserves its numeric identity and hormonal-health category but records user-entered energy, ferritin, bone/joint, cold-intolerance, and training observations.

The former female-vitality score, athletic-resilience tier, RED-S implication, iron-support priority, endocrine warnings, and urgent clinical labels were removed. These self-reported entries do not diagnose RED-S, iron deficiency, thyroid disease, bone injury, or clinical priority. The result is `USER_PROVIDED`, with null confidence and `not_assessed` data quality.

The interface follows the shared header language preference and adds no local language controls. The flat route redirects to `/smarttools/hormonal-health/tool-091-female-health-optimizer`.

## Current-checkout verification — 2026-10-26

- Tool 091 engine and 091–095 adapter tests: **PASS**, 2 files / 8 tests.
- `npx tsc --noEmit`: **PASS**, exit 0.
- Browser/accessibility review and live Supabase/RLS/profile persistence: **NOT VERIFIED**.
