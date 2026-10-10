/**
 * Tool #045 — Cycle Break Planner
 * Post-cycle break/recovery planner: clearance math (5× half-life rule ≈ 97%
 * cleared), PCT window sizing from cycle length, and a milestone timeline.
 * Deterministic and documented; PCT drug choices stay with the prescriber.
 */

export interface BreakCompound {
  name_en: string;
  half_life_days: number; // 0.5..30
  suppression_factor: number; // 1 (mild) .. 3 (heavily suppressive)
}

export interface CycleBreakInput {
  cycle_weeks_used: number; // 4..52
  compounds: BreakCompound[]; // 1..8
  wants_bloodwork: boolean;
}

export interface RecoveryMilestone {
  week: number; // weeks from the LAST dose
  label_en: string;
  label_ar: string;
}

export interface CycleBreakResult {
  days_to_full_clear: number; // max half-life × 5, rounded up
  pct_start_day: number; // clearance + 7-day buffer
  pct_duration_weeks: number; // 4 / 6 / 8 by cycle length
  recovery_milestones: RecoveryMilestone[];
  total_weeks_to_baseline: number;
  warnings: string[];
}

export function planCycleBreak(input: CycleBreakInput): CycleBreakResult {
  const warnings: string[] = [];

  const maxHl = Math.max(...input.compounds.map((c) => c.half_life_days));
  const daysToClear = Math.ceil(maxHl * 5);
  const pctStartDay = daysToClear + 7;
  const pctWeeks = input.cycle_weeks_used <= 8 ? 4 : input.cycle_weeks_used <= 12 ? 6 : 8;
  const pctOpenWeek = Math.ceil(pctStartDay / 7);
  const pctEndWeek = pctOpenWeek + pctWeeks;
  const recheckWeek = pctEndWeek + 4;

  const milestones: RecoveryMilestone[] = [
    { week: 0, label_en: 'Last dose — clearance window starts', label_ar: 'آخر جرعة — تبدأ نافذة التطهير' },
    { week: pctOpenWeek, label_en: 'PCT window opens', label_ar: 'بداية نافذة ما بعد الدورة' },
    { week: pctEndWeek, label_en: 'PCT window closes', label_ar: 'نهاية نافذة ما بعد الدورة' },
    { week: recheckWeek, label_en: 'Bloodwork recheck (LH/FSH/T)', label_ar: 'إعادة تحاليل الغدة النخامية' },
  ];

  if (Math.max(...input.compounds.map((c) => c.suppression_factor)) >= 3) {
    warnings.push('heavily_suppressive_stack_longer_recovery');
  }
  if (!input.wants_bloodwork) {
    warnings.push('baseline_bloodwork_before_pct_recommended');
  }

  return {
    days_to_full_clear: daysToClear,
    pct_start_day: pctStartDay,
    pct_duration_weeks: pctWeeks,
    recovery_milestones: milestones,
    total_weeks_to_baseline: recheckWeek,
    warnings,
  };
}
