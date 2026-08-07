import { describe, it, expect } from 'vitest';
import {
    adaptiveFatLossRate,
    nutritionTargets,
    buildTimelineCopyContext,
    renderTimelineCopy,
    projectBodyComposition,
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
