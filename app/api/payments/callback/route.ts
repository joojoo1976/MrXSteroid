/**
 * Route Handler — /api/payments/callback
 * Multi-gateway callback handler (GET redirect callbacks + POST webhooks).
 * Adapted from the legacy Vercel serverless function to the App Router.
 */
import { createClient } from '@supabase/supabase-js';
import { PaymentFactory } from '../../../../api/payments/gateways/PaymentFactory';
import { verifyPaidAmount } from '../../../../api/payments/verifyPaidAmount';

const CONFIG = {
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

const APP_BASE = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://mrxsteroid.vercel.app';

const getSupabaseAdmin = () => {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing Supabase configuration');
    }
    return createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
};

const json = (body: unknown, status = 200): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

const redirect = (url: string): Response =>
    new Response(null, { status: 302, headers: { Location: url } });

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

async function activateSubscription(invoiceId: string, externalRefId?: string): Promise<boolean> {
    const supabase = getSupabaseAdmin();
    try {
        const { data: invoice, error: fetchError } = await supabase
            .from('invoices')
            .select('user_id, tier_id')
            .eq('id', invoiceId)
            .single();
        if (fetchError || !invoice) {
            console.error('❌ [Activate] Invoice not found:', invoiceId, fetchError);
            return false;
        }

        await supabase
            .from('invoices')
            .update({
                status: 'success',
                gateway_reference_id: externalRefId || undefined,
                updated_at: new Date().toISOString(),
            })
            .eq('id', invoiceId);

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                subscription_tier: invoice.tier_id,
                subscription_status: 'active',
                has_paid: true,
                plan_tier: invoice.tier_id,
            })
            .eq('id', invoice.user_id);

        if (profileError) {
            console.error('❌ [Activate] Failed to update profile:', profileError);
            return false;
        }

        console.log(`✅ [Activate] Subscription activated — User: ${invoice.user_id}, Tier: ${invoice.tier_id}`);
        return true;
    } catch (error) {
        console.error('❌ [Activate] Unexpected error:', error);
        return false;
    }
}

async function markInvoiceFailed(invoiceId: string, errorMessage?: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    try {
        await supabase
            .from('invoices')
            .update({ status: 'failed', updated_at: new Date().toISOString() })
            .eq('id', invoiceId);
        console.log(`❌ [Callback] Invoice marked as failed: ${invoiceId}, reason: ${errorMessage || 'unknown'}`);
    } catch (error) {
        console.error('❌ [Callback] Failed to mark invoice as failed:', error);
    }
}

/**
 * Normalize a Web Fetch Request into the `{ headers, query }` shape that
 * PaymentFactory.detectGatewayFromRequest and the gateway verifiers consume.
 */
function normalizeRequest(req: Request): { headers: Record<string, string>; query: Record<string, string> } {
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
    });

    const query: Record<string, string> = {};
    try {
        const url = new URL(req.url || 'http://localhost');
        url.searchParams.forEach((value, key) => {
            query[key] = value;
        });
    } catch {
        // Ignore malformed URLs
    }

    return { headers, query };
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const invoiceId = url.searchParams.get('txn') || url.searchParams.get('reference_id') || '';

        console.log(`📥 [Callback:GET] Invoice: ${invoiceId}, Query: ${url.search}`);

        if (invoiceId && (await isAlreadyProcessed(invoiceId))) {
            return redirect(`${APP_BASE}/success?txn=${encodeURIComponent(invoiceId)}`);
        }

        const normalized = normalizeRequest(req);
        const gateway = PaymentFactory.detectGatewayFromRequest(normalized);
        const gatewayName = gateway.getGatewayName();

        const rawBody = '';
        const verification = await gateway.verifyWebhook(
            { headers: normalized.headers, query: normalized.query } as unknown as import('@vercel/node').VercelRequest,
            rawBody,
        );

        const resolvedInvoiceId = verification.invoiceId || invoiceId;

        if (verification.valid && verification.status === 'success' && resolvedInvoiceId) {
            await activateSubscription(resolvedInvoiceId, verification.externalReferenceId);
            return redirect(`${APP_BASE}/success?txn=${encodeURIComponent(resolvedInvoiceId)}`);
        }

        if (resolvedInvoiceId) {
            await markInvoiceFailed(resolvedInvoiceId, verification.errorMessage);
            return redirect(`${APP_BASE}/cancel?error=verification_failed`);
        }

        console.log(`🏭 [Callback:GET] Gateway detected: ${gatewayName}`);
        return redirect(`${APP_BASE}/`);
    } catch (error) {
        console.error('❌ [Callback] Unhandled error:', error);
        return redirect(`${APP_BASE}/`);
    }
}

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const normalized = normalizeRequest(req);
        const gateway = PaymentFactory.detectGatewayFromRequest(normalized);
        const gatewayName = gateway.getGatewayName();

        console.log(`📥 [Callback:POST] ${gatewayName} webhook, body length: ${rawBody.length}`);

        const verification = await gateway.verifyWebhook(
            { headers: normalized.headers, query: normalized.query } as unknown as import('@vercel/node').VercelRequest,
            rawBody,
        );

        if (!verification.valid) {
            console.error(`❌ [Callback] ${gatewayName} webhook verification failed:`, verification.errorMessage);
            return json({ error: 'Invalid webhook signature' }, 401);
        }

        const invoiceId = verification.invoiceId;

        if (!verification.status || !invoiceId) {
            return json({ success: true, message: 'Event acknowledged' });
        }

        if (await isAlreadyProcessed(invoiceId)) {
            return json({ success: true, message: 'Already processed (idempotent)' });
        }

        if (verification.status === 'success') {
            const amountCheck = await verifyPaidAmount(invoiceId, verification.paidAmount);
            if (!amountCheck.ok) {
                console.error(`❌ [Callback] Amount verification failed for ${invoiceId} — not activating.`);
                await markInvoiceFailed(invoiceId, `Amount mismatch — paid ${amountCheck.paid} vs expected ${amountCheck.expected}`);
                return json({ success: true, message: 'Amount mismatch — payment not activated', invoiceId });
            }

            const activated = await activateSubscription(invoiceId, verification.externalReferenceId);
            return json({
                success: true,
                message: activated ? 'Payment processed successfully' : 'Payment recorded but activation failed',
                invoiceId,
            });
        }

        if (verification.status === 'failed') {
            await markInvoiceFailed(invoiceId, verification.errorMessage);
            return json({ success: true, message: 'Payment failure recorded', invoiceId });
        }

        return json({ success: true, message: 'Event acknowledged' });
    } catch (error) {
        console.error('❌ [Callback] Unhandled error:', error);
        return json({ error: 'Internal server error', message: (error as Error).message }, 500);
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-spaceremit-signature, stripe-signature, hmac',
        },
    });
}
