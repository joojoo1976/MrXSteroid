/**
 * GSC Source Adapter — Step 2 (Implementation Phase)
 * CONTRACT ONLY — no Production activation, no credentials, no DB writes.
 * Status: BLOCKED (no verified Production evidence / no active API access).
 * Based on verified GSC Search Analytics API contract (developers.google.com/webmaster-tools/v1/searchanalytics/query).
 */

import { SourceAdapterContract, SourceAdapterResult, SourceEvidenceType } from './adapterContract';

export interface GscDimensionEntry {
  query?: string;
  page?: string;
  country?: string;
  device?: string;
  date?: string;
}

export interface GscMetricEntry {
  clicks?: number;
  impressions?: number;
  ctr?: number;     // click-through rate (0–1 or percentage depending on source)
  position?: number; // average position
}

export interface GscResponseRow {
  dimensions: GscDimensionEntry[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

export type GscSourceStatus = 'BLOCKED'; // explicit: no verified evidence

/**
 * GSC Adapter — read-only contract implementation.
 * Never activates at runtime without PROVEN status + verified API access.
 */
export const gscAdapter: SourceAdapterContract = {
  source: 'google_search_console',
  source_type: 'google_search_console',
  source_reference: 'https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query',
  language: 'en', // GSC data language depends on site content; adapter reports source language
  market: 'global',
  discovered_at: new Date().toISOString(),
  discovery_method: 'scheduled',
  confidence: 0, // BLOCKED — no verified production evidence
  parent_seed: undefined,
  evidence: 'api_response', // intended method; not verified
  status: 'BLOCKED', // explicit guard

  // Fail-closed: no actual fetch implemented; if called, returns empty with error
  async fetchDiscoveredKeywords(): Promise<unknown[]> {
    return [];
  },
};

/**
 * Map a GSC API response row to adapter-compatible provenance.
 * Pure mapping — no side effects.
 */
export function mapGscToAdapterRow(row: GscResponseRow): Partial<SourceAdapterContract> {
  const dims = row.dimensions || [{}];
  const dim = dims[0] || {};
  return {
    source: 'google_search_console',
    source_type: 'google_search_console',
    source_reference: dim.page || dim.query || 'unknown',
    language: (dim.query && /[\u0600-\u06FF]/.test(dim.query)) ? 'ar' : 'en',
    market: 'global',
    discovered_at: new Date().toISOString(),
    discovery_method: 'scheduled',
    confidence: 0,
    parent_seed: dim.query || undefined,
    evidence: 'api_response',
  };
}

/**
 * Normalize missing/null GSC fields safely.
 */
export function normalizeGscFields(row: Partial<GscResponseRow> | null | undefined): GscResponseRow {
  if (!row) return { dimensions: [{}], clicks: 0, impressions: 0, ctr: 0, position: 0 };
  return {
    dimensions: (row.dimensions && row.dimensions.length > 0) ? row.dimensions : [{}],
    clicks: typeof row.clicks === 'number' ? Math.max(0, row.clicks) : 0,
    impressions: typeof row.impressions === 'number' ? Math.max(0, row.impressions) : 0,
    ctr: typeof row.ctr === 'number' ? Math.max(0, Math.min(1, row.ctr)) : 0,
    position: typeof row.position === 'number' ? Math.max(1, row.position) : 0,
  };
}

/**
 * Verify no credentials leak in adapter config.
 */
export function verifyNoCredentialLeak(adapter: SourceAdapterContract): boolean {
  const configStr = JSON.stringify(adapter);
  // Explicit guard: no keys, secrets, tokens expected in adapter definition
  const forbiddenPatterns = ['key=', 'secret=', 'token=', 'credential=', 'password=', 'private_key', 'api_key'];
  for (const p of forbiddenPatterns) {
    if (configStr.toLowerCase().includes(p)) return false;
  }
  return true;
}
