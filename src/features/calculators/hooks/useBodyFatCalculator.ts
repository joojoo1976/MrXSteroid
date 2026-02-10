import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { ContentStrings, Page } from '../../../types';
import { convertValue, toMetric } from '../../../utils/logic';

export interface BodyFatResult {
    bodyFatPercentage: number;
    bodyFatMass: number;
    leanBodyMass: number;
    bmi: number;
    category: string;
}

interface UseBodyFatCalculatorOptions {
    content: ContentStrings;
    unitSystem: 'metric' | 'imperial';
}

export const useBodyFatCalculator = ({ content, unitSystem }: UseBodyFatCalculatorOptions) => {
    const isAr = false; // Remove dependency on content.lang
    const isImperial = unitSystem === 'imperial';

    const [gender, setGender] = useState('male');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [waist, setWaist] = useState('');
    const [hip, setHip] = useState('');
    const [neck, setNeck] = useState('');
    const [result, setResult] = useState<BodyFatResult | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [ecosystemSynced, setEcosystemSynced] = useState(false);

    const [baseWeight, setBaseWeight] = useState<number>(0);
    const [baseHeight, setBaseHeight] = useState<number>(0);
    const [baseWaist, setBaseWaist] = useState<number>(0);
    const [baseHip, setBaseHip] = useState<number>(0);
    const [baseNeck, setBaseNeck] = useState<number>(0);

    const [lastUnitSystem, setLastUnitSystem] = useState(unitSystem);

    const normalizeNum = (str: string) => {
        return str.replace(/[٠-٩]/g, d => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)])
            .replace(/[۰-۹]/g, d => "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(d)]);
    };

    useEffect(() => {
        if (lastUnitSystem !== unitSystem) {
            setLastUnitSystem(unitSystem);
            if (baseWeight > 0) {
                const displayVal = convertValue(baseWeight, 'weight', unitSystem);
                setWeight(displayVal.toFixed(1));
            }
            if (baseHeight > 0) {
                const displayVal = convertValue(baseHeight, 'height', unitSystem);
                setHeight(displayVal.toFixed(1));
            }
            if (baseWaist > 0) {
                const displayVal = convertValue(baseWaist, 'length', unitSystem);
                setWaist(displayVal.toFixed(1));
            }
            if (baseHip > 0) {
                const displayVal = convertValue(baseHip, 'length', unitSystem);
                setHip(displayVal.toFixed(1));
            }
            if (baseNeck > 0) {
                const displayVal = convertValue(baseNeck, 'length', unitSystem);
                setNeck(displayVal.toFixed(1));
            }
        }
    }, [unitSystem, lastUnitSystem, baseWeight, baseHeight, baseWaist, baseHip, baseNeck]);

    const handleWeightChange = (val: string) => {
        setWeight(val);
        const num = parseFloat(normalizeNum(val));
        if (!isNaN(num)) {
            setBaseWeight(isImperial ? toMetric(num, 'weight') : num);
        }
    };

    const handleHeightChange = (val: string) => {
        setHeight(val);
        const num = parseFloat(normalizeNum(val));
        if (!isNaN(num)) {
            setBaseHeight(isImperial ? toMetric(num, 'height') : num);
        }
    };

    const handleWaistChange = (val: string) => {
        setWaist(val);
        const num = parseFloat(normalizeNum(val));
        if (!isNaN(num)) {
            setBaseWaist(isImperial ? toMetric(num, 'length') : num);
        }
    };

    const handleHipChange = (val: string) => {
        setHip(val);
        const num = parseFloat(normalizeNum(val));
        if (!isNaN(num)) {
            setBaseHip(isImperial ? toMetric(num, 'length') : num);
        }
    };

    const handleNeckChange = (val: string) => {
        setNeck(val);
        const num = parseFloat(normalizeNum(val));
        if (!isNaN(num)) {
            setBaseNeck(isImperial ? toMetric(num, 'length') : num);
        }
    };

    const calculate = useCallback(() => {
        const a = parseFloat(normalizeNum(age));
        const w = baseWeight;
        const h = baseHeight;
        const wi = baseWaist;
        const hi = baseHip;
        const n = baseNeck;

        if (!a || !w || !h || !wi || !n || (gender === 'female' && !hi)) {
            toast.error(isAr ? "يرجى إدخال جميع القيم المطلوبة" : "Please enter all required values");
            return;
        }

        setIsCalculating(true);
        setResult(null);

        setTimeout(() => {
            let bodyFatPercentage: number;

            if (gender === 'male') {
                bodyFatPercentage = 495 / (1.20 * (wi / 100) + 0.23 * a - 0.10 * (n / 100) - 5.4) - 450;
            } else {
                bodyFatPercentage = 495 / (1.20 * (wi / 100) + 0.23 * a - 0.10 * (n / 100) - 0.20 * (hi / 100) - 5.4) - 450;
            }

            bodyFatPercentage = Math.max(0, Math.min(100, bodyFatPercentage));

            const bodyFatMass = (w * bodyFatPercentage) / 100;
            const leanBodyMass = w - bodyFatMass;
            const bmi = w / ((h / 100) * (h / 100));

            let category: string;
            if (gender === 'male') {
                if (bodyFatPercentage < 6) category = content.bfCategories.essential;
                else if (bodyFatPercentage < 13) category = content.bfCategories.athletes;
                else if (bodyFatPercentage < 17) category = content.bfCategories.fitness;
                else if (bodyFatPercentage < 25) category = content.bfCategories.average;
                else category = content.bfCategories.obese;
            } else {
                if (bodyFatPercentage < 16) category = content.bfCategories.essential;
                else if (bodyFatPercentage < 23) category = content.bfCategories.athletes;
                else if (bodyFatPercentage < 28) category = content.bfCategories.fitness;
                else if (bodyFatPercentage < 35) category = content.bfCategories.average;
                else category = content.bfCategories.obese;
            }

            setResult({
                bodyFatPercentage: parseFloat(bodyFatPercentage.toFixed(1)),
                bodyFatMass: parseFloat(bodyFatMass.toFixed(1)),
                leanBodyMass: parseFloat(leanBodyMass.toFixed(1)),
                bmi: parseFloat(bmi.toFixed(1)),
                category
            });

            window.dispatchEvent(new CustomEvent('bodyfat_calculated', {
                detail: {
                    bodyFatPercentage: parseFloat(bodyFatPercentage.toFixed(1)),
                    leanBodyMass: parseFloat(leanBodyMass.toFixed(1)),
                    bmi: parseFloat(bmi.toFixed(1)),
                    category
                }
            }));

            setIsCalculating(false);
            setTimeout(() => setEcosystemSynced(true), 1000);
        }, 1500);
    }, [age, baseWeight, baseHeight, baseWaist, baseHip, baseNeck, gender, isAr, content.bfCategories]);

    const getCategoryColor = () => {
        if (!result) return 'text-gold-500';
        if (gender === 'male') {
            if (result.bodyFatPercentage < 13) return 'text-green-500';
            if (result.bodyFatPercentage < 17) return 'text-yellow-500';
            if (result.bodyFatPercentage < 25) return 'text-orange-500';
            return 'text-red-500';
        } else {
            if (result.bodyFatPercentage < 23) return 'text-green-500';
            if (result.bodyFatPercentage < 28) return 'text-yellow-500';
            if (result.bodyFatPercentage < 35) return 'text-orange-500';
            return 'text-red-500';
        }
    };

    const getCategoryDescription = () => {
        if (!result) return '';
        const desc = gender === 'male' ? content.bfCategoryDescriptions.male : content.bfCategoryDescriptions.female;

        if (gender === 'male') {
            if (result.bodyFatPercentage < 13) return desc.athletes;
            if (result.bodyFatPercentage < 25) return desc.average;
            return desc.obese;
        } else {
            if (result.bodyFatPercentage < 23) return desc.athletes;
            if (result.bodyFatPercentage < 35) return desc.average;
            return desc.obese;
        }
    };

    return {
        gender,
        setGender,
        age,
        setAge,
        weight,
        handleWeightChange,
        height,
        handleHeightChange,
        waist,
        handleWaistChange,
        hip,
        handleHipChange,
        neck,
        handleNeckChange,
        result,
        isCalculating,
        ecosystemSynced,
        calculate,
        getCategoryColor,
        getCategoryDescription
    };
};
