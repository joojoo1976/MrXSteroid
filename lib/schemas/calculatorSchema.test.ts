/**
 * calculatorSchema.test.ts — Zod boundary tests.
 * The schema is the sanitization wall between untrusted input and the engine:
 * NaN/Infinity, out-of-range, unknown fields and wrong types must all be
 * rejected before the engine is ever touched.
 */
import { describe, it, expect } from 'vitest';
import { metabolicInputSchema, tryParseMetabolicInput, parseMetabolicInput } from './calculatorSchema';

const valid = {
    weightKg: 80,
    heightCm: 180,
    age: 25,
    sex: 'male',
    bodyFatPct: 15,
    trainingAge: 'intermediate',
    activityLevel: 1.55,
    goal: 'cut',
};

describe('metabolicInputSchema — acceptance', () => {
    it('accepts a canonical payload', () => {
        expect(metabolicInputSchema.safeParse(valid).success).toBe(true);
    });

    it('accepts boundary values', () => {
        expect(metabolicInputSchema.safeParse({ ...valid, weightKg: 400, heightCm: 120, age: 80, bodyFatPct: 60 }).success).toBe(true);
        expect(metabolicInputSchema.safeParse({ ...valid, weightKg: 30, heightCm: 250, age: 14, bodyFatPct: 3 }).success).toBe(true);
    });
});

describe('metabolicInputSchema — rejection', () => {
    it('rejects NaN', () => {
        expect(metabolicInputSchema.safeParse({ ...valid, weightKg: NaN }).success).toBe(false);
    });

    it('rejects Infinity / huge numbers', () => {
        expect(metabolicInputSchema.safeParse({ ...valid, weightKg: 1e999 }).success).toBe(false);
        expect(metabolicInputSchema.safeParse({ ...valid, heightCm: Infinity }).success).toBe(false);
    });

    it('rejects out-of-range values', () => {
        expect(metabolicInputSchema.safeParse({ ...valid, weightKg: 29 }).success).toBe(false);
        expect(metabolicInputSchema.safeParse({ ...valid, weightKg: 401 }).success).toBe(false);
        expect(metabolicInputSchema.safeParse({ ...valid, age: 13 }).success).toBe(false);
        expect(metabolicInputSchema.safeParse({ ...valid, age: 81 }).success).toBe(false);
        expect(metabolicInputSchema.safeParse({ ...valid, bodyFatPct: 2.9 }).success).toBe(false);
    });

    it('rejects wrong types', () => {
        expect(metabolicInputSchema.safeParse({ ...valid, weightKg: 'heavy' }).success).toBe(false);
        expect(metabolicInputSchema.safeParse({ ...valid, sex: 'other' }).success).toBe(false);
        expect(metabolicInputSchema.safeParse({ ...valid, trainingAge: 'expert' }).success).toBe(false);
        expect(metabolicInputSchema.safeParse({ ...valid, activityLevel: 1.4 }).success).toBe(false);
        expect(metabolicInputSchema.safeParse({ ...valid, goal: 'bulk' }).success).toBe(false);
    });

    it('strict mode rejects unknown (injection) fields', () => {
        expect(metabolicInputSchema.safeParse({ ...valid, hack: 'xss' }).success).toBe(false);
        expect(metabolicInputSchema.safeParse({ ...valid, role: 'admin' }).success).toBe(false);
    });

    it('rejects non-integer age', () => {
        expect(metabolicInputSchema.safeParse({ ...valid, age: 25.5 }).success).toBe(false);
    });

    it('rejects null / undefined / non-object', () => {
        expect(metabolicInputSchema.safeParse(null).success).toBe(false);
        expect(metabolicInputSchema.safeParse(undefined).success).toBe(false);
        expect(metabolicInputSchema.safeParse('string').success).toBe(false);
        expect(metabolicInputSchema.safeParse([]).success).toBe(false);
    });
});

describe('tryParseMetabolicInput', () => {
    it('returns ok with typed data for valid input', () => {
        const r = tryParseMetabolicInput(valid);
        expect(r.ok).toBe(true);
        if (r.ok) {
            expect(r.data.weightKg).toBe(80);
            expect(r.data.goal).toBe('cut');
        }
    });

    it('returns ok:false with error details for invalid input', () => {
        const r = tryParseMetabolicInput({ ...valid, weightKg: NaN });
        expect(r.ok).toBe(false);
        if (!r.ok) {
            expect(r.error.flatten().fieldErrors.weightKg).toBeDefined();
        }
    });
});

describe('parseMetabolicInput', () => {
    it('returns the sanitized object', () => {
        expect(parseMetabolicInput(valid).weightKg).toBe(80);
    });

    it('throws on invalid input', () => {
        expect(() => parseMetabolicInput({ ...valid, heightCm: 10 })).toThrow();
    });
});
