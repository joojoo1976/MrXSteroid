/**
 * lib/tools/engines/multi-ester-pharmacokinetics.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Tool #001 — PharmaSim™ Multi-Ester Pharmacokinetic Accumulator (Layer 1).
 * ═══════════════════════════════════════════════════════════════════════════
 * Two-compartment Bateman model for multi-ester AAS accumulation:
 *
 *   C_total(t) = Σ_i  [D_i·f_cleavage·k_a / (V_d·(k_a−k_e))]·(e^{−k_e·Δt}−e^{−k_a·Δt})·Θ(Δt)
 *   Δt = t − t_i ,  k_a = ln2/t½,abs ,  k_e = ln2/t½,elim
 *
 * PURE MODULE — no React, no DOM, no Supabase, no `Date`, no I/O.
 * Runs identically on server (RSC / route handlers) and client.
 */

export type EsterType =
    | 'suspension'
    | 'acetate'
    | 'propionate'
    | 'phenylpropionate'
    | 'enanthate'
    | 'cypionate'
    | 'decanoate'
    | 'undecanoate';

export const ESTER_TYPES: readonly EsterType[] = [
    'suspension',
    'acetate',
    'propionate',
    'phenylpropionate',
    'enanthate',
    'cypionate',
    'decanoate',
    'undecanoate',
];

export interface InjectionEvent {
    id: string;
    /** Day offset of the injection (0 = today). */
    day: number;
    doseMg: number;
    ester: EsterType;
}

export interface EsterProfile {
    nameEn: string;
    nameAr: string;
    /** Absorption half-life in days (ester cleavage off the muscle depot). */
    halfLifeAbsDays: number;
    /** Elimination half-life in days (clearance of the free hormone). */
    halfLifeElimDays: number;
    /** Active hormone weight percentage after ester cleavage (0…1). */
    cleavageFactor: number;
}

/** Ester biomarker database (Tool #001 spec §1.2). */
export const ESTER_DATABASE: Record<EsterType, EsterProfile> = {
    suspension: { nameEn: 'Suspension / Base', nameAr: 'سسبنشن / بدون إستر', halfLifeAbsDays: 0.1, halfLifeElimDays: 0.35, cleavageFactor: 1.0 },
    acetate: { nameEn: 'Acetate', nameAr: 'أسيتات', halfLifeAbsDays: 0.4, halfLifeElimDays: 1.0, cleavageFactor: 0.87 },
    propionate: { nameEn: 'Propionate', nameAr: 'بروبيونات', halfLifeAbsDays: 0.8, halfLifeElimDays: 1.5, cleavageFactor: 0.83 },
    phenylpropionate: { nameEn: 'Phenylpropionate', nameAr: 'فينيل بروبيونات', halfLifeAbsDays: 1.2, halfLifeElimDays: 2.5, cleavageFactor: 0.78 },
    enanthate: { nameEn: 'Enanthate', nameAr: 'إينانثات', halfLifeAbsDays: 1.5, halfLifeElimDays: 4.5, cleavageFactor: 0.7 },
    cypionate: { nameEn: 'Cypionate', nameAr: 'سيبيونات', halfLifeAbsDays: 1.6, halfLifeElimDays: 5.0, cleavageFactor: 0.69 },
    decanoate: { nameEn: 'Decanoate', nameAr: 'ديكانوات', halfLifeAbsDays: 3.0, halfLifeElimDays: 7.5, cleavageFactor: 0.62 },
    undecanoate: { nameEn: 'Undecanoate', nameAr: 'أنديكانوات', halfLifeAbsDays: 5.0, halfLifeElimDays: 20.9, cleavageFactor: 0.61 },
};

/** Apparent volume of distribution: ~0.25 L/kg serum partitioning baseline. */
export const VD_L_PER_KG = 0.25;
/** Floor for Vd so emaciated inputs can never produce absurd concentrations. */
export const VD_MIN_LITERS = 10;
/** Maps the Bateman serum term (mg/L-scale) onto a physiological ng/dL scale. */
export const NG_DL_CONVERSION_FACTOR = 28.8;
/** Steady state ≈ 4–5 elimination half-lives of the longest ester (spec: 4.5). */
export const STEADY_STATE_HALF_LIVES = 4.5;
/** Trough telemetry starts after initial distribution (spec §Phase 2). */
export const TROUGH_START_DAY = 7;
/** |k_a − k_e| below this is treated as the degenerate equal-rates limit. */
export const KA_KE_EPSILON = 0.0001;

export interface EngineInput {
    bodyWeightKg: number;
    simulationDays: number;
    injections: InjectionEvent[];
}

export interface DailyDataPoint {
    day: number;
    /** Serum concentration on the ng/dL-equivalent physiological scale. */
    concentrationNgl: number;
    /** Release rate dD/dt = k_a·D_net·e^{−k_a·Δt} (mg/day). */
    activeReleaseMg: number;
    /** Unabsorbed ester still sitting in the muscle depot (mg). */
    accumulatedEsterMg: number;
}

export interface PharmacokineticResult {
    timeline: DailyDataPoint[];
    peakConcentrationNgDl: number;
    troughConcentrationNgDl: number;
    averageConcentrationNgDl: number;
    peakToTroughRatio: number;
    estimatedSteadyStateDay: number;
    totalActiveHormoneDeliveredMg: number;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * One Bateman absorption→elimination term for a net (cleaved) dose.
 * Exported separately so the degenerate k_a ≈ k_e limit is unit-testable even
 * though no ester in `ESTER_DATABASE` ever hits it.
 */
export function batemanTerm(netDoseMg: number, ka: number, ke: number, vdLiters: number, tDays: number): number {
    if (tDays < 0) return 0; // Heaviside Θ(t − t_i)
    if (Math.abs(ka - ke) < KA_KE_EPSILON) {
        // Limit when k_a → k_e: (D/Vd)·k·t·e^{−k·t}
        return (netDoseMg / vdLiters) * ka * tDays * Math.exp(-ke * tDays);
    }
    return ((netDoseMg * ka) / (vdLiters * (ka - ke))) * (Math.exp(-ke * tDays) - Math.exp(-ka * tDays));
}

/**
 * Pure multi-ester serum accumulation simulation (daily granularity).
 * Invalid injection rows (unknown ester, non-finite dose) are skipped, never
 * thrown — the Layer-2 Zod schema is the strict boundary, the engine stays
 * total (never NaN, never Infinity).
 */
export function calculateMultiEsterPK(input: EngineInput): PharmacokineticResult {
    const bodyWeightKg = Number.isFinite(input.bodyWeightKg) ? input.bodyWeightKg : 80;
    const simulationDays = Math.min(Math.max(Math.floor(Number(input.simulationDays) || 0), 0), 365);
    const vdLiters = Math.max(VD_MIN_LITERS, bodyWeightKg * VD_L_PER_KG);

    const validInjections = (input.injections ?? []).filter(
        (inj) => !!inj && Number.isFinite(inj.doseMg) && inj.doseMg > 0 && Number.isFinite(inj.day) && !!ESTER_DATABASE[inj.ester],
    );

    const timeline: DailyDataPoint[] = [];
    let peakConcentration = 0;
    let troughConcentration = Infinity;
    let sumConcentration = 0;
    let totalActiveHormone = 0;

    for (const inj of validInjections) {
        totalActiveHormone += inj.doseMg * ESTER_DATABASE[inj.ester].cleavageFactor;
    }

    for (let day = 0; day <= simulationDays; day++) {
        let currentDayConcentrationNgDl = 0;
        let currentActiveReleaseMg = 0;
        let currentAccumulatedEsterMg = 0;

        for (const inj of validInjections) {
            if (day < inj.day) continue; // Θ(t − t_i) = 0

            const timeElapsedDays = day - inj.day;
            const profile = ESTER_DATABASE[inj.ester];
            const ka = Math.LN2 / profile.halfLifeAbsDays;
            const ke = Math.LN2 / profile.halfLifeElimDays;
            const netDose = inj.doseMg * profile.cleavageFactor;

            // Unesterified residual fraction still sitting in the muscle depot.
            currentAccumulatedEsterMg += Math.max(0, inj.doseMg * Math.exp(-ka * timeElapsedDays));

            const serumTerm = batemanTerm(netDose, ka, ke, vdLiters, timeElapsedDays);
            currentDayConcentrationNgDl += Math.max(0, serumTerm * NG_DL_CONVERSION_FACTOR);

            // Release rate: dD/dt = k_a·D_net·e^{−k_a·Δt}
            currentActiveReleaseMg += Math.max(0, ka * netDose * Math.exp(-ka * timeElapsedDays));
        }

        timeline.push({
            day,
            concentrationNgl: round2(currentDayConcentrationNgDl),
            activeReleaseMg: round2(currentActiveReleaseMg),
            accumulatedEsterMg: round2(currentAccumulatedEsterMg),
        });

        sumConcentration += currentDayConcentrationNgDl;
        if (currentDayConcentrationNgDl > peakConcentration) {
            peakConcentration = currentDayConcentrationNgDl;
        }
        // Trough telemetry only after initial distribution (day ≥ 7).
        if (day >= TROUGH_START_DAY && currentDayConcentrationNgDl < troughConcentration) {
            troughConcentration = currentDayConcentrationNgDl;
        }
    }

    const averageConcentration = timeline.length > 0 ? sumConcentration / timeline.length : 0;
    const safeTrough = troughConcentration === Infinity ? 0 : troughConcentration;
    const peakToTroughRatio = safeTrough > 0 ? round2(peakConcentration / safeTrough) : 0;

    // Steady state after ~4.5 elimination half-lives of the longest ester.
    let maxElimHalfLife = 0;
    for (const inj of validInjections) {
        const profile = ESTER_DATABASE[inj.ester];
        if (profile.halfLifeElimDays > maxElimHalfLife) maxElimHalfLife = profile.halfLifeElimDays;
    }

    return {
        timeline,
        peakConcentrationNgDl: round2(peakConcentration),
        troughConcentrationNgDl: round2(safeTrough),
        averageConcentrationNgDl: round2(averageConcentration),
        peakToTroughRatio,
        estimatedSteadyStateDay: Math.round(maxElimHalfLife * STEADY_STATE_HALF_LIVES),
        totalActiveHormoneDeliveredMg: round2(totalActiveHormone),
    };
}

/** Safe zero-overshoot default protocol — never NaN, never empty. */
export const DEFAULT_MULTI_ESTER_INPUT: EngineInput = {
    bodyWeightKg: 85,
    simulationDays: 60,
    injections: [
        { id: 'inj-1', day: 0, doseMg: 250, ester: 'enanthate' },
        { id: 'inj-2', day: 7, doseMg: 250, ester: 'enanthate' },
        { id: 'inj-3', day: 14, doseMg: 250, ester: 'enanthate' },
        { id: 'inj-4', day: 21, doseMg: 250, ester: 'enanthate' },
    ],
};