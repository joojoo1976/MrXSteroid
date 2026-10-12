import { describe, it, expect } from 'vitest';
import { calcMealEstimate, type MealMealInput } from './tool-110-ai-meal-vision-scanner';

const base: MealMealInput = {
  meal_type: 'lunch',
  plate_size: 'standard',
  food_items: ['chicken_breast', 'rice', 'broccoli'],
  photo_attached: true,
  photo_quality: 'high',
  photo_consent: 'given',
};

describe('Tool #110 - AI Meal Vision Scanner & Portion Estimator', () => {
  it('returns one portion estimate per macro class', () => {
    const r = calcMealEstimate(base);
    expect(r.portion_estimates.map((p) => p.food)).toEqual(['protein', 'carbs', 'fat', 'veggies']);
    for (const p of r.portion_estimates) {
      expect(p.low_g).toBeLessThanOrEqual(p.estimate_g);
      expect(p.high_g).toBeGreaterThanOrEqual(p.estimate_g);
      expect(p.unit).toBe('g');
    }
  });

  it('scales the plate estimate with plate size', () => {
    const small = calcMealEstimate({ ...base, plate_size: 'small' });
    const large = calcMealEstimate({ ...base, plate_size: 'large' });
    expect(small.portion_estimates[0].estimate_g).toBeLessThan(large.portion_estimates[0].estimate_g);
    // standard base 350 g / (3 items + 1) = 87.5 g per class
    expect(calcMealEstimate(base).portion_estimates[0].estimate_g).toBeCloseTo(87.5, 5);
  });

  it('splits the plate estimate across the supplied food items', () => {
    const few = calcMealEstimate({ ...base, food_items: ['rice'] });
    const many = calcMealEstimate({ ...base, food_items: ['rice', 'chicken', 'fish', 'salad', 'oil'] });
    expect(few.portion_estimates[0].estimate_g).toBeGreaterThan(many.portion_estimates[0].estimate_g);
  });

  it('computes total energy from the macro split at 4/4/9 kcal', () => {
    const r = calcMealEstimate(base);
    expect(r.total_energy_kcal).toBeCloseTo(408, 5); // 30*4 + 45*4 + 12*9
    expect(r.energy_range_kcal[0]).toBeCloseTo(208, 5);
    expect(r.energy_range_kcal[1]).toBeCloseTo(608, 5);
  });

  it('widens the uncertainty label only for an attached poor-quality photo', () => {
    expect(calcMealEstimate({ ...base, photo_attached: true, photo_quality: 'poor' }).uncertainty_label)
      .toBe('photo_available_quality_low_estimate_range_widened');
    expect(calcMealEstimate({ ...base, photo_attached: false }).uncertainty_label)
      .toBe('no_image_uploaded_estimate_reference_only');
  });

  it('keeps the privacy note explicit and never claims a refusal on consent', () => {
    const attached = calcMealEstimate({ ...base, photo_attached: true });
    expect(attached.privacy_note).toBe('no_image_pixels_are_sent_to_external_services_without_explicit_consent_and_local_only');
    expect(attached.privacy_note).not.toContain('declined');
    expect(calcMealEstimate({ ...base, photo_attached: false }).privacy_note).toBe('no_image_metadata_collected');
  });

  it('normalises a declined consent into the declined privacy state', () => {
    const r = calcMealEstimate({ ...base, photo_consent: 'declined' });
    expect(r.scope_notice).toBe('educational_reference_estimate_not_a_meal_plan_or_medical_guidance');
    expect(r.education_flags).toContain('image_analysis_is_local_reference_only_without_external_ai_submission');
  });

  it('echoes the meal type and plate class onto the result', () => {
    const r = calcMealEstimate({ ...base, meal_type: 'breakfast', plate_size: 'large' });
    expect(r.meal_type).toBe('breakfast');
    expect(r.plate_class).toBe('large');
  });
});
