import { describe, it, expect } from 'vitest';
import {
  calculateSarmToAasTransition,
  buildTransitionTimeline,
  daysToResidualBelow,
  estimateHptaRecoveryWeeks,
  sarmResidualPercent,
  SARMS_WASHOUT_HALF_LIVES,
} from './tool-101-sarm-to-aas-transition-bridge-predictor';

describe('Tool #101 - SARM-to-AAS Transition & Bridge Predictor', () => {
  it('applies first-order elimination correctly at exact half-life multiples', () => {
    // Ostarine t-half = 24 h = 1 day; 5 half-lives = 5 days -> 3.125% residual.
    expect(sarmResidualPercent('ostarine_mk2866', 5)).toBeCloseTo(3.125, 1);
    expect(sarmResidualPercent('ostarine_mk2866', 1)).toBeCloseTo(50, 3);
    expect(sarmResidualPercent('ostarine_mk2866', 0)).toBe(100);
  });

  it('computes the washout horizon from the standard 5-half-life threshold', () => {
    // ostarine: 5 days; RAD-140: 5 x 60/24 = 12.5 days; YK-11: 5 x 8/24 = 1.666... -> 1.7 d
    expect(daysToResidualBelow('ostarine_mk2866', 100 / 32)).toBeCloseTo(5, 5);
    expect(daysToResidualBelow('rad140_testolone', 100 / 32)).toBeCloseTo(12.5, 5);
    expect(daysToResidualBelow('yk11', 100 / 32)).toBeCloseTo(1.7, 1);
  });

  it('models the HPTA recovery horizon additively with documented bounds', () => {
    expect(estimateHptaRecoveryWeeks('mild', false, 12)).toBe(6);
    expect(estimateHptaRecoveryWeeks('moderate', false, 12)).toBe(8);
    expect(estimateHptaRecoveryWeeks('severe', true, 12)).toBe(14);
    // +1 week per 8 weeks beyond 12, capped at +6
    expect(estimateHptaRecoveryWeeks('mild', false, 20)).toBe(7);
    expect(estimateHptaRecoveryWeeks('mild', false, 200)).toBe(12);
    // hard cap at 30 weeks
    expect(estimateHptaRecoveryWeeks('severe', true, 200)).toBe(6 + 5 + 3 + 6);
  });

  it('builds a monotonic, deduplicated timeline with the elimination flag at day 0', () => {
    const timeline = buildTransitionTimeline('ostarine_mk2866', 'testosterone_enanthate');
    expect(timeline[0].day_offset).toBe(0);
    expect(timeline[0].sarm_residual_percent).toBe(100);
    expect(timeline[0].note_code).toBe('one_half_life_elapsed_residual_activity_near_50_percent');
    const offsets = timeline.map((s) => s.day_offset);
    expect(new Set(offsets).size).toBe(offsets.length);
    for (let i = 1; i < timeline.length; i += 1) {
      expect(offsets[i]).toBeGreaterThan(offsets[i - 1]);
      expect(timeline[i].sarm_residual_percent).toBeLessThanOrEqual(timeline[i - 1].sarm_residual_percent);
    }
    expect(timeline.some((s) => s.note_code === 'five_half_lives_elapsed_sarm_activity_effectively_eliminated')).toBe(true);
  });

  it('classifies washout margin tiers and emits educational flags', () => {
    const short = calculateSarmToAasTransition({
      sarm_compound: 'yk11',
      sarm_use_weeks: 8,
      suppression_severity: 'mild',
      prior_aas_use: false,
      target_aas_ester: 'trenbolone_acetate',
      has_current_bloodwork: true,
    });
    expect(short.transition_risk_tier).toBe('compressed-washout-margin');
    expect(short.education_flags).toContain('short_half_life_sarm_reaches_baseline_quickly_but_suppression_outlasts_drug');

    const long = calculateSarmToAasTransition({
      sarm_compound: 'rad140_testolone',
      sarm_use_weeks: 30,
      suppression_severity: 'severe',
      prior_aas_use: true,
      target_aas_ester: 'testosterone_undecanoate',
      has_current_bloodwork: false,
    });
    expect(long.transition_risk_tier).toBe('elevated-washout-margin');
    expect(long.education_flags).toContain('long_half_life_sarm_requires_extended_observation_before_any_ester_accumulation');
    expect(long.education_flags).toContain('long_ester_overlaps_residual_sarm_activity_for_weeks_not_days');
    expect(long.education_flags).toContain('severe_suppression_flags_require_clinician_review_not_self_management');
    expect(long.education_flags).toContain('no_current_bloodwork_transition_decisions_are_not_evidence_based');
    expect(long.expected_hpta_recovery_weeks).toBe(6 + 5 + 3 + 2);
    expect(long.sarm_residual_percent_day_30).toBe(0);
  });

  it('ALWAYS stamps the scope notice - never emits a protocol', () => {
    const out = calculateSarmToAasTransition({
      sarm_compound: 'ostarine_mk2866',
      sarm_use_weeks: 12,
      suppression_severity: 'moderate',
      prior_aas_use: false,
      target_aas_ester: 'testosterone_enanthate',
      has_current_bloodwork: true,
    });
    expect(out.scope_notice).toBe(
      'educational_pk_elimination_model_only_not_a_transition_protocol_or_dosing_recommendation',
    );
    // The result object must not carry any dose/mg/weekly field at all.
    const keys = Object.keys(out).join(' ');
    expect(keys).not.toMatch(/dose|mg|protocol|prescription/i);
    expect(SARMS_WASHOUT_HALF_LIVES).toBe(5);
  });
});

