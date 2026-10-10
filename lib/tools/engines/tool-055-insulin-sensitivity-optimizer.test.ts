import { describe, it, expect } from 'vitest';
import { assessInsulinSensitivity } from './tool-055-insulin-sensitivity-optimizer';

describe('tool-055 insulin sensitivity engine (HOMA-IR)', () => {
  it('computes the documented HOMA-IR formula with banded guidance', () => {
    const r = assessInsulinSensitivity({
      fasting_glucose: 90, fasting_insulin: 8,
      weekly_training_sessions: 4, sleep_hours: 8,
    });
    expect(r.homa_ir).toBe(1.78); // 90*8/405
    expect(r.band).toBe('average');
    expect(r.interventions).not.toContain('resistance_training_3x');
    expect(r.warnings).toContain('medical_supervision_required');
  });

  it('crosses the significant-resistance threshold at 2.96', () => {
    const r = assessInsulinSensitivity({
      fasting_glucose: 100, fasting_insulin: 12,
      weekly_training_sessions: 0, sleep_hours: 5,
    });
    expect(r.homa_ir).toBe(2.96); // 1200/405
    expect(r.band).toBe('significant-insulin-resistance');
    expect(r.interventions).toContain('resistance_training_3x');
    expect(r.interventions).toContain('sleep_7_to_9h');
    expect(r.interventions).toContain('fasting_glucose_elevated_see_physician');
  });

  it('keeps optimal profiles in the optimal band', () => {
    const r = assessInsulinSensitivity({
      fasting_glucose: 85, fasting_insulin: 4,
      weekly_training_sessions: 5, sleep_hours: 8,
    });
    expect(r.homa_ir).toBe(0.84); // 85*4/405 = 0.8395 -> 0.84
    expect(r.band).toBe('optimal');
    expect(r.interventions).toEqual(['maintain_current_habits']);
  });
});
