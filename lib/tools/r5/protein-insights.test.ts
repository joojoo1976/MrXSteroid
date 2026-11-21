import { describe, expect, it } from 'vitest';
import { buildProteinScenarios, proteinGoalAdviceKey } from './protein-insights';

describe('protein engine-derived scenarios', () => {
  it('recalculates maintain, bulk and cut through the real protein engine', () => {
    expect(buildProteinScenarios({ weightKg: 70, activityLevel: 1.2 })).toEqual([
      { goal: 'maintain', grams: 113 },
      { goal: 'bulk', grams: 141 },
      { goal: 'cut', grams: 156 },
    ]);
  });

  it('keeps scenario order stable and follows the activity factor', () => {
    const scenarios = buildProteinScenarios({ weightKg: 70, activityLevel: 1.4 });
    expect(scenarios.map((scenario) => scenario.goal)).toEqual(['maintain', 'bulk', 'cut']);
    expect(scenarios[0].grams).toBe(114);
    expect(scenarios[1].grams).toBe(143);
    expect(scenarios[2].grams).toBe(157);
  });

  it('rejects invalid weight through the engine boundary', () => {
    expect(() => buildProteinScenarios({ weightKg: 0, activityLevel: 1.2 })).toThrow();
  });

  it('maps every goal to its own advice key', () => {
    expect(proteinGoalAdviceKey('maintain')).toBe('maintain');
    expect(proteinGoalAdviceKey('bulk')).toBe('bulk');
    expect(proteinGoalAdviceKey('cut')).toBe('cut');
  });
});
