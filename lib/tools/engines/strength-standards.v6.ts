export interface StrengthStandardsInput { liftKg: number; bodyWeightKg: number; sex: 'male' | 'female'; }
export interface StrengthStandardsOutput { ratio: number; level: 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'elite'; }
export function calculateStrengthStandards({ liftKg, bodyWeightKg, sex }: StrengthStandardsInput): StrengthStandardsOutput {
  if (!Number.isFinite(liftKg) || !Number.isFinite(bodyWeightKg) || liftKg <= 0 || bodyWeightKg <= 0) throw new Error('Invalid input');
  if (sex !== 'male' && sex !== 'female') throw new Error('Sex must be male or female');
  const ratio = liftKg / bodyWeightKg;
  const thresholds = sex === 'male' ? [0.5, 1.0, 1.5, 2.0] : [0.25, 0.5, 0.75, 1.0];
  let level: StrengthStandardsOutput['level'] = 'beginner';
  if (ratio >= thresholds[3]) level = 'elite';
  else if (ratio >= thresholds[2]) level = 'advanced';
  else if (ratio >= thresholds[1]) level = 'intermediate';
  else if (ratio >= thresholds[0]) level = 'novice';
  return { ratio: Math.round(ratio * 100) / 100, level };
}
