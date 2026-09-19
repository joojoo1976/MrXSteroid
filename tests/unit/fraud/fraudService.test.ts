import { describe, it, expect, beforeEach } from 'vitest';
import {
    FraudService,
    FraudRule,
    FraudObservation,
    FraudDecision,
} from '../../../server/payments/fraud/fraudService';

function clone<T>(v: T): T {
    return JSON.parse(JSON.stringify(v));
}

describe('FraudService — Phase 9', () => {
    beforeEach(() => {
        FraudService.__resetForTests();
    });

    // ── 1. Core evaluation paths ──────────────────────────────────────────────
    describe('1. Core evaluation paths', () => {
        it('ALLOWS a normal small EGYPT transaction (default rule-3)', async () => {
            const d = await FraudService.evaluate('pi_norm', 1000, {
                amount: 1000,
                ip_country: 'EGYPT',
                device_fingerprint: 'dfp_normal',
            });
            expect(d.decision).toBe('ALLOW');
            expect(d.rule_id).toMatch(/^[0-9a-f-]{36}$/i); // uuid
            expect(d.reason).toContain('Default Allow');
            expect(d.applied_to_payment_status).toBe(true);
        });

        it('REVIEWs an amount-exceeded transaction via Amount Exceeded', async () => {
            const d = await FraudService.evaluate('pi_big', 75000, {
                amount: 75000,
                ip_country: 'EGYPT',
            });
            expect(d.decision).toBe('REVIEW');
            expect(d.reason).toContain('Amount Exceeded');
        });

        it('REJECTs a transaction from a blocked region via Blocked Region', async () => {
            const d = await FraudService.evaluate('pi_blocked', 1000, {
                amount: 1000,
                ip_country: 'BLOCKED_REGION',
            });
            expect(d.decision).toBe('REJECT');
            expect(d.reason).toContain('Blocked Region');
        });

        it('Honors higher priority when multiple rules match (Blocked Region > Amount)', async () => {
            const d = await FraudService.evaluate('pi_both', 75000, {
                amount: 75000,
                ip_country: 'BLOCKED_REGION',
            });
            expect(d.decision).toBe('REJECT');
            expect(d.reason).toContain('Blocked Region');
        });

        it('dry_run=true on a matching rule does NOT mark applied_to_payment_status', async () => {
            const rules = FraudService.loadActiveRules();
            const r1 = rules.find((r) => r.name === 'Amount Exceeded')!;
            r1.dry_run = true;
            FraudService.__setRulesForTests(rules);

            const d = await FraudService.evaluate('pi_dry', 75000, { amount: 75000 });
            expect(d.decision).toBe('REVIEW');
            expect(d.applied_to_payment_status).toBe(false);
        });
    });

    // ── 2. Observation collection (pure) ─────────────────────────────────────
    describe('2. Observation collection', () => {
        it('emits an AMOUNT_EXCEEDED observation for amounts > 50000', () => {
            const obs = FraudService.collectObservations('pi_o1', 100000, { amount: 100000 });
            expect(obs).toHaveLength(1);
            expect(obs[0].signal_type).toBe('AMOUNT_EXCEEDED');
            expect(obs[0].threshold).toBe(50000);
            expect(obs[0].score).toBeGreaterThan(0);
            expect(obs[0].evidence).toEqual({ amount: 100000, threshold: 50000 });
        });

        it('emits a REGION_MISMATCH observation for BLOCKED_REGION', () => {
            const obs = FraudService.collectObservations('pi_o2', 1000, { ip_country: 'BLOCKED_REGION' });
            expect(obs).toHaveLength(1);
            expect(obs[0].signal_type).toBe('REGION_MISMATCH');
            expect(obs[0].score).toBe(90);
            expect(obs[0].threshold).toBe(80);
        });

        it('emits no observations for a normal transaction', () => {
            const obs = FraudService.collectObservations('pi_o3', 5000, {
                amount: 5000,
                ip_country: 'EGYPT',
            });
            expect(obs).toHaveLength(0);
        });
    });

    // ── 3. Rule evaluation (pure) ────────────────────────────────────────────
    describe('3. Rule evaluation', () => {
        const baseRule: FraudRule = {
            id: 'r',
            name: 'r',
            version: 'v1.0',
            condition: {},
            action: 'REJECT',
            priority: 1,
            enabled: true,
            dry_run: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        it('matches amount > max', () => {
            const r = clone(baseRule);
            r.condition = { amount: { max: 1000, operator: 'greater_than' } };
            expect(FraudService.evaluateRule(r, [], { amount: 1500 })).toBe(true);
        });

        it('does not match when amount ≤ max', () => {
            const r = clone(baseRule);
            r.condition = { amount: { max: 1000, operator: 'greater_than' } };
            expect(FraudService.evaluateRule(r, [], { amount: 500 })).toBe(false);
        });

        it('matches region.blocked', () => {
            const r = clone(baseRule);
            r.condition = { region: { blocked: ['X', 'Y'] } };
            expect(FraudService.evaluateRule(r, [], { ip_country: 'X' })).toBe(true);
        });

        it('does not match region.blocked when country is not in list', () => {
            const r = clone(baseRule);
            r.condition = { region: { blocked: ['X'] } };
            expect(FraudService.evaluateRule(r, [], { ip_country: 'Z' })).toBe(false);
        });

        it('empty condition always matches', () => {
            const r = clone(baseRule);
            r.condition = {};
            expect(FraudService.evaluateRule(r, [], {})).toBe(true);
        });
    });

    // ── 4. Decision creation (pure) ──────────────────────────────────────────
    describe('4. Decision creation', () => {
        it('builds a decision with all required fields', () => {
            const d = FraudService.createDecision('pi_d', 'obs_1', 'rule_x', 'REJECT', false);
            expect(d.id).toMatch(/^decision-/);
            expect(d.payment_intent_id).toBe('pi_d');
            expect(d.rule_id).toBe('rule_x');
            expect(d.decision).toBe('REJECT');
            expect(d.policy_version).toBe('v1.0');
            expect(d.applied_to_payment_status).toBe(true);
            expect(d.evaluated_at).toMatch(/T/);
        });

        it('normalises NOTIFY to REVIEW for storage', () => {
            const d = FraudService.createDecision('pi_n', undefined, 'rule_n', 'NOTIFY', false);
            expect(d.decision).toBe('REVIEW');
        });
    });

    // ── 5. Priority + conflict resolution ─────────────────────────────────────
    describe('5. Priority + conflict resolution', () => {
        it('sorts rules by priority DESC, deterministic across calls', () => {
            const a = FraudService.loadActiveRules();
            const b = FraudService.loadActiveRules();
            const order = (xs: FraudRule[]) =>
                [...xs].sort((p, q) => q.priority - p.priority).map((x) => x.id);
            expect(order(a)).toEqual(order(b));
        });
    });
});
