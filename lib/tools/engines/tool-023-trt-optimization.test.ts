import { describe, expect, it } from 'vitest';
import { calculateTrtOptimization } from './tool-023-trt-optimization';

describe('Tool 023 input contract', () => {
  it('calculates from clinical inputs without collecting an unused body-weight value', () => {
    const result = calculateTrtOptimization({
      age: 35,
      current_total_test_ng_dL: 400,
      current_free_test_pg_mL: 8,
      symptoms: 'moderate',
      hematocrit_current: 48,
      e2_current_pg_mL: 35,
      trt_duration_months: 12,
      administration: 'intramuscular',
    });

    expect(result.recommended_dose_mg_weekly).toBeTypeOf('number');
    expect(result.risk_factors).toBeInstanceOf(Array);
  });
});
