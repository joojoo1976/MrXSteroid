# V7 Tools 241–245 Scope Proposal (2026-10-26)

241–245 are constrained to generic arithmetic and user notes. They do not provide solvent preparation, dosage, oil selection, purity, yield, stability, shelf-life, or safety claims. Focused tests: 5/5 PASS; TypeScript PASS.

## Application integration and verification checkpoint (2026-10-27)

- Added all five existing IDs/slugs/routes to the published SmartTools catalog and homebrew-chemistry category. Before this checkpoint, local components/engines existed but the catalog did not expose these tools.
- Replaced Tool 242's arbitrary user-supplied conversion factor with a finite same-dimension unit whitelist; factors and temperature equations are documented in `docs/SMARTTOOLS_241_245_SOURCES.md`.
- Focused validation: 46/46 tests, `validate-tools` 5/5, TypeScript exit 0, and scoped ESLint exit 0.
- Production build exited 0 and generated 408/408 static pages. Local production-server smoke checks returned HTTP 200 for each of the five category-first routes and the SmartTools hub.
- No database writes, migrations, commits, pushes, or deployments.
- Full report: `docs/SMARTTOOLS_BATCH_241_245_REPORT.md`. This checkpoint does not audit the rest of the 252 tools.
