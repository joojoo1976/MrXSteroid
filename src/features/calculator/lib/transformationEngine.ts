/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  TRANSFORMATION TIMELINE ENGINE
 *  Pure, deterministic math engine that powers the "Body Transformation
 *  Timeline". All functions are side-effect free, FP-friendly, edge-safe and
 *  unit-system aware (metric kg / imperial lbs). Designed to be testable and
 *  future-proof for AI-driven personalization.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { CONVERSIONS, UnitSystem } from '../../../shared/lib/logic';

// ═══════════════════════════════════════════════════════════════════════════
//  SCIENTIFIC MODEL CONSTANTS
//  Rates are expressed in metric base units (kg, %) and converted at display.
// ═══════════════════════════════════════════════════════════════════════════

/** Safe weekly fat-loss ceiling: 0.5%–1% of current bodyweight (kcal-deficit driven). */
export const FAT_LOSS_RATE = {
    MIN: 0.005,   // 0.5% / week — conservative, muscle-preserving
    DEFAULT: 0.0075, // 0.75% / week — evidence-based sweet spot
    MAX: 0.01,    // 1% / week — aggressive, short-term only
} as const;

/** Lean-tissue accretion potential by training age (kg / week, top end). */
export const MUSCLE_GAIN_RATES = {
    novice: 0.45,       // ≈ 1 lb / week — untrained, high adaptation window
    intermediate: 0.22, // ≈ 0.5 lb / week
    advanced: 0.11,     // ≈ 0.25 lb / week — near genetic ceiling
} as const;

export type TrainingAge = keyof typeof MUSCLE_GAIN_RATES;

/** Weeks at which the classic 12-week cycle transitions between phases. */
export const CYCLE_BOUNDARIES = [2, 6, 10, 12] as const;
export const CYCLE_TOTAL_WEEKS = 12;

// ═══════════════════════════════════════════════════════════════════════════
//  NUMBER PRECISION GUARDS
// ═══════════════════════════════════════════════════════════════════════════

/** Clamp a value into [min, max], tolerant of NaN. */
export const clamp = (value: number, min: number, max: number): number => {
    if (!Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, value));
};

/** Round to a given number of decimals — avoids float drift (0.1 + 0.2). */
export const roundTo = (value: number, decimals = 1): number => {
    if (!Number.isFinite(value)) return 0;
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
};

// ═══════════════════════════════════════════════════════════════════════════
//  UNIT SYSTEM HANDLING (Metric → Imperial conversion at the boundary)
// ═══════════════════════════════════════════════════════════════════════════

export type WeightUnit = 'kg' | 'lbs';

export const getWeightUnit = (system: UnitSystem): WeightUnit =>
    system === 'imperial' ? 'lbs' : 'kg';

/** Converts a metric (kg) value into the active display system. Pure. */
export const toWeightUnit = (kgValue: number, system: UnitSystem): number =>
    system === 'imperial' ? kgValue * CONVERSIONS.KG_TO_LBS : kgValue;

/** Formats a kg value into the active unit with localized label. Pure. */
export const formatWeight = (
    kgValue: number,
    system: UnitSystem,
    isAr: boolean,
    decimals = 1,
): string => {
    const converted = toWeightUnit(kgValue, system);
    const unit = isAr
        ? (system === 'imperial' ? 'رطل' : 'كجم')
        : (system === 'imperial' ? 'lbs' : 'kg');
    return `${roundTo(converted, decimals).toLocaleString(isAr ? 'ar-EG' : 'en-US')} ${unit}`;
};

// ═══════════════════════════════════════════════════════════════════════════
//  BODY COMPOSITION MODEL
//  A simplified, medically-informed predictive model. Real-world results vary.
// ═══════════════════════════════════════════════════════════════════════════

export interface BodyCompositionInput {
    /** Current bodyweight in kg (metric base). */
    startWeightKg: number;
    /** Current body-fat percentage (e.g. 18 for 18%). */
    startBodyFatPct: number;
    /** Training age — drives muscle accretion ceiling. */
    trainingAge: TrainingAge;
    /** Weekly fat-loss rate as a fraction of bodyweight (0.005–0.01). */
    weeklyFatLossRate?: number;
    /** Optional height in cm — unlocks BMI / ideal-weight predictions. */
    heightCm?: number;
}

export interface WeeklyProjection {
    /** 1-based week number. */
    week: number;
    /** Projected bodyweight at end of this week (kg). */
    weightKg: number;
    /** Projected body-fat percentage at end of this week. */
    bodyFatPct: number;
    /** Fat mass lost this week (kg). */
    fatLossKg: number;
    /** Lean mass gained this week (kg). */
    muscleGainKg: number;
    /** Cumulative lean mass gained up to this week (kg). */
    cumulativeMuscleGainKg: number;
    /** Weekly fat-loss rate as % of bodyweight (0–1). */
    fatLossRatePct: number;
}

/**
 * Raw fat mass + lean mass derived from weight & body-fat percentage.
 */
export const decomposeBody = (weightKg: number, bodyFatPct: number) => {
    const fatKg = weightKg * clamp(bodyFatPct / 100, 0.03, 0.6);
    const leanKg = weightKg - fatKg;
    return { fatKg, leanKg };
};

/**
 * Adaptive weekly fat-loss rate — a piecewise-linear physiological model:
 * anchored at 18% body fat where the evidence-based 0.75% default applies.
 * Leaner bodies lose more slowly (down to 0.5%, preserving muscle); fatter
 * bodies may lose slightly faster (up to 1%). An explicit override wins.
 */
export const adaptiveFatLossRate = (
    startBodyFatPct: number,
    override?: number,
): number => {
    if (override != null) {
        return clamp(override, FAT_LOSS_RATE.MIN, FAT_LOSS_RATE.MAX);
    }
    const bf = clamp(startBodyFatPct, 3, 60);
    const t = (bf - 18) / 18; // -1 @ 0% BF, 0 @ 18% BF, +1 @ 36% BF
    return clamp(
        FAT_LOSS_RATE.DEFAULT + t * 0.0025,
        FAT_LOSS_RATE.MIN,
        FAT_LOSS_RATE.MAX,
    );
};

/**
 * Weekly muscle-gain rate (kg) — decays as training age rises and as the
 * adaptation window shrinks later in the cycle.
 */
export const weeklyMuscleGainRate = (
    trainingAge: TrainingAge,
    week: number,
): number => {
    const base = MUSCLE_GAIN_RATES[trainingAge];
    // Late-cycle tapering: gains slow as the adaptation window closes.
    const taper = clamp(1 - (week / CYCLE_TOTAL_WEEKS) * 0.35, 0.65, 1);
    return roundTo(base * taper, 3);
};

/**
 * Returns the phase index (0-based) a given week falls into, based on the
 * classic 12-week cycle boundaries.
 */
export const phaseIndexForWeek = (week: number): number => {
    const w = clamp(Math.floor(week), 1, CYCLE_TOTAL_WEEKS);
    let idx = 0;
    for (let i = 0; i < CYCLE_BOUNDARIES.length; i++) {
        if (w <= CYCLE_BOUNDARIES[i]) { idx = i; break; }
        idx = i;
    }
    return idx;
};

/**
 * Projects the body-composition trajectory week by week.
 * Deterministic: same inputs ⇒ same output. Edge-safe for NaN/0 inputs.
 */
export const projectBodyComposition = (
    input: BodyCompositionInput,
): WeeklyProjection[] => {
    const startW = clamp(input.startWeightKg, 30, 400);
    const startBf = clamp(input.startBodyFatPct, 3, 60);
    const weeklyLoss = adaptiveFatLossRate(startBf, input.weeklyFatLossRate);

    let weightKg = startW;
    let fatKg = startW * (startBf / 100);
    let leanKg = startW - fatKg;
    let cumulativeMuscle = 0;

    const projections: WeeklyProjection[] = [];

    for (let week = 1; week <= CYCLE_TOTAL_WEEKS; week++) {
        // Fat loss scales with current bodyweight (kcal-deficit model).
        const fatLossKg = clamp(weightKg * weeklyLoss, 0, weightKg * 0.02);
        fatKg = Math.max(0, fatKg - fatLossKg);

        // Muscle gain from training-age model, with late-cycle taper.
        const muscleGainKg = weeklyMuscleGainRate(input.trainingAge, week);
        leanKg += muscleGainKg;
        cumulativeMuscle += muscleGainKg;

        weightKg = roundTo(fatKg + leanKg, 2);
        const bodyFatPct = roundTo((fatKg / Math.max(weightKg, 0.1)) * 100, 1);

        projections.push({
            week,
            weightKg,
            bodyFatPct,
            fatLossKg: roundTo(fatLossKg, 2),
            muscleGainKg: roundTo(muscleGainKg, 2),
            cumulativeMuscleGainKg: roundTo(cumulativeMuscle, 2),
            fatLossRatePct: roundTo(weeklyLoss * 100, 1),
        });
    }

    return projections;
};

/**
 * Convenience accessor: projection for a single week.
 */
export const projectionForWeek = (
    input: BodyCompositionInput,
    week: number,
): WeeklyProjection | null =>
    projectBodyComposition(input)[clamp(Math.floor(week), 1, CYCLE_TOTAL_WEEKS) - 1] ?? null;

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE AGGREGATES (for phase cards)
// ═══════════════════════════════════════════════════════════════════════════

export interface PhaseAggregate {
    index: number;
    weekStart: number;
    weekEnd: number;
    /** Avg weekly fat-loss rate (%) across the phase. */
    fatLossRatePct: number;
    /** Cumulative lean-mass gained within the phase (kg). */
    muscleGainKg: number;
    /** Fat mass lost across the phase (kg). */
    fatLossKg: number;
    /** Body-fat percentage at the end of the phase. */
    bodyFatPctEnd: number;
    /** Bodyweight at the end of the phase (kg). */
    weightKgEnd: number;
}

/**
 * Groups weekly projections into the 4 phase windows and computes aggregates.
 * Accepts an optional precomputed projection list so the hook avoids running
 * the full simulation twice per render.
 */
export const aggregatePhases = (
    input: BodyCompositionInput,
    projections?: WeeklyProjection[],
): PhaseAggregate[] => {
    const computed = projections ?? projectBodyComposition(input);
    const boundaries = CYCLE_BOUNDARIES;

    return boundaries.map((endWeek, idx) => {
        const startWeek = idx === 0 ? 1 : boundaries[idx - 1] + 1;
        const slice = computed.filter(
            (p) => p.week >= startWeek && p.week <= endWeek,
        );
        const last = slice[slice.length - 1];

        return {
            index: idx,
            weekStart: startWeek,
            weekEnd: endWeek,
            fatLossRatePct: last?.fatLossRatePct ?? FAT_LOSS_RATE.DEFAULT * 100,
            muscleGainKg: roundTo(
                slice.reduce((sum, p) => sum + p.muscleGainKg, 0),
                2,
            ),
            fatLossKg: roundTo(
                slice.reduce((sum, p) => sum + p.fatLossKg, 0),
                2,
            ),
            bodyFatPctEnd: last?.bodyFatPct ?? input.startBodyFatPct,
            weightKgEnd: last?.weightKg ?? input.startWeightKg,
        };
    });
};

// ═══════════════════════════════════════════════════════════════════════════
//  SMART NUTRITION & HYDRATION TARGETS
//  Dynamic recommendations computed from the user's own inputs, then rendered
//  in the active unit system (metric kg/litres — imperial lbs/oz).
// ═══════════════════════════════════════════════════════════════════════════

/** Recommended daily water intake (ml per kg of bodyweight). */
export const HYDRATION_ML_PER_KG = 40;

/** Daily protein target (g per kg) — rises with training age. */
export const PROTEIN_G_PER_KG: Record<TrainingAge, number> = {
    novice: 2.2,
    intermediate: 2.5,
    advanced: 2.8,
};

/** Training-day carbohydrate range (g per kg). */
export const CARBS_G_PER_KG = { MIN: 4, MAX: 6 } as const;

/** Bulking surplus range (kcal per kg). */
export const KCAL_PER_KG = { MIN: 16, MAX: 18 } as const;

export interface NutritionTargets {
    /** Daily water intake, litres. */
    waterLiters: number;
    /** Daily protein target, g per kg. */
    proteinGPerKg: number;
    /** Daily carb midpoint, g per kg. */
    carbsGPerKg: number;
    /** Daily kcal midpoint per kg. */
    kcalPerKg: number;
}

/**
 * Computes personalized nutrition targets from the user's starting weight and
 * training age. Pure + deterministic + edge-safe.
 */
export const nutritionTargets = (
    input: { startWeightKg: number; trainingAge: TrainingAge },
): NutritionTargets => {
    const weight = clamp(input.startWeightKg, 30, 400);
    return {
        waterLiters: roundTo(clamp(weight * (HYDRATION_ML_PER_KG / 1000), 3.2, 5.5), 1),
        proteinGPerKg: PROTEIN_G_PER_KG[input.trainingAge],
        carbsGPerKg: (CARBS_G_PER_KG.MIN + CARBS_G_PER_KG.MAX) / 2,
        kcalPerKg: (KCAL_PER_KG.MIN + KCAL_PER_KG.MAX) / 2,
    };
};

// ═══════════════════════════════════════════════════════════════════════════
//  UNIT-AWARE NARRATIVE CONTEXT
//  The phase narrative uses `{token}` placeholders (weight, water, protein,
//  carbs, kcal). At render time they are substituted with fully localized,
//  unit-system-aware phrases so the same Arabic/English copy adapts
//  Metric → Imperial (kg ↔ lbs, litres ↔ oz) on the fly.
// ═══════════════════════════════════════════════════════════════════════════

export interface TimelineCopyContext {
    /** e.g. "80 kg" / "176 lbs" / "٨٠ كجم". */
    weight: string;
    /** e.g. "3.2 liters" / "108 oz (≈ 0.8 gal)". */
    water: string;
    /** e.g. "2.5g per kg" / "1.1g per lb". */
    protein: string;
    /** e.g. "4–6g per kg" / "1.8–2.7g per lb". */
    carbs: string;
    /** e.g. "16–18 kcal/kg" / "7–8 kcal/lb". */
    kcal: string;
}

const formatNum = (value: number, decimals: number, isAr: boolean): string =>
    roundTo(value, decimals).toLocaleString(isAr ? 'ar-EG' : 'en-US');

const perLb = (perKg: number): number => perKg / CONVERSIONS.KG_TO_LBS;

/**
 * Builds the localized placeholder map for the active unit system.
 * Pure + deterministic — fully testable.
 */
export const buildTimelineCopyContext = (input: {
    startWeightKg: number;
    trainingAge: TrainingAge;
    unitSystem: UnitSystem;
    isAr: boolean;
}): TimelineCopyContext => {
    const targets = nutritionTargets(input);
    const weightKg = clamp(input.startWeightKg, 30, 400);

    if (input.unitSystem === 'imperial') {
        const weightLbs = weightKg * CONVERSIONS.KG_TO_LBS;
        const waterOz = Math.round(targets.waterLiters * 33.814);
        return {
            weight: `${formatNum(weightLbs, 0, input.isAr)} ${input.isAr ? 'رطل' : 'lbs'}`,
            water: `${formatNum(waterOz, 0, input.isAr)} ${input.isAr ? 'أونصة' : 'oz'} (≈ ${formatNum(waterOz / 128, 1, input.isAr)} ${input.isAr ? 'غالون' : 'gal'})`,
            protein: `${formatNum(perLb(targets.proteinGPerKg), 1, input.isAr)}g/${input.isAr ? 'رطل' : 'lb'}`,
            carbs: `${formatNum(perLb(CARBS_G_PER_KG.MIN), 1, input.isAr)}–${formatNum(perLb(CARBS_G_PER_KG.MAX), 1, input.isAr)}g/${input.isAr ? 'رطل' : 'lb'}`,
            kcal: `${Math.round(perLb(KCAL_PER_KG.MIN))}–${Math.round(perLb(KCAL_PER_KG.MAX))} ${input.isAr ? 'سعرة/رطل' : 'kcal/lb'}`,
        };
    }

    return {
        weight: `${formatNum(weightKg, 0, input.isAr)} ${input.isAr ? 'كجم' : 'kg'}`,
        water: `${formatNum(targets.waterLiters, 1, input.isAr)} ${input.isAr ? 'لتر' : 'liters'}`,
        protein: `${formatNum(targets.proteinGPerKg, 1, input.isAr)}g/${input.isAr ? 'كغ' : 'kg'}`,
        carbs: `${CARBS_G_PER_KG.MIN}–${CARBS_G_PER_KG.MAX}g/${input.isAr ? 'كغ' : 'kg'}`,
        kcal: `${KCAL_PER_KG.MIN}–${KCAL_PER_KG.MAX} ${input.isAr ? 'سعرة/كغ' : 'kcal/kg'}`,
    };
};

/**
 * Substitutes `{token}` placeholders in a phase template with the resolved,
 * unit-aware phrases. Unknown tokens are left untouched.
 */
export const renderTimelineCopy = (
    template: string,
    ctx: TimelineCopyContext,
): string =>
    template.replace(/\{(\w+)\}/g, (match, key) => {
        const k = key as keyof TimelineCopyContext;
        return k in ctx ? ctx[k] : match;
    });

// ═══════════════════════════════════════════════════════════════════════════
//  CHART SERIES
//  Merges the classic phase stat bars (0–100) with the live projection series
//  (body-fat %, cumulative lean mass) so the evolution chart reacts to the
//  engine sliders. Pure + deterministic.
// ═══════════════════════════════════════════════════════════════════════════

export interface ChartPhaseInput {
    week: string;
    stats: {
        strength: number;
        hypertrophy: number;
        waterRetention: number;
        fatLoss: number;
        mood: number;
    };
}

export interface ChartSeriesRow {
    week: string;
    strength: number;
    hypertrophy: number;
    waterRetention: number;
    fatLoss: number;
    mood: number;
    /** Projected body-fat % at the end of the phase. */
    bodyFatPct: number;
    /** Projected bodyweight at the end of the phase (kg, metric base). */
    weightKg: number;
    /** Cumulative lean mass gained up to the end of the phase (kg). */
    cumulativeMuscleKg: number;
    /** Lean mass gained within the phase (kg). */
    muscleGainKg: number;
    /** Fat mass lost within the phase (kg). */
    fatLossKg: number;
}

/**
 * Builds one chart row per phase. The cumulative muscle value uses the
 * projection at the phase's final week (NOT a sum of already-cumulative
 * values, which would over-count).
 */
export const buildChartSeries = (
    phases: ChartPhaseInput[],
    projections: WeeklyProjection[],
    aggregates: PhaseAggregate[],
): ChartSeriesRow[] =>
    phases.map((phase, idx) => {
        const aggregate = aggregates[idx];
        const lastWeek = clamp(aggregate.weekEnd, 1, CYCLE_TOTAL_WEEKS);
        const cumulativeMuscleKg =
            projections[lastWeek - 1]?.cumulativeMuscleGainKg ?? 0;
        return {
            week: phase.week,
            strength: phase.stats.strength,
            hypertrophy: phase.stats.hypertrophy,
            waterRetention: phase.stats.waterRetention,
            fatLoss: phase.stats.fatLoss,
            mood: phase.stats.mood,
            bodyFatPct: aggregate.bodyFatPctEnd,
            weightKg: aggregate.weightKgEnd,
            cumulativeMuscleKg: roundTo(cumulativeMuscleKg, 2),
            muscleGainKg: aggregate.muscleGainKg,
            fatLossKg: aggregate.fatLossKg,
        };
    });

// ═══════════════════════════════════════════════════════════════════════════
//  ADVANCED LIVE PREDICTIONS
//  Height-based ideal weight (BMI), energy economics (Katch–McArdle), and a
//  full cycle summary — all pure, deterministic, unit-system-agnostic (metric
//  base), recomputed live as the user drags any slider.
// ═══════════════════════════════════════════════════════════════════════════

/** Healthy BMI band (WHO). */
export const BMI_RANGE = { LOWER: 18.5, UPPER: 24.9, MID: 22 } as const;

/** Body-fat milestones tracked during the cycle (%). */
export const BF_MILESTONES = [20, 18, 15] as const;

/** kcal stored per kg of adipose tissue. */
export const KCAL_PER_KG_FAT = 7700 as const;

/** Moderate-training activity multiplier (Mifflin-adjacent lifestyle factor). */
export const ACTIVITY_FACTOR = 1.55 as const;

/** Fallback height when the caller does not supply one. */
export const DEFAULT_HEIGHT_CM = 175 as const;

/**
 * Energy economics — Katch–McArdle BMR derived purely from lean body mass
 * (no age/gender assumptions), scaled to TDEE, plus the daily kcal deficit the
 * user's chosen fat-loss rate implies (7 700 kcal ≈ 1 kg fat).
 */
export const estimateEnergy = (
    input: BodyCompositionInput,
): {
    bmrKcal: number;
    tdeeKcal: number;
    dailyDeficitKcal: number;
    weeklyBurnKcal: number;
} => {
    const weightKg = clamp(input.startWeightKg, 30, 400);
    const bf = clamp(input.startBodyFatPct, 3, 60);
    const leanKg = weightKg * (1 - bf / 100);

    const bmrKcal = 370 + 21.6 * leanKg; // Katch–McArdle
    const tdeeKcal = bmrKcal * ACTIVITY_FACTOR;

    const rate = adaptiveFatLossRate(bf, input.weeklyFatLossRate);
    const avgWeeklyFatLossKg = weightKg * rate;
    const weeklyBurnKcal = avgWeeklyFatLossKg * KCAL_PER_KG_FAT;
    const dailyDeficitKcal = weeklyBurnKcal / 7;

    return {
        bmrKcal: roundTo(bmrKcal, 0),
        tdeeKcal: roundTo(tdeeKcal, 0),
        dailyDeficitKcal: roundTo(dailyDeficitKcal, 0),
        weeklyBurnKcal: roundTo(weeklyBurnKcal, 0),
    };
};

/**
 * Height-based ideal-weight estimate (healthy BMI band) and the projected
 * time — in weeks — to reach it given the model's average net weekly weight
 * change. `null` weeks mean the target is unreachable within the model.
 */
export const estimateIdealWeight = (
    input: BodyCompositionInput,
    heightCm?: number,
): {
    bmiStart: number;
    idealWeightKg: number;
    idealWeightMidKg: number;
    weightToLoseKg: number;
    weightToMidLoseKg: number;
    weeksToIdeal: number | null;
    weeksToMidIdeal: number | null;
} => {
    const hM = clamp(heightCm ?? DEFAULT_HEIGHT_CM, 120, 250) / 100;
    const weightKg = clamp(input.startWeightKg, 30, 400);

    const bmiStart = weightKg / (hM * hM);
    const idealWeightKg = roundTo(BMI_RANGE.UPPER * hM * hM, 1);
    const idealWeightMidKg = roundTo(BMI_RANGE.MID * hM * hM, 1);

    const projections = projectBodyComposition(input);
    const startW = clamp(input.startWeightKg, 30, 400);
    const netChange = projections[CYCLE_TOTAL_WEEKS - 1].weightKg - startW;
    const netWeekly = netChange / CYCLE_TOTAL_WEEKS;

    const weightToLoseKg = Math.max(0, weightKg - idealWeightKg);
    const weightToMidLoseKg = Math.max(0, weightKg - idealWeightMidKg);

    // A cut produces a *negative* net weekly change — use its magnitude as the
    // rate of descent; a non-positive (flat/gaining) model means unreachable.
    const rate = Math.abs(netWeekly);

    return {
        bmiStart: roundTo(bmiStart, 1),
        idealWeightKg,
        idealWeightMidKg,
        weightToLoseKg: roundTo(weightToLoseKg, 1),
        weightToMidLoseKg: roundTo(weightToMidLoseKg, 1),
        weeksToIdeal:
            weightToLoseKg <= 0 ? 0 : rate <= 0 ? null : Math.round(weightToLoseKg / rate),
        weeksToMidIdeal:
            weightToMidLoseKg <= 0 ? 0 : rate <= 0 ? null : Math.round(weightToMidLoseKg / rate),
    };
};

export interface MilestonePoint {
    week: number;
    bodyFatPct: number;
    kind: 'bf20' | 'bf18' | 'bf15' | 'midIdeal';
}

export interface CycleSummary {
    startWeightKg: number;
    endWeightKg: number;
    weightChangeKg: number;
    weightChangePct: number;
    startBfPct: number;
    endBfPct: number;
    bfChangePct: number;
    totalFatLossKg: number;
    totalMuscleGainKg: number;
    avgWeeklyFatLossKg: number;
    avgWeeklyMuscleKg: number;
    netWeeklyWeightChangeKg: number;
    bmiStart: number;
    bmiEnd: number;
    idealWeightKg: number;
    idealWeightMidKg: number;
    weightToLoseKg: number;
    weeksToIdeal: number | null;
    withinCycle: boolean;
    goalProgressPct: number;
    milestones: MilestonePoint[];
    energy: ReturnType<typeof estimateEnergy>;
}

/**
 * One-shot, deterministic summary of the entire predicted cycle. Powers the
 * live "goal progress" gauge, time-to-ideal-weight countdown, deficit
 * readouts and milestone markers — all recomputed on every input change.
 */
export const estimateCycleSummary = (
    input: BodyCompositionInput,
    heightCm?: number,
): CycleSummary => {
    const projections = projectBodyComposition(input);
    const startW = clamp(input.startWeightKg, 30, 400);
    const startBf = clamp(input.startBodyFatPct, 3, 60);

    const endWeightKg = projections[CYCLE_TOTAL_WEEKS - 1].weightKg;
    const endBfPct = projections[CYCLE_TOTAL_WEEKS - 1].bodyFatPct;
    const totalFatLossKg = roundTo(
        projections.reduce((sum, p) => sum + p.fatLossKg, 0),
        2,
    );
    const totalMuscleGainKg = projections[CYCLE_TOTAL_WEEKS - 1].cumulativeMuscleGainKg;

    const weightChangeKg = roundTo(endWeightKg - startW, 2);
    const netWeeklyWeightChangeKg = roundTo(weightChangeKg / CYCLE_TOTAL_WEEKS, 3);

    const ideal = estimateIdealWeight(input, heightCm);

    // Goal progress toward the healthy upper bound (BMI 24.9).
    const goalProgressPct =
        ideal.weightToLoseKg <= 0
            ? 100
            : clamp((totalFatLossKg / ideal.weightToLoseKg) * 100, 0, 100);

    // Body-fat milestones: the first week each threshold is crossed.
    const milestones: MilestonePoint[] = [];
    let seenMidIdeal = false;
    for (let i = 0; i < projections.length; i++) {
        const p = projections[i];
        if (p.bodyFatPct < 20 && !milestones.some((m) => m.kind === 'bf20')) {
            milestones.push({ week: p.week, bodyFatPct: p.bodyFatPct, kind: 'bf20' });
        }
        if (p.bodyFatPct < 18 && !milestones.some((m) => m.kind === 'bf18')) {
            milestones.push({ week: p.week, bodyFatPct: p.bodyFatPct, kind: 'bf18' });
        }
        if (p.bodyFatPct < 15 && !milestones.some((m) => m.kind === 'bf15')) {
            milestones.push({ week: p.week, bodyFatPct: p.bodyFatPct, kind: 'bf15' });
        }
        if (!seenMidIdeal && p.weightKg <= ideal.idealWeightMidKg) {
            milestones.push({ week: p.week, bodyFatPct: p.bodyFatPct, kind: 'midIdeal' });
            seenMidIdeal = true;
        }
    }

    const weeksToIdeal = ideal.weeksToIdeal;

    return {
        startWeightKg: roundTo(startW, 1),
        endWeightKg,
        weightChangeKg,
        weightChangePct: roundTo((weightChangeKg / startW) * 100, 1),
        startBfPct: startBf,
        endBfPct,
        bfChangePct: roundTo(startBf - endBfPct, 1),
        totalFatLossKg,
        totalMuscleGainKg: roundTo(totalMuscleGainKg, 2),
        avgWeeklyFatLossKg: roundTo(totalFatLossKg / CYCLE_TOTAL_WEEKS, 2),
        avgWeeklyMuscleKg: roundTo(totalMuscleGainKg / CYCLE_TOTAL_WEEKS, 2),
        netWeeklyWeightChangeKg,
        bmiStart: ideal.bmiStart,
        bmiEnd: roundTo(endWeightKg / Math.pow(clamp(heightCm ?? DEFAULT_HEIGHT_CM, 120, 250) / 100, 2), 1),
        idealWeightKg: ideal.idealWeightKg,
        idealWeightMidKg: ideal.idealWeightMidKg,
        weightToLoseKg: ideal.weightToLoseKg,
        weeksToIdeal,
        withinCycle: weeksToIdeal != null && weeksToIdeal <= CYCLE_TOTAL_WEEKS,
        goalProgressPct: roundTo(goalProgressPct, 0),
        milestones,
        energy: estimateEnergy(input),
    };
};

/**
 * Formats a metric height (cm) into the active system — "178 cm" / "5' 10\""
 * — with Arabic/English labels.
 */
export const formatHeight = (
    cm: number,
    system: UnitSystem,
    isAr: boolean,
): string => {
    if (system === 'imperial') {
        const inches = cm * CONVERSIONS.CM_TO_INCHES;
        const feet = Math.floor(inches / 12);
        const rem = Math.round(inches % 12);
        return isAr
            ? `${feet}′ ${rem}″`
            : `${feet}' ${rem}"`;
    }
    return `${Math.round(cm)} ${isAr ? 'سم' : 'cm'}`;
};

// ═══════════════════════════════════════════════════════════════════════════
//  SMART COACH FACTS
//  Pure classification of the live CycleSummary into actionable verdicts.
//  The component localizes these facts; the engine stays i18n-free and testable.
// ═══════════════════════════════════════════════════════════════════════════

export type BfZone = 'lean' | 'moderate' | 'high';
export type DeficitLevel = 'mild' | 'moderate' | 'aggressive';
export type BmiStatus = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface CoachFacts {
    /** Starting body-fat zone (drives fat-loss expectations). */
    bfZone: BfZone;
    /** Implied daily kcal deficit band. */
    deficitLevel: DeficitLevel;
    /** WHO BMI classification of the starting point. */
    bmiStatus: BmiStatus;
    /** Whether the ideal weight is reachable inside the 12-week cycle. */
    reachesGoalInCycle: boolean;
    /** Extra weeks needed after the cycle when the target sits beyond it. */
    weeksBeyondCycle: number | null;
    /** The next (future) body-fat milestone relative to the active week. */
    nextMilestone: MilestonePoint | null;
    /** How many body-fat milestones (bf20/bf18/bf15) the cycle reaches. */
    bfMilestoneCount: number;
}

/**
 * Classifies a live cycle summary into coaching verdicts. Pure + deterministic.
 * `activeWeek` anchors the "next milestone" to the phase the user is viewing.
 */
export const deriveCoachFacts = (
    summary: CycleSummary,
    activeWeek = 1,
): CoachFacts => {
    const bf = summary.startBfPct;
    const bfZone: BfZone = bf < 15 ? 'lean' : bf <= 25 ? 'moderate' : 'high';

    const deficit = summary.energy.dailyDeficitKcal;
    const deficitLevel: DeficitLevel =
        deficit < 300 ? 'mild' : deficit <= 650 ? 'moderate' : 'aggressive';

    const bmi = summary.bmiStart;
    const bmiStatus: BmiStatus =
        bmi < 18.5 ? 'underweight' : bmi < 25 ? 'normal' : bmi < 30 ? 'overweight' : 'obese';

    const bfMilestones = summary.milestones.filter((m) => m.kind !== 'midIdeal');

    return {
        bfZone,
        deficitLevel,
        bmiStatus,
        reachesGoalInCycle: summary.withinCycle,
        weeksBeyondCycle:
            summary.weeksToIdeal != null && summary.weeksToIdeal > CYCLE_TOTAL_WEEKS
                ? summary.weeksToIdeal - CYCLE_TOTAL_WEEKS
                : null,
        nextMilestone: bfMilestones.find((m) => m.week >= activeWeek) ?? null,
        bfMilestoneCount: bfMilestones.length,
    };
};
