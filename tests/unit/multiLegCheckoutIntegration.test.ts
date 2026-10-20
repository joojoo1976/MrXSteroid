/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  tests/unit/multiLegCheckoutIntegration.test.ts
 *
 *  End-to-End Integration Tests for Consolidated Internal Invoice and
 *  Multi-Leg Payment Flow (GAPs A, B, C, D Verification).
 *
 *  ── Terminology ──────────────────────────────────────────────────────────
 *  tierId 'digital'     → merchandise/book, routes via Fourthwall (USD)
 *  tierId 'bundle_plus' → isDirectServiceTier=true, routes via Kashier (USD)
 *  Mixed cart           → both tierIds present → isMultiLeg=true → 2 legs
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    planPaymentLegs,
    processLegVerdict,
    type PaymentLeg,
} from '../../server/payments/multiLegPaymentService';
import { applyProviderVerdict } from '../../server/payments/fulfillmentService';
import {
    createCombinedCheckoutSession,
    type CombinedCheckoutGateway,
    type CombinedCheckoutDeps,
} from '../../server/payments/checkout/combinedCheckoutSessionService';
import type { CombinedLineInput } from '../../server/payments/combinedOrder';

// ── Shared fake-Supabase factory ──────────────────────────────────────────
// Mirrors the pattern used in the existing combinedCheckoutSession.test.ts
// so that the same service code path sees the same DB abstraction.

type Row = Record<string, any>;

function createFakeSupabase(seed: {
    invoices?: Row[];
    split_rules?: Row[];
    [key: string]: Row[] | undefined;
} = {}) {
    const db: Record<string, Row[]> = {
        invoices:              seed.invoices ? [...seed.invoices] : [],
        payment_intents:       [],
        orders:                [],
        invoice_payment_legs:  [],
        profiles:              [],
        webhook_events:        [],
        admin_settings:        [],
        financial_ledger:      [],
        revenue_splits:        [],
        user_entitlements:     [],
        order_splits:          [],
        split_rules:           seed.split_rules ? [...seed.split_rules] : [],
    };
    // Any additional seed tables
    for (const [k, v] of Object.entries(seed)) {
        if (v && !db[k]) db[k] = [...v];
    }

    let idCounter = 0;
    const nextId = (t: string) =>
        t === 'invoices' || t === 'orders' || t === 'invoice_payment_legs'
            ? `11111111-1111-4111-8111-${String(++idCounter).padStart(12, '0')}`
            : `${t}-${String(++idCounter).padStart(4, '0')}`;

    function from(table: string) {
        const state = {
            mode: 'select' as 'select' | 'insert' | 'update' | 'delete' | 'upsert',
            payload:  null as any,
            filters:  {} as Record<string, any>,
            orderCol: null as string | null,
            ascending: true,
        };

        const exec = async () => {
            const rows = db[table] || (db[table] = []);

            if (state.mode === 'delete') {
                const idx = rows.findIndex((r) =>
                    Object.entries(state.filters).every(([k, v]) => r[k] === v)
                );
                if (idx >= 0) rows.splice(idx, 1);
                return { data: null, error: null };
            }

            if (state.mode === 'insert' || state.mode === 'upsert') {
                const incoming = Array.isArray(state.payload) ? state.payload : [state.payload];
                const insertedRows: Row[] = [];
                incoming.forEach((item) => {
                    const row: Row = { id: item?.id || nextId(table), metadata: {}, ...item };
                    const existingIdx = rows.findIndex((r) =>
                        r.id === row.id ||
                        (row.invoice_id && r.invoice_id === row.invoice_id && r.leg_index !== undefined && r.leg_index === row.leg_index)
                    );
                    if (existingIdx >= 0) {
                        Object.assign(rows[existingIdx], row);
                        insertedRows.push(rows[existingIdx]);
                    } else {
                        rows.push(row);
                        insertedRows.push(row);
                    }
                });
                return { data: Array.isArray(state.payload) ? insertedRows : insertedRows[0], error: null };
            }

            const matched = rows.filter((r) =>
                Object.entries(state.filters).every(([k, v]) => {
                    if (Array.isArray(v)) return v.includes(r[k]);
                    return r[k] === v;
                })
            );

            if (state.mode === 'update') {
                matched.forEach((r) => Object.assign(r, state.payload));
                return { data: state.payload, error: null };
            }

            const result = [...matched];
            if (state.orderCol) {
                const col = state.orderCol;
                const dir = state.ascending ? 1 : -1;
                result.sort((a, b) => (a[col] > b[col] ? 1 : -1) * dir);
            }
            return { data: result, error: null };
        };

        const builder: any = {
            select()                  { return builder; },
            insert(payload: any)      { state.mode = 'insert';  state.payload = payload; return builder; },
            upsert(payload: any)      { state.mode = 'upsert';  state.payload = payload; return builder; },
            update(payload: any)      { state.mode = 'update';  state.payload = payload; return builder; },
            delete()                  { state.mode = 'delete';                           return builder; },
            eq(col: string, val: any) { state.filters[col] = val;                        return builder; },
            in(col: string, v: any[]) { state.filters[col] = v;                          return builder; },
            order(col: string, opts?: { ascending?: boolean }) {
                state.orderCol = col;
                state.ascending = opts?.ascending !== false;
                return builder;
            },
            limit() { return builder; },
            async single() {
                const { data, error } = await exec();
                return { data: Array.isArray(data) ? (data[0] ?? null) : data, error };
            },
            async maybeSingle() {
                const { data, error } = await exec();
                return { data: Array.isArray(data) ? (data[0] ?? null) : data, error };
            },
            then(resolve: any, reject: any) { return exec().then(resolve, reject); },
        };
        return builder;
    }

    return { from, rpc: async () => ({ data: null, error: null }), _db: db } as any;
}

/** Minimal split rules satisfying the 85/10/5 default allocation. */
function defaultSplitRules(): Row[] {
    return [
        {
            id:                  'rule-author',
            beneficiary_id:      'owner-001',
            share_type:          'percentage',
            share_value:         85,
            priority:            1,
            is_active:           true,
            tier_id:             null,
            destination_account: 'BENEFICIARY_PAYABLE',
        },
        {
            id:                  'rule-platform',
            beneficiary_id:      null,
            share_type:          'percentage',
            share_value:         10,
            priority:            2,
            is_active:           true,
            tier_id:             null,
            destination_account: 'PLATFORM_REVENUE',
        },
        {
            id:                  'rule-reserve',
            beneficiary_id:      null,
            share_type:          'percentage',
            share_value:         5,
            priority:            3,
            is_active:           true,
            tier_id:             null,
            destination_account: 'RESERVE_FUND',
        },
    ];
}

function createFakeGateway(): CombinedCheckoutGateway {
    return {
        getGatewayName: () => 'KASHIER_EGYPT',
        createPaymentSession: async (params: any) => ({
            sessionId:  `sess-${Date.now()}`,
            sessionUrl: `https://test-api.kashier.io/s/${params.orderRef}`,
            orderId:    params.orderRef,
            amount:     params.amount,
            currency:   params.currency,
            status:     'ACTIVE',
        }),
    } as any;
}

// ── Test Suite ────────────────────────────────────────────────────────────
describe('Multi-Leg Payment Integration & Enforcement (GAP-A, GAP-B, GAP-C, GAP-D)', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        // Egypt credentials (shared mode-prefix vars)
        process.env.KASHIER_MODE                = 'test';
        process.env.KASHIER_TEST_MERCHANT_ID    = 'MID-TEST-EG';
        process.env.KASHIER_TEST_PAYMENT_API_KEY = 'test-api-key-123';
        process.env.KASHIER_TEST_SECRET_KEY     = 'test-secret-key-456';
        // Global credentials (region-specific vars)
        process.env.KASHIER_GLOBAL_MERCHANT_ID      = 'MID-TEST-GLOBAL';
        process.env.KASHIER_GLOBAL_PAYMENT_API_KEY  = 'test-api-global-123';
        process.env.KASHIER_GLOBAL_SECRET_KEY       = 'test-secret-global-456';

        // Fourthwall test credentials & product IDs
        process.env.FOURTHWALL_SHOP_ID = 'shop_test_123';
        process.env.FOURTHWALL_API_KEY = 'fw_test_key_123';
        process.env.FOURTHWALL_WEBHOOK_SECRET = 'whsec_test_secret_123';
        process.env.FOURTHWALL_STOREFRONT_TOKEN = 'ptkn_test';
        process.env.FOURTHWALL_SHOP_DOMAIN = 'mrxsteroid.fourthwall.com';
        process.env.FOURTHWALL_PRODUCT_DIGITAL_BOOK_ID = '11111111-1111-4111-8111-111111111111';
        process.env.FOURTHWALL_PRODUCT_PAPERBACK_ID = '22222222-2222-4222-8222-222222222222';
        process.env.FOURTHWALL_PRODUCT_HARDCOVER_ID = '33333333-3333-4333-8333-333333333333';
        process.env.FOURTHWALL_PRODUCT_COACHING_ID = '44444444-4444-4444-8444-444444444444';
        process.env.FOURTHWALL_PRODUCT_CONSULTATION_ID = '55555555-5555-4555-8555-555555555555';
    });

    afterEach(() => { process.env = { ...originalEnv }; });

    // ══════════════════════════════════════════════════════════════════════
    //  GAP-A & GAP-B: Mixed cart → 1 invoice, 1 order, 2 independent legs
    //
    //  tierId 'digital'      → product, NOT in isDirectServiceTier → Fourthwall leg
    //  tierId 'digital_plus' → addon, IS in isDirectServiceTier    → Kashier leg
    //  Both tierIds are in DIGITAL_TIER_IDS → non-shippable → no USD shipping error
    // ══════════════════════════════════════════════════════════════════════
    it('GAP-A & GAP-B: Mixed cart creates exactly 1 consolidated invoice, 1 order, and independent payment legs', async () => {
        const supabase = createFakeSupabase();
        const gateway  = createFakeGateway();

        const lines: CombinedLineInput[] = [
            { kind: 'product', tierId: 'digital' },       // → Fourthwall (merchandise leg)
            { kind: 'addon',   tierId: 'digital_plus' },  // → Kashier (service leg, isDirectServiceTier=true)
        ];

        const mockFwAdapter: CombinedCheckoutGateway = {
            createPaymentSession: async (params: any) => ({
                sessionId: `fw_cart_${Date.now()}`,
                sessionUrl: `https://mrxsteroid.fourthwall.com/cart/checkout?cartId=cart_test_123`,
                orderId: params.orderRef,
                amount: params.amount,
                currency: params.currency,
                status: 'ACTIVE',
            }),
        } as any;

        const mockKashierServiceAdapter: CombinedCheckoutGateway = {
            createPaymentSession: async (params: any) => ({
                sessionId: `kashier_link_${Date.now()}`,
                sessionUrl: `https://kashier.io/pay/service-link-test`,
                orderId: params.orderRef,
                amount: params.amount,
                currency: params.currency,
                status: 'ACTIVE',
            }),
        } as any;

        const deps: CombinedCheckoutDeps = {
            supabase,
            gatewayFactory: () => gateway,
            pricingRows:    async () => [],
            fourthwallAdapter: mockFwAdapter,
            kashierServiceAdapter: mockKashierServiceAdapter,
        };

        const result = await createCombinedCheckoutSession(
            { email: 'athlete@example.com', fullName: 'Global Athlete', country: 'US', lines },
            deps
        );

        // ── Core invoice / order shape ──
        expect(result.invoiceId).toBeDefined();
        expect(result.orderId).toBeDefined();
        expect(result.isMultiLeg).toBe(true);
        expect(result.paymentLegs).toBeDefined();
        expect(result.paymentLegs).toHaveLength(2);

        // ── One authoritative invoice row ──
        const savedInvoices = supabase._db.invoices;
        expect(savedInvoices).toHaveLength(1);
        expect(savedInvoices[0].id).toBe(result.invoiceId);
        expect(savedInvoices[0].status).toBe('pending');

        // ── One order row, linked to the invoice ──
        const savedOrders = supabase._db.orders;
        expect(savedOrders).toHaveLength(1);
        expect(savedOrders[0].invoice_id).toBe(result.invoiceId);

        // ── Legs stored on invoice metadata ──
        const legs = savedInvoices[0].metadata.payment_legs as PaymentLeg[];
        expect(legs).toHaveLength(2);
        const providers = legs.map((l) => l.provider).sort();
        expect(providers).toEqual(['fourthwall', 'kashier'].sort());

        // ── Legs persisted to invoice_payment_legs table ──
        const savedLegs = supabase._db.invoice_payment_legs;
        expect(savedLegs).toHaveLength(2);
        const legProviders = savedLegs.map((l: any) => l.provider).sort();
        expect(legProviders).toEqual(['fourthwall', 'kashier'].sort());

        // ── Sum of leg amounts equals invoice total ──
        const legSum = (result.paymentLegs ?? []).reduce((s, l) => s + l.amount, 0);
        expect(Math.round(legSum * 100)).toBe(Math.round(result.amount * 100));
    });

    // ══════════════════════════════════════════════════════════════════════
    //  GAP-A: Cart currency mismatch is rejected before any DB write
    // ══════════════════════════════════════════════════════════════════════
    it('GAP-A: rejects mixed cart with mismatched line currencies', () => {
        // planPaymentLegs validates per-line currency against invoice currency
        expect(() => {
            planPaymentLegs({
                invoiceId: 'inv_mismatch_001',
                region:    'GLOBAL',
                currency:  'USD',
                lines: [
                    { kind: 'product', tierId: 'digital',       quantity: 1, unitAmount: 49.99,  amount: 49.99,  shippable: false, currency: 'USD' },
                    { kind: 'addon',   tierId: 'coaching_addon', quantity: 1, unitAmount: 349.99, amount: 349.99, shippable: false, currency: 'EGP' },
                ],
            });
        }).toThrow(/Line currency mismatch/);
    });

    // ══════════════════════════════════════════════════════════════════════
    //  GAP-D (partial): Settling leg 1 only → invoice = partially_paid
    //                   Download access remains BLOCKED.
    // ══════════════════════════════════════════════════════════════════════
    it('GAP-D: Partial payment of leg 1 marks invoice as partially_paid and strictly prevents book download', async () => {
        const invoiceId = 'inv_partial_test';
        const orderId   = 'ord_partial_test';
        const userId    = 'user_partial_test';

        const initialLegs: PaymentLeg[] = [
            {
                id: `${invoiceId}_leg_0`, invoiceId, legIndex: 0,
                legType: 'merchandise', provider: 'fourthwall',
                amount: 49.99, currency: 'USD', status: 'pending',
                providerReference: 'fw_order_123',
                items: [{ tierId: 'digital', title: 'Digital Protocol', amount: 49.99 }],
            },
            {
                id: `${invoiceId}_leg_1`, invoiceId, legIndex: 1,
                legType: 'service', provider: 'kashier',
                amount: 349.99, currency: 'USD', status: 'pending',
                providerReference: 'kashier_tx_456',
                items: [{ tierId: 'bundle_plus', title: 'VIP Coaching', amount: 349.99 }],
            },
        ];

        const supabase = createFakeSupabase();
        // Fix 3 compliance: override RPC to return a proper success response
        // (leg 0 settled, leg 1 still pending → can_fulfill=false, partially_paid)
        // The RPC mock also mutates the fake DB row to mirror what real Postgres does atomically.
        supabase.rpc = async (funcName: string) => {
            if (funcName === 'settle_invoice_payment_leg') {
                // Simulate the atomic Postgres function updating payment_status
                const inv = supabase._db.invoices.find((i: any) => i.id === invoiceId);
                if (inv) inv.payment_status = 'partially_paid';
                const ord = supabase._db.orders.find((o: any) => o.invoice_id === invoiceId);
                if (ord) ord.payment_status = 'partially_paid';
                return {
                    data: {
                        success: true,
                        invoice_status: 'partially_paid',
                        can_fulfill: false,
                        idempotent: false,
                        target_leg_id: `${invoiceId}_leg_0`,
                        total_paid: 49.99,
                        invoice_amount: 399.98,
                    },
                    error: null,
                };
            }
            return { data: null, error: null };
        };
        supabase._db.invoices.push({
            id: invoiceId, customer_id: userId, user_id: userId,
            amount: 399.98, amount_cents: 39998, currency: 'USD',
            status: 'open', payment_status: 'unpaid',
            metadata: { payment_legs: initialLegs, customer_email: 'partial@example.com' },
        });
        supabase._db.orders.push({
            id: orderId, invoice_id: invoiceId, user_id: userId,
            payment_status: 'pending',
        });
        supabase._db.profiles.push({ id: userId, has_paid: false, is_vip: false });

        // Simulate Fourthwall webhook settling leg 0 only
        const result = await applyProviderVerdict({
            supabase,
            invoiceId,
            gatewayName:     'FOURTHWALL_GLOBAL',
            verdict:         { status: 'success', externalReferenceId: 'fw_order_123', paidAmount: 49.99 },
            providerEventId: 'evt_fw_123',
            providerStatus:  'succeeded',
            source:          'webhook',
        });

        expect(result.code).toBe('applied');

        // Invoice must be partially_paid (not paid)
        const inv = supabase._db.invoices.find((i: any) => i.id === invoiceId);
        expect(inv.payment_status).toBe('partially_paid');

        // Order must be partially_paid
        const ord = supabase._db.orders.find((o: any) => o.id === orderId);
        expect(ord.payment_status).toBe('partially_paid');

        // Profile has_paid must remain false → download route returns 403
        const profile = supabase._db.profiles.find((p: any) => p.id === userId);
        expect(profile.has_paid).toBe(false);

        // Symbolic download gate check
        expect(profile.has_paid === true).toBe(false);
    });

    // ══════════════════════════════════════════════════════════════════════
    //  GAP-D (full): All legs settled → invoice = paid → entitlements unlocked
    // ══════════════════════════════════════════════════════════════════════
    it('GAP-D: When all legs succeed, invoice transitions to paid and unlocks book & service entitlements', async () => {
        const invoiceId = 'inv_full_test';
        const orderId   = 'ord_full_test';
        const userId    = 'user_full_test';
        const intentId  = 'intent_full_test';

        // Leg 0 already succeeded; only leg 1 (Kashier) is pending
        const initialLegs: PaymentLeg[] = [
            {
                id: `${invoiceId}_leg_0`, invoiceId, legIndex: 0,
                legType: 'merchandise', provider: 'fourthwall',
                amount: 49.99, currency: 'USD', status: 'succeeded',
                providerReference: 'fw_order_123', paidAt: new Date().toISOString(),
                items: [{ tierId: 'digital', title: 'Digital Protocol', amount: 49.99 }],
            },
            {
                id: `${invoiceId}_leg_1`, invoiceId, legIndex: 1,
                legType: 'service', provider: 'kashier',
                amount: 349.99, currency: 'USD', status: 'pending',
                providerReference: 'kashier_tx_456',
                items: [{ tierId: 'bundle_plus', title: 'VIP Coaching', amount: 349.99 }],
            },
        ];

        // Seed with default split_rules so freezeOrderSplits can proceed
        const supabase = createFakeSupabase({ split_rules: defaultSplitRules() });
        // Fix 3 compliance: override RPC — leg 1 settling completes all legs → can_fulfill=true
        supabase.rpc = async (funcName: string) => {
            if (funcName === 'settle_invoice_payment_leg') {
                return {
                    data: {
                        success: true,
                        invoice_status: 'paid',
                        can_fulfill: true,
                        idempotent: false,
                        target_leg_id: `${invoiceId}_leg_1`,
                        total_paid: 399.98,
                        invoice_amount: 399.98,
                    },
                    error: null,
                };
            }
            return { data: null, error: null };
        };

        supabase._db.invoices.push({
            id: invoiceId, customer_id: userId, user_id: userId,
            tier_id: 'bundle',
            amount: 399.98, amount_cents: 39998, currency: 'USD',
            status: 'open', payment_status: 'partially_paid',
            metadata: { payment_legs: initialLegs, customer_email: 'full@example.com' },
        });
        supabase._db.orders.push({
            id: orderId, invoice_id: invoiceId, user_id: userId,
            payment_status: 'partially_paid',
        });
        supabase._db.profiles.push({ id: userId, has_paid: false, is_vip: false });

        // Payment intent with a pre-resolved gateway_fee_minor so §6.3 fee
        // precedence chain resolves via persistedFeeMinor (Precedence 1)
        supabase._db.payment_intents.push({
            id: intentId, invoice_id: invoiceId,
            attempt_number: 1, is_current: true,
            status: 'initiated', provider_status: 'pending',
            amount: 399.98, currency: 'USD',
            gateway_fee_minor: 100,            // satisfies §6.3 Precedence 1
        });

        // Simulate Kashier webhook settling leg 1 — this completes the order
        const result = await applyProviderVerdict({
            supabase,
            invoiceId,
            gatewayName:     'KASHIER_GLOBAL',
            verdict:         { status: 'success', externalReferenceId: 'kashier_tx_456', paidAmount: 349.99, currency: 'USD' },
            providerEventId: 'evt_kashier_456',
            providerStatus:  'succeeded',
            source:          'webhook',
        });

        expect(result.code).toBe('applied');

        // Invoice: fully paid & status=success
        const inv = supabase._db.invoices.find((i: any) => i.id === invoiceId);
        expect(inv.payment_status).toBe('paid');
        expect(inv.status).toBe('success');

        // Entitlements: has_paid=true, subscription_status=active, subscription_tier=bundle
        const profile = supabase._db.profiles.find((p: any) => p.id === userId);
        expect(profile.has_paid).toBe(true);
        expect(profile.subscription_status).toBe('active');
        expect(profile.subscription_tier).toBe('bundle');
    });

    // ══════════════════════════════════════════════════════════════════════
    //  GAP-C: Duplicate webhook delivery is idempotent (no status regression)
    // ══════════════════════════════════════════════════════════════════════
    it('GAP-C: Re-delivering a webhook for an already succeeded leg is idempotent', () => {
        const invoiceId = 'inv_dedup_test';
        const settled: PaymentLeg[] = [
            {
                id: `${invoiceId}_leg_0`, invoiceId, legIndex: 0,
                legType: 'merchandise', provider: 'fourthwall',
                amount: 49.99, currency: 'USD', status: 'succeeded',
                providerReference: 'fw_order_dup', paidAt: new Date().toISOString(),
                items: [],
            },
            {
                id: `${invoiceId}_leg_1`, invoiceId, legIndex: 1,
                legType: 'service', provider: 'kashier',
                amount: 349.99, currency: 'USD', status: 'succeeded',
                providerReference: 'kashier_tx_dup', paidAt: new Date().toISOString(),
                items: [],
            },
        ];

        // Re-apply the Fourthwall verdict on an already-succeeded leg
        const verdictResult = processLegVerdict(settled, {
            provider:          'fourthwall',
            providerReference: 'fw_order_dup',
            status:            'succeeded',
            paidAmount:        49.99,
            paidCurrency:      'USD',
        });

        expect(verdictResult.consolidatedStatus).toBe('paid');
        expect(verdictResult.canGrantEntitlement).toBe(true);
        // Target leg status must stay 'succeeded', not be reset or corrupted
        expect(verdictResult.targetLeg?.status).toBe('succeeded');
        // All legs remain succeeded
        expect(verdictResult.updatedLegs.every((l) => l.status === 'succeeded')).toBe(true);
    });

    // ══════════════════════════════════════════════════════════════════════
    //  Strict Verification: Reject Mismatched Amount or Currency on Legs
    // ══════════════════════════════════════════════════════════════════════
    it('Strictly rejects leg verdict if paid amount or currency does not match the planned leg', () => {
        const invoiceId = 'inv_mismatch_test';
        const pendingLegs: PaymentLeg[] = [
            {
                id: `${invoiceId}_leg_0`, invoiceId, legIndex: 0,
                legType: 'merchandise', provider: 'fourthwall',
                amount: 49.99, currency: 'USD', status: 'pending',
                providerReference: null, paidAt: null, items: [],
            },
            {
                id: `${invoiceId}_leg_1`, invoiceId, legIndex: 1,
                legType: 'service', provider: 'kashier',
                amount: 349.99, currency: 'USD', status: 'pending',
                providerReference: null, paidAt: null, items: [],
            },
        ];

        // 1. Amount mismatch: Attempt to settle $49.99 leg with $20.00
        const amountMismatchRes = processLegVerdict(pendingLegs, {
            provider: 'fourthwall',
            providerReference: 'fw_order_bad_amount',
            status: 'succeeded',
            paidAmount: 20.00, // Bad amount!
            paidCurrency: 'USD',
        });
        expect(amountMismatchRes.consolidatedStatus).toBe('pending');
        expect(amountMismatchRes.canGrantEntitlement).toBe(false);
        expect(amountMismatchRes.updatedLegs[0].status).toBe('pending');

        // 2. Exact amount tolerance check: 2 cents mismatch is strictly rejected
        const twoCentMismatchRes = processLegVerdict(pendingLegs, {
            provider: 'fourthwall',
            providerReference: 'fw_order_two_cents_bad',
            status: 'succeeded',
            paidAmount: 49.97, // 2 cents off!
            paidCurrency: 'USD',
        });
        expect(twoCentMismatchRes.consolidatedStatus).toBe('pending');
        expect(twoCentMismatchRes.canGrantEntitlement).toBe(false);
        expect(twoCentMismatchRes.targetLeg).toBeNull();

        // 3. Currency mismatch: Attempt to settle USD leg with EUR
        const currencyMismatchRes = processLegVerdict(pendingLegs, {
            provider: 'fourthwall',
            providerReference: 'fw_order_bad_currency',
            status: 'succeeded',
            paidAmount: 49.99,
            paidCurrency: 'EUR', // Bad currency!
        });
        expect(currencyMismatchRes.consolidatedStatus).toBe('pending');
        expect(currencyMismatchRes.canGrantEntitlement).toBe(false);
        expect(currencyMismatchRes.updatedLegs[0].status).toBe('pending');

        // 4. Missing required fields (providerReference or provider)
        const missingRefRes = processLegVerdict(pendingLegs, {
            provider: 'fourthwall',
            providerReference: '',
            status: 'succeeded',
            paidAmount: 49.99,
            paidCurrency: 'USD',
        });
        expect(missingRefRes.canGrantEntitlement).toBe(false);
        expect(missingRefRes.targetLeg).toBeNull();
        expect(missingRefRes.error).toBe('MISSING_PROVIDER_REFERENCE');
    });

    // ══════════════════════════════════════════════════════════════════════
    //  Fail-Closed Entitlement Gating When Database RPC Reports Failure
    // ══════════════════════════════════════════════════════════════════════
    it('Fail-closed: Returns unresolved and blocks entitlement when settle_invoice_payment_leg RPC fails', async () => {
        const invoiceId = 'inv_rpc_fail_test';
        const userId    = 'user_rpc_fail_test';

        const initialLegs: PaymentLeg[] = [
            {
                id: `${invoiceId}_leg_0`, invoiceId, legIndex: 0,
                legType: 'merchandise', provider: 'fourthwall',
                amount: 49.99, currency: 'USD', status: 'pending',
                providerReference: null, paidAt: null, items: [],
            },
            {
                id: `${invoiceId}_leg_1`, invoiceId, legIndex: 1,
                legType: 'service', provider: 'kashier',
                amount: 349.99, currency: 'USD', status: 'pending',
                providerReference: null, paidAt: null, items: [],
            },
        ];

        const supabase = createFakeSupabase({ split_rules: defaultSplitRules() });
        // Override rpc to simulate database failure / constraint violation
        supabase.rpc = async (funcName: string) => {
            if (funcName === 'settle_invoice_payment_leg') {
                return {
                    data: { success: false, error: 'AMOUNT_MISMATCH', message: 'Leg amount mismatch' },
                    error: null,
                };
            }
            return { data: null, error: null };
        };

        supabase._db.invoices.push({
            id: invoiceId, customer_id: userId, user_id: userId,
            tier_id: 'bundle',
            amount: 399.98, amount_cents: 39998, currency: 'USD',
            status: 'open', payment_status: 'pending',
            metadata: { payment_legs: initialLegs, customer_email: 'fail@example.com' },
        });
        supabase._db.profiles.push({ id: userId, has_paid: false, is_vip: false });

        const result = await applyProviderVerdict({
            supabase,
            invoiceId,
            gatewayName:     'FOURTHWALL',
            verdict:         { status: 'success', externalReferenceId: 'fw_ref_123', paidAmount: 49.99, currency: 'USD' },
            providerEventId: 'evt_fw_fail_1',
            providerStatus:  'succeeded',
            source:          'webhook',
        });

        // Must fail-closed with 'unresolved'
        expect(result.code).toBe('unresolved');

        // Invoice must NOT be marked paid
        const inv = supabase._db.invoices.find((i: any) => i.id === invoiceId);
        expect(inv.payment_status).not.toBe('paid');

        // Profile must NOT be activated
        const profile = supabase._db.profiles.find((p: any) => p.id === userId);
        expect(profile.has_paid).toBe(false);
    });

    // ══════════════════════════════════════════════════════════════════════
    //  Egypt EGP: Single-leg order via Kashier — zero regression
    //  Uses 'digital' tierId (non-shippable, EGP 499) so no shipping address
    //  is required — parity with EGYPT single-product digital orders.
    // ══════════════════════════════════════════════════════════════════════
    it('Egypt EGP checkout remains a single-leg order via Kashier / InstaPay without regression', async () => {
        const supabase = createFakeSupabase();
        const gateway  = createFakeGateway();

        // 'digital' tierId: EGP 499 from DEFAULT_PRICING, non-shippable
        const lines: CombinedLineInput[] = [
            { kind: 'product', tierId: 'digital' },
        ];

        const deps: CombinedCheckoutDeps = {
            supabase,
            gatewayFactory: () => gateway,
            pricingRows:    async () => [],
        };

        const result = await createCombinedCheckoutSession(
            { email: 'egyptian@example.com', fullName: 'Egyptian Athlete', country: 'EG', lines },
            deps
        );

        expect(result.invoiceId).toBeDefined();
        expect(result.isMultiLeg).toBe(false);
        expect(result.paymentLegs).toHaveLength(1);
        expect(result.paymentLegs![0].currency).toBe('EGP');
        expect(result.paymentLegs![0].provider).toBe('kashier');
        expect(result.amount).toBe(499); // canonical EGP price for 'digital'
        expect(result.currency).toBe('EGP');
    });
});

// ══════════════════════════════════════════════════════════════════════════════
//  ACCEPTANCE GAP TESTS — V3.4.1 Remediation
//  Fix 1 (P0): No stale payment_status overwrite after atomic RPC settlement
//  Fix 3 (P1): Strict Fail-Closed — all null/invalid RPC responses → unresolved
// ══════════════════════════════════════════════════════════════════════════════

describe('V3.4.1 Acceptance Gap: Fix 1 — No stale payment_status overwrite', () => {
    /**
     * Creates a fake Supabase that captures all .update() calls to invoices,
     * while serving a successful settle_invoice_payment_leg RPC response.
     */
    function createConcurrencyFakeSupabase(rpcResult: Record<string, any>) {
        const invoiceRows: any[] = [
            {
                id: 'inv_race_001',
                customer_id: 'user_race_001',
                user_id: 'user_race_001',
                tier_id: 'bundle_plus',
                amount: 399.98,
                amount_cents: 39998,
                currency: 'USD',
                status: 'open',
                payment_status: 'pending',
                metadata: {
                    customer_email: 'race@example.com',
                    payment_legs: [
                        {
                            id: 'leg_fw_001', invoiceId: 'inv_race_001', legIndex: 0,
                            legType: 'merchandise', provider: 'fourthwall',
                            amount: 49.99, currency: 'USD', status: 'pending',
                            providerReference: null, paidAt: null, items: [],
                        },
                        {
                            id: 'leg_ks_001', invoiceId: 'inv_race_001', legIndex: 1,
                            legType: 'service', provider: 'kashier',
                            amount: 349.99, currency: 'USD', status: 'pending',
                            providerReference: null, paidAt: null, items: [],
                        },
                    ],
                },
            },
        ];

        const profileRows: any[] = [{ id: 'user_race_001', has_paid: false, is_vip: false }];
        const legRows: any[] = [];
        const updatedPayloads: any[] = [];

        const db: Record<string, any[]> = {
            invoices: invoiceRows,
            profiles: profileRows,
            invoice_payment_legs: legRows,
            webhook_events: [],
            payment_intents: [],
            orders: [],
            split_rules: [],
            user_entitlements: [],
        };

        let idCtr = 0;

        function from(table: string) {
            const state: any = { mode: 'select', payload: null, filters: {} };

            const exec = async () => {
                const rows = db[table] || (db[table] = []);
                if (state.mode === 'insert' || state.mode === 'upsert') {
                    const incoming = Array.isArray(state.payload) ? state.payload : [state.payload];
                    incoming.forEach((item: any) => {
                        const row = { id: item?.id || `${table}-${++idCtr}`, ...item };
                        rows.push(row);
                    });
                    return { data: state.payload, error: null };
                }
                if (state.mode === 'update') {
                    if (table === 'invoices') updatedPayloads.push({ ...state.payload });
                    const matched = rows.filter((r: any) =>
                        Object.entries(state.filters).every(([k, v]) => r[k] === v)
                    );
                    matched.forEach((r: any) => Object.assign(r, state.payload));
                    return { data: state.payload, error: null };
                }
                const matched = rows.filter((r: any) =>
                    Object.entries(state.filters).every(([k, v]) => r[k] === v)
                );
                return { data: matched, error: null };
            };

            const builder: any = {
                select() { return builder; },
                insert(p: any) { state.mode = 'insert'; state.payload = p; return builder; },
                upsert(p: any) { state.mode = 'upsert'; state.payload = p; return builder; },
                update(p: any) { state.mode = 'update'; state.payload = p; return builder; },
                delete() { state.mode = 'delete'; return builder; },
                eq(col: string, val: any) { state.filters[col] = val; return builder; },
                in(col: string, v: any[]) { state.filters[col] = v; return builder; },
                order() { return builder; },
                limit() { return builder; },
                async single() {
                    const { data, error } = await exec();
                    return { data: Array.isArray(data) ? (data[0] ?? null) : data, error };
                },
                async maybeSingle() {
                    const { data, error } = await exec();
                    return { data: Array.isArray(data) ? (data[0] ?? null) : data, error };
                },
                then(resolve: any, reject: any) { return exec().then(resolve, reject); },
            };
            return builder;
        }

        const supabase: any = {
            from,
            rpc: async (funcName: string) => {
                if (funcName === 'settle_invoice_payment_leg') {
                    return { data: rpcResult, error: null };
                }
                return { data: null, error: null };
            },
            _db: db,
            _capturedUpdates: updatedPayloads,
        };

        return supabase;
    }

    it('Fix 1: invoices.update NEVER includes payment_status after successful RPC settlement', async () => {
        const supabase = createConcurrencyFakeSupabase({
            success: true,
            invoice_status: 'paid',
            can_fulfill: true,
            idempotent: false,
            target_leg_id: 'leg_fw_001',
            total_paid: 399.98,
            invoice_amount: 399.98,
        });

        const result = await applyProviderVerdict({
            supabase,
            invoiceId: 'inv_race_001',
            gatewayName: 'FOURTHWALL',
            verdict: {
                status: 'success',
                externalReferenceId: 'fw_ref_race_001',
                paidAmount: 49.99,
                currency: 'USD',
            },
            providerEventId: 'evt_fw_race_001',
            providerStatus: 'succeeded',
            source: 'webhook',
        });

        // RPC succeeded → must not be 'unresolved'
        expect(result.code).not.toBe('unresolved');

        // CRITICAL FIX 1 ASSERTION:
        // The stale-overwrite bug was: after a successful atomic RPC, the OLD code
        // wrote legVerdictRes.consolidatedStatus ('paid'/'partially_paid') back to
        // invoices.payment_status, potentially downgrading the DB's authoritative
        // state. Fix 1 removes that write entirely.
        // Legitimate writes: 'unknown' (§6.3 reconciliation fallback), 'failed' (error paths).
        const illegalStatuses = ['paid', 'partially_paid', 'initiated'];
        for (const updatePayload of supabase._capturedUpdates) {
            if (updatePayload.payment_status) {
                expect(illegalStatuses).not.toContain(updatePayload.payment_status);
            }
        }
    });

    it('Fix 1: Concurrent applyProviderVerdict calls — second call must not downgrade status to partially_paid', async () => {
        // Both calls with same invoice but different legs to simulate race condition.
        // The supabase mock RPC always returns 'paid' (simulating DB atomic success),
        // so neither call should write payment_status at all.
        const supabase = createConcurrencyFakeSupabase({
            success: true,
            invoice_status: 'paid',
            can_fulfill: true,
            idempotent: false,
            target_leg_id: 'leg_fw_001',
            total_paid: 399.98,
            invoice_amount: 399.98,
        });

        const verdictParams = {
            supabase,
            invoiceId: 'inv_race_001',
            gatewayName: 'FOURTHWALL',
            verdict: {
                status: 'success' as const,
                externalReferenceId: 'fw_ref_concurrent',
                paidAmount: 49.99,
                currency: 'USD',
            },
            providerEventId: 'evt_fw_concurrent',
            providerStatus: 'succeeded' as const,
            source: 'webhook' as const,
        };

        // Fire two concurrent calls
        const [r1, r2] = await Promise.all([
            applyProviderVerdict(verdictParams),
            applyProviderVerdict({ ...verdictParams, providerEventId: 'evt_fw_concurrent_2' }),
        ]);

        // Neither result should be unresolved (RPC is succeeding)
        // At least one should succeed (other may be idempotent depending on leg matching)
        const codes = [r1.code, r2.code];
        expect(codes.every(c => c !== 'amount_mismatch')).toBe(true);

        // After both calls: no update to invoices should have set payment_status
        // to a COMPUTED in-memory value (paid/partially_paid from legVerdictRes).
        // The only legitimate payment_status writes are: 'unknown' (§6.3 fallback
        // reconciliation marker) and 'failed' (on error paths).
        // The stale overwrite bug was writing 'paid' or 'partially_paid' computed
        // in-memory from legVerdictRes.consolidatedStatus AFTER a successful RPC.
        const illegalStatuses = ['paid', 'partially_paid', 'initiated'];
        for (const updatePayload of supabase._capturedUpdates) {
            if (updatePayload.payment_status) {
                expect(illegalStatuses).not.toContain(updatePayload.payment_status);
            }
        }

        // Invoice payment_status in DB should remain as-set by RPC only (we never wrote it)
        const inv = supabase._db.invoices.find((i: any) => i.id === 'inv_race_001');
        // payment_status in DB was never touched by our code (only by RPC which is external)
        expect(['pending', 'partially_paid', 'paid']).toContain(inv.payment_status);
    });
});

describe('V3.4.1 Acceptance Gap: Fix 3 — Strict Fail-Closed on all invalid RPC responses', () => {
    function baseInvoiceSetup(supabase: any) {
        supabase._db = supabase._db || {};
        supabase._db.invoices = [
            {
                id: 'inv_rpc_variant',
                customer_id: 'user_rpc_variant',
                user_id: 'user_rpc_variant',
                tier_id: 'bundle_plus',
                amount: 399.98,
                amount_cents: 39998,
                currency: 'USD',
                status: 'open',
                payment_status: 'pending',
                metadata: {
                    customer_email: 'rpc_variant@example.com',
                    payment_legs: [
                        {
                            id: 'leg_rpc_fw', invoiceId: 'inv_rpc_variant', legIndex: 0,
                            legType: 'merchandise', provider: 'fourthwall',
                            amount: 49.99, currency: 'USD', status: 'pending',
                            providerReference: null, paidAt: null, items: [],
                        },
                    ],
                },
            },
        ];
        supabase._db.profiles = [{ id: 'user_rpc_variant', has_paid: false, is_vip: false }];
        supabase._db.invoice_payment_legs = [];
        supabase._db.webhook_events = [];
        supabase._db.orders = [];
        supabase._db.split_rules = [];
    }

    async function testRpcVariant(rpcData: any, rpcError: any): Promise<string> {
        const db: Record<string, any[]> = {
            invoices: [], profiles: [], invoice_payment_legs: [],
            webhook_events: [], orders: [], split_rules: [], payment_intents: [],
            user_entitlements: [],
        };
        let idCtr = 0;

        function from(table: string) {
            const state: any = { mode: 'select', payload: null, filters: {} };
            const exec = async () => {
                const rows = db[table] || (db[table] = []);
                if (state.mode === 'insert' || state.mode === 'upsert') {
                    const incoming = Array.isArray(state.payload) ? state.payload : [state.payload];
                    incoming.forEach((item: any) => rows.push({ id: item?.id || `${table}-${++idCtr}`, ...item }));
                    return { data: state.payload, error: null };
                }
                if (state.mode === 'update') {
                    const matched = rows.filter((r: any) =>
                        Object.entries(state.filters).every(([k, v]) => r[k] === v)
                    );
                    matched.forEach((r: any) => Object.assign(r, state.payload));
                    return { data: state.payload, error: null };
                }
                const matched = rows.filter((r: any) =>
                    Object.entries(state.filters).every(([k, v]) => r[k] === v)
                );
                return { data: matched, error: null };
            };
            const builder: any = {
                select() { return builder; },
                insert(p: any) { state.mode = 'insert'; state.payload = p; return builder; },
                upsert(p: any) { state.mode = 'upsert'; state.payload = p; return builder; },
                update(p: any) { state.mode = 'update'; state.payload = p; return builder; },
                delete() { state.mode = 'delete'; return builder; },
                eq(col: string, val: any) { state.filters[col] = val; return builder; },
                in(col: string, v: any[]) { state.filters[col] = v; return builder; },
                order() { return builder; },
                limit() { return builder; },
                async single() {
                    const { data, error } = await exec();
                    return { data: Array.isArray(data) ? (data[0] ?? null) : data, error };
                },
                async maybeSingle() {
                    const { data, error } = await exec();
                    return { data: Array.isArray(data) ? (data[0] ?? null) : data, error };
                },
                then(resolve: any, reject: any) { return exec().then(resolve, reject); },
            };
            return builder;
        }

        db.invoices.push({
            id: 'inv_rpc_variant',
            customer_id: 'user_rpc_variant',
            user_id: 'user_rpc_variant',
            tier_id: 'bundle_plus',
            // Multi-leg invoice: total = 399.98 (two legs)
            // isMultiLeg is determined by paymentLegs.length > 1
            amount: 399.98,
            amount_cents: 39998,
            currency: 'USD',
            status: 'open',
            payment_status: 'pending',
            metadata: {
                customer_email: 'rpc_variant@example.com',
                payment_legs: [
                    {
                        id: 'leg_rpc_fw', invoiceId: 'inv_rpc_variant', legIndex: 0,
                        legType: 'merchandise', provider: 'fourthwall',
                        amount: 49.99, currency: 'USD', status: 'pending',
                        providerReference: null, paidAt: null, items: [],
                    },
                    {
                        id: 'leg_rpc_ks', invoiceId: 'inv_rpc_variant', legIndex: 1,
                        legType: 'service', provider: 'kashier',
                        amount: 349.99, currency: 'USD', status: 'pending',
                        providerReference: null, paidAt: null, items: [],
                    },
                ],
            },
        });
        db.profiles.push({ id: 'user_rpc_variant', has_paid: false, is_vip: false });

        const supabase: any = {
            from,
            rpc: async (funcName: string) => {
                if (funcName === 'settle_invoice_payment_leg') {
                    return { data: rpcData, error: rpcError };
                }
                return { data: null, error: null };
            },
            _db: db,
        };

        const result = await applyProviderVerdict({
            supabase,
            invoiceId: 'inv_rpc_variant',
            gatewayName: 'FOURTHWALL',
            verdict: {
                status: 'success',
                externalReferenceId: 'fw_ref_variant',
                paidAmount: 49.99,
                currency: 'USD',
            },
            providerEventId: 'evt_variant',
            providerStatus: 'succeeded',
            source: 'webhook',
        });

        return result.code;
    }

    it('Fix 3 Variant 1: { data: null, error: null } → unresolved', async () => {
        const code = await testRpcVariant(null, null);
        expect(code).toBe('unresolved');
    });

    it('Fix 3 Variant 2: { data: {}, error: null } → unresolved (missing success key)', async () => {
        const code = await testRpcVariant({}, null);
        expect(code).toBe('unresolved');
    });

    it('Fix 3 Variant 3: { data: { no_success_key: true }, error: null } → unresolved', async () => {
        const code = await testRpcVariant({ no_success_key: true }, null);
        expect(code).toBe('unresolved');
    });

    it('Fix 3 Variant 4: { data: { success: false }, error: null } → unresolved', async () => {
        const code = await testRpcVariant({ success: false, error: 'CONSTRAINT_VIOLATION' }, null);
        expect(code).toBe('unresolved');
    });

    it('Fix 3 Variant 5: { data: null, error: { message: "DB error" } } → unresolved', async () => {
        const code = await testRpcVariant(null, { message: 'DB connection error', code: 'PGRST500' });
        expect(code).toBe('unresolved');
    });

    it('Fix 3 Variant 6: { data: { success: true, invoice_status: "partially_paid", can_fulfill: false } } → applied (not grant entitlement)', async () => {
        // This is the only "happy path" variant — but entitlement should NOT be granted since can_fulfill=false
        // The result code should be 'applied' (or 'success') but NOT 'unresolved'
        // Invoice amount matches paidAmount exactly (single-leg) so verifyPaidAmount passes
        const db: Record<string, any[]> = {
            invoices: [{
                id: 'inv_rpc_variant',
                customer_id: 'user_rpc_variant',
                user_id: 'user_rpc_variant',
                tier_id: 'bundle_plus',
                // Multi-leg: 2 legs so isMultiLeg = true, RPC path is triggered
                amount: 399.98,
                amount_cents: 39998,
                currency: 'USD',
                status: 'open',
                payment_status: 'pending',
                metadata: {
                    customer_email: 'rpc_variant@example.com',
                    payment_legs: [
                        {
                            id: 'leg_rpc_fw', invoiceId: 'inv_rpc_variant', legIndex: 0,
                            legType: 'merchandise', provider: 'fourthwall',
                            amount: 49.99, currency: 'USD', status: 'pending',
                            providerReference: null, paidAt: null, items: [],
                        },
                        {
                            id: 'leg_rpc_ks', invoiceId: 'inv_rpc_variant', legIndex: 1,
                            legType: 'service', provider: 'kashier',
                            amount: 349.99, currency: 'USD', status: 'pending',
                            providerReference: null, paidAt: null, items: [],
                        },
                    ],
                },
            }],
            profiles: [{ id: 'user_rpc_variant', has_paid: false, is_vip: false }],
            invoice_payment_legs: [],
            webhook_events: [],
            orders: [],
            split_rules: [],
            payment_intents: [],
            user_entitlements: [],
        };
        let idCtr = 0;

        function from(table: string) {
            const state: any = { mode: 'select', payload: null, filters: {} };
            const exec = async () => {
                const rows = db[table] || (db[table] = []);
                if (state.mode === 'insert' || state.mode === 'upsert') {
                    const incoming = Array.isArray(state.payload) ? state.payload : [state.payload];
                    incoming.forEach((item: any) => rows.push({ id: item?.id || `${table}-${++idCtr}`, ...item }));
                    return { data: state.payload, error: null };
                }
                if (state.mode === 'update') {
                    const matched = rows.filter((r: any) =>
                        Object.entries(state.filters).every(([k, v]) => r[k] === v)
                    );
                    matched.forEach((r: any) => Object.assign(r, state.payload));
                    return { data: state.payload, error: null };
                }
                const matched = rows.filter((r: any) =>
                    Object.entries(state.filters).every(([k, v]) => r[k] === v)
                );
                return { data: matched, error: null };
            };
            const builder: any = {
                select() { return builder; },
                insert(p: any) { state.mode = 'insert'; state.payload = p; return builder; },
                upsert(p: any) { state.mode = 'upsert'; state.payload = p; return builder; },
                update(p: any) { state.mode = 'update'; state.payload = p; return builder; },
                delete() { state.mode = 'delete'; return builder; },
                eq(col: string, val: any) { state.filters[col] = val; return builder; },
                in(col: string, v: any[]) { state.filters[col] = v; return builder; },
                order() { return builder; },
                limit() { return builder; },
                async single() {
                    const { data, error } = await exec();
                    return { data: Array.isArray(data) ? (data[0] ?? null) : data, error };
                },
                async maybeSingle() {
                    const { data, error } = await exec();
                    return { data: Array.isArray(data) ? (data[0] ?? null) : data, error };
                },
                then(resolve: any, reject: any) { return exec().then(resolve, reject); },
            };
            return builder;
        }

        const supabase: any = {
            from,
            rpc: async (funcName: string) => {
                if (funcName === 'settle_invoice_payment_leg') {
                    return {
                        data: {
                            success: true,
                            invoice_status: 'partially_paid',
                            can_fulfill: false,
                            idempotent: false,
                            target_leg_id: 'leg_rpc_fw',
                            total_paid: 49.99,
                            invoice_amount: 399.98,
                        },
                        error: null,
                    };
                }
                return { data: null, error: null };
            },
            _db: db,
        };

        const result = await applyProviderVerdict({
            supabase,
            invoiceId: 'inv_rpc_variant',
            gatewayName: 'FOURTHWALL',
            verdict: {
                status: 'success',
                externalReferenceId: 'fw_ref_variant6',
                paidAmount: 49.99,
                currency: 'USD',
            },
            providerEventId: 'evt_variant6',
            providerStatus: 'succeeded',
            source: 'webhook',
        });

        // RPC succeeded (success: true) → must NOT be unresolved
        expect(result.code).not.toBe('unresolved');

        // Profile must NOT be granted entitlement since can_fulfill=false
        const profile = db.profiles.find((p: any) => p.id === 'user_rpc_variant');
        expect(profile.has_paid).toBe(false);
        expect(profile.is_vip).toBe(false);
    });
});

// ══════════════════════════════════════════════════════════════════════════════
//  POST-MERGE AUDIT REMEDIATION (PR #12 Review Tests)
//  1. P0: /api/checkout/status Authentication, Authorization & IDOR Protection
//  2. P0: Stale Overwrite Prevention & Deterministic Interleaved Webhooks
//  3. P1: Strict Payment Leg Sequencing & Downstream SessionUrl Protection
// ══════════════════════════════════════════════════════════════════════════════

describe('V3.4.1 Remediation: P0 — /api/checkout/status Authentication & IDOR Protection', () => {
    const registeredInvoiceId = '11111111-1111-4111-a111-111111111111';
    const guestInvoiceId = '22222222-2222-4222-a222-222222222222';
    const ownerUserId = 'owner_user_uuid_123';
    const attackerUserId = 'attacker_user_uuid_999';
    const guestResumeToken = 'guest_secret_resume_token_abc';
    const guestEmail = 'guest.athlete@example.com';

    function setupTestDatabase() {
        const supabase = createFakeSupabase();
        // Registered User Invoice
        supabase._db.invoices.push({
            id: registeredInvoiceId,
            user_id: ownerUserId,
            customer_email: 'owner@example.com',
            payment_status: 'pending',
            status: 'open',
            amount: 399.98,
            currency: 'USD',
            metadata: {
                payment_legs: [
                    { id: 'leg_0', legIndex: 0, status: 'pending', amount: 49.99, currency: 'USD', sessionUrl: 'https://fourthwall.com/pay1' },
                    { id: 'leg_1', legIndex: 1, status: 'pending', amount: 349.99, currency: 'USD', sessionUrl: 'https://kashier.io/pay2' },
                ],
            },
        });

        // Guest Invoice
        supabase._db.invoices.push({
            id: guestInvoiceId,
            user_id: null, // Guest
            customer_email: guestEmail,
            payment_status: 'pending',
            status: 'open',
            amount: 399.98,
            currency: 'USD',
            metadata: {
                guest_resume_token: guestResumeToken,
                payment_legs: [
                    { id: 'guest_leg_0', legIndex: 0, status: 'pending', amount: 49.99, currency: 'USD', sessionUrl: 'https://fourthwall.com/guest1' },
                    { id: 'guest_leg_1', legIndex: 1, status: 'pending', amount: 349.99, currency: 'USD', sessionUrl: 'https://kashier.io/guest2' },
                ],
            },
        });

        return supabase;
    }

    it('IDOR Guard: Anonymous request for a registered user invoice is REJECTED with 401', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');
        const supabase = setupTestDatabase();

        const req = new Request(`https://mrxsteroid.com/api/checkout/status?invoiceId=${registeredInvoiceId}`, {
            method: 'GET',
        });

        const res = await handleCheckoutStatus(req, {
            supabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('Authentication required');
    });

    it('IDOR Guard: Authenticated attacker attempting to view another user invoice is REJECTED with 403', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');
        const supabase = setupTestDatabase();

        const req = new Request(`https://mrxsteroid.com/api/checkout/status?invoiceId=${registeredInvoiceId}`, {
            method: 'GET',
            headers: { Authorization: 'Bearer attacker_jwt' },
        });

        const res = await handleCheckoutStatus(req, {
            supabase,
            getAuthUser: async () => ({ status: 'AUTHENTICATED', userId: attackerUserId }),
        });

        expect(res.status).toBe(403);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('permission');
    });

    it('Authorized: Legitimate owner accessing their own invoice succeeds with 200 and full leg details', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');
        const supabase = setupTestDatabase();

        const req = new Request(`https://mrxsteroid.com/api/checkout/status?invoiceId=${registeredInvoiceId}`, {
            method: 'GET',
            headers: { Authorization: 'Bearer owner_jwt' },
        });

        const res = await handleCheckoutStatus(req, {
            supabase,
            getAuthUser: async () => ({ status: 'AUTHENTICATED', userId: ownerUserId }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.invoiceId).toBe(registeredInvoiceId);
        expect(data.legs).toHaveLength(2);
    });

    it('Guest Security: Reading guest invoice by UUID alone without token is REJECTED with 403', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');
        const supabase = setupTestDatabase();

        const req = new Request(`https://mrxsteroid.com/api/checkout/status?invoiceId=${guestInvoiceId}`, {
            method: 'GET',
        });

        const res = await handleCheckoutStatus(req, {
            supabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        expect(res.status).toBe(403);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('x-resume-token header required');
    });

    it('Guest Security: Reading guest invoice with WRONG resume token is REJECTED with 403', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');
        const supabase = setupTestDatabase();

        const req = new Request(`https://mrxsteroid.com/api/checkout/status?invoiceId=${guestInvoiceId}`, {
            method: 'GET',
            headers: {
                'x-resume-token': 'wrong_token',
            },
        });

        const res = await handleCheckoutStatus(req, {
            supabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        expect(res.status).toBe(403);
    });

    it('Guest Security (Finding 4): Query URL token is REJECTED with 403 because token must be in request header', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');
        const supabase = setupTestDatabase();

        // Sending token in query param only, without header
        const req = new Request(`https://mrxsteroid.com/api/checkout/status?invoiceId=${guestInvoiceId}&token=${guestResumeToken}`, {
            method: 'GET',
        });

        const res = await handleCheckoutStatus(req, {
            supabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        expect(res.status).toBe(403);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('x-resume-token header required');
    });

    it('Guest Security (Finding 4): Reading guest invoice with VALID resume token in x-resume-token header SUCCEEDS with 200', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');
        const supabase = setupTestDatabase();

        const req = new Request(`https://mrxsteroid.com/api/checkout/status?invoiceId=${guestInvoiceId}`, {
            method: 'GET',
            headers: {
                'x-resume-token': guestResumeToken,
            },
        });

        const res = await handleCheckoutStatus(req, {
            supabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.invoiceId).toBe(guestInvoiceId);
        expect(data.legs).toHaveLength(2);
    });
});

describe('V3.4.1 Remediation: P1 — Strict Payment Leg Sequencing & SessionUrl Protection', () => {
    const invoiceId = '33333333-3333-4333-a333-333333333333';
    const resumeToken = 'seq_resume_token_xyz';

    it('Sequencing: While Leg 0 is pending, only Leg 0 has isPayable=true and reveals sessionUrl; Leg 1 sessionUrl is hidden', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');
        const supabase = createFakeSupabase();

        supabase._db.invoices.push({
            id: invoiceId,
            user_id: null,
            customer_email: 'seq@example.com',
            payment_status: 'pending',
            status: 'open',
            amount: 399.98,
            currency: 'USD',
            metadata: {
                guest_resume_token: resumeToken,
                payment_legs: [
                    { id: 'leg_0', legIndex: 0, status: 'pending', amount: 49.99, currency: 'USD', sessionUrl: 'https://fourthwall.com/pay_leg_0' },
                    { id: 'leg_1', legIndex: 1, status: 'pending', amount: 349.99, currency: 'USD', sessionUrl: 'https://kashier.io/pay_leg_1' },
                ],
            },
        });

        supabase._db.invoice_payment_legs.push(
            { id: 'leg_0', invoice_id: invoiceId, leg_index: 0, status: 'pending', amount: 49.99, currency: 'USD', session_url: 'https://fourthwall.com/pay_leg_0' },
            { id: 'leg_1', invoice_id: invoiceId, leg_index: 1, status: 'pending', amount: 349.99, currency: 'USD', session_url: 'https://kashier.io/pay_leg_1' }
        );

        const req = new Request(`https://mrxsteroid.com/api/checkout/status?invoiceId=${invoiceId}`, {
            method: 'GET',
            headers: {
                'x-resume-token': resumeToken,
            },
        });

        const res = await handleCheckoutStatus(req, {
            supabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.nextPendingLeg).toBeDefined();
        expect(data.nextPendingLeg.id).toBe('leg_0');

        const leg0 = data.legs.find((l: any) => l.legIndex === 0);
        const leg1 = data.legs.find((l: any) => l.legIndex === 1);

        // Leg 0 is the immediate payable leg
        expect(leg0.isPayable).toBe(true);
        expect(leg0.sessionUrl).toBe('https://fourthwall.com/pay_leg_0');

        // CRITICAL P1 ASSERTION: Leg 1 is NOT payable and its sessionUrl is locked/null
        expect(leg1.isPayable).toBe(false);
        expect(leg1.sessionUrl).toBeNull();
    });

    it('Sequencing: Once Leg 0 is succeeded, Leg 1 advances to isPayable=true and unlocks its sessionUrl', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');
        const supabase = createFakeSupabase();

        supabase._db.invoices.push({
            id: invoiceId,
            user_id: null,
            customer_email: 'seq@example.com',
            payment_status: 'partially_paid',
            status: 'open',
            amount: 399.98,
            currency: 'USD',
            metadata: {
                guest_resume_token: resumeToken,
                payment_legs: [
                    { id: 'leg_0', legIndex: 0, status: 'succeeded', amount: 49.99, currency: 'USD', sessionUrl: 'https://fourthwall.com/pay_leg_0' },
                    { id: 'leg_1', legIndex: 1, status: 'pending', amount: 349.99, currency: 'USD', sessionUrl: 'https://kashier.io/pay_leg_1' },
                ],
            },
        });

        // Authoritative DB state reflecting atomic settlement of Leg 0
        supabase._db.invoice_payment_legs.push(
            { id: 'leg_0', invoice_id: invoiceId, leg_index: 0, status: 'succeeded', amount: 49.99, currency: 'USD', session_url: 'https://fourthwall.com/pay_leg_0' },
            { id: 'leg_1', invoice_id: invoiceId, leg_index: 1, status: 'pending', amount: 349.99, currency: 'USD', session_url: 'https://kashier.io/pay_leg_1' }
        );

        const req = new Request(`https://mrxsteroid.com/api/checkout/status?invoiceId=${invoiceId}`, {
            method: 'GET',
            headers: {
                'x-resume-token': resumeToken,
            },
        });

        const res = await handleCheckoutStatus(req, {
            supabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.nextPendingLeg.id).toBe('leg_1');

        const leg0 = data.legs.find((l: any) => l.legIndex === 0);
        const leg1 = data.legs.find((l: any) => l.legIndex === 1);

        expect(leg0.status).toBe('succeeded');
        expect(leg0.isPayable).toBe(false);

        // Leg 1 is now active and unlocked
        expect(leg1.isPayable).toBe(true);
        expect(leg1.sessionUrl).toBe('https://kashier.io/pay_leg_1');
    });
});

describe('V3.4.1 Remediation: P0 — Stale Overwrite Prevention & Deterministic Interleaved Webhooks', () => {
    it('persistPaymentLegs NEVER downgrades an already succeeded leg to pending when called with a stale snapshot', async () => {
        const { persistPaymentLegs } = await import('../../server/payments/multiLegPaymentService');
        const supabase = createFakeSupabase();
        const invoiceId = 'race_interleave_inv_001';

        // 1. Initial State: Both legs in DB are pending
        supabase._db.invoice_payment_legs.push(
            {
                id: 'leg_0', invoice_id: invoiceId, leg_index: 0,
                leg_type: 'merchandise', provider: 'fourthwall',
                amount: 49.99, currency: 'USD', status: 'pending',
                provider_reference: null, actual_paid_amount: null,
            },
            {
                id: 'leg_1', invoice_id: invoiceId, leg_index: 1,
                leg_type: 'service', provider: 'kashier',
                amount: 349.99, currency: 'USD', status: 'pending',
                provider_reference: null, actual_paid_amount: null,
            }
        );

        // 2. Deterministic Interleaving Simulation:
        // Webhook B (for Leg 1) arrives and settles Leg 1 in the DB first!
        const leg1Row = supabase._db.invoice_payment_legs.find((r: any) => r.id === 'leg_1');
        leg1Row.status = 'succeeded';
        leg1Row.actual_paid_amount = 349.99;
        leg1Row.provider_reference = 'kashier_ref_winner_456';
        leg1Row.paid_at = new Date().toISOString();

        // 3. Webhook A (for Leg 0) was in-flight with an older snapshot taken BEFORE Webhook B completed.
        // In Webhook A's memory, Leg 1 is still 'pending'.
        const staleLegsSnapshot: PaymentLeg[] = [
            {
                id: 'leg_0', invoiceId, legIndex: 0,
                legType: 'merchandise', provider: 'fourthwall',
                amount: 49.99, currency: 'USD', status: 'succeeded',
                providerReference: 'fw_ref_001', actualPaidAmount: 49.99,
                paidAt: new Date().toISOString(), items: [],
            },
            {
                id: 'leg_1', invoiceId, legIndex: 1,
                legType: 'service', provider: 'kashier',
                amount: 349.99, currency: 'USD', status: 'pending', // STALE in-memory snapshot!
                providerReference: null, actualPaidAmount: null,
                paidAt: null, items: [],
            },
        ];

        // Webhook A finishes and calls persistPaymentLegs with its stale snapshot
        await persistPaymentLegs(supabase, staleLegsSnapshot);

        // 4. CRITICAL P0 ASSERTION:
        // Leg 1 in the database MUST REMAIN 'succeeded'. It must NEVER be reverted to 'pending'!
        const finalLeg1 = supabase._db.invoice_payment_legs.find((r: any) => r.id === 'leg_1');
        expect(finalLeg1.status).toBe('succeeded');
        expect(finalLeg1.provider_reference).toBe('kashier_ref_winner_456');
        expect(finalLeg1.actual_paid_amount).toBe(349.99);

        // Leg 0 was also updated to succeeded
        const finalLeg0 = supabase._db.invoice_payment_legs.find((r: any) => r.id === 'leg_0');
        expect(finalLeg0.status).toBe('succeeded');
        expect(finalLeg0.provider_reference).toBe('fw_ref_001');
    });
});

// ══════════════════════════════════════════════════════════════════════════
//  V3.4.1 Final PR #12 Remediation: Comprehensive Finding Suites
// ══════════════════════════════════════════════════════════════════════════

describe('Finding 1 — P0: Premature Session URL Exposure & Step Skipping Prevention', () => {
    beforeEach(() => {
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_GLOBAL_MERCHANT_ID = 'MID-TEST-GLOBAL';
        process.env.KASHIER_GLOBAL_PAYMENT_API_KEY = 'test-api-global-123';
        process.env.KASHIER_GLOBAL_SECRET_KEY = 'test-secret-global-456';
        process.env.FOURTHWALL_SHOP_ID = 'shop_test_123';
        process.env.FOURTHWALL_API_KEY = 'fw_test_key_123';
    });
    it('Finding 1: Initial checkout response returns downstream pending legs with sessionUrl = null and isPayable = false', async () => {
        const supabase = createFakeSupabase();
        const gateway = createFakeGateway();

        const lines: CombinedLineInput[] = [
            { kind: 'product', tierId: 'digital' },       // Fourthwall
            { kind: 'addon',   tierId: 'digital_plus' },  // Kashier
        ];

        const mockFwAdapter: CombinedCheckoutGateway = {
            createPaymentSession: async (params: any) => ({
                sessionId: 'fw_sess_initial_001',
                sessionUrl: 'https://fourthwall.com/pay/initial_001',
                orderId: params.orderRef,
                amount: params.amount,
                currency: params.currency,
                status: 'ACTIVE',
            }),
        };

        const mockKashierAdapter: CombinedCheckoutGateway = {
            createPaymentSession: async (params: any) => ({
                sessionId: 'ks_sess_initial_002',
                sessionUrl: 'https://kashier.io/pay/initial_002',
                orderId: params.orderRef,
                amount: params.amount,
                currency: params.currency,
                status: 'ACTIVE',
            }),
        };

        const result = await createCombinedCheckoutSession(
            { email: 'buyer@example.com', fullName: 'Leg Tester', country: 'US', lines },
            {
                supabase,
                gatewayFactory: () => gateway,
                pricingRows: async () => [],
                fourthwallAdapter: mockFwAdapter,
                kashierServiceAdapter: mockKashierAdapter,
            }
        );

        expect(result.isMultiLeg).toBe(true);
        expect(result.paymentLegs).toHaveLength(2);

        const leg0 = result.paymentLegs![0];
        const leg1 = result.paymentLegs![1];

        // Leg 0 is the immediate payable leg
        expect(leg0.isPayable).toBe(true);
        expect(leg0.sessionUrl).toBe('https://fourthwall.com/pay/initial_001');

        // CRITICAL P0 ASSERTION: Leg 1 sessionUrl MUST BE NULL in client response
        expect(leg1.isPayable).toBe(false);
        expect(leg1.sessionUrl).toBeNull();

        // Server-side persistence MUST retain both session URLs
        const dbLegs = supabase._db.invoice_payment_legs;
        expect(dbLegs).toHaveLength(2);
        const dbLeg0 = dbLegs.find((l: any) => l.leg_index === 1);
        const dbLeg1 = dbLegs.find((l: any) => l.leg_index === 2);
        expect(dbLeg0.session_url).toBe('https://fourthwall.com/pay/initial_001');
        expect(dbLeg1.session_url).toBe('https://kashier.io/pay/initial_002');
    });

    it('Finding 1: Client cannot skip first payment step using initial checkout response because downstream sessionUrl is null', async () => {
        const supabase = createFakeSupabase();
        const gateway = createFakeGateway();

        const lines: CombinedLineInput[] = [
            { kind: 'product', tierId: 'digital' },
            { kind: 'addon',   tierId: 'digital_plus' },
        ];

        const result = await createCombinedCheckoutSession(
            { email: 'skip_attacker@example.com', fullName: 'Attacker Test', country: 'US', lines },
            {
                supabase,
                gatewayFactory: () => gateway,
                pricingRows: async () => [],
                fourthwallAdapter: {
                    createPaymentSession: async (p: any) => ({
                        sessionId: 'fw_leg1', sessionUrl: 'https://fw.com/1', amount: p.amount, currency: p.currency,
                    }),
                },
                kashierServiceAdapter: {
                    createPaymentSession: async (p: any) => ({
                        sessionId: 'ks_leg2', sessionUrl: 'https://ks.com/2', amount: p.amount, currency: p.currency,
                    }),
                },
            }
        );

        // Client attempts to inspect the 2nd leg from the response
        const downstreamLeg = result.paymentLegs!.find((l) => l.legIndex === 2);
        expect(downstreamLeg).toBeDefined();
        expect(downstreamLeg!.sessionUrl).toBeNull();
        expect(downstreamLeg!.isPayable).toBe(false);
    });
});

describe('Finding 2 — P0: Race-Safe & Monotonic Payment Leg Persistence', () => {
    it('Finding 2: persistPaymentLegs THROWS when existing-row lookup encounters a database error (never proceeds with write)', async () => {
        const { persistPaymentLegs } = await import('../../server/payments/multiLegPaymentService');
        const invoiceId = 'err_db_read_001';

        // Mock supabase returning a real database error (not relation-missing)
        const mockSupabase: any = {
            from: (table: string) => ({
                select: () => ({
                    eq: () => Promise.resolve({
                        data: null,
                        error: { message: 'Connection pool exhausted: timeout 5000ms', code: '57P01' },
                    }),
                }),
                insert: () => {
                    throw new Error('Insert must NEVER be called after a query error!');
                },
                update: () => {
                    throw new Error('Update must NEVER be called after a query error!');
                },
            }),
        };

        const legs: PaymentLeg[] = [
            {
                id: 'leg_err_1', invoiceId, legIndex: 1,
                legType: 'merchandise', provider: 'fourthwall',
                amount: 49.99, currency: 'USD', status: 'pending',
                providerReference: null, actualPaidAmount: null,
                sessionUrl: 'https://fw.com/err', items: [], paidAt: null,
            },
        ];

        // CRITICAL P0 ASSERTION: Query error must throw and NEVER proceed with upsert
        await expect(persistPaymentLegs(mockSupabase, legs)).rejects.toThrow(
            /Query error reading existing legs: Connection pool exhausted/
        );
    });

    it('Finding 2: persistPaymentLegs distinguishes missing table (42P01) from database error and safely skips write without crashing', async () => {
        const { persistPaymentLegs } = await import('../../server/payments/multiLegPaymentService');
        const invoiceId = 'pre_migration_inv_001';

        const mockSupabase: any = {
            from: () => ({
                select: () => ({
                    eq: () => Promise.resolve({
                        data: null,
                        error: { message: 'relation "invoice_payment_legs" does not exist', code: '42P01' },
                    }),
                }),
            }),
        };

        const legs: PaymentLeg[] = [
            {
                id: 'leg_prem_1', invoiceId, legIndex: 1,
                legType: 'merchandise', provider: 'fourthwall',
                amount: 49.99, currency: 'USD', status: 'pending',
                providerReference: null, actualPaidAmount: null,
                sessionUrl: 'https://fw.com/prem', items: [], paidAt: null,
            },
        ];

        // Must resolve safely without throwing
        await expect(persistPaymentLegs(mockSupabase, legs)).resolves.toBeUndefined();
    });

    it('Finding 2: Atomic conditional update prevents overwriting a leg settled concurrently between read and write', async () => {
        const { persistPaymentLegs } = await import('../../server/payments/multiLegPaymentService');
        const supabase = createFakeSupabase();
        const invoiceId = 'race_window_inv_001';

        // 1. Leg starts as pending
        supabase._db.invoice_payment_legs.push({
            id: 'leg_race_window',
            invoice_id: invoiceId,
            leg_index: 1,
            leg_type: 'merchandise',
            provider: 'fourthwall',
            amount: 49.99,
            currency: 'USD',
            status: 'pending',
            provider_reference: null,
            actual_paid_amount: null,
            paid_at: null,
        });

        // 2. Interleaving: right after read, concurrent webhook settles the row to succeeded
        // In our mock, let's settle it in DB directly:
        const dbRow = supabase._db.invoice_payment_legs[0];
        dbRow.status = 'succeeded';
        dbRow.provider_reference = 'winner_ref_123';
        dbRow.actual_paid_amount = 49.99;
        const settledTimestamp = '2026-10-20T12:00:00Z';
        dbRow.paid_at = settledTimestamp;

        // 3. Stale worker attempts to persist older snapshot with status 'pending'
        const staleSnapshot: PaymentLeg[] = [
            {
                id: 'leg_race_window',
                invoiceId,
                legIndex: 1,
                legType: 'merchandise',
                provider: 'fourthwall',
                amount: 49.99,
                currency: 'USD',
                status: 'pending',
                providerReference: null,
                actualPaidAmount: null,
                sessionUrl: 'https://fw.com/stale',
                items: [],
                paidAt: null,
            },
        ];

        await persistPaymentLegs(supabase, staleSnapshot);

        // 4. Assert row in database was NOT downgraded
        expect(dbRow.status).toBe('succeeded');
        expect(dbRow.provider_reference).toBe('winner_ref_123');
        expect(dbRow.actual_paid_amount).toBe(49.99);
        expect(dbRow.paid_at).toBe(settledTimestamp);
    });

    it('Finding 2: Normal initialization inserts new legs and idempotent persistence is safe', async () => {
        const { persistPaymentLegs } = await import('../../server/payments/multiLegPaymentService');
        const supabase = createFakeSupabase();
        const invoiceId = 'normal_init_inv_001';

        const initialLegs: PaymentLeg[] = [
            {
                id: 'leg_init_1', invoiceId, legIndex: 1,
                legType: 'merchandise', provider: 'fourthwall',
                amount: 50.00, currency: 'USD', status: 'pending',
                providerReference: null, actualPaidAmount: null,
                sessionUrl: 'https://fw.com/init', items: [], paidAt: null,
            },
            {
                id: 'leg_init_2', invoiceId, legIndex: 2,
                legType: 'service', provider: 'kashier',
                amount: 150.00, currency: 'USD', status: 'pending',
                providerReference: null, actualPaidAmount: null,
                sessionUrl: 'https://ks.com/init', items: [], paidAt: null,
            },
        ];

        // 1. First call: normal initialization
        await persistPaymentLegs(supabase, initialLegs);
        expect(supabase._db.invoice_payment_legs).toHaveLength(2);

        // 2. Second call: idempotent repeat
        await persistPaymentLegs(supabase, initialLegs);
        expect(supabase._db.invoice_payment_legs).toHaveLength(2);
    });
});

describe('Finding 3 — P1: Validate Full Settlement RPC Contract & Consistency', () => {
    function setupRpcTestSupabase(rpcResult: any) {
        const supabase = createFakeSupabase();
        supabase._db.invoices.push({
            id: 'inv_contract_test',
            user_id: 'user_contract_test',
            amount: 399.98,
            currency: 'USD',
            status: 'open',
            payment_status: 'pending',
            metadata: {
                payment_legs: [
                    { id: 'leg_fw_c', legIndex: 0, provider: 'fourthwall', amount: 49.99, currency: 'USD', status: 'pending' },
                    { id: 'leg_ks_c', legIndex: 1, provider: 'kashier', amount: 349.99, currency: 'USD', status: 'pending' },
                ],
            },
        });
        supabase._db.orders.push({ id: 'ord_c', invoice_id: 'inv_contract_test', payment_status: 'pending' });
        supabase._db.payment_intents.push({ id: 'intent_c', invoice_id: 'inv_contract_test', attempt_number: 1, is_current: true, status: 'pending' });
        supabase._db.profiles.push({ id: 'user_contract_test', has_paid: false, is_vip: false });

        supabase.rpc = async (func: string) => {
            if (func === 'settle_invoice_payment_leg') {
                return { data: rpcResult, error: null };
            }
            return { data: null, error: null };
        };

        return supabase;
    }

    const baseVerdictParams = (supabase: any) => ({
        supabase,
        invoiceId: 'inv_contract_test',
        gatewayName: 'FOURTHWALL_GLOBAL',
        verdict: {
            status: 'success' as const,
            externalReferenceId: 'fw_c_ref',
            paidAmount: 49.99,
            currency: 'USD',
        },
        providerEventId: 'evt_c_123',
        providerStatus: 'succeeded',
        source: 'webhook' as const,
    });

    it('Contract: returns unresolved when RPC response is missing target_leg_id', async () => {
        const supabase = setupRpcTestSupabase({
            success: true,
            invoice_status: 'partially_paid',
            can_fulfill: false,
            total_paid: 49.99,
            invoice_amount: 399.98,
            // target_leg_id missing!
        });

        const res = await applyProviderVerdict(baseVerdictParams(supabase));
        expect(res.code).toBe('unresolved');
    });

    it('Contract: returns unresolved when RPC response is missing total_paid or invoice_amount', async () => {
        const supabase = setupRpcTestSupabase({
            success: true,
            invoice_status: 'partially_paid',
            can_fulfill: false,
            target_leg_id: 'leg_fw_c',
            // total_paid and invoice_amount missing!
        });

        const res = await applyProviderVerdict(baseVerdictParams(supabase));
        expect(res.code).toBe('unresolved');
    });

    it('Contract: returns unresolved when RPC response has incorrect field types', async () => {
        const supabase = setupRpcTestSupabase({
            success: true,
            invoice_status: 'partially_paid',
            can_fulfill: 'true', // string instead of boolean!
            target_leg_id: 'leg_fw_c',
            total_paid: '49.99', // string instead of number!
            invoice_amount: 399.98,
        });

        const res = await applyProviderVerdict(baseVerdictParams(supabase));
        expect(res.code).toBe('unresolved');
    });

    it('Contract: returns unresolved when RPC response is CONTRADICTORY (can_fulfill: true but invoice_status: partially_paid)', async () => {
        const supabase = setupRpcTestSupabase({
            success: true,
            invoice_status: 'partially_paid',
            can_fulfill: true, // Contradictory: can_fulfill cannot be true when status is partially_paid!
            target_leg_id: 'leg_fw_c',
            total_paid: 399.98,
            invoice_amount: 399.98,
        });

        const res = await applyProviderVerdict(baseVerdictParams(supabase));
        expect(res.code).toBe('unresolved');
    });

    it('Contract: returns unresolved when RPC response is CONTRADICTORY (can_fulfill: true but total_paid < invoice_amount)', async () => {
        const supabase = setupRpcTestSupabase({
            success: true,
            invoice_status: 'paid',
            can_fulfill: true,
            target_leg_id: 'leg_fw_c',
            total_paid: 49.99, // Contradictory: total_paid is far less than invoice_amount!
            invoice_amount: 399.98,
        });

        const res = await applyProviderVerdict(baseVerdictParams(supabase));
        expect(res.code).toBe('unresolved');
    });

    it('Contract: returns unresolved when RPC response is CONTRADICTORY (invoice_status: paid but can_fulfill: false)', async () => {
        const supabase = setupRpcTestSupabase({
            success: true,
            invoice_status: 'paid',
            can_fulfill: false, // Contradictory!
            target_leg_id: 'leg_fw_c',
            total_paid: 399.98,
            invoice_amount: 399.98,
        });

        const res = await applyProviderVerdict(baseVerdictParams(supabase));
        expect(res.code).toBe('unresolved');
    });

    it('Contract: handles legitimate idempotent response returning already_processed', async () => {
        const supabase = setupRpcTestSupabase({
            success: true,
            idempotent: true,
            invoice_status: 'paid',
            can_fulfill: false,
            message: 'Invoice already settled',
        });

        const res = await applyProviderVerdict(baseVerdictParams(supabase));
        expect(res.code).toBe('already_processed');
    });

    it('Contract: rejects invalid idempotent response (idempotent: true but invoice_status != paid) returning unresolved', async () => {
        const supabase = setupRpcTestSupabase({
            success: true,
            idempotent: true,
            invoice_status: 'pending', // Invalid for idempotent!
            can_fulfill: false,
        });

        const res = await applyProviderVerdict(baseVerdictParams(supabase));
        expect(res.code).toBe('unresolved');
    });
});

describe('Finding 4 — P2: Customer-Facing Guest Recovery Contract via Request Header', () => {
    beforeEach(() => {
        process.env.KASHIER_MODE = 'test';
        process.env.KASHIER_GLOBAL_MERCHANT_ID = 'MID-TEST-GLOBAL';
        process.env.KASHIER_GLOBAL_PAYMENT_API_KEY = 'test-api-global-123';
        process.env.KASHIER_GLOBAL_SECRET_KEY = 'test-secret-global-456';
    });

    it('Finding 4: End-to-end guest flow: resumeToken generated at checkout allows status query via x-resume-token header', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');
        const supabase = createFakeSupabase();
        const gateway = createFakeGateway();

        const lines: CombinedLineInput[] = [
            { kind: 'product', tierId: 'digital' },
            { kind: 'addon',   tierId: 'digital_plus' },
        ];

        // 1. Guest creates checkout
        const checkoutRes = await createCombinedCheckoutSession(
            { email: 'guest_customer@example.com', fullName: 'Guest Customer', country: 'US', lines },
            {
                supabase,
                gatewayFactory: () => gateway,
                pricingRows: async () => [],
                fourthwallAdapter: {
                    createPaymentSession: async (p: any) => ({
                        sessionId: 'fw_guest_1', sessionUrl: 'https://fw.com/guest_1', amount: p.amount, currency: p.currency,
                    }),
                },
                kashierServiceAdapter: {
                    createPaymentSession: async (p: any) => ({
                        sessionId: 'ks_guest_2', sessionUrl: 'https://ks.com/guest_2', amount: p.amount, currency: p.currency,
                    }),
                },
            }
        );

        expect(checkoutRes.resumeToken).toBeDefined();
        const resumeToken = checkoutRes.resumeToken!;
        const invoiceId = checkoutRes.invoiceId;

        // 2. Guest requests status with the resumeToken in x-resume-token header
        const statusReq = new Request(`https://mrxsteroid.com/api/checkout/status?invoiceId=${invoiceId}`, {
            method: 'GET',
            headers: {
                'x-resume-token': resumeToken,
            },
        });

        const statusRes = await handleCheckoutStatus(statusReq, {
            supabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        expect(statusRes.status).toBe(200);
        const data = await statusRes.json();
        expect(data.success).toBe(true);
        expect(data.invoiceId).toBe(invoiceId);
        expect(data.legs[0].isPayable).toBe(true);
        expect(data.legs[1].isPayable).toBe(false);
    });

    it('Finding 4: Request with invoice UUID and email alone without x-resume-token header is strictly REJECTED with 403', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');
        const supabase = createFakeSupabase();
        const invoiceId = '99999999-9999-4999-a999-999999999999';

        supabase._db.invoices.push({
            id: invoiceId,
            user_id: null,
            customer_email: 'target_guest@example.com',
            payment_status: 'pending',
            status: 'open',
            amount: 100,
            currency: 'USD',
            metadata: {
                guest_resume_token: 'secret_token_123',
            },
        });

        // Attacker knows UUID and email, but does NOT possess the secret resumeToken in header
        const req = new Request(`https://mrxsteroid.com/api/checkout/status?invoiceId=${invoiceId}&email=target_guest@example.com`, {
            method: 'GET',
        });

        const res = await handleCheckoutStatus(req, {
            supabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        expect(res.status).toBe(403);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('x-resume-token header required');
    });
});

describe('Fix A — P0: Authoritative Payment Legs Table & Error Handling in Checkout Status', () => {
    const invoiceId = '77777777-7777-4777-a777-777777777777';
    const resumeToken = 'fix_a_resume_token_456';

    const baseInvoice = {
        id: invoiceId,
        user_id: null,
        customer_email: 'fix_a@example.com',
        payment_status: 'pending',
        status: 'open',
        amount: 399.98,
        currency: 'USD',
        metadata: {
            guest_resume_token: resumeToken,
            payment_legs: [
                { id: 'leg_0', legIndex: 0, status: 'succeeded', amount: 49.99, currency: 'USD', sessionUrl: 'https://fourthwall.com/pay_leg_0' },
                { id: 'leg_1', legIndex: 1, status: 'pending', amount: 349.99, currency: 'USD', sessionUrl: 'https://kashier.io/pay_leg_1' },
            ],
        },
    };

    const makeRequest = () => new Request(`https://mrxsteroid.com/api/checkout/status?invoiceId=${invoiceId}`, {
        method: 'GET',
        headers: {
            'x-resume-token': resumeToken,
        },
    });

    it('Fix A Test 1: Query error reading invoice_payment_legs returns 503 retryable response without exposing downstream session URLs', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');

        const mockSupabase: any = {
            from: (table: string) => {
                if (table === 'invoices') {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: () => Promise.resolve({ data: baseInvoice, error: null }),
                            }),
                        }),
                    };
                }
                if (table === 'invoice_payment_legs') {
                    return {
                        select: () => ({
                            eq: () => ({
                                order: () => Promise.resolve({
                                    data: null,
                                    error: { message: 'Connection timeout: unable to reach Postgres', code: '08006' },
                                }),
                            }),
                        }),
                    };
                }
                throw new Error(`Unexpected table ${table}`);
            },
        };

        const res = await handleCheckoutStatus(makeRequest(), {
            supabase: mockSupabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        expect(res.status).toBe(503);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.retryable).toBe(true);
        expect(data.error).toContain('Database read error while inspecting payment legs');
        expect(data.legs).toBeUndefined();
        expect(data.nextPendingLeg).toBeUndefined();
    });

    it('Fix A Test 2: Missing table (42P01 pre-migration) is distinguished from DB errors and falls back safely to initial metadata without unlocking downstream legs', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');

        const mockSupabase: any = {
            from: (table: string) => {
                if (table === 'invoices') {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: () => Promise.resolve({ data: baseInvoice, error: null }),
                            }),
                        }),
                    };
                }
                if (table === 'invoice_payment_legs') {
                    return {
                        select: () => ({
                            eq: () => ({
                                order: () => Promise.resolve({
                                    data: null,
                                    error: { message: 'relation "invoice_payment_legs" does not exist', code: '42P01' },
                                }),
                            }),
                        }),
                    };
                }
                throw new Error(`Unexpected table ${table}`);
            },
        };

        const res = await handleCheckoutStatus(makeRequest(), {
            supabase: mockSupabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.legs).toHaveLength(2);

        // Pre-migration metadata fallback: ONLY initial leg is payable. Downstream leg is strictly locked!
        const leg0 = data.legs.find((l: any) => l.legIndex === 0);
        const leg1 = data.legs.find((l: any) => l.legIndex === 1);
        expect(leg0.isPayable).toBe(true);
        expect(leg0.sessionUrl).toBe('https://fourthwall.com/pay_leg_0');
        expect(leg1.isPayable).toBe(false);
        expect(leg1.sessionUrl).toBeNull();
    });

    it('Fix A Test 3: Query succeeds but returns empty array (table exists, 0 rows) — metadata cannot prove settlement or authorize downstream legs', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');

        // Invoice metadata claims leg_0 was succeeded, but table exists and has 0 rows for this invoice!
        const mockSupabase: any = {
            from: (table: string) => {
                if (table === 'invoices') {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: () => Promise.resolve({ data: baseInvoice, error: null }),
                            }),
                        }),
                    };
                }
                if (table === 'invoice_payment_legs') {
                    return {
                        select: () => ({
                            eq: () => ({
                                order: () => Promise.resolve({ data: [], error: null }),
                            }),
                        }),
                    };
                }
                throw new Error(`Unexpected table ${table}`);
            },
        };

        const res = await handleCheckoutStatus(makeRequest(), {
            supabase: mockSupabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);

        const leg0 = data.legs.find((l: any) => l.legIndex === 0);
        const leg1 = data.legs.find((l: any) => l.legIndex === 1);

        // Metadata alone cannot prove settlement: leg 0 remains the payable leg, leg 1 is NOT unlocked
        expect(leg0.isPayable).toBe(true);
        expect(leg1.isPayable).toBe(false);
        expect(leg1.sessionUrl).toBeNull();
    });

    it('Fix A Test 4: Query succeeds and returns documented legs with compatible states from DB', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');

        const dbLegs = [
            {
                id: 'db_leg_0',
                invoice_id: invoiceId,
                leg_index: 0,
                leg_type: 'merchandise',
                provider: 'fourthwall',
                amount: 49.99,
                currency: 'USD',
                status: 'succeeded',
                session_url: 'https://fourthwall.com/pay_leg_0',
                provider_reference: 'fw_confirmed_ref_123',
            },
            {
                id: 'db_leg_1',
                invoice_id: invoiceId,
                leg_index: 1,
                leg_type: 'service',
                provider: 'kashier',
                amount: 349.99,
                currency: 'USD',
                status: 'pending',
                session_url: 'https://kashier.io/pay_leg_1',
                provider_reference: null,
            },
        ];

        const mockSupabase: any = {
            from: (table: string) => {
                if (table === 'invoices') {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: () => Promise.resolve({
                                    data: { ...baseInvoice, payment_status: 'partially_paid' },
                                    error: null,
                                }),
                            }),
                        }),
                    };
                }
                if (table === 'invoice_payment_legs') {
                    return {
                        select: () => ({
                            eq: () => ({
                                order: () => Promise.resolve({ data: dbLegs, error: null }),
                            }),
                        }),
                    };
                }
                throw new Error(`Unexpected table ${table}`);
            },
        };

        const res = await handleCheckoutStatus(makeRequest(), {
            supabase: mockSupabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.nextPendingLeg.id).toBe('db_leg_1');

        const leg0 = data.legs.find((l: any) => l.legIndex === 0);
        const leg1 = data.legs.find((l: any) => l.legIndex === 1);

        expect(leg0.status).toBe('succeeded');
        expect(leg0.isPayable).toBe(false);
        expect(leg0.providerReference).toBe('fw_confirmed_ref_123');

        // Leg 1 is now authoritatively payable and its sessionUrl is released
        expect(leg1.status).toBe('pending');
        expect(leg1.isPayable).toBe(true);
        expect(leg1.sessionUrl).toBe('https://kashier.io/pay_leg_1');
    });

    it('Fix A Test 5: Attempting to bypass Leg 1 using Leg 2 session URL fails because downstream URL is null while Leg 1 is pending', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');

        const dbLegs = [
            {
                id: 'db_leg_0',
                invoice_id: invoiceId,
                leg_index: 0,
                leg_type: 'merchandise',
                provider: 'fourthwall',
                amount: 49.99,
                currency: 'USD',
                status: 'pending',
                session_url: 'https://fourthwall.com/pay_leg_0',
                provider_reference: null,
            },
            {
                id: 'db_leg_1',
                invoice_id: invoiceId,
                leg_index: 1,
                leg_type: 'service',
                provider: 'kashier',
                amount: 349.99,
                currency: 'USD',
                status: 'pending',
                session_url: 'https://kashier.io/pay_leg_1',
                provider_reference: null,
            },
        ];

        const mockSupabase: any = {
            from: (table: string) => {
                if (table === 'invoices') {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: () => Promise.resolve({ data: baseInvoice, error: null }),
                            }),
                        }),
                    };
                }
                if (table === 'invoice_payment_legs') {
                    return {
                        select: () => ({
                            eq: () => ({
                                order: () => Promise.resolve({ data: dbLegs, error: null }),
                            }),
                        }),
                    };
                }
                throw new Error(`Unexpected table ${table}`);
            },
        };

        const res = await handleCheckoutStatus(makeRequest(), {
            supabase: mockSupabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);

        const leg0 = data.legs.find((l: any) => l.legIndex === 0);
        const leg1 = data.legs.find((l: any) => l.legIndex === 1);

        expect(leg0.isPayable).toBe(true);
        expect(leg0.sessionUrl).toBe('https://fourthwall.com/pay_leg_0');

        // BYPASS IMPOSSIBLE: Leg 1 sessionUrl is completely null
        expect(leg1.isPayable).toBe(false);
        expect(leg1.sessionUrl).toBeNull();
    });

    it('Fix A Test 6: Reliable state lost or unexpected DB failure guarantees no downstream session URLs are issued', async () => {
        const { handleCheckoutStatus } = await import('../../server/payments/checkoutStatusService');

        const mockSupabase: any = {
            from: (table: string) => {
                if (table === 'invoices') {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: () => Promise.resolve({ data: baseInvoice, error: null }),
                            }),
                        }),
                    };
                }
                if (table === 'invoice_payment_legs') {
                    return {
                        select: () => ({
                            eq: () => ({
                                order: () => Promise.resolve({
                                    data: null,
                                    error: { message: 'permission denied for table invoice_payment_legs', code: '42501' },
                                }),
                            }),
                        }),
                    };
                }
                throw new Error(`Unexpected table ${table}`);
            },
        };

        const res = await handleCheckoutStatus(makeRequest(), {
            supabase: mockSupabase,
            getAuthUser: async () => ({ status: 'ANONYMOUS' }),
        });

        // Fails closed with 503 — zero session URLs issued
        expect(res.status).toBe(503);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.retryable).toBe(true);
        expect(data.legs).toBeUndefined();
    });
});
