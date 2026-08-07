/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  🔐 MR. X STEROID — MULTI-GATEWAY WEBHOOK/CALLBACK HANDLER              ║
 * ║  Vercel Serverless Function — Idempotent Payment Processing              ║
 * ║  Route: /api/payments/callback                                           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { PaymentFactory } from './gateways/PaymentFactory.js';
import { verifyPaidAmount } from './verifyPaidAmount.js';

// ═══════════════════════════════════════════════════════════════════════════
//                         ENVIRONMENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    SPACEREMIT_SECRET_KEY: process.env.SPACEREMIT_SECRET_KEY || '',
};

const getSupabaseAdmin = () => {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing Supabase configuration');
    }
    return createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
};

// ═══════════════════════════════════════════════════════════════════════════
//                         IDEMPOTENCY CHECK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if an invoice has already been processed (idempotency guard).
 * Returns true if already processed — caller should halt execution.
 */
async function isAlreadyProcessed(invoiceId: string): Promise<boolean> {
    if (!invoiceId) return false;

    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('invoices')
            .select('status')
            .eq('id', invoiceId)
            .single();

        if (error || !data) return false;

        if (data.status === 'success') {
            console.log(`⚡ [Idempotency] Invoice ${invoiceId} already processed — skipping.`);
            return true;
        }

        return false;
    } catch {
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//                      ACTIVATE SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Update invoice status and user subscription tier upon successful payment
 */
async function activateSubscription(invoiceId: string, externalRefId?: string): Promise<boolean> {
    const supabase = getSupabaseAdmin();

    try {
        // 1. Get the invoice details
        const { data: invoice, error: fetchError } = await supabase
            .from('invoices')
            .select('user_id, tier_id, amount, currency, gateway')
            .eq('id', invoiceId)
            .single();

        if (fetchError || !invoice) {
            console.error('❌ [Activate] Invoice not found:', invoiceId, fetchError);
            return false;
        }

        // 2. Update invoice status to 'success'
        const { error: updateInvoiceError } = await supabase
            .from('invoices')
            .update({
                status: 'success',
                gateway_reference_id: externalRefId || undefined,
                updated_at: new Date().toISOString(),
            })
            .eq('id', invoiceId);

        if (updateInvoiceError) {
            console.error('❌ [Activate] Failed to update invoice:', updateInvoiceError);
            return false;
        }

        // 3. Update profiles.subscription_tier and subscription_status
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                subscription_tier: invoice.tier_id, // 'pdf' or 'paperback'
                subscription_status: 'active',
                has_paid: true,
                plan_tier: invoice.tier_id,
            })
            .eq('id', invoice.user_id);

        if (profileError) {
            console.error('❌ [Activate] Failed to update profile:', profileError);
            return false;
        }

        console.log(`✅ [Activate] Subscription activated — User: ${invoice.user_id}, Tier: ${invoice.tier_id}, Gateway: ${invoice.gateway}`);
        return true;

    } catch (error) {
        console.error('❌ [Activate] Unexpected error:', error);
        return false;
    }
}

/**
 * Mark invoice as failed
 */
async function markInvoiceFailed(invoiceId: string, errorMessage?: string): Promise<void> {
    const supabase = getSupabaseAdmin();

    try {
        await supabase
            .from('invoices')
            .update({
                status: 'failed',
                updated_at: new Date().toISOString(),
            })
            .eq('id', invoiceId);

        console.log(`❌ [Callback] Invoice marked as failed: ${invoiceId}, reason: ${errorMessage || 'unknown'}`);
    } catch (error) {
        console.error('❌ [Callback] Failed to mark invoice as failed:', error);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//                           MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // ─── CORS ────────────────────────────────────────────────────────────
    res.setHeader('Access-Control-Allow-Origin', 'https://mrxsteroid.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-spaceremit-signature, stripe-signature, hmac');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    console.log(`📥 [Callback] ${req.method} request received`);

    // ─── DETECT GATEWAY ──────────────────────────────────────────────────
    const gateway = PaymentFactory.detectGatewayFromRequest(req);
    const gatewayName = gateway.getGatewayName();

    console.log(`🏭 [Callback] Gateway detected: ${gatewayName}`);

    // ─── HANDLE GET REQUEST (Redirect callbacks — SpaceRemit/Paymob) ───
    if (req.method === 'GET') {
        const invoiceId = (req.query?.txn as string) || (req.query?.reference_id as string);

        console.log(`📥 [Callback:GET] Invoice: ${invoiceId}, Query:`, req.query);

        // Idempotency check
        if (invoiceId && await isAlreadyProcessed(invoiceId)) {
            return res.redirect(302, `https://mrxsteroid.vercel.app/success?txn=${encodeURIComponent(invoiceId)}`);
        }

        // Verify with the gateway
        const rawBody = JSON.stringify(req.body || {});
        const verification = await gateway.verifyWebhook(req, rawBody);

        const resolvedInvoiceId = verification.invoiceId || invoiceId;

        if (verification.valid && verification.status === 'success' && resolvedInvoiceId) {
            await activateSubscription(resolvedInvoiceId, verification.externalReferenceId);
            return res.redirect(302, `https://mrxsteroid.vercel.app/success?txn=${encodeURIComponent(resolvedInvoiceId)}`);
        } else if (resolvedInvoiceId) {
            await markInvoiceFailed(resolvedInvoiceId, verification.errorMessage);
            return res.redirect(302, `https://mrxsteroid.vercel.app/cancel?error=verification_failed`);
        }

        // No invoice ID at all — redirect home
        return res.redirect(302, 'https://mrxsteroid.vercel.app/');
    }

    // ─── HANDLE POST REQUEST (Webhook notifications) ─────────────────────
    if (req.method === 'POST') {
        try {
            const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

            console.log(`📥 [Callback:POST] ${gatewayName} webhook, body length: ${rawBody.length}`);

            // Verify webhook signature
            const verification = await gateway.verifyWebhook(req, rawBody);

            if (!verification.valid) {
                console.error(`❌ [Callback] ${gatewayName} webhook verification failed:`, verification.errorMessage);
                return res.status(401).json({ error: 'Invalid webhook signature' });
            }

            const invoiceId = verification.invoiceId;

            // No action needed (e.g., unhandled Stripe event type)
            if (!verification.status || !invoiceId) {
                return res.status(200).json({ success: true, message: 'Event acknowledged' });
            }

            // Idempotency check
            if (await isAlreadyProcessed(invoiceId)) {
                return res.status(200).json({ success: true, message: 'Already processed (idempotent)' });
            }

            // Process based on status
            if (verification.status === 'success') {
                // Defense-in-depth: never activate on a mismatched charge.
                const amountCheck = await verifyPaidAmount(invoiceId, verification.paidAmount);
                if (!amountCheck.ok) {
                    console.error(`❌ [Callback] Amount verification failed for ${invoiceId} — not activating.`);
                    await markInvoiceFailed(invoiceId, `Amount mismatch — paid ${amountCheck.paid} vs expected ${amountCheck.expected}`);
                    return res.status(200).json({
                        success: true,
                        message: 'Amount mismatch — payment not activated',
                        invoiceId,
                    });
                }

                const activated = await activateSubscription(invoiceId, verification.externalReferenceId);
                return res.status(200).json({
                    success: true,
                    message: activated ? 'Payment processed successfully' : 'Payment recorded but activation failed',
                    invoiceId,
                });
            }

            if (verification.status === 'failed') {
                await markInvoiceFailed(invoiceId, verification.errorMessage);
                return res.status(200).json({
                    success: true,
                    message: 'Payment failure recorded',
                    invoiceId,
                });
            }

            return res.status(200).json({ success: true, message: 'Event acknowledged' });

        } catch (error) {
            console.error('❌ [Callback] Unhandled error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: (error as Error).message,
            });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
