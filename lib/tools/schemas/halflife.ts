/**
 * lib/tools/schemas/halflife.ts
 * ════════════════════════════════════════════════════════════════════════════════
 *  Tool #4 — Layer 2: Zod validation boundary for Half-Life Simulator input.
 * ════════════════════════════════════════════════════════════════════════════════
 */

import { z } from 'zod';

const CompoundSchema = z.object({
  id: z.string().min(1),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  halfLifeDays: z.number().finite('نصف العمر يجب أن يكون رقماً محدوداً').positive('نصف العمر يجب أن يكون موجباً').max(100, 'نصف العمر الأقصى 100 يوم'),
  doseMg: z.number().finite('الجرعة يجب أن تكون رقماً محدوداً').positive('الجرعة يجب أن تكون موجبة').max(10000, 'الجرعة القصوى 10000 مجم'),
  frequencyDays: z.number().finite('التكرار يجب أن يكون رقماً محدوداً').positive('التكرار يجب أن يكون موجباً').max(30, 'التكرار الأقصى 30 يوم'),
  startDay: z.number().finite('يوم البداية يجب أن يكون رقماً محدوداً').min(1, 'يوم البداية أدنى 1').max(365, 'يوم البداية أقصى 365'),
  endDay: z.number().finite('يوم النهاية يجب أن يكون رقماً محدوداً').min(1, 'يوم النهاية أدنى 1').max(365, 'يوم النهاية أقصى 365').optional(),
});

export const HalflifeInputSchema = z
  .object({
    compounds: z.array(CompoundSchema).min(1, 'يجب إضافة مركب واحد على الأقل'),
    simulationDays: z.number().finite('أيام المحاكاة يجب أن تكون رقماً محدوداً').min(1, 'أدنى 1 يوم').max(365, 'أقصى 365 يوم'),
    unitSystem: z.enum(['metric', 'imperial']).optional(),
  })
  .strict();

export type HalflifeInput = z.infer<typeof HalflifeInputSchema>;