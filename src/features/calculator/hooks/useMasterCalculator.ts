import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../shared/lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { Json } from '../../../shared/types/db_types';
import { FormulaEngine, FormulaResult } from '../services/formulaEngine';
import { usePreferences } from '../../../context/PreferencesContext';

export type CalculationGoal = 'bulking' | 'cutting' | 'trt' | 'sports';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'pro';
export type BudgetLevel = 'low' | 'medium' | 'high';
export type UnitSystem = 'metric' | 'imperial';

export interface CalculationState {
    goal: CalculationGoal;
    substance: string;
    experience: ExperienceLevel;
    weight: number;
    age: number;
    budget: BudgetLevel;
    unitSystem: UnitSystem;
}

export interface CalculationResult extends FormulaResult {
    intensityFactor: number;
    targetSubstance: string;
    timestamp: string;
}

export const useMasterCalculator = () => {
    const { user } = useAuth();
    const { language, currency } = usePreferences();
    const [state, setState] = useState<CalculationState>({
        goal: 'bulking',
        substance: 'test_e',
        experience: 'beginner',
        weight: 85,
        age: 30,
        budget: 'medium',
        unitSystem: 'metric'
    });

    const [result, setResult] = useState<CalculationResult | null>(null);
    const [advice, setAdvice] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // 1. Hydrate User Data from Supabase
    useEffect(() => {
        const hydrate = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('user_history')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('tool_type', 'master')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data && !error) {
                    setState(data.inputs as unknown as CalculationState);
                    setResult(data.results as unknown as CalculationResult);
                }
            } catch {
                console.debug("No previous session found.");
            } finally {
                setIsLoading(false);
            }
        };
        hydrate();
    }, [user]);

    // 2. Persist to Supabase
    const persistResult = useCallback(async (inputs: CalculationState, results: CalculationResult) => {
        if (!user) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from('user_history').insert({
                user_id: user.id,
                tool_type: 'master',
                inputs: inputs as unknown as Json,
                results: results as unknown as Json,
                goal: inputs.goal,
                intensity_factor: results.intensityFactor || 1.0,
                currency: currency,
                language: language
            });
            if (error) throw error;
        } catch (error) {
            console.error("Persistence failed:", error);
        } finally {
            setIsSaving(false);
        }
    }, [user, language, currency]);

    // 3. AI Advice Engine
    const generateAdvice = useCallback((inputs: CalculationState, _results: CalculationResult) => {
        const templates = {
            bulking: [
                "Your anabolic window is peak. Focus on a surplus of 300-500 kcal to maximize this protocol.",
                "With your weight of {weight}{unit}, hydration is critical to prevent kidney stress from {substance}.",
                "Anabolic potential is high, but monitor BP weekly due to your {experience} level intensity.",
                "Budget Note: {budget_advice}"
            ],
            cutting: [
                "Protective tissue maintenance is active. Keep protein high to prevent muscle wasting.",
                "Oxidation rates are optimized for fat loss. Cardio should be kept at LISS for longevity.",
                "Warning: Low body fat + {substance} can increase joint sensitivity. Monitor closely.",
                "Budget Note: {budget_advice}"
            ],
            trt: [
                "Optimization protocol stable. This is for wellness and hormonal balance.",
                "Hormonal baseline should be checked after 6 weeks to confirm target levels.",
                "Focus on SHBG management to maximize the bioavailable portion of this dose.",
                "Budget Note: {budget_advice}"
            ],
            sports: [
                "Endurance and recovery are the primary drivers for this athletic stack.",
                "Hematocrit levels must be monitored via blood work to ensure safe blood viscosity.",
                "Performance output will likely peak in week 4 of this protocol.",
                "Budget Note: {budget_advice}"
            ]
        };

        const budgetAdvice = {
            low: "Focus on primary compounds with high purity rather than complexity. Quality > Quantity.",
            medium: "Standard protocol. Balanced ancillary drugs (AIs/PCT) are included for safety.",
            high: "Premium optimization active. Includes advanced support compounds for maximum synergy."
        };

        const list = templates[inputs.goal] || templates.bulking;
        const randomTemplate = list[Math.floor(Math.random() * list.length)];

        const unitLabel = inputs.unitSystem === 'metric' ? 'kg' : 'lbs';
        const finalAdvice = randomTemplate
            .replace("{weight}", inputs.weight.toString())
            .replace("{unit}", unitLabel)
            .replace("{substance}", inputs.substance.split('_').join(' ').toUpperCase())
            .replace("{experience}", inputs.experience)
            .replace("{budget_advice}", budgetAdvice[inputs.budget]);

        setAdvice(finalAdvice);
    }, []);

    // 4. Calculation Logic
    const runCalculation = useCallback(async () => {
        // Convert weight to kg for formula if imperial
        const weightKg = state.unitSystem === 'metric'
            ? state.weight
            : state.weight * 0.453592;

        const weights = FormulaEngine.getCompoundWeights(state.goal, state.experience, weightKg, state.budget);
        const safetyCap = state.goal === 'trt' ? 250 : 1200;

        const calc = FormulaEngine.calculate(weights, safetyCap);

        const finalResults: CalculationResult = {
            ...calc,
            intensityFactor: weights.intensityFactor,
            targetSubstance: state.substance,
            timestamp: new Date().toISOString()
        };

        setResult(finalResults);
        generateAdvice(state, finalResults);

        if (user) {
            await persistResult(state, finalResults);
        }
    }, [state, user, persistResult, generateAdvice]);

    // Auto-calculate on changes
    useEffect(() => {
        const timer = setTimeout(() => {
            runCalculation();
        }, 500);
        return () => clearTimeout(timer);
    }, [runCalculation]);

    return {
        state,
        setState,
        result,
        advice,
        isLoading,
        isSaving,
        runCalculation
    };
};
