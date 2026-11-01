/**
 * lib/tools/engines/macro.v6.ts
 * ═════════════════════════════════════════════════════════════════════════════════
 *  Tool #1 — Adaptive Macro Calculator (v6 GENIUS)
 * ═════════════════════════════════════════════════════════════════════════════════
 *  - Super Intelligence Layer: brainType, crossToolLinks, confidence, reasoning Top3, scenarios, whatIf, warnings
 *  - Dynamic Results: Empty→Partial→Full + Live Recalc + What-If Slider + 7 Golden Rules
 *  - Cross-Tool Links: BodyFat, Genetic Potential, Timeline, etc.
 *  - Math Engine documented with focused tests in macro.v6.test.ts
 *  - PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O.
 */

import type { UnitSystem, MacroInput, MacroOutput } from './macro';
import type { MathEngine, ValidationResult, ValidationWarning, ValidationError } from '../../engines/core/v6/ai-orchestrator.v6';
import { GOLDEN_RULES, type GoldenRuleApplication } from '../../engines/core/v6/ai-orchestrator.v6';
import { MacroInputV6PartialSchema, MacroInputV6Schema } from '../schemas/macro.v6';

// ============================================================
// TYPES — v6 Genius Extensions
// ============================================================

export interface MacroInputV6 extends MacroInput {
  goal?: 'cut' | 'maintain' | 'bulk' | 'recomp';
  targetBodyFatPct?: number;
  leanMassKg?: number;
  dietPreference?: 'balanced' | 'high-protein' | 'low-carb' | 'ketogenic' | 'high-carb';
}

export interface MacroOutputV6 extends MacroOutput {
  /** Deterministic equation result; never a statistical estimate or prediction. */
  resultType: 'CALCULATED';
  caloriesPerKg: number;
  proteinPerKg: number;
  fatPerKg: number;
  carbsPerKg: number;
  /** No weight-change model is specified; null prevents a fabricated estimate. */
  weeklyWeightChangeKg: number | null;
  /** No adherence model is calibrated for this engine. */
  dietAdherenceScore: number | null;
  mealTimingSuggestions: string[];
  assumptions: string[];
}

export interface SuperIntelligenceLayer {
  brainType: 'analytical' | 'heuristic' | 'hybrid' | 'ml-assisted' | 'community';
  crossToolLinks: CrossToolLinkV6[];
  confidence: number | null;
  reasoning: ReasoningTraceV6;
  top3Reasoning: Top3ReasoningV6[];
  scenarios: WhatIfScenarioV6[];
  whatIf: WhatIfEngineV6;
  warnings: SafetyWarningV6[];
  goldenRulesApplied: GoldenRuleApplication[];
  computationTimeMs: number | null;
  equationVersion: string;
  dataFreshness: FreshnessReportV6;
}

export interface CrossToolLinkV6 {
  targetToolId: string;
  relationship: 'feeds' | 'consumes' | 'validates' | 'enriches' | 'alternates' | 'sequences';
  strength: number;
  description: string;
  dataMapping: { sourceField: string; targetField: string; transform: string };
  freshness: 'realtime' | 'session' | 'daily' | 'on-demand' | 'manual';
}

export interface ReasoningTraceV6 {
  toolId: string;
  equationId: string;
  steps: ReasoningStepV6[];
  finalConfidence: number | null;
  uncertaintySources: UncertaintySourceV6[];
  alternativePaths: AlternativePathV6[];
}

export interface ReasoningStepV6 {
  step: number;
  description: string;
  formula: string;
  inputs: Record<string, number>;
  intermediateResult: number;
  confidence: number | null;
}

export interface UncertaintySourceV6 {
  source: 'measurement_error' | 'formula_limitation' | 'population_variance' | 'extrapolation' | 'missing_data';
  magnitude: number | null;
  description: string;
  mitigation?: string;
}

export interface AlternativePathV6 {
  equationId: string;
  name: string;
  result: number | null;
  confidence: number | null;
  reasonForDifference: string;
}

export interface Top3ReasoningV6 {
  rank: 1 | 2 | 3;
  factor: string;
  contribution: number | null;
  /** Local deterministic elasticity from finite differences; not causal effect or confidence. */
  localElasticity: number;
  explanation: string;
  confidence: number | null;
}

export type MacroSensitivityInputKeyV6 = 'weightKg' | 'heightCm' | 'age' | 'activityLevel';
export type MacroSensitivityOutputKeyV6 = 'bmr' | 'tdee' | 'targetCalories' | 'proteinGrams';

/** Deterministic finite-difference sensitivity; intentionally has no confidence field. */
export interface MacroSensitivityReportV6 {
  input: MacroSensitivityInputKeyV6;
  output: MacroSensitivityOutputKeyV6;
  elasticity: number;
  partialDerivative: number;
}

type MacroMathEngineV6 = Omit<MathEngine<MacroInputV6, MacroOutputV6>, 'sensitivityAnalysis'> & {
  sensitivityAnalysis(input: MacroInputV6): MacroSensitivityReportV6[];
};

interface WhatIfScenarioBaseV6 {
  id: string;
  label: string;
  description: string;
  /** Numeric changes only; categorical changes such as phase are in inputChanges. */
  inputDeltas: Record<string, number>;
  inputChanges: Record<string, number | string>;
  /** Statistical confidence is not estimated by this deterministic calculator. */
  confidence: number | null;
}

export type WhatIfScenarioV6 = WhatIfScenarioBaseV6 & (
  | { resultType: 'CALCULATED'; calculatedOutput: MacroOutputV6 }
  | {
      resultType: 'NOT_AVAILABLE';
      reasonCode: 'INFEASIBLE_MACRO_DISTRIBUTION';
      reason: string;
    }
);

export interface WhatIfEngineV6 {
  adjustInput(inputKey: string, newValue: number): WhatIfScenarioV6;
  adjustPercentage(inputKey: string, percentChange: number): WhatIfScenarioV6;
  getSliderConfig(inputKey: string): SliderConfigV6;
}

export interface SliderConfigV6 {
  min: number;
  max: number;
  step: number;
  unit: string;
  label: string;
  markers: SliderMarkerV6[];
}

export interface SliderMarkerV6 {
  value: number;
  label: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
  description: string;
}

export interface SafetyWarningV6 {
  level: 'info' | 'caution' | 'warning' | 'critical';
  code: string;
  message: string;
  action?: string;
  relatedTools?: string[];
}

export interface FreshnessReportV6 {
  sourceToolId: string;
  lastUpdated: number | null;
  policy: 'realtime' | 'session' | 'daily' | 'on-demand' | 'manual';
  isStale: boolean;
  stalenessScore: number;
}

export interface DynamicResultV6 {
  completeness: 'empty' | 'partial' | 'full';
  missingRequiredFields: Array<'age' | 'sex' | 'heightCm' | 'weightKg' | 'activityLevel' | 'phase'>;
  minimumViableOutput: Partial<MacroOutputV6>;
  fullOutput?: MacroOutputV6;
  whatIfScenarios: WhatIfScenarioV6[];
  goldenRulesApplied: GoldenRuleApplication[];
  recalculate: (newInputs: Partial<MacroInputV6>) => DynamicResultV6 | Promise<DynamicResultV6>;
}

export interface MacroCalculationResultV6 {
  result: MacroOutputV6;
  intelligence: SuperIntelligenceLayer;
  dynamic: DynamicResultV6;
  linkedValidation?: import('@/lib/shared/cross-tool-link').ValidationOutcome;
}

export interface IncompleteMacroCalculationResultV6 {
  dynamic: DynamicResultV6;
  linkedValidation?: import('@/lib/shared/cross-tool-link').ValidationOutcome;
}

export type MacroCalculationResponseV6 = MacroCalculationResultV6 | IncompleteMacroCalculationResultV6;

// ============================================================
// MATH ENGINE — Layer 1 (Documented & Validated)
// ============================================================

const REQUIRED_MACRO_FIELDS = ['age', 'sex', 'heightCm', 'weightKg', 'activityLevel', 'phase'] as const;
type RequiredMacroField = (typeof REQUIRED_MACRO_FIELDS)[number];

function getMissingRequiredFields(input: Partial<MacroInputV6>): RequiredMacroField[] {
  return REQUIRED_MACRO_FIELDS.filter(field => input[field] === undefined || input[field] === null);
}

function assessCompleteness(input: Partial<MacroInputV6>): 'empty' | 'partial' | 'full' {
  const missing = getMissingRequiredFields(input);
  if (missing.length === REQUIRED_MACRO_FIELDS.length) return 'empty';
  if (missing.length > 0) return 'partial';
  return 'full';
}

function validateMacroInput(input: Partial<MacroInputV6>, allowMissing = false): ValidationResult {
  const schema = allowMissing ? MacroInputV6PartialSchema : MacroInputV6Schema;
  const parsed = schema.safeParse(input);
  const errors: ValidationError[] = parsed.success ? [] : parsed.error.issues.map((issue) => {
    const field = typeof issue.path[0] === 'string' || typeof issue.path[0] === 'number'
      ? String(issue.path[0])
      : 'inputs';
    const value = (input as Record<string, unknown>)[field];
    const requiredMissing = !allowMissing
      && REQUIRED_MACRO_FIELDS.includes(field as RequiredMacroField)
      && (value === undefined || value === null);
    const nonFinite = typeof value === 'number' && !Number.isFinite(value);
    const code: ValidationError['code'] = requiredMissing
      ? 'REQUIRED'
      : nonFinite
        ? 'NAN_RESULT'
        : issue.code === 'too_small' || issue.code === 'too_big'
          ? 'OUT_OF_RANGE'
          : issue.code === 'custom'
            ? field === 'goal' && issue.message.includes('no approved')
              ? 'INVALID_TYPE'
              : field === 'phase' && issue.message.includes('no approved')
                ? 'INVALID_TYPE'
                : 'LOGICAL_CONTRADICTION'
            : 'INVALID_TYPE';
    return { field, code, message: requiredMissing ? `${field} is required` : issue.message, severity: 'error' };
  });
  const warnings: ValidationWarning[] = [];

  // The reference equation was derived from adults aged 19–78. Do not apply
  // this adult calorie model to minors; older adults remain explicitly marked
  // as extrapolation by generateWarnings below.
  if (errors.length === 0 && getMissingRequiredFields(input).length === 0) {
    const bmr = input.sex === 'male'
      ? 10 * input.weightKg! + 6.25 * input.heightCm! - 5 * input.age! + 5
      : 10 * input.weightKg! + 6.25 * input.heightCm! - 5 * input.age! - 161;
    if (!Number.isFinite(bmr) || bmr <= 0) {
      errors.push({ field: 'inputs', code: 'NAN_RESULT', message: 'Inputs do not produce a positive finite BMR', severity: 'error' });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

const MACRO_MATH_ENGINE: MacroMathEngineV6 = {
  equationId: 'mifflin-st-jeor-macro-v1',
  equationName: 'Mifflin-St Jeor BMR + TDEE + Phase-Based Macro Split',
  formulaLatex: `
\\text{BMR}_{male} = 10 \\times w + 6.25 \\times h - 5 \\times a + 5

\\text{BMR}_{female} = 10 \\times w + 6.25 \\times h - 5 \\times a - 161

\\text{TDEE} = \\text{BMR} \\times \\text{ActivityMultiplier}

\\text{TargetCalories} = \\text{TDEE} \\times \\text{PhaseMultiplier}

\\text{Protein}_g = \\text{WeightKg} \\times 2.2

\\text{Fat}_g = \\text{WeightKg} \\times 0.9

\\text{Carbs}_g = \\frac{\\text{TargetCalories} - 4\\times\\text{Protein}_g - 9\\times\\text{Fat}_g}{4}
  `.trim(),
  formulaDescription: 'Mifflin-St Jeor BMR, user-selected activity multiplier for TDEE, SPEC v3 phase adjustment, fixed protein/fat per kg, and carbohydrate from remaining calories',
  validate: (input: MacroInputV6): ValidationResult => validateMacroInput(input),
  calculate: (input: MacroInputV6): MacroOutputV6 => {
    const validation = MACRO_MATH_ENGINE.validate(input);
    if (!validation.valid) {
      throw new RangeError(`Invalid macro inputs: ${validation.errors.map(error => error.message).join('; ')}`);
    }

    const { weightKg, heightCm, age, sex, activityLevel } = input;
    const phase = input.phase as 'bulk' | 'cut' | 'maintenance';

    // BMR (Mifflin-St Jeor)
    let bmr: number;
    if (sex === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }
    bmr = Math.round(bmr);

    // TDEE
    const tdee = Math.round(bmr * activityLevel);

    // Phase-based calorie adjustment
    const phaseMultipliers = { bulk: 1.15, cut: 0.85, maintenance: 1.0 };
    const phaseMultiplier = phaseMultipliers[phase];
    const targetCalories = Math.round(tdee * phaseMultiplier);

    // SPEC v3 fixed gram assumptions: protein = 2.2 g/kg; fat = 0.9 g/kg;
    // carbohydrate uses the remaining target calories. Unsupported phases were
    // rejected by validation above, before the narrowed phase multiplier lookup.
    const proteinGrams = Math.round(weightKg * 2.2);
    const fatGrams = Math.round(weightKg * 0.9);
    const carbsGrams = Math.round((targetCalories - proteinGrams * 4 - fatGrams * 9) / 4);
    if (targetCalories <= 0 || carbsGrams < 0) {
      throw new RangeError('Inputs do not produce a feasible non-negative macro distribution');
    }
    const proteinPct = Math.round((proteinGrams * 4 / targetCalories) * 100);
    const fatPct = Math.round((fatGrams * 9 / targetCalories) * 100);
    const carbsPct = Math.round((carbsGrams * 4 / targetCalories) * 100);
    // Per-kg values
    const caloriesPerKg = Math.round((targetCalories / weightKg) * 10) / 10;
    const proteinPerKg = Math.round((proteinGrams / weightKg) * 10) / 10;
    const fatPerKg = Math.round((fatGrams / weightKg) * 10) / 10;
    const carbsPerKg = Math.round((carbsGrams / weightKg) * 10) / 10;
    const contextOnlyFields = [
      input.goal !== undefined ? 'goal' : null,
      input.targetBodyFatPct !== undefined ? 'targetBodyFatPct' : null,
      input.leanMassKg !== undefined ? 'leanMassKg' : null,
      input.dietPreference !== undefined ? 'dietPreference' : null,
      input.targetWeightKg !== undefined ? 'targetWeightKg' : null,
    ].filter((field): field is string => field !== null);

    const output: MacroOutputV6 = {
      resultType: 'CALCULATED',
      bmr,
      tdee,
      targetCalories,
      proteinGrams,
      carbsGrams,
      fatGrams,
      phase: input.phase,
      macros: {
        protein: { grams: proteinGrams, calories: proteinGrams * 4, pct: proteinPct },
        carbs: { grams: carbsGrams, calories: carbsGrams * 4, pct: carbsPct },
        fat: { grams: fatGrams, calories: fatGrams * 9, pct: fatPct },
      },
      caloriesPerKg,
      proteinPerKg,
      fatPerKg,
      carbsPerKg,
      weeklyWeightChangeKg: null,
      dietAdherenceScore: null,
      mealTimingSuggestions: [],
      assumptions: [
        'BMR uses the sex-specific Mifflin-St Jeor equation.',
        'Bulk uses a 15% TDEE increase; cut uses a 15% decrease; maintenance uses TDEE.',
        'Recomposition is unsupported because SPEC v3 does not define an approved equation for this phase.',
        'Protein is 2.2 g/kg and fat is 0.9 g/kg; carbohydrate fills remaining target calories.',
        'Activity factor is user-selected within 1.2–1.9; the result is an arithmetic estimate, not a medical assessment.',
        ...(contextOnlyFields.length > 0
          ? [`Optional context fields (${contextOnlyFields.join(', ')}) are validated but do not change this calculation.`]
          : []),
      ],
    };

    const numericResults = [output.bmr, output.tdee, output.targetCalories, proteinGrams, fatGrams, carbsGrams];
    if (!numericResults.every(Number.isFinite)) {
      throw new RangeError('Macro calculation produced a non-finite result');
    }

    return output;
  },
  sensitivityAnalysis: (input: MacroInputV6): MacroSensitivityReportV6[] => {
    const base = MACRO_MATH_ENGINE.calculate(input);
    const specs = [
      { key: 'weightKg', value: input.weightKg, delta: 1, min: 30, max: 300 },
      { key: 'heightCm', value: input.heightCm, delta: 1, min: 100, max: 250 },
      { key: 'age', value: input.age, delta: 1, min: 19, max: 100 },
      // Match the UI's activity-factor increment so integer TDEE rounding has
      // less influence on the local finite-difference derivative.
      { key: 'activityLevel', value: input.activityLevel, delta: 0.05, min: 1.2, max: 1.9 },
    ] as const;
    const outputKeys = ['bmr', 'tdee', 'targetCalories', 'proteinGrams'] as const;
    const reports: MacroSensitivityReportV6[] = [];

    for (const spec of specs) {
      const upwardRoom = spec.max - spec.value;
      const downwardRoom = spec.value - spec.min;
      const delta = upwardRoom > 0
        ? Math.min(spec.delta, upwardRoom)
        : -Math.min(spec.delta, downwardRoom);
      if (delta === 0) continue;
      if (upwardRoom <= 0 && downwardRoom > 0) {
        // At an upper bound use a backward finite difference instead of
        // omitting the factor. Preserve the signed delta for elasticity.
        const perturbedInput: MacroInputV6 = { ...input, [spec.key]: spec.value + delta };
        const perturbed = MACRO_MATH_ENGINE.calculate(perturbedInput);
        for (const key of outputKeys) {
          const baseValue = base[key];
          const changedValue = perturbed[key];
          const pctInput = delta / spec.value * 100;
          const pctOutput = baseValue === 0 ? 0 : (changedValue - baseValue) / baseValue * 100;
          reports.push({
            input: spec.key,
            output: key,
            elasticity: pctInput === 0 ? 0 : pctOutput / pctInput,
            partialDerivative: (changedValue - baseValue) / delta,
          });
        }
        continue;
      }
      const perturbedInput: MacroInputV6 = { ...input, [spec.key]: spec.value + delta };
      const perturbed = MACRO_MATH_ENGINE.calculate(perturbedInput);
      for (const key of outputKeys) {
        const baseValue = base[key];
        const changedValue = perturbed[key];
        const pctInput = delta / spec.value * 100;
        const pctOutput = baseValue === 0 ? 0 : (changedValue - baseValue) / baseValue * 100;
        reports.push({
          input: spec.key,
          output: key,
          elasticity: pctInput === 0 ? 0 : pctOutput / pctInput,
          partialDerivative: (changedValue - baseValue) / delta,
        });
      }
    }
    return reports;
  },
  toMetric: (input: MacroInputV6) => input,
  toImperial: (input: MacroInputV6) => input,
};

// ============================================================
// LAYER 2: DYNAMIC ENGINE
// ============================================================

function validateProvidedMacroInput(input: Partial<MacroInputV6>): ValidationError[] {
  return validateMacroInput(input, true).errors;
}

function extractMinimumViable(output: MacroOutputV6): Partial<MacroOutputV6> {
  return {
    bmr: output.bmr,
    tdee: output.tdee,
    targetCalories: output.targetCalories,
    proteinGrams: output.proteinGrams,
  };
}

const INFEASIBLE_MACRO_DISTRIBUTION_MESSAGE = 'Inputs do not produce a feasible non-negative macro distribution';

function createWhatIfScenario(
  metadata: Omit<WhatIfScenarioBaseV6, 'confidence'>,
  calculate: () => MacroOutputV6,
): WhatIfScenarioV6 {
  try {
    return {
      ...metadata,
      calculatedOutput: calculate(),
      confidence: null,
      resultType: 'CALCULATED',
    };
  } catch (error) {
    if (!(error instanceof RangeError) || error.message !== INFEASIBLE_MACRO_DISTRIBUTION_MESSAGE) {
      throw error;
    }
    return {
      ...metadata,
      confidence: null,
      resultType: 'NOT_AVAILABLE',
      reasonCode: 'INFEASIBLE_MACRO_DISTRIBUTION',
      reason: error.message,
    };
  }
}

function generateWhatIfScenarios(input: MacroInputV6, _output: MacroOutputV6): WhatIfScenarioV6[] {
  const scenarios: WhatIfScenarioV6[] = [];

  const cutTargetConflicts = input.targetWeightKg !== undefined && input.targetWeightKg >= input.weightKg;
  const cutInput = {
    ...input,
    ...(cutTargetConflicts ? { targetWeightKg: undefined } : {}),
    phase: 'cut' as const,
    ...(input.goal !== undefined ? { goal: 'cut' as const } : {}),
  };
  scenarios.push(createWhatIfScenario({
    id: 'switch-to-cut',
    label: 'Switch to Cut phase',
    description: `Calculate target calories using a 15% TDEE reduction; this is an arithmetic scenario only${cutTargetConflicts ? '. The incompatible optional target weight is omitted for this phase comparison.' : ''}`,
    inputDeltas: {},
    inputChanges: {
      phase: 'cut',
      ...(input.goal !== undefined ? { goal: 'cut' } : {}),
      ...(cutTargetConflicts ? { targetWeightKg: 'omitted because it conflicts with cut phase' } : {}),
    },
  }, () => MACRO_MATH_ENGINE.calculate(cutInput)));

  const bulkTargetConflicts = input.targetWeightKg !== undefined && input.targetWeightKg <= input.weightKg;
  const bulkInput = {
    ...input,
    ...(bulkTargetConflicts ? { targetWeightKg: undefined } : {}),
    phase: 'bulk' as const,
    ...(input.goal !== undefined ? { goal: 'bulk' as const } : {}),
  };
  scenarios.push(createWhatIfScenario({
    id: 'switch-to-bulk',
    label: 'Switch to Bulk phase',
    description: `Increase calories by 15%; the output is an arithmetic scenario only${bulkTargetConflicts ? '. The incompatible optional target weight is omitted for this phase comparison.' : ''}`,
    inputDeltas: {},
    inputChanges: {
      phase: 'bulk',
      ...(input.goal !== undefined ? { goal: 'bulk' } : {}),
      ...(bulkTargetConflicts ? { targetWeightKg: 'omitted because it conflicts with bulk phase' } : {}),
    },
  }, () => MACRO_MATH_ENGINE.calculate(bulkInput)));

  const maintenanceInput = { ...input, phase: 'maintenance' as const, ...(input.goal !== undefined ? { goal: 'maintain' as const } : {}) };
  scenarios.push(createWhatIfScenario({
    id: 'switch-to-maintenance',
    label: 'Switch to Maintenance phase',
    description: 'Recalculate at the TDEE value; this is an arithmetic scenario only',
    inputDeltas: {},
    inputChanges: { phase: 'maintenance', ...(input.goal !== undefined ? { goal: 'maintain' } : {}) },
  }, () => MACRO_MATH_ENGINE.calculate(maintenanceInput)));

  if (input.weightKg >= 40) {
    const lose10kg = input.weightKg - 10;
    const loseTargetConflicts = input.targetWeightKg !== undefined && (
      (input.phase === 'cut' && input.targetWeightKg >= lose10kg)
      || (input.phase === 'bulk' && input.targetWeightKg <= lose10kg)
    );
    const lose10kgInput = {
      ...input,
      ...(loseTargetConflicts ? { targetWeightKg: undefined } : {}),
      weightKg: lose10kg,
    };
    scenarios.push(createWhatIfScenario({
      id: 'weight-minus-10kg',
      label: 'Recalculate at 10kg lower weight',
      description: `Deterministic recalculation at -10kg; no time course is modeled${loseTargetConflicts ? '. The incompatible optional target weight is omitted for this scenario.' : ''}`,
      inputDeltas: { weightKg: -10 },
      inputChanges: {
        weightKg: lose10kgInput.weightKg,
        ...(loseTargetConflicts ? { targetWeightKg: 'omitted because it conflicts with the changed weight' } : {}),
      },
    }, () => MACRO_MATH_ENGINE.calculate(lose10kgInput)));
  }

  if (input.weightKg <= 290) {
    const gain10kg = input.weightKg + 10;
    const gainTargetConflicts = input.targetWeightKg !== undefined && (
      (input.phase === 'cut' && input.targetWeightKg >= gain10kg)
      || (input.phase === 'bulk' && input.targetWeightKg <= gain10kg)
    );
    const gain10kgInput = {
      ...input,
      ...(gainTargetConflicts ? { targetWeightKg: undefined } : {}),
      weightKg: gain10kg,
    };
    scenarios.push(createWhatIfScenario({
      id: 'weight-plus-10kg',
      label: 'Recalculate at 10kg higher weight',
      description: `Deterministic recalculation at +10kg; no time course is modeled${gainTargetConflicts ? '. The incompatible optional target weight is omitted for this scenario.' : ''}`,
      inputDeltas: { weightKg: 10 },
      inputChanges: {
        weightKg: gain10kgInput.weightKg,
        ...(gainTargetConflicts ? { targetWeightKg: 'omitted because it conflicts with the changed weight' } : {}),
      },
    }, () => MACRO_MATH_ENGINE.calculate(gain10kgInput)));
  }

  return scenarios;
}

function applyGoldenRules(input: MacroInputV6, output: MacroOutputV6): GoldenRuleApplication[] {
  const calorieTotal = output.macros.protein.calories + output.macros.carbs.calories + output.macros.fat.calories;
  const checks: Record<string, boolean> = {
    GR1: input.unitSystem === undefined || input.unitSystem === 'metric' || input.unitSystem === 'imperial',
    GR2: MACRO_MATH_ENGINE.validate(input).valid,
    GR3: [input.age, input.heightCm, input.weightKg, input.activityLevel].every(Number.isFinite),
    GR4: [output.bmr, output.tdee, output.targetCalories, output.proteinGrams, output.carbsGrams, output.fatGrams].every(Number.isFinite),
    GR5: Math.abs(calorieTotal - output.targetCalories) <= Math.max(10, output.targetCalories * 0.01),
    GR6: output.proteinGrams >= 0 && output.carbsGrams >= 0 && output.fatGrams >= 0,
    GR7: output.assumptions.length > 0,
  };
  return GOLDEN_RULES.map(rule => {
    const applied = checks[rule.id] ?? false;
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      description: rule.description,
      applied,
      impact: applied ? 'positive' as const : 'negative' as const,
      detail: applied ? `${rule.id} check passed for this calculation` : `${rule.id} check did not pass`,
    };
  });
}

// ============================================================
// LAYER 3: CROSS-TOOL LINKS
// ============================================================

// There are no implemented outbound Macro v6 data flows. The optional Body Fat
// import is inbound and is reported through linkedValidation, so do not publish
// speculative or self-referential outbound graph edges here.
const CROSS_TOOL_LINKS: CrossToolLinkV6[] = [];

// ============================================================
// LAYER 5: EXPLAINABLE AI — Reasoning
// ============================================================

function buildReasoningTrace(input: MacroInputV6, output: MacroOutputV6): ReasoningTraceV6 {
  const bmrFormula = input.sex === 'male'
    ? '10*weight + 6.25*height - 5*age + 5'
    : '10*weight + 6.25*height - 5*age - 161';

  return {
    toolId: 'mrx.tool.macro',
    equationId: 'mifflin-st-jeor-macro-v1',
    steps: [
      {
        step: 1,
        description: 'Calculate BMR using Mifflin-St Jeor equation',
        formula: bmrFormula,
        inputs: { weightKg: input.weightKg, heightCm: input.heightCm, age: input.age },
        intermediateResult: output.bmr,
        confidence: null,
      },
      {
        step: 2,
        description: 'Calculate TDEE with activity multiplier',
        formula: 'BMR × activityLevel',
        inputs: { bmr: output.bmr, activityLevel: input.activityLevel },
        intermediateResult: output.tdee,
        confidence: null,
      },
      {
        step: 3,
        description: 'Apply phase-based calorie adjustment',
        formula: 'TDEE × phaseMultiplier',
        inputs: { tdee: output.tdee, phaseMultiplier: output.targetCalories / output.tdee },
        intermediateResult: output.targetCalories,
        confidence: null,
      },
      {
        step: 4,
        description: 'Split calories into macros (protein/fat/carbs)',
        formula: 'Calories × macroPct ÷ kcalPerGram',
        inputs: { targetCalories: output.targetCalories, proteinPct: output.macros.protein.pct / 100 },
        intermediateResult: output.proteinGrams,
        confidence: null,
      },
    ],
    finalConfidence: null,
    uncertaintySources: [
      {
        source: 'formula_limitation',
        magnitude: null,
        description: 'Mifflin-St Jeor is a population equation and can differ from measured energy expenditure',
      },
      {
        source: 'population_variance',
        magnitude: null,
        description: 'Activity factor is user-selected and is not measured by this calculator',
      },
      {
        source: 'missing_data',
        magnitude: null,
        description: 'Lean mass and target body-fat fields are not used by the current specified equations',
      },
    ],
    alternativePaths: [],
  };
}
function extractTop3ReasoningV6(_reasoning: ReasoningTraceV6, input: MacroInputV6): Top3ReasoningV6[] {
  const factors = MACRO_MATH_ENGINE.sensitivityAnalysis(input)
    .filter(item => item.output === 'targetCalories')
    .sort((a, b) => Math.abs(b.elasticity) - Math.abs(a.elasticity))
    .slice(0, 3);
  return factors.map((item, index) => ({
    rank: (index + 1) as 1 | 2 | 3,
    factor: item.input,
    contribution: null,
    localElasticity: item.elasticity,
    explanation: `A local +1% change in ${item.input} changed target calories by ${item.elasticity.toFixed(2)}% in the deterministic calculation; this is not a causal estimate.`,
    confidence: null,
  }));
}

// ============================================================
// WHAT-IF ENGINE
// ============================================================

function buildWhatIfEngine(input: MacroInputV6, output: MacroOutputV6): WhatIfEngineV6 {
  const getSliderConfig = (inputKey: string): SliderConfigV6 => {
    const supportedInputKeys = ['weightKg', 'heightCm', 'age', 'activityLevel', 'tdee'];
    if (!supportedInputKeys.includes(inputKey)) {
      throw new RangeError(`What-If does not support input: ${inputKey}`);
    }
    const currentValue = inputKey === 'tdee'
      ? output.tdee
      : input[inputKey as keyof MacroInputV6] as number;
    const ranges: Record<string, { min: number; max: number; step: number }> = {
      weightKg: { min: Math.max(30, currentValue - 10), max: Math.min(300, currentValue + 10), step: 0.5 },
      heightCm: { min: Math.max(100, currentValue - 10), max: Math.min(250, currentValue + 10), step: 1 },
      age: { min: Math.max(19, currentValue - 10), max: Math.min(100, currentValue + 10), step: 1 },
      activityLevel: { min: 1.2, max: 1.9, step: 0.05 },
      tdee: { min: Math.round(output.bmr * 1.2), max: Math.round(output.bmr * 1.9), step: 10 },
    };
    const range = ranges[inputKey];

    return {
      min: range.min,
      max: range.max,
      step: range.step,
      unit: inputKey === 'heightCm' ? 'cm' : inputKey === 'activityLevel' ? '×' : inputKey === 'tdee' ? 'kcal/day' : inputKey === 'age' ? 'years' : 'kg',
      label: inputKey,
      markers: [
        { value: range.min, label: 'Low', color: 'green', description: 'Lower-bound arithmetic scenario' },
        { value: currentValue, label: 'Current', color: 'yellow', description: 'Current input value' },
        { value: range.max, label: 'High', color: 'orange', description: 'Upper-bound arithmetic scenario' },
      ],
    };
  };

  const adjustInput = (inputKey: string, newValue: number) => {
    if (!Number.isFinite(newValue)) throw new RangeError('What-If value must be finite');
    const supportedInputKeys = ['weightKg', 'heightCm', 'age', 'activityLevel'];
    if (inputKey !== 'tdee' && !supportedInputKeys.includes(inputKey)) {
      throw new RangeError(`What-If does not support input: ${inputKey}`);
    }
    const allowedRange = getSliderConfig(inputKey);
    if (newValue < allowedRange.min || newValue > allowedRange.max) {
      throw new RangeError(`What-If ${inputKey} must stay within ${allowedRange.min} and ${allowedRange.max}`);
    }
    const newInput = inputKey === 'tdee'
      ? { ...input, activityLevel: Math.min(1.9, Math.max(1.2, newValue / output.bmr)) }
      : { ...input, [inputKey]: newValue } as MacroInputV6;
    return createWhatIfScenario({
      id: `whatif-${inputKey}-${newValue}`,
      label: `${inputKey} = ${newValue}`,
      description: `Deterministic arithmetic result with ${inputKey} set to ${newValue}`,
      inputDeltas: { [inputKey]: newValue - (inputKey === 'tdee' ? output.tdee : input[inputKey as keyof MacroInputV6] as number) },
      inputChanges: inputKey === 'tdee'
        ? { tdee: newValue, activityLevel: newInput.activityLevel }
        : { [inputKey]: newValue },
    }, () => MACRO_MATH_ENGINE.calculate(newInput));
  };

  return {
    adjustInput,
    adjustPercentage: (inputKey: string, percentChange: number) => {
      if (inputKey !== 'tdee' && !['weightKg', 'heightCm', 'age', 'activityLevel'].includes(inputKey)) {
        throw new RangeError(`What-If does not support input: ${inputKey}`);
      }
      const currentValue = inputKey === 'tdee' ? output.tdee : input[inputKey as keyof MacroInputV6] as number;
      const newValue = currentValue * (1 + percentChange / 100);
      return adjustInput(inputKey, newValue);
    },
    getSliderConfig,
  };
}
// ============================================================
// WARNINGS & SAFETY
// ============================================================

function generateWarnings(input: MacroInputV6, output: MacroOutputV6): SafetyWarningV6[] {
  const warnings: SafetyWarningV6[] = [];

  if (input.age < 19 || input.age > 78) {
    warnings.push({
      level: 'caution',
      code: 'AGE_OUTSIDE_ORIGINAL_EQUATION_SAMPLE',
      message: 'The original Mifflin–St Jeor study included healthy adults aged 19–78; applying this equation outside that age range is extrapolation and has not been validated by that study.',
    });
  }

  if (input.phase === 'cut' && output.targetCalories < output.bmr) {
    warnings.push({
      level: 'caution',
      code: 'TARGET_BELOW_ESTIMATED_BMR',
      message: 'The arithmetic target is below estimated BMR; this comparison does not determine nutritional safety or individual needs.',
    });
  }

  return warnings;
}
// ============================================================
// MAIN v6 EXECUTION FUNCTION
// ============================================================

export function calculateMacrosV6(
  input: MacroInputV6,
  userContext?: {
    userId?: string;
    history?: Array<{ toolId: string; outputs: Record<string, unknown> }>;
    preferences?: { unitSystem: UnitSystem; language: 'en' | 'ar' };
  },
  linkedData?: import('@/lib/shared/cross-tool-link').LinkedDataResult
): Promise<MacroCalculationResultV6>;
export function calculateMacrosV6(
  input: Partial<MacroInputV6>,
  userContext?: {
    userId?: string;
    history?: Array<{ toolId: string; outputs: Record<string, unknown> }>;
    preferences?: { unitSystem: UnitSystem; language: 'en' | 'ar' };
  },
  linkedData?: import('@/lib/shared/cross-tool-link').LinkedDataResult
): Promise<MacroCalculationResponseV6>;
export async function calculateMacrosV6(
  input: Partial<MacroInputV6>,
  userContext?: {
    userId?: string;
    history?: Array<{ toolId: string; outputs: Record<string, unknown> }>;
    preferences?: { unitSystem: UnitSystem; language: 'en' | 'ar' };
  },
  linkedData?: import('@/lib/shared/cross-tool-link').LinkedDataResult
): Promise<MacroCalculationResponseV6> {
  // §28.4 — validate & apply linked Body Fat data if provided
  let mergedInput = input;
  let linkedValidation: import('@/lib/shared/cross-tool-link').ValidationOutcome | undefined;
  if (linkedData) {
    const { validateBodyFatForMacro } = await import('../adapters/bodyfat-to-macro');
    linkedValidation = validateBodyFatForMacro(linkedData);
    if (linkedValidation.ok && linkedValidation.convertedValue) {
      const explicitlyProvidedInput = Object.fromEntries(
        Object.entries(input).filter(([, value]) => value !== undefined && value !== null)
      ) as Partial<MacroInputV6>;
      // An explicitly entered value always wins; a selected linked result may
      // fill only fields the user has left blank.
      mergedInput = { ...linkedValidation.convertedValue, ...explicitlyProvidedInput };
    }
  }

  const missingRequiredFields = getMissingRequiredFields(mergedInput);
  if (missingRequiredFields.length > 0) {
    const errors = validateProvidedMacroInput(mergedInput);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(error => error.message).join(', ')}`);
    }
    const completeness = assessCompleteness(mergedInput);
    const dynamic: DynamicResultV6 = {
      completeness,
      missingRequiredFields,
      minimumViableOutput: {},
      whatIfScenarios: [],
      goldenRulesApplied: [],
      recalculate: (newInputs: Partial<MacroInputV6>) =>
        calculateMacrosV6({ ...mergedInput, ...newInputs }, userContext, linkedData).then(response => response.dynamic),
    };
    return { dynamic, linkedValidation };
  }

  const completeInput = mergedInput as MacroInputV6;
  const validation = MACRO_MATH_ENGINE.validate(completeInput);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  const result = MACRO_MATH_ENGINE.calculate(completeInput);

  const reasoning = buildReasoningTrace(completeInput, result);
  const top3Reasoning = extractTop3ReasoningV6(reasoning, completeInput);
  const whatIfEngine = buildWhatIfEngine(completeInput, result);
  const scenarios = generateWhatIfScenarios(completeInput, result);
  const goldenRulesApplied = applyGoldenRules(completeInput, result);
  const warnings = generateWarnings(completeInput, result);

  const completeness = assessCompleteness(completeInput);
  const dynamic: DynamicResultV6 = {
    completeness,
    missingRequiredFields: [],
    minimumViableOutput: extractMinimumViable(result),
    fullOutput: completeness === 'full' ? result : undefined,
    whatIfScenarios: scenarios,
    goldenRulesApplied,
    recalculate: (newInputs: Partial<MacroInputV6>) => {
      const merged = { ...completeInput, ...newInputs };
      return calculateMacrosV6(merged, userContext, linkedData).then(r => r.dynamic);
    },
  };

  const intelligence: SuperIntelligenceLayer = {
    brainType: 'analytical',
    crossToolLinks: CROSS_TOOL_LINKS,
    confidence: null,
    reasoning,
    top3Reasoning,
    scenarios,
    whatIf: whatIfEngine,
    warnings,
    goldenRulesApplied,
    computationTimeMs: null,
    equationVersion: '1.0.0',
    dataFreshness: {
      sourceToolId: 'mrx.tool.macro',
      lastUpdated: null,
      policy: 'session',
      isStale: false,
      stalenessScore: 0,
    },
  };

  return { result, intelligence, dynamic, linkedValidation };
}
// ============================================================
// UNIT CONVERSION HELPERS (Golden Rule #1: No Double Conversion)
// ============================================================

export function convertMacroInput(input: MacroInputV6, _targetUnit: UnitSystem): MacroInputV6 {
  // The engine contract is canonical kg/cm; display formatting belongs to the UI.
  return input;
}

export function convertMacroOutput(output: MacroOutputV6, _targetUnit: UnitSystem): MacroOutputV6 {
  // Keep calculated output canonical; convert only at a presentation boundary.
  return output;
}

// ============================================================
// EXPORTS
// ============================================================

export { MACRO_MATH_ENGINE };
export {
  assessCompleteness,
  extractMinimumViable,
  generateWhatIfScenarios,
  applyGoldenRules,
  buildReasoningTrace,
  extractTop3ReasoningV6,
  buildWhatIfEngine,
  generateWarnings,
};


