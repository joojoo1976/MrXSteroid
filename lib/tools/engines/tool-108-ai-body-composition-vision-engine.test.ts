import { describe, it, expect } from 'vitest';
import { calcDeurenbergBf, calcVision, type VisionInput } from './tool-108-ai-body-composition-vision-engine';

const base: VisionInput = {
  weight_kg: 80,
  height_cm: 178,
  age_years: 30,
  sex: 'male',
  neck_cm: 38,
  waist_cm: 92,
  hips_cm: 100,
  chest_cm: 110,
  photo_count: 2,
  photo_quality: 'high',
};

describe('Tool #108 - AI Body Composition Vision Engine', () => {
  it('computes BMI from weight and height', () => {
    const r = calcVision(base);
    expect(r.bmi).toBeCloseTo(25.25, 2); // 80 / 1.78^2
    expect(Number.isFinite(r.bmi)).toBe(true);
  });

  it('applies the Deurenberg body-fat formula', () => {
    // 1.2 * 25.2516 + 0.23 * 30 - 10.8 + 5.4 = 31.80
    expect(calcDeurenbergBf(25.2516, 30, 'male')).toBeCloseTo(31.8, 2);
    // Female carries no sex coefficient.
    // 1.2 * 25.2516 + 0.23 * 30 - 0 + 5.4 = 42.60
    expect(calcDeurenbergBf(25.2516, 30, 'female')).toBeCloseTo(42.6, 2);
    // Higher age raises the estimate at a fixed BMI.
    expect(calcDeurenbergBf(25, 50, 'male')).toBeGreaterThan(calcDeurenbergBf(25, 20, 'male'));
  });

  it('derives FFMI from lean mass and height', () => {
    const r = calcVision(base);
    const lean = 80 * (1 - r.body_fat_percent / 100);
    expect(r.ffmi).toBeCloseTo(lean / (1.78 * 1.78), 1);
    expect(r.ffmi).toBeGreaterThan(0);
  });

  it('raises visual confidence with more and better photos', () => {
    expect(calcVision(base).visual_confidence).toBe('high'); // 2 photos + high quality
    expect(calcVision({ ...base, photo_quality: 'medium' }).visual_confidence).toBe('moderate');
    expect(calcVision({ ...base, photo_count: 0, photo_quality: 'poor' }).visual_confidence).toBe('low');
  });

  it('notes reduced reliability for poor photo metadata', () => {
    const r = calcVision({ ...base, photo_count: 0, photo_quality: 'poor' });
    expect(r.visual_notes).toContain('limited_photo_metadata_reduced_visual_confidence');
    expect(r.visual_notes).toContain('poor_photo_quality_imaged_assessment');
  });

  it('flags missing dimension values rather than silently dropping them', () => {
    const r = calcVision({ ...base, waist_cm: 0 });
    expect(r.visual_notes).toContain('missing_dimension_values_may_reduce_estimate_reliability');
  });

  it('never presents the output as a diagnosis or stage placement', () => {
    const r = calcVision(base);
    expect(r.scope_notice).toBe('educational_body_composition_reference_not_a_diagnosis_or_stage_placement');
    expect(r.education_flags).toContain('no_image_pixels_are_stored_or_sent_to_external_services_without_explicit_consent');
  });
});
