/**
 * lib/tools/adapters/hpta-recovery.test.ts
 * Tool #003 — Layer 2 + Layer 3 tests: schema boundary, canonical envelope,
 * severity findings and registry-driven SEO links.
 */
import { describe, it, expect } from 'vitest';
import {
    DEFAULT_HPTA_INPUT,
    type EngineInput,
    type HptaRecoveryResult,
} from '../engines/hpta-recovery';
import { HptaRecoveryInputSchema, tryParseHptaRecoveryInput } from '../schemas/hpta-recovery';
import {
    buildHptaRecoveryKeyFindings,
    buildHptaRecoveryOutput,
    buildHptaRecoveryProvenance,
    NO_PCT_ALERT,
    TESTOSTERONE_REFERENCE_RANGE,
} from './hpta-recovery';

const validInput: EngineInput = {
    weeksOnCycle: 12,
    compoundPotency: 'heavy',
    pctProtocol: 'aggressive_mrx',
};

const buildOutput = (snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection' = 'dashboard_projection') =>
    buildHptaRecoveryOutput(validInput, {
        locale: 'ar',
        unitSystem: 'metric',
        snapshotType,
        calculatedAt: '2026-09-21T10:00:00.000Z',
        recordedAt: '2026-09-21T08:00:00.000Z',
    });

describe('Tool #003 — Layer 2 schema boundary', () => {
    it('accepts the canonical default protocol', () => {
        expect(tryParseHptaRecoveryInput(DEFAULT_HPTA_INPUT).ok).toBe(true);
    });

    it('rejects out-of-range cycle weeks', () => {
        expect(tryParseHptaRecoveryInput({ ...validInput, weeksOnCycle: 3 }).ok).toBe(false);
        expect(tryParseHptaRecoveryInput({ ...validInput, weeksOnCycle: 25 }).ok).toBe(false);
        expect(tryParseHptaRecoveryInput({ ...validInput, weeksOnCycle: 5.5 }).ok).toBe(false);
    });

    it('rejects unknown enum values and unknown keys, with Arabic messages on numeric fields', () => {
        expect(tryParseHptaRecoveryInput({ ...validInput, compoundPotency: 'super' as never }).ok).toBe(false);
        expect(tryParseHptaRecoveryInput({ ...validInput, pctProtocol: 'turbo' as never }).ok).toBe(false);
        expect(HptaRecoveryInputSchema.safeParse({ ...validInput, hacker: true }).success).toBe(false);

        const arabic = tryParseHptaRecoveryInput({ ...validInput, weeksOnCycle: 3 });
        expect(arabic.ok).toBe(false);
        if (!arabic.ok) expect(arabic.error.issues[0].message).toContain('دورة');
    });
});

describe('Tool #003 — Layer 3 canonical envelope', () => {
    it('wraps the engine result in the registry-derived envelope', () => {
        const output = buildOutput();

        expect(output.toolId).toBe('mrx.tool.hpta-recovery');
        expect(output.toolSlug).toBe('hpta-recovery');
        expect(output.accessTier).toBe('free'); // registry is the single source of truth
        // neighbors: multi-ester-pharmacokinetics (45) <-> aromatization-risk (45.5) <-> hpta-recovery (46) <-> pct-timing (47)
        expect(output.seoLinks.prevTool.slug).toBe('aromatization-risk');
        expect(output.seoLinks.nextTool.slug).toBe('pct-timing');
        expect(output.result.timeline.length).toBeGreaterThan(0);
        expect(output.calculatedAt).toBe('2026-09-21T10:00:00.000Z');
        expect(output.snapshotType).toBe('dashboard_projection');
        expect(output.provenance.unit).toBe(TESTOSTERONE_REFERENCE_RANGE.unit);
    });

    it('is deterministic for identical injected timestamps', () => {
        const a = buildOutput('draft');
        const b = buildOutput('draft');
        expect(a).toEqual(b);
        expect(a.snapshotType).toBe('draft');
    });

    it('severity-ranks findings and cites the book in provenance', () => {
        const base: HptaRecoveryResult = {
            timeline: [],
            washoutWeeks: 2,
            totalTimelineWeeks: 30,
            peakSuppressionPct: 95,
            recoveryCompleteWeek: 0,
            pctProtocolBoost: 1,
            finalTestosteronePct: 40,
        };

        const noPctFindings = buildHptaRecoveryKeyFindings(base, {
            weeksOnCycle: 12,
            compoundPotency: 'extreme',
            pctProtocol: 'none',
        });
        const pctFinding = noPctFindings.find((f) => f.code === 'PCT_PROTOCOL');
        expect(pctFinding?.severity).toBe('important');
        expect(pctFinding?.value).toBe(NO_PCT_ALERT);

        const ranked = buildOutput().keyFindings;
        const ranks = ranked.map((f) => ({ important: 0, monitor: 1, info: 2 } as Record<string, number>)[f.severity]);
        expect([...ranks].sort((x, y) => x - y)).toEqual(ranks);

        // Book citation present in provenance reference range source.
        const provenance = buildHptaRecoveryProvenance({
            locale: 'ar',
            unitSystem: 'metric',
            snapshotType: 'draft',
            calculatedAt: '2026-09-21T10:00:00.000Z',
            recordedAt: '2026-09-21T10:00:00.000Z',
        });
        expect(provenance.referenceRange?.source).toContain('Mr. X-Steroid Book');
    });

    it('flags peak suppression ≥ 90% as important', () => {
        const base: HptaRecoveryResult = {
            timeline: [],
            washoutWeeks: 2,
            totalTimelineWeeks: 30,
            peakSuppressionPct: 95,
            recoveryCompleteWeek: 20,
            pctProtocolBoost: 2.65,
            finalTestosteronePct: 92,
        };
        const findings = buildHptaRecoveryKeyFindings(base, {
            weeksOnCycle: 12,
            compoundPotency: 'extreme',
            pctProtocol: 'aggressive_mrx',
        });
        const peak = findings.find((f) => f.code === 'PEAK_SUPPRESSION');
        expect(peak?.severity).toBe('important');
    });

    it('carries the reference range and injected timezone in provenance', () => {
        const provenance = buildHptaRecoveryProvenance({
            locale: 'ar',
            unitSystem: 'metric',
            snapshotType: 'draft',
            calculatedAt: '2026-09-21T10:00:00.000Z',
            recordedAt: '2026-09-21T10:00:00.000Z',
            timezone: 'Africa/Cairo',
        });

        expect(provenance.referenceRange?.low).toBe(TESTOSTERONE_REFERENCE_RANGE.low);
        expect(provenance.referenceRange?.high).toBe(TESTOSTERONE_REFERENCE_RANGE.high);
        expect(provenance.confidence).toBe(0.9);
        expect(provenance.measurementMethod).toBe('simulated model estimate');
        expect(provenance.timezone).toBe('Africa/Cairo');
    });
});
