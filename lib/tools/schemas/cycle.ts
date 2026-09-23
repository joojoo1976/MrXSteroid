/**
 * lib/tools/schemas/cycle.ts
 * Tool #??? — Layer 2: Zod validation for Cycle Architect.
 */
import { z } from 'zod';

export const CycleCompoundSchema = z.object({
  compound: z.string().min(1, 'المركب مطلوب'),
  doseMg: z.number().finite('الجرعة يجب أن تكون رقماً محدوداً').positive('الجرعة يجب أن تكون أكبر من صفر').max(2000, 'الجرعة القصوى 2000 مغ'),
  frequencyPerWeek: z.number().int('التردد يجب أن يكون عدداً صحيحاً').min(1, 'مرة واحدة على الأقل أسبوعياً').max(7, 'الحد الأقصى 7 مرات أسبوعياً'),
  weeks: z.number().int('الأسابيع يجب أن تكون عدداً صحيحاً').min(1, 'أسبوع واحد على الأقل').max(20, 'الحد الأقصى 20 أسبوع'),
  startWeek: z.number().int('أسبوع البداية يجب أن يكون عدداً صحيحاً').min(1, 'يجب أن يبدأ من الأسبوع 1'),
}).strict();

export const CycleInputSchema = z.object({
  compounds: z.array(CycleCompoundSchema).min(1, 'يجب إضافة مركب واحد على الأقل').max(6, 'الحد الأقصى 6 مركبات'),
  cycleLengthWeeks: z.number().int('مدة الدورة يجب أن تكون عدداً صحيحاً').min(4, 'أقل مدة 4 أسابيع').max(20, 'أقصى مدة 20 أسبوع'),
  userWeightKg: z.number().finite('الوزن يجب أن يكون رقماً محدوداً').min(40, 'الوزن الأدنى 40 كجم').max(200, 'الوزن الأقصى 200 كجم').optional(),
  userHeightCm: z.number().finite('الطول يجب أن يكون رقماً محدوداً').min(140, 'الطول الأدنى 140 سم').max(220, 'الطول الأقصى 220 سم').optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  goal: z.enum(['bulk', 'cut', 'recomp', 'strength']),
}).strict();