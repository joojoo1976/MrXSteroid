export interface WaterIntakeInput { weightKg: number; activityLevel: number; }
export interface WaterIntakeOutput { dailyWaterLiters: number; }

function isFiniteNum(n: unknown): n is number { return typeof n === 'number' && Number.isFinite(n); }

export function calculateWaterIntakeV6(input: WaterIntakeInput): WaterIntakeOutput {
  const { weightKg, activityLevel } = input;
  if (!isFiniteNum(weightKg) || !isFiniteNum(activityLevel)) throw new Error('Invalid numeric input');
  if (weightKg <= 0) throw new Error('Weight must be positive');
  if (activityLevel < 1 || activityLevel > 1.4) throw new Error('Activity level must be between 1.0 and 1.4');
  const baseMl = weightKg * 35;
  const adjusted = baseMl * (1 + (activityLevel - 1) * 0.1);
  const dailyWaterLiters = Math.round((adjusted / 1000) * 100) / 100;
  if (!Number.isFinite(dailyWaterLiters) || dailyWaterLiters <= 0) throw new Error('Inputs produce an invalid water estimate');
  return { dailyWaterLiters };
}
