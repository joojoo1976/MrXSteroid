/**
 * lib/tools/contracts.test.ts
 * Layer 0 contract tests — envelope validity, provenance quality buckets,
 * severity ranking and the fail-fast guards that keep invalid payloads out of
 * Supabase, the Bio-Dashboard and the AI context builder.
 */
import { describe, it, expect } from 'vitest';
import {
    ToolContractError,
    byteLength,
    createToolOutput,
    deriveDataQuality,
    formatProvenance,
    highestSeverity,
    isToolOutput,
    rankKeyFindings,
    type DataProvenance,
    type KeyFinding,
    type ToolOutputParams,
} from './contracts';

const provenance = (overrides: Partial<DataProvenance> = {}): DataProvenance => ({
    source: 'manual',
    recordedAt: '2026-09-21T10:00:00.000Z',
    timezone: 'Africa/Cairo',
    unit: 'kg',
    confidence: 1,
    dataQuality: 'high',
    ...overrides,
});

const findings: KeyFinding[] = [
    { code: 'INFO_TIP', labelAr: 'ملاحظة', labelEn: 'Tip', value: 'ok', severity: 'info' },
    { code: 'LOW_HCT', labelAr: 'هيماتوكريت منخفض', labelEn: 'Low hematocrit', value: 38, severity: 'important' },
    { code: 'WATCH_E2', labelAr: 'مراقبة الإستراديول', labelEn: 'Monitor estradiol', value: 'high', severity: 'monitor' },
];

const baseParams = (): ToolOutputParams<{ bmr: number }> => ({
    toolId: 'mrx.tool.macro',
    toolSlug: 'macro',
    calculatedAt: '2026-09-21T10:00:00.000Z',
    locale: 'ar',
    unitSystem: 'metric',
    accessTier: 'free',
    snapshotType: 'draft',
    result: { bmr: 1800 },
    provenance: provenance(),
    keyFindings: findings,
    seoLinks: {
        prevTool: { titleAr: 'الحاسبة الشاملة', titleEn: 'Master Calculator', slug: 'master-calculator' },
        nextTool: { titleAr: 'حاسبة نسبة الدهون', titleEn: 'Body Fat Calculator', slug: 'bodyfat' },
    },
});

describe('Layer 0 — ToolOutput contract', () => {
    it('builds a valid envelope and severity-ranks the findings', () => {
        const output = createToolOutput(baseParams());

        expect(output.toolSlug).toBe('macro');
        expect(output.accessTier).toBe('free');
        expect(output.result).toEqual({ bmr: 1800 });
        expect(output.keyFindings.map((f) => f.severity)).toEqual(['important', 'monitor', 'info']);
        expect(output.seoLinks.nextTool.slug).toBe('bodyfat');
    });

    it('accepts an untyped (default generic) output', () => {
        const output = createToolOutput({ ...baseParams(), result: 'plain-string-payload' });
        expect(output.result).toBe('plain-string-payload');
    });

    it('rejects a non-kebab tool slug', () => {
        expect(() => createToolOutput({ ...baseParams(), toolSlug: 'Macro Tool' }))
            .toThrowError(ToolContractError);
    });

    it('rejects a missing toolId, bad locale, bad tier and bad snapshot type', () => {
        expect(() => createToolOutput({ ...baseParams(), toolId: '  ' })).toThrow(/toolId/);
        // @ts-expect-error intentional invalid locale for the boundary test
        expect(() => createToolOutput({ ...baseParams(), locale: 'fr' })).toThrow(/locale/);
        // @ts-expect-error intentional invalid tier for the boundary test
        expect(() => createToolOutput({ ...baseParams(), accessTier: 'vip' })).toThrow(/accessTier/);
        // @ts-expect-error intentional invalid snapshot type for the boundary test
        expect(() => createToolOutput({ ...baseParams(), snapshotType: 'archived' })).toThrow(/snapshotType/);
    });

    it('rejects an undefined result, a bad timestamp and an invalid finding severity', () => {
        // @ts-expect-error undefined payload must be rejected at runtime
        expect(() => createToolOutput({ ...baseParams(), result: undefined })).toThrow(/result is required/);
        expect(() => createToolOutput({ ...baseParams(), calculatedAt: 'yesterday' })).toThrow(/ISO-8601/);
        expect(() => createToolOutput({
            ...baseParams(),
            // @ts-expect-error intentional invalid severity for the boundary test
            keyFindings: [{ code: 'X', labelAr: 'أ', labelEn: 'x', value: 1, severity: 'critical' }],
        })).toThrow(/severity/);
    });

    it('requires bilingual labels and prev/next interlinking', () => {
        expect(() => createToolOutput({
            ...baseParams(),
            keyFindings: [{ code: 'X', labelAr: '', labelEn: 'x', value: 1, severity: 'info' }],
        })).toThrow(/labelAr/);

        // @ts-expect-error seoLinks is mandatory (SEO §7)
        expect(() => createToolOutput({ ...baseParams(), seoLinks: null })).toThrow(/seoLinks is required/);
    });

    it('rejects provenance with an unknown source or quality', () => {
        // @ts-expect-error intentional invalid source for the boundary test
        expect(() => createToolOutput({ ...baseParams(), provenance: provenance({ source: 'telepathy' }) }))
            .toThrow(/provenance.source/);
        // @ts-expect-error intentional invalid quality for the boundary test
        expect(() => createToolOutput({ ...baseParams(), provenance: provenance({ dataQuality: 'perfect' }) }))
            .toThrow(/provenance.dataQuality/);
    });
});

describe('Layer 0 — payload byte accounting', () => {
    it('measures UTF-8 bytes, not JS string length (Arabic = 2 bytes/char)', () => {
        expect(byteLength('')).toBe(0);
        expect(byteLength('abc')).toBe(3);
        expect(byteLength('م')).toBe(2);
        expect(byteLength('م.م')).toBe(5); // 2 + 1 + 2
        expect(byteLength('🏆')).toBe(4); // astral plane
        expect(byteLength('x'.repeat(300))).toBe(300);
    });
});

describe('Layer 0 — provenance quality derivation', () => {
    it('maps confidence onto high / medium / low buckets at the documented thresholds', () => {
        expect(deriveDataQuality(1)).toBe('high');
        expect(deriveDataQuality(0.9)).toBe('high');
        expect(deriveDataQuality(0.89)).toBe('medium');
        expect(deriveDataQuality(0.7)).toBe('medium');
        expect(deriveDataQuality(0.69)).toBe('low');
        expect(deriveDataQuality(0)).toBe('low');
    });

    it('clamps out-of-range and non-finite confidence instead of throwing', () => {
        expect(deriveDataQuality(7)).toBe('high');
        expect(deriveDataQuality(-3)).toBe('low');
        expect(deriveDataQuality(Number.NaN)).toBe('low');
    });

    it('formats a single-line audit string including the original unit', () => {
        const line = formatProvenance(provenance({
            unit: 'kg',
            originalUnit: 'lb',
            confidence: 0.85,
            dataQuality: 'medium',
            deviceId: 'scale-01',
        }));
        expect(line).toContain('manual');
        expect(line).toContain('@scale-01');
        expect(line).toContain('kg (from lb)');
        expect(line).toContain('medium(0.85)');
    });
});

describe('Layer 0 — findings ranking & guards', () => {
    it('sorts by severity while preserving engine order within a tier', () => {
        const ranked = rankKeyFindings([
            { code: 'A', labelAr: 'أ', labelEn: 'a', value: 1, severity: 'info' },
            { code: 'B', labelAr: 'ب', labelEn: 'b', value: 2, severity: 'monitor' },
            { code: 'C', labelAr: 'ج', labelEn: 'c', value: 3, severity: 'monitor' },
        ]);
        expect(ranked.map((f) => f.code)).toEqual(['B', 'C', 'A']);
    });

    it('reports the highest severity, or null for an empty list', () => {
        expect(highestSeverity(findings)).toBe('important');
        expect(highestSeverity([])).toBeNull();
    });

    it('recognizes a well-formed envelope and rejects partial ones', () => {
        expect(isToolOutput(createToolOutput(baseParams()))).toBe(true);
        expect(isToolOutput(null)).toBe(false);
        expect(isToolOutput({ toolId: 'x' })).toBe(false);

        const { keyFindings: dropped, ...withoutFindings } = createToolOutput(baseParams());
        expect(dropped.length).toBe(3);
        expect(isToolOutput(withoutFindings)).toBe(false);
    });
});
