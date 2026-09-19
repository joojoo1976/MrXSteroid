/**
 * =============================================================================
 *  PHASE 9 — FRAUD/RISK EVALUATION ENGINE (APHC core)
 *  =============================================================================
 *  Pure in-memory rules engine that evaluates a payment-intent risk observation
 *  set against ordered fraud rules and emits a deterministic decision.
 *
 *  Source of truth: FRAUD SERVICE (this module).
 *  Companion tables: fraud_rules, fraud_observations, fraud_decisions.
 *  Companion column: payment_intents.fraud_flag (denormalised summary).
 *
 *  Priority semantics: HIGHER priority number wins (admin-facing convention).
 *  Conflict resolution: short-circuit on first match (most specific first).
 *  Fail behaviour: on unknown rule / error → default rule-3 (ALLOW, lowest prio).
 *  This module never writes to the database; persistence is the caller's job.
 * =============================================================================
 */

import crypto from 'crypto';

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type FraudSignalType =
    | 'AMOUNT_EXCEEDED'
    | 'VELOCITY_ANOMALY'
    | 'REGION_MISMATCH'
    | 'DEVICE_ANOMALY'
    | 'TIME_WINDOW_ANOMALY'
    | 'CARD_TYPE_MISMATCH'
    | 'REPLAY_ATTEMPT';

export type FraudAction = 'ALLOW' | 'REVIEW' | 'REJECT' | 'NOTIFY' | 'BLOCK';
export type FraudDecisionCode = 'ALLOW' | 'REVIEW' | 'REJECT' | 'BLOCK';

export interface FraudObservation {
    id: string;
    payment_intent_id: string;
    signal_type: FraudSignalType;
    score: number;
    threshold: number;
    evidence: Record<string, unknown>;
    detected_at: string;
    expires_at: string;
    policy_version: string;
    source: 'payment' | 'webhook' | 'reconciliation';
}

export interface FraudRuleCondition {
    amount?: { max?: number; min?: number; operator?: 'less_than' | 'greater_than' | 'equal' };
    frequency?: { window_minutes?: number; max_transactions?: number };
    region?: { allowed?: string[]; blocked?: string[] };
    device?: { fingerprint?: string[]; blocked?: string[] };
}

export interface FraudRule {
    id: string;
    name: string;
    version: string;
    condition: FraudRuleCondition;
    action: FraudAction;
    priority: number;
    enabled: boolean;
    dry_run: boolean;
    created_at: string;
    updated_at: string;
    tags?: string[];
}

export interface FraudDecision {
    id: string;
    payment_intent_id: string;
    observation_id?: string;
    rule_id: string;
    decision: FraudDecisionCode;
    reason: string;
    evaluated_at: string;
    reviewed_by?: string;
    reviewed_at?: string;
    policy_version: string;
    applied_to_payment_status: boolean;
    notification_sent: boolean;
    audit_trail?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  STATIC RULE REGISTRY (single source of truth for in-process evaluation)
// ─────────────────────────────────────────────────────────────────────────────

const POLICY_VERSION = 'v1.0';

function nowIso(): string {
    return new Date().toISOString();
}

function newId(prefix: string): string {
    return `${prefix}-${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * The seed rule set. Rules are intentionally minimal: amount threshold + blocked
 * region + default allow. These are config-only values; do not encode business
 * numbers here without a signed ADR.
 */
const DEFAULT_RULES: FraudRule[] = [
    {
        id: 'rule-2',
        name: 'Blocked Region',
        version: POLICY_VERSION,
        condition: { region: { blocked: ['BLOCKED_REGION'] } },
        action: 'REJECT',
        priority: 20,
        enabled: true,
        dry_run: false,
        created_at: nowIso(),
        updated_at: nowIso(),
    },
    {
        id: 'rule-1',
        name: 'Amount Exceeded',
        version: POLICY_VERSION,
        condition: { amount: { max: 50000, operator: 'greater_than' } },
        action: 'REVIEW',
        priority: 10,
        enabled: true,
        dry_run: false,
        created_at: nowIso(),
        updated_at: nowIso(),
    },
    {
        id: 'rule-3',
        name: 'Default Allow',
        version: POLICY_VERSION,
        condition: {},
        action: 'ALLOW',
        priority: 1,
        enabled: true,
        dry_run: false,
        created_at: nowIso(),
        updated_at: nowIso(),
    },
];

// In-process mutable registry so tests / dry-runs can toggle rule state.
let activeRules: FraudRule[] = DEFAULT_RULES.map((r) => ({ ...r }));

// ─────────────────────────────────────────────────────────────────────────────
//  EVALUATION
// ─────────────────────────────────────────────────────────────────────────────

export interface EvaluateInput {
    payment_intent_id: string;
    amount: number;
    metadata?: Record<string, unknown>;
}

export class FraudService {
    /** Entry point used by the API route + tests. */
    static async evaluate(
        payment_intent_id: string,
        amount: number,
        metadata: Record<string, unknown> = {},
    ): Promise<FraudDecision> {
        const observations = FraudService.collectObservations(payment_intent_id, amount, metadata);

        // Sort HIGHEST priority first; first enabled match wins.
        const ordered = [...activeRules].sort((a, b) => b.priority - a.priority);

        for (const rule of ordered) {
            if (!rule.enabled) continue;
            const matched = FraudService.evaluateRule(rule, observations, { amount, ...metadata });
            if (!matched) continue;

            const decision = FraudService.createDecision(
                payment_intent_id,
                observations[0]?.id,
                rule.id,
                rule.action,
                rule.dry_run,
            );

            if (!rule.dry_run) {
                FraudService.applyDecision(decision, payment_intent_id);
            } else {
                console.log(
                    `[Fraud] DRY_RUN decision=${decision.decision} intent=${payment_intent_id} rule=${rule.id}`,
                );
            }
            return decision;
        }

        // Fallback: default allow (priority 1, rule-3 in seed).
        const defaultRule = activeRules.find((r) => r.id === 'rule-3') ?? activeRules[activeRules.length - 1];
        const decision = FraudService.createDecision(
            payment_intent_id,
            observations[0]?.id,
            defaultRule.id,
            'ALLOW',
            false,
        );
        FraudService.applyDecision(decision, payment_intent_id);
        return decision;
    }

    /** Pure: collect observations from amount + metadata signals. */
    static collectObservations(
        payment_intent_id: string,
        amount: number,
        metadata: Record<string, unknown>,
    ): FraudObservation[] {
        const observations: FraudObservation[] = [];

        if (amount > 50000) {
            observations.push({
                id: newId('obs'),
                payment_intent_id,
                signal_type: 'AMOUNT_EXCEEDED',
                score: Math.min(Math.round(amount / 1000), 100),
                threshold: 50000,
                evidence: { amount, threshold: 50000 },
                detected_at: nowIso(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                policy_version: POLICY_VERSION,
                source: 'payment',
            });
        }

        const ipCountry = (metadata.ip_country as string | undefined) ?? 'UNKNOWN';
        if (ipCountry === 'BLOCKED_REGION') {
            observations.push({
                id: newId('obs'),
                payment_intent_id,
                signal_type: 'REGION_MISMATCH',
                score: 90,
                threshold: 80,
                evidence: { ip_country: ipCountry },
                detected_at: nowIso(),
                expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
                policy_version: POLICY_VERSION,
                source: 'payment',
            });
        }

        return observations;
    }

    /** Pure: does a single rule's condition match the input envelope? */
    static evaluateRule(
        rule: FraudRule,
        _observations: FraudObservation[],
        metadata: Record<string, unknown>,
    ): boolean {
        const cond = rule.condition ?? {};
        const env = metadata as { amount?: number; ip_country?: string; device_fingerprint?: string };

        if (cond.amount?.max != null) {
            const amt = env.amount ?? 0;
            const op = cond.amount.operator ?? 'greater_than';
            if (op === 'greater_than' && !(amt > cond.amount.max)) return false;
            if (op === 'less_than' && !(amt < cond.amount.max)) return false;
            if (op === 'equal' && amt !== cond.amount.max) return false;
        }

        if (cond.region?.blocked?.length) {
            const country = env.ip_country ?? 'UNKNOWN';
            if (!cond.region.blocked.includes(country)) return false;
        }

        if (cond.region?.allowed?.length) {
            const country = env.ip_country ?? 'UNKNOWN';
            if (!cond.region.allowed.includes(country)) return false;
        }

        if (cond.device?.blocked?.length) {
            const fp = env.device_fingerprint;
            if (!fp || !cond.device.blocked.includes(fp)) return false;
        }

        return true;
    }

    /** Pure: build a decision record. */
    static createDecision(
        payment_intent_id: string,
        observation_id: string | undefined,
        rule_id: string,
        rule_action: FraudAction,
        dry_run: boolean,
    ): FraudDecision {
        const decisionCode: FraudDecisionCode =
            rule_action === 'ALLOW' || rule_action === 'REVIEW' || rule_action === 'REJECT' || rule_action === 'BLOCK'
                ? rule_action
                : 'REVIEW';

        return {
            id: newId('decision'),
            payment_intent_id,
            observation_id,
            rule_id,
            decision: decisionCode,
            reason: `Rule ${rule_id} triggered: action ${rule_action}`,
            evaluated_at: nowIso(),
            policy_version: POLICY_VERSION,
            applied_to_payment_status: !dry_run,
            notification_sent: false,
            audit_trail: { timestamp: nowIso(), version: POLICY_VERSION, dry_run },
        };
    }

    /** Side-effect placeholder: caller should persist via Supabase. */
    static applyDecision(decision: FraudDecision, payment_intent_id: string): void {
        // Intentionally side-effect-free in-process; the API route persists.
        console.log(
            `[Fraud] Decision ${decision.decision} for payment_intent_id=${payment_intent_id}: ${decision.reason}`,
        );
    }

    /** Read-only accessor for the in-memory registry (tests + admin endpoints). */
    static loadActiveRules(): FraudRule[] {
        return activeRules.map((r) => ({ ...r }));
    }

    /** Allow tests to mutate the in-memory registry. */
    static __setRulesForTests(rules: FraudRule[]): void {
        activeRules = rules.map((r) => ({ ...r }));
    }

    static __resetForTests(): void {
        activeRules = DEFAULT_RULES.map((r) => ({ ...r }));
    }
}
