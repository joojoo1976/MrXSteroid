import { describe, expect, it } from 'vitest';
import { buildNeuromuscularOutput } from '../adapters/tool-126-neuromuscular-explosiveness-modeler';
import { buildReadinessOutput } from '../adapters/tool-127-ai-daily-readiness-explainer';
import { buildAcwrOutput } from '../adapters/tool-128-training-load-acute-chronic-ratio';
import { buildPlannerOutput } from '../adapters/tool-129-ai-adaptive-training-planner';
import { buildPlateauOutput } from '../adapters/tool-130-ai-plateau-detective';
import { calculateNeuromuscularV6 } from './tool-126-neuromuscular-explosiveness-modeler.v6';
import { calculateDailyReadinessV6 } from './tool-127-ai-daily-readiness-explainer.v6';
import { calculateTrainingLoadAcwrV6 } from './tool-128-training-load-acute-chronic-ratio.v6';
import { calculateAdaptivePlannerV6 } from './tool-129-ai-adaptive-training-planner.v6';
import { calculatePlateauDetectiveV6 } from './tool-130-ai-plateau-detective.v6';

const options = {
  locale: 'en' as const,
  unitSystem: 'metric' as const,
  snapshotType: 'draft' as const,
  calculatedAt: '2026-10-24T12:00:00.000Z',
  recordedAt: '2026-10-24T12:00:00.000Z',
};

describe('SmartTools 126–130 engines and ToolOutput adapters', () => {
  it('does not invent a performance score without test markers and rejects invalid body mass', () => {
    expect(calculateNeuromuscularV6({ body_weight_kg: 70 }).explosivenessScore).toBeNull();
    expect(calculateNeuromuscularV6({ body_weight_kg: 70, vertical_jump_cm: 35 }).explosivenessScore).toBe(50);
    expect(() => calculateNeuromuscularV6({ body_weight_kg: 0 })).toThrow();
    const output = buildNeuromuscularOutput({ body_weight_kg: 70 }, options);
    expect(output.toolSlug).toBe('tool-126-neuromuscular-explosiveness-modeler');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.dataQuality).toBe('not_assessed');
    expect(output.keyFindings.some((finding) => finding.code === 'TESTS_REPORTED')).toBe(true);
    expect(output.seoLinks.nextTool.slug).toBe('tool-127-ai-daily-readiness-explainer');
  });

  it('reports readiness coverage and neutral assumptions for omitted optional markers', () => {
    const result = calculateDailyReadinessV6({ sleep_hours: 8, stress_level: 3, soreness_level: 2 });
    expect(result.dataCoveragePct).toBe(60);
    expect(result.assumptions).toContain('previous_load_not_reported_neutral_default_used');
    const output = buildReadinessOutput({ sleep_hours: 8, stress_level: 3, soreness_level: 2 }, { ...options, locale: 'ar' });
    expect(output.keyFindings.find((finding) => finding.code === 'DATA_COVERAGE')?.value).toBe('60%');
    expect(output.keyFindings.find((finding) => finding.code === 'SCOPE_NOTICE')?.value).toContain('تشخيص');
  });

  it('requires an elapsed 28-day timeline for ACWR and leaves a zero baseline ratio unavailable', () => {
    const dates = Array.from({ length: 28 }, (_, index) => new Date(Date.UTC(2026, 8, 27 + index)).toISOString().slice(0, 10));
    const full = dates.map((date) => ({ date, load: 10 }));
    expect(calculateTrainingLoadAcwrV6({ sessions: full }).acwr).toBe(1);
    expect(calculateTrainingLoadAcwrV6({ sessions: full.slice(5) }).band).toBe('insufficient_data');
    const zero = calculateTrainingLoadAcwrV6({ sessions: full.map((session) => ({ ...session, load: 0 })) });
    expect(zero.sufficientData).toBe(true);
    expect(zero.acwr).toBeNull();
    const output = buildAcwrOutput({ sessions: full }, options);
    expect(output.provenance.confidence).toBeNull();
    expect(output.keyFindings.some((finding) => finding.code === 'ACWR')).toBe(true);
  });

  it('uses experience level in the deterministic plan and exposes the chosen focus', () => {
    const base = {
      goal: 'strength' as const,
      sessions_per_week: 3,
      session_duration: 45,
      available_equipment: ['barbell'],
    };
    const beginner = calculateAdaptivePlannerV6({ ...base, experience_level: 'beginner' });
    const advanced = calculateAdaptivePlannerV6({ ...base, experience_level: 'advanced' });
    expect(beginner.weeklyPlan[0].focus).toBe('foundational');
    expect(advanced.weeklyPlan[0].focus).toBe('specialized');
    const output = buildPlannerOutput({ ...base, experience_level: 'intermediate' }, options);
    expect(output.keyFindings.find((finding) => finding.code === 'WEEKLY_OUTLINE')?.value).toContain('Progressive focus');
  });

  it('labels the plateau result as a rule signal rather than calibrated confidence', () => {
    const points = [0, 7, 14, 21].map((day) => ({ date: new Date(Date.UTC(2026, 8, 1 + day)).toISOString().slice(0, 10), weight_kg: 80 }));
    const result = calculatePlateauDetectiveV6({ points });
    expect(result.isPlateau).toBe(true);
    expect(result.ruleSignalStrength).toBe('moderate');
    const output = buildPlateauOutput({ points }, options);
    expect(output.keyFindings.some((finding) => finding.code === 'RULE_SIGNAL_STRENGTH')).toBe(true);
    expect(output.keyFindings.find((finding) => finding.code === 'RULE_SIGNAL_STRENGTH')?.labelEn).toContain('not calibrated confidence');
  });
});
