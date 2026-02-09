import { useState, useMemo, useCallback } from 'react';
import { ContentStrings } from '../../../types';

interface UseTransformationTimelineOptions {
    content: ContentStrings;
}

export const useTransformationTimeline = ({ content }: UseTransformationTimelineOptions) => {
    const [activePhase, setActivePhase] = useState(0);

    const chartData = useMemo(() => {
        return content.timelinePhases.map(phase => ({
            week: phase.week,
            strength: phase.stats.strength,
            hypertrophy: phase.stats.hypertrophy,
            waterRetention: phase.stats.waterRetention,
            fatLoss: phase.stats.fatLoss,
            mood: phase.stats.mood,
        }));
    }, [content.timelinePhases]);

    const activeData = useMemo(() => {
        return content.timelinePhases[activePhase];
    }, [content.timelinePhases, activePhase]);

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
        activePhase,
        activeData,
        chartData,
        nextPhase,
        prevPhase,
        setPhase,
        totalPhases: content.timelinePhases.length
    };
};
