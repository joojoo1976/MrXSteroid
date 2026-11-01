# Tool 139 — Scope and implementation audit

**Audit date:** 2026-10-25 (Africa/Cairo)  
**Decision:** `NEEDS OWNER SCOPE DECISION — NOT READY FOR IMPLEMENTATION`  
**Audit type:** Read-only source review. No code, registry, route, catalog status, database, or migration changed.

## Identity and current state

- App identity: #139, slug `tool-139-solvent-emulsifier-ratio-calculator`, planned catalog row at `lib/tools/smartToolsCatalog10.ts:25`.
- Existing catalog label and description explicitly name BA/BB solvent ratios. The slug maps to category `injection-formulation` at `lib/tools/categories.ts:214`.
- Approved v7 registry row #241 is `solvent-ratio`, route `/tools/solvent-ratio`, and describes determining BA/BB ratios. Its SEO keywords include peptide reconstitution and raw powder density. Crosswalk classification remains `POSSIBLE_CONCEPTUAL_MATCH`, not alias, at `docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv:242`.
- Dedicated component, engine (including `.v6`), and schema files are absent. Tool 139 has no app `Page` enum, `TOOL_REGISTRY` record, or legacy-route mapping; because it is planned, there is no published app route to test.
- Repository searches found no implementation source for a ratio, BA/BB, or emulsifier calculator in the SmartTools engines/components/schemas. The v7 registry description is identity evidence only; it does not establish scientifically validated ratios, safe use, sources, or desired calculation behavior.

## Risk and evidence boundary

In this application, the row explicitly associates BA/BB solvents with an injection-formulation category, while the v7 record associates the feature with peptide reconstitution and raw-powder density. A numerical ratio or volume calculator under that identity could directly operationalize preparation of injectable drug products. No approved source, material/use context, or validated rule is recorded. Inventing a ratio, supplying common values, back-calculating quantities for a batch, or adding mixing/preparation/sterilization steps would therefore be unsupported and outside an approved scope.

This audit makes no claim about any specific solvent ratio being correct, appropriate, safe, or recommended. It does not treat the adjacent tools #137, #138, #141, or #142 as trusted dependencies or as evidence for solvent rules.

## Decisions required before implementation

The owner must decide whether App #139 is to remain a BA/BB injectable-formulation tool. If so, provide an approved, authoritative source/rule set and permitted outputs; a user-entered reference alone cannot validate those rules. If not, explicitly approve a different non-drug, non-injection use case and its identity/name/content change. The tool must not be silently redefined as a generic ratio calculator because that would change the approved product intent.

Until that decision and evidence exist, keep the catalog row `planned`; do not add a component/engine/schema, registry record, route, default values, formula, or ratio recommendation. Preserve the app ID, slug and existing category pending owner direction.

## Reproducible checks

- `Test-Path components/tools/tool-139-solvent-emulsifier-ratio-calculator.tsx` — `False`.
- `Test-Path lib/tools/engines/tool-139-solvent-emulsifier-ratio-calculator.ts` — `False`.
- `Test-Path lib/tools/engines/tool-139-solvent-emulsifier-ratio-calculator.v6.ts` — `False`.
- `Test-Path lib/tools/schemas/tool-139-solvent-emulsifier-ratio-calculator.ts` — `False`.
- `rg -n -i "benzyl alcohol|benzyl benzoate|emulsifier|solvent ratio|BA/BB|solvent" components/tools lib/tools/engines lib/tools/schemas ...` — no implementation matches; the current audit/crosswalk/catalog contain the descriptive matches.
- `git branch --show-current` — `main`; `git rev-parse HEAD` — `254ce1299bff227c54809bb7027f9b587d69c143`; `git status --short` — 778 rows; `git diff --cached --name-only` — empty.

No tests were run because this was a read-only scope audit and no runtime code changed.
