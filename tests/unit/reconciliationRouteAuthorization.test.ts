/**
 * tests/unit/reconciliationRouteAuthorization.test.ts
 *
 * Guards the two authorization decisions on the reconciliation routes:
 *
 *  1. `GET /api/payments/reconciliation/run` was added as the Vercel Cron
 *     entrypoint (Vercel Cron can only issue GET). It MUST NOT be a wider door
 *     than the pre-existing POST: same guard, same fail-closed behaviour.
 *
 *  2. `GET /api/payments/reconciliation` previously had NO authorization and
 *     exposed live invoice / payment_intent aggregates to any unauthenticated
 *     caller. It is now fail-closed behind the identical guard.
 *
 * These tests assert the AUTH decision only. They never reach the database:
 * `runReconciliation` and `buildReconciliationSnapshot` are mocked out, so no
 * reconciliation can be executed and no financial table can be written from
 * this suite.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const runReconciliation = vi.fn();
const buildReconciliationSnapshot = vi.fn();

vi.mock('../../server/payments/reconciliationRunner', () => ({
    runReconciliation: (...args: unknown[]) => runReconciliation(...args),
}));

vi.mock('../../server/payments/reconciliationService', () => ({
    buildReconciliationSnapshot: (...args: unknown[]) => buildReconciliationSnapshot(...args),
}));

vi.mock('../../server/payments/gateways/KashierGateway', () => ({
    KashierGateway: class {
        constructor(public region: string) {}
        async verifyPaymentSession() { return null; }
    },
}));

vi.mock('../../server/payments/gateways/kashierVerification', () => ({
    resolveKashierPaymentOutcome: () => ({ outcome: 'UNKNOWN' }),
}));

import { GET as getRun, POST as postRun } from '../../app/api/payments/reconciliation/run/route';
import { GET as getSnapshot } from '../../app/api/payments/reconciliation/route';

const RUN_URL = 'http://localhost:3000/api/payments/reconciliation/run?trigger=cron&staleAfterMinutes=15&limit=100';
const SNAP_URL = 'http://localhost:3000/api/payments/reconciliation?staleAfterMinutes=15&maxEvents=500';

function req(url: string, headers: Record<string, string> = {}): NextRequest {
    return new NextRequest(url, { headers });
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
    runReconciliation.mockReset();
    buildReconciliationSnapshot.mockReset();
    runReconciliation.mockResolvedValue({ trigger_source: 'cron', candidates: 0 });
    buildReconciliationSnapshot.mockResolvedValue({ invoices: [], paymentIntents: [] });
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
    process.env.NODE_ENV = 'production';
    delete process.env.CRON_SECRET;
});

afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
});

describe('reconciliation /run authorization (GET + POST parity)', () => {
    it('exports both verbs', () => {
        expect(typeof getRun).toBe('function');
        expect(typeof postRun).toBe('function');
    });

    it('GET is rejected 401 without CRON_SECRET or token — adding GET did not widen access', async () => {
        const res = await getRun(req(RUN_URL));
        expect(res.status).toBe(401);
        expect(runReconciliation).not.toHaveBeenCalled();
    });

    it('POST is rejected 401 under the same conditions', async () => {
        const res = await postRun(req(RUN_URL));
        expect(res.status).toBe(401);
        expect(runReconciliation).not.toHaveBeenCalled();
    });

    it('GET and POST return the identical 401 body', async () => {
        const g = await getRun(req(RUN_URL));
        const p = await postRun(req(RUN_URL));
        expect(await g.json()).toEqual(await p.json());
    });

    it('a wrong CRON_SECRET in the Authorization header is rejected on GET', async () => {
        process.env.CRON_SECRET = 'correct-secret-value-16';
        const res = await getRun(req(RUN_URL, { authorization: 'Bearer wrong-secret-value-16' }));
        expect(res.status).toBe(401);
        expect(runReconciliation).not.toHaveBeenCalled();
    });

    it('the exact CRON_SECRET in x-cron-secret authorizes GET', async () => {
        process.env.CRON_SECRET = 'correct-secret-value-16';
        const res = await getRun(req(RUN_URL, { 'x-cron-secret': 'correct-secret-value-16' }));
        expect(res.status).toBe(200);
        expect(runReconciliation).toHaveBeenCalledTimes(1);
    });

    it('the exact CRON_SECRET as a Bearer token authorizes GET (the Vercel Cron form)', async () => {
        process.env.CRON_SECRET = 'correct-secret-value-16';
        const res = await getRun(req(RUN_URL, { authorization: 'Bearer correct-secret-value-16' }));
        expect(res.status).toBe(200);
        expect(runReconciliation).toHaveBeenCalledTimes(1);
    });

    it('a non-admin JWT does not authorize GET', async () => {
        process.env.CRON_SECRET = 'correct-secret-value-16';
        const res = await getRun(req(RUN_URL, { authorization: 'Bearer some-user-jwt' }));
        expect(res.status).toBe(401);
        expect(runReconciliation).not.toHaveBeenCalled();
    });

    it('GET honours the cron query parameters the scheduler sends', async () => {
        process.env.CRON_SECRET = 'correct-secret-value-16';
        await getRun(req(RUN_URL, { 'x-cron-secret': 'correct-secret-value-16' }));
        const arg = runReconciliation.mock.calls[0][0];
        expect(arg.triggerSource).toBe('cron');
        expect(arg.staleInvoiceMinutes).toBe(15);
        expect(arg.limit).toBe(100);
    });

    it('GET and POST resolve parameters identically — one shared body, no duplication', async () => {
        process.env.CRON_SECRET = 'correct-secret-value-16';
        const headers = { 'x-cron-secret': 'correct-secret-value-16' };
        await getRun(req(RUN_URL, headers));
        await postRun(req(RUN_URL, headers));
        const [g, p] = runReconciliation.mock.calls.map((c) => c[0]);
        expect(g.triggerSource).toBe(p.triggerSource);
        expect(g.staleInvoiceMinutes).toBe(p.staleInvoiceMinutes);
        expect(g.limit).toBe(p.limit);
    });

    it('clamps an absurd limit so a scheduler URL cannot widen the batch', async () => {
        process.env.CRON_SECRET = 'correct-secret-value-16';
        await getRun(
            req('http://localhost:3000/api/payments/reconciliation/run?limit=999999', {
                'x-cron-secret': 'correct-secret-value-16',
            })
        );
        expect(runReconciliation.mock.calls[0][0].limit).toBe(1000);
    });
});

describe('GET /api/payments/reconciliation snapshot authorization', () => {
    it('is rejected 401 without CRON_SECRET or token', async () => {
        const res = await getSnapshot(req(SNAP_URL));
        expect(res.status).toBe(401);
        expect(buildReconciliationSnapshot).not.toHaveBeenCalled();
    });

    it('rejects a wrong CRON_SECRET', async () => {
        process.env.CRON_SECRET = 'correct-secret-value-16';
        const res = await getSnapshot(req(SNAP_URL, { authorization: 'Bearer nope-nope-nope-16' }));
        expect(res.status).toBe(401);
        expect(buildReconciliationSnapshot).not.toHaveBeenCalled();
    });

    it('authorizes with the exact x-cron-secret', async () => {
        process.env.CRON_SECRET = 'correct-secret-value-16';
        const res = await getSnapshot(req(SNAP_URL, { 'x-cron-secret': 'correct-secret-value-16' }));
        expect(res.status).toBe(200);
        expect(buildReconciliationSnapshot).toHaveBeenCalledTimes(1);
    });

    it('authorizes with the exact Bearer CRON_SECRET', async () => {
        process.env.CRON_SECRET = 'correct-secret-value-16';
        const res = await getSnapshot(req(SNAP_URL, { authorization: 'Bearer correct-secret-value-16' }));
        expect(res.status).toBe(200);
    });

    it('preserves the underlying snapshot parameter handling', async () => {
        process.env.CRON_SECRET = 'correct-secret-value-16';
        await getSnapshot(
            req('http://localhost:3000/api/payments/reconciliation?staleAfterMinutes=30&maxEvents=1000', {
                'x-cron-secret': 'correct-secret-value-16',
            })
        );
        const arg = buildReconciliationSnapshot.mock.calls[0][0];
        expect(arg.staleInvoiceMinutes).toBe(30);
        expect(arg.maxEvents).toBe(1000);
    });

    it('retains the 503 guard when the service-role env is absent', async () => {
        process.env.CRON_SECRET = 'correct-secret-value-16';
        delete process.env.SUPABASE_URL;
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        const res = await getSnapshot(req(SNAP_URL, { 'x-cron-secret': 'correct-secret-value-16' }));
        expect(res.status).toBe(503);
    });
});
