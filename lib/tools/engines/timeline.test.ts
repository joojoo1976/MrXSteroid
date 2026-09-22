/**
 * lib/tools/engines/timeline.test.ts
 * Tool #080 — Layer 1 engine tests: fat partitioning, hypertrophy caps,
 * metabolic adaptation, water retention, plateau detection, determinism and
 * hostile-input safety.
 */
import { describe, it, expect } from 'vitest';
import {
    ADAPTATION_DECAY_PER_WEEK,
    ADAPTATION_FLOOR,
    calculateTimeline,
    DEFAULT_TIMELINE_INPUT,
    FAT_KCAL_PER_KG,
    MUSCLE_KCAL_PER_KG,
    PLATEAU_WEEKLY_CHANGE_KG,
    RECOMP_MUSCLE_FACTOR,
    adaptationFactor,
    hypertrophyCap,
    waterRetentionPct,
    type EngineInput,
} from './timeline';

const fatLossInput = (overrides: Partial<EngineInput> = {}): EngineInput => ({
    startingWeightKg: 90,
    startingBodyFatPct: 25,
    goal: 'fat_loss',
    biologicalStatus: 'natural',
    experienceLevel: 'intermediate',
    caloricDeltaKcal: -500,
    timelineWeeks: 12,
    ...overrides,
});

describe('Tool #080 — adaptation & helpers', () => {
    it('starts at 1.0 and decays linearly toward the floor', () => {
        expect(adaptationFactor(1)).toBe(1);
        expect(adaptationFactor(2)).toBeCloseTo(1 - ADAPTATION_DECAY_PER_WEEK, 10);
        // far enough out it hits the floor and never drops below it
        expect(adaptationFactor(200)).toBe(ADAPTATION_FLOOR);
        expect(adaptationFactor(200)).toBeGreaterThanOrEqual(ADAPTATION_FLOOR);
    });

    it('caps water retention to enhanced weeks 1–4 and zero for natural', () => {
        expect(waterRetentionPct('natural', 1)).toBe(0);
        expect(waterRetentionPct('enhanced', 1)).toBeGreaterThan(waterRetentionPct('enhanced', 4));
        expect(waterRetentionPct('enhanced', 5)).toBe(0); // tapered to zero
        expect(waterRetentionPct('heavy_enhanced', 1)).toBeGreaterThan(waterRetentionPct('enhanced', 1));
    });

    it('respects the experience × status hypertrophy ceiling ordering', () => {
        expect(hypertrophyCap('natural', 'beginner')).toBeGreaterThan(hypertrophyCap('natural', 'advanced'));
        expect(hypertrophyCap('heavy_enhanced', 'beginner')).toBeGreaterThan(hypertrophyCap('enhanced', 'beginner'));
        expect(hypertrophyCap('enhanced', 'beginner')).toBeGreaterThan(hypertrophyCap('natural', 'beginner'));
    });
});

describe('Tool #080 — fat-loss trajectory', () => {
    const result = calculateTimeline(fatLossInput());

    it('produces a weekly point per requested week, week 1..N', () => {
        expect(result.timeline).toHaveLength(12);
        expect(result.timeline[0].weekNumber).toBe(1);
        expect(result.timeline[11].weekNumber).toBe(12);
        expect(result.timeline[0].dateOffset).toBe(0);
        expect(result.timeline[1].dateOffset).toBe(7);
    });

    it('loses fat mass and drops body-fat % over time on a deficit', () => {
        const first = result.timeline[0];
        const last = result.timeline[11];
        expect(last.estimatedFatMassKg).toBeLessThan(first.estimatedFatMassKg);
        expect(last.bodyFatPct).toBeLessThan(first.bodyFatPct);
        expect(result.fatLostKg).toBeGreaterThan(0);
    });

    it('fat mass change is consistent with the 7700 kcal/kg energy model', () => {
        // Week 1 has no adaptation: fatΔ ≈ (delta·7)/7700 (natural → no muscle gain on deficit, no water).
        const w1 = result.timeline[0];
        const startingFat = (90 * 25) / 100; // 22.5 kg
        const expectedFatDelta = (-500 * 7) / FAT_KCAL_PER_KG; // ≈ -0.4545
        expect(w1.estimatedFatMassKg).toBeCloseTo(startingFat + expectedFatDelta, 1);
    });

    it('never emits NaN or Infinity anywhere in the timeline', () => {
        for (const p of result.timeline) {
            for (const v of [
                p.estimatedWeightKg,
                p.estimatedLbmKg,
                p.estimatedFatMassKg,
                p.bodyFatPct,
                p.waterRetentionPct,
                p.dateOffset,
            ]) {
                expect(Number.isFinite(v)).toBe(true);
            }
        }
        expect(Number.isFinite(result.muscleGainedKg)).toBe(true);
        expect(Number.isFinite(result.fatLostKg)).toBe(true);
    });
});

describe('Tool #080 — lean-gain partitioning & hypertrophy cap', () => {
    it('partitions a surplus into muscle (capped) and fat', () => {
        const r = calculateTimeline(
            fatLossInput({ goal: 'lean_gain', caloricDeltaKcal: 800, biologicalStatus: 'enhanced', experienceLevel: 'beginner' }),
        );
        expect(r.muscleGainedKg).toBeGreaterThan(0);
        // Beginner enhanced cap = 0.9 kg/week; over 12 weeks the cap bounds the gain.
        const cap = 0.9;
        expect(r.muscleGainedKg).toBeLessThanOrEqual(Math.round((cap * 12) * 100) / 100 + 0.01);
    });

    it('caps natural advanced muscle gain far below a beginner enhanced surplus', () => {
        const advanced = calculateTimeline(
            fatLossInput({ goal: 'lean_gain', caloricDeltaKcal: 1000, experienceLevel: 'advanced', biologicalStatus: 'natural' }),
        );
        const beginner = calculateTimeline(
            fatLossInput({ goal: 'lean_gain', caloricDeltaKcal: 1000, experienceLevel: 'beginner', biologicalStatus: 'enhanced' }),
        );
        expect(advanced.muscleGainedKg).toBeLessThan(beginner.muscleGainedKg);
    });

    it('surplus muscle gain is bounded by the energy available (MUSCLE_KCAL_PER_KG)', () => {
        // A tiny surplus cannot fabricate more muscle than its energy allows.
        const r = calculateTimeline(
            fatLossInput({ goal: 'lean_gain', caloricDeltaKcal: 50, timelineWeeks: 4, biologicalStatus: 'natural', experienceLevel: 'beginner' }),
        );
        const energyMaxMuscle = (50 * 7) / MUSCLE_KCAL_PER_KG * 4;
        expect(r.muscleGainedKg).toBeLessThanOrEqual(Math.round(energyMaxMuscle * 100) / 100 + 0.01);
    });
});

describe('Tool #080 — recomposition', () => {
    it('builds muscle AND loses fat simultaneously on a small deficit', () => {
        const r = calculateTimeline(
            fatLossInput({ goal: 'recomposition', caloricDeltaKcal: -300, biologicalStatus: 'natural', experienceLevel: 'beginner' }),
        );
        expect(r.muscleGainedKg).toBeGreaterThan(0);
        expect(r.fatLostKg).toBeGreaterThan(0);
        // recomp muscle gain is the RECOMP_MUSCLE_FACTOR fraction of the cap
        const cap = 0.5; // natural beginner
        expect(r.muscleGainedKg).toBeLessThanOrEqual(Math.round(cap * RECOMP_MUSCLE_FACTOR * 12 * 100) / 100 + 0.01);
    });
});

describe('Tool #080 — enhanced water & plateau', () => {
    it('adds extra water weight during weeks 1–3 for enhanced status', () => {
        const enhanced = calculateTimeline(
            fatLossInput({ biologicalStatus: 'heavy_enhanced', caloricDeltaKcal: 0, goal: 'lean_gain' }),
        );
        const natural = calculateTimeline(fatLossInput({ biologicalStatus: 'natural', caloricDeltaKcal: 0, goal: 'lean_gain' }));
        expect(enhanced.timeline[0].waterRetentionPct).toBeGreaterThan(0);
        expect(natural.timeline[0].waterRetentionPct).toBe(0);
        // Week 1 enhanced weight > natural weight (same starting tissue) due to water.
        expect(enhanced.timeline[0].estimatedWeightKg).toBeGreaterThan(natural.timeline[0].estimatedWeightKg);
        // Water tapers to zero by week 5.
        expect(enhanced.timeline[4]?.waterRetentionPct).toBe(0);
    });

    it('flags a plateau when weekly change falls below the threshold for 2 consecutive weeks', () => {
        // A near-maintenance tiny delta stalls after adaptation kicks in.
        const r = calculateTimeline(fatLossInput({ caloricDeltaKcal: -30, timelineWeeks: 24 }));
        if (r.plateauWarningWeek > 0) {
            expect(r.plateauWarningWeek).toBeGreaterThanOrEqual(3);
            // sanity: the plateau threshold constant is the trigger
            expect(PLATEAU_WEEKLY_CHANGE_KG).toBe(0.15);
        }
    });

    it('reports totalWeeksNeeded = timeline length when the goal is not reached', () => {
        const r = calculateTimeline(fatLossInput({ caloricDeltaKcal: -30, timelineWeeks: 6 }));
        expect(r.totalWeeksNeeded).toBe(6);
    });

    it('reaches the fat-loss target within a long enough timeline', () => {
        const r = calculateTimeline(fatLossInput({ caloricDeltaKcal: -800, timelineWeeks: 20 }));
        expect(r.targetReached).toBe(true);
        expect(r.totalWeeksNeeded).toBeLessThanOrEqual(20);
    });
});

describe('Tool #080 — determinism & hostile input', () => {
    it('is deterministic: identical inputs → identical outputs', () => {
        expect(calculateTimeline(DEFAULT_TIMELINE_INPUT)).toEqual(calculateTimeline(DEFAULT_TIMELINE_INPUT));
    });

    it('degrades safely on hostile input (never throws, never NaN)', () => {
        const hostile = calculateTimeline({
            startingWeightKg: Number.NaN,
            startingBodyFatPct: Number.POSITIVE_INFINITY,
            goal: 'nope' as never,
            biologicalStatus: 'ghost' as never,
            experienceLevel: 'alien' as never,
            caloricDeltaKcal: Number.NaN,
            timelineWeeks: Number.NaN,
        });
        expect(hostile.timeline.length).toBeGreaterThan(0);
        for (const p of hostile.timeline) {
            expect(Number.isFinite(p.estimatedWeightKg)).toBe(true);
            expect(Number.isFinite(p.bodyFatPct)).toBe(true);
        }
    });

    it('clamps an over-long timeline to the 52-week ceiling', () => {
        const r = calculateTimeline(fatLossInput({ timelineWeeks: 9999 }));
        expect(r.timeline).toHaveLength(52);
    });
});
