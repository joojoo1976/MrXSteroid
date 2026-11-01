/**
 * lib/tools/schemas/bodyfat.ts
 * ════════════════════════════════════════════════════════════════════════════════
 *  Tool #2 — Layer 2: Zod validation boundary for FFMI & Body Fat Analyzer input.
 * ════════════════════════════════════════════════════════════════════════════════
 */

import { z } from 'zod';

export const BodyFatInputSchema = z
  .object({
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
    neckCm: z
      .number()
      .finite('محيط الرقبة يجب أن يكون رقماً محدوداً')
      .min(20, 'محيط الرقبة الأدنى 20 سم')
      .max(60, 'محيط الرقبة الأقصى 60 سم'),
    waistCm: z
      .number()
      .finite('محيط الخصر يجب أن يكون رقماً محدوداً')
      .min(40, 'محيط الخصر الأدنى 40 سم')
      .max(200, 'محيط الخصر الأقصى 200 سم'),
    hipCm: z
      .number()
      .finite('محيط الورك يجب أن يكون رقماً محدوداً')
      .min(50, 'محيط الورك الأدنى 50 سم')
      .max(200, 'محيط الورك الأقصى 200 سم')
      .optional(),
    unitSystem: z.enum(['metric', 'imperial'], { message: 'نظام الوحدات يجب أن يكون metric أو imperial' }).optional(),
  })
  .strict()
  .refine((data) => data.sex !== 'female' || (data.hipCm !== undefined && data.hipCm >= 50), {
    message: 'محيط الورك مطلوب للإناث ويجب أن يكون 50 سم على الأقل',
    path: ['hipCm'],
  });

export type BodyFatInput = z.infer<typeof BodyFatInputSchema>;