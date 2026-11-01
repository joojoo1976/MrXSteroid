export interface BmiInput { weightKg: number; heightCm: number; }
export interface BmiOutput { bmi: number; category: 'underweight' | 'normal' | 'overweight' | 'obese'; }
export function calculateBmi({ weightKg, heightCm }: BmiInput): BmiOutput {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || weightKg <= 0 || heightCm <= 0) {
    throw new Error('Invalid input: weight and height must be positive finite numbers');
  }
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let category: BmiOutput['category'];
  if (bmi < 18.5) category = 'underweight';
  else if (bmi < 25) category = 'normal';
  else if (bmi < 30) category = 'overweight';
  else category = 'obese';
  return { bmi: Math.round(bmi * 10) / 10, category };
}
