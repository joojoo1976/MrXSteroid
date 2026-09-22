/**
 * lib/tools/engines/pct-timing.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #004 — PCT Timing & Compound Washout Engine (Layer 1).
 * ═══════════════════════════════════════════════════════════════════════════
 * First-order elimination + PCT scheduling model. Four phases:
 *
 *   Active cycle : exogenous serum at steady-state (~100% of peak),
 *                  axis deeply suppressed (endoT ≈ ENDO_LOW_PCT).
 *   Washout      : serum decays exponentially after the last dose,
 *                  C(t) = C0 · (1/2) ^ (t / t½)   (t in days)
 *                  PCT must NOT start until C < clearanceThreshold.
 *   PCT active   : SERM / hCG window of fixed duration; endogenous T rebounds.
 *                  T(t) = T_floor + (100 − T_floor) · (1 − e^(−λ · t))
 *                  λ = RECOVERY_LAMBDA · pctBoost / (1 + esteronLoad)
 *   Recovery     : residual axis rebound toward baseline.
 *
 * Per "Mr. X-Steroid Book" Ch. 6, SERM/hCG activation while exogenous androgen
 * is still above the clearance threshold risks reverse-suppressing pituitary
 * GnRH/LH pulse amplitude — so the washout gate is a hard safety constraint.
 *
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Enumerations (frozen tuples so the Layer-2 Zod enum keeps the exact union)
// ─────────────────────────────────────────────────────────────────────────────

export type PctProtocol = 'none' | 'standard' | 'aggressive_mrx';

export const PCT_PROTOCOLS: readonly PctProtocol[] = [
    'none',
    'standard',
    'aggressive_mrx',
];

// ─────────────────────────────────────────────────────────────────────────────
// Physiological constants (Tool #004)
// ─────────────────────────────────────────────────────────────────────────────

/** Days per week — kept explicit so the half-life math is auditable. */
export const DAYS_PER_WEEK = 7;
/** Default serum clearance threshold (% of peak) before PCT may start. */
export const DEFAULT_CLEARANCE_THRESHOLD_PCT = 5;
/** Endogenous T floor during deep on-cycle suppression (% of baseline). */
export const ENDO_LOW_PCT = 5;
/** Endogenous T at the washout→PCT handoff (% of baseline). */
export const ENDO_WASHOUT_END_PCT = 15;
/** Base exponential recovery rate (1/week) before PCT / ester modulation. */
export const RECOVERY_LAMBDA = 0.12;
/** Weeks of recovery observation simulated after the PCT window ends. */
export const RECOVERY_OBSERVATION_WEEKS = 20;
/** Endogenous T at/above this % of baseline is considered "recovered". */
export const RECOVERY_COMPLETE_THRESHOLD = 90;
/** PCT active window length (weeks) per protocol. */
export const PCT_DURATIONS_WEEKS: Record<PctProtocol, number> = {
    none: 0,
    standard: 4,
    aggressive_mrx: 6,
};
/** Recovery-rate acceleration per protocol (multiplier on λ). */
export const PCT_BOOST_FACTORS: Record<PctProtocol, number> = {
    none: 0.4,
    standard: 1.0,
    aggressive_mrx: 1.6,
};
/** Minimum sensible half-life (days) — ultra-short orals. */
export const MIN_HALF_LIFE_DAYS = 0.5;
/** Maximum sensible half-life (days) — long esters (Deca/Equipoise territory). */
export const MAX_HALF_LIFE_DAYS = 30;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EngineInput {
    /** Compound elimination half-life (days), 0.5–30. */
    compoundHalfLifeDays: number;
    /** Active on-cycle duration (weeks), 4–24. */
    weeksOnCycle: number;
    /** Serum % of peak below which PCT may start (1–20). */
    clearanceThresholdPct: number;
    pctProtocol: PctProtocol;
}

export type PctPhase = 'active_cycle' | 'washout' | 'pct_active' | 'recovery';

export interface WeeklyDataPoint {
    weekNumber: number;
    daysSinceLastDose: number;
    /** Serum concentration as % of peak (0–100). */
    serumConcentrationPct: number;
    phase: PctPhase;
    pctActive: boolean;
    /** Endogenous testosterone as % of baseline (0–100). */
    endogenousTestosteronePct: number;
    milestoneNoteAr: string;
    milestoneNoteEn: string;
}

export interface PctTimingResult {
    timeline: WeeklyDataPoint[];
    /** Weeks of serum decay until the clearance threshold is crossed. */
    washoutWeeks: number;
    /** First post-cycle week where serum < threshold (PCT eligible). */
    pctStartWeek: number;
    pctDurationWeeks: number;
    /** First week endogenous T ≥ RECOVERY_COMPLETE_THRESHOLD (0 = not reached). */
    fullRecoveryWeek: number;
    totalTimelineWeeks: number;
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

/**
 * Serum concentration (% of peak) `days` after the last dose, given a
 * half-life. C(t) = 100 · (1/2) ^ (t / t½). Week 0 of the post-cycle = 100%.
 */
export function serumPctAfter(days: number, halfLifeDays: number): number {
    if (days <= 0 || halfLifeDays <= 0) return 100;
    return round2(100 * Math.pow(0.5, days / halfLifeDays));
}

/**
 * Days required for serum to drop below `thresholdPct` of peak.
 *   100 · (1/2)^(t/t½) < threshold  →  t > t½ · log₂(100/threshold)
 */
export function daysToClearance(halfLifeDays: number, thresholdPct: number): number {
    if (halfLifeDays <= 0 || thresholdPct >= 100) return 0;
    return (halfLifeDays * Math.log2(100 / thresholdPct)) / DAYS_PER_WEEK; // in weeks
}

/** Exponential recovery fraction (0→1) over `weeks` since PCT onset. */
export function endoRecoveryFraction(weeks: number, pctBoost: number): number {
    if (weeks <= 0) return 0;
    return 1 - Math.exp(-RECOVERY_LAMBDA * pctBoost * weeks);
}

// ─────────────────────────────────────────────────────────────────────────────
// Bilingual milestone notes
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
            ar: `الأسبوع ${pctStartWeek}: المركب تحت عتبة التطهير — بدء PCT`,
            en: `Week ${pctStartWeek}: compound below threshold — PCT eligible`,
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
// Core simulation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pure compound-washout + PCT-scheduling simulation.
 *
 * Invalid / hostile inputs are coerced to safe defaults — the Layer-2 Zod
 * schema is the strict boundary; the engine stays total (never NaN, never
 * Infinity, never throws), exactly like `calculateHptaRecovery`.
 */
export function calculatePctTiming(rawInput: EngineInput): PctTimingResult {
    const halfLife = safeNumber(rawInput.compoundHalfLifeDays, 5, MIN_HALF_LIFE_DAYS, MAX_HALF_LIFE_DAYS);
    const weeksOnCycle = safeInt(rawInput.weeksOnCycle, 12, 4, 24);
    const threshold = safeNumber(rawInput.clearanceThresholdPct, DEFAULT_CLEARANCE_THRESHOLD_PCT, 1, 20);
    const pct = safeEnum(rawInput.pctProtocol, PCT_PROTOCOLS, 'standard');

    const pctDuration = PCT_DURATIONS_WEEKS[pct];
    const pctBoost = PCT_BOOST_FACTORS[pct];

    // Washout window in weeks (float) → ceiling to a whole week boundary.
    const washoutWeeksRaw = daysToClearance(halfLife, threshold);
    const washoutWeeks = Math.max(1, Math.ceil(washoutWeeksRaw));
    const pctStartWeek = weeksOnCycle + washoutWeeks;
    const pctEndWeek = pctStartWeek + pctDuration;
    const totalTimelineWeeks = pctEndWeek + RECOVERY_OBSERVATION_WEEKS;

    const timeline: WeeklyDataPoint[] = [];
    let fullRecoveryWeek = 0;

    for (let week = 1; week <= totalTimelineWeeks; week++) {
        let phase: PctPhase;
        let serum: number;
        let endoT: number;
        let pctActive = false;

        if (week <= weeksOnCycle) {
            // ── Active cycle: steady-state serum, deep suppression ──
            phase = 'active_cycle';
            serum = 100;
            endoT = ENDO_LOW_PCT;
        } else if (week < pctStartWeek) {
            // ── Washout: exponential decay until clearance threshold ──
            phase = 'washout';
            const daysSince = (week - weeksOnCycle) * DAYS_PER_WEEK;
            serum = serumPctAfter(daysSince, halfLife);
            // endoT crawls from ENDO_LOW toward ENDO_WASHOUT_END as serum drops.
            const dropFraction = clamp((100 - serum) / (100 - threshold), 0, 1);
            endoT = ENDO_LOW_PCT + (ENDO_WASHOUT_END_PCT - ENDO_LOW_PCT) * dropFraction;
        } else if (pctDuration > 0 && week <= pctEndWeek) {
            // ── PCT active: SERM/hCG window drives axis rebound ──
            phase = 'pct_active';
            pctActive = true;
            const daysSince = (week - weeksOnCycle) * DAYS_PER_WEEK;
            serum = serumPctAfter(daysSince, halfLife);
            const weeksSincePct = week - pctStartWeek + 1;
            const fraction = endoRecoveryFraction(weeksSincePct, pctBoost);
            endoT = ENDO_WASHOUT_END_PCT + (100 - ENDO_WASHOUT_END_PCT) * fraction;
        } else {
            // ── Recovery: residual axis rebound toward baseline ──
            phase = 'recovery';
            const daysSince = (week - weeksOnCycle) * DAYS_PER_WEEK;
            serum = serumPctAfter(daysSince, halfLife);
            const weeksSincePct = Math.max(1, week - pctStartWeek);
            const fraction = endoRecoveryFraction(weeksSincePct, pctBoost);
            endoT = ENDO_WASHOUT_END_PCT + (100 - ENDO_WASHOUT_END_PCT) * fraction;
        }

        if ((phase === 'pct_active' || phase === 'recovery') && fullRecoveryWeek === 0 && endoT >= RECOVERY_COMPLETE_THRESHOLD) {
            fullRecoveryWeek = week;
        }

        const note = milestoneNote(
            week,
            phase,
            weeksOnCycle,
            pctStartWeek,
            pctDuration,
            fullRecoveryWeek,
            week === totalTimelineWeeks,
        );

        timeline.push({
            weekNumber: week,
            daysSinceLastDose: week > weeksOnCycle ? (week - weeksOnCycle) * DAYS_PER_WEEK : 0,
            serumConcentrationPct: round2(serum),
            phase,
            pctActive,
            endogenousTestosteronePct: round2(Math.min(100, endoT)),
            milestoneNoteAr: note.ar,
            milestoneNoteEn: note.en,
        });
    }

    const finalPoint = timeline[timeline.length - 1];
    return {
        timeline,
        washoutWeeks,
        pctStartWeek,
        pctDurationWeeks: pctDuration,
        fullRecoveryWeek,
        totalTimelineWeeks,
        finalTestosteronePct: finalPoint.endogenousTestosteronePct,
    };
}

/** Safe default protocol — Testosterone Enanthate (~5d half-life), 12w cycle, standard PCT. */
export const DEFAULT_PCT_TIMING_INPUT: EngineInput = {
    compoundHalfLifeDays: 5,
    weeksOnCycle: 12,
    clearanceThresholdPct: DEFAULT_CLEARANCE_THRESHOLD_PCT,
    pctProtocol: 'standard',
};
