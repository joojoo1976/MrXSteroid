/**
 * tests/integration/reconciliationRunner.test.ts
 *
 * Phase 7 — ACTIVE reconciliation runner (spec §11 / K-2 C8):
 *   1. stale pending invoice + provider SUCCESS → resolved through the SHARED
 *      state path (invoice paid, intent succeeded, run logged, audited).
 *   2. provider PENDING → unresolved, incremental backoff scheduled, NO mutation.
 *   3. already-resolved invoice reached via a quarantined event → acknowledged,
 *      NO second posting.
 *   4. max attempts reached → candidate retired, provider NOT polled again.
 *   5. backoff not elapsed → candidate skipped entirely.
 *   6. provider FAILURE → invoice/intent failed through the shared path.
 *
 * Provider status is injected, so the tests exercise selection/backoff/audit
 * deterministically against the table-backed in-memory Supabase fake.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInMemorySupabase } from '../helpers/inMemorySupabase';

const ib = createInMemorySupabase();

vi.mock('@supabase/supabase-js', () => ({
    createClient: ib.createClientMock,
}));

let verifyPaidAmountMock: ReturnType<typeof vi.fn>;
let freezeOrderSplitsMock: ReturnType<typeof vi.fn>;
let triggerAffiliateCommissionMock: ReturnType<typeof vi.fn>;

const FIXED_NOW = new Date('2026-09-18T12:00:00.000Z');

const agoMinutes = (minutes: number): string =>
    new Date(FIXED_NOW.getTime() - minutes * 60_000).toISOString();

const seedInvoice = (row: Record<string, unknown>) => {
    (ib.tables.invoices ??= []).push({ amount: 100, currency: 'EGP', ...row });
};
const seedIntent = (row: Record<string, unknown>) => {
    (ib.tables.payment_intents ??= []).push({
        reconciliation_attempts: 0,
        reconciliation_next_attempt_at: null,
        ...row,
    });
};
const seedEvent = (row: Record<string, unknown>) => {
    (ib.tables.webhook_events ??= []).push(row);
};

async function loadRunner() {
    const mod = await import('../../server/payments/reconciliationRunner');
    return mod.runReconciliation;
}

beforeEach(() => {
    Object.keys(ib.tables).forEach((k) => delete ib.tables[k]);
    ib.rpcLog.length = 0;

    verifyPaidAmountMock = vi.fn().mockResolvedValue({ ok: true });
    freezeOrderSplitsMock = vi.fn().mockResolvedValue({ frozen: true, splitsCount: 0 });
    triggerAffiliateCommissionMock = vi.fn().mockResolvedValue({ ok: true });

    vi.doMock('../../server/payments/verifyPaidAmount', () => ({
        verifyPaidAmount: verifyPaidAmountMock,
    }));
    vi.doMock('../../server/payments/splitEngine', () => ({
        freezeOrderSplits: freezeOrderSplitsMock,
    }));
    vi.doMock('../../server/affiliate/ledgerService', () => ({
        triggerAffiliateCommission: triggerAffiliateCommissionMock,
    }));
    vi.resetModules();
});

describe('Phase 7 — active reconciliation runner', () => {
    it('resolves a stale pending invoice via the shared state path on provider SUCCESS', async () => {
        seedInvoice({ id: 'inv-r1', status: 'pending', payment_status: 'pending', user_id: 'u1', tier_id: 't1', created_at: agoMinutes(40) });
        seedIntent({ id: 'pi-1', invoice_id: 'inv-r1', attempt_number: 1, is_current: true, status: 'initiated', provider_order_id: 'sess-1', provider_status: null, created_at: agoMinutes(38) });

        const statusQuery = vi.fn().mockResolvedValue({
            found: true, outcome: 'SUCCESS', externalReferenceId: 'txn-1', paidAmount: 100, providerStatus: 'CAPTURED',
        });

        const runReconciliation = await loadRunner();
        const summary = await runReconciliation({ supabase: ib.createClientMock(), now: FIXED_NOW, statusQuery });

        expect(summary.counts.candidates).toBe(1);
        expect(summary.counts.resolved).toBe(1);

        const invoice = ib.tables.invoices.find((i) => i.id === 'inv-r1')!;
        expect(invoice.payment_status).toBe('paid');
        expect(invoice.status).toBe('success');

        const intent = ib.tables.payment_intents.find((i) => i.id === 'pi-1')!;
        expect(intent.status).toBe('succeeded');
        expect(intent.provider_status).toBe('CAPTURED');
        expect(intent.reconciliation_next_attempt_at).toBeNull();

        const run = ib.tables.reconciliation_runs[0];
        expect(run.status).toBe('completed');
        expect(run.resolved_count).toBe(1);

        // synthetic reconciliation trail + audit entry
        const reconciled = ib.tables.webhook_events.find((e) => String(e.processing_status) === 'reconciled');
        expect(reconciled).toBeDefined();
        expect(reconciled.invoice_id).toBe('inv-r1');
        expect(ib.tables.audit_log?.length).toBeGreaterThanOrEqual(1);
    });

    it('keeps an intent unresolved and schedules incremental backoff on provider PENDING (no mutation)', async () => {
        seedInvoice({ id: 'inv-r2', status: 'pending', payment_status: 'pending', user_id: 'u2', tier_id: 't1', created_at: agoMinutes(30) });
        seedIntent({ id: 'pi-2', invoice_id: 'inv-r2', attempt_number: 1, is_current: true, status: 'pending', provider_order_id: 'sess-2', provider_status: null, created_at: agoMinutes(28) });

        const statusQuery = vi.fn().mockResolvedValue({ found: true, outcome: 'PENDING', providerStatus: 'PENDING' });

        const runReconciliation = await loadRunner();
        const summary = await runReconciliation({ supabase: ib.createClientMock(), now: FIXED_NOW, statusQuery });

        expect(summary.counts.unresolved).toBe(1);
        expect(summary.counts.resolved).toBe(0);

        const intent = ib.tables.payment_intents.find((i) => i.id === 'pi-2')!;
        expect(intent.status).toBe('pending');
        expect(intent.reconciliation_attempts).toBe(1);
        expect(intent.reconciliation_last_attempt_at).toBe(FIXED_NOW.toISOString());
        // base backoff 5 min → next attempt is 5 minutes out
        expect(new Date(intent.reconciliation_next_attempt_at).getTime()).toBe(FIXED_NOW.getTime() + 5 * 60_000);

        const invoice = ib.tables.invoices.find((i) => i.id === 'inv-r2')!;
        expect(invoice.payment_status).toBe('pending');
    });

    it('acknowledges an already-resolved invoice (quarantined event) with NO second posting', async () => {
        seedInvoice({ id: 'inv-r3', status: 'success', payment_status: 'paid', user_id: 'u3', tier_id: 't1', created_at: agoMinutes(60) });
        seedIntent({ id: 'pi-3', invoice_id: 'inv-r3', attempt_number: 1, is_current: true, status: 'unknown', provider_order_id: 'sess-3', provider_status: 'DECLINED', created_at: agoMinutes(58) });
        seedEvent({ id: 'ev-q', provider: 'kashier_egypt', provider_event_id: 'txn-q', processing_status: 'quarantined: already PAID', invoice_id: 'inv-r3', received_at: agoMinutes(10) });

        const statusQuery = vi.fn().mockResolvedValue({ found: true, outcome: 'SUCCESS', externalReferenceId: 'txn-3', paidAmount: 100, providerStatus: 'CAPTURED' });

        const runReconciliation = await loadRunner();
        const summary = await runReconciliation({ supabase: ib.createClientMock(), now: FIXED_NOW, statusQuery });

        expect(summary.counts.already_processed).toBe(1);
        expect(summary.counts.resolved).toBe(0);

        const invoice = ib.tables.invoices.find((i) => i.id === 'inv-r3')!;
        expect(invoice.payment_status).toBe('paid');
        // No financial work ran again.
        expect(freezeOrderSplitsMock).not.toHaveBeenCalled();
    });

    it('retires a candidate that has reached the max attempt budget without polling', async () => {
        seedInvoice({ id: 'inv-r4', status: 'pending', payment_status: 'pending', user_id: 'u4', tier_id: 't1', created_at: agoMinutes(400) });
        seedIntent({ id: 'pi-4', invoice_id: 'inv-r4', attempt_number: 1, is_current: true, status: 'unknown', provider_order_id: 'sess-4', provider_status: 'TIMED_OUT', created_at: agoMinutes(390), reconciliation_attempts: 12 });

        const statusQuery = vi.fn();
        const runReconciliation = await loadRunner();
        const summary = await runReconciliation({ supabase: ib.createClientMock(), now: FIXED_NOW, maxAttempts: 12, statusQuery });

        expect(statusQuery).not.toHaveBeenCalled();
        expect(summary.counts.max_attempts_reached).toBe(1);
        expect(summary.counts.candidates).toBe(0);
    });

    it('skips a candidate whose backoff window has not elapsed', async () => {
        seedInvoice({ id: 'inv-r5', status: 'pending', payment_status: 'pending', user_id: 'u5', tier_id: 't1', created_at: agoMinutes(40) });
        seedIntent({
            id: 'pi-5', invoice_id: 'inv-r5', attempt_number: 1, is_current: true, status: 'initiated',
            provider_order_id: 'sess-5', provider_status: null, created_at: agoMinutes(38),
            reconciliation_attempts: 1,
            reconciliation_next_attempt_at: new Date(FIXED_NOW.getTime() + 3 * 60_000).toISOString(),
        });

        const statusQuery = vi.fn();
        const runReconciliation = await loadRunner();
        const summary = await runReconciliation({ supabase: ib.createClientMock(), now: FIXED_NOW, statusQuery });

        expect(statusQuery).not.toHaveBeenCalled();
        expect(summary.counts.candidates).toBe(0);
    });

    it('resolves a provider FAILURE through the shared state path', async () => {
        seedInvoice({ id: 'inv-r6', status: 'pending', payment_status: 'pending', user_id: 'u6', tier_id: 't1', created_at: agoMinutes(50) });
        seedIntent({ id: 'pi-6', invoice_id: 'inv-r6', attempt_number: 1, is_current: true, status: 'initiated', provider_order_id: 'sess-6', provider_status: null, created_at: agoMinutes(48) });

        const statusQuery = vi.fn().mockResolvedValue({ found: true, outcome: 'FAILURE', externalReferenceId: 'txn-6', providerStatus: 'DECLINED' });

        const runReconciliation = await loadRunner();
        const summary = await runReconciliation({ supabase: ib.createClientMock(), now: FIXED_NOW, statusQuery });

        expect(summary.counts.resolved).toBe(1);
        const invoice = ib.tables.invoices.find((i) => i.id === 'inv-r6')!;
        expect(invoice.payment_status).toBe('failed');
        const intent = ib.tables.payment_intents.find((i) => i.id === 'pi-6')!;
        expect(intent.status).toBe('failed');
        expect(intent.provider_status).toBe('DECLINED');
        expect(triggerAffiliateCommissionMock).not.toHaveBeenCalled();
    });
});