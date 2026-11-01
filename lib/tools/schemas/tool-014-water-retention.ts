import { z } from 'zod';

export const WaterRetentionResultSchema = z.object({
  status: z.literal('NOT_AVAILABLE'),
  reason: z.literal('NO_VALIDATED_MODEL'),
});

export type WaterRetentionResult = z.infer<typeof WaterRetentionResultSchema>;
