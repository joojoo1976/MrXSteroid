# SmartTools 140–149 Runtime Audit (2026-10-26)

| Tool | Evidence | Status | Boundary |
|---|---|---|---|
| 140 | `tool-140-dosage-unit-conversion-engine.v6.ts` and focused test | PARTIAL | Numeric unit conversion only; no dose recommendation; source/unit coverage review remains |
| 141 | `tool-141-carrier-oil-viscosity-syringe-pressure.v6.ts` and focused test | PARTIAL | Ideal fluid model only; cannot validate real injection safety |
| 142 | `tool-142-compound-purity-active-yield-estimator.v6.ts` and focused test | PARTIAL | User-provided assay arithmetic; no purity verification or preparation steps |
| 143 | `tool-143-storage-stability-thermal-degradation-estimator.v6.ts` and focused test | PARTIAL | Label-range comparison only; source completeness and DailyMed freshness remain operational limits |
| 144 | `tool-144-homebrew-chemistry-calculator.v6.ts` and focused test | PARTIAL | General measurement arithmetic; no mixing, compounding, sterilization or dosing |
| 145 | `tool-145-habit-intelligence-consistency-coach.v6.ts` and focused test | PARTIAL | Habit log only; no health coaching claim |
| 146 | `tool-146-emergency-warning-signs-checklist.v6.ts` and focused test | PARTIAL | Static checklist; emergency source/location verification remains separate |
| 147 | `tool-147-scientific-evidence-explorer.ts` and focused tests | PARTIAL | NCBI/Upstash live limits and email configuration require operational verification |
| 148 | `tool-148-personal-fitness-memory-layer.v6.ts` and focused test | PARTIAL | Session-only context; persistence/privacy must remain disabled unless separately approved |
| 149 | `tool-149-physique-trajectory-simulator.v6.ts` and focused test | PARTIAL | Mathematical scenarios only; no prediction or promise |

## Verification

- `npx vitest run lib/tools/engines/tool-14*.test.ts` — PASS, 10 files / 86 tests.
- Vite emitted an existing dynamic-import-vars warning from `lib/tools/loaders.ts`.
- Database writes, migrations, commits, pushes, deployment — NOT RUN.

Decision: `NOT READY FOR ROLLOUT`; several tools need runtime/source and browser checks despite green focused tests.
