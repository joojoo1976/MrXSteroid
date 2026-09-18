import { describe, it, expect, beforeEach } from 'vitest';
import { createInMemorySupabase } from '../helpers/inMemorySupabase';
import { buildReconciliationSnapshot } from '../../server/payments/reconciliationService';

/**
 * Phase 7 (read-only) — reconciliation snapshot linked to the Phase 5 (C7)
 * provider_status / provider_transaction_id columns:
 *   1. webhook_events carry the verdict + processing trail
 *   2. quarantined / replay / duplicate / skip outcomes are flagged
 *   3. UNRESOLVED intents (UNKNOWN/PENDING/INITIATED) surfaced
 *   4. stale pending invoices = late / missing webhook candidates (§C9),
 *      with a precise `provider_never_spoke` signal
 *   5. the snapshot does NOT mutate anything
 */

describe('Phase 7 — reconciliation snapshot diagnostics', () => {
    const FIXED_NOW = new Date('2026-09-18T12:00:00.000Z');

    let db: ReturnType<typeof createInMemorySupabase>;
    let supabase: ReturnType<ReturnType<typeof createInMemorySupabase>['createClientMock']>;

    beforeEach(() => {
        db = createInMemorySupabase();
        supabase = db.createClientMock();
    });

    const agoMinutes = (minutes: number): string =>
        new Date(FIXED_NOW.getTime() - minutes * 60_000).toISOString();

    const seedEvent = (row: Record<string, unknown>) => {
        (db.tables.webhook_events ??= []).push(row);
    };
    const seedIntent = (row: Record<string, unknown>) => {
        (db.tables.payment_intents ??= []).push(row);
    };
    const seedInvoice = (row: Record<string, unknown>) => {
        (db.tables.invoices ??= []).push(row);
    };

    it('flags quarantined late-arrival webhooks as needs attention', async () => {
        seedEvent({
            id: 'ev-quarantined',
            provider: 'kashier_egypt',
            provider_event_id: 'txn-q',
            provider_transaction_id: 'txn-q',
            provider_status: 'DECLINED',
            provider_operation: 'pay',
            status: 'skipped',
            processing_status: 'quarantined: Late-arrival guard: Invoice is already PAID',
            invoice_id: 'inv-1',
            payment_intent_id: 'pi-1',
            received_at: agoMinutes(2),
        });

        const snapshot = await buildReconciliationSnapshot({ supabase, now: FIXED_NOW, staleInvoiceMinutes: 15, maxEvents: 100 });

        expect(snapshot.counts.total_events).toBe(1);
        expect(snapshot.counts.quarantined).toBe(1);
        expect(snapshot.counts.needs_attention_events).toBe(1);
        expect(snapshot.events[0]).toMatchObject({
            provider_status: 'DECLINED',
            provider_transaction_id: 'txn-q',
            provider_operation: 'pay',
            invoice_id: 'inv-1',
            payment_intent_id: 'pi-1',
            needs_attention: true,
        });
        expect(snapshot.events[0].attention_reason).toContain('Late-arrival quarantined');
    });

    it('does NOT flag replay events (C7 semantics)', async () => {
        seedEvent({
            id: 'ev-replay',
            provider: 'kashier_egypt',
            provider_event_id: 'txn-replay',
            provider_transaction_id: 'txn-replay',
            provider_status: 'ORDER_PAID_BEFORE',
            provider_operation: 'idempotency',
            status: 'duplicate',
            processing_status: 'replay',
            invoice_id: 'inv-1',
            payment_intent_id: 'pi-1',
            received_at: agoMinutes(1),
        });

        const snapshot = await buildReconciliationSnapshot({ supabase, now: FIXED_NOW });

        expect(snapshot.counts.replay).toBe(1);
        expect(snapshot.events[0].needs_attention).toBe(false);
        expect(snapshot.events[0].attention_reason).toContain('Replay acknowledged');
    });

    it('flags duplicate (C7 dedup) and skipped (UNKNOWN) webhooks', async () => {
        seedEvent({
            id: 'ev-dup',
            provider: 'kashier_egypt',
            provider_event_id: 'txn-dup',
            provider_transaction_id: 'txn-dup',
            provider_status: 'APPROVED',
            provider_operation: 'pay',
            status: 'duplicate',
            processing_status: 'duplicate',
            invoice_id: 'inv-1',
            payment_intent_id: 'pi-1',
            received_at: agoMinutes(3),
        });
        seedEvent({
            id: 'ev-skip',
            provider: 'kashier_egypt',
            provider_event_id: 'txn-skip',
            provider_transaction_id: 'txn-skip',
            provider_status: 'UNKNOWN',
            provider_operation: 'pay',
            status: 'skipped',
            processing_status: 'pending_reconciliation',
            invoice_id: 'inv-2',
            payment_intent_id: 'pi-2',
            received_at: agoMinutes(4),
        });

        const snapshot = await buildReconciliationSnapshot({ supabase, now: FIXED_NOW });

        expect(snapshot.counts.duplicate).toBe(1);
        expect(snapshot.counts.skipped).toBe(1);
        const dup = snapshot.events.find((e) => e.id === 'ev-dup');
        const skip = snapshot.events.find((e) => e.id === 'ev-skip');
        expect(dup?.needs_attention).toBe(true);
        expect(skip?.needs_attention).toBe(true);
    });

    it('surfaces UNRESOLVED intents (status UNKNOWN / PENDING / INITIATED)', async () => {
        seedIntent({ id: 'pi-uk', invoice_id: 'inv-1', attempt_number: 1, status: 'unknown', provider_status: 'TIMED_OUT', provider_transaction_id: 'txn-uk', created_at: agoMinutes(5) });
        seedIntent({ id: 'pi-pd', invoice_id: 'inv-2', attempt_number: 1, status: 'pending', provider_status: null, provider_transaction_id: null, created_at: agoMinutes(6) });
        seedIntent({ id: 'pi-done', invoice_id: 'inv-3', attempt_number: 1, status: 'succeeded', provider_status: 'APPROVED', provider_transaction_id: 'txn-ok', created_at: agoMinutes(7) });

        const snapshot = await buildReconciliationSnapshot({ supabase, now: FIXED_NOW });

        expect(snapshot.counts.unresolved_intents).toBe(2);
        expect(snapshot.unresolved_intents.map((i) => i.id).sort()).toEqual(['pi-pd', 'pi-uk']);
    });

    it('detects late / missing webhooks on stale pending invoices (§C9)', async () => {
        seedInvoice({ id: 'inv-stale', payment_status: 'pending', created_at: agoMinutes(40) });
        seedIntent({ id: 'pi-stale', invoice_id: 'inv-stale', attempt_number: 1, status: 'initiated', provider_status: null, provider_transaction_id: null, created_at: agoMinutes(38) });

        seedInvoice({ id: 'inv-fresh', payment_status: 'pending', created_at: agoMinutes(2) });
        seedIntent({ id: 'pi-fresh', invoice_id: 'inv-fresh', attempt_number: 1, status: 'pending', provider_status: null, provider_transaction_id: null, created_at: agoMinutes(1) });

        seedInvoice({ id: 'inv-signal', payment_status: 'pending', created_at: agoMinutes(45) });
        seedIntent({ id: 'pi-signal', invoice_id: 'inv-signal', attempt_number: 1, status: 'unknown', provider_status: 'TIMED_OUT', provider_transaction_id: 'txn-signal', created_at: agoMinutes(40) });

        const snapshot = await buildReconciliationSnapshot({ supabase, now: FIXED_NOW, staleInvoiceMinutes: 15 });

        expect(snapshot.counts.stale_pending_invoices).toBe(2);
        expect(snapshot.stale_pending_invoices).toHaveLength(2);

        const stale = snapshot.stale_pending_invoices.find((i) => i.id === 'inv-stale');
        expect(stale).toBeDefined();
        expect(stale?.provider_never_spoke).toBe(true);
        expect(stale?.latest_intent_status).toBe('initiated');
        expect(stale?.minutes_pending).toBe(40);

        const signalled = snapshot.stale_pending_invoices.find((i) => i.id === 'inv-signal');
        expect(signalled?.provider_never_spoke).toBe(false);
        expect(signalled?.latest_provider_status).toBe('TIMED_OUT');

        const fresh = snapshot.stale_pending_invoices.find((i) => i.id === 'inv-fresh');
        expect(fresh).toBeUndefined();
    });

    it('is strictly read-only — never mutates the DB, errors surface cleanly', async () => {
        seedEvent({ id: 'ev', provider: 'kashier_egypt', provider_event_id: 'txn', status: 'processed', provider_status: 'APPROVED', received_at: agoMinutes(1) });
        const eventsBefore = db.tables.webhook_events.length;

        const snapshot = await buildReconciliationSnapshot({ supabase, now: FIXED_NOW });
        expect(db.tables.webhook_events.length).toBe(eventsBefore);
        expect(db.tables.payment_intents.length).toBe(0);
        expect(snapshot.counts.processed).toBe(1);
    });
});