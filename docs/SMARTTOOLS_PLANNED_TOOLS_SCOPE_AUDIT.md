# SMARTTOOLS 252 — Planned Tool Scope and Implementation Audit

**Audit date:** 2026-10-25 (Africa/Cairo)
**Branch / HEAD:** `main` / `254ce1299bff227c54809bb7027f9b587d69c143`
**Scope:** Historical baseline plus current-status addendum. Identity mappings remain unchanged; implementation status and route evidence are refreshed below. No database state or inventory identity was changed.
**Status:** `UPDATED 2026-10-25` — current catalog has seven planned entries; Tool 148 is implemented in-memory with explicit Tool 149 sharing, and Tool 150 is implemented as a manual results organizer. Identity equivalence remains unapproved.

## Findings

At the original audit checkpoint there were nine planned rows. The current catalog now has seven planned rows (132, 137–139, 141–142, 147); those are roadmap records and are excluded from the published selector. Tools 148 and 150 are now implemented and have declared component, engine, and schema files. Tool 149 is also implemented. This implementation-state change does not establish V7 identity equivalence.

| App # | Local identity / route | Catalog evidence | Component / engine / schema files | V7 crosswalk status | Review gate |
|---:|---|---|---|---|---|
| 132 | `tool-132-ai-pose-form-coach` / `/smarttools/tool-132-ai-pose-form-coach` | `lib/tools/smartToolsCatalog10.ts:18` | Missing / missing / missing | No local candidate recorded | Owner scope for camera/video processing, retention, external model use, and explicit exclusion of injury diagnosis |
| 137 | `tool-137-peptide-hormone-reconstitution-calculator` / `/smarttools/tool-137-peptide-hormone-reconstitution-calculator` | `lib/tools/smartToolsCatalog10.ts:23` | Missing / missing / missing | `POSSIBLE_CONCEPTUAL_MATCH` (`peptide-reconstitution`) | Owner scope required because concentration/reconstitution may be interpreted as preparation or dosing guidance |
| 138 | `tool-138-raw-powder-density-oil-formulation-engine` / `/smarttools/tool-138-raw-powder-density-oil-formulation-engine` | `lib/tools/smartToolsCatalog10.ts:24` | Missing / missing / missing | `POSSIBLE_CONCEPTUAL_MATCH` (`raw-powder-density-engine`) | Owner scope required for raw-material and injectable-formulation boundaries |
| 139 | `tool-139-solvent-emulsifier-ratio-calculator` / `/smarttools/tool-139-solvent-emulsifier-ratio-calculator` | `lib/tools/smartToolsCatalog10.ts:25` | Missing / missing / missing | `POSSIBLE_CONCEPTUAL_MATCH` (`solvent-ratio`) | Owner scope required for solvent/formulation content; exclude preparation instructions unless separately authorized |
| 141 | `tool-141-carrier-oil-viscosity-syringe-pressure` / `/smarttools/tool-141-carrier-oil-viscosity-syringe-pressure` | `lib/tools/smartToolsCatalog10.ts:27` | Missing / missing / missing | `POSSIBLE_CONCEPTUAL_MATCH` (`carrier-oil-viscosity-estimator`) | Owner scope required for injection-pressure assumptions and any claimed safety or clinical meaning |
| 142 | `tool-142-compound-purity-active-yield-estimator` / `/smarttools/tool-142-compound-purity-active-yield-estimator` | `lib/tools/smartToolsCatalog10.ts:28` | Missing / missing / missing | `POSSIBLE_CONCEPTUAL_MATCH` (`purity-yield-estimator`) | Owner scope required to separate measurement arithmetic from drug dose, manufacturing yield, or quality claims |
| 147 | `tool-147-scientific-evidence-explorer` / `/smarttools/tool-147-scientific-evidence-explorer` | `lib/tools/smartToolsCatalog10.ts:33` | Missing / missing / missing | `POSSIBLE_CONCEPTUAL_MATCH` (`scientific-evidence-explorer`) | Separate approval still required for final identity review, external NCBI query disclosure, and configured developer contact email |
| 148 | `tool-148-personal-fitness-memory-layer` / `/smarttools/platform-ai/tool-148-personal-fitness-memory-layer` | `lib/tools/smartToolsCatalog10.ts:34`; `lib/tools/registry.ts` | Present / present / present | `POSSIBLE_CONCEPTUAL_MATCH` (`personal-fitness-memory-layer`) | Implemented as session-only in-memory context; optional per-item sharing to Tool 149 requires explicit opt-in and explicit import; no persistence/profile linkage/sync |
| 150 | `tool-150-ai-performance-command-center` / `/smarttools/platform-ai/tool-150-ai-performance-command-center` | `lib/tools/smartToolsCatalog10.ts:36`; `lib/tools/registry.ts` | Present / present / present | `POSSIBLE_CONCEPTUAL_MATCH` (`command-center`) | Implemented as a manually curated results organizer; no automatic tool execution or unified recommendation |

## Identity and route invariants

- Application tool IDs and slugs remain unchanged. Routes for implemented Tools 148 and 150 use their current category-first paths shown above.
- The separate 252-row identity audit records conceptual candidates as `POSSIBLE_CONCEPTUAL_MATCH`; these are not verified aliases. The only exact V7 matches in that audit are based on exact slug equality.
- The V7 #249–#252 candidates for application tools 147–150 remain pending owner review. The catalog sequence does not establish identity equivalence.
- Since the historical baseline, catalog status changed for Tools 148 and 150; the original audit snapshot is retained as history and its implementation-presence CSV rows now reflect the current checkout.

## Risk and approval notes

- Tools 137–139, 141, and 142 touch reconstitution, formulation, injection, or purity/yield concepts. Their arithmetic, source basis, prohibited use cases, and UI claims need explicit owner-approved boundaries before implementation.
- Tool 132 may process video or images. Decide whether processing is local or external and whether media is discarded before defining a data contract.
- Tool 147 sends a user search query to an external literature service. NCBI E-utilities require `tool` and `email` parameters and publish rate limits; no developer contact value is configured in the local examples.
- Tool 148 is not authorized for persistent memory by this audit. Tool 150 is not authorized to run tools automatically or unify their results into recommendations.

## Reproducible checks

- `rg -n --glob 'smartToolsCatalog*.ts' "status: 'planned'" lib/tools` enumerates the seven currently planned rows (the historical table also retains Tools 148 and 150 for status context).
- A read-only Python pass parsed the planned `componentPath`, `enginePath`, and `schemaPath` fields from `lib/tools/smartToolsCatalog10.ts` and checked those filesystem paths; the current seven planned rows have 21 declared component/engine/schema paths absent.
- The identity labels are read from `docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv`; see `docs/SMARTTOOLS_252_IDENTITY_RECONCILIATION_AUDIT.md` for the complete 252-row evidence crosswalk and registry-count reconciliation.
- At the original checkpoint, no tests/build/route checks applied to the then-planned entries. Current Tool 148 verification is recorded in `SMARTTOOLS_TOOL_148_IMPLEMENTATION_REPORT.md`; Tool 150 artifact presence is not a behavioral certification. Recent completed implementation checks for tools 143–144 are recorded in `SMARTTOOLS_BATCH_17_REPORT.md`.

**Decision:** review each of the seven still-planned tools and the separate identity crosswalk before implementation. The result does not prevent continued work on already approved and implemented tools.

## Current candidate-overlap and risk audit — 2026-10-25

This addendum records source-level overlaps to help define future scopes. A similar name or a reusable formula is **not** proof that two numbered tools are the same identity. The V7 classifications listed below remain `POSSIBLE_CONCEPTUAL_MATCH` or `UNRESOLVED`; no alias was promoted.

| Planned app tool | Current local evidence / possible overlap | Boundary and current decision |
|---|---|---|
| 132 — AI Pose & Form Coach | V7 #132 `pose-form-coach-vision` has no local candidate in the 252-row crosswalk (`docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv:133`, `UNRESOLVED`). The nearby `lib/engines/core/v6/future/vision.ts:112-165,269-372` includes stub fallback and random synthetic movement/form outputs; the baseline audit finds no verified production app integration. | Do not present the future vision module as a working model or map it to App #132. A scope decision must define camera/file permissions, local versus external processing, retention/deletion, evaluation data, and exclusion of injury diagnosis before any implementation. |
| 137 — Peptide Hormone Reconstitution Calculator | V7 #239 `peptide-reconstitution` is only a `POSSIBLE_CONCEPTUAL_MATCH` (`docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv:240`). Existing Tool 051 computes concentration, dose volume, U-100 draw units, and doses per vial (`lib/tools/engines/tool-051-peptide-dosage-calculator.ts:26-45`); it clamps a sub-resolution draw upward to 2 syringe units (`:23,30-35`). Its UI validates with Zod before invoking the engine (`components/tools/tool-051-peptide-dosage-calculator.tsx:36-37`), auto-saves a draft (`:50-53`), and offers a separate dashboard persistence action (`:56-65`). Tool 021 computes weight-based doses with goal multipliers and emits timing/storage instructions (`lib/tools/engines/tool-021-peptide-protocol.ts:72-81,123-129`). | This is a medication-preparation/administration boundary, not harmless concentration arithmetic. Tool 051/021 are potential code-review inputs, not verified aliases or evidence that their advice is valid. Require owner scope and source-backed limits; do not transfer dosage defaults, storage rules, syringe rounding, persistence behavior, or protocol logic. |
| 138 — Raw Powder Density / Oil Formulation Engine | V7 #240 `raw-powder-density-engine` is a `POSSIBLE_CONCEPTUAL_MATCH` (`docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv:241`). Tool 144 provides general `ρ=m/V` arithmetic and explicit unit conversions (`lib/tools/engines/tool-144-homebrew-chemistry-calculator.v6.ts:3-45`). Solving mass or volume from an entered density requires a user-entered density source and temperature; it has no material-density database. | Reuse of generic dimensional conversion may be considered only after an approved design. Do not infer compound density, dissolve/formulate an oil, estimate concentration or injectability, or transfer a value from Tool 144 without an explicit source and scope. |
| 139 — Solvent / Emulsifier Ratio Calculator | V7 #241 `solvent-ratio` is a `POSSIBLE_CONCEPTUAL_MATCH` (`docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv:242`). Repository filename/content search found no dedicated solvent/emulsifier engine among active tool files. | Ratios could become injectable formulation instructions. Owner must define permitted inputs/outputs, source provenance, and whether solvent systems or any preparation steps are excluded. No default BA/BB or emulsifier values may be invented. |
| 141 — Carrier Oil Viscosity / Syringe Pressure | V7 #243 `carrier-oil-viscosity-estimator` is a `POSSIBLE_CONCEPTUAL_MATCH` (`docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv:244`). Existing Tool 076 models blood viscosity from hematocrit/protein/hydration and labels a “critical” risk band (`lib/tools/engines/tool-076-blood-viscosity-calculator.ts:27-80`); that is a different fluid and does not establish carrier-oil rheology or syringe pressure. | Do not reuse blood-viscosity equations/thresholds for oil. A source-backed physical model, temperature/shear/needle/syringe assumptions, calibration limits, and explicit exclusion of injection safety/advice are prerequisites. |
| 142 — Compound Purity / Active Yield Estimator | V7 #244 `purity-yield-estimator` is a `POSSIBLE_CONCEPTUAL_MATCH` (`docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv:245`). The current source search found no dedicated purity/assay/yield estimator; unrelated “potency” fields in protocol tools do not establish assay measurement. | Must distinguish user-supplied lab assay arithmetic from drug dose, manufacturing yield, product authenticity, or quality/safety certification. Require source/method, units, uncertainty, and explicit `NOT_AVAILABLE` when required assay metadata is absent. |
| 147 — Scientific Evidence Explorer | See `docs/SMARTTOOLS_TOOL_147_SCOPE_AUDIT.md` and its current continuation addendum. V7 #249 remains `POSSIBLE_CONCEPTUAL_MATCH`. | Still not ready: NCBI developer email, owner identity resolution, and a fail-closed global E-utilities limiter are outstanding. |

### Checks for this addendum

- Read-only source search: `rg --files components/tools lib/tools/engines lib/tools/schemas | rg -i 'peptide|reconstit|density|powder|oil|solvent|emulsif|viscos|syringe|purity|yield|active|pose|form-coach'` — confirmed existing peptide, density, and blood-viscosity candidates; no directly named local implementation for Tools 132, 139, or 142.
- Read-only source search: `rg -n -i 'purity|yield|assay|potency' lib/tools/engines lib/tools/schemas components/tools` — returned assorted potency references, but no dedicated planned Tool 142 engine.
- Re-read V7 evidence rows 132, 239–241, 243–244 in `docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv`; classifications remain unchanged. This is source-level scope triage, not clinical/physical validation and not implementation authorization.

**Current decision:** all seven planned entries remain gated. Preserve app IDs/slugs; retain category-first canonical paths when a tool is separately authorized, with the existing flat path redirected where applicable. No code, route, catalog status, registry identity, database, or migration changed in this addendum.

## Current checkout correction — 2026-10-26

The dated historical snapshots above are superseded for current catalog status by this read-only recount. Ten catalog files contain **166 unique rows**; 117 explicitly marked `implemented`, 4 marked `planned`, and 45 legacy rows with no `status` field. The published selector excludes only rows explicitly marked `planned` (`lib/tools/smartToolsCatalog4.ts:61`), so current totals are 162 published and 4 planned. The current planned IDs are **132, 137, 138 and 139**.

`lib/tools/registry.ts` exports 159 records with 159 unique slugs and no duplicate rows. Catalog/registry slug sets have 159 in common, 7 catalog-only (`bmr-tdee`, `protein-needs`, Tools 132/137/138/139), 0 registry-only, and 166 in their union. The root `SMARTTOOLS_252_MASTER_INVENTORY.md` records the extraction method and complete current snapshot.

### Remaining authorization gates

| Tool | Blocking scope decision | Minimum bounded design to consider; not implementation authorization |
|---:|---|---|
| 132 | Camera/video/image handling, local vs external processing, consent, retention/deletion, and no injury diagnosis | A non-diagnostic form-observation tool must use an actual evaluated vision model. The checked-in `future/vision.ts` includes random/stub fallbacks and cannot substantiate AI feedback. Do not accept or upload media until processing and retention are explicitly approved. |
| 137 | Whether a reconstitution/preparation calculator is permitted and its evidence basis | Existing Tool 021/051 dose/protocol rules are not evidence of safe reconstitution guidance. No dose, syringe units, defaults, preparation steps, storage guidance, or clinical claims should be copied. |
| 138 | Whether the intended raw-powder/oil formulation use is allowed, with source and measurement assumptions | Generic density arithmetic from Tool 144 cannot imply injectable formulation. No material database, inferred density, concentration, dissolving/mixing instructions, injectability, or safety claim. |
| 139 | Preserve or change its stated BA/BB solvent/emulsifier product intent | The current name/description implies formulation parameters. Require an authoritative source/rule set and explicit permitted outputs; a generic ratio worksheet would change the tool's intent and needs owner approval. No BA/BB defaults or preparation steps. |

No code, identity, route, catalog status, or database state changed during this recount. These gates are independent of whether the other tools have local implementations. **Decision:** do not begin any of these four until its scope is explicitly approved; the complete identity crosswalk remains separate from implementation status.


## Current-checkout status correction — 2026-10-25

The earlier table above is a historical snapshot. The current `lib/tools/smartToolsCatalog10.ts` entries show Tool 147 as `implemented` (line 33) with declared component, engine and schema; its local verification is recorded at repository root in `SMARTTOOLS_TOOL_147_IMPLEMENTATION_REPORT.md`. It is not one of the current planned entries. Current planned set is **six**: 132, 137, 138, 139, 141 and 142. Tool 147's earlier owner decision, identity separation (#147 remains distinct from V7 #249), fixed `NCBI_TOOL`, `NCBI_EMAIL`, optional server-only API key, global Upstash key, 3 requests/second and fail-closed behavior are represented in the current implementation and focused tests; live provider connectivity is still not verified.

Current planned tool review gates remain:

- **#132 vision:** do not claim computer-vision/AI functionality without a real evaluated model. Any media processing scope must state local/external processing, consent, retention/deletion, and explicit exclusion of injury diagnosis.
- **#137 reconstitution:** medication-preparation/dosing risk. Existing tools 021/051 are not proof of safe rules and must not be copied. Require an approved scope that excludes unsupported preparation, dose recommendations, defaults and clinical storage instructions.
- **#138 density/oil formulation** and **#139 solvent ratios:** exclude material databases, concentration/formulation instructions, injectable preparation and invented defaults. Explicitly source any user-entered constants and return `NOT_AVAILABLE` when prerequisites are absent.
- **#141 oil viscosity/syringe pressure:** the blood-viscosity engine is not a valid proxy. No pressure or injectability result without a source-backed physical model and documented conditions; exclude injection safety claims.
- **#142 purity/active yield:** limit any future scope to arithmetic over a user-supplied assay and its units/method/source; do not certify purity, authenticity, product quality, manufacturing yield or dose.

No implementation or status/route change was made by this correction. These six entries remain scope-gated. The source-count correction is recorded in the current baseline/inventory addenda; approved-v7 conceptual matches remain non-aliases. No database access/write, migration, commit, push or deployment occurred.

## Tool 142 completion correction — 2026-10-25

The older rows above describing Tool 142 as planned and requiring a future scope are historical. Tool 142 is implemented under the narrow owner-authorized continuation as a user-provided assay mass-arithmetic worksheet, documented at `SMARTTOOLS_TOOL_142_IMPLEMENTATION_REPORT.md` and `docs/SMARTTOOLS_TOOL_142_SOURCES.md`. Its data source, method, date and stated uncertainty are required; the tool does not certify purity or calculate a dose, formulation, preparation, or manufacturing yield. App #142 identity and slug are preserved; no V7 alias was asserted.

Current planned set: **#132, #137, #138, #139, #141**. Their earlier risk gates remain open. Tool 147 is also implemented locally but production NCBI/Upstash connectivity remains unverified. No other planned tools were changed here.

## Tool 148 privacy-scope review — 2026-10-26

Read-only review found that the existing session-memory feature exposes explicitly opted-in Tool 148 weight/body-fat values to Tool 149 through a shared React context, although the previously accepted preliminary scope prohibited cross-tool sharing until a separate privacy decision. No such separate decision was found. Tool 148 remains **not ready for acceptance**; the finding and source-line evidence are in `docs/SMARTTOOLS_TOOL_148_PRIVACY_SCOPE_REVIEW.md`. No implementation change was made.

## Tool 141 implementation status — 2026-10-25

The old #141 gate above is now a historical note and is superseded by `SMARTTOOLS_TOOL_141_IMPLEMENTATION_REPORT.md` and `docs/SMARTTOOLS_TOOL_141_SOURCES.md`. Tool 141 is implemented locally as a user-sourced ideal circular-tube pressure-drop model using Hagen–Poiseuille and a Reynolds applicability check. It explicitly does not model actual syringe force, needle/device behavior, injection safety or suitability. The app ID/slug/category are preserved; V7 #243 remains a `POSSIBLE_CONCEPTUAL_MATCH`, not an alias. Focused tests and automated checks are recorded in Batch 29. Manual accessibility and full-suite verification remain open. The current planned set is now **#132, #137, #138 and #139**.

## Tool 139 scope audit update — 2026-10-25

Read-only review confirms App #139 is explicitly described as a BA/BB solvent-ratio calculator and categorized under `injection-formulation`; V7 #241 describes BA/BB ratios in a peptide reconstitution/raw-powder context. The identity remains `POSSIBLE_CONCEPTUAL_MATCH`. Dedicated UI/engine/schema files and a published registry route are absent. No authoritative ratio source or approved formula was found. Because implementing the named calculator could operationalize injectable drug preparation, keep #139 planned pending an owner decision on the exact permitted use and authoritative rule source. See `docs/SMARTTOOLS_TOOL_139_SCOPE_AUDIT.md`. No runtime code changed.

## Tool 150 provenance review — 2026-10-25

Tool 150 is implemented and its source-to-consumer review is recorded in `SMARTTOOLS_TOOL_150_REVIEW_REPORT.md`. A Tool 149 `createdAt` timestamp had been rendered as the imported result's measurement date, but the source envelope supplies only calculation creation time. The import now preserves it as `derivedAt`, leaves `recordedOn` absent, and therefore keeps the imported row `PARTIAL` with the missing measurement date disclosed. Focused engine/UI tests pass 15/15; engine coverage is 97.14% statements / 82.25% branches / 94.73% functions / 96.36% lines. `validate-tools` 5/5, tsc, scoped ESLint and build 395/395 pass; full suite and manual accessibility remain unrun.

## Remaining planned-tool evidence refresh — 2026-10-25

- **#132 — Pose/form vision:** catalog record is planned (`lib/tools/smartToolsCatalog10.ts:18`); the crosswalk has no candidate and classifies V7 #132 as `UNRESOLVED` (`docs/SMARTTOOLS_252_IDENTITY_CROSSWALK.csv:133`). Dedicated Tool 132 UI/engine/schema files are absent. The separate future vision module falls back to synthetic pose values when MediaPipe is unavailable (`lib/engines/core/v6/future/vision.ts:133-168`); jump analysis returns randomized placeholder measurements (`:266-284`). This module is not evidence that App #132 works. Any approval must settle image/video processing location, consent, retention/deletion, model/evaluation evidence, and the exclusion of injury diagnosis.
- **#137 — Peptide/hormone reconstitution:** planned catalog record `:23`; V7 #239 is only a possible conceptual match (crosswalk `:240`). The dedicated Tool 137 files remain absent. Existing Tool 051 calculates concentration, desired-dose volume, U-100 units and doses/vial, and clamps values under 2 units upward (`lib/tools/engines/tool-051-peptide-dosage-calculator.ts:26-45`). Its related UI has draft saving and a separate dashboard persistence action, and Tool 021 contains protocol/storage language as documented above. These are risk evidence, not approved rules to copy. Owner must define whether any preparation or dose arithmetic is allowed and provide authoritative product-specific sources; do not inherit defaults, rounding/clamping, persistence, or instructions from 021/051.
- **#138 — Raw-powder density/oil formulation:** planned catalog record `:24`; V7 #240 possible conceptual match (crosswalk `:241`). Dedicated Tool 138 files remain absent. Existing Tool 144 only solves generic mass-volume-density arithmetic and requires density source plus measurement temperature when density is supplied; it contains no material-density database (`lib/tools/engines/tool-144-homebrew-chemistry-calculator.v6.ts:1-45`). This is not a powder displacement model or oil-formulation rule. Owner scope and source evidence are still required for any powder measurement method, displaced-volume interpretation, or formulation output.

Current planned set remains **#132, #137, #138 and #139**. These checks are implementation-gap and risk triage; none establishes product requirements or authorizes implementation. Tool #139's detailed scope gate is in `docs/SMARTTOOLS_TOOL_139_SCOPE_AUDIT.md`.

## Tool 148 owner decision and consent UX — 2026-10-27

The 2026-10-26 statement above that Tool 148 was not ready due to missing privacy approval is superseded for the narrowly approved Tool 148 → Tool 149 flow. The owner approved optional sharing of weight/body-fat values, only within the current session, with consent in Tool 148 and a fresh selection plus confirmation in Tool 149. Tool 148 stays private by default. Both UIs show the available fields and session lifetime; revocation, clearing source values/grants, and clearing the imported Tool 149 form copy are available. No persistence or external transmission was introduced. Current implementation, test, TypeScript, lint, validate-tools, and build evidence is in `docs/SMARTTOOLS_TOOL_148_PRIVACY_SCOPE_REVIEW.md`. This does not authorize other sharing targets or persistence.
