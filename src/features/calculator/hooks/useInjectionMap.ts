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
}

const FIXED_FRONT_POINTS = [
    { id: 'delt_side_l', baseId: 'delt_side', x: 28, y: 26 },
    { id: 'delt_side_r', baseId: 'delt_side', x: 69, y: 26 },
    { id: 'pecs_l', baseId: 'pecs', x: 38, y: 29 },
    { id: 'pecs_r', baseId: 'pecs', x: 60, y: 30 },
    { id: 'pecs_lower_l', baseId: 'pecs_lower', x: 46, y: 27 },
    { id: 'pecs_lower_r', baseId: 'pecs_lower', x: 51, y: 28 },
    { id: 'biceps_l', baseId: 'biceps', x: 30, y: 33 },
    { id: 'biceps_r', baseId: 'biceps', x: 66, y: 33 },
    { id: 'glute_ventro_l', baseId: 'glute_ventro', x: 34, y: 50 },
    { id: 'glute_ventro_r', baseId: 'glute_ventro', x: 63, y: 50 },
    { id: 'quad_outer_l', baseId: 'quad_outer', x: 34, y: 62 },
    { id: 'quad_outer_r', baseId: 'quad_outer', x: 62, y: 62 },
];

const FIXED_BACK_POINTS = [
    { id: 'traps_l', baseId: 'traps', x: 35, y: 23 },
    { id: 'traps_r', baseId: 'traps', x: 60, y: 23 },
    { id: 'delt_rear_l', baseId: 'delt_rear', x: 29, y: 31 },
    { id: 'delt_rear_r', baseId: 'delt_rear', x: 67, y: 30 },
    { id: 'triceps_l', baseId: 'triceps', x: 45, y: 31 },
    { id: 'triceps_r', baseId: 'triceps', x: 51, y: 31 },
    { id: 'lats_l', baseId: 'lats', x: 37, y: 33 },
    { id: 'lats_r', baseId: 'lats', x: 58, y: 33 },
    { id: 'glute_dorso_l', baseId: 'glute_dorso', x: 40, y: 48 },
    { id: 'glute_dorso_r', baseId: 'glute_dorso', x: 58, y: 47 },
    { id: 'calves_l', baseId: 'calves', x: 35, y: 81 },
    { id: 'calves_r', baseId: 'calves', x: 58, y: 81 },
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
                    const abs = absorptionMap[fixed.baseId] || 85;
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
                    const abs = absorptionMap[fixed.baseId] || 85;
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
        isImperial
    };
};
