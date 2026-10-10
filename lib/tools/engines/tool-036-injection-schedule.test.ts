/**
 * Tool #036 — Injection Schedule Planner: engine + schema verification.
 */
import { describe, it, expect } from 'vitest';
import { planInjectionSchedule } from './tool-036-injection-schedule';
import { InjectionScheduleInputSchema, InjectionScheduleResultSchema } from '../schemas/tool-036-injection-schedule';

describe('tool-036 schedule engine', () => {
  it('splits a weekly dose across injection days with rotation', () => {
    const input = {
      compounds: [{ name_en: 'Test E', weekly_dose_mg: 500, concentration_mg_ml: 250, injections_per_week: 2, max_ml_per_site: 3 }],
      rotation_sites: ['L glute', 'R glute', 'L delt', 'R delt'],
    };
    expect(InjectionScheduleInputSchema.safeParse(input).success).toBe(true);
    const r = planInjectionSchedule(input);
    expect(InjectionScheduleResultSchema.safeParse(r).success).toBe(true);
    expect(r.shots).toHaveLength(2);
    expect(r.shots[0].dose_mg).toBe(250);
    expect(r.shots[0].volume_ml).toBe(1);
    expect(r.shots[0].site).toBe('L glute');
    expect(r.shots[1].site).toBe('R glute');
    expect(r.total_volume_ml_per_week).toBe(2);
  });

  it('flags site-volume overflow', () => {
    const r = planInjectionSchedule({
      compounds: [{ name_en: 'Test U', weekly_dose_mg: 1000, concentration_mg_ml: 250, injections_per_week: 1, max_ml_per_site: 3 }],
      rotation_sites: ['L glute'],
    });
    expect(r.shots[0].split_warning).toBe(true);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it('requires rotation sites', () => {
    const r = planInjectionSchedule({
      compounds: [{ name_en: 'Test E', weekly_dose_mg: 500, concentration_mg_ml: 250, injections_per_week: 2 }],
      rotation_sites: [],
    });
    expect(r.shots).toEqual([]);
    expect(InjectionScheduleInputSchema.safeParse({ compounds: [], rotation_sites: ['A'] }).success).toBe(false);
  });
});
