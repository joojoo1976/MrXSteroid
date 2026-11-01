/** Input and output contracts for the session-only lab value record. */
import { z } from 'zod';

export const EstrogenProlactinInputSchema = z.object({
  e2Level: z.number().finite().min(0),
  e2Unit: z.enum(['pg/mL', 'pmol/L']),
  prolactinLevel: z.number().finite().min(0),
  prolactinUnit: z.enum(['ng/mL', 'mIU/L']),
});

export const AromatizationScoreSchema = z.object({
  status: z.literal('NOT_ASSESSED'),
  reasonCode: z.literal('UNVALIDATED_RULES'),
  riskLevel: z.null(),
  riskPercentage: z.null(),
  recommendedAIMg: z.null(),
  recommendedDAMg: z.null(),
  keyFindings: z.tuple([]),
});

export type EstrogenProlactinInput = z.infer<typeof EstrogenProlactinInputSchema>;
export type AromatizationScore = z.infer<typeof AromatizationScoreSchema>;
