import { describe, it, expect } from "vitest";
import { calculateOneRepMax } from "./one-rep-max.v6";

describe("one-rep-max.v6", () => {
  it("calculates", () => {
    expect(calculateOneRepMax({ weightKg: 100, reps: 5 }).oneRepMaxKg).toBeGreaterThan(100);
  });
  it("reps=1", () => {
    expect(calculateOneRepMax({ weightKg: 100, reps: 1 }).oneRepMaxKg).toBe(100);
  });
  it("invalid", () => {
    expect(() => calculateOneRepMax({ weightKg: 0, reps: 5 })).toThrow();
    expect(() => calculateOneRepMax({ weightKg: 100, reps: 0 })).toThrow();
    expect(() => calculateOneRepMax({ weightKg: 100, reps: 2.5 })).toThrow();
    expect(() => calculateOneRepMax({ weightKg: NaN, reps: 5 })).toThrow();
  });
});
