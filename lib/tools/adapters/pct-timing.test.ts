/**
 * lib/tools/adapters/pct-timing.test.ts
 * Tool #004 — Layer 2 + Layer 3 tests: schema boundary, canonical envelope,
 * severity findings and registry-driven SEO links.
 */
import { describe, it, expect } from 'vitest';
import {
    DEFAULT_PCT_TIMING_INPUT,
    type EngineInput,
    type PctTimingResult,
} from '../engines/pct-timing';
import { PctTimingInputSchema, tryParsePctTimingInput } from '../schemas/pct-timing';
import {
    buildPctTimingKeyFindings,
    buildPctTimingOutput,
    buildPctTimingProvenance,
    HALFLIFE_REFERENCE_RANGE,
    LONG_ESTER_THRESHOLD_DAYS,
    NO_PCT_LONG_ESTER,
} from './pct-timing';

const validInput: EngineInput = {
    compoundHalfLifeDays: 5,
    weeksOnCycle: 12,
    clearanceThresholdPct: 5,
    pctProtocol: 'standard',
};

const buildOutput = (snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection' = 'dashboard_projection') =>
    buildPctTimingOutput(validInput, {
        locale: 'ar',
        unitSystem: 'metric',
        snapshotType,
        calculatedAt: '2026-09-21T10:00:00.000Z',
        recordedAt: '2026-09-21T08:00:00.000Z',
    });

describe('Tool #004 — Layer 2 schema boundary', () => {
    it('accepts the canonical default protocol', () => {
        expect(tryParsePctTimingInput(DEFAULT_PCT_TIMING_INPUT).ok).toBe(true);
    });

    it('rejects out-of-range half-life, cycle weeks and threshold', () => {
        expect(tryParsePctTimingInput({ ...validInput, compoundHalfLifeDays: 0.1 }).ok).toBe(false);
        expect(tryParsePctTimingInput({ ...validInput, compoundHalfLifeDays: 31 }).ok).toBe(false);
        expect(tryParsePctTimingInput({ ...validInput, weeksOnCycle: 3 }).ok).toBe(false);
        expect(tryParsePctTimingInput({ ...validInput, weeksOnCycle: 25 }).ok).toBe(false);
        expect(tryParsePctTimingInput({ ...validInput, clearanceThresholdPct: 0 }).ok).toBe(false);
        expect(tryParsePctTimingInput({ ...validInput, clearanceThresholdPct: 21 }).ok).toBe(false);
        expect(tryParsePctTimingInput({ ...validInput, weeksOnCycle: 5.5 }).ok).toBe(false);
    });

    it('rejects unknown enum values and unknown keys, with Arabic messages on numeric fields', () => {
        expect(tryParsePctTimingInput({ ...validInput, pctProtocol: 'turbo' as never }).ok).toBe(false);
        expect(PctTimingInputSchema.safeParse({ ...validInput, hacker: true }).success).toBe(false);

        const arabic = tryParsePctTimingInput({ ...validInput, compoundHalfLifeDays: 0.1 });
        expect(arabic.ok).toBe(false);
        if (!arabic.ok) expect(arabic.error.issues[0].message).toContain('نصف عمر');
    });
});

describe('Tool #004 — Layer 3 canonical envelope', () => {
    it('wraps the engine result in the registry-derived envelope', () => {
        const output = buildOutput();

        expect(output.toolId).toBe('mrx.tool.pct-timing');
        expect(output.toolSlug).toBe('pct-timing');
        expect(output.accessTier).toBe('free'); // registry is the single source of truth
        // neighbors: hpta-recovery (46) <-> pct-timing (47) <-> lab (50)
        expect(output.seoLinks.prevTool.slug).toBe('hpta-recovery');
        expect(output.seoLinks.nextTool.slug).toBe('lab');
        expect(output.result.timeline.length).toBeGreaterThan(0);
        expect(output.calculatedAt).toBe('2026-09-21T10:00:00.000Z');
        expect(output.snapshotType).toBe('dashboard_projection');
        expect(output.provenance.unit).toBe(HALFLIFE_REFERENCE_RANGE.unit);
    });

    it('is deterministic for identical injected timestamps', () => {
        const a = buildOutput('draft');
        const b = buildOutput('draft');
        expect(a).toEqual(b);
        expect(a.snapshotType).toBe('draft');
    });

    it('severity-ranks findings and cites the book in provenance', () => {
        const base: PctTimingResult = {
            timeline: [],
            washoutWeeks: 3,
            pctStartWeek: 15,
            pctDurationWeeks: 0,
            fullRecoveryWeek: 0,
            totalTimelineWeeks: 35,
            finalTestosteronePct: 40,
        };

        const longEsterNoPct = buildPctTimingKeyFindings(base, {
            compoundHalfLifeDays: 15,
            weeksOnCycle: 12,
            clearanceThresholdPct: 5,
            pctProtocol: 'none',
        });
        const pctFinding = longEsterNoPct.find((f) => f.code === 'PCT_DURATION');
        expect(pctFinding?.severity).toBe('important');
        expect(pctFinding?.value).toBe(NO_PCT_LONG_ESTER);

        const ranked = buildOutput().keyFindings;
        const ranks = ranked.map((f) => ({ important: 0, monitor: 1, info: 2 } as Record<string, number>)[f.severity]);
        expect([...ranks].sort((x, y) => x - y)).toEqual(ranks);

        // Book citation present in provenance reference range source.
        const provenance = buildPctTimingProvenance({
            locale: 'ar',
            unitSystem: 'metric',
            snapshotType: 'draft',
            calculatedAt: '2026-09-21T10:00:00.000Z',
            recordedAt: '2026-09-21T10:00:00.000Z',
        });
        expect(provenance.referenceRange?.source).toContain('Mr. X-Steroid Book');
    });

    it('flags short-ester no-PCT as monitor (not important)', () => {
        const base: PctTimingResult = {
            timeline: [],
            washoutWeeks: 1,
            pctStartWeek: 13,
            pctDurationWeeks: 0,
            fullRecoveryWeek: 0,
            totalTimelineWeeks: 33,
            finalTestosteronePct: 45,
        };
        const findings = buildPctTimingKeyFindings(base, {
            compoundHalfLifeDays: 2,
            weeksOnCycle: 12,
            clearanceThresholdPct: 5,
            pctProtocol: 'none',
        });
        const pctFinding = findings.find((f) => f.code === 'PCT_DURATION');
        expect(pctFinding?.severity).toBe('monitor');
        expect(LONG_ESTER_THRESHOLD_DAYS).toBe(10);
    });

    it('carries the reference range and injected timezone in provenance', () => {
        const provenance = buildPctTimingProvenance({
            locale: 'ar',
            unitSystem: 'metric',
            snapshotType: 'draft',
            calculatedAt: '2026-09-21T10:00:00.000Z',
            recordedAt: '2026-09-21T10:00:00.000Z',
            timezone: 'Africa/Cairo',
        });

        expect(provenance.referenceRange?.low).toBe(HALFLIFE_REFERENCE_RANGE.low);
        expect(provenance.referenceRange?.high).toBe(HALFLIFE_REFERENCE_RANGE.high);
        expect(provenance.confidence).toBe(0.9);
        expect(provenance.measurementMethod).toBe('simulated model estimate');
        expect(provenance.timezone).toBe('Africa/Cairo');
    });
});
