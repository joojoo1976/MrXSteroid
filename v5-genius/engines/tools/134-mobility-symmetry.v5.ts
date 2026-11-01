
export function calculateMobilityV5(inputs: { left: Record<string, number>; right: Record<string, number>; norms: Record<string, number> }) {
  const si = (joint: string) => Math.abs(inputs.left[joint]-inputs.right[joint])/((inputs.left[joint]+inputs.right[joint])/2)*100;
  const mobilityScore = (joint: string) => inputs.left[joint]/inputs.norms[joint]*100;
  const asymmetries = Object.keys(inputs.left).map(j => ({ joint: j, si: si(j), isAsymmetry: si(j)>10 }));
  // Future: Corrective program
  const correctiveProgram = asymmetries.filter(a=>a.isAsymmetry).map(a => ({ joint: a.joint, drills: ['Ankle mobilization 2x30s', 'Calf stretch'], duration: '10 min daily' }));
  // Future: Injury prevention
  const injuryRisk = asymmetries.some(a=>a.si>15) ? { risk: 'high', joint: 'knee', message: 'خطر إصابة ركبة - ركز تقوية' } : { risk: 'low' };
  // Future: 3D Body Map data
  const bodyMap3D = { joints: Object.keys(inputs.left).map(j => ({ name: j, left: inputs.left[j], right: inputs.right[j], si: si(j), color: si(j)>10 ? 'red' : 'green' })) };
  return { symmetryIndex: asymmetries, mobilityScore: Object.keys(inputs.left).map(j=>({ joint: j, score: mobilityScore(j) })), correctiveProgram, injuryRisk, bodyMap3D, confidence: 85 };
}
