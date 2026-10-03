/**
 * Common Crawl Public Web Discovery Adapter — Step 12 (Implementation Phase, Read-Only Design)
 * Source: Common Crawl public corpus index (no live API calls, no credentials).
 * Status: DESIGN (fixture-verified only); NOT PROVEN for live Common Crawl access.
 * Does NOT act as keyword discovery like GSC/Bing/Ads.
 * Carries provenance of public web page captures only.
 * Does NOT assert search volume, rankings, CTR, impressions, or demand metrics.
 * Produces candidate competitor evidence only — NOT verified_competitor.
 */

/**
 * Common Crawl Public Web Discovery Adapter
 *
 * Source: the Common Crawl public index (index.commoncrawl.org), which serves
 * CDXJ index records for the public web corpus. No credentials, no cost.
 *
 * SCOPE AND HONESTY (this is the important part):
 *   Common Crawl is SUPPLEMENTARY HISTORICAL EVIDENCE ONLY.
 *
 *   A Common Crawl index row tells us a URL was captured by Common Crawl's
 *   crawler, and when. It tells us NOTHING about search demand, ranking,
 *   click-through, share of voice, or how many people search for a term. It
 *   cannot replace live competitor crawling, GSC, Google Ads or Trends
 *   evidence, and no record produced here may be used to stand in for them.
 *
 *   Consequently every record this adapter emits has ALL-NULL metrics and
 *   `dataKind: 'unavailable'`. The adapter contributes URLs, capture times and
 *   content digests — provenance, not measurement.
 *
 *   The index is a PUBLIC, DOCUMENTED, no-auth endpoint. Requests to it are
 *   made only when a real `fetchImpl` is supplied: this adapter never fabricates
 *   a response, and it never reports VERIFIED without a real 2xx.
 */

import { createHash } from 'node:crypto';
import { SourceAdapterContract, SourceStatus } from './adapterContract';
import type {
    DataKind,
    EvidenceType,
    Market,
    NormalizedIntelligenceRecord,
    SourceLanguage,
} from './types';
import { emptyKeywordMetrics } from './types';

/** The public index. No key, no account, no rate-limit secret. */
export const COMMON_CRAWL_INDEX_ENDPOINT = 'https://index.commoncrawl.org';

/** The current collection list, used to resolve a collection id. */
export const COMMON_CRAWL_COLLINFO_ENDPOINT = `${COMMON_CRAWL_INDEX_ENDPOINT}/collinfo.json`;

/** The provider id used in every record this adapter emits. */
export const COMMON_CRAWL_SOURCE = 'common_crawl';

/**
 * Public-web observation vocabulary used by the Common Crawl adapter.
 * Declared locally so the legacy evidence/discovery unions are not widened
 * for every consumer, while still typing the adapter's own fields exactly.
 */
const PUBLIC_WEB_EVIDENCE = 'public_web_observed' as unknown as SourceAdapterContract['evidence'];
const CRAWL_INDEX_METHOD =
    'common_crawl_index' as unknown as SourceAdapterContract['discovery_method'];

/**
 * Common Crawl capture record schema — minimal fields from CDXJ/warc.
 */
export interface CommonCrawlCapture {
  crawlId: string;       // e.g., "20240501000000"
  capturedAt: string;    // ISO timestamp
  url: string;           // captured URL
  domain: string;        // extracted domain
  status: string;        // HTTP status code or "error"
  mime: string;          // e.g., "text/html", "application/pdf"
  detectedLanguage?: string;  // optional, from meta tags or headers
  digest?: string;       // sha1 or similar hash of content
  sourceReference?: string; // e.g., "id:20240501000000/20240501010000-id-00000-ip-10-0-0-1-2"
}

/**
 * Common Crawl adapter — read-only design.
 * No external API, no credentials, no live requests.
 * Fixture-verified only; live Common Crawl access NOT PROVEN.
 */
export const commonCrawlAdapter: SourceAdapterContract = {
  source: 'common_crawl',
  source_type: 'public_web_corpus',
  source_reference: 'https://index.commoncrawl.org/',
  language: 'en', // adapter supports both; specific captures specify individually
  market: undefined, // market remains undefined unless explicitly proven
  discovered_at: new Date().toISOString(),
  discovery_method: CRAWL_INDEX_METHOD,
  confidence: 50, // fixture-verified design only; low confidence until live access verified
  parent_seed: undefined,
  evidence: PUBLIC_WEB_EVIDENCE,
  status: 'BLOCKED', // BLOCKED: live Common Crawl access NOT PROVEN; fixture-verified design only

  // Fail-closed: returns []; no live network request ever implemented.
  async fetchDiscoveredKeywords(): Promise<unknown[]> {
    return [];
  },
};

/**
 * Map a Common Crawl capture record to adapter contract fields.
 * Pure mapping — no side effects.
 */
export function mapCommonCrawlCapture(capture: CommonCrawlCapture): Partial<SourceAdapterContract> {
  const language = capture.detectedLanguage
    ? (capture.detectedLanguage === 'ar' ? 'ar' : 'en')
    : undefined;

  return {
    source: 'common_crawl',
    source_type: 'public_web_corpus',
    source_reference: capture.sourceReference || capture.url,
    language,
    market: undefined, // market remains undefined unless explicitly proven
    discovered_at: capture.capturedAt,
    discovery_method: CRAWL_INDEX_METHOD,
    confidence: 50,
    parent_seed: undefined,
    evidence: PUBLIC_WEB_EVIDENCE,
    // NOTE: the legacy contract has no 'public_web_observed' status, but this
    // mapper's established output is asserted by tests/unit/commonCrawlAdapter.
    // test.ts. The value is preserved verbatim; only the type is reconciled.
    status: 'public_web_observed' as unknown as SourceStatus,
  };
}

/**
 * Extract provenance from Common Crawl adapter.
 */
export function extractCommonCrawlProvenance(): { status: 'BLOCKED'; evidence: 'public_web_observed'; source: string } {
  return {
    status: 'BLOCKED',
    evidence: 'public_web_observed',
    source: 'common_crawl',
  } as const;
}

/**
 * Validate a Common Crawl capture record.
 * Returns valid/with-reason or error.
 */
export function validateCommonCrawlCapture(capture: Partial<CommonCrawlCapture>): { valid: boolean; reason?: string } {
  if (!capture.url) return { valid: false, reason: 'URL is required' };
  if (!capture.domain) return { valid: false, reason: 'Domain is required' };
  if (!capture.crawlId) return { valid: false, reason: 'Crawl ID is required' };
  if (!capture.capturedAt) return { valid: false, reason: 'Captured at timestamp is required' };
  // MIME validation (simple)
  const validMimes = ['text/html', 'application/pdf', 'application/xml', ''];
  if (capture.mime && !validMimes.includes(capture.mime)) {
    return { valid: false, reason: `Invalid MIME type: ${capture.mime}` };
  }
  return { valid: true };
}

/**
 * Simple deduplication for Common Crawl captures by URL + crawlId.
 */
export function deduplicateCommonCrawlCaptures(captures: CommonCrawlCapture[]): CommonCrawlCapture[] {
  const seen = new Set<string>();
  const result: CommonCrawlCapture[] = [];
  for (const capture of captures) {
    const key = `${capture.crawlId}:${capture.url}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(capture);
    }
  }
  return result;
}

/**
 * Determine competitor candidate status.
 * Common Crawl does NOT automatically make a domain a competitor.
 * This function classifies the level of competitor evidence.
 */
export function classifyCompetitorCandidate(domain: string, existingCompetitors: Set<string>): 'public_web_page_discovered' | 'competitor_candidate' | 'verified_competitor' {
  if (existingCompetitors.has(domain)) {
    return 'verified_competitor';
  }
  // Check if domain appears to be a competitor based on common patterns
  // but do NOT classify as verified_competitor without explicit confirmation
  const lowerDomain = domain.toLowerCase();
  // Simple heuristic: if domain contains known competitor indicators but not confirmed
  if (lowerDomain.includes(' competitor ') || lowerDomain.includes(' vs ') || lowerDomain.includes(' alternative ')) {
    return 'competitor_candidate';
  }
  // Default: public web page discovered, not yet classified as competitor
  return 'public_web_page_discovered';
}

/* ------------------------------------------------------------------ */
/* Live public-index access                                            */
/* ------------------------------------------------------------------ */

/** One row of the public index, with every required attribution field. */
export interface CommonCrawlIndexRecord {
    /** The crawl collection, e.g. "CC-MAIN-2024-22". */
    crawl_collection: string;
    url: string;
    domain: string;
    /** ISO timestamp of the crawl. */
    captured_at: string;
    /** WARC record locator, e.g. "CC-MAIN-2024-22/...-id-00000". */
    source_reference: string;
    /** CDXJ digest, when present. */
    digest: string | null;
    /** HTTP status the crawler saw, when present. */
    status: string | null;
    mime: string | null;
    filename: string | null;
    offset: string | null;
    length: string | null;
}

export interface CommonCrawlQuery {
    /** Target URL or domain pattern, e.g. "example.com/*". */
    urlPattern: string;
    /** Collection id, e.g. "CC-MAIN-2024-22". Defaults to the newest. */
    crawlCollection?: string;
    /** Hard cap on returned rows. */
    limit?: number;
    language?: SourceLanguage;
    market?: Market;
}

export interface CommonCrawlQueryResult {
    ok: boolean;
    /** True only after a real 2xx from index.commoncrawl.org. */
    verifiedLive: boolean;
    records: CommonCrawlIndexRecord[];
    /** The exact request URL, so a caller can cite the evidence. */
    requestUrl: string | null;
    status: number | null;
    error: string | null;
}

/** Options for the live query. `fetchImpl` is required: no fabricated default. */
export interface CommonCrawlQueryOptions {
    fetchImpl?: typeof fetch;
    /** Injectable clock, for deterministic tests. */
    now?: () => number;
    sleep?: (ms: number) => Promise<void>;
    /** Politeness floor for index.commoncrawl.org, in ms. */
    throttleMs?: number;
    /** Bounded retries; the public index is a shared free resource. */
    maxRetries?: number;
    requestTimeoutMs?: number;
    /** Override the endpoint (tests point this at a local server). */
    endpoint?: string;
}

const DEFAULT_CRAWL_THROTTLE_MS = 1000;
const DEFAULT_CRAWL_MAX_RETRIES = 2;

/** Build the public index query URL. `output=json` returns one JSON per line. */
export function buildIndexQueryUrl(
    query: CommonCrawlQuery,
    endpoint = COMMON_CRAWL_INDEX_ENDPOINT
): string {
    const base = endpoint.replace(/\/+$/, '');
    const collection = query.crawlCollection
        ? `${query.crawlCollection}-index`
        : 'CC-MAIN-LATEST-index';
    const url = new URL(`${base}/${collection}`);
    url.searchParams.set('url', query.urlPattern);
    url.searchParams.set('output', 'json');
    if (typeof query.limit === 'number' && query.limit > 0) {
        url.searchParams.set('pageSize', String(query.limit));
    }
    return url.toString();
}

/** Normalize the domain of a URL for indexing and grouping. */
export function domainOf(url: string): string {
    try {
        return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    } catch {
        return url.toLowerCase();
    }
}

/** Convert a CDXJ "YYYYMMDDhhmmss" stamp into an ISO-8601 string. */
export function toIsoTimestamp(raw: string): string {
    const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(raw.trim());
    if (!m) return raw;
    return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
}

/**
 * Parse one line of `output=json` from the public index.
 * Returns null for a line we cannot understand, rather than guessing.
 */
export function parseIndexLine(line: string): CommonCrawlIndexRecord | null {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // The index also supports a `urlkey` first field (space-delimited); the
    // JSON form is the documented one, so only JSON is accepted here.
    let parsed: Record<string, unknown>;
    try {
        const value: unknown = JSON.parse(trimmed);
        if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
        parsed = value as Record<string, unknown>;
    } catch {
        return null;
    }

    const url = typeof parsed['url'] === 'string' ? parsed['url'] : null;
    const timestamp = typeof parsed['timestamp'] === 'string' ? parsed['timestamp'] : null;
    if (!url || !timestamp) return null;

    const str = (key: string): string | null =>
        typeof parsed[key] === 'string' ? (parsed[key] as string) : null;

    return {
        crawl_collection: str('collection') ?? 'CC-MAIN-LATEST',
        url,
        domain: domainOf(url),
        // CDXJ timestamps are "20240501000000"; normalize them to ISO-8601.
        captured_at: toIsoTimestamp(timestamp),
        source_reference: str('filename')
            ? `${str('filename')}:${str('offset') ?? '0'}:${str('length') ?? '0'}`
            : url,
        digest: str('digest'),
        status: str('status'),
        mime: str('mime'),
        filename: str('filename'),
        offset: str('offset'),
        length: str('length'),
    };
}

/**
 * Query the public index for real capture records.
 *
 * Fails closed: without a `fetchImpl` there is no request and no records.
 * `verifiedLive` is true ONLY when the index returned a real 2xx.
 */
export async function fetchCommonCrawlIndex(
    query: CommonCrawlQuery,
    options: CommonCrawlQueryOptions = {}
): Promise<CommonCrawlQueryResult> {
    const fetchImpl = options.fetchImpl;
    const requestUrl = buildIndexQueryUrl(query, options.endpoint);
    if (typeof fetchImpl !== 'function') {
        return {
            ok: false,
            verifiedLive: false,
            records: [],
            requestUrl,
            status: null,
            error: 'fetchImpl is required: the adapter never fabricates an index response',
        };
    }

    const sleep =
        options.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
    const maxRetries = Math.min(
        2,
        Math.max(0, options.maxRetries ?? DEFAULT_CRAWL_MAX_RETRIES)
    );
    const timeoutMs = Math.max(1, options.requestTimeoutMs ?? 20_000);
    const limit = query.limit && query.limit > 0 ? query.limit : 100;

    let lastStatus: number | null = null;
    let lastError = 'no attempt was made';

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) await sleep(Math.min(4000, 500 * 2 ** (attempt - 1)));
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetchImpl(requestUrl, {
                method: 'GET',
                headers: {
                    // Identifies us; the index asks bots to be identifiable.
                    'user-agent':
                        'MrXSteroidResearchBot/1.0 (+https://mrxsteroid.example/bot)',
                    accept: 'application/json,text/plain;q=0.9',
                },
                signal: controller.signal,
            });
            lastStatus = response.status;
            if (!response.ok) {
                lastError = `HTTP ${response.status} ${response.statusText}`.trim();
                // A 4xx other than 429 will not improve on a retry.
                const retryable = response.status === 429 || response.status >= 500;
                if (!retryable) break;
                continue;
            }
            const body = await response.text();
            const records: CommonCrawlIndexRecord[] = [];
            for (const line of body.split('\n')) {
                const record = parseIndexLine(line);
                if (record) records.push(record);
                if (records.length >= limit) break;
            }
            return {
                ok: true,
                verifiedLive: true,
                records,
                requestUrl,
                status: response.status,
                error: null,
            };
        } catch (error) {
            lastError = error instanceof Error ? error.message : String(error);
        } finally {
            clearTimeout(timer);
        }
    }

    return {
        ok: false,
        verifiedLive: false,
        records: [],
        requestUrl,
        status: lastStatus,
        error: lastError,
    };
}

/** Stable digest of an index record, for change detection between runs. */
export function indexRecordDigest(record: CommonCrawlIndexRecord): string {
    return createHash('sha256')
        .update(`${record.crawl_collection}|${record.url}|${record.captured_at}`, 'utf8')
        .digest('hex');
}

/**
 * Convert one index record into a normalised intelligence record.
 *
 * The record is deliberately inert: `dataKind: 'unavailable'` and all-null
 * metrics, because a crawl capture is provenance about a URL, not a
 * measurement of anything a person searches for. `sourceStatus` is `VERIFIED`
 * only when `verifiedLive` is true, i.e. a real 2xx actually came back.
 */
export function indexRecordToIntelligenceRecord(
    record: CommonCrawlIndexRecord,
    context: {
        verifiedLive: boolean;
        language: SourceLanguage;
        market: Market;
        /** The exact index query that produced this record. */
        requestUrl: string;
    }
): NormalizedIntelligenceRecord {
    return {
        keyword: record.domain,
        language: context.language,
        market: context.market,
        source: COMMON_CRAWL_SOURCE,
        sourceType: 'public_web_corpus',
        sourceClass: 'COMPETITIVE_WEB',
        // VERIFIED only after a real 2xx. Otherwise CONNECTED at most.
        sourceStatus: context.verifiedLive ? 'VERIFIED' : 'CONNECTED',
        sourceReference: record.source_reference,
        discoveredAt: record.captured_at,
        // A capture is not a measurement, so nothing is available.
        dataKind: 'unavailable' as DataKind,
        evidence: `${record.crawl_collection} ${record.url} captured ${record.captured_at} via ${context.requestUrl}`,
        evidenceType: 'commoncrawl_record' as EvidenceType,
        generationMethod: 'common_crawl_index',
        metrics: emptyKeywordMetrics(),
        competitorContext: {
            domain: record.domain,
            url: record.url,
            evidenceReference: record.source_reference,
            capturedAt: record.captured_at,
            classification: 'public_web_page_discovered',
        },
    };
}

/** Deduplicate index records by collection + URL, keeping the newest capture. */
export function dedupeIndexRecords(
    records: CommonCrawlIndexRecord[]
): CommonCrawlIndexRecord[] {
    const byKey = new Map<string, CommonCrawlIndexRecord>();
    for (const record of records) {
        const key = `${record.crawl_collection}|${record.url}`;
        const existing = byKey.get(key);
        if (!existing || record.captured_at > existing.captured_at) {
            byKey.set(key, record);
        }
    }
    return [...byKey.values()];
}

