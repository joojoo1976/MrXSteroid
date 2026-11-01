
export interface ACWRInputsV5 {
  dailyLoads: { date: string; load: number; rpe?: number; duration?: number; hr?: number }[];
  // Future
  injuryHistory?: any[];
  watchData?: { hr: number; duration: number }[]; // For auto RPE
}

export function calculateACWRV5(inputs: ACWRInputsV5) {
  const last7 = inputs.dailyLoads.slice(-7).reduce((s,d)=>s+d.load,0)/7;
  const last28 = inputs.dailyLoads.slice(-28).reduce((s,d)=>s+d.load,0)/28;
  const acwr = last7 / (last28 || 1);
  const mean = inputs.dailyLoads.reduce((s,d)=>s+d.load,0)/inputs.dailyLoads.length;
  const sd = Math.sqrt(inputs.dailyLoads.reduce((s,d)=>s+Math.pow(d.load-mean,2),0)/inputs.dailyLoads.length);
  const monotony = mean / (sd || 1);
  const strain = mean * monotony;
  
  // Future: Injury Risk Model - Logistic Regression stub
  let injuryRisk = 0;
  if (acwr > 1.5) injuryRisk += 40;
  if (monotony > 2.0) injuryRisk += 30;
  if (inputs.injuryHistory && inputs.injuryHistory.length > 0) injuryRisk += 15;
  injuryRisk = Math.min(95, injuryRisk);
  
  // Future: Auto RPE from watch
  const autoLoads = inputs.watchData ? inputs.watchData.map(d => ({ load: d.hr * d.duration / 100 })) : [];
  
  // Future: What-If Simulator
  const whatIf = (futureLoad: number) => {
    const futureAcute = (last7*6 + futureLoad)/7;
    return futureAcute / last28;
  };
  
  return { acwr, acute: last7, chronic: last28, monotony, strain, injuryRisk, whatIf, autoLoads, confidence: 85 };
}
