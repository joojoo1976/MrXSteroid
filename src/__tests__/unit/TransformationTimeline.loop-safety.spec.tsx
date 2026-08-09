import React from 'react';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TransformationTimeline from '../../features/calculator/TransformationTimeline';
import { PreferencesContext } from '../../context/PreferencesContext';
import { Language, Theme, type ContentStrings } from '../../shared/types/types';
import { UnitSystem } from '../../shared/lib/logic';
import * as engineModule from '../../features/calculator/lib/transformationEngine';

// Count every engine recompute so a render loop becomes visible as an
// exploding call count instead of a hung assertion.
vi.mock('../../features/calculator/lib/transformationEngine', async (importOriginal) => {
    const mod = await importOriginal<typeof engineModule>();
    return {
        ...mod,
        projectBodyComposition: vi.fn(mod.projectBodyComposition),
        estimateCycleSummary: vi.fn(mod.estimateCycleSummary),
    };
});

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

describe('TransformationTimeline — no render loops', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('a single slider change recomputes the engine a bounded number of times', () => {
        renderTimeline();
        const recomputeCalls = () =>
            vi.mocked(engineModule.projectBodyComposition).mock.calls.length;
        const before = recomputeCalls();
        const slider = screen.getByLabelText('Weight') as HTMLInputElement;
        fireEvent.change(slider, { target: { value: '85' } });
        const delta = recomputeCalls() - before;
        // Initial mount derives several memo chains (each run calls the engine
        // a few times). A single user edit must stay within a tiny bound — an
        // infinite loop would explode this number.
        expect(delta).toBeLessThan(20);
    });

    it('a 50-change drag burst stays linear — no exponential re-renders', () => {
        renderTimeline();
        const recomputeCalls = () =>
            vi.mocked(engineModule.projectBodyComposition).mock.calls.length;
        const before = recomputeCalls();
        const slider = screen.getByLabelText('Weight') as HTMLInputElement;
        for (let v = 70; v <= 120; v++) {
            fireEvent.change(slider, { target: { value: String(v) } });
        }
        const delta = recomputeCalls() - before;
        // ~4 memo chains × 51 changes ≈ 204 recomputes; a runaway loop would
        // be orders of magnitude higher (10k+). This catches the classic
        // useMemo feedback bug deterministically, independent of jsdom timing.
        expect(delta).toBeLessThan(500);
        expect((screen.getByLabelText('Weight') as HTMLInputElement).value).toBe('120');
        expect(screen.getByText('120 kg')).toBeInTheDocument();
        cleanup();
    }, 30000);
});
