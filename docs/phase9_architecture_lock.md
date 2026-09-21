# Phase 9 Architecture Lock Document

## Executive Decision

**Phase 9: Enhanced Fraud Detection & Monitoring System (APHC)**  
**Status**: ARCHITECTURE LOCKED — APPROVED FOR IMPLEMENTATION

---

## 1. Current Architecture (Phase 8 Boundary)

| Component | Status | Location |
|-----------|--------|----------|
| Payment Status | PRODUCTION | `payment_intents.status` |
| Provider Verdict | PRODUCTION | `applyProviderVerdict()` in `server/payments/fulfillmentService.ts` |
| gate_version | PRODUCTION | `payment_intents.gate_version` (Phase 8-B) |
| backoffPolicy | PRODUCTION | `server/payments/backoffPolicy.ts` (Phase 8-A) |
| Reconciliation | PRODUCTION | `server/payments/reconciliationRunner.ts` |
| Audit Log | PRODUCTION | `server/payments/audit_log` |

---

## 2. Phase 8 → Phase 9 Boundary

### Phase 8 owns:
- Central backoff policy (`delayForAttempt`, `RECONCILIATION_POLICY`)
- Per-intent `gate_version` CAS counter
- N-1 late arrival guard
- Shared state path for fulfillment/reconciliation

### Phase 9 owns:
- **Risk Intelligence Layer** — جمع إشارات الخطر وتقييمها
- **Rule Engine** — قواعد تقييم حسب conditions/priority
- **Risk Evaluation Hook** — موقع بعد applyProviderVerdict
- **Risk Observations & Decisions** — جداول منفصلة كمصدر حقيقة
- **Fraud Flag (Hybrid)** — summary field في payment_intents

### Phase 9 does NOT:
- Create second payment state machine
- Modify existing payment_status/provider_status
- Bypass gate_version CAS
- Create unauthorized changes

---

## 3. Source of Truth Matrix

| Entity | Source of Truth | Phase |
|--------|-----------------|-------|
| Payment Status | `payment_intents.status` | Phase 8 |
| Provider Verdict | `applyProviderVerdict()` | Phase 8 |
| Risk Observation | `risk_observations` table | Phase 9 |
| Risk Decision | `risk_decisions` table | Phase 9 |
| Risk Rule | `fraud_rules` table | Phase 9 |
| Summary Flag | `payment_intents.fraud_flag` (denormalized) | Phase 9 |

---

## 4. Risk Domain Model

### Tables:

**risk_observations**
```
id UUID PK
payment_intent_id UUID FK
signal_type TEXT  // "amount_exceeded", "velocity", "region_mismatch"
score INTEGER
metadata JSONB
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

**risk_decisions**
```
id UUID PK
payment_intent_id UUID FK
observation_id UUID FK
rule_id UUID FK
decision ENUM('allow', 'review', 'reject')
reason TEXT
resolved_at TIMESTAMPTZ (nullable)
reviewer_id UUID (nullable)
policy_version TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

**fraud_rules**
```
id UUID PK
name TEXT
version TEXT
condition JSONB  // JSON schema
action ENUM('allow', 'review', 'reject', 'notify')
priority INTEGER
enabled BOOLEAN
dry_run BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

---

## 5. State Model

### Payment States (unchanged from Phase 8):
- `requires_payment_method`
- `processing`
- `succeeded`
- `failed`

### Risk States (NEW):
- `unassessed` → `allow` → `completed`
- `unassessed` → `review` → `manual_review` → `resolved`
- `unassessed` → `reject` → `blocked`

---

## 6. Rules Engine Architecture

- Rules stored in `fraud_rules` table
- Evaluation order: `priority` DESC (highest number = highest priority)
- Short-circuit evaluation: first matching rule wins
- `dry_run = true` logs decision without mutation
- Each decision records `policy_version`

---

## 7. Event Architecture

Since Kafka/Slack NOT present in repo:
- Create abstraction: `server/fraud/eventBus.ts`
- Supports: emitObservation, emitDecision
- Future integrable with real event sinks

---

## 8. Failure Model

| Component | Impact | Fallback |
|-----------|--------|----------|
| Risk Engine | Allow denied | FAIL-CLOSED |
| Postgres | Service unavailable | Return 503 |
| Rule Evaluation | Unknown | FAIL-CLOSED |

---

## 9. Security Model

- All risk tables RLS-protected (service_role SELECT/UPDATE only)
- NO client-side access to risk data
- Admin UI requires admin session
- No secrets stored in risk tables

---

## 10. Migration Strategy

1. Create `risk_observations`, `risk_decisions`, `fraud_rules` tables
2. Add `fraud_flag` ENUM column to `payment_intents` (default 'unassessed')
3. Add indexes on `payment_intent_id` for each table
4. Add RLS policies
5. Seed initial rules (empty, admin-managed)

---

## 11. Implementation Plan

1. ✅ Architecture Lock
2. ✅ ADR Documentation
3. ~~Create migrations~~
4. ~~Implement event bus abstraction~~
5. ~~Implement rule evaluator~~
6. ~~Implement risk observation collector~~
7. ~~Implement API endpoint~~
8. ~~Implement dashboard UI (stub)~~
9. ~~Write tests (unit/integration/security)~~
10. ~~Verify build/lint~~
11. ~~Commit & push~~

---

## 12. Deferred Items

- Real Kafka/Slack integration (not in current architecture)
- M5/M31/GateAdvisors (placeholder references only)
- Machine learning risk scoring (future enhancement)

---

**LOCKED BY**: opencode  
**DATE**: 2026-09-19  
**NEXT**: Phase 9 Execution