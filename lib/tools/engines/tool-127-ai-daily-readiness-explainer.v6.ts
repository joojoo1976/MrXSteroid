import { z } from 'zod';

export const DailyReadinessInputSchema = z.object({
  sleep_hours: z.number().finite().min(0).max(24),
  stress_level: z.number().finite().min(1).max(10),
  soreness_level: z.number().finite().min(1).max(10),
  previous_load: z.number().finite().min(0).optional(),
  hydration: z.number().finite().min(0).max(100).optional(),
}).strict();

export type DailyReadinessInput = z.infer<typeof DailyReadinessInputSchema>;
export type ReadinessBand = 'low' | 'moderate' | 'high';

export interface DailyReadinessResult {
  readinessScore: number;
  band: ReadinessBand;
  factors: string[];
  dataCoveragePct: number;
  assumptions: string[];
  disclaimer: string;
}

export function calculateDailyReadinessV6(input: DailyReadinessInput): DailyReadinessResult {
  const { sleep_hours, stress_level, soreness_level, previous_load = 0, hydration = 50 } = input;
  const vals = [sleep_hours, stress_level, soreness_level, previous_load, hydration];
  if (vals.some((v) => !Number.isFinite(v))) throw new Error('invalid input');

  const sleepScore = Math.min(30, (sleep_hours / 8) * 30);
  const stressPenalty = stress_level * 2;
  const sorenessPenalty = soreness_level * 2;
  const loadPenalty = Math.min(10, (previous_load / 100) * 10);
  const hydrationBonus = (hydration / 100) * 10;

  let score = 50 + sleepScore - stressPenalty - sorenessPenalty - loadPenalty + hydrationBonus;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const factors: string[] = [];
  if (sleep_hours < 7) factors.push('low_sleep');
  if (stress_level >= 7) factors.push('high_stress');
  if (soreness_level >= 7) factors.push('high_soreness');
  if (previous_load >= 80) factors.push('high_previous_load');
  if (hydration < 40) factors.push('low_hydration');
  if (factors.length === 0) factors.push('balanced_inputs');

  const dataCoveragePct = Math.round(([sleep_hours, stress_level, soreness_level, input.previous_load, input.hydration].filter((value) => value !== undefined).length / 5) * 100);

  const band: ReadinessBand = score < 40 ? 'low' : score <= 70 ? 'moderate' : 'high';

  return {
    readinessScore: score,
    band,
    factors,
    dataCoveragePct,
    assumptions: [
      input.previous_load === undefined ? 'previous_load_not_reported_neutral_default_used' : 'previous_load_reported',
      input.hydration === undefined ? 'hydration_not_reported_neutral_default_used' : 'hydration_reported',
    ],
    disclaimer: 'تقدير تدريبي وليس تشخيصًا طبيًا',
  };
}

