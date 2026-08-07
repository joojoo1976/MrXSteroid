import { describe, it, expect } from 'vitest';
import type { Compound } from '@/shared/types/types';
import {
    batemanLevel,
    decayLevel,
    buildInjectionDays,
    clearanceDaysFromHalfLife,
    pctWaitDays,
    simulateSerum,
    stabilityScore,
    assessRisks,
    clamp,
    roundTo,
    FREQ_INTERVALS,
} from '../../features/calculator/lib/pharmaEngine';

const enanthate: Compound = { id: 'test_e', name: 'Testosterone Enanthate', halfLife: 4.5, esterWeight: 0.72 };
const propionate: Compound = { id: 'test_p', name: 'Testosterone Propionate', halfLife: 0.8, esterWeight: 0.83 };

describe('clamp / roundTo (float guards)', () => {
    it('resolves NaN and ±Infinity to safe defaults', () => {
        expect(clamp(Number.NaN, 0, 10)).toBe(0);
        expect(roundTo(Number.NaN, 2)).toBe(0);
        expect(clamp(Number.POSITIVE_INFINITY, 0, 10)).toBe(10);
        expect(clamp(Number.NEGATIVE_INFINITY, 0, 10)).toBe(0);
    });

    it('rounds without binary-float drift', () => {
        expect(roundTo(0.1 + 0.2, 1)).toBe(0.3);
        expect(roundTo(0.30000000000000004, 2)).toBe(0.3);
    });
});

describe('batemanLevel (Bateman absorption–elimination)', () => {
    it('returns 0 before injection and at t=0', () => {
        expect(batemanLevel({ doseMg: 250, halfLifeDays: 4.5, deltaDays: -1 })).toBe(0);
        expect(batemanLevel({ doseMg: 250, halfLifeDays: 4.5, deltaDays: 0 })).toBe(0);
    });

    it('is positive shortly after injection and decays long-term', () => {
        const at1 = batemanLevel({ doseMg: 250, halfLifeDays: 4.5, deltaDays: 1, esterWeight: 0.72 });
        const at30 = batemanLevel({ doseMg: 250, halfLifeDays: 4.5, deltaDays: 30, esterWeight: 0.72 });
        expect(at1).toBeGreaterThan(0);
        expect(at30).toBeLessThan(5);
    });

    it('scales linearly with ester-adjusted active dose', () => {
        const half = batemanLevel({ doseMg: 500, halfLifeDays: 4.5, deltaDays: 2, esterWeight: 0.72 });
        const full = batemanLevel({ doseMg: 250, halfLifeDays: 4.5, deltaDays: 2, esterWeight: 0.72 });
        expect(half).toBeCloseTo(full * 2, 4);
    });

    it('never emits NaN for garbage input', () => {
        const out = batemanLevel({ doseMg: Number.NaN, halfLifeDays: 4.5, deltaDays: 5 });
        expect(Number.isNaN(out)).toBe(false);
        expect(out).toBe(0);
    });
});

describe('decayLevel (exponential half-life)', () => {
    it('halves the dose at exactly one half-life', () => {
        expect(decayLevel(250, 7, 7)).toBeCloseTo(125, 4);
        expect(decayLevel(250, 7, 14)).toBeCloseTo(62.5, 4);
    });
});

describe('clearance & PCT timing', () => {
    it('computes 5.32× clearance windows with 1 decimal', () => {
        expect(clearanceDaysFromHalfLife(4.5)).toBe(23.9); // 4.5 × 5.32 = 23.94
        expect(clearanceDaysFromHalfLife(14)).toBe(74.5);  // 14 × 5.32 = 74.48
    });

    it('schedules PCT ≈ 3.5× t½, clamped to [3, 21] days', () => {
        expect(pctWaitDays(4.5)).toBe(16);  // 4.5 × 3.5 = 15.75 → 16
        expect(pctWaitDays(7)).toBe(21);    // 24.5 → clamped to 21
        expect(pctWaitDays(14)).toBe(21);   // 49 → clamped to 21
        expect(pctWaitDays(0.8)).toBe(3);   // 2.8 → clamped up to 3
    });

    it('maps frequency codes to injection intervals', () => {
        expect(FREQ_INTERVALS.ed).toBe(1);
        expect(FREQ_INTERVALS.eod).toBe(2);
        expect(FREQ_INTERVALS.e3d).toBe(3);
        expect(FREQ_INTERVALS.e7d).toBe(7);
    });

    it('builds absolute injection days for a protocol window', () => {
        expect(buildInjectionDays(0, 21, 7)).toEqual([0, 7, 14]);
        expect(buildInjectionDays(7, 14, 3)).toEqual([7, 10, 13, 16, 19]);
    });
});

describe('simulateSerum (full protocol)', () => {
    it('returns an empty profile for an empty stack', () => {
        const profile = simulateSerum({ stack: [], compounds: [enanthate] });
        expect(profile.series).toHaveLength(0);
        expect(profile.maxLevel).toBe(0);
    });

    it('models accumulation to a positive Cmax with Cmin ≤ Cmax', () => {
        const profile = simulateSerum({
            stack: [{ compoundId: 'test_e', dosage: 250, frequency: 'e7d', duration: 12, startWeek: 1 }],
            compounds: [enanthate],
        });
        expect(profile.maxLevel).toBeGreaterThan(0);
        expect(profile.troughLevel).toBeGreaterThan(0);
        expect(profile.troughLevel).toBeLessThanOrEqual(profile.maxLevel);
        expect(profile.lastInjectionDay).toBeGreaterThan(0);
        expect(profile.activePhaseEndDay).toBe(84); // 12 weeks
        // Series covers the active phase + clearance buffer.
        expect(profile.series.length).toBeGreaterThan(120);
        // Sub-daily resolution samples the true peak (Cmax in mg-eq).
        expect(profile.maxLevel).toBeGreaterThan(100);
    });

    it('short esters reach higher frequency-dependent stability', () => {
        const daily = simulateSerum({
            stack: [{ compoundId: 'test_p', dosage: 100, frequency: 'ed', duration: 8, startWeek: 1 }],
            compounds: [propionate],
        });
        const weekly = simulateSerum({
            stack: [{ compoundId: 'test_e', dosage: 250, frequency: 'e7d', duration: 12, startWeek: 1 }],
            compounds: [enanthate],
        });
        // Compare only within each active window for a fair CV-based stability score.
        const activeLevels = (p: { series: { total: number }[]; activePhaseEndDay: number }) =>
            p.series.slice(0, p.activePhaseEndDay).map(d => d.total).filter(v => v > 0);
        expect(stabilityScore(activeLevels(daily))).toBeGreaterThan(stabilityScore(activeLevels(weekly)));
    });

    it('is deterministic: same input ⇒ identical output', () => {
        const input = {
            stack: [{ compoundId: 'test_e', dosage: 250, frequency: 'e7d', duration: 12, startWeek: 1 }],
            compounds: [enanthate],
        };
        const a = simulateSerum(input);
        const b = simulateSerum(input);
        expect(a.maxLevel).toBe(b.maxLevel);
        expect(a.troughLevel).toBe(b.troughLevel);
        expect(a.series).toEqual(b.series);
    });
});

describe('stabilityScore', () => {
    it('scores flat steady-state as 100', () => {
        expect(stabilityScore([100, 100, 100, 100])).toBe(100);
    });

    it('scores severe oscillation low', () => {
        expect(stabilityScore([100, 10, 100, 10])).toBeLessThan(50);
    });

    it('returns 0 for empty or non-positive data', () => {
        expect(stabilityScore([])).toBe(0);
        expect(stabilityScore([0, 0, 0])).toBe(0);
    });
});

describe('assessRisks', () => {
    it('flags 19-nor, orals, aromatizers and AI presence', () => {
        const risks = assessRisks([
            { compoundId: 'test_e', dosage: 250, frequency: 'e7d', duration: 12, startWeek: 1 },
            { compoundId: 'deca', dosage: 200, frequency: 'e7d', duration: 12, startWeek: 1 },
            { compoundId: 'anavar', dosage: 40, frequency: 'ed', duration: 8, startWeek: 1 },
            { compoundId: 'win_o', dosage: 50, frequency: 'ed', duration: 6, startWeek: 1 },
            { compoundId: 'arimidex', dosage: 0.5, frequency: 'eod', duration: 12, startWeek: 1 },
        ]);
        expect(risks.has19Nor).toBe(true);
        expect(risks.oralCount).toBe(2);
        expect(risks.aromatizationRisk).toBe(1);
        expect(risks.hasAI).toBe(true);
    });
});
