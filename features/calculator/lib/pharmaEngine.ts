'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PharmaSim™ — REAL-TIME PHARMACOKINETIC ENGINE
 *  Pure, deterministic, side-effect-free math core that powers the Half-Life
 *  Visualizer. Implements the Bateman absorption/elimination model with
 *  6-hour (0.25-day) sub-daily resolution, multi-dose accumulation,
 *  steady-state detection, per-ester PCT timing and full-clearance kinetics.
 *
 *  Design principles:
 *   • Every export is a PURE FUNCTION → trivially testable (Vitest) and
 *     safe for Edge/Serverless runtimes (no DOM, no global state).
 *   • Float-precision guards (finite checks, clamped domains) prevent NaN
 *     propagation from user-entered dosage/frequency edge cases.
 *   • Unit-agnostic: operates on mg + days; presentation converts at the UI.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { Compound } from '@/shared/types/types';

// ═══════════════════════════════════════════════════════════════════════════
//  SCIENTIFIC CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Sub-daily simulation resolution in days (0.25 d = 6 h). */
export const HALF_LIFE_STEP = 0.25;

/** Clearance threshold multiplier: 5.32 × t½ ≈ 95% elimination (5 × t½ = 96.9%). */
export const CLEARANCE_MULTIPLIER = 5.32;

/** SERM-based PCT begins ≈ 3.5 × t½ after the final injection. */
export const PCT_HALF_LIFE_MULTIPLIER = 3.5;

/** PCT wait is clamped to a physiologically sound [3, 21] day window. */
export const PCT_MIN_WAIT_DAYS = 3;
export const PCT_MAX_WAIT_DAYS = 21;

/** Default post-cycle observation buffer in days beyond the active phase. */
export const POST_CYCLE_BUFFER_DAYS = 60;

/** Injection interval (days) by frequency code. */
export const FREQ_INTERVALS: Record<string, number> = { ed: 1, eod: 2, e3d: 3, e7d: 7 };

// ═══════════════════════════════════════════════════════════════════════════
//  NUMBER PRECISION GUARDS
// ═══════════════════════════════════════════════════════════════════════════

/** Type-safe finite-number predicate (NaN / Infinity / strings → false). */
export const isFiniteNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

/** Clamp a value into [min, max]; NaN or non-number input resolves to `min`. */
export const clamp = (value: number, min: number, max: number): number => {
    if (typeof value !== 'number' || Number.isNaN(value)) return min;
    return Math.min(max, Math.max(min, value));
};

/** Round to a decimal place — avoids binary float drift (0.1 + 0.2 ≠ 0.3). */
export const roundTo = (value: number, decimals = 2): number => {
    if (!isFiniteNumber(value)) return 0;
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
};

// ═══════════════════════════════════════════════════════════════════════════
//  SINGLE-DOSE PHARMACOKINETICS
// ═══════════════════════════════════════════════════════════════════════════

export interface BatemanInput {
    /** Administered dose per injection (mg of the whole ester). */
    doseMg: number;
    /** Biological half-life of the ester (days). */
    halfLifeDays: number;
    /** Time elapsed since the injection (days). */
    deltaDays: number;
    /** Fraction of the molecule that is the active hormone (0–1). */
    esterWeight?: number;
}

/**
 * Bateman absorption–elimination model.
 * C(t) = D·(ka/(ka−ke))·(e^(−ke·t) − e^(−ka·t))
 * Returns 0 before injection (t<0) and clamps negatives to 0 (safe).
 */
export const batemanLevel = (input: BatemanInput): number => {
    const { doseMg, halfLifeDays, deltaDays, esterWeight = 1 } = input;
    if (deltaDays < 0) return 0;
    if (!isFiniteNumber(doseMg) || doseMg <= 0) return 0;

    const h = clamp(halfLifeDays, 0.1, 100);
    const ke = Math.LN2 / h;

    // Absorption rate heuristic by ester class (short / medium / long).
    let ka = h < 1.0 ? 12.0 : h <= 3.0 ? 3.0 : 1.0;
    if (Math.abs(ka - ke) < 1e-9) ka += 0.001; // guard against division by zero

    const activeDose = doseMg * clamp(esterWeight, 0, 1);
    const level = activeDose * (ka / (ka - ke)) *
        (Math.exp(-ke * deltaDays) - Math.exp(-ka * deltaDays));

    return Math.max(0, level);
};

/**
 * Simple mono-exponential decay: C(t) = C0·(1/2)^(t/t½).
 * Used for half-life verification & clearance math.
 */
export const decayLevel = (doseMg: number, halfLifeDays: number, deltaDays: number): number => {
    if (deltaDays < 0) return 0;
    return doseMg * Math.pow(0.5, deltaDays / clamp(halfLifeDays, 0.1, 100));
};

// ═══════════════════════════════════════════════════════════════════════════
//  DOSING SCHEDULE
// ═══════════════════════════════════════════════════════════════════════════

/** Absolute injection days for one compound across its active window. */
export const buildInjectionDays = (
    startDay: number,
    totalDurationDays: number,
    intervalDays: number,
): number[] => {
    const days: number[] = [];
    if (!isFiniteNumber(intervalDays) || intervalDays < 1) return days;
    const end = startDay + totalDurationDays;
    for (let d = startDay; d < end; d += Math.round(intervalDays)) days.push(d);
    return days;
};

// ═══════════════════════════════════════════════════════════════════════════
//  CLEARANCE & PCT TIMING
// ═══════════════════════════════════════════════════════════════════════════

/** Full biological clearance window (days) for a given half-life. */
export const clearanceDaysFromHalfLife = (halfLifeDays: number): number =>
    roundTo(clamp(halfLifeDays, 0.1, 100) * CLEARANCE_MULTIPLIER, 1);

/** SERM therapy wait (days) after the last injection, per ester kinetics. */
export const pctWaitDays = (longestHalfLifeDays: number): number =>
    clamp(
        Math.round(clamp(longestHalfLifeDays, 0.1, 100) * PCT_HALF_LIFE_MULTIPLIER),
        PCT_MIN_WAIT_DAYS,
        PCT_MAX_WAIT_DAYS,
    );

// ═══════════════════════════════════════════════════════════════════════════
//  FULL PROTOCOL SIMULATION
// ═══════════════════════════════════════════════════════════════════════════

export interface StackDose {
    compoundId: string;
    dosage: number;
    frequency: string;
    duration: number;
    startWeek: number;
    /** Unique stack item id — disambiguates repeated compounds in one stack. */
    id?: string;
}

export interface SerumInput {
    stack: StackDose[];
    compounds: Compound[];
    stepDays?: number;
    postCycleBufferDays?: number;
}

export interface SerumSeriesPoint {
    day: number;
    total: number;
    [key: string]: number;
}

export interface SerumProfile {
    /** Daily-downsampled concentration series (mg-eq). */
    series: SerumSeriesPoint[];
    /** Internal series keys: `<compoundId>_<stackItemId>`. */
    compoundNames: string[];
    /** Peak cumulative concentration (Cmax). */
    maxLevel: number;
    /** Trough cumulative concentration (Cmin) at steady state. */
    troughLevel: number;
    /** Day of the final injection across the whole stack. */
    lastInjectionDay: number;
    /** Day the active protocol ends (start + duration, exclusive). */
    activePhaseEndDay: number;
    /** Day cumulative level first reaches 90% of Cmax. */
    saturationDay: number;
}

/**
 * Simulates the full multi-compound, multi-dose serum profile.
 * Pure: same stack + compounds ⇒ identical series, every time.
 */
export const simulateSerum = (input: SerumInput): SerumProfile => {
    const step = clamp(input.stepDays ?? HALF_LIFE_STEP, 0.05, 1);
    const { stack, compounds } = input;

    if (stack.length === 0) {
        return {
            series: [], compoundNames: [], maxLevel: 0, troughLevel: 0,
            lastInjectionDay: 0, activePhaseEndDay: 0, saturationDay: 0,
        };
    }

    const activePhaseEndDay = Math.max(...stack.map(s =>
        clamp(s.startWeek, 1, 52) * 7 - 7 + clamp(s.duration, 1, 52) * 7,
    ));

    const longestHL = Math.max(...stack.map(s => {
        const c = compounds.find(cc => cc.id === s.compoundId);
        return c ? clamp(c.halfLife, 0.1, 100) : 0.1;
    }));

    const desiredBuffer = Math.max(
        POST_CYCLE_BUFFER_DAYS,
        Math.ceil(longestHL * CLEARANCE_MULTIPLIER) + 30,
    );
    const buffer = clamp(
        input.postCycleBufferDays ?? desiredBuffer,
        30,
        Math.max(120, desiredBuffer),
    );
    const daysToSimulate = Math.ceil(activePhaseEndDay + buffer);
    const totalSteps = Math.ceil(daysToSimulate / step);

    const stepData: SerumSeriesPoint[] = Array.from(
        { length: totalSteps },
        () => ({ day: 0, total: 0 }),
    );
    const compoundNames: string[] = [];
    let maxLevel = 0;
    let lastInjectionDay = 0;

    stack.forEach((item) => {
        const compound = compounds.find(c => c.id === item.compoundId);
        if (!compound) return;

        const key = `${item.compoundId}_${item.id}`;
        compoundNames.push(key);

        const startDay = clamp(item.startWeek, 1, 52) * 7 - 7;
        const durationDays = clamp(item.duration, 1, 52) * 7;
        const interval = FREQ_INTERVALS[item.frequency] ?? 7;
        const injectionDays = buildInjectionDays(startDay, durationDays, interval);
        lastInjectionDay = Math.max(lastInjectionDay, injectionDays[injectionDays.length - 1] ?? 0);

        for (let si = 0; si < totalSteps; si++) {
            const t = si * step;
            if (t < startDay) { stepData[si][key] = 0; continue; }

            let level = 0;
            for (const injDay of injectionDays) {
                if (injDay > t) break;
                level += batemanLevel({
                    doseMg: item.dosage,
                    halfLifeDays: compound.halfLife,
                    deltaDays: t - injDay,
                    esterWeight: compound.esterWeight ?? 1,
                });
            }
            stepData[si][key] = level;
            stepData[si].total = (stepData[si].total ?? 0) + level;
            if (stepData[si].total > maxLevel) maxLevel = stepData[si].total;
        }
    });

    // Downsample the sub-daily accumulator to daily resolution for charting.
    const series: SerumSeriesPoint[] = [];
    for (let day = 0; day < daysToSimulate; day++) {
        const si = Math.min(Math.round(day / step), totalSteps - 1);
        const entry: SerumSeriesPoint = { day, total: stepData[si].total ?? 0 };
        for (const key of compoundNames) entry[key] = stepData[si][key] ?? 0;
        series.push(entry);
    }

    const saturationDay = maxLevel > 0
        ? series.findIndex(d => d.total >= maxLevel * 0.9)
        : 0;

    // Trough (Cmin): lowest cumulative level across the steady-state window.
    const troughWindow = series.slice(Math.max(saturationDay, 0), activePhaseEndDay);
    const troughLevel = troughWindow.length > 0
        ? Math.min(...troughWindow.map(d => d.total))
        : 0;

    return {
        series,
        compoundNames,
        maxLevel,
        troughLevel: Math.max(0, troughLevel),
        lastInjectionDay,
        activePhaseEndDay,
        saturationDay: Math.max(0, saturationDay),
    };
};

// ═══════════════════════════════════════════════════════════════════════════
//  SERUM STATISTICS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Coefficient-of-variation based stability index (0–100).
 * 100 = perfectly flat steady state; <50 = severe peak/trough oscillation.
 */
export const stabilityScore = (levels: number[]): number => {
    const clean = levels.filter(v => isFiniteNumber(v) && v > 0);
    if (clean.length === 0) return 0;
    const mean = clean.reduce((a, b) => a + b, 0) / clean.length;
    const variance = clean.reduce((sq, n) => sq + (n - mean) ** 2, 0) / clean.length;
    const stdDev = Math.sqrt(variance);
    return clamp(100 - (stdDev / mean) * 100, 0, 100);
};

// ═══════════════════════════════════════════════════════════════════════════
//  RISK STRATIFICATION
// ═══════════════════════════════════════════════════════════════════════════

export const ORAL_IDS = ['anavar', 'dbol', 'anadrol', 'win_o', 'tbol', 'sdrol'];
export const AROMATIZING_IDS = ['test_e', 'test_p', 'test_c', 'dbol', 'anadrol'];
export const NINETEEN_NOR_IDS = ['deca', 'tren_a', 'tren_e', 'npp'];
export const AI_IDS = ['arimidex', 'proviron'];

export interface RiskProfile {
    has19Nor: boolean;
    oralCount: number;
    aromatizationRisk: number;
    hasAI: boolean;
}

/** Derives the clinical risk profile from the active stack. */
export const assessRisks = (stack: StackDose[]): RiskProfile => ({
    has19Nor: stack.some(s => NINETEEN_NOR_IDS.includes(s.compoundId)),
    oralCount: stack.filter(s => ORAL_IDS.includes(s.compoundId)).length,
    aromatizationRisk: stack.filter(s => AROMATIZING_IDS.includes(s.compoundId)).length,
    hasAI: stack.some(s => AI_IDS.includes(s.compoundId)),
});
