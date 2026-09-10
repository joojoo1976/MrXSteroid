import { describe, it, expect } from "vitest";
import { calculateCommission } from "../../server/affiliate/commissionEngine";

const base = (productSubtotal: number, discountAmount = 0, monthlyPaidReferrals = 0, customCommissionRate: number | null = null) =>
    calculateCommission({ invoiceAmount: productSubtotal, productSubtotal, discountAmount, shippingCost: 0, monthlyPaidReferrals, customCommissionRate });

describe("Commission Engine", () => {
    // ── Tier selection ────────────────────────────────────────────────────
    it("Bronze: 0 monthly paid (first sale) → 25%", () => {
        const r = base(100, 0, 0);
        expect(r.tier).toBe("bronze");
        expect(r.commissionRate).toBe(25);
        expect(r.commissionAmount).toBe(25.00);
    });
    it("Bronze: 9 monthly paid (10th sale) → 25%", () => {
        const r = base(100, 0, 9);
        expect(r.tier).toBe("bronze");
        expect(r.commissionRate).toBe(25);
    });
    it("Silver: 10 monthly paid (11th sale) → 35%", () => {
        const r = base(100, 0, 10);
        expect(r.tier).toBe("silver");
        expect(r.commissionRate).toBe(35);
        expect(r.commissionAmount).toBe(35.00);
    });
    it("Silver: 49 monthly paid (50th sale) → 35%", () => {
        const r = base(100, 0, 49);
        expect(r.tier).toBe("silver");
        expect(r.commissionRate).toBe(35);
    });
    it("Gold: 50 monthly paid (51st sale) → 45%", () => {
        const r = base(100, 0, 50);
        expect(r.tier).toBe("gold");
        expect(r.commissionRate).toBe(45);
        expect(r.commissionAmount).toBe(45.00);
    });
    it("Gold: 100 monthly paid → 45%", () => {
        const r = base(100, 0, 100);
        expect(r.tier).toBe("gold");
        expect(r.commissionRate).toBe(45);
    });

    // ── Custom override ───────────────────────────────────────────────────
    it("Custom override 50% wins over Gold at 45%", () => {
        const r = base(100, 0, 100, 50);
        expect(r.tier).toBe("custom");
        expect(r.commissionRate).toBe(50);
        expect(r.commissionAmount).toBe(50.00);
    });
    it("Custom override 0% blocks commission", () => {
        const r = base(100, 0, 100, 0);
        expect(r.commissionAmount).toBe(0);
    });

    // ── Commission base (discount applied before shipping excluded) ───────
    it("Commission base excludes shipping", () => {
        const r = calculateCommission({ invoiceAmount: 150, productSubtotal: 100, discountAmount: 0, shippingCost: 50, monthlyPaidReferrals: 0, customCommissionRate: null });
        expect(r.commissionBase).toBe(100);
        expect(r.commissionAmount).toBe(25.00);
    });
    it("Discount reduces commission base", () => {
        const r = base(100, 20, 0);
        expect(r.commissionBase).toBe(80);
        expect(r.commissionAmount).toBe(20.00); // 80 * 25%
    });
    it("Full discount → 0 commission", () => {
        const r = base(100, 100, 0);
        expect(r.commissionBase).toBe(0);
        expect(r.commissionAmount).toBe(0);
    });
    it("Discount > amount → base floored at 0", () => {
        const r = base(100, 150, 0);
        expect(r.commissionBase).toBe(0);
        expect(r.commissionAmount).toBe(0);
    });

    // ── Edge amounts ──────────────────────────────────────────────────────
    it("amount=0 → 0 commission", () => {
        const r = base(0, 0, 0);
        expect(r.commissionAmount).toBe(0);
    });
    it("amount=0.01 → tiny commission (2dp)", () => {
        const r = base(0.01, 0, 0);
        expect(r.commissionAmount).toBe(0.00); // 0.01 * 25% = 0.0025 → rounds to 0.00
    });
    it("amount=49.99 bronze → 12.50", () => {
        const r = base(49.99, 0, 0); // 49.99 * 25% = 12.4975 → 12.50
        expect(r.commissionAmount).toBe(12.50);
    });
    it("amount=72, silver → 25.20", () => {
        const r = base(72, 0, 10); // 72 * 35% = 25.20
        expect(r.commissionAmount).toBe(25.20);
    });
    it("amount=999999.99 gold → 449999.99 (large values)", () => {
        const r = base(999999.99, 0, 100); // 999999.99 * 45% = 449999.995 → 450000.00
        expect(r.commissionAmount).toBe(450000.00);
    });
    it("commission never negative", () => {
        const r = base(-100, 0, 0);
        expect(r.commissionAmount).toBeGreaterThanOrEqual(0);
    });
});
