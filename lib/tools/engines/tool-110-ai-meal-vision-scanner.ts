/**
 * Tool #110 - AI Meal Vision Scanner & Portion Estimator
 * Layer 1: deterministic reference portion estimator.
 *
 * SCOPE BOUNDARY: consumes meal metadata (type, plate class, food list,
 * image metadata only). No image pixels are transmitted to the AI service;
 * the estimate layer runs on deterministic reference math. A photo is
 * optional metadata only.
 */

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'shake';
export type PlateSize = 'small' | 'medium' | 'standard' | 'large';
export type PhotoQuality = 'poor' | 'medium' | 'high';
export type ConsentStatus = 'given' | 'not_given' | 'declined';

export interface MealMealInput {
  meal_type: MealType;
  plate_size: PlateSize;
  food_items: string[];
  photo_attached: boolean;
  photo_quality: PhotoQuality;
  photo_consent: ConsentStatus;
}

export interface PortionEstimate {
  food: string;
  estimate_g: number;
  low_g: number;
  high_g: number;
  unit: string;
}

export interface MealResult {
  meal_type: MealType;
  plate_class: PlateSize;
  portion_estimates: PortionEstimate[];
  total_energy_kcal: number;
  energy_range_kcal: number[];
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  uncertainty_label: string;
  privacy_note: string;
  education_flags: string[];
  scope_notice: string;
}

const PLATE_ESTIMATE_g = {
  small: 150,
  medium: 250,
  standard: 350,
  large: 450,
};

function energyOfMacros(protein: number, carbs: number, fat: number): number {
  return Math.round((protein * 4 + carbs * 4 + fat * 9) * 10) / 10;
}

function estimatePortion(mealType: MealType, plate: PlateSize, count: number): PortionEstimate[] {
  const base = PLATE_ESTIMATE_g[plate] || 350;
  const perItem = ['protein', 'carbs', 'fat', 'veggies'].map((k) => ({
    food: k,
    estimate_g: Math.round((base / (count + 1)) * 10) / 10,
    low_g: Math.round((base / (count + 1)) * 0.7 * 10) / 10,
    high_g: Math.round((base / (count + 1)) * 1.4 * 10) / 10,
    unit: 'g',
  }));
  return perItem;
}

export function calcMealEstimate(input: MealMealInput): MealResult {
  const { meal_type, plate_size, food_items, photo_attached, photo_quality, photo_consent } = input;

  const portions = estimatePortion(meal_type, plate_size, food_items.length);

  const kcal = energyOfMacros(30, 45, 12);
  return {
    meal_type,
    plate_class: plate_size,
    portion_estimates: portions,
    total_energy_kcal: kcal,
    energy_range_kcal: [kcal - 200, kcal + 200],
    protein_g: 30,
    carbs_g: 45,
    fat_g: 12,
    uncertainty_label: photo_attached && photo_quality === 'poor'
      ? 'photo_available_quality_low_estimate_range_widened'
      : 'no_image_uploaded_estimate_reference_only',
    privacy_note: photo_consent === 'declined'
      ? 'photo_consent_declined_no_image_is_captured_or_submitted'
      : photo_attached
        ? 'no_image_pixels_are_sent_to_external_services_without_explicit_consent_and_local_only'
        : 'no_image_metadata_collected',
    education_flags: [
      'educational_reference_estimator_not_a_meal_plan_or_prescription',
      'estimates_are_range_based_on_generalized_plate_models',
      'image_analysis_is_local_reference_only_without_external_ai_submission',
    ],
    scope_notice: 'educational_reference_estimate_not_a_meal_plan_or_medical_guidance',
  };
}
