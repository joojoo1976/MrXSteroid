/**
 * lib/tools/schemas/genetic.ts
 * ════════════════════════════════════════════════════════════════════════════
 *  Tool #??? — Layer 2: Zod validation boundary for Genetic Potential input.
 * ════════════════════════════════════════════════════════════════════════════
 * Follows the `lib/schemas/calculatorSchema.ts` conventions: `.strict()` objects,
 * finite numbers, bilingual error messages (AR first).
 */

import { z } from 'zod';

export const GeneticInputSchema = z
  .object({
    heightCm: z
      .number()
      .finite('الطول يجب أن يكون رقماً محدوداً')
      .min(100, 'الطول الأدنى 100 سم')
      .max(250, 'الطول الأقصى 250 سم'),
    wristCm: z
      .number()
      .finite('محيط المعصم يجب أن يكون رقماً محدوداً')
      .min(10, 'محيط المعصم الأدنى 10 سم')
      .max(30, 'محيط المعصم الأقصى 30 سم'),
    ankleCm: z
      .number()
      .finite('محيط الكاحل يجب أن يكون رقماً محدوداً')
      .min(15, 'محيط الكاحل الأدنى 15 سم')
      .max(40, 'محيط الكاحل الأقصى 40 سم'),
    bodyFatPct: z
      .number()
      .finite('نسبة الدهون يجب أن تكون رقماً محدوداً')
      .min(1, 'نسبة الدهون الدنيا 1%')
      .max(60, 'نسبة الدهون القصوى 60%')
      .optional(),
  })
  .strict();