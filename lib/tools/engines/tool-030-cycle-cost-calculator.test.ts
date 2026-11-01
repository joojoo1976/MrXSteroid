import { describe, expect, it } from 'vitest';
import { calculateCycleCost } from './tool-030-cycle-cost-calculator';
import { CycleCostInputSchema, CycleCostResultSchema } from '../schemas/tool-030-cycle-cost-calculator';

const input = {
  cycle_weeks: 8,
  compounds: [{
    id: 1,
    name_en: 'Example compound',
    name_ar: 'مركب تجريبي',
    total_cost_usd: 320,
  }],
  pct_duration_weeks: 4,
  ancillary_compounds: [],
};

describe('Tool 030 input contract', () => {
  it('calculates from user-entered costs and the disclosed PCT estimate', () => {
    expect(CycleCostInputSchema.safeParse(input).success).toBe(true);
    const result = calculateCycleCost(input);
    expect(CycleCostResultSchema.safeParse(result).success).toBe(true);
    expect(result.total_compound_cost_usd).toBe(320);
    expect(result.total_ancillary_cost_usd).toBe(0);
    expect(result.total_pct_cost_usd).toBe(440);
    expect(result.grand_total_usd).toBe(760);
    expect(result.cost_per_week_usd).toBe(63.33);
    expect(result.budget_savings_tips).toEqual([]);
  });

  it('scales assumed PCT cost by the supplied duration', () => {
    const result = calculateCycleCost({ ...input, pct_duration_weeks: 6 });
    expect(result.total_pct_cost_usd).toBe(660);
  });

  it('rejects a PCT duration outside the documented input range', () => {
    expect(CycleCostInputSchema.safeParse({ ...input, pct_duration_weeks: 0 }).success).toBe(false);
    expect(CycleCostInputSchema.safeParse({ ...input, pct_duration_weeks: 27 }).success).toBe(false);
  });

  it('sums only explicitly entered additional item costs', () => {
    const result = calculateCycleCost({
      ...input,
      ancillary_compounds: [{ id: 2, name_en: 'Additional item', name_ar: 'بند إضافي', total_cost_usd: 12.5 }],
    });
    expect(result.total_ancillary_cost_usd).toBe(12.5);
    expect(result.cost_breakdown.ancillaries).toEqual([{ name: 'Additional item', cost: 12.5 }]);
  });

  it('rounds summed user-entered prices to cents without floating-point artifacts', () => {
    const result = calculateCycleCost({
      ...input,
      compounds: [
        { id: 1, name_en: 'Item A', name_ar: 'أ', total_cost_usd: 0.1 },
        { id: 2, name_en: 'Item B', name_ar: 'ب', total_cost_usd: 0.2 },
      ],
    });
    expect(result.total_compound_cost_usd).toBe(0.3);
  });

  it('rejects incomplete or out-of-range cost line items', () => {
    expect(CycleCostInputSchema.safeParse({
      ...input,
      compounds: [{ id: 1, name_en: '', name_ar: '', total_cost_usd: null }],
    }).success).toBe(false);
    expect(CycleCostInputSchema.safeParse({
      ...input,
      compounds: [{ id: 1, name_en: 'Item', name_ar: 'بند', total_cost_usd: -1 }],
    }).success).toBe(false);
  });

  it('rejects invalid engine inputs instead of silently substituting defaults', () => {
    expect(() => calculateCycleCost({ ...input, cycle_weeks: 0 })).toThrow();
    expect(() => calculateCycleCost({ ...input, pct_duration_weeks: 0 })).toThrow();
  });
});
