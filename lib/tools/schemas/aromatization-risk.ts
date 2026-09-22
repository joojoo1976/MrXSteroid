/**
 * lib/tools/schemas/aromatization-risk.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #002 — Layer 2: Zod validation boundary for the Aromatization Risk Engine.
 * ═══════════════════════════════════════════════════════════════════════════
 * Follows the `lib/schemas/calculatorSchema.ts` & multi-ester conventions:
 * `.strict()` objects, finite numbers, bilingual error messages (AR first).
 */
import { z } from 'zod';
import {
    AI_PROTOCOLS,
    COMPOUND_TYPES,
    type AiProtocol,
    type CompoundType,
} from '../engines/aromatization-risk';

export const AromatizationRiskInputSchema = z
    .object({
        weeksOnCycle: z
            .number()
            .int('مدة الدورة يجب أن تكون رقماً صحيحاً (أسابيع)')
            .min(4, 'أدنى مدة للدورة 4 أسابيع')
            .max(24, 'أقصى مدة للدورة 24 أسبوعاً'),
        weeklyDoseMg: z
            .number()
            .finite('الجرعة الأسبوعية يجب أن تكون رقماً')
            .min(100, 'أدنى جرعة أسبوعية 100 ملغ')
            .max(2000, 'أقصى جرعة أسبوعية 2000 ملغ'),
        bodyFatPct: z
            .number()
            .finite('نسبة دهون الجسم يجب أن تكون رقماً')
            .min(6, 'أدنى نسبة دهون 6%')
            .max(40, 'أقصى نسبة دهون 40%'),
        compoundType: z.enum(COMPOUND_TYPES as unknown as [CompoundType, ...CompoundType[]]),
        aiProtocol: z.enum(AI_PROTOCOLS as unknown as [AiProtocol, ...AiProtocol[]]),
    })
    .strict();

export type AromatizationRiskInputValidated = z.infer<typeof AromatizationRiskInputSchema>;

/** Throwing parse — the strict boundary used by UI save paths and API routes. */
export function parseAromatizationRiskInput(raw: unknown): AromatizationRiskInputValidated {
    return AromatizationRiskInputSchema.parse(raw);
}

/** Safe parse — typed error instead of a throw (mirrors `tryParseHptaRecoveryInput`). */
export function tryParseAromatizationRiskInput(
    raw: unknown,
): { ok: true; data: AromatizationRiskInputValidated } | { ok: false; error: z.ZodError } {
    const result = AromatizationRiskInputSchema.safeParse(raw);
    return result.success ? { ok: true, data: result.data } : { ok: false, error: result.error };
}
