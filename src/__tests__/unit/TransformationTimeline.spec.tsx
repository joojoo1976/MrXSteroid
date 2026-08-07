import React from 'react';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react';
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
        heightLabel: 'Height',
        resetDefaults: 'Reset inputs',
        copyPlan: 'Copy plan',
        planCopied: 'Plan copied to clipboard',
        weeklyTitle: 'Week-by-Week Projection',
        weeklySubtitle: '12-week numbers',
        colWeek: 'Week', colWeight: 'Weight', colBodyFat: 'Body Fat', colFatLoss: 'Fat Lost', colLean: 'Lean Gained',
        maintenanceMode: 'Maintenance — recomposition mode',
        idealWeightReached: 'Ideal weight reached',
    },
    timelineCoach: {
        title: 'Smart Coach',
        subtitle: 'Live verdicts recomputed from your engine inputs',
        goalTitle: 'Goal Trajectory',
        deficitTitle: 'Calorie Economy',
        compositionTitle: 'Starting Composition',
        nutritionTitle: 'Nutrition Plan',
        verdictInCycle: 'You can reach your ideal weight ({ideal}) inside this 12-week cycle. Keep the deficit consistent and the trajectory holds.',
        verdictBeyond: 'Your ideal weight ({ideal}) sits about {weeks} weeks beyond this cycle — plan a short follow-up cut after week 12.',
        verdictReached: 'You are already at or below your ideal weight ({ideal}) — this cycle is about recomposition and holding the target.',
        verdictMaintain: 'You are inside your ideal weight band — the model projects recomposition with no net weight change.',
        deficitMild: 'Your daily deficit (~{kcal} kcal) is gentle — results will come, just slower. Consider tightening your intake slightly.',
        deficitModerate: 'A solid ~{kcal} kcal daily deficit — the sweet spot that balances muscle preservation with steady fat loss.',
        deficitAggressive: 'Your daily deficit (~{kcal} kcal) is aggressive. Keep protein high and prioritize sleep to protect lean mass.',
        bfLean: 'At {bf}% body fat you are already lean — expect slower fat loss and guard muscle aggressively.',
        bfModerate: 'Starting at {bf}% body fat gives you a wide, safe runway for steady weekly fat loss.',
        bfHigh: 'At {bf}% body fat, early weeks shed water and fat quickly — bank the momentum but don\'t push the deficit too far.',
        proteinNovice: 'As a beginner your adaptation window is wide — lock in {protein} of protein daily to ride it.',
        proteinIntermediate: 'At intermediate level, {protein} of protein keeps anabolic signaling at its peak.',
        proteinAdvanced: 'Near your genetic ceiling — {protein} of protein with disciplined recovery separates stalls from progress.',
        milestoneNext: 'Next milestone: under {pct}% body fat around week {week}.',
        milestoneDone: 'Every body-fat milestone in this cycle is projected to be reached.',
        noMilestone: 'No body-fat milestone is projected within this cycle.',
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
        // AnimatePresence popLayout overlaps the exit/enter cards (no blank gap),
        // so the new card appears while the old one still exits.
        // 20s test timeout: this suite renders heavy charts + motion; under
        // parallel load jsdom can exceed the default 5s window (flaky otherwise).
        expect(await screen.findByText('Phase Two', {}, { timeout: 15000 })).toBeInTheDocument();
        // Medical block persists across phases.
        expect(screen.getAllByText('MEDICAL').length).toBeGreaterThan(0);
        cleanup();
    }, 20000);

    it('does not crash on unit toggle interactions', () => {
        renderTimeline('metric');
        const imperialBtn = screen.getByRole('button', { name: /imperial/i });
        expect(imperialBtn).toBeInTheDocument();
        cleanup();
    });

    it('renders the Smart Coach panel with all four live verdict cards', () => {
        renderTimeline();
        // Panel header + card titles must be present.
        expect(screen.getByText('Smart Coach')).toBeInTheDocument();
        expect(screen.getByText('Goal Trajectory')).toBeInTheDocument();
        expect(screen.getByText('Calorie Economy')).toBeInTheDocument();
        expect(screen.getByText('Starting Composition')).toBeInTheDocument();
        expect(screen.getByText('Nutrition Plan')).toBeInTheDocument();
        // Dynamic verdict copy is wired up (selector 'p' avoids the ancestor
        // wrapper matching the same normalized text).
        expect(screen.getByText(/inside this 12-week cycle/, { selector: 'p' })).toBeInTheDocument();
        expect(screen.getByText(/2\.5g\/kg of protein/, { selector: 'p' })).toBeInTheDocument();
        expect(screen.getByText(/Next milestone: under \d+% body fat around week \d+\./, { selector: 'p' })).toBeInTheDocument();
        cleanup();
    });

    it('copies the plan snapshot to the clipboard on demand', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
        renderTimeline();
        fireEvent.click(screen.getByRole('button', { name: /copy plan/i }));
        await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
        const text = writeText.mock.calls[0][0] as string;
        // Inputs, predictions and coach verdicts all make it into the snapshot.
        expect(text).toContain('80 kg');
        expect(text).toContain('Goal Trajectory');
        expect(text).toContain('│');
        cleanup();
    });

    it('expands the week-by-week table with all 12 projection rows', () => {
        renderTimeline();
        fireEvent.click(screen.getByRole('button', { name: /week-by-week projection/i }));
        const table = screen.getByTestId('weekly-table');
        expect(table.querySelectorAll('tbody tr').length).toBe(12);
        // Column headers present.
        expect(within(table).getByText('Body Fat')).toBeInTheDocument();
        expect(within(table).getByText('Lean Gained')).toBeInTheDocument();
        cleanup();
    });

    it('renders week-by-week weights in imperial units', () => {
        renderTimeline('imperial');
        fireEvent.click(screen.getByRole('button', { name: /week-by-week projection/i }));
        const table = screen.getByTestId('weekly-table');
        expect(table.textContent).toMatch(/lbs/);
        expect(table.textContent).not.toMatch(/g\/kg/);
        cleanup();
    });

    it('shows the reached state when inputs sit at/below the ideal weight', async () => {
        renderTimeline();
        fireEvent.change(screen.getByLabelText('Weight'), { target: { value: '40' } });
        fireEvent.change(screen.getByLabelText('Height'), { target: { value: '210' } });
        await waitFor(() => expect(screen.getByText('Ideal weight reached')).toBeInTheDocument());
        cleanup();
    });
});

describe('TransformationTimeline — live engine persistence', () => {
    // The shared vitest.setup ships a no-op localStorage mock (vi.fn() that
    // stores nothing), so install a real in-memory store for this suite.
    let store = new Map<string, string>();
    const memoryStorage: Storage = {
        getItem: (k) => (store.has(k) ? store.get(k) as string : null),
        setItem: (k, v) => { store.set(k, String(v)); },
        removeItem: (k) => { store.delete(k); },
        clear: () => { store.clear(); },
        key: (i) => Array.from(store.keys())[i] ?? null,
        get length() { return store.size; },
    };

    beforeAll(() => {
        Object.defineProperty(window, 'localStorage', { value: memoryStorage, writable: true });
    });

    beforeEach(() => {
        store = new Map<string, string>();
        Object.defineProperty(window, 'localStorage', { value: memoryStorage, writable: true });
        window.localStorage.clear();
    });

    it('persists slider changes to localStorage', () => {
        renderTimeline();
        fireEvent.change(screen.getByLabelText('Weight'), { target: { value: '100' } });
        const stored = window.localStorage.getItem('mrx.timeline.v1');
        expect(stored).not.toBeNull();
        expect(JSON.parse(stored as string)).toMatchObject({ weightKg: 100 });
        cleanup();
    });

    it('hydrates the engine inputs from localStorage on reload', () => {
        window.localStorage.setItem(
            'mrx.timeline.v1',
            JSON.stringify({ weightKg: 120, bodyFatPct: 28, heightCm: 185, trainingAge: 'advanced' }),
        );
        renderTimeline();
        expect((screen.getByLabelText('Weight') as HTMLInputElement).value).toBe('120');
        expect((screen.getByLabelText('Body Fat') as HTMLInputElement).value).toBe('28');
        expect((screen.getByLabelText('Height') as HTMLInputElement).value).toBe('185');
        cleanup();
    });

    it('clamps corrupt persisted values into the slider ranges', () => {
        window.localStorage.setItem(
            'mrx.timeline.v1',
            JSON.stringify({ weightKg: 9999, bodyFatPct: -5, heightCm: 30, trainingAge: 'expert' }),
        );
        renderTimeline();
        expect((screen.getByLabelText('Weight') as HTMLInputElement).value).toBe('160');
        expect((screen.getByLabelText('Body Fat') as HTMLInputElement).value).toBe('8');
        expect((screen.getByLabelText('Height') as HTMLInputElement).value).toBe('140');
        cleanup();
    });

    it('resets inputs back to defaults via the reset button', () => {
        renderTimeline();
        fireEvent.change(screen.getByLabelText('Weight'), { target: { value: '110' } });
        expect((screen.getByLabelText('Weight') as HTMLInputElement).value).toBe('110');
        fireEvent.click(screen.getByRole('button', { name: /reset inputs/i }));
        expect((screen.getByLabelText('Weight') as HTMLInputElement).value).toBe('80');
        expect(JSON.parse(window.localStorage.getItem('mrx.timeline.v1') as string)).toMatchObject({ weightKg: 80 });
        cleanup();
    });
});
