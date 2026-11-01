
export function calculateVelocityLossV5(inputs: { velocities: number[]; exercise: string; oneRM?: number }) {
  const vl = (inputs.velocities[0] - inputs.velocities[inputs.velocities.length-1])/inputs.velocities[0]*100;
  let fatigue = 'low'; if (vl>20) fatigue='high'; if (vl>40) fatigue='very-high';
  // Future: VBT - estimate %1RM from velocity
  const vbt = inputs.velocities[0] < 0.5 ? { estimated1RMPercent: 80, suggestedLoad: inputs.oneRM ? inputs.oneRM*0.8 : 0 } : null;
  // Future: Bar Path
  const barPath = { straightness: 85, deviation: 'slight forward', risk: vl>30 ? 'loss of control' : 'good' };
  const autoStop = vl>40 ? { shouldStop: true, reason: 'خطر إصابة - أوقف المجموعة' } : { shouldStop: false };
  return { velocityLoss: vl, fatigue, vbt, barPath, autoStop, confidence: 85 };
}
