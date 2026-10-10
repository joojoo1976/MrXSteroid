# SDD ledger — plan: docs/superpowers/plans/2026-10-10-master-phases-AF.md

Governing: SMARTTOOLS_SPEC.md (in-repo) + user directive 2026-10-10 (phases A–F, AI §11, acceptance matrix).
BLOCKED (documented): file `2gpt MASTER v3.0` does not exist in repo or git history. "Second merge list" absent. SMARTTOOLS_SPEC.md + user directive are the governing pair.
Worktree ruling: continue on `main` working tree — the 88 uncommitted files ARE the in-progress batch.

## Done
- [x] T1 Phase A audit → docs/superpowers/audits/2026-10-10-master-phaseA-audit.md.
- [x] B1 PAGE_TO_PATH: tests/unit/legacyRoutes.test.ts RED→GREEN; 5 keys added (INJECTION_SCHEDULE…LIPID_PROFILE_OPTIMIZER).
- [x] B3 schemas hygiene: tests/unit/schemasClean.test.ts RED→GREEN; junk `` `nexport `` lines removed from schemas 036–040 (036 also had stray lone backtick).
- [x] B2 component 036 completed from truncation: useEffect import, rotation_sites string→array (parseSites), full JSX per 031 pattern, commitDashboardSnapshot {submitted,projection} pattern.
- [x] Hidden defects fixed (revealed once parse error cleared):
  * adapters 036–040: replaced `tool.schema.safeParse` (ToolDefinition has no schema) + `unknown` input + null-result with the canonical 031–035 pattern (typed input, direct engine call).
  * adapter 036 BUSIEST_DAY finding had unreachable `?? `; fixed.
  * adapter 037 mitigations.map widened severity → `(m): KeyFinding =>` annotation.
  * engine 037 `acc: Record<string, number>` broke BASE_RATES indexing → RiskKey/RiskRates typing.
  * schema 036 max_ml_per_site optional vs engine required → `.default(3)`.
  * adapter Arabic labels verified intact (earlier `?????` was console display only).
- [x] B4 components 037–040 created (037 side-effect probability, 038 stack compatibility, 039 liver enzyme tracker, 040 lipid profile optimizer) with drafts/AI-context/save/prev-next/AR-EN RTL; compile errors fixed (duplicate decls, extra paren, sbp/systolic_bp mismatch).
- tsc --noEmit = GREEN (EXIT 0).

## Next
- B5: flip catalog6 #036–#040 → 'implemented'; RED-first count update in tests/unit/smartToolsCatalog.test.ts (implemented 35→40, planned 15→10).
- B6: planned-leak filtering for app/smarttools/[category]/page.tsx, app/smarttools/sitemap.ts, app/smarttools/[category]/[tool]/page.tsx generateStaticParams + tests.
- B7: batch adapter test 036–040 + full vitest + validate-tools + eslint delta; commit Phase B.
- C regression #001–#030. D: tools #041–#050. E: AI explain service + route + tests. F: matrix + build.

## Notes
- pickToolI18n(i18nJson, locale) returns flat dict + dir; i18n JSONs 037–040 exist with EN+AR keys verified via node (Arabic never through PowerShell).
- commitDashboardSnapshot(output, parsed.data) → {submitted, projection} with .ok checks (031 pattern).
- windows/PowerShell mojibake = display only; verify with node fs reads.
