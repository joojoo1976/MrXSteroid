import { useState, useMemo, useCallback, useDeferredValue } from 'react';
import { ContentStrings } from '@/shared/types/types';
import {
    projectBodyComposition,
    aggregatePhases,
    buildChartSeries,
    estimateCycleSummary,
    DEFAULT_HEIGHT_CM,
    type TrainingAge,
    type BodyCompositionInput,
    type WeeklyProjection,
    type PhaseAggregate,
    type CycleSummary,
} from '../lib/transformationEngine';

interface UseTransformationTimelineOptions {
    content: ContentStrings;
}

/**
 * Powers the Transformation Timeline with a live prediction engine.
 * Owns the computation inputs (start weight, body-fat %, training age)
 * and derives per-phase projections + chart series deterministically.
 */
export const useTransformationTimeline = ({ content }: UseTransformationTimelineOptions) => {
    const [activePhase, setActivePhase] = useState(0);

    // ── Live engine inputs (editable, metric base values) ──────────────
    const [startWeightKg, setStartWeightKg] = useState(80);
    const [startBodyFatPct, setStartBodyFatPct] = useState(18);
    const [heightCm, setHeightCm] = useState<number>(DEFAULT_HEIGHT_CM);
    const [trainingAge, setTrainingAge] = useState<TrainingAge>('intermediate');

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
    };
};
