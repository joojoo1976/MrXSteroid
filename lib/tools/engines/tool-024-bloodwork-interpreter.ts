/**
 * Tool #024 — Post-Cycle Bloodwork Interpreter (engine)
 * Interprets recovery markers after cycle/PCT using existing schema contract.
 */

import type {
  BloodworkMarker,
  PostCycleBloodworkInput,
  PostCycleBloodworkResult,
} from '../schemas/tool-024-bloodwork-interpreter';

function markerScore(m: BloodworkMarker): number {
  if (m.result_status === 'critical') return 25;
  if (m.result_status === 'high' || m.result_status === 'low') return 10;
  return 0;
}

export function interpretPostCycleBloodwork(input: PostCycleBloodworkInput): PostCycleBloodworkResult {
  const { markers, days_since_pct_end } = input;

  const risk = markers.reduce((sum, m) => sum + markerScore(m), 0);
  const overall_recovery_status: PostCycleBloodworkResult['overall_recovery_status'] =
    risk >= 50 ? 'poor' : risk >= 25 ? 'partial' : risk > 0 ? 'good' : 'excellent';

  const lowT = markers.some((m) => m.name_en.toLowerCase().includes('testosterone') && m.result_status === 'low');
  const lowLH = markers.some(
    (m) => (m.name_en.toLowerCase().includes('lh') || m.name_en.toLowerCase().includes('fsh')) && m.result_status === 'low'
  );
  const hormonal_recovery: PostCycleBloodworkResult['hormonal_recovery'] =
    lowT || lowLH ? 'incomplete' : markers.length > 0 ? 'complete' : 'none';

  const liverBad = markers.some(
    (m) =>
      (m.name_en.toLowerCase().includes('alt') ||
        m.name_en.toLowerCase().includes('ast') ||
        m.name_en.toLowerCase().includes('liver')) &&
      (m.result_status === 'high' || m.result_status === 'critical')
  );
  const liver_function = liverBad ? 'concerning' : risk >= 25 ? 'elevated' : 'normal';

  const ldlBad = markers.some(
    (m) =>
      (m.name_en.toLowerCase().includes('ldl') || m.name_en.toLowerCase().includes('cholesterol')) &&
      (m.result_status === 'high' || m.result_status === 'critical')
  );
  const cardiovascular = ldlBad ? 'concerning' : risk >= 25 ? 'elevated' : 'normal';

  const e2 = markers.find((m) => m.name_en.toLowerCase().includes('estradiol') || m.name_en.toLowerCase().includes('e2'));
  const estrogen_status: PostCycleBloodworkResult['estrogen_status'] = e2
    ? e2.result_status === 'critical'
      ? 'critical'
      : e2.result_status
    : 'normal';

  const recommendations: string[] = [];
  if (hormonal_recovery === 'incomplete') {
    recommendations.push('Hormonal recovery incomplete — extend PCT follow-up and re-test LH/FSH/total testosterone.');
  }
  if (liver_function !== 'normal') {
    recommendations.push('Liver markers elevated — avoid alcohol and oral hepatotoxic compounds; consider liver support.');
  }
  if (cardiovascular !== 'normal') {
    recommendations.push('Lipids suboptimal — prioritize cardio, omega-3, and diet review before next cycle.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Recovery markers look stable — maintain training, sleep, and nutrition; schedule routine follow-up.');
  }

  return {
    overall_recovery_status,
    hormonal_recovery,
    liver_function,
    cardiovascular,
    estrogen_status,
    recommendations,
    followup_marker: hormonal_recovery === 'incomplete' ? 'LH/FSH/Total Testosterone' : 'Total Testosterone',
    days_to_next_test: hormonal_recovery === 'incomplete' ? 21 : days_since_pct_end < 30 ? 30 : 60,
  };
}