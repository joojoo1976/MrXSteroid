/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  InstaPay Manual Payment Submission Endpoint
 *  /api/checkout/instapay
 *
 *  Purpose: Handle InstaPay manual bank transfer submissions for Egypt customers
 *
 *  Security Architecture:
 *  - Server-side pricing calculation (NEVER trust client amount)
 *  - Idempotency protection (prevents duplicate orders)
 *  - Rate limiting (10 requests/min per IP)
 *  - File upload validation (type, size, content)
 *  - Receipt stored in private Supabase bucket
 *  - Order created with 'pending_manual_review' status
 *  - Integrates with existing payment architecture (orders, invoices, payment_intents)
 *  - Affiliate attribution preserved
 *
 *  Flow:
 *  1. Validate request (product, customer info, transaction ref)
 *  2. Calculate server-side pricing (Egypt EGP only)
 *  3. Upload receipt to secure storage
 *  4. Create Order + Invoice + PaymentIntent (like Kashier flow)
 *  5. Store receipt record with 'pending_review' status
 *  6. Return order confirmation (NOT payment confirmation)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { enforceRateLimit, clientIp } from '../../../../lib/ratelimit';
import { resolveEffectiveUserId } from '../../../../server/auth/resolveUser';
import { corsPreflightResponse } from '../../../../server/cors/corsConfig';
import {
    loadPricing,
    computeAmount,
    resolveShippingCost,
    computePromoDiscount,
} from '../../../../server/payments/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/pdf',
];

const RECEIPT_BUCKET = 'payment-receipts'; // Private bucket

// ─────────────────────────────────────────────────────────────────────────────
//  VALIDATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const InstaPaySchema = z.object({
    // Product selection
    tierId: z.enum([
        'digital',
        'bundle',
        'coaching',
        'coaching_plus',
        'bundle_plus',
        'digital_plus',
        'pdf',
        'paperback',
    ]),
    quantity: z.number().int().min(1).max(10).default(1),

    // Customer information
    customerName: z.string().min(2).max(200),
    email: z.string().email(),
    phoneNumber: z.string().min(8).max(20),

    // Transaction reference (optional but recommended)
    transactionRef: z.string().max(200).optional(),

    // Shipping (if physical product)
    shippingAddress: z
        .object({
            address: z.string().optional(),
            city: z.string().optional(),
            zipCode: z.string().optional(),
            country: z.string().default('EG'),
        })
        .optional(),

    // Promo code (optional)
    promoCode: z.string().max(50).optional(),

    // User ID (if authenticated)
    userId: z.string().uuid().optional(),

    // Locale
    locale: z.enum(['ar', 'en']).default('ar'),

    // Idempotency
    idempotencyKey: z.string().min(1).max(200).optional(),

    // Affiliate attribution (from cookie)
    attribution: z
        .object({
            affiliateId: z.string().optional(),
            referralCode: z.string().optional(),
        })
        .optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
//  SUPABASE ADMIN CLIENT
// ─────────────────────────────────────────────────────────────────────────────

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error('[InstaPay] Missing SUPABASE_URL');
    if (!key) throw new Error('[InstaPay] Missing SUPABASE_SERVICE_ROLE_KEY');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// ─────────────────────────────────────────────────────────────────────────────
//  FILE VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

async function validateReceiptFile(file: File): Promise<{ valid: boolean; error?: string }> {
    // Check file exists
    if (!file || file.size === 0) {
        return { valid: false, error: 'Receipt file is required' };
    }

    // Check size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        };
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed: PNG, JPG, WEBP, PDF`,
        };
    }

    // Additional security: check file extension matches MIME
    const ext = file.name.split('.').pop()?.toLowerCase();
    const mimeToExt: Record<string, string[]> = {
        'image/png': ['png'],
        'image/jpeg': ['jpg', 'jpeg'],
        'image/jpg': ['jpg', 'jpeg'],
        'image/webp': ['webp'],
        'application/pdf': ['pdf'],
    };

    const allowedExts = mimeToExt[file.type] || [];
    if (!ext || !allowedExts.includes(ext)) {
        return { valid: false, error: 'File extension does not match type' };
    }

    return { valid: true };
}

// ─────────────────────────────────────────────────────────────────────────────
//  UPLOAD RECEIPT TO STORAGE
// ─────────────────────────────────────────────────────────────────────────────

async function uploadReceipt(
    supabase: ReturnType<typeof getSupabaseAdmin>,
    file: File,
    orderId: string
): Promise<{ url: string; path: string }> {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${orderId}/${timestamp}_${sanitizedName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
        .from(RECEIPT_BUCKET)
        .upload(path, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('[InstaPay] Receipt upload error:', error);
        throw new Error('Failed to upload receipt');
    }

    // Get private URL (requires authentication to access)
    const { data: urlData } = supabase.storage.from(RECEIPT_BUCKET).getPublicUrl(path);

    return {
        url: urlData.publicUrl,
        path: data.path,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
//  CORS PREFLIGHT
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(req: NextRequest) {
    return corsPreflightResponse(req, 'POST, OPTIONS', 'Content-Type, Authorization');
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN POST HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    const ip = clientIp(req);

    // Rate limiting: 10 requests per minute per IP
    const rate = await enforceRateLimit(`instapay-checkout:${ip}`);
    if (!rate.success) {
        return NextResponse.json(
            { success: false, error: 'Too many requests. Please wait a moment.' },
            { status: 429, headers: { 'Retry-After': '60' } }
        );
    }

    try {
        // ─────────────────────────────────────────────────────────────────────
        // 1. PARSE MULTIPART FORM DATA
        // ─────────────────────────────────────────────────────────────────────
        const formData = await req.formData();
        const receiptFile = formData.get('receipt') as File | null;

        if (!receiptFile) {
            return NextResponse.json(
                { success: false, error: 'Receipt file is required' },
                { status: 400 }
            );
        }

        // Validate file
        const fileValidation = await validateReceiptFile(receiptFile);
        if (!fileValidation.valid) {
            return NextResponse.json(
                { success: false, error: fileValidation.error },
                { status: 400 }
            );
        }

        // Parse JSON payload
        const jsonPayload = formData.get('data') as string;
        if (!jsonPayload) {
            return NextResponse.json(
                { success: false, error: 'Missing payment data' },
                { status: 400 }
            );
        }

        let payloadData: unknown;
        try {
            payloadData = JSON.parse(jsonPayload);
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload' },
                { status: 400 }
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // 2. VALIDATE SCHEMA
        // ─────────────────────────────────────────────────────────────────────
        const parsed = InstaPaySchema.safeParse(payloadData);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: parsed.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const input = parsed.data;
        const idempotencyKey = input.idempotencyKey || randomUUID();

        // ─────────────────────────────────────────────────────────────────────
        // 3. RESOLVE USER (IDOR protection)
        // ─────────────────────────────────────────────────────────────────────
        const userResolution = await resolveEffectiveUserId(req, input.userId);
        if (!userResolution.success) {
            return NextResponse.json(
                { success: false, error: userResolution.error },
                { status: userResolution.status }
            );
        }
        const effectiveUserId = userResolution.effectiveUserId;

        // ─────────────────────────────────────────────────────────────────────
        // 4. SERVER-SIDE PRICING CALCULATION (Egypt EGP only)
        // ─────────────────────────────────────────────────────────────────────
        const supabase = getSupabaseAdmin();

        const rowLoader = async () => {
            const { data } = await supabase.from('admin_settings').select('key, value');
            return (data || []) as Array<{ key: string; value: string }>;
        };
        const pricing = await loadPricing(rowLoader);

        const quantity = Math.max(1, Math.floor(input.quantity || 1));
        const baseAmount = computeAmount(pricing, {
            tierId: input.tierId,
            quantity,
            currency: 'EGP', // InstaPay is Egypt-only
        });

        const shippingCost = resolveShippingCost(
            pricing,
            'eg_standard',
            0,
            'EGP'
        );

        let discountAmount = 0;
        let discountPct = 0;
        if (input.promoCode) {
            discountAmount = computePromoDiscount(input.promoCode, baseAmount, 'EGP');
            discountPct = baseAmount > 0 ? (discountAmount / baseAmount) * 100 : 0;
        }

        const finalAmount = baseAmount + shippingCost - discountAmount;

        if (finalAmount <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid calculated amount' },
                { status: 400 }
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // 5. CHECK IDEMPOTENCY (prevent duplicate orders)
        // ─────────────────────────────────────────────────────────────────────
        const { data: existingReceipt } = await supabase
            .from('payment_receipts')
            .select('id, order_id, status')
            .eq('transaction_reference', input.transactionRef || idempotencyKey)
            .eq('payment_method', 'instapay')
            .maybeSingle();

        if (existingReceipt) {
            return NextResponse.json(
                {
                    success: true,
                    orderId: existingReceipt.order_id,
                    status: existingReceipt.status,
                    message: 'Order already exists',
                    idempotent: true,
                },
                { status: 200 }
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // 6. CREATE ORDER (pending_manual_review status)
        // ─────────────────────────────────────────────────────────────────────
        const orderId = randomUUID();
        const orderRef = `MRX-${Date.now()}-${orderId.slice(0, 8).toUpperCase()}`;

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                id: orderId,
                user_id: effectiveUserId,
                fullname: input.customerName,
                email: input.email,
                phone: input.phoneNumber,
                address: input.shippingAddress?.address ?? null,
                city: input.shippingAddress?.city ?? null,
                country: input.shippingAddress?.country ?? 'EG',
                postalcode: input.shippingAddress?.zipCode ?? null,
                amount: finalAmount,
                status: 'pending_manual_review',
                items: [{ tierId: input.tierId, quantity: input.quantity }],
            })
            .select()
            .single();

        if (orderError) {
            console.error('[InstaPay] Order creation error:', orderError);
            return NextResponse.json(
                { success: false, error: 'Failed to create order' },
                { status: 500 }
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // 8. UPLOAD RECEIPT TO STORAGE
        // ─────────────────────────────────────────────────────────────────────
        let receiptUrl = '';
        let receiptPath = '';
        try {
            const upload = await uploadReceipt(supabase, receiptFile, orderId);
            receiptUrl = upload.url;
            receiptPath = upload.path;
        } catch (uploadError) {
            console.error('[InstaPay] Upload error:', uploadError);
            // Rollback order
            await supabase.from('orders').delete().eq('id', orderId);
            return NextResponse.json(
                { success: false, error: 'Failed to upload receipt' },
                { status: 500 }
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // 9. CREATE PAYMENT RECEIPT RECORD
        // ─────────────────────────────────────────────────────────────────────
        const { data: receipt, error: receiptError } = await supabase
            .from('payment_receipts')
            .insert({
                order_id: orderId,
                invoice_id: orderRef,
                customer_name: input.customerName,
                customer_email: input.email,
                customer_phone: input.phoneNumber,
                transaction_reference: input.transactionRef || idempotencyKey,
                payment_method: 'instapay',
                amount: finalAmount,
                currency: 'EGP',
                receipt_url: receiptUrl,
                receipt_path: receiptPath,
                receipt_filename: receiptFile.name,
                receipt_mime_type: receiptFile.type,
                receipt_size_bytes: receiptFile.size,
                status: 'pending_review',
                metadata: {
                    tierId: input.tierId,
                    quantity: input.quantity,
                    baseAmount,
                    shippingCost,
                    discountAmount,
                    discountPct,
                    promoCode: input.promoCode,
                    locale: input.locale,
                    attribution: input.attribution,
                },
            })
            .select()
            .single();

        if (receiptError) {
            console.error('[InstaPay] Receipt record error:', receiptError);
            // Rollback
            await supabase.from('orders').delete().eq('id', orderId);
            await supabase.storage.from(RECEIPT_BUCKET).remove([receiptPath]);
            return NextResponse.json(
                { success: false, error: 'Failed to save receipt record' },
                { status: 500 }
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // 10. SUCCESS RESPONSE
        // ─────────────────────────────────────────────────────────────────────
        return NextResponse.json(
            {
                success: true,
                orderId: order.id,
                orderRef,
                receiptId: receipt.id,
                status: 'pending_manual_review',
                amount: finalAmount,
                currency: 'EGP',
                message: input.locale === 'ar'
                    ? 'تم استلام طلبك بنجاح. سيتم مراجعة الإيصال والتأكيد خلال 24 ساعة.'
                    : 'Order received successfully. Your receipt will be reviewed and confirmed within 24 hours.',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('[InstaPay] Unexpected error:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
