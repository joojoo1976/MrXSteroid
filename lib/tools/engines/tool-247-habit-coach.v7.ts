import { HabitRecordInputV7Schema } from '@/lib/tools/schemas/tool-247-habit-intelligence-coach.v7';

export function recordHabit(raw: unknown) {
  return {
    status: 'RECORDED' as const,
    resultType: 'USER_PROVIDED' as const,
    entry: HabitRecordInputV7Schema.parse(raw),
    limitations: [
      'Habit log only; no adherence score, behavioral inference, prediction, or coaching recommendation.',
      'The entry is not independently verified or persisted by this tool.',
    ],
  };
}
