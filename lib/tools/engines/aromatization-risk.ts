/**
 * lib/tools/engines/aromatization-risk.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #002 — Aromatization Risk & Estradiol (E2) Management Modeler
 *  (Layer 1).
 * ═══════════════════════════════════════════════════════════════════════════
 * Week-by-week estradiol trajectory across two phases:
 *
 *   On-cycle  : E2 climbs toward steady-state as aromatase converts exogenous
 *               androgen load to estradiol.
 *               E2(w) = E2_base + ΔE2_max · (1 − e^(−w/τ_rise))
 *               ΔE2_max = MAX_E2_ELEVATION · aromRate · doseScale · bfFactor
 *                          · (1 − aiSuppression)
 *   Post-cycle: E2 decays exponentially back toward baseline as residual
 *               aromatase substrate clears.
 *               E2(w) = E2_base + (E2_peak − E2_base) · e^(−Δw/τ_decay)
 *
 * This legacy model is retained only as an illustrative arithmetic scenario.
 * Its formula and parameters have not been validated against clinical data;
 * it does not estimate an individual's estradiol level or clinical risk.
 *
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O.
 */
// ─────────────────────────────────────────────────────────────────────────────
// Enumerations (frozen tuples so the Layer-2 Zod enum keeps the exact union)
// ─────────────────────────────────────────────────────────────────────────────

export type CompoundType =
    | 'testosterone'
    | 'methandienone'
    | 'boldenone'
    | 'nandrolone'
    | 'oxymetholone'
    | 'trenbolone';

export type AiProtocol = 'none' | 'mild' | 'standard' | 'aggressive';

export const COMPOUND_TYPES: readonly CompoundType[] = [
    'testosterone',
    'methandienone',
    'boldenone',
    'nandrolone',
    'oxymetholone',
    'trenbolone',
];

export const AI_PROTOCOLS: readonly AiProtocol[] = [
    'none',
    'mild',
    'standard',
    'aggressive',
];

// ─────────────────────────────────────────────────────────────────────────────
// Legacy scenario parameters. These values are unvalidated and are not
// physiological reference values, dosing guidance, or clinical thresholds.
// ─────────────────────────────────────────────────────────────────────────────

/** Arbitrary model baseline (pg/mL); not a clinical reference value. */
export const BASELINE_E2 = 30;
/**
 * Arbitrary maximum elevation parameter retained for reproducibility of the
 * legacy scenario equation. It has no verified empirical or clinical basis.
 */
export const MAX_E2_ELEVATION = 100;
/** Reference weekly dose (mg) — the 1.0× dose-scaling anchor. */
export const REFERENCE_DOSE_MG = 500;
/** E2 rise time-constant (weeks) — steady-state reached in ~3× this. */
export const E2_RISE_TAU_WEEKS = 3;
/** E2 post-cycle decay time-constant (weeks) — faster than rise. */
export const E2_DECAY_TAU_WEEKS = 2;
/** Weeks of post-cycle E2 observation simulated after the cycle ends. */
export const POST_CYCLE_OBSERVATION_WEEKS = 8;

/** Unvalidated relative model multipliers, not biological conversion rates. */
export const AROMATIZATION_RATES: Record<CompoundType, number> = {
    testosterone: 1.0, // direct aromatase substrate
    methandienone: 0.9, // Dianabol — highly estrogenic
    boldenone: 0.5, // Equipoise — moderate, slower conversion
    nandrolone: 0.2, // Deca — low direct aromatization, progestogenic
    oxymetholone: 0.3, // Anadrol — low direct, estrogenic via ER pathway
    trenbolone: 0.0, // 5α-reduced — cannot convert to estrogen
};

/** Unvalidated hypothetical scenario factors; they are not medication doses. */
export const AI_SUPPRESSION_FACTORS: Record<AiProtocol, number> = {
    none: 0.0,
    mild: 0.5,
    standard: 0.72,
    aggressive: 0.88,
};

/** Unvalidated body-fat scenario multiplier; not a measured biological value. */
export function bodyFatFactor(bodyFatPct: number): number {
    return 0.5 + bodyFatPct / 30;
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EngineInput {
    /** Active on-cycle duration (weeks), 4–24. */
    weeksOnCycle: number;
    /** Weekly androgen dose (mg), 100–2000. */
    weeklyDoseMg: number;
    /** Body-fat percentage, 6–40. */
    bodyFatPct: number;
    /** Primary aromatising compound in the stack. */
    compoundType: CompoundType;
    /** Aromatase-inhibitor protocol (none / mild / standard / aggressive). */
    aiProtocol: AiProtocol;
}

export type E2RiskZone = 'not_assessed';

export type AromatizationPhase = 'on_cycle' | 'post_cycle';

export interface WeeklyDataPoint {
    weekNumber: number;
    phase: AromatizationPhase;
    /** Projected estradiol level (pg/mL). */
    estradiolPgml: number;
    /** Aromatase pathway activity as % of max (0–100). */
    aromataseActivityPct: number;
    /** AI suppression as % (0–100) — constant during on-cycle, 0 post-cycle. */
    aiSuppressionPct: number;
    riskZone: E2RiskZone;
    milestoneNoteAr: string;
    milestoneNoteEn: string;
}

export interface AromatizationRiskResult {
    timeline: WeeklyDataPoint[];
    /** Steady-state E2 the curve approaches (pg/mL) — the theoretical ceiling. */
    steadyStateE2: number;
    /** Peak E2 reached at end of cycle (pg/mL). */
    peakE2: number;
    /** Final E2 at the end of post-cycle observation (pg/mL). */
    finalE2: number;
    /** Risk zone at peak E2. */
    peakRiskZone: E2RiskZone;
    /** Aromatization propensity of the selected compound (0–1). */
    compoundAromatizationRate: number;
    /** Effective AI suppression factor (0–1). */
    aiSuppressionFactor: number;
    /** Body-fat-derived aromatase multiplier. */
    bodyFatMultiplier: number;
    /** Unsupported clinical risk metrics are deliberately unavailable. */
    gynoRiskScore: null;
    waterRetentionRiskScore: null;
    crashRiskScore: null;
    /** No medication recommendation is generated by this unvalidated model. */
    aiRecommendation: 'not_assessed';
    totalTimelineWeeks: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const round2 = (value: number): number => Math.round(value * 100) / 100;

const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

const safeNumber = (value: number, fallback: number, min: number, max: number): number => {
    const v = Number.isFinite(value) ? value : fallback;
    return clamp(v, min, max);
};

const safeEnum = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => {
    return typeof value === 'string' && (allowed as readonly string[]).includes(value)
        ? (value as T)
        : fallback;
};

/**
 * Steady-state E2 ceiling for a given protocol.
 * ΔE2_max = MAX_E2_ELEVATION · aromRate · doseScale · bfFactor · (1 − aiSupp)
 */
export function steadyStateE2For(input: EngineInput): number {
    const compound = safeEnum(input.compoundType, COMPOUND_TYPES, 'testosterone');
    const ai = safeEnum(input.aiProtocol, AI_PROTOCOLS, 'none');
    const dose = safeNumber(input.weeklyDoseMg, 500, 100, 2000);
    const bf = safeNumber(input.bodyFatPct, 15, 6, 40);

    const aromRate = AROMATIZATION_RATES[compound];
    const aiSupp = AI_SUPPRESSION_FACTORS[ai];
    const bfFactor = bodyFatFactor(bf);
    const doseScale = dose / REFERENCE_DOSE_MG;

    const deltaMax = MAX_E2_ELEVATION * aromRate * doseScale * bfFactor * (1 - aiSupp);
    return BASELINE_E2 + deltaMax;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bilingual milestone notes for the legacy scenario curve
// ─────────────────────────────────────────────────────────────────────────────

interface MilestoneNote {
    ar: string;
    en: string;
}

function milestoneNote(
    week: number,
    phase: AromatizationPhase,
    weeksOnCycle: number,
    e2: number,
    isFinal: boolean,
): MilestoneNote {
    if (isFinal) {
        return {
            ar: 'اكتمل السيناريو الحسابي؛ ليس قياساً أو توقعاً سريرياً',
            en: 'Arithmetic scenario complete; not a measurement or clinical prediction',
        };
    }
    if (week === 1) {
        return {
            ar: 'الأسبوع 1: نقطة أولى في المنحنى الحسابي',
            en: 'Week 1: first point in the arithmetic curve',
        };
    }
    if (week === weeksOnCycle) {
        return {
            ar: `الأسبوع ${weeksOnCycle}: نهاية مرحلة السيناريو المدخلة — ${e2.toFixed(0)} pg/mL`,
            en: `Week ${weeksOnCycle}: end of the entered scenario phase — ${e2.toFixed(0)} pg/mL`,
        };
    }
    if (phase === 'post_cycle' && week === weeksOnCycle + 1) {
        return {
            ar: 'بداية الجزء الحسابي اللاحق؛ لا يمثل تعافياً أو تصفية دوائية',
            en: 'Start of the later arithmetic segment; not recovery or drug clearance',
        };
    }
    if (phase === 'post_cycle') {
        return {
            ar: 'الجزء الحسابي اللاحق؛ لا يثبت تعافياً أو عودةً إلى الطبيعي',
            en: 'Later arithmetic segment; it does not establish recovery or normalization',
        };
    }
    return { ar: '', en: '' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Core simulation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pure week-by-week estradiol trajectory simulation.
 *
 * Invalid / hostile inputs are coerced to safe defaults — the Layer-2 Zod
 * schema is the strict boundary; the engine stays total (never NaN, never
 * Infinity, never throws), exactly like `calculateHptaRecovery`.
 */
export function calculateAromatizationRisk(rawInput: EngineInput): AromatizationRiskResult {
    const compound = safeEnum(rawInput.compoundType, COMPOUND_TYPES, 'testosterone');
    const ai = safeEnum(rawInput.aiProtocol, AI_PROTOCOLS, 'none');
    const weeksOnCycle = Math.round(safeNumber(rawInput.weeksOnCycle, 12, 4, 24));
    const dose = safeNumber(rawInput.weeklyDoseMg, 500, 100, 2000);
    const bf = safeNumber(rawInput.bodyFatPct, 15, 6, 40);

    const aromRate = AROMATIZATION_RATES[compound];
    const aiSupp = AI_SUPPRESSION_FACTORS[ai];
    const bfFactor = bodyFatFactor(bf);
    const doseScale = dose / REFERENCE_DOSE_MG;

    const steadyStateE2 = steadyStateE2For({ weeksOnCycle, weeklyDoseMg: dose, bodyFatPct: bf, compoundType: compound, aiProtocol: ai });

    const totalTimelineWeeks = weeksOnCycle + POST_CYCLE_OBSERVATION_WEEKS;
    const timeline: WeeklyDataPoint[] = [];
    let peakE2 = BASELINE_E2;

    for (let week = 1; week <= totalTimelineWeeks; week++) {
        let phase: AromatizationPhase;
        let e2: number;

        if (week <= weeksOnCycle) {
            // ── On-cycle: E2 rises exponentially toward steady-state ──
            phase = 'on_cycle';
            const fraction = 1 - Math.exp(-week / E2_RISE_TAU_WEEKS);
            e2 = BASELINE_E2 + (steadyStateE2 - BASELINE_E2) * fraction;
            peakE2 = Math.max(peakE2, e2);
        } else {
            // ── Post-cycle: E2 decays exponentially toward baseline ──
            phase = 'post_cycle';
            const deltaWeek = week - weeksOnCycle;
            const decayFraction = Math.exp(-deltaWeek / E2_DECAY_TAU_WEEKS);
            e2 = BASELINE_E2 + (peakE2 - BASELINE_E2) * decayFraction;
        }

        e2 = round2(clamp(e2, 1, 500));
        const aromataseActivity = aromRate * doseScale * bfFactor * (phase === 'on_cycle' ? 1 : decayFractionAt(week, weeksOnCycle));
        const aiActive = phase === 'on_cycle' ? aiSupp : 0;

        const note = milestoneNote(
            week,
            phase,
            weeksOnCycle,
            e2,
            week === totalTimelineWeeks,
        );

        timeline.push({
            weekNumber: week,
            phase,
            estradiolPgml: e2,
            aromataseActivityPct: round2(clamp(aromataseActivity * 100, 0, 100)),
            aiSuppressionPct: round2(aiActive * 100),
            riskZone: 'not_assessed',
            milestoneNoteAr: note.ar,
            milestoneNoteEn: note.en,
        });
    }

    const finalE2 = timeline[timeline.length - 1].estradiolPgml;
    return {
        timeline,
        steadyStateE2: round2(steadyStateE2),
        peakE2: round2(peakE2),
        finalE2,
        peakRiskZone: 'not_assessed',
        compoundAromatizationRate: aromRate,
        aiSuppressionFactor: aiSupp,
        bodyFatMultiplier: round2(bfFactor),
        gynoRiskScore: null,
        waterRetentionRiskScore: null,
        crashRiskScore: null,
        aiRecommendation: 'not_assessed',
        totalTimelineWeeks,
    };
}

/** Post-cycle aromatase activity decay fraction (mirrors E2 decay shape). */
function decayFractionAt(week: number, weeksOnCycle: number): number {
    if (week <= weeksOnCycle) return 1;
    return Math.exp(-(week - weeksOnCycle) / E2_DECAY_TAU_WEEKS);
}

/** Legacy model defaults only; they are not a recommended protocol or guidance. */
export const DEFAULT_AROMATIZATION_INPUT: EngineInput = {
    weeksOnCycle: 12,
    weeklyDoseMg: 500,
    bodyFatPct: 15,
    compoundType: 'testosterone',
    aiProtocol: 'none',
};
