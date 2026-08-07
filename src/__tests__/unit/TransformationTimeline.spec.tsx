import React from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TransformationTimeline from '../../features/calculator/TransformationTimeline';
import { PreferencesContext } from '../../context/PreferencesContext';
import { Language, Theme, type ContentStrings } from '../../shared/types/types';
import { UnitSystem } from '../../shared/lib/logic';

// recharts ResponsiveContainer requires ResizeObserver in jsdom.
class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

// framer-motion whileInView requires IntersectionObserver in jsdom.
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

const phase = (week: string, title: string, iconKey: string) => ({
    week,
    weekStart: 1,
    weekEnd: 2,
    title,
    shortDesc: 'short',
    tagline: 'tagline',
    iconKey,
    stats: { strength: 50, hypertrophy: 50, waterRetention: 50, fatLoss: 50, mood: 50 },
    details: {
        biological: 'Biology copy {weight}',
        feeling: 'Feeling copy',
        action: 'Action copy {water} {protein}',
        medical: 'Medical copy {kcal} {carbs}',
    },
});

const buildContent = (): ContentStrings => ({
    timelineTitle: 'Transformation Timeline',
    timelineSubtitle: 'Subtitle',
    timelineWeekLabel: 'WEEK',
    timelinePhases: [
        phase('1-2', 'Phase One', 'spark'),
        phase('3-6', 'Phase Two', 'muscle'),
        phase('7-10', 'Phase Three', 'trophy'),
        phase('11-12', 'Phase Four', 'flag'),
    ],
    timelineLabels: {
        strength: 'Strength', hypertrophy: 'Size', water: 'Water', fatLoss: 'Fat Loss', mood: 'Mood',
        biologicalTitle: 'BIO', feelingTitle: 'FEEL', actionTitle: 'ACTION', medicalTitle: 'MEDICAL',
        phaseLabel: 'Phase', chartTitle: 'Chart', chartSubtitle: 'Subtitle', engineTitle: 'Engine',
        engineSubtitle: 'Subtitle', startWeightLabel: 'Weight', bodyFatLabel: 'Body Fat',
        trainingAgeLabel: 'Training Age', trainingNovice: 'Novice', trainingIntermediate: 'Intermediate',
        trainingAdvanced: 'Advanced', weeklyFatLoss: 'Weekly Fat Loss', weeklyMuscleGain: 'Weekly Muscle Gain',
        cumulativeMuscle: 'Cumulative Muscle', projectedFatPct: 'Projected Body Fat', metric: 'Metric',
        imperial: 'Imperial', perWeek: 'per week', disclaimer: 'Disclaimer',
    },
} as unknown as ContentStrings);

const renderTimeline = (unitSystem: UnitSystem = 'metric') => {
    const ctx = {
        language: 'EN' as Language,
        unitSystem,
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

describe('TransformationTimeline — full content visibility', () => {
    it('renders all four narrative blocks for the active phase', () => {
        renderTimeline();
        // All four section titles must be present at once.
        expect(screen.getByText('BIO')).toBeInTheDocument();
        expect(screen.getByText('FEEL')).toBeInTheDocument();
        expect(screen.getByText('ACTION')).toBeInTheDocument();
        expect(screen.getByText('MEDICAL')).toBeInTheDocument();

        // The narrative container must NOT clip content via a hidden scroll.
        const narrative = screen.getByTestId('timeline-narrative');
        expect(narrative.className).not.toContain('max-h-');
        expect(narrative.className).not.toContain('overflow-y-auto');

        cleanup();
    });

    it('renders unit-aware copy in metric system', () => {
        renderTimeline('metric');
        expect(screen.getAllByText(/g\/kg/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/2\.5g\/kg/).length).toBeGreaterThan(0);
        expect(screen.queryByText(/g\/lb/)).not.toBeInTheDocument();
        cleanup();
    });

    it('renders unit-aware copy in imperial system', () => {
        renderTimeline('imperial');
        expect(screen.getAllByText(/g\/lb/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/1\.1g\/lb/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/lbs/).length).toBeGreaterThan(0);
        expect(screen.queryByText(/g\/kg/)).not.toBeInTheDocument();
        cleanup();
    });

    it('navigates to the next phase and updates the content', async () => {
        renderTimeline();
        expect(screen.getByText('Phase One')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Next phase' }));
        // AnimatePresence "wait" runs an exit animation before the next card mounts.
        expect(await screen.findByText('Phase Two')).toBeInTheDocument();
        // Medical block persists across phases.
        expect(screen.getByText('MEDICAL')).toBeInTheDocument();
        cleanup();
    });

    it('does not crash on unit toggle interactions', () => {
        renderTimeline('metric');
        const imperialBtn = screen.getByRole('button', { name: /imperial/i });
        expect(imperialBtn).toBeInTheDocument();
        cleanup();
    });
});
