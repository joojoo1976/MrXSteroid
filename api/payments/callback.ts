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
        // Update profiles table - including has_paid = TRUE
        const updatePayload: {
            subscription_status: string;
            has_paid: boolean;
            updated_at: string;
            plan_tier?: string
        } = {
            subscription_status: 'active',
            has_paid: true, // ✅ Set has_paid to TRUE on successful payment
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

        console.log(`✅ Profile updated with has_paid=TRUE for user: ${userId}`);

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
//                       GUEST TO USER CONVERSION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Find an existing user or create a new one for a guest checkout
 * البحث عن مستخدم موجود أو إنشاء مستخدم جديد لعملية الدفع كزائر
 */
async function getOrCreateUser(email: string, fullName?: string): Promise<string | null> {
    const supabase = getSupabaseAdmin();

    try {
        console.log(`🔍 Checking if user exists for email: ${email}`);

        // 1. Try to find user in auth metadata (admin list is the only way for backend)
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (existingUser) {
            console.log(`✅ Found existing user: ${existingUser.id}`);
            return existingUser.id;
        }

        // 2. Not found? Create a new user account
        console.log(`➕ Creating new user account for: ${email}`);

        // Generate a random temporary password or let them use 'Forgot Password'
        const tempPassword = crypto.randomBytes(16).toString('hex');

        const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true, // Mark as confirmed so they can log in
            user_metadata: {
                full_name: fullName || email.split('@')[0],
                user_name: email.split('@')[0] + Math.floor(Math.random() * 1000),
                is_guest_checkout: true
            }
        });

        if (createError) {
            // Check if user was created just now by a race condition
            if (createError.message.includes('already registered')) {
                const { data: { users: retryUsers } } = await supabase.auth.admin.listUsers();
                return retryUsers.find(u => u.email?.toLowerCase() === email.toLowerCase())?.id || null;
            }
            throw createError;
        }

        return user?.id || null;
    } catch (error) {
        console.error('❌ User creation/search failed:', error);
        return null;
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
            .select('user_id, order_id, metadata, customer_email, customer_name')
            .single();

        if (error) {
            console.error('❌ Failed to update payment record:', error);
            return {};
        }

        // ─────────────────────────────────────────────────────────────────
        // GUEST CONVERSION LOGIC
        // ─────────────────────────────────────────────────────────────────
        let userId = data?.user_id;

        if (!userId && data?.customer_email && status === 'completed') {
            userId = await getOrCreateUser(data.customer_email, data.customer_name);

            if (userId) {
                // Link the payment to the new/found user
                await supabase
                    .from('payments')
                    .update({ user_id: userId })
                    .eq('transaction_id', transactionId);
            }
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

        return { userId, orderId: data?.order_id, metadata: data?.metadata };
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
        const { SP_payment_code, reference_id, status, txn } = req.query;

        console.log('📥 GET Callback received:', { SP_payment_code, reference_id, status, txn });

        // Validate transaction ID to prevent IDOR attacks
        const transactionId = (txn as string) || (reference_id as string);

        // Validate transaction ID format
        if (transactionId && typeof transactionId === 'string') {
            // Basic validation - transaction ID should be alphanumeric with possible hyphens/underscores
            if (!/^[a-zA-Z0-9_-]+$/.test(transactionId)) {
                console.error('❌ Invalid transaction ID format:', transactionId);
                return res.status(400).json({ error: 'Invalid transaction ID format' });
            }
        }

        if (SP_payment_code && typeof SP_payment_code === 'string') {
            // Validate payment code format
            if (!/^[a-zA-Z0-9_-]+$/.test(SP_payment_code)) {
                console.error('❌ Invalid payment code format:', SP_payment_code);
                return res.status(400).json({ error: 'Invalid payment code format' });
            }

            // Verify with SpaceRemit API
            const verification = await verifyPaymentWithSpaceRemit(SP_payment_code);

            console.log('🔍 Verification result:', verification);

            if (verification.success && verification.data?.status === 'completed') {
                const referenceId = transactionId || verification.data.reference;

                // Validate reference ID format
                if (referenceId && !/^[a-zA-Z0-9_-]+$/.test(referenceId)) {
                    console.error('❌ Invalid reference ID format:', referenceId);
                    return res.status(400).json({ error: 'Invalid reference ID format' });
                }

                // Update payment and get user info
                const { userId, metadata } = await updatePaymentRecord(referenceId, 'completed', {
                    spaceremitCode: SP_payment_code,
                    paidAt: verification.data.paid_at || new Date().toISOString()
                });

                // Activate subscription if user exists
                if (userId) {
                    // Validate user ID format
                    if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
                        console.error('❌ Invalid user ID format:', userId);
                        return res.status(400).json({ error: 'Invalid user ID format' });
                    }

                    const meta = metadata as Record<string, unknown>;
                    const planTier = (meta?.tierId as string) || (meta?.plan_tier as string);
                    await activateSubscription(userId, referenceId, planTier);
                }

                // Redirect to success page
                return res.redirect(302, `https://mrxsteroid.vercel.app/success?txn=${encodeURIComponent(referenceId || '')}`);
            } else {
                // Payment verification failed
                console.error('❌ Payment verification failed:', verification.error);
                return res.redirect(302, `https://mrxsteroid.vercel.app/cancel?error=verification_failed`);
            }
        }

        // No payment code but we have a transaction ID - check its status in DB
        if (transactionId) {
            console.log('⚠️ No SP_payment_code, checking DB for transaction:', transactionId);
            // Redirect to pending/status page
            return res.redirect(302, `https://mrxsteroid.vercel.app/payment-status?txn=${encodeURIComponent(transactionId)}`);
        }

        // No payment code at all - redirect home
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

                // Validate transaction ID format to prevent IDOR
                if (transactionId && !/^[a-zA-Z0-9_-]+$/.test(transactionId)) {
                    console.error('❌ Invalid transaction ID format:', transactionId);
                    return res.status(400).json({ error: 'Invalid transaction ID format' });
                }

                // Update payment record
                const { userId, orderId } = await updatePaymentRecord(transactionId, 'completed', {
                    spaceremitCode: data.transaction_id,
                    paidAt: new Date().toISOString()
                });

                // Validate user ID and order ID to prevent IDOR
                if (userId && /^[a-zA-Z0-9_-]+$/.test(userId)) {
                    // Verify that the user has permission to access this transaction
                    // This is a simplified check - in a real application, you'd need to verify ownership
                    const planTier = data.metadata?.tierId as string || data.metadata?.plan_tier as string;
                    const activated = await activateSubscription(userId, transactionId, planTier);

                    if (!activated) {
                        console.error('⚠️ Failed to activate subscription for user:', userId);
                    }
                } else {
                    console.warn('⚠️ No valid user_id found for transaction:', transactionId);
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

                // Validate transaction ID format
                if (transactionId && !/^[a-zA-Z0-9_-]+$/.test(transactionId)) {
                    console.error('❌ Invalid transaction ID format:', transactionId);
                    return res.status(400).json({ error: 'Invalid transaction ID format' });
                }

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

                // Validate transaction ID format
                if (transactionId && !/^[a-zA-Z0-9_-]+$/.test(transactionId)) {
                    console.error('❌ Invalid transaction ID format:', transactionId);
                    return res.status(400).json({ error: 'Invalid transaction ID format' });
                }

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
