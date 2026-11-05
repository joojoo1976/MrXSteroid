/**
 * lib/tools/engines/macro.v6.test.ts
 * ═════════════════════════════════════════════════════════════════════════════════
 *  Tests for Macro Calculator v6 Genius
 * ═════════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi } from 'vitest';
import {
  calculateMacrosV6,
  MACRO_MATH_ENGINE,
  convertMacroInput,
  convertMacroOutput,
  assessCompleteness,
  extractMinimumViable,
  generateWhatIfScenarios,
  applyGoldenRules,
  buildReasoningTrace,
  extractTop3ReasoningV6,
  buildWhatIfEngine,
  generateWarnings,
} from './macro.v6';
import type { MacroInputV6, MacroOutputV6 } from './macro.v6';
import { MacroInputV6PartialSchema, MacroInputV6Schema } from '../schemas/macro.v6';

describe('Macro Calculator v6 Genius', () => {
  const maleInput: MacroInputV6 = {
    age: 28,
    sex: 'male',
    heightCm: 180,
    weightKg: 85,
    activityLevel: 1.55,
    phase: 'maintenance',
  };

  const femaleInput: MacroInputV6 = {
    age: 25,
    sex: 'female',
    heightCm: 165,
    weightKg: 65,
    activityLevel: 1.375,
    phase: 'cut',
  };

  describe('Macro v6 input schema', () => {
    it('keeps the complete schema, partial form state, and engine validator aligned', () => {
      expect(MacroInputV6Schema.safeParse(maleInput).success).toBe(true);
      expect(MacroInputV6PartialSchema.safeParse({ age: null }).success).toBe(true);
      expect(MacroInputV6PartialSchema.safeParse({ age: 18 }).success).toBe(false);
      expect(MacroInputV6Schema.safeParse({ ...maleInput, phase: 'recomp' }).success).toBe(false);
      expect(MacroInputV6Schema.safeParse({ ...maleInput, unexpected: true }).success).toBe(false);
      expect(MACRO_MATH_ENGINE.validate({ ...maleInput, unexpected: true } as MacroInputV6).valid).toBe(false);
    });
  });

  describe('1. Core Math Engine - Male', () => {
    it('should calculate correct BMR for male using Mifflin-St Jeor', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      expect(result.bmr).toBeCloseTo(1840, -1);
    });

    it('should calculate correct TDEE with activity multiplier', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      expect(result.tdee).toBeCloseTo(2852, -1);
    });

    it('should calculate target calories for maintenance phase', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      expect(result.targetCalories).toBeCloseTo(2852, -1);
    });

    it('should calculate macro grams correctly', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      expect(result.proteinGrams).toBe(187);
      expect(result.fatGrams).toBe(77);
      expect(result.carbsGrams).toBe(353);
      expect(result.assumptions).toContain('Protein is 2.2 g/kg and fat is 0.9 g/kg; carbohydrate fills remaining target calories.');
    });

    it('should calculate per-kg values correctly', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      expect(result.caloriesPerKg).toBeCloseTo(2852 / 85, 1);
      expect(result.proteinPerKg).toBeCloseTo(result.proteinGrams / 85, 1);
    });

    it('should state that unsupported recomposition has no approved calculation', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      expect(result.assumptions).toContain(
        'Recomposition is unsupported because SPEC v3 does not define an approved equation for this phase.'
      );
      expect(result.assumptions.join(' ')).not.toMatch(/retains the existing 5% reduction assumption/i);
    });
  });
  describe('2. Core Math Engine - Female', () => {
    it('should calculate correct BMR for female using Mifflin-St Jeor', () => {
      const result = MACRO_MATH_ENGINE.calculate(femaleInput);
      expect(result.bmr).toBeCloseTo(1395, -1);
    });

    it('should calculate correct TDEE for female', () => {
      const result = MACRO_MATH_ENGINE.calculate(femaleInput);
      expect(result.tdee).toBeCloseTo(1918, -1);
    });

    it('should calculate target calories for cut phase', () => {
      const result = MACRO_MATH_ENGINE.calculate(femaleInput);
      expect(result.targetCalories).toBeCloseTo(1630, -1);
      expect(result.targetCalories).toBeLessThan(result.tdee);
    });

    it('should calculate cut phase macro split correctly', () => {
      const result = MACRO_MATH_ENGINE.calculate(femaleInput);
      expect(result.proteinGrams).toBeGreaterThan(100);
      expect(result.fatGrams).toBeGreaterThan(40);
      expect(result.carbsGrams).toBeGreaterThan(100);
    });
  });

  describe('3. Core Math Engine - All Phases', () => {
    it('should apply the SPEC v3 bulk phase +15% calorie surplus', () => {
      const bulkInput = { ...maleInput, phase: 'bulk' as const };
      const result = MACRO_MATH_ENGINE.calculate(bulkInput);
      expect(result.targetCalories).toBeGreaterThan(result.tdee);
      expect(result.targetCalories).toBe(Math.round(result.tdee * 1.15));
    });

    it('should apply cut phase -15% calorie deficit', () => {
      const cutInput = { ...maleInput, phase: 'cut' as const };
      const result = MACRO_MATH_ENGINE.calculate(cutInput);
      expect(result.targetCalories).toBeLessThan(result.tdee);
      expect(result.targetCalories).toBeCloseTo(Math.round(result.tdee * 0.85), -1);
    });

    it('should reject recomposition because SPEC v3 does not define an equation for it', () => {
      const recompInput = { ...maleInput, phase: 'recomp' as const };
      expect(MACRO_MATH_ENGINE.validate(recompInput).valid).toBe(false);
      expect(() => MACRO_MATH_ENGINE.calculate(recompInput)).toThrow(/no approved formula/i);
    });
  });
  describe('4. Input Validation & Golden Rules', () => {
    it('should reject ages below the adult derivation sample', () => {
      const invalidInput = { ...maleInput, age: 18 };
      const validation = MACRO_MATH_ENGINE.validate(invalidInput);
      expect(validation.valid).toBe(false);
    });

    it('should accept the lower age boundary from the source derivation', () => {
      expect(MACRO_MATH_ENGINE.validate({ ...maleInput, age: 19 }).valid).toBe(true);
    });

    it('should reject invalid height (above 250cm)', () => {
      const invalidInput = { ...maleInput, heightCm: 300 };
      const validation = MACRO_MATH_ENGINE.validate(invalidInput);
      expect(validation.valid).toBe(false);
    });

    it('should reject invalid activity level (below 1.2)', () => {
      const invalidInput = { ...maleInput, activityLevel: 1.0 };
      const validation = MACRO_MATH_ENGINE.validate(invalidInput);
      expect(validation.valid).toBe(false);
    });

    it.each([Number.NaN, Number.POSITIVE_INFINITY, 0])('should reject non-finite or non-positive weight %s', weightKg => {
      const validation = MACRO_MATH_ENGINE.validate({ ...maleInput, weightKg });
      expect(validation.valid).toBe(false);
    });

    it('should validate optional body-fat and lean-mass inputs when supplied', () => {
      expect(MACRO_MATH_ENGINE.validate({ ...maleInput, targetBodyFatPct: 101 }).valid).toBe(false);
      expect(MACRO_MATH_ENGINE.validate({ ...maleInput, leanMassKg: 86 }).valid).toBe(false);
    });

    it('should disclose context-only inputs and reject goal/phase contradictions', () => {
      const contextInput: MacroInputV6 = {
        ...maleInput,
        goal: 'maintain',
        targetBodyFatPct: 15,
        leanMassKg: 72,
        dietPreference: 'low-carb',
        targetWeightKg: 82,
      };
      const output = MACRO_MATH_ENGINE.calculate(contextInput);
      expect(output.targetCalories).toBe(MACRO_MATH_ENGINE.calculate(maleInput).targetCalories);
      expect(output.assumptions.some(line => line.includes('goal, targetBodyFatPct, leanMassKg, dietPreference, targetWeightKg') && line.includes('do not change this calculation'))).toBe(true);
      expect(MACRO_MATH_ENGINE.validate({ ...maleInput, goal: 'cut' }).valid).toBe(false);
      expect(MACRO_MATH_ENGINE.validate({ ...maleInput, goal: 'recomp' }).valid).toBe(false);
    });

    it('should reject unsupported sex, unit system, diet preference, and invalid target weight', () => {
      expect(MACRO_MATH_ENGINE.validate({ ...maleInput, sex: 'unknown' as 'male' }).valid).toBe(false);
      expect(MACRO_MATH_ENGINE.validate({ ...maleInput, unitSystem: 'stone' as 'metric' }).valid).toBe(false);
      expect(MACRO_MATH_ENGINE.validate({ ...maleInput, dietPreference: 'unknown' as 'balanced' }).valid).toBe(false);
      expect(MACRO_MATH_ENGINE.validate({ ...maleInput, targetWeightKg: Number.POSITIVE_INFINITY }).valid).toBe(false);
    });

    it('should reject bulk target weight at or below current weight', () => {
      const validation = MACRO_MATH_ENGINE.validate({ ...maleInput, phase: 'bulk', targetWeightKg: 85 });
      expect(validation.errors.some(error => error.code === 'LOGICAL_CONTRADICTION')).toBe(true);
    });

    it('should reject a macro distribution with negative residual carbohydrate', () => {
      const input: MacroInputV6 = {
        age: 100,
        sex: 'female',
        heightCm: 100,
        weightKg: 300,
        activityLevel: 1.2,
        phase: 'maintenance',
      };
      expect(MACRO_MATH_ENGINE.validate(input).valid).toBe(true);
      expect(() => MACRO_MATH_ENGINE.calculate(input)).toThrow(/non-negative macro distribution/i);
    });

    it('should reject target weight higher than current for cut phase', () => {
      const invalidInput = { ...maleInput, phase: 'cut' as const, targetWeightKg: 90 };
      const validation = MACRO_MATH_ENGINE.validate(invalidInput);
      expect(validation.valid).toBe(false);
    });

    it('should apply all 7 Golden Rules', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      const rulesApplied = applyGoldenRules(maleInput, result);
      expect(rulesApplied).toHaveLength(7);
      expect(rulesApplied.every(r => r.applied)).toBe(true);
    });

    it('should mark Golden Rules that fail output consistency checks', () => {
      const output = MACRO_MATH_ENGINE.calculate(maleInput);
      const inconsistent = {
        ...output,
        macros: { ...output.macros, carbs: { ...output.macros.carbs, calories: 0 } },
        assumptions: [],
      };
      const rulesApplied = applyGoldenRules(maleInput, inconsistent);
      expect(rulesApplied.find(rule => rule.ruleId === 'GR5')?.applied).toBe(false);
      expect(rulesApplied.find(rule => rule.ruleId === 'GR7')?.applied).toBe(false);
    });
  });

  describe('5. Sensitivity Analysis', () => {
    it('should show sensitivity to weight changes', () => {
      const sensitivities = MACRO_MATH_ENGINE.sensitivityAnalysis(maleInput);
      const weightSens = sensitivities.find(s => s.input === 'weightKg');
      expect(weightSens).toBeDefined();
      expect(Math.abs(weightSens!.elasticity)).toBeGreaterThan(0);
    });

    it('should show sensitivity to activity level', () => {
      const sensitivities = MACRO_MATH_ENGINE.sensitivityAnalysis(maleInput);
      const activitySens = sensitivities.find(s => s.input === 'activityLevel' && s.output === 'tdee');
      expect(activitySens).toBeDefined();
      expect(Math.abs(activitySens!.elasticity)).toBeGreaterThan(0);
    });

    it.each([1.2, 1.9])('uses the activity slider increment for a stable TDEE sensitivity at bound %s', (activityLevel) => {
      const input = { ...maleInput, activityLevel };
      const output = MACRO_MATH_ENGINE.calculate(input);
      const sensitivity = MACRO_MATH_ENGINE.sensitivityAnalysis(input)
        .find((item) => item.input === 'activityLevel' && item.output === 'tdee');

      expect(sensitivity?.partialDerivative).toBe(output.bmr);
    });

    it('should calculate finite age sensitivity at the minimum supported age', () => {
      const sensitivities = MACRO_MATH_ENGINE.sensitivityAnalysis({ ...maleInput, age: 19 })
        .filter((item) => item.input === 'age');

      expect(sensitivities).toHaveLength(4);
      expect(sensitivities.every((item) => Number.isFinite(item.elasticity) && Number.isFinite(item.partialDerivative))).toBe(true);
      expect(sensitivities.find((item) => item.output === 'bmr')?.partialDerivative).toBe(-5);
    });

    it('should return sensitivity reports for all output keys', () => {
      const sensitivities = MACRO_MATH_ENGINE.sensitivityAnalysis(maleInput);
      const outputKeys = [...new Set(sensitivities.map(s => s.output))];
      expect(sensitivities.every(s => !('confidence' in s))).toBe(true);
      expect(outputKeys).toContain('bmr');
      expect(outputKeys).toContain('tdee');
      expect(outputKeys).toContain('targetCalories');
      expect(outputKeys).toContain('proteinGrams');
    });

    it('should retain boundary sensitivity using backward comparisons at upper bounds', () => {
      const upperBounds: MacroInputV6 = {
        age: 100,
        sex: 'male',
        heightCm: 250,
        weightKg: 300,
        activityLevel: 1.9,
        phase: 'maintenance',
      };
      const sensitivities = MACRO_MATH_ENGINE.sensitivityAnalysis(upperBounds);
      expect(new Set(sensitivities.map((item) => item.input))).toEqual(new Set([
        'age', 'heightCm', 'weightKg', 'activityLevel',
      ]));
      expect(sensitivities).toHaveLength(16);
      expect(sensitivities.every((item) => Number.isFinite(item.elasticity) && Number.isFinite(item.partialDerivative))).toBe(true);
    });
  });
  describe('6. Dynamic Results - Completeness States', () => {
    it('should return empty when no inputs provided', () => {
      expect(assessCompleteness({})).toBe('empty');
    });

    it('should return partial when some inputs missing', () => {
      const partialInput: Partial<MacroInputV6> = { age: 28, sex: 'male' };
      expect(assessCompleteness(partialInput)).toBe('partial');
    });

    it('should return full when all required inputs present', () => {
      expect(assessCompleteness(maleInput)).toBe('full');
      expect(assessCompleteness(femaleInput)).toBe('full');
    });
  });

  describe('7. What-If Engine', () => {
    it('should adjust input and produce predicted output', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      const whatIf = buildWhatIfEngine(maleInput, result);
      const scenario = whatIf.adjustInput('weightKg', 80);
      expect(scenario.inputDeltas.weightKg).toBe(-5);
    });

    it('should adjust by percentage', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      const whatIf = buildWhatIfEngine(maleInput, result);
      const scenario = whatIf.adjustPercentage('weightKg', -10);
      expect(scenario.inputDeltas.weightKg).toBeCloseTo(-8.5, 1);
    });

    it('should provide slider config with markers', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      const whatIf = buildWhatIfEngine(maleInput, result);
      const slider = whatIf.getSliderConfig('weightKg');
      expect(slider.min).toBeLessThan(maleInput.weightKg);
      expect(slider.max).toBeGreaterThan(maleInput.weightKg);
      expect(slider.markers).toHaveLength(3);
      expect(slider.markers.find(m => m.label === 'Current')).toBeDefined();
    });

    it('keeps age What-If bounds within the adult equation validation range', () => {
      const boundaryInput = { ...maleInput, age: 19 };
      const result = MACRO_MATH_ENGINE.calculate(boundaryInput);
      const whatIf = buildWhatIfEngine(boundaryInput, result);
      const slider = whatIf.getSliderConfig('age');

      expect(slider.min).toBe(19);
      expect(slider.max).toBe(29);
      expect(whatIf.adjustInput('age', 19).resultType).toBe('CALCULATED');
      expect(() => whatIf.adjustInput('age', 18)).toThrow(/must stay within 19 and 29/i);
    });

    it('should support a bounded TDEE what-if through its implied activity factor', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      const whatIf = buildWhatIfEngine(maleInput, result);
      const scenario = whatIf.adjustInput('tdee', result.tdee + 100);
      expect(scenario.resultType).toBe('CALCULATED');
      expect(scenario.calculatedOutput.tdee).toBe(result.tdee + 100);
      expect(scenario.inputDeltas.tdee).toBe(100);
    });

    it('should reject What-If changes to unsupported keys and non-finite values', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      const whatIf = buildWhatIfEngine(maleInput, result);
      expect(() => whatIf.adjustInput('sex', 1)).toThrow(/does not support/i);
      expect(() => whatIf.adjustInput('weightKg', Number.NaN)).toThrow(/finite/i);
    });

    it('should enforce the displayed ±10kg What-If range in the engine API', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      const whatIf = buildWhatIfEngine(maleInput, result);
      expect(whatIf.adjustInput('weightKg', 95).inputDeltas.weightKg).toBe(10);
      expect(() => whatIf.adjustInput('weightKg', 95.01)).toThrow(/must stay within/i);
      expect(() => whatIf.adjustInput('weightKg', 74.99)).toThrow(/must stay within/i);
    });

    it('should include maintenance, cut, and bulk as separate arithmetic scenarios', async () => {
      const { intelligence } = await calculateMacrosV6(maleInput);
      expect(intelligence.scenarios.map(s => s.id)).toEqual(expect.arrayContaining([
        'switch-to-maintenance', 'switch-to-cut', 'switch-to-bulk',
      ]));
      expect(intelligence.scenarios.every(s => s.resultType === 'CALCULATED' && s.confidence === null)).toBe(true);
      const cutScenario = intelligence.scenarios.find(s => s.id === 'switch-to-cut');
      expect(cutScenario?.description).toContain('arithmetic scenario only');
      expect(cutScenario?.description).not.toMatch(/fat loss/i);
      expect(cutScenario?.inputChanges).toEqual({ phase: 'cut' });
      expect(cutScenario?.inputDeltas).toEqual({});
      expect(cutScenario).not.toHaveProperty('predictedOutput');
    });

    it('keeps phase comparisons calculable when an optional target weight conflicts with the alternate phase', () => {
      const bulkInput: MacroInputV6 = {
        ...maleInput,
        phase: 'bulk',
        goal: 'bulk',
        targetWeightKg: 90,
      };
      const cutInput: MacroInputV6 = {
        ...maleInput,
        phase: 'cut',
        goal: 'cut',
        targetWeightKg: 80,
      };

      const cutComparison = generateWhatIfScenarios(bulkInput, MACRO_MATH_ENGINE.calculate(bulkInput))
        .find((scenario) => scenario.id === 'switch-to-cut');
      const bulkScenarios = generateWhatIfScenarios(bulkInput, MACRO_MATH_ENGINE.calculate(bulkInput));
      const cutScenarios = generateWhatIfScenarios(cutInput, MACRO_MATH_ENGINE.calculate(cutInput));
      const bulkComparison = generateWhatIfScenarios(cutInput, MACRO_MATH_ENGINE.calculate(cutInput))
        .find((scenario) => scenario.id === 'switch-to-bulk');

      expect(cutComparison?.resultType).toBe('CALCULATED');
      expect(cutComparison?.inputChanges.targetWeightKg).toContain('omitted');
      expect(cutComparison?.description).toContain('incompatible optional target weight is omitted');
      expect(bulkComparison?.resultType).toBe('CALCULATED');
      expect(bulkComparison?.inputChanges.targetWeightKg).toContain('omitted');
      expect(bulkComparison?.description).toContain('incompatible optional target weight is omitted');
      const higherBulkWeight = bulkScenarios.find((scenario) => scenario.id === 'weight-plus-10kg');
      const lowerCutWeight = cutScenarios.find((scenario) => scenario.id === 'weight-minus-10kg');
      expect(higherBulkWeight?.resultType).toBe('CALCULATED');
      expect(higherBulkWeight?.inputChanges.targetWeightKg).toContain('omitted');
      expect(lowerCutWeight?.resultType).toBe('CALCULATED');
      expect(lowerCutWeight?.inputChanges.targetWeightKg).toContain('omitted');
      expect(bulkInput.targetWeightKg).toBe(90);
      expect(cutInput.targetWeightKg).toBe(80);
    });

    it('preserves a feasible base result when one phase-comparison scenario is infeasible', async () => {
      const response = await calculateMacrosV6({
        age: 20,
        sex: 'male',
        heightCm: 250,
        weightKg: 300,
        activityLevel: 1.2,
        phase: 'maintenance',
      });

      expect(response.result.targetCalories).toBeGreaterThan(0);
      const cutScenario = response.intelligence.scenarios.find(scenario => scenario.id === 'switch-to-cut');
      expect(cutScenario?.resultType).toBe('NOT_AVAILABLE');
      expect(cutScenario).toMatchObject({ reason: expect.stringMatching(/non-negative macro distribution/i) });
      expect(cutScenario).not.toHaveProperty('calculatedOutput');
      expect(response.intelligence.scenarios.some(scenario => scenario.id === 'switch-to-bulk' && scenario.resultType === 'CALCULATED')).toBe(true);
    });

    it('should expose the calculated TDEE as the slider current marker', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      const slider = buildWhatIfEngine(maleInput, result).getSliderConfig('tdee');
      expect(slider.unit).toBe('kcal/day');
      expect(slider.min).toBe(Math.round(result.bmr * 1.2));
      expect(slider.max).toBe(Math.round(result.bmr * 1.9));
      expect(slider.markers.find(marker => marker.label === 'Current')?.value).toBe(result.tdee);
    });

    it('should keep rounded TDEE slider endpoints inside the approved activity bounds', () => {
      const fractionalBmrInput = { ...maleInput, weightKg: 85.05 };
      const result = MACRO_MATH_ENGINE.calculate(fractionalBmrInput);
      const whatIf = buildWhatIfEngine(fractionalBmrInput, result);
      const slider = whatIf.getSliderConfig('tdee');

      expect(result.bmr).toBe(1841);
      expect(whatIf.adjustInput('tdee', slider.min).calculatedOutput.tdee).toBe(slider.min);
      expect(whatIf.adjustInput('tdee', slider.max).calculatedOutput.tdee).toBe(slider.max);
    });

    it('should round-trip every displayed TDEE slider step through its implied activity factor', () => {
      const fractionalBmrInput = { ...maleInput, weightKg: 85.05 };
      const result = MACRO_MATH_ENGINE.calculate(fractionalBmrInput);
      const whatIf = buildWhatIfEngine(fractionalBmrInput, result);
      const slider = whatIf.getSliderConfig('tdee');

      for (let requestedTdee = slider.min; requestedTdee <= slider.max; requestedTdee += slider.step) {
        const scenario = whatIf.adjustInput('tdee', requestedTdee);
        expect(scenario.calculatedOutput.tdee, `TDEE slider step ${requestedTdee}`).toBe(requestedTdee);
        expect(scenario.inputChanges, `reported TDEE slider step ${requestedTdee}`).toMatchObject({ tdee: requestedTdee });
      }
    });

    it('should reject slider configurations for unsupported inputs', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      const whatIf = buildWhatIfEngine(maleInput, result);
      expect(() => whatIf.getSliderConfig('sex')).toThrow(/does not support/i);
    });

    it('should omit +/-10kg scenarios when the adjusted weight would exceed input bounds', () => {
      const lowWeight = { ...maleInput, weightKg: 30 };
      const highWeight = { ...maleInput, weightKg: 300 };
      const lowScenarios = generateWhatIfScenarios(lowWeight, MACRO_MATH_ENGINE.calculate(lowWeight));
      const highScenarios = generateWhatIfScenarios(highWeight, MACRO_MATH_ENGINE.calculate(highWeight));
      expect(lowScenarios.some(scenario => scenario.id === 'weight-minus-10kg')).toBe(false);
      expect(highScenarios.some(scenario => scenario.id === 'weight-plus-10kg')).toBe(false);
    });
  });
  describe('8. Cross-Tool Links', () => {
    it('does not publish speculative outbound links as active data flows', async () => {
      const { intelligence } = await calculateMacrosV6(maleInput);
      expect(intelligence.crossToolLinks).toEqual([]);
    });

    it('uses a valid explicitly supplied Body Fat result only for fields the user left blank', async () => {
      const linkedData = {
        sourceToolId: 'mrx.tool.bodyfat',
        computedAt: new Date().toISOString(),
        value: { weight: 80, bodyFatPercent: 15 },
        unit: 'kg',
        confidence: 'high' as const,
        fields: { weight: 80, bodyFatPercent: 15 },
      };
      const withExplicitWeight = await calculateMacrosV6({ ...maleInput, weightKg: 70 }, undefined, linkedData);
      expect('result' in withExplicitWeight && withExplicitWeight.result.proteinGrams).toBe(154);
      expect(withExplicitWeight.linkedValidation?.ok).toBe(true);

      const { weightKg: _weightKg, ...inputWithoutWeight } = maleInput;
      const filledMissingWeight = await calculateMacrosV6(inputWithoutWeight, undefined, linkedData);
      expect('result' in filledMissingWeight && filledMissingWeight.result.proteinGrams).toBe(176);
    });

    it('ignores a linked result whose source identity is invalid and preserves user inputs', async () => {
      const result = await calculateMacrosV6(maleInput, undefined, {
        sourceToolId: 'mrx.tool.macro',
        computedAt: new Date().toISOString(),
        value: { weight: 80, bodyFatPercent: 15 },
        unit: 'kg',
        confidence: 'high',
        fields: { weight: 80, bodyFatPercent: 15 },
      });
      expect('result' in result && result.result.proteinGrams).toBe(187);
      expect(result.linkedValidation?.ok).toBe(false);
      expect(result.linkedValidation?.reason).toBe('source_tool_mismatch');
    });
  });

  describe('9. Explainable AI - Reasoning Trace', () => {
    it('should produce reasoning trace with 4 steps', async () => {
      const { intelligence } = await calculateMacrosV6(maleInput);
      expect(intelligence.reasoning.steps).toHaveLength(4);
      expect(intelligence.reasoning.steps[0].description).toContain('BMR');
      expect(intelligence.reasoning.steps[1].description).toContain('TDEE');
    });

    it('should not invent a statistical confidence score', async () => {
      const { intelligence } = await calculateMacrosV6(maleInput);
      expect(intelligence.reasoning.finalConfidence).toBeNull();
    });

    it('should identify 3 uncertainty sources', async () => {
      const { intelligence } = await calculateMacrosV6(maleInput);
      expect(intelligence.reasoning.uncertaintySources).toHaveLength(3);
    });
  });

  describe('10. Top-3 Reasoning', () => {
    it('should report ranked local sensitivities without fabricated contribution percentages', async () => {
      const { intelligence } = await calculateMacrosV6(maleInput);
      const top1 = intelligence.top3Reasoning.find(r => r.rank === 1);
      expect(top1).toBeDefined();
      expect(top1!.contribution).toBeNull();
      expect(top1!.confidence).toBeNull();
      expect(Number.isFinite(top1!.localElasticity)).toBe(true);
      expect(top1!.localElasticity).not.toBe(0);
      expect(top1!.explanation).toContain('local +1% change');
    });

    it('should return three sensitivity-ranked factors with no fabricated confidence', async () => {
      const { intelligence } = await calculateMacrosV6(maleInput);
      const top2 = intelligence.top3Reasoning.find(r => r.rank === 2);
      expect(top2).toBeDefined();
      expect(intelligence.top3Reasoning).toHaveLength(3);
      expect(top2!.contribution).toBeNull();
      expect(top2!.confidence).toBeNull();
    });
  });
  describe('11. Warnings & Safety', () => {
    it('flags age 79 as outside the original Mifflin-St Jeor derivation sample', async () => {
      const age = 79;
      const { intelligence } = await calculateMacrosV6({ ...maleInput, age });
      expect(intelligence.warnings).toContainEqual(expect.objectContaining({
        code: 'AGE_OUTSIDE_ORIGINAL_EQUATION_SAMPLE',
        level: 'caution',
      }));
    });

    it.each([19, 78])('does not show an extrapolation warning at studied age boundary %s', async (age) => {
      const { intelligence } = await calculateMacrosV6({ ...maleInput, age });
      expect(intelligence.warnings.some((warning) => warning.code === 'AGE_OUTSIDE_ORIGINAL_EQUATION_SAMPLE')).toBe(false);
    });

    it('should not claim clinical calorie safety thresholds', async () => {
      const lowCalInput = { ...femaleInput, weightKg: 40, activityLevel: 1.2, phase: 'cut' as const };
      const { intelligence } = await calculateMacrosV6(lowCalInput);
      expect(intelligence.warnings.some(w => ['CRITICAL_LOW_CALORIES', 'AGGRESSIVE_CUT'].includes(w.code))).toBe(false);
    });

    it('should warn for low protein percentage', async () => {
      const { intelligence } = await calculateMacrosV6(maleInput);
      const lowProteinWarning = intelligence.warnings.find(w => w.code === 'LOW_PROTEIN');
      // Maintenance phase has 28% protein, should not trigger
      expect(lowProteinWarning).toBeUndefined();
    });

    it('should not claim a weight-change rate when no model is available', async () => {
      const { intelligence } = await calculateMacrosV6(maleInput);
      const rapidWarning = intelligence.warnings.find(w => w.code === 'RAPID_WEIGHT_CHANGE');
      expect(rapidWarning).toBeUndefined();
    });
  });

  describe('12. Unit Conversion - No Double Conversion', () => {
    it('should preserve canonical kg/cm input when display preference is imperial', () => {
      const imperialInput = convertMacroInput(maleInput, 'imperial');
      expect(imperialInput.heightCm).toBe(maleInput.heightCm);
      expect(imperialInput.weightKg).toBe(maleInput.weightKg);
    });

    it('should NOT convert when target is metric', () => {
      const metricInput = convertMacroInput(maleInput, 'metric');
      expect(metricInput.heightCm).toBe(maleInput.heightCm);
      expect(metricInput.weightKg).toBe(maleInput.weightKg);
    });

    it('should preserve output values for metric', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      const metricOutput = convertMacroOutput(result, 'metric');
      expect(metricOutput.targetCalories).toBe(result.targetCalories);
      expect(metricOutput.proteinGrams).toBe(result.proteinGrams);
    });

    it('should preserve canonical output values for imperial display preference', () => {
      const result = MACRO_MATH_ENGINE.calculate(maleInput);
      const imperialOutput = convertMacroOutput(result, 'imperial');
      expect(imperialOutput).toEqual(result);
    });
  });

  describe('13. Integration: Full v6 Execution', () => {
    it('should produce complete SuperIntelligenceOutput', async () => {
      const { result, intelligence, dynamic } = await calculateMacrosV6(maleInput);

      expect(result.bmr).toBeDefined();
      expect(result.tdee).toBeDefined();
      expect(result.targetCalories).toBeDefined();
      expect(result.proteinGrams).toBeDefined();
      expect(result.phase).toBe('maintenance');

      expect(intelligence.brainType).toBe('analytical');
      expect(intelligence.confidence).toBeNull();
      expect(intelligence.crossToolLinks).toEqual([]);
      expect(intelligence.top3Reasoning).toHaveLength(3);
      expect(intelligence.scenarios.length).toBeGreaterThanOrEqual(2);
      expect(intelligence.warnings.length).toBeGreaterThanOrEqual(0);

      expect(dynamic.completeness).toBe('full');
      expect(dynamic.fullOutput).toBeDefined();
      expect(dynamic.goldenRulesApplied).toHaveLength(7);
      expect(dynamic.missingRequiredFields).toEqual([]);
    });

    it('returns EMPTY without creating calculated outputs when no required inputs are provided', async () => {
      const response = await calculateMacrosV6({});
      expect('result' in response).toBe(false);
      expect('intelligence' in response).toBe(false);
      expect(response.dynamic.completeness).toBe('empty');
      expect(response.dynamic.missingRequiredFields).toEqual(['age', 'sex', 'heightCm', 'weightKg', 'activityLevel', 'phase']);
      expect(response.dynamic.minimumViableOutput).toEqual({});
      expect(response.dynamic.whatIfScenarios).toEqual([]);
    });

    it('returns PARTIAL and lists missing inputs without calculating', async () => {
      const response = await calculateMacrosV6({ age: 28, sex: 'male' });
      expect('result' in response).toBe(false);
      expect(response.dynamic.completeness).toBe('partial');
      expect(response.dynamic.missingRequiredFields).toEqual(['heightCm', 'weightKg', 'activityLevel', 'phase']);
      expect(response.dynamic.minimumViableOutput).toEqual({});
      expect(response.dynamic.whatIfScenarios).toEqual([]);
    });

    it('recalculates a partial result into a full result after required values are supplied', async () => {
      const response = await calculateMacrosV6({ age: 28, sex: 'male' });
      const recalculated = await response.dynamic.recalculate({
        heightCm: 180,
        weightKg: 85,
        activityLevel: 1.55,
        phase: 'maintenance',
      });
      expect(recalculated.completeness).toBe('full');
      expect(recalculated.missingRequiredFields).toEqual([]);
      expect(recalculated.fullOutput).toBeDefined();
    });

    it('rejects invalid supplied values even while other required values are missing', async () => {
      await expect(calculateMacrosV6({ age: 0 })).rejects.toThrow(/age must be between 19 and 100/);
    });

    it('should produce stable calculated values and omit unmeasured runtime metadata', async () => {
      const first = await calculateMacrosV6(maleInput);
      const second = await calculateMacrosV6(maleInput);
      expect(first.result).toEqual(second.result);
      expect(first.intelligence.computationTimeMs).toBeNull();
    });

    it('should support live recalculation', async () => {
      const { dynamic } = await calculateMacrosV6(maleInput);
      const recalculated = await dynamic.recalculate({ phase: 'bulk' as const });
      expect(recalculated.fullOutput!.targetCalories).toBeGreaterThan(
        dynamic.fullOutput!.targetCalories
      );
    });

    it('should include minimumViableOutput in dynamic result', async () => {
      const { dynamic } = await calculateMacrosV6(maleInput);
      expect(dynamic.minimumViableOutput).toBeDefined();
      expect(dynamic.minimumViableOutput.bmr).toBeDefined();
      expect(dynamic.minimumViableOutput.targetCalories).toBeDefined();
      expect(dynamic.minimumViableOutput.proteinGrams).toBeDefined();
    });

    it('should include v6 enriched fields in full output', async () => {
      const { result } = await calculateMacrosV6(maleInput);
      expect(result.caloriesPerKg).toBeDefined();
      expect(result.proteinPerKg).toBeDefined();
      expect(result.weeklyWeightChangeKg).toBeNull();
      expect(result.dietAdherenceScore).toBeNull();
      expect(result.mealTimingSuggestions).toEqual([]);
    });
  });
});
