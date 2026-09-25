/**
 * Canonical payment-gateway configuration: operational status vs customer visibility.
 *
 * Background (QA 2026-09-25): the Admin Dashboard has always had a per-gateway
 * three-state control (`admin_settings.gateway_<name>` = disabled|sandbox|live)
 * plus, in this change, a `customer_visible` flag. Both were WRITE-ONLY: no
 * server code read them, so an operator's choice had no effect on whether a
 * payment could actually be initiated.
 *
 * These tests pin the two axes as INDEPENDENT:
 *   - `ACTIVE + HIDDEN`  → integration works server-side, not offered to shoppers
 *   - `STOPPED`           → initiation rejected regardless of visibility
 * and pin the defaults so an untouched gateway behaves exactly as it does today
 * (production has no `gateway_*` rows at all).
 */
import { describe, it, expect, vi } from 'vitest';

import {
    parseGatewayConfig,
    loadGatewayConfig,
    normalizeGatewayState,
    isOperationallyAllowed,
    isCustomerRenderable,
    operationalKey,
    customerVisibleKey,
    GATEWAY_OPERATIONAL_STATES,
    ACTIVE_GATEWAY_STATE,
    DEFAULT_GATEWAY_STATE,
    DEFAULT_CUSTOMER_VISIBLE,
} from '../../server/payments/gatewayConfig';

const rows = (obj: Record<string, string>) =>
    Object.entries(obj).map(([key, value]) => ({ key, value }));

describe('canonical gateway vocabulary', () => {
    it('uses the exact three literal values the existing admin <select> writes', () => {
        // If this ever changes, the admin dropdown and the stored rows diverge.
        expect([...GATEWAY_OPERATIONAL_STATES]).toEqual(['disabled', 'sandbox', 'live']);
    });

    it('treats `live` as the operational ACTIVE state (not `active`)', () => {
        expect(ACTIVE_GATEWAY_STATE).toBe('live');
    });

    it('builds keys in the existing gateway_* convention', () => {
        expect(operationalKey('paymob')).toBe('gateway_paymob');
        expect(customerVisibleKey('paymob')).toBe('gateway_paymob_customer_visible');
    });

    it('normalizes case/whitespace and rejects unknown values', () => {
        expect(normalizeGatewayState('LIVE')).toBe('live');
        expect(normalizeGatewayState('  live  ')).toBe('live');
        expect(normalizeGatewayState(undefined)).toBe(DEFAULT_GATEWAY_STATE);
        expect(normalizeGatewayState('bogus')).toBe(DEFAULT_GATEWAY_STATE);
    });
});

describe('defaults must not regress untouched gateways', () => {
    // Verified production admin_settings (2026-09-25):
    //   gateway_kashier=live, gateway_spaceremit=live, gateway_paymob=disabled,
    //   gateway_stripe = NO ROW.
    // Defaulting an absent row to `disabled` would silently switch Stripe off.
    it('treats a missing row as live + visible', () => {
        const cfg = parseGatewayConfig([]);
        for (const g of ['paymob', 'stripe', 'kashier', 'spaceremit']) {
            expect(isOperationallyAllowed(cfg, g)).toBe(true);
            expect(isCustomerRenderable(cfg, g)).toBe(true);
        }
    });

    it('marks absent rows as not explicitly configured', () => {
        const cfg = parseGatewayConfig([]);
        expect(cfg.paymob.operationalWasExplicit).toBe(false);
        expect(cfg.paymob.customerVisibleWasExplicit).toBe(false);
    });

    it('falls back to defaults on a config READ failure, not to disabled', async () => {
        // A DB hiccup must not take every payment gateway offline.
        const cfg = await loadGatewayConfig(async () => {
            throw new Error('admin_settings unreachable');
        });
        expect(isOperationallyAllowed(cfg, 'stripe')).toBe(true);
        expect(isOperationallyAllowed(cfg, 'paymob')).toBe(true);
    });
});

describe('operational status gate', () => {
    it('allows only `live`', () => {
        const live = parseGatewayConfig(rows({ gateway_paymob: 'live' }));
        const sandbox = parseGatewayConfig(rows({ gateway_paymob: 'sandbox' }));
        const off = parseGatewayConfig(rows({ gateway_paymob: 'disabled' }));

        expect(isOperationallyAllowed(live, 'paymob')).toBe(true);
        // There is no sandbox capture path, so `sandbox` must not capture.
        expect(isOperationallyAllowed(sandbox, 'paymob')).toBe(false);
        expect(isOperationallyAllowed(off, 'paymob')).toBe(false);
    });

    it('rejects a STOPPED gateway even when it is marked customer-visible', () => {
        const cfg = parseGatewayConfig(rows({
            gateway_paymob: 'disabled',
            gateway_paymob_customer_visible: 'true',
        }));
        expect(isOperationallyAllowed(cfg, 'paymob')).toBe(false);
        // Visibility can never re-enable a stopped gateway.
        expect(isCustomerRenderable(cfg, 'paymob')).toBe(false);
    });

    it('is per-gateway: stopping one leaves the others untouched', () => {
        const cfg = parseGatewayConfig(rows({ gateway_paymob: 'disabled' }));
        expect(isOperationallyAllowed(cfg, 'paymob')).toBe(false);
        for (const g of ['stripe', 'kashier', 'spaceremit']) {
            expect(isOperationallyAllowed(cfg, g)).toBe(true);
            expect(isCustomerRenderable(cfg, g)).toBe(true);
        }
    });

    it('never renders a gateway that is not operationally allowed', () => {
        const cfg = parseGatewayConfig(rows({
            gateway_paymob: 'sandbox',
            gateway_paymob_customer_visible: 'true',
        }));
        expect(isCustomerRenderable(cfg, 'paymob')).toBe(false);
    });
});

describe('customer visibility is an independent axis', () => {
    it('ACTIVE + HIDDEN: allowed operationally, not customer-renderable', () => {
        // This is the required Paymob end state: the integration stays fully
        // present and startable internally while being absent from the storefront.
        const cfg = parseGatewayConfig(rows({
            gateway_paymob: 'live',
            gateway_paymob_customer_visible: 'false',
        }));
        expect(cfg.paymob.operational).toBe('live');
        expect(cfg.paymob.customerVisible).toBe(false);
        expect(isOperationallyAllowed(cfg, 'paymob')).toBe(true);
        expect(isCustomerRenderable(cfg, 'paymob')).toBe(false);
    });

    it('ACTIVE + VISIBLE: allowed and renderable', () => {
        const cfg = parseGatewayConfig(rows({
            gateway_paymob: 'live',
            gateway_paymob_customer_visible: 'true',
        }));
        expect(isOperationallyAllowed(cfg, 'paymob')).toBe(true);
        expect(isCustomerRenderable(cfg, 'paymob')).toBe(true);
    });

    it('any value other than the exact string "true" means hidden', () => {
        for (const v of ['false', 'FALSE', '0', 'no', '']) {
            const cfg = parseGatewayConfig(rows({
                gateway_paymob: 'live',
                gateway_paymob_customer_visible: v,
            }));
            expect(cfg.paymob.customerVisible).toBe(false);
        }
    });

    it('hiding one gateway does not hide the others', () => {
        const cfg = parseGatewayConfig(rows({
            gateway_paymob: 'live',
            gateway_paymob_customer_visible: 'false',
        }));
        expect(isCustomerRenderable(cfg, 'paymob')).toBe(false);
        for (const g of ['stripe', 'kashier', 'spaceremit']) {
            expect(isCustomerRenderable(cfg, g)).toBe(true);
        }
    });
});

/**
 * The literal rows read from production `admin_settings` on 2026-09-25.
 * Pinned so the resolver's behaviour against REAL stored data is a contract,
 * not just a property of hand-written fixtures.
 */
const PRODUCTION_ROWS = rows({
    gateway_kashier: 'live',
    gateway_paymob: 'disabled',
    gateway_spaceremit: 'live',
});

describe('contract against the real production admin_settings rows', () => {
    it('reads the stored states exactly as stored', () => {
        const cfg = parseGatewayConfig(PRODUCTION_ROWS);
        expect(cfg.kashier.operational).toBe('live');
        expect(cfg.paymob.operational).toBe('disabled');
        expect(cfg.spaceremit.operational).toBe('live');
    });

    it('the row-less `gateway_stripe` stays operational via the default', () => {
        // Stripe has no row, so it is present in the map but NOT explicit.
        // If this ever fails, Stripe has been switched off.
        const cfg = parseGatewayConfig(PRODUCTION_ROWS);
        expect(cfg.stripe.operationalWasExplicit).toBe(false);
        expect(cfg.stripe.operational).toBe('live');
        expect(isOperationallyAllowed(cfg, 'stripe')).toBe(true);
        expect(isCustomerRenderable(cfg, 'stripe')).toBe(true);
    });

    it('Paymob was STOPPED before this change, and Kashier/SpaceRemit were not', () => {
        const cfg = parseGatewayConfig(PRODUCTION_ROWS);
        expect(isOperationallyAllowed(cfg, 'paymob')).toBe(false);
        expect(isOperationallyAllowed(cfg, 'kashier')).toBe(true);
        expect(isOperationallyAllowed(cfg, 'spaceremit')).toBe(true);
    });

    it('every gateway defaults to customer-VISIBLE until explicitly hidden', () => {
        // No `*_customer_visible` rows existed in production, so before this
        // change all four resolved to visible — the regression that allowed the
        // Paymob label to reach the storefront in the first place.
        const cfg = parseGatewayConfig(PRODUCTION_ROWS);
        for (const g of ['paymob', 'stripe', 'kashier', 'spaceremit']) {
            expect(cfg[g]?.customerVisible ?? true).toBe(true);
        }
    });
});

describe('robustness', () => {    it('ignores malformed rows instead of throwing', () => {
        const cfg = parseGatewayConfig([
            { key: 'gateway_paymob', value: 'live' },
            { key: '', value: 'live' },
        ] as never);
        expect(cfg.paymob.operational).toBe('live');
    });

    it('discovers a gateway that is not one of the four managed names', () => {
        const cfg = parseGatewayConfig(rows({ gateway_newthing: 'disabled' }));
        expect(cfg.newthing.operational).toBe('disabled');
        expect(isOperationallyAllowed(cfg, 'newthing')).toBe(false);
    });

    it('is safe to call with no config at all', () => {
        expect(isOperationallyAllowed(undefined, 'paymob')).toBe(true);
        expect(isCustomerRenderable(undefined, 'paymob')).toBe(true);
    });
});
