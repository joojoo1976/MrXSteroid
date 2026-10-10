/**
 * Tool #050 — Mental Health Monitor
 * Mood tracking with trend detection and red-flag escalation. Never diagnoses;
 * red flags trigger immediate help-seeking language and crisis-line reminder.
 * Pure engine, no I/O.
 */

export interface MoodScore {
  score: number; // 1..10
  date: string; // ISO-8601
}

export interface MentalHealthInput {
  mood_scores: MoodScore[]; // 3..30 entries
  sleep_hours_avg: number; // 0..14
  irritability_episodes: number; // 0..28 per week
  aggression_episodes: number; // 0..28 per week
  uses_19_nor: boolean;
  red_flags: string[]; // subset of: self_harm_thoughts, rage_episodes, hopelessness
}

export type MoodTrend = 'improving' | 'stable' | 'declining';
export type MoodBand = 'stable' | 'watch' | 'concern' | 'critical';

export interface MentalHealthResult {
  avg_mood: number;
  trend: MoodTrend;
  band: MoodBand;
  escalation: boolean;
  sleep_flag: boolean;
  irritability_flag: boolean;
  warnings: string[];
}

export const RED_FLAG_CODES = ['self_harm_thoughts', 'rage_episodes', 'hopelessness'] as const;

export function assessMentalHealth(input: MentalHealthInput): MentalHealthResult {
  const { mood_scores, sleep_hours_avg, irritability_episodes, aggression_episodes, uses_19_nor, red_flags } = input;
  const warnings: string[] = [];

  const pts = mood_scores
    .map((m) => ({ t: Date.parse(m.date), v: m.score }))
    .filter((p) => !Number.isNaN(p.t))
    .sort((a, b) => a.t - b.t);

  const avg_mood = Math.round((pts.reduce((s, p) => s + p.v, 0) / Math.max(1, pts.length)) * 10) / 10;

  // Trend: compare the means of the first and second halves (sorted by date).
  let trend: MoodTrend = 'stable';
  if (pts.length >= 4) {
    const half = Math.floor(pts.length / 2);
    const first = pts.slice(0, half).reduce((s, p) => s + p.v, 0) / half;
    const second = pts.slice(half).reduce((s, p) => s + p.v, 0) / (pts.length - half);
    const delta = second - first;
    trend = delta >= 0.5 ? 'improving' : delta <= -0.5 ? 'declining' : 'stable';
  }

  const band: MoodBand = avg_mood >= 7 ? 'stable' : avg_mood >= 5 ? 'watch' : avg_mood >= 3 ? 'concern' : 'critical';

  const escalation = red_flags.length > 0;
  const sleep_flag = sleep_hours_avg < 6;
  const irritability_flag = irritability_episodes >= 3;

  if (escalation) {
    warnings.push('red_flag_seek_immediate_help');
    warnings.push('crisis_line_988_us_or_local_emergency');
  }
  if (sleep_flag) warnings.push('sleep_debt_pattern');
  if (irritability_flag) warnings.push('irritability_pattern');
  if (aggression_episodes >= 1) warnings.push('aggression_episodes_reported');
  if (uses_19_nor && (band === 'concern' || band === 'critical' || trend === 'declining')) warnings.push('19nor_mood_flag');

  return {
    avg_mood,
    trend,
    band,
    escalation,
    sleep_flag,
    irritability_flag,
    warnings: [...new Set(warnings)],
  };
}
