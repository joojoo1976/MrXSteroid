import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ContentStrings } from '@/shared/types/types';
import { convertValue, toMetric } from '../../../shared/lib/logic';
import { saveCalculatorResult } from '../../../shared/lib/calculator-history';

export interface GeneticResult {
    natural: number;
    enhanced: number;
    type: string;
    ffmi: number;
    normalizedFfmi: number;
    goldenRatio: number;
    physiqueScore: number;
    potentials: { name: string; current: number; potential: number; unit: string }[];
}

interface UseGeneticPotentialOptions {
    content: ContentStrings;
    unitSystem: 'metric' | 'imperial';
    isRTL: boolean;
}

export const useGeneticPotential = ({ content, unitSystem, isRTL }: UseGeneticPotentialOptions) => {
    const isImperial = unitSystem === 'imperial';

    const [formData, setFormData] = useState({
        height: '',
        wrist: '',
        ankle: '',
        bodyFat: '12',
        shoulders: '',
        chest: '',
        waist: '',
        thigh: '',
        calf: ''
    });

    const [baseMeasurements, setBaseMeasurements] = useState<Record<string, number>>({});
    const [result, setResult] = useState<GeneticResult | null>(null);

    const [prevSyncUnitSystem, setPrevSyncUnitSystem] = useState(unitSystem);

    const normalizeNum = (val: string) => {
        return val
            .replace(/[٠-٩]/g, d => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)])
            .replace(/[۰-۹]/g, d => "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(d)]);
    };

    // Derived state pattern
    if (prevSyncUnitSystem !== unitSystem) {
        setPrevSyncUnitSystem(unitSystem);

        const updatedForm = { ...formData };
        let hasUpdates = false;

        Object.keys(baseMeasurements).forEach(key => {
            const baseValue = baseMeasurements[key];
            if (baseValue) {
                updatedForm[key as keyof typeof formData] = convertValue(baseValue, 'height', unitSystem).toFixed(1);
                hasUpdates = true;
            }
        });

        if (hasUpdates) {
            setFormData(updatedForm);
        }
    }

    const handleInputChange = (key: keyof typeof formData, val: string) => {
        const newForm = { ...formData, [key]: val };
        setFormData(newForm);

        if (key !== 'bodyFat') {
            const num = parseFloat(normalizeNum(val));
            if (!isNaN(num)) {
                setBaseMeasurements(prev => ({
                    ...prev,
                    [key]: unitSystem === 'imperial' ? toMetric(num, 'height') : num
                }));
            }
        }
    };

    const calculate = useCallback(() => {
        const h = baseMeasurements.height || 0;
        const w = baseMeasurements.wrist || 0;
        const a = baseMeasurements.ankle || 0;
        const curChest = baseMeasurements.chest || 0;
        const curShoulders = baseMeasurements.shoulders || 0;
        const curWaist = baseMeasurements.waist || 0;

        const bf = parseFloat(formData.bodyFat) || 12;

        if (!h || !w || !a) {
            toast.error(isRTL ? "يرجى إدخال الطول ومعصم اليد والكاحل للمتابعة" : "Please enter Height, Wrist, and Ankle to proceed");
            return;
        }

        const hIn = h / 2.54;
        const wIn = w / 2.54;
        const aIn = a / 2.54;
        const hM = h / 100;

        const maxWeightPounds = Math.pow(hIn, 1.5) * (
            (Math.sqrt(wIn) / 21.0) +
            (Math.sqrt(aIn) / 15.0)
        ) * (1 + (bf - 8) / 100);

        const naturalWeight = isImperial ? maxWeightPounds : maxWeightPounds * 0.453592;
        const enhancedWeight = naturalWeight * 1.35;

        const naturalPotentials = {
            chest: (hIn * 0.62) * (isImperial ? 1 : 2.54),
            shoulders: (hIn * 0.75) * (isImperial ? 1 : 2.54),
            waist: (hIn * 0.42) * (isImperial ? 1 : 2.54),
            thigh: (aIn * 2.85) * (isImperial ? 1 : 2.54),
            calf: (aIn * 1.95) * (isImperial ? 1 : 2.54),
            arm: (wIn * 2.5) * (isImperial ? 1 : 2.54)
        };

        const potentialLeanMassKg = (isImperial ? maxWeightPounds / 2.20462 : naturalWeight) * (1 - bf / 100);
        const ffmi = potentialLeanMassKg / (hM * hM);
        const normalizedFfmi = ffmi + 6.1 * (1.8 - hM);

        const potentialShoulderWaist = naturalPotentials.shoulders / naturalPotentials.waist;

        const ffmiScore = Math.min((normalizedFfmi / 25) * 100, 100);
        const structureScore = 100 - (Math.abs(1.618 - potentialShoulderWaist) * 100);
        const physiqueScore = (ffmiScore * 0.6) + (structureScore * 0.4);

        let type = content.geneticCalculator.bodyTypes.meso;
        const radio = wIn / hIn;
        if (radio < 0.10) type = content.geneticCalculator.bodyTypes.ecto;
        else if (radio > 0.115) type = content.geneticCalculator.bodyTypes.endo;

        // Display conversion: baseMeasurements is always metric (cm)
        // Convert to display unit if imperial
        const toDisplay = (cm: number) => isImperial ? parseFloat((cm / 2.54).toFixed(1)) : cm;
        const thighRaw = parseFloat(normalizeNum(formData.thigh)) || 0;
        const calfRaw = parseFloat(normalizeNum(formData.calf)) || 0;
        // thigh/calf are stored as display values (not in baseMeasurements), use as-is
        // but they are entered in the current unit system, so no conversion needed here

        const geneticResult: GeneticResult = {
            natural: Math.round(naturalWeight),
            enhanced: Math.round(enhancedWeight),
            type,
            ffmi: normalizedFfmi,
            normalizedFfmi: normalizedFfmi,
            goldenRatio: potentialShoulderWaist,
            physiqueScore: Math.round(physiqueScore),
            potentials: [
                { name: content.geneticCalculator.labels.chest, current: toDisplay(curChest), potential: naturalPotentials.chest, unit: isImperial ? 'in' : 'cm' },
                { name: content.geneticCalculator.labels.shoulders, current: toDisplay(curShoulders), potential: naturalPotentials.shoulders, unit: isImperial ? 'in' : 'cm' },
                { name: content.geneticCalculator.labels.waist, current: toDisplay(curWaist), potential: naturalPotentials.waist, unit: isImperial ? 'in' : 'cm' },
                { name: content.geneticCalculator.labels.thigh, current: thighRaw, potential: naturalPotentials.thigh, unit: isImperial ? 'in' : 'cm' },
                { name: content.geneticCalculator.labels.calf, current: calfRaw, potential: naturalPotentials.calf, unit: isImperial ? 'in' : 'cm' },
            ]
        };

        setResult(geneticResult);

        // Auto-save assessment to the user's calculator history
        saveCalculatorResult({
            tool: 'genetic',
            title: isRTL ? 'حاسبة الإمكانات الجينية' : 'Genetic Potential Calculator',
            inputs: { height: h, wrist: w, ankle: a, bodyFat: bf, unitSystem },
            result: geneticResult as unknown as Record<string, unknown>,
        });
    }, [baseMeasurements, formData, content, isImperial, isRTL, unitSystem]);

    const reset = useCallback(() => {
        setFormData({ height: '', wrist: '', ankle: '', bodyFat: '12', shoulders: '', chest: '', waist: '', thigh: '', calf: '' });
        setResult(null);
    }, []);

    return {
        formData,
        setFormData,
        handleInputChange,
        result,
        calculate,
        reset
    };
};
