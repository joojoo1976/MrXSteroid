/**
 * Source Adapter Contract — Step 1 (Implementation Phase, Read-Only Design)
 * No provider activation; no DB writes; no migrations.
 * Defines the unified interface for SEO source integrations.
 */

export type SourceEvidenceType = 'api_response' | 'scrape_result' | 'manual_entry' | 'baseline' | 'internal_telemetry';

export type SourceStatus = 'PROVEN' | 'NOT_PROVEN' | 'BLOCKED';

export interface SourceAdapterContract {
  readonly source: string;                     // unique source identifier
  readonly source_type: string;                 // taxonomy from seo_keyword_sources
  readonly source_reference: string;            // external URL / API endpoint / identifier
  readonly language: 'en' | 'ar';              // market language separation
  readonly market?: string;                     // market isolation (e.g., 'global', 'eg', 'us')
  readonly discovered_at: string;               // ISO timestamp of discovery
  readonly discovery_method: 'scheduled' | 'manual' | 'api_poll' | 'telemetry' | 'baseline';
  readonly confidence: number;                  // 0–100
  readonly parent_seed?: string;                // provenance parent (keyword_id or seed id)
  readonly evidence: SourceEvidenceType;
  readonly status: SourceStatus;                // registry classification — NEVER runtime-activated if NOT_PROVEN or BLOCKED

  // Read-only adapter method: returns discovered keyword payloads without side effects
  fetchDiscoveredKeywords?: (language?: 'en' | 'ar') => Promise<unknown[]>;
}

export interface SourceAdapterResult {
  adapter: SourceAdapterContract;
  discovered: number;
  status: SourceStatus;
  evidence: SourceEvidenceType;
  error?: string; // only if BLOCKED or NOT_PROVEN due to missing evidence
}
