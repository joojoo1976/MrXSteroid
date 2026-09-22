/**
 * lib/tools/engines/hpta-recovery.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #003 — Exogenous Suppression & HPTA Recovery Time-Course Modeler
 *  (Layer 1).
 * ═══════════════════════════════════════════════════════════════════════════
 * Week-by-week HPTA axis model across three phases:
 *
 *   Cycle    : suppression climbs toward S_max as exogenous load accumulates
 *                S(w)   = min(S_max, S_init + w · ramp · potency)
 *   Washout  : residual exogenous clears, suppression decays linearly
 *                S(w)   = peak · (1 − progress · WASHOUT_DECAY_FRACTION)
 *   Recovery : endogenous T rebounds exponentially (PCT-accelerated)
 *                T(t)   = T_floor + (100 − T_floor) · (1 − e^(−λ · t))
 *                λ      = RECOVERY_BASE_RATE · pctBoost / potency
 *
 * Suppression % and endogenous-testosterone % are kept as a consistent inverse
 * pair (S + T ≈ 100), which removes the boundary discontinuity present in
 * naive stacked models. Per "Mr. X-Steroid Book" Ch. 6, axis recovery is gated
 * on full compound washout before SERM/hCG activation.
 *
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O.
 */
// ─────────────────────────────────────────────────────────────────────────────
// Enumerations (frozen tuples so the Layer-2 Zod enum keeps the exact union)
// ─────────────────────────────────────────────────────────────────────────────

export type CompoundPotency = 'mild' | 'moderate' | 'heavy' | 'extreme';
export type PctProtocol = 'none' | 'standard' | 'aggressive_mrx';

export const COMPOUND_POTENCIES: readonly CompoundPotency[] = [
    'mild',
    'moderate',
    'heavy',
    'extreme',
];
export const PCT_PROTOCOLS: readonly PctProtocol[] = [
    'none',
    'standard',
    'aggressive_mrx',
];

// ─────────────────────────────────────────────────────────────────────────────
// Physiological constants (Tool #003 spec §2)
// ─────────────────────────────────────────────────────────────────────────────

/** Suppression ceiling (% of axis shutdown). */
export const SUPPRESSION_MAX = 100;
/** Baseline suppression (%) at the very first on-cycle week. */
export const SUPPRESSION_INITIAL = 30;
/** Per-week suppression ramp slope, scaled by potency factor. */
export const SUPPRESSION_RAMP_PER_WEEK = 6;
/**
 * Potency multipliers encode both ester chain length / AR affinity impact on
 * axis shutdown depth and washout duration (per Mr. X-Steroid Book Ch. 6).
 */
export const POTENCY_FACTORS: Record<CompoundPotency, number> = {
    mild: 0.5,
    moderate: 0.8,
    heavy: 1.2,
    extreme: 1.8,
};
/**
 * PCT acceleration coefficient α_PCT — the multiplier on the physiological
 * recovery rate λ. No PCT = slow natural crawl; the Mr. X-Steroid advanced
 * protocol (SERM + hCG bridge) yields the largest acceleration.
 */
export const PCT_BOOST_FACTORS: Record<PctProtocol, number> = {
    none: 1.0,
    standard: 1.85,
    aggressive_mrx: 2.65,
};
/** During washout, suppression decays to this fraction of its on-cycle peak. */
export const WASHOUT_DECAY_FRACTION = 0.4;
/** Base exponential recovery rate (1/week) before PCT / potency modulation. */
export const RECOVERY_BASE_RATE = 0.08;
/** Weeks of the recovery phase simulated after washout completes. */
export const RECOVERY_OBSERVATION_WEEKS = 16;
/** Endogenous T at/above this % of baseline is considered "recovered". */
export const RECOVERY_COMPLETE_THRESHOLD = 90;
/** Hard floor for endogenous T during deep suppression (real axis never hits 0). */
export const ENDO_FLOOR_PCT = 2;
/** LH tracks endogenous T just below parity (pituitary lags gonadal recovery). */
export const LH_LAG_FACTOR = 0.95;
/** Lower bound for the potency-derived washout window (weeks). */
export const MIN_WASHOUT_WEEKS = 1;
/** Upper bound for the potency-derived washout window (weeks). */
export const MAX_WASHOUT_WEEKS = 8;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EngineInput {
    /** Active on-cycle duration (weeks), 4–24. */
    weeksOnCycle: number;
    compoundPotency: CompoundPotency;
    pctProtocol: PctProtocol;
}

export type HptaPhase = 'cycle' | 'washout' | 'recovery';

export interface WeeklyDataPoint {
    weekNumber: number;
    phase: HptaPhase;
    /** % axis shutdown (0–100). */
    suppressionPct: number;
    /** Endogenous testosterone as % of baseline (0–100). */
    endogenousTestosteronePct: number;
    /** Luteinizing hormone as % of baseline (0–100), tracks T with a lag. */
    lhPct: number;
    milestoneNoteAr: string;
    milestoneNoteEn: string;
}

export interface HptaRecoveryResult {
    timeline: WeeklyDataPoint[];
    /** Weeks of compound washout between cycle end and PCT/recovery start. */
    washoutWeeks: number;
    totalTimelineWeeks: number;
    peakSuppressionPct: number;
    /** First week endogenous T ≥ RECOVERY_COMPLETE_THRESHOLD (0 = not reached). */
    recoveryCompleteWeek: number;
    pctProtocolBoost: number;
    finalTestosteronePct: number;
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

const safeInt = (value: number, fallback: number, min: number, max: number): number => {
    const v = Number.isFinite(value) ? Math.round(value) : fallback;
    return clamp(Math.round(v), min, max);
};

const safeEnum = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => {
    return typeof value === 'string' && (allowed as readonly string[]).includes(value)
        ? (value as T)
        : fallback;
};

/** Potency-derived washout window (weeks): 2 · potencyFactor, clamped. */
export function washoutWeeksFor(potency: CompoundPotency): number {
    const factor = POTENCY_FACTORS[potency];
    return clampInt(Math.round(2 * factor), MIN_WASHOUT_WEEKS, MAX_WASHOUT_WEEKS);
}

const clampInt = (value: number, min: number, max: number): number =>
    clamp(Math.round(value), min, max);

/** Exponential recovery fraction (0→1) over `weeks` since recovery onset. */
export function recoveryFraction(weeks: number, pctBoost: number, potency: CompoundPotency): number {
    if (weeks <= 0) return 0;
    const rate = RECOVERY_BASE_RATE * pctBoost * (1 / POTENCY_FACTORS[potency]);
    return 1 - Math.exp(-rate * weeks);
}

// ─────────────────────────────────────────────────────────────────────────────
// Bilingual milestone notes (Tool #003 spec §6 — phase stepper)
// ─────────────────────────────────────────────────────────────────────────────

interface MilestoneNote {
    ar: string;
    en: string;
}

function milestoneNote(
    week: number,
    phase: HptaPhase,
    cycleEndWeek: number,
    washoutWeeks: number,
    recoveryCompleteWeek: number,
    isFinal: boolean,
): MilestoneNote {
    const washoutEnd = cycleEndWeek + washoutWeeks;
    if (isFinal) {
        return {
            ar: 'اكتمل المنحنى الزمني لتعافي محور HPTA',
            en: 'HPTA recovery time-course complete',
        };
    }
    if (week === 1) {
        return {
            ar: 'الأسبوع 1: بدء التثبيط المحوري وتراكم الحمل الأندروجيني',
            en: 'Week 1: HPTA suppression onset — androgen load accumulating',
        };
    }
    if (week === cycleEndWeek) {
        return {
            ar: `الأسبوع ${cycleEndWeek}: ذروة التثبيط — نهاية الدورة`,
            en: `Week ${cycleEndWeek}: peak suppression — cycle ends`,
        };
    }
    if (week === washoutEnd) {
        return {
            ar: `الأسبوع ${washoutEnd}: اكتمال تطهير المركب — بدء الاستعادة`,
            en: `Week ${washoutEnd}: compound washout complete — recovery initiates`,
        };
    }
    if (recoveryCompleteWeek > 0 && week === recoveryCompleteWeek) {
        return {
            ar: `الأسبوع ${recoveryCompleteWeek}: استعادة التستوستيرون الداخلي ≥ ٩٠٪`,
            en: `Week ${recoveryCompleteWeek}: endogenous T restored ≥ 90%`,
        };
    }
    if (phase === 'washout') {
        return {
            ar: 'مرحلة التطهير: انحسار تدريجي للمركب الخارجي',
            en: 'Washout phase: exogenous compound clearing',
        };
    }
    if (phase === 'recovery') {
        return {
            ar: 'مرحلة التعافي: ارتداد محور الغدة النخامية–الخصية',
            en: 'Recovery phase: HPTA axis rebound',
        };
    }
    return { ar: '', en: '' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Core simulation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pure week-by-week HPTA suppression → washout → recovery simulation.
 *
 * Invalid / hostile inputs are coerced to safe defaults — the Layer-2 Zod
 * schema is the strict boundary; the engine stays total (never NaN, never
 * Infinity, never throws), exactly like `calculateTimeline`.
 */
export function calculateHptaRecovery(rawInput: EngineInput): HptaRecoveryResult {
    const potency = safeEnum(rawInput.compoundPotency, COMPOUND_POTENCIES, 'moderate');
    const pct = safeEnum(rawInput.pctProtocol, PCT_PROTOCOLS, 'standard');
    const weeksOnCycle = safeInt(rawInput.weeksOnCycle, 12, 4, 24);

    const potencyFactor = POTENCY_FACTORS[potency];
    const pctBoost = PCT_BOOST_FACTORS[pct];
    const washoutWeeks = washoutWeeksFor(potency);
    const totalTimelineWeeks = weeksOnCycle + washoutWeeks + RECOVERY_OBSERVATION_WEEKS;

    const timeline: WeeklyDataPoint[] = [];
    let peakSuppression = 0;
    let recoveryCompleteWeek = 0;

    for (let week = 1; week <= totalTimelineWeeks; week++) {
        let phase: HptaPhase;
        let suppression: number;
        let endoT: number;

        if (week <= weeksOnCycle) {
            // ── Cycle phase: suppression ramps toward S_max (capped by the T floor) ──
            // Derived consistently so S + T ≡ 100: when the raw ramp would push
            // endogenous T below ENDO_FLOOR_PCT, T is floored and S is recomputed
            // from it — the axis never fully zeroes (per Mr. X-Steroid Book Ch. 6).
            phase = 'cycle';
            const rawSuppression = SUPPRESSION_INITIAL + week * SUPPRESSION_RAMP_PER_WEEK * potencyFactor;
            endoT = Math.max(ENDO_FLOOR_PCT, 100 - rawSuppression);
            suppression = 100 - endoT;
            peakSuppression = Math.max(peakSuppression, suppression);
        } else if (week <= weeksOnCycle + washoutWeeks) {
            // ── Washout phase: residual compound clears, suppression decays ──
            phase = 'washout';
            const progress = washoutWeeks > 0 ? (week - weeksOnCycle) / washoutWeeks : 1;
            suppression = Math.max(0, peakSuppression * (1 - progress * WASHOUT_DECAY_FRACTION));
            endoT = Math.max(ENDO_FLOOR_PCT, 100 - suppression);
        } else {
            // ── Recovery phase: endogenous T rebounds exponentially (PCT-gated) ──
            phase = 'recovery';
            const recoveryWeek = week - (weeksOnCycle + washoutWeeks);
            const endoAtWashoutEnd = Math.max(
                ENDO_FLOOR_PCT,
                100 - peakSuppression * (1 - WASHOUT_DECAY_FRACTION),
            );
            const fraction = recoveryFraction(recoveryWeek, pctBoost, potency);
            endoT = Math.min(100, endoAtWashoutEnd + (100 - endoAtWashoutEnd) * fraction);
            suppression = Math.max(0, 100 - endoT);
        }

        if (phase === 'recovery' && recoveryCompleteWeek === 0 && endoT >= RECOVERY_COMPLETE_THRESHOLD) {
            recoveryCompleteWeek = week;
        }

        const note = milestoneNote(
            week,
            phase,
            weeksOnCycle,
            washoutWeeks,
            recoveryCompleteWeek,
            week === totalTimelineWeeks,
        );

        timeline.push({
            weekNumber: week,
            phase,
            suppressionPct: round2(suppression),
            endogenousTestosteronePct: round2(endoT),
            lhPct: round2(Math.min(100, endoT * LH_LAG_FACTOR)),
            milestoneNoteAr: note.ar,
            milestoneNoteEn: note.en,
        });
    }

    const finalPoint = timeline[timeline.length - 1];
    return {
        timeline,
        washoutWeeks,
        totalTimelineWeeks,
        peakSuppressionPct: round2(peakSuppression),
        recoveryCompleteWeek,
        pctProtocolBoost: pctBoost,
        finalTestosteronePct: finalPoint.endogenousTestosteronePct,
    };
}

/** Safe default protocol — moderate potency, standard PCT, 12-week cycle. */
export const DEFAULT_HPTA_INPUT: EngineInput = {
    weeksOnCycle: 12,
    compoundPotency: 'heavy',
    pctProtocol: 'aggressive_mrx',
};
