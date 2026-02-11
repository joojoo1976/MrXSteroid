
import { synthesizeToolResult } from './contextOptimization';

/**
 * Mr. X Tool Synthesizer
 * Formats complex tool outputs (Macro, Body Fat, etc.) into 
 * elite, context-efficient summaries for the AI coordinator.
 */

interface MacroResult {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    bmi: number;
    bmiStatus: string;
    growthPotential: number;
}

interface BodyFatResult {
    bodyFatPercentage: number;
    leanBodyMass: number;
    bmi: number;
    category: string;
}

export const synthesizeMacroResult = (result: MacroResult, isRTL: boolean = false): string => {
    const data = {
        calories: result.calories,
        macros: `P: ${result.protein}g, C: ${result.carbs}g, F: ${result.fats}g`,
        bmi: `${result.bmi} (${result.bmiStatus})`,
        anabolic_potential: `${result.growthPotential}%`
    };
    return synthesizeToolResult('MacroCalculator', data, isRTL);
};

export const synthesizeBodyFatResult = (result: BodyFatResult, isRTL: boolean = false): string => {
    const data = {
        bf_percentage: `${result.bodyFatPercentage}%`,
        category: result.category,
        lbm: `${result.leanBodyMass}kg`,
        bmi: result.bmi
    };
    return synthesizeToolResult('BodyFatCalculator', data, isRTL);
};

interface GeneticPotentialResult {
    maxLeanMass?: number;
    currentPotential?: number;
    limitStatus?: string;
    [key: string]: unknown;
}

export const synthesizeGeneticPotential = (result: GeneticPotentialResult, isRTL: boolean = false): string => {
    // Assuming genetic potential structure
    const data = {
        max_lean_mass: result.maxLeanMass,
        current_potential: result.currentPotential,
        limit_status: result.limitStatus
    };
    return synthesizeToolResult('GeneticPotential', data, isRTL);
};
