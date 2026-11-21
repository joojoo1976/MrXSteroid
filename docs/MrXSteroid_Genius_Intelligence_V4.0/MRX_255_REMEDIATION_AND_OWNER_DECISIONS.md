# MRX_255_REMEDIATION_AND_OWNER_DECISIONS.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only. No implementation performed.

## 1. Purpose

This file collects the remediation plans and the decisions that require explicit owner approval. It is the companion to `MRX_255_OWNER_DECISION_PACKAGE.md`.

## 2. Remediation themes

1. Tool-010 safety containment.
2. Formula defects 020, 030, 100, 106.
3. 53 record-only tools: relabel or rebuild.
4. Shared chrome: SafetyNotice, breadcrumb, metadata, `<main>`, ARIA.
5. AI result contract: typed findings for 230 blind tools.
6. Measurement-aware input primitive.
7. Result intelligence panels and anti-generic enforcement.
8. Planned tools 132/137/138/139.

## 3. Owner decisions

| ID | Decision | Blocks |
|---|---|---|
| D1 | Accept or reject R5 | All code changes |
| D2 | Tool-count scope rule: 255 vs 268 vs numbered slots | Any “surplus” action |
| D3 | Tool-010 containment authorization | Safety remediation |
| D4 | 53 record-only classifications | Record-only batches |
| D5 | Formula remediation for 010/020/030/100/106 | Formula batches |
| D6 | AI result contract and provider policy | AI work |
| D7 | Shared chrome fixes | All tool batches |
| D8 | Revised batch priority order | Execution |
| D9 | Planned tools 132/137/138/139 | Planned-tool work |
| D10 | Full-suite failure ownership | Release |
| D11 | Production publication confirmation for tool-010 | Safety classification |

## 4. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Tool-010 publicly accessible with unsafe medical advice | Medium/High | High | Treat as release-blocking; contain before any other work |
| Record-only tools mistaken for calculators | High | Medium | Relabel or suspend; no fake formulas |
| Formula defects shipped as authoritative | Medium | High | Source-gated remediation |
| AI invents numbers or advice | Medium | High | Typed findings only; no-invention prompt; deterministic fallback |
| Measurement switch changes canonical values | Medium | High | Round-trip tests |
| Shared chrome fixes break consumers | Medium | Medium | Consumer regression |
| Full suite remains red | Certain | Medium | Separate release gate |
| R5 accepted prematurely | Low | High | Owner signature required |

## 5. Stop conditions

Stop and report if:

- a source cannot be verified;
- a formula would materially change without owner approval;
- a shared change breaks a consumer;
- the measurement switch changes the canonical value;
- the AI explanation diverges from the engine;
- the accessibility gate fails;
- the batch would exceed 3 tools.

## 6. Approval block

No implementation is authorized by this document. The owner must sign or reject each decision above.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
