/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔐 MR. X STEROID - SPACEREMIT WEBHOOK/CALLBACK HANDLER                  ║
 * ║  Vercel Serverless Function                                              ║
 * ║  Route: /api/payments/callback                                           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════
//                         ENVIRONMENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // Supabase Service Role (Full Access for Backend Operations)
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,

    // SpaceRemit Credentials
    SPACEREMIT_SECRET_KEY: process.env.SPACEREMIT_SECRET_KEY!,
    SPACEREMIT_WEBHOOK_SECRET: process.env.SPACEREMIT_WEBHOOK_SECRET || process.env.SPACEREMIT_SECRET_KEY!,

    // API Endpoint for payment verification
    SPACEREMIT_VERIFY_URL: 'https://spaceremit.com/api/v2/payment_info/',
};

// ═══════════════════════════════════════════════════════════════════════════
//                              TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

interface SpaceRemitWebhookPayload {
    event: 'payment.success' | 'payment.failed' | 'payment.cancelled' | 'transaction.success';
    data: {
        reference_id: string;
        transaction_id: string;
        amount: number;
        currency: string;
        status: string;
        customer_email?: string;
        metadata?: Record<string, unknown>;
    };
    timestamp: string;
}

interface SpaceRemitVerifyResponse {
    success: boolean;
    data?: {
        status: string;
        amount: number;
        currency: string;
        reference: string;
        paid_at?: string;
    };
    error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
//                          SUPABASE CLIENT (SERVICE ROLE)
// ═══════════════════════════════════════════════════════════════════════════

const getSupabaseAdmin = () => {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing Supabase configuration');
    }

    return createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

// ═══════════════════════════════════════════════════════════════════════════
//                         SIGNATURE VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verify SpaceRemit Webhook Signature
 * التحقق من توقيع Webhook من SpaceRemit
 */
function verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!CONFIG.SPACEREMIT_WEBHOOK_SECRET) {
        console.error('❌ Missing webhook secret');
        return false;
    }

    const expectedSignature = crypto
        .createHmac('sha256', CONFIG.SPACEREMIT_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

// ═══════════════════════════════════════════════════════════════════════════
//                     VERIFY PAYMENT WITH SPACEREMIT API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verify payment directly with SpaceRemit API
 * التحقق من الدفع مباشرة مع SpaceRemit API
 */
async function verifyPaymentWithSpaceRemit(transactionCode: string): Promise<SpaceRemitVerifyResponse> {
    try {
        const response = await fetch(CONFIG.SPACEREMIT_VERIFY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                private_key: CONFIG.SPACEREMIT_SECRET_KEY,
                spaceremit_code: transactionCode
            })
        });

        if (!response.ok) {
            throw new Error(`SpaceRemit API Error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('❌ SpaceRemit verification failed:', error);
        return { success: false, error: (error as Error).message };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//                         UPDATE SUBSCRIPTION STATUS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Activate user subscription after successful payment
 * تفعيل اشتراك المستخدم بعد الدفع الناجح
 */
async function activateSubscription(userId: string, transactionId: string, planTier?: string): Promise<boolean> {
    const supabase = getSupabaseAdmin();

    try {
        // Update profiles table
        const updatePayload: { subscription_status: string; updated_at: string; plan_tier?: string } = {
            subscription_status: 'active',
            updated_at: new Date().toISOString()
        };

        if (planTier) {
            updatePayload.plan_tier = planTier;
        }

        const { error: profileError } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', userId);

        if (profileError) {
            console.error('❌ Failed to update profile:', profileError);
            return false;
        }

        // Create/Update subscription record
        const { error: subError } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: userId,
                status: 'active',
                product_id: planTier || 'premium',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
                metadata: { transaction_id: transactionId, plan_tier: planTier }
            }, {
                onConflict: 'user_id'
            });

        if (subError) {
            console.error('⚠️ Failed to create subscription record:', subError);
            // Don't fail - profile is already updated
        }

        console.log(`✅ Subscription activated for user: ${userId}`);
        return true;
    } catch (error) {
        console.error('❌ Subscription activation failed:', error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//                          UPDATE PAYMENT RECORD
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Update payment record with final status
 * تحديث سجل الدفع بالحالة النهائية
 */
async function updatePaymentRecord(
    transactionId: string,
    status: 'completed' | 'failed' | 'cancelled',
    details?: { spaceremitCode?: string; paidAt?: string; errorMessage?: string }
): Promise<{ userId?: string; orderId?: string; metadata?: Record<string, unknown> | null }> {
    const supabase = getSupabaseAdmin();

    try {
        const updateData: Record<string, unknown> = {
            status,
            updated_at: new Date().toISOString()
        };

        if (details?.spaceremitCode) {
            updateData.spaceremit_code = details.spaceremitCode;
        }
        if (details?.paidAt) {
            updateData.paid_at = details.paidAt;
        }
        if (details?.errorMessage) {
            updateData.error_message = details.errorMessage;
        }

        const { data, error } = await supabase
            .from('payments')
            .update(updateData)
            .eq('transaction_id', transactionId)
            .select('user_id, order_id, metadata')
            .single();

        if (error) {
            console.error('❌ Failed to update payment record:', error);
            return {};
        }

        // Also update the order status
        if (data?.order_id) {
            await supabase
                .from('orders')
                .update({
                    status: status === 'completed',
                    transaction_id: transactionId
                })
                .eq('id', data.order_id);
        }

        return { userId: data?.user_id, orderId: data?.order_id, metadata: data?.metadata };
    } catch (error) {
        console.error('❌ Payment update failed:', error);
        return {};
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//                           MAIN HANDLER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // ─────────────────────────────────────────────────────────────────────────
    // CORS Headers
    // ─────────────────────────────────────────────────────────────────────────
    res.setHeader('Access-Control-Allow-Origin', 'https://mrxsteroid.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-spaceremit-signature');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Handle GET request (SpaceRemit redirect callback with query params)
    // ─────────────────────────────────────────────────────────────────────────
    if (req.method === 'GET') {
        const { SP_payment_code, reference_id, status } = req.query;

        console.log('📥 GET Callback received:', { SP_payment_code, reference_id, status });

        if (SP_payment_code && typeof SP_payment_code === 'string') {
            // Verify with SpaceRemit API
            const verification = await verifyPaymentWithSpaceRemit(SP_payment_code);

            if (verification.success && verification.data?.status === 'completed') {
                const referenceId = reference_id as string || verification.data.reference;

                // Update payment and get user info
                const { userId, metadata } = await updatePaymentRecord(referenceId, 'completed', {
                    spaceremitCode: SP_payment_code,
                    paidAt: verification.data.paid_at || new Date().toISOString()
                });

                // Activate subscription if user exists
                if (userId) {
                    const meta = metadata as Record<string, unknown>;
                    const planTier = (meta?.tierId as string) || (meta?.plan_tier as string);
                    await activateSubscription(userId, referenceId, planTier);
                }

                // Redirect to success page
                return res.redirect(302, `https://mrxsteroid.vercel.app/success?txn=${referenceId}`);
            } else {
                // Payment verification failed
                return res.redirect(302, `https://mrxsteroid.vercel.app/cancel?error=verification_failed`);
            }
        }

        // No payment code - show status page
        return res.redirect(302, 'https://mrxsteroid.vercel.app/');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Handle POST request (Webhook notification)
    // ─────────────────────────────────────────────────────────────────────────
    if (req.method === 'POST') {
        try {
            const signature = req.headers['x-spaceremit-signature'] as string;
            const rawBody = JSON.stringify(req.body);

            console.log('📥 Webhook received:', {
                hasSignature: !!signature,
                bodyPreview: rawBody.substring(0, 100)
            });

            // Verify signature (if provided)
            if (signature && !verifyWebhookSignature(rawBody, signature)) {
                console.error('❌ Invalid webhook signature');
                return res.status(401).json({ error: 'Invalid signature' });
            }

            const payload = req.body as SpaceRemitWebhookPayload;
            const { event, data } = payload;

            console.log('📋 Processing event:', event, 'Reference:', data?.reference_id);

            // ─────────────────────────────────────────────────────────────────
            // Handle Payment Success Event
            // ─────────────────────────────────────────────────────────────────
            if (event === 'payment.success' || event === 'transaction.success') {
                const transactionId = data.reference_id || data.transaction_id;

                // Update payment record
                const { userId } = await updatePaymentRecord(transactionId, 'completed', {
                    spaceremitCode: data.transaction_id,
                    paidAt: new Date().toISOString()
                });

                // Activate subscription
                if (userId) {
                    const planTier = data.metadata?.tierId as string || data.metadata?.plan_tier as string;
                    const activated = await activateSubscription(userId, transactionId, planTier);

                    if (!activated) {
                        console.error('⚠️ Failed to activate subscription for user:', userId);
                    }
                } else {
                    console.warn('⚠️ No user_id found for transaction:', transactionId);
                }

                return res.status(200).json({
                    success: true,
                    message: 'Payment processed successfully',
                    transactionId
                });
            }

            // ─────────────────────────────────────────────────────────────────
            // Handle Payment Failed Event
            // ─────────────────────────────────────────────────────────────────
            if (event === 'payment.failed') {
                const transactionId = data.reference_id || data.transaction_id;

                await updatePaymentRecord(transactionId, 'failed', {
                    errorMessage: 'Payment was declined'
                });

                return res.status(200).json({
                    success: true,
                    message: 'Payment failure recorded',
                    transactionId
                });
            }

            // ─────────────────────────────────────────────────────────────────
            // Handle Payment Cancelled Event
            // ─────────────────────────────────────────────────────────────────
            if (event === 'payment.cancelled') {
                const transactionId = data.reference_id || data.transaction_id;

                await updatePaymentRecord(transactionId, 'cancelled');

                return res.status(200).json({
                    success: true,
                    message: 'Payment cancellation recorded',
                    transactionId
                });
            }

            // Unknown event type
            console.log('ℹ️ Unhandled event type:', event);
            return res.status(200).json({ success: true, message: 'Event acknowledged' });

        } catch (error) {
            console.error('❌ Webhook processing error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: (error as Error).message
            });
        }
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
}
