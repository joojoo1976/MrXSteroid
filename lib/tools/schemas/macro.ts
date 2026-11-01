/**
 * lib/tools/schemas/macro.ts
 * ════════════════════════════════════════════════════════════════════════════════
 *  Tool #1 — Layer 2: Zod validation boundary for Adaptive Macro Calculator input.
 * ════════════════════════════════════════════════════════════════════════════════
 * Follows the calculatorSchema conventions: `.strict()` objects,
 * finite numbers, bilingual error messages (AR first).
 */

import { z } from 'zod';

export const MacroInputSchema = z
  .object({
    age: z
      .number()
      .finite('العمر يجب أن يكون رقماً محدوداً')
      .min(13, 'العمر الأدنى 13 سنة')
      .max(100, 'العمر الأقصى 100 سنة'),
    sex: z.enum(['male', 'female'], { message: 'الجنس يجب أن يكون male أو female' }),
    heightCm: z
      .number()
      .finite('الطول يجب أن يكون رقماً محدوداً')
      .min(100, 'الطول الأدنى 100 سم')
      .max(250, 'الطول الأقصى 250 سم'),
    weightKg: z
      .number()
      .finite('الوزن يجب أن يكون رقماً محدوداً')
      .min(30, 'الوزن الأدنى 30 كجم')
      .max(300, 'الوزن الأقصى 300 كجم'),
    activityLevel: z
      .number()
      .finite('مستوى النشاط يجب أن يكون رقماً محدوداً')
      .min(1.2, 'مستوى النشاط الأدنى 1.2')
      .max(1.9, 'مستوى النشاط الأقصى 1.9'),
    phase: z.enum(['bulk', 'cut', 'maintenance', 'recomp'], { message: 'المرحلة غير صالحة' }),
    targetWeightKg: z
      .number()
      .finite('الوزن المستهدف يجب أن يكون رقماً محدوداً')
      .min(30, 'الوزن المستهدف الأدنى 30 كجم')
      .max(300, 'الوزن المستهدف الأقصى 300 كجم')
      .optional(),
    unitSystem: z.enum(['metric', 'imperial'], { message: 'نظام الوحدات يجب أن يكون metric أو imperial' }).optional(),
  })
  .strict();

export type MacroInput = z.infer<typeof MacroInputSchema>;