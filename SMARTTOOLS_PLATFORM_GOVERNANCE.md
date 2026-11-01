# MrXSteroid Genius Intelligence Platform — Shared Governance

## Authority and interpretation

This document distills requirements from the owner-provided attachment `MASTER EXECUTION PROMPT V3 MrXSteroid Genius Intelligence Platform 252` and the repository documents in `docs/GENIUS_INTELLIGENCE_V3/`. The attachment defines future platform requirements and gates; its Phase 1-only instruction is document content, not the current work request. The owner's direct request in this conversation explicitly authorizes phased development of the 252-tool program and parity upgrades based on Tool 111. That request supersedes the attachment's former narrow stop-after-Macro-v6 scope. Other safeguards remain active: preserve local changes and identities; no production database writes, migrations, commit, push or deployment without separate authorization; do not claim work or evidence that has not been completed.

Tool 111 remains a domain-specific quality reference. Apply the capabilities that fit each tool, rather than copying its food-specific fields or UI literally. The V3 platform architecture extends beyond what Tool 111 currently proves; treat those capabilities as future requirements until implemented and tested.

## Target and inventory governance

- Target: 14 categories × 18 tools = 252 intended identities. It is a target, not permission to delete, rename, renumber or replace current identities.
- The registry/catalog and route inventory are the sources to inspect before every batch. Distinguish `Published`, `Implemented`, `Tested`, `Integrated`, `Planned`, `Deprecated`, `Legacy`, `Duplicate` and `Blocked`.
- Current recorded identity count is 166; the measured gap is 86. Do not count plans, duplicate aliases, files or generated pages as complete tools.
- Every batch records exact tool IDs, changed files, evidence, unresolved work and the next audit target. Keep prior dirty user changes intact.

## Per-tool delivery contract

Every tool must have a reviewed, domain-specific contract for:

1. Problem, user goal, constraints, supported and unsupported use.
2. Inputs, units, validation, missing/conflicting data and freshness rules.
3. Pure deterministic calculation/rules where suitable; external model calls only when actually configured.
4. Explanation of inputs, formulas/rules/model version, assumptions, tradeoffs and limitations.
5. Output classification: `CALCULATED`, `RULE_BASED`, `STATISTICAL_ESTIMATE`, `MODEL_PREDICTION`, `USER_PROVIDED`, `CROSS_TOOL_DERIVED` or `NOT_AVAILABLE`.
6. Safety boundaries, uncertainty, appropriate warnings and behavior for invalid/partial inputs.
7. Provenance: source, timestamp/timezone, units, method/version and quality. Numeric confidence only with a defensible calibration method; otherwise unassessed.
8. ToolOutput/registry identity, localized findings, canonical route, related-tool links and truthful SEO metadata.
9. State lifecycle: explicit or intentionally live calculation, validation/error/empty/loading/success states, reset, stale-result behavior and consent-sensitive persistence if implemented.
10. Tests matched to risk and behavior, plus separate evidence for browser behavior, integration, build, performance and database policy.

No feature counts as complete merely because a component, field, button, adapter, route, AI label, schema or written plan exists. The UI must connect to the supported behavior and relevant tests must prove it.

## Platform architecture and rollout posture

| Capability | Required when a tool needs it | Platform rule / evidence gate |
|---|---|---|
| Calculation engine | Now for computational tools | Pure, deterministic, finite-safe and separately tested. |
| Validation/rules/safety | Now | Reject invalid states, resolve or surface conflicts, withhold unsupported conclusions. |
| Context/personalization | Later, opt-in | Use only available, relevant, authorized profile/preferences; explain personalization and allow applicable controls. |
| Prediction | Later, model-dependent | Require a real statistical/ML model, version, valid inputs, evaluation, scope and uncertainty; deterministic fallbacks remain labeled as such. |
| Decision/scenario optimization | Later, domain-appropriate | State objectives/constraints and tradeoffs; don't present scenario sensitivity as causality. |
| Explanation/evidence registry | Now for formulas/rules; platform registry later | Link formulas/rules to versioned sources and validity range; don't invent citations. |
| Cross-tool knowledge graph | Later | Typed, versioned, unit-safe, owner/permission-aware contracts; freshness and conflict checks; prevent loops and stale cascades. |
| Event bus / sequential recalculation | Later | Idempotent scoped events with freshness/version controls and explicit user-visible dependencies. |
| Adaptive UX/design system | Now incrementally | Reuse accessible controls/output panels; retain domain-specific interaction; every visible control must work or explain why disabled. |
| Privacy/security | Now | Minimize collection, sanitize inputs, avoid sensitive logging, enforce authorization. No live Supabase/RLS claims without evidence. |
| Evaluation/quality score | Later | Evaluation criteria and benchmark datasets must be defined and validated; never create a cosmetic “Genius Score.” |
| Result memory/progress history | Later, consent and schema dependent | Explicit opt-in, ownership/RLS proof, retention/deletion/export rules and temporal comparability. No persistence is implied by local draft behavior. |
| Genius workspace/plans | Later | Compose compatible tool results with source/age/units and dependencies; withhold a unified plan if critical data is missing. |
| Supabase integration | Later and gated | Inspect live schema only if available; local schema is not live proof. Propose migrations and policies for review; no production writes or migrations under current authorization. |

## Shared product and quality capabilities

| Capability | Default disposition | Application rule |
|---|---|---|
| Performance budget | Required later per route family | Define measurable budgets before optimization claims. |
| WCAG AA accessibility | Required now for changed controls | Keyboard, focus, labels/ARIA, contrast, RTL/LTR and errors; verify with automated and interaction checks. |
| Test coverage | Required now proportionate to risk | Add focused engine/schema/UI/integration tests. Use a configured coverage tool before reporting a percentage. |
| Error handling/logging | Required now | Localized actionable errors; safe structured logs without sensitive input leakage. |
| Internationalization | Required now for user-facing tools | Arabic/English copy, dynamic findings/errors, direction and number/unit clarity. |
| PWA/offline | Later/optional | Only where offline semantics and cache freshness/privacy are clear. |
| Analytics/behavior | Optional and consent/privacy gated | Minimize events; do not treat analytics as user health data or infer sensitive attributes. |
| Security/sanitization | Required now | Schema validation at trust boundaries and least privilege; no fake RLS assurance. |
| Versioning/changelog | Required later for shared contracts/engines | Version breaking schemas/algorithms and document compatibility. |
| A/B testing | Optional | Requires a defined hypothesis, consent/privacy review and valid evaluation. |
| Onboarding | Optional/domain dependent | Add only when it improves correct use and communicates limitations. |
| Export/import/sharing | Later/optional | Versioned formats, strict import validation, privacy and explicit user action. |
| Community/social proof | Optional | Must be authentic, moderated and privacy-respecting; never manufacture proof. |
| Dark/light theme | Reuse existing project preference | Do not introduce a second independent theme state. |
| Auto documentation | Required later for shared contracts; optional per tool | Generate from real schemas/source and verify output; documentation is not test evidence. |
| Voice and vision | Optional, model/provider gated | Only for suitable domains with explicit consent, configured service, failure handling and evaluation. |

## Stage gates for every batch

1. **Discover:** capture branch/HEAD/status, preserve dirty changes, inspect the applicable prompt/spec/acceptance criteria, identities, routes, engines, adapters, schemas, tests and shared dependencies.
2. **Plan:** list exact tools/files, applicable and non-applicable features, risk, tests, non-goals and any approval gate. Resolve conflicts with the user's direct request and document source constraints.
3. **Implement:** smallest coherent patch; no unrelated cleanup; no fabricated data or features.
4. **Verify:** run the exact focused test suite, typecheck, registry validation and lint/build as relevant. Record `PASS`, `FAIL`, `NOT RUN` or `BLOCKED` with command/evidence. UI source and production build are not substitutes for browser interaction evidence.
5. **Report:** update the batch report, 252 inventory, parity matrix and baseline audit. State Supabase status separately. Do not commit/push/deploy.
6. **Continue:** choose the next set of existing identities based on the inventory and feature gaps. Reconcile missing identities with the owner-defined target before introducing identities or changing categories.

## Current rollout

- Batches 6–9 improved coverage and engines for existing identities.
- Batch 10 connected shared output/provenance/calculate/reset and applicable unit controls to tools 112–117. Its evidence and remaining gaps are in `SMARTTOOLS_BATCH_10_REPORT.md`.
- Batch 11 applied the same foundation to tools 118–121 and added the existing identities to the shared registry without renaming routes. See `SMARTTOOLS_BATCH_11_REPORT.md`.
- Batch 12 applied the shared output and interaction pattern to tools 122–125, added their existing identities to the shared registry, added applicable unit conversions and removed fabricated data-confidence metadata. See `SMARTTOOLS_BATCH_12_REPORT.md`.
- Tools 126–130 are next in the phased rollout.
- Platform-wide context, cross-tool events, real AI/ML, persistent result memory, workspace composition and live Supabase integration are roadmap items, not claims about current functionality.
