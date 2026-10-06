/**
 * lib/tools/engines/pct-timing.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #004 — Dynamic PCT Timing & Compound Washout Engine (Layer 1).
 *  Platform: MrXSteroid.com | Core: Pharmacokinetic & Pharmacodynamic (PK/PD)
 * ═══════════════════════════════════════════════════════════════════════════
 * Mathematical & Biological Formulation:
 *
 *   1. Multi-Compound Stack & Ester Interference:
 *      Clearance bottleneck is dictated by the slowest-clearing ester in the
 *      active stack.
 *
 *   2. Lipophilic Vd Extension (Adipose Storage):
 *      Lipophilic compounds (Deca, Equipoise, long-ester Test) store in adipose
 *      tissue. When Body Fat > 20%, effective elimination half-life extends:
 *      t½,eff = t½ · (1 + 0.01 · (BF% - 20) · 1.0)  [capped at 1.35x]
 *
 *   3. Organ Health Rate Modification:
 *      Hepatic/Renal clearance status adjusts elimination constant ke by ±15%:
 *      ke = (ln(2) / t½,eff) · (1 + clearanceRateAdjustment)
 *
 *   4. Inhibitory Threshold & HPTA Sensitivity:
 *      Exogenous load must cross below Threshold_HPTA before SERM/hCG launch:
 *      - Standard: ~150 ng/dL equivalent.
 *      - Long-term / Veteran (>12 mo / >5 cycles): ~100 ng/dL (desensitized LH/FSH).
 *
 *   5. Multi-Phase Clearance Zones:
 *      🔴 Red Zone (Suppressed)   : Total load > Threshold_HPTA (SERMs blocked).
 *      🟡 Yellow Zone (Transition): Clearance approaching threshold (hCG priming).
 *      🟢 Green Zone (Recovery)   : Total load < Threshold_HPTA (SERMs launch).
 *
 * PURE MODULE — no React, no DOM, no Supabase, no I/O.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Enumerations & Catalogs
// ─────────────────────────────────────────────────────────────────────────────

export type PctProtocol = 'none' | 'standard' | 'aggressive_mrx';

export const PCT_PROTOCOLS: readonly PctProtocol[] = [
    'none',
    'standard',
    'aggressive_mrx',
];

export type CycleHistoryExperience = 'first_cycle' | 'intermediate' | 'veteran_long_term';

export const CYCLE_HISTORY_OPTIONS: readonly CycleHistoryExperience[] = [
    'first_cycle',
    'intermediate',
    'veteran_long_term',
];

export type OrganHealthStatus = 'optimal' | 'normal' | 'compromised';

export const ORGAN_HEALTH_OPTIONS: readonly OrganHealthStatus[] = [
    'optimal',
    'normal',
    'compromised',
];

export const ESTER_PRESET_KEYS = [
    'test_propionate',
    'test_phenylpropionate',
    'test_enanthate',
    'test_cypionate',
    'nandrolone_phenylprop',
    'nandrolone_decanoate',
    'boldenone_undecylenate',
    'trenbolone_acetate',
    'trenbolone_enanthate',
    'drostanolone_propionate',
    'drostanolone_enanthate',
    'methenolone_enanthate',
    'oxandrolone_oral',
    'stanozolol_oral',
    'methandienone_oral',
    'custom',
] as const;

export type EsterPresetKey = (typeof ESTER_PRESET_KEYS)[number];

export interface EsterCatalogItem {
    id: EsterPresetKey;
    nameEn: string;
    nameAr: string;
    compoundFamily: string;
    halfLifeDays: number;
    isLipophilic: boolean;
    bioavailabilityF: number; // 0..1
    defaultDoseMg: number;
}

export const ESTER_CATALOG: Record<EsterPresetKey, EsterCatalogItem> = {
    test_propionate: {
        id: 'test_propionate',
        nameEn: 'Testosterone Propionate',
        nameAr: 'تستوستيرون بروبيونات',
        compoundFamily: 'Testosterone',
        halfLifeDays: 1.5,
        isLipophilic: false,
        bioavailabilityF: 0.83,
        defaultDoseMg: 100,
    },
    test_phenylpropionate: {
        id: 'test_phenylpropionate',
        nameEn: 'Testosterone Phenylpropionate',
        nameAr: 'تستوستيرون فينيل بروبيونات',
        compoundFamily: 'Testosterone',
        halfLifeDays: 2.5,
        isLipophilic: false,
        bioavailabilityF: 0.78,
        defaultDoseMg: 150,
    },
    test_enanthate: {
        id: 'test_enanthate',
        nameEn: 'Testosterone Enanthate',
        nameAr: 'تستوستيرون إينانثات',
        compoundFamily: 'Testosterone',
        halfLifeDays: 4.5,
        isLipophilic: true,
        bioavailabilityF: 0.70,
        defaultDoseMg: 250,
    },
    test_cypionate: {
        id: 'test_cypionate',
        nameEn: 'Testosterone Cypionate',
        nameAr: 'تستوستيرون سيبيونات',
        compoundFamily: 'Testosterone',
        halfLifeDays: 5.0,
        isLipophilic: true,
        bioavailabilityF: 0.69,
        defaultDoseMg: 250,
    },
    nandrolone_phenylprop: {
        id: 'nandrolone_phenylprop',
        nameEn: 'Nandrolone Phenylpropionate (NPP)',
        nameAr: 'ناندرولون فينيل بروبيونات (NPP)',
        compoundFamily: 'Nandrolone',
        halfLifeDays: 2.7,
        isLipophilic: true,
        bioavailabilityF: 0.73,
        defaultDoseMg: 100,
    },
    nandrolone_decanoate: {
        id: 'nandrolone_decanoate',
        nameEn: 'Nandrolone Decanoate (Deca)',
        nameAr: 'ناندرولون ديكانوات (ديكا)',
        compoundFamily: 'Nandrolone',
        halfLifeDays: 15.0,
        isLipophilic: true,
        bioavailabilityF: 0.62,
        defaultDoseMg: 200,
    },
    boldenone_undecylenate: {
        id: 'boldenone_undecylenate',
        nameEn: 'Boldenone Undecylenate (EQ)',
        nameAr: 'بولدينون أنديسيلينات (إكويبويز)',
        compoundFamily: 'Boldenone',
        halfLifeDays: 14.0,
        isLipophilic: true,
        bioavailabilityF: 0.61,
        defaultDoseMg: 300,
    },
    trenbolone_acetate: {
        id: 'trenbolone_acetate',
        nameEn: 'Trenbolone Acetate',
        nameAr: 'ترينبولون أسيتات',
        compoundFamily: 'Trenbolone',
        halfLifeDays: 1.0,
        isLipophilic: false,
        bioavailabilityF: 0.87,
        defaultDoseMg: 75,
    },
    trenbolone_enanthate: {
        id: 'trenbolone_enanthate',
        nameEn: 'Trenbolone Enanthate',
        nameAr: 'ترينبولون إينانثات',
        compoundFamily: 'Trenbolone',
        halfLifeDays: 6.0,
        isLipophilic: true,
        bioavailabilityF: 0.70,
        defaultDoseMg: 200,
    },
    drostanolone_propionate: {
        id: 'drostanolone_propionate',
        nameEn: 'Drostanolone Propionate (Masteron P)',
        nameAr: 'دروستانولون بروبيونات (ماستيرون)',
        compoundFamily: 'Drostanolone',
        halfLifeDays: 1.5,
        isLipophilic: false,
        bioavailabilityF: 0.83,
        defaultDoseMg: 100,
    },
    drostanolone_enanthate: {
        id: 'drostanolone_enanthate',
        nameEn: 'Drostanolone Enanthate (Masteron E)',
        nameAr: 'دروستانولون إينانثات (ماستيرون E)',
        compoundFamily: 'Drostanolone',
        halfLifeDays: 5.0,
        isLipophilic: true,
        bioavailabilityF: 0.70,
        defaultDoseMg: 200,
    },
    methenolone_enanthate: {
        id: 'methenolone_enanthate',
        nameEn: 'Methenolone Enanthate (Primobolan)',
        nameAr: 'ميثينولون إينانثات (بريموبولان)',
        compoundFamily: 'Methenolone',
        halfLifeDays: 5.5,
        isLipophilic: true,
        bioavailabilityF: 0.70,
        defaultDoseMg: 200,
    },
    oxandrolone_oral: {
        id: 'oxandrolone_oral',
        nameEn: 'Oxandrolone (Anavar)',
        nameAr: 'أوكساندرولون (أنفار)',
        compoundFamily: 'Oral',
        halfLifeDays: 0.45, // ~10-12 hours
        isLipophilic: false,
        bioavailabilityF: 0.95,
        defaultDoseMg: 40,
    },
    stanozolol_oral: {
        id: 'stanozolol_oral',
        nameEn: 'Stanozolol Oral (Winstrol)',
        nameAr: 'ستانوزولول فموي (وينسترول)',
        compoundFamily: 'Oral',
        halfLifeDays: 0.38, // ~9 hours
        isLipophilic: false,
        bioavailabilityF: 0.90,
        defaultDoseMg: 50,
    },
    methandienone_oral: {
        id: 'methandienone_oral',
        nameEn: 'Methandienone (Dianabol)',
        nameAr: 'ميثاندينون (دينابول)',
        compoundFamily: 'Oral',
        halfLifeDays: 0.25, // ~6 hours
        isLipophilic: false,
        bioavailabilityF: 0.90,
        defaultDoseMg: 30,
    },
    custom: {
        id: 'custom',
        nameEn: 'Custom Compound',
        nameAr: 'مركب مخصص',
        compoundFamily: 'Custom',
        halfLifeDays: 5.0,
        isLipophilic: true,
        bioavailabilityF: 0.70,
        defaultDoseMg: 250,
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Physiological & Simulation Constants
// ─────────────────────────────────────────────────────────────────────────────

export const DAYS_PER_WEEK = 7;
export const DEFAULT_CLEARANCE_THRESHOLD_PCT = 5;
export const ENDO_LOW_PCT = 5;
export const ENDO_WASHOUT_END_PCT = 15;
export const RECOVERY_LAMBDA = 0.12;
export const RECOVERY_OBSERVATION_WEEKS = 20;
export const RECOVERY_COMPLETE_THRESHOLD = 90;

export const PCT_DURATIONS_WEEKS: Record<PctProtocol, number> = {
    none: 0,
    standard: 4,
    aggressive_mrx: 6,
};

export const PCT_BOOST_FACTORS: Record<PctProtocol, number> = {
    none: 0.4,
    standard: 1.0,
    aggressive_mrx: 1.6,
};

export const MIN_HALF_LIFE_DAYS = 0.2;
export const MAX_HALF_LIFE_DAYS = 30;

/** Baseline physiological serum reference in ng/dL */
export const PHYSIOLOGICAL_T_BASELINE_NGDL = 600;

// ─────────────────────────────────────────────────────────────────────────────
// Compound & Protocol Input Types (v2.0)
// ─────────────────────────────────────────────────────────────────────────────

export interface StackCompoundItem {
    id: string;
    presetKey: EsterPresetKey;
    customName?: string;
    halfLifeDays: number;
    doseMgPerWeek: number;
    isLipophilic: boolean;
}

export interface BioModifiersInput {
    bodyFatPct: number; // 5..45%
    organHealth: OrganHealthStatus; // optimal (+15%), normal (0%), compromised (-15%)
    cycleHistory: CycleHistoryExperience; // adjusts threshold (100 vs 150 ng/dL)
}

export interface DynamicWashoutInput {
    stack: StackCompoundItem[];
    weeksOnCycle: number;
    lastInjectionDateIso: string; // ISO-8601 date (YYYY-MM-DD)
    bioModifiers: BioModifiersInput;
    clearanceThresholdPct?: number;
    pctProtocol: PctProtocol;
}

export type ClearanceZone = 'RED_SUPPRESSED' | 'YELLOW_TRANSITION' | 'GREEN_RECOVERY';

export interface DailyClearancePoint {
    day: number;
    dateIso: string;
    totalSerumLoadPct: number; // 0..100% relative to peak steady state
    estimatedSerumNgDl: number; // absolute equivalent load
    zone: ClearanceZone;
    isReadyForPct: boolean;
}

export type PctPhase = 'active_cycle' | 'washout' | 'pct_active' | 'recovery';

export interface WeeklyDataPoint {
    weekNumber: number;
    daysSinceLastDose: number;
    serumConcentrationPct: number;
    phase: PctPhase;
    pctActive: boolean;
    endogenousTestosteronePct: number;
    milestoneNoteAr: string;
    milestoneNoteEn: string;
}

export interface PctTimingResult {
    timeline: WeeklyDataPoint[];
    dailyWashout: DailyClearancePoint[];
    washoutWeeks: number;
    washoutDays: number;
    pctStartWeek: number;
    pctDurationWeeks: number;
    fullRecoveryWeek: number;
    totalTimelineWeeks: number;
    finalTestosteronePct: number;

    // v2.0 Smart Output Extensions
    limitingCompoundName: string;
    limitingHalfLifeDays: number;
    effectiveHalfLifeDays: number;
    hptaThresholdNgDl: number;
    pctLaunchDateIso: string;
    daysUntilPctLaunch: number;
    confidenceScorePct: number;
    hasConflictingEsters: boolean;
    conflictWarningEn?: string;
    conflictWarningAr?: string;
}

// Legacy Layer-1 Engine Input Interface (Preserved for compatibility)
export interface EngineInput {
    compoundHalfLifeDays: number;
    weeksOnCycle: number;
    clearanceThresholdPct: number;
    pctProtocol: PctProtocol;
    // Optional v2 extensions passed through
    stack?: StackCompoundItem[];
    bioModifiers?: Partial<BioModifiersInput>;
    lastInjectionDateIso?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mathematical Helpers
// ─────────────────────────────────────────────────────────────────────────────

const round2 = (value: number): number => Math.round(value * 100) / 100;
const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

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

/**
 * Calculates effective half-life taking into account lipophilicity and body fat.
 * Deca / Boldenone / long-chain esters partition into adipose tissue, extending t½.
 */
export function calculateEffectiveHalfLife(
    baseHalfLife: number,
    isLipophilic: boolean,
    bodyFatPct: number,
): number {
    if (!isLipophilic || bodyFatPct <= 20) {
        return baseHalfLife;
    }
    // Each 1% body fat above 20% extends effective elimination half-life by 1% (capped at +35%)
    const fatExcess = Math.max(0, bodyFatPct - 20);
    const extensionMultiplier = 1 + clamp(fatExcess * 0.01, 0, 0.35);
    return round2(baseHalfLife * extensionMultiplier);
}

/**
 * Calculates clearance rate multiplier based on organ health status.
 */
export function getOrganClearanceMultiplier(status: OrganHealthStatus): number {
    switch (status) {
        case 'optimal':
            return 1.15; // 15% faster clearance
        case 'compromised':
            return 0.85; // 15% slower clearance
        case 'normal':
        default:
            return 1.0;
    }
}

/**
 * Serum concentration (% of peak) days after the last dose:
 * C(t) = 100 · (1/2) ^ (t / t½,eff)
 */
export function serumPctAfter(days: number, halfLifeDays: number): number {
    if (days <= 0 || halfLifeDays <= 0) return 100;
    return round2(100 * Math.pow(0.5, days / halfLifeDays));
}

/**
 * Days required for serum to drop below thresholdPct of peak.
 */
export function daysToClearance(halfLifeDays: number, thresholdPct: number): number {
    if (halfLifeDays <= 0 || thresholdPct >= 100) return 0;
    return (halfLifeDays * Math.log2(100 / thresholdPct)) / DAYS_PER_WEEK; // in weeks
}

/** Exponential recovery fraction (0→1) over weeks since PCT onset. */
export function endoRecoveryFraction(weeks: number, pctBoost: number): number {
    if (weeks <= 0) return 0;
    return 1 - Math.exp(-RECOVERY_LAMBDA * pctBoost * weeks);
}

// ─────────────────────────────────────────────────────────────────────────────
// Milestone Notes
// ─────────────────────────────────────────────────────────────────────────────

interface MilestoneNote {
    ar: string;
    en: string;
}

function milestoneNote(
    week: number,
    phase: PctPhase,
    cycleEndWeek: number,
    pctStartWeek: number,
    pctDurationWeeks: number,
    fullRecoveryWeek: number,
    isFinal: boolean,
): MilestoneNote {
    if (isFinal) {
        return {
            ar: 'اكتمل المنحنى الزمني للتطهير والتعافي',
            en: 'Washout & recovery time-course complete',
        };
    }
    if (week === 1) {
        return {
            ar: 'الأسبوع 1: الحمل الأندروجيني في ذروته — تثبيط محوري عميق',
            en: 'Week 1: peak androgen load — deep axis suppression',
        };
    }
    if (week === cycleEndWeek) {
        return {
            ar: `الأسبوع ${cycleEndWeek}: الجرعة الأخيرة — بدء اضمحلال المركب`,
            en: `Week ${cycleEndWeek}: last dose — compound elimination begins`,
        };
    }
    if (week === pctStartWeek && pctStartWeek > cycleEndWeek) {
        return {
            ar: `الأسبوع ${pctStartWeek}: انخفاض الحمل تحت عتبة التثبيط — بدء PCT`,
            en: `Week ${pctStartWeek}: compound below threshold — PCT launch window`,
        };
    }
    if (pctDurationWeeks > 0 && week === pctStartWeek + pctDurationWeeks) {
        return {
            ar: `الأسبوع ${week}: نهاية نافذة PCT — استمرار ارتداد المحور`,
            en: `Week ${week}: PCT window ends — axis rebound continues`,
        };
    }
    if (fullRecoveryWeek > 0 && week === fullRecoveryWeek) {
        return {
            ar: `الأسبوع ${fullRecoveryWeek}: التستوستيرون الداخلي ≥ ٩٠٪`,
            en: `Week ${fullRecoveryWeek}: endogenous T restored ≥ 90%`,
        };
    }
    if (phase === 'washout') {
        return {
            ar: 'مرحلة التطهير: انحسار أُسّي للمركب الخارجي',
            en: 'Washout phase: exponential compound clearance',
        };
    }
    return { ar: '', en: '' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic PK/PD Washout Engine (Core v2.0)
// ─────────────────────────────────────────────────────────────────────────────

export function calculateDynamicPctWashout(input: DynamicWashoutInput): PctTimingResult {
    const rawWeeks = safeInt(input.weeksOnCycle, 12, 4, 24);
    const bodyFat = safeNumber(input.bioModifiers.bodyFatPct, 15, 5, 45);
    const organHealth = safeEnum(input.bioModifiers.organHealth, ORGAN_HEALTH_OPTIONS, 'normal');
    const cycleHistory = safeEnum(input.bioModifiers.cycleHistory, CYCLE_HISTORY_OPTIONS, 'intermediate');
    const pct = safeEnum(input.pctProtocol, PCT_PROTOCOLS, 'standard');

    // 1. Identify Stack & Limiting (Slowest) Ester
    const stack: StackCompoundItem[] = Array.isArray(input.stack) && input.stack.length > 0
        ? input.stack
        : [
            {
                id: 'default_test_e',
                presetKey: 'test_enanthate',
                halfLifeDays: 4.5,
                doseMgPerWeek: 500,
                isLipophilic: true,
            },
        ];

    // Find the compound with the longest half-life (Slowest Ester Dictates Timeline)
    let limiting = stack[0];
    let minHalfLife = stack[0].halfLifeDays;
    let maxHalfLife = stack[0].halfLifeDays;

    for (const c of stack) {
        if (c.halfLifeDays > limiting.halfLifeDays) {
            limiting = c;
        }
        if (c.halfLifeDays < minHalfLife) minHalfLife = c.halfLifeDays;
        if (c.halfLifeDays > maxHalfLife) maxHalfLife = c.halfLifeDays;
    }

    const hasConflictingEsters = stack.length > 1 && (maxHalfLife - minHalfLife >= 5);
    const conflictWarningEn = hasConflictingEsters
        ? `Mixed short and long ester stack detected (${minHalfLife}d vs ${maxHalfLife}d). The slowest compound (${limiting.presetKey}) determines the washout gate.`
        : undefined;
    const conflictWarningAr = hasConflictingEsters
        ? `تم رصد إسترات سريعة وبطيئة في نفس الكورس (${minHalfLife} يوم مقابل ${maxHalfLife} يوم). المركب الأبطأ يحدد موعد بدء الـ PCT.`
        : undefined;

    // 2. Adjust Half-Life based on Bio-Modifiers (Body Fat & Organ Health)
    const organMultiplier = getOrganClearanceMultiplier(organHealth);
    const effectiveHalfLife = round2(
        calculateEffectiveHalfLife(limiting.halfLifeDays, limiting.isLipophilic, bodyFat) / organMultiplier
    );

    // 3. Inhibitory Threshold Gate
    // Long-term/Veteran requires lower threshold (100 ng/dL vs 150 ng/dL) due to receptor desensitization
    const hptaThresholdNgDl = cycleHistory === 'veteran_long_term' ? 100 : 150;
    const clearanceThresholdPct = safeNumber(
        input.clearanceThresholdPct ?? round2((hptaThresholdNgDl / PHYSIOLOGICAL_T_BASELINE_NGDL) * 100),
        DEFAULT_CLEARANCE_THRESHOLD_PCT,
        1,
        20,
    );

    // 4. Washout Window Calculation
    const washoutWeeksRaw = daysToClearance(effectiveHalfLife, clearanceThresholdPct);
    const washoutWeeks = Math.max(1, Math.ceil(washoutWeeksRaw));
    const washoutDays = Math.ceil(washoutWeeksRaw * DAYS_PER_WEEK);

    const pctStartWeek = rawWeeks + washoutWeeks;
    const pctDuration = PCT_DURATIONS_WEEKS[pct];
    const pctEndWeek = pctStartWeek + pctDuration;
    const totalTimelineWeeks = pctEndWeek + RECOVERY_OBSERVATION_WEEKS;
    const pctBoost = PCT_BOOST_FACTORS[pct];

    // Date computation
    const lastDate = input.lastInjectionDateIso && !Number.isNaN(Date.parse(input.lastInjectionDateIso))
        ? new Date(input.lastInjectionDateIso)
        : new Date();
    const launchDate = new Date(lastDate.getTime() + washoutDays * 24 * 60 * 60 * 1000);
    const pctLaunchDateIso = launchDate.toISOString().slice(0, 10);
    const daysUntilPctLaunch = Math.max(0, Math.ceil((launchDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    // Confidence score based on presence of detailed bio-modifiers
    let confidenceScorePct = 90;
    if (input.bioModifiers.bodyFatPct) confidenceScorePct += 3;
    if (input.bioModifiers.organHealth !== 'normal') confidenceScorePct += 2;
    confidenceScorePct = Math.min(98, confidenceScorePct);

    // 5. Build Daily Clearance Simulation (First 45 Days Post-Cycle)
    const dailyWashout: DailyClearancePoint[] = [];
    const maxDailySim = Math.max(45, washoutDays + 14);

    for (let day = 0; day <= maxDailySim; day++) {
        const currentDate = new Date(lastDate.getTime() + day * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const serumPct = serumPctAfter(day, effectiveHalfLife);
        const estNgDl = round2((serumPct / 100) * 1200); // 1200 ng/dL peak assumption

        let zone: ClearanceZone = 'RED_SUPPRESSED';
        if (serumPct <= clearanceThresholdPct) {
            zone = 'GREEN_RECOVERY';
        } else if (serumPct <= clearanceThresholdPct * 1.8) {
            zone = 'YELLOW_TRANSITION';
        }

        dailyWashout.push({
            day,
            dateIso: currentDate,
            totalSerumLoadPct: serumPct,
            estimatedSerumNgDl: estNgDl,
            zone,
            isReadyForPct: serumPct <= clearanceThresholdPct,
        });
    }

    // 6. Build Weekly Trajectory Timeline
    const timeline: WeeklyDataPoint[] = [];
    let fullRecoveryWeek = 0;

    for (let week = 1; week <= totalTimelineWeeks; week++) {
        let phase: PctPhase;
        let serum: number;
        let endoT: number;
        let pctActive = false;

        if (week <= rawWeeks) {
            phase = 'active_cycle';
            serum = 100;
            endoT = ENDO_LOW_PCT;
        } else if (week < pctStartWeek) {
            phase = 'washout';
            const daysSince = (week - rawWeeks) * DAYS_PER_WEEK;
            serum = serumPctAfter(daysSince, effectiveHalfLife);
            const dropFraction = clamp((100 - serum) / (100 - clearanceThresholdPct), 0, 1);
            endoT = ENDO_LOW_PCT + (ENDO_WASHOUT_END_PCT - ENDO_LOW_PCT) * dropFraction;
        } else if (pctDuration > 0 && week <= pctEndWeek) {
            phase = 'pct_active';
            pctActive = true;
            const daysSince = (week - rawWeeks) * DAYS_PER_WEEK;
            serum = serumPctAfter(daysSince, effectiveHalfLife);
            const weeksSincePct = week - pctStartWeek + 1;
            const fraction = endoRecoveryFraction(weeksSincePct, pctBoost);
            endoT = ENDO_WASHOUT_END_PCT + (100 - ENDO_WASHOUT_END_PCT) * fraction;
        } else {
            phase = 'recovery';
            const daysSince = (week - rawWeeks) * DAYS_PER_WEEK;
            serum = serumPctAfter(daysSince, effectiveHalfLife);
            const weeksSincePct = Math.max(1, week - pctStartWeek);
            const fraction = endoRecoveryFraction(weeksSincePct, pctBoost);
            endoT = ENDO_WASHOUT_END_PCT + (100 - ENDO_WASHOUT_END_PCT) * fraction;
        }

        if (
            (phase === 'pct_active' || phase === 'recovery') &&
            fullRecoveryWeek === 0 &&
            endoT >= RECOVERY_COMPLETE_THRESHOLD
        ) {
            fullRecoveryWeek = week;
        }

        const note = milestoneNote(
            week,
            phase,
            rawWeeks,
            pctStartWeek,
            pctDuration,
            fullRecoveryWeek,
            week === totalTimelineWeeks,
        );

        timeline.push({
            weekNumber: week,
            daysSinceLastDose: week > rawWeeks ? (week - rawWeeks) * DAYS_PER_WEEK : 0,
            serumConcentrationPct: round2(serum),
            phase,
            pctActive,
            endogenousTestosteronePct: round2(Math.min(100, endoT)),
            milestoneNoteAr: note.ar,
            milestoneNoteEn: note.en,
        });
    }

    const finalPoint = timeline[timeline.length - 1];

    const limitingCatalog = ESTER_CATALOG[limiting.presetKey];
    const limitingName = limiting.customName || limitingCatalog?.nameEn || limiting.presetKey;

    return {
        timeline,
        dailyWashout,
        washoutWeeks,
        washoutDays,
        pctStartWeek,
        pctDurationWeeks: pctDuration,
        fullRecoveryWeek,
        totalTimelineWeeks,
        finalTestosteronePct: finalPoint ? finalPoint.endogenousTestosteronePct : 50,
        limitingCompoundName: limitingName,
        limitingHalfLifeDays: limiting.halfLifeDays,
        effectiveHalfLifeDays: effectiveHalfLife,
        hptaThresholdNgDl,
        pctLaunchDateIso,
        daysUntilPctLaunch,
        confidenceScorePct,
        hasConflictingEsters,
        conflictWarningEn,
        conflictWarningAr,
    };
}

/**
 * Backward-compatible wrapper for Layer-1 calculatePctTiming.
 */
export function calculatePctTiming(rawInput: EngineInput): PctTimingResult {
    const halfLife = safeNumber(rawInput.compoundHalfLifeDays, 5, MIN_HALF_LIFE_DAYS, MAX_HALF_LIFE_DAYS);
    const weeks = safeInt(rawInput.weeksOnCycle, 12, 4, 24);
    const threshold = safeNumber(rawInput.clearanceThresholdPct, DEFAULT_CLEARANCE_THRESHOLD_PCT, 1, 20);
    const pct = safeEnum(rawInput.pctProtocol, PCT_PROTOCOLS, 'standard');

    // Build stack item from single compound input if stack not provided
    const stack: StackCompoundItem[] = rawInput.stack && rawInput.stack.length > 0
        ? rawInput.stack
        : [
            {
                id: 'input_compound',
                presetKey: 'custom',
                halfLifeDays: halfLife,
                doseMgPerWeek: 500,
                isLipophilic: halfLife > 3,
            },
        ];

    const bioModifiers: BioModifiersInput = {
        bodyFatPct: rawInput.bioModifiers?.bodyFatPct ?? 15,
        organHealth: rawInput.bioModifiers?.organHealth ?? 'normal',
        cycleHistory: rawInput.bioModifiers?.cycleHistory ?? 'intermediate',
    };

    return calculateDynamicPctWashout({
        stack,
        weeksOnCycle: weeks,
        clearanceThresholdPct: threshold,
        pctProtocol: pct,
        bioModifiers,
        lastInjectionDateIso: rawInput.lastInjectionDateIso ?? new Date().toISOString().slice(0, 10),
    });
}

/** Safe default protocol — Testosterone Enanthate (~4.5d half-life), 12w cycle, standard PCT. */
export const DEFAULT_PCT_TIMING_INPUT: EngineInput = {
    compoundHalfLifeDays: 4.5,
    weeksOnCycle: 12,
    clearanceThresholdPct: DEFAULT_CLEARANCE_THRESHOLD_PCT,
    pctProtocol: 'standard',
};
