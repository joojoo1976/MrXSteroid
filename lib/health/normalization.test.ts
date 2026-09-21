/**
 * lib/health/normalization.test.ts
 * Layer 4 tests — unit conversion engine, provenance stamping, source-priority
 * de-duplication and FHIR R4 mapping.
 */
import { describe, it, expect } from 'vitest';
import {
    CANONICAL_UNITS,
    DEFAULT_SOURCE_CONFIDENCE,
    HEALTH_METRIC_KINDS,
    HealthNormalizationError,
    LOINC_CODES,
    PROVENANCE_PRIORITY,
    UCUM_CODES,
    buildObservationId,
    deduplicateRecords,
    mapToFHIRBundle,
    mapToFHIRResource,
    normalizeHealthRecord,
    normalizeUnit,
    pickPreferredRecord,
    resolveUnitKey,
    roundTo,
    tryNormalizeUnit,
    weightedAverage,
    type HealthRecordInput,
    type NormalizedHealthRecord,
} from './normalization';

const record = (overrides: Partial<HealthRecordInput> = {}): HealthRecordInput => ({
    kind: 'body_weight',
    value: 80,
    unit: 'kg',
    source: 'manual',
    recordedAt: '2026-09-21T10:00:00.000Z',
    timezone: 'Africa/Cairo',
    ...overrides,
});

describe('Layer 4 — unit engine', () => {
    it('converts imperial weight and height into metric', () => {
        expect(normalizeUnit(180, 'lb', 'kg')).toBeCloseTo(81.6466, 4);
        expect(normalizeUnit(70, 'in', 'cm')).toBeCloseTo(177.8, 6);
        expect(normalizeUnit(5, 'ft', 'cm')).toBeCloseTo(152.4, 6);
        expect(normalizeUnit(1.8, 'm', 'cm')).toBeCloseTo(180, 6);
        expect(normalizeUnit(14, 'st', 'kg')).toBeCloseTo(88.9041, 4);
    });

    it('converts substance-specific lab units with the correct molar factor', () => {
        expect(normalizeUnit(100, 'mg/dL', 'mmol/L')).toBeCloseTo(5.551, 6);
        expect(normalizeUnit(500, 'ng/dL', 'nmol/L')).toBeCloseTo(17.3355, 4);
        expect(normalizeUnit(15, 'g/dL', 'g/L')).toBeCloseTo(150, 6);
    });

    it('handles offset conversions (Fahrenheit) and ratios', () => {
        expect(roundTo(normalizeUnit(98.6, '°F', '°C'), 2)).toBe(37);
        expect(roundTo(normalizeUnit(37, '°C', '°F'), 2)).toBe(98.6);
        expect(roundTo(normalizeUnit(0.18, 'fraction', '%'), 2)).toBe(18);
        expect(normalizeUnit(120, 'kPa', 'mmHg')).toBeCloseTo(900.07, 1);
    });

    it('accepts aliases and mixed casing', () => {
        expect(resolveUnitKey('LBS')).toBe('lb');
        expect(resolveUnitKey('inches')).toBe('in');
        expect(resolveUnitKey('cel')).toBe('°C');
        expect(resolveUnitKey('mg/DL')).toBe('mg/dL');
        expect(resolveUnitKey('stone')).toBe('st');
        expect(resolveUnitKey('beats/min')).toBe('bpm');
        expect(resolveUnitKey('bananas')).toBeNull();
    });

    it('throws on unknown units, dimension mismatch and non-finite input', () => {
        expect(() => normalizeUnit(1, 'bananas', 'kg')).toThrowError(HealthNormalizationError);
        expect(() => normalizeUnit(1, 'kg', 'bananas')).toThrowError(HealthNormalizationError);
        expect(() => normalizeUnit(80, 'kg', 'cm')).toThrow(/dimension mismatch/);
        expect(() => normalizeUnit(Number.NaN, 'kg', 'kg')).toThrow(/finite/);
    });

    it('exposes a safe try-variant that never throws', () => {
        const ok = tryNormalizeUnit(180, 'lb', 'kg');
        expect(ok.ok).toBe(true);
        if (ok.ok) expect(ok.value).toBeCloseTo(81.6466, 4);

        const failed = tryNormalizeUnit(80, 'kg', 'cm');
        expect(failed.ok).toBe(false);
        if (!failed.ok) expect(failed.error).toBeInstanceOf(HealthNormalizationError);
    });
});

describe('Layer 4 — record normalization & provenance', () => {
    it('canonicalizes into SI units and stamps provenance', () => {
        const normalized = normalizeHealthRecord(record({ value: 180, unit: 'lb', deviceId: 'scale-01' }));

        expect(normalized.kind).toBe('body_weight');
        expect(normalized.value).toBe(81.65);
        expect(normalized.provenance.unit).toBe('kg');
        expect(normalized.provenance.originalUnit).toBe('lb');
        expect(normalized.provenance.deviceId).toBe('scale-01');
        expect(normalized.provenance.confidence).toBe(1);
        expect(normalized.provenance.dataQuality).toBe('high');
        expect(normalized.provenance.timezone).toBe('Africa/Cairo');
    });

    it('derives confidence from the source and honours an explicit override', () => {
        const fromImport = normalizeHealthRecord(record({ source: 'import', value: 80 }));
        expect(fromImport.provenance.confidence).toBe(DEFAULT_SOURCE_CONFIDENCE.import);
        expect(fromImport.provenance.dataQuality).toBe('low');

        const overridden = normalizeHealthRecord(record({ source: 'import', confidence: 0.75 }));
        expect(overridden.provenance.dataQuality).toBe('medium');
    });

    it('converts an attached reference range into canonical units', () => {
        const normalized = normalizeHealthRecord(record({
            kind: 'glucose',
            value: 90,
            unit: 'mg/dL',
            referenceRange: { low: 70, high: 99, unit: 'mg/dL', source: 'lab-panel' },
        }));

        expect(normalized.provenance.unit).toBe('mmol/L');
        expect(normalized.provenance.referenceRange?.low).toBeCloseTo(3.89, 2);
        expect(normalized.provenance.referenceRange?.high).toBeCloseTo(5.5, 2);
        expect(normalized.provenance.referenceRange?.unit).toBe('mmol/L');
        expect(normalized.provenance.referenceRange?.source).toBe('lab-panel');
    });

    it('drops an incompatible reference range instead of throwing', () => {
        const normalized = normalizeHealthRecord(record({
            kind: 'glucose',
            value: 100,
            unit: 'mg/dL',
            referenceRange: { low: 60, high: 90, unit: 'kg' },
        }));

        expect(normalized.provenance.referenceRange).toBeUndefined();
        expect(normalized.provenance.unit).toBe('mmol/L');
        expect(normalized.value).toBeCloseTo(5.55, 2);
    });

    it('rejects unknown metrics, unknown units, unknown sources and bad timestamps', () => {
        expect(() => normalizeHealthRecord(record({ kind: 'aura' as never }))).toThrow(/unknown metric/);
        expect(() => normalizeHealthRecord(record({ source: 'telepathy' as never }))).toThrow(/unknown data source/);
        expect(() => normalizeHealthRecord(record({ unit: 'bananas' }))).toThrow(/unknown source unit/);
        expect(() => normalizeHealthRecord(record({ recordedAt: 'whenever' }))).toThrow(/ISO-8601/);
    });

    it('guards the dedup priority against an unregistered source (no NaN winners)', () => {
        const known = normalizeHealthRecord(record({ source: 'manual', value: 80 }));
        const unregistered: NormalizedHealthRecord = {
            kind: 'body_weight',
            value: 90,
            provenance: { ...known.provenance, source: 'ghost' as never, confidence: 1 },
        };
        // Priority falls back to 0, so the registered `manual` source wins.
        expect(pickPreferredRecord(known, unregistered)).toBe(known);
        expect(pickPreferredRecord(unregistered, known)).toBe(known);
    });
});

describe('Layer 4 — source-priority de-duplication', () => {
    const at = (iso: string) => iso;

    it('publishes the documented priority matrix', () => {
        expect(PROVENANCE_PRIORITY.manual).toBeGreaterThan(PROVENANCE_PRIORITY.fhir);
        expect(PROVENANCE_PRIORITY.fhir).toBeGreaterThan(PROVENANCE_PRIORITY.healthkit);
        expect(PROVENANCE_PRIORITY.healthkit).toBe(PROVENANCE_PRIORITY.health_connect);
        expect(PROVENANCE_PRIORITY.health_connect).toBeGreaterThan(PROVENANCE_PRIORITY.device);
        expect(PROVENANCE_PRIORITY.device).toBeGreaterThan(PROVENANCE_PRIORITY.import);
    });

    it('lets a manual override beat a HealthKit reading in the same window', () => {
        const merged = deduplicateRecords([
            normalizeHealthRecord(record({ source: 'healthkit', value: 80, recordedAt: at('2026-09-21T10:00:10.000Z') })),
            normalizeHealthRecord(record({ source: 'manual', value: 82, recordedAt: at('2026-09-21T10:00:40.000Z') })),
        ]);

        expect(merged).toHaveLength(1);
        expect(merged[0].value).toBe(82);
        expect(merged[0].provenance.source).toBe('manual');
    });

    it('keeps HealthKit / Health Connect above a raw device sync', () => {
        const merged = deduplicateRecords([
            normalizeHealthRecord(record({ source: 'device', value: 79, deviceId: 'scale-01' })),
            normalizeHealthRecord(record({ source: 'health_connect', value: 81 })),
        ]);

        expect(merged).toHaveLength(1);
        expect(merged[0].value).toBe(81);
        expect(merged[0].provenance.source).toBe('health_connect');
    });

    it('prefers the higher confidence when the source priority ties', () => {
        const winner = pickPreferredRecord(
            normalizeHealthRecord(record({ source: 'fhir', value: 80, confidence: 0.95 })),
            normalizeHealthRecord(record({ source: 'fhir', value: 81, confidence: 1 })),
        );
        expect(winner.value).toBe(81);
    });

    it('falls back to the most recent reading and keeps first on exact ties', () => {
        const older = normalizeHealthRecord(record({ source: 'manual', value: 80, recordedAt: at('2026-09-21T10:00:00.000Z') }));
        const newer = normalizeHealthRecord(record({ source: 'manual', value: 81, recordedAt: at('2026-09-21T10:00:30.000Z') }));
        expect(pickPreferredRecord(older, newer).value).toBe(81);
        expect(pickPreferredRecord(older, older)).toBe(older);
    });

    it('keeps readings from different metrics and different windows', () => {
        const merged = deduplicateRecords([
            normalizeHealthRecord(record({ kind: 'body_weight', value: 80, recordedAt: at('2026-09-21T10:00:00.000Z') })),
            normalizeHealthRecord(record({ kind: 'body_fat_percentage', value: 18, unit: '%', recordedAt: at('2026-09-21T10:00:00.000Z') })),
            normalizeHealthRecord(record({ kind: 'body_weight', value: 79, recordedAt: at('2026-09-22T10:00:00.000Z') })),
        ]);

        expect(merged).toHaveLength(3);
        expect(merged.map((r) => `${r.kind}@${r.provenance.recordedAt}`)).toEqual([
            'body_fat_percentage@2026-09-21T10:00:00.000Z',
            'body_weight@2026-09-21T10:00:00.000Z',
            'body_weight@2026-09-22T10:00:00.000Z',
        ]);
    });

    it('honours a custom window, skips unparsable timestamps and averages by confidence', () => {
        const wide = deduplicateRecords([
            normalizeHealthRecord(record({ source: 'manual', value: 80, recordedAt: at('2026-09-21T10:00:00.000Z') })),
            normalizeHealthRecord(record({ source: 'device', value: 80, recordedAt: at('2026-09-21T10:00:00.000Z') })),
        ], { windowMs: 3_600_000 });
        expect(wide).toHaveLength(1);

        const bad = normalizeHealthRecord(record({ value: 80 }));
        const corrupted: NormalizedHealthRecord = { ...bad, provenance: { ...bad.provenance, recordedAt: 'not-a-date' } };
        expect(deduplicateRecords([corrupted])).toHaveLength(0);

        const mean = weightedAverage([
            normalizeHealthRecord(record({ source: 'manual', value: 80, confidence: 1 })),
            normalizeHealthRecord(record({ source: 'import', value: 90, confidence: 0.5 })),
        ]);
        expect(mean).toBeCloseTo(83.3333, 3);
        expect(weightedAverage([])).toBeNull();
    });
});
describe('Layer 4 — metric taxonomy coverage', () => {
    it('declares a canonical unit, a UCUM code and a LOINC code for every metric', () => {
        for (const kind of HEALTH_METRIC_KINDS) {
            expect(CANONICAL_UNITS[kind]).toBeTruthy();
            expect(UCUM_CODES[CANONICAL_UNITS[kind]]).toBeTruthy();
            expect(LOINC_CODES[kind].code).toMatch(/^\d+-\d$/);
        }
    });
});

describe('Layer 4 — FHIR R4 mapping', () => {
    const weight = normalizeHealthRecord(record({ value: 180, unit: 'lb', deviceId: 'scale-01' }));
    const glucose = normalizeHealthRecord(record({
        kind: 'glucose',
        value: 100,
        unit: 'mg/dL',
        source: 'fhir',
        recordedAt: '2026-09-21T08:00:00.000Z',
    }));

    it('maps a vital sign to a final Observation with LOINC + UCUM codes', () => {
        const observation = mapToFHIRResource(weight, { patientId: 'user-123' });

        expect(observation.resourceType).toBe('Observation');
        expect(observation.status).toBe('final');
        expect(observation.code.coding[0]).toEqual({ system: 'http://loinc.org', code: '29463-7', display: 'Body weight' });
        expect(observation.category[0].coding[0].code).toBe('vital-signs');
        expect(observation.valueQuantity).toEqual({
            value: 81.65,
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg',
        });
        expect(observation.subject).toEqual({ reference: 'Patient/user-123' });
        expect(observation.device).toEqual({ display: 'scale-01' });
        expect(observation.effectiveDateTime).toBe('2026-09-21T10:00:00.000Z');
        expect(observation.note?.[0].text).toContain('source=manual');
    });

    it('categorizes lab panels and downgrades low-confidence data to preliminary', () => {
        const observation = mapToFHIRResource(glucose);
        expect(observation.category[0].coding[0].code).toBe('laboratory');
        expect(observation.code.coding[0].code).toBe('2339-0');
        expect(observation.valueQuantity.code).toBe('mmol/L');
        expect(observation.status).toBe('final');

        const imported = mapToFHIRResource(normalizeHealthRecord(record({ source: 'import', confidence: 0.5 })));
        expect(imported.status).toBe('preliminary');
    });

    it('builds a deterministic observation id and respects an override', () => {
        expect(buildObservationId(weight)).toBe('mrx-body-weight-2026-09-21T10-00-00-000Z');
        expect(mapToFHIRResource(weight, { id: 'custom-id' }).id).toBe('custom-id');
        expect(mapToFHIRResource(weight).subject).toBeUndefined();
    });

    it('wraps a de-duplicated record set into a collection Bundle', () => {
        const bundle = mapToFHIRBundle([weight, glucose], { patientId: 'user-123' });
        expect(bundle.resourceType).toBe('Bundle');
        expect(bundle.type).toBe('collection');
        expect(bundle.total).toBe(2);
        expect(bundle.entry.map((e) => e.resource.code.coding[0].code)).toEqual(['29463-7', '2339-0']);
    });

    it('throws for a record without provenance', () => {
        expect(() => mapToFHIRResource(null as unknown as NormalizedHealthRecord)).toThrowError(HealthNormalizationError);
    });
});
