import { z } from 'zod';

/** Fail-closed output until a maintained, sourced interaction dataset is configured. */
export const DrugInteractionResultSchema = z.object({
  status: z.literal('NOT_AVAILABLE'),
  reason: z.literal('NO_VERIFIED_INTERACTION_SOURCE'),
}).strict();

export type DrugInteractionResult = z.infer<typeof DrugInteractionResultSchema>;
