import { describe, it, expect } from 'vitest';
import { evaluateCognitiveEnhancement } from './tool-084-cognitive-enhancer';

describe('Tool #084 — Cognitive Enhancer Engine', () => {
  it('identifies peak neurotrophic state with optimal habits', () => {
    const res = evaluateCognitiveEnhancement({
      daily_focused_deep_work_hours: 4.5,
      regular_aerobic_exercise: true,
      caffeine_daily_mg: 200,
      choline_rich_foods_or_alpha_gpc: true,
      frequent_brain_fog_complaints: false,
      sleep_hours: 8,
    });

    expect(res.cognitive_status_band).toBe('peak-neurotrophic-state');
    expect(res.cognitive_readiness_score).toBeGreaterThanOrEqual(80);
  });

  it('detects suboptimal fatigued state with sleep loss and brain fog', () => {
    const res = evaluateCognitiveEnhancement({
      daily_focused_deep_work_hours: 1,
      regular_aerobic_exercise: false,
      caffeine_daily_mg: 600,
      choline_rich_foods_or_alpha_gpc: false,
      frequent_brain_fog_complaints: true,
      sleep_hours: 4.5,
    });

    expect(res.cognitive_status_band).toBe('suboptimal-fatigued');
    expect(res.cognitive_readiness_score).toBeLessThanOrEqual(35);
    expect(res.warnings).toContain('persistent_brain_fog_warrants_evaluation_of_sleep_apnea_thyroid_or_deficiencies');
  });
});
