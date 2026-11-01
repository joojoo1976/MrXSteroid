import { describe, expect, it } from 'vitest';
import { calcCNSRecovery } from './tool-118-cns-recovery-score';
import { calcVolumeHypertrophy } from './tool-119-training-volume-hypertrophy-index';
import { calcOverloadPredictor } from './tool-120-progressive-overload-predictor';
import { calcMuscleGroupRecovery } from './tool-121-muscle-group-recovery-modeler';
import { buildCNSRecoveryOutput } from '../adapters/tool-118-cns-recovery-score';
import { buildVolumeOutput } from '../adapters/tool-119-training-volume-hypertrophy-index';
import { buildOverloadOutput } from '../adapters/tool-120-progressive-overload-predictor';
import { buildRecoveryOutput } from '../adapters/tool-121-muscle-group-recovery-modeler';

describe('SmartTools 118–121', () => {
  it('does not invent calibrated provenance confidence for tools 118–121', () => {
    const options = { locale: 'en' as const, unitSystem: 'metric' as const, snapshotType: 'draft' as const, calculatedAt: '2026-10-24T12:00:00.000Z', recordedAt: '2026-10-24T12:00:00.000Z' };
    const outputs = [
      buildCNSRecoveryOutput({ hrv_ms: 55, hrv_baseline_ms: 60 }, options),
      buildVolumeOutput({ exercises: [{ exercise: 'Bench press', muscle_group: 'chest', sets: 3, reps: 10, weight_kg: 60, frequency_per_week: 2 }] }, options),
      buildOverloadOutput({ exercise: 'Squat', current_1rm_kg: 100, current_volume_load_kg: 10000, current_frequency: 3, baseline_1rm_kg: 90, baseline_volume_load_kg: 9000, body_weight_kg: 80, height_cm: 180, age: 30, sex: 'male', training_age_years: 5, weekly_load_increase_pct: 2, deload_frequency_weeks: 6, sleep_hours: 8, protein_g_per_kg: 1.8, days_since_deload: 10 }, options),
      buildRecoveryOutput({ muscle_group: 'chest', sets: 4, rpe: 8, frequency_per_week: 2, age: 28, sleep_hours: 8, protein_g_per_kg: 2, stress_level: 2, training_age_years: 3 }, options),
    ];
    expect(outputs.every((output) => output.provenance.confidence === null && output.provenance.dataQuality === 'not_assessed')).toBe(true);
    expect(outputs.every((output) => output.seoLinks.prevTool.slug && output.seoLinks.nextTool.slug)).toBe(true);
  });

  it('calculates a finite CNS score for the same reported markers', () => {
    const input = { hrv_ms: 55, hrv_baseline_ms: 60, sleep_hours: 7, sleep_quality: 3 as const };
    const first = calcCNSRecovery(input);
    expect(calcCNSRecovery(input)).toEqual(first);
    expect(first.cns_recovery_score).toBeGreaterThanOrEqual(0);
    expect(first.cns_recovery_score).toBeLessThanOrEqual(100);
  });

  it('shows no marker coverage and withholds training suggestions when no data is reported', () => {
    const result = calcCNSRecovery({});
    expect(result.data_coverage_pct).toBe(0);
    expect(result.recommendations).toEqual(['insufficient_data_for_recommendations']);
    expect(result.risk_flags).toContain('some_recovery_markers_not_reported');
  });

  it('sums training volume and does not require unrelated profile inputs', () => {
    const result = calcVolumeHypertrophy({ exercises: [{
      exercise: 'Bench press', muscle_group: 'chest', sets: 3, reps: 10, weight_kg: 60,
      rpe: 8, frequency_per_week: 2,
    }] });
    expect(result.total_volume_load_kg).toBe(1800);
    expect(result.volume_by_muscle.chest).toBe(1800);
  });

  it('does not add a minimum progression recommendation when entered progression is zero', () => {
    const result = calcOverloadPredictor({
      exercise: 'Squat', current_1rm_kg: 100, current_volume_load_kg: 10000, current_frequency: 3,
      baseline_1rm_kg: 90, baseline_volume_load_kg: 9000, body_weight_kg: 80, height_cm: 180,
      age: 30, sex: 'male', training_age_years: 5, weekly_load_increase_pct: 0,
      deload_frequency_weeks: 6, sleep_hours: 8, protein_g_per_kg: 1.8, days_since_deload: 10,
    });
    expect(result.recommended_weekly_increase_pct).toBe(0);
  });

  it('returns a deterministic muscle recovery timeline', () => {
    const input = {
      muscle_group: 'chest', sets: 4, rpe: 8, frequency_per_week: 2, age: 28,
      sleep_hours: 8, protein_g_per_kg: 2, stress_level: 2 as const, training_age_years: 3,
    };
    const first = calcMuscleGroupRecovery(input);
    expect(calcMuscleGroupRecovery(input)).toEqual(first);
    expect(first.readiness_timeline.at(-1)?.recovery_pct).toBe(100);
  });
});
