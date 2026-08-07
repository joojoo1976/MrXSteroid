/**
 * 🧪 Mr. X Steroid - Centralized Formula Engine
 * Implements weighted calculation logic with safety barriers.
 */

export interface CalculationWeights {
    baseValue: number;
    intensityFactor: number;
    profileModifier: number;
    budgetModifier: number;
}

export interface FormulaResult {
    value: number;
    isSafe: boolean;
    warning?: string;
}

export class FormulaEngine {
    /**
     * Core Formula: Result = ((BaseValue * IntensityFactor) + ProfileModifier) * BudgetModifier
     */
    static calculate(weights: CalculationWeights, safetyCap: number): FormulaResult {
        const { baseValue, intensityFactor, profileModifier, budgetModifier } = weights;

        // Apply weights: Result = ((BaseValue * IntensityFactor) + ProfileModifier) * BudgetModifier
        const result = ((baseValue * intensityFactor) + profileModifier) * budgetModifier;

        // Sanity Check: No zero or negative results
        if (result <= 0) {
            return {
                value: Math.max(1, baseValue * 0.5), // Fallback to safe minimum
                isSafe: false,
                warning: "Calculation resulted in sub-optimal values. Using safe baseline."
            };
        }

        // Apply Safety Cap
        if (result > safetyCap) {
            return {
                value: safetyCap,
                isSafe: false,
                warning: `Exceeded clinical safety cap (${safetyCap}). Value throttled for longevity.`
            };
        }

        return {
            value: Number(result.toFixed(2)),
            isSafe: true
        };
    }

    /**
     * Contextual Logic for Compounds
     */
    static getCompoundWeights(
        goal: string,
        experience: string,
        weightKg: number,
        budget: 'low' | 'medium' | 'high'
    ): CalculationWeights {
        const baseValues: Record<string, number> = {
            'bulking': 400,
            'cutting': 300,
            'recomp': 350,
            'trt': 125,
            'sports': 200
        };

        const intensityFactors: Record<string, number> = {
            'beginner': 1.0,
            'intermediate': 1.5,
            'pro': 2.0
        };

        const budgetModifiers: Record<string, number> = {
            'low': 0.85,
            'medium': 1.0,
            'high': 1.2
        };

        const base = baseValues[goal] || 250;
        const intensity = intensityFactors[experience] || 1.0;
        const budgetModifier = budgetModifiers[budget] || 1.0;

        // Profile Modifier: Weight-based adjustment (80kg baseline)
        const profileMod = (weightKg - 80) * 2;

        return {
            baseValue: base,
            intensityFactor: intensity,
            profileModifier: profileMod,
            budgetModifier
        };
    }
}
