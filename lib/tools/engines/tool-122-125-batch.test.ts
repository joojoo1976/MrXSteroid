import { describe, expect, it } from 'vitest';
import { calcRPE_RIR_Velocity } from './tool-122-rpe-rir-1rm-velocity-modeler';
import { calcJointStressConnectiveTissue } from './tool-123-joint-stress-connective-tissue-index';
import { calcDeloadFrequency } from './tool-124-deload-frequency-fatigue-modeler';
import { calcFiberTypeTension } from './tool-125-fiber-type-mechanical-tension-score';
import { buildVelocityOutput } from '../adapters/tool-122-rpe-rir-1rm-velocity-modeler';
import { buildJointStressOutput } from '../adapters/tool-123-joint-stress-connective-tissue-index';
import { buildDeloadOutput } from '../adapters/tool-124-deload-frequency-fatigue-modeler';
import { buildFiberOutput } from '../adapters/tool-125-fiber-type-mechanical-tension-score';

const options = { locale: 'en' as const, unitSystem: 'metric' as const, snapshotType: 'draft' as const, calculatedAt: '2026-10-24T12:00:00.000Z', recordedAt: '2026-10-24T12:00:00.000Z' };
const velocityInput = { velocity_profile: [{ weight_kg: 60, velocity_m_s: 0.8 }, { weight_kg: 90, velocity_m_s: 0.5 }, { weight_kg: 110, velocity_m_s: 0.3 }], target_weight_kg: 100, target_velocity_m_s: 0.4, target_rpe: 8, target_rir: 2 };
const jointInput = { exercises: [{ name: 'Squat', joint: 'knee' as const, sets: 4, reps: 8, weight_kg: 100, rpe: 8, range_of_motion: 'full' as const }], age: 30, training_age_years: 5, sleep_hours: 8, protein_g_per_kg: 1.8, collagen_intake_g: 10, omega3_g: 2, previous_injuries: [], chronic_pain_joints: [] };
const deloadInput = { training_age_years: 3, weekly_volume_sets: 80, avg_weekly_rpe: 8, frequency_per_week: 4, age: 30, sleep_hours: 8, stress_level: 3 as const, hrv_trend: 'stable' as const, rhr_trend: 'stable' as const, sleep_quality_trend: 'stable' as const, performance_trend: 'stable' as const, mood_trend: 'stable' as const, soreness_level: 3 as const, joint_pain: 1 as const, last_deload_weeks_ago: 4, planned_deload_frequency_weeks: 6 };
const fiberInput = { age: 28, sex: 'male' as const, height_cm: 180, body_weight_kg: 80, preferred_rep_range: '6-10' as const, enjoys_explosive_training: true, fatigues_quickly_high_reps: false, recovers_fast_between_sets: true, training_age_years: 3, avg_weekly_volume_sets: 80, avg_intensity_rpe: 8, current_tempo: 'controlled' as const, current_rom: 'full' as const, current_intent: 'tension' as const };

describe('SmartTools 122–125', () => {
  it('emits canonical outputs without inventing provenance confidence', () => {
    const outputs = [buildVelocityOutput(velocityInput, options), buildJointStressOutput(jointInput, options), buildDeloadOutput(deloadInput, options), buildFiberOutput(fiberInput, options)];
    expect(outputs.every((output) => output.provenance.confidence === null && output.provenance.dataQuality === 'not_assessed')).toBe(true);
    expect(outputs.every((output) => output.seoLinks.prevTool.slug && output.seoLinks.nextTool.slug)).toBe(true);
    expect(outputs.map((output) => output.toolSlug)).toEqual([
      'tool-122-rpe-rir-1rm-velocity-modeler', 'tool-123-joint-stress-connective-tissue-index',
      'tool-124-deload-frequency-fatigue-modeler', 'tool-125-fiber-type-mechanical-tension-score',
    ]);
  });

  it('keeps model fit separate from measured data confidence', () => {
    const output = buildVelocityOutput(velocityInput, options);
    expect(output.provenance.confidence).toBeNull();
    expect(output.keyFindings.find((finding) => finding.code === 'MODEL_FIT_CATEGORY')).toBeDefined();
  });

  it('returns deterministic estimates for identical reported training inputs', () => {
    expect(calcRPE_RIR_Velocity(velocityInput)).toEqual(calcRPE_RIR_Velocity(velocityInput));
    expect(calcJointStressConnectiveTissue(jointInput)).toEqual(calcJointStressConnectiveTissue(jointInput));
    expect(calcDeloadFrequency(deloadInput)).toEqual(calcDeloadFrequency(deloadInput));
    expect(calcFiberTypeTension(fiberInput)).toEqual(calcFiberTypeTension(fiberInput));
  });
});
