/**
 * =============================================================================
 *  PHASE 9 — RISK EVALUATION API ENDPOINT
 *  =============================================================================
 *  POST /api/payments/evaluate-risk
 *  GET  /api/payments/evaluate-risk?payment_intent_id=...
 *
 *  Pure server-side endpoint that drives the in-process FraudService.
 *  No DB writes here: persistence belongs to the reconciliation runner
 *  (Phase 7) + the shared fulfillment state path. This endpoint exists only
 *  to expose a synchronous risk signal for the checkout UI / admin tools.
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { FraudService } from '../../../../server/payments/fraud/fraudService';

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

export async function POST(req: NextRequest): Promise<NextResponse> {
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
