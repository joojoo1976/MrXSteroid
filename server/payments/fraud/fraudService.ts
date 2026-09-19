import crypto from 'crypto';

// ================================
// Phase 9: Advanced Protection & Risk Handling (APHC)
// ================================

// ==========================================
// FRAUD OBSERVATION
// ==========================================

export interface FraudObservation {
    id: string;
    payment_intent_id: string;
    signal_type: 'AMOUNT_EXCEEDED' | 'VELOCITY_ANOMALY' | 'REGION_MISMATCH' | 'DEVICE_ANOMALY' | 'TIME_WINDOW_ANOMALY';
    score: number;
    threshold: number;
    evidence: Record<string, any>;
    detected_at: string;
    expires_at: string;
    policy_version: string;
    source: 'payment' | 'webhook' | 'reconciliation';
}

// ==========================================
// FRAUD RULE
// ==========================================

export interface FraudRule {
    id: string;
    name: string;
    version: string;
    condition: {
        amount?: {
            max?: number;
            operator?: 'less_than' | 'greater_than' | 'equal';
        };
        frequency?: {
            window_minutes?: number;
            max_transactions?: number;
        };
        region?: {
            allowed?: string[];
            blocked?: string[];
        };
        device?: {
            fingerprint?: string[];
            blocked?: string[];
        };
    };
    action: 'ALLOW' | 'REVIEW' | 'REJECT';
    priority: number;
    enabled: boolean;
    dry_run: boolean;
    created_at: string;
    updated_at: string;
    tags?: string[];
}

// ==========================================
// FRAUD DECISION
// ==========================================

export interface FraudDecision {
    id: string;
    payment_intent_id: string;
    observation_id?: string;
    rule_id: string;
    decision: 'ALLOW' | 'REVIEW' | 'REJECT';
    reason: string;
    evaluated_at: string;
    reviewed_by?: string;
    reviewed_at?: string;
    policy_version: string;
    applied_to_payment_status?: boolean;
    notification_sent?: boolean;
    audit_trail?: any;
}

// ==========================================
// FRAUD SERVICE (Phase 9 Core)
// ==========================================

export class FraudService {
    static async evaluate(payment_intent_id: string, amount: number, metadata: Record<string, any>): Promise<FraudDecision> {
        const observations = await this.collectObservations(payment_intent_id, amount, metadata);
        const rules = await this.loadActiveRules();

        // تطبيق منطق التقييم الأولوية (أول قاعدة تطابق)
        for (const rule of rules.sort((a, b) => b.priority - a.priority)) {
            if (rule.enabled && await this.evaluateRule(rule, observations, metadata)) {
                const decision = await this.createDecision(payment_intent_id, observations[0]?.id, rule.id, rule.action, rule.dry_run);
                if (!rule.dry_run) {
                    await this.applyDecision(decision, payment_intent_id);
                }
                return decision;
            }
        }

        // افتراض افتراضي: سماح
        const default_rule = await this.getAllowRule();
        const decision = await this.createDecision(payment_intent_id, observations[0]?.id, default_rule.id, 'ALLOW', false);
        await this.applyDecision(decision, payment_intent_id);
        return decision;
    }

    private static async collectObservations(payment_intent_id: string, amount: number, metadata: Record<string, any>): Promise<FraudObservation[]> {
        const observations: FraudObservation[] = [];
        const policy_version = 'v1.0';

        // مراقبة التجاوز في المبلغ
        if (amount > 50000) {
            observations.push({
                id: `obs-${crypto.randomBytes(4).toString('hex')}`,
                payment_intent_id,
                signal_type: 'AMOUNT_EXCEEDED',
                score: Math.min(amount / 1000, 100),
                threshold: 50000,
                evidence: { amount, threshold: 50000 },
                detected_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                policy_version,
                source: 'payment'
            });
        }

        // التحقق من المنطقة (مثال باستخدام الإيبان/الموقع)
        const ipCountry = metadata.ip_country || 'UNKNOWN';
        if (ipCountry === 'BLOCKED_REGION') {
            observations.push({
                id: `obs-${crypto.randomBytes(4).toString('hex')}`,
                payment_intent_id,
                signal_type: 'REGION_MISMATCH',
                score: 90,
                threshold: 80,
                evidence: { ip_country: ipCountry },
                detected_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
                policy_version,
                source: 'payment'
            });
        }

        return observations;
    }

    private static activeRules: FraudRule[] = [
        {
            id: 'rule-1',
            name: 'ارتفاع المبلغ',
            version: 'v1.0',
            condition: {
                amount: { max: 50000, operator: 'greater_than' }
            },
            action: 'REVIEW',
            priority: 10,
            enabled: true,
            dry_run: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'rule-2',
            name: 'منطقة محظورة',
            version: 'v1.0',
            condition: {
                region: { blocked: ['BLOCKED_REGION'] }
            },
            action: 'REJECT',
            priority: 20,
            enabled: true,
            dry_run: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'rule-3',
            name: 'السماح الافتراضي',
            version: 'v1.0',
            condition: {},
            action: 'ALLOW',
            priority: 1,
            enabled: true,
            dry_run: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ];

    private static async loadActiveRules(): Promise<FraudRule[]> {
        return this.activeRules;
    }

    private static async evaluateRule(rule: FraudRule, observations: FraudObservation[], metadata: Record<string, any>): Promise<boolean> {
        if (rule.condition.amount && rule.condition.amount.max) {
            const amount = metadata.amount || 0;
            if (amount > rule.condition.amount.max) {
                return true;
            }
        }

        if (rule.condition.region && rule.condition.region.blocked) {
            const ipCountry = metadata.ip_country || 'UNKNOWN';
            if (rule.condition.region.blocked.includes(ipCountry)) {
                return true;
            }
        }

        if (rule.condition.device && rule.condition.device.blocked) {
            const device_fingerprint = metadata.device_fingerprint;
            if (device_fingerprint && rule.condition.device.blocked.includes(device_fingerprint)) {
                return true;
            }
        }

        return false;
    }

    private static async createDecision(payment_intent_id: string, observation_id: string | undefined, rule_id: string, decision: 'ALLOW' | 'REVIEW' | 'REJECT', dry_run: boolean): Promise<FraudDecision> {
        const now = new Date().toISOString();
        const decision_id = `decision-${crypto.randomBytes(4).toString('hex')}`;

        return {
            id: decision_id,
            payment_intent_id,
            observation_id,
            rule_id,
            decision,
            reason: `Rule ${rule_id} triggered: action ${decision}`,
            evaluated_at: now,
            policy_version: 'v1.0',
            applied_to_payment_status: !dry_run,
            notification_sent: false,
            audit_trail: {
                timestamp: now,
                version: 'v1.0'
            }
        };
    }

    private static async applyDecision(decision: FraudDecision, payment_intent_id: string): Promise<void> {
        // تحديث fraud_flag في payment_intents
        console.log(`[Fraud] Decision ${decision.decision} for payment_intent_id=${payment_intent_id}: ${decision.reason}`);

        if (decision.decision === 'REJECT') {
            // رفض الدفع — تحديث حالة الدفع إلى 'failed' (يتطلب صلاحيات)
            // في الإنتاج، ندمج مع applyProviderVerdict
        } else if (decision.decision === 'REVIEW') {
            // يتم المراجعة يدويًا لاحقًا
        } else if (decision.decision === 'ALLOW') {
            // السماح — استمرار التدفق الطبيعي
        }
    }

    private static async getAllowRule(): Promise<FraudRule> {
        return {
            id: 'rule-3',
            name: 'افتراضي — سماح',
            version: 'v1.0',
            condition: {},
            action: 'ALLOW',
            priority: 1,
            enabled: true,
            dry_run: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }
}