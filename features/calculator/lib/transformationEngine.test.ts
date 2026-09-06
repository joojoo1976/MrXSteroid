import { describe, it, expect } from 'vitest';
import {
    clamp,
    roundTo,
    decomposeBody,
    adaptiveFatLossRate,
    weeklyMuscleGainRate,
    phaseIndexForWeek,
    projectBodyComposition,
    aggregatePhases,
    estimateCycleSummary,
    idealBodyStandards,
    formatWeight,
    toWeightUnit,
    FAT_LOSS_RATE,
    MUSCLE_GAIN_RATES,
    CYCLE_TOTAL_WEEKS,
    CYCLE_BOUNDARIES,
    type BodyCompositionInput,
} from './transformationEngine';

const baseInput: BodyCompositionInput = {
    startWeightKg: 90,
    startBodyFatPct: 20,
    trainingAge: 'intermediate',
    heightCm: 178,
};

describe('number precision guards', () => {
    it('clamp keeps values inside range and coerces NaN to min', () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-3, 0, 10)).toBe(0);
        expect(clamp(99, 0, 10)).toBe(10);
        expect(clamp(NaN, 2, 10)).toBe(2);
    });

    it('roundTo avoids float drift', () => {
        expect(roundTo(0.1 + 0.2, 1)).toBe(0.3);
        expect(roundTo(12.3456, 2)).toBe(12.35);
        expect(roundTo(NaN, 1)).toBe(0);
    });
});

describe('decomposeBody', () => {
    it('splits fat and lean mass from weight and body-fat %', () => {
        const { fatKg, leanKg } = decomposeBody(100, 20);
        expect(fatKg).toBeCloseTo(20, 5);
        expect(leanKg).toBeCloseTo(80, 5);
    });

    it('clamps extreme body-fat into a physiological band', () => {
        const low = decomposeBody(80, 1);
        expect(low.fatKg).toBeGreaterThanOrEqual(80 * 0.03 - 0.001);
        const high = decomposeBody(80, 90);
        expect(high.fatKg).toBeLessThanOrEqual(80 * 0.6 + 0.001);
    });
});

describe('adaptiveFatLossRate', () => {
    it('returns the evidence-based default at 18% body fat', () => {
        expect(adaptiveFatLossRate(18)).toBeCloseTo(FAT_LOSS_RATE.DEFAULT, 4);
    });

    it('leaner bodies lose slower, fatter bodies faster (monotonic)', () => {
        const lean = adaptiveFatLossRate(10);
        const mid = adaptiveFatLossRate(18);
        const heavy = adaptiveFatLossRate(30);
        expect(lean).toBeLessThan(mid);
        expect(heavy).toBeGreaterThan(mid);
    });

    it('respects an explicit override but clamps it to the safe band', () => {
        expect(adaptiveFatLossRate(20, 0.008)).toBe(0.008);
        expect(adaptiveFatLossRate(20, 0.5)).toBe(FAT_LOSS_RATE.MAX);
        expect(adaptiveFatLossRate(20, 0.0001)).toBe(FAT_LOSS_RATE.MIN);
    });
});

describe('weeklyMuscleGainRate', () => {
    it('ranks training ages: novice > intermediate > advanced', () => {
        const novice = weeklyMuscleGainRate('novice', 1);
        const inter = weeklyMuscleGainRate('intermediate', 1);
        const adv = weeklyMuscleGainRate('advanced', 1);
        expect(novice).toBeGreaterThan(inter);
        expect(inter).toBeGreaterThan(adv);
    });

    it('tapers gains toward the end of the cycle', () => {
        const early = weeklyMuscleGainRate('novice', 1);
        const late = weeklyMuscleGainRate('novice', CYCLE_TOTAL_WEEKS);
        expect(late).toBeLessThan(early);
        expect(late).toBeGreaterThanOrEqual(MUSCLE_GAIN_RATES.novice * 0.65 - 0.001);
    });
});

describe('phaseIndexForWeek', () => {
    it('maps weeks to the 4 classic phase windows', () => {
        expect(phaseIndexForWeek(1)).toBe(0);
        expect(phaseIndexForWeek(2)).toBe(0);
        expect(phaseIndexForWeek(3)).toBe(1);
        expect(phaseIndexForWeek(6)).toBe(1);
        expect(phaseIndexForWeek(7)).toBe(2);
        expect(phaseIndexForWeek(10)).toBe(2);
        expect(phaseIndexForWeek(11)).toBe(3);
        expect(phaseIndexForWeek(12)).toBe(3);
    });

    it('clamps out-of-range weeks', () => {
        expect(phaseIndexForWeek(0)).toBe(0);
        expect(phaseIndexForWeek(99)).toBe(3);
    });
});

describe('projectBodyComposition', () => {
    it('produces exactly 12 weekly rows', () => {
        const rows = projectBodyComposition(baseInput);
        expect(rows).toHaveLength(CYCLE_TOTAL_WEEKS);
        expect(rows[0].week).toBe(1);
        expect(rows[11].week).toBe(12);
    });

    it('body-fat % decreases monotonically while lean mass rises', () => {
        const rows = projectBodyComposition(baseInput);
        for (let i = 1; i < rows.length; i++) {
            expect(rows[i].bodyFatPct).toBeLessThanOrEqual(rows[i - 1].bodyFatPct);
            expect(rows[i].cumulativeMuscleGainKg).toBeGreaterThanOrEqual(rows[i - 1].cumulativeMuscleGainKg);
        }
    });

    it('cumulative muscle equals the last row total', () => {
        const rows = projectBodyComposition(baseInput);
        const sum = rows.reduce((s, r) => s + r.muscleGainKg, 0);
        expect(rows[rows.length - 1].cumulativeMuscleGainKg).toBeCloseTo(roundTo(sum, 2), 1);
    });

    it('is deterministic — same input yields identical output', () => {
        expect(projectBodyComposition(baseInput)).toEqual(projectBodyComposition(baseInput));
    });

    it('is edge-safe for NaN / zero inputs (no crash, no NaN leak)', () => {
        const rows = projectBodyComposition({
            startWeightKg: NaN,
            startBodyFatPct: 0,
            trainingAge: 'novice',
        });
        expect(rows).toHaveLength(CYCLE_TOTAL_WEEKS);
        for (const r of rows) {
            expect(Number.isFinite(r.weightKg)).toBe(true);
            expect(Number.isFinite(r.bodyFatPct)).toBe(true);
        }
    });
});

describe('aggregatePhases', () => {
    it('returns one aggregate per phase boundary', () => {
        const aggs = aggregatePhases(baseInput);
        expect(aggs).toHaveLength(CYCLE_BOUNDARIES.length);
    });

    it('phase fat-loss sums match the full projection total', () => {
        const rows = projectBodyComposition(baseInput);
        const aggs = aggregatePhases(baseInput, rows);
        const phaseFat = aggs.reduce((s, a) => s + a.fatLossKg, 0);
        const rowFat = roundTo(rows.reduce((s, r) => s + r.fatLossKg, 0), 2);
        expect(roundTo(phaseFat, 2)).toBeCloseTo(rowFat, 1);
    });

    it('last phase ends at the final projected weight', () => {
        const rows = projectBodyComposition(baseInput);
        const aggs = aggregatePhases(baseInput, rows);
        expect(aggs[aggs.length - 1].weightKgEnd).toBeCloseTo(rows[rows.length - 1].weightKg, 1);
    });
});

describe('estimateCycleSummary', () => {
    it('totals are internally consistent with the projection series', () => {
        const rows = projectBodyComposition(baseInput);
        const summary = estimateCycleSummary(baseInput, baseInput.heightCm);
        expect(summary.endWeightKg).toBeCloseTo(rows[rows.length - 1].weightKg, 1);
        expect(summary.totalMuscleGainKg).toBeCloseTo(rows[rows.length - 1].cumulativeMuscleGainKg, 1);
        expect(summary.totalFatLossKg).toBeCloseTo(
            roundTo(rows.reduce((s, r) => s + r.fatLossKg, 0), 2),
            1,
        );
    });

    it('goal progress stays within 0–100%', () => {
        const summary = estimateCycleSummary(baseInput, baseInput.heightCm);
        expect(summary.goalProgressPct).toBeGreaterThanOrEqual(0);
        expect(summary.goalProgressPct).toBeLessThanOrEqual(100);
    });

    it('avg weekly fat loss equals total divided by cycle length', () => {
        const summary = estimateCycleSummary(baseInput, baseInput.heightCm);
        expect(summary.avgWeeklyFatLossKg).toBeCloseTo(summary.totalFatLossKg / CYCLE_TOTAL_WEEKS, 1);
    });
});

describe('idealBodyStandards', () => {
    it('uses BMI 22 midpoint scaled by height', () => {
        const s = idealBodyStandards(180, 'intermediate');
        expect(s.idealWeightKg).toBeCloseTo(22 * 1.8 * 1.8, 0);
        expect(s.idealBmi).toBe(22);
    });

    it('clamps absurd heights to a safe band', () => {
        const s = idealBodyStandards(500, 'novice');
        expect(Number.isFinite(s.idealWeightKg)).toBe(true);
        expect(s.idealWeightKg).toBeLessThan(400);
    });
});

describe('unit conversion & formatting', () => {
    it('converts kg to lbs with the exact factor', () => {
        expect(toWeightUnit(1, 'imperial')).toBeCloseTo(2.20462262, 5);
        expect(toWeightUnit(1, 'metric')).toBe(1);
    });

    it('formats metric and imperial labels for both languages', () => {
        expect(formatWeight(80, 'metric', false)).toContain('kg');
        expect(formatWeight(80, 'imperial', false)).toContain('lbs');
        expect(formatWeight(80, 'metric', true)).toContain('كجم');
        expect(formatWeight(80, 'imperial', true)).toContain('رطل');
    });
});
