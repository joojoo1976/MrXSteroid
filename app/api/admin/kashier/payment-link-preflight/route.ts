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

function sanitizePaymentLink(
    raw: Record<string, unknown>,
    requestedPl: string,
    expectedMerchantId: string | null,
) {
    // The v2 link object nests the store name under merchantInfo.
    const merchantInfo = asRecord(pick(raw, ['merchantInfo']));
    const items = Array.isArray(raw.invoiceItems) ? raw.invoiceItems : [];
    const itemNames = items
        .map((item) => asText(pick(asRecord(item) ?? {}, ['description'])))
        .filter((name): name is string => name !== null);

    const description = asText(pick(raw, ['description']));
    const merchantId = asText(pick(raw, ['merchantId', 'mid']));
    const storeName = asText(pick(merchantInfo ?? {}, ['storeName'])) ?? asText(pick(raw, ['storeName']));

    // Payment-method configuration is surfaced only under keys Kashier itself uses.
    const paymentMethodConfig = pick(raw, [
        'paymentMethods',
        'allowedPaymentMethods',
        'availablePaymentMethods',
        'paymentMethodConfiguration',
        'paymentOptions',
    ]);

    // A PP association is reported only when Kashier explicitly returns one.
    // It is never derived, guessed, or resolved from the PL.
    const explicitPp = asText(pick(raw, ['ppLink', 'pp', 'ppId', 'prepaymentPageLink', 'prepaymentPage']));

    return {
        pl: asText(pick(raw, ['paymentLinkId', 'urlIdentifier', 'paymentRequestId'])) ?? requestedPl,
        requestedPl,
        merchantId,
        storeName,
        matchesLiveEgyptMerchant: expectedMerchantId !== null && merchantId === expectedMerchantId,
        name: description ?? (itemNames.length > 0 ? itemNames.join(' | ') : null),
        invoiceItems: itemNames,
        amount: asText(pick(raw, ['totalAmount', 'amount'])),
        currency: asText(pick(raw, ['currency'])),
        state: asText(pick(raw, ['state'])),
        paymentStatus: asText(pick(raw, ['paymentStatus'])),
        paymentType: asText(pick(raw, ['paymentType'])),
        paymentMethods: paymentMethodConfig === null ? null : paymentMethodConfig,
        isPaymentLink: raw.isPaymentLink === true,
        isSuspendedPayment: typeof raw.isSuspendedPayment === 'boolean' ? raw.isSuspendedPayment : null,
        dueDate: asText(pick(raw, ['dueDate'])),
        referenceId: asText(pick(raw, ['referenceId', 'invoiceReferenceId'])),
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
            const linkRecord = parsed === null
                ? null
                : asRecord(parsed.body) ?? asRecord(parsed.paymentLink) ?? parsed;

            results.push({
                pl,
                upstreamStatus: upstream.status,
                upstreamOk: upstream.ok,
                link: linkRecord === null
                    ? null
                    : sanitizePaymentLink(linkRecord, pl, liveMerchantId),
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

    return NextResponse.json(
        {
            checkedAt: new Date().toISOString(),
            liveHost: LIVE_API_BASE,
            readOnly: true,
            summary: {
                total: OWNER_SUPPLIED_PL_IDS.length,
                found: found.length,
                missing: OWNER_SUPPLIED_PL_IDS.length - found.length,
                mismatchedMerchant: mismatched.length,
                allMatchLiveEgyptMerchant: found.length === OWNER_SUPPLIED_PL_IDS.length && mismatched.length === 0,
            },
            results,
        },
        { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
}
