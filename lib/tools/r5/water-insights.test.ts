import { describe, expect, it } from 'vitest';
import { buildWaterScenarios, litersToUsFlOz } from './water-insights';

describe('water engine-derived scenarios and units', () => {
  it('recalculates baseline, moderate and very-active levels through the real engine', () => {
    expect(buildWaterScenarios(70)).toEqual([
      { activityLevel: 1, liters: 2.45 },
      { activityLevel: 1.2, liters: 2.5 },
      { activityLevel: 1.4, liters: 2.55 },
    ]);
  });

  it('deduplicates and sorts custom activity levels', () => {
    const scenarios = buildWaterScenarios(70, [1.4, 1, 1.2, 1.2]);
    expect(scenarios.map((scenario) => scenario.activityLevel)).toEqual([1, 1.2, 1.4]);
  });

  it('converts litres to whole US fluid ounces', () => {
    expect(litersToUsFlOz(2.5)).toBe(85);
    expect(litersToUsFlOz(1)).toBe(34);
    expect(litersToUsFlOz(2.55)).toBe(86);
  });

  it('rejects negative or non-finite litre values', () => {
    expect(() => litersToUsFlOz(-1)).toThrow();
    expect(() => litersToUsFlOz(Number.NaN)).toThrow();
  });

  it('rejects invalid weight through the engine boundary', () => {
    expect(() => buildWaterScenarios(0)).toThrow();
  });
});
