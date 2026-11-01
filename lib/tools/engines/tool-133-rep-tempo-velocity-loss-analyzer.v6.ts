import { z } from 'zod';

export const VelocityInputSchema = z.object({
  sets: z.array(z.object({
    set_number: z.number().finite().int().positive(),
    reps: z.number().finite().int().positive(),
    weight_kg: z.number().finite().min(0).max(1000),
    avg_velocity_m_s: z.number().finite().positive().max(10).optional(),
    tempo: z.number().finite().positive().max(60).optional(),
  }).strict()).min(1).max(50).refine((sets) => new Set(sets.map((set) => set.set_number)).size === sets.length, { message: 'Set numbers must be unique' }),
});
export type VelocityInput = z.infer<typeof VelocityInputSchema>;

export interface VelocityResult {
  velocityLossPercent: number | null;
  tempoConsistency: number | null;
  fatigueIndicator: 'insufficient_data' | 'low' | 'moderate' | 'high';
  velocityReadings: number;
  tempoReadings: number;
  dataCoveragePct: number;
  recommendations: string[];
  disclaimer: string;
}

export function calculateVelocityV6(input: VelocityInput): VelocityResult {
  VelocityInputSchema.parse(input);
  const { sets } = input;
  if (!Array.isArray(sets) || sets.length === 0 || sets.length > 50) throw new Error('enter between 1 and 50 sets');
  const vals = sets.flatMap(s => [s.set_number, s.reps, s.weight_kg, s.avg_velocity_m_s, s.tempo].filter(v=>v!==undefined)) as number[];
  if (vals.some(v => !Number.isFinite(v))) throw new Error('invalid input');
  if (sets.some((set) => !Number.isInteger(set.set_number) || set.set_number <= 0 || !Number.isInteger(set.reps) || set.reps <= 0 || set.weight_kg < 0 || set.avg_velocity_m_s !== undefined && set.avg_velocity_m_s <= 0 || set.tempo !== undefined && set.tempo <= 0)) throw new Error('set values are outside their valid ranges');
  if (new Set(sets.map((set) => set.set_number)).size !== sets.length) throw new Error('set numbers must be unique');
  const sorted = [...sets].sort((a, b) => a.set_number - b.set_number);
  const velocities = sorted.map(s => s.avg_velocity_m_s).filter(v=>v!==undefined) as number[];
  const velocityLoss = velocities.length >= 2 ? ((velocities[0] - velocities[velocities.length - 1]) / velocities[0]) * 100 : null;
  const tempos = sets.map(s => s.tempo).filter(v=>v!==undefined) as number[];
  let tempoStd = 0;
  if (tempos.length > 1) {
    const mean = tempos.reduce((a,b)=>a+b,0)/tempos.length;
    const variance = tempos.reduce((a,b)=>a+(b-mean)**2,0)/tempos.length;
    tempoStd = Math.sqrt(variance);
  }
  const fatigue: VelocityResult['fatigueIndicator'] = velocityLoss === null ? 'insufficient_data' : velocityLoss < 10 ? 'low' : velocityLoss <= 20.0001 ? 'moderate' : 'high';
  const recommendations: string[] = [];
  if (fatigue === 'insufficient_data') recommendations.push('enter_velocity_for_at_least_two_sets');
  else if (fatigue === 'high') recommendations.push('review_set_quality_and_consider_stopping');
  else if (fatigue === 'moderate') recommendations.push('monitor_fatigue');
  else recommendations.push('continue');
  return {
    velocityLossPercent: velocityLoss === null ? null : Number(velocityLoss.toFixed(2)),
    tempoConsistency: tempos.length > 1 ? Number(tempoStd.toFixed(3)) : null,
    fatigueIndicator: fatigue,
    velocityReadings: velocities.length,
    tempoReadings: tempos.length,
    dataCoveragePct: Math.round(((velocities.length + tempos.length) / (sets.length * 2)) * 100),
    recommendations,
    disclaimer: 'تحليل إرشادي، ليس قياسًا مخبريًا',
  };
}

