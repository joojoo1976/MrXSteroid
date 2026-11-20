/**
 * lib/engines/core/v4/profiles/macro-evidence-registry.v4.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Batch C — Additive Macro V4 Evidence, Explanation and Scenario Policy
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Records the evidence, formula trace, assumption rules, qualitative
 *  uncertainty and deterministic scenario boundaries that the accepted adapter
 *  and unchanged Macro V6 already express.
 *
 *  Covered requirements:
 *  - M4-EV-01: Mifflin registry record with population/applicability.
 *  - M4-EV-02: assumption records traceable to governed rule ids.
 *  - M4-EV-03: source review state without an invented review date.
 *  - M4-EV-05: honest qualitative uncertainty and local scenario limits.
 *  - Scenario/What-If/sensitivity limitations and non-causal boundaries.
 *
 *  This module is declaration-only. It does not calculate, cite an unregistered
 *  source, invent confidence, claim scientific validation, persist, log, use AI,
 *  or access the network. Macro V6 remains the sole numeric authority.
 */

import type { AssumptionRecord, UncertaintyRecord } from '../contracts.v4';

export interface MacroEvidenceRecordV4 {
  evidenceId: string;
  sourceType: 'study';
  title: string;
  url: string;
  publishedAt: string;
  reviewedAt: null;
  reviewStatus: 'NOT_REVIEWED';
  applicability: string;
  limitations: readonly string[];
  version: string;
  population: string;
  exclusions: readonly string[];
  equationId: string;
  units: { mass: string; height: string; energy: string };
  evidenceTests: readonly string[];
}

/**
 * Registry record for the unchanged Mifflin-St Jeor evidence already emitted by
 * the adapter. No review date is claimed. The study population and the app's
 * extrapolation range are both stated.
 */
export const MACRO_MIFFLIN_EVIDENCE: MacroEvidenceRecordV4 = {
  evidenceId: 'mifflin-st-jeor-1990',
  sourceType: 'study',
  title:
    'Mifflin MD et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-7.',
  url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/',
  publishedAt: '1990',
  reviewedAt: null,
  reviewStatus: 'NOT_REVIEWED',
  applicability:
    'Healthy adults aged 19-78; Macro permits ages 19-100 with an explicit extrapolation warning above 78.',
  limitations: [
    'Original study derived from 498 healthy adults aged 19-78.',
    'Equation estimates resting energy expenditure; it is not a measurement.',
  ],
  version: '1990',
  population: '498 healthy adults aged 19-78',
  exclusions: [
    'Ages below 19 are outside the registered Macro range and the study population.',
    'Ages above 78 are outside the study population and are explicit extrapolations in Macro.',
    'Pregnancy, clinical disease and medication effects are not represented by this arithmetic scope.',
  ],
  equationId: 'mifflin-st-jeor-macro-v1',
  units: { mass: 'kg', height: 'cm', energy: 'kcal' },
  evidenceTests: ['lib/tools/engines/macro.v6.test.ts'],
};

export interface MacroEquationStepV4 {
  stepId: string;
  output: string;
  formula: string;
  units: string;
}

export interface MacroEquationTraceV4 {
  equationId: string;
  name: string;
  version: string;
  steps: readonly MacroEquationStepV4[];
}

/** Formula trace for the unchanged Macro V6 equation. */
export const MACRO_EQUATION_TRACE: MacroEquationTraceV4 = {
  equationId: 'mifflin-st-jeor-macro-v1',
  name: 'Mifflin-St Jeor BMR + TDEE + Phase-Based Macro Split',
  version: '6.0.0',
  steps: [
    {
      stepId: 'M4-EV-02-BMR',
      output: 'bmr',
      formula:
        'male: 10*weightKg + 6.25*heightCm - 5*age + 5; female: 10*weightKg + 6.25*heightCm - 5*age - 161',
      units: 'kg, cm, years -> kcal/day',
    },
    {
      stepId: 'M4-EV-02-TDEE',
      output: 'tdee',
      formula: 'BMR * activityLevel',
      units: 'kcal/day',
    },
    {
      stepId: 'M4-EV-02-PHASE',
      output: 'targetCalories',
      formula: 'TDEE * phaseMultiplier (bulk 1.15, cut 0.85, maintenance 1.0)',
      units: 'kcal/day',
    },
    {
      stepId: 'M4-EV-02-MACROS',
      output: 'proteinGrams, fatGrams, carbsGrams',
      formula:
        'protein = weightKg * 2.2; fat = weightKg * 0.9; carbs = (targetCalories - 4*protein - 9*fat) / 4',
      units: 'g',
    },
  ],
};

export interface MacroAssumptionRuleV4 {
  ruleId: string;
  description: string;
  type: AssumptionRecord['type'];
  impact: string;
  version: string;
}

const OPTIONAL_CONTEXT_PREFIX = 'Optional context fields (';

const OPTIONAL_CONTEXT_RULE: MacroAssumptionRuleV4 = {
  ruleId: 'M4-EV-02-OPTIONAL-CONTEXT',
  description: OPTIONAL_CONTEXT_PREFIX,
  type: 'domain',
  impact: 'Optional context is validated but does not change the numeric result.',
  version: '1.0.0',
};

/**
 * Governed rule ids for the five core assumptions emitted by Macro V6.
 * The optional-context note is matched by prefix because its field list varies.
 */
export const MACRO_ASSUMPTION_RULES: readonly MacroAssumptionRuleV4[] = [
  {
    ruleId: 'M4-EV-02-BMR',
    description: 'BMR uses the sex-specific Mifflin-St Jeor equation.',
    type: 'formula',
    impact: 'The resting-energy estimate depends on the sex-specific equation constants.',
    version: '1.0.0',
  },
  {
    ruleId: 'M4-EV-02-PHASE',
    description:
      'Bulk uses a 15% TDEE increase; cut uses a 15% decrease; maintenance uses TDEE.',
    type: 'formula',
    impact: 'The calorie target depends on the selected phase multiplier.',
    version: '1.0.0',
  },
  {
    ruleId: 'M4-EV-02-RECOMP-UNSUPPORTED',
    description:
      'Recomposition is unsupported because SPEC v3 does not define an approved equation for this phase.',
    type: 'domain',
    impact: 'No recomposition result is produced.',
    version: '1.0.0',
  },
  {
    ruleId: 'M4-EV-02-MACRO-GRAMS',
    description:
      'Protein is 2.2 g/kg and fat is 0.9 g/kg; carbohydrate fills remaining target calories.',
    type: 'formula',
    impact: 'Macro gram targets depend on fixed per-kg assumptions and residual carbohydrate.',
    version: '1.0.0',
  },
  {
    ruleId: 'M4-EV-02-ACTIVITY-USER',
    description:
      'Activity factor is user-selected within 1.2–1.9; the result is an arithmetic estimate, not a medical assessment.',
    type: 'user_declared',
    impact: 'TDEE depends on the user-selected activity factor, which is not measured.',
    version: '1.0.0',
  },
];

/** Match an engine assumption by exact governed text, or by the optional prefix. */
export function matchMacroAssumptionRule(
  description: string
): MacroAssumptionRuleV4 | null {
  if (description.startsWith(OPTIONAL_CONTEXT_PREFIX)) return OPTIONAL_CONTEXT_RULE;
  return MACRO_ASSUMPTION_RULES.find((rule) => rule.description === description) ?? null;
}

export interface MacroUncertaintyPolicyV4 extends UncertaintyRecord {
  numericConfidence: null;
  causalClaim: false;
}

/** Qualitative uncertainty consistent with the accepted adapter. */
export const MACRO_UNCERTAINTY_POLICY: MacroUncertaintyPolicyV4 = {
  level: 'NOT_ASSESSED',
  basis: ['No calibrated confidence model is defined for Macro v6.'],
  affectedOutputs: ['targetCalories', 'proteinGrams', 'fatGrams', 'carbsGrams'],
  whatWouldReduceIt: [
    'Direct measurement of resting metabolic rate.',
    'Validated population calibration.',
  ],
  limitations: [
    'Mifflin-St Jeor equation is an estimate, not a measurement.',
    'Activity factor is user-selected, not measured.',
  ],
  numericConfidence: null,
  causalClaim: false,
};

export interface MacroScenarioPolicyV4 {
  deterministic: true;
  maxScenarios: 5;
  allowedScenarioIds: readonly string[];
  weightDeltaKg: 10;
  minWeightForWeightScenarios: number;
  maxWeightForWeightScenarios: number;
  phaseMultipliers: { bulk: number; cut: number; maintenance: number };
  causalClaim: false;
  limitations: readonly string[];
  forbiddenClaims: readonly string[];
}

/**
 * Boundaries for the deterministic scenario and what-if surface. The engine
 * already enforces the ids and weight thresholds; this record names them.
 */
export const MACRO_SCENARIO_POLICY: MacroScenarioPolicyV4 = {
  deterministic: true,
  maxScenarios: 5,
  allowedScenarioIds: [
    'switch-to-cut',
    'switch-to-bulk',
    'switch-to-maintenance',
    'weight-minus-10kg',
    'weight-plus-10kg',
  ],
  weightDeltaKg: 10,
  minWeightForWeightScenarios: 40,
  maxWeightForWeightScenarios: 290,
  phaseMultipliers: { bulk: 1.15, cut: 0.85, maintenance: 1.0 },
  causalClaim: false,
  limitations: [
    'Scenarios are deterministic arithmetic comparisons, not predictions.',
    'No time course, adherence, or weight-change guarantee is modeled.',
    'Sensitivity is a local finite-difference response, not a causal effect.',
  ],
  forbiddenClaims: [
    'guaranteed weight change',
    'causal effect',
    'clinical recommendation',
    'prediction',
  ],
};
