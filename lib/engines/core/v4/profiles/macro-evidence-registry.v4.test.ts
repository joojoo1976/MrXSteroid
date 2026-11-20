/**
 * lib/engines/core/v4/profiles/macro-evidence-registry.v4.test.ts
 *
 * Batch C coverage for additive Macro V4 evidence, explanation and scenario
 * policy:
 * - formula and assumption traceability
 * - Mifflin source applicability and review state
 * - qualitative uncertainty without numeric confidence
 * - explanation boundaries
 * - deterministic scenario, what-if and sensitivity limits
 *
 * Macro V6 is consumed read-only. No evidence, confidence, prediction or
 * scientific validation is invented.
 */

import { describe, expect, it } from 'vitest';
import {
  MACRO_ASSUMPTION_RULES,
  MACRO_EQUATION_TRACE,
  MACRO_MIFFLIN_EVIDENCE,
  MACRO_SCENARIO_POLICY,
  MACRO_UNCERTAINTY_POLICY,
  matchMacroAssumptionRule,
} from './macro-evidence-registry.v4';
import { adaptMacroV6ToV4 } from '../adapter.macro.v4';
import { calculateMacrosV6, type MacroInputV6 } from '@/lib/tools/engines/macro.v6';

const INPUT: MacroInputV6 = {
  age: 30,
  sex: 'male',
  heightCm: 175,
  weightKg: 75,
  activityLevel: 1.55,
  phase: 'maintenance',
};

const CREATED_AT = '2026-11-05T12:00:00.000Z';

async function calculate(input: MacroInputV6 = INPUT) {
  const response = await calculateMacrosV6(input);
  if (!('result' in response)) throw new Error('Expected a complete Macro V6 result.');
  return response;
}

describe('M4-EV-01 Mifflin evidence registry', () => {
  it('registers a stable Mifflin-St Jeor record with population and limits', () => {
    expect(MACRO_MIFFLIN_EVIDENCE.evidenceId).toBe('mifflin-st-jeor-1990');
    expect(MACRO_MIFFLIN_EVIDENCE.sourceType).toBe('study');
    expect(MACRO_MIFFLIN_EVIDENCE.version).toBe('1990');
    expect(MACRO_MIFFLIN_EVIDENCE.url).toBe('https://pubmed.ncbi.nlm.nih.gov/2305711/');
    expect(MACRO_MIFFLIN_EVIDENCE.title).toContain('Mifflin MD et al.');
    expect(MACRO_MIFFLIN_EVIDENCE.applicability).toContain('19-78');
    expect(MACRO_MIFFLIN_EVIDENCE.applicability).toContain('19-100');
    expect(MACRO_MIFFLIN_EVIDENCE.limitations.join(' ')).toContain('498 healthy adults');
    expect(MACRO_MIFFLIN_EVIDENCE.limitations.join(' ')).toContain('not a measurement');
    expect(MACRO_MIFFLIN_EVIDENCE.population).toBe('498 healthy adults aged 19-78');
    expect(MACRO_MIFFLIN_EVIDENCE.exclusions.length).toBeGreaterThan(0);
    expect(MACRO_MIFFLIN_EVIDENCE.equationId).toBe('mifflin-st-jeor-macro-v1');
    expect(MACRO_MIFFLIN_EVIDENCE.units).toEqual({
      mass: 'kg',
      height: 'cm',
      energy: 'kcal',
    });
  });

  it('does not invent a source review date', () => {
    expect(MACRO_MIFFLIN_EVIDENCE.reviewStatus).toBe('NOT_REVIEWED');
    expect(MACRO_MIFFLIN_EVIDENCE.reviewedAt).toBeNull();
  });

  it('matches the evidence emitted by the accepted adapter', async () => {
    const response = await calculate();
    const envelope = adaptMacroV6ToV4(
      INPUT,
      response.result,
      CREATED_AT,
      response.intelligence.warnings
    );

    const emitted = envelope.evidence[0];
    expect(emitted.evidenceId).toBe(MACRO_MIFFLIN_EVIDENCE.evidenceId);
    expect(emitted.sourceType).toBe(MACRO_MIFFLIN_EVIDENCE.sourceType);
    expect(emitted.title).toBe(MACRO_MIFFLIN_EVIDENCE.title);
    expect(emitted.url).toBe(MACRO_MIFFLIN_EVIDENCE.url);
    expect(emitted.applicability).toBe(MACRO_MIFFLIN_EVIDENCE.applicability);
    expect(emitted.limitations).toEqual([...MACRO_MIFFLIN_EVIDENCE.limitations]);
    expect(emitted.version).toBe(MACRO_MIFFLIN_EVIDENCE.version);
    expect(emitted.reviewedAt).toBeUndefined();
  });
});

describe('M4-EV-02 formula and assumption traceability', () => {
  it('traces every documented formula step to the stable equation id', () => {
    expect(MACRO_EQUATION_TRACE.equationId).toBe('mifflin-st-jeor-macro-v1');
    expect(MACRO_EQUATION_TRACE.version).toBe('6.0.0');
    expect(MACRO_EQUATION_TRACE.steps.map((step) => step.stepId)).toEqual([
      'M4-EV-02-BMR',
      'M4-EV-02-TDEE',
      'M4-EV-02-PHASE',
      'M4-EV-02-MACROS',
    ]);
    for (const step of MACRO_EQUATION_TRACE.steps) {
      expect(step.formula.length).toBeGreaterThan(0);
      expect(step.units.length).toBeGreaterThan(0);
    }
  });

  it('governs all five core engine assumptions by rule id', async () => {
    const response = await calculate();
    expect(response.result.assumptions).toHaveLength(5);
    expect(MACRO_ASSUMPTION_RULES).toHaveLength(5);

    for (const description of response.result.assumptions) {
      const rule = matchMacroAssumptionRule(description);
      expect(rule).not.toBeNull();
      expect(rule?.ruleId).toMatch(/^M4-EV-02-/);
      expect(rule?.description).toBe(description);
      expect(rule?.impact.length).toBeGreaterThan(0);
    }
  });

  it('recognizes the optional-context note without claiming it changes the result', () => {
    const rule = matchMacroAssumptionRule(
      'Optional context fields (goal, targetWeightKg) are validated but do not change this calculation.'
    );
    expect(rule?.ruleId).toBe('M4-EV-02-OPTIONAL-CONTEXT');
  });

  it('does not govern an unknown invented assumption', () => {
    expect(matchMacroAssumptionRule('A fabricated assumption')).toBeNull();
  });
});

describe('M4-EV-05 qualitative uncertainty', () => {
  it('keeps uncertainty NOT_ASSESSED with no numeric confidence', async () => {
    const response = await calculate();
    const envelope = adaptMacroV6ToV4(
      INPUT,
      response.result,
      CREATED_AT,
      response.intelligence.warnings
    );

    expect(envelope.uncertainty.level).toBe('NOT_ASSESSED');
    expect(envelope.uncertainty.level).toBe(MACRO_UNCERTAINTY_POLICY.level);
    expect(envelope.uncertainty.basis).toEqual([...MACRO_UNCERTAINTY_POLICY.basis]);
    expect(envelope.uncertainty.whatWouldReduceIt).toEqual([
      ...MACRO_UNCERTAINTY_POLICY.whatWouldReduceIt,
    ]);
    expect(envelope.uncertainty.limitations).toEqual([...MACRO_UNCERTAINTY_POLICY.limitations]);
    expect(MACRO_UNCERTAINTY_POLICY.numericConfidence).toBeNull();
    expect(MACRO_UNCERTAINTY_POLICY.causalClaim).toBe(false);
  });

  it('suggests measurement only as an option, never as a prescription', () => {
    const guidance = MACRO_UNCERTAINTY_POLICY.whatWouldReduceIt.join(' ');
    expect(guidance).toContain('Direct measurement');
    expect(guidance).toContain('Validated population calibration');
    expect(guidance).not.toMatch(/you must|prescrib|diagnos|treat/i);
  });
});

describe('M4-EV-05 scenario, what-if and sensitivity boundaries', () => {
  it('publishes the deterministic scenario set and limits', () => {
    expect(MACRO_SCENARIO_POLICY.deterministic).toBe(true);
    expect(MACRO_SCENARIO_POLICY.maxScenarios).toBe(5);
    expect(MACRO_SCENARIO_POLICY.allowedScenarioIds).toEqual([
      'switch-to-cut',
      'switch-to-bulk',
      'switch-to-maintenance',
      'weight-minus-10kg',
      'weight-plus-10kg',
    ]);
    expect(MACRO_SCENARIO_POLICY.weightDeltaKg).toBe(10);
    expect(MACRO_SCENARIO_POLICY.phaseMultipliers).toEqual({
      bulk: 1.15,
      cut: 0.85,
      maintenance: 1.0,
    });
    expect(MACRO_SCENARIO_POLICY.causalClaim).toBe(false);
  });

  it('emits only allowed deterministic scenarios with no time-course or confidence claim', async () => {
    const first = await calculate();
    const second = await calculate();

    expect(first.intelligence.scenarios.map((scenario) => scenario.id)).toEqual(
      second.intelligence.scenarios.map((scenario) => scenario.id)
    );
    expect(first.intelligence.scenarios.length).toBeLessThanOrEqual(
      MACRO_SCENARIO_POLICY.maxScenarios
    );

    for (const scenario of first.intelligence.scenarios) {
      expect(MACRO_SCENARIO_POLICY.allowedScenarioIds).toContain(scenario.id);
      expect(scenario.confidence).toBeNull();
      expect(scenario.description).not.toMatch(/will happen|guarantee|causal/i);
    }
  });

  it('keeps sensitivity local, deterministic and non-causal', async () => {
    const response = await calculate();
    expect(response.intelligence.confidence).toBeNull();
    expect(response.intelligence.top3Reasoning.length).toBeGreaterThan(0);

    for (const factor of response.intelligence.top3Reasoning) {
      expect(factor.confidence).toBeNull();
      expect(factor.explanation).toContain('not a causal estimate');
    }
  });

  it('recalculates a what-if value deterministically from the engine', async () => {
    const response = await calculate();
    const whatIf = response.intelligence.whatIf.adjustInput('weightKg', 80);
    const direct = await calculateMacrosV6({ ...INPUT, weightKg: 80 });

    expect(whatIf.resultType).toBe('CALCULATED');
    if (whatIf.resultType !== 'CALCULATED' || !('result' in direct)) {
      throw new Error('Expected a calculated what-if result.');
    }
    expect(whatIf.calculatedOutput.targetCalories).toBe(direct.result.targetCalories);
    expect(whatIf.calculatedOutput.proteinGrams).toBe(direct.result.proteinGrams);
    expect(whatIf.confidence).toBeNull();
  });
});
