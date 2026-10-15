/**
 * lib/tools/engines/tool-111-smart-food-macro-substitution-engine.ts
 * Tool #111 — Smart Food & Macro Substitution Engine
 * (Layer 1 — Pure Calculation Engine)
 *
 * PURE MODULE — no React, no DOM, no Supabase, no Date, no I/O.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Enumerations & Constants
// ─────────────────────────────────────────────────────────────────────────────

export type FoodCategory =
  | 'PROTEIN'
  | 'CARBS'
  | 'FAT'
  | 'DAIRY'
  | 'VEGETABLE'
  | 'FRUIT'
  | 'GRAIN'
  | 'LEGUME'
  | 'NUT_SEED'
  | 'MEAT'
  | 'POULTRY'
  | 'FISH'
  | 'EGG'
  | 'PROCESSED'
  | 'SUPPLEMENT'
  | 'OTHER';

export type DataQuality = 'high' | 'medium' | 'low';
export type DataSource = 'USDA' | 'brand' | 'manufacturer' | 'estimated';
export type Unit = 'g' | 'kg' | 'oz' | 'lb' | 'ml' | 'l' | 'fl_oz' | 'cup' | 'tbsp' | 'tsp' | 'piece' | 'slice';
export type UnitSystem = 'metric' | 'imperial';
export type Locale = 'ar' | 'en';
export type EquivalenceLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'unacceptable';
export type AdherenceLevel = 'on_target' | 'slightly_off' | 'moderately_off' | 'significantly_off';
export type WarningCode = 'HIGH_SODIUM' | 'HIGH_SUGAR' | 'LOW_PROTEIN' | 'HIGH_CALORIE_DIFF' | 'MICRONUTRIENT_GAP' | 'ALLERGEN_RISK' | 'DATA_QUALITY_LOW' | 'MISSING_MACRO_DATA';
export type LimitationCode = 'ESTIMATED_VALUES' | 'NO_MICRONUTRIENT_DATA' | 'SERVING_SIZE_ESTIMATE' | 'BRAND_VARIATION';

// ─────────────────────────────────────────────────────────────────────────────
// Core Data Structures
// ─────────────────────────────────────────────────────────────────────────────

export interface MacroProfile {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  nameEn: string;
  macrosPer100g: MacroProfile;
  servingSize?: number;
  servingUnit?: Unit;
  category: FoodCategory;
  aliases?: string[];
  dataSource: DataSource;
  dataQuality: DataQuality;
  lastUpdated: string;
}

export interface EngineInput {
  originalFood: FoodItem;
  substituteFood: FoodItem;
  originalQuantity: number;
  originalUnit: Unit;
  targetMacros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    calories?: number;
  };
  unitSystem?: UnitSystem;
  locale?: Locale;
}

// ─────────────────────────────────────────────────────────────────────────────
// Unit Conversion System (Canonical = Metric)
// ─────────────────────────────────────────────────────────────────────────────

export const TO_CANONICAL: Record<Unit, number> = {
  g: 1, kg: 1000, oz: 28.349523125, lb: 453.59237,
  ml: 1, l: 1000, fl_oz: 29.5735295625, cup: 236.5882365, tbsp: 14.78676478125, tsp: 4.92892159375,
  piece: 1, slice: 1,
};

export const DISPLAY_PRECISION: Record<UnitSystem, Record<Unit, number>> = {
  metric: { g: 0, kg: 0, oz: 1, lb: 0, ml: 0, l: 1, fl_oz: 1, cup: 1, tbsp: 1, tsp: 1, piece: 0, slice: 0 },
  imperial: { g: 0, kg: 1, oz: 1, lb: 0, ml: 1, l: 1, fl_oz: 1, cup: 2, tbsp: 1, tsp: 1, piece: 0, slice: 0 },
};

export const DEFAULT_DISPLAY_UNIT: Record<UnitSystem, { mass: Unit; volume: Unit; count: Unit }> = {
  metric: { mass: 'g', volume: 'ml', count: 'piece' },
  imperial: { mass: 'oz', volume: 'cup', count: 'piece' },
};

function getUnitType(unit: Unit): 'mass' | 'volume' | 'count' {
  if (['g', 'kg', 'oz', 'lb'].includes(unit)) return 'mass';
  if (['ml', 'l', 'fl_oz', 'cup', 'tbsp', 'tsp'].includes(unit)) return 'volume';
  return 'count';
}

function toCanonical(value: number, unit: Unit): number {
  const factor = TO_CANONICAL[unit];
  if (!factor || !Number.isFinite(value)) return 0;
  return value * factor;
}

function fromCanonical(canonicalValue: number, targetUnit: Unit): number {
  const factor = TO_CANONICAL[targetUnit];
  if (!factor || !Number.isFinite(canonicalValue)) return 0;
  return canonicalValue / factor;
}

export function convertUnit(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit === toUnit) return value;
  if (!Number.isFinite(value)) return 0;
  const canonical = toCanonical(value, fromUnit);
  return fromCanonical(canonical, toUnit);
}

export function formatDisplay(value: number, unit: Unit, system: UnitSystem): string {
  if (!Number.isFinite(value)) return '0';
  const precision = DISPLAY_PRECISION[system]?.[unit] ?? 0;
  const formatted = precision > 0 ? value.toFixed(precision) : Math.round(value).toString();
  return formatted;
}
// ─────────────────────────────────────────────────────────────────────────────
// Safety Helpers
// ─────────────────────────────────────────────────────────────────────────────

const EPSILON = 1e-10;

export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return fallback;
  if (Math.abs(denominator) < EPSILON) return fallback;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : fallback;
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function round1(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

export function round2(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

export function sanitizeNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function sanitizeMacroProfile(profile: Partial<MacroProfile>): MacroProfile {
  return {
    protein: sanitizeNumber(profile.protein),
    carbs: sanitizeNumber(profile.carbs),
    fat: sanitizeNumber(profile.fat),
    calories: sanitizeNumber(profile.calories),
    fiber: profile.fiber !== undefined ? sanitizeNumber(profile.fiber) : undefined,
    sugar: profile.sugar !== undefined ? sanitizeNumber(profile.sugar) : undefined,
    sodium: profile.sodium !== undefined ? sanitizeNumber(profile.sodium) : undefined,
  };
}
// ─────────────────────────────────────────────────────────────────────────────
// Macro Calculations
// ─────────────────────────────────────────────────────────────────────────────

export function calculateCaloriesFromMacros(protein: number, carbs: number, fat: number): number {
  const p = sanitizeNumber(protein);
  const c = sanitizeNumber(carbs);
  const f = sanitizeNumber(fat);
  return round1(p * 4 + c * 4 + f * 9);
}

export function calculateMacrosForQuantity(macrosPer100g: MacroProfile, quantityGrams: number): MacroProfile {
  const q = sanitizeNumber(quantityGrams);
  if (q <= 0) {
    return { protein: 0, carbs: 0, fat: 0, calories: 0 };
  }
  const factor = q / 100;
  const protein = round1(sanitizeNumber(macrosPer100g.protein) * factor);
  const carbs = round1(sanitizeNumber(macrosPer100g.carbs) * factor);
  const fat = round1(sanitizeNumber(macrosPer100g.fat) * factor);
  const calories = calculateCaloriesFromMacros(protein, carbs, fat);
  return {
    protein,
    carbs,
    fat,
    calories,
    fiber: macrosPer100g.fiber !== undefined ? round1(sanitizeNumber(macrosPer100g.fiber) * factor) : undefined,
    sugar: macrosPer100g.sugar !== undefined ? round1(sanitizeNumber(macrosPer100g.sugar) * factor) : undefined,
    sodium: macrosPer100g.sodium !== undefined ? round1(sanitizeNumber(macrosPer100g.sodium) * factor) : undefined,
  };
}
// ─────────────────────────────────────────────────────────────────────────────
// Equivalence Calculations
// ─────────────────────────────────────────────────────────────────────────────

export const EQUIVALENCE_WEIGHTS = { protein: 0.4, carbs: 0.3, fat: 0.3 } as const;

export function calculateMacroEquivalence(
  originalMacros: MacroProfile,
  substituteMacros: MacroProfile,
  originalQuantity: number
): { protein: number; carbs: number; fat: number; calories: number } {
  const targetMacros = calculateMacrosForQuantity(originalMacros, originalQuantity);
  
  const proteinEq = safeDivide(targetMacros.protein, substituteMacros.protein, 0) * 100;
  const carbsEq = safeDivide(targetMacros.carbs, substituteMacros.carbs, 0) * 100;
  const fatEq = safeDivide(targetMacros.fat, substituteMacros.fat, 0) * 100;
  const calEq = safeDivide(targetMacros.calories, substituteMacros.calories, 0) * 100;
  
  return {
    protein: clamp(proteinEq, 0, 10000),
    carbs: clamp(carbsEq, 0, 10000),
    fat: clamp(fatEq, 0, 10000),
    calories: clamp(calEq, 0, 10000),
  };
}

export function calculateEquivalenceScore(
  originalMacros: MacroProfile,
  substituteMacros: MacroProfile,
  originalQuantity: number
): number {
  const equivalences = calculateMacroEquivalence(originalMacros, substituteMacros, originalQuantity);
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  if (substituteMacros.protein > 0 && Number.isFinite(equivalences.protein)) {
    weightedSum += equivalences.protein * EQUIVALENCE_WEIGHTS.protein;
    totalWeight += EQUIVALENCE_WEIGHTS.protein;
  }
  if (substituteMacros.carbs > 0 && Number.isFinite(equivalences.carbs)) {
    weightedSum += equivalences.carbs * EQUIVALENCE_WEIGHTS.carbs;
    totalWeight += EQUIVALENCE_WEIGHTS.carbs;
  }
  if (substituteMacros.fat > 0 && Number.isFinite(equivalences.fat)) {
    weightedSum += equivalences.fat * EQUIVALENCE_WEIGHTS.fat;
    totalWeight += EQUIVALENCE_WEIGHTS.fat;
  }
  
  if (totalWeight === 0) return 0;
  return round1(clamp(weightedSum / totalWeight, 0, 100));
}

export function getEquivalenceLevel(score: number): EquivalenceLevel {
  if (!Number.isFinite(score)) return 'unacceptable';
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'poor';
  return 'unacceptable';
}
// ─────────────────────────────────────────────────────────────────────────────
// Macro Deltas
// ─────────────────────────────────────────────────────────────────────────────

export interface MacroDeltas {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
  caloriesPct: number;
}

export function calculateMacroDeltas(
  originalMacros: MacroProfile,
  substituteMacros: MacroProfile,
  originalQuantity: number,
  substituteQuantity: number
): MacroDeltas {
  const original = calculateMacrosForQuantity(originalMacros, originalQuantity);
  const substitute = calculateMacrosForQuantity(substituteMacros, substituteQuantity);
  
  const protein = round1(substitute.protein - original.protein);
  const carbs = round1(substitute.carbs - original.carbs);
  const fat = round1(substitute.fat - original.fat);
  const calories = round1(substitute.calories - original.calories);
  
  return {
    protein,
    carbs,
    fat,
    calories,
    proteinPct: round1(safeDivide(protein, original.protein, 0) * 100),
    carbsPct: round1(safeDivide(carbs, original.carbs, 0) * 100),
    fatPct: round1(safeDivide(fat, original.fat, 0) * 100),
    caloriesPct: round1(safeDivide(calories, original.calories, 0) * 100),
  };
}
// ─────────────────────────────────────────────────────────────────────────────
// Target Adherence
// ─────────────────────────────────────────────────────────────────────────────

export interface TargetAdherence {
  protein: AdherenceLevel;
  carbs: AdherenceLevel;
  fat: AdherenceLevel;
  calories: AdherenceLevel;
  overall: AdherenceLevel;
}

export const ADHERENCE_THRESHOLDS = { on_target: 5, slightly_off: 15, moderately_off: 30 } as const;

export function getAdherenceLevel(diffPct: number): AdherenceLevel {
  const absDiff = Math.abs(diffPct);
  if (absDiff <= ADHERENCE_THRESHOLDS.on_target) return 'on_target';
  if (absDiff <= ADHERENCE_THRESHOLDS.slightly_off) return 'slightly_off';
  if (absDiff <= ADHERENCE_THRESHOLDS.moderately_off) return 'moderately_off';
  return 'significantly_off';
}

export function calculateTargetAdherence(
  substituteMacros: MacroProfile,
  substituteQuantity: number,
  targetMacros: { protein?: number; carbs?: number; fat?: number; calories?: number }
): TargetAdherence | undefined {
  if (!targetMacros || 
      targetMacros.protein === undefined && 
      targetMacros.carbs === undefined && 
      targetMacros.fat === undefined && 
      targetMacros.calories === undefined) {
    return undefined;
  }
  
  const actual = calculateMacrosForQuantity(substituteMacros, substituteQuantity);
  
  const protein = targetMacros.protein !== undefined 
    ? getAdherenceLevel(safeDivide(actual.protein - targetMacros.protein, targetMacros.protein, 0) * 100)
    : 'on_target';
  const carbs = targetMacros.carbs !== undefined 
    ? getAdherenceLevel(safeDivide(actual.carbs - targetMacros.carbs, targetMacros.carbs, 0) * 100)
    : 'on_target';
  const fat = targetMacros.fat !== undefined 
    ? getAdherenceLevel(safeDivide(actual.fat - targetMacros.fat, targetMacros.fat, 0) * 100)
    : 'on_target';
  const calories = targetMacros.calories !== undefined 
    ? getAdherenceLevel(safeDivide(actual.calories - targetMacros.calories, targetMacros.calories, 0) * 100)
    : 'on_target';
  
  const levels = [protein, carbs, fat, calories].filter(l => l !== 'on_target');
  let overall: AdherenceLevel = 'on_target';
  if (levels.includes('significantly_off')) overall = 'significantly_off';
  else if (levels.includes('moderately_off')) overall = 'moderately_off';
  else if (levels.includes('slightly_off')) overall = 'slightly_off';
  
  return { protein, carbs, fat, calories, overall };
}
// ─────────────────────────────────────────────────────────────────────────────
// Substitute Quantity Calculation
// ─────────────────────────────────────────────────────────────────────────────

export function calculateSubstituteQuantity(
  originalMacros: MacroProfile,
  substituteMacros: MacroProfile,
  originalQuantity: number
): number {
  const targetMacros = calculateMacrosForQuantity(originalMacros, originalQuantity);
  
  const quantities: number[] = [];
  const weights: number[] = [];
  
  if (substituteMacros.protein > 0) {
    quantities.push(safeDivide(targetMacros.protein * 100, substituteMacros.protein));
    weights.push(EQUIVALENCE_WEIGHTS.protein);
  }
  if (substituteMacros.carbs > 0) {
    quantities.push(safeDivide(targetMacros.carbs * 100, substituteMacros.carbs));
    weights.push(EQUIVALENCE_WEIGHTS.carbs);
  }
  if (substituteMacros.fat > 0) {
    quantities.push(safeDivide(targetMacros.fat * 100, substituteMacros.fat));
    weights.push(EQUIVALENCE_WEIGHTS.fat);
  }
  
  if (quantities.length === 0) return originalQuantity;
  
  let weightedSum = 0;
  let totalWeight = 0;
  for (let i = 0; i < quantities.length; i++) {
    if (Number.isFinite(quantities[i]) && quantities[i] > 0) {
      weightedSum += quantities[i] * weights[i];
      totalWeight += weights[i];
    }
  }
  
  if (totalWeight === 0) return originalQuantity;
  return round1(clamp(weightedSum / totalWeight, 0.001, 10000));
}

export function calculateEquivalenceRatio(originalQty: number, substituteQty: number): number {
  return safeDivide(substituteQty, originalQty, 1);
}
// ─────────────────────────────────────────────────────────────────────────────
// Warnings & Limitations
// ─────────────────────────────────────────────────────────────────────────────

export interface Warning {
  code: WarningCode;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface Limitation {
  code: LimitationCode;
  message: string;
}

export function generateWarnings(
  originalFood: FoodItem,
  substituteFood: FoodItem,
  deltas: MacroDeltas,
  equivalenceScore: number
): Warning[] {
  const warnings: Warning[] = [];
  
  if (substituteFood.macrosPer100g.sodium !== undefined && substituteFood.macrosPer100g.sodium > 400) {
    warnings.push({
      code: 'HIGH_SODIUM',
      message: `Substitute has high sodium (${substituteFood.macrosPer100g.sodium}mg/100g)`,
      severity: 'warning',
    });
  }
  
  if (substituteFood.macrosPer100g.sugar !== undefined && substituteFood.macrosPer100g.sugar > 15) {
    warnings.push({
      code: 'HIGH_SUGAR',
      message: `Substitute has high sugar (${substituteFood.macrosPer100g.sugar}g/100g)`,
      severity: 'warning',
    });
  }
  
  if (substituteFood.macrosPer100g.protein < 5) {
    warnings.push({
      code: 'LOW_PROTEIN',
      message: `Substitute is low in protein (${substituteFood.macrosPer100g.protein}g/100g)`,
      severity: 'info',
    });
  }
  
  if (Math.abs(deltas.caloriesPct) > 25) {
    warnings.push({
      code: 'HIGH_CALORIE_DIFF',
      message: `Calorie difference exceeds 25% (${deltas.caloriesPct > 0 ? '+' : ''}${deltas.caloriesPct}%)`,
      severity: 'warning',
    });
  }
  
  if (substituteFood.dataQuality === 'low' || originalFood.dataQuality === 'low') {
    warnings.push({
      code: 'DATA_QUALITY_LOW',
      message: 'One or both foods have low data quality - results are estimates',
      severity: 'warning',
    });
  }
  
  if (equivalenceScore < 40) {
    warnings.push({
      code: 'MICRONUTRIENT_GAP',
      message: 'Low equivalence score - significant macro mismatch',
      severity: 'warning',
    });
  }
  
  return warnings;
}

export function generateLimitations(
  originalFood: FoodItem,
  substituteFood: FoodItem
): Limitation[] {
  const limitations: Limitation[] = [];
  
  if (originalFood.dataQuality !== 'high' || substituteFood.dataQuality !== 'high') {
    limitations.push({
      code: 'ESTIMATED_VALUES',
      message: 'Values are based on estimated or averaged data',
    });
  }
  
  limitations.push({
    code: 'NO_MICRONUTRIENT_DATA',
    message: 'Micronutrient comparison not available',
  });
  
  if (!originalFood.servingSize || !substituteFood.servingSize) {
    limitations.push({
      code: 'SERVING_SIZE_ESTIMATE',
      message: 'Serving sizes may vary from actual portions',
    });
  }
  
  limitations.push({
    code: 'BRAND_VARIATION',
    message: 'Nutritional values may vary between brands and preparations',
  });
  
  return limitations;
}
// ─────────────────────────────────────────────────────────────────────────────
// Main Engine Function
// ─────────────────────────────────────────────────────────────────────────────

export interface ResultMetadata {
  calculationTimestamp: string;
  engineVersion: string;
  dataSources: DataSource[];
  calculationTimeMs: number;
  unitSystem: UnitSystem;
  locale: Locale;
}

export interface SubstitutionResult {
  substituteQuantity: number;
  substituteUnit: Unit;
  equivalenceRatio: number;
  originalMacros: MacroProfile;
  substituteMacros: MacroProfile;
  macroDeltas: MacroDeltas;
  equivalenceScore: number;
  equivalenceLevel: EquivalenceLevel;
  calorieDifference: number;
  proteinDifference: number;
  carbsDifference: number;
  fatDifference: number;
  targetAdherence?: TargetAdherence;
  warnings: Warning[];
  limitations: Limitation[];
  metadata: ResultMetadata;
}

export const ENGINE_VERSION = '1.0.0';
export const ATWATER = { protein: 4, carbs: 4, fat: 9 } as const;
export const EQUIVALENCE_THRESHOLDS = { excellent: 90, good: 75, fair: 60, poor: 40 } as const;

/**
 * Main engine function - computes substitution result
 * PURE FUNCTION - no side effects, deterministic
 */
export function computeSubstitution(input: EngineInput): SubstitutionResult {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  
  const originalFood = input.originalFood;
  const substituteFood = input.substituteFood;
  const originalQuantity = sanitizeNumber(input.originalQuantity);
  const originalUnit = input.originalUnit;
  const unitSystem = input.unitSystem ?? 'metric';
  const locale = input.locale ?? 'en';
  
  // Convert original quantity to canonical (grams/ml)
  const originalQtyCanonical = convertUnit(originalQuantity, originalUnit, 'g');
  
  // Calculate macros for original quantity
  const originalMacros = calculateMacrosForQuantity(originalFood.macrosPer100g, originalQtyCanonical);
  const substituteMacros = substituteFood.macrosPer100g;
  
  // Calculate substitute quantity to match macros
  const substituteQtyCanonical = calculateSubstituteQuantity(
    originalFood.macrosPer100g,
    substituteMacros,
    originalQtyCanonical
  );
  
  // Convert back to original unit for display
  const substituteQuantity = convertUnit(substituteQtyCanonical, 'g', originalUnit);
  
  // Calculate equivalence
  const equivalenceScore = calculateEquivalenceScore(
    originalFood.macrosPer100g,
    substituteMacros,
    originalQtyCanonical
  );
  const equivalenceLevel = getEquivalenceLevel(equivalenceScore);
  
  // Calculate macro deltas
  const macroDeltas = calculateMacroDeltas(
    originalFood.macrosPer100g,
    substituteMacros,
    originalQtyCanonical,
    substituteQtyCanonical
  );
  
  // Calculate target adherence if targets provided
  const targetAdherence = input.targetMacros 
    ? calculateTargetAdherence(substituteMacros, substituteQtyCanonical, input.targetMacros)
    : undefined;
  
  // Calculate equivalence ratio
  const equivalenceRatio = calculateEquivalenceRatio(originalQtyCanonical, substituteQtyCanonical);
  
  // Generate warnings and limitations
  const warnings = generateWarnings(originalFood, substituteFood, macroDeltas, equivalenceScore);
  const limitations = generateLimitations(originalFood, substituteFood);
  
  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  
  const metadata: ResultMetadata = {
    calculationTimestamp: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
    dataSources: [originalFood.dataSource, substituteFood.dataSource],
    calculationTimeMs: round1(endTime - startTime),
    unitSystem,
    locale,
  };
  
  return {
    substituteQuantity: round1(substituteQuantity),
    substituteUnit: originalUnit,
    equivalenceRatio: round2(equivalenceRatio),
    originalMacros,
    substituteMacros: calculateMacrosForQuantity(substituteMacros, substituteQtyCanonical),
    macroDeltas,
    equivalenceScore,
    equivalenceLevel,
    calorieDifference: macroDeltas.calories,
    proteinDifference: macroDeltas.protein,
    carbsDifference: macroDeltas.carbs,
    fatDifference: macroDeltas.fat,
    targetAdherence,
    warnings,
    limitations,
    metadata,
  };
}