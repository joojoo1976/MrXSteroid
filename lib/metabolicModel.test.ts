/**
 * metabolicModel.test.ts — deterministic unit tests for the pure engine.
 * The engine is the single source of truth shared by the client and API, so its
 * math is covered exhaustively: known-value regressions, physiological clamping,
 * and goal-relative target ceilings.
 */
import { describe, it, expect } from 'vitest';
import {
    simulateMetabolism,
    bmrKcal,
    tdeeKcal,
    targetKcal,
    bmi,
    leanMassKg,
    waterLiters,
    DEFAULT_METABOLIC_INPUT,
    type MetabolicInput,
} from './metabolicModel';

const base: MetabolicInput = {
    weightKg: 80,
    heightCm: 180,
    age: 25,
    sex: 'male',
    bodyFatPct: 15,
    trainingAge: 'intermediate',
    activityLevel: 1.55,
    goal: 'cut',
};

describe('bmrKcal (Mifflin-St Jeor)', () => {
    it('matches the hand-computed male value', () => {
        // 10*80 + 6.25*180 - 5*25 + 5 = 800 + 1125 - 125 + 5 = 1805
        expect(bmrKcal(base)).toBe(1805);
    });

    it('applies the -161 female offset', () => {
        // Male base = 1805; female = base - 161 = 1644, plus the -5 age offset in the base already.
        expect(bmrKcal({ ...base, sex: 'female' })).toBe(1805 - 166);
    });

    it('female is 166 kcal lower than male for identical metrics', () => {
        const male = bmrKcal(base);
        const female = bmrKcal({ ...base, sex: 'female' });
        expect(male - female).toBe(166);
    });
});

describe('tdeeKcal', () => {
    it('scales BMR by the activity factor', () => {
        const bmr = bmrKcal(base);
        expect(tdeeKcal(base)).toBe(bmr * 1.55);
    });

    it('unknown factors fall back to 1.375 (defensive)', () => {
        const weird = { ...base, activityLevel: 9.99 } as unknown as MetabolicInput;
        expect(tdeeKcal(weird)).toBe(bmrKcal(base) * 1.375);
    });
});

describe('targetKcal ceilings', () => {
    it('cut never exceeds 25% deficit', () => {
        const tdee = tdeeKcal(base);
        const tgt = targetKcal(base);
        expect(tgt).toBeGreaterThanOrEqual(tdee * 0.75);
    });

    it('lean-gain never exceeds 15% surplus', () => {
        const lg = { ...base, goal: 'lean-gain' as const };
        const tdee = tdeeKcal(lg);
        const tgt = targetKcal(lg);
        expect(tgt).toBeLessThanOrEqual(tdee * 1.15);
        expect(tgt).toBeGreaterThan(tdee);
    });

    it('maintain equals TDEE', () => {
        const m = { ...base, goal: 'maintain' as const };
        expect(targetKcal(m)).toBe(tdeeKcal(m));
    });
});

describe('simulateMetabolism — end to end', () => {
    it('produces a fully populated, finite output for a valid payload', () => {
        const out = simulateMetabolism(base);
        expect(out.bmrKcal).toBe(1805);
        expect(out.tdeeKcal).toBe(2798);
        expect(out.targetKcal).toBe(2098);
        expect(out.proteinG).toBe(200); // 80 * 2.5
        expect(out.waterL).toBe(3.2);   // 80 * 0.04
        expect(out.bmi).toBe(24.7);     // 80 / 1.8^2
        expect(out.leanMassKg).toBe(68); // 80 * 0.85
        expect(out.fatMassKg).toBe(12);  // 80 * 0.15
        expect(out.goalSurplusOrDeficitKcal).toBe(-699); // 2098 - 2798
        expect(out.weeksToGoal).toBe(19);
        expect(out.weeklyFatLossKg).toBeCloseTo(0.64, 2);
        // No NaN / Infinity anywhere.
        for (const v of Object.values(out)) {
            if (v !== null) expect(Number.isFinite(v)).toBe(true);
        }
    });

    it('is deterministic — same input, same output', () => {
        expect(simulateMetabolism(base)).toEqual(simulateMetabolism(base));
    });

    it('clamps out-of-range weights to the physiological band', () => {
        const heavy = simulateMetabolism({ ...base, weightKg: 999 });
        const light = simulateMetabolism({ ...base, weightKg: 5 });
        const maxW = simulateMetabolism({ ...base, weightKg: 400 });
        const minW = simulateMetabolism({ ...base, weightKg: 30 });
        expect(heavy).toEqual(maxW);
        expect(light).toEqual(minW);
    });

    it('never returns a negative target even for extreme inputs', () => {
        const extreme = simulateMetabolism({ ...base, weightKg: 30, bodyFatPct: 60, goal: 'cut' });
        expect(extreme.targetKcal).toBeGreaterThan(0);
        // 12kg of fat at ~0.31kg/wk projects a finite, positive week count.
        expect(extreme.weeksToGoal).toBeGreaterThan(0);
        expect(extreme.weeklyFatLossKg).toBeGreaterThan(0);
    });

    it('maintain goal yields a zero energy delta and null projection', () => {
        const out = simulateMetabolism({ ...base, goal: 'maintain' });
        expect(out.goalSurplusOrDeficitKcal).toBe(0);
        expect(out.weeksToGoal).toBeNull();
        expect(out.weeklyFatLossKg).toBe(0);
    });

    it('defaults never produce NaN', () => {
        const out = simulateMetabolism(DEFAULT_METABOLIC_INPUT);
        for (const v of Object.values(out)) {
            if (v !== null) expect(Number.isFinite(v)).toBe(true);
        }
    });
});

describe('geometry helpers', () => {
    it('bmi computes and clamps height band', () => {
        expect(bmi(80, 180)).toBeCloseTo(24.69, 1);
        expect(bmi(80, 60)).toBeCloseTo(bmi(80, 120), 1); // height floor 120cm
    });

    it('lean/fat mass sum to bodyweight', () => {
        const w = 100;
        expect(leanMassKg(w, 20) + (w - leanMassKg(w, 20))).toBe(w);
    });

    it('water target scales at 40ml/kg', () => {
        expect(waterLiters(80)).toBe(3.2);
    });
});
