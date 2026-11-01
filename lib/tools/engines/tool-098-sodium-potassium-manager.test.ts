import { describe, expect, it } from 'vitest';
import { manageSodiumPotassium } from './tool-098-sodium-potassium-manager';

describe('Tool #098 — sodium/potassium ratio arithmetic', () => {
  it('calculates the entered mg-to-mg ratio without classification', () => {
    expect(manageSodiumPotassium({ daily_sodium_mg: 3000, daily_potassium_mg: 3800 })).toEqual({
      status: 'CALCULATED', resultType: 'CALCULATED', sodium_to_potassium_ratio: 0.79,
    });
  });

  it('allows zero sodium while requiring a positive potassium denominator', () => {
    expect(manageSodiumPotassium({ daily_sodium_mg: 0, daily_potassium_mg: 2000 }).sodium_to_potassium_ratio).toBe(0);
    expect(() => manageSodiumPotassium({ daily_sodium_mg: 100, daily_potassium_mg: 0 })).toThrow();
  });

  it.each([
    { daily_sodium_mg: -1, daily_potassium_mg: 2000 },
    { daily_sodium_mg: Number.NaN, daily_potassium_mg: 2000 },
    { daily_sodium_mg: 100, daily_potassium_mg: Number.POSITIVE_INFINITY },
    { daily_sodium_mg: 100, daily_potassium_mg: 2000, extra: true },
  ])('rejects malformed or unsupported input', (input) => {
    expect(() => manageSodiumPotassium(input as never)).toThrow();
  });

  it('is deterministic', () => {
    const input = { daily_sodium_mg: 2500, daily_potassium_mg: 3500 };
    expect(manageSodiumPotassium(input)).toEqual(manageSodiumPotassium(input));
  });
});
