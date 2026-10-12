/**
 * Tool #101 - SARM-to-AAS Transition & Bridge Predictor
 * Layer 1: Pure TypeScript pharmacokinetic EDUCATION model.
 *
 * SCOPE BOUNDARY (master handoff section3, tool #101/#102):
 * This engine models ELIMINATION TIMELINES only. It never emits a dose, a
 * schedule, a compound recommendation or a transition protocol. The user
 * supplies their own (already-decided) context; the output is the
 * mathematically implied washout/overlap horizon plus educational flags.
 * Nothing here is a prescription or medical advice.
 *
 * Model
 * -----
 * First-order elimination: residual activity R(t) = 2^(-t / t-half) expressed as
 * a percentage of peak. SARMS_WASHOUT_HALF_LIVES = 5 -> 3.125% residual
 * (the standard 5 half-life "effectively eliminated" threshold). The HPTA
 * re-baseline horizon is estimated from the self-reported suppression profile
 * and the user's prior AAS history.
 */

/** SARM library with published elimination half-lives (hours), rounded. */
export const SARM_HALF_LIFE_HOURS = {
  ostarine_mk2866: 24,
  ligandrol_lgd4033: 31,
  rad140_testolone: 60,
  andarine_s4: 6,
  yk11: 8,
  cardarine_gw501516: 22,
} as const;

export type SarmCompound = keyof typeof SARM_HALF_LIFE_HOURS;

/** AAS ester library with published elimination half-lives (days). */
export const AAS_ESTER_HALF_LIFE_DAYS = {
  testosterone_propionate: 1.5,
  masteron_propionate: 2,
  trenbolone_acetate: 3,
  testosterone_enanthate: 4.5,
  testosterone_cypionate: 5,
  sustanon_250: 6,
  nandrolone_decanoate: 7,
  testosterone_undecanoate: 21,
} as const;

export type AasEster = keyof typeof AAS_ESTER_HALF_LIFE_DAYS;

export type SuppressionSeverity = 'mild' | 'moderate' | 'severe';

/** Standard "effectively eliminated" threshold used in PK teaching. */
export const SARMS_WASHOUT_HALF_LIVES = 5;

/** Residual activity fraction (0-1) after N half-lives. */
export function residualActivityFraction(halfLives: number): number {
  return Math.pow(2, -halfLives);
}

/** Residual activity (0-100 %) of the SARM `days` after last intake. */
export function sarmResidualPercent(sarm: SarmCompound, days: number): number {
  const tHalfDays = SARM_HALF_LIFE_HOURS[sarm] / 24;
  if (tHalfDays <= 0) return 100;
  return Math.round(residualActivityFraction(days / tHalfDays) * 1000) / 10;
}

/** Days until residual activity falls below `thresholdPercent`. */
export function daysToResidualBelow(sarm: SarmCompound, thresholdPercent: number): number {
  const tHalfDays = SARM_HALF_LIFE_HOURS[sarm] / 24;
  if (tHalfDays <= 0) return 0;
  const halfLives = Math.log(thresholdPercent / 100) / Math.log(0.5);
  return Math.round(tHalfDays * halfLives * 10) / 10;
}

/**
 * Expected HPTA re-baseline horizon (weeks).
 * Base 6 weeks; +2 moderate / +5 severe suppression; +3 prior AAS history;
 * +1 week per 8 weeks of SARM exposure beyond 12 weeks (cap +6); capped at 30.
 */
export function estimateHptaRecoveryWeeks(
  severity: SuppressionSeverity,
  priorAasUse: boolean,
  sarmUseWeeks: number,
): number {
  let weeks = 6;
  if (severity === 'moderate') weeks += 2;
  else if (severity === 'severe') weeks += 5;
  if (priorAasUse) weeks += 3;
  weeks += Math.min(6, Math.max(0, Math.floor((sarmUseWeeks - 12) / 8)));
  return Math.min(30, weeks);
}

export interface TransitionTimelineStep {
  day_offset: number;
  phase: 'washout' | 'overlap' | 'monitoring';
  sarm_residual_percent: number;
  note_code: string;
}

export interface SarmToAasTransitionInput {
  /** The SARM the user has been on (their own choice - echoed, never advised). */
  sarm_compound: SarmCompound;
  /** Duration of SARM exposure in weeks (recovery-horizon model only). */
  sarm_use_weeks: number;
  /** Self-reported suppression severity from the user's own tracking. */
  suppression_severity: SuppressionSeverity;
  /** Whether the user has prior AAS exposure history. */
  prior_aas_use: boolean;
  /** The AAS ester the user asks about (timeline implication only). */
  target_aas_ester: AasEster;
  /** Whether current LH/FSH/Total-T bloodwork is documented. */
  has_current_bloodwork: boolean;
}

export interface SarmToAasTransitionResult {
  sarm_half_life_hours: number;
  aas_ester_half_life_days: number;
  sarm_washout_days: number;
  sarm_residual_percent_day_0: number;
  sarm_residual_percent_day_7: number;
  sarm_residual_percent_day_30: number;
  transition_timeline: TransitionTimelineStep[];
  expected_hpta_recovery_weeks: number;
  transition_risk_tier: 'elevated-washout-margin' | 'standard-washout-margin' | 'compressed-washout-margin';
  education_flags: string[];
  /** Hard boundary statement, always present. */
  scope_notice: string;
}


const EDUCATION_NOTES = {
  washoutDay0: 'last_sarm_intake_day_zero_residual_activity_100_percent',
  washoutHalfLife: 'one_half_life_elapsed_residual_activity_near_50_percent',
  washoutComplete: 'five_half_lives_elapsed_sarm_activity_effectively_eliminated',
  overlap: 'ester_accumulation_and_sarm_elimination_coexist_during_this_window',
  monitoring: 'bloodwork_window_track_lh_fsh_total_testosterone_and_hematocrit',
} as const;

/**
 * Deterministic day-offset timeline for the washout / overlap / monitoring
 * phases. Sample days are derived from the SARM half-life and the target
 * ester's accumulation horizon - no randomness, no clock, no I/O.
 */
export function buildTransitionTimeline(
  sarm: SarmCompound,
  aasEster: AasEster,
): TransitionTimelineStep[] {
  const tHalfDays = SARM_HALF_LIFE_HOURS[sarm] / 24;
  const washoutDays = Math.round(tHalfDays * SARMS_WASHOUT_HALF_LIVES * 10) / 10;
  const esterDays = AAS_ESTER_HALF_LIFE_DAYS[aasEster];
  const overlapEnd = Math.max(washoutDays, esterDays * 5);
  const days = new Set<number>([
    0,
    Math.round(tHalfDays * 10) / 10,
    Math.round(washoutDays * 10) / 10,
    Math.min(14, Math.round(washoutDays)),
    Math.round(overlapEnd),
  ]);

  return [...days]
    .sort((a, b) => a - b)
    .map((day) => {
      const residual = sarmResidualPercent(sarm, day);
      let phase: TransitionTimelineStep['phase'] = 'washout';
      let note_code: string = EDUCATION_NOTES.washoutDay0;

      if (day <= tHalfDays + 0.1) {
        note_code = EDUCATION_NOTES.washoutHalfLife;
      } else if (day >= washoutDays && residual <= 3.125) {
        note_code = EDUCATION_NOTES.washoutComplete;
        phase = day >= esterDays * 3 ? 'monitoring' : 'overlap';
      } else {
        note_code = EDUCATION_NOTES.overlap;
      }
      if (phase === 'monitoring' && residual <= 3.125) note_code = EDUCATION_NOTES.monitoring;
      return { day_offset: day, phase, sarm_residual_percent: residual, note_code };
    });
}

export function calculateSarmToAasTransition(
  input: SarmToAasTransitionInput,
): SarmToAasTransitionResult {
  const {
    sarm_compound,
    sarm_use_weeks,
    suppression_severity,
    prior_aas_use,
    target_aas_ester,
    has_current_bloodwork,
  } = input;

  const tHalfHours = SARM_HALF_LIFE_HOURS[sarm_compound];
  const tHalfDays = tHalfHours / 24;
  const sarm_washout_days = Math.round(tHalfDays * SARMS_WASHOUT_HALF_LIVES * 10) / 10;
  const aasEsterDays = AAS_ESTER_HALF_LIFE_DAYS[target_aas_ester];

  const education_flags: string[] = [];
  if (tHalfHours <= 24) {
    education_flags.push('short_half_life_sarm_reaches_baseline_quickly_but_suppression_outlasts_drug');
  } else if (tHalfHours >= 48) {
    education_flags.push('long_half_life_sarm_requires_extended_observation_before_any_ester_accumulation');
  }
  if (aasEsterDays >= 20) {
    education_flags.push('long_ester_overlaps_residual_sarm_activity_for_weeks_not_days');
  }
  if (suppression_severity === 'severe') {
    education_flags.push('severe_suppression_flags_require_clinician_review_not_self_management');
  }
  if (sarm_use_weeks > 24) {
    education_flags.push('prolonged_exposure_correlates_with_longer_axis_recovery_horizon');
  }
  if (!has_current_bloodwork) {
    education_flags.push('no_current_bloodwork_transition_decisions_are_not_evidence_based');
  }
  if (prior_aas_use) {
    education_flags.push('prior_aas_history_shortens_expected_re_baseline_of_the_axis');
  }

  let transition_risk_tier: SarmToAasTransitionResult['transition_risk_tier'];
  if (sarm_washout_days <= 3) {
    transition_risk_tier = 'compressed-washout-margin';
  } else if (sarm_washout_days <= 10) {
    transition_risk_tier = 'standard-washout-margin';
  } else {
    transition_risk_tier = 'elevated-washout-margin';
  }

  return {
    sarm_half_life_hours: tHalfHours,
    aas_ester_half_life_days: aasEsterDays,
    sarm_washout_days,
    sarm_residual_percent_day_0: sarmResidualPercent(sarm_compound, 0),
    sarm_residual_percent_day_7: sarmResidualPercent(sarm_compound, 7),
    sarm_residual_percent_day_30: sarmResidualPercent(sarm_compound, 30),
    transition_timeline: buildTransitionTimeline(sarm_compound, target_aas_ester),
    expected_hpta_recovery_weeks: estimateHptaRecoveryWeeks(
      suppression_severity,
      prior_aas_use,
      sarm_use_weeks,
    ),
    transition_risk_tier,
    education_flags,
    scope_notice:
      'educational_pk_elimination_model_only_not_a_transition_protocol_or_dosing_recommendation',
  };
}


