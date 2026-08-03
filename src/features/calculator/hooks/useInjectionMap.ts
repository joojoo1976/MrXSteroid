import { useState, useMemo, useCallback } from 'react';
import { ContentStrings, InjectionSite, Language } from '@/shared/types/types';
import { convertValue } from '../../../shared/lib/logic';

export interface Hotspot {
    id: string;
    name: string;
    side: 'front' | 'back';
    x: number;
    y: number;
    absorption: number;
    advice: string;
    icon: string;
    needle: string;
    volume: string;
    recoveryDays: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    warning?: string;
    steps?: string[];
    painLevel?: string;
    bestFor?: string;
    description?: string;

    // Deep Intelligence Anatomy Schema
    muscleType?: 'Small' | 'Medium' | 'Large';
    nearbyStructures?: string;
    landmarks?: string;
    needleSpecs?: string;
    needleGauge?: string;
    needleLengthInch?: number[];
    maxVolumeMl?: number;
    absorptionRate?: number;
    angleDepth?: string;
    rotationAdvice?: string;
    precautions?: string[];
}

const FIXED_FRONT_POINTS = [
    { id: 'delt_side_l', baseId: 'delt_side', x: 30.16, y: 21.85 },
    { id: 'delt_side_r', baseId: 'delt_side', x: 66.19, y: 21.59 },
    { id: 'pecs_l', baseId: 'pecs', x: 40.24, y: 21.59 },
    { id: 'pecs_r', baseId: 'pecs', x: 55.04, y: 21.2 },
    { id: 'pecs_lower_l', baseId: 'pecs_lower', x: 44.1, y: 24.83 },
    { id: 'pecs_lower_r', baseId: 'pecs_lower', x: 52.68, y: 25.74 },
    { id: 'biceps_l', baseId: 'biceps', x: 31.23, y: 28.47 },
    { id: 'biceps_r', baseId: 'biceps', x: 66.19, y: 29.64 },
    { id: 'glute_ventro_l', baseId: 'glute_ventro', x: 36.39, y: 44.11 },
    { id: 'glute_ventro_r', baseId: 'glute_ventro', x: 59.98, y: 44.24 },
    { id: 'quad_outer_l', baseId: 'quad_outer', x: 35.53, y: 55.02 },
    { id: 'quad_outer_r', baseId: 'quad_outer', x: 60.62, y: 53.98 },
];

const FIXED_BACK_POINTS = [
    { id: 'traps_l', baseId: 'traps', x: 42.38, y: 17.17 },
    { id: 'traps_r', baseId: 'traps', x: 54.82, y: 17.17 },
    { id: 'delt_rear_l', baseId: 'delt_rear', x: 35.09, y: 20.94 },
    { id: 'delt_rear_r', baseId: 'delt_rear', x: 61.47, y: 20.42 },
    { id: 'triceps_l', baseId: 'triceps', x: 30.59, y: 26.91 },
    { id: 'triceps_r', baseId: 'triceps', x: 64.9, y: 26.26 },
    { id: 'lats_l', baseId: 'lats', x: 38.52, y: 30.16 },
    { id: 'lats_r', baseId: 'lats', x: 58.04, y: 29.51 },
    { id: 'glute_dorso_l', baseId: 'glute_dorso', x: 40.02, y: 40.16 },
    { id: 'glute_dorso_r', baseId: 'glute_dorso', x: 55.89, y: 39.77 },
    { id: 'calves_l', baseId: 'calves', x: 39.38, y: 67.56 },
    { id: 'calves_r', baseId: 'calves', x: 58.04, y: 67.56 },
];

interface UseInjectionMapOptions {
    content: ContentStrings;
    unitSystem: 'metric' | 'imperial';
    language: string;
}

export const useInjectionMap = ({ content, unitSystem, language }: UseInjectionMapOptions) => {
    const [rotation, setRotation] = useState(0);
    const [activeSite, setActiveSite] = useState<Hotspot | null>(null);
    const [hoverSite, setHoverSite] = useState<Hotspot | null>(null);

    const isImperial = unitSystem === 'imperial';
    const lang = language as Language;
    const mapContent = content.injectionMap;
    const currentView = rotation <= 50 ? 'front' : 'back';

    const activeHotspots = useMemo(() => {
        if (mapContent.sites) {
            const sites = mapContent.sites;
            const findSite = (id: string) => sites.find(s => s.id === id);
            const result: Hotspot[] = [];
            const absorptionMap: Record<string, number> = {
                'glute_dorso': 98, 'delt_side': 95, 'quad_outer': 92, 'pecs': 88,
                'lats': 85, 'traps': 90, 'glute_ventro': 93, 'biceps': 82,
                'triceps': 84, 'calves': 78, 'forearms': 75, 'pecs_lower': 86,
                'delt_rear': 87
            };

            const getName = (data: InjectionSite, sideLabel: string) => `${data.name} (${sideLabel})`;
            const leftLabel = mapContent.labels?.left || "L";
            const rightLabel = mapContent.labels?.right || "R";

            FIXED_FRONT_POINTS.forEach(fixed => {
                const data = findSite(fixed.baseId);
                if (data) {
                    const abs = data.absorptionRate ?? absorptionMap[fixed.baseId] ?? 85;
                    const isRight = fixed.id.endsWith('_r');
                    result.push({
                        ...data,
                        id: fixed.id,
                        name: getName(data, isRight ? rightLabel : leftLabel),
                        side: 'front',
                        x: fixed.x,
                        y: fixed.y,
                        absorption: abs,
                        icon: data.icon || "💉",
                        riskLevel: data.riskLevel as 'Low' | 'Medium' | 'High',
                        advice: data.advice || "",
                        description: data.description || ""
                    });
                }
            });

            FIXED_BACK_POINTS.forEach(fixed => {
                const data = findSite(fixed.baseId);
                if (data) {
                    const abs = data.absorptionRate ?? absorptionMap[fixed.baseId] ?? 85;
                    const isRight = fixed.id.endsWith('_r');
                    result.push({
                        ...data,
                        id: fixed.id,
                        name: getName(data, isRight ? rightLabel : leftLabel),
                        side: 'back',
                        x: fixed.x,
                        y: fixed.y,
                        absorption: abs,
                        icon: data.icon || "💉",
                        riskLevel: data.riskLevel as 'Low' | 'Medium' | 'High',
                        advice: data.advice || "",
                        description: data.description || ""
                    });
                }
            });
            return result;
        }
        return [];
    }, [mapContent]);

    const dynamicStats = useMemo(() => {
        if (activeSite) {
            const baseAbs = activeSite.absorption || 85;
            const riskMap = { 'Low': 98, 'Medium': 75, 'High': 45 };
            const baseSafety = riskMap[activeSite.riskLevel] || 70;
            const volNum = parseFloat(activeSite.volume.match(/[0-9.]+/)?.[0] || "1.0");

            const convertedVol = isImperial ? convertValue(volNum, 'volume', 'imperial') : volNum;
            const displayVol = `${convertedVol.toFixed(isImperial ? 2 : 1)} ${isImperial ? 'oz' : 'ml'}`;

            const baseCells = Math.floor(volNum * 1250000 + 500000);

            return {
                absorption: baseAbs,
                safety: baseSafety,
                cells: baseCells.toLocaleString(),
                powerDesc: `${mapContent.featureCards?.power.desc.split('...')[0]} ${lang === 'ar' ? 'في' : 'in'} ${activeSite.name}`,
                tissueDesc: `${mapContent.featureCards?.tissue.desc.split('...')[0]} (${activeSite.bestFor || 'Hypertrophy'})`,
                burnDesc: `${mapContent.featureCards?.burn.desc.split('...')[0]} [${activeSite.riskLevel} Risk]`,
                displayVol
            };
        }
        return {
            absorption: Math.floor(rotation * 0.9 + 10),
            safety: 100 - Math.floor(rotation / 10),
            cells: (rotation * 12500 + 100000).toLocaleString(),
            powerDesc: mapContent.featureCards?.power.desc || "Within minutes...",
            tissueDesc: mapContent.featureCards?.tissue.desc || "Muscle fibers...",
            burnDesc: mapContent.featureCards?.burn.desc || "Metabolism spikes...",
            displayVol: ""
        };
    }, [activeSite, rotation, mapContent, lang, isImperial]);

    const handleRotationChange = useCallback((value: number) => {
        setRotation(value);
    }, []);

    return {
        rotation,
        setRotation: handleRotationChange,
        activeSite,
        setActiveSite,
        hoverSite,
        setHoverSite,
        currentView,
        activeHotspots,
        dynamicStats,
        isImperial,
    };
};