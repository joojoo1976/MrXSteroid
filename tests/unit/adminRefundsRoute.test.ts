import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const h = vi.hoisted(() => ({
    requireAdmin: vi.fn(),
    client: null as unknown,
}));

vi.mock('@supabase/supabase-js', () => ({ createClient: () => h.client }));
vi.mock('../../server/auth/require-admin', () => ({
    requireAdmin: (...args: unknown[]) => h.requireAdmin(...args),
}));

import { POST } from '../../app/api/admin/refunds/route';

type Row = Record<string, unknown>;

function fakeDb(seed: Record<string, Row[]>, insertErrors: Record<string, { message: string }> = {}) {
    const tables: Record<string, Row[]> = {
        invoices: [],
        payment_intents: [],
        refunds: [],
        entitlements: [],
        profiles: [],
        ...seed,
    };
    let seq = 0;

    const make = (table: string) => {
        const q: any = {
            action: 'select',
            payload: null as Row | null,
            filters: [] as Array<[string, unknown]>,
            limitN: null as number | null,
            select() { return q; },
            insert(payload: Row) { q.action = 'insert'; q.payload = payload; return q; },
            update(payload: Row) { q.action = 'update'; q.payload = payload; return q; },
            upsert(payload: Row) { q.action = 'insert'; q.payload = payload; return q; },
            eq(column: string, value: unknown) { q.filters.push([column, value]); return q; },
            order() { return q; },
            limit(n: number) { q.limitN = n; return q; },
            maybeSingle() { return q.exec('one'); },
            single() { return q.exec('one'); },
            then(resolve: (v: unknown) => unknown, reject?: (r: unknown) => unknown) {
                return q.exec('many').then(resolve, reject);
            },
            async exec(mode: 'one' | 'many') {
                const rows = tables[table] || (tables[table] = []);
                const matches = rows.filter((row) =>
                    q.filters.every(([column, value]: [string, unknown]) => row[column] === value)
                );
                if (q.action === 'insert') {
                    if (insertErrors[table]) return { data: null, error: insertErrors[table] };
                    const inserted = { id: `${table}-${++seq}`, ...q.payload };
                    rows.push(inserted);
                    return { data: inserted, error: null };
                }
                if (q.action === 'update') {
                    for (const row of matches) Object.assign(row, q.payload);
                    return { data: matches, error: null };
                }
                const limited = q.limitN ? matches.slice(0, q.limitN) : matches;
                return { data: mode === 'one' ? (limited[0] ?? null) : limited, error: null };
            },
        };
        return q;
    };

    return {
        client: { from: (table: string) => make(table) },
        tables,
    };
}

const INVOICE_UUID = '11111111-1111-4111-8111-111111111111';

const baseSeed = (): Record<string, Row[]> => ({
    invoices: [{ id: INVOICE_UUID, amount: 499, currency: 'EGP', user_id: 'user-1' }],
    payment_intents: [{ id: 'pi-1', invoice_id: INVOICE_UUID, attempt_number: 1 }],
    entitlements: [{ id: 'ent-1', user_id: 'user-1', product_id: 'digital', invoice_id: INVOICE_UUID, status: 'granted' }],
    profiles: [{ id: 'user-1', has_paid: true }],
});

function makeRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/admin/refunds', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('POST /api/admin/refunds', () => {
    beforeEach(() => {
        process.env.SUPABASE_URL = 'https://example.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test';
        h.requireAdmin.mockReset();
    });

    it('returns the admin guard response when unauthorized', async () => {
        h.requireAdmin.mockResolvedValue({
            authorized: false,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        });

        const res = await POST(makeRequest({ invoiceId: 'inv-1', reason: 'x' }));
        expect(res.status).toBe(401);
    });

    it('rejects invalid bodies before touching the database', async () => {
        h.requireAdmin.mockResolvedValue({ authorized: true, user: { id: 'admin-1' }, profile: { role: 'admin' } });
        h.client = fakeDb(baseSeed()).client;

        const res = await POST(makeRequest({ invoiceId: 'not-a-uuid', reason: 'ok' }));
        expect(res.status).toBe(400);

        const res2 = await POST(makeRequest({ invoiceId: '11111111-1111-4111-8111-111111111111', reason: 'x' }));
        expect(res2.status).toBe(400); // reason too short
    });

    it('records a requested refund without revoking access', async () => {
        const db = fakeDb(baseSeed());
        h.client = db.client;
        h.requireAdmin.mockResolvedValue({ authorized: true, user: { id: 'admin-1' }, profile: { role: 'admin' } });

        const res = await POST(makeRequest({
            invoiceId: INVOICE_UUID,
            reason: 'customer asked for a refund',
            amountMinor: 49900,
            provider: 'kashier',
            providerReference: 'kref-route-1',
        }));

        const body = await res.json();
        expect(res.status).toBe(201);
        expect(body.success).toBe(true);
        expect(body.status).toBe('requested');
        expect(body.accessRevoked).toBe(false);
        expect(db.tables.refunds[0]).toMatchObject({
            amount_minor: 49900,
            status: 'requested',
            requested_by: 'admin-1',
        });
        expect(db.tables.profiles[0].has_paid).toBe(true);
    });

    it('applies the access policy for a completed full refund', async () => {
        const db = fakeDb(baseSeed());
        h.client = db.client;
        h.requireAdmin.mockResolvedValue({ authorized: true, user: { id: 'admin-1' }, profile: { role: 'admin' } });

        const res = await POST(makeRequest({
            invoiceId: INVOICE_UUID,
            reason: 'refunded in gateway dashboard',
            status: 'completed',
        }));

        const body = await res.json();
        expect(res.status).toBe(201);
        expect(body.fullRefund).toBe(true);
        expect(body.accessRevoked).toBe(true);
        expect(body.hasPaidCleared).toBe(true);
        expect(db.tables.profiles[0].has_paid).toBe(false);
    });

    it('returns 404 for an unknown invoice', async () => {
        h.client = fakeDb({ invoices: [], payment_intents: [] }).client;
        h.requireAdmin.mockResolvedValue({ authorized: true, user: { id: 'admin-1' }, profile: { role: 'admin' } });

        const res = await POST(makeRequest({
            invoiceId: '22222222-2222-4222-8222-222222222222',
            reason: 'unknown invoice',
        }));
        expect(res.status).toBe(404);
    });

    it('returns 409 when the invoice has no payment intent', async () => {
        const db = fakeDb({ invoices: baseSeed().invoices, payment_intents: [] });
        db.tables.invoices[0].id = '33333333-3333-4333-8333-333333333333';
        h.client = db.client;
        h.requireAdmin.mockResolvedValue({ authorized: true, user: { id: 'admin-1' }, profile: { role: 'admin' } });

        const res = await POST(makeRequest({
            invoiceId: '33333333-3333-4333-8333-333333333333',
            reason: 'no intent',
        }));
        const body = await res.json();
        expect(res.status).toBe(409);
        expect(body.code).toBe('PAYMENT_INTENT_NOT_FOUND');
    });

    it('returns 409 for a duplicate provider reference', async () => {
        const db = fakeDb(baseSeed());
        h.client = db.client;
        h.requireAdmin.mockResolvedValue({ authorized: true, user: { id: 'admin-1' }, profile: { role: 'admin' } });

        const payload = {
            invoiceId: INVOICE_UUID,
            reason: 'first recording',
            provider: 'kashier',
            providerReference: 'kref-dup-route',
        };
        expect((await POST(makeRequest(payload))).status).toBe(201);
        expect((await POST(makeRequest(payload))).status).toBe(409);
    });

    it('returns 400 when the amount exceeds the invoice total', async () => {
        const db = fakeDb(baseSeed());
        h.client = db.client;
        h.requireAdmin.mockResolvedValue({ authorized: true, user: { id: 'admin-1' }, profile: { role: 'admin' } });

        const res = await POST(makeRequest({
            invoiceId: INVOICE_UUID,
            reason: 'over refund',
            amountMinor: 60000,
        }));
        expect(res.status).toBe(400);
    });

    it('returns 500 when the refund row cannot be written', async () => {
        const db = fakeDb(baseSeed(), { refunds: { message: 'insert failed' } });
        h.client = db.client;
        h.requireAdmin.mockResolvedValue({ authorized: true, user: { id: 'admin-1' }, profile: { role: 'admin' } });

        const res = await POST(makeRequest({
            invoiceId: INVOICE_UUID,
            reason: 'will fail',
        }));
        expect(res.status).toBe(500);
    });
});
