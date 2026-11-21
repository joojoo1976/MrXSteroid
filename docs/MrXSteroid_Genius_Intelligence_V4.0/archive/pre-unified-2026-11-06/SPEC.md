# SPEC.md — MrXSteroid Genius Intelligence Platform V4.0

**Document set:** MRX-GI-V4.0  
**Status:** Proposed authoritative architecture specification, subject to owner approval  
**Project:** `E:\MrXSteroid-main`  
**Strategic target:** Preserve and evolve the existing SmartTools estate; the historic planning target was 14 categories × 18 tools = 252, while later reports claim 264 published tools and 268 catalog entries. These numbers must be reconciled from the current repository.  
**Core principle:** Deterministic computation is authoritative; AI is an optional, bounded, evidence-aware assistant—not a substitute for validated engines, safety policy, or human authority.

---

## 0. Versioning, scope, and interpretation

### 0.1 What V4.0 means

V4.0 is a revision of the **platform specification and execution contracts**. It does not automatically require a Macro v7 engine, a new database schema, a new route convention, a new AI provider, or a rewrite of existing tools.

Existing engine versions retain their own identities. For example, the reported Macro engine remains `macro.v6` unless a separately approved engineering change explicitly versions it. Do not rename v6 files merely because this specification is V4.0.

### 0.2 Evidence before assumptions

The repository, active configuration, deployed application, and database may differ. Every claim must identify its evidence source and date. Distinguish:

- **Code present** from **feature operational**.
- **Catalog published** from **functionally complete**.
- **Implemented** from **tested**.
- **Tested** from **integrated**.
- **Local schema** from **live schema**.
- **Browser event** from **confirmed persistence**.
- **AI provider configured** from **AI capability evaluated and enabled**.

The previous recovery report's claims (264 published, 268 catalog, 435 engine files, 362 component files, 277 schema files, etc.) are historical audit findings. Verify them again before using them as current baseline metrics.

### 0.3 Non-negotiable constraints

1. Do not delete, rename, re-number, or change canonical routes of existing tools without explicit owner approval.
2. Do not modify user changes or unrelated modules.
3. No production data writes, schema migrations, RLS/policy changes, deployment, commit, push, merge, or release without separate, exact authorization.
4. Do not invent AI, ML, Vision, Voice, confidence, evidence, test, build, or performance claims.
5. Do not treat successful compilation or build as proof of correct behavior.
6. Do not introduce a new dependency, provider, or recurring cost without approval.
7. Do not require every tool to implement every platform capability.
8. Use fail-closed behavior for unknown risk, invalid permissions, malformed contracts, or failed critical controls.

---

# PART I — PLATFORM ARCHITECTURE

## 1. Architecture goals

The platform must provide a consistent operating model across a diverse set of SmartTools while preserving domain-specific calculations and interfaces.

The architecture must:

- Keep deterministic calculations pure, reproducible, testable, and independent of UI, network, storage, and model services.
- Normalize and validate user and external inputs before calculation.
- Resolve user context only when its source, ownership, consent, relevance, and freshness are known.
- Select only capabilities explicitly allowed for that tool.
- Validate every cross-tool handoff and every model/tool boundary.
- Explain result origin, assumptions, evidence, limitations, and uncertainty.
- Escalate high-risk or irreversible decisions to an authorized human.
- Degrade safely when AI, storage, cross-tool data, or an external service is unavailable.
- Measure quality after release as well as before release.

## 2. Layered Intelligence Architecture

The platform may expose the following layers. An individual tool uses only the layers justified by its domain, risk, input data, and product purpose.

1. **Calculation Engine** — deterministic domain calculations and reproducible transformations.
2. **Validation & Rules Engine** — types, constraints, unit compatibility, domain rules, contradictions, and deterministic warnings.
3. **Context Engine** — consented user goals, preferences, declared constraints, relevant history, and eligible cross-tool results.
4. **Prediction Engine** — a genuine statistical/ML model only when training/evaluation evidence, domain validity, monitoring, and stop criteria exist.
5. **Decision & Scenario Engine** — evaluates alternatives against explicit constraints and declared objectives; exposes trade-offs rather than inventing preferences.
6. **Explanation Engine** — generates understandable, evidence-bounded explanations of deterministic results and validated decisions.
7. **Evidence Engine** — versioned formulas, rules, reference sources, provenance, applicability, and review dates.
8. **Safety & Policy Engine** — independent deterministic policy checks, permissions, risk classification, stop/deny decisions, and escalation requirements.
9. **Personalization Engine** — optional adaptation using authorized, relevant, correctable, and deletable user context.
10. **Evaluation & Monitoring Engine** — offline tests, adversarial evaluation, quality monitoring, drift checks, and audit metadata.

### 2.1 Separation of authority

- The Calculation Engine owns the numeric result.
- The Validation & Rules Engine owns deterministic input/rule validity.
- The Context Resolver proposes eligible context; it cannot bypass consent or ownership.
- The Prediction Engine may emit a prediction only when its model is registered, evaluated, in-domain, and enabled.
- The Decision Engine may compare valid alternatives but cannot authorize external actions.
- The Explanation Engine may describe a result but cannot change it.
- The Evidence Engine records sources; it cannot fabricate or silently upgrade evidence.
- The Safety & Policy Engine can block a proposed action independently of the model.
- The user controls personal input/context consent and can correct it.
- The project owner authorizes engineering, data, and production changes.
- A qualified professional—not the AI—owns clinical diagnosis/treatment decisions.

No language model output is an authorization decision.

## 3. Standard Dynamic Tool Pipeline

Every V4-enabled tool follows this logical pipeline, implemented as pure functions, typed services, and UI states where appropriate:

```text
User Intent
  → Input Collection
  → Input Provenance & Trust Classification
  → Unit / Format Normalization
  → Validation & Safety Precheck
  → Context Resolution
  → Capability & Engine Selection
  → Deterministic Calculation / Rules / Approved Model
  → Cross-Tool Validation (when applicable)
  → Evidence & Uncertainty Assessment
  → Explanation & Scenario Presentation
  → Risk Review / Human Approval (when required)
  → Output Contract Validation
  → Optional Persistence / Export / Next-Step Suggestion
```

### 3.1 Pipeline state machine

Use explicit typed states; exact TypeScript names may follow existing conventions:

- `IDLE`
- `COLLECTING_INPUTS`
- `INPUTS_PARTIAL`
- `NORMALIZING`
- `VALIDATING`
- `BLOCKED_INVALID_INPUT`
- `RESOLVING_CONTEXT`
- `CONTEXT_INSUFFICIENT`
- `ENGINE_READY`
- `CALCULATING`
- `CALCULATION_COMPLETE`
- `AI_ASSISTING` (only when enabled)
- `AWAITING_USER_CONFIRMATION`
- `AWAITING_HUMAN_APPROVAL`
- `OUTPUT_VALIDATION_FAILED`
- `READY_TO_PRESENT`
- `PERSISTING`
- `PERSISTED`
- `PERSISTENCE_PENDING`
- `PERSISTENCE_FAILED`
- `DEGRADED`
- `FAILED`

State transitions must be explicit and testable. A state label is not proof that the operation succeeded. For example, `PERSISTED` may be set only after the storage provider confirms the write; a client event or optimistic UI update is insufficient.

### 3.2 Minimal-first input collection

- Ask first for the minimum fields required for a valid basic result.
- Request optional/advanced fields only when they materially change the calculation, risk, or interpretation.
- Explain why a missing field matters and what can/cannot be calculated without it.
- Do not block a valid basic result because an optional personalization field is missing.
- Do not silently fill required fields with defaults.
- An estimate must be explicitly labeled and carry provenance; it must not masquerade as a user-provided value.
- Where an estimate materially changes a safety-sensitive output, require user confirmation or do not use it.

---

# PART II — CANONICAL CONTRACTS

## 4. Dynamic Input Contract

Every tool must define an input schema and field metadata. Do not impose the same form on every domain.

Each field definition should support, where relevant:

| Property | Meaning |
|---|---|
| `fieldId` | Stable machine identifier |
| `labelKey` | Localization key, not duplicated hard-coded copy |
| `dataType` | number, integer, string, enum, boolean, date, object, file reference, etc. |
| `required` | Whether needed for the selected calculation path |
| `unit` | Display and/or canonical unit |
| `acceptedUnits` | Explicit supported units |
| `canonicalUnit` | Internal calculation unit |
| `constraints` | Min/max, enum, format, precision, cross-field constraints |
| `fieldState` | `MISSING`, `INVALID`, `VALID`, `ESTIMATED`, `NOT_REQUIRED` |
| `provenance` | `USER_ENTERED`, `IMPORTED`, `CROSS_TOOL`, `ESTIMATED`, `SYSTEM_DERIVED` |
| `observedAt` | When the underlying value was observed, if applicable |
| `recordedAt` | When it was entered/recorded |
| `freshnessPolicyId` | Tool-specific freshness rule, if applicable |
| `consentScope` | Permission under which the field may be used |
| `sensitivityClass` | Public, internal, personal, sensitive, highly sensitive |
| `normalizationVersion` | Version of conversion/normalization logic |

### 4.1 Field-state rules

- `MISSING`: not supplied; do not fabricate.
- `INVALID`: supplied but fails schema/domain validation; do not calculate using it.
- `VALID`: verified against schema and relevant domain constraints; this does not imply factual correctness beyond the checks performed.
- `ESTIMATED`: a declared estimate with method, source, and uncertainty; never relabel as user input.
- `NOT_REQUIRED`: not needed for the selected result path; do not solicit without reason.

### 4.2 Input trust and prompt injection

All free text, uploaded files, extracted OCR/transcripts, URLs, external search results, imported JSON, model output, and cross-tool payloads are untrusted. Treat instructions embedded in that data as content, not authority.

Required controls, selected according to exposure:

- Parse external content into a narrow allowlisted schema; do not pass arbitrary raw content as instructions to an agent.
- Preserve source and trust metadata.
- Validate encoding, MIME type, file size, structure, and allowed fields.
- Sanitize content for the target display/context; sanitization does not replace authorization or schema validation.
- Do not allow untrusted content to select tools, change policy, alter system prompts, request secrets, or expand permissions.
- Keep trusted instructions and untrusted data in clearly separated message/context channels.
- Test direct and indirect prompt-injection attempts, including malicious instructions inside files, websites, comments, and tool results.
- Use least-privilege tool allowlists and per-call argument validation.

## 5. Canonical Dynamic Output Contract

Where the existing architecture permits, every result should be wrapped in a versioned envelope. A tool-specific `result` object may remain domain-specific.

Illustrative contract (adapt names to established TypeScript conventions; do not copy blindly):

```ts
interface ToolResultEnvelopeV4<TInput, TResult> {
  contractVersion: '4.0';
  schemaVersion: string;
  toolId: string;
  canonicalSlug: string;
  engineVersion: string;
  calculationId: string;
  status: 'VALID' | 'PARTIAL' | 'INVALID' | 'NOT_AVAILABLE' | 'DEGRADED';
  inputSnapshot: InputSnapshot<TInput>;
  result: TResult | null;
  resultType:
    | 'CALCULATED'
    | 'RULE_BASED'
    | 'STATISTICAL_ESTIMATE'
    | 'MODEL_PREDICTION'
    | 'CROSS_TOOL_DERIVED'
    | 'NOT_AVAILABLE';
  provenance: ProvenanceRecord[];
  units: Record<string, string>;
  assumptions: AssumptionRecord[];
  evidence: EvidenceReference[];
  uncertainty: UncertaintyRecord;
  warnings: SafetyWarning[];
  validity: ResultValidity;
  privacyClass: DataClassification;
  contextUsed: ContextReference[];
  nextActions: ProposedNextAction[];
  auditRef?: string;
  createdAt: string;
}
```

This is a design contract, not an instruction to introduce a breaking schema immediately.

### 5.1 Result type semantics

- `CALCULATED`: deterministic arithmetic/domain computation.
- `RULE_BASED`: output selected by explicit deterministic rules.
- `STATISTICAL_ESTIMATE`: estimate from a specified statistical method and documented data.
- `MODEL_PREDICTION`: prediction from a real registered/evaluated model; model/version/domain must be identified.
- `CROSS_TOOL_DERIVED`: result whose computation depends on one or more validated results from other tools; list dependencies and their validity.
- `NOT_AVAILABLE`: result cannot be responsibly provided due to missing/invalid/stale data, disabled capability, failed validation, or unsupported scope.

`USER_PROVIDED`, `IMPORTED`, `ESTIMATED`, and `SYSTEM_DERIVED` describe **input provenance**, not the computational result type. A model must not relabel user data as a computed result.

### 5.2 Required envelope metadata

Where applicable, include:

- `toolId`, canonical slug, engine version, contract/schema version.
- Calculation/run identifier and deterministic input fingerprint that excludes secrets.
- Explicit input snapshot with units and provenance.
- Output values and units.
- Result type and method.
- Assumptions and limitations.
- Evidence sources, version, applicability, and review date.
- Data freshness and validity window.
- Qualitative uncertainty and completeness.
- Safety warnings, severity, reason, action, and trigger.
- Privacy/data classification.
- Context and cross-tool dependencies actually used.
- AI assistance metadata only when a model was used: provider/model/version, prompt/policy version, latency, token/cost metadata where permitted, and validation outcome.
- Persistence state only from the storage provider's confirmed result.

Do not put secrets, unnecessary raw health data, credentials, or full sensitive prompts in ordinary logs.

## 6. Uncertainty and completeness policy

### 6.1 Do not misuse confidence

Do not emit numeric confidence merely because a model or UI can display a percentage. Numeric confidence requires a documented and validated calibration/evaluation method that applies to the relevant population/task and is monitored for drift.

### 6.2 Qualitative uncertainty record

Use a structured record such as:

- `level`: `LOW`, `MODERATE`, `HIGH`, `INSUFFICIENT_EVIDENCE`, `NOT_ASSESSED`.
- `basis`: missing inputs, measurement variation, stale data, method limits, source conflict, population mismatch, model uncertainty, or other explicit factors.
- `affectedOutputs`: which result fields are affected.
- `whatWouldReduceIt`: additional measurement/source/user confirmation needed.
- `limitations`: concise domain-specific explanation.

Do not imply that a low uncertainty label is a clinically validated accuracy guarantee.

### 6.3 Input Completeness Indicator

A completeness indicator may be displayed as a descriptive state, not a scientific accuracy score:

- `SUFFICIENT_FOR_BASIC_RESULT`
- `SUFFICIENT_WITH_LIMITATIONS`
- `INCOMPLETE`
- `INSUFFICIENT_FOR_SAFE_RESULT`

Explain which required/optional fields drive the status. Avoid a percentage unless it has a meaningful, validated denominator and cannot be mistaken for outcome accuracy.

## 7. Result validity and data freshness

A result's validity is distinct from the age of the record and from scientific uncertainty.

`ResultValidity` may include:

- `status`: `CURRENT`, `STALE`, `INVALIDATED`, `NOT_ASSESSED`.
- `validUntil`: optional timestamp only when a defensible tool-specific policy exists.
- `invalidationTriggers`: input changed, goal changed, engine/formula version changed, source revoked, upstream result changed, consent withdrawn, or another defined event.
- `freshnessPolicyId` and policy version.

Rules:

1. Do not apply one universal freshness window to every tool. The earlier seven-day idea is an optional legacy reference, not a global rule.
2. Record `observedAt`, `recordedAt`, source, and source version when known.
3. Detect conflicts between records; do not silently choose the newest value if source quality or meaning differs.
4. Ask the user to confirm when a meaningful conflict cannot be resolved deterministically.
5. When a result becomes stale, preserve it for history if permitted but do not present it as current input without an explicit stale-data policy.
6. A changed formula/engine version may invalidate comparability even if user inputs have not changed.

## 8. AI Capability Contract — mandatory per tool

Every tool that invokes AI must have a reviewed capability profile. A tool with no AI must explicitly declare `AI_DISABLED` or `AI_NOT_CONFIGURED`; this is a valid state.

Required fields:

| Field | Requirement |
|---|---|
| `toolId` / `profileVersion` | Stable identity and version |
| `aiStatus` | `DISABLED`, `NOT_CONFIGURED`, `ENABLED`, `DEGRADED`, `SUSPENDED` |
| `permittedCapabilities` | Explicit allowlist of capability IDs |
| `prohibitedCapabilities` | Explicit denylist, including domain prohibitions |
| `allowedInputClasses` | Data classes that may be sent to the model |
| `excludedInputClasses` | Data that must never be sent |
| `approvedContextSources` | Sources the model may use |
| `outputSchema` | Strict schema for model output |
| `allowedTools` | Tool/function allowlist; empty if none |
| `actionPermissions` | Read/propose/execute boundaries |
| `riskClass` | Tool/action risk level |
| `evidenceMinimum` | Minimum evidence required for claim classes |
| `humanReviewRules` | Events that pause for review |
| `modelPolicy` | Approved provider/model/version, or none |
| `budget` | Call/token/cost/time/retry/concurrency ceilings |
| `fallbackPolicy` | What happens when AI is unavailable or invalid |
| `evaluationProfile` | Golden/adversarial/quality tests and release threshold |
| `stopConditions` | Conditions that disable or suspend AI |
| `auditPolicy` | What is logged, redacted, retained, and who may inspect it |

A profile is not permission to send data to a provider. Provider configuration, legal basis, user notice/consent, and operational approval remain separate requirements.

### 8.1 AI capability vocabulary

The following capabilities may be enabled selectively:

1. `INPUT_UNDERSTANDING` — parse a user request into a structured draft; never silently commit extracted values.
2. `MISSING_DATA_COACH` — explain missing fields and their relevance without inventing values.
3. `UNIT_FORMAT_ASSIST` — suggest normalized values; deterministic unit code performs the actual conversion.
4. `CONTEXT_RESOLUTION_ASSIST` — identify potentially relevant consented context; deterministic policy validates ownership, freshness, and permission.
5. `SMART_VALIDATION_ASSIST` — explain a deterministic validation failure or identify a possible contradiction; cannot override validators.
6. `SCENARIO_GENERATION_ASSIST` — propose scenarios that deterministic engines validate against constraints.
7. `SENSITIVITY_EXPLANATION` — explain sensitivity outputs already calculated by deterministic/statistical methods; no causal claims.
8. `EVIDENCE_AWARE_EXPLANATION` — explain approved formulas, assumptions, and cited evidence; no fabricated citations.
9. `SAFETY_ESCALATION_ASSIST` — surface deterministic safety flags and explain next steps; the Safety Engine owns block/allow decisions.
10. `NEXT_STEP_RECOMMENDATION` — recommend a relevant tool or user action using declared objective and missing-data graph; no actions are executed automatically.

Each capability must be explicitly allowed per tool. The list is not a mandate to implement ten AI functions in every tool.

### 8.2 AI must not

- Set or alter numeric calculation outputs.
- Change formulas, thresholds, or safety rules.
- Generate a medical diagnosis, drug dose, treatment cycle, or unsupported clinical interpretation.
- Convert a guess into a user-provided fact.
- Select or call unapproved tools.
- Authorize database operations or external side effects.
- Read secrets, unrestricted user records, or other users' data.
- Override a blocked state or human rejection.
- Fabricate evidence, citations, model performance, confidence, or completed actions.

## 9. Safety & Escalation Contract — mandatory per tool

Every tool must define a `SafetyContract`, even if its policy is simple.

Required sections:

1. **Domain and intended use:** what the tool is for and what it is not for.
2. **Risk classes:** low, medium, high, critical, based on impact and action—not only the tool's category.
3. **Sensitive inputs:** health, hormone, medication, identity, financial, or other protected data relevant to the tool.
4. **Prohibited outputs/actions:** diagnoses, dosing, treatment, unauthorized writes, unsupported claims, or other disallowed behavior.
5. **Input guards:** required fields, constraints, provenance, freshness, contradiction checks.
6. **Output guards:** schema validation, evidence requirements, sensitive-data filtering, numeric/result constraints.
7. **Permission model:** allowed actors, exact resource scopes, read/write/propose/execute capability.
8. **Human escalation:** when to pause, who may approve, what evidence is shown, and what happens on rejection/timeout.
9. **Fail-closed rules:** conditions that stop calculation, AI use, persistence, or execution.
10. **Audit requirements:** policy version, action, outcome, approval reference, and redacted context metadata.
11. **User-facing explanation:** plain-language reason for warning, block, or escalation.

### 9.1 Risk tiers

Risk is assigned per operation, not permanently by tool name.

- **LOW:** reversible, informational, no sensitive side effect, and within approved scope.
- **MEDIUM:** personalized interpretation, non-critical data transformation, or a reversible state change with explicit permission.
- **HIGH:** health-sensitive recommendations, privileged account/admin changes, sensitive data export, external communications, or actions with material impact.
- **CRITICAL:** irreversible/destructive production changes, financial transfers, permission escalation, bulk data deletion, or high-consequence medical/drug action.

Unknown or unclassified action risk defaults to requiring review or being denied; it never defaults to low.

### 9.2 Approval integrity

For high-impact or irreversible actions, approval must bind to:

- approving actor and acting identity;
- exact action and tool;
- target resource;
- normalized arguments/parameters or cryptographic digest;
- scope and policy version;
- issue and expiry time;
- unique one-time approval ID and replay protection;
- execution result and audit reference.

The execution layer must independently re-check authorization and policy. A model's recommendation, a chat statement, or a generic approval flag is not enough.

### 9.3 Medical/health-specific boundary

For nutrition, body composition, hormones, bloodwork, pharmacokinetics, medication, and related tools:

- Clearly distinguish general information and deterministic estimates from clinical assessment.
- Do not diagnose, prescribe, recommend unsupervised drug dosing, or infer safety from absence of a warning.
- Identify population/method limitations and missing measurements.
- Escalate concerning or treatment-oriented questions to an appropriate qualified professional.
- Never let AI create or modify dosage, cycle, or treatment instructions.
- Restrict personalization and prediction to evaluated, approved scopes.

## 10. Human decision ownership

| Decision | Authority |
|---|---|
| Schema/type validity | Deterministic validator |
| Unit compatibility/conversion | Deterministic normalization layer |
| Calculation correctness | Versioned calculation engine and tests |
| Cross-tool ownership/permission/freshness | Deterministic policy/validation layer |
| Personal data use | User consent and server-enforced authorization |
| Whether a risky operation may execute | Independent policy plus required human approval |
| Clinical diagnosis/treatment | Qualified professional, not the AI system |
| Product scope, stage transition, schema migration, release | Project owner |
| AI explanation wording | AI may draft; output guardrails and evidence limits apply |

The AI model must never be the sole decision-maker for authorization, clinical action, or production change.

---

# PART III — CROSS-TOOL, DATA, AND EXECUTION INTEGRITY

## 11. Cross-Tool Result Contract and Knowledge Graph

Cross-tool links are typed dependencies, not arbitrary shared state.

A cross-tool result may be consumed only when:

- Tool identity and schema version are recognized.
- Source result is valid and not invalidated/stale under the receiving tool's policy.
- Units are compatible and conversion is explicit.
- Source, timestamp, method, and engine version are present when required.
- User/tenant ownership and consent match.
- The receiving tool explicitly allowlists the source field and purpose.
- Cycles and repeated recalculation are prevented.

Use existing events and adapters when they are established and safe, for example `mrx_tool_result_updated`, `emitToolUpdate`, and `onToolUpdate`, but verify their actual contracts before use.

Browser events indicate notification only; they do not prove persistence. Cross-tool payloads must be schema-validated on receipt. Do not pass entire user records where a minimal projection is sufficient.

The Knowledge Graph may model: Tool, Input, Output, Metric, Unit, Goal, Rule, Formula, Evidence, Scenario, Recommendation, Warning, Dependency, and Result Version. Do not create a new database graph or tables without architecture review and separate owner approval.

## 12. Data, storage, privacy, and Supabase

Before any persistence work, inspect the live/local schema distinction, migrations, tables, relationships, constraints, indexes, triggers, functions, RLS, policies, adapters, and types.

The following names are conceptual candidates, not migration instructions:

- `user_tool_states`
- `user_preferences`
- `tool_usage_analytics`
- `tool_ratings`
- `user_voice_commands`
- `ai_user_profiles`

Reuse existing structures where appropriate. Propose schema changes with migration plan, data mapping, rollback, compatibility, RLS, tests, and operational impact. Stop for separate owner approval before applying any migration or production write.

### 12.1 Data classes

At minimum distinguish:

- `PUBLIC`
- `INTERNAL`
- `PERSONAL`
- `SENSITIVE`
- `HIGHLY_SENSITIVE`

Classify user measurements, health information, hormone/medication data, authentication data, analytics, and model context based on actual content and applicable requirements. Collect and retain only what is needed.

### 12.2 Storage states

Distinguish:

- `LOCAL_ONLY`
- `PENDING_SYNC`
- `SYNCED_CONFIRMED`
- `SYNC_FAILED`
- `NOT_SAVED`

Never show “saved” before server confirmation. Provide retry and conflict states where applicable. Respect correction, deletion, retention, export, and consent withdrawal policies.

### 12.3 Audit and observability

Record security-relevant metadata for tool executions and AI operations:

- actor/user/session reference (pseudonymous where appropriate);
- tool ID, engine/contract/policy version;
- action/capability name and risk tier;
- authorization/approval result and approval reference;
- input/output schema validation outcome;
- data-source references and freshness status;
- model/provider/version and bounded usage/cost metadata when used;
- execution outcome, error category, timing, retry count;
- correlation ID and audit timestamp.

Do not log passwords, access tokens, service-role keys, complete sensitive input snapshots, or unnecessary raw health data. Use redaction, access control, retention limits, and audit-log integrity controls. Logging failure must block high-risk actions when the audit record is mandatory.

## 13. Safe degradation and failure policy

| Failure | Required behavior |
|---|---|
| AI provider unavailable/timeout | Continue deterministic calculation only if safe; mark AI assistance unavailable |
| Model output fails schema | Discard model output; retry only within budget or fall back to non-AI explanation |
| Prompt injection suspected | Treat content as untrusted; block unsafe tool routing; continue only with safe structured extraction if validated |
| Required input missing/invalid | Return structured missing/invalid state; do not calculate with hidden defaults |
| Cross-tool result stale/invalid/unauthorized | Exclude it; report `NOT_AVAILABLE` or request refreshed consented data |
| Supabase unavailable | Preserve local input/result only under approved local policy; mark pending/failed, never synced |
| Persistence conflict | Do not overwrite silently; surface conflict and require deterministic resolution/user choice |
| Policy/permission service unavailable | Fail closed for protected/side-effecting action |
| Required audit logging unavailable | Block high-risk action; low-risk behavior may continue only if policy explicitly permits |
| Cost/time/retry limit exceeded | Stop the AI chain and return bounded degraded result |
| Calculation engine failure | Do not manufacture fallback numbers; return a structured error |

No retry loop may be unbounded. Set per-tool ceilings for retries, timeouts, model calls, concurrency, and cost. Prevent duplicate side effects with idempotency keys where possible.

---

# PART IV — AI CAPABILITIES AND PRODUCT EXPERIENCE

## 14. Ten optional AI capabilities per tool

The following ten capabilities form a reusable capability menu. They are not a mandatory checklist that every tool must implement.

| # | Capability | Safe bounded behavior | Deterministic authority |
|---|---|---|---|
| 1 | Input Understanding | Parse natural-language/file input into a proposed structured draft | Schema validation and user confirmation |
| 2 | Missing-Data Coach | Explain which field is missing and why | Required-field rules |
| 3 | Unit & Format Assistant | Suggest normalized format/unit interpretation | Unit conversion library |
| 4 | Context Resolver | Identify potentially relevant allowed context | Consent, ownership, freshness, allowlist checks |
| 5 | Smart Validation Assistant | Explain detected contradictions or invalid fields | Validation/rules engine |
| 6 | Scenario Generator | Suggest safe What-If scenarios | Scenario bounds and engine validation |
| 7 | Sensitivity Explainer | Explain computed sensitivities and rankings | Sensitivity engine |
| 8 | Evidence-Aware Explanation | Explain formula, evidence, assumptions, and limitations | Evidence registry and output guardrails |
| 9 | Safety & Escalation Assistant | Explain deterministic warning and route to a human/professional | Safety policy engine |
| 10 | Next-Step Recommender | Suggest a relevant tool or data collection step | Tool dependency graph and owner-approved capability map |

Each tool's profile states `ENABLED`, `DISABLED`, `NOT_CONFIGURED`, `DEGRADED`, or `SUSPENDED` per capability. A capability may be absent by design.

## 15. AI enhancement ideas by architecture layer

Ideas below are optional design patterns, not claims that AI is required or suitable for every layer.

| Layer | Candidate improvements | Boundary |
|---|---|---|
| Calculation | Explain anomalies, compare deterministic versions, suggest edge-case tests, describe formula behavior | AI never computes or alters authoritative numbers |
| Validation | Explain errors, identify possible contradictions, propose a correction draft | Deterministic validator accepts/rejects |
| Context | Summarize consented context, detect possible stale/conflicting values, identify missing context | Context policy validates provenance and permission |
| Prediction | Summarize model quality, detect out-of-domain signals, explain drift alerts | Real evaluated model only; automatic suspension on failed thresholds |
| Decision | Explain trade-offs, enumerate alternatives, identify constraint conflicts | No invented user preference or execution authorization |
| Explanation | Beginner/advanced/expert explanation, concise comparison, translation of technical terms | Output must stay within evidence and result contract |
| Evidence | Find candidate sources, detect date/source conflicts, draft traceability metadata | Human/source registry verification before publication |
| Safety | Explain blocks, identify possible prompt injection, draft incident summaries | Independent policy makes block/allow decision |
| Personalization | Suggest display units or explanation depth, detect changed stated goals | User controls, consent and correction; no sensitive inference |
| Evaluation | Draft golden tests, summarize regressions, classify warning misses | Automated tests and human review validate changes |

### 15.1 Ten candidate AI-assisted improvements for each architecture layer

The following catalog preserves the proposed ten-improvement set for each layer. These are candidate assistive behaviors, not permissions to automate the layer. Every candidate remains subject to the tool's AI Capability Contract, data permissions, evidence threshold, output schema, risk policy, evaluation, and human approval rules. In particular, AI suggestions must never replace deterministic calculations, validators, model evaluation, or policy decisions.

| Layer | Ten candidate improvements | Non-delegable authority |
|---|---|---|
| Calculation Engine | 1. Flag unusual input/result patterns for review. 2. Suggest a domain-valid reference range for display. 3. Explain why a computed result differs from a prior run. 4. Suggest consistency checks across related outputs. 5. Detect possible unit/format mistakes in raw input. 6. Draft edge-case or golden-test candidates. 7. Explain the formula and arithmetic in user language. 8. Summarize comparable historical results when version-compatible. 9. Flag likely outliers without silently deleting them. 10. Draft data-quality alerts with affected fields. | The deterministic engine alone computes and returns authoritative numeric outputs. AI cannot change constants, formulas, rounding, or result values. |
| Validation & Rules Engine | 1. Classify a validation error for explanation. 2. Propose a correction for user review. 3. Identify possible cross-field contradictions. 4. Explain unit incompatibility. 5. Identify missing required fields. 6. Flag impossible or out-of-domain values. 7. Suggest a normalized input format. 8. Detect duplicate or conflicting submissions. 9. Explain why an input/result was rejected. 10. Suggest a safe next step or valid alternative input. | Deterministic validators and rules accept, reject, or block. AI cannot waive a failed rule or invent a valid value. |
| Context Engine | 1. Extract the user's explicitly stated goal. 2. Summarize consented context relevant to this task. 3. Flag possibly stale context. 4. Identify potentially related tool results. 5. Distinguish user-provided from estimated/imported information. 6. Suggest which context field is missing. 7. Identify potentially conflicting goals. 8. Explain which preferences were applied. 9. Draft a concise context summary for confirmation. 10. Detect when the available context is insufficient for personalization. | Consent, ownership, freshness, relevance, and access control are enforced deterministically. AI cannot infer sensitive traits or silently persist context. |
| Prediction Engine | 1. Summarize the model's evaluated scope. 2. Flag likely out-of-distribution inputs. 3. Explain a measured drift signal. 4. Compare a model result with a deterministic baseline. 5. Explain calibration evidence. 6. Summarize subgroup evaluation findings. 7. Flag missing/low-quality prediction features. 8. Explain why the model abstained. 9. Draft monitoring/evaluation cases. 10. Summarize a model-version regression report. | Only a registered, evaluated model can produce `MODEL_PREDICTION`. AI explanation cannot manufacture model metrics, calibration, or confidence. The model/policy may abstain or suspend prediction. |
| Decision & Scenario Engine | 1. Generate candidate alternatives. 2. Summarize trade-offs between options. 3. Flag conflicting constraints. 4. Explain why a valid option ranks higher under declared criteria. 5. Identify a missing decision constraint. 6. Reject/describe options that violate hard constraints. 7. Explain scenario sensitivity. 8. Compare baseline and alternatives. 9. Flag high-impact choices for human review. 10. Ask the user to rank unresolved preferences. | Deterministic constraint checks govern feasibility. User preferences must be declared, not invented. AI cannot authorize execution. |
| Explanation Engine | 1. Provide beginner-level explanation. 2. Provide advanced/technical explanation. 3. Compare the current result with a valid prior result. 4. Link result changes to relevant inputs. 5. Explain assumptions and limitations. 6. Describe why an alternative was excluded. 7. Translate technical terms consistently. 8. Produce a concise summary. 9. Detect unsupported claims in a draft explanation. 10. Adapt detail to the user's selected expertise level. | Explanations must match the validated result and evidence. They cannot change numeric values, warning severity, or the underlying decision. |
| Evidence Engine | 1. Discover candidate references. 2. Extract publication/review dates for verification. 3. Suggest links between a formula and a source. 4. Flag conflicting sources. 5. Draft an evidence-quality comparison. 6. Identify possible version changes in a source. 7. Flag potentially outdated references. 8. Explain scope and applicability limits. 9. Detect a citation that does not support a claim. 10. Draft a source-review record. | A source enters the approved registry only after verification/review. AI cannot invent citations, dates, source authority, or approval state. |
| Safety Engine | 1. Flag possible harmful content for policy review. 2. Explain a deterministic safety block. 3. Classify the type of safety concern for review. 4. Identify possible prompt-injection content. 5. Suggest when a professional escalation message is relevant. 6. Identify possible PII in a draft payload. 7. Flag an action exceeding the declared permission scope. 8. Draft a redacted incident summary. 9. Explain a warning's trigger and limitation. 10. Suggest an audit event for a policy-relevant outcome. | Independent safety policy owns allow/deny/escalate. AI cannot lower risk, approve itself, suppress a mandatory warning, or authorize a side effect. |
| Personalization Engine | 1. Suggest preferred display units from explicit choices. 2. Suggest a language preference from explicit settings. 3. Recommend an explanation depth. 4. Recommend a next tool using declared goals. 5. Remind the user when a relevant measurement may need updating. 6. Flag a change in a user-declared goal. 7. Detect conflicting user-entered preferences. 8. Suggest a correction to inaccurate profile data. 9. Explain why a specific authorized context item was used. 10. Suggest when personalization should be disabled due to insufficient/old data. | User controls consent, correction, and deletion. Do not infer protected/sensitive traits, change safety rules, or treat acceptance as proof of correctness. |
| Evaluation Engine | 1. Draft golden test cases. 2. Summarize regression-test changes. 3. Classify observed calculation errors. 4. Help label explanation-quality samples. 5. Summarize potential missed-warning cases. 6. Aggregate user feedback without exposing sensitive records. 7. Suggest bias/subgroup checks. 8. Summarize latency/cost trends. 9. Detect persistence failure patterns. 10. Draft periodic quality reports. | Evaluation metrics and release gates must be reproducible and human-reviewed. AI-generated tests/reports do not count as passing evidence until executed and verified. |

A tool may select zero, one, or several of these candidates. Capability selection must be justified by user value, risk, available data, domain applicability, operating cost, and measurable acceptance criteria.

## 16. Product-level AI patterns and applicability

Conversational search, adaptive learning, task assistance, writing support, price comparison, image/video creation, translation, health/fitness guidance, device/app orchestration, and daily decision support are broad market patterns. They are not blanket requirements for MrXSteroid SmartTools.

Apply only relevant patterns:

- Conversational query and answer for tool discovery or explanation, if sources are controlled.
- Personalized learning/explanation levels for user understanding.
- Task guidance for a bounded multi-step tool workflow.
- Translation and locale adaptation using the existing i18n architecture.
- Health/fitness context only within the explicit non-diagnostic safety contract.
- Image/voice input only for tools with a validated need, secure processing, user consent, cost budget, and separate approval.

General-purpose shopping, payment, booking, media generation, or device-control agents are outside SmartTools scope unless separately authorized as a distinct product feature.

## 17. Progressive disclosure and adaptive UX

Avoid showing every layer on every page. Use progressive disclosure:

1. **Primary view:** required inputs, essential output, clear action, concise warning.
2. **Why this result:** formula/method, key assumptions, input completeness, and relevant evidence.
3. **Explore:** What-If, sensitivity, comparisons, cross-tool context, advanced explanations.
4. **Safety/History details:** validity, freshness, warnings, provenance, audit details, and persistence state.

The user must not need to understand the entire Intelligence Core to complete a basic calculation. Advanced detail should be accessible without overwhelming the default view.

Support explanation depth when useful: `BEGINNER`, `STANDARD`, `EXPERT`. This changes wording/detail only—not the underlying calculation or safety policy.

Maintain existing shared Header/Footer, language, RTL/LTR, measurement, and theme systems after verifying their actual ownership and behavior. Do not introduce competing providers or preference keys.

## 18. Macro v6 — preserve and extend without rewriting

### 18.1 Current baseline

The recovery report states that Macro v6 currently implements:

- Mifflin-St Jeor BMR, TDEE, Bulk +15%, Cut -15%, Maintenance, protein 2.2 g/kg, fat 0.9 g/kg, and residual carbs.
- Canonical kg/cm internals and display-only unit conversion.
- `EMPTY`, `PARTIAL`, `FULL` states.
- What-If and sensitivity analysis.
- Reasoning trace, safety warnings, golden rules, and inbound Body Fat adapter.
- A focused report of 81 passing tests.

These are historical findings until rechecked against the current repository and current test run. The reported implementation path is `lib/tools/engines/macro.v6.ts`, not the earlier aspirational `lib/engines/macro.v6.ts`. Do not rename or move it for documentation consistency.

### 18.2 Existing equation assumptions

Keep the approved v6 reference equations unchanged unless the owner approves a formula change:

- Male BMR: `10W + 6.25H - 5A + 5`
- Female BMR: `10W + 6.25H - 5A - 161`
- `TDEE = BMR × Activity Factor`, with the specified reference range 1.2–1.9.
- Bulk: `TDEE × 1.15`
- Cut: `TDEE × 0.85`
- Maintenance: `TDEE`
- Protein: `WeightKg × 2.2 g`
- Fat: `WeightKg × 0.9 g`
- Carbs: `(TargetCalories - ProteinGrams × 4 - FatGrams × 9) / 4`

These are model assumptions, not universal nutrition guidance. The code's age minimum (reported as 19) and all other constraints must be verified and documented. Do not treat an external study population as automatic approval for a product rule; owner review is required if the current rule affects supported users.

### 18.3 Proposed Macro improvements — separate, optional increments

After Macro v6 is accepted and an implementation scope is approved, consider:

1. **Input Completeness Description:** descriptive states such as sufficient for basic result / sufficient with limitations / incomplete. Not a scientific accuracy score.
2. **Assumption Panel:** show BMR equation, activity factor, goal adjustment, protein/fat assumptions, residual carbohydrate method, and limitations.
3. **Result Validity:** display when the result should be recalculated based on changed weight, goal, activity, input date, or engine version. Do not invent a universal expiry duration.
4. **Contradiction Detection:** detect incompatible goal/target/activity inputs using deterministic rules; ask for correction rather than silently resolving.
5. **Safe Range Guard:** flag unusual deficits/surpluses and domain-specific risk conditions using reviewed rules; never invent a universal medical-safe threshold.
6. **Macro Feasibility Check:** block invalid/negative residual carbohydrate results and explain which constraints conflict; offer only validated alternatives.
7. **Explanation Levels:** beginner/standard/expert explanations that do not alter calculations.
8. **What-If Library:** optional bounded scenarios; describe weight-change scenarios as estimates, not promises.
9. **Cross-Tool Readiness:** indicate whether eligible Body Composition/Training context exists, is current, and is authorized; otherwise use `NOT_AVAILABLE`.
10. **Audit Trace:** record calculation ID, engine/schema version, normalized input provenance, rule IDs, warnings, and result hash without storing unnecessary sensitive values.

These enhancements are not approval to edit Macro v6 now. Prefer a versioned adapter or presentation layer over changing the deterministic engine. Any change to formulas, inputs, output semantics, or user eligibility requires an explicit proposal and regression plan.

## 19. Formula and Evidence Registry

Each governed formula/rule should record:

- Stable ID and version.
- Formula/rule statement and units.
- Reference/source and source type.
- Publication/review date when known.
- Last verification date (never invented).
- Applicable population/domain and excluded cases.
- Assumptions and limitations.
- Related tool IDs and engine versions.
- Validation tests/golden cases.
- Status: `CANDIDATE`, `REVIEWED`, `APPROVED`, `DEPRECATED`, `CONFLICTED`.

AI may discover candidate sources but cannot promote a source/rule to approved status. Formula changes require a human-reviewed change record, affected-tool list, comparison against previous outputs, regression tests, and compatibility decision.

## 20. Prediction Engine requirements

A `MODEL_PREDICTION` result is permitted only when all apply:

- A real model artifact/service and version are identified.
- Training/evaluation data provenance and authorized use are documented.
- Target population and out-of-domain boundaries are specified.
- Validation metrics appropriate to the task are reported.
- Calibration is assessed before numeric confidence is exposed.
- Bias/fairness, leakage, drift, and subgroup limitations are assessed where relevant.
- Monitoring thresholds and suspension/rollback conditions exist.
- The model can abstain and return `NOT_AVAILABLE`.

A placeholder, heuristic, static lookup, LLM explanation, or deterministic fallback is not a prediction model.

## 21. Tool inventory and prioritization

### 21.1 Registry state model

Keep distinct dimensions rather than one overloaded status:

- **Publication:** `PUBLISHED`, `UNPUBLISHED`, `HIDDEN`, `DEPRECATED`.
- **Implementation:** `MISSING`, `FILES_PRESENT`, `PARTIAL`, `IMPLEMENTED`.
- **Verification:** `NOT_TESTED`, `TESTED`, `FAILED`, `NOT_RUN`.
- **Integration:** `STANDALONE`, `SHARED_CONTRACT`, `CROSS_TOOL`, `PERSISTENCE_CONNECTED`.
- **Operational health:** `HEALTHY`, `DEGRADED`, `BLOCKED`, `SUSPENDED`.
- **AI state:** per-capability `ENABLED`, `DISABLED`, `NOT_CONFIGURED`, `DEGRADED`, `SUSPENDED`.

Do not collapse these dimensions into a single `implemented` flag.

### 21.2 Tool priority

Do not prioritize solely by tool number or batch position. Review:

- User value and frequency of need.
- Safety and harm potential.
- Data availability and quality.
- Engine correctness and test readiness.
- Dependencies and integration complexity.
- Cost of implementation and operation.
- Reuse potential and maintenance burden.

Use an owner-approved scoring model only after weights are explicit. A high-risk or data-unready tool may be delayed even if its user value is high. Record the reason for priority decisions.

### 21.3 Category count and identity

The historical target was 14 × 18 = 252, while the recovery report described 15 current categories and 264 published tools. Preserve current IDs/routes/categories during recovery. Any category consolidation, rebalancing, or target change requires a proposal and owner approval. Do not delete or renumber excess/legacy tools to force a mathematical target.

---

# PART V — QUALITY, SECURITY, AND OPERATIONS

## 22. Evaluation and continuous quality

Testing must cover more than code execution.

### 22.1 Offline/CI evaluation

- Golden calculation cases and known-answer tests.
- Property-based and invariant tests.
- Boundary, invalid, missing, non-finite, unit, and rounding tests.
- Schema compatibility and contract version tests.
- Cross-tool ownership, freshness, and invalidation tests.
- Prompt-injection and untrusted-document tests.
- AI output-schema and evidence-grounding tests.
- Safety-warning trigger and missed-warning tests.
- Human-approval bypass and replay tests.
- Degradation tests for AI, database, and dependency outages.
- Accessibility, RTL/LTR, keyboard, responsive, and localization tests.
- Regression tests comparing engine versions.

### 22.2 Online monitoring

When approved and privacy-appropriate, monitor:

- Calculation failures and invalid-input rates.
- Contract validation failures.
- Stale/conflicting context rates.
- Cross-tool rejection and cycle-prevention events.
- Warning triggers, user acknowledgments, and escalation rates.
- AI unsupported-claim/invalid-schema/abstention rates.
- Provider latency, token/cost, timeout, and retry rates.
- Persistence success/failure and sync delay.
- User task completion and feedback.

Do not use sensitive health measurements as analytics payloads. Prefer minimized, aggregated, or pseudonymous metrics. Define retention, access, alert thresholds, and incident response before collection.

### 22.3 Evaluation gates

A release must not be approved from average score alone. Define hard-fail conditions for critical calculation errors, safety misses, privacy leakage, unauthorized actions, and data ownership failures. Track false positives and false negatives for warnings; a high warning count does not prove safety.

## 23. Security and least privilege

- Validate inputs and outputs at every boundary.
- Enforce server-side ownership checks; RLS presence alone does not prove correct access control.
- Grant each model/agent the minimum tools and data required for its exact task.
- Separate read, propose, and execute permissions.
- Do not expose service-role keys or secrets to browsers, prompts, model context, or ordinary logs.
- Restrict network destinations and provider scopes.
- Apply per-user/per-tool rate and cost limits.
- Sanitize output for its display context; never treat model HTML/markup as trusted.
- Prevent arbitrary code execution and shell access from user/model content.
- Use idempotency and replay prevention for side effects.
- Test authentication, authorization, tenant isolation, and cross-user leakage.

## 24. Accessibility and internationalization

- Preserve the established language and measurement preference systems after inspection.
- Support Arabic RTL and English LTR, localized errors/warnings/help, units, dates, numbers, and accessible labels.
- Keep focus order, keyboard operation, visible focus, contrast, screen-reader announcements, and responsive layout.
- Do not rely on color alone.
- Avoid duplicate preference stores or conflicting keys.
- Use the existing localization architecture; do not manually duplicate translated UI strings across tool pages.
- Test the same functionality in both directions/locales.

## 25. Performance, PWA, analytics, and optional product features

The following are classified per tool and phase; none is automatically required everywhere:

| Capability | Default classification | Gate |
|---|---|---|
| Performance budget and bundle measurement | Required for release-critical paths | Measure in documented environment |
| Accessibility | Required for user-facing tools | Defined manual and automated tests |
| Calculation/contract regression tests | Required | Critical tests must pass |
| Error handling and privacy-aware logging | Required | No secret/sensitive leakage |
| Internationalization | Required where tool is published in EN/AR | RTL/LTR test |
| PWA/offline | Optional/conditional | Offline data and conflict policy first |
| Analytics/behavior | Optional/conditional | Consent, minimization, retention, privacy review |
| Security/sanitization | Required | Threat model and boundary tests |
| Versioning/changelog | Required for engines/contracts/formulas | Migration/compatibility notes |
| A/B testing | Optional; not for safety-critical logic | Hypothesis, stop rules, bias review |
| Onboarding | Optional, based on complexity | Evidence of user need |
| Export/import | Conditional | Schema, privacy, file validation |
| Community/social proof | Not suitable by default for sensitive health data | Privacy and cohort-size review |
| Dark/light theme | Use current shared system | Contrast and preference tests |
| Automatic documentation | Optional but useful | Generated facts must be traceable to code/tests |

## 26. Error handling and incident response

Define stable error categories (validation, unsupported input, insufficient evidence, unauthorized, stale data, dependency unavailable, model failure, persistence failure, internal error). Do not leak stack traces or secrets to users.

For security or safety incidents:

1. Stop the affected capability/action.
2. Preserve relevant minimized audit evidence.
3. Notify the designated owner.
4. Assess affected users/data/tools.
5. Rotate/revoke credentials only through authorized operations.
6. Resume only after a documented review and test.

## 27. Versioning and compatibility

Version separately:

- Tool identity and canonical route.
- Engine implementation.
- Input schema.
- Output/result contract.
- Formula/rule registry entries.
- AI capability profile and policy.
- Evidence references.

Do not change historical result meaning silently. Preserve old readers/adapters where required, provide migration mappings, and test old/new payload interoperability. A specification revision does not require every engine to change version.

## 28. UX components and shared contracts

Before creating or replacing components, inspect the existing UI system. Reuse shared components where compatible. Document the behavior/contracts of:

- Dynamic fields and field-state indicators.
- Unit controls and normalization feedback.
- Missing-data coach.
- Result summary and validity status.
- Assumption/evidence panel.
- Uncertainty explanation.
- Safety warning and escalation panel.
- What-If/sensitivity exploration.
- Persistence/sync state.
- AI availability/degraded state.

Each interactive control must work, or be disabled with a reason. Never announce a successful save/export/action before confirmation from the responsible subsystem.

---

# PART VI — DELIVERY STRATEGY

## 29. Phased rollout

### Phase R0 — Recovery and truth baseline

Read-only recovery of Git, dirty work, branches, stashes, worktrees, registry/catalog, all tool identities, reports, Macro v6, Template V2, and database evidence. Deliver baseline and unresolved questions. No application code changes.

### Phase R1 — Contract architecture and implementation plan

Define the smallest common contract set that fits the actual codebase:

- Dynamic Input Contract.
- Dynamic Output Contract.
- AI Capability Contract.
- Safety & Escalation Contract.
- Uncertainty/Completeness and Freshness contracts.
- Audit/observability metadata.
- Failure/degradation states.

Map current engines, adapters, and schemas to these contracts. Identify adapters vs. breaking migrations. Deliver an implementation proposal and obtain approval.

### Phase R2 — Minimal shared runtime foundation

After approval, implement a narrow foundation only: schema types, validators, normalization interfaces, policy interfaces, typed state transitions, and compatibility adapters. Keep model/provider integrations optional. No production database migration unless separately authorized.

### Phase R3 — One pilot tool

Choose one existing tool based on value, risk, readiness, and architectural fit. Preserve its route and engine. Add contract adapter and UI progressive disclosure without rewriting its deterministic core. Macro v6 may be used as a reference engine only after owner acceptance; it is not automatically the pilot.

### Phase R4 — Pilot validation

Run focused and regression tests, adversarial tests, accessibility/RTL/LTR checks, degradation checks, and human review. Produce a comparison with the pre-change behavior. No rollout until accepted.

### Phase R5 — Controlled batch expansion

Define exact tool IDs, files, capabilities, dependencies, acceptance criteria, and rollback per batch. Do not expand to all 264+ tools in one operation. Tools with incomplete engines remain separate from tools that are merely published.

### Phase R6 — Persistence and cross-tool integration

Proceed only after schema reconciliation, ownership/RLS verification, and explicit approval for migrations/writes. Implement freshness, provenance, idempotency, conflict handling, and confirmed persistence states.

### Phase R7 — Optional advanced capabilities

Introduce model prediction, image/voice parsing, external search, or bounded agent actions only for tools with a reviewed profile, evaluation data, consent, budget, monitoring, and required approvals.

### Phase R8 — Release and operations

Complete release checks, migration plan, security review, observability, rollback, owner acceptance, and a separately authorized deployment. Git operations and deployment are independent approval gates.

## 30. Tool readiness standard

A tool is not `COMPLETE & VERIFIED` merely because its page, registry entry, or engine file exists. Depending on the tool, evidence must cover:

- Actual task behavior and domain correctness.
- Input/output schema and validation.
- Units and edge cases.
- Safety contract and warning behavior.
- Evidence and uncertainty appropriate to the domain.
- UI, localization, accessibility, and responsive states.
- Cross-tool and persistence behavior if claimed.
- AI capability profile if AI is claimed.
- Focused and relevant regression tests.
- Failure/degraded states.
- Security and authorization boundaries.
- Documentation and compatibility.

## 31. Approval gates and non-authorization

This SPEC describes the target architecture. It does not itself authorize:

- Macro formula changes or a new Macro engine version.
- Template V2 rollout.
- SmartTools batch expansion.
- New AI/provider integrations or recurring API spend.
- Database/table/policy migrations or production writes.
- Payment, authentication, or dashboard changes.
- Commit, push, merge, release, or deployment.

Every such action needs a specific owner approval documented in the task and phase report.

---

## 32. Reference guidance

These references inform implementation patterns; they do not replace project-specific threat modeling, policy, testing, or legal review:

- OpenAI, **Guardrails and human review**: input/output/tool guardrails and human approval for sensitive side effects — https://developers.openai.com/api/docs/guides/agents/guardrails-approvals
- OpenAI, **Safety in building agents**: guardrails, tool confirmations, trace grading, and handling untrusted content — https://developers.openai.com/api/docs/guides/agent-builder-safety
- OWASP, **AI Agent Security Cheat Sheet**: least privilege, prompt-injection defenses, structured output validation, human-in-the-loop controls, fail-closed behavior, and audit monitoring — https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html
- OWASP, **LLM Prompt Injection Prevention Cheat Sheet**: untrusted remote content, tool validation, and least-privilege practices — https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html

Review references again when implementing because guidance and provider APIs can evolve.
