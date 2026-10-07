import { describe, expect, it } from 'vitest';
import {
    buildHcgSermProtocolKeyFindings,
    buildHcgSermProtocolOutput,
    TOOL_SLUG,
} from './hcg-serm-protocol';
import { calculateHcgSermProtocol } from '../engines/hcg-serm-protocol';

describe('Tool #005 Layer 3 Adapter — HCG & SERM Protocol Generator', () => {
    const sampleInput = {
        compounds: [{ catalogId: 'testosterone', weeklyDoseMg: 500 }],
        cycleWeeks: 14,
        testicularStatus: 'mild_atrophy' as const,
        preferredSerm: 'auto_select' as const,
        sideEffects: {
            ocularSensitivity: true,
            moodSensitivity: false,
            jointPain: false,
            gynoHistory: false,
        },
        bodyWeightKg: 85,
    };

    it('generates clinical key findings with auto-switch and HCG alerts', () => {
        const result = calculateHcgSermProtocol(sampleInput);
        const findings = buildHcgSermProtocolKeyFindings(result, sampleInput);

        expect(findings.length).toBeGreaterThanOrEqual(2);
        expect(findings.some((f) => f.id === 'suppression_score')).toBe(true);
        expect(findings.some((f) => f.id === 'hcg_priming_required')).toBe(true);
        expect(findings.some((f) => f.id === 'serm_auto_switch')).toBe(true);
    });

    it('builds canonical ToolOutput envelope adhering to MrXSteroid contract', () => {
        const output = buildHcgSermProtocolOutput(sampleInput, {
            locale: 'ar',
            unitSystem: 'metric',
            snapshotType: 'dashboard_projection',
            calculatedAt: '2026-10-06T12:00:00.000Z',
            recordedAt: '2026-10-06T12:00:00.000Z',
        });

        expect(output.toolSlug).toBe(TOOL_SLUG);
        expect(output.result.sScore).toBeGreaterThan(0);
        expect(output.keyFindings.length).toBeGreaterThan(0);
        expect(output.provenance.source).toBe('manual');
    });
});
