/**
 * lib/tools/schemas/lab.ts
 * ════════════════════════════════════════════════════════════════════════════
 *  Tool #??? — Layer 2: Zod validation boundary for Lab Analyzer input.
 * ════════════════════════════════════════════════════════════════════════════
 * Follows the `lib/schemas/calculatorSchema.ts` conventions: `.strict()` objects,
 * finite numbers, bilingual error messages (AR first).
 */

import { z } from 'zod';

export const LabInputSchema = z
  .object({
    glucose: z
      .number()
      .finite('الجلوكوز يجب أن يكون رقماً محدوداً')
      .min(0, 'الجلوكوز يجب أن يكون صفراً أو أكثر')
      .max(500, 'الجلوكوز الأقصى 500 ملغ/ديسيلتر'),
    totalCholesterol: z
      .number()
      .finite('الكولسترول الكلي يجب أن يكون رقماً محدوداً')
      .min(0, 'الكولسترول الكلي يجب أن يكون صفراً أو أكثر')
      .max(500, 'الكولسترول الكلي الأقصى 500 ملغ/ديسيلتر'),
    hdl: z
      .number()
      .finite('الكولسترول النافع يجب أن يكون رقماً محدوداً')
      .min(0, 'الكولسترول النافع يجب أن يكون صفراً أو أكثر')
      .max(200, 'الكولسترول النافع الأقصى 200 ملغ/ديسيلتر'),
    ldl: z
      .number()
      .finite('الكولسترول الضار يجب أن يكون رقماً limitado')
      .min(0, 'الكولسترول الضار يجب أن يكون صفراً أو أكثر')
      .max(300, 'الكولسترول الضار الأقصى 300 ملغ/ديسيلتر'),
    triglycerides: z
      .number()
      .finite('الدهون الثلاثية يجب أن تكون رقماً محدوداً')
      .min(0, 'الدهون الثلاثية يجب أن تكون صفراً أو أكثر')
      .max(500, 'الدهون الثلاثية القصوى 500 ملغ/ديسيلتر'),
  })
  .strict();