/**
 * tests/unit/kashierNestedEnvelope.test.ts
 *
 * Contract tests for the documented Kashier webhook envelope.
 *
 * Kashier posts the transaction envelope nested under `data`, and the
 * transaction-status signal is `data.status`. The event name alone must never be
 * treated as success. These tests pin that contract for the documented statuses
 * (SUCCESS / FAILURE / PENDING) plus the missing/invalid cases, and verify the
 * legacy flat payload shape still resolves identically.
 */
import { describe, it, expect } from 'vitest';
import {
    resolveKashierPaymentOutcome,
    buildKashierWebhookView,
    readKashierNestedData,
} from '../../server/payments/gateways/kashierVerification';

describe('readKashierNestedData', () => {
    it('returns the nested object for a documented envelope', () => {
        expect(readKashierNestedData({ data: { status: 'SUCCESS' } })).toEqual({ status: 'SUCCESS' });
    });

    it('returns null when data is absent, null, or not an object', () => {
        expect(readKashierNestedData({})).toBeNull();
        expect(readKashierNestedData({ data: null })).toBeNull();
        expect(readKashierNestedData({ data: 'SUCCESS' })).toBeNull();
        expect(readKashierNestedData({ data: ['SUCCESS'] })).toBeNull();
    });
});

describe('resolveKashierPaymentOutcome — documented nested data.status', () => {
    it('resolves SUCCESS from data.status', () => {
        const r = resolveKashierPaymentOutcome({
            event: 'transaction.paid',
            signature: 'x',
            signatureKeys: 'data',
            merchantId: 'M1',
            data: { status: 'SUCCESS', transactionId: 'TX1', orderId: 'ORD1' },
        });
        expect(r.outcome).toBe('SUCCESS');
        expect(r.isReconciled).toBe(true);
    });

    it('resolves FAILURE from data.status', () => {
        const r = resolveKashierPaymentOutcome({
            event: 'transaction.paid',
            data: { status: 'FAILURE', transactionId: 'TX2', orderId: 'ORD2' },
        });
        expect(r.outcome).toBe('FAILURE');
    });

    it('resolves PENDING from data.status and never settles', () => {
        const r = resolveKashierPaymentOutcome({
            event: 'transaction.paid',
            data: { status: 'PENDING', transactionId: 'TX3', orderId: 'ORD3' },
        });
        expect(r.outcome).toBe('PENDING');
        expect(r.isReconciled).toBe(false);
    });

    it('is case and whitespace insensitive on the nested status', () => {
        expect(
            resolveKashierPaymentOutcome({ data: { status: '  success  ' } }).outcome
        ).toBe('SUCCESS');
        expect(
            resolveKashierPaymentOutcome({ data: { status: 'pending' } }).outcome
        ).toBe('PENDING');
    });

    it('never infers SUCCESS from the event name alone', () => {
        // Event says "paid", documented status says FAILURE -> failure wins.
        const r = resolveKashierPaymentOutcome({
            event: 'transaction.paid',
            eventName: 'PAYMENT_SUCCESS',
            data: { status: 'FAILURE' },
        });
        expect(r.outcome).toBe('FAILURE');
    });

    it('fails closed to UNKNOWN when data.status is missing', () => {
        const r = resolveKashierPaymentOutcome({
            event: 'transaction.paid',
            signature: 'x',
            signatureKeys: 'data',
            data: { transactionId: 'TX4', orderId: 'ORD4' },
        });
        expect(r.outcome).toBe('UNKNOWN');
        expect(r.isReconciled).toBe(false);
    });

    it('fails closed to UNKNOWN when data.status is an unmapped value', () => {
        const r = resolveKashierPaymentOutcome({ data: { status: 'SOMETHING_NEW' } });
        expect(r.outcome).toBe('UNKNOWN');
        expect(r.isReconciled).toBe(false);
    });

    it('fails closed to UNKNOWN when the whole envelope is absent', () => {
        expect(resolveKashierPaymentOutcome({}).outcome).toBe('UNKNOWN');
    });

    it('fails closed when data.status is empty', () => {
        expect(resolveKashierPaymentOutcome({ data: { status: '' } }).outcome).toBe('UNKNOWN');
        expect(resolveKashierPaymentOutcome({ data: { status: '   ' } }).outcome).toBe('UNKNOWN');
    });
});

describe('buildKashierWebhookView — identifier extraction', () => {
    it('reads nested transaction identifiers and amount', () => {
        const view = buildKashierWebhookView({
            data: {
                status: 'SUCCESS',
                transactionId: 'TX-9',
                orderId: 'ORD-9',
                amount: '10848.00',
                currency: 'EGP',
            },
        });
        expect(view.status).toBe('SUCCESS');
        expect(view.fromNestedEnvelope).toBe(true);
        expect(view.transactionId).toBe('TX-9');
        expect(view.orderId).toBe('ORD-9');
        expect(view.amount).toBe(10848);
        expect(view.currency).toBe('EGP');
    });

    it('accepts merchantOrderId as a nested order identifier', () => {
        expect(buildKashierWebhookView({ data: { merchantOrderId: 'M-ORD' } }).orderId).toBe('M-ORD');
    });

    it('prefers the documented nested status over a conflicting legacy field', () => {
        const view = buildKashierWebhookView({ orderStatus: 'PENDING', data: { status: 'SUCCESS' } });
        expect(view.status).toBe('SUCCESS');
        expect(resolveKashierPaymentOutcome({ orderStatus: 'PENDING', data: { status: 'SUCCESS' } }).outcome)
            .toBe('SUCCESS');
    });

    it('keeps reading legacy top-level fields when no nested envelope exists', () => {
        const view = buildKashierWebhookView({ orderStatus: 'APPROVED', transactionId: 'TX-L', orderId: 'ORD-L' });
        expect(view.status).toBe('APPROVED');
        expect(view.fromNestedEnvelope).toBe(false);
        expect(view.transactionId).toBe('TX-L');
        expect(view.orderId).toBe('ORD-L');
    });

    it('reads the official `reconcilation` spelling from inside data', () => {
        expect(
            resolveKashierPaymentOutcome({ data: { status: 'SUCCESS', reconcilation: 'FAILED' } }).outcome
        ).toBe('UNKNOWN');
        expect(
            resolveKashierPaymentOutcome({ data: { status: 'SUCCESS', reconcilation: 'NA' } }).outcome
        ).toBe('UNKNOWN');
        expect(
            resolveKashierPaymentOutcome({ data: { status: 'SUCCESS', reconcilation: 'NOT_EXISTS' } }).outcome
        ).toBe('UNKNOWN');
    });

    it('yields undefined amount for non-numeric or missing values', () => {
        expect(buildKashierWebhookView({ data: { amount: 'abc' } }).amount).toBeUndefined();
        expect(buildKashierWebhookView({}).amount).toBeUndefined();
    });
});
