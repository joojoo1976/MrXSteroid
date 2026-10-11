import { describe, it, expect } from 'vitest';
import { trackBloodPressure } from './tool-074-blood-pressure-tracker';

describe('Tool #074 — Blood Pressure Tracker Engine', () => {
  it('correctly classifies normal blood pressure and computes MAP & PP', () => {
    const res = trackBloodPressure({
      systolic_mmhg: 115,
      diastolic_mmhg: 75,
      on_antihypertensive_medication: false,
    });
    expect(res.category).toBe('normal');
    expect(res.pulse_pressure).toBe(40);
    // MAP = 75 + (40/3) = 88.3
    expect(res.mean_arterial_pressure).toBe(88.3);
    expect(res.escalation_needed).toBe(false);
  });

  it('detects stage 2 hypertension and wide pulse pressure', () => {
    const res = trackBloodPressure({
      systolic_mmhg: 155,
      diastolic_mmhg: 92,
      on_antihypertensive_medication: false,
    });
    expect(res.category).toBe('stage-2-hypertension');
    expect(res.pulse_pressure).toBe(63);
    expect(res.warnings).toContain('stage_2_hypertension_physician_consultation_indicated');
    expect(res.warnings).toContain('elevated_pulse_pressure_may_indicate_arterial_stiffness');
  });

  it('triggers emergency crisis flag on critical readings', () => {
    const res = trackBloodPressure({
      systolic_mmhg: 190,
      diastolic_mmhg: 110,
      on_antihypertensive_medication: true,
    });
    expect(res.category).toBe('hypertensive-crisis');
    expect(res.escalation_needed).toBe(true);
    expect(res.warnings).toContain('hypertensive_crisis_emergency_medical_attention_required');
  });
});
