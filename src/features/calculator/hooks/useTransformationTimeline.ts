import { useState, useMemo, useCallback } from 'react';
import { ContentStrings } from '@/shared/types/types';
import {
    projectBodyComposition,
    aggregatePhases,
    buildChartSeries,
    type TrainingAge,
    type BodyCompositionInput,
    type WeeklyProjection,
    type PhaseAggregate,
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
    const [trainingAge, setTrainingAge] = useState<TrainingAge>('intermediate');

    const engineInput = useMemo<BodyCompositionInput>(() => ({
        startWeightKg,
        startBodyFatPct,
        trainingAge,
    }), [startWeightKg, startBodyFatPct, trainingAge]);

    // ── Deterministic projections (pure math) ───────────────────────────
    const projections = useMemo<WeeklyProjection[]>(
        () => projectBodyComposition(engineInput),
        [engineInput],
    );

    const phaseAggregates = useMemo<PhaseAggregate[]>(
        () => aggregatePhases(engineInput),
        [engineInput],
    );

    // Chart series — merges the classic stat bars with live projections.
    const chartData = useMemo(
        () => buildChartSeries(content.timelinePhases, projections, phaseAggregates),
        [content.timelinePhases, projections, phaseAggregates],
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
        trainingAge,
        setTrainingAge,
        engineInput,
        projections,
        phaseAggregates,
    };
};
