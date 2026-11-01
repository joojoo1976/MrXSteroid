/**
 * lib/tools/schemas/master-calculator.ts
 * ════════════════════════════════════════════════════════════════════════════════
 *  Tool #9 — Layer 2: Zod validation boundary for Master Calculator input.
 * ════════════════════════════════════════════════════════════════════════════════
 */

import { z } from 'zod';

const CompoundSchema = z.object({
  name: z.string().min(1),
  doseMgPerWeek: z.number().finite().positive().max(5000),
  halfLifeDays: z.number().finite().positive().max(100),
});

export const MasterCalculatorInputSchema = z
  .object({
    age: z.number().finite().min(13).max(100),
    sex: z.enum(['male', 'female']),
    heightCm: z.number().finite().min(100).max(250),
    weightKg: z.number().finite().min(30).max(300),
    activityLevel: z.number().finite().min(1.2).max(1.9),
    phase: z.enum(['bulk', 'cut', 'maintenance', 'recomp']),
    bodyFatPercentage: z.number().finite().min(0).max(50).optional(),
    compounds: z.array(CompoundSchema).optional(),
    unitSystem: z.enum(['metric', 'imperial']).optional(),
  })
  .strict();

export type MasterCalculatorInput = z.infer<typeof MasterCalculatorInputSchema>;