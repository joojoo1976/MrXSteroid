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
 * The model encodes three pillars from "Mr. X-Steroid Book" Ch. 4 (Estrogen
 * Management): (1) compound-specific aromatization propensity, (2) adipose-
 * tissue aromatase density (body-fat scaling), and (3) AI (aromatase
 * inhibitor) enzyme suppression. Risk is bucketed into five zones — crashed,
 * suppressed, optimal, elevated, critical — each with a bilingual clinical
 * note.
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
// Physiological constants (Tool #002 spec §2)
// ─────────────────────────────────────────────────────────────────────────────

/** Baseline estradiol for a healthy adult male (mid-range, pg/mL). */
export const BASELINE_E2 = 30;
/** E2 reference band lower bound (pg/mL) — below is "suppressed". */
export const E2_OPTIMAL_LOW = 20;
/** E2 reference band upper bound (pg/mL) — above is "elevated". */
export const E2_OPTIMAL_HIGH = 45;
/** E2 above this is "critical" (gyno-risk threshold, pg/mL). */
export const E2_CRITICAL_THRESHOLD = 80;
/** E2 below this is "crashed" (AI overuse, joint/libido crash, pg/mL). */
export const E2_CRASH_THRESHOLD = 10;
/**
 * Max E2 elevation at the reference protocol (500 mg/wk testosterone, 15% BF,
 * no AI). Real-world peak E2 at that protocol lands ~80-120 pg/mL above
 * baseline, per Mr. X-Steroid Book Ch. 4.
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

/**
 * Compound-specific aromatization propensity (fraction of androgen load that
 * the aromatase enzyme converts to estradiol). Trenbolone is 5α-reduced and
 * cannot aromatize; testosterone is the canonical substrate. Per Mr. X-Steroid
 * Book Ch. 4.
 */
export const AROMATIZATION_RATES: Record<CompoundType, number> = {
    testosterone: 1.0, // direct aromatase substrate
    methandienone: 0.9, // Dianabol — highly estrogenic
    boldenone: 0.5, // Equipoise — moderate, slower conversion
    nandrolone: 0.2, // Deca — low direct aromatization, progestogenic
    oxymetholone: 0.3, // Anadrol — low direct, estrogenic via ER pathway
    trenbolone: 0.0, // 5α-reduced — cannot convert to estrogen
};

/**
 * AI (aromatase inhibitor) enzyme suppression factors — the fraction of
 * aromatase activity neutralised. Per Mr. X-Steroid Book Ch. 4 (Estrogen
 * Management). Mild = Arimidex 0.25 mg E3D; Standard = 0.5 mg E3D; Aggressive
 * = 1 mg ED or Exemestane 25 mg ED (suicide inhibitor).
 */
export const AI_SUPPRESSION_FACTORS: Record<AiProtocol, number> = {
    none: 0.0,
    mild: 0.5,
    standard: 0.72,
    aggressive: 0.88,
};

/**
 * Body-fat aromatase density multiplier. Aromatase is concentrated in adipose
 * tissue (~2.5× muscle per unit mass). Normalised so 15% BF = 1.0× (lean
 * adult male reference). Per Mr. X-Steroid Book Ch. 4.
 */
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

export type E2RiskZone = 'crashed' | 'suppressed' | 'optimal' | 'elevated' | 'critical';

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
    /** Gynecomastia risk score (0–100). */
    gynoRiskScore: number;
    /** Water-retention risk score (0–100). */
    waterRetentionRiskScore: number;
    /** Estrogen-crash risk score (0–100, from AI overuse). */
    crashRiskScore: number;
    /** Bilingual AI recommendation code. */
    aiRecommendation: 'none_needed' | 'monitor' | 'adjust_up' | 'reduce_ai' | 'unnecessary';
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
 * Classify an E2 level (pg/mL) into a risk zone.
 * Per Mr. X-Steroid Book Ch. 4 reference bands for adult males.
 */
export function classifyE2Risk(e2Pgml: number): E2RiskZone {
    if (e2Pgml < E2_CRASH_THRESHOLD) return 'crashed';
    if (e2Pgml < E2_OPTIMAL_LOW) return 'suppressed';
    if (e2Pgml <= E2_OPTIMAL_HIGH) return 'optimal';
    if (e2Pgml <= E2_CRITICAL_THRESHOLD) return 'elevated';
    return 'critical';
}

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
// Risk scores (0–100) — bilingual clinical context
// ─────────────────────────────────────────────────────────────────────────────

function gynoRiskFor(e2Peak: number, aromRate: number, weeksOnCycle: number): number {
    if (e2Peak <= E2_OPTIMAL_HIGH) return 0;
    const excess = e2Peak - E2_OPTIMAL_HIGH;
    const durationFactor = clamp(weeksOnCycle / 16, 0.5, 1.5);
    const score = (excess / (E2_CRITICAL_THRESHOLD - E2_OPTIMAL_HIGH)) * 70 * durationFactor + aromRate * 20;
    return round2(clamp(score, 0, 100));
}

function waterRetentionRiskFor(e2Peak: number, bodyFatPct: number): number {
    if (e2Peak <= E2_OPTIMAL_HIGH) return 0;
    const excess = e2Peak - E2_OPTIMAL_HIGH;
    const bfFactor = clamp(bodyFatPct / 25, 0.4, 1.6);
    const score = (excess / (E2_CRITICAL_THRESHOLD - E2_OPTIMAL_HIGH)) * 60 * bfFactor;
    return round2(clamp(score, 0, 100));
}

function crashRiskFor(aiProtocol: AiProtocol, aromRate: number, e2Peak: number): number {
    if (aiProtocol === 'none') return 0;
    const aiSupp = AI_SUPPRESSION_FACTORS[aiProtocol];
    // AI on a non-aromatising compound is pure crash risk with zero benefit.
    const compoundMismatch = aromRate === 0 ? 1.5 : 1.0;
    // If E2 is already low, AI pushes it into crash territory.
    const e2Pressure = e2Peak < E2_OPTIMAL_LOW ? 1.4 : 1.0;
    const score = aiSupp * 80 * compoundMismatch * e2Pressure;
    return round2(clamp(score, 0, 100));
}

function aiRecommendationFor(
    peakE2: number,
    aromRate: number,
    aiProtocol: AiProtocol,
): AromatizationRiskResult['aiRecommendation'] {
    if (aromRate === 0 && aiProtocol !== 'none') return 'unnecessary';
    if (peakE2 < E2_CRASH_THRESHOLD) return 'reduce_ai';
    if (peakE2 < E2_OPTIMAL_LOW && aiProtocol !== 'none') return 'reduce_ai';
    if (peakE2 > E2_CRITICAL_THRESHOLD) return 'adjust_up';
    if (peakE2 > E2_OPTIMAL_HIGH && aiProtocol === 'none') return 'monitor';
    if (peakE2 > E2_OPTIMAL_HIGH && (aiProtocol === 'mild')) return 'monitor';
    return 'none_needed';
}

// ─────────────────────────────────────────────────────────────────────────────
// Bilingual milestone notes (Tool #002 spec §6 — phase stepper)
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
    riskZone: E2RiskZone,
    isFinal: boolean,
): MilestoneNote {
    if (isFinal) {
        return {
            ar: 'اكتمل منحنى التدهور والتعافي للاستراديول',
            en: 'E2 decay-and-recovery curve complete',
        };
    }
    if (week === 1) {
        return {
            ar: 'الأسبوع 1: بدء نشاط إنزيم الأروماتاز وارتفاع الاستراديول',
            en: 'Week 1: aromatase activation — E2 rising',
        };
    }
    if (week === weeksOnCycle) {
        return {
            ar: `الأسبوع ${weeksOnCycle}: ذروة الاستراديول — ${e2.toFixed(0)} pg/mL`,
            en: `Week ${weeksOnCycle}: peak E2 — ${e2.toFixed(0)} pg/mL`,
        };
    }
    if (phase === 'post_cycle' && week === weeksOnCycle + 1) {
        return {
            ar: 'نهاية الدورة: بدء انحسار الاستراديول نحو الخط الأساسي',
            en: 'Cycle end: E2 decaying toward baseline',
        };
    }
    if (riskZone === 'critical') {
        return {
            ar: 'منطقة حرجة: خطر التثدي الهرموني — تدخّل فوري مطلوب',
            en: 'Critical zone: gyno risk — immediate intervention required',
        };
    }
    if (riskZone === 'crashed') {
        return {
            ar: 'انهيار الاستراديول: فرط استخدام مثبطات الأروماتاز',
            en: 'E2 crashed: AI over-suppression',
        };
    }
    if (phase === 'post_cycle') {
        return {
            ar: 'مرحلة ما بعد الدورة: تعافي الاستراديول',
            en: 'Post-cycle: E2 normalising',
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
        const riskZone = classifyE2Risk(e2);
        const aromataseActivity = aromRate * doseScale * bfFactor * (phase === 'on_cycle' ? 1 : decayFractionAt(week, weeksOnCycle));
        const aiActive = phase === 'on_cycle' ? aiSupp : 0;

        const note = milestoneNote(
            week,
            phase,
            weeksOnCycle,
            e2,
            riskZone,
            week === totalTimelineWeeks,
        );

        timeline.push({
            weekNumber: week,
            phase,
            estradiolPgml: e2,
            aromataseActivityPct: round2(clamp(aromataseActivity * 100, 0, 100)),
            aiSuppressionPct: round2(aiActive * 100),
            riskZone,
            milestoneNoteAr: note.ar,
            milestoneNoteEn: note.en,
        });
    }

    const finalE2 = timeline[timeline.length - 1].estradiolPgml;
    const peakRiskZone = classifyE2Risk(peakE2);

    const gynoRiskScore = gynoRiskFor(peakE2, aromRate, weeksOnCycle);
    const waterRetentionRiskScore = waterRetentionRiskFor(peakE2, bf);
    const crashRiskScore = crashRiskFor(ai, aromRate, peakE2);
    const aiRecommendation = aiRecommendationFor(peakE2, aromRate, ai);

    return {
        timeline,
        steadyStateE2: round2(steadyStateE2),
        peakE2: round2(peakE2),
        finalE2,
        peakRiskZone,
        compoundAromatizationRate: aromRate,
        aiSuppressionFactor: aiSupp,
        bodyFatMultiplier: round2(bfFactor),
        gynoRiskScore,
        waterRetentionRiskScore,
        crashRiskScore,
        aiRecommendation,
        totalTimelineWeeks,
    };
}

/** Post-cycle aromatase activity decay fraction (mirrors E2 decay shape). */
function decayFractionAt(week: number, weeksOnCycle: number): number {
    if (week <= weeksOnCycle) return 1;
    return Math.exp(-(week - weeksOnCycle) / E2_DECAY_TAU_WEEKS);
}

/** Safe default protocol — 500 mg/wk testosterone, 15% BF, 12 weeks, no AI. */
export const DEFAULT_AROMATIZATION_INPUT: EngineInput = {
    weeksOnCycle: 12,
    weeklyDoseMg: 500,
    bodyFatPct: 15,
    compoundType: 'testosterone',
    aiProtocol: 'none',
};
