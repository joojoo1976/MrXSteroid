import { describe, expect, it } from 'vitest';
import { calculateHalfLife } from './tool-016-half-life-calculator';

describe('calculateHalfLife', () => {
  const input = {
    compounds: [{ name: 'Example', half_life_days: 5, source: 'User cited product monograph, section 5' }],
    remaining_percent: 5,
  };

  it('calculates the selected remaining fraction independently for each item', () => {
    const result = calculateHalfLife({ ...input, compounds: [...input.compounds, { ...input.compounds[0], name: 'Second', half_life_days: 2 }] });
    expect(result.status).toBe('CALCULATED');
    expect(result.compounds).toHaveLength(2);
    expect(result.compounds[0].elapsed_days).toBeCloseTo(5 * Math.log(0.05) / Math.log(0.5), 10);
    expect(result.compounds[1].elapsed_days).toBeCloseTo(2 * Math.log(0.05) / Math.log(0.5), 10);
    expect(result.assumptions).toEqual(['constant_half_life', 'independent_items', 'not_clinical']);
  });

  it.each([
    { remaining_percent: 0 },
    { remaining_percent: 100 },
    { remaining_percent: Number.NaN },
    { compounds: [] },
    { compounds: [{ name: '', half_life_days: 5, source: 'source text' }] },
    { compounds: [{ name: 'Example', half_life_days: 0, source: 'source text' }] },
    { compounds: [{ name: 'Example', half_life_days: 1_000_001, source: 'source text' }] },
    { compounds: [{ name: 'Example', half_life_days: 5, source: '' }] },
    { unexpected: true },
  ])('rejects invalid scenario input: %o', (override) => {
    expect(() => calculateHalfLife({ ...input, ...override } as never)).toThrow();
  });
});
