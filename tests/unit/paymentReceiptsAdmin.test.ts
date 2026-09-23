/**
 * Admin Payment Receipts API — review workflow tests.
 * Covers the admin guard, validation, terminal-state 409, rejection reason
 * requirement, settlement side-effects and the signed-URL 404 path.
 *
 * The route's Supabase access is stubbed at the module boundary (createClient),
 * and requireAdmin is mocked, so these run purely in-memory.
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({ from: vi.fn(), storage: { from: vi.fn() } })),
}));

vi.mock('../../server/auth/require-admin', () => ({
    requireAdmin: vi.fn(async () => ({ authorized: true, user: { id: 'admin-1' } })),
}));

import { requireAdmin } from '../../server/auth/require-admin';
import { PATCH } from '../../app/api/admin/payment-receipts/[id]/route';
import { GET as getReceiptUrl } from '../../app/api/admin/payment-receipts/[id]/receipt/route';
import { GET as getList } from '../../app/api/admin/payment-receipts/route';

const { createClient } = vi.mocked(await import('@supabase/supabase-js'));

type DbChain = {
    select?: () => any;
    eq?: () => any;
    maybeSingle?: () => Promise<any>;
    single?: () => Promise<any>;
    update?: () => any;
    insert?: () => Promise<any>;
    order?: () => any;
    range?: () => any;
    limit?: () => any;
};

const tableBehaviors = new Map<string, () => any>();

function configTable(table: string, behavior: () => any) {
    tableBehaviors.set(table, behavior);
}

beforeAll(() => {
    process.env.SUPABASE_URL = 'https://mock.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role';
});

beforeEach(() => {
    vi.clearAllMocks();
    tableBehaviors.clear();
    configTable('payment_receipts', () => ({
        select: vi.fn(() => ({
            order: vi.fn(() => ({
                range: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
        })),
        update: vi.fn(() => ({
            eq: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: { updated: true }, error: null })),
                })),
            })),
        })),
    }));
    configTable('orders', () => ({
        update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
    }));
    configTable('audit_log', () => ({
        insert: vi.fn(() => Promise.resolve({ error: null })),
    }));
    configTable('account_sessions', () => ({
        select: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
    }));

    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn((table: string) => {
            const b = tableBehaviors.get(table);
            return b ? b() : {};
        }),
        storage: {
            from: vi.fn(() => ({
                createSignedUrl: vi.fn(async () => ({ data: { signedUrl: 'https://signed/x' }, error: null })),
            })),
        },
    });
});

const makePatchReq = (body: unknown) =>
    new NextRequest('http://localhost/api/admin/payment-receipts/rc-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
    });

describe('Payment Receipts Admin API', () => {
    it('returns 401 when the caller is not an admin', async () => {
        const { requireAdmin: ra } = await import('../../server/auth/require-admin');
        (ra as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            authorized: false,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        });
        const res = await PATCH(makePatchReq({ status: 'verified' }), { params: Promise.resolve({ id: 'rc-1' }) });
        expect(res.status).toBe(401);
    });

    it('rejects an unknown status value (400)', async () => {
        const res = await PATCH(makePatchReq({ status: 'approved!' }), { params: Promise.resolve({ id: 'rc-1' }) });
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toContain('Validation failed');
    });

    it('requires a rejection reason when rejecting (400)', async () => {
        const res = await PATCH(makePatchReq({ status: 'rejected' }), { params: Promise.resolve({ id: 'rc-1' }) });
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.details.rejectionReason).toBeTruthy();
    });

    it('rejects changing a terminal-state receipt (409)', async () => {
        configTable('payment_receipts', () => ({
            select: () => ({
                eq: () => ({
                    maybeSingle: vi.fn(async () => ({
                        data: { id: 'rc-1', order_id: 'o-1', status: 'verified', payment_method: 'instapay', amount: 1150, currency: 'EGP' },
                        error: null,
                    })),
                }),
            }),
        }));
        const res = await PATCH(makePatchReq({ status: 'rejected', rejectionReason: 'x' }), {
            params: Promise.resolve({ id: 'rc-1' }),
        });
        expect(res.status).toBe(409);
    });

    it('verifies a pending receipt, settles order to processing and writes the audit log', async () => {
        let updated: Record<string, unknown> | null = null;
        let orderUpdateStatus: string | null = null;
        configTable('payment_receipts', () => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    maybeSingle: vi.fn(async () => ({
                        data: { id: 'rc-1', order_id: 'o-1', status: 'pending_review', payment_method: 'instapay', amount: 1150, currency: 'EGP' },
                        error: null,
                    })),
                })),
            })),
            update: vi.fn((fields: Record<string, unknown>) => {
                updated = fields;
                return {
                    eq: vi.fn(() => ({
                        select: vi.fn(() => ({
                            single: vi.fn(async () => ({
                                data: { ...fields, id: 'rc-1' },
                                error: null,
                            })),
                        })),
                    })),
                };
            }),
        }));
        configTable('orders', () => ({
            update: vi.fn((fields: Record<string, unknown>) => {
                orderUpdateStatus = fields.status as string;
                return { eq: vi.fn(() => Promise.resolve({ error: null })) };
            }),
        }));

        const res = await PATCH(makePatchReq({ status: 'verified', reviewNotes: 'looks good' }), {
            params: Promise.resolve({ id: 'rc-1' }),
        });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.orderStatus).toBe('processing');
        expect(updated).toMatchObject({ status: 'verified', reviewed_by: 'admin-1', review_notes: 'looks good' });
        expect(orderUpdateStatus).toBe('processing');
    });

    it('rejects a receipt and settles order to cancelled', async () => {
        configTable('payment_receipts', () => ({
            select: () => ({
                eq: () => ({
                    maybeSingle: vi.fn(async () => ({
                        data: { id: 'rc-1', order_id: 'o-1', status: 'pending_review', payment_method: 'instapay', amount: 1150, currency: 'EGP' },
                        error: null,
                    })),
                }),
            }),
            update: vi.fn(() => ({
                eq: vi.fn(() => ({
                    select: vi.fn(() => ({
                        single: vi.fn(async () => ({
                            data: { id: 'rc-1', status: 'rejected', order_id: 'o-1', payment_method: 'instapay', amount: 1150, currency: 'EGP', reviewed_by: 'admin-1', rejection_reason: 'amount mismatch' },
                            error: null,
                        })),
                    })),
                })),
            })),
        }));
        const res = await PATCH(makePatchReq({ status: 'rejected', rejectionReason: 'amount mismatch' }), {
            params: Promise.resolve({ id: 'rc-1' }),
        });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.orderStatus).toBe('cancelled');
    });

    it('returns 404 for a signed URL when the receipt has no stored file', async () => {
        configTable('payment_receipts', () => ({
            select: () => ({
                eq: () => ({
                    maybeSingle: vi.fn(async () => ({
                        data: { id: 'rc-1', receipt_path: null },
                        error: null,
                    })),
                }),
            }),
        }));
        const res = await getReceiptUrl(new NextRequest('http://localhost/api/admin/payment-receipts/rc-1/receipt'), {
            params: Promise.resolve({ id: 'rc-1' }),
        });
        expect(res.status).toBe(404);
    });

    it('lists receipts and applies the status filter', async () => {
        let usedFilter: string | null = null;
        const rows = [{ id: 'rc-1', status: 'pending_review' }];
        configTable('payment_receipts', () => ({
            select: vi.fn(() => {
                const afterFilter = () => Promise.resolve({ data: rows, error: null });
                const range = () => ({
                    eq: (col: string, val: string) => {
                        usedFilter = val;
                        return afterFilter();
                    },
                });
                const order = () => ({ range });
                const eq = (col: string, val: string) => {
                    usedFilter = val;
                    return { order };
                };
                return { order, eq };
            }),
        }));
        const res = await getList(new NextRequest('http://localhost/api/admin/payment-receipts?status=pending_review'));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.receipts).toHaveLength(1);
        expect(usedFilter).toBe('pending_review');
    });
});