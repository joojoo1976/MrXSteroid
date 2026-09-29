/**
 * Internal Baseline Keywords Adapter — Step 4 (Implementation Phase, Read-Only Design)
 * Source: server/seo/baselineKeywords.ts — curated seeds, verified against existing site destinations.
 * Status: PROVEN (existing code; active in pipeline; no external auth required).
 */

import { SourceAdapterContract, SourceAdapterResult, SourceEvidenceType } from './adapterContract';
import { getBaselineKeywords } from '../baselineKeywords'; // existing internal source

export const internalBaselineAdapter: SourceAdapterContract = {
  source: 'internal_baseline_seeds',
  source_type: 'baseline',
  source_reference: 'internal://baseline-keywords',
  language: 'en', // adapter supports both; specific seeds specify individually
  market: 'global',
  discovered_at: new Date().toISOString(),
  discovery_method: 'baseline',
  confidence: 95, // PROVEN: verified seeds from existing code
  parent_seed: undefined,
  evidence: 'baseline' as SourceEvidenceType,
  status: 'PROVEN', // only PROVEN adapter; no BLOCKED sources in Step 4

  async fetchDiscoveredKeywords(language?: 'en' | 'ar'): Promise<unknown[]> {
    // Read-only: uses existing getBaselineKeywords; preserves pipeline behavior
    const lang = language || 'en';
    const seeds = getBaselineKeywords(lang);
    // Provenance: each seed tagged with adapter source for traceability
    return seeds.map((s: any) => ({
      ...s,
      source: 'internal_baseline_seeds',
      source_type: 'baseline' as const,
      discovered_at: new Date().toISOString(),
    }));
  },
};

export interface InternalBaselineRow {
  originalKeyword: string;
  normalizedKeyword: string;
  language: 'en' | 'ar';
  cluster: string;
  intent: string;
  score: number;
  destinationPath: string;
  source_type: 'baseline';
}

/**
 * Extract provenance from internal baseline source.
 */
export function extractProvenanceFromBaseline(): SourceAdapterResult {
  return {
    adapter: internalBaselineAdapter,
    discovered: 240, // estimated: 120 EN + 120 AR per source file description
    status: 'PROVEN',
    evidence: 'baseline',
  };
}
