import { z } from 'zod';

export const HabitRecordInputV7Schema = z.object({
  habit: z.string().trim().min(1).max(120),
  completed: z.boolean(),
  recordedOn: z.iso.date(),
}).strict();

export type HabitRecordInputV7 = z.infer<typeof HabitRecordInputV7Schema>;
