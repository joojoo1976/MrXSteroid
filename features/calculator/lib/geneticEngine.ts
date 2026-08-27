/**
 * Genetic Potential Calculator — Pure Mathematical Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Implements anthropometric formulas for natural muscle potential prediction:
 *  - Casey Butt's FFMI-based frame model
 *  - Wrist/ankle/height skeletal frame analysis
 *  - Natural weight ceiling with body-fat adjustment
 *  - Golden ratio (shoulder-to-waist) structural scoring
 * 
 * All exports are PURE FUNCTIONS → trivially testable, safe for Edge/Server.
 */

export interface GeneticInput {
    heightCm: number;
    wristCm: number;
    ankleCm: number;
    bodyFatPct: number;
    currentChestCm?: number;
    currentShouldersCm?: number;
    currentWaistCm?: number;
    currentThighCm?: number;
    currentCalfCm?: number;
    unitSystem: 'metric' | 'imperial';
}

export interface GeneticPotentials {
    chest: number;
    shoulders: number;
    waist: number;
    thigh: number;
    calf: number;
    arm: number;
}

export interface GeneticResult {
    naturalWeight: number;
    enhancedWeight: number;
    bodyType: 'ectomorph' | 'mesomorph' | 'endomorph';
    ffmi: number;
    normalizedFfmi: number;
    goldenRatio: number;
    physiqueScore: number;
    potentials: {
        name: string;
        current: number;
        potential: number;
        unit: string;
    }[];
}

/** Convert cm to inches */
export const cmToIn = (cm: number): number => cm / 2.54;

/** Convert inches to cm */
export const inToCm = (inches: number): number => inches * 2.54;

/** Round to specified decimals, avoiding floating-point drift */
export const roundTo = (value: number, decimals = 2): number => {
    if (!isFinite(value)) return 0;
    const factor = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * factor) / factor;
};

/** Clamp value to range */
export const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

/**
 * Calculate maximum natural weight using Casey Butt's frame model
 * 
 * Formula (in imperial units):
 * maxWeightLbs = (heightIn^1.5) * ((sqrt(wristIn)/21) + (sqrt(ankleIn)/15)) * (1 + (bf% - 8)/100)
 * 
 * Returns weight in kg (metric) or lbs (imperial)
 */
export const calculateNaturalWeight = (input: GeneticInput): number => {
    const { heightCm, wristCm, ankleCm, bodyFatPct, unitSystem } = input;
    
    const hIn = cmToIn(heightCm);
    const wIn = cmToIn(wristCm);
    const aIn = cmToIn(ankleCm);
    
    const frameComponent = (Math.sqrt(wIn) / 21.0) + (Math.sqrt(aIn) / 15.0);
    const bfAdjustment = 1 + (bodyFatPct - 8) / 100;
    const maxWeightLbs = Math.pow(hIn, 1.5) * frameComponent * bfAdjustment;
    
    return unitSystem === 'imperial' ? maxWeightLbs : maxWeightLbs * 0.45359237;
};

/**
 * Calculate enhanced (assisted) weight ceiling
 * Typically ~35% above natural for elite enhanced athletes
 */
export const calculateEnhancedWeight = (naturalWeight: number): number =>
    roundTo(naturalWeight * 1.35, 1);

/**
 * Calculate genetic potentials for body parts (in cm)
 * Based on height/ankle/wrist ratios from anthropometric data
 */
export const calculatePotentials = (input: GeneticInput): GeneticPotentials => {
    const { heightCm, wristCm, ankleCm, unitSystem } = input;
    
    const hIn = cmToIn(heightCm);
    const wIn = cmToIn(wristCm);
    const aIn = cmToIn(ankleCm);
    
    const factor = unitSystem === 'imperial' ? 1 : 2.54;
    
    return {
        chest: roundTo(hIn * 0.62 * factor, 1),
        shoulders: roundTo(hIn * 0.75 * factor, 1),
        waist: roundTo(hIn * 0.42 * factor, 1),
        thigh: roundTo(aIn * 2.85 * factor, 1),
        calf: roundTo(aIn * 1.95 * factor, 1),
        arm: roundTo(wIn * 2.5 * factor, 1),
    };
};

/**
 * Calculate FFMI (Fat-Free Mass Index) and normalized FFMI
 * FFMI = leanMassKg / (heightM^2)
 * Normalized FFMI = FFMI + 6.1 * (1.8 - heightM)
 */
export const calculateFfmi = (input: GeneticInput, naturalWeight: number): { raw: number; normalized: number } => {
    const { heightCm, bodyFatPct } = input;
    
    const leanMassKg = naturalWeight * (1 - bodyFatPct / 100);
    const heightM = heightCm / 100;
    
    const rawFfmi = leanMassKg / (heightM * heightM);
    const normalizedFfmi = rawFfmi + 6.1 * (1.8 - heightM);
    
    return {
        raw: roundTo(rawFfmi, 2),
        normalized: roundTo(normalizedFfmi, 2),
    };
};

/**
 * Calculate golden ratio (shoulder-to-waist)
 * Uses actual measurements if available, otherwise predicted potentials
 */
export const calculateGoldenRatio = (
    currentShoulders: number,
    currentWaist: number,
    potentialShoulders: number,
    potentialWaist: number
): number => {
    if (currentShoulders > 0 && currentWaist > 0) {
        return roundTo(currentShoulders / currentWaist, 3);
    }
    return roundTo(potentialShoulders / potentialWaist, 3);
};

/**
 * Classify body type based on wrist-to-height ratio
 * radio = wristIn / heightIn
 * < 0.10 → ectomorph
 * 0.10 - 0.115 → mesomorph
 * > 0.115 → endomorph
 */
export const classifyBodyType = (heightCm: number, wristCm: number): 'ectomorph' | 'mesomorph' | 'endomorph' => {
    const hIn = cmToIn(heightCm);
    const wIn = cmToIn(wristCm);
    const radio = wIn / hIn;
    
    if (radio < 0.10) return 'ectomorph';
    if (radio > 0.115) return 'endomorph';
    return 'mesomorph';
};

/**
 * Calculate physique score combining FFMI and structural symmetry
 * Score = (FFMI_score * 0.6) + (Structure_score * 0.4)
 * FFMI_score = min(normalizedFFMI / 25 * 100, 100)
 * Structure_score = max(0, min(100, 100 - |1.618 - goldenRatio| * 100))
 */
export const calculatePhysiqueScore = (normalizedFfmi: number, goldenRatio: number): number => {
    const ffmiScore = Math.min((normalizedFfmi / 25) * 100, 100);
    const structureScore = Math.max(0, Math.min(100, 100 - Math.abs(1.618 - goldenRatio) * 100));
    return Math.round(Math.max(0, Math.min(100, (ffmiScore * 0.6) + (structureScore * 0.4))));
};

/**
 * Main entry point: calculate complete genetic potential profile
 */
export const calculateGeneticPotential = (input: GeneticInput): GeneticResult => {
    const naturalWeight = calculateNaturalWeight(input);
    const enhancedWeight = calculateEnhancedWeight(naturalWeight);
    const potentials = calculatePotentials(input);
    const { raw: rawFfmi, normalized } = calculateFfmi(input, naturalWeight);
    
    // Convert current measurements to metric for internal calc
    const currentChest = input.currentChestCm || 0;
    const currentShoulders = input.currentShouldersCm || 0;
    const currentWaist = input.currentWaistCm || 0;
    
    const goldenRatioValue = calculateGoldenRatio(
        input.currentShouldersCm || 0,
        input.currentWaistCm || 0,
        potentials.shoulders,
        potentials.waist
    );
    
    const physiqueScore = calculatePhysiqueScore(normalized, goldenRatioValue);
    const bodyType = classifyBodyType(input.heightCm, input.wristCm);
    
    const unit = input.unitSystem === 'imperial' ? 'in' : 'cm';
    const toDisplay = (cm: number) => input.unitSystem === 'imperial' ? cmToIn(cm) : cm;
    
    return {
        naturalWeight: Math.round(naturalWeight),
        enhancedWeight: Math.round(enhancedWeight),
        bodyType: bodyType,
        ffmi: rawFfmi,
        normalizedFfmi: normalized,
        goldenRatio: goldenRatioValue,
        physiqueScore: calculatePhysiqueScore(normalized, goldenRatioValue),
        potentials: [
            { name: 'Chest', current: input.currentChestCm ? (input.unitSystem === 'imperial' ? cmToIn(currentChest) : currentChest) : 0, potential: potentials.chest, unit: input.unitSystem === 'imperial' ? 'in' : 'cm' },
            { name: 'Shoulders', current: input.currentShouldersCm ? (input.unitSystem === 'imperial' ? cmToIn(currentShoulders) : currentShoulders) : 0, potential: potentials.shoulders, unit: input.unitSystem === 'imperial' ? 'in' : 'cm' },
            { name: 'Waist', current: input.currentWaistCm ? (input.unitSystem === 'imperial' ? cmToIn(currentWaist) : currentWaist) : 0, potential: potentials.waist, unit: input.unitSystem === 'imperial' ? 'in' : 'cm' },
        ],
    };
};