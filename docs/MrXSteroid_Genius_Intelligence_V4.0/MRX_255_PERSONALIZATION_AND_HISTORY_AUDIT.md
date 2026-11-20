# MRX_255_PERSONALIZATION_AND_HISTORY_AUDIT.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only. R5 acceptance pending; Batch 2 blocked.

## 1. Verdict

Personalization and history integration is not yet implemented as a platform capability. The repository has tool state hooks and AI consent flows, but 230 tools are AI-result-blind, many tools do not separate current input from historical data, and no universal provenance/consent policy is enforced.

## 2. Required behavior

For each tool:

- distinguish current input from historical input;
- distinguish user data, imported data, and estimates;
- record source, date, unit, and quality;
- validate freshness and detect conflicts;
- do not silently replace a required current input with old history;
- explain why prior context was used;
- allow correction or exclusion;
- never assume consent to save;
- never report save success without system confirmation;
- update recommendations when relevant user data changes;
- avoid personal history when it is unsuitable, stale, or unauthorized.

## 3. Current evidence

| Metric | Count | Notes |
|---|---:|---|
| Implemented tools | 264 | |
| Tools with result narrative | 180 | 84 without narrative |
| Tools publishing typed findings | 34 | Only these can feed AI result explanations |
| AI-result-blind tools | 230 | No typed findings |
| Tools with source provenance | 60 (catalog-wide 64) | 204 implemented without provenance |
| Tools with explicit assumptions | 71 (catalog-wide 75) | 193 implemented without assumptions |
| Tools with no test file | 91 | |
| Tools with test file but no numeric assertion | 65 | |

R5 pilots demonstrate the intended pattern: user-entered input, engine-derived result, insights, advice, scenarios, and measurement-aware display. They do not yet demonstrate cross-tool history, consent-gated persistence, or longitudinal comparison.

## 4. Privacy and consent requirements

- Health, hormone, medication, and biometric data are sensitive.
- No sensitive data may be sent to an external provider without appropriate consent and owner authorization.
- No health data may be stored without policy and consent.
- AI consent must be explicit and revocable.
- The explain endpoint must not persist request data.
- Provider failure must degrade to the deterministic explainer.
- Result context sent to AI must be typed and capped at 16 findings.

## 5. What is missing

- No universal data-source and provenance model across all tools.
- No freshness/conflict detection in most tools.
- No explicit consent model for history in most tools.
- No cross-tool context contract beyond generic route links.
- No visual or longitudinal comparison for most tools.
- 53 record-only tools cannot support personalization because they have no domain calculation.

## 6. Required deliverables before rollout

- Data source taxonomy: current, historical, imported, estimated.
- Provenance fields: source, recordedAt, timezone, unit, method, quality.
- Consent state per tool and per AI request.
- Conflict and freshness rules.
- Correction/exclusion UI.
- Save confirmation contract.
- Per-tool personalization scope and forbidden uses.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
