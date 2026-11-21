# MRX_255_ZERO_LOSS_REQUIREMENTS_HARMONIZATION.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Frozen master SHA-256:** `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540`  
**Source B SHA-256:** `4525F3B089A75BCAD5A6CFF2A4F2B07891C68104BA8C69E9A89407506B714D7B`  
**Mode:** Document analysis and proposal only. No application code, formula, Macro, database, RLS, Registry, route, dependency, Git history, or production change was made.

## 1. Absolute preservation statement

All existing historical documents remain preserved. This file is additive. It does not delete, shorten, paraphrase away, or replace any original content in `PROMPT.md`, `SPEC.md`, `ACCEPTANCE_CRITERIA.md`, the master prompt, R1–R5 reports, Macro history, Template V4 materials, or the add-on prompt.

Byte-level source preservation references:

| Source | SHA-256 | Size |
|---|---|---:|
| `MRX_GI_MASTER_EXECUTION_PROMPT.md` | `37ADE0B200D8BDAEC72CAC46C76B2DB3CF22271D2B18E239F78ED48A64CD5540` | 64,408 bytes |
| `PROMPT.md` | `CAFDF2D508313156E09C0BD1508761D92EECDF4CDF5ED757AE8D2543648E5A55` | 107,825 bytes |
| `SPEC.md` | `5BE4514DEE1876065274ABE3A039A4C426595A1F3D0EAA04EC3ADC52C4F2018E` | 182,470 bytes |
| `ACCEPTANCE_CRITERIA.md` | `715554A0445C0438DB827EDCDD0698143E619DB9820A305D9136B0F908BD0173` | 67,620 bytes |
| Source B owner prompt | `4525F3B089A75BCAD5A6CFF2A4F2B07891C68104BA8C69E9A89407506B714D7B` | 28,575 bytes |

## 2. Zero-loss traceability schema

Every historical requirement must be traceable through:

`Historical Requirement → Source → Current Specification → Implementation Evidence → Gap → Acceptance Test`

A requirement is not complete merely because it appears in a document. It must also have implementation evidence and an acceptance test, or an explicit `NOT_APPLICABLE`, `NOT_AVAILABLE`, blocked, or superseded status with reason.

## 3. Twelve result boxes (preserved)

The five core result categories organize the twelve detailed result slots. The categories do not replace the twelve historical result requirements.

| # | Slot | Historical color / class | Current status in this audit |
|---:|---|---|---|
| 1 | Medical Advice | red `bg-red-950/20 border-red-800` | `PARTIAL`; no medical advice may be unsupported |
| 2 | General Advice | blue `bg-blue-950/20 border-blue-800` | `PARTIAL`; must be data-linked |
| 3 | Current Feeling | pink `bg-pink-950/20 border-pink-800` | `NOT_AVAILABLE` unless user self-report controls exist |
| 4 | Predictions | purple `bg-purple-950/20 border-purple-800` | `NOT_AVAILABLE` unless calibrated |
| 5 | AI Coach | yellow `bg-yellow-950/20 border-yellow-400` | `PARTIAL`; bounded by AI contract |
| 6 | Top-3 Reasoning | green `bg-green-950/20 border-green-500` | `PARTIAL` / tool-specific |
| 7 | Safety & Warnings | orange `bg-orange-950/20 border-orange-500` | `PARTIAL`; shared defects remain |
| 8 | What-If Engine | cyan `bg-cyan-950/20 border-cyan-400` | `PARTIAL`; 236 tools lack scenario surface |
| 9 | Explainable AI | zinc `bg-zinc-900 border-zinc-700` | `PARTIAL`; 4-step explanation where applicable |
| 10 | Uncertainty | zinc `bg-zinc-900 border-zinc-600` | `NOT_AVAILABLE` unless quantified method exists |
| 11 | Alternative Paths | teal `bg-teal-950/20 border-teal-400` | `PARTIAL` / tool-specific |
| 12 | Next Step & Cross-Tool | yellow `bg-yellow-950/20 border-yellow-500` | `PARTIAL`; freshness 7d example, not universal |

When a box is unsupported or irrelevant, it must show `NOT_APPLICABLE` or an insufficient-data state with a reason. No information may be invented.

## 4. Five dynamic user-reported feeling controls

Preserved controls:

1. Energy.
2. Hunger.
3. Fatigue.
4. Sleep.
5. Mood.

These are user-declared context on 0–100 scales where appropriate. They are not AI-diagnosed feelings. They may affect qualitative recommendations only when a validated domain rule supports the relationship, and they must not silently alter deterministic numerical outputs.

## 5. Predictions and confidence

- Preserve prediction and scenario capabilities, including the historical four-week horizon where domain-appropriate.
- Never generate fixed confidence percentages such as 94–98% or fixed uncertainty such as 5% without a calibrated and evaluated method.
- When prediction is unsupported, retain the output slot and state `NOT_AVAILABLE` with the reason.

## 6. Tool-specific formula and input rules

- All historical formulas, numerical limits, slider examples, validation rules, and Macro reference equations retain their original traceability.
- Macro-specific formulas and limits are not universal.
- Each tool must use validated domain-specific formulas, input fields, boundaries, units, controls, and scenario ranges.
- No formula or constant is changed in this pass.

## 7. Explainability and reasoning

- Preserve the four-step mathematical explanation requirement where applicable.
- Include actual inputs, constants, calculations, intermediate results, LaTeX, and sources.
- Provide evidence-based explanation summaries, not hidden internal chain-of-thought.

## 8. Uncertainty and alternative paths

- Preserve Uncertainty and Alternative Paths as distinct output capabilities.
- Use quantified uncertainty only where a defensible method exists.
- Provide domain-specific alternative paths with measurable comparisons when supported.
- Do not force Keto, High-Carb, or any Macro-specific option into unrelated tools.

## 9. Global header, language, and measurement

Preserve the complete historical requirements for:

- global language;
- RTL/LTR;
- dark/light/system;
- metric;
- imperial;
- US customary;
- dynamic slider scales;
- unit-aware numerical outputs;
- tooltips, charts, reports, and AI explanations.

Implement them through the existing verified shared state architecture. Do not create parallel headers, preference providers, or competing storage mechanisms.

## 10. Cross-tool intelligence and freshness

Preserve:

- Previous/Next;
- Related Tools;
- Knowledge Graph;
- Event Bus;
- result contracts;
- user-approved history;
- Cross-Tool context.

Freshness must use tool- and data-specific policies. The historical seven-day example is preserved but is not forced onto every data type. Persistence, events, voice actions, and cross-tool writes are reported only when actually implemented and confirmed.

## 11. Historical implementation checklists

All historical implementation details remain available as historical sources, including exact UI examples, CSS classes, icon examples, slider design, tooltip behavior, golden rules, test examples, and Tool 111 references.

Each requirement must be classified as one of:

- globally applicable;
- tool-specific;
- historical implementation example;
- conditional on a verified capability;
- superseded by a newer approved decision;
- blocked pending owner decision.

Superseded requirements are not erased. The exact reason and current replacement must be documented. Legacy constraints such as fixed div counts, zero template literals, hard-coded localStorage reads, or a specific localhost route must not be applied globally without proving they match the current architecture and target file.

## 12. Safety and evidence

- No unsupported medical, hormonal, medication, steroid-cycle, or safety reassurance.
- No invented prediction, confidence, uncertainty, AI, Vision, Voice, or ML claim.
- All numerical values remain owned by deterministic engines.
- AI remains bounded, evidence-aware, permission-aware, and unable to authorize protected actions.

## 13. Acceptance and zero-loss verification

A complete source-to-current traceability report is required. Verification must include:

- byte-level archives of originals;
- semantic coverage checks in addition to keyword anchors;
- conflict, omission, duplicate, applicability, and supersession reporting;
- no weakening of validation scripts to force PASS;
- stop and report any requirement that cannot be reconciled safely.

This document provides the schema and current status. Full semantic classification of every historical requirement remains a follow-up task and is not claimed complete here.

## 14. Current mapping summary

| Addendum requirement | Current specification | Implementation evidence | Gap | Acceptance test |
|---|---|---|---|---|
| 12 result boxes | `MRX_255_RESULT_INTELLIGENCE_AUDIT.md` | R5 pilots only | 236 tools lack scenarios; 84 lack narrative | Per-tool result tests |
| 5 self-report controls | `MRX_255_PERSONALIZATION_AND_HISTORY_AUDIT.md` | Not implemented platform-wide | No universal self-report model | Input/result tests |
| Prediction/confidence | `MRX_255_RESULT_INTELLIGENCE_AUDIT.md` | `NOT_AVAILABLE` where unsupported | Calibrated methods absent | Golden + calibration tests |
| Formula/input rules | `MRX_255_FORMULA_AND_EVIDENCE_REGISTRY.md` | 11 PASS, 5 FAIL, 248 NOT RUN | Sources missing | Formula verification protocol |
| Explainability | `MRX_255_AI_RESULT_CONTRACT.md` | AI contract implemented | 230 tools lack findings | Zero numeric divergence tests |
| Uncertainty/alternative paths | `MRX_255_RESULT_INTELLIGENCE_AUDIT.md` | Tool-specific | Quantified methods absent | Scenario tests |
| Header/language/measurement | `MRX_255_HEADER_LANGUAGE_MEASUREMENT_AUDIT.md` | R5 pilots | 138 tools lack measurement integration | Round-trip tests |
| Cross-tool intelligence/freshness | `MRX_255_PERSONALIZATION_AND_HISTORY_AUDIT.md` | Route links only | No event bus/persistence contract | Cross-tool tests |
| Safety/evidence | `MRX_255_SAFETY_AND_PRIVACY_MATRIX.md` | Tool-010 blocker; shared defects | Domain safety contracts absent | Safety tests |
| Zero-loss verification | This file | Document analysis only | Full semantic classification pending | Owner review |

## 15. Execution authorization

This addendum authorizes document analysis and proposal only. It does not authorize modification of application code, formulas, Macro, database, RLS, Registry, routes, dependencies, Git history, or production. The owner must approve the reconciled document set and name the first implementation task before execution.

## 16. Final rule

ZERO LOSS OF OWNER REQUIREMENTS. ZERO SILENT CONFLICT RESOLUTION. ZERO UNSUPPORTED CAPABILITY CLAIMS. COMPLETE HISTORICAL TRACEABILITY.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
