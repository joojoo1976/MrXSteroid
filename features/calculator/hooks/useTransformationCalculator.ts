'use client';

import { useState, useMemo, useCallback, useDeferredValue, useEffect } from 'react';
import { ContentStrings } from '@/shared/types/types';
import { CONVERSIONS, UnitSystem } from '@/shared/lib/logic';
import { saveCalculatorResult } from '@/shared/lib/calculator-history';
import {
    projectBodyComposition,
    aggregatePhases,
    buildChartSeries,
    estimateCycleSummary,
    idealBodyStandards,
    DEFAULT_HEIGHT_CM,
    clamp,
    type TrainingAge,
    type BodyCompositionInput,
    type WeeklyProjection,
    type PhaseAggregate,
    type CycleSummary,
} from '../lib/transformationEngine';

const STORAGE_KEY = 'mrx.timeline.v1';

/**
 * Slider ranges expressed in BOTH unit systems. Values are supplied as
 * `{min, max, step}` per system and the hook converts the live value +
 * onChange so the thumb stays 1:1 with the displayed readout.
 */
export const SLIDER_RANGES = {
    weightKg: { min: 40, max: 160, step: 1 },
    weightLbs: { min: 88, max: 353, step: 1 },
    bodyFatPct: { min: 8, max: 40, step: 1 },
    heightCm: { min: 140, max: 210, step: 1 },
    heightIn: { min: 55, max: 83, step: 1 },
} as const;

interface PersistedInputs {
    weightKg: number;
    bodyFatPct: number;
    heightCm: number;
    trainingAge: TrainingAge;
}

/** Defaults the live engine boots with (also used by "Reset defaults"). */
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

export interface TransformationSliderConfig {
    /** Display-unit minimum for the <input type="range">. */
    min: number;
    /** Display-unit maximum for the <input type="range">. */
    max: number;
    /** Display-unit step for the <input type="range">. */
    step: number;
    /** Live value in display units — drives the thumb position. */
    value: number;
    /** Receives display-unit values and stores them in metric base. */
    onChange: (value: number) => void;
}

interface UseTransformationCalculatorOptions {
    content: ContentStrings;
    /** Active interface language (drives the localized snapshot title). */
    isAr: boolean;
    /** Active measurement system — included in the persisted snapshot. */
    unitSystem: UnitSystem;
}

/**
 * Unifies ALL Transformation Timeline state + logic:
 * - Metric-base React state (weight kg / body-fat % / height cm / training age)
 * - Metric ↔ Imperial converters + unit-aware slider configs
 * - Pure derivation of projections / aggregates / chart / summary (live math)
 * - Reset-to-defaults AND reset-to-ideal-body-standards actions
 * - localStorage hydration + debounced Supabase snapshot sync
 *
 * The component stays purely presentational — no logic, no raw setState.
 */
export const useTransformationCalculator = ({
    content,
    isAr,
    unitSystem,
}: UseTransformationCalculatorOptions) => {
    const [activePhase, setActivePhase] = useState(0);

    // ── Live engine inputs (editable, metric base values) ──────────────
    const [startWeightKg, setStartWeightKg] = useState(DEFAULT_ENGINE_INPUTS.weightKg);
    const [startBodyFatPct, setStartBodyFatPct] = useState(DEFAULT_ENGINE_INPUTS.bodyFatPct);
    const [heightCm, setHeightCm] = useState<number>(DEFAULT_ENGINE_INPUTS.heightCm);
    const [trainingAge, setTrainingAge] = useState<TrainingAge>(DEFAULT_ENGINE_INPUTS.trainingAge);

    useEffect(() => {
        const persisted = readPersistedInputs();
        setStartWeightKg(persisted.weightKg);
        setStartBodyFatPct(persisted.bodyFatPct);
        setHeightCm(persisted.heightCm);
        setTrainingAge(persisted.trainingAge);
    }, []);

    // Deferred copies — the sliders stay buttery-smooth (60fps) while the
    // heavier derived math (simulation, summary, chart) lags a single frame.
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

    // True while a deferred recompute is still catching up.
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

    /**
     * Resets the engine to the physiological "ideal body" — weight = BMI 22 ×
     * height² (derived from the user's own height), body fat = training-age
     * target. Height/training-age are preserved: they anchor the ideal profile.
     */
    const resetToIdeal = useCallback(() => {
        const standards = idealBodyStandards(heightCm, trainingAge);
        setStartWeightKg(standards.idealWeightKg);
        setStartBodyFatPct(standards.idealBodyFatPct);
    }, [heightCm, trainingAge]);

    // ── Deterministic projections (pure math) ───────────────────────────
    const projections = useMemo<WeeklyProjection[]>(
        () => projectBodyComposition(engineInput),
        [engineInput],
    );

    const phaseAggregates = useMemo<PhaseAggregate[]>(
        () => aggregatePhases(engineInput, projections),
        [engineInput, projections],
    );

    const chartData = useMemo(
        () => buildChartSeries(content.timelinePhases, projections, phaseAggregates),
        [content.timelinePhases, projections, phaseAggregates],
    );

    const summary = useMemo<CycleSummary>(
        () => estimateCycleSummary(engineInput, deferredHeightCm),
        [engineInput, deferredHeightCm],
    );

    // ── Supabase sync — debounced snapshot of the live engine ─────────
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

    // ── Unit-aware slider configs (display unit ⇄ metric base) ──────────
    const isImperial = unitSystem === 'imperial';

    const weightSlider = useMemo<TransformationSliderConfig>(() => {
        const range = isImperial ? SLIDER_RANGES.weightLbs : SLIDER_RANGES.weightKg;
        return {
            min: range.min,
            max: range.max,
            step: range.step,
            value: Math.round(isImperial ? startWeightKg * CONVERSIONS.KG_TO_LBS : startWeightKg),
            onChange: (v: number) =>
                setStartWeightKg(isImperial ? v / CONVERSIONS.KG_TO_LBS : v),
        };
    }, [isImperial, startWeightKg]);

    const bodyFatSlider = useMemo<TransformationSliderConfig>(() => ({
        min: SLIDER_RANGES.bodyFatPct.min,
        max: SLIDER_RANGES.bodyFatPct.max,
        step: SLIDER_RANGES.bodyFatPct.step,
        value: Math.round(startBodyFatPct),
        onChange: setStartBodyFatPct,
    }), [startBodyFatPct]);

    const heightSlider = useMemo<TransformationSliderConfig>(() => {
        const range = isImperial ? SLIDER_RANGES.heightIn : SLIDER_RANGES.heightCm;
        return {
            min: range.min,
            max: range.max,
            step: range.step,
            value: Math.round(isImperial ? heightCm * CONVERSIONS.CM_TO_INCHES : heightCm),
            onChange: (v: number) =>
                setHeightCm(isImperial ? v / CONVERSIONS.CM_TO_INCHES : v),
        };
    }, [isImperial, heightCm]);

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

        // Live engine state (metric base) + derived
        startWeightKg,
        startBodyFatPct,
        heightCm,
        trainingAge,
        setTrainingAge,
        engineInput,
        projections,
        phaseAggregates,
        summary,
        isRecalculating,

        // Unit-aware slider configs (value + onChange in display units)
        weightSlider,
        bodyFatSlider,
        heightSlider,

        // Actions
        resetToDefaults,
        resetToIdeal,
    };
};
