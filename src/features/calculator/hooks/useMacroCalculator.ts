import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { ContentStrings, DailyMeal } from '@/shared/types/types';
import { convertValue, toMetric } from '../../../shared/lib/logic';
import { foodDatabase } from '../constants/foodDatabase';
import { usePreferences } from '../../../context/PreferencesContext';

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
    const { language } = usePreferences();
    const isAr = language === 'ar';
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

    const normalizeNum = (str: string) => {
        if (!str) return '';
        return str.replace(/[٠-٩]/g, d => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)])
            .replace(/[۰-۹]/g, d => "0123456789"["۰۱۲۳۴۵۶Typed".indexOf(d)]);
    };

    // مزامنة وتحديث قيم المدخلات الحرة والنتائج عند تغيير نظام الوحدات (متري/إمبراطوري)
    useEffect(() => {
        if (baseWeight > 0) {
            const displayVal = convertValue(baseWeight, 'weight', unitSystem);
            // استخدام التقريب لأقرب رقم صحيح لإزالة كسر (.0) العائق وجعل الإدخال حراً ومريحاً
            setWeight(Math.round(displayVal).toString());
        }
        if (baseHeight > 0) {
            const displayVal = convertValue(baseHeight, 'height', unitSystem);
            setHeight(Math.round(displayVal).toString());
        }

        // تحديث المخططات الحية والتوقعات وخطة الوجبات تلقائياً بناءً على النظام المحدد
        if (result) {
            const weeklyChangeKg = goal === 'cut' ? -0.5 : goal === 'bulk' ? 0.25 : 0.05;
            let weightTrendKg = baseWeight || 80;
            const simPoints: SimulationPoint[] = [];
            for (let i = 0; i <= 12; i++) {
                const variation = (Math.random() * 0.3 - 0.15);
                weightTrendKg += weeklyChangeKg + variation;
                const displayW = unitSystem === 'imperial' ? weightTrendKg * 2.20462262 : weightTrendKg;
                simPoints.push({
                    week: `W${i}`,
                    weight: Math.round(displayW),
                    efficiency: Math.round(85 + Math.random() * 10),
                });
            }
            setSimulationData(simPoints);

            const updatedMeals: DailyMeal[] = [];
            const targetP = result.protein / 4;
            const targetC = result.carbs / 4;
            const targetF = result.fats / 4;
            const unit = unitSystem === 'imperial' ? "oz" : "g";
            const factor = unitSystem === 'imperial' ? 0.035274 : 1;

            content.calcMealNames.forEach((name) => {
                const pSource = foodDatabase.filter(f => f.type === 'protein')[Math.floor(Math.random() * foodDatabase.filter(f => f.type === 'protein').length)];
                const cSource = foodDatabase.filter(f => f.type === 'carb')[Math.floor(Math.random() * foodDatabase.filter(f => f.type === 'carb').length)];
                const fSource = foodDatabase.filter(f => f.type === 'fat')[Math.floor(Math.random() * foodDatabase.filter(f => f.type === 'fat').length)];

                const steps = [
                    content.calcMealSteps.preheat,
                    `${content.calcMealSteps.season} ${isAr ? pSource.nameAr : pSource.nameEn}`,
                    `${content.calcMealSteps.cook} ${isAr ? pSource.nameAr : pSource.nameEn}`,
                    `${content.calcMealSteps.prepare} ${isAr ? cSource.nameAr : cSource.nameEn}`,
                    `${content.calcMealSteps.combine} ${isAr ? fSource.nameAr : fSource.nameEn}`
                ];

                updatedMeals.push({
                    mealName: name,
                    foods: [
                        { item: isAr ? pSource.nameAr : pSource.nameEn, amount: `${Math.round((targetP / pSource.p) * 100 * factor)}${unit}` },
                        { item: isAr ? cSource.nameAr : cSource.nameEn, amount: `${Math.round((targetC / cSource.c) * 100 * factor)}${unit}` },
                        { item: isAr ? fSource.nameAr : fSource.nameEn, amount: `${Math.round((targetF / fSource.f) * 100 * factor)}${unit}` },
                    ],
                    steps
                });
            });
            setMealPlan(updatedMeals);
        }
    }, [unitSystem, baseWeight, baseHeight]);

    const handleWeightChange = (val: string) => {
        setWeight(val);
        if (val === '') {
            setBaseWeight(0);
            return;
        }
        const cleanVal = normalizeNum(val);
        const num = parseFloat(cleanVal);
        if (!isNaN(num)) {
            setBaseWeight(isImperial ? toMetric(num, 'weight') : num);
        } else {
            setBaseWeight(0);
        }
    };

    const handleHeightChange = (val: string) => {
        setHeight(val);
        if (val === '') {
            setBaseHeight(0);
            return;
        }
        const cleanVal = normalizeNum(val);
        const num = parseFloat(cleanVal);
        if (!isNaN(num)) {
            setBaseHeight(isImperial ? toMetric(num, 'height') : num);
        } else {
            setBaseHeight(0);
        }
    };

    const generateSimulation = useCallback((calories: number, currentGoal: string, _currentWeight: string) => {
        const weeklyChangeKg = currentGoal === 'cut' ? -0.5 : currentGoal === 'bulk' ? 0.25 : 0.05;
        let weightTrendKg = baseWeight || 80;

        const data = [];
        for (let i = 0; i <= 12; i++) {
            const variation = (Math.random() * 0.3 - 0.15);
            weightTrendKg += weeklyChangeKg + variation;
            const displayWeight = isImperial ? weightTrendKg * 2.20462262 : weightTrendKg;
            data.push({
                week: `W${i}`,
                weight: Math.round(displayWeight),
                efficiency: Math.round(85 + Math.random() * 10),
            });
        }
        setSimulationData(data);
    }, [baseWeight, isImperial]);

    const calculate = useCallback(() => {
        const w = baseWeight;
        const h = baseHeight;
        const cleanAge = normalizeNum(age);
        const a = parseFloat(cleanAge);

        if (!w || !h || !a || isNaN(w) || isNaN(h) || isNaN(a)) {
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
            
            // حساب وإعداد البيانات الأيضية للمحاكاة الأسبوعية
            const weeklyChangeKg = goal === 'cut' ? -0.5 : goal === 'bulk' ? 0.25 : 0.05;
            let weightTrendKg = calcW;
            const simPoints = [];
            for (let i = 0; i <= 12; i++) {
                const variation = (Math.random() * 0.3 - 0.15);
                weightTrendKg += weeklyChangeKg + variation;
                const displayWeight = isImperial ? weightTrendKg * 2.20462262 : weightTrendKg;
                simPoints.push({
                    week: `W${i}`,
                    weight: Math.round(displayWeight),
                    efficiency: Math.round(85 + Math.random() * 10),
                });
            }
            setSimulationData(simPoints);

            // إعداد وتوزيع الماكروز اليومي
            const mealData = content.calcMealNames.map((name, i) => {
                const variances = [0.88, 1.12, 1.0, 1.0];
                const v = variances[i];

                return {
                    name,
                    protein: Math.round((newResult.protein / 4) * v),
                    carbs: Math.round((newResult.carbs / 4) * v),
                    fats: Math.round((newResult.fats / 4) * v),
                };
            });
            setChartData(mealData);

            // خطة الوجبات بمقادير الوحدة الحالية
            const meals: DailyMeal[] = [];
            const targetP = newResult.protein / 4;
            const targetC = newResult.carbs / 4;
            const targetF = newResult.fats / 4;
            const unit = isImperial ? "oz" : "g";
            const factor = isImperial ? 0.035274 : 1;

            content.calcMealNames.forEach((name) => {
                const pSource = foodDatabase.filter(f => f.type === 'protein')[Math.floor(Math.random() * foodDatabase.filter(f => f.type === 'protein').length)];
                const cSource = foodDatabase.filter(f => f.type === 'carb')[Math.floor(Math.random() * foodDatabase.filter(f => f.type === 'carb').length)];
                const fSource = foodDatabase.filter(f => f.type === 'fat')[Math.floor(Math.random() * foodDatabase.filter(f => f.type === 'fat').length)];

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
            setMealPlan(meals);

            setIsCalculating(false);

            window.dispatchEvent(new CustomEvent('macro_calculated', {
                detail: newResult
            }));

            setTimeout(() => setEcosystemSynced(true), 1000);
        }, 2000);
    }, [age, baseHeight, baseWeight, weight, activity, goal, gender, isAr, content, generateSimulation, isImperial]);

    const generatePlan = useCallback(() => {
        // يتم التوليد التلقائي داخل calculate أو useEffect
    }, []);

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
