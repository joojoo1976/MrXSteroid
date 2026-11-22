/**
 * Shipping provider boundary (Phase 7).
 *
 * The legacy checkout only knows a flat Egypt rate. This interface exists so a
 * real carrier can be added later without changing quote/create-invoice/UI.
 * Nothing here calls a carrier API today.
 */

export type ShippingRegion = 'EGYPT' | 'GLOBAL';
export type ShippingCurrency = 'EGP' | 'USD';

export interface ShippingQuoteInput {
    region: ShippingRegion;
    currency: ShippingCurrency;
    /** Optional caller intent; the provider validates it, never trusts a price. */
    requestedProviderId?: string | null;
}

export interface ShippingQuote {
    providerId: string;
    serviceCode: string;
    amount: number;
    currency: ShippingCurrency;
    /** True when this is a locally integrated rate, not a carrier API quote. */
    isFlatRate: boolean;
}

export interface CreateShipmentInput {
    invoiceId: string;
    providerId: string;
    serviceCode: string;
    address: Record<string, unknown>;
    amount: number;
    currency: ShippingCurrency;
}

export interface ShipmentResult {
    success: boolean;
    shipmentId?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    /** Present when the provider is not integrated yet. */
    reason?: string;
}

export interface TrackingResult {
    found: boolean;
    status: 'pending' | 'in_transit' | 'delivered' | 'failed' | 'not_integrated';
    trackingNumber?: string;
    trackingUrl?: string;
    reason?: string;
}

export interface ShippingProviderCapabilities {
    /** A price can be quoted from server configuration. */
    quote: boolean;
    /** A carrier shipment can be created through an API. */
    createShipment: boolean;
    /** A carrier tracking event stream is available. */
    track: boolean;
}

export interface ShippingProvider {
    readonly providerId: string;
    /** False for a price bucket that is not backed by a carrier integration. */
    readonly isLiveCarrier: boolean;
    readonly capabilities: ShippingProviderCapabilities;
    quote(input: ShippingQuoteInput): ShippingQuote;
    createShipment(input: CreateShipmentInput): Promise<ShipmentResult>;
    track(trackingNumber: string): Promise<TrackingResult>;
}

export class ShippingUnavailableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ShippingUnavailableError';
    }
}
