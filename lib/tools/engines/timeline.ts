/**
 * lib/tools/engines/timeline.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #080 — Transformation Timeline Engine (Layer 1).
 * ═══════════════════════════════════════════════════════════════════════════
 * Week-by-week body-composition trajectory model:
 *
 *   fatΔ(w)   = (Δkcal·7·adapt(w) − muscleΔ(w)·MUSCLE_KCAL_PER_KG) / FAT_KCAL_PER_KG
 *   adapt(w)  = max(ADAPTATION_FLOOR, 1 − ADAPTATION_DECAY_PER_WEEK·(w−1))
 *   muscleΔ(w)= min(cap[status][exp], partitionable energy, …)   (gated by goal)
 *   water(w)  = peak[status]·max(0, 1 − (w−1)/WATER_RETENTION_TAPER_WEEKS)
 *
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O.
 * Runs identically on server (RSC / route handlers) and client.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Enumerations (frozen tuples so the Layer-2 Zod enum keeps the exact union)
// ─────────────────────────────────────────────────────────────────────────────

export type Goal = 'fat_loss' | 'lean_gain' | 'recomposition';
export type BiologicalStatus = 'natural' | 'enhanced' | 'heavy_enhanced';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export const GOAL_TYPES: readonly Goal[] = ['fat_loss', 'lean_gain', 'recomposition'];
export const BIO_STATUS_TYPES: readonly BiologicalStatus[] = ['natural', 'enhanced', 'heavy_enhanced'];
export const EXPERIENCE_LEVELS: readonly ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];

// ─────────────────────────────────────────────────────────────────────────────
// Physiological constants (Tool #080 spec §1.2)
// ─────────────────────────────────────────────────────────────────────────────

/** Thermodynamic energy density of human adipose tissue (kcal / kg). */
export const FAT_KCAL_PER_KG = 7700;
/** Approximate synthesis cost of 1 kg of contractile tissue (kcal / kg). */
export const MUSCLE_KCAL_PER_KG = 2900;
/**
 * Adaptive thermogenesis: the effective caloric delta decays by this fraction
 * each week (compounding), floored at `ADAPTATION_FLOOR`. This is the plateau
 * driver — the body defends its set-point over time.
 */
export const ADAPTATION_DECAY_PER_WEEK = 0.015;
/** Hard floor for the adaptation multiplier (~35% efficiency loss cap). */
export const ADAPTATION_FLOOR = 0.65;
/**
 * Recomposition realises at most this fraction of the genetic hypertrophy cap
 * while in a deficit (simultaneous fat loss + muscle gain, per Mr. X-Steroid
 * Book Ch. 6).
 */
export const RECOMP_MUSCLE_FACTOR = 0.4;
/** Weekly |Δweight| below this for two consecutive weeks flags a plateau. */
export const PLATEAU_WEEKLY_CHANGE_KG = 0.15;
/** Weeks over which enhanced water retention linearly tapers to zero. */
export const WATER_RETENTION_TAPER_WEEKS = 4;

/** Peak extra water mass held (as % of tissue weight) during weeks 1–3. */
export const WATER_PEAK_PCT: Record<BiologicalStatus, number> = {
    natural: 0,
    enhanced: 3,
    heavy_enhanced: 5,
};

/**
 * Genetic / pharmacological hypertrophy speed caps (kg of contractile tissue
 * per week). Natural caps follow the classical Lyle McDonald / Alan Aragon
 * model; enhanced & heavy-enhanced columns reflect the amplified ceiling
 * documented in "Mr. X-Steroid Book".
 */
export const HYPERTROPHY_CAPS_KG_PER_WEEK: Record<BiologicalStatus, Record<ExperienceLevel, number>> = {
    natural: { beginner: 0.5, intermediate: 0.25, advanced: 0.12 },
    enhanced: { beginner: 0.9, intermediate: 0.55, advanced: 0.3 },
    heavy_enhanced: { beginner: 1.4, intermediate: 0.85, advanced: 0.5 },
};

/** Goal-completion thresholds (defines `targetReached` / `totalWeeksNeeded`). */
export const TARGET_THRESHOLDS = {
    fatLossKg: 5,
    fatLossBodyFatPoints: 5,
    muscleGainKg: 3,
    recompFatLossKg: 3,
    recompMuscleGainKg: 1.5,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EngineInput {
    startingWeightKg: number;
    startingBodyFatPct: number;
    goal: Goal;
    biologicalStatus: BiologicalStatus;
    experienceLevel: ExperienceLevel;
    /** Signed daily caloric delta (kcal/day): negative = deficit, positive = surplus. */
    caloricDeltaKcal: number;
    /** Simulation length (weeks), 4–52. */
    timelineWeeks: number;
}

export interface WeeklyDataPoint {
    weekNumber: number;
    /** Day offset from week 1 (week n → (n−1)·7 days). */
    dateOffset: number;
    estimatedWeightKg: number;
    estimatedLbmKg: number;
    estimatedFatMassKg: number;
    bodyFatPct: number;
    /** Extra water held this week, as % of tissue weight (enhanced weeks 1–3). */
    waterRetentionPct: number;
    milestoneNoteAr: string;
    milestoneNoteEn: string;
}

export interface TimelineResult {
    timeline: WeeklyDataPoint[];
    totalWeeksNeeded: number;
    targetReached: boolean;
    muscleGainedKg: number;
    fatLostKg: number;
    /** First week where the 2-week plateau condition holds (0 = no plateau). */
    plateauWarningWeek: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const round2 = (value: number): number => Math.round(value * 100) / 100;
const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

/** Defensive coercion: NaN / non-finite → fallback, then clamped to range. */
const safeNumber = (value: number, fallback: number, min: number, max: number): number => {
    const v = Number.isFinite(value) ? value : fallback;
    return clamp(v, min, max);
};

const safeInt = (value: number, fallback: number, min: number, max: number): number => {
    const v = Number.isFinite(value) ? Math.round(value) : fallback;
    return clamp(Math.round(v), min, max);
};

const safeEnum = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => {
    return typeof value === 'string' && (allowed as readonly string[]).includes(value)
        ? (value as T)
        : fallback;
};

/** Extra water mass % for a given week (linear taper, weeks 1–`TAPER`). */
export function waterRetentionPct(status: BiologicalStatus, week: number): number {
    const peak = WATER_PEAK_PCT[status];
    if (peak <= 0 || week < 1) return 0;
    const factor = Math.max(0, 1 - (week - 1) / WATER_RETENTION_TAPER_WEEKS);
    return round2(peak * factor);
}

/** Hypertrophy cap (kg/week) for a status × experience cell. */
export function hypertrophyCap(status: BiologicalStatus, experience: ExperienceLevel): number {
    return HYPERTROPHY_CAPS_KG_PER_WEEK[status][experience];
}

/** Adaptation multiplier for a given week (1.0 → floor over time). */
export function adaptationFactor(week: number): number {
    if (week < 1) return 1;
    return Math.max(ADAPTATION_FLOOR, 1 - ADAPTATION_DECAY_PER_WEEK * (week - 1));
}

// ─────────────────────────────────────────────────────────────────────────────
// Bilingual milestone notes (Tool #080 spec §1.2 — phase stepper)
// ─────────────────────────────────────────────────────────────────────────────

interface MilestoneNote {
    ar: string;
    en: string;
}

const MILESTONE_NOTES: Record<number, MilestoneNote> = {
    1: {
        ar: 'الأسبوع 1: بداية التحول وتراكم الجليكوجين المائي',
        en: 'Week 1: Transformation onset — glycogen & water loading',
    },
    2: {
        ar: 'الأسبوع 2: انزياح احتباس الماء الأولي (مظهر "أملس")',
        en: 'Week 2: Initial water shift (the "smoothing" look)',
    },
    6: {
        ar: 'الأسبوع 6: كثافة عضلية مرئية وثبات في التذبذب',
        en: 'Week 6: Visible muscle density & fluctuation stability',
    },
    12: {
        ar: 'الأسبوع 12: حالة الذروة — أقصى تكوين بدني مركّب',
        en: 'Week 12: Peak condition — maximal composite composition',
    },
};

const PLATEAU_NOTE: MilestoneNote = {
    ar: 'تحذير الهضبة الأيضية — راجع فجوة السعرات والتدريب',
    en: 'Metabolic plateau warning — review caloric gap & training',
};
const COMPLETE_NOTE: MilestoneNote = {
    ar: 'اكتمل الجدول الزمني للتحول',
    en: 'Transformation timeline complete',
};

function milestoneNote(
    week: number,
    plateauWeek: number,
    isFinal: boolean,
    status: BiologicalStatus,
): MilestoneNote {
    if (plateauWeek > 0 && week === plateauWeek) return PLATEAU_NOTE;
    if (isFinal) return COMPLETE_NOTE;
    // Week 2 water-shift note is only physiologically meaningful when enhanced.
    if (week === 2 && status === 'natural') {
        return { ar: 'الأسبوع 2: تقدّم مبكر مستقر', en: 'Week 2: steady early progress' };
    }
    return MILESTONE_NOTES[week] ?? { ar: '', en: '' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Goal-completion test (defines targetReached / totalWeeksNeeded)
// ─────────────────────────────────────────────────────────────────────────────

function goalReached(
    goal: Goal,
    fatLostKg: number,
    muscleGainedKg: number,
    bodyFatDropPoints: number,
): boolean {
    switch (goal) {
        case 'fat_loss':
            return (
                fatLostKg >= TARGET_THRESHOLDS.fatLossKg ||
                bodyFatDropPoints >= TARGET_THRESHOLDS.fatLossBodyFatPoints
            );
        case 'lean_gain':
            return muscleGainedKg >= TARGET_THRESHOLDS.muscleGainKg;
        case 'recomposition':
            return (
                fatLostKg >= TARGET_THRESHOLDS.recompFatLossKg &&
                muscleGainedKg >= TARGET_THRESHOLDS.recompMuscleGainKg
            );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core simulation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pure week-by-week transformation simulation.
 *
 * Invalid / hostile inputs are coerced to safe defaults — the Layer-2 Zod
 * schema is the strict boundary; the engine stays total (never NaN, never
 * Infinity, never throws), exactly like `calculateMultiEsterPK`.
 */
export function calculateTimeline(rawInput: EngineInput): TimelineResult {
    const goal = safeEnum(rawInput.goal, GOAL_TYPES, 'fat_loss');
    const status = safeEnum(rawInput.biologicalStatus, BIO_STATUS_TYPES, 'natural');
    const experience = safeEnum(rawInput.experienceLevel, EXPERIENCE_LEVELS, 'intermediate');

    const startingWeightKg = safeNumber(rawInput.startingWeightKg, 85, 30, 300);
    const startingBodyFatPct = safeNumber(rawInput.startingBodyFatPct, 20, 3, 60);
    const caloricDeltaKcal = safeNumber(rawInput.caloricDeltaKcal, -500, -1500, 1500);
    const timelineWeeks = safeInt(rawInput.timelineWeeks, 12, 4, 52);

    const cap = hypertrophyCap(status, experience);
    const startingFatMassKg = (startingWeightKg * startingBodyFatPct) / 100;
    const startingLbmKg = startingWeightKg - startingFatMassKg;
    const startingBodyFatPctClamped = startingBodyFatPct;

    let fatMassKg = startingFatMassKg;
    let muscleGainedKgAccum = 0;

    const timeline: WeeklyDataPoint[] = [];
    let plateauWarningWeek = 0;
    let targetReachedWeek = 0;
    let prevWeight = startingWeightKg;

    for (let week = 1; week <= timelineWeeks; week++) {
        const adapt = adaptationFactor(week);
        const weeklyEnergyKcal = caloricDeltaKcal * 7 * adapt; // signed

        let muscleDeltaKg: number;
        let fatDeltaKg: number;

        if (weeklyEnergyKcal >= 0) {
            // Surplus / maintenance: partition energy into muscle (capped) then fat.
            const muscleFromEnergy = weeklyEnergyKcal / MUSCLE_KCAL_PER_KG;
            muscleDeltaKg = Math.min(cap, muscleFromEnergy);
            const energyToFat = weeklyEnergyKcal - muscleDeltaKg * MUSCLE_KCAL_PER_KG;
            fatDeltaKg = energyToFat / FAT_KCAL_PER_KG;
        } else {
            // Deficit: fat is the primary fuel; recomp allows a small muscle gain.
            fatDeltaKg = weeklyEnergyKcal / FAT_KCAL_PER_KG; // negative → fat loss
            muscleDeltaKg =
                goal === 'recomposition'
                    ? Math.min(cap * RECOMP_MUSCLE_FACTOR, -weeklyEnergyKcal / MUSCLE_KCAL_PER_KG * RECOMP_MUSCLE_FACTOR)
                    : 0;
        }

        fatMassKg = Math.max(0, fatMassKg + fatDeltaKg);
        muscleGainedKgAccum = Math.max(0, muscleGainedKgAccum + muscleDeltaKg);

        const leanMassKg = startingLbmKg + muscleGainedKgAccum;
        const tissueWeightKg = leanMassKg + fatMassKg;
        const waterPct = waterRetentionPct(status, week);
        const waterMassKg = (tissueWeightKg * waterPct) / 100;
        const estimatedWeightKg = tissueWeightKg + waterMassKg;
        const bodyFatPct = tissueWeightKg > 0 ? (fatMassKg / tissueWeightKg) * 100 : 0;

        // Plateau detection: 2 consecutive sub-threshold weekly changes (from week 2).
        const weeklyChange = estimatedWeightKg - prevWeight;
        const isPlateauWeek =
            week >= 3 && Math.abs(weeklyChange) < PLATEAU_WEEKLY_CHANGE_KG;
        if (isPlateauWeek && plateauWarningWeek === 0) {
            plateauWarningWeek = week;
        }

        // Goal-completion (first week the threshold is met).
        if (targetReachedWeek === 0) {
            const fatLostSoFar = startingFatMassKg - fatMassKg;
            const bfDrop = startingBodyFatPctClamped - bodyFatPct;
            if (goalReached(goal, fatLostSoFar, muscleGainedKgAccum, bfDrop)) {
                targetReachedWeek = week;
            }
        }

        const note = milestoneNote(
            week,
            plateauWarningWeek,
            week === timelineWeeks,
            status,
        );

        timeline.push({
            weekNumber: week,
            dateOffset: (week - 1) * 7,
            estimatedWeightKg: round2(estimatedWeightKg),
            estimatedLbmKg: round2(leanMassKg),
            estimatedFatMassKg: round2(fatMassKg),
            bodyFatPct: round2(bodyFatPct),
            waterRetentionPct: waterPct,
            milestoneNoteAr: note.ar,
            milestoneNoteEn: note.en,
        });

        prevWeight = estimatedWeightKg;
    }

    const finalFatMassKg = fatMassKg;
    const fatLostKg = startingFatMassKg - finalFatMassKg;
    const targetReached = targetReachedWeek > 0;
    const totalWeeksNeeded = targetReachedWeek > 0 ? targetReachedWeek : timelineWeeks;

    return {
        timeline,
        totalWeeksNeeded,
        targetReached,
        muscleGainedKg: round2(muscleGainedKgAccum),
        fatLostKg: round2(fatLostKg),
        plateauWarningWeek,
    };
}

/** Safe zero-overshoot default protocol — never NaN, never empty. */
export const DEFAULT_TIMELINE_INPUT: EngineInput = {
    startingWeightKg: 85,
    startingBodyFatPct: 20,
    goal: 'fat_loss',
    biologicalStatus: 'natural',
    experienceLevel: 'intermediate',
    caloricDeltaKcal: -500,
    timelineWeeks: 12,
};
