
export function findSubstitutionsV5(inputs: { original: string; availableEquipment: string[]; limitation: string; painLevel?: string }) {
  const similarity = (alt: any) => 0.5*alt.muscleOverlap + 0.3*alt.pattern + 0.2*alt.equipment;
  // Future: LLM substitution
  const llmAlternatives = [
    { name: 'Goblet Squat', muscleOverlap: 100, pattern: 100, equipment: 100, similarity: 100, reason: 'نفس العضلات ونفس النمط ومتاح' },
    { name: 'Bulgarian Split Squat', muscleOverlap: 80, pattern: 70, equipment: 100, similarity: 82, reason: 'يركز رجل واحدة - جيد للركبة' },
  ];
  // Future: Pain filter
  const safeAlternatives = inputs.painLevel === 'sharp' && inputs.original.includes('Deadlift') ? 
    [{ name: 'Glute Bridge', reason: 'آمن لأسفل ظهر - استشر مختص', safety: 'safe' }] : llmAlternatives;
  // Future: Equipment scanner (stub - in production use image recognition)
  const equipmentScanner = { detected: inputs.availableEquipment, missing: [], alternativesBasedOnActual: safeAlternatives };
  return { alternatives: safeAlternatives, equipmentScanner, videoComparison: safeAlternatives.map(a=>({ name: a.name, video: `${a.name}.mp4`, muscles: ['quads', 'glutes'] })), confidence: 85 };
}
