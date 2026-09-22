/**
 * lib/tools/schemas/hpta-recovery.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #003 — Layer 2: Zod validation boundary for the HPTA Recovery Engine.
 * ═══════════════════════════════════════════════════════════════════════════
 * Follows the `lib/schemas/calculatorSchema.ts` & multi-ester conventions:
 * `.strict()` objects, finite numbers, bilingual error messages (AR first).
 */
import { z } from 'zod';
import {
    COMPOUND_POTENCIES,
    PCT_PROTOCOLS,
    type CompoundPotency,
    type PctProtocol,
} from '../engines/hpta-recovery';

export const HptaRecoveryInputSchema = z
    .object({
        weeksOnCycle: z
            .number()
            .int('مدة الدورة يجب أن تكون رقماً صحيحاً (أسابيع)')
            .min(4, 'أدنى مدة للدورة 4 أسابيع')
            .max(24, 'أقصى مدة للدورة 24 أسبوعاً'),
        compoundPotency: z.enum(COMPOUND_POTENCIES as unknown as [CompoundPotency, ...CompoundPotency[]]),
        pctProtocol: z.enum(PCT_PROTOCOLS as unknown as [PctProtocol, ...PctProtocol[]]),
    })
    .strict();

export type HptaRecoveryInputValidated = z.infer<typeof HptaRecoveryInputSchema>;

/** Throwing parse — the strict boundary used by UI save paths and API routes. */
export function parseHptaRecoveryInput(raw: unknown): HptaRecoveryInputValidated {
    return HptaRecoveryInputSchema.parse(raw);
}

/** Safe parse — typed error instead of a throw (mirrors `tryParseTimelineInput`). */
export function tryParseHptaRecoveryInput(
    raw: unknown,
): { ok: true; data: HptaRecoveryInputValidated } | { ok: false; error: z.ZodError } {
    const result = HptaRecoveryInputSchema.safeParse(raw);
    return result.success ? { ok: true, data: result.data } : { ok: false, error: result.error };
}
