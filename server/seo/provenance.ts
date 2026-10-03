/**
 * server/seo/provenance.ts
 *
 * SEO keyword PROVENANCE write path.
 *
 * Root cause this file closes (Gap Audit 2026-09-28, "Provenance"):
 * `public.seo_keyword_source_links` was created by
 * `20260918170000_seo_intelligence_v3_backbone.sql` but had ZERO write sites,
 * so every keyword in `seo_keywords` was treated as source-backed by assertion.
 *
 * Hard rule enforced here and in SQL:
 *      NO PROVENANCE = NOT SOURCE-BACKED.
 * A keyword may only be described as source-backed / verified when a
 * `seo_keyword_source_links` row exists for it. Keywords without a link are
 * classified `legacy` | `baseline` | `needs-migration` and are NEVER labelled
 * verified.
 *
 * Atomicity: both write helpers go through single Postgres functions
 * (`seo_upsert_keyword_with_provenance`, `seo_record_keyword_provenance`) so the
 * keyword row and its provenance row commit or roll back together.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** Evidence taxonomy mirrors `SourceEvidenceType` in sources/adapterContract.ts. */
export type ProvenanceEvidenceType =
    | 'api_response'
    | 'scrape_result'
    | 'manual_entry'
    | 'baseline'
    | 'internal_telemetry';

/** How the keyword/provenance row was generated. */
export type ProvenanceGenerationMethod =
    | 'scheduled'
    | 'manual'
    | 'api_poll'
    | 'telemetry'
    | 'baseline'
    | 'seed';

/**
 * Classification of a keyword that has NO provenance link.
 * - `legacy`          : pre-existing row written before provenance tracking.
 * - `baseline`        : curated internal baseline/editorial seed.
 * - `needs-migration` : written by an unknown path with no source at all.
 */
export type UnprovenancedKeywordClass = 'legacy' | 'baseline' | 'needs-migration';

/** Result shape returned by the RPCs. */
export interface ProvenanceWriteResult {
    keyword_id: string;
    source_id: string;
    keyword_inserted?: boolean;
    provenance_inserted?: boolean;
    source_backed: boolean;
}

/** Row shape the RPC writes into `public.seo_keyword_source_links`. */
export interface ProvenanceLinkInput {
    /** ISO timestamp. Defaults to now() in SQL. */
    discovered_at?: string;
    evidence_type: ProvenanceEvidenceType;
    /** External URL / API endpoint / internal identifier. REQUIRED. */
    source_reference: string;
    /** 0–100 confidence of the evidence itself. */
    confidence?: number;
    parent_keyword_id?: string | null;
    generation_method: ProvenanceGenerationMethod;
    observed_value?: Record<string, unknown>;
    source_metric?: string | null;
    source_rank?: number | null;
}

/** Registry row for `public.seo_keyword_sources`. */
export interface ProvenanceSourceInput {
    /** Existing source id. When omitted the row is resolved/created by name. */
    id?: string;
    /** Must satisfy the seo_keyword_sources.source_type CHECK. */
    source_type: string;
    source_name: string;
    source_url?: string | null;
    provider_account_ref?: string | null;
    country_code?: string | null;
    locale?: string | null;
    reliability_score?: number | null;
    terms_verified?: boolean;
    metadata?: Record<string, unknown>;
}

/** Only v1 seo_keywords columns (guaranteed by 20260911200000_create_seo_keyword_intelligence.sql). */
export interface ProvenanceKeywordInput {
    language: string;
    locale?: string;
    original_keyword: string;
    normalized_keyword: string;
    cluster: string;
    intent: string;
    destination_path: string;
    trend_status?: string;
    score?: number;
    score_components?: Record<string, unknown>;
    /** Must satisfy the seo_keywords.source CHECK. */
    source?: string;
    last_observed_at?: string;
    is_active?: boolean;
}

export interface PersistKeywordWithProvenanceResult {
    ok: boolean;
    result?: ProvenanceWriteResult;
    error?: string;
}

export interface RecordProvenanceResult {
    ok: boolean;
    result?: ProvenanceWriteResult;
    error?: string;
}
/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

export const PROVENANCE_RPC = {
    upsertKeyword: 'seo_upsert_keyword_with_provenance',
    record: 'seo_record_keyword_provenance',
} as const;

/**
 * The single EDITORIAL source used for curated in-repo seeds
 * (baselineKeywords.ts / seedKeywords.ts). It is a stable registry identity:
 * the resolver matches on (source_type, source_name) and reuses the row.
 */
export const EDITORIAL_SOURCE: ProvenanceSourceInput = {
    source_type: 'editorial',
    source_name: 'internal_editorial_seeds',
    source_url: null,
    reliability_score: 100,
    terms_verified: true,
    metadata: {
        adapter: 'internal_baseline_seeds',
        adapter_contract: 'server/seo/sources/adapterContract.ts',
        seeds: 'server/seo/baselineKeywords.ts',
    },
};

/** Baseline/editorial provenance descriptor for curated in-repo seeds. */
export const EDITORIAL_BASELINE_PROVENANCE: Omit<
    ProvenanceLinkInput,
    'discovered_at'
> = {
    evidence_type: 'baseline',
    source_reference: 'internal://baseline-keywords',
    confidence: 95,
    generation_method: 'baseline',
    observed_value: { origin: 'server/seo/baselineKeywords.ts' },
};

/* ------------------------------------------------------------------ */
/* Validation (fail closed — never invent metrics)                   */
/* ------------------------------------------------------------------ */

function isBlank(value: unknown): boolean {
    return value === undefined || value === null || String(value).trim() === '';
}

/**
 * Enforces the hard rule client-side too, so a malformed payload fails before
 * any network call rather than half-writing a keyword.
 */
export function assertProvenanceComplete(
    link: Partial<ProvenanceLinkInput> | null | undefined
): void {
    if (!link) {
        throw new Error('provenance: link payload is required (no provenance = not source-backed)');
    }
    if (isBlank(link.evidence_type)) {
        throw new Error('provenance: evidence_type is required (no provenance = not source-backed)');
    }
    if (isBlank(link.source_reference)) {
        throw new Error('provenance: source_reference is required (no provenance = not source-backed)');
    }
    if (isBlank(link.generation_method)) {
        throw new Error('provenance: generation_method is required (no provenance = not source-backed)');
    }
    if (link.confidence !== undefined && link.confidence !== null) {
        const c = Number(link.confidence);
        if (!Number.isFinite(c) || c < 0 || c > 100) {
            throw new Error(
                `provenance: confidence must be within 0-100, received ${String(link.confidence)}`
            );
        }
    }
}

/* ------------------------------------------------------------------ */
/* Classification helpers — "no provenance = not source-backed"       */
/* ------------------------------------------------------------------ */

/** Minimal keyword shape needed to classify a missing-provenance row. */
export interface ClassifiableKeyword {
    id?: string;
    /** seo_keywords.source — 'baseline' identifies curated seeds. */
    source?: string | null;
    created_at?: string | null;
    /** True when at least one seo_keyword_source_links row exists. */
    hasProvenanceLink?: boolean;
    /** Optional explicit override (e.g. a pre-provenance-era row). */
    isLegacy?: boolean;
}

/**
 * Classifies a keyword that has no provenance link.
 * Returns null ONLY when the keyword actually has a link — callers must then
 * treat it as source-backed.
 */
export function classifyUnprovenancedKeyword(
    keyword: ClassifiableKeyword
): UnprovenancedKeywordClass | null {
    if (keyword.hasProvenanceLink === true) return null;
    if (keyword.isLegacy === true) return 'legacy';
    if ((keyword.source ?? '').toLowerCase() === 'baseline') return 'baseline';
    // Anything else (e.g. 'internal_search', 'trend', 'admin') reached the
    // corpus without a recorded evidence row: it must be migrated, and it
    // must never be reported as source-backed.
    return 'needs-migration';
}

/** The safe, report-facing verdict. */
export interface ProvenanceVerdict {
    verified: boolean;
    source_backed: boolean;
    classification: 'source-backed' | UnprovenancedKeywordClass;
    reason: string;
}

export function describeKeywordProvenance(keyword: ClassifiableKeyword): ProvenanceVerdict {
    const classification = classifyUnprovenancedKeyword(keyword);
    if (classification === null) {
        return {
            verified: true,
            source_backed: true,
            classification: 'source-backed',
            reason: 'A seo_keyword_source_links row exists for this keyword.',
        };
    }
    return {
        // Explicitly NOT verified: no provenance row, no verification claim.
        verified: false,
        source_backed: false,
        classification,
        reason:
            `No seo_keyword_source_links row exists; classified as '${classification}'. ` +
            'Not source-backed, not verified.',
    };
}

/** Summary of a corpus where some keywords lack provenance links. */
export interface ProvenanceAuditSummary {
    total: number;
    sourceBacked: number;
    unverified: number;
    byClass: Record<UnprovenancedKeywordClass, number>;
}

export function summarizeProvenance(keywords: ClassifiableKeyword[]): ProvenanceAuditSummary {
    const byClass: Record<UnprovenancedKeywordClass, number> = {
        legacy: 0,
        baseline: 0,
        'needs-migration': 0,
    };
    let sourceBacked = 0;

    for (const k of keywords) {
        const cls = classifyUnprovenancedKeyword(k);
        if (cls === null) {
            sourceBacked += 1;
        } else {
            byClass[cls] += 1;
        }
    }

    return {
        total: keywords.length,
        sourceBacked,
        unverified: keywords.length - sourceBacked,
        byClass,
    };
}

/* ------------------------------------------------------------------ */
/* Write path (atomic: keyword + provenance in one RPC call)          */
/* ------------------------------------------------------------------ */

/** Strips undefined/null members so PostgREST gets a compact jsonb payload. */
function prune<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== null) out[k] = v;
    }
    return out as Partial<T>;
}

/**
 * Persists a keyword AND its provenance row atomically.
 *
 * Both rows are written by ONE Postgres function call
 * (`seo_upsert_keyword_with_provenance`), which is a single transaction: if the
 * provenance insert fails for any reason, the keyword upsert is rolled back,
 * so an "orphan source-backed keyword" cannot exist. Re-running is idempotent:
 * the keyword conflicts on (language, normalized_keyword) and the link
 * conflicts on the existing primary key (keyword_id, source_id), so no
 * duplicate rows are created.
 *
 * Never throws: the caller receives `{ ok, result | error }` and decides.
 */
export async function persistKeywordWithProvenance(
    client: SupabaseClient,
    keyword: ProvenanceKeywordInput,
    link: ProvenanceLinkInput,
    source: ProvenanceSourceInput = EDITORIAL_SOURCE
): Promise<PersistKeywordWithProvenanceResult> {
    try {
        assertProvenanceComplete(link);
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }

    if (!client) {
        return { ok: false, error: 'provenance: Supabase client unavailable' };
    }
    if (typeof client.rpc !== 'function') {
        return { ok: false, error: 'provenance: client.rpc unavailable' };
    }

    const { data, error } = await client.rpc(PROVENANCE_RPC.upsertKeyword, {
        p_keyword: prune(keyword as unknown as Record<string, unknown>),
        p_provenance: prune({
            ...link,
            discovered_at: link.discovered_at ?? new Date().toISOString(),
        } as unknown as Record<string, unknown>),
        p_source: prune(source as unknown as Record<string, unknown>),
    });

    if (error) {
        return { ok: false, error: error.message };
    }
    return { ok: true, result: data as ProvenanceWriteResult };
}

/**
 * Records an EDITORIAL provenance row for an ALREADY persisted keyword.
 * Used by the refresh path, where the keyword row already exists and only the
 * evidence link is missing. Idempotent via the (keyword_id, source_id) PK.
 */
export async function recordProvenance(
    client: SupabaseClient,
    keywordId: string,
    link: ProvenanceLinkInput,
    source: ProvenanceSourceInput = EDITORIAL_SOURCE
): Promise<RecordProvenanceResult> {
    try {
        assertProvenanceComplete(link);
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }

    if (!client) {
        return { ok: false, error: 'provenance: Supabase client unavailable' };
    }
    if (typeof client.rpc !== 'function') {
        // Degrade honestly: the keyword stays unprovenanced (never "verified")
        // and the caller records the failure instead of the run throwing.
        return { ok: false, error: 'provenance: client.rpc unavailable' };
    }
    if (!keywordId) {
        return { ok: false, error: 'provenance: keyword_id is required' };
    }

    const { data, error } = await client.rpc(PROVENANCE_RPC.record, {
        p_keyword_id: keywordId,
        p_provenance: prune({
            ...link,
            discovered_at: link.discovered_at ?? new Date().toISOString(),
        } as unknown as Record<string, unknown>),
        p_source: prune(source as unknown as Record<string, unknown>),
    });

    if (error) {
        return { ok: false, error: error.message };
    }
    return { ok: true, result: data as ProvenanceWriteResult };
}

/** Convenience: the exact provenance row baseline/editorial seeds receive. */
export function editorialBaselineProvenance(discoveredAt?: string): ProvenanceLinkInput {
    return {
        ...EDITORIAL_BASELINE_PROVENANCE,
        discovered_at: discoveredAt ?? new Date().toISOString(),
        generation_method: 'seed',
    };
}

/**
 * Reads which of the given keyword ids already have a provenance link.
 * Missing ids are classified (never assumed verified) by the caller.
 */
export async function loadProvenanceCoverage(
    client: SupabaseClient,
    keywordIds: string[]
): Promise<{ linked: Set<string>; error?: string }> {
    const linked = new Set<string>();
    if (!client || keywordIds.length === 0) return { linked };

    const { data, error } = await client
        .from('seo_keyword_source_links')
        .select('keyword_id')
        .in('keyword_id', keywordIds);

    if (error) return { linked, error: error.message };
    for (const row of (data ?? []) as Array<{ keyword_id: string }>) {
        if (row?.keyword_id) linked.add(row.keyword_id);
    }
    return { linked };
}
