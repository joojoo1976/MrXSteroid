/**
 * metabolicModel.ts
 * Pure, deterministic metabolic simulation engine — no DOM, no Date, no I/O.
 * Runs identically on the server (RSC / Route Handlers) and the client, which
 * is the invariant that guarantees zero hydration/state drift between the
 * BioCalculator and any downstream consumer.
 */

export type TrainingAge = 'novice' | 'intermediate' | 'advanced';
export type Goal = 'cut' | 'maintain' | 'lean-gain';
export type UnitSystem = 'metric' | 'imperial';

export interface MetabolicInput {
    weightKg: number;
    heightCm: number;
    age: number;
    sex: 'male' | 'female';
    bodyFatPct: number;
    trainingAge: TrainingAge;
    activityLevel: 1.2 | 1.375 | 1.55 | 1.725 | 1.9;
    goal: Goal;
}

export interface MetabolicOutput {
    bmrKcal: number;
    tdeeKcal: number;
    targetKcal: number;
    proteinG: number;
    fatG: number;
    carbsG: number;
    waterL: number;
    bmi: number;
    leanMassKg: number;
    fatMassKg: number;
    weeklyFatLossKg: number;
    weeksToGoal: number | null;
    goalSurplusOrDeficitKcal: number;
}

export const KCAL_PER_KG_FAT = 7700;
export const PROTEIN_G_PER_KG: Record<TrainingAge, number> = {
    novice: 2.2,
    intermediate: 2.5,
    advanced: 2.8,
};

const ACTIVITY_FACTORS: Record<number, number> = {
    1.2: 1.2,
    1.375: 1.375,
    1.55: 1.55,
    1.725: 1.725,
    1.9: 1.9,
};

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);
const round = (n: number, dp = 0) => Math.round(n * 10 ** dp) / 10 ** dp;

/**
 * Mifflin-St Jeor BMR — the clinical default for estimating resting metabolic rate.
 */
export function bmrKcal(input: Pick<MetabolicInput, 'weightKg' | 'heightCm' | 'age' | 'sex'>): number {
    const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
    return input.sex === 'male' ? base + 5 : base - 161;
}

/** Total daily energy expenditure scaled by the activity factor. */
export function tdeeKcal(input: MetabolicInput): number {
    const factor = ACTIVITY_FACTORS[input.activityLevel] ?? 1.375;
    return bmrKcal(input) * factor;
}

/** Goal-relative daily energy target with safe physiological ceilings. */
export function targetKcal(input: MetabolicInput): number {
    const tdee = tdeeKcal(input);
    const maxDeficit = tdee * 0.25; // never cut below ~25% of TDEE
    const maxSurplus = tdee * 0.15;
    if (input.goal === 'cut') return tdee - maxDeficit;
    if (input.goal === 'lean-gain') return tdee + maxSurplus;
    return tdee;
}

/** Fat-free mass (kg) via body-fat fraction, clamped to a physiologically valid band. */
export function leanMassKg(weightKg: number, bodyFatPct: number): number {
    const fatFrac = clamp(bodyFatPct / 100, 0.03, 0.6);
    return weightKg * (1 - fatFrac);
}

export function fatMassKg(weightKg: number, bodyFatPct: number): number {
    return weightKg - leanMassKg(weightKg, bodyFatPct);
}

export function bmi(weightKg: number, heightCm: number): number {
    const hM = clamp(heightCm, 120, 250) / 100;
    return weightKg / (hM * hM);
}

/** Water target: 40 ml per kg bodyweight. */
export function waterLiters(weightKg: number): number {
    return round(weightKg * 0.04, 1);
}

/**
 * Full single-pass simulation. Everything downstream derives from this one
 * pure function so server and client can never disagree.
 */
export function simulateMetabolism(input: MetabolicInput): MetabolicOutput {
    // Clamp weight once; all downstream math shares the identical value so the
    // engine can never disagree with itself on the same payload.
    const weight = clamp(input.weightKg, 30, 400);
    const clamped: MetabolicInput = { ...input, weightKg: weight };
    const bmr = bmrKcal(clamped);
    const tdee = bmr * (ACTIVITY_FACTORS[input.activityLevel] ?? 1.375);
    const tgt = targetKcal(clamped);

    const lean = leanMassKg(weight, input.bodyFatPct);
    const fat = fatMassKg(weight, input.bodyFatPct);

    const proteinG = round(weight * PROTEIN_G_PER_KG[input.trainingAge], 0);
    const fatG = round((tgt * 0.25) / 9, 0);
    const carbsG = round((tgt - (proteinG * 4 + fatG * 9)) / 4, 0);

    const weeklyFatLossKg = input.goal === 'cut'
        ? (tdee - tgt) * 7 / KCAL_PER_KG_FAT
        : 0;

    // Weeks to lose the surplus fat mass at the projected weekly rate.
    const weeksToGoal = input.goal === 'cut' && weeklyFatLossKg > 0
        ? Math.max(0, Math.round(fat / weeklyFatLossKg))
        : null;

    return {
        bmrKcal: round(bmr),
        tdeeKcal: round(tdee),
        targetKcal: round(tgt),
        proteinG,
        fatG,
        carbsG,
        waterL: waterLiters(weight),
        bmi: round(bmi(weight, input.heightCm), 1),
        leanMassKg: round(lean, 1),
        fatMassKg: round(fat, 1),
        weeklyFatLossKg: round(weeklyFatLossKg, 2),
        weeksToGoal,
        goalSurplusOrDeficitKcal: round(tgt - tdee),
    };
}

/** Safe zero-overshoot default state — never NaN, never negative. */
export const DEFAULT_METABOLIC_INPUT: MetabolicInput = {
    weightKg: 80,
    heightCm: 178,
    age: 28,
    sex: 'male',
    bodyFatPct: 18,
    trainingAge: 'intermediate',
    activityLevel: 1.55,
    goal: 'cut',
};
