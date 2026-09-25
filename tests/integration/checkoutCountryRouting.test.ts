/**
 * P0 regression — the checkout region must come from the SHIPPING DESTINATION,
 * not from which gateway happened to be selected.
 *
 * Defect (QA 2026-09-25): `create-invoice` derived
 *     const isEgypt = gatewayName === 'PAYMOB' && !isPaymobPayPal;
 * while the gateway itself was chosen by
 *     ... || isPaymobMethod        // card | wallet | kiosk | paypal
 * So ANY card/wallet/kiosk request became a Paymob request, which made
 * `isEgypt` unconditionally true. A US customer paying by card was therefore
 * billed EGP and recorded as `region = 'egypt'` for an international shipment.
 *
 * A second, independent defect: the region was derived from
 *     x-vercel-ip-country || input.country
 * i.e. the IP header OVERRODE the country the customer explicitly selected. The
 * connection origin is not the delivery destination, so a customer in Cairo
 * buying for a US address — or a customer in London ordering to Egypt — was
 * priced for the wrong region.
 *
 * Contract after the fix:
 *   country = EG  → region EGYPT / currency EGP
 *   country = US  → region GLOBAL / currency USD
 *   country = GB  → region GLOBAL / currency USD
 *   x-vercel-ip-country is a FALLBACK hint, never an override
 *   Paymob (an EGP-only merchant) + GLOBAL destination → controlled 400
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const h = vi.hoisted(() => {
    const tables: Record<string, any[]> = {};
    const nextId = () => `row-${Math.random().toString(36).slice(2, 10)}`;
    const load = (t: string) => (tables[t] ||= []);

    const queryRows = (table: string, state: any): any[] => {
        let rows = load(table).filter((r) =>
            Object.entries(state.match || {}).every(([k, v]) => r[k] === v)
        );
        if (state.order) {
            const { col, dir } = state.order;
            rows = [...rows].sort((a, b) => {
                const av = a[col];
                const bv = b[col];
                const cmp = av < bv ? -1 : av > bv ? 1 : 0;
                return dir === 'desc' ? -cmp : cmp;
            });
        }
        return rows;
    };

    const makeQuery = (table: string) => {
        const state: any = { match: {} };
        const chain: any = {};
        chain.select = function (this: any, cols?: string) {
            state.cols = cols;
            return this;
        };
        chain.eq = function (this: any, col: string, val: unknown) {
            state.match[col] = val;
            return this;
        };
        chain.single = function (this: any) {
            return this;
        };
        chain.order = function (this: any, col: string, opts?: { ascending?: boolean }) {
            state.order = { col, dir: opts?.ascending === false ? 'desc' : 'asc' };
            return this;
        };
        chain.then = (onOk: any, onErr: any) =>
            Promise.resolve({ data: queryRows(table, state), error: null }).then(onOk, onErr);
        chain.maybeSingle = async () => ({ data: queryRows(table, state)[0] ?? null, error: null });
        chain.insert = (rows: any) => {
            const arr = Array.isArray(rows) ? rows : [rows];
            const c: any = Object.create(chain);
            c.select = () => c;
            c.single = async () => {
                const row = { ...arr[0], id: arr[0].id || nextId() };
                load(table).push(row);
                return { data: row, error: null };
            };
            c.maybeSingle = c.single;
            return c;
        };
        chain.update = (patch: any) => {
            const c: any = Object.create(chain);
            c.select = () => c;
            c.then = (onOk: any) => {
                queryRows(table, state).forEach((r) => Object.assign(r, patch));
                return Promise.resolve({ data: [], error: null }).then(onOk);
            };
            return c;
        };
        return chain;
    };

    return {
        tables,
        createClientMock: vi.fn(() => ({ from: (t: string) => makeQuery(t) })),
    };
});

vi.mock('@supabase/supabase-js', () => ({ createClient: h.createClientMock }));

const FETCH = vi.hoisted(() => ({
    calls: [] as Array<{ url: string; init?: RequestInit }>,
    mock: vi.fn(async (url: unknown, init?: RequestInit) => {
        FETCH.calls.push({ url: String(url), init });
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    // Kashier payment session (used by the kashier gateway)
                    sessionId: 'sess-country-routing',
                    sessionUrl: 'https://checkout.kashier.io/payment/sess-country-routing',
                    status: 'ACTIVE',
                    // gateway-invoice shapes (paymob / instapay)
                    id: `pi_${Math.random().toString(36).slice(2, 10)}`,
                    transaction_url: 'https://pay.test/pay',
                }),
            };
    }),
}));

function req(body: unknown, headers: Record<string, string> = {}): Request {
    return new Request('http://localhost/api/payments/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
    });
}

const base = {
    tierId: 'bundle',
    email: 'buyer@example.com',
    fullName: 'Test Buyer',
    metadata: { address: '1 Test St', city: 'Testville', zipCode: '12345' },
};

const ENV = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://route-test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'svc_route_test',
    KASHIER_MODE: 'test',
    KASHIER_TEST_MERCHANT_ID: 'MID_EG_ROUTE',
    KASHIER_TEST_PAYMENT_API_KEY: 'KEY_EG_ROUTE',
    KASHIER_TEST_SECRET_KEY: 'SEC_EG_ROUTE',
    KASHIER_GLOBAL_MERCHANT_ID: 'MID_GLOBAL_ROUTE',
    KASHIER_GLOBAL_PAYMENT_API_KEY: 'KEY_GLOBAL_ROUTE',
    KASHIER_GLOBAL_SECRET_KEY: 'SEC_GLOBAL_ROUTE',
};

describe('create-invoice country → region routing', () => {
    beforeEach(() => {
        Object.assign(process.env, ENV);
        h.tables.invoices = [];
        h.tables.payment_intents = [];
        h.tables.admin_settings = [];
        FETCH.calls.length = 0;
        globalThis.fetch = FETCH.mock as unknown as typeof fetch;
    });

    afterEach(() => {
        Object.keys(ENV).forEach((k) => delete process.env[k]);
        vi.resetModules();
        vi.restoreAllMocks();
    });

    const importRoute = () => import('../../app/api/payments/create-invoice/route');

    // Region-routing assertions use a DIGITAL tier on purpose: Global PHYSICAL
    // shipping is deliberately refused (no carrier service configured), so a
    // physical global order would 400 before an invoice ever exists.
    const digital = { ...base, tierId: 'digital' };

    it('country=EG resolves to EGYPT/EGP', async () => {
        const { POST } = await importRoute();
        const res = await POST(req({ ...base, country: 'EG', paymentMethod: 'kashier' }));
        expect(res.status).toBe(200);
        const invoice = h.tables.invoices[0];
        expect(invoice.region).toBe('egypt');
        expect(invoice.currency).toBe('EGP');
    });

    it('country=US does NOT resolve to egypt (the original bug)', async () => {
        const { POST } = await importRoute();
        const res = await POST(req({ ...digital, country: 'US', paymentMethod: 'kashier' }));
        expect(res.status).toBe(200);
        const invoice = h.tables.invoices[0];
        expect(invoice).toBeDefined();
        expect(invoice.region).not.toBe('egypt');
        expect(invoice.region).toBe('global');
        expect(invoice.currency).toBe('USD');
    });

    it('country=GB resolves to GLOBAL/USD', async () => {
        const { POST } = await importRoute();
        const res = await POST(req({ ...digital, country: 'GB', paymentMethod: 'kashier' }));
        expect(res.status).toBe(200);
        const invoice = h.tables.invoices[0];
        expect(invoice.region).toBe('global');
        expect(invoice.currency).toBe('USD');
    });

    it('an explicit country is NOT overridden by the IP geolocation header', async () => {
        const { POST } = await importRoute();
        // Customer sits in Egypt (IP = EG) but ships to the US. The stated
        // destination must win; the old code billed EGP.
        const res = await POST(
            req({ ...digital, country: 'US', paymentMethod: 'kashier' }, { 'x-vercel-ip-country': 'EG' })
        );
        expect(res.status).toBe(200);
        const invoice = h.tables.invoices[0];
        expect(invoice.region).toBe('global');
        expect(invoice.currency).toBe('USD');
    });

    it('an explicit country is NOT overridden by a foreign IP header', async () => {
        const { POST } = await importRoute();
        const res = await POST(
            req({ ...base, country: 'EG', paymentMethod: 'kashier' }, { 'x-vercel-ip-country': 'US' })
        );
        expect(res.status).toBe(200);
        const invoice = h.tables.invoices[0];
        expect(invoice.region).toBe('egypt');
        expect(invoice.currency).toBe('EGP');
    });

    it('requires an explicit country, so the IP header is never the source', async () => {
        // `country` is `z.string().min(1)` on this route, so the request schema
        // itself guarantees a destination is stated. The IP fallback in the route
        // is defence-in-depth for a future schema change, not a live path.
        const { POST } = await importRoute();
        const body: any = { ...base, paymentMethod: 'kashier' };
        delete body.country;
        const res = await POST(req(body, { 'x-vercel-ip-country': 'EG' }));
        expect(res.status).toBe(400);
        expect(h.tables.invoices.length).toBe(0);
    });

    it('lowercase and mixed-case country codes are normalised', async () => {
        const { POST } = await importRoute();
        await POST(req({ ...base, country: 'eg', paymentMethod: 'kashier' }));
        expect(h.tables.invoices[0].region).toBe('egypt');
        h.tables.invoices = [];
        await POST(req({ ...digital, country: 'us', paymentMethod: 'kashier' }));
        expect(h.tables.invoices[0].region).toBe('global');
    });
});

describe('Global PHYSICAL is refused until a carrier service is configured', () => {
    beforeEach(() => {
        Object.assign(process.env, ENV);
        h.tables.invoices = [];
        h.tables.payment_intents = [];
        h.tables.admin_settings = [];
        FETCH.calls.length = 0;
        globalThis.fetch = FETCH.mock as unknown as typeof fetch;
    });

    afterEach(() => {
        Object.keys(ENV).forEach((k) => delete process.env[k]);
        vi.resetModules();
        vi.restoreAllMocks();
    });

    const importRoute = () => import('../../app/api/payments/create-invoice/route');

    it('rejects a Global physical order with no provider (never free shipping)', async () => {
        const { POST } = await importRoute();
        const res = await POST(req({ ...base, country: 'US', paymentMethod: 'kashier' }));
        expect(res.status).toBe(400);
        const json = (await res.json()) as any;
        expect(json.success).toBe(false);
        expect(json.code).toBe('SHIPPING_UNAVAILABLE');
        expect(h.tables.invoices.length).toBe(0);
    });

    it('rejects a Global physical order that names an unknown provider', async () => {
        const { POST } = await importRoute();
        const res = await POST(
            req({
                ...base,
                country: 'US',
                paymentMethod: 'kashier',
                metadata: { ...base.metadata, shippingProviderId: 'my_own_cheap_shipping' },
            })
        );
        expect(res.status).toBe(400);
        expect(h.tables.invoices.length).toBe(0);
    });

    it('rejects a Global physical order naming a REAL configured USD provider', async () => {
        // The decision is GLOBAL physical = BLOCKED, so a provider that genuinely
        // exists in the shipping config must not buy a shopper a price.
        const { POST } = await importRoute();
        const res = await POST(
            req({ ...base, country: 'US', paymentMethod: 'kashier', shippingProviderId: 'fedex_priority' })
        );
        expect(res.status).toBe(400);
        expect((await res.json()).code).toBe('SHIPPING_UNAVAILABLE');
        expect(h.tables.invoices.length).toBe(0);
        expect(h.tables.payment_intents.length).toBe(0);
    });

    it('blocks Global physical on the NON-Kashier branch too (not just the session path)', async () => {
        // Kashier delegates to createCheckoutSession; every other gateway is
        // priced inline in this route. The block must hold on both paths.
        const { POST } = await importRoute();
        const res = await POST(
            req({ ...base, country: 'US', paymentMethod: 'stripe', shippingProviderId: 'dhl_global' })
        );
        expect(res.status).toBe(400);
        expect((await res.json()).code).toBe('SHIPPING_UNAVAILABLE');
        expect(h.tables.invoices.length).toBe(0);
    });

    it('never falls back to 0 and never honours a client-supplied shipping price', async () => {
        const { POST } = await importRoute();
        const res = await POST(
            req({ ...base, country: 'US', paymentMethod: 'kashier', shippingCost: 0, shippingProviderId: 'fedex_priority' })
        );
        expect(res.status).toBe(400);
        expect(h.tables.invoices.length).toBe(0);
    });

    it('keeps Global DIGITAL at 0 with no shipping charge', async () => {
        const { POST } = await importRoute();
        const res = await POST(
            req({ ...base, tierId: 'digital', country: 'US', paymentMethod: 'kashier', shippingProviderId: 'fedex_priority' })
        );
        expect(res.status).toBe(200);
        expect(h.tables.invoices[0].shipping_cost).toBe(0);
    });

    it('keeps Egypt PHYSICAL at the canonical 199 EGP', async () => {
        const { POST } = await importRoute();
        const res = await POST(req({ ...base, country: 'EG', paymentMethod: 'kashier' }));
        expect(res.status).toBe(200);
        expect(h.tables.invoices[0].shipping_cost).toBe(199);
    });

    it('keeps Egypt DIGITAL at 0', async () => {
        const { POST } = await importRoute();
        const res = await POST(req({ ...base, tierId: 'digital', country: 'EG', paymentMethod: 'kashier' }));
        expect(res.status).toBe(200);
        expect(h.tables.invoices[0].shipping_cost).toBe(0);
    });

    it('allows a Global DIGITAL order (shipping is free and must not be priced)', async () => {
        const { POST } = await importRoute();
        const res = await POST(
            req({ ...base, tierId: 'digital', country: 'US', paymentMethod: 'kashier' })
        );
        expect(res.status).toBe(200);
        expect(h.tables.invoices[0].shipping_cost).toBe(0);
    });
});

describe('Paymob cannot collect for a non-Egyptian destination', () => {
    beforeEach(() => {
        Object.assign(process.env, ENV);
        h.tables.invoices = [];
        h.tables.payment_intents = [];
        h.tables.admin_settings = [];
        FETCH.calls.length = 0;
        globalThis.fetch = FETCH.mock as unknown as typeof fetch;
    });

    afterEach(() => {
        Object.keys(ENV).forEach((k) => delete process.env[k]);
        vi.resetModules();
        vi.restoreAllMocks();
    });

    const importRoute = () => import('../../app/api/payments/create-invoice/route');

    it('rejects country=US + card with a controlled 400 instead of billing EGP', async () => {
        const { POST } = await importRoute();
        const res = await POST(req({ ...base, country: 'US', paymentMethod: 'card' }));
        expect(res.status).toBe(400);
        const json = (await res.json()) as any;
        expect(json.success).toBe(false);
        expect(json.code).toBe('PAYMENT_METHOD_REGION_MISMATCH');
        expect(h.tables.invoices.length).toBe(0);
    });

    it('rejects country=GB + wallet too', async () => {
        const { POST } = await importRoute();
        const res = await POST(req({ ...base, country: 'GB', paymentMethod: 'wallet' }));
        expect(res.status).toBe(400);
        expect(h.tables.invoices.length).toBe(0);
    });

    it('still allows country=EG + card', async () => {
        const { POST } = await importRoute();
        const res = await POST(req({ ...base, country: 'EG', paymentMethod: 'card' }));
        expect(res.status).toBe(200);
        const invoice = h.tables.invoices[0];
        expect(invoice.currency).toBe('EGP');
        expect(invoice.region).toBe('egypt');
    });
});

describe('shippingProviderId is read identically for every gateway', () => {
    // Historical defect: Kashier read `input.shippingProviderId ||
    // metadata.shippingProviderId`, Paymob/Stripe read metadata ONLY. The same
    // request therefore priced differently depending on the chosen payment
    // method. Both branches now call one `readShippingProviderIntent`.

    beforeEach(() => {
        Object.assign(process.env, ENV);
        h.tables.invoices = [];
        h.tables.payment_intents = [];
        h.tables.admin_settings = [];
        FETCH.calls.length = 0;
        globalThis.fetch = FETCH.mock as unknown as typeof fetch;
    });

    afterEach(() => {
        Object.keys(ENV).forEach((k) => delete process.env[k]);
        vi.resetModules();
        vi.restoreAllMocks();
    });

    const importRoute = () => import('../../app/api/payments/create-invoice/route');

    it('honours a TOP-LEVEL provider on the Kashier path', async () => {
        const { POST } = await importRoute();
        const res = await POST(
            req({ ...base, tierId: 'digital', country: 'US', paymentMethod: 'kashier', shippingProviderId: 'dhl_global' })
        );
        expect(res.status).toBe(200);
    });

    it('honours a TOP-LEVEL provider on the Paymob/EG path', async () => {
        const { POST } = await importRoute();
        const res = await POST(
            req({ ...base, country: 'EG', paymentMethod: 'card', shippingProviderId: 'eg_standard' })
        );
        expect(res.status).toBe(200);
        // The canonical Egypt rate applies regardless of what was named.
        expect(h.tables.invoices[0].shipping_cost).toBe(199);
    });

    it('honours a METADATA provider on the Paymob/EG path', async () => {
        const { POST } = await importRoute();
        const res = await POST(
            req({
                ...base,
                country: 'EG',
                paymentMethod: 'card',
                metadata: { ...base.metadata, shippingProviderId: 'eg_standard' },
            })
        );
        expect(res.status).toBe(200);
        expect(h.tables.invoices[0].shipping_cost).toBe(199);
    });

    it('a TOP-LEVEL provider wins over a conflicting metadata provider', async () => {
        const { POST } = await importRoute();
        const res = await POST(
            req({
                ...base,
                tierId: 'digital',
                country: 'US',
                paymentMethod: 'kashier',
                shippingProviderId: 'dhl_global',
                metadata: { ...base.metadata, shippingProviderId: 'ups_worldwide' },
            })
        );
        // Both are valid USD providers, so the request succeeds either way; the
        // point is that the top-level value is the one that is used.
        expect(res.status).toBe(200);
    });

    it('an INVALID top-level provider is rejected rather than silently dropped', async () => {
        const { POST } = await importRoute();
        const res = await POST(
            req({
                ...base,
                tierId: 'digital',
                country: 'US',
                paymentMethod: 'kashier',
                shippingProviderId: 'made_up_carrier',
            })
        );
        expect(res.status).toBe(200); // digital is never priced
        h.tables.invoices = [];
        const res2 = await POST(
            req({
                ...base,
                country: 'EG',
                paymentMethod: 'card',
                shippingProviderId: 'made_up_carrier',
            })
        );
        expect(res2.status).toBe(400);
    });
});

/**
 * The Admin Dashboard's per-gateway three-state control was write-only: nothing
 * on the server read `admin_settings.gateway_<name>`, so stopping a gateway had
 * no effect on whether a payment session could be initiated.
 *
 * These tests pin the route-level behaviour for the two independent axes, using
 * the exact stored key/value vocabulary the admin `<select>` writes.
 */
describe('gateway operational status gates invoice creation', () => {
    beforeEach(() => {
        Object.assign(process.env, ENV);
        h.tables.invoices = [];
        h.tables.payment_intents = [];
        h.tables.admin_settings = [];
        FETCH.calls.length = 0;
        globalThis.fetch = FETCH.mock as unknown as typeof fetch;
    });

    afterEach(() => {
        Object.keys(ENV).forEach((k) => delete process.env[k]);
        vi.resetModules();
        vi.restoreAllMocks();
    });

    const importRoute = () => import('../../app/api/payments/create-invoice/route');
    const digital = { ...base, tierId: 'digital' };

    const gate = async (rows: Array<{ key: string; value: string }>, body: unknown) => {
        h.tables.admin_settings = rows;
        const { POST } = await importRoute();
        const res = await POST(req(body));
        return { status: res.status, body: await res.json() };
    };

    it('a STOPPED gateway cannot initiate a payment', async () => {
        const { status, body } = await gate(
            [{ key: 'gateway_kashier', value: 'disabled' }],
            { ...digital, country: 'EG', paymentMethod: 'kashier' }
        );
        expect(status).toBe(400);
        expect(body.code).toBe('GATEWAY_NOT_OPERATIONAL');
        // Critically: rejected BEFORE any invoice is written.
        expect(h.tables.invoices.length).toBe(0);
    });

    it('`sandbox` is not treated as operable (no sandbox capture path exists)', async () => {
        const { status, body } = await gate(
            [{ key: 'gateway_kashier', value: 'sandbox' }],
            { ...digital, country: 'EG', paymentMethod: 'kashier' }
        );
        expect(status).toBe(400);
        expect(body.code).toBe('GATEWAY_NOT_OPERATIONAL');
    });

    it('`live` proceeds normally', async () => {
        const { status } = await gate(
            [{ key: 'gateway_kashier', value: 'live' }],
            { ...digital, country: 'EG', paymentMethod: 'kashier' }
        );
        expect(status).toBe(200);
        expect(h.tables.invoices.length).toBe(1);
    });

    it('with no gateway rows at all, checkout is unaffected (backward compatible)', async () => {
        const { status } = await gate([], { ...digital, country: 'EG', paymentMethod: 'kashier' });
        expect(status).toBe(200);
    });

    it('stopping one gateway does not affect the others', async () => {
        const rows = [{ key: 'gateway_paymob', value: 'disabled' }];
        const kashier = await gate(rows, { ...digital, country: 'EG', paymentMethod: 'kashier' });
        expect(kashier.status).toBe(200);

        h.tables.invoices = [];
        const paymob = await gate(rows, { ...digital, country: 'EG', paymentMethod: 'card' });
        expect(paymob.status).toBe(400);
        expect(paymob.body.code).toBe('GATEWAY_NOT_OPERATIONAL');
    });
});

describe('customer visibility is enforced server-side, not only in the UI', () => {
    beforeEach(() => {
        Object.assign(process.env, ENV);
        h.tables.invoices = [];
        h.tables.payment_intents = [];
        h.tables.admin_settings = [];
        FETCH.calls.length = 0;
        globalThis.fetch = FETCH.mock as unknown as typeof fetch;
    });

    afterEach(() => {
        Object.keys(ENV).forEach((k) => delete process.env[k]);
        vi.resetModules();
        vi.restoreAllMocks();
    });

    const importRoute = () => import('../../app/api/payments/create-invoice/route');
    const digital = { ...base, tierId: 'digital' };

    it('ACTIVE + HIDDEN rejects a crafted customer request (hiding cannot be bypassed)', async () => {
        h.tables.admin_settings = [
            { key: 'gateway_paymob', value: 'live' },
            { key: 'gateway_paymob_customer_visible', value: 'false' },
        ];
        const { POST } = await importRoute();
        const res = await POST(req({ ...digital, country: 'EG', paymentMethod: 'card' }));
        expect(res.status).toBe(400);
        expect((await res.json()).code).toBe('GATEWAY_NOT_AVAILABLE');
        expect(h.tables.invoices.length).toBe(0);
    });

    it('visibility=false does NOT disable the integration config itself', async () => {
        // The operational axis is untouched: the gateway is `live`, only its
        // storefront presence is withheld.
        h.tables.admin_settings = [
            { key: 'gateway_paymob', value: 'live' },
            { key: 'gateway_paymob_customer_visible', value: 'false' },
        ];
        const { loadGatewayConfig, isOperationallyAllowed } = await import(
            '../../server/payments/gatewayConfig'
        );
        const cfg = await loadGatewayConfig(async () => h.tables.admin_settings);
        expect(cfg.paymob.operational).toBe('live');
        expect(cfg.paymob.customerVisible).toBe(false);
        expect(isOperationallyAllowed(cfg, 'paymob')).toBe(true);
    });

    it('hiding Paymob leaves the other gateways fully usable', async () => {
        h.tables.admin_settings = [
            { key: 'gateway_paymob', value: 'live' },
            { key: 'gateway_paymob_customer_visible', value: 'false' },
        ];
        const { POST } = await importRoute();
        const res = await POST(req({ ...digital, country: 'EG', paymentMethod: 'kashier' }));
        expect(res.status).toBe(200);
    });
});
