# MRX_255_AI_RESULT_CONTRACT.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only. No code changed.

## 1. Purpose

This contract defines how deterministic engine results become typed AI context. It is the binding boundary between calculation and explanation.

## 2. Data flow

1. Tool engine computes a deterministic result.
2. Tool adapter builds a `ToolOutput` containing `toolSlug`, `locale`, `provenance`, and `keyFindings`.
3. `toAIInsightContext(output)` in `components/smarttools/AIInsightContext.tsx` builds `AIInsightContextValue`:
   - `toolSlug = output.toolSlug`
   - `locale = output.locale`
   - `provenanceLine` from `output.provenance`
   - `findings = output.keyFindings.slice(0, 16)` mapped to `{code,labelAr,labelEn,value,severity}`
4. `AIInsightPanel` sends only `toolSlug`, `locale`, optional question, and optional `{provenanceLine, findings}` to `/api/smarttools/ai/explain`.
5. `AiExplainRequestSchema` validates the request.
6. `explain.ts` embeds only supplied values in the prompt and enforces the no-invention rule.
7. Provider failure degrades to `deterministicExplanation`.
8. AI never writes back to the engine or changes a displayed number.

## 3. Provenance fields

`source`, `recordedAt`, `timezone`, `unit`, `measurementMethod`, `dataQuality`.

## 4. Finding fields

`code` (1–48 chars), `labelAr` (≤96), `labelEn` (≤96), `value` (≤140), `severity` (≤24).

## 5. Hard limits

- Maximum 16 findings.
- Question maximum 600 characters.
- Findings value maximum 140 characters.
- Only published tools are explainable.
- No persistence of request data in the explain endpoint.
- Consent required before sending results or question text.
- No external provider without owner authorization.

## 6. Non-compliance in current code

- 230 tools publish no findings, so AI cannot explain their actual results.
- Tool-010 contains local AI strings that recommend medical action. These violate the contract and are release-blocking.
- 53 record-only tools have no calculation result to explain.

## 7. Required acceptance metric

For every AI-capable tool: zero numeric divergence between engine output and AI explanation, no diagnosis or treatment language, deterministic fallback available, and consent flow verified.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
