/**
 * Integration tests for /api/payments/create-invoice Kashier delegation (Phase 4).
 *
 * Proves that the legacy `create-invoice` route, when asked for `kashier`,
 * delegates to the single checkout session service instead of the legacy
 * gateway.createInvoice flow:
 *   - a v3 Payment Session is minted via the configured test endpoint,
 *   - the invoice gains idempotency_key + kashier session linkage,
 *   - a payment_intents row is created and linked,
 *   - validation errors map to 400 and never leak a Paymob/legacy path.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const h = vi.hoisted(() => {
    const tables: Record<string, any[]> = {};
    const nextId = () => `row-${Math.random().toString(36).slice(2, 10)}`;

    const load = (table: string) => {
        if (!tables[table]) tables[table] = [];
        return tables[table];
    };

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
                return dir === "desc" ? -cmp : cmp;
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
        chain.order = function (this: any, col: string, opts?: { ascending?: boolean }) {
            state.order = { col, dir: opts?.ascending === false ? "desc" : "asc" };
            return this;
        };
        chain.then = (onOk: any, onErr: any) =>
            Promise.resolve({ data: queryRows(table, state), error: null }).then(onOk, onErr);
        chain.maybeSingle = async () => {
            const rows = queryRows(table, state);
            return { data: rows[0] ?? null, error: null };
        };
        chain.single = async () => {
            const rows = queryRows(table, state);
            if (rows.length === 0) return { data: null, error: { message: `no rows in ${table}` } };
            return { data: rows[0], error: null };
        };
        chain.insert = (rows: any) => {
            const arr = Array.isArray(rows) ? rows : [rows];
            const c = Object.create(chain);
            c.select = (cols?: string) => {
                state.cols = cols;
                return c;
            };
            c.single = async () => {
                const row = { ...arr[0], id: arr[0].id || nextId() };
                load(table).push(row);
                if (state.cols === "id") return { data: { id: row.id }, error: null };
                return { data: row, error: null };
            };
            c.maybeSingle = c.single;
            return c;
        };
        chain.update = (patch: any) => {
            const c = Object.create(chain);
            c.select = () => c;
            c.then = (onOk: any) => {
                const rows = queryRows(table, state);
                rows.forEach((r) => Object.assign(r, patch, { id: r.id }));
                return Promise.resolve({ data: rows, error: null }).then(onOk);
            };
            return c;
        };
        return chain;
    };

    return {
        tables,
        createClientMock: vi.fn(() => ({
            from: (table: string) => makeQuery(table),
        })),
    };
});

vi.mock("@supabase/supabase-js", () => ({
    createClient: h.createClientMock,
}));

const KASHIER_ENV = {
    SUPABASE_SERVICE_ROLE_KEY: "svc_route_test",
    NEXT_PUBLIC_SUPABASE_URL: "https://route-test.supabase.co",
    KASHIER_MODE: "test",
    KASHIER_TEST_MERCHANT_ID: "MID_EG_ROUTE",
    KASHIER_TEST_PAYMENT_API_KEY: "KEY_EG_ROUTE",
    KASHIER_TEST_SECRET_KEY: "SEC_EG_ROUTE",
    KASHIER_GLOBAL_MERCHANT_ID: "MID_GLOBAL_ROUTE",
    KASHIER_GLOBAL_PAYMENT_API_KEY: "KEY_GLOBAL_ROUTE",
    KASHIER_GLOBAL_SECRET_KEY: "SEC_GLOBAL_ROUTE",
};

const FH = vi.hoisted(() => {
    const calls: Array<{ url: string; init: RequestInit | undefined }> = [];
    return {
        calls,
        mock: vi.fn(async (url: unknown, init?: RequestInit) => {
            calls.push({ url: String(url), init });
            return {
                ok: true,
                json: async () => ({
                    sessionId: "sess-route-deleg",
                    sessionUrl: "https://checkout.kashier.io/payment/sess-route-deleg",
                    status: "ACTIVE",
                }),
            };
        }),
    };
});

const post = (body: unknown) =>
    h.createClientMock.mock.results.length > 0 && false; // keep ts quiet

function req(body: unknown): Request {
    return new Request("http://localhost/api/payments/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("create-invoice Kashier delegation (Phase 4)", () => {
    beforeEach(() => {
        Object.assign(process.env, KASHIER_ENV);
        h.tables.invoices = [];
        h.tables.payment_intents = [];
        h.tables.admin_settings = [];
        FH.calls.length = 0;
        globalThis.fetch = FH.mock as unknown as typeof fetch;
    });

    afterEach(() => {
        Object.keys(KASHIER_ENV).forEach((k) => delete process.env[k]);
        vi.resetModules();
        vi.restoreAllMocks();
    });

    const importRoute = () => import("../../app/api/payments/create-invoice/route");

    it("EG digital Kashier delegates to the checkout session service (no legacy clientSecret)", async () => {
        const { POST } = await importRoute();
        const res = await POST(req({
            tierId: "digital",
            country: "EG",
            email: "deleg@example.com",
            fullName: "Deleg Buyer",
            paymentMethod: "kashier",
        }));
        expect(res.status).toBe(200);
        const json = (await res.json()) as any;
        expect(json.success).toBe(true);
        expect(json.gateway).toBe("kashier");
        expect(json.redirectUrl).toBe("https://checkout.kashier.io/payment/sess-route-deleg");
        expect(json.invoiceId).toBeTruthy();
        expect(json.idempotent).toBe(false);

        const invoice = h.tables.invoices[0];
        expect(invoice).toBeDefined();
        expect(invoice.gateway).toBe("kashier");
        expect(invoice.region).toBe("egypt");
        expect(invoice.amount).toBe(499);
        expect(invoice.currency).toBe("EGP");
        expect(invoice.idempotency_key).toBeTruthy();
        expect(invoice.kashier_session_id).toBe("sess-route-deleg");
        expect(invoice.kashier_session_url).toBe("https://checkout.kashier.io/payment/sess-route-deleg");

        const intent = h.tables.payment_intents[0];
        expect(intent).toBeDefined();
        expect(intent.attempt_number).toBe(1);
        expect(intent.is_current).toBe(true);
        expect(intent.amount_minor).toBe(49900);
        expect(intent.provider_order_id).toBe("sess-route-deleg");

        expect(FH.calls.length).toBe(1);
        expect(FH.calls[0].url).toContain("test-api.kashier.io/v3/payment/sessions");
        const headers = (FH.calls[0].init?.headers || {}) as Record<string, string>;
        expect(headers.Authorization).toBe("SEC_EG_ROUTE");
        expect(headers["api-key"]).toBe("KEY_EG_ROUTE");
        expect(String(headers.Authorization || "").startsWith("Bearer")).toBe(false);
    });

    it("EG physical order requires shipping details (validation → 400)", async () => {
        const { POST } = await importRoute();
        const res = await POST(req({
            tierId: "bundle",
            country: "EG",
            email: "phys@example.com",
            fullName: "Physical Buyer",
            paymentMethod: "kashier",
        }));
        expect(res.status).toBe(400);
        const json = (await res.json()) as any;
        expect(json.success).toBe(false);
        expect(json.error).toContain("shipping");
        expect(h.tables.invoices.length).toBe(0);
        expect(FH.calls.length).toBe(0);
    });

    it("EG physical order delegates and prices server-side (749 + shipping 199 = 948 EGP)", async () => {
        const { POST } = await importRoute();
        const res = await POST(req({
            tierId: "bundle",
            country: "EG",
            email: "phys2@example.com",
            fullName: "Physical Buyer Two",
            paymentMethod: "kashier",
            metadata: {
                address: "10 Nile St",
                city: "Cairo",
                zipCode: "11511",
            },
        }));
        expect(res.status).toBe(200);
        const json = (await res.json()) as any;
        expect(json.success).toBe(true);
        const invoice = h.tables.invoices[0];
        expect(invoice.amount).toBe(948);
        expect(invoice.shipping_cost).toBe(199);
        expect(invoice.discount_amount).toBe(0);
        expect(invoice.customer_name).toBe("Physical Buyer Two");
        expect(invoice.phone_number).toBeNull();
        expect(invoice.metadata.address).toBe("10 Nile St");
    });

    it("GLOBAL Kashier uses legacy KASHIER_GLOBAL_* merchant and USD pricing", async () => {
        const { POST } = await importRoute();
        const res = await POST(req({
            tierId: "digital",
            country: "US",
            email: "global@example.com",
            fullName: "Global Buyer",
            paymentMethod: "kashier",
        }));
        expect(res.status).toBe(200);
        const json = (await res.json()) as any;
        expect(json.success).toBe(true);
        expect(json.region).toBe("GLOBAL");
        const invoice = h.tables.invoices[0];
        expect(invoice.region).toBe("global");
        expect(invoice.currency).toBe("USD");
        expect(invoice.amount).toBe(49.99);
        expect(invoice.payment_provider_merchant).toBe("kashier_global");
    });

    it("GLOBAL physical Kashier with no shipping provider is REJECTED, not free shipping", async () => {
        const { POST } = await importRoute();
        const res = await POST(req({
            tierId: "bundle",
            country: "US",
            email: "global-phys@example.com",
            fullName: "Global Physical Buyer",
            paymentMethod: "kashier",
            metadata: { address: "1 Test Ave", city: "NY", zipCode: "10001" },
        }));
        // A Global physical order has no declared default carrier, so the server
        // must refuse rather than fall back to the client's shippingCost (0).
        expect(res.status).toBe(400);
        const json = (await res.json()) as any;
        expect(json.success).toBe(false);
        expect(json.code).toBe("SHIPPING_UNAVAILABLE");
        expect(h.tables.invoices).toHaveLength(0);
    });

    it("GLOBAL physical is BLOCKED even when an explicit configured provider is named", async () => {
        // This test previously asserted the OPPOSITE outcome (200 + a priced
        // invoice at 38 USD via `fedex_priority`). That contradicted the
        // canonical decision GLOBAL physical = BLOCKED and made the block
        // depend on the shape of the shipping config instead of the business
        // decision. A configured provider is now insufficient: naming a real
        // provider must not buy a shopper a global shipping price.
        const { POST } = await importRoute();
        const res = await POST(req({
            tierId: "bundle",
            country: "US",
            email: "global-phys2@example.com",
            fullName: "Global Physical Buyer Two",
            paymentMethod: "kashier",
            shippingProviderId: "fedex_priority",
            metadata: { address: "1 Test Ave", city: "NY", zipCode: "10001" },
        }));
        expect(res.status).toBe(400);
        const json = (await res.json()) as any;
        expect(json.success).toBe(false);
        expect(json.code).toBe("SHIPPING_UNAVAILABLE");
        // No invoice, no payment intent, no session — and no price leaked.
        expect(h.tables.invoices).toHaveLength(0);
        expect(h.tables.payment_intents).toHaveLength(0);
    });

    it("GLOBAL physical ignores a client-supplied shipping price and never falls back to 0", async () => {
        // A physical global order must be refused, not silently shipped free.
        const { POST } = await importRoute();
        const res = await POST(req({
            tierId: "bundle",
            country: "US",
            email: "global-phys3@example.com",
            fullName: "Global Physical Buyer Three",
            paymentMethod: "kashier",
            shippingProviderId: "fedex_priority",
            shippingCost: 0,
            metadata: { address: "1 Test Ave", city: "NY", zipCode: "10001" },
        }));
        expect(res.status).toBe(400);
        expect(h.tables.invoices).toHaveLength(0);
    });

    it("rejects an unknown shipping provider even for an EG order", async () => {
        const { POST } = await importRoute();
        const res = await POST(req({
            tierId: "bundle",
            country: "EG",
            email: "bad-provider@example.com",
            fullName: "Bad Provider Buyer",
            paymentMethod: "kashier",
            shippingProviderId: "totally_made_up",
            metadata: { address: "10 Nile St", city: "Cairo", zipCode: "11511" },
        }));
        expect(res.status).toBe(400);
        const json = (await res.json()) as any;
        expect(json.code).toBe("SHIPPING_UNAVAILABLE");
        expect(h.tables.invoices).toHaveLength(0);
    });
});