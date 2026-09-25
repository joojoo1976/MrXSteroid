/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  KASHIER TRANSFER CREDENTIAL RESOLUTION (Payout / Transfer path)
 *  Credential separation is a financial-integrity requirement:
 *
 *    Payment webhook verification  -> Payment API Key  (sorted, URL-encoded)
 *    Transfer webhook verification -> Transfer API Key (array order, raw)
 *    Create/Read Transfer API auth -> Merchant Secret Key (Authorization)
 *    Merchant identity             -> MID (never a signing secret)
 *
 *  A Transfer API Key must never be substituted for the Payment API Key or the
 *  Merchant Secret Key, and a live delivery must never fall back to a test key
 *  (or the reverse). Resolution is therefore mode-scoped and fails closed.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type KashierMode = 'test' | 'live';

/** Regions that resolve their Transfer API Key through the legacy prefix. */
const REGION_TO_LEGACY_PREFIX: Record<string, string> = {
    EGYPT: 'KASHIER_EGYPT',
    GLOBAL: 'KASHIER_GLOBAL',
};

export interface TransferCredentialResolution {
    /** Mode the delivery was routed for. */
    mode: KashierMode;
    /** Region the event resolved to, when determinable. */
    region: 'EGYPT' | 'GLOBAL' | null;
    /** Transfer API Key used ONLY to verify the payout webhook HMAC. */
    transferApiKey: string;
    /** Merchant Secret Key used ONLY for Authorization on transfer API calls. */
    secretKey: string;
    /** MID identifying the merchant the event must belong to. */
    merchantId: string;
    /** Every MID this deployment accepts for the resolved mode. */
    allowedMerchantIds: string[];
}

function currentMode(): KashierMode {
    return String(process.env.KASHIER_MODE || 'test').toLowerCase() === 'live' ? 'live' : 'test';
}

function modePrefix(mode: KashierMode): string {
    return mode === 'live' ? 'KASHIER_LIVE' : 'KASHIER_TEST';
}

function readFirst(value: string | undefined): string {
    return String(value ?? '').trim();
}

/**
 * Region-aware Transfer API Key lookup, mirroring merchantResolver's ordering
 * so a single merchant is named consistently across payment and payout:
 *   EGYPT: mode-prefix -> legacy KASHIER_EGYPT
 *   GLOBAL: legacy KASHIER_GLOBAL -> mode-prefix (fallback only)
 * The mode prefix is never crossed: a live delivery cannot read a TEST_ key.
 */
function resolveTransferApiKey(mode: KashierMode, region: 'EGYPT' | 'GLOBAL' | null): string {
    const legacy = region ? REGION_TO_LEGACY_PREFIX[region] : null;
    const candidates: string[] = [];

    if (region === 'EGYPT') {
        candidates.push(
            `KASHIER_${region}_${mode.toUpperCase()}_TRANSFER_API_KEY`,
            `${modePrefix(mode)}_TRANSFER_API_KEY`
        );
    } else if (region === 'GLOBAL') {
        candidates.push(
            `KASHIER_${region}_${mode.toUpperCase()}_TRANSFER_API_KEY`,
            `${modePrefix(mode)}_TRANSFER_API_KEY`
        );
    } else {
        candidates.push(`${modePrefix(mode)}_TRANSFER_API_KEY`);
    }

    if (legacy) candidates.push(`${legacy}_TRANSFER_API_KEY`);

    for (const name of candidates) {
        const value = readFirst(process.env[name]);
        if (value) return value;
    }
    return '';
}

/**
 * Merchant Secret Key. Used for the `Authorization` header on Kashier transfer
 * API calls. Deliberately NEVER used as an HMAC signing secret here.
 */
function resolveSecretKey(mode: KashierMode, region: 'EGYPT' | 'GLOBAL' | null): string {
    const legacy = region ? REGION_TO_LEGACY_PREFIX[region] : null;
    const candidates: string[] = [];

    if (region === 'GLOBAL') {
        if (legacy) candidates.push(`${legacy}_SECRET_KEY`);
    }
    candidates.push(`${modePrefix(mode)}_SECRET_KEY`);
    if (legacy) candidates.push(`${legacy}_SECRET_KEY`);

    for (const name of candidates) {
        const value = readFirst(process.env[name]);
        if (value) return value;
    }
    return '';
}

/**
 * Every MID this deployment accepts, scoped to the delivery mode. MID is the
 * SAME identifier in test and live for this merchant; only the key material
 * differs by mode.
 */
function resolveAllowedMerchantIds(mode: KashierMode): string[] {
    const prefix = modePrefix(mode);
    const found = [
        process.env[`KASHIER_EGYPT_${prefix}_MERCHANT_ID`],
        process.env[`KASHIER_GLOBAL_${prefix}_MERCHANT_ID`],
        process.env[`KASHIER_${prefix}_MERCHANT_ID`],
        process.env.KASHIER_EGYPT_MERCHANT_ID,
        process.env.KASHIER_GLOBAL_MERCHANT_ID,
    ];
    return found
        .map((m) => String(m ?? '').trim())
        .filter((m): m is string => m.length > 0);
}

/**
 * Resolve the region from the signed merchantId, when it matches a known MID.
 * This lets a single payout endpoint serve both regions without guessing.
 */
function resolveRegionForMerchant(
    merchantId: string,
    allowed: string[]
): 'EGYPT' | 'GLOBAL' | null {
    if (!merchantId) return null;
    if (merchantId === readFirst(process.env.KASHIER_EGYPT_MERCHANT_ID)) return 'EGYPT';
    if (merchantId === readFirst(process.env.KASHIER_GLOBAL_MERCHANT_ID)) return 'GLOBAL';
    if (allowed.length === 1) return 'EGYPT';
    return null;
}

export function resolveTransferCredentials(
    payloadMerchantId?: unknown
): TransferCredentialResolution {
    const mode = currentMode();
    const allowedMerchantIds = resolveAllowedMerchantIds(mode);
    const payloadMid = String(payloadMerchantId ?? '').trim();
    const region = resolveRegionForMerchant(payloadMid, allowedMerchantIds);

    return {
        mode,
        region,
        transferApiKey: resolveTransferApiKey(mode, region),
        secretKey: resolveSecretKey(mode, region),
        merchantId: payloadMid || (region ? readFirst(process.env[`KASHIER_${region}_MERCHANT_ID`]) : ''),
        allowedMerchantIds,
    };
}
