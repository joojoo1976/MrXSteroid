/**
 * Source Registry — Step 1 (Implementation Phase, Read-Only Design)
 * Separates integration status; prevents NOT_PROVEN / BLOCKED from runtime activation.
 * No provider keys, no API connections, no DB writes.
 */

/**
 * Source Registry — Step 1 (legacy) + Step 2-3 (seven-state health model)
 *
 * Two layers live side by side and neither breaks the other:
 *
 * 1. LEGACY (Step 1, unchanged public shape): `register()` / `getActiveSources()`
 *    / `getStatusFor()` / `isProven()` / `isBlockedOrNotProven()` /
 *    `requireEvidence()` over `SourceAdapterContract` with the
 *    `PROVEN | NOT_PROVEN | BLOCKED` vocabulary. Existing callers and existing
 *    tests keep compiling and keep their exact behaviour.
 *
 * 2. SEVEN-STATE (Step 2-3): every provider also carries a `SourceStatusInfo`
 *    describing what is real about it right now, readable via
 *    `getSourceHealth()` for the admin dashboard.
 *
 * Honesty rules for the health table — enforced here, asserted by tests:
 *   - Nothing is `CONNECTED` or `VERIFIED`. No live provider request has ever
 *     succeeded from this codebase, so claiming either would be a lie.
 *   - `gsc` / `commoncrawl` / `competitor_web` / `csv_import` state exactly
 *     what is missing in `blocked_reason`, not a vague "not ready".
 *   - `internal_search` and `internal_baseline_seeds` stop at
 *     `CONFIGURED`/`IMPLEMENTED`: the code paths exist and are wired, but no
 *     live execution has been observed, so they are NOT `VERIFIED`.
 *   - Every paid provider is `DISABLED` with blocked_reason
 *     `no credentials configured`.
 *   - No `last_success_at` is populated anywhere, because none exists yet.
 */

import { SourceAdapterContract, SourceStatus, SourceAdapterResult } from './adapterContract';
import { internalSearchAdapter } from './internalSearchAdapter';
import { manualImportAdapter } from './manualImportAdapter';
import { gscAdapter } from './gscAdapter';
import { internalBaselineAdapter } from './internalBaselineAdapter';
import { commonCrawlAdapter } from './commonCrawlAdapter';
import {
    CostClass,
    EvidenceLevel,
    Market,
    SourceClass,
    SourceLanguage,
    SourceStatusInfo,
} from './types';

export type RegistryEntry = {
  adapter: SourceAdapterContract;
  registered_at: string;
  verified_at?: string; // only when status transitions to PROVEN
};

/**
 * A provider's declared current state, before runtime counters are filled in.
 * `last_attempt_at` / `last_success_at` / `last_failure_at` / `last_error` /
 * `quota_used` are supplied by the registry because they only become true
 * after a real run.
 */
export type SourceHealthDeclaration = Omit<
    SourceStatusInfo,
    | 'last_attempt_at'
    | 'last_success_at'
    | 'last_failure_at'
    | 'last_error'
    | 'quota_used'
>;

export class SourceRegistry {
  private registry: Map<string, RegistryEntry> = new Map();
  private health: Map<string, SourceStatusInfo> = new Map();

  // Only PROVEN sources may be activated at runtime. NOT_PROVEN / BLOCKED are rejected.
  register(adapter: SourceAdapterContract): SourceAdapterResult {
    const key = adapter.source;
    const now = new Date().toISOString();

    // Guard: never activate unverified sources
    if (adapter.status === 'NOT_PROVEN' || adapter.status === 'BLOCKED') {
      return {
        adapter,
        discovered: 0,
        status: adapter.status,
        evidence: adapter.evidence,
        error: `Source ${key} is ${adapter.status}; not allowed to enter runtime as active source until Production evidence verified.`,
      };
    }

    // Only PROVEN allowed to register
    if (adapter.status !== 'PROVEN') {
      return {
        adapter,
        discovered: 0,
        status: 'BLOCKED',
        evidence: adapter.evidence,
        error: `Unknown status for ${key}; defaulting to BLOCKED.`,
      };
    }

    this.registry.set(key, { adapter, registered_at: now });
    return {
      adapter,
      discovered: 0,
      status: 'PROVEN',
      evidence: adapter.evidence,
    };
  }

  getActiveSources(): SourceAdapterContract[] {
    const active: SourceAdapterContract[] = [];
    for (const entry of this.registry.values()) {
      if (entry.adapter.status === 'PROVEN') {
        active.push(entry.adapter);
      }
    }
    return active;
  }

  getStatusFor(source: string): SourceStatus | undefined {
    return this.registry.get(source)?.adapter.status;
  }

  isProven(source: string): boolean {
    return this.getStatusFor(source) === 'PROVEN';
  }

  isBlockedOrNotProven(source: string): boolean {
    const s = this.getStatusFor(source);
    return s === 'NOT_PROVEN' || s === 'BLOCKED';
  }

  // Explicit evidence check for Production verification
  requireEvidence(source: string): SourceAdapterResult {
    const entry = this.registry.get(source);
    if (!entry) {
      // 'baseline' is the weakest evidence the legacy contract can express and
      // is the honest choice for "nothing is registered, so nothing is proven".
      return { adapter: {} as SourceAdapterContract, discovered: 0, status: 'BLOCKED', evidence: 'baseline', error: 'Source not registered.' };
    }
    if (entry.adapter.status === 'PROVEN' && entry.verified_at) {
      return { adapter: entry.adapter, discovered: 0, status: 'PROVEN', evidence: entry.adapter.evidence };
    }
    return { adapter: entry.adapter, discovered: 0, status: entry.adapter.status, evidence: entry.adapter.evidence, error: 'Production evidence missing.' };
  }

  // ---- Layer 2: seven-state health (Step 2-3) ----

  /**
   * Declare a provider's honest current state.
   *
   * Runtime fields are forced to their "nothing has happened yet" values
   * (`null` timestamps, no error, zero quota) so a declaration can never
   * smuggle in a fabricated success.
   */
  registerSourceHealth(declaration: SourceHealthDeclaration): SourceStatusInfo {
    const info: SourceStatusInfo = {
      ...declaration,
      last_attempt_at: null,
      last_success_at: null,
      last_failure_at: null,
      last_error: null,
      quota_used: 0,
    };
    this.health.set(declaration.provider, info);
    return info;
  }

  /**
   * Full health table for the admin dashboard, one entry per provider.
   * Returns a fresh array of copies so a caller cannot mutate registry state.
   */
  getSourceHealth(): SourceStatusInfo[] {
    return Array.from(this.health.values(), (info) => ({ ...info }));
  }

  /** Health entry for one provider, or undefined when it is not registered. */
  getSourceStatusInfo(provider: string): SourceStatusInfo | undefined {
    const info = this.health.get(provider);
    return info ? { ...info } : undefined;
  }

  /** Providers in one of the seven states, e.g. `getSourcesByStatus('DISABLED')`. */
  getSourcesByStatus(status: SourceStatusInfo['status']): SourceStatusInfo[] {
    return this.getSourceHealth().filter((info) => info.status === status);
  }

  /** Providers that carry an exact blocked reason. */
  getBlockedSources(): SourceStatusInfo[] {
    return this.getSourceHealth().filter((info) => info.blocked_reason !== null);
  }

  /**
   * Providers that may actually be called at runtime.
   * Empty by design today: nothing has been live-proven.
   */
  getRuntimeExecutableSources(): SourceStatusInfo[] {
    return this.getSourceHealth().filter(
      (info) => info.status === 'CONNECTED' || info.status === 'VERIFIED',
    );
  }
}

// Default registry instance — safe for import; never activates unverified sources
export const sourceRegistry = new SourceRegistry();

// Step 2: GSC adapter registered explicitly as BLOCKED (no verified Production evidence / no active API access)
// This registers the adapter design without runtime activation.
// Once Production DB / GSC access is verified, status can transition (requires approval).
sourceRegistry.register({ ...gscAdapter, status: 'BLOCKED' });

// Step 4: Internal baseline adapter — PROVEN (existing verified seed source)
// No external auth; uses existing getBaselineKeywords; preserves all pipeline behavior.
sourceRegistry.register(internalBaselineAdapter);

// Step 7: Internal Search Intelligence — PROVEN (existing telemetry; signal/boost only; NOT keyword discovery)
sourceRegistry.register(internalSearchAdapter);

// Step 10: Manual/Public Import — PROVEN (verified manual/public source; no external auth, no scraping)
// No Production DB writes; used for manual augmentation only.
sourceRegistry.register(manualImportAdapter);

// ---------------------------------------------------------------------------
// Layer 2 registration: the honest seven-state health table.
//
// Every entry below is a claim about THIS repository, not about the vendor.
// Read `blocked_reason` as the literal reason the source cannot run today.
// ---------------------------------------------------------------------------

const ALL_LANGUAGES: SourceLanguage[] = ['en', 'ar'];
const ALL_MARKETS: Market[] = ['ar-EG', 'ar-SA', 'ar-AE', 'en-US', 'en-GB', 'en-CA', 'en-AU'];

/** Internal baseline seeds — curated corpus shipped in the repo. */
sourceRegistry.registerSourceHealth({
    provider: 'internal_baseline_seeds',
    adapter_key: 'internalBaselineAdapter',
    source_class: 'FIRST_PARTY',
    // Curated seed data exists in-repo and the adapter is wired into the
    // pipeline, but no live execution of this adapter has been observed, so it
    // is CONFIGURED and deliberately NOT VERIFIED.
    status: 'CONFIGURED',
    languages: ALL_LANGUAGES,
    markets: ALL_MARKETS,
    auth_required: false,
    auth_present: true,
    blocked_reason: null,
    quota_limit: null,
    cost_class: 'free',
    evidence_level: 'declared',
    cache_ttl_seconds: 3600,
    config: {
        origin: 'server/seo/baselineKeywords.ts',
        provides_metrics: false,
        note: 'curated seed strings; carries no search volume or ranking measurement',
    },
});

/** Internal first-party search telemetry — signal/boost only, not discovery. */
sourceRegistry.registerSourceHealth({
    provider: 'internal_search_telemetry',
    adapter_key: 'internalSearchAdapter',
    source_class: 'FIRST_PARTY',
    // The table and read path are implemented; nothing has been observed live.
    status: 'IMPLEMENTED',
    languages: ALL_LANGUAGES,
    markets: ALL_MARKETS,
    auth_required: false,
    auth_present: true,
    blocked_reason:
        'no live read of seo_internal_search_logs has been executed against the production database, so no observed first-party counts exist yet',
    quota_limit: null,
    cost_class: 'free',
    evidence_level: 'declared',
    cache_ttl_seconds: 300,
    config: {
        origin: 'server/seo/searchTelemetry.ts',
        role: 'demand boost signal only; not keyword discovery',
    },
});

/** Manual / public import — augmentation-only, no scraping. */
sourceRegistry.registerSourceHealth({
    provider: 'manual_public_import',
    adapter_key: 'manualImportAdapter',
    source_class: 'MANUAL_IMPORT',
    status: 'IMPLEMENTED',
    languages: ALL_LANGUAGES,
    markets: ALL_MARKETS,
    auth_required: false,
    auth_present: true,
    blocked_reason: null,
    quota_limit: null,
    cost_class: 'free',
    evidence_level: 'imported',
    cache_ttl_seconds: 0,
    config: {
        origin: 'server/seo/sources/manualImportAdapter.ts',
        provides_metrics: false,
    },
});

/**
 * CSV bulk import.
 *
 * TRUTH NOTE: the pipeline DOES exist — `server/seo/sources/csvImportPipeline.ts`
 * (RFC4180 parser, per-provider column mapping, validate/dedupe/classify stages,
 * SHA-256 file checksum, per-row provenance). The previous `blocked_reason`
 * claimed the parser and mapping were "unimplemented", which was FALSE. The real
 * gap is that no ingest route is wired and no file has ever been imported.
 */
sourceRegistry.registerSourceHealth({
    provider: 'csv_import',
    adapter_key: 'csvImportPipeline',
    source_class: 'MANUAL_IMPORT',
    // IMPLEMENTED: the pipeline is written and tested. Not CONFIGURED, because
    // no ingest route exposes it and no file has been processed.
    status: 'IMPLEMENTED',
    languages: ALL_LANGUAGES,
    markets: ALL_MARKETS,
    auth_required: false,
    auth_present: false,
    blocked_reason:
        'pipeline exists and is tested (server/seo/sources/csvImportPipeline.ts) but no admin ingest route is wired to it and no file has ever been imported, so zero imported rows and no imported provenance exist',
    quota_limit: null,
    cost_class: 'free',
    evidence_level: 'declared',
    cache_ttl_seconds: 0,
    config: {
        adapter_file: 'server/seo/sources/csvImportPipeline.ts (implemented)',
        note: 'row provenance and evidenceType=imported not yet defined',
    },
});

/** Google Search Console — contract exists, no credentials, no live call. */
sourceRegistry.registerSourceHealth({
    provider: 'google_search_console',
    adapter_key: 'gscAdapter',
    source_class: 'SEARCH_INTELLIGENCE',
    status: 'IMPLEMENTED',
    languages: ALL_LANGUAGES,
    markets: ALL_MARKETS,
    auth_required: true,
    auth_present: false,
    blocked_reason:
        'no Google service-account credentials are configured and no site property has been granted access; the Search Analytics request path has never been executed, so no observed clicks/impressions/CTR/position exist',
    quota_limit: null,
    cost_class: 'free',
    evidence_level: 'none',
    cache_ttl_seconds: 86400,
    config: {
        endpoint: gscAdapter.source_reference,
        api_version: 'webmaster-tools/v3',
        provides_metrics: true,
        metrics_expected: 'googleImpressions, googleClicks, googleCtr, googlePosition',
    },
});

/** Bing Web Search — planned separate engine. */
sourceRegistry.registerSourceHealth({
    provider: 'bing_web_search',
    adapter_key: 'bingAdapter',
    source_class: 'SEARCH_INTELLIGENCE',
    status: 'IMPLEMENTED',
    languages: ALL_LANGUAGES,
    markets: ALL_MARKETS,
    auth_required: true,
    auth_present: false,
    blocked_reason:
        'adapter exists and is tested (server/seo/sources/bingAdapter.ts) but no Bing Web Search API subscription key is configured and no request has been made; Bing signals must stay in bingImpressions/bingClicks and must never be merged into the Google fields',
    quota_limit: null,
    cost_class: 'metered_free_tier',
    evidence_level: 'none',
    cache_ttl_seconds: 86400,
    config: {
        adapter_file: 'server/seo/sources/bingAdapter.ts (implemented)',
        provides_metrics: true,
    },
});

/** Google Ads Keyword Planner — planned, no credentials. */
sourceRegistry.registerSourceHealth({
    provider: 'google_ads_keyword_planner',
    adapter_key: 'googleAdsAdapter',
    source_class: 'SEARCH_INTELLIGENCE',
    status: 'IMPLEMENTED',
    languages: ALL_LANGUAGES,
    markets: ALL_MARKETS,
    auth_required: true,
    auth_present: false,
    blocked_reason:
        'no Google Ads developer token, OAuth client or linked manager account is configured; the only permitted use today is the free URL-seed suggestion signal, which has also never been requested',
    quota_limit: null,
    cost_class: 'metered_free_tier',
    evidence_level: 'none',
    cache_ttl_seconds: 604800,
    config: {
        adapter_file: 'server/seo/sources/googleAdsAdapter.ts (implemented)',
        provides_metrics: true,
        metrics_expected: 'googleAdsAvgMonthlySearches, googleAdsCompetition',
    },
});

/** Google Trends — planned relative interest only. */
sourceRegistry.registerSourceHealth({
    provider: 'google_trends',
    adapter_key: 'googleTrendsAdapter',
    source_class: 'SEARCH_INTELLIGENCE',
    status: 'IMPLEMENTED',
    languages: ALL_LANGUAGES,
    markets: ALL_MARKETS,
    auth_required: false,
    auth_present: false,
    blocked_reason:
        'adapter exists and is tested (server/seo/sources/googleTrendsAdapter.ts, MANUAL_CSV + OFFICIAL_API modes) but the official API is a closed alpha with no public endpoint and no CSV has been imported, so no relative-interest observation exists; Trends stays a 0-100 index, never a volume',
    quota_limit: null,
    cost_class: 'free',
    evidence_level: 'none',
    cache_ttl_seconds: 86400,
    config: {
        adapter_file: 'server/seo/sources/googleTrendsAdapter.ts (implemented)',
        provides_metrics: true,
        metrics_expected: 'trendsRelativeInterest',
    },
});

/** Common Crawl — design only, fixture shapes, never a live index request. */
sourceRegistry.registerSourceHealth({
    provider: 'common_crawl',
    adapter_key: 'commonCrawlAdapter',
    source_class: 'COMPETITIVE_WEB',
    status: 'IMPLEMENTED',
    languages: ALL_LANGUAGES,
    markets: ALL_MARKETS,
    auth_required: false,
    auth_present: true,
    blocked_reason:
        'the capture record schema and dedup helpers are implemented, but no request to the Common Crawl index has ever been made from this codebase, so no capture record exists and no competitor classification has been derived from live data',
    quota_limit: null,
    cost_class: 'free',
    evidence_level: 'declared',
    cache_ttl_seconds: 604800,
    config: {
        origin: 'server/seo/sources/commonCrawlAdapter.ts',
        endpoint: commonCrawlAdapter.source_reference,
        provides_metrics: false,
        note: 'discovery of a public page never implies verified_competitor',
    },
});

/**
 * Competitor web analysis.
 *
 * TRUTH NOTE: the adapter DOES exist — `server/seo/sources/competitorCrawler.ts`
 * (robots parsing, sitemap walk, throttled/conditional requests, title/h1/h2/
 * visible-text/JSON-LD extraction). The previous `blocked_reason` said "no
 * fetch/parse adapter exists", which was FALSE and understated work that is
 * implemented and tested. The real blocker is that no crawl has been RUN, so no
 * competitor evidence has ever been collected.
 */
sourceRegistry.registerSourceHealth({
    provider: 'competitor_web',
    adapter_key: 'competitorCrawler',
    source_class: 'COMPETITIVE_WEB',
    // IMPLEMENTED: the adapter is written and unit-tested. It is deliberately
    // NOT CONFIGURED/CONNECTED — no crawl has been executed against a live host.
    status: 'IMPLEMENTED',
    languages: ALL_LANGUAGES,
    markets: ALL_MARKETS,
    auth_required: false,
    auth_present: false,
    blocked_reason:
        'adapter exists and is tested (server/seo/sources/competitorCrawler.ts) but no crawl has been executed against a live host, so zero competitor observations exist; configuration and external verification are both unproven',
    quota_limit: null,
    cost_class: 'free',
    evidence_level: 'declared',
    cache_ttl_seconds: 86400,
    config: {
        adapter_file: 'server/seo/sources/competitorCrawler.ts (implemented)',
        provides_metrics: false,
        evidence_types_planned:
            'competitor_page, competitor_title, competitor_heading, competitor_visible_text, competitor_structured_data, competitor_sitemap',
    },
});

/**
 * Paid providers. All DISABLED, all for the same exact reason: no credentials.
 * They are registered (not omitted) so the admin dashboard shows the whole
 * landscape and nobody "discovers" a paid source and wires it up blind.
 */
const PAID_PROVIDERS: ReadonlyArray<{
    provider: string;
    adapter_key: string;
    blocked_reason: string;
}> = [
    {
        provider: 'ahrefs',
        adapter_key: 'ahrefsAdapter',
        blocked_reason:
            'no credentials configured; no Ahrefs API subscription key and no adapter file, and the endpoint is billable per row',
    },
    {
        provider: 'semrush',
        adapter_key: 'semrushAdapter',
        blocked_reason:
            'no credentials configured; no Semrush API key and no adapter file, and the endpoint is billable per row',
    },
    {
        provider: 'dataforseo',
        adapter_key: 'dataforSeoAdapter',
        blocked_reason:
            'no credentials configured; no DataForSEO login/password pair and no adapter file, and the endpoint is billable per task',
    },
    {
        provider: 'serpapi',
        adapter_key: 'serpApiAdapter',
        blocked_reason:
            'no credentials configured; no SerpApi key and no adapter file, and the endpoint is billable per search',
    },
    {
        provider: 'similarweb',
        adapter_key: 'similarWebAdapter',
        blocked_reason:
            'no credentials configured; no Similarweb API key and no adapter file, and the endpoint is billable per request',
    },
];

for (const paid of PAID_PROVIDERS) {
    sourceRegistry.registerSourceHealth({
        provider: paid.provider,
        adapter_key: paid.adapter_key,
        source_class: 'PAID_OPTIONAL',
        status: 'DISABLED',
        languages: ALL_LANGUAGES,
        markets: ALL_MARKETS,
        auth_required: true,
        auth_present: false,
        blocked_reason: paid.blocked_reason,
        quota_limit: null,
        cost_class: 'paid',
        evidence_level: 'none',
        cache_ttl_seconds: 0,
        config: {
            adapter_file: `server/seo/sources/${paid.adapter_key}.ts (does not exist)`,
            note: 'any volume from this provider is an estimate, never an observation',
        },
    });
}

/** Generated expansion — deterministic derivation from existing seeds. */
sourceRegistry.registerSourceHealth({
    provider: 'internal_generated_expansion',
    adapter_key: 'generatedExpansionAdapter',
    source_class: 'GENERATED',
    status: 'PLANNED',
    languages: ALL_LANGUAGES,
    markets: ALL_MARKETS,
    auth_required: false,
    auth_present: true,
    blocked_reason:
        'no expansion adapter has been written; candidate keywords may only be generated with an explicit generationMethod and must carry dataKind=generated with all-null metrics',
    quota_limit: null,
    cost_class: 'free',
    evidence_level: 'declared',
    cache_ttl_seconds: 3600,
    config: {
        adapter_file: 'server/seo/sources/generatedExpansionAdapter.ts (does not exist)',
        provides_metrics: false,
    },
});

/** Editorial review queue — human-in-the-loop, not a data provider. */
sourceRegistry.registerSourceHealth({
    provider: 'editorial_review',
    adapter_key: 'editorialAdapter',
    source_class: 'EDITORIAL',
    status: 'PLANNED',
    languages: ALL_LANGUAGES,
    markets: ALL_MARKETS,
    auth_required: false,
    auth_present: false,
    blocked_reason:
        'no editorial review queue, reviewer identity or approval record exists, so no keyword has been editorially approved and no evidenceType=editorial record can be produced',
    quota_limit: null,
    cost_class: 'free',
    evidence_level: 'none',
    cache_ttl_seconds: 0,
    config: {
        adapter_file: 'server/seo/sources/editorialAdapter.ts (does not exist)',
        provides_metrics: false,
    },
});

/**
 * Admin-dashboard summary counts by state.
 * Pure read; returns a zero-filled object so a caller never has to guard on a
 * missing key.
 */
export function getSourceHealthSummary(): Record<string, number> {
    const summary: Record<string, number> = {
        PLANNED: 0,
        IMPLEMENTED: 0,
        CONFIGURED: 0,
        CONNECTED: 0,
        VERIFIED: 0,
        FAILED: 0,
        DISABLED: 0,
    };
    for (const info of sourceRegistry.getSourceHealth()) {
        summary[info.status] = (summary[info.status] ?? 0) + 1;
    }
    return summary;
}

