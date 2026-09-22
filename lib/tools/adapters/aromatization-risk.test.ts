/**
 * lib/tools/adapters/aromatization-risk.test.ts
 * Tool #002 — Layer 2 + Layer 3 tests: schema boundary, canonical envelope,
 * severity findings and registry-driven SEO links.
 */
import { describe, it, expect } from 'vitest';
import {
    DEFAULT_AROMATIZATION_INPUT,
    type EngineInput,
    type AromatizationRiskResult,
} from '../engines/aromatization-risk';
import { AromatizationRiskInputSchema, tryParseAromatizationRiskInput } from '../schemas/aromatization-risk';
import {
    buildAromatizationRiskKeyFindings,
    buildAromatizationRiskOutput,
    buildAromatizationRiskProvenance,
    E2_REFERENCE_RANGE,
    UNNECESSARY_AI_ALERT,
} from './aromatization-risk';

const validInput: EngineInput = {
    weeksOnCycle: 12,
    weeklyDoseMg: 500,
    bodyFatPct: 15,
    compoundType: 'testosterone',
    aiProtocol: 'none',
};

const buildOutput = (snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection' = 'dashboard_projection') =>
    buildAromatizationRiskOutput(validInput, {
        locale: 'ar',
        unitSystem: 'metric',
        snapshotType,
        calculatedAt: '2026-09-21T10:00:00.000Z',
        recordedAt: '2026-09-21T08:00:00.000Z',
    });

describe('Tool #002 — Layer 2 schema boundary', () => {
    it('accepts the canonical default protocol', () => {
        expect(tryParseAromatizationRiskInput(DEFAULT_AROMATIZATION_INPUT).ok).toBe(true);
    });

    it('rejects out-of-range dose, weeks, and body fat', () => {
        expect(tryParseAromatizationRiskInput({ ...validInput, weeklyDoseMg: 50 }).ok).toBe(false);
        expect(tryParseAromatizationRiskInput({ ...validInput, weeklyDoseMg: 3000 }).ok).toBe(false);
        expect(tryParseAromatizationRiskInput({ ...validInput, weeksOnCycle: 3 }).ok).toBe(false);
        expect(tryParseAromatizationRiskInput({ ...validInput, weeksOnCycle: 25 }).ok).toBe(false);
        expect(tryParseAromatizationRiskInput({ ...validInput, bodyFatPct: 3 }).ok).toBe(false);
        expect(tryParseAromatizationRiskInput({ ...validInput, bodyFatPct: 50 }).ok).toBe(false);
    });

    it('rejects unknown enum values and unknown keys, with Arabic messages on numeric fields', () => {
        expect(tryParseAromatizationRiskInput({ ...validInput, compoundType: 'superdrug' as never }).ok).toBe(false);
        expect(tryParseAromatizationRiskInput({ ...validInput, aiProtocol: 'turbo' as never }).ok).toBe(false);
        expect(AromatizationRiskInputSchema.safeParse({ ...validInput, hacker: true }).success).toBe(false);

        const arabic = tryParseAromatizationRiskInput({ ...validInput, weeklyDoseMg: 50 });
        expect(arabic.ok).toBe(false);
        if (!arabic.ok) expect(arabic.error.issues[0].message).toContain('جرعة');
    });
});

describe('Tool #002 — Layer 3 canonical envelope', () => {
    it('wraps the engine result in the registry-derived envelope', () => {
        const output = buildOutput();

        expect(output.toolId).toBe('mrx.tool.aromatization-risk');
        expect(output.toolSlug).toBe('aromatization-risk');
        expect(output.accessTier).toBe('free'); // registry is the single source of truth
        // neighbors: multi-ester-pharmacokinetics (45) <-> aromatization-risk (45.5) <-> hpta-recovery (46)
        expect(output.seoLinks.prevTool.slug).toBe('multi-ester-pharmacokinetics');
        expect(output.seoLinks.nextTool.slug).toBe('hpta-recovery');
        expect(output.result.timeline.length).toBeGreaterThan(0);
        expect(output.calculatedAt).toBe('2026-09-21T10:00:00.000Z');
        expect(output.snapshotType).toBe('dashboard_projection');
        expect(output.provenance.unit).toBe(E2_REFERENCE_RANGE.unit);
    });

    it('is deterministic for identical injected timestamps', () => {
        const a = buildOutput('draft');
        const b = buildOutput('draft');
        expect(a).toEqual(b);
        expect(a.snapshotType).toBe('draft');
    });

    it('severity-ranks findings and cites the book in provenance', () => {
        const base: AromatizationRiskResult = {
            timeline: [],
            steadyStateE2: 120,
            peakE2: 110,
            finalE2: 35,
            peakRiskZone: 'critical',
            compoundAromatizationRate: 1.0,
            aiSuppressionFactor: 0,
            bodyFatMultiplier: 1.0,
            gynoRiskScore: 80,
            waterRetentionRiskScore: 60,
            crashRiskScore: 0,
            aiRecommendation: 'adjust_up',
            totalTimelineWeeks: 20,
        };

        const unnecessaryAiFindings = buildAromatizationRiskKeyFindings(base, {
            weeksOnCycle: 12,
            weeklyDoseMg: 500,
            bodyFatPct: 15,
            compoundType: 'trenbolone',
            aiProtocol: 'aggressive',
        });
        const aiFinding = unnecessaryAiFindings.find((f) => f.code === 'AI_RECOMMENDATION');
        expect(aiFinding?.severity).toBe('important');
        expect(aiFinding?.value).toBe(UNNECESSARY_AI_ALERT);

        const ranked = buildOutput().keyFindings;
        const ranks = ranked.map((f) => ({ important: 0, monitor: 1, info: 2 } as Record<string, number>)[f.severity]);
        expect([...ranks].sort((x, y) => x - y)).toEqual(ranks);

        // Book citation present in provenance reference range source.
        const provenance = buildAromatizationRiskProvenance({
            locale: 'ar',
            unitSystem: 'metric',
            snapshotType: 'draft',
            calculatedAt: '2026-09-21T10:00:00.000Z',
            recordedAt: '2026-09-21T10:00:00.000Z',
        });
        expect(provenance.referenceRange?.source).toContain('Mr. X-Steroid Book');
    });

    it('flags critical peak E2 as important', () => {
        const base: AromatizationRiskResult = {
            timeline: [],
            steadyStateE2: 150,
            peakE2: 140,
            finalE2: 40,
            peakRiskZone: 'critical',
            compoundAromatizationRate: 1.0,
            aiSuppressionFactor: 0,
            bodyFatMultiplier: 1.5,
            gynoRiskScore: 90,
            waterRetentionRiskScore: 80,
            crashRiskScore: 0,
            aiRecommendation: 'adjust_up',
            totalTimelineWeeks: 20,
        };
        const findings = buildAromatizationRiskKeyFindings(base, {
            weeksOnCycle: 12,
            weeklyDoseMg: 1000,
            bodyFatPct: 25,
            compoundType: 'testosterone',
            aiProtocol: 'none',
        });
        const peak = findings.find((f) => f.code === 'PEAK_E2');
        expect(peak?.severity).toBe('important');
    });

    it('carries the reference range and injected timezone in provenance', () => {
        const provenance = buildAromatizationRiskProvenance({
            locale: 'ar',
            unitSystem: 'metric',
            snapshotType: 'draft',
            calculatedAt: '2026-09-21T10:00:00.000Z',
            recordedAt: '2026-09-21T10:00:00.000Z',
            timezone: 'Africa/Cairo',
        });

        expect(provenance.referenceRange?.low).toBe(E2_REFERENCE_RANGE.low);
        expect(provenance.referenceRange?.high).toBe(E2_REFERENCE_RANGE.high);
        expect(provenance.confidence).toBe(0.9);
        expect(provenance.measurementMethod).toBe('simulated model estimate');
        expect(provenance.timezone).toBe('Africa/Cairo');
    });
});
