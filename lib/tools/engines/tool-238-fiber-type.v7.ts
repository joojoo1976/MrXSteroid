import { FiberObservationInputV7Schema, type FiberObservationInputV7 } from '@/lib/tools/schemas/tool-238-fiber-type-adaptation-score.v7';

export function recordFiberObservation(raw: unknown) {
  const entry: FiberObservationInputV7 = FiberObservationInputV7Schema.parse(raw);
  return {
    status: 'RECORDED' as const,
    resultType: 'USER_PROVIDED' as const,
    entry: { ...entry, sourceReference: entry.sourceReference || null },
    score: {
      status: 'NOT_AVAILABLE' as const,
      reasonCode: 'NO_VALIDATED_FIBER_TYPE_MODEL' as const,
      message: 'Self-reported preferences and performance observations do not establish muscle-fiber type or adaptation.',
    },
    limitations: [
      'No fiber-type percentage, dominance label, training prescription, or adaptation prediction is calculated.',
      'The observation is a user-entered record, not a physiological assessment.',
    ],
  };
}
