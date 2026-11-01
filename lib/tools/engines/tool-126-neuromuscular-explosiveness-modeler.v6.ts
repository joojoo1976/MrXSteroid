import { z } from 'zod';

export const NeuromuscularInputSchema = z.object({
  vertical_jump_cm: z.number().finite().min(0).optional(),
  broad_jump_cm: z.number().finite().min(0).optional(),
  sprint_10m_s: z.number().finite().positive().optional(),
  sprint_20m_s: z.number().finite().positive().optional(),
  one_rm_kg: z.number().finite().positive().optional(),
  body_weight_kg: z.number().finite().positive(),
}).strict();
export type NeuromuscularInput = z.infer<typeof NeuromuscularInputSchema>;

export interface NeuromuscularResult {
  explosivenessScore: number | null;
  testsReported: number;
  strengths: string[];
  weaknesses: string[];
  disclaimer: string;
}

export function calculateNeuromuscularV6(input: NeuromuscularInput): NeuromuscularResult {
  const { vertical_jump_cm, broad_jump_cm, sprint_10m_s, sprint_20m_s, one_rm_kg, body_weight_kg } = input;
  if (!Number.isFinite(body_weight_kg) || body_weight_kg <= 0) throw new Error('body weight must be positive');
  const vals = [vertical_jump_cm, broad_jump_cm, sprint_10m_s, sprint_20m_s, one_rm_kg, body_weight_kg].filter((v) => v !== undefined) as number[];
  if (vals.some((v) => !Number.isFinite(v))) throw new Error('invalid input');
  if (vals.some((v) => v < 0)) throw new Error('negative input');
  if ([sprint_10m_s, sprint_20m_s, one_rm_kg].some((v) => v !== undefined && v <= 0)) throw new Error('time and one-rep max must be positive');
  // heuristic scoring: each test compared to generic reference range
  const scores: number[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (vertical_jump_cm !== undefined) {
    const s = Math.max(0, Math.min(100, (vertical_jump_cm / 70) * 100));
    scores.push(s);
    if (s >= 70) strengths.push('vertical_jump'); else weaknesses.push('vertical_jump');
  }
  if (broad_jump_cm !== undefined) {
    const s = Math.max(0, Math.min(100, (broad_jump_cm / 250) * 100));
    scores.push(s);
    if (s >= 70) strengths.push('broad_jump'); else weaknesses.push('broad_jump');
  }
  if (sprint_10m_s !== undefined) {
    const s = Math.max(0, Math.min(100, ((2.0 - sprint_10m_s) / 0.8) * 100));
    scores.push(s);
    if (s >= 70) strengths.push('sprint_10m'); else weaknesses.push('sprint_10m');
  }
  if (sprint_20m_s !== undefined) {
    const s = Math.max(0, Math.min(100, ((3.5 - sprint_20m_s) / 1.2) * 100));
    scores.push(s);
    if (s >= 70) strengths.push('sprint_20m'); else weaknesses.push('sprint_20m');
  }
  if (one_rm_kg !== undefined) {
    const ratio = one_rm_kg / body_weight_kg;
    const s = Math.max(0, Math.min(100, (ratio / 2) * 100));
    scores.push(s);
    if (s >= 70) strengths.push('strength_ratio'); else weaknesses.push('strength_ratio');
  }
  const explosivenessScore = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null;
  if (strengths.length === 0) strengths.push('none');
  if (weaknesses.length === 0) weaknesses.push('none');
  return {
    explosivenessScore,
    testsReported: scores.length,
    strengths,
    weaknesses,
    disclaimer: 'heuristic خاص بالتطبيق، ليس معيارًا علميًا معتمدًا',
  };
}

