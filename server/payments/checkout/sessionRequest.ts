/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  KASHIER PAYMENT SESSION — REQUEST BUILDER
 *  Final Gate v5.1 §36 (Session as primary mechanism) + §37 (Egypt methods)
 *  K-2 C4 (10 required session fields) · K-2 C6 (per-request serverWebhook)
 *
 *  Pure, side-effect-free builder: given the server-resolved checkout context
 *  it produces the exact v3 Payment Sessions payload. No network, no env
 *  mutation, fully unit-testable.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { CurrencyCode, PaymentMethodId } from '../merchantResolver';

/** K-2 C4 — the 10 required Payment Session fields are all present below. */
export const KASHIER_SESSION_TYPE = 'one-time';
export const DEFAULT_SESSION_TTL_MINUTES = 30;
export const DEFAULT_MAX_FAILURE_ATTEMPTS = 3;

export interface KashierSessionRequestInput {
    /** Merchant MID resolved server-side (never client supplied). */
    merchantId: string;
    /** Unique merchant order reference (K-2 C5 — avoids ERR_ORD_02). */
    orderRef: string;
    /** Payable amount in major units, resolved server-side. */
    amount: number;
    currency: CurrencyCode | string;
    /** Customer return URL after the hosted checkout. */
    merchantRedirect: string;
    /** Per-merchant webhook destination (K-2 C6). */
    serverWebhook: string;
    customer: { name: string; email: string };
    display?: 'ar' | 'en';
    paymentMethods?: PaymentMethodId[];
    defaultMethod?: PaymentMethodId;
    type?: string;
    expireAt?: string;
    maxFailureAttempts?: number;
}

/** Exact POST /v3/payment/sessions body. */
export interface KashierSessionRequest {
    merchantId: string;
    order: string;
    amount: string;
    currency: string;
    type: string;
    expireAt: string;
    maxFailureAttempts: number;
    display: 'ar' | 'en';
    merchantRedirect: string;
    serverWebhook: string;
    customer: { name: string; email: string };
    allowedMethods: string;
    defaultMethod: string;
}

function resolveSessionTtlMinutes(): number {
    const raw = Number(process.env.KASHIER_SESSION_TTL_MINUTES);
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_SESSION_TTL_MINUTES;
}

function resolveMaxFailureAttempts(): number {
    const raw = Number(process.env.KASHIER_SESSION_MAX_FAILURE_ATTEMPTS);
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_MAX_FAILURE_ATTEMPTS;
}

/**
 * Build the Kashier v3 Payment Session request body.
 * Throws on any missing/authoritatively-invalid field — the caller must never
 * send a session with a client-derived merchant, amount or currency.
 */
export function buildKashierSessionRequest(input: KashierSessionRequestInput): KashierSessionRequest {
    if (!input.merchantId) throw new Error('[KashierSession] merchantId is required (server-resolved).');
    if (!input.orderRef) throw new Error('[KashierSession] orderRef is required.');
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
        throw new Error(`[KashierSession] amount must be a positive number (got ${input.amount}).`);
    }
    if (!input.currency) throw new Error('[KashierSession] currency is required (server-resolved).');
    if (!input.merchantRedirect) throw new Error('[KashierSession] merchantRedirect is required.');
    if (!input.serverWebhook) throw new Error('[KashierSession] serverWebhook is required (K-2 C6).');
    if (!input.customer?.email || !input.customer?.name) {
        throw new Error('[KashierSession] customer name and email are required.');
    }

    const methods: PaymentMethodId[] = input.paymentMethods && input.paymentMethods.length > 0
        ? input.paymentMethods
        : ['card'];
    const defaultMethod = input.defaultMethod && methods.includes(input.defaultMethod)
        ? input.defaultMethod
        : methods[0];

    const expireAt = input.expireAt
        || new Date(Date.now() + resolveSessionTtlMinutes() * 60_000).toISOString();

    return {
        merchantId: input.merchantId,
        order: input.orderRef,
        amount: input.amount.toFixed(2),
        currency: input.currency.toUpperCase(),
        type: input.type || process.env.KASHIER_SESSION_TYPE || KASHIER_SESSION_TYPE,
        expireAt,
        maxFailureAttempts: input.maxFailureAttempts ?? resolveMaxFailureAttempts(),
        display: input.display || 'en',
        merchantRedirect: input.merchantRedirect,
        serverWebhook: input.serverWebhook,
        customer: { name: input.customer.name, email: input.customer.email },
        allowedMethods: methods.join(','),
        defaultMethod,
    };
}

/** Ordered list of the K-2 C4 required fields, for conformance assertions/tests. */
export const KASHIER_SESSION_REQUIRED_FIELDS = [
    'expireAt',
    'maxFailureAttempts',
    'amount',
    'currency',
    'order',
    'merchantId',
    'merchantRedirect',
    'type',
    'display',
    'customer',
] as const;
