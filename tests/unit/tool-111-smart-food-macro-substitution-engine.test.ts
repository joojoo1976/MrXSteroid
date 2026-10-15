/**
 * tests/unit/tool-111-smart-food-macro-substitution-engine.test.ts
 * Tool #111 — Smart Food & Macro Substitution Engine Tests
 * Uses Vitest native API (describe / it / expect)
 */

import { describe, it, expect } from 'vitest';
import {
  computeSubstitution,
  calculateCaloriesFromMacros,
  calculateMacrosForQuantity,
  calculateMacroEquivalence,
  calculateEquivalenceScore,
  getEquivalenceLevel,
  calculateMacroDeltas,
  calculateTargetAdherence,
  getAdherenceLevel,
  calculateSubstituteQuantity,
  calculateEquivalenceRatio,
  generateWarnings,
  generateLimitations,
  convertUnit,
  formatDisplay,
  safeDivide,
  clamp,
  round1,
  round2,
  sanitizeNumber,
  sanitizeMacroProfile,
  TO_CANONICAL,
  ENGINE_VERSION,
  ATWATER,
  EQUIVALENCE_THRESHOLDS,
  ADHERENCE_THRESHOLDS,
  EQUIVALENCE_WEIGHTS,
} from '../../lib/tools/engines/tool-111-smart-food-macro-substitution-engine';

import type {
  FoodItem,
  EngineInput,
  Unit,
  UnitSystem,
  Locale,
  FoodCategory,
  DataSource,
  DataQuality,
  EquivalenceLevel,
  AdherenceLevel,
  WarningCode,
  LimitationCode,
} from '../../lib/tools/engines/tool-111-smart-food-macro-substitution-engine';

// ─────────────────────────────────────────────────────────────────────────────
// Test Utilities
// ─────────────────────────────────────────────────────────────────────────────

function createFoodItem(overrides: Partial<FoodItem> = {}): FoodItem {
  return {
    id: 'test-food',
    name: 'Test Food',
    nameEn: 'Test Food',
    macrosPer100g: { protein: 20, carbs: 10, fat: 5, calories: 165 },
    servingSize: 100,
    servingUnit: 'g',
    category: 'PROTEIN',
    dataSource: 'USDA',
    dataQuality: 'high',
    lastUpdated: '2024-01-01',
    ...overrides,
  };
}

function createEngineInput(overrides: Partial<EngineInput> = {}): EngineInput {
  return {
    originalFood: createFoodItem({ id: 'original', macrosPer100g: { protein: 20, carbs: 10, fat: 5, calories: 165 } }),
    substituteFood: createFoodItem({ id: 'substitute', macrosPer100g: { protein: 25, carbs: 5, fat: 3, calories: 151 } }),
    originalQuantity: 100,
    originalUnit: 'g',
    unitSystem: 'metric',
    locale: 'en',
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Safety Helpers Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Safety Helpers', () => {
  it('safeDivide - normal division', () => {
    expect(safeDivide(10, 2)).toBe(5);
  });

  it('safeDivide - division by zero returns fallback', () => {
    expect(safeDivide(10, 0, 99)).toBe(99);
  });

  it('safeDivide - division by near zero returns fallback', () => {
    expect(safeDivide(10, 1e-11, 99)).toBe(99);
  });

  it('safeDivide - NaN numerator returns fallback', () => {
    expect(safeDivide(NaN, 2, 99)).toBe(99);
  });

  it('safeDivide - Infinity numerator returns fallback', () => {
    expect(safeDivide(Infinity, 2, 99)).toBe(99);
  });

  it('safeDivide - -Infinity denominator returns fallback', () => {
    expect(safeDivide(10, -Infinity, 99)).toBe(99);
  });

  it('safeDivide - default fallback is 0', () => {
    expect(safeDivide(10, 0)).toBe(0);
  });

  it('clamp - within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamp - below min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamp - above max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('clamp - NaN returns min', () => {
    expect(clamp(NaN, 0, 10)).toBe(0);
  });

  it('clamp - Infinity returns min (not finite)', () => {
    expect(clamp(Infinity, 0, 10)).toBe(0);
  });

  it('round1 - normal rounding', () => {
    expect(round1(1.23)).toBe(1.2);
    expect(round1(1.25)).toBe(1.3);
  });

  it('round1 - NaN returns 0', () => {
    expect(round1(NaN)).toBe(0);
  });

  it('round1 - Infinity returns 0', () => {
    expect(round1(Infinity)).toBe(0);
  });

  it('round2 - normal rounding', () => {
    expect(round2(1.234)).toBe(1.23);
    expect(round2(1.235)).toBe(1.24);
  });

  it('sanitizeNumber - valid number', () => {
    expect(sanitizeNumber(5)).toBe(5);
    expect(sanitizeNumber('5' as unknown as number)).toBe(5);
  });

  it('sanitizeNumber - invalid returns fallback', () => {
    expect(sanitizeNumber(null as unknown as number, 99)).toBe(99);
    expect(sanitizeNumber(undefined as unknown as number, 99)).toBe(99);
    expect(sanitizeNumber(NaN, 99)).toBe(99);
    expect(sanitizeNumber(Infinity, 99)).toBe(99);
  });

  it('sanitizeMacroProfile - complete profile', () => {
    const result = sanitizeMacroProfile({ protein: 10, carbs: 20, fat: 5, calories: 165 });
    expect(result).toEqual({ protein: 10, carbs: 20, fat: 5, calories: 165 });
  });

  it('sanitizeMacroProfile - partial profile', () => {
    const result = sanitizeMacroProfile({ protein: 10 });
    expect(result).toEqual({ protein: 10, carbs: 0, fat: 0, calories: 0 });
  });

  it('sanitizeMacroProfile - undefined optional fields remain undefined', () => {
    const result = sanitizeMacroProfile({ protein: 10, carbs: 20, fat: 5, calories: 165, fiber: undefined });
    expect(result.fiber).toBeUndefined();
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// Macro Calculations Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Macro Calculations', () => {
  it('calculateCaloriesFromMacros - standard Atwater factors', () => {
    // 20g protein * 4 + 10g carbs * 4 + 5g fat * 9 = 80 + 40 + 45 = 165
    expect(calculateCaloriesFromMacros(20, 10, 5)).toBe(165);
  });

  it('calculateCaloriesFromMacros - zero macros', () => {
    expect(calculateCaloriesFromMacros(0, 0, 0)).toBe(0);
  });

  it('calculateCaloriesFromMacros - only protein', () => {
    expect(calculateCaloriesFromMacros(10, 0, 0)).toBe(40);
  });

  it('calculateCaloriesFromMacros - handles NaN (treated as 0)', () => {
    // NaN protein becomes 0 via sanitizeNumber
    expect(calculateCaloriesFromMacros(NaN, 10, 5)).toBe(85);
  });

  it('calculateCaloriesFromMacros - handles Infinity (treated as 0)', () => {
    expect(calculateCaloriesFromMacros(Infinity, 10, 5)).toBe(85);
  });

  it('calculateMacrosForQuantity - 100g (identity)', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165, fiber: 2, sugar: 3, sodium: 100 };
    const result = calculateMacrosForQuantity(macros, 100);
    expect(result).toEqual({ protein: 20, carbs: 10, fat: 5, calories: 165, fiber: 2, sugar: 3, sodium: 100 });
  });

  it('calculateMacrosForQuantity - 50g (half)', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const result = calculateMacrosForQuantity(macros, 50);
    expect(result).toEqual({ protein: 10, carbs: 5, fat: 2.5, calories: 82.5 });
  });

  it('calculateMacrosForQuantity - 200g (double)', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const result = calculateMacrosForQuantity(macros, 200);
    expect(result).toEqual({ protein: 40, carbs: 20, fat: 10, calories: 330 });
  });

  it('calculateMacrosForQuantity - zero quantity returns zeros', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    expect(calculateMacrosForQuantity(macros, 0)).toEqual({ protein: 0, carbs: 0, fat: 0, calories: 0 });
  });

  it('calculateMacrosForQuantity - negative quantity returns zeros', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    expect(calculateMacrosForQuantity(macros, -50)).toEqual({ protein: 0, carbs: 0, fat: 0, calories: 0 });
  });

  it('calculateMacrosForQuantity - NaN quantity returns zeros', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    expect(calculateMacrosForQuantity(macros, NaN)).toEqual({ protein: 0, carbs: 0, fat: 0, calories: 0 });
  });

  it('calculateMacrosForQuantity - optional fields scaled', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165, fiber: 3, sugar: 2, sodium: 50 };
    const result = calculateMacrosForQuantity(macros, 50);
    expect(result.fiber).toBeCloseTo(1.5, 1);
    expect(result.sugar).toBeCloseTo(1, 1);
    expect(result.sodium).toBeCloseTo(25, 1);
  });

  it('calculateMacrosForQuantity - missing optional fields remain undefined', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const result = calculateMacrosForQuantity(macros, 50);
    expect(result.fiber).toBeUndefined();
    expect(result.sugar).toBeUndefined();
    expect(result.sodium).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Equivalence Calculations Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Equivalence Calculations', () => {
  it('calculateMacroEquivalence - identical foods = 100% for all', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const result = calculateMacroEquivalence(macros, macros, 100);
    expect(result).toEqual({ protein: 100, carbs: 100, fat: 100, calories: 100 });
  });

  it('calculateMacroEquivalence - substitute has double protein', () => {
    const original = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const substitute = { protein: 40, carbs: 10, fat: 5, calories: 205 };
    const result = calculateMacroEquivalence(original, substitute, 100);
    expect(result.protein).toBe(50);
    expect(result.carbs).toBe(100);
    expect(result.fat).toBe(100);
  });

  it('calculateMacroEquivalence - substitute has half macros', () => {
    const original = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const substitute = { protein: 10, carbs: 5, fat: 2.5, calories: 82.5 };
    const result = calculateMacroEquivalence(original, substitute, 100);
    expect(result.protein).toBe(200);
    expect(result.carbs).toBe(200);
    expect(result.fat).toBe(200);
  });

  it('calculateMacroEquivalence - zero substitute macro returns 0', () => {
    const original = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const substitute = { protein: 0, carbs: 10, fat: 5, calories: 75 };
    const result = calculateMacroEquivalence(original, substitute, 100);
    expect(result.protein).toBe(0);
    expect(result.carbs).toBe(100);
    expect(result.fat).toBe(100);
  });

  it('calculateEquivalenceScore - identical foods = 100', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const score = calculateEquivalenceScore(macros, macros, 100);
    expect(score).toBe(100);
  });

  it('calculateEquivalenceScore - double macros in substitute = 50', () => {
    const original = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const substitute = { protein: 40, carbs: 20, fat: 10, calories: 330 };
    const score = calculateEquivalenceScore(original, substitute, 100);
    expect(score).toBeCloseTo(50, 0);
  });

  it('calculateEquivalenceScore - zero substitute macros = 0', () => {
    const original = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const substitute = { protein: 0, carbs: 0, fat: 0, calories: 0 };
    expect(calculateEquivalenceScore(original, substitute, 100)).toBe(0);
  });

  it('calculateEquivalenceScore - only protein in substitute = 100 (weighted)', () => {
    const original = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const substitute = { protein: 20, carbs: 0, fat: 0, calories: 80 };
    expect(calculateEquivalenceScore(original, substitute, 100)).toBe(100);
  });

  it('calculateEquivalenceScore - NaN handling', () => {
    const original = { protein: NaN, carbs: 10, fat: 5, calories: 165 };
    const substitute = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const score = calculateEquivalenceScore(original, substitute, 100);
    expect(Number.isFinite(score)).toBe(true);
  });

  it('getEquivalenceLevel - thresholds', () => {
    expect(getEquivalenceLevel(95)).toBe('excellent');
    expect(getEquivalenceLevel(90)).toBe('excellent');
    expect(getEquivalenceLevel(85)).toBe('good');
    expect(getEquivalenceLevel(75)).toBe('good');
    expect(getEquivalenceLevel(70)).toBe('fair');
    expect(getEquivalenceLevel(60)).toBe('fair');
    expect(getEquivalenceLevel(50)).toBe('poor');
    expect(getEquivalenceLevel(40)).toBe('poor');
    expect(getEquivalenceLevel(30)).toBe('unacceptable');
    expect(getEquivalenceLevel(0)).toBe('unacceptable');
  });

  it('getEquivalenceLevel - NaN returns unacceptable', () => {
    expect(getEquivalenceLevel(NaN)).toBe('unacceptable');
  });

  it('getEquivalenceLevel - Infinity returns unacceptable', () => {
    expect(getEquivalenceLevel(Infinity)).toBe('unacceptable');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Macro Deltas Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Macro Deltas', () => {
  it('calculateMacroDeltas - identical foods = zero deltas', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const deltas = calculateMacroDeltas(macros, macros, 100, 100);
    expect(deltas.protein).toBe(0);
    expect(deltas.carbs).toBe(0);
    expect(deltas.fat).toBe(0);
    expect(deltas.calories).toBe(0);
    expect(deltas.proteinPct).toBe(0);
    expect(deltas.carbsPct).toBe(0);
    expect(deltas.fatPct).toBe(0);
    expect(deltas.caloriesPct).toBe(0);
  });

  it('calculateMacroDeltas - substitute has more protein', () => {
    const original = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const substitute = { protein: 30, carbs: 10, fat: 5, calories: 205 };
    const deltas = calculateMacroDeltas(original, substitute, 100, 100);
    expect(deltas.protein).toBe(10);
    expect(deltas.proteinPct).toBe(50);
  });

  it('calculateMacroDeltas - substitute has less protein', () => {
    const original = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const substitute = { protein: 10, carbs: 10, fat: 5, calories: 125 };
    const deltas = calculateMacroDeltas(original, substitute, 100, 100);
    expect(deltas.protein).toBe(-10);
    expect(deltas.proteinPct).toBe(-50);
  });

  it('calculateMacroDeltas - zero original macro = 0% (safeDivide)', () => {
    const original = { protein: 0, carbs: 10, fat: 5, calories: 75 };
    const substitute = { protein: 10, carbs: 10, fat: 5, calories: 115 };
    const deltas = calculateMacroDeltas(original, substitute, 100, 100);
    expect(deltas.protein).toBe(10);
    expect(deltas.proteinPct).toBe(0);
  });

  it('calculateMacroDeltas - different quantities', () => {
    const original = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const substitute = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const deltas = calculateMacroDeltas(original, substitute, 100, 200);
    expect(deltas.protein).toBe(20);
    expect(deltas.calories).toBe(165);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Target Adherence Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Target Adherence', () => {
  it('getAdherenceLevel - on_target within 5%', () => {
    expect(getAdherenceLevel(0)).toBe('on_target');
    expect(getAdherenceLevel(2)).toBe('on_target');
    expect(getAdherenceLevel(5)).toBe('on_target');
    expect(getAdherenceLevel(-5)).toBe('on_target');
  });

  it('getAdherenceLevel - slightly_off 5-15%', () => {
    expect(getAdherenceLevel(6)).toBe('slightly_off');
    expect(getAdherenceLevel(10)).toBe('slightly_off');
    expect(getAdherenceLevel(15)).toBe('slightly_off');
    expect(getAdherenceLevel(-10)).toBe('slightly_off');
  });

  it('getAdherenceLevel - moderately_off 15-30%', () => {
    expect(getAdherenceLevel(16)).toBe('moderately_off');
    expect(getAdherenceLevel(25)).toBe('moderately_off');
    expect(getAdherenceLevel(30)).toBe('moderately_off');
  });

  it('getAdherenceLevel - significantly_off >30%', () => {
    expect(getAdherenceLevel(31)).toBe('significantly_off');
    expect(getAdherenceLevel(50)).toBe('significantly_off');
    expect(getAdherenceLevel(-50)).toBe('significantly_off');
  });

  it('calculateTargetAdherence - undefined targets returns undefined', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    expect(calculateTargetAdherence(macros, 100, undefined)).toBeUndefined();
  });

  it('calculateTargetAdherence - empty targets returns undefined', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    expect(calculateTargetAdherence(macros, 100, {})).toBeUndefined();
  });

  it('calculateTargetAdherence - exact match = on_target', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const targets = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const result = calculateTargetAdherence(macros, 100, targets);
    expect(result).toBeDefined();
    expect(result!.protein).toBe('on_target');
    expect(result!.carbs).toBe('on_target');
    expect(result!.fat).toBe('on_target');
    expect(result!.calories).toBe('on_target');
    expect(result!.overall).toBe('on_target');
  });

  it('calculateTargetAdherence - slight deviation = slightly_off', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const targets = { protein: 19, carbs: 10, fat: 5, calories: 165 };
    const result = calculateTargetAdherence(macros, 100, targets);
    expect(result!.protein).toBe('slightly_off');
    expect(result!.overall).toBe('slightly_off');
  });

  it('calculateTargetAdherence - partial targets (only protein specified)', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const result = calculateTargetAdherence(macros, 100, { protein: 20 });
    expect(result!.protein).toBe('on_target');
    expect(result!.carbs).toBe('on_target');
    expect(result!.fat).toBe('on_target');
    expect(result!.calories).toBe('on_target');
  });

  it('calculateTargetAdherence - overall picks worst level', () => {
    const macros = { protein: 30, carbs: 10, fat: 5, calories: 165 };
    const targets = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const result = calculateTargetAdherence(macros, 100, targets);
    expect(result!.protein).toBe('significantly_off');
    expect(result!.overall).toBe('significantly_off');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Substitute Quantity & Equivalence Ratio Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Substitute Quantity & Equivalence Ratio', () => {
  it('calculateSubstituteQuantity - identical foods = same quantity', () => {
    const macros = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    expect(calculateSubstituteQuantity(macros, macros, 100)).toBe(100);
  });

  it('calculateSubstituteQuantity - double macros in substitute = half quantity', () => {
    const original = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const substitute = { protein: 40, carbs: 20, fat: 10, calories: 330 };
    expect(calculateSubstituteQuantity(original, substitute, 100)).toBeCloseTo(50, 0);
  });

  it('calculateSubstituteQuantity - half macros in substitute = double quantity', () => {
    const original = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const substitute = { protein: 10, carbs: 5, fat: 2.5, calories: 82.5 };
    expect(calculateSubstituteQuantity(original, substitute, 100)).toBeCloseTo(200, 0);
  });

  it('calculateSubstituteQuantity - zero substitute macros returns original', () => {
    const original = { protein: 20, carbs: 10, fat: 5, calories: 165 };
    const substitute = { protein: 0, carbs: 0, fat: 0, calories: 0 };
    expect(calculateSubstituteQuantity(original, substitute, 100)).toBe(100);
  });

  it('calculateSubstituteQuantity - clamped to minimum 0.001', () => {
    const original = { protein: 0.1, carbs: 0.1, fat: 0.1, calories: 1 };
    const substitute = { protein: 100, carbs: 100, fat: 100, calories: 1300 };
    expect(calculateSubstituteQuantity(original, substitute, 100)).toBeGreaterThanOrEqual(0.001);
  });

  it('calculateSubstituteQuantity - clamped to maximum 10000', () => {
    const original = { protein: 100, carbs: 100, fat: 100, calories: 1300 };
    const substitute = { protein: 0.1, carbs: 0.1, fat: 0.1, calories: 1 };
    expect(calculateSubstituteQuantity(original, substitute, 100)).toBeLessThanOrEqual(10000);
  });

  it('calculateEquivalenceRatio - identical = 1', () => {
    expect(calculateEquivalenceRatio(100, 100)).toBe(1);
  });

  it('calculateEquivalenceRatio - double = 2', () => {
    expect(calculateEquivalenceRatio(100, 200)).toBe(2);
  });

  it('calculateEquivalenceRatio - half = 0.5', () => {
    expect(calculateEquivalenceRatio(100, 50)).toBe(0.5);
  });

  it('calculateEquivalenceRatio - zero original returns fallback 1', () => {
    expect(calculateEquivalenceRatio(0, 100)).toBe(1);
  });

  it('calculateEquivalenceRatio - NaN returns fallback 1', () => {
    expect(calculateEquivalenceRatio(NaN, 100)).toBe(1);
    expect(calculateEquivalenceRatio(100, NaN)).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Warnings Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Warnings & Limitations', () => {
  const zeroDeltas = { protein: 0, carbs: 0, fat: 0, calories: 0, proteinPct: 0, carbsPct: 0, fatPct: 0, caloriesPct: 0 };

  it('generateWarnings - HIGH_SODIUM when substitute sodium > original + 200mg', () => {
    const original = createFoodItem({ macrosPer100g: { protein: 20, carbs: 10, fat: 5, calories: 165, sodium: 100 } });
    const substitute = createFoodItem({ macrosPer100g: { protein: 20, carbs: 10, fat: 5, calories: 165, sodium: 500 } });
    const warnings = generateWarnings(original, substitute, zeroDeltas, 100);
    const w = warnings.find(x => x.code === 'HIGH_SODIUM');
    expect(w).toBeDefined();
    expect(w!.severity).toBe('warning');
  });

  it('generateWarnings - HIGH_SUGAR when substitute sugar > original + 15g', () => {
    const original = createFoodItem({ macrosPer100g: { protein: 20, carbs: 10, fat: 5, calories: 165, sugar: 2 } });
    const substitute = createFoodItem({ macrosPer100g: { protein: 20, carbs: 10, fat: 5, calories: 165, sugar: 20 } });
    const warnings = generateWarnings(original, substitute, zeroDeltas, 100);
    expect(warnings.find(x => x.code === 'HIGH_SUGAR')).toBeDefined();
  });

  it('generateWarnings - LOW_PROTEIN when substitute protein < 5g', () => {
    const original = createFoodItem({ macrosPer100g: { protein: 20, carbs: 10, fat: 5, calories: 165 } });
    const substitute = createFoodItem({ macrosPer100g: { protein: 3, carbs: 10, fat: 5, calories: 87 } });
    const warnings = generateWarnings(original, substitute, zeroDeltas, 100);
    const w = warnings.find(x => x.code === 'LOW_PROTEIN');
    expect(w).toBeDefined();
    expect(w!.severity).toBe('info');
  });

  it('generateWarnings - HIGH_CALORIE_DIFF when calorie diff > 25%', () => {
    const original = createFoodItem();
    const substitute = createFoodItem();
    const deltas = { ...zeroDeltas, caloriesPct: 30 };
    const warnings = generateWarnings(original, substitute, deltas, 100);
    expect(warnings.find(x => x.code === 'HIGH_CALORIE_DIFF')).toBeDefined();
  });

  it('generateWarnings - DATA_QUALITY_LOW when either food is low quality', () => {
    const original = createFoodItem({ dataQuality: 'low' });
    const substitute = createFoodItem({ dataQuality: 'high' });
    const warnings = generateWarnings(original, substitute, zeroDeltas, 100);
    expect(warnings.find(x => x.code === 'DATA_QUALITY_LOW')).toBeDefined();
  });

  it('generateWarnings - MICRONUTRIENT_GAP when equivalence < 40', () => {
    const original = createFoodItem();
    const substitute = createFoodItem();
    const warnings = generateWarnings(original, substitute, zeroDeltas, 30);
    expect(warnings.find(x => x.code === 'MICRONUTRIENT_GAP')).toBeDefined();
  });

  it('generateLimitations - always includes NO_MICRONUTRIENT_DATA and BRAND_VARIATION', () => {
    const original = createFoodItem();
    const substitute = createFoodItem();
    const limitations = generateLimitations(original, substitute);
    expect(limitations.some(l => l.code === 'NO_MICRONUTRIENT_DATA')).toBe(true);
    expect(limitations.some(l => l.code === 'BRAND_VARIATION')).toBe(true);
  });

  it('generateLimitations - ESTIMATED_VALUES when dataQuality != high', () => {
    const original = createFoodItem({ dataQuality: 'medium' });
    const substitute = createFoodItem({ dataQuality: 'high' });
    const limitations = generateLimitations(original, substitute);
    expect(limitations.some(l => l.code === 'ESTIMATED_VALUES')).toBe(true);
  });

  it('generateLimitations - SERVING_SIZE_ESTIMATE when missing servingSize', () => {
    const original = createFoodItem({ servingSize: undefined });
    const substitute = createFoodItem({ servingSize: 100 });
    const limitations = generateLimitations(original, substitute);
    expect(limitations.some(l => l.code === 'SERVING_SIZE_ESTIMATE')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Unit Conversion Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Unit Conversion', () => {
  it('convertUnit - same unit returns same value', () => {
    expect(convertUnit(100, 'g', 'g')).toBe(100);
    expect(convertUnit(1, 'kg', 'kg')).toBe(1);
    expect(convertUnit(10, 'oz', 'oz')).toBe(10);
  });

  it('convertUnit - g to kg', () => {
    expect(convertUnit(1000, 'g', 'kg')).toBeCloseTo(1, 3);
  });

  it('convertUnit - kg to g', () => {
    expect(convertUnit(1, 'kg', 'g')).toBeCloseTo(1000, 3);
  });

  it('convertUnit - oz to g', () => {
    expect(convertUnit(1, 'oz', 'g')).toBeCloseTo(28.3495, 2);
  });

  it('convertUnit - g to oz', () => {
    expect(convertUnit(28.3495, 'g', 'oz')).toBeCloseTo(1, 2);
  });

  it('convertUnit - lb to g', () => {
    expect(convertUnit(1, 'lb', 'g')).toBeCloseTo(453.592, 2);
  });

  it('convertUnit - ml to l', () => {
    expect(convertUnit(1000, 'ml', 'l')).toBeCloseTo(1, 3);
  });

  it('convertUnit - cup to ml', () => {
    expect(convertUnit(1, 'cup', 'ml')).toBeCloseTo(236.588, 2);
  });

  it('convertUnit - tbsp to ml', () => {
    expect(convertUnit(1, 'tbsp', 'ml')).toBeCloseTo(14.787, 2);
  });

  it('convertUnit - tsp to ml', () => {
    expect(convertUnit(1, 'tsp', 'ml')).toBeCloseTo(4.929, 2);
  });

  it('convertUnit - NaN returns 0', () => {
    expect(convertUnit(NaN, 'g', 'kg')).toBe(0);
  });

  it('convertUnit - Infinity returns 0', () => {
    expect(convertUnit(Infinity, 'g', 'kg')).toBe(0);
  });

  it('formatDisplay - metric g no decimals', () => {
    expect(formatDisplay(100.7, 'g', 'metric')).toBe('101');
  });

  it('formatDisplay - imperial oz 1 decimal', () => {
    expect(formatDisplay(3.56, 'oz', 'imperial')).toBe('3.6');
  });

  it('formatDisplay - NaN returns 0', () => {
    expect(formatDisplay(NaN, 'g', 'metric')).toBe('0');
  });
});

describe('Round-trip Conversions', () => {
  it('g -> oz -> g preserves value', () => {
    const original = 100;
    const toOz = convertUnit(original, 'g', 'oz');
    const backToG = convertUnit(toOz, 'oz', 'g');
    expect(backToG).toBeCloseTo(original, 1);
  });

  it('kg -> lb -> kg preserves value', () => {
    const original = 1;
    const toLb = convertUnit(original, 'kg', 'lb');
    const backToKg = convertUnit(toLb, 'lb', 'kg');
    expect(backToKg).toBeCloseTo(original, 3);
  });

  it('repeated toggle g <-> oz 10 times preserves value', () => {
    let value = 100;
    for (let i = 0; i < 10; i++) {
      value = i % 2 === 0 ? convertUnit(value, 'g', 'oz') : convertUnit(value, 'oz', 'g');
    }
    expect(value).toBeCloseTo(100, 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Main Engine — computeSubstitution Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('computeSubstitution', () => {
  it('basic substitution returns valid result', () => {
    const result = computeSubstitution(createEngineInput());
    expect(result.substituteQuantity).toBeGreaterThan(0);
    expect(Number.isFinite(result.equivalenceScore)).toBe(true);
    expect(result.equivalenceScore).toBeGreaterThanOrEqual(0);
    expect(result.equivalenceScore).toBeLessThanOrEqual(100);
    expect(['excellent', 'good', 'fair', 'poor', 'unacceptable']).toContain(result.equivalenceLevel);
    expect(result.metadata.engineVersion).toBe(ENGINE_VERSION);
    expect(result.metadata.unitSystem).toBe('metric');
    expect(result.metadata.locale).toBe('en');
  });

  it('identical foods gives excellent score', () => {
    const food = createFoodItem({ macrosPer100g: { protein: 20, carbs: 10, fat: 5, calories: 165 } });
    const result = computeSubstitution(createEngineInput({ originalFood: food, substituteFood: food }));
    expect(result.equivalenceScore).toBe(100);
    expect(result.equivalenceLevel).toBe('excellent');
    expect(result.substituteQuantity).toBe(100);
    expect(result.macroDeltas.protein).toBe(0);
    expect(result.macroDeltas.calories).toBe(0);
  });

  it('imperial units preserved', () => {
    const result = computeSubstitution(createEngineInput({
      originalUnit: 'oz', originalQuantity: 3.5274, unitSystem: 'imperial',
    }));
    expect(result.substituteUnit).toBe('oz');
    expect(result.metadata.unitSystem).toBe('imperial');
  });

  it('Arabic locale preserved', () => {
    const result = computeSubstitution(createEngineInput({ locale: 'ar' }));
    expect(result.metadata.locale).toBe('ar');
  });

  it('target macros produce targetAdherence', () => {
    const result = computeSubstitution(createEngineInput({
      targetMacros: { protein: 25, carbs: 10, fat: 5, calories: 200 },
    }));
    expect(result.targetAdherence).toBeDefined();
    expect(['on_target', 'slightly_off', 'moderately_off', 'significantly_off']).toContain(result.targetAdherence!.overall);
  });

  it('deterministic results (same input → same output)', () => {
    const input = createEngineInput();
    const r1 = computeSubstitution(input);
    const r2 = computeSubstitution(input);
    expect(r1.substituteQuantity).toBe(r2.substituteQuantity);
    expect(r1.equivalenceScore).toBe(r2.equivalenceScore);
    expect(r1.macroDeltas.protein).toBe(r2.macroDeltas.protein);
  });

  it('sensitive to input changes', () => {
    const r1 = computeSubstitution(createEngineInput({
      originalFood: createFoodItem({ macrosPer100g: { protein: 20, carbs: 10, fat: 5, calories: 165 } }),
    }));
    const r2 = computeSubstitution(createEngineInput({
      originalFood: createFoodItem({ macrosPer100g: { protein: 21, carbs: 10, fat: 5, calories: 169 } }),
    }));
    expect(r1.equivalenceScore !== r2.equivalenceScore || r1.substituteQuantity !== r2.substituteQuantity).toBe(true);
  });

  it('handles missing optional macros', () => {
    const substitute = createFoodItem({ macrosPer100g: { protein: 20, carbs: 10, fat: 5, calories: 165 } });
    const result = computeSubstitution(createEngineInput({ substituteFood: substitute }));
    expect(Number.isFinite(result.equivalenceScore)).toBe(true);
    expect(result.equivalenceScore).toBe(100);
  });

  it('handles NaN in macros without crashing', () => {
    const substitute = createFoodItem({ macrosPer100g: { protein: NaN, carbs: 10, fat: 5, calories: 165 } });
    const result = computeSubstitution(createEngineInput({ substituteFood: substitute }));
    expect(Number.isFinite(result.equivalenceScore)).toBe(true);
    expect(result.equivalenceScore).toBeGreaterThanOrEqual(0);
  });

  it('zero quantity produces zero macros', () => {
    const result = computeSubstitution(createEngineInput({ originalQuantity: 0 }));
    expect(result.substituteQuantity).toBe(0);
    expect(result.originalMacros.protein).toBe(0);
    expect(result.substituteMacros.protein).toBe(0);
  });

  it('negative quantity treated as zero', () => {
    const result = computeSubstitution(createEngineInput({ originalQuantity: -50 }));
    expect(result.originalMacros.protein).toBe(0);
  });

  it('metadata includes calculationTimeMs and dataSources', () => {
    const result = computeSubstitution(createEngineInput());
    expect(result.metadata.calculationTimeMs).toBeGreaterThanOrEqual(0);
    expect(result.metadata.dataSources).toHaveLength(2);
  });

  it('equivalenceRatio is positive finite', () => {
    const result = computeSubstitution(createEngineInput());
    expect(Number.isFinite(result.equivalenceRatio)).toBe(true);
    expect(result.equivalenceRatio).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge Cases
// ─────────────────────────────────────────────────────────────────────────────

describe('Edge Cases', () => {
  it('very large quantity (10000g)', () => {
    const result = computeSubstitution(createEngineInput({ originalQuantity: 10000 }));
    expect(Number.isFinite(result.substituteQuantity)).toBe(true);
    expect(result.substituteQuantity).toBeGreaterThan(0);
  });

  it('very small quantity (0.001g)', () => {
    const result = computeSubstitution(createEngineInput({ originalQuantity: 0.001 }));
    expect(Number.isFinite(result.substituteQuantity)).toBe(true);
    expect(result.substituteQuantity).toBeGreaterThanOrEqual(0);
  });

  it('extreme macro differences give poor score', () => {
    const original = createFoodItem({ macrosPer100g: { protein: 100, carbs: 0, fat: 0, calories: 400 } });
    const substitute = createFoodItem({ macrosPer100g: { protein: 0, carbs: 100, fat: 0, calories: 400 } });
    const result = computeSubstitution(createEngineInput({ originalFood: original, substituteFood: substitute }));
    expect(result.equivalenceScore).toBeLessThan(50);
    expect(['poor', 'unacceptable']).toContain(result.equivalenceLevel);
  });

  it('all macros zero in original does not crash', () => {
    const original = createFoodItem({ macrosPer100g: { protein: 0, carbs: 0, fat: 0, calories: 0 } });
    const result = computeSubstitution(createEngineInput({ originalFood: original }));
    expect(Number.isFinite(result.equivalenceScore)).toBe(true);
    expect(result.substituteQuantity).toBeGreaterThanOrEqual(0);
  });

  it('all macros zero in substitute gives score 0', () => {
    const substitute = createFoodItem({ macrosPer100g: { protein: 0, carbs: 0, fat: 0, calories: 0 } });
    const result = computeSubstitution(createEngineInput({ substituteFood: substitute }));
    expect(result.equivalenceScore).toBe(0);
    expect(result.equivalenceLevel).toBe('unacceptable');
  });

  it('different food categories do not affect calculation', () => {
    const original = createFoodItem({ category: 'MEAT', macrosPer100g: { protein: 25, carbs: 0, fat: 10, calories: 190 } });
    const substitute = createFoodItem({ category: 'LEGUME', macrosPer100g: { protein: 9, carbs: 20, fat: 1, calories: 130 } });
    const result = computeSubstitution(createEngineInput({ originalFood: original, substituteFood: substitute }));
    expect(Number.isFinite(result.equivalenceScore)).toBe(true);
    expect(result.substituteQuantity).toBeGreaterThan(0);
  });

  it('low data quality generates DATA_QUALITY_LOW warning', () => {
    const original = createFoodItem({ dataQuality: 'high' });
    const substitute = createFoodItem({ dataQuality: 'low' });
    const result = computeSubstitution(createEngineInput({ originalFood: original, substituteFood: substitute }));
    expect(result.warnings.some(w => w.code === 'DATA_QUALITY_LOW')).toBe(true);
  });

  it('target macros with only protein specified', () => {
    const result = computeSubstitution(createEngineInput({ targetMacros: { protein: 30 } }));
    expect(result.targetAdherence).toBeDefined();
    expect(result.targetAdherence!.carbs).toBe('on_target');
    expect(result.targetAdherence!.fat).toBe('on_target');
    expect(result.targetAdherence!.calories).toBe('on_target');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Type Exports
// ─────────────────────────────────────────────────────────────────────────────

describe('Constants & Exports', () => {
  it('ENGINE_VERSION is exported and non-empty', () => {
    expect(typeof ENGINE_VERSION).toBe('string');
    expect(ENGINE_VERSION.length).toBeGreaterThan(0);
  });

  it('ATWATER factors', () => {
    expect(ATWATER.protein).toBe(4);
    expect(ATWATER.carbs).toBe(4);
    expect(ATWATER.fat).toBe(9);
  });

  it('EQUIVALENCE_THRESHOLDS', () => {
    expect(EQUIVALENCE_THRESHOLDS.excellent).toBe(90);
    expect(EQUIVALENCE_THRESHOLDS.good).toBe(75);
    expect(EQUIVALENCE_THRESHOLDS.fair).toBe(60);
    expect(EQUIVALENCE_THRESHOLDS.poor).toBe(40);
  });

  it('EQUIVALENCE_WEIGHTS sum to 1', () => {
    const sum = Object.values(EQUIVALENCE_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 3);
  });

  it('ADHERENCE_THRESHOLDS in percentage units (5, 15, 30)', () => {
    // Matches TOOL_111_ENGINE_DESIGN.md §3.4: ±5%, ±5-15%, ±15-30%, >30%
    expect(ADHERENCE_THRESHOLDS.on_target).toBe(5);
    expect(ADHERENCE_THRESHOLDS.slightly_off).toBe(15);
    expect(ADHERENCE_THRESHOLDS.moderately_off).toBe(30);
    // Verify ordering
    expect(ADHERENCE_THRESHOLDS.on_target).toBeLessThan(ADHERENCE_THRESHOLDS.slightly_off);
    expect(ADHERENCE_THRESHOLDS.slightly_off).toBeLessThan(ADHERENCE_THRESHOLDS.moderately_off);
  });

  it('TO_CANONICAL has all units with positive factors', () => {
    const units: Unit[] = ['g', 'kg', 'oz', 'lb', 'ml', 'l', 'fl_oz', 'cup', 'tbsp', 'tsp', 'piece', 'slice'];
    for (const unit of units) {
      expect(unit in TO_CANONICAL).toBe(true);
      expect(TO_CANONICAL[unit]).toBeGreaterThan(0);
    }
  });

  // Compile-time type checks (no runtime effect)
  it('type exports are importable', () => {
    const _checks = {
      foodCategory: 'PROTEIN' as FoodCategory,
      unit: 'g' as Unit,
      unitSystem: 'metric' as UnitSystem,
      locale: 'en' as Locale,
      dataSource: 'USDA' as DataSource,
      dataQuality: 'high' as DataQuality,
      equivalenceLevel: 'excellent' as EquivalenceLevel,
      adherenceLevel: 'on_target' as AdherenceLevel,
      warningCode: 'HIGH_SODIUM' as WarningCode,
      limitationCode: 'ESTIMATED_VALUES' as LimitationCode,
    };
    expect(_checks.foodCategory).toBe('PROTEIN');
  });
});
