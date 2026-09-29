/**
 * Shippo Service Tests — International Shipping
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShippoService, getShippoService } from '../../server/payments/shippo/ShippoService';

const originalEnv = process.env;

beforeEach(() => {
    vi.resetModules();
    process.env = {
        ...originalEnv,
        SHIPPO_API_KEY: 'shippo_test_key_123',
        SHIPPO_WEBHOOK_SECRET: 'whsec_shippo_test',
        SHIPPO_ORIGIN_NAME: 'MrXSteroid Fulfillment',
        SHIPPO_ORIGIN_STREET1: '123 Warehouse St',
        SHIPPO_ORIGIN_CITY: 'Cairo',
        SHIPPO_ORIGIN_STATE: '',
        SHIPPO_ORIGIN_ZIP: '11511',
        SHIPPO_ORIGIN_COUNTRY: 'EG',
        SHIPPO_ORIGIN_PHONE: '+201000000000',
        SHIPPO_ORIGIN_EMAIL: 'fulfillment@mrxsteroid.com',
    };
});

afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
});

describe('ShippoService', () => {
    let service: ShippoService;

    beforeEach(() => {
        service = new ShippoService();
    });

    describe('getDefaultOriginAddress', () => {
        it('returns origin address from environment', () => {
            const addr = service.getDefaultOriginAddress();
            expect(addr.name).toBe('MrXSteroid Fulfillment');
            expect(addr.street1).toBe('123 Warehouse St');
            expect(addr.city).toBe('Cairo');
            expect(addr.country).toBe('EG');
        });
    });

    describe('estimateParcelFromTier', () => {
        it('returns zero-size parcel for digital tiers', () => {
            const digitalParcel = service.estimateParcelFromTier('digital');
            expect(digitalParcel.length).toBe(0);
            expect(digitalParcel.weight).toBe(0);
            expect(digitalParcel.mass_unit).toBe('g');

            const digitalPlus = service.estimateParcelFromTier('digital_plus');
            expect(digitalPlus.weight).toBe(0);

            const consultation = service.estimateParcelFromTier('consultation');
            expect(consultation.weight).toBe(0);

            const coachingAddon = service.estimateParcelFromTier('coaching_addon');
            expect(coachingAddon.weight).toBe(0);
        });

        it('returns physical parcel for paperback', () => {
            const parcel = service.estimateParcelFromTier('bundle');
            expect(parcel.length).toBe(25);
            expect(parcel.width).toBe(18);
            expect(parcel.height).toBe(4);
            expect(parcel.distance_unit).toBe('cm');
            expect(parcel.weight).toBe(800);
            expect(parcel.mass_unit).toBe('g');
        });

        it('returns physical parcel for hardcover', () => {
            const parcel = service.estimateParcelFromTier('coaching');
            expect(parcel.length).toBe(28);
            expect(parcel.width).toBe(22);
            expect(parcel.height).toBe(5);
            expect(parcel.weight).toBe(1200);
        });

        it('returns physical parcel for paperback tier alias', () => {
            const parcel = service.estimateParcelFromTier('paperback');
            expect(parcel.weight).toBe(800);
        });
    });

    describe('verifyWebhookSignature', () => {
        it('validates correct HMAC signature', () => {
            const rawBody = JSON.stringify({ test: 'data' });
            const secret = 'whsec_shippo_test';
            const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

            const result = service.verifyWebhookSignature(rawBody, signature);
            expect(result).toBe(true);
        });

        it('rejects invalid signature', () => {
            const rawBody = JSON.stringify({ test: 'data' });
            const result = service.verifyWebhookSignature(rawBody, 'invalid_signature');
            expect(result).toBe(false);
        });

        it('rejects missing secret', () => {
            const svc = new ShippoService();
            // @ts-expect-error
            svc.config.webhookSecret = '';
            const result = svc.verifyWebhookSignature('{}', 'signature');
            expect(result).toBe(false);
        });
    });

    describe('singleton', () => {
        it('returns same instance', () => {
            const s1 = getShippoService();
            const s2 = getShippoService();
            expect(s1).toBe(s2);
        });
    });
});

// Need crypto for HMAC
import crypto from 'crypto';