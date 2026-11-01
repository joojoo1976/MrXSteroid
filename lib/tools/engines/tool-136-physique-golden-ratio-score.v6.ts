import { z } from 'zod';

export const PhysiqueInputSchema = z.object({
  shoulder_cm: z.number().finite().positive().max(300).optional(),
  chest_cm: z.number().finite().positive().max(300).optional(),
  waist_cm: z.number().finite().positive().max(300).optional(),
  hips_cm: z.number().finite().positive().max(300).optional(),
  arm_cm: z.number().finite().positive().max(150).optional(),
  thigh_cm: z.number().finite().positive().max(200).optional(),
  calf_cm: z.number().finite().positive().max(120).optional(),
});
export type PhysiqueInput = z.infer<typeof PhysiqueInputSchema>;

export interface PhysiqueResult {
  status: 'ok' | 'insufficient_data';
  proportionScore: number | null;
  ratios: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  disclaimer: string;
}

export function calculatePhysiqueV6(input: PhysiqueInput): PhysiqueResult {
  PhysiqueInputSchema.parse(input);
  const vals = Object.values(input).filter(v=>v!==undefined) as number[];
  if (vals.some(v => !Number.isFinite(v))) throw new Error('invalid input');
  if (vals.some(v => v <= 0)) throw new Error('measurements must be positive');
  if (vals.some(v => v > 300)) throw new Error('measurement outside supported range');
  const ratios: Record<string, number> = {};
  const scores: number[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const ideal: Record<string, number> = { shoulder_waist: 1.618, chest_waist: 1.4, arm_waist: 0.5 };
  if (input.shoulder_cm && input.waist_cm) {
    const r = input.shoulder_cm / input.waist_cm;
    ratios.shoulder_waist = Number(r.toFixed(3));
    const score = Math.max(0, 100 - Math.abs(r - ideal.shoulder_waist)*100);
    scores.push(score);
    if (score >= 70) strengths.push('shoulder_waist'); else weaknesses.push('shoulder_waist');
  }
  if (input.chest_cm && input.waist_cm) {
    const r = input.chest_cm / input.waist_cm;
    ratios.chest_waist = Number(r.toFixed(3));
    const score = Math.max(0, 100 - Math.abs(r - ideal.chest_waist)*100);
    scores.push(score);
    if (score >= 70) strengths.push('chest_waist'); else weaknesses.push('chest_waist');
  }
  if (input.arm_cm && input.waist_cm) {
    const r = input.arm_cm / input.waist_cm;
    ratios.arm_waist = Number(r.toFixed(3));
    const score = Math.max(0, 100 - Math.abs(r - ideal.arm_waist)*100);
    scores.push(score);
    if (score >= 70) strengths.push('arm_waist'); else weaknesses.push('arm_waist');
  }
  const proportionScore = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null;
  if (strengths.length === 0) strengths.push('none');
  if (weaknesses.length === 0) weaknesses.push('none');
  return {
    status: scores.length ? 'ok' : 'insufficient_data',
    proportionScore,
    ratios,
    strengths,
    weaknesses,
    disclaimer: 'heuristic جمالي، ليس معيارًا صحيًا إلزاميًا',
  };
}

