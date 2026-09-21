/**
 * lib/tools/schemas/multi-ester-pharmacokinetics.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #001 — Layer 2: Zod validation boundary for PharmaSim™ input.
 * ═══════════════════════════════════════════════════════════════════════════
 * Follows the `lib/schemas/calculatorSchema.ts` conventions: `.strict()`
 * objects, finite numbers, bilingual error messages (AR first).
 */
import { z } from 'zod';
import { ESTER_TYPES, type EsterType } from '../engines/multi-ester-pharmacokinetics';

export const InjectionEventSchema = z.object({
    id: z.string().min(1, 'معرّف الحقنة مطلوب').max(64, 'معرّف الحقنة طويل جداً'),
    day: z
        .number()
        .int('اليوم يجب أن يكون رقماً صحيحاً')
        .min(0, 'اليوم يجب أن يكون 0 أو أكثر')
        .max(365, 'الحد الأقصى سنة واحدة'),
    doseMg: z
        .number()
        .finite('الجرعة يجب أن تكون رقماً محدوداً')
        .positive('الجرعة يجب أن تكون أكبر من صفر')
        .max(2000, 'الجرعة القصوى 2000 ملجم'),
    ester: z.enum(ESTER_TYPES as unknown as [EsterType, ...EsterType[]]),
}).strict();

export const MultiEsterInputSchema = z.object({
    bodyWeightKg: z
        .number()
        .finite('الوزن يجب أن يكون رقماً محدوداً')
        .min(30, 'الوزن الأدنى 30 كجم')
        .max(250, 'الوزن الأقصى 250 كجم'),
    simulationDays: z
        .number()
        .int('مدة المحاكاة يجب أن تكون رقماً صحيحاً')
        .min(7, 'أدنى مدة للمحاكاة 7 أيام')
        .max(180, 'أقصى مدة للمحاكاة 180 يوم'),
    injections: z
        .array(InjectionEventSchema)
        .min(1, 'يجب إدخال جرعة حقن واحدة على الأقل')
        .max(200, 'الحد الأقصى 200 حقنة في البروتوكول'),
}).strict();

export type MultiEsterInputValidated = z.infer<typeof MultiEsterInputSchema>;
export type InjectionEventValidated = z.infer<typeof InjectionEventSchema>;

/** Throwing parse — the strict boundary used by UI save paths and API routes. */
export function parseMultiEsterInput(raw: unknown): MultiEsterInputValidated {
    return MultiEsterInputSchema.parse(raw);
}

/** Safe parse — typed error instead of a throw (mirrors `tryParseMetabolicInput`). */
export function tryParseMultiEsterInput(
    raw: unknown,
): { ok: true; data: MultiEsterInputValidated } | { ok: false; error: z.ZodError } {
    const result = MultiEsterInputSchema.safeParse(raw);
    return result.success ? { ok: true, data: result.data } : { ok: false, error: result.error };
}