/**
 * Common Crawl Public Web Discovery Adapter — Step 12 (Implementation Phase, Read-Only Design)
 * Source: Common Crawl public corpus index (no live API calls, no credentials).
 * Status: DESIGN (fixture-verified only); NOT PROVEN for live Common Crawl access.
 * Does NOT act as keyword discovery like GSC/Bing/Ads.
 * Carries provenance of public web page captures only.
 * Does NOT assert search volume, rankings, CTR, impressions, or demand metrics.
 * Produces candidate competitor evidence only — NOT verified_competitor.
 */

import { SourceAdapterContract, SourceAdapterResult, SourceEvidenceType } from './adapterContract';

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
  discovery_method: 'common_crawl_index',
  confidence: 50, // PROVEN: fixture-verified design; low confidence until live access verified
  parent_seed: undefined,
  evidence: 'public_web_observed' as SourceEvidenceType,
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
    discovery_method: 'common_crawl_index',
    confidence: 50,
    parent_seed: undefined,
    evidence: 'public_web_observed' as SourceEvidenceType,
    status: 'public_web_observed' as SourceStatus,
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