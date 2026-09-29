/**
 * Internal Search Intelligence Adapter — Step 7 (Implementation Phase)
 * Source: server/seo/searchTelemetry.ts / seo_internal_search_logs — anonymous telemetry.
 * Status: PROVEN (existing; active in refresh as search-boost signal, not keyword discovery).
 * Semantics preserved: signal/boost only; does NOT create new keyword ingestion independently.
 */

import { SourceAdapterContract, SourceAdapterResult, SourceEvidenceType } from './adapterContract';
import { AdvancedSearchLogParams } from '../searchTelemetry';

export const internalSearchAdapter: SourceAdapterContract = {
  source: 'internal_search_telemetry',
  source_type: 'internal_search',
  source_reference: 'internal://seo_internal_search_logs',
  language: 'en',
  market: 'global',
  discovered_at: new Date().toISOString(),
  discovery_method: 'telemetry',
  confidence: 70, // PROVEN: verified telemetry; lower than admin/baseline due to anonymous nature
  parent_seed: undefined,
  evidence: 'internal_telemetry' as SourceEvidenceType,
  status: 'PROVEN',

  // Read-only: returns telemetry summary, not independent keyword discovery
  async fetchDiscoveredKeywords(): Promise<unknown[]> {
    // Signal/boost adapter: does NOT emit new keywords independently.
    // Existing refresh pipeline reads telemetry separately for demand boost.
    return [];
  },
};

export interface InternalSearchTelemetryRow {
  queryHash?: string;
  normalizedQuery?: string;
  language?: 'en' | 'ar';
  resultsCount?: number;
  clickedResult?: string;
  searchSuccess?: boolean;
  locale?: string;
  countryCode?: string;
  sessionRefHash?: string;
}

export function extractTelemetryProvenance(row?: InternalSearchTelemetryRow): SourceAdapterResult {
  return {
    adapter: internalSearchAdapter,
    discovered: 0, // telemetry is signal, not keyword discovery
    status: 'PROVEN',
    evidence: 'internal_telemetry',
  };
}
