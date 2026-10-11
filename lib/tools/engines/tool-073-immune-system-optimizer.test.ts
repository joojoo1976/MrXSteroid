import { describe, it, expect } from 'vitest';
import { optimizeImmuneSystem } from './tool-073-immune-system-optimizer';

describe('Tool #073 — Immune System Optimizer Engine', () => {
  it('identifies robust resilience with optimal vitamin D, sleep, and cofactors', () => {
    const res = optimizeImmuneSystem({
      vitamin_d_ng_ml: 50,
      sleep_hours_average: 8,
      training_strain_level: 'hard',
      recurrent_upper_respiratory_infections: false,
      takes_zinc_vitamin_c: true,
    });
    // 20 + 30 + 25 + 10 + 15 = 100
    expect(res.immune_resilience_score).toBe(100);
    expect(res.resilience_band).toBe('robust-resilience');
    expect(res.warnings).toEqual(['educational_immune_resilience_assessment']);
  });

  it('detects compromised immunity with low sleep, overreaching, and infection history', () => {
    const res = optimizeImmuneSystem({
      vitamin_d_ng_ml: 18,
      sleep_hours_average: 5,
      training_strain_level: 'extreme-overreaching',
      recurrent_upper_respiratory_infections: true,
      takes_zinc_vitamin_c: false,
    });
    // 20 + 5 + 5 - 10 + 0 - 15 = 5
    expect(res.immune_resilience_score).toBe(5);
    expect(res.resilience_band).toBe('compromised-immunity');
    expect(res.warnings).toContain('extreme_overreaching_creates_transient_immunosuppressive_window');
    expect(res.warnings).toContain('vitamin_d_deficiency_impairs_innate_t_cell_activation');
    expect(res.targeted_priorities).toContain('implement_deload_to_prevent_immune_crash');
  });

  it('handles untested vitamin D gracefully with neutral defaults', () => {
    const res = optimizeImmuneSystem({
      sleep_hours_average: 7,
      training_strain_level: 'light-moderate',
      recurrent_upper_respiratory_infections: false,
      takes_zinc_vitamin_c: true,
    });
    // 20 + 15 + 15 + 15 + 15 = 80
    expect(res.immune_resilience_score).toBe(80);
    expect(res.resilience_band).toBe('robust-resilience');
    expect(res.targeted_priorities).toContain('test_25_oh_vitamin_d_serum_levels');
  });
});
