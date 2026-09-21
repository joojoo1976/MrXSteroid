/**
 * lib/tools/contracts.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Layer 0 — Shared data contracts for the Mr. X-Steroid 5-layer tool stack.
 * ═══════════════════════════════════════════════════════════════════════════
 * PURE MODULE — no React, no DOM, no Supabase, no I/O and no `Date`.
 * Every timestamp is injected by the caller, which keeps each contract
 * deterministic and unit-testable exactly like `lib/metabolicModel.ts`.
 *
 * Every tool in the ecosystem emits exactly one `ToolOutput<T>` so the
 * Bio-Dashboard, the persistence adapter and the AI context builder can consume
 * any tool without tool-specific branching.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Primitive unions
// ─────────────────────────────────────────────────────────────────────────────

/** Render locale. Arabic is the middleware default (`DEFAULT_LANG = 'ar'`). */
export type Locale = 'ar' | 'en';

/** Display unit system — mirrors `shared/lib/localeMap.ts` (`UnitSystemLite`). */
export type UnitSystem = 'metric' | 'imperial';

/** Monetisation boundary of the tool. */
export type AccessTier = 'free' | 'premium';

/** Persistence lifecycle of a snapshot (mirrors `public.snapshot_type_enum`). */
export type SnapshotType = 'draft' | 'submitted_snapshot' | 'dashboard_projection';

/** Where a biometric value physically came from. */
export type DataSource = 'manual' | 'healthkit' | 'health_connect' | 'fhir' | 'device' | 'import';

/** Coarse quality bucket derived from `DataProvenance.confidence`. */
export type DataQuality = 'high' | 'medium' | 'low';

/** Clinical urgency of a surfaced finding. */
export type FindingSeverity = 'info' | 'monitor' | 'important';

/**
 * Frozen literal tuples (not plain arrays) so `z.enum(SNAPSHOT_TYPES)` in the
 * Layer-2 schemas keeps the exact union type instead of widening to `string`.
 */
export const LOCALES = ['ar', 'en'] as const;
export const UNIT_SYSTEMS = ['metric', 'imperial'] as const;
export const ACCESS_TIERS = ['free', 'premium'] as const;
export const SNAPSHOT_TYPES = ['draft', 'submitted_snapshot', 'dashboard_projection'] as const;
export const DATA_SOURCES = ['manual', 'healthkit', 'health_connect', 'fhir', 'device', 'import'] as const;
export const DATA_QUALITIES = ['high', 'medium', 'low'] as const;
export const FINDING_SEVERITIES = ['info', 'monitor', 'important'] as const;

/** Default render locale for a first (unauthenticated) paint. */
export const DEFAULT_LOCALE: Locale = 'ar';
/** Default display unit system. */
export const DEFAULT_UNIT_SYSTEM: UnitSystem = 'metric';

/**
 * Hard cap on a persisted tool-log payload: **262144 bytes (256 KiB)**.
 *
 * Single source of truth for the adapter (`MAX_COMMIT_BYTES`), the Layer-2
 * schema and the API route. Measured in BYTES, never in JS string length:
 * Arabic text is 2 bytes per character in UTF-8, so a character count silently
 * under-reports the real payload by up to 2× (and the route would answer 413).
 */
export const MAX_TOOL_LOG_BYTES = 262_144;

/**
 * Exact UTF-8 byte length of a string.
 * Falls back to `encodeURIComponent` accounting only if `TextEncoder` is absent
 * from the runtime (never the case on Node 18+/modern browsers, but this module
 * must stay portable and side-effect free).
 */
export function byteLength(value: string): number {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(value).length;
    let bytes = 0;
    for (const char of value) {
        const code = char.codePointAt(0) ?? 0;
        if (code < 0x80) bytes += 1;
        else if (code < 0x800) bytes += 2;
        else if (code < 0x10000) bytes += 3;
        else bytes += 4;
    }
    return bytes;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data provenance & quality
// ─────────────────────────────────────────────────────────────────────────────

export interface ReferenceRange {
    low?: number;
    high?: number;
    unit: string;
    source?: string;
}

/**
 * Lineage envelope attached to EVERY number the platform persists or renders.
 * A value without provenance is not admissible on the Bio-Dashboard.
 */
export interface DataProvenance {
    source: DataSource;
    /** ISO-8601 instant the measurement applies to. */
    recordedAt: string;
    timezone: string;
    /** Canonical (normalised) unit, e.g. `kg`, `cm`, `%`, `nmol/L`. */
    unit: string;
    /** Unit exactly as captured from the user/device, before normalisation. */
    originalUnit?: string;
    measurementMethod?: string;
    deviceId?: string;
    /** 0.0 … 1.0 — drives `dataQuality`. */
    confidence: number;
    dataQuality: DataQuality;
    referenceRange?: ReferenceRange;
}

/** Confidence → bucket thresholds. Single source of truth, quoted in tests. */
export const CONFIDENCE_HIGH_THRESHOLD = 0.9;
export const CONFIDENCE_MEDIUM_THRESHOLD = 0.7;

/** Maps a 0.0 … 1.0 confidence onto the persisted quality bucket. */
export function deriveDataQuality(confidence: number): DataQuality {
    const safe = Number.isFinite(confidence) ? Math.min(Math.max(confidence, 0), 1) : 0;
    if (safe >= CONFIDENCE_HIGH_THRESHOLD) return 'high';
    if (safe >= CONFIDENCE_MEDIUM_THRESHOLD) return 'medium';
    return 'low';
}

/** One surfaceable insight produced by a tool engine. */
export interface KeyFinding {
    /** Stable, machine-readable code, e.g. `HCT_LOW`, `PCT_WAIT_TOO_SHORT`. */
    code: string;
    labelAr: string;
    labelEn: string;
    value: string | number;
    severity: FindingSeverity;
}

/** Severity ordering used to sort findings before rendering (important first). */
export const SEVERITY_RANK: Record<FindingSeverity, number> = {
    important: 0,
    monitor: 1,
    info: 2,
};

/** Stable sort: important → monitor → info, preserving engine order within a tier. */
export function rankKeyFindings(findings: readonly KeyFinding[]): KeyFinding[] {
    return [...findings].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

/** Highest severity present, or `null` for an empty list (dashboard badge logic). */
export function highestSeverity(findings: readonly KeyFinding[]): FindingSeverity | null {
    if (findings.length === 0) return null;
    return rankKeyFindings(findings)[0].severity;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO interlinking (mandatory prev/next link-graph)
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolLink {
    titleAr: string;
    titleEn: string;
    slug: string;
}

export interface SeoLinks {
    prevTool: ToolLink;
    nextTool: ToolLink;
}

// ─────────────────────────────────────────────────────────────────────────────
// The one output contract every tool returns
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fixed envelope + tool-specific payload.
 *
 * NOTE: the generic parameter needs a default. The v5.0 draft used
 * `ToolOutput<T unknown>`, which is not valid TypeScript — it is declared here
 * as `ToolOutput<T = unknown>` so `ToolOutput<MyPayload>` and bare
 * `ToolOutput` both compile.
 */
export interface ToolOutput<T = unknown> {
    toolId: string;
    toolSlug: string;
    /** ISO-8601 instant of calculation — injected, never read from the clock here. */
    calculatedAt: string;
    locale: Locale;
    unitSystem: UnitSystem;
    accessTier: AccessTier;
    snapshotType: SnapshotType;
    result: T;
    provenance: DataProvenance;
    keyFindings: KeyFinding[];
    seoLinks: SeoLinks;
}

export interface ToolOutputParams<T> {
    toolId: string;
    toolSlug: string;
    calculatedAt: string;
    locale: Locale;
    unitSystem: UnitSystem;
    accessTier: AccessTier;
    snapshotType: SnapshotType;
    result: T;
    provenance: DataProvenance;
    keyFindings: KeyFinding[];
    seoLinks: SeoLinks;
}

/** Kebab-case slug guard — matches every route folder already in `app/`. */
export const TOOL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ToolContractError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ToolContractError';
    }
}

const assertOneOf = <T extends string>(value: T, allowed: readonly T[], field: string): void => {
    if (!allowed.includes(value)) {
        throw new ToolContractError(`${field} must be one of ${allowed.join(' | ')} (received "${String(value)}")`);
    }
};

const assertIsoTimestamp = (value: string, field: string): void => {
    if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
        throw new ToolContractError(`${field} must be an ISO-8601 timestamp string`);
    }
};

const assertToolLink = (link: ToolLink, field: string): void => {
    if (!link || !TOOL_SLUG_PATTERN.test(String(link.slug))) {
        throw new ToolContractError(`${field}.slug must be a kebab-case tool slug`);
    }
    if (!link.titleAr || !link.titleEn) {
        throw new ToolContractError(`${field} requires both titleAr and titleEn`);
    }
};

/**
 * Fail-fast factory for a contract-valid `ToolOutput`.
 * Throws `ToolContractError` on any structural violation, so an invalid payload
 * can never reach Supabase, the Bio-Dashboard or the AI context builder.
 */
export function createToolOutput<T>(params: ToolOutputParams<T>): ToolOutput<T> {
    const {
        toolId, toolSlug, calculatedAt, locale, unitSystem,
        accessTier, snapshotType, result, provenance, keyFindings, seoLinks,
    } = params;

    if (typeof toolId !== 'string' || toolId.trim().length === 0) {
        throw new ToolContractError('toolId is required');
    }
    if (typeof toolSlug !== 'string' || !TOOL_SLUG_PATTERN.test(toolSlug)) {
        throw new ToolContractError(`toolSlug "${String(toolSlug)}" must be kebab-case`);
    }
    assertIsoTimestamp(calculatedAt, 'calculatedAt');
    assertOneOf(locale, LOCALES, 'locale');
    assertOneOf(unitSystem, UNIT_SYSTEMS, 'unitSystem');
    assertOneOf(accessTier, ACCESS_TIERS, 'accessTier');
    assertOneOf(snapshotType, SNAPSHOT_TYPES, 'snapshotType');
    if (result === undefined) {
        throw new ToolContractError('result is required (use an explicit payload, never undefined)');
    }
    if (!provenance || typeof provenance !== 'object') {
        throw new ToolContractError('provenance is required');
    }
    assertOneOf(provenance.source, DATA_SOURCES, 'provenance.source');
    assertOneOf(provenance.dataQuality, DATA_QUALITIES, 'provenance.dataQuality');
    assertIsoTimestamp(provenance.recordedAt, 'provenance.recordedAt');
    if (!provenance.unit) {
        throw new ToolContractError('provenance.unit is required');
    }
    if (!Array.isArray(keyFindings)) {
        throw new ToolContractError('keyFindings must be an array');
    }
    keyFindings.forEach((f, i) => {
        if (!f || typeof f.code !== 'string' || f.code.length === 0) {
            throw new ToolContractError(`keyFindings[${i}].code is required`);
        }
        if (!f.labelAr || !f.labelEn) {
            throw new ToolContractError(`keyFindings[${i}] requires both labelAr and labelEn`);
        }
        assertOneOf(f.severity, FINDING_SEVERITIES, `keyFindings[${i}].severity`);
    });
    if (!seoLinks) {
        throw new ToolContractError('seoLinks is required (prev/next interlinking is mandatory)');
    }
    assertToolLink(seoLinks.prevTool, 'seoLinks.prevTool');
    assertToolLink(seoLinks.nextTool, 'seoLinks.nextTool');

    return {
        toolId,
        toolSlug,
        calculatedAt,
        locale,
        unitSystem,
        accessTier,
        snapshotType,
        result,
        provenance,
        keyFindings: rankKeyFindings(keyFindings),
        seoLinks,
    };
}

/** Structural guard for payloads arriving back from the database or an import. */
export function isToolOutput(value: unknown): value is ToolOutput {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<ToolOutput>;
    return (
        typeof candidate.toolId === 'string' &&
        typeof candidate.toolSlug === 'string' &&
        typeof candidate.calculatedAt === 'string' &&
        LOCALES.includes(candidate.locale as Locale) &&
        UNIT_SYSTEMS.includes(candidate.unitSystem as UnitSystem) &&
        ACCESS_TIERS.includes(candidate.accessTier as AccessTier) &&
        SNAPSHOT_TYPES.includes(candidate.snapshotType as SnapshotType) &&
        typeof candidate.provenance === 'object' &&
        candidate.provenance !== null &&
        Array.isArray(candidate.keyFindings) &&
        typeof candidate.seoLinks === 'object' &&
        candidate.seoLinks !== null
    );
}

/** Provenance → single-line audit string (admin tables & AI context headers). */
export function formatProvenance(provenance: DataProvenance): string {
    const method = provenance.measurementMethod ? ` via ${provenance.measurementMethod}` : '';
    const device = provenance.deviceId ? ` @${provenance.deviceId}` : '';
    const original = provenance.originalUnit && provenance.originalUnit !== provenance.unit
        ? ` (from ${provenance.originalUnit})`
        : '';
    return `${provenance.source}${method}${device} · ${provenance.recordedAt} · ${provenance.unit}${original} · ${provenance.dataQuality}(${provenance.confidence.toFixed(2)})`;
}
