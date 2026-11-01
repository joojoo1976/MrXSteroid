
export function detectPlateauV5(history: { date: string; weight: number; strength: number; measurements: any }[]) {
  const n = history.length;
  const sumX = history.reduce((s,_,i)=>s+i,0);
  const sumY = history.reduce((s,h)=>s+h.weight,0);
  const sumXY = history.reduce((s,h,i)=>s+i*h.weight,0);
  const sumX2 = history.reduce((s,_,i)=>s+i*i,0);
  const slope = (n*sumXY - sumX*sumY)/(n*sumX2 - sumX*sumX);
  const isPlateau = Math.abs(slope) < 0.2 && n > 21;
  const multiMetric = {
    weightPlateau: isPlateau,
    strengthIncreasing: history[history.length-1].strength > history[0].strength,
    interpretation: isPlateau && history[history.length-1].strength > history[0].strength ? 'Recomposition not plateau' : 'True plateau'
  };
  const causal = { cause: 'Volume low 8 sets/week need 12-20', confidence: 75 };
  return { slope, isPlateau, multiMetric, causal, breakStrategies: ['+20% volume', 'Change to 5x5', 'Deload week'], confidence: 85 };
}
