/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  §6.3 GATEWAY FEE RESOLUTION (F)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  THE DEFECT THIS FIXES
 *  `fulfillmentService` used to call `freezeOrderSplits(supabase, invoiceId)`
 *  with no fee argument, so `gatewayFeeMinor` defaulted to 0. The split engine
 *  therefore computed `netAmountMinor = gross - 0 = gross`, every split was
 *  taken on the FULL gross, and `financial_ledger` was posted with
 *  `gatewayFeeMinor: 0` — which meant the `GATEWAY_FEES` debit/credit pair was
 *  never emitted at all. The 85/10/5 beneficiaries were credited the entire
 *  captured amount and the real processing fee was silently absorbed as
 *  merchant revenue. The signed §6.3 basis is `N = G - F`; the code was
 *  computing `N = G`.
 *
 *  WHY THERE IS NO SINGLE OBVIOUS SOURCE
 *  This module deliberately does NOT invent a fee. Investigation of the whole
 *  payment stack found that no fee source existed:
 *    · Kashier's webhook payload parser (`kashierVerification.ts`) surfaces
 *      status, orderId, transactionId, amount and currency — no fee field.
 *    · No table stored a provider fee. `order_splits.gateway_fee_minor` is
 *      written FROM this value, so it cannot be its own source.
 *    · `merchant_configs` had no fee columns.
 *  So the fee is resolved through an explicit, auditable precedence chain, and
 *  when no source yields one the caller is told to FAIL CLOSED rather than
 *  defaulting to zero — which is precisely the bug being fixed.
 *
 *  PRECEDENCE (first match wins)
 *   1. `persistedFeeMinor` — `payment_intents.gateway_fee_minor`, already
 *      resolved for this intent. This makes settlement deterministic: a webhook
 *      replay or a reconciliation pass reuses the identical F instead of
 *      re-deriving a disagreeing one.
 *   2. Provider-reported fee — an explicit fee field in the verified payload,
 *      read in the SAME major-unit convention as `amount` (Kashier reports
 *      `amount` in major units; `verifyPaidAmount` relies on this).
 *   3. The APPROVED Kashier schedule for the ACTUAL provider payment method —
 *      `kashier_fee_method_map` (normalised method -> schedule) then
 *      `kashier_fee_schedules` (rate, floor, cap).
 *   4. None of the above → resolution failure. Settlement refuses to post.
 *
 *  WHY THERE IS NO REGIONAL OR "GLOBAL" FEE FALLBACK
 *  An earlier design stored the fee on `merchant_configs` and resolved it per
 *  region, falling back to the 'GLOBAL' row. That model was REMOVED, and this is
 *  the reason, so it is not "simplified" back in later:
 *
 *    · A Kashier fee is a function of HOW the customer paid. A region cannot
 *      tell you that. A 'GLOBAL' default answers "how much did Kashier keep?"
 *      for a payment method nobody looked at.
 *    · The failure is silent and one-sided. The §6.3 split is applied to
 *      N = G - F, so a too-small F does not merely mis-post GATEWAY_FEES — it
 *      INFLATES N and silently overpays all three beneficiaries by the same
 *      absolute amount. No total is wrong, so no reconciliation would catch it.
 *    · Failing closed is cheap and reversible; the customer is not charged by
 *      the webhook, and the invoice stays pending for a retry.
 *
 *  The same reasoning governs the method match: an unknown, absent, or only
 *  PARTIALLY matching method is `gateway_fee_unresolved`. There is no LIKE, no
 *  prefix match, and no "closest known method", because a fuzzy match that
 *  selects the wrong category mis-prices the fee in a way no test would catch.
 *
 *  A fee of 0 remains a legitimate, meaningful value: a schedule may genuinely
 *  price at 0%, or a merchant may contractually pay nothing. It is expressed by
 *  configuring a 0 rate, and is never produced by omission.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export type GatewayFeeSource = 'persisted' | 'provider' | 'kashier_schedule';

export interface KashierFeeScheduleRow {
    /** 'card_settled' | 'instant_transfer'. */
    code: string;
    /** Percentage of gross, e.g. 0.2 or 2.5. numeric(7,4) → arrives as string. */
    rate_percent: number | string;
    /** Floor in minor units; null = no minimum. */
    min_fee_minor: number | null;
    /** Ceiling in minor units; null = no maximum. */
    max_fee_minor: number | null;
    active?: boolean;
}

export interface KashierFeeMethodMapRow {
    provider_method_key: string;
    schedule_code: string;
    active?: boolean;
}

export type GatewayFeeResolution =
    | { ok: true; feeMinor: number; source: GatewayFeeSource; scheduleCode?: string }
    | { ok: false; reason: string };

/**
 * Explicit, unambiguous fee field names. A field is only considered if it is
 * named as a fee AND parses to a finite number — a missing or malformed value
 * falls through to the next source rather than being coerced to 0.
 */
const PROVIDER_FEE_FIELDS = [
    'fee',
    'fees',
    'gatewayFee',
    'gatewayFeeAmount',
    'processingFee',
    'serviceFee',
    'transactionFees',
    'totalFees',
] as const;

/** Reads a scalar fee out of an object/array container (e.g. `fees: [...]`). */
function scalarFromContainer(value: unknown): number | null {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    if (Array.isArray(value)) {
        for (const entry of value) {
            const scalar = scalarFromContainer(entry);
            if (scalar !== null) {
                return scalar;
            }
        }
        return null;
    }
    if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        for (const key of ['amount', 'value', 'total', 'feeAmount', 'gross']) {
            const scalar = scalarFromContainer(record[key]);
            if (scalar !== null) {
                return scalar;
            }
        }
    }
    return null;
}

/**
 * Extracts a provider-reported fee in MINOR units.
 *
 * Kashier reports `amount` in major units (that is the convention
 * `verifyPaidAmount` already depends on), so a fee field in the same envelope
 * is read as major units and converted once. Returns `null` — never 0 — when
 * the payload carries no usable fee.
 */
export function readProviderFeeMinor(
    payload: Record<string, unknown> | null | undefined,
    grossMinor: number
): number | null {
    if (!payload || typeof payload !== 'object') {
        return null;
    }
    const nested =
        payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
            ? (payload.data as Record<string, unknown>)
            : null;

    for (const field of PROVIDER_FEE_FIELDS) {
        const raw = (nested && nested[field] !== undefined ? nested[field] : payload[field]) as
            | unknown
            | undefined;
        if (raw === undefined || raw === null || raw === '') {
            continue;
        }
        const major = scalarFromContainer(raw);
        if (major === null || major < 0) {
            continue;
        }
        const minor = Math.round(major * 100);
        if (Number.isInteger(minor) && minor >= 0 && minor < grossMinor) {
            return minor;
        }
    }
    return null;
}

/**
 * Method fields inspected on the verified Kashier payload, in priority order.
 *
 * These are deliberately METHOD-SPECIFIC names. A generic `type` is excluded on
 * purpose: Kashier's session envelope carries a `type` (e.g. "one-time") that
 * has nothing to do with how the customer paid, and matching it would resolve a
 * session type as a payment method. Guessing here is the one thing that must not
 * happen, so an unrecognised shape simply yields `null` → fail closed.
 */
const PROVIDER_METHOD_FIELDS = [
    'paymentMethod',
    'payment_method',
    'methodType',
    'method_type',
    'paymentChannel',
    'payment_channel',
    'channel',
    'cardType',
    'card_type',
    'issuerName',
    'issuer_name',
] as const;

/**
 * Normalises a raw provider method token to its lookup key: lowercased with
 * every non-alphanumeric character removed.
 *
 *   "Card Transfer" → "cardtransfer"     "CARD" → "card"
 *   "  visa  "      → "visa"             "instapay" → "instapay"
 *
 * Returns `null` when nothing usable remains. The result is only ever used as an
 * EXACT primary-key lookup — see the module header for why fuzzy matching is
 * prohibited.
 */
export function normalizeProviderMethodKey(raw: unknown): string | null {
    if (typeof raw === 'number' && Number.isFinite(raw)) {
        // A numeric method (e.g. Kashier's issuer id) is NOT a method name.
        // Treating it as one would map unrelated issuers onto one schedule.
        return null;
    }
    if (typeof raw !== 'string') {
        return null;
    }
    const normalized = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalized.length > 0 ? normalized : null;
}

/**
 * Reads the raw provider payment method out of a verified payload.
 * Returns the RAW value; normalisation is the caller's explicit step so the
 * two concerns stay separately testable.
 */
export function readProviderMethodRaw(
    payload: Record<string, unknown> | null | undefined
): string | null {
    if (!payload || typeof payload !== 'object') {
        return null;
    }
    const nested =
        payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
            ? (payload.data as Record<string, unknown>)
            : null;

    for (const field of PROVIDER_METHOD_FIELDS) {
        const raw = (nested && nested[field] !== undefined ? nested[field] : payload[field]) as
            | unknown
            | undefined;
        if (raw === undefined || raw === null) {
            continue;
        }
        if (typeof raw === 'string' && raw.trim() !== '') {
            return raw;
        }
    }
    return null;
}

/**
 * Converts a schedule rate into exact integer basis points (1% = 10_000).
 *
 * `kashier_fee_schedules.rate_percent` is `numeric(7,4)`, so PostgREST returns
 * it as a string like "0.2000". Parsing the DECIMAL STRING into basis points
 * keeps the entire fee computation in exact integer arithmetic — no float ever
 * multiplies the gross, so the result is bit-identical on every platform and
 * every replay.
 *
 * Returns `null` for a malformed, negative, or out-of-range rate. A bad rate is
 * a configuration error, never a zero fee.
 */
export function parseRateBasisPoints(raw: number | string | null | undefined): number | null {
    if (raw === null || raw === undefined || raw === '') {
        return null;
    }
    let scaled: number;
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        // A rate is never negative, so a leading '-' is a malformed value rather
        // than something to normalise. The pattern deliberately REJECTS it: an
        // earlier version allowed it and then dropped the sign while splitting
        // the fraction, which turned '-0.5' into 5000 basis points — a 50% fee.
        if (!/^\d+(\.\d+)?$/.test(trimmed)) {
            return null;
        }
        const [whole = '0', fraction = ''] = trimmed.split('.');
        // numeric(7,4) never exceeds 4 decimals; extra digits are truncated
        // rather than rounded so a stored rate can never be inflated.
        const fractionPadded = (fraction + '0000').slice(0, 4);
        scaled = Number(whole) * 10_000 + Number(fractionPadded);
    } else if (typeof raw === 'number') {
        if (!Number.isFinite(raw)) {
            return null;
        }
        scaled = Math.round(raw * 10_000);
    } else {
        return null;
    }
    if (!Number.isInteger(scaled) || scaled < 0 || scaled >= 1_000_000) {
        return null;
    }
    return scaled;
}

/**
 * Computes F from an APPROVED Kashier schedule.
 *
 *     F = clamp(round(G * rate_percent / 100), min_fee_minor, max_fee_minor)
 *
 * Evaluated entirely in integer minor units:
 *
 *     F = round(G * basis_points / 1_000_000)      ← half-up, deterministic
 *     F = max(F, min_fee_minor)                    ← when a floor is configured
 *     F = min(F, max_fee_minor)                    ← when a cap is configured
 *
 * `Math.round` is half-up for non-negative values, so a .5 minor ties upward
 * consistently. There is no banker's rounding and no platform-dependent
 * behaviour.
 *
 * Returns `null` when the schedule is absent or malformed, which the caller
 * turns into a fail-closed refusal — never a zero fee.
 */
export function computeFeeFromSchedule(
    grossMinor: number,
    schedule: KashierFeeScheduleRow | null | undefined
): number | null {
    if (!schedule) {
        return null;
    }
    if (!Number.isInteger(grossMinor) || grossMinor <= 0) {
        return null;
    }

    const basisPoints = parseRateBasisPoints(schedule.rate_percent);
    if (basisPoints === null) {
        return null;
    }

    const minFee = schedule.min_fee_minor;
    if (minFee !== null && minFee !== undefined) {
        if (!Number.isInteger(minFee) || minFee < 0) {
            return null;
        }
    }
    const maxFee = schedule.max_fee_minor;
    if (maxFee !== null && maxFee !== undefined) {
        if (!Number.isInteger(maxFee) || maxFee < 0) {
            return null;
        }
    }
    if (
        minFee !== null &&
        minFee !== undefined &&
        maxFee !== null &&
        maxFee !== undefined &&
        minFee > maxFee
    ) {
        // An empty clamp band: every value would be clamped to an impossible
        // range. Refuse rather than emit a nonsense fee.
        return null;
    }

    let feeMinor = Math.round((grossMinor * basisPoints) / 1_000_000);
    if (minFee !== null && minFee !== undefined) {
        feeMinor = Math.max(feeMinor, minFee);
    }
    if (maxFee !== null && maxFee !== undefined) {
        feeMinor = Math.min(feeMinor, maxFee);
    }
    return Number.isInteger(feeMinor) && feeMinor >= 0 ? feeMinor : null;
}

/**
 * Resolves the §6.3 gateway fee for a capture.
 *
 * @param grossMinor        Captured gross in minor units (G).
 * @param persistedFeeMinor Already-resolved F on the intent, if any.
 * @param providerPayload   The verified provider payload, if any.
 * @param providerMethod    The verified raw provider payment method, if the
 *                          caller already holds it. Falls back to reading it
 *                          from `providerPayload`.
 */
export async function resolveGatewayFee(params: {
    supabase: SupabaseClient;
    grossMinor: number;
    persistedFeeMinor?: number | null;
    providerPayload?: Record<string, unknown> | null;
    providerMethod?: string | null;
}): Promise<GatewayFeeResolution> {
    const { supabase, grossMinor } = params;

    if (!Number.isInteger(grossMinor) || grossMinor <= 0) {
        return { ok: false, reason: `invalid gross ${grossMinor}` };
    }

    // 1. Already resolved for this intent — reuse it verbatim so a replay or a
    //    reconciliation pass can never produce a disagreeing journal.
    if (
        params.persistedFeeMinor !== null &&
        params.persistedFeeMinor !== undefined &&
        Number.isInteger(params.persistedFeeMinor) &&
        params.persistedFeeMinor >= 0 &&
        params.persistedFeeMinor < grossMinor
    ) {
        return { ok: true, feeMinor: params.persistedFeeMinor, source: 'persisted' };
    }

    // 2. Provider-reported actual.
    const providerFee = readProviderFeeMinor(params.providerPayload, grossMinor);
    if (providerFee !== null) {
        return { ok: true, feeMinor: providerFee, source: 'provider' };
    }

    // 3. The ACTUAL provider payment method → explicit approved schedule.
    const rawMethod = params.providerMethod ?? readProviderMethodRaw(params.providerPayload);
    const methodKey = normalizeProviderMethodKey(rawMethod);
    if (methodKey === null) {
        return {
            ok: false,
            reason:
                'gateway fee unresolved: the verified provider payload carries no ' +
                'usable payment method, so no approved schedule can be selected',
        };
    }

    // 3a. Exact match only. A miss is UNMAPPED — never a partial or fuzzy hit.
    const { data: mapping, error: mappingError } = await supabase
        .from('kashier_fee_method_map')
        .select('provider_method_key, schedule_code')
        .eq('provider_method_key', methodKey)
        .eq('active', true)
        .limit(1)
        .maybeSingle();

    if (mappingError) {
        return {
            ok: false,
            reason: `kashier fee method map lookup failed: ${mappingError.message}`,
        };
    }
    if (!mapping) {
        return {
            ok: false,
            reason:
                `gateway fee unresolved: payment method "${methodKey}" is not mapped to ` +
                'an approved fee schedule (refusing to guess)',
        };
    }

    // 3b. Load the schedule the mapping points at. An inactive or missing row is
    //     a configuration gap, not a zero fee.
    const { data: schedule, error: scheduleError } = await supabase
        .from('kashier_fee_schedules')
        .select('code, rate_percent, min_fee_minor, max_fee_minor')
        .eq('code', (mapping as KashierFeeMethodMapRow).schedule_code)
        .eq('active', true)
        .limit(1)
        .maybeSingle();

    if (scheduleError) {
        return {
            ok: false,
            reason: `kashier fee schedule lookup failed: ${scheduleError.message}`,
        };
    }
    if (!schedule) {
        return {
            ok: false,
            reason:
                `gateway fee unresolved: fee schedule ` +
                `"${(mapping as KashierFeeMethodMapRow).schedule_code}" is not configured`,
        };
    }

    const scheduleRow = schedule as KashierFeeScheduleRow;
    const scheduleFee = computeFeeFromSchedule(grossMinor, scheduleRow);
    if (scheduleFee === null) {
        return {
            ok: false,
            reason:
                `gateway fee unresolved: schedule "${scheduleRow.code}" is malformed ` +
                `(rate=${String(scheduleRow.rate_percent)})`,
        };
    }
    if (scheduleFee >= grossMinor) {
        // F must be strictly less than G so N = G - F stays positive. A schedule
        // whose floor exceeds the gross is refused rather than clamped to 0,
        // which would hand the fee to the beneficiaries.
        return {
            ok: false,
            reason:
                `gateway fee unresolved: schedule "${scheduleRow.code}" yields ` +
                `F=${scheduleFee} which is not less than G=${grossMinor}`,
        };
    }

    return {
        ok: true,
        feeMinor: scheduleFee,
        source: 'kashier_schedule',
        scheduleCode: scheduleRow.code,
    };
}

