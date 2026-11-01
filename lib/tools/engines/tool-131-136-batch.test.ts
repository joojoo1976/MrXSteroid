import { describe, expect, it } from 'vitest';
import { buildTransformationScenarioOutput } from '../adapters/tool-131-transformation-forecast-trajectory-engine';
import { buildVelocityOutput } from '../adapters/tool-133-rep-tempo-velocity-loss-analyzer';
import { buildMobilityScreenOutput } from '../adapters/tool-134-mobility-movement-symmetry-screen';
import { buildExerciseSubstitutionOutput } from '../adapters/tool-135-exercise-substitution-ai';
import { buildPhysiqueOutput } from '../adapters/tool-136-physique-golden-ratio-score';
import { calculateTransformationScenario } from './tool-131-transformation-forecast-trajectory-engine.v6';
import { calculateVelocityV6 } from './tool-133-rep-tempo-velocity-loss-analyzer.v6';
import { calculateMobilityScreen } from './tool-134-mobility-movement-symmetry-screen.v6';
import { calculateExerciseSubstitutions } from './tool-135-exercise-substitution-ai.v6';
import { calculatePhysiqueV6 } from './tool-136-physique-golden-ratio-score.v6';

const options = { locale: 'en' as const, unitSystem: 'metric' as const, snapshotType: 'draft' as const, calculatedAt: '2026-10-24T12:00:00.000Z', recordedAt: '2026-10-24T12:00:00.000Z' };

describe('SmartTools 131–136 deterministic engines and output adapters', () => {
  it('computes a constant-lean-mass scenario and labels it as non-predictive', () => {
    const input = { current_weight_kg: 100, current_body_fat_pct: 25, target_body_fat_pct: 20, weekly_weight_change_kg: 0.5 };
    const result = calculateTransformationScenario(input);
    expect(result.scenario_target_weight_kg).toBe(93.8);
    expect(result.estimated_scenario_weeks).toBe(12.5);
    const output = buildTransformationScenarioOutput(input, options);
    expect(output.keyFindings.find((finding) => finding.code === 'SCOPE_NOTICE')?.value).toContain('not a prediction');
    expect(output.provenance.confidence).toBeNull();
  });

  it('sorts entered velocity sets and withholds loss when two readings are absent', () => {
    const sets = [
      { set_number: 2, reps: 5, weight_kg: 100, avg_velocity_m_s: 0.64 },
      { set_number: 1, reps: 5, weight_kg: 100, avg_velocity_m_s: 0.8 },
    ];
    expect(calculateVelocityV6({ sets }).velocityLossPercent).toBe(20);
    const output = buildVelocityOutput({ sets: [{ set_number: 1, reps: 5, weight_kg: 100 }] }, options);
    expect(output.result.velocityLossPercent).toBeNull();
    expect(output.keyFindings.find((finding) => finding.code === 'VELOCITY_LOSS')?.value).toContain('Unavailable');
    expect(() => calculateVelocityV6({ sets: [{ set_number: 1, reps: 0, weight_kg: 50 }] })).toThrow();
  });

  it('compares sides only against a disclosed screening threshold', () => {
    const input = { movement: 'ankle_dorsiflexion' as const, left_value: 25, right_value: 12, unit: 'degrees' as const };
    expect(calculateMobilityScreen(input).rule_flag).toBe('review_difference');
    const output = buildMobilityScreenOutput(input, options);
    expect(output.keyFindings.find((finding) => finding.code === 'SCOPE_NOTICE')?.value).toContain('not a diagnosis');
  });

  it('filters static exercise options by equipment and suppresses them when pain is reported', () => {
    const input = { movement_pattern: 'push' as const, available_equipment: ['bodyweight'] as Array<'bodyweight' | 'dumbbell' | 'cable' | 'machine' | 'band'>, avoid_movements: [] as Array<'squat' | 'hinge' | 'push' | 'pull' | 'carry' | 'overhead' | 'impact'>, pain_reported: false };
    expect(calculateExerciseSubstitutions(input).alternatives).toEqual(['incline_push_up']);
    expect(calculateExerciseSubstitutions({ ...input, pain_reported: true }).alternatives).toEqual([]);
    expect(buildExerciseSubstitutionOutput({ ...input, pain_reported: true }, options).keyFindings.some((finding) => finding.severity === 'important')).toBe(true);
  });

  it('returns unavailable rather than zero when circumference ratios cannot be formed', () => {
    expect(calculatePhysiqueV6({ shoulder_cm: 120 }).proportionScore).toBeNull();
    expect(calculatePhysiqueV6({ shoulder_cm: 120, waist_cm: 80 }).status).toBe('ok');
    expect(buildPhysiqueOutput({}, options).keyFindings.find((finding) => finding.code === 'PROPORTION_SCORE')?.value).toContain('Unavailable');
  });
});
