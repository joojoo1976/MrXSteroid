import { describe, it, expect } from 'vitest';
import {
    adaptiveFatLossRate,
    nutritionTargets,
    buildTimelineCopyContext,
    renderTimelineCopy,
    projectBodyComposition,
    aggregatePhases,
    buildChartSeries,
    FAT_LOSS_RATE,
} from '../../features/calculator/lib/transformationEngine';

describe('transformationEngine — adaptive fat-loss', () => {
    it('uses the evidence-based default at moderate body fat', () => {
        expect(adaptiveFatLossRate(18)).toBeCloseTo(FAT_LOSS_RATE.DEFAULT, 5);
    });

    it('lifts the rate slightly for high starting body fat', () => {
        const high = adaptiveFatLossRate(35);
        expect(high).toBeGreaterThan(FAT_LOSS_RATE.DEFAULT);
        expect(high).toBeLessThanOrEqual(FAT_LOSS_RATE.MAX);
    });

    it('clamps an explicit override into the safe range', () => {
        expect(adaptiveFatLossRate(18, 0.05)).toBe(FAT_LOSS_RATE.MAX);
        expect(adaptiveFatLossRate(18, -0.01)).toBe(FAT_LOSS_RATE.MIN);
    });

    it('is edge-safe for NaN / extreme inputs', () => {
        expect(Number.isFinite(adaptiveFatLossRate(NaN))).toBe(true);
        expect(Number.isFinite(adaptiveFatLossRate(1000))).toBe(true);
    });
});

describe('transformationEngine — nutrition targets', () => {
    it('scales hydration with bodyweight', () => {
        const a = nutritionTargets({ startWeightKg: 60, trainingAge: 'intermediate' });
        const b = nutritionTargets({ startWeightKg: 120, trainingAge: 'intermediate' });
        expect(b.waterLiters).toBeGreaterThan(a.waterLiters);
    });

    it('raises protein with training age', () => {
        const novice = nutritionTargets({ startWeightKg: 80, trainingAge: 'novice' });
        const advanced = nutritionTargets({ startWeightKg: 80, trainingAge: 'advanced' });
        expect(advanced.proteinGPerKg).toBeGreaterThan(novice.proteinGPerKg);
    });

    it('is deterministic and edge-safe', () => {
        const x = nutritionTargets({ startWeightKg: 80, trainingAge: 'advanced' });
        const y = nutritionTargets({ startWeightKg: 80, trainingAge: 'advanced' });
        expect(x).toEqual(y);
        expect(Number.isFinite(nutritionTargets({ startWeightKg: NaN, trainingAge: 'novice' }).waterLiters)).toBe(true);
    });
});

describe('transformationEngine — unit-aware narrative context', () => {
    const base = { startWeightKg: 80, trainingAge: 'intermediate' as const };

    it('renders metric units when metric is selected', () => {
        const ctx = buildTimelineCopyContext({ ...base, unitSystem: 'metric', isAr: false });
        expect(ctx.weight).toContain('kg');
        expect(ctx.water).toContain('liters');
        expect(ctx.protein).toContain('g/kg');
        expect(ctx.kcal).toContain('kcal/kg');
    });

    it('renders imperial units when imperial is selected', () => {
        const ctx = buildTimelineCopyContext({ ...base, unitSystem: 'imperial', isAr: false });
        expect(ctx.weight).toContain('lbs');
        expect(ctx.water).toContain('oz');
        expect(ctx.protein).toContain('g/lb');
        expect(ctx.kcal).toContain('kcal/lb');
    });

    it('localizes unit labels for Arabic', () => {
        const metricAr = buildTimelineCopyContext({ ...base, unitSystem: 'metric', isAr: true });
        expect(metricAr.weight).toContain('كجم');
        const imperialAr = buildTimelineCopyContext({ ...base, unitSystem: 'imperial', isAr: true });
        expect(imperialAr.weight).toContain('رطل');
    });

    it('keeps imperial numbers directionally consistent with metric', () => {
        const metric = buildTimelineCopyContext({ ...base, unitSystem: 'metric', isAr: false });
        const imperial = buildTimelineCopyContext({ ...base, unitSystem: 'imperial', isAr: false });
        expect(imperial.kcal).not.toEqual(metric.kcal);
    });
});

describe('transformationEngine — template rendering', () => {
    const ctx = buildTimelineCopyContext({ startWeightKg: 80, trainingAge: 'intermediate', unitSystem: 'metric', isAr: false });

    it('substitutes known placeholders', () => {
        const out = renderTimelineCopy('Drink {water} daily for {weight}', ctx);
        expect(out).toContain(ctx.water);
        expect(out).toContain(ctx.weight);
        expect(out).not.toContain('{water}');
    });

    it('leaves unknown placeholders untouched', () => {
        expect(renderTimelineCopy('Unknown {xyz} token', ctx)).toBe('Unknown {xyz} token');
    });

    it('is safe with empty templates', () => {
        expect(renderTimelineCopy('', ctx)).toBe('');
    });
});

describe('transformationEngine — projection sanity', () => {
    it('remains deterministic after engine changes', () => {
        const input = { startWeightKg: 80, startBodyFatPct: 18, trainingAge: 'intermediate' as const };
        const a = projectBodyComposition(input);
        const b = projectBodyComposition(input);
        expect(a).toEqual(b);
        expect(a).toHaveLength(12);
        expect(a[11].weightKg).toBeLessThan(80);
    });
});

describe('transformationEngine — buildChartSeries', () => {
    const phases = [
        { week: '1-2', stats: { strength: 20, hypertrophy: 10, waterRetention: 30, fatLoss: 5, mood: 80 } },
        { week: '3-6', stats: { strength: 60, hypertrophy: 70, waterRetention: 50, fatLoss: 10, mood: 90 } },
        { week: '7-10', stats: { strength: 90, hypertrophy: 90, waterRetention: 40, fatLoss: 40, mood: 70 } },
        { week: '11-12', stats: { strength: 100, hypertrophy: 100, waterRetention: 20, fatLoss: 60, mood: 60 } },
    ];

    it('produces one row per phase, mirroring classic stats', () => {
        const series = buildChartSeries(
            phases,
            projectBodyComposition({ startWeightKg: 80, startBodyFatPct: 18, trainingAge: 'intermediate' }),
            aggregatePhases({ startWeightKg: 80, startBodyFatPct: 18, trainingAge: 'intermediate' }),
        );
        expect(series).toHaveLength(4);
        expect(series[0]).toMatchObject({
            week: '1-2',
            strength: 20,
            hypertrophy: 10,
            waterRetention: 30,
            fatLoss: 5,
            mood: 80,
        });
        expect(series[3]).toMatchObject({
            week: '11-12',
            strength: 100,
            hypertrophy: 100,
            waterRetention: 20,
            fatLoss: 60,
            mood: 60,
        });
    });

    it('uses end-of-phase cumulative muscle (not a sum of cumulative values)', () => {
        const projections = projectBodyComposition({ startWeightKg: 80, startBodyFatPct: 18, trainingAge: 'intermediate' });
        const aggregates = aggregatePhases({ startWeightKg: 80, startBodyFatPct: 18, trainingAge: 'intermediate' });
        const series = buildChartSeries(phases, projections, aggregates);

        // Phase 1 spans weeks 1–2 → the cumulative value must be the projection
        // at the final week (index 1), NOT the sum of weeks 1 AND 2 which would
        // over-count already-cumulative values.
        expect(series[0].cumulativeMuscleKg).toBe(projections[1].cumulativeMuscleGainKg);
        expect(series[0].cumulativeMuscleKg).toBeLessThan(
            projections[0].cumulativeMuscleGainKg + projections[1].cumulativeMuscleGainKg,
        );

        // Last phase spans weeks 11–12 → final cumulative equals the cycle total.
        expect(series[3].cumulativeMuscleKg).toBe(projections[11].cumulativeMuscleGainKg);
        expect(series[3].cumulativeMuscleKg).toBeGreaterThan(series[2].cumulativeMuscleKg);
    });

    it('exposes the live projection series (body fat %, gains) per phase', () => {
        const input = { startWeightKg: 80, startBodyFatPct: 18, trainingAge: 'intermediate' as const };
        const aggregates = aggregatePhases(input);
        const series = buildChartSeries(phases, projectBodyComposition(input), aggregates);

        expect(series[3].bodyFatPct).toBeCloseTo(aggregates[3].bodyFatPctEnd, 6);
        expect(series[3].muscleGainKg).toBeCloseTo(aggregates[3].muscleGainKg, 6);
        expect(series[3].fatLossKg).toBeCloseTo(aggregates[3].fatLossKg, 6);
        // Body fat % must fall across the phases.
        expect(series[3].bodyFatPct).toBeLessThan(series[0].bodyFatPct);
    });

    it('is deterministic and handles empty phase lists', () => {
        const input = { startWeightKg: 80, startBodyFatPct: 18, trainingAge: 'novice' as const };
        const projections = projectBodyComposition(input);
        const aggregates = aggregatePhases(input);
        expect(buildChartSeries(phases, projections, aggregates)).toEqual(
            buildChartSeries(phases, projections, aggregates),
        );
        expect(buildChartSeries([], projections, aggregates)).toEqual([]);
    });
});
