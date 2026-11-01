
export interface ReadinessInputsV5 {
  sleepHours: number; sleepQuality: number; hrv?: number; restingHR?: number;
  soreness: number; motivation: number; stress: number; previousLoad?: number;
  // Future
  hrvHistory?: number[]; // Last 7 days for LSTM
  feedbackHistory?: { date: string; predicted: number; actual: number; useful: boolean }[];
  rhrHistory?: number[];
}

export interface ReadinessOutputsV5 {
  readinessScore: number; decision: string; topFactors: any[]; explanation: any;
  // Future
  lstmPrediction?: { fatigueIn2Days: number; confidence: number; trend: string };
  narrative?: { ar: string; en: string; story: string }; // LLM generated
  adaptiveWeights?: Record<string, number>; // RL learned
  illnessAlert?: { risk: number; message: any; symptoms: string[] };
  confidence: number;
}

// Future: LSTM stub for HRV trend
export function predictFatigueWithLSTM(hrvHistory: number[]) {
  // In production: use tensorflow.js LSTM
  // const model = await tf.loadLayersModel(...); model.predict(...)
  // Simplified: if HRV decreasing 3 days = fatigue coming
  if (hrvHistory.length < 3) return { fatigueIn2Days: 0, confidence: 50, trend: 'insufficient' };
  const decreasing = hrvHistory[hrvHistory.length-1] < hrvHistory[hrvHistory.length-2] && hrvHistory[hrvHistory.length-2] < hrvHistory[hrvHistory.length-3];
  return {
    fatigueIn2Days: decreasing ? 75 : 20,
    confidence: 78,
    trend: decreasing ? 'decreasing' : 'stable',
    model: 'lstm-stub'
  };
}

// Future: RL weight adaptation
export function adaptWeightsWithRL(feedbackHistory: any[], currentWeights: Record<string, number>) {
  // If user says sleep prediction was more useful, increase sleep weight
  const newWeights = { ...currentWeights };
  const usefulFeedback = feedbackHistory.filter(f => f.useful);
  if (usefulFeedback.length > 5) {
    // Simple RL: increase weight of factor that correlated with actual readiness
    newWeights.sleepHours = Math.min(0.35, newWeights.sleepHours + 0.02);
  }
  return newWeights;
}

export function calculateDailyReadinessV5(inputs: ReadinessInputsV5) {
  const weights = { sleepHours: 0.25, soreness: 0.20, sleepQuality: 0.15, hrv: 0.15, motivation: 0.10, stress: 0.10, previousLoad: 0.05 };
  const normSleep = Math.min(1, inputs.sleepHours / 8);
  const normSoreness = 1 - (inputs.soreness / 10);
  const score = (normSleep * weights.sleepHours + normSoreness * weights.soreness) * 100;
  
  // Future: LSTM
  const lstmPrediction = inputs.hrvHistory ? predictFatigueWithLSTM(inputs.hrvHistory) : undefined;
  
  // Future: Illness detection
  let illnessAlert = undefined;
  if (inputs.restingHR && inputs.rhrHistory) {
    const avgRHR = inputs.rhrHistory.reduce((a,b)=>a+b,0)/inputs.rhrHistory.length;
    if (inputs.restingHR > avgRHR + 10 && inputs.hrv && inputs.hrv < 40) {
      illnessAlert = { risk: 65, message: { ar: 'احتمال مرض - يفضل راحة', en: 'Possible illness - rest suggested' }, symptoms: ['RHR +10', 'HRV low'] };
    }
  }
  
  // Future: LLM Narrative (stub, in production call Gemini API)
  const narrative = {
    ar: `جسمك بيقولك: ${score < 60 ? 'اديني يوم خفيف' : 'جاهز تتمرن بقوة'}، نومك ${inputs.sleepHours} ساعات`,
    en: `Your body says: ${score < 60 ? 'give me light day' : 'ready to train hard'}`,
    story: `Sleep ${inputs.sleepHours}h + Soreness ${inputs.soreness}/10 = Readiness ${score.toFixed(0)}%`
  };
  
  return { readinessScore: score, decision: score > 75 ? 'train-hard' : score > 50 ? 'modify' : 'rest', lstmPrediction, narrative, illnessAlert, confidence: inputs.hrv ? 90 : 70 };
}
