import { describe, it, expect } from "vitest";
import { calculateStrengthStandards } from "./strength-standards.v6";

describe("strength-standards.v6", () => {
  it("calculates ratio", () => {
    const r = calculateStrengthStandards({ liftKg: 100, bodyWeightKg: 80, sex: "male" });
    expect(r.ratio).toBe(1.25);
  });
  it("invalid", () => {
    expect(() => calculateStrengthStandards({ liftKg: 0, bodyWeightKg: 80, sex: "male" })).toThrow();
    expect(() => calculateStrengthStandards({ liftKg: 100, bodyWeightKg: 0, sex: "male" })).toThrow();
    expect(() => calculateStrengthStandards({ liftKg: 100, bodyWeightKg: 80, sex: "unknown" as "male" })).toThrow();
  });
});
