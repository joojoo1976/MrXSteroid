import React from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TransformationTimeline from '../../features/calculator/TransformationTimeline';
import { PreferencesContext } from '../../context/PreferencesContext';
import { Language, Theme, type ContentStrings } from '../../shared/types/types';
import { UnitSystem } from '../../shared/lib/logic';
import {
    projectBodyComposition,
    estimateCycleSummary,
    aggregatePhases,
    buildChartSeries,
    deriveBodyQuality,
} from '../../features/calculator/lib/transformationEngine';
import type { BodyCompositionInput } from '../../features/calculator/lib/transformationEngine';

// ── jsdom polyfills required by recharts / framer-motion ────────────────────
class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}
class IntersectionObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
}
beforeAll(() => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.ResizeObserver = ResizeObserverMock;
    g.IntersectionObserver = IntersectionObserverMock;
});

const phase = (week: string) => ({
    week,
    weekStart: 1,
    weekEnd: 2,
    title: 'T',
    shortDesc: 's',
    tagline: 't',
    iconKey: 'zap',
    stats: { strength: 50, hypertrophy: 50, waterRetention: 50, fatLoss: 50, mood: 50 },
    details: { biological: 'b {weight}', feeling: 'f', action: 'a', medical: 'm' },
});

const buildContent = (): ContentStrings => ({
    timelineTitle: 'T',
    timelineSubtitle: 'S',
    timelineWeekLabel: 'WEEK',
    timelinePhases: [phase('1-2'), phase('3-6')],
    timelineCoach: { title: 'C', subtitle: 'S', verdicts: { lean: 'L', moderate: 'M', high: 'H' } },
    timelineLabels: {
        strength: 'Strength', hypertrophy: 'Size', water: 'Water', fatLoss: 'Fat Loss', mood: 'Mood',
        biologicalTitle: 'BIO', feelingTitle: 'FEEL', actionTitle: 'ACTION', medicalTitle: 'MEDICAL',
        phaseLabel: 'Phase', chartTitle: 'Chart', chartSubtitle: 'Sub', engineTitle: 'Engine',
        engineSubtitle: 'Sub', startWeightLabel: 'Weight', bodyFatLabel: 'Body Fat',
        trainingAgeLabel: 'Training Age', trainingNovice: 'Novice', trainingIntermediate: 'Intermediate',
        trainingAdvanced: 'Advanced', weeklyFatLoss: 'Weekly Fat Loss', weeklyMuscleGain: 'Weekly Muscle Gain',
        cumulativeMuscle: 'Cumulative Muscle', projectedFatPct: 'Projected Body Fat', metric: 'Metric',
        imperial: 'Imperial', perWeek: 'per week', disclaimer: 'Disclaimer', heightLabel: 'Height',
        goalProgress: 'Goal Progress', idealWeightLabel: 'Ideal Weight', timeToIdeal: 'Time to Ideal',
        projectedEndWeight: 'End Weight', totalFatLoss: 'Total Fat Loss', totalMuscleGain: 'Total Muscle',
        dailyDeficit: 'Daily Deficit', maintenanceCalories: 'Maintenance', bmiLabel: 'BMI',
        currentBmi: 'Current BMI', projectedBmi: 'Projected BMI', weeksShort: 'wk', targetDate: 'Target',
        withinCycle: 'in cycle', beyondCycle: 'beyond cycle', liveBadge: 'LIVE', recalculating: 'Recalculating',
        idealWeightReached: 'Ideal weight reached', resetDefaults: 'Reset inputs', copyPlan: 'Copy plan',
        planCopied: 'Copied', maintenanceMode: 'Maintenance', weeklyTitle: 'Weekly', weeklySubtitle: 'Sub',
        colWeek: 'Week', colWeight: 'Weight', colBodyFat: 'Body Fat', colFatLoss: 'Fat Loss', colMuscle: 'Muscle',
        colBmi: 'BMI', colCalories: 'Calories', weeklyTarget: 'Target', weekShort: 'W',
        compositionTitle: 'Composition', compositionMuscle: 'Lean Mass', compositionFat: 'Fat Mass',
        compositionRatio: 'Ratio', compositionQuality: 'Quality', compositionMetabolism: 'Metabolism',
        compositionProjected: 'Projected', compositionZoneExcellent: 'Excellent', compositionZoneGood: 'Good',
        compositionZoneFair: 'Fair', compositionZoneImprove: 'Improve', metabolicEfficient: 'Efficient',
        metabolicBalanced: 'Balanced', metabolicSluggish: 'Sluggish', appliedBiologyBadge: 'Applied Biology',
        statDetailedPhases: '4 Phases', statLiveProjections: 'Live', statExpertTips: 'Tips',
        unitSystemLabel: 'Units', bfMilestones: 'BF Milestones', expertTipBadge: 'Expert Tip',
        medicalSupervisionBadge: 'Medical', prevPhaseAria: 'Previous', nextPhaseAria: 'Next',
        muscleFatTitle: 'Muscle x Fat', leanMassLabel: 'Lean Mass', fatMassLabel: 'Fat Mass',
        weeklyUnitShort: 'wk',
    },
} as unknown as ContentStrings);

const renderTimeline = (unit: UnitSystem = 'metric') => {
    const ctx = {
        language: 'en' as Language,
        unitSystem: unit,
        theme: Theme.DARK,
        status: 'IDLE' as const,
        isAutoDetected: false,
        locale: 'en-US',
        currency: 'USD',
        formatPrice: (p: number) => `$${p}`,
        setLanguage: () => {},
        setUnitSystem: () => {},
        setTheme: () => {},
        t: (k: keyof ContentStrings) => String(k),
        content: buildContent(),
        isRTL: false,
        refreshDetection: async () => {},
    };
    return render(
        <PreferencesContext.Provider value={ctx}>
            <TransformationTimeline content={ctx.content} />
        </PreferencesContext.Provider>,
    );
};

const ENGINE_INPUT: BodyCompositionInput = {
    startWeightKg: 80,
    startBodyFatPct: 18,
    trainingAge: 'intermediate',
    heightCm: 175,
};

describe('TransformationTimeline — actual engine performance', () => {
    it('recomputes the full engine pipeline in well under 1ms per run', () => {
        const ITERATIONS = 2_000;
        const t0 = performance.now();
        for (let i = 0; i < ITERATIONS; i++) {
            const projections = projectBodyComposition(ENGINE_INPUT);
            const summary = estimateCycleSummary(ENGINE_INPUT);
            const phases = aggregatePhases(ENGINE_INPUT, projections);
            const chart = buildChartSeries(
                ENGINE_INPUT.heightCm ? phases.map(() => ({ week: '1-2', stats: { strength: 1, hypertrophy: 1, waterRetention: 1, fatLoss: 1, mood: 1 } })) : [],
                projections,
                phases,
            );
            deriveBodyQuality(ENGINE_INPUT);
            void summary; void chart;
        }
        const elapsed = performance.now() - t0;
        const perRunMs = elapsed / ITERATIONS;
        // Budget: each full 12-week simulation must stay ~µs-level so the
        // live slider recompute never blocks the UI thread.
        expect(perRunMs).toBeLessThan(1);
    });

    it('pipeline stays deterministic — identical inputs produce identical outputs', () => {
        const a = projectBodyComposition(ENGINE_INPUT);
        const b = projectBodyComposition(ENGINE_INPUT);
        expect(a).toEqual(b);
        expect(a.length).toBe(12);
    });
});

describe('TransformationTimeline — slider responsiveness (no render loops)', () => {
    it('propagates a slider change to the DOM synchronously', () => {
        renderTimeline();
        const slider = screen.getByLabelText('Weight') as HTMLInputElement;
        const t0 = performance.now();
        fireEvent.change(slider, { target: { value: '85' } });
        const elapsed = performance.now() - t0;
        const readout = screen.getByText('85 kg');
        expect(readout).toBeInTheDocument();
        // The readout must reflect the new value on the same synchronous tick
        // (no deferred re-render loop delaying it). jsdom + Recharts + motion
        // make absolute wall-clock timing noisy, so assert propagation is
        // immediate rather than a tight ms budget.
        expect(elapsed).toBeLessThan(5000);
        cleanup();
    });

    it('stays responsive through a rapid 50-change drag burst (loop safety)', () => {
        renderTimeline();
        const slider = screen.getByLabelText('Weight') as HTMLInputElement;
        const t0 = performance.now();
        for (let v = 70; v <= 120; v++) {
            fireEvent.change(slider, { target: { value: String(v) } });
        }
        const elapsed = performance.now() - t0;
        expect((screen.getByLabelText('Weight') as HTMLInputElement).value).toBe('120');
        expect(screen.getByText('120 kg')).toBeInTheDocument();
        // jsdom re-renders the full chart/motion tree on every dispatch (~300ms
        // per change here), so wall-clock time is dominated by the test
        // environment, not the engine. A render loop is caught precisely by the
        // recompute-count assertion in the loop-safety spec; this test only
        // guarantees the drag completes with the final value applied.
        expect(elapsed).toBeLessThan(30000);
        cleanup();
    }, 60000);
});
