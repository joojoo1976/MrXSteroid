import { describe, it, expect } from 'vitest';
import { trackBloodPressure } from './tool-074-blood-pressure-tracker';
import { BloodPressureInputSchema, BloodPressureResultSchema } from '../schemas/tool-074-blood-pressure-tracker';

describe('Tool #074 — Blood Pressure Tracker Engine', () => {
  it('correctly classifies normal blood pressure and computes MAP & PP', () => {
    const res = trackBloodPressure({
      systolic_mmhg: 115,
      diastolic_mmhg: 75,
    });
    expect(res.category).toBe('normal');
    expect(res.pulse_pressure).toBe(40);
    // MAP = 75 + (40/3) = 88.3
    expect(res.mean_arterial_pressure).toBe(88.3);
    expect(res.follow_up_needed).toBe(false);
  });

  it('detects stage 2 hypertension and wide pulse pressure', () => {
    const res = trackBloodPressure({
      systolic_mmhg: 155,
      diastolic_mmhg: 92,
    });
    expect(res.category).toBe('stage-2-hypertension');
    expect(res.pulse_pressure).toBe(63);
    expect(res.warnings).toContain('stage_2_hypertension_physician_consultation_indicated');
    expect(res.warnings).not.toContain('elevated_pulse_pressure_may_indicate_arterial_stiffness');
  });

  it('marks a severe-range reading without claiming an emergency from numbers alone', () => {
    const res = trackBloodPressure({
      systolic_mmhg: 190,
      diastolic_mmhg: 110,
    });
    expect(res.category).toBe('severe-range');
    expect(res.follow_up_needed).toBe(true);
    expect(res.warnings).toContain('severe_range_repeat_after_1min_and_check_symptoms');
  });

  it('keeps the official strict threshold boundary and accepts the result contract', () => {
    const atBoundary = trackBloodPressure({ systolic_mmhg: 180, diastolic_mmhg: 120 });
    expect(atBoundary.category).toBe('stage-2-hypertension');
    expect(atBoundary.follow_up_needed).toBe(false);

    const beyondBoundary = trackBloodPressure({ systolic_mmhg: 181, diastolic_mmhg: 120 });
    expect(beyondBoundary.category).toBe('severe-range');
    expect(BloodPressureResultSchema.safeParse(beyondBoundary).success).toBe(true);
  });

  it('rejects reversed systolic and diastolic inputs and supports full pulse-pressure range', () => {
    expect(BloodPressureInputSchema.safeParse({ systolic_mmhg: 100, diastolic_mmhg: 110 }).success).toBe(false);
    expect(() => trackBloodPressure({ systolic_mmhg: 100, diastolic_mmhg: 110 })).toThrow(/Systolic pressure/);
    const highDifference = trackBloodPressure({ systolic_mmhg: 240, diastolic_mmhg: 40 });
    expect(highDifference.pulse_pressure).toBe(200);
    expect(BloodPressureResultSchema.safeParse(highDifference).success).toBe(true);
  });
});
