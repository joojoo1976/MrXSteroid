export interface RestTimerInput { sets: number; intensity: 'low' | 'moderate' | 'high'; }
export interface RestTimerOutput { restSeconds: number; }
export function calculateRestTimer({ sets, intensity }: RestTimerInput): RestTimerOutput {
  if (!Number.isFinite(sets) || sets <= 0) throw new Error('Invalid input');
  if (!Number.isInteger(sets)) throw new Error('Sets must be a whole number');
  if (intensity !== 'low' && intensity !== 'moderate' && intensity !== 'high') throw new Error('Invalid intensity');
  const base = intensity === 'high' ? 180 : intensity === 'moderate' ? 120 : 60;
  return { restSeconds: base };
}
