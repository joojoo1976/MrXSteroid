import { z } from 'zod';

export const CompoundScenarioSchema = z.object({
  name: z.string().trim().min(1).max(120),
  items: z.array(z.string().trim().min(1).max(120)).min(1).max(10),
  notes: z.string().trim().max(500).optional(),
}).strict();

export const StackComparisonInputSchema = z.object({
  scenarioA: CompoundScenarioSchema,
  scenarioB: CompoundScenarioSchema,
}).strict();

export const StackComparisonResultSchema = z.object({
  resultOrigin: z.literal('USER_PROVIDED'),
  assessment: z.literal('NOT_AVAILABLE'),
  reason: z.literal('NO_VALIDATED_COMPATIBILITY_SOURCE_CONFIGURED'),
  scenarioA: CompoundScenarioSchema,
  scenarioB: CompoundScenarioSchema,
}).strict();

export type CompoundScenario = z.infer<typeof CompoundScenarioSchema>;
export type StackComparisonInput = z.infer<typeof StackComparisonInputSchema>;
export type StackComparisonResult = z.infer<typeof StackComparisonResultSchema>;
