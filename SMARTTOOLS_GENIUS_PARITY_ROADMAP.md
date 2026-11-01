# SmartTools Tool 111 Feature Parity Roadmap

## Benchmark and scope

Use the locally supplied `docs/GENIUS_INTELLIGENCE_V3/GENIUS_TOOL_STANDARD_V3.md` as the source for applicable capabilities, interpreted alongside `PROMPT.md`, `SPEC.md`, `ACCEPTANCE_CRITERIA.md`, and the owner-provided master execution prompt. The standard captures observable Tool 111 behavior; the master prompt adds future platform architecture and governance. Apply features only where a tool's domain and inputs support them. The expanded governance and future capability boundaries are in `SMARTTOOLS_PLATFORM_GOVERNANCE.md`.

## Reusable parity checklist

| ID | Capability | Evidence required for completion |
|---|---|---|
| T111-01 | Canonical tool component and route | Registry identity, canonical route and mounted component agree. |
| T111-02 | Typed form and output state | Inputs, validated data and output envelope have concrete types. |
| T111-03 | Validation | Invalid input blocks calculation and presents understandable localized feedback. |
| T111-04 | Explicit calculate and reset | User can submit a valid calculation and restore the initial state. |
| T111-05 | Unit-system toggle | Provide only for convertible physical inputs/outputs; calculations retain canonical units. |
| T111-06 | Arabic/English and RTL/LTR | Toggle locale and verify layout plus dynamic result copy. |
| T111-07 | Domain-specific input | Inputs map to engine-supported fields; no ignored form fields. |
| T111-08 | Defensive math and conversions | Finite/bounded values, missing-data handling and unit conversions are explicit. |
| T111-09 | Deterministic calculation | Same validated inputs produce the same domain result. |
| T111-10 | Ranked findings | Render `ToolOutput.keyFindings` in severity order. |
| T111-11 | Warnings and limitations | Show engine flags, scope notices and missing-data limits without overstating conclusions. |
| T111-12 | Data provenance | Show source, time, method, quality and confidence only when measured; unassessed is valid. |
| T111-13 | Localized copy | Labels, findings, errors, provenance and limitations are readable in both locales. |
| T111-14 | Registry identity and related links | Use registry identity and resolve previous/next links from the registry. |

## Cross-cutting constraints

- Do not fabricate source citations, calibrated confidence, data coverage, prediction accuracy or outcome claims.
- Classify outputs as calculated, rule-based, statistical estimate, actual model prediction, user-provided, cross-tool derived or not available; disclose any deterministic fallback.
- Keep deterministic heuristics labeled as heuristics; do not imply causal effects from scenarios.
- Treat missing or partial data as unknown when the engine cannot establish a value.
- Preserve the existing no-database-write, no-migration, no-commit, no-push and no-deployment boundaries unless separately authorized.
- Track source inspection, automated tests, browser interaction and production build as separate evidence levels.
- Use the shared project preferences and security boundaries; treat cross-tool context, persistent memory, AI, voice, vision, export/import and community as gated roadmap work until data permissions, real dependencies and tests are established.

## Master execution prompt capability map

The owner's V3 master prompt adds a platform roadmap beyond the capabilities observed directly in Tool 111. Apply its ten intelligence capabilities only when the tool's domain, data and authorized dependencies support them; do not create placeholder controls or claim platform features that are not connected:

| Capability | Current rollout rule |
|---|---|
| Genius Intelligence Core | Use validated deterministic calculation/rules now; input/result interpretation is domain-scoped; prediction requires a real evaluated model. |
| Adaptive user context and personalization | Opt-in and consent-gated; no hidden health profiling or assumed user history. |
| Knowledge graph and cross-tool intelligence | Deferred until typed contracts, units, authorization, freshness and conflict rules are implemented. |
| Scenario optimization | Apply only when objectives and constraints exist; expose assumptions and tradeoffs without causal claims. |
| Evidence and formula registry | Disclose actual methods and references; do not invent sources or validity claims. |
| Adaptive UX and design system | Reuse current shared controls and preferences while retaining domain-specific input and accessible RTL/LTR behavior. |
| Privacy, security and safety | Validate at trust boundaries, minimize sensitive data and preserve no-write/no-migration scope. |
| Evaluation and continuous quality | Add focused regression evidence; no cosmetic quality score or unvalidated “Genius Score.” |
| Result memory and progress intelligence | Deferred pending explicit consent, persistence contract, ownership/RLS proof and retention controls. |
| Genius workspace | Deferred until compatible result contracts, freshness and missing-data behavior can be verified. |

The master prompt also identifies voice and vision as optional provider-dependent capabilities. They remain unimplemented unless the relevant tool can support an authorized provider, privacy controls, failure handling and evaluation.

## Rollout order

1. Tools 112–117: shared output view, confidence truthfulness, explicit submit/reset and convertible units.
2. Tools 118–121: adopt the same output/UI controls and close the audit gaps.
3. Tools 122–125: complete the shared output, provenance, explicit calculate/reset and applicable unit controls; details in `SMARTTOOLS_BATCH_12_REPORT.md`.
4. Tools 126–130, completed in Batch 13; evidence in `SMARTTOOLS_BATCH_13_REPORT.md`.
5. Tools 131 and 133–136 completed in Batch 14; Tool 132 remains provider-gated because its available vision path returns fabricated stub measurements. See `SMARTTOOLS_BATCH_14_REPORT.md`.
6. Batch 15 completed Tool 140 as an analyte-specific lab result converter. Tools 137–139 and 141–142 remain cataloged and unimplemented pending evidence/safety review; do not count absent tools as implemented.
7. Batch 17 completed tools 143–144 with label-bounded comparison and generic SI density arithmetic. Continue with the requested early audit of Tool 149 assumptions and overlap with Tool 131 before implementation; then audit tools 146–148 and 150.
