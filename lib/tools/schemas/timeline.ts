/**
 * lib/tools/schemas/timeline.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #080 — Layer 2: Zod validation boundary for the Timeline Engine.
 * ═══════════════════════════════════════════════════════════════════════════
 * Follows the `lib/schemas/calculatorSchema.ts` & multi-ester conventions:
 * `.strict()` objects, finite numbers, bilingual error messages (AR first).
 */
import { z } from 'zod';
import {
    BIO_STATUS_TYPES,
    EXPERIENCE_LEVELS,
    GOAL_TYPES,
    type BiologicalStatus,
    type ExperienceLevel,
    type Goal,
} from '../engines/timeline';

export const TimelineInputSchema = z
    .object({
        startingWeightKg: z
            .number()
            .finite('الوزن يجب أن يكون رقماً محدوداً')
            .min(30, 'الوزن الأدنى 30 كجم')
            .max(300, 'الوزن الأقصى 300 كجم'),
        startingBodyFatPct: z
            .number()
            .finite('نسبة الدهون يجب أن تكون رقماً محدوداً')
            .min(3, 'نسبة الدهون الأدنى 3%')
            .max(60, 'نسبة الدهون القصوى 60%'),
        goal: z.enum(GOAL_TYPES as unknown as [Goal, ...Goal[]]),
        biologicalStatus: z.enum(BIO_STATUS_TYPES as unknown as [BiologicalStatus, ...BiologicalStatus[]]),
        experienceLevel: z.enum(EXPERIENCE_LEVELS as unknown as [ExperienceLevel, ...ExperienceLevel[]]),
        caloricDeltaKcal: z
            .number()
            .finite('فجوة السعرات يجب أن تكون رقماً محدوداً')
            .min(-1500, 'العجز الأقصى -1500 سعرة حرارية يومياً')
            .max(1500, 'الفائض الأقصى +1500 سعرة حرارية يومياً'),
        timelineWeeks: z
            .number()
            .int('مدة الجدول يجب أن تكون رقماً صحيحاً (أسابيع)')
            .min(4, 'أدنى مدة 4 أسابيع')
            .max(52, 'أقصى مدة 52 أسبوعاً'),
    })
    .strict();

export type TimelineInputValidated = z.infer<typeof TimelineInputSchema>;

/** Throwing parse — the strict boundary used by UI save paths and API routes. */
export function parseTimelineInput(raw: unknown): TimelineInputValidated {
    return TimelineInputSchema.parse(raw);
}

/** Safe parse — typed error instead of a throw (mirrors `tryParseMetabolicInput`). */
export function tryParseTimelineInput(
    raw: unknown,
): { ok: true; data: TimelineInputValidated } | { ok: false; error: z.ZodError } {
    const result = TimelineInputSchema.safeParse(raw);
    return result.success ? { ok: true, data: result.data } : { ok: false, error: result.error };
}
