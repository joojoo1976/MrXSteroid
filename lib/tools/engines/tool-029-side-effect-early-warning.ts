/**
 * Tool #029 — Side Effect Early Warning (engine)
 * Produces early-warning predictions matching the existing schema contract.
 */

import type {
  SideEffectStackInput,
  SideEffectEarlyWarningResult,
  SideEffectSymptom,
} from '../schemas/tool-029-side-effect-early-warning';

const KNOWN_SIGNALS: Record<string, Omit<SideEffectSymptom, 'id' | 'compound_triggers' | 'days_noticed'>> = {
  testosterone: {
    name_en: 'Estrogenic water retention / gynecomastia risk',
    name_ar: 'احتباس سوائل / خطر تثدي',
    category: 'estrogenic',
    severity: 'moderate',
    action_required: 'monitor',
  },
  trenbolone: {
    name_en: 'Cardiovascular strain and sleep disruption',
    name_ar: 'إجهاد قلبي واضطراب نوم',
    category: 'cardiovascular',
    severity: 'severe',
    action_required: 'dosage_reduce',
  },
  dianabol: {
    name_en: 'Hepatotoxicity and blood pressure elevation',
    name_ar: 'سمية كبدية وارتفاع ضغط',
    category: 'hepatotoxic',
    severity: 'severe',
    action_required: 'dosage_reduce',
  },
};

export function predictSideEffects(input: SideEffectStackInput): SideEffectEarlyWarningResult {
  const { compounds, cycle_day, user_age, experience_level, health_markers } = input;

  const predicted_side_effects: SideEffectSymptom[] = compounds.map((name, idx) => {
    const key = name.toLowerCase();
    const base =
      KNOWN_SIGNALS[key] ??
      ({
        name_en: `Monitor ${name} tolerance`,
        name_ar: `راقب تحمل ${name}`,
        category: 'other',
        severity: 'mild',
        action_required: 'monitor',
      } as const);
    return { id: idx + 1, days_noticed: cycle_day, compound_triggers: [name], ...base };
  });

  let risk_score = predicted_side_effects.reduce(
    (sum, s) => sum + (s.severity === 'critical' ? 30 : s.severity === 'severe' ? 20 : s.severity === 'moderate' ? 10 : 5),
    0
  );
  if (user_age >= 45) risk_score += 10;
  if (experience_level === 'beginner') risk_score += 10;
  if (health_markers.blood_pressure && health_markers.blood_pressure >= 140) risk_score += 15;
  if (health_markers.heart_rate && health_markers.heart_rate >= 100) risk_score += 10;
  if (health_markers.libido === 'decreased') risk_score += 5;
  risk_score = Math.max(0, Math.min(100, risk_score));

  const overall_risk_level: SideEffectEarlyWarningResult['overall_risk_level'] =
    risk_score >= 70 ? 'critical' : risk_score >= 45 ? 'high' : risk_score >= 20 ? 'moderate' : 'low';

  return {
    predicted_side_effects,
    overall_risk_level,
    risk_score,
    monitoring_recommendations: [
      'Log blood pressure, sleep, mood, and libido daily.',
      'Repeat bloodwork if any severe signal persists beyond 72 hours.',
    ],
    immediate_actions:
      overall_risk_level === 'critical' || overall_risk_level === 'high'
        ? ['Reduce dose or pause the cycle and seek medical review.']
        : ['Continue monitoring; no immediate action required.'],
    when_to_concerned:
      overall_risk_level === 'low'
        ? 'No concerning pattern yet.'
        : 'Escalate if symptoms worsen or new severe signals appear.',
  };
}