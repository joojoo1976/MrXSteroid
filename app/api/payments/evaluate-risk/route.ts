import { NextRequest, NextResponse } from 'next/server';
import { FraudService, FraudObservation, FraudDecision } from '../../../../server/payments/fraud/fraudService';

/**
 * POST /api/payments/evaluate-risk
 *
 * Phase 9 APHC: Evaluate payment risk before processing.
 *
 * Request body:
 *   - payment_intent_id (required): string
 *   - amount (required): number
 *   - metadata (optional): Record<string, any>  (ip_country, device_fingerprint, etc.)
 *
 * Response:
 *   - decision: ALLOW | REVIEW | REJECT
 *   - observations: FraudObservation[]
 *   - applied_to_payment_status: boolean
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();
        const { payment_intent_id, amount, metadata } = body;

        // Input validation
        if (!payment_intent_id || typeof amount !== 'number') {
            return NextResponse.json(
                { error: 'payment_intent_id and amount are required' },
                { status: 400 }
            );
        }

        // Risk evaluation
        const decision = await FraudService.evaluate(payment_intent_id, amount, metadata || {});

        // Collect observations for response
        const observations = await FraudService['collectObservations'](payment_intent_id, amount, metadata || {});

        return NextResponse.json({
            decision,
            observations,
            risk_evaluated: true,
            policy_version: 'v1.0'
        }, { status: 200 });

    } catch (error) {
        console.error('[RiskAPI] Error evaluating risk:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/payments/evaluate-risk/{payment_intent_id}
 *
 * Retrieve risk status and decisions for a payment intent.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const url = new URL(req.url);
        const payment_intent_id = url.searchParams.get('payment_intent_id');

        if (!payment_intent_id) {
            return NextResponse.json(
                { error: 'payment_intent_id required' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            payment_intent_id,
            fraud_status: 'unassessed',
            note: 'Use POST endpoint for evaluation'
        }, { status: 200 });

    } catch (error) {
        console.error('[RiskAPI] Error retrieving risk:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}