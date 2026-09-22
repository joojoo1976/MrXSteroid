/**
 * lib/tools/adapters/timeline.test.ts
 * Tool #080 — Layer 2 + Layer 3 tests: schema boundary, canonical envelope,
 * severity findings and registry-driven SEO links.
 */
import { describe, it, expect } from 'vitest';
import {
    calculateTimeline,
    DEFAULT_TIMELINE_INPUT,
    type EngineInput,
    type TimelineResult,
} from '../engines/timeline';
import { TimelineInputSchema, tryParseTimelineInput } from '../schemas/timeline';
import {
    AGGRESSIVE_DELTA_THRESHOLD,
    BODYFAT_REFERENCE_RANGE,
    buildTimelineKeyFindings,
    buildTimelineOutput,
    buildTimelineProvenance,
} from './timeline';

const validInput: EngineInput = {
    startingWeightKg: 90,
    startingBodyFatPct: 25,
    goal: 'fat_loss',
    biologicalStatus: 'natural',
    experienceLevel: 'intermediate',
    caloricDeltaKcal: -500,
    timelineWeeks: 12,
};

const buildOutput = (snapshotType: 'draft' | 'submitted_snapshot' | 'dashboard_projection' = 'dashboard_projection') =>
    buildTimelineOutput(validInput, {
        locale: 'ar',
        unitSystem: 'metric',
        snapshotType,
        calculatedAt: '2026-09-21T10:00:00.000Z',
        recordedAt: '2026-09-21T08:00:00.000Z',
    });

describe('Tool #080 — Layer 2 schema boundary', () => {
    it('accepts the canonical default protocol', () => {
        expect(tryParseTimelineInput(DEFAULT_TIMELINE_INPUT).ok).toBe(true);
    });

    it('rejects out-of-range weight, body fat, delta and weeks', () => {
        expect(tryParseTimelineInput({ ...validInput, startingWeightKg: 25 }).ok).toBe(false);
        expect(tryParseTimelineInput({ ...validInput, startingWeightKg: 301 }).ok).toBe(false);
        expect(tryParseTimelineInput({ ...validInput, startingBodyFatPct: 2 }).ok).toBe(false);
        expect(tryParseTimelineInput({ ...validInput, startingBodyFatPct: 61 }).ok).toBe(false);
        expect(tryParseTimelineInput({ ...validInput, caloricDeltaKcal: -1600 }).ok).toBe(false);
        expect(tryParseTimelineInput({ ...validInput, caloricDeltaKcal: 1600 }).ok).toBe(false);
        expect(tryParseTimelineInput({ ...validInput, timelineWeeks: 3 }).ok).toBe(false);
        expect(tryParseTimelineInput({ ...validInput, timelineWeeks: 53 }).ok).toBe(false);
    });

    it('rejects unknown enum values and unknown keys, with Arabic messages on numeric fields', () => {
        expect(tryParseTimelineInput({ ...validInput, goal: 'bulk' as never }).ok).toBe(false);
        expect(tryParseTimelineInput({ ...validInput, biologicalStatus: 'super' as never }).ok).toBe(false);
        expect(TimelineInputSchema.safeParse({ ...validInput, hacker: true }).success).toBe(false);
        expect(tryParseTimelineInput({ ...validInput, timelineWeeks: 5.5 }).ok).toBe(false);

        const arabic = tryParseTimelineInput({ ...validInput, startingWeightKg: 25 });
        expect(arabic.ok).toBe(false);
        if (!arabic.ok) expect(arabic.error.issues[0].message).toContain('الوزن');
    });
});

describe('Tool #080 — Layer 3 canonical envelope', () => {
    it('wraps the engine result in the registry-derived envelope', () => {
        const output = buildOutput();

        expect(output.toolId).toBe('mrx.tool.timeline');
        expect(output.toolSlug).toBe('timeline');
        expect(output.accessTier).toBe('free'); // registry is the single source of truth
        expect(output.seoLinks.prevTool.slug).toBe('cycle');
        expect(output.seoLinks.nextTool.slug).toBe('master-calculator');
        expect(output.result.timeline.length).toBe(12);
        expect(output.calculatedAt).toBe('2026-09-21T10:00:00.000Z'); // injected, never read from the clock
        expect(output.snapshotType).toBe('dashboard_projection');
        expect(output.provenance.unit).toBe(BODYFAT_REFERENCE_RANGE.unit);
    });

    it('is deterministic for identical injected timestamps', () => {
        const a = buildOutput('draft');
        const b = buildOutput('draft');
        expect(a).toEqual(b);
        expect(a.snapshotType).toBe('draft');
        expect(b.snapshotType).toBe('draft');
    });

    it('severity-ranks findings (important before monitor before info) and cites the book', () => {
        const base: TimelineResult = calculateTimeline(DEFAULT_TIMELINE_INPUT);

        const stalling = buildTimelineKeyFindings({ ...base, plateauWarningWeek: 5 }); // premature plateau
        const plateauFinding = stalling.find((f) => f.code === 'PLATEAU_STATUS');
        expect(plateauFinding?.severity).toBe('important');

        const latePlateau = buildTimelineKeyFindings({ ...base, plateauWarningWeek: 15 });
        const late = latePlateau.find((f) => f.code === 'PLATEAU_STATUS');
        expect(late?.severity).toBe('monitor');

        const ranked = buildOutput().keyFindings;
        const ranks = ranked.map((f) => ({ important: 0, monitor: 1, info: 2 } as Record<string, number>)[f.severity]);
        expect([...ranks].sort((x, y) => x - y)).toEqual(ranks);

        // Book citation is present on the composition-change finding.
        const composition = buildTimelineKeyFindings(base).find((f) => f.code === 'TOTAL_COMPOSITION_CHANGE');
        expect(composition?.labelEn).toContain('Mr. X-Steroid');
    });

    it('carries the reference range and injected timezone in provenance', () => {
        const provenance = buildTimelineProvenance({
            locale: 'ar',
            unitSystem: 'metric',
            snapshotType: 'draft',
            calculatedAt: '2026-09-21T10:00:00.000Z',
            recordedAt: '2026-09-21T10:00:00.000Z',
            timezone: 'Africa/Cairo',
        });

        expect(provenance.referenceRange?.low).toBe(BODYFAT_REFERENCE_RANGE.low);
        expect(provenance.referenceRange?.high).toBe(BODYFAT_REFERENCE_RANGE.high);
        expect(provenance.referenceRange?.source).toBe('Mr. X-Steroid Book — Body Composition Kinetics');
        expect(provenance.confidence).toBe(0.9);
        expect(provenance.measurementMethod).toBe('simulated model estimate');
        expect(provenance.timezone).toBe('Africa/Cairo');
    });

    it('exposes the aggressive-delta threshold constant for monitor logic', () => {
        expect(AGGRESSIVE_DELTA_THRESHOLD).toBe(1000);
    });
});
