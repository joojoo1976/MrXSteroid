/**
 * calculatorSchema.ts
 * Zod validation boundary. Every input that reaches the engine — from the
 * client UI or an API route — must pass through these schemas first. Rejects
 * NaN, Infinity, out-of-range and structurally invalid payloads (OWASP zero-trust).
 */
import { z } from 'zod';
import type { MetabolicInput, UnitSystem } from '../metabolicModel';

const TRAINING_AGES = ['novice', 'intermediate', 'advanced'] as const;

/** Finite, in-range number — the sharpest guard against NaN/Infinity poisoning. */
const finiteInRange = (min: number, max: number) =>
    z.number().finite().min(min, `must be ≥ ${min}`).max(max, `must be ≤ ${max}`);

export const metabolicInputSchema = z.object({
    weightKg: finiteInRange(30, 400),
    heightCm: finiteInRange(120, 250),
    age: z.number().int().finite().min(14).max(80),
    sex: z.enum(['male', 'female']),
    bodyFatPct: finiteInRange(3, 60),
    trainingAge: z.enum(TRAINING_AGES),
    activityLevel: z.union([z.literal(1.2), z.literal(1.375), z.literal(1.55), z.literal(1.725), z.literal(1.9)]),
    goal: z.enum(['cut', 'maintain', 'lean-gain']),
}).strict();

/** Strict per-field validator that never mutates its input. */
export function parseMetabolicInput(raw: unknown): MetabolicInput {
    const parsed = metabolicInputSchema.parse(raw);
    return {
        weightKg: parsed.weightKg,
        heightCm: parsed.heightCm,
        age: parsed.age,
        sex: parsed.sex,
        bodyFatPct: parsed.bodyFatPct,
        trainingAge: parsed.trainingAge,
        activityLevel: parsed.activityLevel,
        goal: parsed.goal,
    };
}

/** Safe variant: returns the result or throws a typed validation error object. */
export function tryParseMetabolicInput(raw: unknown):
    | { ok: true; data: MetabolicInput }
    | { ok: false; error: z.ZodError } {
    const result = metabolicInputSchema.safeParse(raw);
    if (!result.success) return { ok: false, error: result.error };
    return { ok: true, data: result.data };
}

/** Unit-system toggle guard (for client-side preferences only, never persisted). */
export const unitSystemSchema = z.enum(['metric', 'imperial']).default('metric');

export type { UnitSystem };
