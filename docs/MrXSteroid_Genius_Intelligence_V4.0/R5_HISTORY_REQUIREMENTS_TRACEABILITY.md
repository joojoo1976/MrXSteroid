# R5_HISTORY_REQUIREMENTS_TRACEABILITY

**Date:** 2026-11-06  
**Scope:** R5 three tools only (BMI, Protein Needs, Water Intake)  
**Rule:** A requirement is marked `implemented` only if it exists in code AND relevant tests pass at verification time. Nothing is implemented because a historical document says so.

## 1. Consolidated map of prior instructions → state

| # | Requirement | Historical source | Current implementation | Gap | Planned action | Test |
|---|---|---|---|---|---|---|
| 1 | AI in Everything / AI Everywhere | SPEC (all eras), V5 MASTER PROMPT | Being applied as principle per tool; not every tool enabled equally | PARTIAL | Apply per-tool when each tool is scoped (BMI/protein/water) | Review per tool |
| 2 | Ten specialized AI developments per tool | Unified SPEC Part G | Not yet done for any tool | MISSING | Not in R5 authorized scope; candidate for future batch | N/A |
| 3 | Five result boxes per tool | SPEC V5+ | BMI: Smart Advice (disclaimer) + Current Status; no Predictions; no Medical (screening) deterministic scope | PARTIAL (by design) | Add as machine-scoped boxes only; deterministic+traceable; see R5 spec | Pilot tests |
| 4 | What-If / Sensitivity for tools where suitable | MASTER PROMPT V4 §15, Macro work | BMI: none (not necessarily meaningful); Protein/Water: none — considered low-value | NOT_APPLICABLE for this tool set (deterministic scalar, single-output) | Documented decision; keep scope additive | N/A |
| 5 | Dynamic Input with interactive sliders | V5 §5, owner directive 2026-11-06 | **Planned this task** — not yet built | MISSING | Implement shared `DynamicSliderField` + integrate into 3 pilots | New slider tests |
| 6 | Global Measurement System linked to Header | SPEC V3 §15, V4, Unified SPEC Part K; `shared/ui/UnitToggle.tsx`; `PreferencesContext` | UnitToggle exists in Header with metric/imperial; pilots consume `useToolDisplayPreferences()` (same context) | PARTIAL | Bind sliders to same context; verify switching live; add dual-unit rendering | Browser + jsdom |
| 7 | No double conversion; test repeated toggle | SPEC V3 §15, Macro lessons | Macro proves pattern; three tools work likewise (canonical → display) | DONE for conversion | Extend tests to toggle×4 cycles + slider | Unit + browser test |
| 8 | User Profile and persisted preferences | V4/V5 | Exists via PreferencesProvider (profile sync with Supabase optional for logged users) | DONE (site-wide) | Tools inherit; no extra work | Manual |
| 9 | EN/AR both, RTL/LTR | All eras | Pilots implemented AR/EN; RTL measured in browser this task | DONE at UI level | Re-verify after slider work; Arabic keyboard labels reviewed | Browser |
| 10 | Desktop/mobile responsive | V2/V3/V4/V5 | Shared CSS `@media` at 900/640px for the three pilots' forms | DONE partial → extend for slider rows | Mobile layout for slider + manual input vertical stacking | Browser |
| 11 | 375px actual viewport | Unified SPEC | Previously recorded NOT RUN (no viewport tool) | NOT RUN | Attempt via dev server + screenshot; if tooling insufficient, keep NOT RUN and say so | Browser/manual |
| 12 | Screen reader support | V2+ mandate | Not run | NOT RUN | Attempt via Lighthouse a11y; full audit not possible in this environment | — |
| 13 | axe-in-DOM testing | Unified SPEC | Not available in repo | NOT RUN | Keep NOT RUN until environment provides it | — |
| 14 | Safety language / medical boundaries | V2+ | Pilots show "not medical advice / not diagnosis" (BMI "not a diagnosis") | DONE | Add per-output defensive copy where missing | Review |
| 15 | Five boxes not fabricated | Unified SPEC Part M | OK so far | DONE | Maintain | Review |
| 16 | Protein constant 2.2 or 2.0 applied with rationale, not blindly copied | V2/V5 | Engine uses real SPEC v3 heuristics: 1.6/2.0/2.2 per goal with 0.05 factor per activity — documented in SPEC/tests | DONE | Keep; document in Evidence record | Engine tests |
| 17 | Water formula documented/plausible | V2/V5 | 35 mL/kg × activity factor 1.0–1.04 | DONE | Keep; document with `NOT_REVIEWED` status | Engine tests |
| 18 | BMI screened not diagnosed; WHO/CDC cutoffs for adults only; no extrapolation to children | V2/V5 | Current: adult cutoffs 18.5/25/30 only | DONE | Add explicit adult note in evidence record (source CDC categories page) + output guard | Adapter test |
| 19 | No fingerprinting/hashing | Owner directive 2026-11-05 | No fingerprints | DONE | Maintain | grep |
| 20 | No calculus offload to model | Unified SPEC Part M | Not applicable (deterministic engine) | DONE | Engine used; no AI calls | Engine tests |
| 21 | Envelopes validated before render | Macro pattern | Adapter runs `validateToolResultEnvelope` on outputs; pilots render via Template V4 | DONE | Extend tests to slider path | Adapter tests |
| 22 | Scenarios/what-if cannot mislead | V5/V3 | N/A for these tools | DONE (not applicable) | Documented | — |
| 23 | Cross-tool intelligence deferred to R6+ | V5/V3 | Not wired (contextUsed: []) | DONE (deferred) | Maintain | — |
| 24 | Empty charts not shown; charts from real data | V5/V3 | No charts currently; adding simple visual gauges only when value is meaningful | PARTIAL (planned) | Add 1 meaningful chart/gauge per tool; render only with real data | Visual review |
| 25 | Calculation never persisted unless approved | V5/V3 | Not persisted | DONE | No storage work | grep |
| 26 | Context used is empty | V4+ | `contextUsed: []` everywhere | DONE | Maintain | Adapter tests |
| 27 | `nextActions: []` unless approved | Owner decision | Empty | DONE | Maintain | Adapter tests |
| 28 | No auditRef (R6 only) | Owner decision | None | DONE | Maintain | Adapter tests |
| 29 | Imperial/metric EN+AR consistency with unit system | all eras | Works from same context; no separate scales | DONE | Verify slider scaling follows toggle live | Manual |
| 30 | Manual precise input beside slider | Owner directive 2026-11-06 | Not yet built | MISSING | This task | New tests |
| 31 | Live (non-reloaded) recalculation | Owner directive 2026-11-06 | Currently click-to-calculate (sync) | PARTIAL → upgrade | useEffect-based instant recalc | New tests |
| 32 | Toggles EN/AR + RTL/LTR combos with sliders | Owner directive 2026-11-06 | Not yet (no sliders) | MISSING | This task | Browser+jsdom |

## 2. Task pipeline reconstruction (high level)

1. Macro v6 → the reference: formula engine, deterministic, V3→V4 migration via adapter, bounded pilot owner-accepted as *partial* (acc. 2.2) with explicit gaps: benchmark evidence, fingerprint, safety contract deferred, accessibility NOT RUN.
2. V4 planning (Revisions 2.1 → 2.2 → owner authorization).
3. Grouped closure execution → 328/328, Macro frozen as bounded pilot.
4. R5 selection → 3 tools (BMI/Protein/Water); implemented additive V4 work; 422/422 after Batch E checks.
5. Owner preview → owner accepted the **three tools' implementation state** but reopened R5 for accuracy + dynamic sliders (this directive).
6. Unified docs installed 2026-11-06; Macro frozen.

## 3. Explicitly out of scope for this task (unless owner authorizes)

- Second-batch selection and any tool beyond BMI/Protein/Water.
- Macro changes of any kind.
- Supabase/migrations/RLS.
- Fingerprinting, auditRef, AI providers, costs.
- Rewriting/reporting the historical report files.
- Registry renaming/renumbering; anything outside the three tools + shared files + tests + required reports.
