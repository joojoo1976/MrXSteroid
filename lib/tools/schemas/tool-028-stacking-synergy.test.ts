import { describe, expect, it } from 'vitest';
import { CompoundScenarioSchema, StackComparisonInputSchema } from './tool-028-stacking-synergy';

const scenario = { name: 'Scenario', items: ['Item A'] };

describe('Tool 028 comparison worksheet schema', () => {
  it('requires both named scenarios and non-empty user-entered item lists', () => {
    expect(StackComparisonInputSchema.safeParse({ scenarioA: scenario, scenarioB: { ...scenario, name: 'B' } }).success).toBe(true);
    expect(StackComparisonInputSchema.safeParse({ scenarioA: scenario, scenarioB: { name: '', items: [] } }).success).toBe(false);
  });

  it('enforces 1–10 items and bounded labels and notes', () => {
    expect(CompoundScenarioSchema.safeParse({ ...scenario, items: Array(10).fill('Item') }).success).toBe(true);
    expect(CompoundScenarioSchema.safeParse({ ...scenario, items: Array(11).fill('Item') }).success).toBe(false);
    expect(CompoundScenarioSchema.safeParse({ ...scenario, items: ['x'.repeat(121)] }).success).toBe(false);
    expect(CompoundScenarioSchema.safeParse({ ...scenario, notes: 'x'.repeat(501) }).success).toBe(false);
  });

  it('rejects non-string entries and unrecognized assessment fields', () => {
    expect(CompoundScenarioSchema.safeParse({ ...scenario, items: [3] }).success).toBe(false);
    expect(StackComparisonInputSchema.safeParse({ scenarioA: scenario, scenarioB: scenario, synergyScore: 90 }).success).toBe(false);
  });
});
