import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ContentStrings, DailyMeal } from '../../../types';
import { convertValue, toMetric } from '../../../shared/lib/logic';
import { foodDatabase } from '../constants/foodDatabase';

export interface CalcResult {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    bmr: number;
    tdee: number;
    bmi: number;
    bmiStatus: string;
    tef: number;
    growthPotential: number;
}

export interface MacroDataPoint {
    name: string;
    protein: number;
    carbs: number;
    fats: number;
}

export interface SimulationPoint {
    week: string;
    weight: number;
    efficiency: number;
}

interface UseMacroCalculatorOptions {
    content: ContentStrings;
    unitSystem: 'metric' | 'imperial';
}

export const useMacroCalculator = ({ content, unitSystem }: UseMacroCalculatorOptions) => {
    const isAr = false; // Remove dependency on content.lang
    const isImperial = unitSystem === 'imperial';

    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const [activity, setActivity] = useState('moderate');
    const [goal, setGoal] = useState('maintain');
    const [trainingTime, setTrainingTime] = useState('afternoon');
    const [result, setResult] = useState<CalcResult | null>(null);
    const [mealPlan, setMealPlan] = useState<DailyMeal[] | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [chartData, setChartData] = useState<MacroDataPoint[] | null>(null);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [simulationData, setSimulationData] = useState<SimulationPoint[] | null>(null);
    const [ecosystemSynced, setEcosystemSynced] = useState(false);
    const [showMealPlan, setShowMealPlan] = useState(false);

    const [baseWeight, setBaseWeight] = useState<number>(0);
    const [baseHeight, setBaseHeight] = useState<number>(0);
    const [lastUnitSystem, setLastUnitSystem] = useState(unitSystem);

    const normalizeNum = (str: string) => {
        return str.replace(/[٠-٩]/g, d => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)])
            .replace(/[۰-۹]/g, d => "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(d)]);
    };

    useEffect(() => {
        if (lastUnitSystem !== unitSystem) {
            setLastUnitSystem(unitSystem);
        }
    }, [unitSystem, lastUnitSystem]);

    useEffect(() => {
        if (lastUnitSystem !== unitSystem) {
            if (baseWeight > 0) {
                const displayVal = convertValue(baseWeight, 'weight', unitSystem);
                setWeight(displayVal.toFixed(1));
            }
            if (baseHeight > 0) {
                const displayVal = convertValue(baseHeight, 'height', unitSystem);
                setHeight(displayVal.toFixed(1));
            }
        }
    }, [unitSystem, lastUnitSystem, baseWeight, baseHeight]);

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

    const generateSimulation = useCallback((calories: number, currentGoal: string, currentWeight: string) => {
        const data = [];
        let weightTrend = parseFloat(normalizeNum(currentWeight));

        for (let i = 0; i <= 12; i++) {
            const variation = Math.random() * 0.5 - 0.25;
            const change = currentGoal === 'cut' ? -0.8 : currentGoal === 'bulk' ? 0.6 : 0.1;
            weightTrend += change + variation;
            data.push({
                week: `W${i}`,
                weight: parseFloat(weightTrend.toFixed(1)),
                efficiency: Math.round(85 + Math.random() * 10),
            });
        }
        setSimulationData(data);
    }, []);

    const calculate = useCallback(() => {
        const w = baseWeight;
        const h = baseHeight;
        const a = parseFloat(normalizeNum(age));

        if (!w || !h || !a) {
            toast.error(isAr ? "يرجى إدخال أرقام صحيحة في جميع الحقول" : "Please enter valid numbers in all fields");
            return;
        }

        setIsCalculating(true);
        setResult(null);

        setTimeout(() => {
            const calcW = w;
            const calcH = h;

            const bmr = 10 * calcW + 6.25 * calcH - 5 * a + (gender === 'male' ? 5 : -161);
            const multipliers: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };
            const tdee = bmr * multipliers[activity];
            const goals: Record<string, number> = { cut: 0.8, maintain: 1, bulk: 1.15 };
            const targetCalories = Math.round(tdee * goals[goal]);

            let protein = Math.round(calcW * 2.2);
            let fat = Math.round((targetCalories * 0.25) / 9);
            let carbs = Math.round((targetCalories - (protein * 4 + fat * 9)) / 4);

            if (carbs < 10) {
                carbs = Math.max(0, carbs);
                fat = Math.max(Math.round(calcW * 0.6), Math.round((targetCalories * 0.2) / 9));
                protein = Math.max(20, Math.round((targetCalories - (fat * 9) - (carbs * 4)) / 4));
            }

            const bmi = calcW / ((calcH / 100) * (calcH / 100));
            let bmiStatus = '';
            if (bmi < 18.5) bmiStatus = content.calcBmiStatuses.underweight;
            else if (bmi < 25) bmiStatus = content.calcBmiStatuses.healthy;
            else if (bmi < 30) bmiStatus = content.calcBmiStatuses.overweight;
            else bmiStatus = content.calcBmiStatuses.obese;

            const potential = 50 + (goal === 'bulk' ? 30 : 0) + (activity.includes('Active') ? 15 : 0);

            const newResult = {
                calories: isNaN(targetCalories) ? 0 : targetCalories,
                protein: isNaN(protein) ? 0 : protein,
                carbs: isNaN(carbs) ? 0 : carbs,
                fats: isNaN(fat) ? 0 : fat,
                bmr: isNaN(bmr) ? 0 : Math.round(bmr),
                tdee: isNaN(tdee) ? 0 : Math.round(tdee),
                bmi: isNaN(bmi) ? 0 : parseFloat(bmi.toFixed(1)),
                bmiStatus,
                tef: isNaN(targetCalories) ? 0 : Math.round(targetCalories * 0.1),
                growthPotential: isNaN(potential) ? 0 : Math.min(potential, 98)
            };

            setResult(newResult);
            setAiInsight(content.calcAiInsightText);
            generateSimulation(targetCalories, goal, weight);
            setIsCalculating(false);
            setMealPlan(null);

            window.dispatchEvent(new CustomEvent('macro_calculated', {
                detail: newResult
            }));

            setTimeout(() => setEcosystemSynced(true), 1000);
        }, 2000);
    }, [age, baseHeight, baseWeight, weight, activity, goal, gender, isAr, content, generateSimulation]);

    const generatePlan = useCallback(() => {
        if (!result) return;

        const meals: DailyMeal[] = [];
        const targetP = result.protein / 4;
        const targetC = result.carbs / 4;
        const targetF = result.fats / 4;

        content.calcMealNames.forEach((name) => {
            const pSource = foodDatabase.filter(f => f.type === 'protein')[Math.floor(Math.random() * foodDatabase.filter(f => f.type === 'protein').length)];
            const cSource = foodDatabase.filter(f => f.type === 'carb')[Math.floor(Math.random() * foodDatabase.filter(f => f.type === 'carb').length)];
            const fSource = foodDatabase.filter(f => f.type === 'fat')[Math.floor(Math.random() * foodDatabase.filter(f => f.type === 'fat').length)];

            const unit = isImperial ? "oz" : "g";
            const factor = isImperial ? 0.0352 : 1;

            const steps = [
                content.calcMealSteps.preheat,
                `${content.calcMealSteps.season} ${isAr ? pSource.nameAr : pSource.nameEn}`,
                `${content.calcMealSteps.cook} ${isAr ? pSource.nameAr : pSource.nameEn}`,
                `${content.calcMealSteps.prepare} ${isAr ? cSource.nameAr : cSource.nameEn}`,
                `${content.calcMealSteps.combine} ${isAr ? fSource.nameAr : fSource.nameEn}`
            ];

            meals.push({
                mealName: name,
                foods: [
                    { item: isAr ? pSource.nameAr : pSource.nameEn, amount: `${Math.round((targetP / pSource.p) * 100 * factor)}${unit}` },
                    { item: isAr ? cSource.nameAr : cSource.nameEn, amount: `${Math.round((targetC / cSource.c) * 100 * factor)}${unit}` },
                    { item: isAr ? fSource.nameAr : fSource.nameEn, amount: `${Math.round((targetF / fSource.f) * 100 * factor)}${unit}` },
                ],
                steps
            });
        });

        const mealData = content.calcMealNames.map((name, i) => {
            const variances = [0.88, 1.12, 1.0, 1.0];
            const v = variances[i];

            return {
                name,
                protein: Math.round((result.protein / 4) * v),
                carbs: Math.round((result.carbs / 4) * v),
                fats: Math.round((result.fats / 4) * v),
            };
        });

        setMealPlan(meals);
        setChartData(mealData);
    }, [result, content, isAr, isImperial]);

    return {
        weight,
        handleWeightChange,
        height,
        handleHeightChange,
        age,
        setAge,
        gender,
        setGender,
        activity,
        setActivity,
        goal,
        setGoal,
        trainingTime,
        setTrainingTime,
        result,
        mealPlan,
        isCalculating,
        chartData,
        aiInsight,
        simulationData,
        ecosystemSynced,
        showMealPlan,
        setShowMealPlan,
        calculate,
        generatePlan
    };
};
