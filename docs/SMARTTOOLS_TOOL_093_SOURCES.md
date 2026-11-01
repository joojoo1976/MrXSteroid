# SmartTool 093 — Menstrual Cycle Calendar Log

Tool 093 preserves its identity and reproductive-wellbeing category but records cycle length, current cycle day, contraceptive flag, and training-focus flag as user-provided calendar inputs.

The former phase/ovulation estimate, metabolic substrate labels, thermoregulatory claims, strength scores, and training or electrolyte recommendations were removed. Calendar inputs do not establish ovulation, fertility, contraceptive effectiveness, hormone levels, or exercise readiness. The result is `USER_PROVIDED`, with null confidence and `not_assessed` data quality.

The interface follows the shared header language preference and adds no local language controls. The flat route redirects to `/smarttools/reproductive-wellbeing/tool-093-menstrual-cycle-manager`.

## Current-checkout verification — 2026-10-26

- Tool 093 engine and 091–095 adapter tests: **PASS**, 2 files / 8 tests.
- `npx tsc --noEmit`: **PASS**, exit 0.
- Browser/accessibility review and live Supabase/RLS/profile persistence: **NOT VERIFIED**.
