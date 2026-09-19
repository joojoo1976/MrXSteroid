import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FraudService, FraudObservation, FraudRule, FraudDecision } from '../../../server/payments/fraud/fraudService';

describe('FraudService - Phase 9 Advanced Protection', () => {
    describe('1. Core Evaluation Logic', () => {
        it('should allow normal transaction under threshold', async () => {
            const decision = await FraudService.evaluate('pi_test_1', 1000, {
                amount: 1000,
                ip_country: 'EGYPT',
                device_fingerprint: 'dfp_test_1'
            });

            expect(decision).toEqual(
                expect.objectContaining({
                    decision: 'ALLOW',
                    reason: expect.stringContaining('Rule rule-3 triggered'),
                    applied_to_payment_status: true
                })
            );
        });

        it('should review transaction over amount threshold', async () => {
            const decision = await FraudService.evaluate('pi_test_2', 75000, {
                amount: 75000,
                ip_country: 'EGYPT',
                device_fingerprint: 'dfp_test_2'
            });

            expect(decision).toEqual(
                expect.objectContaining({
                    decision: 'REVIEW',
                    reason: expect.stringContaining('Rule rule-1 triggered'),
                    applied_to_payment_status: true
                })
            );
        });

        it('should reject transaction from blocked region', async () => {
            const decision = await FraudService.evaluate('pi_test_3', 1000, {
                amount: 1000,
                ip_country: 'BLOCKED_REGION',
                device_fingerprint: 'dfp_test_3'
            });

            expect(decision).toEqual(
                expect.objectContaining({
                    decision: 'REJECT',
                    reason: expect.stringContaining('Rule rule-2 triggered'),
                    applied_to_payment_status: true
                })
            );
        });

        it('should respect dry_run mode - no state change', async () => {
            const rules = await FraudService['loadActiveRules']();
            const reviewRule = rules.find(r => r.id === 'rule-1');
            if (reviewRule) {
                reviewRule.dry_run = true;
            }

            const decision = await FraudService.evaluate('pi_test_4', 75000, {
                amount: 75000,
                ip_country: 'EGYPT'
            });

            expect(decision.decision).toBe('REVIEW');
            expect(decision.applied_to_payment_status).toBe(false);
        });
    });

    describe('2. Observation Collection', () => {
        it('should collect amount exceeded observation', async () => {
            const observations = await FraudService['collectObservations']('pi_test_5', 100000, {
                amount: 100000
            });

            expect(observations).toHaveLength(1);
            expect(observations[0]).toEqual(
                expect.objectContaining({
                    signal_type: 'AMOUNT_EXCEEDED',
                    payment_intent_id: 'pi_test_5',
                    score: expect.any(Number),
                    threshold: 50000,
                    evidence: { amount: 100000, threshold: 50000 }
                })
            );
        });

        it('should collect region mismatch observation', async () => {
            const observations = await FraudService['collectObservations']('pi_test_6', 1000, {
                ip_country: 'BLOCKED_REGION'
            });

            expect(observations).toHaveLength(1);
            expect(observations[0]).toEqual(
                expect.objectContaining({
                    signal_type: 'REGION_MISMATCH',
                    payment_intent_id: 'pi_test_6',
                    score: 90,
                    threshold: 80,
                    evidence: { ip_country: 'BLOCKED_REGION' }
                })
            );
        });

        it('should collect no observations for normal transaction', async () => {
            const observations = await FraudService['collectObservations']('pi_test_7', 5000, {
                amount: 5000,
                ip_country: 'EGYPT'
            });

            expect(observations).toHaveLength(0);
        });
    });

    describe('3. Rule Evaluation', () => {
        it('should evaluate amount condition correctly', async () => {
            const rule: FraudRule = {
                id: 'test-rule',
                name: 'Test Rule',
                version: 'v1.0',
                condition: {
                    amount: { max: 1000, operator: 'greater_than' }
                },
                action: 'REJECT',
                priority: 10,
                enabled: true,
                dry_run: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const result = await FraudService['evaluateRule'](
                rule,
                [],
                { amount: 1500 }
            );

            expect(result).toBe(true);
        });

        it('should evaluate region condition correctly', async () => {
            const rule: FraudRule = {
                id: 'test-rule-2',
                name: 'Test Rule 2',
                version: 'v1.0',
                condition: {
                    region: { blocked: ['BLOCKED_REGION'] }
                },
                action: 'REJECT',
                priority: 10,
                enabled: true,
                dry_run: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const result = await FraudService['evaluateRule'](
                rule,
                [],
                { ip_country: 'BLOCKED_REGION' }
            );

            expect(result).toBe(true);
        });

        it('should return false for non-matching conditions', async () => {
            const rule: FraudRule = {
                id: 'test-rule-3',
                name: 'Test Rule 3',
                version: 'v1.0',
                condition: {
                    amount: { max: 1000, operator: 'greater_than' }
                },
                action: 'REJECT',
                priority: 10,
                enabled: true,
                dry_run: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const result = await FraudService['evaluateRule'](
                rule,
                [],
                { amount: 500 }
            );

            expect(result).toBe(false);
        });
    });

    describe('4. Decision Creation', () => {
        it('should create proper decision object', async () => {
            const decision = await FraudService['createDecision'](
                'pi_test_8',
                'obs_test_1',
                'rule_test_1',
                'REJECT',
                false
            );

            expect(decision).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    payment_intent_id: 'pi_test_8',
                    observation_id: 'obs_test_1',
                    rule_id: 'rule_test_1',
                    decision: 'REJECT',
                    evaluated_at: expect.any(String),
                    policy_version: 'v1.0',
                    applied_to_payment_status: true
                })
            );
        });
    });

    describe('5. Priority Processing', () => {
        it('should process rules in priority order', async () => {
            const decision = await FraudService.evaluate('pi_test_9', 75000, {
                amount: 75000,
                ip_country: 'BLOCKED_REGION'
            });

            // Rule 2 (region block, priority 20) should take precedence over rule 1 (amount, priority 10)
            expect(decision.decision).toBe('REJECT');
            expect(decision.reason).toContain('Rule rule-2 triggered');
        });
    });

    describe('6. Default Behavior', () => {
        it('should allow when no rules match', async () => {
            const decision = await FraudService.evaluate('pi_test_10', 1000, {
                amount: 1000,
                ip_country: 'EGYPT'
            });

            expect(decision.decision).toBe('ALLOW');
            expect(decision.reason).toContain('Rule rule-3 triggered'); // default allow rule
        });
    });
});