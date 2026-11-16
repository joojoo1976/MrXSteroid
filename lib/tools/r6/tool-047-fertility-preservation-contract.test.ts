// lib/tools/r6/tool-047-fertility-preservation-contract.test.ts
//
// The contract + sync test for Tool 047. It proves three things that a
// screenshot cannot:
//
//   1. the mirrored, non-clinical constants still describe what the unchanged
//      V6 engine (`assessFertility`) actually does — the impact tiers, the HCG
//      offsets and floors, the recovery bases, the age offsets, the horizon
//      test, the hint/warning triggers and the input bounds;
//   2. the draft evaluation cannot drift from the canonical Zod input contract
//      (EMPTY → INVALID → PARTIAL → READY), and a typed zero horizon is never
//      treated as an empty field;
//   3. nothing is invented: no source, no clinical referral wording, no
//      reference range and no confidence figure.
import { describe, expect, it } from 'vitest';
import { FertilityInputSchema } from '@/lib/tools/schemas/tool-047-fertility-preservation';
import { assessFertility } from '@/lib/tools/engines/tool-047-fertility-preservation';
import { requireTool } from '@/lib/tools/registry';
import {
  TOOL_047_CROSS_TOOL_LINKS,
  TOOL_047_LIMITS,
  TOOL_047_SOURCES,
  buildFertilityCsv,
  clamp,
  evaluateFertilityDraft,
  fitsHorizon,
  formatMonths,
  formatPct,
  hintLabelKey,
  impactPct,
  recoveryMonths,
  suppressionLevelKey,
  warningLabelKey,
  type Tool047Draft,
} from './tool-047-fertility-preservation-contract';

const baseInput = {
  age: 42,
  suppression_level: 3 as const,
  uses_hcg: true,
  planning_horizon_months: 12,
};

const emptyDraft: Tool047Draft = {
  age: '',
  suppressionLevel: '',
  usesHcg: '',
  horizonMonths: '',
};

const readyDraft: Tool047Draft = {
  age: '42',
  suppressionLevel: '3',
  usesHcg: 'yes',
  horizonMonths: '12',
};

const levels = [1, 2, 3] as const;

describe('Tool 047 contract — mirrored constants match the frozen engine', () => {
  it('reproduces the impact arithmetic for every level and HCG value', () => {
    for (const level of levels) {
      for (const uses_hcg of [false, true]) {
        expect(impactPct(level, uses_hcg)).toBe(
          assessFertility({ ...baseInput, suppression_level: level, uses_hcg })
            .fertility_impact_pct,
        );
      }
    }
    expect(impactPct(1, false)).toBe(40);
    expect(impactPct(2, false)).toBe(65);
    expect(impactPct(3, false)).toBe(85);
    expect(impactPct(1, true)).toBe(25);
    expect(impactPct(3, true)).toBe(70);
    expect(TOOL_047_LIMITS.hcgImpactOffset).toBe(15);
    expect(TOOL_047_LIMITS.impactFloorPct).toBe(10);
  });

  it('reproduces the recovery arithmetic across the age-offset boundaries', () => {
    for (const level of levels) {
      for (const uses_hcg of [false, true]) {
        for (const age of [18, 28, 29, 35, 36, 42, 60]) {
          expect(recoveryMonths(level, uses_hcg, age)).toBe(
            assessFertility({ ...baseInput, suppression_level: level, uses_hcg, age })
              .recovery_projection_months,
          );
        }
      }
    }

    // No offset at or below 28; +1 above 28; +3 above 35.
    expect(recoveryMonths(2, false, 28)).toBe(6);
    expect(recoveryMonths(2, false, 29)).toBe(7);
    expect(recoveryMonths(2, false, 35)).toBe(7);
    expect(recoveryMonths(2, false, 36)).toBe(9);

    // HCG subtracts two months, and the floor is one month.
    expect(recoveryMonths(1, true, 18)).toBe(1);
    expect(recoveryMonths(1, false, 18)).toBe(3);
    expect(TOOL_047_LIMITS.hcgRecoveryOffset).toBe(2);
    expect(TOOL_047_LIMITS.recoveryFloorMonths).toBe(1);
  });

  it('reproduces the horizon test, including the zero horizon', () => {
    for (const horizon of [0, 1, 5, 12, 36]) {
      for (const age of [25, 42]) {
        expect(fitsHorizon(recoveryMonths(2, false, age), horizon)).toBe(
          assessFertility({
            ...baseInput,
            age,
            suppression_level: 2,
            uses_hcg: false,
            planning_horizon_months: horizon,
          }).within_horizon,
        );
      }
    }
    expect(fitsHorizon(5, 0)).toBe(false);
    expect(fitsHorizon(5, 5)).toBe(true);
    expect(fitsHorizon(6, 5)).toBe(false);
  });

  it('reproduces every protocol hint the engine can emit', () => {
    const hints = (patch: Partial<typeof baseInput>) =>
      assessFertility({ ...baseInput, ...patch }).protocol_hints;

    expect(hints({ suppression_level: 1, uses_hcg: false })).toEqual([
      'off_cycle_semen_analysis_recommended',
    ]);
    expect(hints({ suppression_level: 1, uses_hcg: true })).toEqual([
      'off_cycle_semen_analysis_recommended',
      'hcg_preservation_discussed',
    ]);
    expect(hints({ suppression_level: 2, uses_hcg: false })).toEqual([
      'off_cycle_semen_analysis_recommended',
      'limit_19nor_exposure',
    ]);
    expect(hints({ suppression_level: 3, uses_hcg: true })).toEqual([
      'off_cycle_semen_analysis_recommended',
      'hcg_preservation_discussed',
      'limit_19nor_exposure',
      'defer_cycle_until_family_planning_settled',
    ]);
  });

  it('reproduces the two warning triggers and only those', () => {
    const warnings = (patch: Partial<typeof baseInput>) =>
      assessFertility({ ...baseInput, ...patch }).warnings;

    expect(warnings({ age: 30, suppression_level: 1, uses_hcg: true })).toEqual([]);
    expect(warnings({ age: 30, suppression_level: 2, uses_hcg: false })).toEqual([
      'high_suppression_impact_medical_consult',
    ]);
    expect(warnings({ age: 41, suppression_level: 1, uses_hcg: true })).toEqual([
      'age_related_decline_not_modeled',
    ]);
    expect(warnings({ age: 42, suppression_level: 3, uses_hcg: true })).toEqual([
      'high_suppression_impact_medical_consult',
      'age_related_decline_not_modeled',
    ]);

    expect(TOOL_047_LIMITS.warningImpactAtLeastPct).toBe(65);
    expect(TOOL_047_LIMITS.warningAgeAbove).toBe(40);
  });

  it('mirrors the input bounds of the canonical schema', () => {
    const parse = (patch: Record<string, unknown>) =>
      FertilityInputSchema.safeParse({ ...baseInput, ...patch }).success;

    expect(parse({ age: TOOL_047_LIMITS.ageMin })).toBe(true);
    expect(parse({ age: TOOL_047_LIMITS.ageMax })).toBe(true);
    expect(parse({ age: TOOL_047_LIMITS.ageMin - 1 })).toBe(false);
    expect(parse({ age: TOOL_047_LIMITS.ageMax + 1 })).toBe(false);

    expect(parse({ planning_horizon_months: TOOL_047_LIMITS.horizonMin })).toBe(true);
    expect(parse({ planning_horizon_months: TOOL_047_LIMITS.horizonMax })).toBe(true);
    expect(parse({ planning_horizon_months: TOOL_047_LIMITS.horizonMin - 1 })).toBe(false);
    expect(parse({ planning_horizon_months: TOOL_047_LIMITS.horizonMax + 1 })).toBe(false);

    expect(parse({ suppression_level: 1 })).toBe(true);
    expect(parse({ suppression_level: 2 })).toBe(true);
    expect(parse({ suppression_level: 3 })).toBe(true);
    expect(parse({ suppression_level: 0 })).toBe(false);
    expect(parse({ suppression_level: 4 })).toBe(false);
    expect(parse({ uses_hcg: false })).toBe(true);
    expect(parse({ uses_hcg: 'yes' })).toBe(false);
    expect(TOOL_047_LIMITS.unit).toBe('months');
  });

  it('maps every hint and warning the engine can emit, and never prints a raw code', () => {
    const surfacedHints = new Set<string>();
    const surfacedWarnings = new Set<string>();
    for (const level of levels) {
      for (const uses_hcg of [false, true]) {
        for (const age of [25, 45]) {
          const result = assessFertility({
            ...baseInput,
            suppression_level: level,
            uses_hcg,
            age,
          });
          result.protocol_hints.forEach((code) => surfacedHints.add(code));
          result.warnings.forEach((code) => surfacedWarnings.add(code));
        }
      }
    }

    expect(surfacedHints.size).toBe(4);
    expect(surfacedWarnings.size).toBe(2);
    for (const code of surfacedHints) {
      const key = hintLabelKey(code);
      expect(key).not.toBe(code);
      expect(key.startsWith('hint_')).toBe(true);
    }
    for (const code of surfacedWarnings) {
      const key = warningLabelKey(code);
      expect(key).not.toBe(code);
      expect(key.startsWith('warning_')).toBe(true);
    }
    expect(hintLabelKey('unknown_hint')).toBe('hint_unknown');
    expect(warningLabelKey('unknown_warning')).toBe('warning_unknown');
  });

  it('maps every suppression level the engine accepts', () => {
    for (const level of levels) {
      const key = suppressionLevelKey(level);
      expect(key).toBe(`level_${level}`);
    }
    expect(suppressionLevelKey(9)).toBe('level_unknown');
  });

  it('formats percentages and months without inventing precision', () => {
    expect(formatPct(65)).toBe('65%');
    expect(formatPct(0)).toBe('0%');
    expect(formatPct(Number.NaN)).toBe('—');
    expect(formatMonths(7)).toBe('7');
    expect(formatMonths(Number.NaN)).toBe('—');
    expect(clamp(10, 18, 60)).toBe(18);
    expect(clamp(100, 18, 60)).toBe(60);
    expect(clamp(42, 18, 60)).toBe(42);
  });
});

describe('Tool 047 contract — draft evaluation', () => {
  it('starts EMPTY with no input and no issue', () => {
    const evaluation = evaluateFertilityDraft(emptyDraft);
    expect(evaluation.state).toBe('EMPTY');
    expect(evaluation.input).toBeNull();
    expect(evaluation.issues).toEqual([]);
  });

  it('stays PARTIAL until every required field is answered', () => {
    for (const patch of [
      { age: '' },
      { suppressionLevel: '' as const },
      { usesHcg: '' as const },
      { horizonMonths: '' },
    ]) {
      expect(evaluateFertilityDraft({ ...readyDraft, ...patch }).state).toBe('PARTIAL');
    }
  });

  it('treats a typed zero horizon as a real value, not as "not answered"', () => {
    const evaluation = evaluateFertilityDraft({ ...readyDraft, horizonMonths: '0' });
    expect(evaluation.state).toBe('READY');
    expect(evaluation.input).toEqual({
      age: 42,
      suppression_level: 3,
      uses_hcg: true,
      planning_horizon_months: 0,
    });
  });

  it('rejects out-of-range values with an out_of_range issue', () => {
    expect(evaluateFertilityDraft({ ...readyDraft, age: '17' }).issues).toContainEqual({
      field: 'age',
      code: 'out_of_range',
    });
    expect(evaluateFertilityDraft({ ...readyDraft, age: '61' }).issues).toContainEqual({
      field: 'age',
      code: 'out_of_range',
    });
    expect(evaluateFertilityDraft({ ...readyDraft, horizonMonths: '37' }).issues).toContainEqual({
      field: 'horizonMonths',
      code: 'out_of_range',
    });
    expect(evaluateFertilityDraft({ ...readyDraft, horizonMonths: '-1' }).issues).toContainEqual({
      field: 'horizonMonths',
      code: 'out_of_range',
    });
    expect(
      evaluateFertilityDraft({ ...readyDraft, suppressionLevel: '4' as '1' }).issues,
    ).toContainEqual({ field: 'suppressionLevel', code: 'out_of_range' });
    expect(evaluateFertilityDraft({ ...readyDraft, usesHcg: 'maybe' as 'yes' }).issues).toContainEqual({
      field: 'usesHcg',
      code: 'out_of_range',
    });
  });

  it('rejects non-numeric text in a hand-typed field', () => {
    expect(evaluateFertilityDraft({ ...readyDraft, age: 'abc' }).issues).toContainEqual({
      field: 'age',
      code: 'invalid_number',
    });
    expect(evaluateFertilityDraft({ ...readyDraft, horizonMonths: 'x' }).issues).toContainEqual({
      field: 'horizonMonths',
      code: 'invalid_number',
    });
  });

  it('keeps the order EMPTY → INVALID → PARTIAL → READY', () => {
    expect(evaluateFertilityDraft({ ...emptyDraft, age: '999' }).state).toBe('INVALID');
    expect(evaluateFertilityDraft({ ...emptyDraft, age: '42' }).state).toBe('PARTIAL');
  });

  it('produces a READY input that the canonical schema accepts', () => {
    const evaluation = evaluateFertilityDraft(readyDraft);
    expect(evaluation.state).toBe('READY');
    expect(evaluation.input).not.toBeNull();
    expect(FertilityInputSchema.safeParse(evaluation.input).success).toBe(true);
    expect(evaluation.input).toEqual(baseInput);
  });
});

describe('Tool 047 contract — content invariants and CSV', () => {
  it('records no approved source and therefore no citation', () => {
    expect(TOOL_047_SOURCES).toEqual([]);
  });

  it('links only to real registered tools and transfers nothing automatically', () => {
    expect(TOOL_047_CROSS_TOOL_LINKS.length).toBeGreaterThan(0);
    for (const link of TOOL_047_CROSS_TOOL_LINKS) {
      expect(() => requireTool(link.targetToolId)).not.toThrow();
      expect(link.transfer).toBe('manual-reentry');
      expect(link.freshnessRule).toMatch(/protocol start date|last-dose date/i);
      expect(link.mappedFields.length).toBeGreaterThan(0);
    }
  });

  it('builds a CSV with the inputs, the result and no session identifier', () => {
    const result = assessFertility(baseInput);
    const csv = buildFertilityCsv(baseInput, result, '2026-11-16T10:00:00.000Z');
    expect(csv).toContain('tool,tool-047-fertility-preservation');
    expect(csv).toContain('age,42');
    expect(csv).toContain('suppression_level,3');
    expect(csv).toContain('uses_hcg,true');
    expect(csv).toContain('planning_horizon_months,12');
    expect(csv).toContain('fertility_impact_pct,70');
    expect(csv).toContain('recovery_projection_months,13');
    expect(csv).toContain('within_horizon,false');
    expect(csv).not.toMatch(/session|user|token|email/i);
    expect(csv).not.toContain('0.85');
    expect(csv).not.toMatch(/reference/i);
  });
});
