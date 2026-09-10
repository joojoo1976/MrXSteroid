import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// ── Helpers ──────────────────────────────────────────────────────────────────
const MERCHANT_ID = "MID_EGYPT";
const API_KEY = "APIKEY_EGYPT";
const OTHER_MID = "MID_GLOBAL";
const OTHER_KEY = "APIKEY_GLOBAL";

function buildPayload(fields: Record<string, string>) {
    return { ...fields, merchantId: MERCHANT_ID };
}

function signPayload(payload: Record<string, string>, key: string): string {
    const signatureKeys = Object.keys(payload).sort().join(",");
    const input = Object.keys(payload).sort().map(k => `${k}=${payload[k]}`).join("&");
    const signature = crypto.createHmac("sha256", key).update(input).digest("hex");
    return JSON.stringify({ ...payload, signature, signatureKeys });
}

async function verifyKashier(rawBody: string, merchantType: "egypt" | "global" = "egypt") {
    const { KashierGateway } = await import("../../server/payments/gateways/KashierGateway");
    const gw = new KashierGateway(merchantType);
    // @ts-expect-error req not needed for body-only verification
    return gw.verifyWebhook({}, rawBody);
}

describe("Kashier Webhook Verification", () => {
    beforeEach(() => {
        process.env.KASHIER_EGYPT_MERCHANT_ID = MERCHANT_ID;
        process.env.KASHIER_EGYPT_PAYMENT_API_KEY = API_KEY;
        process.env.KASHIER_EGYPT_SECRET_KEY = "SECRET";
        process.env.KASHIER_GLOBAL_MERCHANT_ID = OTHER_MID;
        process.env.KASHIER_GLOBAL_PAYMENT_API_KEY = OTHER_KEY;
        process.env.KASHIER_GLOBAL_SECRET_KEY = "SECRET_GLOBAL";
        process.env.KASHIER_MODE = "test";
        vi.resetModules();
    });

    // 1. Valid webhook
    it("1. valid webhook — SUCCESS → status=success", async () => {
        const fields = { orderId: "inv-001", orderStatus: "APPROVED", amount: "100.00", currency: "EGP", transactionId: "txn-001" };
        const rawBody = signPayload(buildPayload(fields), API_KEY);
        const r = await verifyKashier(rawBody);
        expect(r.valid).toBe(true);
        expect(r.status).toBe("success");
        expect(r.invoiceId).toBe("inv-001");
    });

    // 2. Invalid signature
    it("2. invalid signature → valid=false", async () => {
        const fields = { orderId: "inv-002", orderStatus: "APPROVED", amount: "100.00", currency: "EGP" };
        const rawBody = signPayload(buildPayload(fields), "WRONG_KEY");
        // Change the signature to be invalid
        const parsed = JSON.parse(rawBody);
        parsed.signature = "deadbeef".repeat(8);
        const r = await verifyKashier(JSON.stringify(parsed));
        expect(r.valid).toBe(false);
    });

    // 3. Missing signature
    it("3. missing signature → valid=false", async () => {
        const rawBody = JSON.stringify({ orderId: "inv-003", orderStatus: "APPROVED", merchantId: MERCHANT_ID });
        const r = await verifyKashier(rawBody);
        expect(r.valid).toBe(false);
    });

    // 4. Malformed payload
    it("4. malformed payload → valid=false", async () => {
        const r = await verifyKashier("not json at all");
        expect(r.valid).toBe(false);
    });

    // 5. Empty body
    it("5. empty body → valid=false", async () => {
        const r = await verifyKashier("");
        expect(r.valid).toBe(false);
    });

    // 6. Unknown orderId (no orderId in payload)
    it("6. missing orderId → valid=true but invoiceId undefined", async () => {
        const fields = { orderStatus: "APPROVED", amount: "50.00", currency: "EGP" };
        const payload = buildPayload(fields);
        const rawBody = signPayload(payload, API_KEY);
        const r = await verifyKashier(rawBody);
        expect(r.valid).toBe(true);
        expect(r.invoiceId).toBeUndefined();
    });

    // 7. Wrong merchant ID → cross-account rejection
    it("7. wrong merchant account → valid=false", async () => {
        const fields = { orderId: "inv-007", orderStatus: "APPROVED", amount: "100.00", currency: "EGP" };
        const payloadWithWrongMid = { ...fields, merchantId: "WRONG_MID" };
        const rawBody = signPayload(payloadWithWrongMid, API_KEY);
        const r = await verifyKashier(rawBody, "egypt");
        expect(r.valid).toBe(false);
        expect(r.errorMessage).toMatch(/Merchant ID mismatch/);
    });

    // 8. DECLINED → status=failed
    it("8. DECLINED → status=failed", async () => {
        const fields = { orderId: "inv-008", orderStatus: "DECLINED", amount: "100.00", currency: "EGP" };
        const rawBody = signPayload(buildPayload(fields), API_KEY);
        const r = await verifyKashier(rawBody);
        expect(r.valid).toBe(true);
        expect(r.status).toBe("failed");
        expect(r.detailedStatus).toBe("DECLINED");
    });

    // 9. TIMED_OUT → status=undefined (unresolved, must NOT fulfil)
    it("9. TIMED_OUT → status=undefined (unresolved, no fulfillment)", async () => {
        const fields = { orderId: "inv-009", orderStatus: "TIMED_OUT", amount: "100.00", currency: "EGP" };
        const rawBody = signPayload(buildPayload(fields), API_KEY);
        const r = await verifyKashier(rawBody);
        expect(r.valid).toBe(true);
        expect(r.status).toBeUndefined();
        expect(r.detailedStatus).toBe("TIMED_OUT");
    });

    // 10. UNKNOWN → status=undefined (unresolved)
    it("10. UNKNOWN → status=undefined (unresolved, no fulfillment)", async () => {
        const fields = { orderId: "inv-010", orderStatus: "UNKNOWN", amount: "100.00", currency: "EGP" };
        const rawBody = signPayload(buildPayload(fields), API_KEY);
        const r = await verifyKashier(rawBody);
        expect(r.valid).toBe(true);
        expect(r.status).toBeUndefined();
        expect(r.detailedStatus).toBe("UNKNOWN");
    });

    // 11. EXPIRED_CARD → failed
    it("11. EXPIRED_CARD → status=failed", async () => {
        const fields = { orderId: "inv-011", orderStatus: "EXPIRED_CARD", amount: "100.00", currency: "EGP" };
        const rawBody = signPayload(buildPayload(fields), API_KEY);
        const r = await verifyKashier(rawBody);
        expect(r.valid).toBe(true);
        expect(r.status).toBe("failed");
        expect(r.detailedStatus).toBe("EXPIRED_CARD");
    });

    // 12. ACQUIRER_SYSTEM_ERROR → failed
    it("12. ACQUIRER_SYSTEM_ERROR → status=failed", async () => {
        const fields = { orderId: "inv-012", orderStatus: "ACQUIRER_SYSTEM_ERROR", amount: "100.00", currency: "EGP" };
        const rawBody = signPayload(buildPayload(fields), API_KEY);
        const r = await verifyKashier(rawBody);
        expect(r.status).toBe("failed");
    });

    // 13. UNSPECIFIED_FAILURE → failed
    it("13. UNSPECIFIED_FAILURE → status=failed", async () => {
        const fields = { orderId: "inv-013", orderStatus: "UNSPECIFIED_FAILURE", amount: "100.00", currency: "EGP" };
        const rawBody = signPayload(buildPayload(fields), API_KEY);
        const r = await verifyKashier(rawBody);
        expect(r.status).toBe("failed");
    });

    // 14. AUTHORIZED → unresolved (not yet captured)
    it("14. AUTHORIZED → status=undefined (not yet captured)", async () => {
        const fields = { orderId: "inv-014", orderStatus: "AUTHORIZED", amount: "100.00", currency: "EGP" };
        const rawBody = signPayload(buildPayload(fields), API_KEY);
        const r = await verifyKashier(rawBody);
        expect(r.status).toBeUndefined();
        expect(r.detailedStatus).toBe("AUTHORIZED");
    });

    // 15. CAPTURED → success
    it("15. CAPTURED → status=success", async () => {
        const fields = { orderId: "inv-015", orderStatus: "CAPTURED", amount: "100.00", currency: "EGP" };
        const rawBody = signPayload(buildPayload(fields), API_KEY);
        const r = await verifyKashier(rawBody);
        expect(r.status).toBe("success");
    });

    // 16. REFUNDED → failed (with detailedStatus)
    it("16. REFUNDED → status=failed, detailedStatus=REFUNDED", async () => {
        const fields = { orderId: "inv-016", orderStatus: "REFUNDED", amount: "100.00", currency: "EGP" };
        const rawBody = signPayload(buildPayload(fields), API_KEY);
        const r = await verifyKashier(rawBody);
        expect(r.status).toBe("failed");
        expect(r.detailedStatus).toBe("REFUNDED");
    });

    // 17. paidAmount parsed from payload
    it("17. paidAmount extracted from amount field", async () => {
        const fields = { orderId: "inv-017", orderStatus: "APPROVED", amount: "249.99", currency: "EGP" };
        const rawBody = signPayload(buildPayload(fields), API_KEY);
        const r = await verifyKashier(rawBody);
        expect(r.paidAmount).toBe(249.99);
    });

    // 18. merchantId returned in result
    it("18. merchantId included in verification result", async () => {
        const fields = { orderId: "inv-018", orderStatus: "APPROVED", amount: "100.00", currency: "EGP" };
        const rawBody = signPayload(buildPayload(fields), API_KEY);
        const r = await verifyKashier(rawBody);
        expect(r.merchantId).toBe(MERCHANT_ID);
    });

    // 19. signatureKeys order doesn't matter (library sorts them)
    it("19. signatureKeys order is normalized (sorted alphabetically)", async () => {
        // Build payload manually with reverse-sorted signatureKeys
        const payload = { orderId: "inv-019", orderStatus: "APPROVED", amount: "100.00", currency: "EGP", merchantId: MERCHANT_ID };
        const allKeys = Object.keys(payload);
        const signatureKeys = [...allKeys].reverse().join(","); // intentionally un-sorted
        const sortedInput = allKeys.sort().map(k => `${k}=${(payload as Record<string,string>)[k]}`).join("&");
        const signature = crypto.createHmac("sha256", API_KEY).update(sortedInput).digest("hex");
        const rawBody = JSON.stringify({ ...payload, signature, signatureKeys });
        const r = await verifyKashier(rawBody);
        expect(r.valid).toBe(true);
    });

    // 20. Unknown orderStatus → UNKNOWN / unresolved
    it("20. completely unknown orderStatus → UNKNOWN / unresolved", async () => {
        const fields = { orderId: "inv-020", orderStatus: "SOME_NEW_CODE_WE_DONT_KNOW", amount: "100.00", currency: "EGP" };
        const rawBody = signPayload(buildPayload(fields), API_KEY);
        const r = await verifyKashier(rawBody);
        expect(r.valid).toBe(true);
        expect(r.status).toBeUndefined();
        expect(r.detailedStatus).toBe("UNKNOWN");
    });

    // 21. Timing-safe comparison (can't be exploited with length-mismatch)
    it("21. short/mismatched signature hex → valid=false", async () => {
        const fields = { orderId: "inv-021", orderStatus: "APPROVED", amount: "100.00", currency: "EGP" };
        const payload = buildPayload(fields);
        const allKeys = Object.keys(payload).sort().join(",");
        const rawBody = JSON.stringify({ ...payload, signature: "abc", signatureKeys: allKeys });
        const r = await verifyKashier(rawBody);
        expect(r.valid).toBe(false);
    });
});
