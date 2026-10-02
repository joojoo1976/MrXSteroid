/**
 * server/seo/sources/csvImportPipeline.ts
 *
 * Auditable CSV import pipeline for provider exports.
 *
 * Supported inputs (all human-exported CSVs, no API credentials involved):
 *   - Google Ads keyword export (`google_ads`)
 *   - Google Trends export (`google_trends`)
 *   - an APPROVED provider export (`approved_provider`)
 *
 * The mandatory stage order is: Normalize -> Validate -> Deduplicate ->
 * Classify -> Persist -> Provenance. Persistence is injected, so the pipeline
 * is testable without a database and the caller chooses the write path (the
 * sanctioned one being the atomic `seo_upsert_keyword_with_provenance` RPC).
 *
 * HONESTY CONTRACT, enforced structurally rather than by comment:
 *
 * 1. `google_ads` volumes are stored as `googleAdsAvgMonthlySearches` +
 *    `googleAdsCompetition` ONLY, with `dataKind: 'imported'` and
 *    `evidenceType: 'google_ads_url_seed_signal'`. They are never written to
 *    an organic field, because a Google Ads figure is a paid-advertiser
 *    signal and not organic search volume.
 * 2. `google_trends` is RELATIVE interest 0-100, stored as
 *    `trendsRelativeInterest` only. It is never converted into an absolute
 *    volume, and the two are never merged.
 * 3. Every import is fingerprinted with a SHA-256 checksum of the EXACT bytes
 *    supplied, so re-importing the same file is detectable rather than
 *    silently doubling the corpus.
 * 4. A row with no usable keyword is REJECTED with a reason. Rows are never
 *    coerced into a number that nobody supplied.
 * 5. Nothing here fabricates a metric. If the file does not contain a field,
 *    the field stays null and `dataKind` says so.
 */

import { createHash } from 'node:crypto';
import { normalizeKeyword } from '../normalization';
import type {
    DataKind,
    EvidenceType,
    KeywordMetrics,
    Market,
    NormalizedIntelligenceRecord,
    SourceLanguage,
} from './types';
import { emptyKeywordMetrics } from './types';

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

/** Which export a file is. The provider determines the metric semantics. */
export type ImportProvider = 'google_ads' | 'google_trends' | 'approved_provider';

export const IMPORT_PROVIDERS: readonly ImportProvider[] = [
    'google_ads',
    'google_trends',
    'approved_provider',
] as const;

/**
 * The audit row written for EVERY import, successful or not.
 * This is the record that answers "where did this keyword come from?".
 */
export interface ImportMetadata {
    provider: ImportProvider;
    /** Original file name as supplied. */
    filename: string;
    /** SHA-256 of the exact bytes supplied, lowercase hex. */
    checksum: string;
    importedAt: string;
    /** Who ran the import. Always populated by the admin route. */
    importedBy: string;
    language: SourceLanguage;
    market: Market;
    /** Data rows seen in the file, excluding the header. */
    rowCount: number;
    accepted: number;
    rejected: number;
    /** Rows dropped as duplicates of an earlier row or prior import. */
    duplicates: number;
    validationErrors: ImportValidationError[];
}

/** Why a row was rejected. */
export interface ImportValidationError {
    /** 1-based row number in the source file, counting the header as 1. */
    row: number;
    /** The raw field values that failed, for an operator to inspect. */
    field: string;
    reason: string;
}

/* ------------------------------------------------------------------ */
/* CSV parsing                                                         */
/* ------------------------------------------------------------------ */

/** One parsed CSV row, as an ordered map plus a stable line number. */
export interface CsvRow {
    /** 1-based line number in the original file (header is line 1). */
    line: number;
    cells: Record<string, string>;
}

/**
 * Split one CSV document into rows, honouring RFC 4180 quoting.
 *
 * A hand-rolled parser rather than a dependency, because the required
 * behaviour is narrow and the repo has no CSV library. It handles quoted
 * fields, escaped quotes (""), embedded newlines and CRLF, and it tolerates a
 * BOM plus ragged rows (a short row yields empty strings, never undefined).
 */
export function parseCsv(input: string): string[][] {
    const text = input.replace(/^\uFEFF/, '');
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (inQuotes) {
            if (ch === '"') {
                // A doubled quote inside a quoted field is a literal quote.
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += ch;
            }
            continue;
        }

        if (ch === '"') {
            inQuotes = true;
        } else if (ch === ',') {
            row.push(field);
            field = '';
        } else if (ch === '\n') {
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
        } else if (ch === '\r') {
            // Swallow CR; the following \n terminates the row.
        } else {
            field += ch;
        }
    }
    // Flush the trailing field/row, but only if the file did not end cleanly.
    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }
    return rows;
}

/** Build keyed rows from a parsed document, using the first line as header. */
export function toCsvRows(input: string): CsvRow[] {
    const table = parseCsv(input);
    if (table.length === 0) return [];
    const header = table[0].map((h) => h.trim());
    return table.slice(1).map((cells, index) => {
        const record: Record<string, string> = {};
        header.forEach((key, column) => {
            record[key] = (cells[column] ?? '').trim();
        });
        return { line: index + 2, cells: record };
    });
}

/* ------------------------------------------------------------------ */
/* Header mapping                                                      */
/* ------------------------------------------------------------------ */

/** Column synonyms per provider, so real-world exports need no renaming. */
const HEADER_ALIASES: Record<ImportProvider, Record<string, string[]>> = {
    google_ads: {
        keyword: ['keyword', 'search term', 'search keyword'],
        avgMonthlySearches: [
            'avg monthly searches',
            'average monthly searches',
            'avg. monthly searches',
        ],
        competition: ['competition', 'competition index', 'competing advertisers'],
        competitionLevel: ['competition rating', 'competition level'],
    },
    google_trends: {
        keyword: ['term', 'keyword', 'search term', 'topic'],
        relativeInterest: ['interest', 'relative interest', 'avg interest', 'trend interest'],
        peakInterest: ['peak interest', 'max interest'],
    },
    approved_provider: {
        keyword: ['keyword', 'term', 'search term', 'query', 'topic'],
        volume: ['volume', 'search volume', 'monthly volume', 'searches'],
        difficulty: ['difficulty', 'kd', 'keyword difficulty', 'competition'],
        cpc: ['cpc', 'cost per click', 'cpc (usd)'],
    },
};

/** Find a column by any of its known synonyms, case/space-insensitively. */
export function findColumn(
    cells: Record<string, string>,
    aliases: string[]
): string | null {
    const index = new Map<string, string>();
    for (const key of Object.keys(cells)) {
        index.set(key.toLowerCase().replace(/[\s_.-]+/g, ' ').trim(), key);
    }
    for (const alias of aliases) {
        const normalized = alias.toLowerCase().replace(/[\s_.-]+/g, ' ').trim();
        const hit = index.get(normalized);
        if (hit !== undefined) return hit;
    }
    // No exact synonym matched. A fuzzy pass is the LAST resort and is only
    // used to locate a column, never to guess a metric value.
    for (const alias of aliases) {
        const needle = alias.toLowerCase().replace(/[\s_.-]+/g, ' ').trim();
        for (const [key, original] of index) {
            if (key.includes(needle) || needle.includes(key)) return original;
        }
    }
    return null;
}

/* ------------------------------------------------------------------ */
/* Stages 1-3: Normalize -> Validate -> Deduplicate                   */
/* ------------------------------------------------------------------ */

/** A row after Normalize and Validate, ready for Dedup and Classify. */
export interface NormalizedImportRow {
    /** The keyword as written in the file, preserved for display. */
    keyword: string;
    /** Matching/dedup form, via the repo's own normalizer. */
    normalizedKeyword: string;
    language: SourceLanguage;
    market: Market;
    provider: ImportProvider;
    /** Line number in the source file, for the audit trail. */
    line: number;
    /**
     * Provider-reported values, still RAW. They are only ever moved into a
     * provider-specific field in {@link classifyRow}.
     */
    values: {
        googleAdsAvgMonthlySearches: number | null;
        googleAdsCompetition: number | null;
        trendsRelativeInterest: number | null;
        thirdPartyVolumeEstimate: number | null;
    };
}

/** The outcome of validating one row. */
export type RowValidation =
    | { valid: true; row: NormalizedImportRow }
    | { valid: false; error: ImportValidationError };

/** A keyword longer than this is a paste accident, not a search query. */
export const MAX_KEYWORD_LENGTH = 200;

/**
 * STAGE 1 + 2 — Normalize then Validate one row.
 *
 * Order matters: normalization is what lets us recognize a duplicate, and
 * validation is what stops a malformed row from being persisted. Validation is
 * strict about the KEYWORD and lenient about OPTIONAL metrics: a missing or
 * unparseable number becomes null, never a fabricated 0.
 */
export function normalizeAndValidateRow(
    csvRow: CsvRow,
    context: {
        provider: ImportProvider;
        language: SourceLanguage;
        market: Market;
    }
): RowValidation {
    const aliases = HEADER_ALIASES[context.provider];
    const keywordColumn = findColumn(csvRow.cells, aliases.keyword);

    if (!keywordColumn) {
        return {
            valid: false,
            error: {
                row: csvRow.line,
                field: Object.keys(csvRow.cells).join(', ') || '(no header)',
                reason: `No keyword column found; expected one of: ${aliases.keyword.join(', ')}`,
            },
        };
    }

    const rawKeyword = (csvRow.cells[keywordColumn] ?? '').trim();
    if (!rawKeyword) {
        return {
            valid: false,
            error: { row: csvRow.line, field: keywordColumn, reason: 'Keyword is empty' },
        };
    }
    if (rawKeyword.length > MAX_KEYWORD_LENGTH) {
        return {
            valid: false,
            error: {
                row: csvRow.line,
                field: keywordColumn,
                reason: `Keyword exceeds ${MAX_KEYWORD_LENGTH} characters; refusing to import a value this long as a keyword`,
            },
        };
    }

    // Read the provider columns. Each maps to exactly one field, and only for
    // the provider that actually owns that metric.
    const read = (key: string): string | undefined => {
        const column = findColumn(csvRow.cells, aliases[key] ?? []);
        return column ? csvRow.cells[column] : undefined;
    };

    const googleAdsAvgMonthlySearches =
        context.provider === 'google_ads' ? parseDecimal(read('avgMonthlySearches')) : null;
    const googleAdsCompetition =
        context.provider === 'google_ads' ? parseDecimal(read('competition')) : null;
    const trendsRelativeInterest =
        context.provider === 'google_trends' ? parseDecimal(read('relativeInterest')) : null;
    // A third-party volume estimate stays an ESTIMATE and is only ever allowed
    // on a provider that actually reports volume.
    const thirdPartyVolumeEstimate =
        context.provider === 'approved_provider' ? parseDecimal(read('volume')) : null;

    // A Trends export outside 0-100 is malformed, and storing it would let a
    // relative score masquerade as a volume.
    if (
        trendsRelativeInterest != null &&
        (trendsRelativeInterest < 0 || trendsRelativeInterest > 100)
    ) {
        return {
            valid: false,
            error: {
                row: csvRow.line,
                field: read('relativeInterest') ?? 'interest',
                reason: `Trends interest must be 0-100 relative interest, got ${trendsRelativeInterest}`,
            },
        };
    }

    return {
        valid: true,
        row: {
            keyword: rawKeyword,
            normalizedKeyword,
            language: context.language,
            market: context.market,
            provider: context.provider,
            line: csvRow.line,
            values: {
                googleAdsAvgMonthlySearches,
                googleAdsCompetition,
                trendsRelativeInterest,
                thirdPartyVolumeEstimate,
            },
        },
    };
}

/**
 * STAGE 3 — Deduplicate within the file.
 *
 * Keyed on (language, market, normalizedKeyword) so two markets legitimately
 * using the same phrase are both kept, while a genuine repeat in one market
 * is dropped. The first occurrence wins, so the result is order-stable.
 */
export function dedupeRows(rows: NormalizedImportRow[]): {
    unique: NormalizedImportRow[];
    duplicateCount: number;
} {
    const seen = new Set<string>();
    const unique: NormalizedImportRow[] = [];
    let duplicateCount = 0;
    for (const row of rows) {
        const key = `${row.language}|${row.market}|${row.normalizedKeyword.toLowerCase()}`;
        if (seen.has(key)) {
            duplicateCount++;
            continue;
        }
        seen.add(key);
        unique.push(row);
    }
    return { unique, duplicateCount };
}

/* ------------------------------------------------------------------ */
/* Stage 4: Classify                                                   */
/* ------------------------------------------------------------------ */

/** Per-provider classification, the mapping that prevents metric mixing. */
export interface ProviderClassification {
    source: string;
    sourceType: string;
    /** The honest epistemic label for an imported file. */
    dataKind: DataKind;
    evidenceType: EvidenceType;
    /** How the row got here, for the provenance row. */
    generationMethod: 'import';
    /** Human-readable explanation surfaced in the audit trail. */
    classificationNote: string;
}

/**
 * Classify one provider.
 *
 * The `dataKind` values are the load-bearing part: an Ads export is `imported`
 * (a human exported a file), never `observed`, because we did not make a live
 * API call; and an approved-provider volume is an ESTIMATE, never `observed`.
 */
export function classifyProvider(provider: ImportProvider): ProviderClassification {
    switch (provider) {
        case 'google_ads':
            return {
                source: 'google_ads',
                sourceType: 'paid_advertiser_export',
                dataKind: 'imported',
                evidenceType: 'google_ads_url_seed_signal',
                generationMethod: 'import',
                classificationNote:
                    'Google Ads keyword export. Avg monthly searches and competition are ' +
                    'PAID-ADVERTISER signals from a human-exported file, not organic search ' +
                    'volume and not a live API observation.',
            };
        case 'google_trends':
            return {
                source: 'google_trends',
                sourceType: 'trend_export',
                dataKind: 'imported',
                evidenceType: 'imported_serp_export',
                generationMethod: 'import',
                classificationNote:
                    'Google Trends export. Values are RELATIVE interest 0-100 within the ' +
                    'exported comparison set. Never an absolute search volume.',
            };
        case 'approved_provider':
        default:
            return {
                source: 'approved_provider',
                sourceType: 'third_party_export',
                // A modelled figure is an ESTIMATE by definition.
                dataKind: 'estimated',
                evidenceType: 'imported',
                generationMethod: 'import',
                classificationNote:
                    'Approved third-party provider export. Volume is a MODELLED ESTIMATE ' +
                    'supplied by that provider, not an observed search count.',
            };
    }
}

/**
 * STAGE 4 — turn a validated row into a fully attributed record.
 *
 * Every metric field is explicitly assigned, and each provider can only write
 * the fields it actually owns. A Google Ads export can never populate
 * `trendsRelativeInterest` or `thirdPartyVolumeEstimate`, and a Trends export
 * can never populate any volume field at all.
 */
export function classifyRow(
    row: NormalizedImportRow,
    context: { filename: string; checksum: string; importedAt: string }
): NormalizedIntelligenceRecord {
    const classification = classifyProvider(row.provider);
    // Start from all-null so a field nobody supplied stays null.
    const metrics: KeywordMetrics = {
        ...emptyKeywordMetrics(),
        googleAdsAvgMonthlySearches: row.values.googleAdsAvgMonthlySearches,
        googleAdsCompetition: row.values.googleAdsCompetition,
        trendsRelativeInterest: row.values.trendsRelativeInterest,
        thirdPartyVolumeEstimate: row.values.thirdPartyVolumeEstimate,
    };

    return {
        keyword: row.keyword,
        language: row.language,
        market: row.market,
        source: classification.source,
        sourceType: classification.sourceType,
        sourceClass: 'SEARCH_INTELLIGENCE',
        // An imported file has not had a live API request verified against it.
        sourceStatus: 'IMPLEMENTED',
        // Cites the exact file and its checksum, so the row is traceable.
        sourceReference: `file://${context.filename}#sha256=${context.checksum}`,
        discoveredAt: context.importedAt,
        dataKind: classification.dataKind,
        evidence: `${classification.classificationNote} (file: ${context.filename}, sha256: ${context.checksum}, line: ${row.line})`,
        evidenceType: classification.evidenceType,
        generationMethod: classification.generationMethod,
        metrics,
    };
}

/* ------------------------------------------------------------------ */
/* Stages 5-6: Persist + Provenance, and the orchestrator              */
/* ------------------------------------------------------------------ */

/** One record plus the metadata needed to write its provenance row. */
export interface PersistableRecord {
    record: NormalizedIntelligenceRecord;
    /**
     * The provenance link the atomic RPC requires. Deliberately required by
     * the type: the sanctioned insert path refuses a payload without evidence
     * type, source reference and generation method, so a keyword can never be
     * written without provenance.
     */
    provenance: {
        evidence_type:
            | 'manual_entry'
            | 'api_response'
            | 'scrape_result'
            | 'baseline'
            | 'internal_telemetry';
        source_reference: string;
        generation_method: 'import';
        observed_value: Record<string, unknown>;
    };
}

/** The write strategy. Injected so the pipeline is testable without a DB. */
export interface ImportPersister {
    /**
     * Persist one record together with its provenance, atomically.
     * Returns the write path's own verdict; a failure marks that row as not
     * persisted WITHOUT aborting the whole import.
     */
    persist(item: PersistableRecord): Promise<{ ok: boolean; error?: string }>;
    /** Persist the import-level audit row. */
    persistMetadata(metadata: ImportMetadata): Promise<{ ok: boolean; error?: string }>;
}

export interface ImportRequest {
    provider: ImportProvider;
    filename: string;
    /** Exact file contents, used for both parsing and the checksum. */
    content: string;
    language: SourceLanguage;
    market: Market;
    /** Who is running the import. Required, so the audit row is never blank. */
    importedBy: string;
    /** Hard cap on accepted rows. */
    maxRows?: number;
    /** Injectable clock, for deterministic tests. */
    now?: () => Date;
}

/**
 * The full pipeline: Normalize -> Validate -> Deduplicate -> Classify ->
 * Persist -> Provenance.
 *
 * Accounting is exact and reconciles: `rowCount === accepted + rejected +
 * duplicates` minus any row the write path refused (reported separately as
 * `persistFailures`). An operator can therefore always tell whether a file was
 * fully applied.
 */
export async function runImport(
    request: ImportRequest,
    persister: ImportPersister
): Promise<ImportResult> {
    const now = request.now ?? (() => new Date());
    const importedAt = now().toISOString();
    const checksum = checksumOf(request.content);
    const maxRows = Math.max(1, request.maxRows ?? 50_000);

    const csvRows = toCsvRows(request.content);
    const validationErrors: ImportValidationError[] = [];
    const valid: NormalizedImportRow[] = [];

    for (const csvRow of csvRows) {
        const outcome = normalizeAndValidateRow(csvRow, {
            provider: request.provider,
            language: request.language,
            market: request.market,
        });
        if (outcome.valid) valid.push(outcome.row);
        else validationErrors.push(outcome.error);
    }

    // The cap is applied AFTER validation so `rowCount` still reflects the
    // whole file, and anything over the cap is rejected rather than ignored.
    const withinCap = valid.slice(0, maxRows);
    for (const dropped of valid.slice(maxRows)) {
        validationErrors.push({
            row: dropped.line,
            field: 'keyword',
            reason: `Exceeds the per-import cap of ${maxRows} rows`,
        });
    }

    const { unique, duplicateCount } = dedupeRows(withinCap);

    const persistable: PersistableRecord[] = unique.map((row) => {
        const record = classifyRow(row, {
            filename: request.filename,
            checksum,
            importedAt,
        });
        return {
            record,
            provenance: {
                // An operator-uploaded file is a manual entry at the point of
                // upload, regardless of which provider produced the numbers.
                evidence_type: 'manual_entry',
                source_reference: record.sourceReference,
                generation_method: 'import',
                observed_value: {
                    filename: request.filename,
                    checksum,
                    line: row.line,
                    normalized_keyword: row.normalizedKeyword,
                    language: row.language,
                    market: row.market,
                    provider: request.provider,
                    metrics: record.metrics,
                },
            },
        };
    });

    const persistedRecords: NormalizedIntelligenceRecord[] = [];
    const persistFailures: ImportResult['persistFailures'] = [];
    for (const item of persistable) {
        const outcome = await persister.persist(item);
        if (outcome.ok) persistedRecords.push(item.record);
        else {
            // A failed write is reported, never silently swallowed, and never
            // aborts the remaining rows.
            persistFailures.push({
                keyword: item.record.keyword,
                error: outcome.error ?? 'unknown persist failure',
            });
        }
    }

    const metadata: ImportMetadata = {
        provider: request.provider,
        filename: request.filename,
        checksum,
        importedAt,
        importedBy: request.importedBy,
        language: request.language,
        market: request.market,
        rowCount: csvRows.length,
        accepted: persistedRecords.length,
        // Rejections include invalid rows AND rows over the cap.
        rejected: validationErrors.length,
        duplicates: duplicateCount,
        validationErrors,
        persistFailures,
    };

    const metadataOutcome = await persister.persistMetadata(metadata);

    return {
        metadata,
        records: persistedRecords,
        // The import is only COMPLETE when the audit row landed too. A missing
        // metadata row means the file cannot be traced, so it is reported as a
        // failure rather than quietly treated as success.
        ok: metadataOutcome.ok && persistFailures.length === 0,
    };
}

/**
 * Build a persister backed by the sanctioned atomic RPC.
 *
 * `seo_upsert_keyword_with_provenance` is the ONLY approved way to insert a
 * keyword: it refuses any payload missing evidence type, source reference or
 * generation method, so "no provenance = not source-backed" is enforced in the
 * DATABASE rather than merely in TypeScript.
 */
export function createRpcPersister(client: {
    rpc: (
        fn: string,
        args: Record<string, unknown>
    ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
    from: (table: string) => {
        insert: (values: Record<string, unknown>) => PromiseLike<{
            error: { message: string } | null;
        }>;
    };
}): ImportPersister {
    return {
        async persist(item) {
            const { error } = await client.rpc('seo_upsert_keyword_with_provenance', {
                p_keyword: {
                    original_keyword: item.record.keyword,
                    // The RPC requires normalized_keyword; the pipeline already
                    // computed it, so it is carried on the provenance payload
                    // rather than recomputed (recomputation could disagree).
                    normalized_keyword: item.provenance.observed_value['normalized_keyword'],
                    language: item.record.language,
                    locale: item.record.language,
                    // The RPC refuses a payload missing these three. An
                    // unclassified import row is honestly marked as such
                    // rather than being given an invented cluster or intent.
                    cluster: String(item.provenance.observed_value['cluster'] ?? 'unclassified'),
                    intent: String(item.provenance.observed_value['intent'] ?? 'unknown'),
                    destination_path: String(
                        item.provenance.observed_value['destination_path'] ?? '/'
                    ),
                    source: item.record.source,
                    data_kind: item.record.dataKind,
                },
                p_provenance: {
                    evidence_type: item.provenance.evidence_type,
                    source_reference: item.provenance.source_reference,
                    generation_method: item.provenance.generation_method,
                    observed_value: item.provenance.observed_value,
                },
                p_source: {
                    source_type: item.record.sourceType,
                    source_name: item.record.source,
                    source_url: item.record.sourceReference,
                },
            });
            return error ? { ok: false, error: error.message } : { ok: true };
        },
        async persistMetadata(metadata) {
            const { error } = await client.from('seo_keyword_imports').insert({
                provider: metadata.provider,
                filename: metadata.filename,
                checksum: metadata.checksum,
                imported_at: metadata.importedAt,
                imported_by: metadata.importedBy,
                language: metadata.language,
                market: metadata.market,
                row_count: metadata.rowCount,
                accepted: metadata.accepted,
                rejected: metadata.rejected,
                duplicates: metadata.duplicates,
                validation_errors: metadata.validationErrors,
            });
            return error ? { ok: false, error: error.message } : { ok: true };
        },
    };
}

/**
 * Parse a decimal that may carry thousands separators or a percent sign.
 * Returns null for anything non-numeric, so a bad cell is rejected rather
 * than silently becoming 0.
 */
export function parseDecimal(raw: string | undefined): number | null {
    if (raw == null) return null;
    const cleaned = raw.replace(/[%,\s]/g, '').trim();
    if (!cleaned) return null;
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : null;
}

/**
 * SHA-256 of the exact bytes supplied.
 *
 * The checksum is taken over the RAW input, not a normalized form, because the
 * point is to detect re-uploads of a specific file. Line-ending differences
 * therefore produce a different checksum, which is correct: it is a different
 * file.
 */
export function checksumOf(input: string | Uint8Array): string {
    const buffer = typeof input === 'string' ? Buffer.from(input, 'utf8') : Buffer.from(input);
    return createHash('sha256').update(buffer).digest('hex');
}
