import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../server/auth/require-admin';
import { buildSanitizedUpstreamMessage } from '../../../../../server/payments/gateways/KashierGateway';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * TEMPORARY Gate 3 preflight. Removed immediately after verification.
 *
 * Read-only: issues GET against the Kashier Dashboard API for the six
 * owner-supplied Live payment links and returns whitelisted, non-secret
 * metadata. It performs no database access, no writes, and no payments.
 * Live credentials are read server-side and are never returned or logged.
 */

const LIVE_API_BASE = 'https://api.kashier.io';
const UPSTREAM_TIMEOUT_MS = 15000;

/** Owner-supplied. Intentionally not derivable from, or linked to, any PP id. */
const OWNER_SUPPLIED_PL_IDS = [
    'PL-487616250298X',
    'PL-4876162503X55',
    'PL-4876162504F7E',
    'PL-4876162505ZQ7',
    'PL-48761625065D0',
    'PL-48761625075DP',
] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

/** Returns the first value whose key is present, so a missing field stays null. */
function pick(source: Record<string, unknown>, keys: readonly string[]): unknown {
    for (const key of keys) {
        if (source[key] !== undefined && source[key] !== null) return source[key];
    }
    return null;
}

function asText(value: unknown): string | null {
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

/**
 * Scalar tolerant: Kashier returns some numeric fields as JSON numbers, so a
 * strict string check would silently report them as absent.
 */
function asScalar(value: unknown): string | null {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed !== '' ? trimmed : null;
    }
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    if (typeof value === 'boolean') return String(value);
    return null;
}

function asBoolean(value: unknown): boolean | null {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
}

/** Keys that must never be echoed back, whatever their value type. */
const SENSITIVE_FIELD = /(customer|client|buyer|subscriber|email|phone|address|token|secret|api[_-]?key|auth|password|signature|iban|card\s*(number|num|no\b)|cvv|cvc)/i;

/** Key names are metadata, but credential- and customer-shaped ones are not echoed. */
function redactKey(key: string): string {
    return SENSITIVE_FIELD.test(key) ? '[redacted]' : key;
}

/** Only short, plain enum-like text is safe to surface verbatim. */
function isSafeEnumText(value: string): boolean {
    return value.length <= 48 && /^[A-Za-z0-9 _.,:/()\-#]+$/.test(value);
}

type PaymentConfiguration = Record<string, boolean | number | string | string[]>;

const PAYMENT_CONFIG_ROOTS = [
    'paymentMethods',
    'allowedPaymentMethods',
    'availablePaymentMethods',
    'paymentMethodConfiguration',
    'paymentOptions',
    'paymentTypes',
] as const;

/** Any top-level key that names itself as payment related. */
const PAYMENT_KEY_HINT = /payment|payWith|wallet|card|installment|bankTransfer|cash/i;

/**
 * Rebuilds the payment-method configuration from primitive leaves only.
 *
 * The upstream value is never returned as-is: objects and arrays are walked,
 * and each leaf is re-emitted only when it is a boolean, a finite number, or a
 * short enum-like string. Anything else - and anything under a customer or
 * credential-shaped key - is dropped, so no customer data, secret, or
 * free-form text can leak through this diagnostic.
 */
function collectPaymentConfiguration(raw: Record<string, unknown>): PaymentConfiguration | null {
    const collected: PaymentConfiguration = {};

    const visit = (key: string, value: unknown, depth: number): void => {
        if (SENSITIVE_FIELD.test(key) || depth > 3) return;

        if (Array.isArray(value)) {
            const entries = value
                .filter((entry): entry is string => typeof entry === 'string' && isSafeEnumText(entry.trim()))
                .map((entry) => entry.trim());
            if (entries.length > 0) collected[key] = entries;
            return;
        }

        const record = asRecord(value);
        if (record !== null) {
            for (const [nestedKey, nestedValue] of Object.entries(record)) {
                visit(nestedKey, nestedValue, depth + 1);
            }
            return;
        }

        if (typeof value === 'boolean') {
            collected[key] = value;
        } else if (typeof value === 'number' && Number.isFinite(value)) {
            collected[key] = value;
        } else if (typeof value === 'string' && isSafeEnumText(value.trim())) {
            collected[key] = value.trim();
        }
    };

    for (const root of PAYMENT_CONFIG_ROOTS) {
        if (raw[root] !== undefined && raw[root] !== null) visit(root, raw[root], 0);
    }

    // Cover upstream naming we did not anticipate, but only for booleans and
    // enums; a non-primitive stays out of the result entirely.
    for (const [key, value] of Object.entries(raw)) {
        if ((PAYMENT_CONFIG_ROOTS as readonly string[]).includes(key)) continue;
        if (!PAYMENT_KEY_HINT.test(key)) continue;
        if (typeof value === 'object' && value !== null) continue;
        visit(key, value, 0);
    }

    return Object.keys(collected).length > 0 ? collected : null;
}

/**
 * Kashier dashboard-API responses wrap the payload, e.g. { data: { ... } }.
 * Peel the known envelope keys to reach the innermost object. Recognition is
 * checked separately so an unrecognised payload can still be described.
 */
function locatePayload(parsed: Record<string, unknown> | null): Record<string, unknown> | null {
    if (parsed === null) return null;

    for (const key of ['data', 'body', 'paymentLink'] as const) {
        const inner = asRecord(parsed[key]);
        if (inner !== null) return inner;
        // List-style envelopes wrap an array.
        const asArray = parsed[key];
        if (Array.isArray(asArray)) {
            const first = asRecord(asArray[0]);
            if (first !== null) return first;
        }
    }

    return parsed;
}

const LINK_IDENTITY_FIELDS = [
    'paymentLinkId', 'urlIdentifier', 'merchantId', 'paymentRequestId',
    'totalAmount', 'amount', 'invoiceItems', 'currency',
] as const;

function looksLikeLink(record: Record<string, unknown>): boolean {
    return LINK_IDENTITY_FIELDS.some((key) => record[key] !== undefined && record[key] !== null);
}

/** Merchant identity may be flat or nested under merchant / merchantInfo. */
function extractMerchantId(record: Record<string, unknown>): string | null {
    const direct = asScalar(pick(record, ['merchantId', 'merchant_id', 'mid']));
    if (direct !== null) return direct;

    for (const key of ['merchant', 'merchantInfo', 'account'] as const) {
        const nested = asRecord(pick(record, [key]));
        if (nested === null) continue;
        const nestedId = asScalar(pick(nested, ['id', 'merchantId', 'merchant_id', 'mid']));
        if (nestedId !== null) return nestedId;
    }
    return null;
}

/**
 * Key names and value types only, never values. Used to confirm which envelope
 * and field names Kashier actually returns without disclosing any content.
 */
function describeShape(value: unknown, depth = 0): Record<string, string> {
    const record = asRecord(value);
    if (record === null || depth > 1) return {};

    const shape: Record<string, string> = {};
    for (const [key, entry] of Object.entries(record)) {
        const name = redactKey(key);
        if (entry === null) {
            shape[name] = 'null';
        } else if (Array.isArray(entry)) {
            shape[name] = `array(${entry.length})`;
        } else if (typeof entry === 'object') {
            shape[name] = 'object';
            for (const [nestedKey, nestedValue] of Object.entries(entry as Record<string, unknown>)) {
                shape[`${name}.${redactKey(nestedKey)}`] = Array.isArray(nestedValue)
                    ? `array(${nestedValue.length})`
                    : (nestedValue === null ? 'null' : typeof nestedValue);
            }
        } else {
            shape[name] = typeof entry;
        }
    }
    return shape;
}

function sanitizePaymentLink(
    raw: Record<string, unknown>,
    requestedPl: string,
    expectedMerchantId: string | null,
) {
    // The v2 link object nests the store name under merchantInfo.
    const merchantInfo = asRecord(pick(raw, ['merchantInfo']));
    const items = Array.isArray(raw.invoiceItems) ? raw.invoiceItems : [];

    // Per-item name and amount, so the total can be checked against the
    // products rather than taken on trust.
    const itemEntries = items.map((item) => {
        const record = asRecord(item) ?? {};
        return {
            name: asScalar(pick(record, ['description', 'name', 'title'])),
            amount: asScalar(pick(record, ['amount', 'totalAmount', 'price'])),
            quantity: asScalar(pick(record, ['quantity'])),
            currency: asScalar(pick(record, ['currency'])),
        };
    });
    const itemNames = itemEntries
        .map((item) => item.name)
        .filter((name): name is string => name !== null);

    const description = asScalar(pick(raw, ['description']));
    const merchantId = extractMerchantId(raw);
    const storeName =
        asScalar(pick(merchantInfo ?? {}, ['storeName', 'name']))
        ?? asScalar(pick(asRecord(pick(raw, ['merchant'])) ?? {}, ['storeName', 'name']))
        ?? asScalar(pick(raw, ['storeName']));

    // A PP association is reported only when Kashier explicitly returns one.
    // It is never derived, guessed, or resolved from the PL.
    const explicitPp = asScalar(pick(raw, ['ppLink', 'pp', 'ppId', 'prepaymentPageLink', 'prepaymentPage']));

    return {
        pl: asScalar(pick(raw, ['paymentLinkId', 'urlIdentifier', 'paymentRequestId'])) ?? requestedPl,
        requestedPl,
        merchantId,
        storeName,
        matchesLiveEgyptMerchant: expectedMerchantId !== null && merchantId === expectedMerchantId,
        // Product identity: link description, else the invoice item names.
        product: description ?? (itemNames.length > 0 ? itemNames.join(' | ') : null),
        // Kept separate so a link name can never be mistaken for the product.
        linkName: asScalar(pick(raw, ['title', 'linkName', 'paymentLinkName', 'name'])),
        items: itemEntries,
        // totalAmount is read first; a JSON number is accepted, not just a string.
        amount: asScalar(pick(raw, ['totalAmount', 'amount'])),
        amountIsNumeric: typeof raw.totalAmount === 'number' || typeof raw.amount === 'number',
        currency: asScalar(pick(raw, ['currency'])),
        state: asScalar(pick(raw, ['state'])),
        paymentStatus: asScalar(pick(raw, ['paymentStatus'])),
        paymentType: asScalar(pick(raw, ['paymentType', 'paymentTypes', 'type'])),
        // Primitive leaves only; never the raw upstream value.
        paymentMethods: collectPaymentConfiguration(raw),
        isPaymentLink: asBoolean(raw.isPaymentLink),
        isSuspendedPayment: asBoolean(raw.isSuspendedPayment),
        dueDate: asScalar(pick(raw, ['dueDate'])),
        referenceId: asScalar(pick(raw, ['referenceId', 'invoiceReferenceId'])),
        // Only ever a value Kashier itself returned; never inferred from the PL.
        associatedPp: explicitPp,
        ppInferred: false,
    };
}

export async function GET(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (!authResult.authorized) return authResult.response;

    const liveSecretKey = process.env.KASHIER_LIVE_SECRET_KEY;
    const liveMerchantId = process.env.KASHIER_LIVE_MERCHANT_ID;

    if (!liveSecretKey || !liveMerchantId) {
        return NextResponse.json(
            {
                error: 'Live configuration unavailable',
                liveMerchantConfigured: Boolean(liveMerchantId),
                liveSecretConfigured: Boolean(liveSecretKey),
            },
            { status: 503 },
        );
    }

    const results = [];
    let observedShape: {
        envelopeKeys: string[];
        linkKeys: string[];
        fieldTypes: Record<string, string>;
    } | null = null;

    for (const pl of OWNER_SUPPLIED_PL_IDS) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

        try {
            const upstream = await fetch(`${LIVE_API_BASE}/v2/payment-link/${pl}`, {
                method: 'GET',
                headers: {
                    Authorization: liveSecretKey,
                    Accept: 'application/json',
                },
                cache: 'no-store',
                signal: controller.signal,
            });

            const rawBody = await upstream.text();
            let parsed: Record<string, unknown> | null = null;
            if (upstream.ok) {
                try {
                    parsed = asRecord(JSON.parse(rawBody));
                } catch {
                    parsed = null;
                }
            }

            // A non-2xx body is an error payload, not a payment link: never let it
            // be reported as a verified link just because it happened to parse.
            const payload = upstream.ok ? locatePayload(parsed) : null;
            const recognized = payload !== null && looksLikeLink(payload);

            // Capture the shape even when unrecognised, so the keys Kashier
            // actually returns are visible without revealing any value.
            if (payload !== null && observedShape === null) {
                observedShape = {
                    envelopeKeys: parsed === null ? [] : Object.keys(parsed).map(redactKey),
                    linkKeys: Object.keys(payload).map(redactKey),
                    fieldTypes: describeShape(payload),
                };
            }

            results.push({
                pl,
                upstreamStatus: upstream.status,
                upstreamOk: upstream.ok,
                shapeRecognized: recognized,
                link: recognized
                    ? sanitizePaymentLink(payload as Record<string, unknown>, pl, liveMerchantId)
                    : null,
                error: upstream.ok
                    ? null
                    : {
                        message: buildSanitizedUpstreamMessage(rawBody) ?? `Upstream responded ${upstream.status}`,
                    },
            });
        } catch (error) {
            results.push({
                pl,
                upstreamStatus: null,
                upstreamOk: false,
                link: null,
                error: {
                    message: error instanceof Error && error.name === 'AbortError'
                        ? 'Upstream request timed out'
                        : 'Upstream request failed',
                },
            });
        } finally {
            clearTimeout(timer);
        }
    }

    const found = results.filter((r) => r.link !== null);
    const mismatched = found.filter((r) => r.link?.matchesLiveEgyptMerchant === false);
    const unresolved = results.filter((r) => r.upstreamOk && r.link === null);

    return NextResponse.json(
        {
            checkedAt: new Date().toISOString(),
            liveHost: LIVE_API_BASE,
            readOnly: true,
            // Key names and value types from the first successful read, so the
            // envelope actually used by Kashier can be confirmed. No values.
            observedSchema: observedShape,
            summary: {
                total: OWNER_SUPPLIED_PL_IDS.length,
                found: found.length,
                missing: OWNER_SUPPLIED_PL_IDS.length - found.length,
                unresolvedShape: unresolved.length,
                mismatchedMerchant: mismatched.length,
                allMatchLiveEgyptMerchant:
                    found.length === OWNER_SUPPLIED_PL_IDS.length
                    && mismatched.length === 0
                    && unresolved.length === 0,
            },
            results,
        },
        { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
}
