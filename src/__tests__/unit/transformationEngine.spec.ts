import { describe, it, expect } from 'vitest';
import {
    adaptiveFatLossRate,
    nutritionTargets,
    buildTimelineCopyContext,
    renderTimelineCopy,
    projectBodyComposition,
    aggregatePhases,
    buildChartSeries,
    estimateEnergy,
    estimateIdealWeight,
    estimateCycleSummary,
    deriveCoachFacts,
    formatHeight,
    FAT_LOSS_RATE,
    type CycleSummary,
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

describe('transformationEngine — advanced live predictions', () => {
    const base = { startWeightKg: 80, startBodyFatPct: 18, trainingAge: 'intermediate' as const };

    it('estimates energy economics (Katch–McArdle) deterministically', () => {
        const a = estimateEnergy(base);
        const b = estimateEnergy(base);
        expect(a).toEqual(b);
        // 80kg @ 18% BF → LBM 65.6kg → BMR = 370 + 21.6 × 65.6 ≈ 1787.
        expect(a.bmrKcal).toBeGreaterThan(1700);
        expect(a.bmrKcal).toBeLessThan(1900);
        expect(a.tdeeKcal).toBeGreaterThan(a.bmrKcal);
        expect(a.dailyDeficitKcal).toBeGreaterThan(0);
        expect(a.dailyDeficitKcal).toBeLessThan(1200);
    });

    it('derives a healthy BMI-ideal weight and a positive time-to-target', () => {
        const ideal = estimateIdealWeight(base, 178);
        // 178 cm → 1.78 m; BMI 22 target ≈ 69.7 kg.
        expect(ideal.bmiStart).toBeCloseTo(25.2, 1);
        expect(ideal.idealWeightKg).toBeGreaterThan(65);
        expect(ideal.idealWeightKg).toBeLessThan(80);
        expect(ideal.weightToLoseKg).toBeGreaterThan(0);
        expect(ideal.weeksToIdeal).not.toBeNull();
        expect(ideal.weeksToIdeal as number).toBeGreaterThan(0);
    });

    it('reports the ideal weight as already reached when under the target', () => {
        const lean = estimateIdealWeight({ ...base, startWeightKg: 60, startBodyFatPct: 10 }, 178);
        expect(lean.weeksToIdeal).toBe(0);
        expect(lean.weightToLoseKg).toBe(0);
    });

    it('builds a coherent cycle summary with sane invariants', () => {
        const s = estimateCycleSummary(base, 178);
        // End state must be strictly lighter and leaner than start.
        expect(s.endWeightKg).toBeLessThan(s.startWeightKg);
        expect(s.endBfPct).toBeLessThan(s.startBfPct);
        // Fat lost exceeds muscle gained in a cut.
        expect(s.totalFatLossKg).toBeGreaterThan(s.totalMuscleGainKg);
        // Weight change ≈ muscle gained − fat lost (within rounding).
        expect(Math.abs(s.weightChangeKg - (s.totalMuscleGainKg - s.totalFatLossKg))).toBeLessThan(1.5);
        // Goal progress bounded 0–100.
        expect(s.goalProgressPct).toBeGreaterThan(0);
        expect(s.goalProgressPct).toBeLessThanOrEqual(100);
        // Energy block present.
        expect(s.energy.dailyDeficitKcal).toBeGreaterThan(0);
        // Deterministic.
        expect(estimateCycleSummary(base, 178)).toEqual(s);
    });

    it('tracks body-fat milestones across the cycle', () => {
        const s = estimateCycleSummary({ ...base, startBodyFatPct: 25 }, 178);
        expect(s.milestones.some((m) => m.kind === 'bf20')).toBe(true);
        expect(s.milestones.some((m) => m.kind === 'bf18')).toBe(true);
        // Milestone weeks are increasing.
        const weeks = s.milestones.map((m) => m.week);
        expect(weeks).toEqual([...weeks].sort((x, y) => x - y));
    });

    it('formats height in metric and imperial systems', () => {
        expect(formatHeight(178, 'metric', false)).toBe('178 cm');
        expect(formatHeight(178, 'metric', true)).toContain('سم');
        expect(formatHeight(178, 'imperial', false)).toBe("5' 10\"");
        expect(formatHeight(180, 'imperial', false)).toBe("5' 11\"");
    });

    it('carries a rounded remainder into the feet column (no 12-inch rollover)', () => {
        // Regression: rounding `inches % 12` produced invalid "5' 12\"" for
        // heights whose rounded remainder hit 12 (e.g. 182 cm ≈ 71.65 in).
        expect(formatHeight(182, 'imperial', false)).toBe("6' 0\"");
        expect(formatHeight(121, 'imperial', false)).toBe("4' 0\"");
        expect(formatHeight(183, 'imperial', false)).toBe("6' 0\"");
        expect(formatHeight(71, 'imperial', false)).toBe("2' 4\"");
        // Near-boundary heights keep correct totals.
        expect(formatHeight(70, 'imperial', false)).toBe("2' 4\"");
        expect(formatHeight(119, 'imperial', false)).toBe("3' 11\"");
        expect(formatHeight(120, 'imperial', false)).toBe("3' 11\"");
    });

    it('applies the same carry fix to Arabic imperial heights', () => {
        expect(formatHeight(182, 'imperial', true)).toBe('6′ 0″');
        expect(formatHeight(121, 'imperial', true)).toBe('4′ 0″');
    });

    it('recomputes the full cycle summary instantly (stress / latency guard)', () => {
        // Simulates 10 000 consecutive slider drags, each re-running the whole
        // 12-week simulation + ideal-weight + energy model. Must stay snappy.
        const t0 = performance.now();
        for (let i = 0; i < 10000; i++) {
            estimateCycleSummary(
                { startWeightKg: 40 + (i % 120), startBodyFatPct: 8 + (i % 32), heightCm: 165 + (i % 40), trainingAge: 'intermediate' },
                178,
            );
        }
        const elapsed = performance.now() - t0;
        expect(elapsed).toBeLessThan(1000);
    });
});

describe('transformationEngine — deriveCoachFacts', () => {
    it('flags aggressive deficit for a heavy body-fat start', () => {
        const s = estimateCycleSummary({ startWeightKg: 110, startBodyFatPct: 32, heightCm: 180, trainingAge: 'advanced' }, 180);
        const f = deriveCoachFacts(s);
        expect(f.bfZone).toBe('high');
        expect(f.bmiStatus).toBe('obese');
        expect(f.deficitLevel).toBe('aggressive');
        expect(f.reachesGoalInCycle).toBe(false);
        expect(f.weeksBeyondCycle).not.toBeNull();
    });

    it('classifies a moderate start as normal composition', () => {
        const s = estimateCycleSummary({ startWeightKg: 75, startBodyFatPct: 20, heightCm: 175, trainingAge: 'intermediate' }, 175);
        const f = deriveCoachFacts(s);
        expect(f.bfZone).toBe('moderate');
        expect(f.bmiStatus).toBe('normal');
        expect(f.bfMilestoneCount).toBeGreaterThanOrEqual(1);
    });

    it('anchors the next milestone to the active week', () => {
        const s = estimateCycleSummary({ startWeightKg: 85, startBodyFatPct: 25, heightCm: 178, trainingAge: 'intermediate' }, 178);
        const early = deriveCoachFacts(s, 1);
        const late = deriveCoachFacts(s, 11);
        // Early view should see the first milestone; a late view may have none left.
        expect(early.nextMilestone).not.toBeNull();
        expect(early.nextMilestone!.week).toBeGreaterThanOrEqual(1);
        if (late.nextMilestone) {
            expect(late.nextMilestone!.week).toBeGreaterThanOrEqual(11);
        }
    });

    it('is deterministic', () => {
        const s = estimateCycleSummary({ startWeightKg: 80, startBodyFatPct: 18, heightCm: 178, trainingAge: 'intermediate' }, 178);
        expect(deriveCoachFacts(s, 3)).toEqual(deriveCoachFacts(s, 3));
    });
});

describe('transformationEngine — goalState classification', () => {
    const makeSummary = (overrides: Partial<CycleSummary>): CycleSummary => ({
        startWeightKg: 80,
        endWeightKg: 75,
        weightChangeKg: -5,
        weightChangePct: -6.25,
        startBfPct: 20,
        endBfPct: 15,
        bfChangePct: -5,
        totalFatLossKg: 6,
        totalMuscleGainKg: 1,
        avgWeeklyFatLossKg: 0.5,
        avgWeeklyMuscleKg: 0.08,
        netWeeklyWeightChangeKg: -0.4,
        bmiStart: 25.3,
        bmiEnd: 23.7,
        idealWeightKg: 70,
        idealWeightMidKg: 74.5,
        weightToLoseKg: 10,
        weeksToIdeal: 12,
        withinCycle: true,
        goalProgressPct: 60,
        milestones: [],
        energy: {
            bmrKcal: 1800,
            tdeeKcal: 2700,
            dailyDeficitKcal: 600,
            weeklyBurnKcal: 4200,
        },
        ...overrides,
    });

    it('classifies an already-reached target as "reached"', () => {
        const f = deriveCoachFacts(makeSummary({ weeksToIdeal: 0, withinCycle: true }));
        expect(f.goalState).toBe('reached');
        expect(f.reachesGoalInCycle).toBe(false);
        expect(f.weeksBeyondCycle).toBeNull();
    });

    it('classifies a flat (no net change) model as "unreachable"', () => {
        const f = deriveCoachFacts(makeSummary({ weeksToIdeal: null, withinCycle: false }));
        expect(f.goalState).toBe('unreachable');
        expect(f.weeksBeyondCycle).toBeNull();
    });

    it('classifies a target inside 12 weeks as "within-cycle"', () => {
        const f = deriveCoachFacts(makeSummary({ weeksToIdeal: 8, withinCycle: true }));
        expect(f.goalState).toBe('within-cycle');
        expect(f.reachesGoalInCycle).toBe(true);
        expect(f.weeksBeyondCycle).toBeNull();
    });

    it('classifies a target past week 12 as "beyond-cycle" with weeksBeyond', () => {
        const f = deriveCoachFacts(makeSummary({ weeksToIdeal: 20, withinCycle: false }));
        expect(f.goalState).toBe('beyond-cycle');
        expect(f.reachesGoalInCycle).toBe(false);
        expect(f.weeksBeyondCycle).toBe(8);
    });
});
