import { z } from 'zod';

export const SessionMemoryInputV7Schema = z.object({
  entry: z.string().trim().min(1).max(400),
}).strict();

export type SessionMemoryInputV7 = z.infer<typeof SessionMemoryInputV7Schema>;
