import { useState, useMemo, useCallback, useDeferredValue, useEffect } from 'react';
import { ContentStrings } from '@/shared/types/types';
import { UnitSystem } from '@/shared/lib/logic';
import { saveCalculatorResult } from '@/shared/lib/calculator-history';
import {
    projectBodyComposition,
    aggregatePhases,
    buildChartSeries,
    estimateCycleSummary,
    DEFAULT_HEIGHT_CM,
    clamp,
    type TrainingAge,
    type BodyCompositionInput,
    type WeeklyProjection,
    type PhaseAggregate,
    type CycleSummary,
} from '../lib/transformationEngine';

const STORAGE_KEY = 'mrx.timeline.v1';

interface PersistedInputs {
    weightKg: number;
    bodyFatPct: number;
    heightCm: number;
    trainingAge: TrainingAge;
}

/** Defaults the live engine boots with (also used by "Reset inputs"). */
export const DEFAULT_ENGINE_INPUTS: PersistedInputs = {
    weightKg: 80,
    bodyFatPct: 18,
    heightCm: DEFAULT_HEIGHT_CM,
    trainingAge: 'intermediate',
};

const TRAINING_AGES: TrainingAge[] = ['novice', 'intermediate', 'advanced'];

/**
 * Safely hydrates persisted inputs, clamping every value to the slider ranges
 * so stale/corrupt storage can never break the UI.
 */
const readPersistedInputs = (): PersistedInputs => {
    const fallback = DEFAULT_ENGINE_INPUTS;
    try {
        if (typeof window === 'undefined') return fallback;
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw) as Partial<PersistedInputs>;
        return {
            weightKg: clamp(Number(parsed.weightKg) || fallback.weightKg, 40, 160),
            bodyFatPct: clamp(Number(parsed.bodyFatPct) || fallback.bodyFatPct, 8, 40),
            heightCm: clamp(Number(parsed.heightCm) || fallback.heightCm, 140, 210),
            trainingAge: TRAINING_AGES.includes(parsed.trainingAge as TrainingAge)
                ? (parsed.trainingAge as TrainingAge)
                : fallback.trainingAge,
        };
    } catch {
        return fallback;
    }
};

interface UseTransformationTimelineOptions {
    content: ContentStrings;
    /** Active interface language (drives the localized snapshot title). */
    isAr: boolean;
    /** Active measurement system — included in the persisted snapshot. */
    unitSystem: UnitSystem;
}

/**
 * Powers the Transformation Timeline with a live prediction engine.
 * Owns the computation inputs (start weight, body-fat %, training age)
 * and derives per-phase projections + chart series deterministically.
 */
export const useTransformationTimeline = ({ content, isAr, unitSystem }: UseTransformationTimelineOptions) => {
    const [activePhase, setActivePhase] = useState(0);

    // ── Live engine inputs (editable, metric base values) ──────────────
    // Hydrated once from localStorage so the user's plan survives reloads.
    const initial = useMemo(() => readPersistedInputs(), []);
    const [startWeightKg, setStartWeightKg] = useState(initial.weightKg);
    const [startBodyFatPct, setStartBodyFatPct] = useState(initial.bodyFatPct);
    const [heightCm, setHeightCm] = useState<number>(initial.heightCm);
    const [trainingAge, setTrainingAge] = useState<TrainingAge>(initial.trainingAge);

    // Deferred copies — the sliders stay buttery-smooth (60fps) while the
    // heavier derived math (simulation, summary, chart) lags a single frame.
    // This is the debounce/backpressure layer for the live engine.
    const deferredWeightKg = useDeferredValue(startWeightKg);
    const deferredBodyFatPct = useDeferredValue(startBodyFatPct);
    const deferredHeightCm = useDeferredValue(heightCm);
    const deferredTrainingAge = useDeferredValue(trainingAge);

    const engineInput = useMemo<BodyCompositionInput>(() => ({
        startWeightKg: deferredWeightKg,
        startBodyFatPct: deferredBodyFatPct,
        heightCm: deferredHeightCm,
        trainingAge: deferredTrainingAge,
    }), [deferredWeightKg, deferredBodyFatPct, deferredHeightCm, deferredTrainingAge]);

    // True while a deferred recompute is still catching up → drives the
    // "recalculating" live indicator on the panel.
    const isRecalculating =
        deferredWeightKg !== startWeightKg ||
        deferredBodyFatPct !== startBodyFatPct ||
        deferredHeightCm !== heightCm;

    // ── Persistence — writes every input change to localStorage ─────────
    useEffect(() => {
        try {
            if (typeof window === 'undefined') return;
            const snapshot: PersistedInputs = {
                weightKg: startWeightKg,
                bodyFatPct: startBodyFatPct,
                heightCm,
                trainingAge,
            };
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
        } catch {
            // Storage unavailable (private mode / quota) → run stateless.
        }
    }, [startWeightKg, startBodyFatPct, heightCm, trainingAge]);

    const resetToDefaults = useCallback(() => {
        setStartWeightKg(DEFAULT_ENGINE_INPUTS.weightKg);
        setStartBodyFatPct(DEFAULT_ENGINE_INPUTS.bodyFatPct);
        setHeightCm(DEFAULT_ENGINE_INPUTS.heightCm);
        setTrainingAge(DEFAULT_ENGINE_INPUTS.trainingAge);
    }, []);

    // ── Deterministic projections (pure math) ───────────────────────────
    const projections = useMemo<WeeklyProjection[]>(
        () => projectBodyComposition(engineInput),
        [engineInput],
    );

    const phaseAggregates = useMemo<PhaseAggregate[]>(
        () => aggregatePhases(engineInput, projections),
        [engineInput, projections],
    );

    // Chart series — merges the classic stat bars with live projections.
    const chartData = useMemo(
        () => buildChartSeries(content.timelinePhases, projections, phaseAggregates),
        [content.timelinePhases, projections, phaseAggregates],
    );

    // Advanced live predictions — time to ideal weight, energy economics,
    // milestones and goal progress, recomputed on every input change.
    const summary = useMemo<CycleSummary>(
        () => estimateCycleSummary(engineInput, deferredHeightCm),
        [engineInput, deferredHeightCm],
    );

    // ── Supabase sync — debounced snapshot of the live engine ─────────
    // Mirrors the other calculators' auto-save pattern so the latest plan
    // surfaces in the user's calculator history / admin dashboard without
    // spamming the DB while a slider is being dragged.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            void saveCalculatorResult({
                tool: 'transformation',
                title: isAr ? 'محرك التوقع الحي' : 'Live Prediction Engine',
                inputs: {
                    startWeightKg,
                    startBodyFatPct,
                    heightCm,
                    trainingAge,
                    unitSystem,
                },
                result: {
                    endWeightKg: summary.endWeightKg,
                    endBfPct: summary.endBfPct,
                    totalFatLossKg: summary.totalFatLossKg,
                    totalMuscleGainKg: summary.totalMuscleGainKg,
                    weeklyFatLossKg: summary.avgWeeklyFatLossKg,
                    dailyDeficitKcal: summary.energy.dailyDeficitKcal,
                    goalProgressPct: summary.goalProgressPct,
                    weeksToIdeal: summary.weeksToIdeal,
                    milestones: summary.milestones,
                    projections: projections.map((p) => ({
                        week: p.week,
                        weightKg: p.weightKg,
                        bodyFatPct: p.bodyFatPct,
                        fatLossKg: p.fatLossKg,
                        cumulativeMuscleGainKg: p.cumulativeMuscleGainKg,
                    })),
                },
            });
        }, 800);
        return () => window.clearTimeout(timer);
    }, [isAr, unitSystem, startWeightKg, startBodyFatPct, heightCm, trainingAge, projections, summary]);

    const activeData = useMemo(() => {
        return content.timelinePhases[activePhase];
    }, [content.timelinePhases, activePhase]);

    const activeAggregate = useMemo(() => {
        return phaseAggregates[activePhase];
    }, [phaseAggregates, activePhase]);

    const nextPhase = useCallback(() => {
        setActivePhase(prev => Math.min(prev + 1, content.timelinePhases.length - 1));
    }, [content.timelinePhases.length]);

    const prevPhase = useCallback(() => {
        setActivePhase(prev => Math.max(prev - 1, 0));
    }, []);

    const setPhase = useCallback((idx: number) => {
        setActivePhase(idx);
    }, []);

    return {
        // Phase navigation
        activePhase,
        activeData,
        activeAggregate,
        chartData,
        nextPhase,
        prevPhase,
        setPhase,
        totalPhases: content.timelinePhases.length,

        // Live engine state + setters
        startWeightKg,
        setStartWeightKg,
        startBodyFatPct,
        setStartBodyFatPct,
        heightCm,
        setHeightCm,
        trainingAge,
        setTrainingAge,
        isRecalculating,
        engineInput,
        projections,
        phaseAggregates,
        summary,
        resetToDefaults,
    };
};
