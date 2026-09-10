import { describe, it, expect } from "vitest";
import { parseAttributionCookie, buildAttributionData } from "../../server/affiliate/attributionService";

describe("Attribution Service", () => {
    it("builds valid attribution data with 60-day expiry", () => {
        const data = buildAttributionData("aff-123", "TESTCODE");
        expect(data.affiliateId).toBe("aff-123");
        expect(data.referralCode).toBe("TESTCODE");
        const exp = new Date(data.attributionExpiresAt);
        const diff = exp.getTime() - Date.now();
        expect(diff).toBeGreaterThan(59 * 24 * 60 * 60 * 1000); // ~60 days
        expect(diff).toBeLessThan(61 * 24 * 60 * 60 * 1000);
    });

    it("parses valid cookie", () => {
        const data = buildAttributionData("aff-abc", "CODE1");
        const parsed = parseAttributionCookie(JSON.stringify(data));
        expect(parsed).not.toBeNull();
        expect(parsed?.affiliateId).toBe("aff-abc");
        expect(parsed?.referralCode).toBe("CODE1");
    });

    it("returns null for empty cookie", () => {
        expect(parseAttributionCookie("")).toBeNull();
        expect(parseAttributionCookie("   ")).toBeNull();
    });

    it("returns null for malformed JSON", () => {
        expect(parseAttributionCookie("not-json")).toBeNull();
        expect(parseAttributionCookie("{bad json")).toBeNull();
    });

    it("returns null for expired attribution", () => {
        const past = new Date(Date.now() - 1000).toISOString();
        const cookie = JSON.stringify({ affiliateId: "a", referralCode: "C", attributionTimestamp: past, attributionExpiresAt: past });
        expect(parseAttributionCookie(cookie)).toBeNull();
    });

    it("returns null for missing required fields", () => {
        expect(parseAttributionCookie(JSON.stringify({ affiliateId: "a" }))).toBeNull();
        expect(parseAttributionCookie(JSON.stringify({ referralCode: "C" }))).toBeNull();
    });

    it("returns null for invalid expiry date", () => {
        const cookie = JSON.stringify({ affiliateId: "a", referralCode: "C", attributionExpiresAt: "not-a-date" });
        expect(parseAttributionCookie(cookie)).toBeNull();
    });

    it("still-valid attribution returns data", () => {
        const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const cookie = JSON.stringify({ affiliateId: "a", referralCode: "CODE", attributionTimestamp: new Date().toISOString(), attributionExpiresAt: future });
        const parsed = parseAttributionCookie(cookie);
        expect(parsed).not.toBeNull();
        expect(parsed?.affiliateId).toBe("a");
    });
});
