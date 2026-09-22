/**
 * lib/tools/adapters/multi-ester-pharmacokinetics.test.ts
 * Tool #001 — Layer 2 + Layer 3 tests: schema boundary, canonical envelope,
 * severity findings and registry-driven SEO links.
 */
import { describe, it, expect } from 'vitest';
import { DEFAULT_MULTI_ESTER_INPUT, calculateMultiEsterPK, type EngineInput, type PharmacokineticResult } from '../engines/multi-ester-pharmacokinetics';
import { MultiEsterInputSchema, tryParseMultiEsterInput } from '../schemas/multi-ester-pharmacokinetics';
import {
    buildMultiEsterPKOutput,
    buildSerumKeyFindings,
    buildSerumProvenance,
    SERUM_REFERENCE_RANGE,
} from './multi-ester-pharmacokinetics';

const validInput: EngineInput = {
    bodyWeightKg: 85,
    simulationDays: 60,
    injections: [
        { id: 'inj-1', day: 0, doseMg: 250, ester: 'enanthate' },
        { id: 'inj-2', day: 7, doseMg: 250, ester: 'enanthate' },
    ],
};

const buildOutput = (snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection' = 'dashboard_projection') =>
    buildMultiEsterPKOutput(validInput, {
        locale: 'ar',
        unitSystem: 'metric',
        snapshotType,
        calculatedAt: '2026-09-21T10:00:00.000Z',
        recordedAt: '2026-09-21T08:00:00.000Z',
    });

describe('Tool #001 — Layer 2 schema boundary', () => {
    it('accepts the canonical default protocol', () => {
        expect(tryParseMultiEsterInput(DEFAULT_MULTI_ESTER_INPUT).ok).toBe(true);
    });

    it('rejects zero doses, out-of-range days/weights/scope and empty protocols', () => {
        expect(tryParseMultiEsterInput({ ...validInput, injections: [{ id: 'x', day: 0, doseMg: 0, ester: 'enanthate' }] }).ok).toBe(false);
        expect(tryParseMultiEsterInput({ ...validInput, injections: [{ id: 'x', day: 366, doseMg: 250, ester: 'enanthate' }] }).ok).toBe(false);
        expect(tryParseMultiEsterInput({ ...validInput, bodyWeightKg: 25 }).ok).toBe(false);
        expect(tryParseMultiEsterInput({ ...validInput, bodyWeightKg: 300 }).ok).toBe(false);
        expect(tryParseMultiEsterInput({ ...validInput, simulationDays: 6 }).ok).toBe(false);
        expect(tryParseMultiEsterInput({ ...validInput, simulationDays: 181 }).ok).toBe(false);
        expect(tryParseMultiEsterInput({ ...validInput, injections: [] }).ok).toBe(false);
    });

    it('rejects unknown keys (.strict) and fractional days, with Arabic messages', () => {
        expect(MultiEsterInputSchema.safeParse({ ...validInput, hacker: true }).success).toBe(false);
        const fractional = tryParseMultiEsterInput({ ...validInput, injections: [{ ...validInput.injections[0], day: 1.5 }] });
        expect(fractional.ok).toBe(false);

        const arabic = tryParseMultiEsterInput({ ...validInput, injections: [{ id: '1', day: 0, doseMg: 0, ester: 'enanthate' }] });
        expect(arabic.ok).toBe(false);
        if (!arabic.ok) expect(arabic.error.issues[0].message).toContain('الجرعة');
    });
});

describe('Tool #001 — Layer 3 canonical envelope', () => {
    it('wraps the engine result in the registry-derived envelope', () => {
        const output = buildOutput();

        expect(output.toolId).toBe('mrx.tool.multi-ester-pharmacokinetics');
        expect(output.toolSlug).toBe('multi-ester-pharmacokinetics');
        expect(output.accessTier).toBe('premium'); // registry is the single source of truth
        expect(output.seoLinks.prevTool.slug).toBe('halflife');
        expect(output.seoLinks.nextTool.slug).toBe('aromatization-risk');
        expect(output.result.timeline.length).toBe(61);
        expect(output.calculatedAt).toBe('2026-09-21T10:00:00.000Z'); // injected, never read from the clock
        expect(output.snapshotType).toBe('dashboard_projection');
        expect(output.provenance.unit).toBe('ng/dL');
    });

    it('is deterministic for identical injected timestamps', () => {
        const a = buildOutput('draft');
        const b = buildOutput('draft');
        expect(a).toEqual(b);
        expect(a.snapshotType).toBe('draft');
        expect(b.snapshotType).toBe('draft');
    });

    it('flags an extreme peak as important and a wild fluctuation as monitor', () => {
        const base: PharmacokineticResult = calculateMultiEsterPK(DEFAULT_MULTI_ESTER_INPUT);

        const extreme = buildSerumKeyFindings({ ...base, peakConcentrationNgDl: 3500, peakToTroughRatio: 5 });
        expect(extreme.find((f) => f.code === 'PEAK_SERUM')?.severity).toBe('important');
        expect(extreme.find((f) => f.code === 'PEAK_TROUGH_FLUCTUATION')?.severity).toBe('monitor');

        const calm = buildSerumKeyFindings({ ...base, peakConcentrationNgDl: 900, peakToTroughRatio: 1.5 });
        expect(calm.every((f) => f.severity === 'info')).toBe(true);

        // findings arrive severity-ranked through the contract (important first)
        const ranked = buildOutput().keyFindings;
        const ranks = ranked.map((f) => ({ important: 0, monitor: 1, info: 2 } as Record<string, number>)[f.severity]);
        expect([...ranks].sort((x, y) => x - y)).toEqual(ranks);
    });

    it('carries the physiological reference range and injected timezone in provenance', () => {
        const provenance = buildSerumProvenance({
            locale: 'ar',
            unitSystem: 'metric',
            snapshotType: 'draft',
            calculatedAt: '2026-09-21T10:00:00.000Z',
            recordedAt: '2026-09-21T10:00:00.000Z',
            timezone: 'Africa/Cairo',
        });

        expect(provenance.referenceRange?.low).toBe(SERUM_REFERENCE_RANGE.low);
        expect(provenance.referenceRange?.high).toBe(SERUM_REFERENCE_RANGE.high);
        expect(provenance.referenceRange?.source).toBe('Physiological Male Baseline Reference');
        expect(provenance.confidence).toBe(0.98);
        expect(provenance.measurementMethod).toBe('simulated model estimate');
        expect(provenance.timezone).toBe('Africa/Cairo');
    });
});