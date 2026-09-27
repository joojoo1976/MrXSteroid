/**
 * tests/unit/bostaAdapter.test.ts
 *
 * Locks the Bosta v2 delivery contract: request shape, fail-closed validation,
 * state mapping, and the webhook authentication boundary.
 *
 * No test performs a real network call — `fetch` is always injected, and no
 * Bosta credential is present or required.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    BostaClient,
    BostaApiError,
    BostaConfigurationError,
    BostaValidationError,
    BOSTA_DELIVERY_TYPE,
    BOSTA_STATE,
    BOSTA_PRODUCTION_HOST,
    BOSTA_STAGING_HOST,
    buildCreateDeliveryRequest,
    getBostaConfigFromEnv,
    isBostaDeliveredState,
    isBostaTerminalFailureState,
    parseBostaWebhook,
    resolveBostaShipmentStatus,
    verifyBostaWebhook,
    type BostaAddress,
} from '../../server/shipping/bosta/BostaClient';

const originalEnv = { ...process.env };

afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
});

const address: BostaAddress = {
    city: 'Cairo',
    districtId: 'Iy7-lFD0BE0',
    firstLine: '15 Mohamed Farid Street',
    secondLine: 'Near the mosque',
    buildingNumber: '12',
    floor: '3',
    apartment: '7',
};

const baseInput = () => ({
    businessReference: 'order-abc-123',
    receiver: { firstName: 'Ahmed', lastName: 'Maher', phone: '+201001234567', email: 'ahmed@example.com' },
    dropOffAddress: address,
});

const jsonResponse = (body: unknown, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
} as unknown as Response);

describe('buildCreateDeliveryRequest — request contract', () => {
    it('produces the documented snake_case body with a Deliver order type', () => {
        const body = buildCreateDeliveryRequest(baseInput());
        expect(body.deliveryType).toBe(10);
        expect(body.businessReference).toBe('order-abc-123');
        expect(body.receiver).toEqual({
            first_name: 'Ahmed',
            last_name: 'Maher',
            phone: '+201001234567',
            email: 'ahmed@example.com',
        });
        expect(body.dropOffAddress).toMatchObject({
            city: 'Cairo',
            districtId: 'Iy7-lFD0BE0',
            firstLine: '15 Mohamed Farid Street',
            buildingNumber: '12',
            isWorkAddress: false,
        });
    });

    it('omits the optional email when not supplied', () => {
        const body = buildCreateDeliveryRequest({
            ...baseInput(),
            receiver: { firstName: 'A', lastName: 'B', phone: '+2010' },
        });
        expect((body.receiver as Record<string, unknown>).email).toBeUndefined();
    });

    it('nests the package description under specs.packageDetails', () => {
        const body = buildCreateDeliveryRequest({
            ...baseInput(),
            packageType: 'MEDIUM',
            packageDescription: 'Mr. X-Steroid books',
            packageItemsCount: 3,
        });
        expect(body.specs).toEqual({
            packageType: 'MEDIUM',
            packageDetails: { description: 'Mr. X-Steroid books', itemsCount: 3 },
        });
    });

    it('passes the webhook URL and custom headers when provided', () => {
        const body = buildCreateDeliveryRequest({
            ...baseInput(),
            webhookUrl: 'https://example.com/api/shipping/bosta/webhook',
            webhookCustomHeaders: { Authorization: 'Basic abc123' },
        });
        expect(body.webhookUrl).toBe('https://example.com/api/shipping/bosta/webhook');
        expect(body.webhookCustomHeaders).toEqual({ Authorization: 'Basic abc123' });
    });

    it('supports the alternative cityId + districtName address format', () => {
        const body = buildCreateDeliveryRequest({
            ...baseInput(),
            dropOffAddress: { city: 'Giza', cityId: 'c-1', districtName: 'Dokki', firstLine: '5 Tahrir Street' },
        });
        expect(body.dropOffAddress).toMatchObject({ city: 'Giza', cityId: 'c-1', districtName: 'Dokki' });
    });
});

describe('buildCreateDeliveryRequest — fail-closed validation', () => {
    it('rejects an address without a district (Bosta error 3009)', () => {
        expect(() => buildCreateDeliveryRequest({
            ...baseInput(),
            dropOffAddress: { city: 'Cairo', firstLine: '15 Mohamed Farid Street' },
        })).toThrow(/districtId, or both cityId and districtName/);
    });

    it('rejects a firstLine shorter than 6 characters', () => {
        expect(() => buildCreateDeliveryRequest({
            ...baseInput(),
            dropOffAddress: { ...address, firstLine: 'abc' },
        })).toThrow(BostaValidationError);
    });

    it('rejects a missing city', () => {
        expect(() => buildCreateDeliveryRequest({
            ...baseInput(),
            dropOffAddress: { ...address, city: '' },
        })).toThrow(/city is required/);
    });

    it('rejects a missing receiver phone', () => {
        expect(() => buildCreateDeliveryRequest({
            ...baseInput(),
            receiver: { firstName: 'A', lastName: 'B', phone: '' },
        })).toThrow(/receiver.phone/);
    });

    it('rejects a missing businessReference', () => {
        expect(() => buildCreateDeliveryRequest({ ...baseInput(), businessReference: '' }))
            .toThrow(/businessReference/);
    });

    it('rejects an unsupported package type', () => {
        expect(() => buildCreateDeliveryRequest({ ...baseInput(), packageType: 'GIGANTIC' as never }))
            .toThrow(/packageType must be one of/);
    });

    it('rejects a Deliver order with no dropOffAddress', () => {
        expect(() => buildCreateDeliveryRequest({ ...baseInput(), dropOffAddress: undefined as never }))
            .toThrow(/dropOffAddress is required/);
    });

    it('requires a pickupAddress for Cash Collection', () => {
        expect(() => buildCreateDeliveryRequest({
            ...baseInput(),
            deliveryType: BOSTA_DELIVERY_TYPE.CASH_COLLECTION,
            pickupAddress: undefined,
        })).toThrow(/pickupAddress is required/);
    });

    it('requires a pickupAddress for CRP', () => {
        expect(() => buildCreateDeliveryRequest({
            ...baseInput(),
            deliveryType: BOSTA_DELIVERY_TYPE.CRP,
            pickupAddress: undefined,
        })).toThrow(/pickupAddress is required/);
    });

    it('rejects a negative COD', () => {
        expect(() => buildCreateDeliveryRequest({ ...baseInput(), cod: -1 })).toThrow(BostaValidationError);
    });

    it('rejects an unknown delivery type', () => {
        expect(() => buildCreateDeliveryRequest({ ...baseInput(), deliveryType: 99 as never }))
            .toThrow(/Unsupported Bosta delivery type/);
    });
});

describe('BostaClient — transport contract', () => {
    it('sends the raw API key in Authorization with no Bearer prefix', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse({ success: true, data: { _id: 'd1', trackingNumber: 48089608 } }));
        const client = new BostaClient({ apiKey: 'raw-key-123', fetchImpl: fetchImpl as unknown as typeof fetch });

        await client.createDelivery(baseInput());

        const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
        const headers = init.headers as Record<string, string>;
        expect(headers.Authorization).toBe('raw-key-123');
        expect(headers.Authorization).not.toMatch(/^Bearer/);
        expect(init.method).toBe('POST');
    });

    it('calls the documented create endpoint with apiVersion=1', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse({ success: true, data: { _id: 'd1' } }));
        const client = new BostaClient({ apiKey: 'k', fetchImpl: fetchImpl as unknown as typeof fetch });

        await client.createDelivery(baseInput());

        const [url] = fetchImpl.mock.calls[0] as unknown as [string];
        expect(url).toBe(`${BOSTA_PRODUCTION_HOST}/api/v2/deliveries?apiVersion=1`);
    });

    it('uses the staging host when BOSTA_ENVIRONMENT=staging', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse({ success: true, data: { _id: 'd1' } }));
        const client = new BostaClient({
            apiKey: 'k',
            baseUrl: BOSTA_STAGING_HOST,
            fetchImpl: fetchImpl as unknown as typeof fetch,
        });
        await client.createDelivery(baseInput());
        const [url] = fetchImpl.mock.calls[0] as unknown as [string];
        expect(url).toContain('stg-app.bosta.co');
    });

    it('maps a successful create into a delivery result', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse({
            success: true,
            data: { _id: '15LmfpKYp0YILntA3jbyd', trackingNumber: 48089608, businessReference: 'order-abc-123', state: 10 },
        }));
        const client = new BostaClient({ apiKey: 'k', fetchImpl: fetchImpl as unknown as typeof fetch });

        const res = await client.createDelivery(baseInput());
        expect(res.deliveryId).toBe('15LmfpKYp0YILntA3jbyd');
        expect(res.trackingNumber).toBe('48089608');
        expect(res.status).toBe('created');
    });

    it('treats success:false on HTTP 200 as a failure, not a created delivery', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse({
            success: false,
            message: 'Product images are required when allowToOpenPackage is enabled.',
            errorCode: 2150,
        }));
        const client = new BostaClient({ apiKey: 'k', fetchImpl: fetchImpl as unknown as typeof fetch });

        await expect(client.createDelivery(baseInput())).rejects.toThrow(BostaApiError);
    });

    it('surfaces the documented error code on a soft failure', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse({ success: false, message: 'Zone Not Found', errorCode: 3002 }));
        const client = new BostaClient({ apiKey: 'k', fetchImpl: fetchImpl as unknown as typeof fetch });

        await expect(client.createDelivery(baseInput())).rejects.toMatchObject({ errorCode: 3002 });
    });

    it('throws when Bosta returns 200 with no delivery id', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse({ success: true, data: {} }));
        const client = new BostaClient({ apiKey: 'k', fetchImpl: fetchImpl as unknown as typeof fetch });

        await expect(client.createDelivery(baseInput())).rejects.toThrow(/no delivery id/);
    });

    it('throws on a non-2xx response', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse({ message: 'Unauthorized' }, 401));
        const client = new BostaClient({ apiKey: 'k', fetchImpl: fetchImpl as unknown as typeof fetch });

        await expect(client.createDelivery(baseInput())).rejects.toThrow(BostaApiError);
    });

    it('never leaks the API key into a network error message', async () => {
        const fetchImpl = vi.fn(async () => { throw new Error('socket hang up'); });
        const client = new BostaClient({ apiKey: 'super-secret-key', fetchImpl: fetchImpl as unknown as typeof fetch });

        await expect(client.createDelivery(baseInput())).rejects.toThrow(/socket hang up/);
        await expect(client.createDelivery(baseInput())).rejects.not.toThrow(/super-secret-key/);
    });

    it('lists cities from the documented endpoint', async () => {
        const fetchImpl = vi.fn(async () => jsonResponse([{ _id: 'c1', name: 'Cairo' }]));
        const client = new BostaClient({ apiKey: 'k', fetchImpl: fetchImpl as unknown as typeof fetch });

        const cities = await client.listCities();
        const [url] = fetchImpl.mock.calls[0] as unknown as [string];
        expect(url).toBe(`${BOSTA_PRODUCTION_HOST}/api/v2/cities?countryId=60e4482c7cb7d4bc4849c4d5`);
        expect(cities).toHaveLength(1);
    });
});

describe('BostaClient — configuration', () => {
    it('refuses to construct without an API key', () => {
        expect(() => new BostaClient({ apiKey: '' })).toThrow(BostaConfigurationError);
    });

    it('fails closed from env when BOSTA_API_KEY is absent', () => {
        delete process.env.BOSTA_API_KEY;
        expect(() => getBostaConfigFromEnv()).toThrow(BostaConfigurationError);
    });

    it('fails closed from env when BOSTA_API_KEY is blank', () => {
        process.env.BOSTA_API_KEY = '   ';
        expect(() => getBostaConfigFromEnv()).toThrow(/BOSTA_API_KEY/);
    });

    it('defaults to the production host and honours staging', () => {
        process.env.BOSTA_API_KEY = 'k';
        delete process.env.BOSTA_BASE_URL;
        delete process.env.BOSTA_ENVIRONMENT;
        expect(getBostaConfigFromEnv().baseUrl).toBe(BOSTA_PRODUCTION_HOST);

        process.env.BOSTA_ENVIRONMENT = 'staging';
        expect(getBostaConfigFromEnv().baseUrl).toBe(BOSTA_STAGING_HOST);
    });
});

describe('resolveBostaShipmentStatus — documented state codes', () => {
    it.each([
        [BOSTA_STATE.PICKUP_REQUESTED, 'created'],
        [BOSTA_STATE.ROUTE_ASSIGNED, 'in_transit'],
        [BOSTA_STATE.PICKED_UP, 'in_transit'],
        [BOSTA_STATE.IN_TRANSIT, 'in_transit'],
        [BOSTA_STATE.RECEIVED_AT_WAREHOUSE, 'in_transit'],
        [BOSTA_STATE.DELIVERED, 'delivered'],
        [BOSTA_STATE.RETURNED_TO_BUSINESS, 'returned'],
        [BOSTA_STATE.EXCEPTION, 'exception'],
        [BOSTA_STATE.CANCELED, 'cancelled'],
        [BOSTA_STATE.TERMINATED, 'terminated'],
        [BOSTA_STATE.LOST, 'lost'],
        [BOSTA_STATE.DAMAGED, 'damaged'],
    ])('maps state %i to %s', (state, expected) => {
        expect(resolveBostaShipmentStatus(state)).toBe(expected);
    });

    it('returns unknown for an unmapped or missing state', () => {
        expect(resolveBostaShipmentStatus(9999)).toBe('unknown');
        expect(resolveBostaShipmentStatus(null)).toBe('unknown');
        expect(resolveBostaShipmentStatus(undefined)).toBe('unknown');
    });

    it('identifies delivered and returned states only', () => {
        expect(isBostaDeliveredState(BOSTA_STATE.DELIVERED)).toBe(true);
        expect(isBostaDeliveredState(BOSTA_STATE.RETURNED_TO_BUSINESS)).toBe(true);
        expect(isBostaDeliveredState(BOSTA_STATE.EXCEPTION)).toBe(false);
        expect(isBostaDeliveredState(BOSTA_STATE.PICKED_UP)).toBe(false);
    });

    it('identifies terminal failure states', () => {
        expect(isBostaTerminalFailureState(BOSTA_STATE.CANCELED)).toBe(true);
        expect(isBostaTerminalFailureState(BOSTA_STATE.TERMINATED)).toBe(true);
        expect(isBostaTerminalFailureState(BOSTA_STATE.LOST)).toBe(true);
        expect(isBostaTerminalFailureState(BOSTA_STATE.DAMAGED)).toBe(true);
        expect(isBostaTerminalFailureState(BOSTA_STATE.RETURNED_TO_STOCK)).toBe(true);
        expect(isBostaTerminalFailureState(BOSTA_STATE.DELIVERED)).toBe(false);
        expect(isBostaTerminalFailureState(BOSTA_STATE.EXCEPTION)).toBe(false);
        expect(isBostaTerminalFailureState(null)).toBe(false);
    });
});

describe('parseBostaWebhook', () => {
    const normalBody = JSON.stringify({
        _id: '15LmfpKYp0YILntA3jbyd',
        trackingNumber: 48089608,
        state: 24,
        type: 'SEND',
        timeStamp: 1689252908261,
        deliveryPromiseDate: '13-07-2023',
        numberOfAttempts: 0,
        businessReference: 'order-abc-123',
    });

    it('parses a normal state change', () => {
        const parsed = parseBostaWebhook(normalBody);
        expect(parsed.deliveryId).toBe('15LmfpKYp0YILntA3jbyd');
        expect(parsed.state).toBe(24);
        expect(parsed.status).toBe('in_transit');
        expect(parsed.businessReference).toBe('order-abc-123');
    });

    it('parses an exception case with the NDR reason', () => {
        const parsed = parseBostaWebhook(JSON.stringify({
            _id: '15LmfpKYp0YILntA3jbyd',
            trackingNumber: 48089608,
            state: 47,
            type: 'SEND',
            exceptionReason: 'Postponed - the customer requested postponement for another day.',
            exceptionCode: 3,
            numberOfAttempts: 1,
        }));
        expect(parsed.status).toBe('exception');
        expect(parsed.exceptionCode).toBe(3);
        expect(parsed.numberOfAttempts).toBe(1);
    });

    it('surfaces the proof-of-delivery flag on a delivered state', () => {
        const parsed = parseBostaWebhook(JSON.stringify({
            _id: 'd', trackingNumber: 1, state: 45, isConfirmedDelivery: true,
        }));
        expect(parsed.status).toBe('delivered');
        expect(parsed.isConfirmedDelivery).toBe(true);
    });

    it('rejects a body with no _id', () => {
        expect(() => parseBostaWebhook(JSON.stringify({ state: 45 }))).toThrow(/missing _id/);
    });

    it('rejects a body with no numeric state', () => {
        expect(() => parseBostaWebhook(JSON.stringify({ _id: 'd' }))).toThrow(/numeric state/);
    });

    it('rejects invalid JSON', () => {
        expect(() => parseBostaWebhook('not json')).toThrow(BostaValidationError);
    });
});

describe('verifyBostaWebhook — authentication boundary', () => {
    const body = JSON.stringify({ _id: 'd', trackingNumber: 1, state: 45 });

    it('fails closed when no secret is configured', () => {
        const result = verifyBostaWebhook({ 'x-bosta-signature': 'anything' }, body, { secret: '' });
        expect(result.valid).toBe(false);
        expect(result.reason).toMatch(/BOSTA_WEBHOOK_SECRET/);
    });

    it('fails closed when the header is missing', () => {
        const result = verifyBostaWebhook({}, body, { secret: 'shhh' });
        expect(result.valid).toBe(false);
        expect(result.reason).toMatch(/Missing/);
    });

    it('fails closed on a secret mismatch', () => {
        const result = verifyBostaWebhook({ 'x-bosta-signature': 'wrong' }, body, { secret: 'shhh' });
        expect(result.valid).toBe(false);
        expect(result.reason).toMatch(/mismatch/);
    });

    it('accepts a matching secret with a parseable body', () => {
        const result = verifyBostaWebhook({ 'x-bosta-signature': 'shhh' }, body, { secret: 'shhh' });
        expect(result.valid).toBe(true);
    });

    it('rejects a matching secret with an unparseable body', () => {
        const result = verifyBostaWebhook({ 'x-bosta-signature': 'shhh' }, 'not json', { secret: 'shhh' });
        expect(result.valid).toBe(false);
        expect(result.reason).toMatch(/not valid JSON/);
    });

    it('supports a custom header name', () => {
        const result = verifyBostaWebhook({ 'x-custom-key': 'shhh' }, body, { secret: 'shhh', headerName: 'x-custom-key' });
        expect(result.valid).toBe(true);
    });

    it('reads the header case-insensitively', () => {
        const result = verifyBostaWebhook({ 'X-Bosta-Signature': 'shhh' }, body, { secret: 'shhh' });
        expect(result.valid).toBe(true);
    });
});

describe('Bosta is never a pricing authority', () => {
    it('the adapter exposes no price-computing surface', () => {
        const module = BostaClient as unknown as Record<string, unknown>;
        expect(Object.keys(module)).not.toContain('computeBostaPrice');
    });

    it('the canonical 199 EGP Egypt rate is untouched by this adapter', async () => {
        const { DEFAULT_PRICING, resolveShippingForCheckout } = await import('../../server/payments/pricing');
        const resolved = resolveShippingForCheckout(DEFAULT_PRICING, {
            tierId: 'bundle',
            region: 'EGYPT',
            currency: 'EGP',
            requestedProviderId: 'eg_standard',
        });
        expect(resolved.amount).toBe(199);
    });
});
