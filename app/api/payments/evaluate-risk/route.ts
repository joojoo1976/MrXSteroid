/**
 * =============================================================================
 *  PHASE 9 — RISK EVALUATION API ENDPOINT
 *  =============================================================================
 *  POST /api/payments/evaluate-risk
 *  GET  /api/payments/evaluate-risk?payment_intent_id=...
 *
 *  Server-side endpoint that drives the in-process FraudService.
 *  Requires admin authentication per Architecture Lock Section 9.
 *  Persists observations and decisions to fraud tables; trigger syncs
 *  payment_intents.fraud_flag denormalized column.
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FraudService } from '../../../../server/payments/fraud/fraudService';
import { requireAdmin } from '../../../../server/auth/require-admin';

interface EvaluateRequestBody {
    payment_intent_id?: unknown;
    amount?: unknown;
    metadata?: unknown;
}

function isNonEmptyString(v: unknown): v is string {
    return typeof v === 'string' && v.trim().length > 0;
}

function isFiniteNumber(v: unknown): v is number {
    return typeof v === 'number' && Number.isFinite(v);
}

function getServiceClient(): SupabaseClient {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('[evaluate-risk] Missing Supabase service role configuration');
    }
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function persistObservations(
    client: SupabaseClient,
    observations: Awaited<ReturnType<typeof FraudService.collectObservations>>,
): Promise<string[]> {
    if (observations.length === 0) return [];
    const rows = observations.map((obs) => ({
        id: obs.id,
        payment_intent_id: obs.payment_intent_id,
        signal_type: obs.signal_type,
        score: obs.score,
        threshold: obs.threshold,
        evidence: obs.evidence,
        detected_at: obs.detected_at,
        expires_at: obs.expires_at,
        policy_version: obs.policy_version,
        source: obs.source,
    }));
    const { error } = await client.from('fraud_observations').insert(rows);
    if (error) {
        console.error('[evaluate-risk] Failed to persist observations:', error.message);
        throw error;
    }
    return observations.map((o) => o.id);
}

async function persistDecision(
    client: SupabaseClient,
    decision: Awaited<ReturnType<typeof FraudService.createDecision>>,
    observationIds: string[],
): Promise<void> {
    const row = {
        id: decision.id,
        payment_intent_id: decision.payment_intent_id,
        observation_id: observationIds[0] ?? null,
        rule_id: decision.rule_id,
        decision: decision.decision,
        reason: decision.reason,
        evaluated_at: decision.evaluated_at,
        policy_version: decision.policy_version,
        applied_to_payment_status: decision.applied_to_payment_status,
        notification_sent: decision.notification_sent,
        audit_trail: decision.audit_trail ?? {},
    };
    const { error } = await client.from('fraud_decisions').insert(row);
    if (error) {
        console.error('[evaluate-risk] Failed to persist decision:', error.message);
        throw error;
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    // Architecture Lock Section 9: Admin authentication required
    const adminCheck = await requireAdmin(req);
    if (!adminCheck.authorized) {
        return adminCheck.response;
    }

    let body: EvaluateRequestBody;
    try {
        body = (await req.json()) as EvaluateRequestBody;
    } catch {
        return NextResponse.json(
            { error: 'invalid_json', message: 'Request body must be valid JSON' },
            { status: 400 },
        );
    }

    if (!isNonEmptyString(body.payment_intent_id)) {
        return NextResponse.json(
            { error: 'invalid_payment_intent_id', message: 'payment_intent_id is required' },
            { status: 400 },
        );
    }
    if (!isFiniteNumber(body.amount) || body.amount < 0) {
        return NextResponse.json(
            { error: 'invalid_amount', message: 'amount must be a non-negative finite number' },
            { status: 400 },
        );
    }

    const metadata =
        body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
            ? (body.metadata as Record<string, unknown>)
            : {};

    const observations = FraudService.collectObservations(
        body.payment_intent_id,
        body.amount,
        metadata,
    );

    const decision = await FraudService.evaluate(body.payment_intent_id, body.amount, metadata);

    // Persist observations and decision (trigger updates fraud_flag on payment_intents)
    const client = getServiceClient();
    const observationIds = await persistObservations(client, observations);
    await persistDecision(client, decision, observationIds);

    return NextResponse.json(
        {
            risk_evaluated: true,
            policy_version: 'v1.0',
            decision,
            observations,
        },
        { status: 200 },
    );
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    // Architecture Lock Section 9: Admin authentication required
    const adminCheck = await requireAdmin(req);
    if (!adminCheck.authorized) {
        return adminCheck.response;
    }

    const url = new URL(req.url);
    const payment_intent_id = url.searchParams.get('payment_intent_id');

    if (!isNonEmptyString(payment_intent_id)) {
        return NextResponse.json(
            { error: 'invalid_payment_intent_id', message: 'payment_intent_id required' },
            { status: 400 },
        );
    }

    const activeRules = FraudService.loadActiveRules();
    return NextResponse.json(
        {
            payment_intent_id,
            risk_evaluated: false,
            note: 'POST to /api/payments/evaluate-risk to compute a decision',
            active_rule_count: activeRules.filter((r) => r.enabled).length,
            policy_version: 'v1.0',
        },
        { status: 200 },
    );
}