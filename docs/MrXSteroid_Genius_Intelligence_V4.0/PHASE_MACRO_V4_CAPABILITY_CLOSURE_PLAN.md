# MACRO V4 CAPABILITY CLOSURE PLAN — REVISION 2.2 — PROPOSAL ONLY

Project: MrXSteroid Genius Intelligence V4.0  
Tool: Macro Calculator (`mrx.tool.macro`, slug `macro`)  
Date: 2026-11-05  
Version: **Revision 2.2 of this file** — supersedes Revision 2.1 and earlier revisions in this same document  
Status: **PROPOSAL ONLY — NOT AUTHORIZED FOR IMPLEMENTATION**  
Audit baseline: `PHASE_MACRO_V4_FULL_CAPABILITY_COMPLIANCE_AUDIT_REPORT.md`  
Current Macro state: **PARTIAL** — bounded V4 Pilot Integration, not full V4 capability  
R5/R6/R7/R8 status: **NOT AUTHORIZED**

## 1. Scope and non-negotiable constraints

This revision does **not** re-audit Macro and does **not** implement any work. It updates the plan to match the accepted V4 contracts and the final compliance review.

No application file is changed in this task. No Macro V6 formula, constant, rounding rule, test, schema, route identity, registry, catalog, R1/R2 contract, Template V4, Supabase, provider, or dependency may change without a separate explicit owner authorization.

The plan preserves these decisions:

- Macro V6 is the sole numeric authority.
- `PARTIAL + INVALID INPUT → INVALID / INCOMPLETE` is the approved boundary.
- Invalid supplied fields never reach Macro V6 calculation; the engine rejects before calculation.
- Global AI lifecycle status remains `AI_NOT_CONFIGURED`; no provider is active or approved.
- Per-capability policy classification is documented outside the accepted TypeScript runtime profile fields, not smuggled into the accepted contract.
- Current cross-tool context remains inactive; `contextUsed=[]` must not be filled speculatively.
- No "saved", "synced", or "persisted" claim may be shown before R6 provider confirmation.
- `DEGRADED` remains a mapped state, not a state Macro V6 produces.
- Recomposition remains unsupported without a separate approved equation.
- R5 rollout is not authorized.
- `calculationId` is the accepted operation/run identity; no replacement fingerprint is generated, persisted, logged, or introduced in this closure scope.
- Fingerprint generation is deferred and requires a separately approved privacy/data-governance design and implementation scope.

The owner-accepted R4 evaluation result for the scoped pilot is not retroactively invalidated. Revision 2.2 keeps the same evidence discipline: scoped R4 acceptance is not certification, not production readiness, not accessibility completion, and not authorization for R5–R8.

## 2. Revision 2 decision model

There are four different levels of completion. They must not be conflated:

| Completion level | Meaning | Gate |
|---|---|---|
| Pilot readiness | Deterministic Macro API works, regression evidence exists | R3/R4 |
| R4 full acceptance | Pilot evidence package is complete and clean | R4 |
| Functional V4 completeness | Macro has approved input/output/safety/evidence/accessibility/contract behavior in a bounded deterministic scope | R1 + R3 + R4 |
| Full V4 production capability | Cross-tool, persistence, audit, rollout, AI and release are governed and executed | R5 + R6 + R7 + R8 |

This plan includes every item needed to move from PARTIAL toward each level. It grants none of them.

## 3. Canonical phase mapping

| Closure category | Correct gate | Independent approval required? |
|---|---|---|
| Documentation/Evidence Matrix and closure disposition | R1 | Owner-approved closure spec |
| Macro input/output field-profile design | R1 | Yes — contract/profile scope |
| Macro-only additive pilot implementation | R3 | Yes — implementation scope |
| Regression/build/RTL/accessibility re-evaluation | R4 | Owner-reviewed verification |
| Any other SmartTool or rollout batch | R5 | Yes — never automatic |
| Persistence/cross-tool/Supabase/audit | R6 | Yes — mandatory |
| Any AI provider/model or advanced capability | R7 | Yes — mandatory |
| Commit/push/merge/deploy/operations | R8 | Yes — mandatory |

### 3.5 Accepted R1 and R2 foundations are not reopened

R1 and R2 are accepted phases. This plan does not reopen their evaluation, rewrite their acceptance evidence, or silently change their runtime/template/contracts. Any Macro profile, guard, safety decision, or evidence registry described below is a proposed **additive** layer that must consume existing accepted contracts rather than modify them.

A Macro-specific profile is compatible only if it can build and validate against:

- `ToolResultEnvelopeV4`, `InputSnapshot`, `FieldState`, `InputCompleteness`, `ResultStatus`, `ResultType`;
- `AICapabilityProfile`, `SafetyContract`, `RiskTier`, `StorageStatus`, and the accepted V4 schemas;
- the current Template V4 behavior and current Macro V6 engine;
- the existing V4 runtime validators and `validateToolResultEnvelope`.

If a desired closure cannot be achieved without editing accepted contracts, runtime validators, Template V4, or Macro V6 behavior, then it is **not an additive Macro profile**. It is an independent architecture/contract change and requires its own owner approval and R1-level evidence. Such a change is out of scope here and must stop as `BLOCKED` until separately authorized.

Accepted R2 conditions remain tracked separately; this plan cannot absorb or discharge them.

### 3.6 Timestamp and schema-version semantics

Revision 2.2 retains the Revision 2.1 timestamp and version semantics exactly. They may not be used interchangeably:

- `createdAt`: envelope creation timestamp. It identifies the artifact, not the user's historical observation. It is injected by the caller for deterministic tests and MUST be an ISO-8601 instant with timezone/offset (UTC `Z` preferred).
- `recordedAt` (`InputSnapshot.recordedAt`): the time at which the snapshot was recorded. It may equal `createdAt` only because this proposal specifies a synchronous record-at-envelope creation policy; it MUST NOT be repurposed as an observation timestamp.
- `observedAt` (`InputSnapshot.observedAt`): the time at which an underlying external measurement or observation occurred. It is absent unless a real source/observation exists. It MUST NOT be synthesized as `new Date()`; absence is valid.
- `recordedAt` versus provenance record `recordedAt` (`ProvenanceRecord.recordedAt`): same policy must be applied consistently; both identify recording time, not observation time.
- If no audit/persistence layer is active, `createdAt` remains an injected test/runtime value and is not represented as evidence of durable storage.
- `contractVersion`: fixed to `4.0` for the accepted V4 contract line.
- `schemaVersion`: semver of the V4 envelope schema; currently `4.0.0` and must satisfy the runtime validator's semver requirement.
- `engineVersion`: identity/version of the Macro V6 engine or approved equation registry record; it MUST be traced, not silently assigned.
- `profileVersion` (Macro field/safety/AI profile): independently semver; a Macro profile revision does not imply a V4 schema revision.
- `profileVersion` collision policy: any proposal that changes `contractVersion` or `schemaVersion` must stop as an independent architecture change until explicitly approved.

Timestamps are supplied by the caller or documented policy layer; pure adapter code should receive them rather than invent them when determinism/testability matters. No timestamp may imply persistence/confirmation unless R6 provides it.

### 3.7 Risk classification semantics

SPEC assigns risk **per operation**, not permanently by tool name. The V4 Shell's `riskTier` is presentation/metadata only; it cannot replace operation-level policy logic.

For this plan:

- The operation table in §7.2 is the authority for risk classification.
- `riskTier="MEDIUM"` retained on the Macro shell describes the highest routine calculation-path risk in the current tool, not a blanket guarantee for every future action.
- AI-profile `riskClass` is likewise an overall tool/action profile ceiling; it does not weaken per-operation guards.
- Unknown or unclassified actions default to review/deny; they never default to LOW.
- HIGH/CRITICAL are not ordinary Macro calculation outcomes and remain prohibited without separate R6/R8 authorization.
- Output guards, Safety Contract enforcement, and fail-closed rules operate per operation and cannot be replaced by a single shell label.

### 3.8 R4 scoped PASS versus owner acceptance

The scoped R4 evaluation passed for the macro pilot in the current environment as recorded in `PHASE_R4_MACRO_PILOT_EVALUATION_REPORT.md`. That acceptance is scoped to the pilot evidence that was actually obtained. It is not:

- certification of production readiness;
- authorization for R5/R6/R7/R8;
- proof for other tools;
- a screen-reader certification;
- a requirement that every possible accessibility test has already passed.

The accessibility evidence that remains unverified is explicitly **NOT RUN**: full screen-reader pass, full keyboard traversal, actual 375px execution, and full axe report. Automated and browser evidence can support Macro R4, but it cannot be represented as an accessibility certification. Owner acceptance is a distinct decision and requires the owner to accept the precise evidence set.

### 3.9 Macro V6 protection including R6

`lib/tools/engines/macro.v6.ts` is treated as protected in R3, R3.1, R4, and every later phase until the owner issues a separate exact authorization. This includes any R6 persistence/cross-tool integration. An R6 design must not:

- alter Macro formulas, constants, rounding, constraints, equation identity, output semantics, version constants, exports, or engine behavior;
- hide defects by changing Macro V6 rather than the adapter/profile/policy;
- add logging by editing the engine silently;
- weaken, delete, or replace its existing tests.

If an R6 requirement cannot be satisfied without changing Macro V6 or its accepted adapter behavior, the work must stop as `BLOCKED` and request a specific Macro V6 authority decision. Surgery around Macro remains preferred and bound by existing regression equivalence evidence.

### 3.10 AI capability-status vocabulary reconciliation — conflict recorded, not silently resolved

The accepted documents do not use identical capability menu vocabularies:

- SPEC §14 shows a per-capability profile vocabulary including `ENABLED`, `DISABLED`, `NOT_CONFIGURED`, `DEGRADED`, and `SUSPENDED`.
- ACCEPTANCE_CRITERIA Gate R1 §3.4.2 calls for `ENABLED`, `DISABLED`, `CONDITIONAL`, or `NOT_APPLICABLE`.

Revision 2.2 does not rewrite either document. For this plan only:

- global Macro AI lifecycle state: `aiStatus = NOT_CONFIGURED`;
- per-capability **documented policy classification**: `DISABLED`;
- accepted runtime field: only `permittedCapabilities` / `prohibitedCapabilities` exist;
- per-capability `DISABLED` labels are documentation policy metadata and are not runtime fields accepted by `AICapabilityProfile`;
- optional later runtime enforcement of per-capability status would require an independent architecture/contract revision, not this plan.

**Owner decision required:** whether the Macro profile documentation keeps this two-vocabulary explanation unchanged, or asks for an R1 documentation revision/profile design that explicitly reconciles SPEC and AC. This plan does not silently modify either governing document.

## 4. Requirement-to-Phase Matrix

`File(s)` below are likely affected files. `Test(s)` are required evidence. A dash means verification without new implementation.

| ID | Gap | V4 reference | Phase | File(s) | Test(s) / acceptance criterion | Approval |
|---|---|---|---|---|---|---|
| M4-IN-01 | Versioned Macro input field profile | SPEC §4, §3.2; AC §3.1 | R1 → R3 | Proposed additive `lib/engines/core/v4/profiles/macro-input-profile.v4.ts`; optional `.test.ts` | Contract test enumerates six fields with type/required/unit/bounds/state/provenance/sensitivity | Yes |
| M4-IN-02 | Unit metadata and conversion boundary | SPEC §4; AC §3.1 | R1 → R3 | Profile; `components/tools/macro-pilot.tsx` (`KG_PER_LB`, `CM_PER_IN`) | Unit metadata equals engine kg/cm; imperial round-trip; no double conversion | Yes if registry changes |
| M4-IN-03 | Per-field provenance | SPEC §4, §4.1; AC §3.1 | R1 → R3 | Profile; `adapter.macro.v4.ts` (`buildInputSnapshot`) | `USER_ENTERED`/`MISSING`/`INVALID` represented; no fabricated source | Yes |
| M4-IN-04 | Clarify `observedAt` versus `recordedAt` timestamp semantics | SPEC §4, §7; AC §3.3 | R3 only if timestamp injection; R6 for persisted observation | Profile; adapter; no Macro V6 edit | `recordedAt` is the record-at-envelope-creation time and may equal injected `createdAt` only by explicit policy; `observedAt` remains absent unless a real observation exists; neither implies persistence | Conditional |
| M4-IN-05 | Sensitivity/consent/freshness metadata | SPEC §4, §8, §12; AC §3.1-3.3 | R1 → R6 | Profile; safety contract | Personal fields classified; no default consent; freshness absent until R6 policy approved | Yes |
| M4-IN-06 | Prompt-injection control statement | SPEC §4.2; AC §3.4 | R4 verification | Documentation/safety/profile only | No untrusted free-text path; input cannot override validation; model absent | Owner documentation decision |
| M4-IN-07 | Minimal-first progressive input | SPEC §3.2, §17; AC §3.1 | R3 → R4 | `macro-pilot.tsx` | Empty/partial requires only six fields; no optional field blocks valid basic result | Yes for UI scope |
| M4-IN-08 | Remove/defer `inputFingerprint` generation | SPEC §5.2; AC §3.2 | Not authorized in this scope | Adapter/runtime/hash policy; no V4 contract edit | No fingerprint is generated/persisted/logged; no hash dependency; no HMAC/salt/secret; `calculationId` remains operation identity; fingerprint deferred pending R1 privacy/data-governance design | Yes — privacy/data-governance approval required before implementation |
| M4-OUT-01 | Govern `engineVersion` identity | SPEC §5.2, §18; AC §3.2, §11 | R1 → R3 | `adapter.macro.v4.ts`; optional approved version constant | Envelope engine/equation identity traced to approved registry/constant | Yes |
| M4-OUT-02 | `ResultValidity` policy | SPEC §7; AC §3.3, §11 | R1 → R3/R4 | Adapter validity constants; freshness policy doc/profile | Valid result `CURRENT`; invalidated on input/engine change; no universal expiry | Yes if registry needed |
| M4-OUT-03 | Compatibility strategy | SPEC §27, §5; AC §4.1 | R1/R3/R4 | Compatibility document; additive versioning | `contractVersion="4.0"`; `schemaVersion="4.0.0"`; backward-compatible adapter remains | Yes |
| M4-OUT-04 | Output guard enforces applicable warnings/evidence only | SPEC §5, §9.5; AC §3.2, §3.4 | R1 → R3 → R4 | Adapter; runtime validator; Safety Contract | Verify coherent envelope for the applicable state: triggered deterministic warnings when their conditions hold; Mifflin evidence for equation outputs; assumptions when produced; schema/warning integrity. Do not impose absent warnings on every result, require Mifflin evidence for `NOT_AVAILABLE`, or backfill optional evidence | Yes for policy behavior |
| M4-OUT-05 | `nextActions` policy | SPEC §5.2, §10; AC §3.2/3.4 | R1 → R3/R7 | Adapter; UI communication | Current remains `nextActions=[]` OR approved deterministic local next-step behavior with consent boundary | Approval for any action |
| M4-OUT-06 | `calculationId` operation identity policy | SPEC §5.2; AC §3.2 | R1/R3 | Adapter/runtime ID policy | `calculationId` is operation/audit identity and never an input value or calculation input; not derived from prohibited fingerprint; no result determinism regression | Yes |
| M4-OUT-07 | `auditRef` persistence-gated | SPEC §5.2, §12.3; AC §8 | R6 only | R6 persistence adapter; audit sink | No `auditRef` before R6; present only after confirmed storage write | Yes mandatory |
| M4-NC-01 | Keep uncertainty `NOT_ASSESSED` | SPEC §6; AC §3.3, §11 | R4 | `adapter.macro.v4.ts` uncertainty builders | No numeric confidence; no false accuracy score | No |
| M4-EV-01 | Mifflin registry entry | SPEC §19; AC §13, §11 | R1/R4 | Evidence registry/docs; adapter citation | Stable ID/version/equation/units/population/exclusions/tests/status registered | Yes |
| M4-EV-02 | Assumptions reference registry rule IDs | SPEC §5, §19; AC §3.2, §13 | Adapter assumptions; registry | Assumption records point to governed rule IDs; missing entry blocks "governed" claim | R1/R3/R4 | Yes |
| M4-EV-03 | Source review/date records | SPEC §19; AC §13 | Registry docs only | No invented review date; limitations cite 19–78 study population and app 19–100 extrapolation | R1/R4 | Yes |
| M4-EV-04 | Engine-change invalidation | SPEC §7; AC §4.1, §11 | Compatibility policy; adapter validity | Formula/engine version change marks prior result invalid/incomparable | R1/R3/R4 | Yes |
| M4-EV-05 | Honest uncertainty reduction guidance | SPEC §6.2; AC §3.3 | Adapter wording/test | Basis names deterministic estimate/user activity; suggests measurement only as option, no prescribing | R4 | Documentation decision |
| M4-SAF-01 | Explicit intended-use/out-of-scope | SPEC §9.1, §9.3; AC §3.4, §6.3, §11 | Safety profile/document; UI only after approval | User-visible boundary: non-diagnostic general arithmetic; not eating-disorder management/treatment/prescribing | R1/R3/R4 | Yes |
| M4-SAF-02 | Operation risk registry | SPEC §9.1, §9.3; AC §3.4 | `macro-safety-contract` additive module; adapter risk wiring | LOW = calculation/what-if; MEDIUM = phase adjustment/extrapolation; HIGH/CRITICAL prohibited; unknown defaults to review/deny | R1/R3/R4 | Yes |
| M4-SAF-03 | Sensitive input inventory | SPEC §9.3, §12.1; AC §3.4 | Profile/safety contract | Six fields classified personal; retention/deletion policy stated; no inferred sensitive traits | R1/R3/R4 | Yes |
| M4-SAF-04 | Input guards (range/infinite) | SPEC §9.5; AC §3.4, §11 | Existing engine tests; guard registry | Age 19–100, height/weight/activity bounds block before formula; invalid fields never calculate | R4 | Regression only; new guard = yes |
| M4-SAF-05 | Output guards | SPEC §5, §9.5; AC §3.4 | Adapter; `validateToolResultEnvelope` | Cut-below-BMR and age-out-of-sample warnings; malformed envelope rejected; no NaN/Infinity | R3/R4 | Yes for policy change |
| M4-SAF-06 | No permission/side-effect authority | SPEC §9.7; AC §3.4, §23 | Current pilot/no-write mode; future R6 profile | Zero tools/actions/roles; server-side auth mandatory if changed | R6 | Yes |
| M4-SAF-07 | Human escalation boundary | SPEC §9.8, §9.9, §10; AC §3.4, §11 | Safety profile; localized warning | Concerning/treatment-oriented requests route to qualified professional; no diagnosis/dosing/cycle | R1/R3/R7 | Yes for policy/text |
| M4-SAF-08 | Fail-closed rules | SPEC §13, §9.9; AC §3.4, §6.3 | Engine invalid path; runtime policy | Invalid input produces no number; dependency/log failure blocks high-risk action; no silent recovery | R1/R6/R8 | Yes |
| M4-SAF-09 | Audit policy for non-side-effecting mode | SPEC §12.3; AC §8, §13 | Documentation; optional R6 sink | No misleading audit claim; R6 audit only after confirmed write | R6/R8 | Yes |
| M4-SAF-10 | Nutrition/medical boundary | SPEC §9.3; AC §3.4, §11 | Macro copy; warning preservation | No diagnosis/treatment/BMI eating-disorder screen/prohibited threshold | R4 | Owner review |
| M4-AI-01 | Explicit profile using accepted R1 `AICapabilityProfile` shape only | SPEC §8; AC §3.4 | Profile document/object; no provider | `aiStatus=NOT_CONFIGURED`; `permittedCapabilities=[]`; all ten `prohibitedCapabilities`; zeros budget; null/unconfigured modelPolicy; no unauthorized fields | R1/R3 | Yes |
| M4-AI-02 | Deterministic fallback policy | SPEC §8, §13; AC §3.4 | Profile fallback | `continue_deterministic` unavailable behavior; invalid output/timeout/budget stop AI path deterministically | R1/R3/R4 | Yes |
| M4-AI-03 | AI stop conditions | SPEC §8, §13; AC §3.4 | Profile; governance | Provider/model request, output received, budget increase, safety/audit failure all stop AI path; deterministic engine remains unchanged | R1/R4/R7 | Yes |
| M4-XT-01 | Explicit no-context default | SPEC §3, §11; AC §6.2, §13 | Adapter context; capability profile | `contextUsed=[]`; no hidden import; no cross-tool result claim | R1/R3/R4 | No if only a stop decision |
| M4-XT-02 | Inbound Body Fat path optional | SPEC §11, §18; AC §4.1, §11 | `lib/tools/engines/macro.v6.ts`, app/pilot R6 wire | Imported result schema/units/ownership/freshness validated; user value wins; `CROSS_TOOL_DERIVED` only if used | R6 | Yes mandatory |
| M4-XT-03 | Ownership/consent enforcement | SPEC §11, §12; AC §6.2, §8 | R6 context service; auth boundary | Cross-user/tenant denied; withdrawal invalidates; minimal projection only | R6 | Yes mandatory |
| M4-XT-04 | Freshness/stale rejection | SPEC §7, §11; AC §6.3, §8 | Cross-tool validation layer | Stale/mismatched/wrong-unit source rejected; no silent overwrite | R6 | Yes mandatory |
| M4-XT-05 | Cycle prevention | SPEC §11; AC §8 | Adapter dependency guard | Circular macro→bodyfat→macro chain impossible; test must prove rejection | R6 | Yes |
| M4-XT-06 | Cross-tool UI choice | SPEC §11, §17; AC §6.4 | `macro-pilot.tsx` R6 mode | Explicit accept/reject source; no hidden import; reset path; Arabic/RTL parity | R3/R6 | Yes |
| M4-XT-07 | Outbound graph publication | SPEC §11; AC §8 | `CROSS_TOOL_LINKS` registry | No speculative outbound links; publish only after tested dependency | R6+ | Yes |
| M4-XT-08 | Cross-tool audit evidence | SPEC §11, §12.3; AC §8, §13 | R6 audit policy | Minimal context reference; pseudonymous audit; no raw record export | R6/R8 | Yes |
| M4-PER-01 | Explicit ephemeral `LOCAL_ONLY`/`NOT_SAVED` | SPEC §12.2, §13; AC §8 | Pilot docs/profile; optional UI copy | Since no storage is implemented, UI/adapter must not imply persistence | R1/R4 | Owner product decision |
| M4-PER-02 | Supabase adapter/storage states | SPEC §12.2, §12.3; AC §8 | New R6 adapter/migrations | LOCAL_ONLY→PENDING→CONFIRMED/FAILED/NOT_SAVED transitions; false synced claims forbidden | R6 | Yes mandatory |
| M4-PER-03 | Ownership/RLS/isolation | SPEC §12.1-12.3; AC §8 | Supabase auth/RLS if authorized | Cross-user read/write denied; delete/export; consent withdrawal; force-RLS | R6 | Yes mandatory |
| M4-PER-04 | Idempotency/retry/conflict | SPEC §13; AC §8 | R6 writes/updates/retries | Duplicate prevention; bounded retry; conflict UI; no silent overwrite | R6 | Yes |
| M4-PER-05 | Pseudonymous audit trail | SPEC §12.3; AC §8, §13 | R6 audit writer | Actor pseudonym, policy/version, outcome, correlation ID, redaction; no raw health data | R6/R8 | Yes |
| M4-PER-06 | Failure degradation | SPEC §13, §3; AC §4.1, §6.3 | Engine error adapter; optional R6 persistence failure path | Engine failure returns structured no-number error; API/persistence failure shows pending/failed, never "saved" | R4/R6 | Conditional |
| M4-PER-07 | Real/included DEGRADED path or explicit absence | SPEC §3, §13; AC §4.1, §6.1 | Adapter controlled degraded envelope | Claim only controlled mapping, not engine output | R4/R6/R7 | Owner review |
| M4-A11Y-01 | Full keyboard traversal | SPEC §24; AC §6.4 | Pilot UI; no template change | 100% controls keyboard-reachable; visible focus; no trap; correct tab order | R3/R4 | Implementation approval if defect |
| M4-A11Y-02 | 375px actual viewport pass | SPEC §24; AC §6.4 | CSS/pilot; manual/DevTools protocol | `document.scrollWidth <= window.innerWidth`; zero clipped controls | R4 | Owner test scope |
| M4-A11Y-03 | Screen-reader pass | SPEC §24; AC §6.4 | Page; focus/text order | NVDA/VoiceOver: h1, six labels, alert, role=status, localized Arabic | R4 | Owner accessibility reviewer |
| M4-A11Y-04 | Full axe pass | SPEC §24; AC §6.4 | Local analysis; no dependency unless approved | Zero pilot violations or written exceptions; site-wide ignored only explicitly | R4 | Dependency/driver approval |
| M4-A11Y-05 | Site-wide defects optional | SPEC §24/§26; AC §6.4, §10 | Header/footer/config; outside pilot | `main`, heading order, header contrast, Home touch target, meta fixed only if authorized | R8 | Yes |
| M4-A11Y-06 | Arabic RTL equivalence | SPEC §24; AC §6.4 | Arabic copy/tests/CSS | `lang=ar dir=rtl`; localized status/results/alerts; warning content not dropped | R3/R4 | Already in scope; regression |
| M4-A11Y-07 | Accessibility automation remains | AC §6.4 | Existing tests | 262 relevant tests pass; no lint/build/typecheck error | R4 | No |
| M4-GOV-01 | Formula/evidence registry | SPEC §19 | Registry record/docs | Mifflin stable ID, equation, units, population, exclusions, tests, approval date | R1/R4 | Yes |
| M4-GOV-02 | Formula ledger protection | AC §11 | `macro.v6.ts`; tests | Formula/version/test count unchanged | R4 | No |
| M4-GOV-03 | Formula change record | SPEC §19 | Proposal/change record | Comparison, effect analysis, owner approval before implementation | R7/R8 | Yes mandatory |
| M4-GOV-04 | Traceability | SPEC §19, §29; AC §10, §13 | Release/batch docs | Requirement IDs link file/function/test/change/rollback | R5/R8 | Yes |
| M4-GOV-05 | V3→V4 compatibility register | SPEC §27, §5, §18; AC §4.1 | Compatibility doc | V3 remains intact; V4 is additive; route identity unchanged | R1/R4 | Documentation owner approval |

## 5. Dependency matrix for the proposed closure work

Dependencies are logical only; they do not authorize work.

| Group | Depends on | Unlocks | Must not happen before |
|---|---|---|---|
| M4-IN profile | V4 contract stability; owner-approved macro profile scope | M4-OUT identity/registry; safety classification | Any runtime/contract edit without R1 approval |
| M4-OUT identity/validity | M4-IN profile; owner-approved registry scope | M4 EV rules; R4 closure evidence | Changing engine identity constant silently |
| M4-EV governance | Mifflin registry record; formula preservation | R4 full evidence; future compatibility decision | Claiming registry governance without owner review |
| M4-SAF contract | Intended-use owner/product review | R4 safety sign-off; future persistence authorization | Persistence/action enablement without SafetyContract |
| M4-AI profile | No-provider policy; owner profile review | R7 gate; optional assistance | Any model/provider/prompt/data transfer |
| M4-XT cross-tool | M4-SAF approval; consent/ownership/freshness design | Body Fat opt-in; cross-tool claim | Wiring `linkedData` without R6 |
| M4-PER persistence/audit | M4-SAF; R6 schema reconciliation | R6 writes; cross-tool audit; release evidence | Any Supabase migration/write |
| M4-A11Y certification | Pilot CSS/markup stability; accessibility reviewer | R4 full evidence | Declaring accessibility complete using automation alone |
| M4-R5 batches | R4 PASS and owner batch membership | Additional tool rollouts | Any automatic expansion from Macro success |
| M4-R6 persistence | M4-PER design, R6 approval | Storage states, audit, context handoff | Shipping "saved/synced" claims |
| M4-R7 AI | R1 profile, R6 optional, R7 prerequisites | Optional assistance/prediction gates | Any AI provider configuration |
| M4-R8 release | All gates passed for intended scope | Commit/push/merge/deploy | Any release action without explicit approval |

## 6. Macro AI Capability Profile — accepted-contract alignment

This section aligns the profile design to the actual accepted TypeScript contract in `lib/engines/core/v4/contracts.v4.ts` (`AICapabilityProfile`, lines 256–277). No field is added that is absent from `AICapabilityProfile`.

### 6.1 Vocabulary: global status versus policy metadata

- **Global AI lifecycle state**: `aiStatus = NOT_CONFIGURED`. This is accepted by both `AIStatus` (contracts.v4.ts line 238) and ACCEPTANCE_CRITERIA Gate R1 §3.4.1.
- **Per-capability status**: The accepted `AICapabilityProfile` does **not** store individual capability statuses. Individual capability classifications in this plan are therefore **documented policy metadata**, not runtime fields and not TypeScript properties.
- **Documented policy classifications**: all ten capabilities are classified `DISABLED` for Macro. `DISABLED` is a documented question of whether a capability is deliberately outside the Macro category; it is not a property of `AICapabilityProfile`.
- **AC/SPEC vocabulary conflict**: SPEC names a broader per-capability vocabulary; AC Gate R1 §3.4.2 names `ENABLED`/`DISABLED`/`CONDITIONAL`/`NOT_APPLICABLE`. Revision 2.2 does not modify either document and records the owner choice as unresolved for runtime design. This plan uses `DISABLED` consistently because it is common to the two relevant vocabularies for this no-AI configuration.
- **`prohibitedCapabilities`**: all ten capability IDs from accepted `AICapability` (contracts.v4.ts lines 240–250). This is the decisive runtime guard when a runtime profile is created later.

### 6.2 Exact accepted-shape design example

The following is a contract-shaped design example only. Implementing it requires R1 approval and tests; it is not executable from this document. Every field is a property of `AICapabilityProfile`.

```ts
const macroAICapabilityProfile: AICapabilityProfile = {
  toolId: 'mrx.tool.macro',
  profileVersion: '1.0.0',
  aiStatus: 'NOT_CONFIGURED',
  permittedCapabilities: [],
  prohibitedCapabilities: [
    'INPUT_UNDERSTANDING',
    'MISSING_DATA_COACH',
    'UNIT_FORMAT_ASSIST',
    'CONTEXT_RESOLUTION_ASSIST',
    'SMART_VALIDATION_ASSIST',
    'SCENARIO_GENERATION_ASSIST',
    'SENSITIVITY_EXPLANATION',
    'EVIDENCE_AWARE_EXPLANATION',
    'SAFETY_ESCALATION_ASSIST',
    'NEXT_STEP_RECOMMENDATION',
  ],
  allowedInputClasses: [],
  excludedInputClasses: ['PERSONAL', 'SENSITIVE', 'HIGHLY_SENSITIVE'],
  approvedContextSources: [],
  outputSchema: 'MACRO_AI_PROFILE_NO_OUTPUT', // schema ID reference; no AI output is accepted
  allowedTools: [],
  actionPermissions: [],
  riskClass: 'MEDIUM', // overall profile ceiling; operation risks remain table-driven
  evidenceMinimum: 'NONE', // no AI output or claim may be introduced under this profile
  humanReviewRules: ['ANY_AI_ASSISTANCE_BLOCKS_EXECUTION'],
  modelPolicy: null,
  budget: {
    maxCallsPerSession: 0,
    maxTokensPerCall: 0,
    maxCostPerSession: 0,
    maxRetries: 0,
    timeoutMs: 0,
    maxConcurrency: 0,
  },
  fallbackPolicy: {
    onUnavailable: 'continue_deterministic',
    onInvalidOutput: 'block',
    onTimeout: 'block',
    onBudgetExceeded: 'stop',
  },
  evaluationProfile: {
    goldenTestCount: 0,
    adversarialTestCount: 0,
    qualityThreshold: 1, // not an AI quality PASS claim; it marks no accepted AI output as valid
    evaluationResult: 'NOT_RUN',
  },
  stopConditions: [
    'PROVIDER_OR_MODEL_REQUESTED',
    'BUDGET_INCREASED',
    'UNVALIDATED_MODEL_OUTPUT_RECEIVED',
    'SAFETY_OR_AUDIT_CHECK_FAILS',
    'ENGINE_NUMERIC_OUTPUT_CHANGE_ATTEMPTED',
  ],
  auditPolicy: {
    logInputs: false,
    logOutputs: false,
    redactSensitive: true,
    retentionDays: 0,
    accessibleBy: [],
  },
};
```

Explicit field notes:

- `outputSchema` is a string because the accepted type requires `string`. `MACRO_AI_PROFILE_NO_OUTPUT` is a documented schema ID marker: an AI output with no model cannot satisfy any validatable schema. If owners later enable AI, an approved schema and runtime registry are mandatory; this profile is not an approval.
- `allowedInputClasses=[]` means no data class may be sent to a model. `excludedInputClasses` is explicit and redundant for AI-disabled fail-closed behavior; it prevents future accidental expansion.
- `excludedInputClasses` excludes `PERSONAL`, `SENSITIVE`, and `HIGHLY_SENSITIVE` from model use. It does not define site storage policy; Macro does not store data in this profile.
- `actionPermissions=[]` means the Macro AI profile grants no read/propose/execute permission. This is stronger and more accurate for this tool than granting a `read` permission merely because deterministic UI data is displayed locally.
- `modelPolicy: null` is valid when no model exists or is approved. SPEC and AC require either identified model/provider/version or explicit non-configuration; this is explicit non-configuration.
- `evaluationProfile.goldenTestCount/adversarialTestCount=0` and `evaluationResult: NOT_RUN` are intentionally unambiguous: no AI evaluation has run because no AI feature exists. `qualityThreshold: 1` is not a passing quality score; it is the profile's zero-acceptance boundary.
- `stopConditions` are triggers, not proof paths. They tell future governance when to disable AI; they do not approve provider behavior.
- `auditPolicy.logInputs/logOutputs=false`, redaction on, retention 0. If audit/persistence is desired later, that is R6 and requires a separate privacy policy; it cannot be retrofitted silently.

### 6.3 Ten-capability policy classification

These are Macro policy classifications, not accepted runtime profile properties. They make the denylist explicit and auditable for owner review.

| # | Capability ID | Policy classification | Suitability / restriction | Enforcement now |
|---:|---|---|---|---|
| 1 | INPUT_UNDERSTANDING | `DISABLED` | No natural-language intake; AI may not fill or normalize inputs | `prohibitedCapabilities` contains this ID; no AI path exists |
| 2 | MISSING_DATA_COACH | `DISABLED` | Missing-field guidance is deterministic and contains no inferred values | `prohibitedCapabilities`; AI cannot know required-field answers |
| 3 | UNIT_FORMAT_ASSIST | `DISABLED` | Unit separation/conversion is deterministic; AI cannot become authority | `prohibitedCapabilities`; deterministic unit/UI logic only |
| 4 | CONTEXT_RESOLUTION_ASSIST | `DISABLED` | No consented owned fresh context exists in pilot | `prohibitedCapabilities`; `contextUsed=[]` |
| 5 | SMART_VALIDATION_ASSIST | `DISABLED` | Engine validators own range/type/feasibility decisions | `prohibitedCapabilities`; validator cannot be overridden |
| 6 | SCENARIO_GENERATION_ASSIST | `DISABLED` | Deterministic bounded scenarios only | `prohibitedCapabilities`; no free-form recommendations |
| 7 | SENSITIVITY_EXPLANATION | `DISABLED` | Local finite-difference sensitivity; no causal recommendation | `prohibitedCapabilities`; no causal claim |
| 8 | EVIDENCE_AWARE_EXPLANATION | `DISABLED` | Evidence registry governance not approved; AI cannot invent citations | `prohibitedCapabilities`; no unreviewed source citation expansion |
| 9 | SAFETY_ESCALATION_ASSIST | `DISABLED` | Safety policy owns block/allow; escalation is deterministic | `prohibitedCapabilities`; no lowering of risk or approval authority |
| 10 | NEXT_STEP_RECOMMENDATION | `DISABLED` | No navigation/recommendation graph exists in Macro | `prohibitedCapabilities`; `nextActions=[]` remains current |

### 6.4 What would change this decision

Macro may be considered for AI only under **R7** with an owner-approved complete profile and all of the following:

- explicit provider/model/version, legal/user-notice basis, and privacy review;
- `outputSchema` assigned to an approved schema with validation tests;
- allowed input classes and tools explicitly populated and reviewed;
- action permissions explicitly nonzero for the exact approved capability only;
- budget, fallback, stop conditions, monitoring, audit, false-positive/false-negative analysis;
- proof that AI cannot influence engine numeric output;
- Safety Contract approved and enforced;
- rollback and kill-switch documented;
- owner authorization explicitly scoped to that capability.

No R7 approval exists now. Macro remains `aiStatus=NOT_CONFIGURED`.

## 7. Macro Safety Contract — complete operation-level proposal

This is the proposed binding content for owner approval. It is not enforced automatically by this document.

### 7.1 Domain and intended use

Macro Calculator performs general, deterministic nutrition arithmetic:

- Mifflin-St Jeor resting-energy estimate.
- TDEE from user-selected activity multiplier.
- Maintenance/bulk/cut calorie target at the defined +15%/0%/−15% behavior.
- Protein estimate 2.2 g/kg, fat 0.9 g/kg, residual carbohydrate.
- Display, scenario comparison, sensitivity, deterministic warnings.

It does **not** diagnose, treat, prescribe, manage eating disorders, recommend medication/hormone/drug dosing, guarantee weight change, replace clinical assessment, or infer disease.

### 7.2 Operation-level risk registry

Risk is assigned per operation, as required by SPEC §9. The `MEDIUM` shell label retained in the current integration is an aggregate/profile ceiling for the existing routine path, not a substitute for this table and not permission for MEDIUM across future/high-risk actions. Unknown or unclassified actions default to review/deny; they never default to LOW.

| Operation | Risk tier | Deterministic basis | Human review / prohibition |
|---|---|---|---|
| Calculate BMR | LOW | Sex-specific equation; fixed constants | No diagnosis; user may interpret BMR estimate as clinical fact |
| Calculate TDEE | LOW | BMR × selected activity factor 1.2–1.9 | No "perfectly accurate metabolism" claim |
| Generate macro targets | LOW | Fixed equation/percentage behavior | No individualized medical guarantee |
| What-If weight/activity/TDEE | LOW | Deterministic bounded scenario; local response | Scenario is estimate, not promise |
| Switch cut/maintenance/bulk | MEDIUM | Goal-linked calorie adjustment | User must recognize medical/fit implications; below-BMR triggers warning |
| Age outside 19–78 study sample | MEDIUM | Explicit extrapolation warning | User/professional review indicated; not automatically invalid |
| Any diagnosis/treatment/cycle/drug dose | HIGH/CRITICAL | Prohibited | Never performed or authorized |
| Any external action/write/payment | HIGH/CRITICAL | No implementation or approval | Blocked; separate R6/R8 gate |
| Unknown/unclassified action | Defaults to review/deny | SPEC unknown-risk rule | Never defaults LOW |

### 7.3 Sensitive inputs

- Age, sex at equation input, height, weight, activity factor, phase/goal preference.
- Classified `PERSONAL`; no inference of religion, diagnosis, medication, pregnancy, disability, diet identity, or eating-disorder status.
- No retention or export unless R6 policy is approved and consented.
- Unit/display conversion never changes canonical math.

### 7.4 Input guards

- Required six fields; no silent defaults.
- Age 19–100 with explicit extrapolation warning outside 19–78.
- Height/weight/activity constrained within engine contract.
- Non-finite values rejected before formula evaluation.
- Infeasible carbohydrate distribution rejected without invented target.
- Provenance marked `USER_ENTERED` or `MISSING`/`INVALID`; no AI extraction.

### 7.5 Output guards

Output guards are conditional on the actual state and on the rules selected by the engine. They do not turn every warning into a universal warning, nor every evidence source into a universal requirement.

- Output type `CALCULATED` for a complete valid result; `NOT_AVAILABLE` for missing/invalid input; never `MODEL_PREDICTION`/`STATISTICAL_ESTIMATE`.
- No numeric confidence, no "accuracy" score, no treatment language.
- Preserve triggered `TARGET_BELOW_ESTIMATED_BMR` only when `cut && targetCalories < BMR` is actually true; preserve triggered `AGE_OUTSIDE_ORIGINAL_EQUATION_SAMPLE` only when age is outside 19–78.
- `DETERMINISTIC_CALCULATION` warning may remain common because it expresses the output nature, not a diagnosis. Mifflin evidence is required for a Mifflin-derived equation result, not for a `NOT_AVAILABLE` envelope with no calculation.
- Assumptions are required only when the engine produced an assumptions array for a calculated result; absence is not automatically a failure.
- `validateToolResultEnvelope` must accept/audit the wrapper shape where one exists.
- `NOT_AVAILABLE` for missing/invalid input, never fabricated fallback numbers; envelope remains structured and validated.
- Guard semantics are negative/validating, not generative: they reject bad output; they do not create evidence, warnings, or assumptions.

### 7.6 Prohibited outputs/actions

- Diagnosis, treatment plan, medication/hormone/drug dosing.
- Eating-disorder screening/threshold or compulsory weight target.
- Unbounded fasting/refeeding recommendation.
- Guaranteed fat loss/muscle gain or causal claims from sensitivity.
- Credentialed external action, database write, payment, or communication.

### 7.7 Permission model

- Current pilot action permission: **read/propose/execute none** beyond local deterministic calculation.
- No user-role, tenant, or tool allowlist is evaluated because no tool is called and no write exists.
- If R6 is approved, server-side authorization and explicit resource scope are mandatory before any write/export.

### 7.8 Human escalation

- Concerning/treatment-oriented language directs to qualified professional.
- The system does not decide whether low calories are safe or prescribe a target.
- No automatic escalation action exists in Macro today.
- If external action is introduced, rejection/timeout denies action; audit failure blocks high-risk action.

### 7.9 Fail-closed rules

- Missing required input: no calculation.
- Invalid value: no calculation.
- Formula/validation failure: structured error only.
- Cross-tool context unavailable/stale/unauthorized: excluded as `contextUsed=[]` or rejected; never silently substituted.
- Persistence unavailable: no "saved" indication; local result marked not saved.
- Audit/policy unavailable: high-risk action blocked; low-risk non-side-effect path may continue by explicit profile decision.

### 7.10 Audit requirements (future R6/R8 only)

If audit is authorized, it must record pseudonymous actor/session reference, tool ID, engine/contract/safety policy versions, capability/risk, validation outcome, freshness/source reference, engine identity/policy decision, warning IDs, outcome, redacted context. It must not retain raw sensitive inputs unless explicitly minimized/consented/required.

### 7.11 User-facing explanation

Plain language:

- "This is arithmetic guidance, not medical advice."
- "Results depend on your entered weight, activity factor, and phase; they are estimates."
- "If you have a medical condition or eating concern, consult a qualified professional."
- "This tool does not save or share your result unless persistent storage is explicitly enabled and approved."

## 8. R4 requirements — separated and objectively verifiable

These items distinguish the scoped R4 acceptance already received from a fuller owner acceptance certification. Any item that remains unexecuted or is reported `NOT RUN` cannot be converted into `PASS` for a broader acceptance claim. The existing scoped R4 result remains limited to the evidence originally captured.

These items define clean R4 pilot acceptance. They do not authorize R5/R6/R7/R8.

### 8.1 Evidence and tests

- Current Macro V6 81/81, Body Fat 46/46, V4 contracts/runtime, adapter, template, pilot, integration, remediation, validate-tools.
- TypeScript, targeted ESLint, production build exit 0.
- Output equivalence test (`UI result` equals direct engine result).
- EMPTY/PARTIAL/FULL/INVALID/DEGRADED mapping.

### 8.2 Keyboard evidence (must be executed and recorded)

Current evidence status: **PARTIAL — automated focus tests and focus-visible CSS pass; full keyboard traversal remains NOT RUN.**

- Tab sequence reaches all six inputs, region status, validation message, Recalculate, meaning/exercise links.
- Focus visible at every stop; no keyboard trap.
- Enter/Space activates Recalculate.
- Recalculates with changed input via keyboard.
- Arabic and RTL keyboard order is logical.

### 8.3 Screen-reader evidence (must be executed and recorded)

Current evidence status: **NOT RUN — no screen-reader pass may be claimed yet.**

Using NVDA/VoiceOver/Narrator/JAWS as available:

1. `h1` announces Macro title in current language.
2. Six labelled inputs announce names/values/units.
3. EMPTY guidance list is announced.
4. `role="status" aria-live="polite"` announces localized incomplete/complete/unavailable state, never raw `NOT_AVAILABLE`/`SUFFICIENT_FOR_BASIC_RESULT`.
5. Invalid input announces one alert with localized message.
6. Result reading order is coherent; percentages/warnings intelligible; V4 chrome grammar not confused for data.
7. V3/V4 duplicate landmarks are absent.

### 8.4 375px evidence (must be executed and recorded)

Current evidence status: **NOT RUN — CSS media rules were verified, but actual 375px execution was not.**

- Test actual device/emulated viewport, not only CSS media rule.
- `scrollWidth <= innerWidth`.
- Six inputs visible/unclipped.
- Header/footer do not obscure inputs.
- Status/warning/result text wraps; no horizontal page overflow.
- Arabic RTL at 375px performs equivalently.

### 8.5 RTL/LTR bilingual record

Required evidence for both languages:

- `lang` and `dir` values.
- Arabic status `المدخلات غير مكتملة` / `اكتمل الحساب`.
- Arabic alert/warnings and English equivalents.
- Arabic input/numbering behavior.
- Same numeric result in both languages.

### 8.6 R4 block conditions

Any required execution that remains unavailable may be recorded `NOT RUN`, but then R4 cannot be represented as fully accessibility-complete; only scoped pass may be claimed. Any one of these invalidates clean R4 acceptance: regression FAIL, V3 duplicate shell, calculation mismatch, unlocalized live status (raw tokens exposed), inaccessible keyboard path, or missing build/typecheck/lint evidence.

## 9. Macro "complete" definition within functional scope

If all R4 and functional closure items are approved/verified, Macro can be called **Macro V4 Functionally Complete (Deterministic Scope)**. It still cannot be called production-released, persistent, AI-augmented, cross-tool, or approved for other tools.

Required visible capability in scope:

- Six required-field structured intake (age/sex/height/weight/activity/phase), no defaults.
- Macro V6 calculation is authoritative.
- Explicit empty/partial/full/invalid states.
- Validated Mifflin–St Jeor implementation exact to approved equation, tests preserved.
- Metric display with canonical kg/cm; optional imperial boundary conversion.
- Deterministic assumptions, warnings, distribution arithmetic, residual carbs.
- Bounded deterministic what-if and local sensitivity.
- Localized Arabic/English rendering, RTL/LTR behavior.
- Accessible labels, localized live status, ARIA alerts.
- Input/provenance/envelope semantics are honest (no fabricated evidence/confidence/persistence).
- `calculationId` remains the accepted operation identity; no stable fingerprint.
- Rollback path; route identity unchanged.

Visible user limitations that should remain truthful:

- Estimates, not measurements or clinical guidance.
- No diagnosis/treatment/eating-disorder management.
- Results depend on entered activity factor, height, weight, age/sex equation.
- No guarantee of fat loss/gain.
- No history or persistence unless R6 is approved.
- No cross-tool data use unless R6 is approved.
- No AI assistance unless R7 is independently approved.

## 10. Deferred and out-of-scope requirements

### 10.1 R5 — controlled batches

All other tools require separate batch approval; Macro cannot be copied forward without repeating all gates. Excluded from current work:

- Tool IDs, catalog, registry changes.
- Template V2 rollout to other tools.
- Shared UI shell rollout.
- Any batch membership decision.

### 10.2 R6 — persistence and cross-tool integration

Deferred to R6 only:

- Supabase tables, migrations, RLS, writes, reads, export, retention.
- Cross-tool user ownership/consent/freshness.
- `bodyfat-to-macro` wiring in UI.
- `CROSS_TOOL_DERIVED` calculation mode.
- Cross-tool audit evidence.
- Optional same-user local history or correction/deletion.
- Any `auditRef`.

### 10.3 R7 — AI and advanced capability

Deferred to R7 only:

- AI assistance of any kind.
- Natural-language intake parser.
- AI explanation, coach, recommender, scenario generator, validator.
- Predictions or statistical/ML model.
- Image/voice/file inputs.
- Cost/budget/provider/model decisions.

### 10.4 R8 — release and operations

Deferred to R8 only:

- Commit/push/merge/tag/release/deploy.
- Release candidate selection.
- Production monitoring/alerting beyond owner-approved privacy settings.
- Site-wide accessibility/footer/header remediation.
- Rollback/runbook ownership and on-call/operations approval.

## 11. Risk matrix by closure group

| Group | Top risks | Control | Residual after preferred closure | Rollback |
|---|---|---|---|---|
| M4-IN | Wrong units/type accepted; provenance mislabeled | Versioned profile; six-field contract tests; no fingerprint in this scope | Low | Revert profile/tests; engine untouched |
| M4-OUT | Wrong/untrusted envelope identity; silent invalidity | Registry/validity tests; accepted-contract design review | Low-medium | Revert adapter fields; keep envelope valid |
| M4-EV | False evidence authority; misleading uncertainty | Owner-approved registry/source record | Medium until review | Revert citation/registry only |
| M4-SAF | Medical misinterpretation; missing prohibition | Safety contract owner review; explicit UI boundary | Medium | Revert copy/profile; engine unchanged |
| M4-AI | Accidental provider/cost/privacy path | Accepted-contract no-provider profile; all ten denied; zero budget | Low if enforced by review | Delete or owner-supersede profile; no provider exists |
| M4-XT | Unauthorized cross-tool data use | R6-only; consent/ownership/freshness/allowlist gate | High until R6 approved | Remove wire; `contextUsed=[]` |
| M4-PER | Data leak/isolation failure; false saved claim | R6 schema/RLS/idempotency/audit gate | High until R6 approved | Disable feature; drop/rollback migration as approved |
| M4-A11Y | Regression on mobile/screen reader | Device/viewport tests; NVDA/JAWS; axe zero-pilot-scope | Medium | Revert UI/CSS only |
| M4-GOV | Formula/comparability drift | Compatibility plan; 81/81 baseline unchanged | Medium | Rollback adapter/registry; engine untouched |
| M4-R5 | Unapproved expansion outside Macro | No app/registry references to Macro beyond pilot | Very high if unauthorized; currently none | Stop; revert any scope breach |
| M4-R6 | Production data mutation | Read-only reconciliation first; migration review | Critical | Migration rollback; feature toggle/removal |
| M4-R7 | Unapproved AI action/cost | No provider/API key/config | Critical if bypassed | Disable/remove profile; deterministic path |
| M4-R8 | Unreviewed release | Explicit release owner/date/smoke/rollback | Critical | Revert release candidate; disable deployment |

## 12. Rollback and compatibility notes per change group

| Change group | Compatibility impact | Rollback plan |
|---|---|---|
| Input profile | Additive; Macro UI/engine remain compatible if ignored | Remove profile/tests; no migration |
| `calculationId` policy | No change to deterministic math; operation identity remains unique | Revert ID policy; engine untouched |
| Evidence registry coverage | Document/record-level only | Mark CANDIDATE or delete; do not assert approved status |
| Safety contract/profile | Policy text/behavior; no numeric change | Revert text/profile; verify warnings/tests |
| AI profile closure | No runtime dependency/provider | Delete or mark owner-superseded; no data migration |
| Cross-tool opt-in R6 | New consent/data flow | Disable entrypoint; clear context; rollback migration if R6 authorized |
| Persistence R6 | Data model/RLS risk; user-impacting | Back up; dry-run; rollback migration/policy; disable writes |
| Compatibility registration | Documentation-only | Remove document section; implementation unchanged |
| Accessibility revision | UI only; no domain semantics | Revert CSS/test/markup to prior R3.1 PASS baseline |
| Release/deploy | External effect | Rollback release; disable feature; restore previous build |
| Deferred fingerprint | Not implemented or persisted | No rollback needed until separately approved |

## 13. Revision 2.2 change history

Revision 2.2 was created solely to address the blockers in `MACRO_V4_REVISION_2_1_FINAL_COMPLIANCE_REVIEW.md`. It does not create a new gate, re-audit Macro, or approve implementation.

Changes:

1. **Accepted AI contract alignment (blocker corrected):** removed the unaccepted `capabilities: { ... }` object and every pseudo-YAML/illustrative field that was not a property of `AICapabilityProfile`.
2. **Exact accepted shape:** the design example now uses only accepted fields from `AICapabilityProfile` in `contracts.v4.ts`: `toolId`, `profileVersion`, `aiStatus`, `permittedCapabilities`, `prohibitedCapabilities`, `allowedInputClasses`, `excludedInputClasses`, `approvedContextSources`, `outputSchema`, `allowedTools`, `actionPermissions`, `riskClass`, `evidenceMinimum`, `humanReviewRules`, `modelPolicy null`, `budget`, `fallbackPolicy`, `evaluationProfile`, `stopConditions`, `auditPolicy`.
3. **AI vocabulary resolved and conflict recorded:** global state remains `NOT_CONFIGURED`; runtime denied capability list remains closed; documented per-capability policy classification is `DISABLED`. The AC/SPEC wording difference is no longer silently normalized: §3.10 records it explicitly as an owner-review item without modifying SPEC or AC.
4. **No-provider values preserved:** no provider/model/prompt/tool/connector; empty allowed input classes; empty `allowedTools`; empty `actionPermissions`; zero `maxCallsPerSession`, `maxTokensPerCall`, `maxCostPerSession`, `maxRetries`, `timeoutMs`, and `maxConcurrency`; deterministic unavailable/invalid/timeout/budget behavior; no AI logging/retention.
5. **Fingerprint blocker corrected:** `inputFingerprint` is removed from implementation scope. No fingerprint generation, persistence, logging, keyed/unkeyed hashing, HMAC, salt, secret, or cross-session ID is requested. `calculationId` remains operation identity; fingerprint is explicitly deferred to a separately approved privacy/data-governance R1/R6 design.
6. **All previously-retained boundaries preserved:** accepted R1/R2 foundations, Macro V6 protection through R6, timestamp/schema semantics, conditional output evidence/warnings, operation-level operation risks, no-provider stance, R4 scoped semantics, deferred R5/R6/R7/R8 boundaries, matrices, rollback compatibility notes, and accessibility NOT RUN statuses are not weakened.
7. **Matrix integrity:** Requirement-to-Phase Matrix, Dependency Matrix, Risk Matrix, and Rollback/Compatibility table are preserved and updated rather than deleted. IDs remain stable; fingerprint rows are corrected to the new deferred decision.
8. **No application or contract change:** no application, test, engine, adapter, V4 contract, accepted SPEC/AC wording, Route, Registry, Catalog, Supabase, provider, dependency, or Git state is modified.

## 14. Revision 2.2 evidence and references

Current files/artifacts:

- `lib/tools/engines/macro.v6.ts` — deterministic equation/evidence boundary.
- `lib/tools/engines/macro.v6.test.ts` — 81 baseline tests.
- `lib/engines/core/v4/adapter.macro.v4.ts` — V4 adapter/current limitations.
- `lib/engines/core/v4/contracts.v4.ts` — accepted AI Capability Contract shape.
- `components/tools/macro-pilot.tsx` — V4 Shell/domain UI integration.
- `components/tools/macro-pilot.module.css` — V4 class styling.
- `components/tools/macro-pilot.v4.integration.test.tsx` — current integration verification.
- `components/tools/macro-pilot.remediation.test.tsx` — R3.1 UI/accessibility regression.
- `docs/MrXSteroid_Genius_Intelligence_V4.0/PHASE_MACRO_V4_FULL_CAPABILITY_COMPLIANCE_AUDIT_REPORT.md` — baseline audit.
- `docs/MrXSteroid_Genius_Intelligence_V4.0/PHASE_R4_MACRO_PILOT_EVALUATION_REPORT.md` — R4 result.
- `docs/MrXSteroid_Genius_Intelligence_V4.0/PHASE_R3_1_MACRO_PILOT_UI_REMEDIATION_REPORT.md` — R3.1 notes.
- `docs/MrXSteroid_Genius_Intelligence_V4.0/MACRO_V4_REVISION_2_1_FINAL_COMPLIANCE_REVIEW.md` — prior compliance findings.
- `docs/MrXSteroid_Genius_Intelligence_V4.0/ACCEPTANCE_CRITERIA.md` / `SPEC.md` — gate semantics.

## 15. Final decision

**REVISION 2.2 — PROPOSAL ONLY — AWAITING FINAL COMPLIANCE REVIEW**

Do not implement this plan without explicit, scoped approval. Do not begin R5/R6/R7/R8. Do not modify Macro V6, R1/R2, Template V4, Supabase, providers, routes, registry, catalog, dependencies, or application files.
