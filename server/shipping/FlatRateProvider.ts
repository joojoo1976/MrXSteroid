import {
    DEFAULT_EGYPT_SHIPPING_PROVIDER,
    EGYPT_LOCAL_SHIPPING_EGP,
} from '../payments/pricing';
import {
    ShippingUnavailableError,
    type CreateShipmentInput,
    type ShipmentResult,
    type ShippingCurrency,
    type ShippingProvider,
    type ShippingQuote,
    type ShippingQuoteInput,
    type TrackingResult,
} from './ShippingProvider';

export const FLAT_RATE_SERVICE_CODE = 'flat_rate';

export interface FlatRateProviderOptions {
    providerId?: string;
    amount?: number;
    currency?: ShippingCurrency;
}

/**
 * Approved Egypt local flat rate: 199 EGP.
 *
 * This is deliberately a price bucket, not a live courier. `createShipment()`
 * and `track()` report `not_integrated`; no carrier API is wired up.
 */
export class FlatRateProvider implements ShippingProvider {
    readonly providerId: string;
    /** This provider is a price bucket, never a live courier. */
    readonly isLiveCarrier = false;
    readonly capabilities = {
        quote: true,
        createShipment: false,
        track: false,
    } as const;
    private readonly amount: number;
    private readonly currency: ShippingCurrency;

    constructor(options: FlatRateProviderOptions = {}) {
        this.providerId = options.providerId || DEFAULT_EGYPT_SHIPPING_PROVIDER;
        this.amount = options.amount ?? EGYPT_LOCAL_SHIPPING_EGP;
        this.currency = options.currency || 'EGP';
    }

    quote(input: ShippingQuoteInput): ShippingQuote {
        if (input.region !== 'EGYPT') {
            throw new ShippingUnavailableError('Flat rate shipping is only available inside Egypt.');
        }
        if (input.currency !== 'EGP') {
            throw new ShippingUnavailableError('Flat rate shipping is priced in EGP only.');
        }
        if (input.requestedProviderId && input.requestedProviderId !== this.providerId) {
            throw new ShippingUnavailableError(
                `Requested shipping provider "${input.requestedProviderId}" is not the flat-rate provider.`
            );
        }

        return {
            providerId: this.providerId,
            serviceCode: FLAT_RATE_SERVICE_CODE,
            amount: this.amount,
            currency: 'EGP',
            isFlatRate: true,
        };
    }

    async createShipment(_input: CreateShipmentInput): Promise<ShipmentResult> {
        return {
            success: false,
            reason: 'carrier_not_integrated',
        };
    }

    async track(_trackingNumber: string): Promise<TrackingResult> {
        return {
            found: false,
            status: 'not_integrated',
            reason: 'carrier_not_integrated',
        };
    }
}

export function createFlatRateProvider(options?: FlatRateProviderOptions): FlatRateProvider {
    return new FlatRateProvider(options);
}
