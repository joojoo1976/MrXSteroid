/**
 * Tool #108 - AI Body Composition Vision Engine
 * Layer 1: deterministic reference estimator from user-supplied inputs.
 *
 * SCOPE BOUNDARY: the layer consumes a simplified numeric proxy derived
 * from uploaded photography (measurements this client side, no pixels are
 * copied, no machine-learning provider is contacted). It never emits a
 * competitive posing diagnosis, a stage classification, or a training
 * prescription.
 *
 * Model
 * -----
 * Body-fat % is estimated with the Deurenberg formula from BMI x sex x age.
 * FFMI (fat-free mass index) is derived from BF% and height. A visual
 * confidence layer is computed from user-supplied photo quality and count
 * (no external AI). No value here is a diagnosis or a category placement.
 */

export type PhotoQuality = 'poor' | 'medium' | 'high';
export type VisualConfidence = 'low' | 'moderate' | 'high';

export interface VisionInput {
  weight_kg: number;
  height_cm: number;
  age_years: number;
  sex: 'male' | 'female';
  neck_cm: number;
  waist_cm: number;
  hips_cm: number;
  chest_cm: number;
  photo_count: number;
  photo_quality: PhotoQuality;
}

export interface VisionResult {
  bmi: number;
  body_fat_percent: number;
  ffmi: number;
  visual_confidence: VisualConfidence;
  visual_notes: string[];
  education_flags: string[];
  scope_notice: string;
}

const BMI_FACTOR_BY_SEX = { male: 1.2, female: 1.2 } as const;
const AGE_COEFF = 0.23;
const SEX_COEFF = { male: 10.8, female: 0 } as const;
const BMI_INTERCEPT = -5.4;

export function calcDeurenbergBf(bmi: number, age: number, sex: 'male' | 'female'): number {
  const factor = BMI_FACTOR_BY_SEX[sex];
  const sexCoeff = SEX_COEFF[sex];
  return Math.round((factor * bmi + AGE_COEFF * age - sexCoeff - BMI_INTERCEPT) * 100) / 100;
}

export function calcVision(input: VisionInput): VisionResult {
  const { weight_kg, height_cm, age_years, sex, neck_cm, waist_cm, photo_count, photo_quality } = input;

  const bmi = weight_kg / ((height_cm / 100) * (height_cm / 100));
  const bodyFat = calcDeurenbergBf(bmi, age_years, sex);

  const leanMassKg = weight_kg * (1 - bodyFat / 100);
  const ffmi = Math.round((leanMassKg / ((height_cm / 100) * (height_cm / 100))) * 100) / 100;

  let visualConfidence: VisualConfidence = 'low';
  if (photo_count >= 2 && photo_quality === 'high') visualConfidence = 'high';
  else if (photo_count >= 1 || photo_quality === 'medium') visualConfidence = 'moderate';

  const notes: string[] = [];
  if (visualConfidence === 'low') notes.push('limited_photo_metadata_reduced_visual_confidence');
  if (photo_quality === 'poor') notes.push('poor_photo_quality_imaged_assessment');
  if (waist_cm <= 0 || neck_cm <= 0 || height_cm <= 0) notes.push('missing_dimension_values_may_reduce_estimate_reliability');

  return {
    bmi: Math.round(bmi * 100) / 100,
    body_fat_percent: Math.round(bodyFat * 100) / 100,
    ffmi,
    visual_confidence: visualConfidence,
    visual_notes: notes,
    education_flags: [
      'educational_reference_estimator_not_a_clinical_body_composition_measurement',
      'no_image_pixels_are_stored_or_sent_to_external_services_without_explicit_consent',
      'image_analysis_fallback_is_deterministic_reference_math_not_machine_learning',
    ],
    scope_notice: 'educational_body_composition_reference_not_a_diagnosis_or_stage_placement',
  };
}
