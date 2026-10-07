/**
 * lib/tools/schemas/hcg-serm-protocol.ts
 * ════════════════════════════════════════════════════════════════════════════
 *  Tool #005 — Layer 2: Zod validation boundary for HCG & SERM Protocol Generator
 * ════════════════════════════════════════════════════════════════════════════
 * Follows the canonical contracts: `.strict()` objects, finite numbers,
 * bilingual error messages (AR first).
 */
import { z } from 'zod';
import {
    SERM_AVAILABILITY_OPTIONS,
    TESTICULAR_STATUS_OPTIONS,
    type HcgSermEngineInput,
    type SermAvailability,
    type TesticularStatus,
} from '../engines/hcg-serm-protocol';

export const CompoundItemSchema = z
    .object({
        catalogId: z.string().min(1, 'معرّف المركب مطلوب'),
        customName: z.string().optional(),
        weeklyDoseMg: z
            .number()
            .finite('الجرعة يجب أن تكون رقماً محدوداً')
            .min(10, 'أدنى جرعة 10 ملغ')
            .max(5000, 'أقصى جرعة 5000 ملغ'),
    })
    .strict();

export const SideEffectProfileSchema = z
    .object({
        ocularSensitivity: z.boolean(),
        moodSensitivity: z.boolean(),
        jointPain: z.boolean(),
        gynoHistory: z.boolean(),
    })
    .strict();

export const HcgSermEngineInputSchema = z
    .object({
        compounds: z.array(CompoundItemSchema),
        cycleWeeks: z
            .number()
            .int('مدة الدورة يجب أن تكون رقماً صحيحاً (أسابيع)')
            .min(4, 'أدنى مدة للدورة 4 أسابيع')
            .max(52, 'أقصى مدة للدورة 52 أسبوعاً'),
        testicularStatus: z.enum(TESTICULAR_STATUS_OPTIONS as unknown as [TesticularStatus, ...TesticularStatus[]]),
        preferredSerm: z.enum(SERM_AVAILABILITY_OPTIONS as unknown as [SermAvailability, ...SermAvailability[]]),
        sideEffects: SideEffectProfileSchema,
        bodyWeightKg: z
            .number()
            .finite('وزن الجسم يجب أن يكون رقماً محدوداً')
            .min(30, 'أدنى وزن 30 كغ')
            .max(300, 'أقصى وزن 300 كغ')
            .optional(),
        washoutEndDateIso: z.string().optional(),
    })
    .strict();

export type HcgSermEngineInputValidated = z.infer<typeof HcgSermEngineInputSchema>;

export function parseHcgSermEngineInput(raw: unknown): HcgSermEngineInputValidated {
    return HcgSermEngineInputSchema.parse(raw);
}

export function tryParseHcgSermEngineInput(
    raw: unknown,
): { ok: true; data: HcgSermEngineInputValidated } | { ok: false; error: z.ZodError } {
    const result = HcgSermEngineInputSchema.safeParse(raw);
    return result.success ? { ok: true, data: result.data } : { ok: false, error: result.error };
}
