export interface OneRepMaxInput { weightKg: number; reps: number; }
export interface OneRepMaxOutput { oneRepMaxKg: number; }
export function calculateOneRepMax({ weightKg, reps }: OneRepMaxInput): OneRepMaxOutput {
  if (!Number.isFinite(weightKg) || !Number.isFinite(reps) || weightKg <= 0 || reps <= 0) throw new Error('Invalid input');
  if (!Number.isInteger(reps)) throw new Error('Repetitions must be a whole number');
  if (reps === 1) return { oneRepMaxKg: Math.round(weightKg) };
  const orm = weightKg * (1 + reps / 30);
  if (!Number.isFinite(orm)) throw new Error('Inputs produce an invalid estimate');
  return { oneRepMaxKg: Math.round(orm * 10) / 10 };
}
