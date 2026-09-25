/**
 * P0 regression — InstaPay must build the CANONICAL payment chain.
 *
 * Defect (QA 2026-09-25): the route header promised
 *   "Create Order + Invoice + PaymentIntent (like Kashier flow)"
 * but the implementation inserted only `orders` + `payment_receipts`.
 * Consequences:
 *   - No `invoices` row  -> `fulfillmentService` could never resolve the
 *     capture, so an InstaPay order could never be fulfilled or reconciled.
 *   - No `payment_intents` row -> the §6.3 ledger FK (payment_intents.id) had
 *     nothing to attach to even if an invoice had existed.
 *   - `payment_receipts.invoice_id` stored the human reference `MRX-...`
 *     instead of an invoice identifier. The column is `text`, so the wrong
 *     value type-checked and never raised.
 *
 * This suite drives the real route handler against a recording fake and asserts
 * the linkage, plus the money-state rule:
 *   receipt submitted  !=  payment verified  !=  invoice paid
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://mock.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role';

const inserts: Record<string, Record<string, unknown>[]> = {
    invoices: [],
    payment_intents: [],
    orders: [],
    payment_receipts: [],
};

let generatedInvoiceId = 'inv-instapay-1';
let generatedIntentId = 'pi-instapay-1';
let generatedOrderId = 'order-instapay-1';
let generatedReceiptId = 'rc-instapay-1';

const idFor = (table: string) =>
    ({
        invoices: generatedInvoiceId,
        payment_intents: generatedIntentId,
        orders: generatedOrderId,
        payment_receipts: generatedReceiptId,
    })[table] ?? 'id-1';

const makeChain = (table: string) => {
    const c: Record<string, unknown> = {};
    c.select = () => c;
    c.insert = (payload: Record<string, unknown>) => {
        inserts[table]?.push(payload);
        return c;
    };
    c.update = () => c;
    c.delete = () => ({ eq: vi.fn(async () => ({ error: null })) });
    c.eq = () => c;
    c.order = () => c;
    c.limit = () => c;
    c.maybeSingle = () => Promise.resolve({ data: null, error: null });
    c.single = () => Promise.resolve({ data: { id: idFor(table) }, error: null });
    return c;
};

vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        from: (table: string) => makeChain(table),
        storage: {
            from: () => ({
                upload: () => Promise.resolve({ data: { path: 'p/receipt.png' }, error: null }),
                getPublicUrl: (p: string) => ({ data: { publicUrl: `https://mock/${p}` } }),
                remove: () => Promise.resolve({ data: [], error: null }),
            }),
        },
    }),
}));

const LIMIT = { raw: 0 };
let rateLimitCalls = 0;
vi.mock('../../lib/ratelimit', () => ({
    clientIp: () => '10.0.0.9',
    enforceRateLimit: () => {
        rateLimitCalls += 1;
        return Promise.resolve({ success: true, remaining: 9, limit: 10 });
    },
}));

vi.mock('../../server/auth/resolveUser', () => ({
    resolveEffectiveUserId: () => Promise.resolve({ success: true, effectiveUserId: null }),
}));

// The REAL shipping resolver must run here. Stubbing it to a constant is exactly
// the defect under test: InstaPay used to call `resolveShippingCost` with a
// hard-coded provider, so a DIGITAL download was charged local shipping.
vi.mock('../../server/payments/pricing', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../server/payments/pricing')>();
    return {
        ...actual,
        computeAmount: (cfg: any, i: any) => (i.tierId === 'bundle' ? 749 : 499),
        computePromoDiscount: () => 0,
    };
});

const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);

function buildForm(tierId = 'digital'): FormData {
    const fd = new FormData();
    fd.set(
        'data',
        JSON.stringify({
            tierId,
            customerName: 'QA Customer',
            email: 'qa@example.com',
            phoneNumber: '01000000000',
            locale: 'en',
            quantity: 1,
        })
    );
    fd.set('receipt', new File([pngBytes], 'receipt.png', { type: 'image/png' }));
    return fd;
}

async function submit(tierId = 'digital'): Promise<{ status: number; body: any }> {
    const { POST } = await import('../../app/api/checkout/instapay/route');
    const req = new Request('https://www.mrxsteroid.com/api/checkout/instapay', {
        method: 'POST',
        body: buildForm(tierId),
    });
    const res = (await POST(req as never)) as unknown as Response;
    return { status: res.status, body: await res.json() };
}

beforeEach(() => {
    for (const k of Object.keys(inserts)) inserts[k] = [];
    rateLimitCalls = 0;
    void LIMIT;
});

describe('InstaPay canonical payment chain', () => {
    it('creates an invoice, a payment intent, an order and a receipt', async () => {
        const { status } = await submit();
        expect(status).toBe(201);
        expect(inserts.invoices).toHaveLength(1);
        expect(inserts.payment_intents).toHaveLength(1);
        expect(inserts.orders).toHaveLength(1);
        expect(inserts.payment_receipts).toHaveLength(1);
    });

    it('links the order to the real invoice id', async () => {
        await submit();
        expect(inserts.orders[0].invoice_id).toBe(generatedInvoiceId);
    });

    it('links the payment intent to the real invoice id', async () => {
        await submit();
        expect(inserts.payment_intents[0].invoice_id).toBe(generatedInvoiceId);
    });

    it('stores the REAL invoice id on the receipt, never the MRX- reference', async () => {
        await submit();
        const receipt = inserts.payment_receipts[0];
        expect(receipt.invoice_id).toBe(generatedInvoiceId);
        expect(String(receipt.invoice_id)).not.toMatch(/^MRX-/);
    });

    it('keeps the human MRX- reference in metadata.orderRef', async () => {
        await submit();
        const meta = inserts.payment_receipts[0].metadata as Record<string, unknown>;
        expect(String(meta.orderRef)).toMatch(/^MRX-/);
        expect(meta.invoiceId).toBe(generatedInvoiceId);
    });

    it('records the payment intent id on the receipt', async () => {
        await submit();
        const meta = inserts.payment_receipts[0].metadata as Record<string, unknown>;
        expect(meta.paymentIntentId).toBe(generatedIntentId);
    });

    it('never marks the invoice paid on receipt submission', async () => {
        await submit();
        const invoice = inserts.invoices[0];
        expect(invoice.payment_status).toBe('pending');
        expect(invoice.status).toBe('pending');
        expect(invoice.paid_at).toBeUndefined();
    });

    it('never marks the payment intent succeeded on receipt submission', async () => {
        await submit();
        expect(inserts.payment_intents[0].status).toBe('initiated');
    });

    it('keeps the order pending for manual review, not paid', async () => {
        await submit();
        expect(inserts.orders[0].status).toBe('pending_manual_review');
        expect(inserts.orders[0].payment_status).toBe('pending');
    });

    it('keeps the receipt pending_review, not verified', async () => {
        await submit();
        expect(inserts.payment_receipts[0].status).toBe('pending_review');
    });

    it('returns the invoice id and intent id to the client', async () => {
        const { body } = await submit();
        expect(body.invoiceId).toBe(generatedInvoiceId);
        expect(body.paymentIntentId).toBe(generatedIntentId);
        expect(body.success).toBe(true);
    });

    it('still preserves the M1A rail context on the order', async () => {
        await submit();
        const o = inserts.orders[0];
        expect(o.region).toBe('EG');
        expect(o.currency).toBe('EGP');
        expect(o.payment_method).toBe('instapay');
        expect(o.source_channel).toBe('web_checkout');
    });

    it('still rate-limits the route', async () => {
        await submit();
        expect(rateLimitCalls).toBe(1);
    });

    it('sets gateway=instapay and keeps the invoice idempotency key namespaced', async () => {
        await submit();
        const inv = inserts.invoices[0];
        expect(inv.gateway).toBe('instapay');
        expect(String(inv.idempotency_key)).toMatch(/^instapay:/);
    });
});

describe('InstaPay shipping follows the canonical resolver', () => {
    // Defect (QA 2026-09-25): the route called
    //     resolveShippingCost(pricing, 'eg_standard', 0, 'EGP')
    // UNCONDITIONALLY, so a digital download was charged local shipping.
    // Rule: digital = 0, physical = the canonical server-priced amount.

    it('charges ZERO shipping for a DIGITAL product', async () => {
        const { status } = await submit('digital');
        expect(status).toBe(201);
        expect(inserts.invoices[0].shipping_cost).toBe(0);
    });

    it('charges ZERO shipping for a digital_plus product', async () => {
        const { status } = await submit('digital_plus');
        expect(status).toBe(201);
        expect(inserts.invoices[0].shipping_cost).toBe(0);
    });

    it('charges ZERO shipping for a pdf product', async () => {
        const { status } = await submit('pdf');
        expect(status).toBe(201);
        expect(inserts.invoices[0].shipping_cost).toBe(0);
    });

    it('charges the CANONICAL shipping amount for a PHYSICAL product', async () => {
        const { status } = await submit('bundle');
        expect(status).toBe(201);
        // 199 EGP — the approved business price, never the rejected 239.
        expect(inserts.invoices[0].shipping_cost).toBe(199);
        expect(inserts.invoices[0].shipping_cost).not.toBe(239);
    });

    it('digital total equals the product price with no shipping added', async () => {
        await submit('digital');
        const inv = inserts.invoices[0];
        expect(inv.amount).toBe(inv.subtotal ?? inv.amount);
        expect(Number(inv.amount)).toBe(499);
    });

    it('physical total is the product price plus canonical shipping', async () => {
        await submit('bundle');
        expect(Number(inserts.invoices[0].amount)).toBe(749 + 199);
    });

    it('the receipt records the same canonical amount as the invoice', async () => {
        await submit('bundle');
        expect(Number(inserts.payment_receipts[0].amount)).toBe(
            Number(inserts.invoices[0].amount)
        );
    });
});