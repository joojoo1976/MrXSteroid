/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  BOSTA ADAPTER — Egypt domestic fulfillment
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Implements the Bosta v2 delivery contract for Egypt local fulfillment:
 *
 *    Auth     : `Authorization: <BOSTA_API_KEY>`  (no `Bearer` prefix)
 *    Hosts    : https://app.bosta.co (prod) · https://stg-app.bosta.co (staging)
 *    Create   : POST /api/v2/deliveries?apiVersion=1
 *    Cities   : GET  /api/v2/cities?countryId=…
 *    Districts: GET  /api/v2/cities/{cityId}/districts
 *    Zones    : GET  /api/v2/cities/{cityId}/zones
 *    Status   : POST to the configured webhook, fired on STATE CHANGE only
 *               (Bosta does not call the webhook on delivery creation)
 *
 *  BOUNDARY — Bosta is a FULFILLMENT provider, never a pricing authority.
 *  Nothing in this file computes, reads, or may influence a price. The approved
 *  Egypt rate stays the flat 199 EGP decided by `resolveShippingForCheckout` in
 *  `pricing.ts`; this adapter only creates and tracks shipments.
 *
 *  SECURITY — the API key is read from the environment at call time and is
 *  never accepted as an argument, logged, or returned. A Bosta webhook carries
 *  NO documented HMAC signature, so authentication for that inbound boundary
 *  relies on a secret custom header registered in the Bosta dashboard, compared
 *  with a timing-safe check. An unset secret fails closed.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';

/** Bosta order type codes (docs: "Order Types & Codes"). */
export const BOSTA_DELIVERY_TYPE = {
    DELIVER: 10,
    CASH_COLLECTION: 15,
    CRP: 25,
    EXCHANGE: 30,
} as const;

export type BostaDeliveryType = (typeof BOSTA_DELIVERY_TYPE)[keyof typeof BOSTA_DELIVERY_TYPE];

/** Package types accepted by Bosta for a Deliver order. */
export const BOSTA_PACKAGE_TYPES = [
    'SMALL',
    'MEDIUM',
    'LARGE',
    'Light Bulky',
    'Heavy Bulky',
] as const;

export type BostaPackageType = (typeof BOSTA_PACKAGE_TYPES)[number];

/** Bosta's only supported country today. */
export const BOSTA_EGYPT_COUNTRY = { id: '60e4482c7cb7d4bc4849c4d5', name: 'Egypt', code: 'EG' } as const;

export const BOSTA_PRODUCTION_HOST = 'https://app.bosta.co';
export const BOSTA_STAGING_HOST = 'https://stg-app.bosta.co';

/**
 * Bosta state codes, grouped by what they mean operationally. The raw numeric
 * `state` is the source of truth; this grouping only decides which normalized
 * bucket the shipment falls into.
 */
export const BOSTA_STATE = {
    PICKUP_REQUESTED: 10,
    WAITING_FOR_ROUTE: 11,
    ROUTE_ASSIGNED: 20,
    PICKED_UP_FROM_BUSINESS: 21,
    PICKING_UP_FROM_CONSIGNEE: 22,
    PICKED_UP_FROM_CONSIGNEE: 23,
    RECEIVED_AT_WAREHOUSE: 24,
    FULFILLED: 25,
    IN_TRANSIT: 30,
    PICKING_UP: 40,
    PICKED_UP: 41,
    DELIVERED: 45,
    RETURNED_TO_BUSINESS: 46,
    EXCEPTION: 47,
    TERMINATED: 48,
    CANCELED: 49,
    RETURNED_TO_STOCK: 60,
    LOST: 100,
    DAMAGED: 101,
    INVESTIGATION: 102,
    AWAITING_ACTION: 103,
    ON_HOLD: 105,
} as const;

export type BostaNormalizedStatus =
    | 'created'
    | 'in_transit'
    | 'delivered'
    | 'returned'
    | 'exception'
    | 'cancelled'
    | 'terminated'
    | 'lost'
    | 'damaged'
    | 'unknown';

const DELIVERED_STATES = new Set<number>([
    BOSTA_STATE.DELIVERED,
    BOSTA_STATE.FULFILLED,
    BOSTA_STATE.RETURNED_TO_BUSINESS,
]);

const TERMINAL_FAILURE_STATES = new Set<number>([
    BOSTA_STATE.CANCELED,
    BOSTA_STATE.TERMINATED,
    BOSTA_STATE.LOST,
    BOSTA_STATE.DAMAGED,
    BOSTA_STATE.RETURNED_TO_STOCK,
]);

/**
 * Whether a state is a terminal failure: the parcel will not reach the customer
 * without a new shipment. Callers use this to decide an order can be marked
 * undeliverable rather than waiting forever on an in-transit state.
 */
export function isBostaTerminalFailureState(state: number | null | undefined): boolean {
    if (typeof state !== 'number' || !Number.isFinite(state)) return false;
    return TERMINAL_FAILURE_STATES.has(state);
}

/** The state a brand-new delivery is created in ("Pickup requested / New"). */
const CREATED_STATES = new Set<number>([
    BOSTA_STATE.PICKUP_REQUESTED,
]);

const IN_TRANSIT_STATES = new Set<number>([
    BOSTA_STATE.WAITING_FOR_ROUTE,
    BOSTA_STATE.ROUTE_ASSIGNED,
    BOSTA_STATE.PICKED_UP_FROM_BUSINESS,
    BOSTA_STATE.PICKING_UP_FROM_CONSIGNEE,
    BOSTA_STATE.PICKED_UP_FROM_CONSIGNEE,
    BOSTA_STATE.RECEIVED_AT_WAREHOUSE,
    BOSTA_STATE.IN_TRANSIT,
    BOSTA_STATE.PICKING_UP,
    BOSTA_STATE.PICKED_UP,
    BOSTA_STATE.INVESTIGATION,
    BOSTA_STATE.AWAITING_ACTION,
    BOSTA_STATE.ON_HOLD,
]);

/** Map a raw Bosta state code onto a normalized bucket. Unmapped → `unknown`. */
export function resolveBostaShipmentStatus(state: number | null | undefined): BostaNormalizedStatus {
    if (typeof state !== 'number' || !Number.isFinite(state)) return 'unknown';
    if (CREATED_STATES.has(state)) return 'created';
    if (state === BOSTA_STATE.EXCEPTION) return 'exception';
    if (DELIVERED_STATES.has(state)) return state === BOSTA_STATE.RETURNED_TO_BUSINESS ? 'returned' : 'delivered';
    if (state === BOSTA_STATE.TERMINATED) return 'terminated';
    if (state === BOSTA_STATE.CANCELED) return 'cancelled';
    if (state === BOSTA_STATE.LOST) return 'lost';
    if (state === BOSTA_STATE.DAMAGED) return 'damaged';
    if (IN_TRANSIT_STATES.has(state)) return 'in_transit';
    return 'unknown';
}

/**
 * A state that means the parcel is in the customer's hands. Used by fulfillment
 * to decide whether an order may be marked delivered.
 */
export function isBostaDeliveredState(state: number | null | undefined): boolean {
    const normalized = resolveBostaShipmentStatus(state);
    return normalized === 'delivered' || normalized === 'returned';
}

// ═══════════════════════════════════════════════════════════════════════════
//                              REQUEST SHAPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Bosta address. Either `districtId` OR (`cityId` + `districtName`) is required.
 * `firstLine` must be more than 5 characters — Bosta rejects shorter values.
 */
export interface BostaAddress {
    city: string;
    districtId?: string;
    cityId?: string;
    districtName?: string;
    zoneId?: string;
    firstLine: string;
    secondLine?: string;
    buildingNumber?: string;
    floor?: string;
    apartment?: string;
    isWorkAddress?: boolean;
}

export interface BostaReceiver {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
}

export interface BostaCreateDeliveryInput {
    deliveryType?: BostaDeliveryType;
    /** Our order id. Echoed back on every webhook as `businessReference`. */
    businessReference: string;
    receiver: BostaReceiver;
    dropOffAddress: BostaAddress;
    pickupAddress?: BostaAddress;
    businessLocationId?: string;
    /** Cash on delivery in piastres. Bosta caps COD at 30,000 EGP. */
    cod?: number;
    notes?: string;
    packageType?: BostaPackageType;
    packageDescription?: string;
    packageItemsCount?: number;
    /** Set when the webhook is not registered globally in the Bosta dashboard. */
    webhookUrl?: string;
    webhookCustomHeaders?: Record<string, string>;
}

export interface BostaCreateDeliveryResult {
    /** Bosta's delivery id. */
    deliveryId: string;
    trackingNumber: string;
    businessReference: string;
    status: BostaNormalizedStatus;
    raw: Record<string, unknown>;
}

/** The inbound webhook body documented by Bosta. */
export interface BostaWebhookPayload {
    _id: string;
    trackingNumber: string | number;
    /** Numeric state code. */
    state: number;
    type: string;
    cod?: number;
    timeStamp?: number;
    isConfirmedDelivery?: boolean;
    deliveryPromiseDate?: string;
    exceptionReason?: string;
    exceptionCode?: number;
    businessReference?: string;
    numberOfAttempts?: number;
}

export class BostaConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BostaConfigurationError';
    }
}

export class BostaValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BostaValidationError';
    }
}

export class BostaApiError extends Error {
    readonly status: number;
    readonly errorCode?: number;
    constructor(message: string, status: number, errorCode?: number) {
        super(message);
        this.name = 'BostaApiError';
        this.status = status;
        this.errorCode = errorCode;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//                              CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export interface BostaClientConfig {
    /** Read from BOSTA_API_KEY. Never passed in by callers. */
    apiKey: string;
    baseUrl?: string;
    /** Injectable for tests. Never performs a real call in unit tests. */
    fetchImpl?: typeof fetch;
}

/**
 * Build a client config from the environment.
 *
 * Fails closed when the credential is absent — an unarmed Bosta integration
 * must never silently become a no-op that reports success.
 */
export function getBostaConfigFromEnv(): BostaClientConfig {
    const apiKey = (process.env.BOSTA_API_KEY || '').trim();
    if (!apiKey) {
        throw new BostaConfigurationError(
            'BOSTA_API_KEY is not set. Bosta credentials must be supplied through the secure environment mechanism.'
        );
    }
    const baseUrl = (process.env.BOSTA_BASE_URL || '').trim()
        || (process.env.BOSTA_ENVIRONMENT === 'staging' ? BOSTA_STAGING_HOST : BOSTA_PRODUCTION_HOST);
    return { apiKey, baseUrl };
}

// ═══════════════════════════════════════════════════════════════════════════
//                              VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

const requireText = (value: unknown, field: string, min = 1): string => {
    const text = typeof value === 'string' ? value.trim() : '';
    if (text.length < min) {
        throw new BostaValidationError(`${field} is required and must be at least ${min} characters.`);
    }
    return text;
};

/**
 * Validate an address against Bosta's documented rules. Rejects anything Bosta
 * would reject (error codes 3001–3009) so a bad address fails locally instead of
 * burning a round trip and leaving a half-created delivery.
 */
export function validateBostaAddress(address: BostaAddress, field: string): void {
    requireText(address.city, `${field}.city`);
    requireText(address.firstLine, `${field}.firstLine`, 6);

    const hasDistrictId = Boolean((address.districtId || '').trim());
    const hasNamedDistrict = Boolean((address.cityId || '').trim()) && Boolean((address.districtName || '').trim());

    if (!hasDistrictId && !hasNamedDistrict) {
        throw new BostaValidationError(
            `${field} requires either districtId, or both cityId and districtName (Bosta error 3009).`
        );
    }
}

/** Validate and normalize a create-delivery request. Fail-closed, no network. */
export function buildCreateDeliveryRequest(input: BostaCreateDeliveryInput): Record<string, unknown> {
    const deliveryType = input.deliveryType ?? BOSTA_DELIVERY_TYPE.DELIVER;

    if (![10, 15, 25, 30].includes(deliveryType)) {
        throw new BostaValidationError(`Unsupported Bosta delivery type: ${String(deliveryType)}`);
    }

    const businessReference = requireText(input.businessReference, 'businessReference');
    const receiver = input.receiver;
    if (!receiver) throw new BostaValidationError('receiver is required.');
    requireText(receiver.firstName, 'receiver.firstName');
    requireText(receiver.lastName, 'receiver.lastName');
    requireText(receiver.phone, 'receiver.phone');

    if (input.packageType && !BOSTA_PACKAGE_TYPES.includes(input.packageType)) {
        throw new BostaValidationError(
            `packageType must be one of: ${BOSTA_PACKAGE_TYPES.join(', ')}.`
        );
    }

    if (typeof input.cod === 'number' && (!Number.isFinite(input.cod) || input.cod < 0)) {
        throw new BostaValidationError('cod must be a non-negative number.');
    }

    // Cash Collection (15) and CRP (25) require a pickup address; Deliver (10)
    // and Exchange (30) require a drop-off address (docs: "Important Note").
    if (deliveryType === BOSTA_DELIVERY_TYPE.DELIVER || deliveryType === BOSTA_DELIVERY_TYPE.EXCHANGE) {
        if (!input.dropOffAddress) throw new BostaValidationError('dropOffAddress is required for this delivery type.');
        validateBostaAddress(input.dropOffAddress, 'dropOffAddress');
    }
    if (deliveryType === BOSTA_DELIVERY_TYPE.CASH_COLLECTION || deliveryType === BOSTA_DELIVERY_TYPE.CRP) {
        if (!input.pickupAddress) throw new BostaValidationError('pickupAddress is required for this delivery type.');
        validateBostaAddress(input.pickupAddress, 'pickupAddress');
    }

    const body: Record<string, unknown> = {
        deliveryType,
        businessReference,
        receiver: {
            first_name: receiver.firstName.trim(),
            last_name: receiver.lastName.trim(),
            phone: receiver.phone.trim(),
            ...(receiver.email ? { email: receiver.email.trim() } : {}),
        },
    };

    const toBostaAddress = (a: BostaAddress) => {
        const out: Record<string, unknown> = {
            city: a.city.trim(),
            firstLine: a.firstLine.trim(),
        };
        if (a.districtId) out.districtId = a.districtId.trim();
        if (a.cityId) out.cityId = a.cityId.trim();
        if (a.districtName) out.districtName = a.districtName.trim();
        if (a.zoneId) out.zoneId = a.zoneId.trim();
        if (a.secondLine) out.secondLine = a.secondLine.trim();
        if (a.buildingNumber) out.buildingNumber = a.buildingNumber.trim();
        if (a.floor) out.floor = a.floor.trim();
        if (a.apartment) out.apartment = a.apartment.trim();
        out.isWorkAddress = a.isWorkAddress === true;
        return out;
    };

    if (input.dropOffAddress) body.dropOffAddress = toBostaAddress(input.dropOffAddress);
    if (input.pickupAddress) body.pickupAddress = toBostaAddress(input.pickupAddress);
    if (input.businessLocationId) body.businessLocationId = input.businessLocationId.trim();
    if (typeof input.cod === 'number') body.cod = input.cod;
    if (input.notes) body.notes = input.notes;

    if (input.packageType || input.packageDescription || input.packageItemsCount !== undefined) {
        body.specs = {
            packageType: input.packageType ?? 'SMALL',
            packageDetails: {
                description: input.packageDescription ?? '',
                itemsCount: input.packageItemsCount ?? 1,
            },
        };
    }

    if (input.webhookUrl) body.webhookUrl = input.webhookUrl;
    if (input.webhookCustomHeaders) body.webhookCustomHeaders = input.webhookCustomHeaders;

    return body;
}

// ═══════════════════════════════════════════════════════════════════════════
//                              CLIENT
// ═══════════════════════════════════════════════════════════════════════════

export class BostaClient {
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly fetchImpl: typeof fetch;

    constructor(config: BostaClientConfig) {
        if (!config.apiKey || !config.apiKey.trim()) {
            throw new BostaConfigurationError('A Bosta API key is required.');
        }
        this.apiKey = config.apiKey.trim();
        this.baseUrl = (config.baseUrl || BOSTA_PRODUCTION_HOST).replace(/\/+$/, '');
        this.fetchImpl = config.fetchImpl || globalThis.fetch;
        if (typeof this.fetchImpl !== 'function') {
            throw new BostaConfigurationError('No fetch implementation is available.');
        }
    }

    /**
     * Bosta authenticates with the raw key in the `Authorization` header.
     * Prefixing it with `Bearer ` is a documented mistake and fails with 401.
     */
    private headers(extra?: Record<string, string>): Record<string, string> {
        return {
            Authorization: this.apiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(extra || {}),
        };
    }

    private async request<T>(
        method: 'GET' | 'POST' | 'DELETE',
        path: string,
        body?: unknown
    ): Promise<T> {
        let response: Response;
        try {
            response = await this.fetchImpl(`${this.baseUrl}${path}`, {
                method,
                headers: this.headers(),
                ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
            });
        } catch (error) {
            // Never echo the request, which would carry the Authorization header.
            throw new BostaApiError(
                `Bosta ${method} ${path} could not be reached: ${error instanceof Error ? error.message : 'unknown error'}`,
                0
            );
        }

        const text = await response.text();
        let parsed: unknown = null;
        if (text) {
            try {
                parsed = JSON.parse(text);
            } catch {
                parsed = { message: text.slice(0, 300) };
            }
        }

        if (!response.ok) {
            const envelope = (parsed || {}) as Record<string, unknown>;
            const errorCode = typeof envelope.errorCode === 'number' ? envelope.errorCode : undefined;
            const message = typeof envelope.message === 'string' ? envelope.message : `HTTP ${response.status}`;
            throw new BostaApiError(`Bosta ${method} ${path} failed: ${message}`, response.status, errorCode);
        }

        return parsed as T;
    }

    /**
     * Create a delivery. `POST /api/v2/deliveries?apiVersion=1`
     *
     * Bosta answers with `success` plus a `data` envelope. `success: false` is
     * treated as a failure even on HTTP 200, so a soft failure can never be
     * mistaken for a created shipment.
     */
    async createDelivery(input: BostaCreateDeliveryInput): Promise<BostaCreateDeliveryResult> {
        const body = buildCreateDeliveryRequest(input);

        const envelope = await this.request<Record<string, unknown>>(
            'POST',
            '/api/v2/deliveries?apiVersion=1',
            body
        );

        const success = envelope?.success;
        if (success === false) {
            const errorCode = typeof envelope.errorCode === 'number' ? envelope.errorCode : undefined;
            const message = typeof envelope.message === 'string' ? envelope.message : 'unknown error';
            throw new BostaApiError(`Bosta rejected the delivery: ${message}`, 200, errorCode);
        }

        const data = (envelope?.data || {}) as Record<string, unknown>;
        const deliveryId = String(data._id ?? data.id ?? '');
        if (!deliveryId) {
            throw new BostaApiError('Bosta accepted the request but returned no delivery id.', 200);
        }

        return {
            deliveryId,
            trackingNumber: String(data.trackingNumber ?? data.tracking_number ?? ''),
            businessReference: String(data.businessReference ?? input.businessReference),
            status: resolveBostaShipmentStatus(typeof data.state === 'number' ? data.state : null),
            raw: data,
        };
    }

    /** `GET /api/v2/cities?countryId=…` — used to resolve an address. */
    async listCities(countryId: string = BOSTA_EGYPT_COUNTRY.id): Promise<unknown[]> {
        const result = await this.request<Record<string, unknown>>(
            'GET',
            `/api/v2/cities?countryId=${encodeURIComponent(countryId)}`
        );
        if (Array.isArray(result)) return result;
        const data = result?.data;
        return Array.isArray(data) ? data : [];
    }

    /** `GET /api/v2/cities/{cityId}/districts` */
    async listDistricts(cityId: string): Promise<unknown[]> {
        const result = await this.request<Record<string, unknown>>(
            'GET',
            `/api/v2/cities/${encodeURIComponent(cityId)}/districts`
        );
        if (Array.isArray(result)) return result;
        const data = result?.data;
        return Array.isArray(data) ? data : [];
    }

    /** `GET /api/v2/cities/{cityId}/zones` */
    async listZones(cityId: string): Promise<unknown[]> {
        const result = await this.request<Record<string, unknown>>(
            'GET',
            `/api/v2/cities/${encodeURIComponent(cityId)}/zones`
        );
        if (Array.isArray(result)) return result;
        const data = result?.data;
        return Array.isArray(data) ? data : [];
    }

    /** `GET /api/v2/deliveries/{tracking}/tracking` — the read-back for status. */
    async getTracking(trackingNumber: string): Promise<Record<string, unknown>> {
        const result = await this.request<Record<string, unknown>>(
            'GET',
            `/api/v2/deliveries/${encodeURIComponent(trackingNumber)}/tracking`
        );
        const data = result?.data;
        return (data && typeof data === 'object' ? data : result) as Record<string, unknown>;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//                          WEBHOOK BOUNDARY
// ═══════════════════════════════════════════════════════════════════════════

export interface BostaWebhookVerification {
    valid: boolean;
    reason?: string;
}

/**
 * Authenticate an inbound Bosta shipment-status webhook.
 *
 * Bosta documents NO HMAC signature for this endpoint. The only authentication
 * mechanism is a secret custom header registered in the Bosta dashboard
 * ("API Integration → Set Up Your Webhook"). We compare that secret in constant
 * time and fail closed when it is not configured.
 *
 * The header name is configurable because Bosta lets the merchant name it.
 */
export function verifyBostaWebhook(
    headers: Record<string, string | string[] | undefined>,
    body: string,
    options: { headerName?: string; secret?: string } = {}
): BostaWebhookVerification {
    const headerName = (options.headerName || process.env.BOSTA_WEBHOOK_HEADER_NAME || 'x-bosta-signature')
        .toLowerCase();
    const secret = (options.secret ?? process.env.BOSTA_WEBHOOK_SECRET ?? '').trim();

    if (!secret) {
        return { valid: false, reason: 'BOSTA_WEBHOOK_SECRET is not configured; refusing the request.' };
    }

    // HTTP header names are case-insensitive, so normalize before lookup rather
    // than relying on the caller to have lowercased them.
    const normalized: Record<string, string | string[] | undefined> = {};
    for (const [key, value] of Object.entries(headers || {})) {
        normalized[key.toLowerCase()] = value;
    }

    const raw = normalized[headerName];
    const provided = (Array.isArray(raw) ? raw[0] : raw) || '';
    if (!provided) {
        return { valid: false, reason: `Missing ${headerName} header.` };
    }

    const expectedBuf = Buffer.from(secret, 'utf8');
    const providedBuf = Buffer.from(provided, 'utf8');
    if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
        return { valid: false, reason: 'Bosta webhook secret mismatch.' };
    }

    // A valid secret still has to carry a parseable body.
    try {
        JSON.parse(body);
    } catch {
        return { valid: false, reason: 'Bosta webhook body is not valid JSON.' };
    }

    return { valid: true };
}

/** Parse a Bosta webhook body into a normalized shipment update. */
export function parseBostaWebhook(
    body: string
): { deliveryId: string; trackingNumber: string; state: number; status: BostaNormalizedStatus; businessReference?: string; isConfirmedDelivery: boolean; exceptionReason?: string; exceptionCode?: number; numberOfAttempts?: number; deliveryPromiseDate?: string } {
    let payload: BostaWebhookPayload;
    try {
        payload = JSON.parse(body) as BostaWebhookPayload;
    } catch {
        throw new BostaValidationError('Bosta webhook body is not valid JSON.');
    }

    const deliveryId = String(payload?._id ?? '').trim();
    if (!deliveryId) {
        throw new BostaValidationError('Bosta webhook payload is missing _id.');
    }

    const state = Number(payload?.state);
    if (!Number.isFinite(state)) {
        throw new BostaValidationError('Bosta webhook payload is missing a numeric state.');
    }

    return {
        deliveryId,
        trackingNumber: String(payload?.trackingNumber ?? ''),
        state,
        status: resolveBostaShipmentStatus(state),
        businessReference: payload?.businessReference,
        isConfirmedDelivery: payload?.isConfirmedDelivery === true,
        exceptionReason: payload?.exceptionReason,
        exceptionCode: payload?.exceptionCode,
        numberOfAttempts: payload?.numberOfAttempts,
        deliveryPromiseDate: payload?.deliveryPromiseDate,
    };
}
