# MRX_255_BATCH_ROLLOUT_PLAN.md

**Generated:** 2026-11-07  
**Repository / HEAD:** `E:\MrXSteroid-main` / `108d3063bdcbca9604ad9b7b48844b85763d51a0`  
**Mode:** Read-only. R5 acceptance pending; Batch 2 blocked. This is a proposed priority order, not an authorization.

## 1. Rule

- Maximum 3 tools per batch.
- No Batch 2 before explicit final owner acceptance of R5.
- Every later batch requires acceptance of the previous batch.
- Shared fixes are implemented once, with consumer regression.
- No formula change without a source, version, population, and independent golden case.
- No database, RLS, Macro, route/ID/registry, or frozen-document change without separate authorization.
- No commit/push/merge/deployment unless separately authorized.
- No tool is executed merely because it appears in a batch number. Each tool must pass individual acceptance criteria.

## 2. Status of the existing 88-batch plan

The existing 88-batch plan in `R5_255_TOOL_EXECUTION_PLAN.md` remains a useful inventory but is **withdrawn as an execution order**. It was ordered by category and cluster, not by safety, formula accuracy, user value, error size, data readiness, or shared-component dependency. The plan below replaces it as the proposed priority order.

## 3. Priority bands

| Band | Priority | Tools | Rationale |
|---:|---|---:|---|
| 0 | Already closed (pending acceptance) | 3 | R5 pilots with runtime evidence |
| 1 | Safety containment | 1 | Tool-010 release-blocking safety issue |
| 2 | Confirmed formula defects | 4 | 020, 030, 100, 106 |
| 3 | Shared infrastructure | all consumers | SafetyNotice, breadcrumb/metadata, AI result context, measurement input primitive |
| 4 | High-risk record-only tools | 30 | Medical/hormonal/reproductive/cardiovascular prediction or risk tools |
| 5 | High-value rich-output tools | 34 | Tools with some interpretation/report/scenario surface |
| 6 | Standard tools with tests/sources | 111 | Baseline calculators and records |
| 7 | Numeric-minimal tools | 63 | Minimal calculations needing depth |
| 8 | Record-only non-medical logs | 23 | Honest record tools after relabel/rebuild decision |
| 9 | Planned tools | 4 | Build or defer explicitly |

## 4. Proposed first batches

| Batch | Tools (≤3) | Gate |
|---|---|---|
| S1 | Compound Stack Builder (`tool-010-compound-stack-builder`) | R5 accepted + tool-010 containment plan approved |
| S2 | Cycle Cost Calculator (`tool-030-cycle-cost-calculator`), Glycogen Supercompensation & Water Retention Modeler (`tool-106-glycogen-supercompensation-water-modeler`), Comprehensive Report Generator (`tool-100-comprehensive-report-generator`) | S1 accepted |
| S3 | Genetic Potential Calculator (`tool-020-genetic-potential`), Body Transformation Scenario Calculator (`tool-131-transformation-forecast-trajectory-engine`), Product Storage Label & Temperature Record Checker (`tool-143-storage-stability-thermal-degradation-estimator`) | S2 accepted |
| S4 | Shared infrastructure: SafetyNotice, breadcrumb/metadata, AI result context, measurement-aware input primitive | S3 accepted; full consumer regression |
| S5 | Rich-output tools (3 selected by owner) | S4 accepted |
| S6 | Record-only scope decision batch (3 selected by owner) | S5 accepted |

After these bands, tools are selected by owner-approved priority, not by their old batch number. Record-only tools are not executed as calculators until the owner chooses relabel or rebuild.

## 5. Stop conditions

Stop and report if:

- a source cannot be verified;
- a formula would materially change without owner approval;
- a shared change breaks a consumer;
- the measurement switch changes the canonical value;
- the AI explanation diverges from the engine;
- the accessibility gate fails;
- the batch would exceed 3 tools.

## 6. Owner decision required

Approve or revise this priority order before any implementation. The old 88-batch sequence remains historical only.

> Batch 2 is BLOCKED until explicit final owner acceptance of R5.
