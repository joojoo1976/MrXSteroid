import { z } from 'zod';

const PlateauPointSchema = z.object({
    date: z.string().date(),
    weight_kg: z.number().finite().positive().optional(),
    lift_1rm_kg: z.number().finite().positive().optional(),
    measurement: z.number().finite().positive().optional(),
  }).strict().refine((point) => point.weight_kg !== undefined || point.lift_1rm_kg !== undefined || point.measurement !== undefined, { message: 'At least one metric is required' });

export const PlateauInputSchema = z.object({
  points: z.array(PlateauPointSchema).min(1).max(200),
}).strict();
export type PlateauInput = z.infer<typeof PlateauInputSchema>;

export interface PlateauResult {
  isPlateau: boolean;
  ruleSignalStrength: 'low' | 'moderate' | 'high';
  affectedMetrics: string[];
  possibleCauses: string[];
  recommendations: string[];
  disclaimer: string;
}

function parseDate(s: string): number {
  const t = Date.parse(s);
  if (!Number.isFinite(t)) throw new Error('invalid date');
  return t;
}

function slope(xs: number[], ys: number[]): number {
  const n = xs.length;
  const mx = xs.reduce((a,b)=>a+b,0)/n;
  const my = ys.reduce((a,b)=>a+b,0)/n;
  let num=0, den=0;
  for (let i=0;i<n;i++){ num += (xs[i]-mx)*(ys[i]-my); den += (xs[i]-mx)**2; }
  if (den === 0) return 0;
  return num/den;
}

export function calculatePlateauDetectiveV6(input: PlateauInput): PlateauResult {
  const { points } = input;
  if (!Array.isArray(points) || points.length === 0) throw new Error('no data');
  const dates = points.map(p => parseDate(p.date));
  const metrics: Record<string, number[]> = { weight_kg: [], lift_1rm_kg: [], measurement: [] };
  const xsByMetric: Record<string, number[]> = { weight_kg: [], lift_1rm_kg: [], measurement: [] };
  for (let i=0;i<points.length;i++){
    const p = points[i];
    if (p.weight_kg !== undefined) { if (!Number.isFinite(p.weight_kg)) throw new Error('invalid value'); metrics.weight_kg.push(p.weight_kg); xsByMetric.weight_kg.push(dates[i]); }
    if (p.lift_1rm_kg !== undefined) { if (!Number.isFinite(p.lift_1rm_kg)) throw new Error('invalid value'); metrics.lift_1rm_kg.push(p.lift_1rm_kg); xsByMetric.lift_1rm_kg.push(dates[i]); }
    if (p.measurement !== undefined) { if (!Number.isFinite(p.measurement)) throw new Error('invalid value'); metrics.measurement.push(p.measurement); xsByMetric.measurement.push(dates[i]); }
  }
  const threshold = 0.05; // per day change small
  const affected: string[] = [];
  let plateauCount = 0;
  for (const m of Object.keys(metrics)) {
    if (metrics[m].length < 3) continue;
    const spanWeeks = (Math.max(...xsByMetric[m]) - Math.min(...xsByMetric[m])) / (7*86400000);
    if (spanWeeks < 3) continue;
    const sl = slope(xsByMetric[m].map(d=>d/86400000), metrics[m]);
    if (Math.abs(sl) < threshold) { affected.push(m); plateauCount++; }
  }
  const isPlateau = plateauCount > 0;
  const ruleSignalStrength: PlateauResult['ruleSignalStrength'] = !isPlateau ? 'low' : plateauCount > 1 ? 'high' : 'moderate';
  const possibleCauses: string[] = [];
  if (isPlateau) {
    possibleCauses.push('insufficient_progressive_overload');
    possibleCauses.push('recovery_deficit');
  }
  const recommendations: string[] = [];
  if (isPlateau) recommendations.push('vary_stimulus'); else recommendations.push('continue_current_plan');
  return {
    isPlateau,
    ruleSignalStrength,
    affectedMetrics: affected,
    possibleCauses,
    recommendations,
    disclaimer: 'تحليل إرشادي، ليس تشخيصًا',
  };
}

