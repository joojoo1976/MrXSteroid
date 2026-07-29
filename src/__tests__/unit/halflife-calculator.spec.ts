import { describe, it, expect } from 'vitest';

/**
 * Pure Mathematical Half-Life & Bateman Decay Calculator Tests
 * Verifies biological half-life calculation precision, cumulative dosage peak/trough,
 * and time-series step consistency for the Mr. X-Steroid Half-Life Simulator.
 */

function calculateSingleDecay(dosage: number, halfLife: number, deltaDays: number): number {
  if (deltaDays < 0) return 0;
  // Exponential decay C(t) = C0 * (1/2)^(t / t_half)
  return dosage * Math.pow(0.5, deltaDays / halfLife);
}

function calculateBatemanLevel(
  dosage: number,
  halfLife: number,
  deltaDays: number,
  esterWeight = 1.0
): number {
  if (deltaDays < 0) return 0;
  const ke = Math.LN2 / halfLife;
  let ka = halfLife < 1.0 ? 12.0 : halfLife <= 3.0 ? 3.0 : 1.0;
  if (Math.abs(ka - ke) < 0.0001) ka += 0.001;
  const multiplier = ka / (ka - ke);
  const activeDose = dosage * esterWeight;
  const level = activeDose * multiplier * (Math.exp(-ke * deltaDays) - Math.exp(-ka * deltaDays));
  return Math.max(0, level);
}

function calculateCumulativeSerum(
  injections: { day: number; dose: number }[],
  currentDay: number,
  halfLife: number,
  esterWeight = 1.0
): number {
  let totalSerum = 0;
  for (const inj of injections) {
    if (inj.day <= currentDay) {
      const deltaT = currentDay - inj.day;
      totalSerum += calculateBatemanLevel(inj.dose, halfLife, deltaT, esterWeight);
    }
  }
  return totalSerum;
}

describe('Half-Life Pharmacokinetic Calculations', () => {
  it('calculates single dose exponential decay at exact half-life', () => {
    const C0 = 250;
    const halfLife = 7; // Days
    const atHalfLife = calculateSingleDecay(C0, halfLife, 7);
    expect(atHalfLife).toBeCloseTo(125, 4);

    const atTwoHalfLives = calculateSingleDecay(C0, halfLife, 14);
    expect(atTwoHalfLives).toBeCloseTo(62.5, 4);
  });

  it('calculates Bateman absorption-elimination serum curve accurately', () => {
    const dose = 250;
    const halfLife = 4.5; // Test Propionate / Enanthate intermediate
    const esterWeight = 0.72; // Enanthate ester weight factor

    // Immediately at injection (t=0), serum concentration is 0 (absorption starting)
    const t0 = calculateBatemanLevel(dose, halfLife, 0, esterWeight);
    expect(t0).toBe(0);

    // Peak occurs around day 1-2
    const t1 = calculateBatemanLevel(dose, halfLife, 1, esterWeight);
    const t2 = calculateBatemanLevel(dose, halfLife, 2, esterWeight);
    expect(t1).toBeGreaterThan(0);
    expect(t2).toBeGreaterThan(0);

    // Long term clearance (> 5.32 * halfLife = ~24 days) drops close to zero
    const t30 = calculateBatemanLevel(dose, halfLife, 30, esterWeight);
    expect(t30).toBeLessThan(5);
  });

  it('calculates cumulative dosage accumulation over e3d protocol', () => {
    const halfLife = 7; // Testosterone Enanthate (~7 days)
    const dose = 250;
    const esterWeight = 0.72;
    const injections = [
      { day: 0, dose },
      { day: 3, dose },
      { day: 6, dose },
      { day: 9, dose },
      { day: 12, dose }
    ];

    const day0Serum = calculateCumulativeSerum(injections, 0, halfLife, esterWeight);
    const day6Serum = calculateCumulativeSerum(injections, 6, halfLife, esterWeight);
    const day15Serum = calculateCumulativeSerum(injections, 15, halfLife, esterWeight);

    // Cumulative serum must rise over successive injections
    expect(day6Serum).toBeGreaterThan(day0Serum);
    expect(day15Serum).toBeGreaterThan(day6Serum);
  });

  it('handles zero or negative days safely without NaN errors', () => {
    const levelBeforeInj = calculateBatemanLevel(250, 7, -5);
    expect(levelBeforeInj).toBe(0);
    expect(isNaN(levelBeforeInj)).toBe(false);
  });
});
