export interface ProteinNeedsInput { weightKg: number; goal: 'maintain' | 'bulk' | 'cut'; activityLevel: number; }
export interface ProteinNeedsOutput { dailyProteinGrams: number; }

function isFiniteNum(n: unknown): n is number { return typeof n === 'number' && Number.isFinite(n); }

export function calculateProteinNeedsV6(input: ProteinNeedsInput): ProteinNeedsOutput {
  const { weightKg, goal, activityLevel } = input;
  if (!isFiniteNum(weightKg) || !isFiniteNum(activityLevel)) throw new Error('Invalid numeric input');
  if (weightKg <= 0) throw new Error('Weight must be positive');
  if (goal !== 'maintain' && goal !== 'bulk' && goal !== 'cut') throw new Error('Goal must be maintain, bulk, or cut');
  if (activityLevel < 1 || activityLevel > 1.4) throw new Error('Activity level must be between 1.0 and 1.4');
  const base = goal === 'bulk' ? 2.0 : goal === 'cut' ? 2.2 : 1.6;
  const factor = 1 + (activityLevel - 1) * 0.05;
  const dailyProteinGrams = Math.round(weightKg * base * factor);
  if (!Number.isFinite(dailyProteinGrams) || dailyProteinGrams <= 0) throw new Error('Inputs produce an invalid protein estimate');
  return { dailyProteinGrams };
}
