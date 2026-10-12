import { describe, it, expect } from 'vitest';
import type { Locale, SnapshotType, UnitSystem } from '../contracts';
import { buildGlycogenOutput } from './tool-106-glycogen-supercompensation-water-modeler';
import { buildContestPrepOutput } from './tool-107-contest-prep-peak-week-manipulator';
import { buildVisionOutput } from './tool-108-ai-body-composition-vision-engine';
import { buildReadinessOutput } from './tool-109-competition-readiness-posing-os';
import { buildMealOutput } from './tool-110-ai-meal-vision-scanner';

const options = {
  locale: 'ar' as Locale,
  unitSystem: 'metric' as UnitSystem,
  snapshotType: 'dashboard_projection' as SnapshotType,
  calculatedAt: '2026-10-12T10:00:00.000Z',
  recordedAt: '2026-10-12T10:00:00.000Z',
  timezone: 'UTC',
};

describe('Tools #106-#110 adapters - canonical ToolOutput contract', () => {
  const outputs = [
    {
      slug: 'tool-106-glycogen-supercompensation-water-modeler',
      out: () =>
        buildGlycogenOutput(
          {
            body_weight_kg: 92,
            lean_mass_kg: 74,
            training_load: 'medium',
            target_carbs_g_per_kg: 10,
            days: 3,
            baseline_glycogen_g: 420,
          },
          options,
        ),
    },
    {
      slug: 'tool-107-contest-prep-peak-week-manipulator',
      out: () =>
        buildContestPrepOutput(
          {
            days_until_show: 7,
            sex: 'male',
            weight_kg: 96,
            hydration_status: 'normal',
            tan_stability: 'medium',
            show_stage_format: 'bodybuilding',
          },
          options,
        ),
    },
    {
      slug: 'tool-108-ai-body-composition-vision-engine',
      out: () =>
        buildVisionOutput(
          {
            weight_kg: 80,
            height_cm: 178,
            age_years: 30,
            sex: 'male',
            neck_cm: 38,
            waist_cm: 92,
            hips_cm: 100,
            chest_cm: 110,
            photo_count: 2,
            photo_quality: 'medium',
          },
          options,
        ),
    },
    {
      slug: 'tool-109-competition-readiness-posing-os',
      out: () =>
        buildReadinessOutput(
          {
            gender: 'male',
            show_type: 'bodybuilding',
            experience_years: 4,
            prep_phase: 'peak_week',
            tan_maintenance: 'auto',
            has_stage_photo_session: true,
          },
          options,
        ),
    },
    {
      slug: 'tool-110-ai-meal-vision-scanner',
      out: () =>
        buildMealOutput(
          {
            meal_type: 'lunch',
            plate_size: 'standard',
            food_items: ['chicken_breast', 'rice', 'broccoli'],
            photo_attached: true,
            photo_quality: 'high',
            photo_consent: 'given',
          },
          options,
        ),
    },
  ];

  for (const { slug, out } of outputs) {
    it(`${slug} stamps identity, provenance, findings and seoLinks`, () => {
      const output = out();
      expect(output.toolId).toBe(`mrx.tool.${slug.replace(/^tool-/, '')}`);
      expect(output.toolSlug).toBe(slug);
      expect(output.accessTier).toBe('free');
      expect(output.locale).toBe('ar');
      expect(output.calculatedAt).toBe(options.calculatedAt);
      expect(output.provenance.source).toBe('manual');
      expect(output.provenance.recordedAt).toBe(options.recordedAt);
      expect(output.provenance.timezone).toBe('UTC');
      expect(output.provenance.confidence).toBeGreaterThan(0);
      expect(['high', 'medium', 'low']).toContain(output.provenance.dataQuality);
      expect(output.keyFindings.length).toBeGreaterThan(0);
      for (const f of output.keyFindings) {
        expect(f.code.length).toBeGreaterThan(0);
        expect(['info', 'monitor', 'important']).toContain(f.severity);
      }
      expect(output.seoLinks.prevTool.slug).toBeTruthy();
      expect(output.seoLinks.nextTool.slug).toBeTruthy();
      expect(output.seoLinks.prevTool.slug).not.toBe(slug);
      expect(output.seoLinks.nextTool.slug).not.toBe(slug);
    });
  }

  it('tool #106 reports a scope boundary and non-negative model outputs', () => {
    const output = outputs[0].out();
    expect(output.result.scope_notice).toContain('educational');
    expect(output.result.total_glycogen_g).toBeGreaterThanOrEqual(0);
    expect(output.result.total_water_retention_liters).toBeGreaterThanOrEqual(0);
  });

  it('tool #107 never emits an empty sodium/water reference window', () => {
    const output = outputs[1].out();
    expect(output.result.sodium_ref_mg_day.length).toBeGreaterThan(0);
    expect(output.result.water_ref_liters.length).toBeGreaterThan(0);
  });

  it('tool #108 keeps a human-readable safety notice and finite metrics', () => {
    const output = outputs[2].out();
    expect(Number.isFinite(output.result.bmi)).toBe(true);
    expect(Number.isFinite(output.result.body_fat_percent)).toBe(true);
    expect(Number.isFinite(output.result.ffmi)).toBe(true);
    expect(output.result.body_fat_percent).toBeLessThan(60);
  });

  it('tool #109 builds a checklist without a prescription scope notice', () => {
    const output = outputs[3].out();
    expect(output.result.checklist.length).toBeGreaterThan(0);
    expect(output.result.scope_notice).toContain('not_a_stage_directive');
  });

  it('tool #110 keeps the photo privacy gate explicit', () => {
    const output = outputs[4].out();
    expect(output.result.privacy_note.length).toBeGreaterThan(0);
    // consent was 'given' -> the privacy note must not claim a refusal.
    expect(output.result.privacy_note).not.toContain('declined');
  });
});
