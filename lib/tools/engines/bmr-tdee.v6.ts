// BMR/TDEE v6 engine (pure TS)
export interface BmrTdeeInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: 'male' | 'female';
  activityLevel: number;
}

export interface BmrTdeeOutput {
  bmrKcal: number;
  tdeeKcal: number;
}

function isFiniteNum(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

export function calculateBmrTdeeV6(input: BmrTdeeInput): BmrTdeeOutput {
  const { weightKg, heightCm, age, sex, activityLevel } = input;
  if (!isFiniteNum(weightKg) || !isFiniteNum(heightCm) || !isFiniteNum(age) || !isFiniteNum(activityLevel)) {
    throw new Error('Invalid numeric input');
  }
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) {
    throw new Error('Inputs must be positive');
  }
  if (sex !== 'male' && sex !== 'female') throw new Error('Sex must be male or female');
  if (activityLevel < 1.2 || activityLevel > 1.9) throw new Error('Activity level must be between 1.2 and 1.9');
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = sex === 'male' ? base + 5 : base - 161;
  const tdee = bmr * activityLevel;
  if (!Number.isFinite(bmr) || !Number.isFinite(tdee) || bmr <= 0 || tdee <= 0) {
    throw new Error('Inputs produce an invalid energy estimate');
  }
  return { bmrKcal: Math.round(bmr), tdeeKcal: Math.round(tdee) };
}
