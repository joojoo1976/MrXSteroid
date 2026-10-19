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
    const nextId = (t: string) => `${t}-${String(++idCounter).padStart(4, '0')}`;

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
                    const existingIdx = rows.findIndex((r) => r.id === row.id);
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
            verdict:         { status: 'success', externalReferenceId: 'kashier_tx_456', paidAmount: 349.99 },
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

        // 2. Currency mismatch: Attempt to settle USD leg with EUR
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
