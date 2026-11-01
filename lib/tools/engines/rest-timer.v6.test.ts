import { describe, it, expect } from "vitest";
import { calculateRestTimer } from "./rest-timer.v6";

describe("rest-timer.v6", () => {
  it("high intensity", () => {
    expect(calculateRestTimer({ sets: 3, intensity: "high" }).restSeconds).toBe(180);
  });
  it("invalid sets", () => {
    expect(() => calculateRestTimer({ sets: 0, intensity: "low" })).toThrow();
    expect(() => calculateRestTimer({ sets: NaN, intensity: "low" })).toThrow();
    expect(() => calculateRestTimer({ sets: 2.5, intensity: "low" })).toThrow();
    expect(() => calculateRestTimer({ sets: 3, intensity: "invalid" as "low" })).toThrow();
  });
});
