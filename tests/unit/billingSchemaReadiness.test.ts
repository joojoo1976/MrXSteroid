import { describe, it, expect } from 'vitest';
import {
    BILLING_MIGRATION_PENDING,
    billingUnavailableMessage,
    isSchemaNotReadyError,
} from '../../server/payments/schemaReadiness';

/**
 * These codes are what the deployed database actually returns while the billing
 * migrations are pending — measured, not assumed:
 *   PGRST202  /rest/v1/rpc/create_invoice_atomic  (function absent)
 *   PGRST205  /rest/v1/invoice_lines              (table absent)
 *   42703     select pricing_version from invoices
 * The point of the classifier is that none of them may be reported as a
 * generic 500, and that an unrelated constraint violation must not be
 * mistaken for "migration pending".
 */
describe('isSchemaNotReadyError', () => {
    it('detects a missing RPC as PostgREST reports it', () => {
        expect(
            isSchemaNotReadyError({
                code: 'PGRST202',
                message: 'Could not find the function public.create_invoice_atomic(p_amount, p_user_id) in the schema cache',
            })
        ).toBe(true);
    });

    it('detects missing tables and columns by Postgres code', () => {
        expect(isSchemaNotReadyError({ code: '42P01', message: 'relation "public.invoice_lines" does not exist' })).toBe(true);
        expect(isSchemaNotReadyError({ code: '42703', message: 'column "pricing_version" does not exist' })).toBe(true);
        expect(isSchemaNotReadyError({ code: '42883', message: 'function settle_invoice_payment_leg(...) does not exist' })).toBe(true);
    });

    it('detects them from the message alone when the code is dropped', () => {
        expect(isSchemaNotReadyError({ message: 'relation "public.invoice_payment_legs" does not exist' })).toBe(true);
        expect(isSchemaNotReadyError({ message: 'column "tier_id" does not exist' })).toBe(true);
        expect(isSchemaNotReadyError({ message: 'Could not find the function public.approve_instapay_receipt' })).toBe(true);
    });

    it('treats the InstaPay status check violation as schema-behind, not as bad input', () => {
        // The defective RPC wrote status='active' into entitlements.
        expect(
            isSchemaNotReadyError({
                code: '23514',
                message: 'new row for relation "entitlements" violates check constraint "entitlements_status_check"',
            })
        ).toBe(true);
    });

    it('does NOT hijack unrelated failures', () => {
        expect(isSchemaNotReadyError(null)).toBe(false);
        expect(isSchemaNotReadyError(undefined)).toBe(false);
        expect(isSchemaNotReadyError({})).toBe(false);
        expect(isSchemaNotReadyError({ code: '23505', message: 'duplicate key value violates unique constraint' })).toBe(false);
        expect(isSchemaNotReadyError({ code: '23514', message: 'violates check constraint "invoices_amount_check"' })).toBe(false);
        expect(isSchemaNotReadyError({ code: 'PGRST301', message: 'JWT expired' })).toBe(false);
        expect(isSchemaNotReadyError({ message: 'fetch failed' })).toBe(false);
    });
});

describe('billingUnavailableMessage', () => {
    it('states that nothing was charged for checkout', () => {
        const message = billingUnavailableMessage('checkout');
        expect(message).toMatch(/migration/i);
        expect(message).toMatch(/no payment has been taken/i);
        expect(message).not.toMatch(/internal server error/i);
    });

    it('states that nothing was settled for approval, and that the receipt is unchanged', () => {
        const message = billingUnavailableMessage('approval');
        expect(message).toMatch(/migration/i);
        expect(message).toMatch(/nothing was settled/i);
        expect(message).toMatch(/receipt is unchanged/i);
    });

    it('exposes a stable machine code', () => {
        expect(BILLING_MIGRATION_PENDING).toBe('BILLING_MIGRATION_PENDING');
    });
});
