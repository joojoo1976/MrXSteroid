/**
 * lib/health/normalization.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Layer 4 — Health Integration & Normalization.
 * ═══════════════════════════════════════════════════════════════════════════
 * Every biometric that enters the platform (Apple HealthKit, Android Health
 * Connect, FHIR DiagnosticReport, a connected device or a manual entry) is
 * converted to canonical SI units, stamped with `DataProvenance` and
 * de-duplicated against the source-priority matrix before any engine sees it.
 *
 * PURE MODULE — no React, no DOM, no I/O and no `Date`; timestamps are always
 * supplied by the caller.
 *
 * Priority matrix (spec §6): Manual Override > FHIR Diagnostic Report >
 * HealthKit / Health Connect > Device Sync > Bulk import.
 *
 * PLATFORM NOTE: HealthKit and Health Connect are native APIs and cannot be
 * read from a Next.js server or from Safari. Data reaches this layer through
 * (a) the iOS/Android companion app shell, (b) Apple Health export XML /
 * Google Takeout imports, or (c) a FHIR endpoint — all three land in the same
 * `HealthRecordInput` shape below, so no caller needs to know the difference.
 */
import {
    deriveDataQuality,
    type DataProvenance,
    type DataSource,
} from '../tools/contracts';

// ─────────────────────────────────────────────────────────────────────────────
// Metric taxonomy
// ─────────────────────────────────────────────────────────────────────────────

export type HealthMetricKind =
    | 'body_weight'
    | 'height'
    | 'body_fat_percentage'
    | 'blood_pressure_systolic'
    | 'blood_pressure_diastolic'
    | 'resting_heart_rate'
    | 'glucose'
    | 'testosterone_total'
    | 'temperature'
    | 'hemoglobin'
    | 'hematocrit';

export const HEALTH_METRIC_KINDS: readonly HealthMetricKind[] = [
    'body_weight',
    'height',
    'body_fat_percentage',
    'blood_pressure_systolic',
    'blood_pressure_diastolic',
    'resting_heart_rate',
    'glucose',
    'testosterone_total',
    'temperature',
    'hemoglobin',
    'hematocrit',
];

/** Canonical (SI-flavoured) unit every tool engine consumes for each metric. */
export const CANONICAL_UNITS: Record<HealthMetricKind, string> = {
    body_weight: 'kg',
    height: 'cm',
    body_fat_percentage: '%',
    blood_pressure_systolic: 'mmHg',
    blood_pressure_diastolic: 'mmHg',
    resting_heart_rate: 'bpm',
    glucose: 'mmol/L',
    testosterone_total: 'nmol/L',
    temperature: '°C',
    hemoglobin: 'g/L',
    hematocrit: '%',
};

/** Source reliability used by `deduplicateRecords`. Higher wins. */
export const PROVENANCE_PRIORITY: Record<DataSource, number> = {
    manual: 5,
    fhir: 4,
    healthkit: 3,
    health_connect: 3,
    device: 2,
    import: 1,
};

/** Default de-duplication window: readings inside the same minute collapse. */
export const DEFAULT_DEDUPLICATION_WINDOW_MS = 60_000;

export class HealthNormalizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'HealthNormalizationError';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Unit engine (dimension-based, offset-aware)
// ─────────────────────────────────────────────────────────────────────────────

interface UnitDefinition {
    /** Physical dimension — conversions are only legal inside one dimension. */
    dimension: string;
    /** Base-unit value = (value + offset) × factor. */
    factor: number;
    offset?: number;
}

/**
 * Curated unit table. Dimensions are deliberately substance-specific where the
 * conversion depends on molar mass (glucose, testosterone, hemoglobin), so a
 * mg/dL → mmol/L conversion can never silently use the wrong factor.
 */
export const UNIT_TABLE: Readonly<Record<string, UnitDefinition>> = {
    // mass (base: kg)
    kg: { dimension: 'mass', factor: 1 },
    g: { dimension: 'mass', factor: 0.001 },
    lb: { dimension: 'mass', factor: 0.45359237 },
    oz: { dimension: 'mass', factor: 0.028349523125 },
    st: { dimension: 'mass', factor: 6.35029318 },
    // length (base: cm)
    cm: { dimension: 'length', factor: 1 },
    mm: { dimension: 'length', factor: 0.1 },
    m: { dimension: 'length', factor: 100 },
    in: { dimension: 'length', factor: 2.54 },
    ft: { dimension: 'length', factor: 30.48 },
    // ratio / percentage (base: %)
    '%': { dimension: 'ratio', factor: 1 },
    fraction: { dimension: 'ratio', factor: 100 },
    // temperature (base: °C)
    '°C': { dimension: 'temperature', factor: 1 },
    '°F': { dimension: 'temperature', factor: 5 / 9, offset: -32 },
    // pressure (base: mmHg)
    mmHg: { dimension: 'pressure', factor: 1 },
    kPa: { dimension: 'pressure', factor: 7.50061683 },
    // heart rate (base: bpm)
    bpm: { dimension: 'heart_rate', factor: 1 },
    // plasma glucose (base: mmol/L)
    'mmol/L': { dimension: 'glucose_molar', factor: 1 },
    'mg/dL': { dimension: 'glucose_molar', factor: 0.05551 },
    // total testosterone (base: nmol/L)
    'nmol/L': { dimension: 'testosterone_molar', factor: 1 },
    'ng/dL': { dimension: 'testosterone_molar', factor: 0.034671 },
    'ng/mL': { dimension: 'testosterone_molar', factor: 3.4671 },
    // hemoglobin (base: g/L)
    'g/L': { dimension: 'hemoglobin_mass', factor: 1 },
    'g/dL': { dimension: 'hemoglobin_mass', factor: 10 },
};

/** Case/spelling aliases → canonical unit key in `UNIT_TABLE`. */
const UNIT_ALIASES: Readonly<Record<string, string>> = {
    lbs: 'lb',
    pound: 'lb',
    pounds: 'lb',
    kilogram: 'kg',
    kilograms: 'kg',
    grams: 'g',
    ozs: 'oz',
    ounce: 'oz',
    ounces: 'oz',
    stone: 'st',
    inches: 'in',
    inch: 'in',
    feet: 'ft',
    foot: 'ft',
    meter: 'm',
    meters: 'm',
    metre: 'm',
    centimetre: 'cm',
    centimeter: 'cm',
    millimetre: 'mm',
    millimeter: 'mm',
    percent: '%',
    percentage: '%',
    pct: '%',
    ratio: 'fraction',
    celsius: '°C',
    fahrenheit: '°F',
    cel: '°C',
    fahr: '°F',
    'mg/dl': 'mg/dL',
    'mmol/l': 'mmol/L',
    'ng/dl': 'ng/dL',
    'ng/ml': 'ng/mL',
    'g/dl': 'g/dL',
    'g/l': 'g/L',
    mmhg: 'mmHg',
    kpa: 'kPa',
    beats_per_minute: 'bpm',
    'beats/min': 'bpm',
};

/** Resolves any alias/casing to a `UNIT_TABLE` key, or `null` when unknown. */
export function resolveUnitKey(unit: string): string | null {
    if (!unit || typeof unit !== 'string') return null;
    const trimmed = unit.trim();
    if (trimmed in UNIT_TABLE) return trimmed;
    const lower = trimmed.toLowerCase();
    if (lower in UNIT_ALIASES) return UNIT_ALIASES[lower];
    return null;
}

/** Rounds to a fixed number of decimals without float-noise drift. */
export const roundTo = (value: number, decimals = 2): number => {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
};

const toBase = (value: number, unit: UnitDefinition): number => (value + (unit.offset ?? 0)) * unit.factor;
const fromBase = (value: number, unit: UnitDefinition): number => value / unit.factor - (unit.offset ?? 0);

/**
 * Converts `value` from `fromUnit` to `toUnit` (aliases accepted).
 * Throws `HealthNormalizationError` for unknown units or dimension mismatch —
 * a silent wrong-unit result is worse than a loud failure.
 */
export function normalizeUnit(value: number, fromUnit: string, toUnit: string): number {
    if (!Number.isFinite(value)) {
        throw new HealthNormalizationError(`value must be a finite number (received ${String(value)})`);
    }
    const fromKey = resolveUnitKey(fromUnit);
    const toKey = resolveUnitKey(toUnit);
    if (!fromKey) throw new HealthNormalizationError(`unknown source unit "${fromUnit}"`);
    if (!toKey) throw new HealthNormalizationError(`unknown target unit "${toUnit}"`);
    const from = UNIT_TABLE[fromKey];
    const to = UNIT_TABLE[toKey];
    if (from.dimension !== to.dimension) {
        throw new HealthNormalizationError(
            `cannot convert ${fromKey} (${from.dimension}) to ${toKey} (${to.dimension}) — dimension mismatch`,
        );
    }
    return fromBase(toBase(value, from), to);
}

/** Safe variant of `normalizeUnit` — never throws (mirrors `tryParse*` helpers). */
export function tryNormalizeUnit(
    value: number,
    fromUnit: string,
    toUnit: string,
): { ok: true; value: number } | { ok: false; error: HealthNormalizationError } {
    try {
        return { ok: true, value: normalizeUnit(value, fromUnit, toUnit) };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof HealthNormalizationError
                ? error
                : new HealthNormalizationError(error instanceof Error ? error.message : 'unit normalization failed'),
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Record normalization
// ─────────────────────────────────────────────────────────────────────────────

/** A raw reading exactly as delivered by any upstream integration. */
export interface HealthRecordInput {
    kind: HealthMetricKind;
    value: number;
    unit: string;
    source: DataSource;
    /** ISO-8601 instant the reading applies to. */
    recordedAt: string;
    timezone?: string;
    deviceId?: string;
    measurementMethod?: string;
    /** Optional override; otherwise derived from `source`. */
    confidence?: number;
    referenceRange?: DataProvenance['referenceRange'];
}

/** Canonical record + provenance — the only shape engines may consume. */
export interface NormalizedHealthRecord {
    kind: HealthMetricKind;
    /** Value expressed in `CANONICAL_UNITS[kind]`. */
    value: number;
    provenance: DataProvenance;
}

/** Baseline confidence per source, overridable per record. */
export const DEFAULT_SOURCE_CONFIDENCE: Record<DataSource, number> = {
    manual: 1,
    fhir: 0.95,
    healthkit: 0.9,
    health_connect: 0.9,
    device: 0.85,
    import: 0.6,
};

/** Canonical display precision per metric (no fake precision on integers). */
export const CANONICAL_DECIMALS: Record<HealthMetricKind, number> = {
    body_weight: 2,
    height: 1,
    body_fat_percentage: 1,
    blood_pressure_systolic: 0,
    blood_pressure_diastolic: 0,
    resting_heart_rate: 0,
    glucose: 2,
    testosterone_total: 2,
    temperature: 1,
    hemoglobin: 1,
    hematocrit: 1,
};

/** Converts a reference range into canonical units; drops it when invalid. */
function normalizeReferenceRange(
    range: DataProvenance['referenceRange'],
    toUnit: string,
): DataProvenance['referenceRange'] {
    if (!range) return undefined;
    try {
        return {
            low: range.low === undefined ? undefined : roundTo(normalizeUnit(range.low, range.unit, toUnit), 2),
            high: range.high === undefined ? undefined : roundTo(normalizeUnit(range.high, range.unit, toUnit), 2),
            unit: resolveUnitKey(toUnit) ?? toUnit,
            ...(range.source ? { source: range.source } : {}),
        };
    } catch {
        return undefined;
    }
}

/**
 * Canonicalizes one reading: unit conversion → provenance stamping → quality
 * bucket. Throws `HealthNormalizationError` on unusable input (unknown metric,
 * unknown source, unknown/incompatible unit, non-finite value, unparsable
 * timestamp). An unknown `source` must fail loud: downstream de-duplication
 * ranks records by source priority, and a silent `undefined` priority would
 * make the winner arbitrary.
 */
export function normalizeHealthRecord(record: HealthRecordInput): NormalizedHealthRecord {
    if (!record || typeof record !== 'object') {
        throw new HealthNormalizationError('record is required');
    }
    if (!HEALTH_METRIC_KINDS.includes(record.kind)) {
        throw new HealthNormalizationError(`unknown metric kind "${String(record.kind)}"`);
    }
    if (!(record.source in PROVENANCE_PRIORITY)) {
        throw new HealthNormalizationError(`unknown data source "${String(record.source)}"`);
    }
    if (Number.isNaN(Date.parse(record.recordedAt))) {
        throw new HealthNormalizationError('recordedAt must be an ISO-8601 timestamp');
    }
    const canonicalUnit = CANONICAL_UNITS[record.kind];
    const value = roundTo(normalizeUnit(record.value, record.unit, canonicalUnit), CANONICAL_DECIMALS[record.kind]);
    const confidence = Math.min(
        Math.max(record.confidence ?? DEFAULT_SOURCE_CONFIDENCE[record.source] ?? 0.5, 0),
        1,
    );
    const referenceRange = normalizeReferenceRange(record.referenceRange, canonicalUnit);

    return {
        kind: record.kind,
        value,
        provenance: {
            source: record.source,
            recordedAt: record.recordedAt,
            timezone: record.timezone ?? 'UTC',
            unit: canonicalUnit,
            ...(record.unit !== canonicalUnit ? { originalUnit: record.unit } : {}),
            ...(record.measurementMethod ? { measurementMethod: record.measurementMethod } : {}),
            ...(record.deviceId ? { deviceId: record.deviceId } : {}),
            confidence,
            dataQuality: deriveDataQuality(confidence),
            ...(referenceRange ? { referenceRange } : {}),
        },
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// De-duplication — source priority matrix
// ─────────────────────────────────────────────────────────────────────────────

export interface DeduplicateOptions {
    /** Collapse window in ms. Readings inside the same window compete. */
    windowMs?: number;
}

/**
 * Winner-takes-all comparison inside one `(kind, window)` bucket.
 * Order: source priority → confidence → most recent timestamp.
 * `?? 0` keeps an unregistered source from producing `NaN` comparisons.
 */
export function pickPreferredRecord(
    a: NormalizedHealthRecord,
    b: NormalizedHealthRecord,
): NormalizedHealthRecord {
    const priorityDiff =
        (PROVENANCE_PRIORITY[b.provenance.source] ?? 0) - (PROVENANCE_PRIORITY[a.provenance.source] ?? 0);
    if (priorityDiff !== 0) return priorityDiff > 0 ? b : a;
    const confidenceDiff = b.provenance.confidence - a.provenance.confidence;
    if (confidenceDiff !== 0) return confidenceDiff > 0 ? b : a;
    const timeA = Date.parse(a.provenance.recordedAt);
    const timeB = Date.parse(b.provenance.recordedAt);
    if (timeA === timeB) return a; // stable: first record wins ties
    return timeB > timeA ? b : a;
}

/**
 * Collapses overlapping readings from competing sources (e.g. a HealthKit
 * weight, a smart-scale sync and a manual override for the same minute) into a
 * single canonical record per `(kind, window)`.
 *
 * SEMANTIC LIMIT (documented, intentional): records are bucketed with
 * `Math.floor(epoch / windowMs)`, so two readings 1 ms apart that fall on
 * opposite sides of a bucket boundary are NOT merged. Pass an explicit larger
 * `windowMs` when the upstream source timestamps coarsely (device syncs).
 *
 * Output is sorted ascending by `recordedAt` (then `kind`) so the result is
 * fully deterministic for snapshot tests and dashboard rendering.
 */
export function deduplicateRecords(
    records: readonly NormalizedHealthRecord[],
    options: DeduplicateOptions = {},
): NormalizedHealthRecord[] {
    const windowMs = Math.max(1, options.windowMs ?? DEFAULT_DEDUPLICATION_WINDOW_MS);
    const winners = new Map<string, NormalizedHealthRecord>();

    for (const record of records) {
        if (!record || !record.provenance) continue;
        const epoch = Date.parse(record.provenance.recordedAt);
        if (Number.isNaN(epoch)) continue; // skip unparsable timestamps
        const key = `${record.kind}|${Math.floor(epoch / windowMs)}`;
        const existing = winners.get(key);
        winners.set(key, existing ? pickPreferredRecord(existing, record) : record);
    }

    return [...winners.values()].sort((a, b) => {
        const timeA = Date.parse(a.provenance.recordedAt);
        const timeB = Date.parse(b.provenance.recordedAt);
        if (timeA !== timeB) return timeA - timeB;
        return a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0;
    });
}

/** Confidence-weighted mean of one metric across a window (pure, no coercion). */
export function weightedAverage(records: readonly NormalizedHealthRecord[]): number | null {
    if (records.length === 0) return null;
    let weightSum = 0;
    let valueSum = 0;
    for (const record of records) {
        const weight = Math.max(record.provenance.confidence, 0.01);
        weightSum += weight;
        valueSum += record.value * weight;
    }
    return weightSum === 0 ? null : roundTo(valueSum / weightSum, 4);
}

// ─────────────────────────────────────────────────────────────────────────────
// FHIR R4 mapping (DiagnosticReport / Observation interoperability)
// ─────────────────────────────────────────────────────────────────────────────

export interface FhirCoding {
    system: string;
    code: string;
    display?: string;
}

export interface FhirCodeableConcept {
    coding: FhirCoding[];
    text?: string;
}

export interface FhirQuantity {
    value: number;
    unit: string;
    system: string;
    code: string;
}

export interface FhirObservation {
    resourceType: 'Observation';
    id: string;
    status: 'final' | 'preliminary';
    category: FhirCodeableConcept[];
    code: FhirCodeableConcept;
    subject?: { reference: string };
    effectiveDateTime: string;
    issued: string;
    valueQuantity: FhirQuantity;
    device?: { display: string };
    note?: { text: string }[];
}

export interface FhirBundle {
    resourceType: 'Bundle';
    type: 'collection';
    total: number;
    entry: Array<{ resource: FhirObservation }>;
}

/** LOINC codes — the interoperability backbone for every supported metric. */
export const LOINC_CODES: Record<HealthMetricKind, { code: string; display: string }> = {
    body_weight: { code: '29463-7', display: 'Body weight' },
    height: { code: '8302-2', display: 'Body height' },
    body_fat_percentage: { code: '41982-0', display: 'Percentage of body fat' },
    blood_pressure_systolic: { code: '8480-6', display: 'Systolic blood pressure' },
    blood_pressure_diastolic: { code: '8462-4', display: 'Diastolic blood pressure' },
    resting_heart_rate: { code: '40443-4', display: 'Heart rate resting' },
    glucose: { code: '2339-0', display: 'Glucose [Mass/volume] in Blood' },
    testosterone_total: { code: '2986-8', display: 'Testosterone [Mass/volume] in Serum or Plasma' },
    temperature: { code: '8310-5', display: 'Body temperature' },
    hemoglobin: { code: '718-7', display: 'Hemoglobin [Mass/volume] in Blood' },
    hematocrit: { code: '4544-3', display: 'Hematocrit [Volume Fraction] of Blood' },
};

/** UCUM codes for the canonical unit of each metric. */
export const UCUM_CODES: Readonly<Record<string, string>> = {
    kg: 'kg',
    cm: 'cm',
    '%': '%',
    mmHg: 'mm[Hg]',
    bpm: '/min',
    'mmol/L': 'mmol/L',
    'nmol/L': 'nmol/L',
    '°C': 'Cel',
    'g/L': 'g/L',
};

/** Metrics reported by a lab (category `laboratory`) rather than as vitals. */
export const LABORATORY_KINDS: readonly HealthMetricKind[] = [
    'glucose',
    'testosterone_total',
    'hemoglobin',
    'hematocrit',
];

export interface FhirMapOptions {
    /** Patient reference, e.g. `fhir-patient-id` or a Supabase user id. */
    patientId?: string;
    /** Override the generated observation id (deterministic by default). */
    id?: string;
}

/** Deterministic, URL-safe observation id: `mrx-body-weight-2026-09-21T10-00-00-000Z`. */
export function buildObservationId(record: NormalizedHealthRecord): string {
    const stamp = record.provenance.recordedAt.replace(/[:.]/g, '-');
    return `mrx-${record.kind.replace(/_/g, '-')}-${stamp}`;
}

/**
 * Maps one canonical record onto a FHIR R4 `Observation`.
 * Confidence < 0.9 is exported as `preliminary` so downstream EHR consumers
 * can filter low-quality device/import data instead of trusting it blindly.
 */
export function mapToFHIRResource(
    record: NormalizedHealthRecord,
    options: FhirMapOptions = {},
): FhirObservation {
    if (!record || !record.provenance) {
        throw new HealthNormalizationError('a normalized record with provenance is required for FHIR mapping');
    }
    const loinc = LOINC_CODES[record.kind];
    const ucum = UCUM_CODES[record.provenance.unit] ?? record.provenance.unit;
    const category = LABORATORY_KINDS.includes(record.kind) ? 'laboratory' : 'vital-signs';

    return {
        resourceType: 'Observation',
        id: options.id ?? buildObservationId(record),
        status: record.provenance.confidence >= 0.9 ? 'final' : 'preliminary',
        category: [
            {
                coding: [
                    {
                        system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                        code: category,
                        display: category === 'laboratory' ? 'Laboratory' : 'Vital Signs',
                    },
                ],
            },
        ],
        code: {
            coding: [{ system: 'http://loinc.org', code: loinc.code, display: loinc.display }],
            text: loinc.display,
        },
        ...(options.patientId ? { subject: { reference: `Patient/${options.patientId}` } } : {}),
        effectiveDateTime: record.provenance.recordedAt,
        issued: record.provenance.recordedAt,
        valueQuantity: {
            value: record.value,
            unit: record.provenance.unit,
            system: 'http://unitsofmeasure.org',
            code: ucum,
        },
        ...(record.provenance.deviceId ? { device: { display: record.provenance.deviceId } } : {}),
        note: [
            {
                text: `source=${record.provenance.source}; confidence=${record.provenance.confidence.toFixed(2)}; quality=${record.provenance.dataQuality}; tz=${record.provenance.timezone}`,
            },
        ],
    };
}

/** Maps a de-duplicated record set onto a FHIR `collection` Bundle. */
export function mapToFHIRBundle(
    records: readonly NormalizedHealthRecord[],
    options: FhirMapOptions = {},
): FhirBundle {
    const entry = records.map((record) => ({ resource: mapToFHIRResource(record, options) }));
    return { resourceType: 'Bundle', type: 'collection', total: entry.length, entry };
}

