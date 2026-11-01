import { describe, it, expect } from 'vitest';
import { calculateAdaptivePlannerV6 } from '@/lib/tools/engines/tool-129-ai-adaptive-training-planner.v6';

describe('adaptive planner', () => {
  it('different goals produce different exerciseType', () => {
    const a = calculateAdaptivePlannerV6({ goal: 'strength', experience_level: 'beginner', sessions_per_week: 3, session_duration: 60, available_equipment: ['barbell'], readiness: 'moderate', limitations: [] });
    const b = calculateAdaptivePlannerV6({ goal: 'endurance', experience_level: 'beginner', sessions_per_week: 3, session_duration: 60, available_equipment: ['barbell'], readiness: 'moderate', limitations: [] });
    expect(a.weeklyPlan[0].exerciseType).not.toBe(b.weeklyPlan[0].exerciseType);
  });
  it('readiness affects volume', () => {
    const low = calculateAdaptivePlannerV6({ goal: 'strength', experience_level: 'beginner', sessions_per_week: 3, session_duration: 60, available_equipment: ['barbell'], readiness: 'low', limitations: [] });
    const high = calculateAdaptivePlannerV6({ goal: 'strength', experience_level: 'beginner', sessions_per_week: 3, session_duration: 60, available_equipment: ['barbell'], readiness: 'high', limitations: [] });
    expect(high.weeklyPlan[0].volume).toBeGreaterThan(low.weeklyPlan[0].volume);
  });
  it('equipment constraints respected', () => {
    const r = calculateAdaptivePlannerV6({ goal: 'strength', experience_level: 'beginner', sessions_per_week: 2, session_duration: 45, available_equipment: ['dumbbell'], readiness: 'moderate', limitations: [] });
    expect(r.weeklyPlan[0].exerciseType).toContain('dumbbell');
  });
  it('deterministic', () => {
    const a = calculateAdaptivePlannerV6({ goal: 'hypertrophy', experience_level: 'intermediate', sessions_per_week: 4, session_duration: 50, available_equipment: ['dumbbell'], readiness: 'high', limitations: ['no_squat'] });
    const b = calculateAdaptivePlannerV6({ goal: 'hypertrophy', experience_level: 'intermediate', sessions_per_week: 4, session_duration: 50, available_equipment: ['dumbbell'], readiness: 'high', limitations: ['no_squat'] });
    expect(a).toEqual(b);
  });
});
