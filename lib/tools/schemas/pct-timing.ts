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
    CYCLE_HISTORY_OPTIONS,
    ESTER_PRESET_KEYS,
    MAX_HALF_LIFE_DAYS,
    MIN_HALF_LIFE_DAYS,
    ORGAN_HEALTH_OPTIONS,
    PCT_PROTOCOLS,
    type CycleHistoryExperience,
    type EsterPresetKey,
    type OrganHealthStatus,
    type PctProtocol,
} from '../engines/pct-timing';

export const StackCompoundItemSchema = z
    .object({
        id: z.string().min(1, 'معرّف المركب مطلوب'),
        presetKey: z.enum(ESTER_PRESET_KEYS),
        customName: z.string().optional(),
        halfLifeDays: z
            .number()
            .finite('نصف العمر يجب أن يكون رقماً محدوداً')
            .min(MIN_HALF_LIFE_DAYS, `أدنى نصف عمر ${MIN_HALF_LIFE_DAYS} يوم`)
            .max(MAX_HALF_LIFE_DAYS, `أقصى نصف عمر ${MAX_HALF_LIFE_DAYS} يوم`),
        doseMgPerWeek: z
            .number()
            .finite('الجرعة يجب أن تكون رقماً محدوداً')
            .min(10, 'أدنى جرعة 10 ملغ')
            .max(5000, 'أقصى جرعة 5000 ملغ'),
        isLipophilic: z.boolean(),
    })
    .strict();

export const BioModifiersSchema = z
    .object({
        bodyFatPct: z
            .number()
            .finite('نسبة الدهون يجب أن تكون رقماً محدوداً')
            .min(5, 'أدنى نسبة دهون 5%')
            .max(50, 'أقصى نسبة دهون 50%'),
        organHealth: z.enum(ORGAN_HEALTH_OPTIONS as unknown as [OrganHealthStatus, ...OrganHealthStatus[]]),
        cycleHistory: z.enum(CYCLE_HISTORY_OPTIONS as unknown as [CycleHistoryExperience, ...CycleHistoryExperience[]]),
    })
    .strict();

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
        // Optional v2 extensions:
        stack: z.array(StackCompoundItemSchema).optional(),
        bioModifiers: BioModifiersSchema.optional(),
        lastInjectionDateIso: z.string().optional(),
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
