/**
 * lib/tools/engines/bodyfat.v6.test.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  12 Tests for Body Fat Calculator v6 Genius
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi } from 'vitest';
import {
  calculateBodyFatV6,
  BODYFAT_MATH_ENGINE,
  convertBodyFatInput,
  convertBodyFatOutput,
  assessCompleteness,
  extractMinimumViable,
  generateWhatIfScenarios,
  applyGoldenRules,
  buildReasoningTrace,
  extractTop3ReasoningV6,
  buildWhatIfEngine,
  generateWarnings,
} from './bodyfat.v6';
import type { BodyFatInputV6, BodyFatOutputV6 } from './bodyfat.v6';

describe('Body Fat Calculator v6 Genius - 12 Tests', () => {
  // Test fixtures
  const maleInput: BodyFatInputV6 = {
    sex: 'male',
    heightCm: 180,
    weightKg: 85,
    neckCm: 38,
    waistCm: 88,
    age: 28,
    activityLevel: 'moderate',
    goal: 'cut',
  };

  const femaleInput: BodyFatInputV6 = {
    sex: 'female',
    heightCm: 165,
    weightKg: 65,
    neckCm: 32,
    waistCm: 75,
    hipCm: 98,
    age: 25,
    activityLevel: 'light',
    goal: 'recomp',
  };

  describe('1. Core Math Engine - Male', () => {
    it('should calculate correct body fat % for male using US Navy formula', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(maleInput);

      // Expected: waist-neck = 50, log10(50)=1.699, log10(180)=2.255
      // Male: 495/(1.0324 - 0.19077*1.699 + 0.15456*2.255) - 450 ≈ 18.5%
      expect(result.bodyFatPercentage).toBeGreaterThan(15);
      expect(result.bodyFatPercentage).toBeLessThan(22);
      expect(result.category).toBeOneOf(['fitness', 'average']);
    });

    it('should calculate FFMI and normalized FFMI correctly', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(maleInput);

      // Lean mass = 85 * (1 - 0.185) = 69.3 kg
      // FFMI = 69.3 / (1.8^2) = 21.3
      // Normalized = 21.3 + 6.1*(1.8-1.8) = 21.3
      expect(result.ffmi).toBeGreaterThan(20);
      expect(result.ffmi).toBeLessThan(23);
      expect(result.normalizedFFMI).toBeCloseTo(result.ffmi, 1);
    });

    it('should calculate BMR using Mifflin-St Jeor', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(maleInput);

      // BMR = 10*85 + 6.25*180 - 5*28 + 5 = 850 + 1125 - 140 + 5 = 1840
      expect(result.bmr).toBeCloseTo(1840, -1); // ±10 kcal
    });

    it('should calculate TDEE with activity multiplier', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(maleInput);

      // TDEE = 1840 * 1.55 = 2852
      expect(result.tdee).toBeCloseTo(2850, -1);
    });

    it('should calculate BMI correctly', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(maleInput);

      // BMI = 85 / (1.8^2) = 26.2
      expect(result.bmi).toBeCloseTo(26.2, 1);
    });
  });

  describe('2. Core Math Engine - Female', () => {
    it('should calculate correct body fat % for female using US Navy formula', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(femaleInput);

      // Expected: waist+hip-neck = 75+98-32 = 141, log10(141)=2.149, log10(165)=2.217
      // Female: 495/(1.29579 - 0.35004*2.149 + 0.22100*2.217) - 450 ≈ 28.9%
      expect(result.bodyFatPercentage).toBeGreaterThan(25);
      expect(result.bodyFatPercentage).toBeLessThan(32);
      expect(result.category).toBeOneOf(['average', 'obese']);
    });

    it('should require hip measurement for females', () => {
      const noHipInput = { ...femaleInput, hipCm: undefined };
      expect(() => BODYFAT_MATH_ENGINE.calculate(noHipInput)).toThrow('Hip measurement required for females');
    });

    it('should calculate female BMR correctly', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(femaleInput);

      // BMR = 10*65 + 6.25*165 - 5*25 - 161 = 650 + 1031.25 - 125 - 161 = 1395
      expect(result.bmr).toBeCloseTo(1395, -1);
    });
  });

  describe('3. Input Validation & Golden Rules', () => {
    it('should reject invalid height (Golden Rule #2)', () => {
      const invalidInput = { ...maleInput, heightCm: 50 };
      const validation = BODYFAT_MATH_ENGINE.validate(invalidInput);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.field === 'heightCm')).toBe(true);
    });

    it('should reject waist <= neck (logical contradiction)', () => {
      const invalidInput = { ...maleInput, waistCm: 35, neckCm: 38 };
      const validation = BODYFAT_MATH_ENGINE.validate(invalidInput);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.message.includes('Waist must be greater'))).toBe(true);
    });

    it('should clamp body fat % to 0-50 range (Golden Rule #6)', () => {
      // Extreme values that would produce out-of-range results
      const extremeInput = { ...maleInput, waistCm: 200, neckCm: 20 };
      const result = BODYFAT_MATH_ENGINE.calculate(extremeInput);
      expect(result.bodyFatPercentage).toBeLessThanOrEqual(50);
      expect(result.bodyFatPercentage).toBeGreaterThanOrEqual(0);
    });

    it('should apply all 7 Golden Rules', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(maleInput);
      const rulesApplied = applyGoldenRules(maleInput, result);
      expect(rulesApplied).toHaveLength(7);
      expect(rulesApplied.every(r => r.applied)).toBe(true);
    });
  });

  describe('4. Sensitivity Analysis', () => {
    it('should show highest sensitivity to waist circumference', () => {
      const sensitivities = BODYFAT_MATH_ENGINE.sensitivityAnalysis(maleInput);
      const waistSensitivity = sensitivities.find(s => s.inputName === 'waistCm' && s.outputName === 'bodyFatPercentage');
      const neckSensitivity = sensitivities.find(s => s.inputName === 'neckCm' && s.outputName === 'bodyFatPercentage');

      expect(waistSensitivity).toBeDefined();
      expect(neckSensitivity).toBeDefined();
      // Waist should have higher absolute elasticity than neck
      expect(Math.abs(waistSensitivity!.elasticity)).toBeGreaterThan(Math.abs(neckSensitivity!.elasticity));
    });

    it('should show positive correlation for waist, negative for neck', () => {
      const sensitivities = BODYFAT_MATH_ENGINE.sensitivityAnalysis(maleInput);
      const waistSensitivity = sensitivities.find(s => s.inputName === 'waistCm' && s.outputName === 'bodyFatPercentage');
      const neckSensitivity = sensitivities.find(s => s.inputName === 'neckCm' && s.outputName === 'bodyFatPercentage');

      expect(waistSensitivity!.correlation).toBeGreaterThan(0); // More waist = more fat
      expect(neckSensitivity!.correlation).toBeLessThan(0); // More neck = less fat %
    });
  });

  describe('5. Dynamic Results - Completeness States', () => {
    it('should return empty when no inputs provided', () => {
      const emptyInput = { sex: undefined, heightCm: 0, weightKg: 0, neckCm: 0, waistCm: 0, hipCm: undefined };
      expect(assessCompleteness(emptyInput)).toBe('empty');
    });

    it('should return partial when some inputs missing', () => {
      const partialInput = { ...maleInput, waistCm: 0 };
      expect(assessCompleteness(partialInput)).toBe('partial');
    });

    it('should return partial for female without hip', () => {
      const partialInput = { ...femaleInput, hipCm: undefined };
      expect(assessCompleteness(partialInput)).toBe('partial');
    });

    it('should return full when all required inputs present', () => {
      expect(assessCompleteness(maleInput)).toBe('full');
      expect(assessCompleteness(femaleInput)).toBe('full');
    });

    it('should extract minimum viable output', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(maleInput);
      const minimal = extractMinimumViable(result);

      expect(minimal.bodyFatPercentage).toBeDefined();
      expect(minimal.category).toBeDefined();
      expect(minimal.leanBodyMassKg).toBeDefined();
      expect(minimal.fatMassKg).toBeDefined();
      expect(minimal.ffmi).toBeUndefined(); // Not in minimal
      expect(minimal.bmi).toBeUndefined(); // Not in minimal
    });
  });

  describe('6. What-If Scenarios', () => {
    it('should generate lose 5kg scenario', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(maleInput);
      const scenarios = generateWhatIfScenarios(maleInput, result);

      const lose5kg = scenarios.find(s => s.id === 'lose-5kg-fat');
      expect(lose5kg).toBeDefined();
      expect(lose5kg!.inputDeltas.weightKg).toBe(-5);
      expect(lose5kg!.predictedOutput.bodyFatPercentage).toBeLessThan(result.bodyFatPercentage);
      expect(lose5kg!.confidence).toBe(0.85);
    });

    it('should generate gain 3kg muscle scenario', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(maleInput);
      const scenarios = generateWhatIfScenarios(maleInput, result);

      const gain3kg = scenarios.find(s => s.id === 'gain-3kg-muscle');
      expect(gain3kg).toBeDefined();
      expect(gain3kg!.inputDeltas.weightKg).toBe(3);
      expect(gain3kg!.predictedOutput.leanBodyMassKg).toBeGreaterThan(result.leanBodyMassKg);
    });

    it('should generate reach ideal BF scenario when fat to lose > 0', () => {
      const highBfInput = { ...maleInput, weightKg: 100, waistCm: 105 };
      const result = BODYFAT_MATH_ENGINE.calculate(highBfInput);
      const scenarios = generateWhatIfScenarios(highBfInput, result);

      const ideal = scenarios.find(s => s.id === 'reach-ideal-bf');
      expect(ideal).toBeDefined();
      // Should significantly reduce body fat % (not necessarily hit exact target)
      expect(ideal!.predictedOutput.bodyFatPercentage).toBeLessThan(result.bodyFatPercentage);
      expect(ideal!.predictedOutput.bodyFatPercentage).toBeLessThan(25); // Meaningful reduction
    });
  });

  describe('7. What-If Engine (Live Recalculation)', () => {
    it('should adjust single input and recalculate', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(maleInput);
      const whatIf = buildWhatIfEngine(maleInput, result);

      const scenario = whatIf.adjustInput('waistCm', 80); // Reduce waist by 8cm
      expect(scenario.predictedOutput.bodyFatPercentage).toBeLessThan(result.bodyFatPercentage);
      expect(scenario.inputDeltas.waistCm).toBe(-8);
    });

    it('should adjust by percentage', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(maleInput);
      const whatIf = buildWhatIfEngine(maleInput, result);

      const scenario = whatIf.adjustPercentage('weightKg', -10); // Lose 10%
      expect(scenario.inputDeltas.weightKg).toBeCloseTo(-8.5, 1); // 10% of 85 = 8.5
      // Weight change affects lean/fat mass but not BF% (waist/neck unchanged)
      expect(scenario.predictedOutput.leanBodyMassKg).toBeLessThan(result.leanBodyMassKg);
      expect(scenario.predictedOutput.fatMassKg).toBeLessThan(result.fatMassKg);
    });

    it('should provide slider config with markers', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(maleInput);
      const whatIf = buildWhatIfEngine(maleInput, result);

      const slider = whatIf.getSliderConfig('waistCm');
      expect(slider.min).toBeLessThan(maleInput.waistCm);
      expect(slider.max).toBeGreaterThan(maleInput.waistCm);
      expect(slider.markers).toHaveLength(3);
      expect(slider.markers.find(m => m.label === 'Current')).toBeDefined();
    });
  });

  describe('8. Cross-Tool Links', () => {
    it('should link to macro calculator with lean mass', async () => {
      const { intelligence } = await calculateBodyFatV6(maleInput);

      const macroLink = intelligence.crossToolLinks.find(l => l.targetToolId === 'mrx.tool.macro');
      expect(macroLink).toBeDefined();
      expect(macroLink!.strength).toBe(0.95);
      expect(macroLink!.dataMapping.sourceField).toBe('leanBodyMassKg');
      expect(macroLink!.dataMapping.targetField).toBe('leanMassKg');
    });

    it('should link to genetic potential with FFMI', async () => {
      const { intelligence } = await calculateBodyFatV6(maleInput);

      const geneticLink = intelligence.crossToolLinks.find(l => l.targetToolId === 'mrx.tool.020-genetic-potential');
      expect(geneticLink).toBeDefined();
      expect(geneticLink!.dataMapping.sourceField).toBe('ffmi');
    });

    it('should link to transformation timeline', async () => {
      const { intelligence } = await calculateBodyFatV6(maleInput);

      const timelineLink = intelligence.crossToolLinks.find(l => l.targetToolId === 'mrx.tool.timeline');
      expect(timelineLink).toBeDefined();
      expect(timelineLink!.dataMapping.sourceField).toBe('bodyFatPercentage');
    });

    it('should have 5 cross-tool links total', async () => {
      const { intelligence } = await calculateBodyFatV6(maleInput);
      expect(intelligence.crossToolLinks).toHaveLength(5);
    });
  });

  describe('9. Explainable AI - Reasoning Trace', () => {
    it('should produce reasoning trace with 3 steps', async () => {
      const { intelligence } = await calculateBodyFatV6(maleInput);

      expect(intelligence.reasoning.steps).toHaveLength(3);
      expect(intelligence.reasoning.steps[0].description).toContain('waist-neck');
      expect(intelligence.reasoning.steps[1].formula).toContain('log10');
      expect(intelligence.reasoning.steps[2].description).toContain('FFMI');
    });

    it('should have final confidence ~0.94', async () => {
      const { intelligence } = await calculateBodyFatV6(maleInput);
      expect(intelligence.reasoning.finalConfidence).toBeCloseTo(0.94, 0.1);
    });

    it('should identify 3 uncertainty sources', async () => {
      const { intelligence } = await calculateBodyFatV6(maleInput);
      expect(intelligence.reasoning.uncertaintySources).toHaveLength(3);

      const sources = intelligence.reasoning.uncertaintySources.map(s => s.source);
      expect(sources).toContain('measurement_error');
      expect(sources).toContain('formula_limitation');
      expect(sources).toContain('population_variance');
    });

    it('should provide 2 alternative paths', async () => {
      const { intelligence } = await calculateBodyFatV6(maleInput);
      expect(intelligence.reasoning.alternativePaths).toHaveLength(2);
      expect(intelligence.reasoning.alternativePaths[0].equationId).toBe('yuhasz-skinfold-v1');
      expect(intelligence.reasoning.alternativePaths[1].equationId).toBe('dexa-gold-standard');
    });
  });

  describe('10. Top-3 Reasoning', () => {
    it('should identify waist-to-neck as #1 factor (65%)', async () => {
      const { intelligence } = await calculateBodyFatV6(maleInput);

      const top1 = intelligence.top3Reasoning.find(r => r.rank === 1);
      expect(top1).toBeDefined();
      expect(top1!.factor).toContain('Waist-to-neck');
      expect(top1!.contribution).toBe(65);
    });

    it('should identify height as #2 factor (20%)', async () => {
      const { intelligence } = await calculateBodyFatV6(maleInput);

      const top2 = intelligence.top3Reasoning.find(r => r.rank === 2);
      expect(top2).toBeDefined();
      expect(top2!.factor).toContain('Height');
      expect(top2!.contribution).toBe(20);
    });

    it('should identify hip as #3 for female (15%)', async () => {
      const { intelligence } = await calculateBodyFatV6(femaleInput);

      const top3 = intelligence.top3Reasoning.find(r => r.rank === 3);
      expect(top3).toBeDefined();
      expect(top3!.factor).toContain('Hip');
      expect(top3!.contribution).toBe(15);
    });
  });

  describe('11. Warnings & Safety', () => {
    it('should warn for obese category', async () => {
      const obeseInput = { ...maleInput, weightKg: 120, waistCm: 120 };
      const { intelligence } = await calculateBodyFatV6(obeseInput);

      const obeseWarning = intelligence.warnings.find(w => w.code === 'OBESE_CATEGORY');
      expect(obeseWarning).toBeDefined();
      expect(obeseWarning!.level).toBe('warning');
      expect(obeseWarning!.relatedTools).toContain('mrx.tool.macro');
    });

    it('should warn for essential fat category', async () => {
      const leanInput = { ...maleInput, weightKg: 65, waistCm: 70 };
      const { intelligence } = await calculateBodyFatV6(leanInput);

      const essentialWarning = intelligence.warnings.find(w => w.code === 'ESSENTIAL_FAT');
      expect(essentialWarning).toBeDefined();
      expect(essentialWarning!.level).toBe('caution');
    });

    it('should warn for high waist circumference', async () => {
      const highWaistInput = { ...maleInput, waistCm: 125 };
      const { intelligence } = await calculateBodyFatV6(highWaistInput);

      const waistWarning = intelligence.warnings.find(w => w.code === 'HIGH_WAIST');
      expect(waistWarning).toBeDefined();
      expect(waistWarning!.action).toContain('waist reduction');
    });

    it('should warn for formula extrapolation at high BF%', async () => {
      // Use very high weight/waist to get >35% BF
      const highBfInput = { ...maleInput, weightKg: 130, waistCm: 130, neckCm: 40 };
      const { intelligence } = await calculateBodyFatV6(highBfInput);

      const extrapolationWarning = intelligence.warnings.find(w => w.code === 'FORMULA_EXTRAPOLATION');
      expect(extrapolationWarning).toBeDefined();
      expect(extrapolationWarning!.action).toContain('DEXA');
    });
  });

  describe('12. Unit Conversion - No Double Conversion (Golden Rule #1)', () => {
    it('should convert metric to imperial for display only', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(maleInput);
      const imperial = convertBodyFatOutput(result, 'imperial');

      // leanBodyMassKg field now contains lbs value (same field name, converted value)
      expect(imperial.leanBodyMassKg).toBeCloseTo(result.leanBodyMassKg * 2.20462, 1);
      expect(imperial.fatMassKg).toBeCloseTo(result.fatMassKg * 2.20462, 1);
      expect(imperial.fatToLoseKg).toBeCloseTo(result.fatToLoseKg * 2.20462, 1);
    });

    it('should convert inputs to imperial for display', () => {
      const imperial = convertBodyFatInput(maleInput, 'imperial');

      // Fields keep same names but values are converted
      expect(imperial.heightCm).toBeCloseTo(180 / 2.54, 1); // 70.9 in
      expect(imperial.weightKg).toBeCloseTo(85 * 2.20462, 1); // 187.4 lbs
      expect(imperial.waistCm).toBeCloseTo(88 / 2.54, 1); // 34.6 in
      expect(imperial.neckCm).toBeCloseTo(38 / 2.54, 1); // 15.0 in
    });

    it('should NOT convert when target is metric', () => {
      const result = BODYFAT_MATH_ENGINE.calculate(maleInput);
      const metric = convertBodyFatOutput(result, 'metric');

      expect(metric.leanBodyMassKg).toBe(result.leanBodyMassKg);
      expect(metric.fatMassKg).toBe(result.fatMassKg);
    });

    it('should preserve original metric values internally', async () => {
      const { result } = await calculateBodyFatV6(maleInput);
      // Internal calculations always in metric - result has original metric values
      expect(result.leanBodyMassKg).toBeLessThan(100); // kg, not lbs
      // The result doesn't have heightCm - it's an output, not input
      expect(result.bodyFatPercentage).toBeGreaterThan(0);
    });
  });

  // Integration test
  describe('Integration: Full v6 Execution', () => {
    it('should produce complete SuperIntelligenceOutput', async () => {
      const { result, intelligence, dynamic } = await calculateBodyFatV6(maleInput);

      // Core result
      expect(result.bodyFatPercentage).toBeDefined();
      expect(result.ffmi).toBeDefined();
      expect(result.category).toBeDefined();

      // Intelligence layer
      expect(intelligence.brainType).toBe('analytical');
      expect(intelligence.confidence).toBeGreaterThan(0.85);
      expect(intelligence.crossToolLinks).toHaveLength(5);
      expect(intelligence.top3Reasoning).toHaveLength(3);
      expect(intelligence.scenarios.length).toBeGreaterThanOrEqual(2);
      expect(intelligence.warnings.length).toBeGreaterThanOrEqual(0);

      // Dynamic result
      expect(dynamic.completeness).toBe('full');
      expect(dynamic.fullOutput).toBeDefined();
      expect(dynamic.goldenRulesApplied).toHaveLength(7);
    });

    it('should compute in under 100ms', async () => {
      const start = performance.now();
      await calculateBodyFatV6(maleInput);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);
    });
  });
});