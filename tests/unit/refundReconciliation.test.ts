import { describe, it, expect } from 'vitest';
import {
    REFUND_EVENT_OPERATIONS,
    buildRefundReconciliationReport,
    reconcileRefunds,
    refundEventKey,
    refundRowEventKey,
    type RefundEventRow,
    type RefundRow,
} from '../../server/payments/reconciliation/refundReconciliation';

/**
 * S4 — read-only refund reconciliation.
 *
 * The report answers one question an operator must be able to answer without a
 * provider dashboard: does every refund the gateway told us about have a
 * `refunds` row, and does every provider-originated refund row have an event?
 *
 * No writes are allowed here. `reconcileRefunds` must issue SELECTs only, so the
 * mock below throws on insert/update/delete/upsert.
 */

const event = (over: Partial<RefundEventRow> = {}): RefundEventRow => ({
    provider: 'kashier',
    provider_event_id: 'evt-1',
    provider_operation: 'refund',
    status: 'processed',
    processing_status: 'refund_recorded',
    invoice_id: 'inv-1',
    error_message: null,
    created_at: '2026-11-23T00:00:00.000Z',
    ...over,
});

const refund = (over: Partial<RefundRow> = {}): RefundRow => ({
    id: 'ref-1',
    invoice_id: 'inv-1',
    payment_intent_id: 'pi-1',
    amount_minor: 49900,
    currency: 'EGP',
    status: 'completed',
    created_at: '2026-11-23T00:00:00.000Z',
    raw_response: { provider: 'kashier', provider_event_id: 'evt-1', full_refund: true },
    ...over,
});

describe('refund event keys', () => {
    it('normalizes provider casing/whitespace on both sides', () => {
        expect(refundEventKey(' Kashier ', ' evt-1 ')).toBe('kashier::evt-1');
        expect(refundRowEventKey(refund({ raw_response: { provider: 'KASHIER', provider_event_id: 'evt-1' } })))
            .toBe('kashier::evt-1');
    });

    it('returns null for a refund row without provider event metadata', () => {
        expect(refundRowEventKey(refund({ raw_response: null }))).toBeNull();
        expect(refundRowEventKey(refund({ raw_response: { provider: 'kashier' } }))).toBeNull();
    });
});

describe('buildRefundReconciliationReport', () => {
    it('reports a matched, fully reconciled pair as ok', () => {
        const report = buildRefundReconciliationReport([event()], [refund()]);

        expect(report.counts).toMatchObject({
            refundEvents: 1,
            refunds: 1,
            recordedEvents: 1,
            matched: 1,
            eventsWithoutRefundRow: 0,
            refundsWithoutEvent: 0,
            providerRefunds: 1,
        });
        expect(report.ok).toBe(true);
        expect(report.truncated).toBe(false);
    });

    it('surfaces an unlinked refund event (payment intent missing) as skipped', () => {
        const report = buildRefundReconciliationReport(
            [event({
                status: 'skipped',
                processing_status: 'refund_unlinked',
                error_message: 'No payment intent exists for the invoice',
            })],
            []
        );

        expect(report.counts.skippedEvents).toBe(1);
        expect(report.counts.matched).toBe(0);
        expect(report.samples.skippedEvents[0]).toMatchObject({
            reason: 'refund_unlinked',
            provider_event_id: 'evt-1',
            invoice_id: 'inv-1',
        });
        expect(report.ok).toBe(false);
    });

    it('surfaces a refund row insert failure separately from a skip', () => {
        const report = buildRefundReconciliationReport(
            [event({
                status: 'failed',
                processing_status: 'refund_insert_failed: null value in column "payment_intent_id"',
                error_message: 'null value in column "payment_intent_id"',
            })],
            []
        );

        expect(report.counts.failedEvents).toBe(1);
        expect(report.samples.failedEvents[0].reason).toContain('refund_insert_failed');
        expect(report.ok).toBe(false);
    });

    it('treats an idempotent duplicate as expected, not as an anomaly', () => {
        const report = buildRefundReconciliationReport(
            [event({ processing_status: 'refund_duplicate' })],
            [refund()]
        );

        expect(report.counts.duplicateEvents).toBe(1);
        expect(report.counts.recordedEvents).toBe(0);
        expect(report.ok).toBe(true);
    });

    it('detects a processed event whose refunds row is missing', () => {
        const report = buildRefundReconciliationReport([event()], []);

        expect(report.counts.eventsWithoutRefundRow).toBe(1);
        expect(report.samples.eventsWithoutRefundRow[0]).toMatchObject({
            reason: 'refund_event_recorded_without_refunds_row',
            provider: 'kashier',
            provider_event_id: 'evt-1',
        });
        expect(report.ok).toBe(false);
    });

    it('detects a provider refund row with no webhook event', () => {
        const report = buildRefundReconciliationReport(
            [],
            [refund({ raw_response: { provider: 'stripe', provider_event_id: 'evt-missing' } })]
        );

        expect(report.counts.providerRefunds).toBe(1);
        expect(report.counts.refundsWithoutEvent).toBe(1);
        expect(report.samples.refundsWithoutEvent[0]).toMatchObject({
            reason: 'refund_row_without_webhook_event',
            refund_id: 'ref-1',
        });
        expect(report.ok).toBe(false);
    });

    it('never flags an operator-recorded refund for a missing provider event', () => {
        const report = buildRefundReconciliationReport(
            [],
            [refund({ raw_response: { source: 'admin', provider: 'kashier', provider_reference: 'R-1' } })]
        );

        expect(report.counts.adminRefunds).toBe(1);
        expect(report.counts.refundsWithoutEvent).toBe(0);
        expect(report.ok).toBe(true);
    });

    it('flags a refund row that carries neither provider metadata nor the admin marker', () => {
        const report = buildRefundReconciliationReport([], [refund({ raw_response: {} })]);

        expect(report.counts.legacyRefunds).toBe(1);
        expect(report.counts.refundsWithoutEvent).toBe(1);
        expect(report.samples.refundsWithoutEvent[0].reason).toBe(
            'refund_row_missing_provider_event_metadata'
        );
    });

    it('keeps complete counts while capping the sample lists', () => {
        const events = Array.from({ length: 5 }, (_, i) =>
            event({ provider_event_id: `evt-${i}`, status: 'skipped', processing_status: 'refund_unlinked' })
        );

        const report = buildRefundReconciliationReport(events, [], { sampleLimit: 2 });

        expect(report.counts.skippedEvents).toBe(5);
        expect(report.samples.skippedEvents).toHaveLength(2);
    });

    it('reports pending events (in-flight or crashed mid-processing)', () => {
        const report = buildRefundReconciliationReport(
            [event({ status: 'pending', processing_status: 'refund_pending' })],
            []
        );

        expect(report.counts.pendingEvents).toBe(1);
        expect(report.ok).toBe(false);
    });

    it('counts intent-less refunds separately (recorded, never dropped)', () => {
        const report = buildRefundReconciliationReport(
            [event({ provider: 'stripe', provider_event_id: 'evt-s-1' })],
            [refund({
                payment_intent_id: null,
                raw_response: { provider: 'stripe', provider_event_id: 'evt-s-1' },
            })]
        );

        expect(report.counts.refundsWithoutIntent).toBe(1);
        expect(report.counts.matched).toBe(1);
        expect(report.counts.refundsWithoutEvent).toBe(0);
        expect(report.ok).toBe(true);
    });

    it('marks the report truncated when the caller says the read was capped', () => {
        const report = buildRefundReconciliationReport([event()], [refund()], { truncated: true });
        expect(report.truncated).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  READ-ONLY WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

type FakeClientOptions = {
    eventError?: { message: string } | null;
    refundError?: { message: string } | null;
};

function makeReadOnlyClient(
    events: RefundEventRow[],
    refunds: RefundRow[],
    options: FakeClientOptions = {}
) {
    const calls: string[] = [];
    const writes: string[] = [];

    const writeGuard = (name: string, table: string) => () => {
        writes.push(`${table}:${name}`);
        throw new Error(`write attempted during refund reconciliation: ${table}.${name}`);
    };

    const make = (table: string) => {
        const chain: Record<string, unknown> = {};
        chain.select = (columns?: string) => {
            calls.push(`${table}:select:${columns ?? ''}`);
            return chain;
        };
        chain.in = (column: string, values: unknown[]) => {
            calls.push(`${table}:in:${column}:${(values as unknown[]).length}`);
            return chain;
        };
        chain.order = () => chain;
        chain.limit = async (rows: number) => {
            calls.push(`${table}:limit:${rows}`);
            if (table === 'webhook_events') {
                return { data: events, error: options.eventError ?? null };
            }
            return { data: refunds, error: options.refundError ?? null };
        };
        chain.insert = writeGuard('insert', table);
        chain.update = writeGuard('update', table);
        chain.upsert = writeGuard('upsert', table);
        chain.delete = writeGuard('delete', table);
        return chain;
    };

    return {
        client: { from: (table: string) => make(table) },
        calls,
        writes,
    };
}

describe('reconcileRefunds — read only', () => {
    it('reads only the refund operations and returns the classified report', async () => {
        const events = [event(), event({ provider_event_id: 'evt-2', status: 'skipped', processing_status: 'refund_unlinked' })];
        const refunds = [refund()];
        const fake = makeReadOnlyClient(events, refunds);

        const report = await reconcileRefunds(fake.client as never);

        expect(report.counts.refundEvents).toBe(2);
        expect(report.counts.matched).toBe(1);
        expect(report.counts.skippedEvents).toBe(1);
        expect(report.ok).toBe(false);

        expect(fake.writes).toEqual([]);
        expect(fake.calls).toContain('webhook_events:in:provider_operation:5');
        expect(fake.calls).toContain('webhook_events:limit:500');
        expect(fake.calls).toContain('refunds:limit:500');
        expect(REFUND_EVENT_OPERATIONS).toHaveLength(5);
    });

    it('does not treat admin-recorded refunds as orphan rows', async () => {
        const fake = makeReadOnlyClient([], [refund({ raw_response: { source: 'admin' } })]);

        const report = await reconcileRefunds(fake.client as never);

        expect(report.counts.adminRefunds).toBe(1);
        expect(report.counts.refundsWithoutEvent).toBe(0);
        expect(report.ok).toBe(true);
        expect(fake.writes).toEqual([]);
    });

    it('flags truncation when either read reaches maxRows', async () => {
        const events = Array.from({ length: 2 }, (_, i) => event({ provider_event_id: `evt-${i}` }));
        const fake = makeReadOnlyClient(events, [refund()]);

        const report = await reconcileRefunds(fake.client as never, { maxRows: 2 });

        expect(report.truncated).toBe(true);
        expect(fake.calls).toContain('webhook_events:limit:2');
    });

    it('fails loudly instead of reporting zero rows when the events read fails', async () => {
        const fake = makeReadOnlyClient([], [], { eventError: { message: 'permission denied' } });

        await expect(reconcileRefunds(fake.client as never)).rejects.toThrow(
            /webhook_events read failed: permission denied/
        );
    });

    it('fails loudly instead of reporting zero rows when the refunds read fails', async () => {
        const fake = makeReadOnlyClient([], [], { refundError: { message: 'relation does not exist' } });

        await expect(reconcileRefunds(fake.client as never)).rejects.toThrow(
            /refunds read failed: relation does not exist/
        );
    });
});
