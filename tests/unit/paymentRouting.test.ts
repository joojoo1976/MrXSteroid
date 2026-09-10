import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock env
const mockEnv = {
    KASHIER_EGYPT_MERCHANT_ID: "MID_EGYPT",
    KASHIER_EGYPT_PAYMENT_API_KEY: "KEY_EGYPT",
    KASHIER_EGYPT_SECRET_KEY: "SECRET_EGYPT",
    KASHIER_GLOBAL_MERCHANT_ID: "MID_GLOBAL",
    KASHIER_GLOBAL_PAYMENT_API_KEY: "KEY_GLOBAL",
    KASHIER_GLOBAL_SECRET_KEY: "SECRET_GLOBAL",
    KASHIER_MODE: "test",
    STRIPE_SECRET_KEY: "sk_test_xxx",
};

describe("Payment Routing", () => {
    beforeEach(() => { Object.assign(process.env, mockEnv); });
    afterEach(() => {
        Object.keys(mockEnv).forEach(k => delete process.env[k]);
        vi.resetModules();
    });

    it("EG country routes to Kashier Egypt via create-invoice logic", async () => {
        const { KashierGateway } = await import("../../server/payments/gateways/KashierGateway");
        const gw = new KashierGateway("egypt");
        expect(gw.getGatewayName()).toBe("KASHIER_EGYPT");
    });

    it("Global (non-EG) routes to Kashier Global", async () => {
        const { KashierGateway } = await import("../../server/payments/gateways/KashierGateway");
        const gw = new KashierGateway("global");
        expect(gw.getGatewayName()).toBe("KASHIER_GLOBAL");
    });

    it("x-kashier-signature header detected by factory", async () => {
        const { PaymentFactory } = await import("../../server/payments/gateways/PaymentFactory");
        const gw = PaymentFactory.detectGatewayFromRequest({
            headers: { "x-kashier-signature": "somehash" },
            query: {},
        });
        expect(gw.getGatewayName()).toBe("KASHIER_EGYPT"); // initial detection
    });

    it("stripe-signature header detected as Stripe", async () => {
        const { PaymentFactory } = await import("../../server/payments/gateways/PaymentFactory");
        const gw = PaymentFactory.detectGatewayFromRequest({
            headers: { "stripe-signature": "t=xxx,v1=yyy" },
            query: {},
        });
        expect(gw.getGatewayName()).toBe("STRIPE");
    });

    it("hmac query param detected as Paymob", async () => {
        const { PaymentFactory } = await import("../../server/payments/gateways/PaymentFactory");
        const gw = PaymentFactory.detectGatewayFromRequest({ headers: {}, query: { hmac: "abc" } });
        expect(gw.getGatewayName()).toBe("PAYMOB");
    });

    it("detectKashierAccountFromMerchantId returns Egypt gateway for Egypt MID", async () => {
        const { PaymentFactory } = await import("../../server/payments/gateways/PaymentFactory");
        const gw = PaymentFactory.detectKashierAccountFromMerchantId("MID_EGYPT");
        expect(gw?.getGatewayName()).toBe("KASHIER_EGYPT");
    });

    it("detectKashierAccountFromMerchantId returns Global gateway for Global MID", async () => {
        const { PaymentFactory } = await import("../../server/payments/gateways/PaymentFactory");
        const gw = PaymentFactory.detectKashierAccountFromMerchantId("MID_GLOBAL");
        expect(gw?.getGatewayName()).toBe("KASHIER_GLOBAL");
    });

    it("detectKashierAccountFromMerchantId returns null for unknown MID", async () => {
        const { PaymentFactory } = await import("../../server/payments/gateways/PaymentFactory");
        const gw = PaymentFactory.detectKashierAccountFromMerchantId("UNKNOWN_MID");
        expect(gw).toBeNull();
    });
});
