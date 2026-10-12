import { describe, it, expect } from 'vitest';
import { buildPhaseTimeline, type ContestPrepInput } from './tool-107-contest-prep-peak-week-manipulator';

const base: ContestPrepInput = {
  days_until_show: 28,
  sex: 'male',
  weight_kg: 96,
  hydration_status: 'normal',
  tan_stability: 'medium',
  show_stage_format: 'bodybuilding',
};

describe('Tool #107 - Contest Prep Peak-Week Manipulator', () => {
  it('builds a strictly ordered phase timeline with no duplicated day slots', () => {
    const r = buildPhaseTimeline(base);
    expect(r.phase_steps.length).toBeGreaterThan(0);
    const days = r.phase_steps.map((s) => s.days_before);
    const sorted = [...days].sort((a, b) => a - b); // furthest-away (most negative) first
    expect(days).toEqual(sorted);
    expect(new Set(days).size).toBe(days.length);
  });

  it('emits the D-3, D-1 and show-day checkpoints for a full prep window', () => {
    const r = buildPhaseTimeline(base);
    const byDays = new Map(r.phase_steps.map((s) => [s.days_before, s.phase]));
    expect(byDays.get(-3)).toBe('day_before');
    expect(byDays.get(-1)).toBe('day_before');
    expect(byDays.get(0)).toBe('show_day');
  });

  it('omits checkpoints that lie outside the remaining prep window', () => {
    const r = buildPhaseTimeline({ ...base, days_until_show: 2 });
    const days = r.phase_steps.map((s) => s.days_before);
    expect(days).not.toContain(-7);
    expect(days).not.toContain(-14);
    expect(days).toContain(-1);
    expect(days).toContain(0);
  });

  it('ramps the sodium reference monotonically between 500 and 2000 mg/day', () => {
    const r = buildPhaseTimeline(base);
    expect(r.sodium_ref_mg_day.length).toBe(21); // capped at 21 days of the window

    expect(r.sodium_ref_mg_day[0]).toBe(500);
    expect(r.sodium_ref_mg_day[20]).toBe(2000);
    for (let i = 1; i < r.sodium_ref_mg_day.length; i++) {
      expect(r.sodium_ref_mg_day[i]).toBeGreaterThan(r.sodium_ref_mg_day[i - 1]);
    }
  });

  it('scales the water reference by body weight and sex', () => {
    const male = buildPhaseTimeline({ ...base, sex: 'male', weight_kg: 100 });
    const female = buildPhaseTimeline({ ...base, sex: 'female', weight_kg: 100 });
    expect(male.water_ref_liters[0]).toBeGreaterThan(female.water_ref_liters[0]);
    expect(male.water_ref_liters[1]).toBeCloseTo(4, 5); // 100 * 0.04
    expect(female.water_ref_liters[1]).toBeCloseTo(4, 5);
  });

  it('maps hydration status onto a dehydration risk tier', () => {
    expect(buildPhaseTimeline({ ...base, hydration_status: 'normal' }).dehydration_risk_tier).toBe('low');
    expect(buildPhaseTimeline({ ...base, hydration_status: 'mild' }).dehydration_risk_tier).toBe('moderate');
    expect(buildPhaseTimeline({ ...base, hydration_status: 'severe' }).dehydration_risk_tier).toBe('high');
  });

  it('flags a severe hydration status for clinician review', () => {
    const r = buildPhaseTimeline({ ...base, days_until_show: 7, hydration_status: 'severe' });
    const step = r.phase_steps.find((s) => s.days_before === -7);
    expect(step?.reference_text).toBe('severe_hydration_flag_clinician_review_required');
  });

  it('always emits a non-prescription scope notice and education flags', () => {
    const r = buildPhaseTimeline(base);
    expect(r.scope_notice).toBe('educational_contest_prep_reference_timeline_not_a_medical_or_dietetic_prescription');
    expect(r.education_flags).toContain('schedule_is_reference_only_not_a_prescription');
    expect(r.checklist_ref.length).toBeGreaterThan(0);
  });
});
