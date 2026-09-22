/**
 * lib/tools/schemas/pct-timing.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #004 — Layer 2: Zod validation boundary for the PCT Timing Engine.
 * ═══════════════════════════════════════════════════════════════════════════
 * Follows the `lib/schemas/calculatorSchema.ts` & multi-ester conventions:
 * `.strict()` objects, finite numbers, bilingual error messages (AR first).
 */
import { z } from 'zod';
import {
    MAX_HALF_LIFE_DAYS,
    MIN_HALF_LIFE_DAYS,
    PCT_PROTOCOLS,
    type PctProtocol,
} from '../engines/pct-timing';

export const PctTimingInputSchema = z
    .object({
        compoundHalfLifeDays: z
            .number()
            .finite('نصف العمر يجب أن يكون رقماً محدوداً')
            .min(MIN_HALF_LIFE_DAYS, `أدنى نصف عمر ${MIN_HALF_LIFE_DAYS} يوم`)
            .max(MAX_HALF_LIFE_DAYS, `أقصى نصف عمر ${MAX_HALF_LIFE_DAYS} يوم`),
        weeksOnCycle: z
            .number()
            .int('مدة الدورة يجب أن تكون رقماً صحيحاً (أسابيع)')
            .min(4, 'أدنى مدة للدورة 4 أسابيع')
            .max(24, 'أقصى مدة للدورة 24 أسبوعاً'),
        clearanceThresholdPct: z
            .number()
            .finite('عتبة التطهير يجب أن تكون رقماً محدوداً')
            .min(1, 'أدنى عتبة تطهير 1%')
            .max(20, 'أقصى عتبة تطهير 20%'),
        pctProtocol: z.enum(PCT_PROTOCOLS as unknown as [PctProtocol, ...PctProtocol[]]),
    })
    .strict();

export type PctTimingInputValidated = z.infer<typeof PctTimingInputSchema>;

/** Throwing parse — the strict boundary used by UI save paths and API routes. */
export function parsePctTimingInput(raw: unknown): PctTimingInputValidated {
    return PctTimingInputSchema.parse(raw);
}

/** Safe parse — typed error instead of a throw (mirrors `tryParseTimelineInput`). */
export function tryParsePctTimingInput(
    raw: unknown,
): { ok: true; data: PctTimingInputValidated } | { ok: false; error: z.ZodError } {
    const result = PctTimingInputSchema.safeParse(raw);
    return result.success ? { ok: true, data: result.data } : { ok: false, error: result.error };
}
