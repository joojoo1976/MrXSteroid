# MRX_255_TOOL_SPECIFIC_AI_CAPABILITY_MATRIX.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only. R5 acceptance pending; Batch 2 blocked.

## 1. Verdict

AI is implemented as an explanation layer, not as a calculation authority. 34 tools publish typed findings; 230 are result-blind. Every tool already has 10 customized AI development proposals in the category dossiers (2,680 total), but those are designs, not implemented capabilities.

## 2. AI capability states

`ENABLED`, `DISABLED`, `NOT_CONFIGURED`, `DEGRADED`, `SUSPENDED`, `NOT_APPLICABLE`.

A capability must not be labeled AI if it is only static text, a lookup, a heuristic, or a conventional calculation. Vision, Voice, ML, and Prediction claims require real implementation and testing.

## 3. AI authority boundary

The deterministic engine owns numerical truth. AI may:

- interpret results;
- explain equations;
- summarize evidence;
- compare calculated results;
- propose scenarios within approved bounds;
- suggest contradictions for review;
- request missing information;
- explain warnings;
- suggest next steps.

AI may not:

- change equations or constants;
- invent user inputs;
- bypass validation;
- change an approved calculation result;
- invent references or confidence scores;
- diagnose disease or prescribe treatment;
- bypass user consent or safety policy.

## 4. Implemented AI contract

| Component | Evidence | Key limit |
|---|---|---|
| `server/ai/contracts.ts` | `AiFindingSchema`, `AiExplainRequestSchema` | findings max 16; question max 600 chars |
| `server/ai/explain.ts` | Published tools only; prompt embeds only engine-derived values | No inventing numbers, diagnoses, citations, doses |
| `server/ai/fallback.ts` | Deterministic explanation | Always available when provider fails |
| `components/smarttools/AIInsightContext.tsx` | `toAIInsightContext(output)` | Slices findings to 16; provenance line built from `ToolOutput.provenance` |
| `components/smarttools/AIInsightPanel.tsx` | Consent checkboxes | Results and questions require explicit consent |

## 5. Current tool-level AI coverage

| Metric | Count |
|---|---:|
| Implemented tools | 264 |
| Tools publishing typed findings | 34 |
| AI-result-blind tools | 230 |
| Tools with direct local AI text | 2 (tool-010 and related) |
| Tools with static local AI text | 2 (tool-010 and related) |

## 6. Per-tool proposal coverage

- 268 catalog entries × 10 proposals = 2,680 proposed developments.
- At least 5 proposals per tool must have clear specialized value for that tool.
- Each proposal documents name, problem, user benefit, inputs, outputs, technique, required data, activation conditions, data source, privacy/risks, consent, external model/provider need, expected cost, capability limits, fallback, tests, acceptance metric, and stop conditions.
- Proposals are designs only. They are not implemented capabilities.

## 7. Required AI result contract

Every AI-capable tool must publish a typed `ToolOutput` with:

- `toolSlug`;
- `locale`;
- `provenance` (source, recordedAt, timezone, unit, measurementMethod, dataQuality);
- `keyFindings` (code, labelAr, labelEn, value, severity), max 16.

AI must receive only those findings plus the provenance line. It must never receive raw health data beyond the approved context, and it must never write back to the engine.

## 8. Tool-010 warning

Tool-010 contains local AI strings that violate the contract: `AI strongly recommends aromatase inhibitor support...` at component line 105, `AI recommends supportive therapy` at line 141, and `aromatase inhibitor consideration required` at line 142. These are release-blocking and must be removed before any AI capability is claimed for that tool.

## 9. Owner decision required

Approve the AI result contract, consent flow, and which of the 2,680 proposals may become implementation work. No external provider, subscription, or recurring cost may be added without separate owner authorization.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
