import { describe, it, expect } from 'vitest';
import {
  commonCrawlAdapter,
  mapCommonCrawlCapture,
  extractCommonCrawlProvenance,
  validateCommonCrawlCapture,
  deduplicateCommonCrawlCaptures,
  classifyCompetitorCandidate,
} from '../../server/seo/sources/commonCrawlAdapter';

describe('Common Crawl Adapter — Step 12 (Read-Only, Fixture Gate)', () => {
  it('adapter is BLOCKED for live Common Crawl access', () => {
    expect(commonCrawlAdapter.status).toBe('BLOCKED');
  });

  it('adapter source_type is public_web_corpus', () => {
    expect(commonCrawlAdapter.source_type).toBe('public_web_corpus');
  });

  it('adapter evidence is public_web_observed', () => {
    expect(commonCrawlAdapter.evidence).toBe('public_web_observed');
  });

  it('mapCommonCrawlCapture maps capture fields correctly', () => {
    const capture: CommonCrawlCapture = {
      crawlId: '20240501000000',
      capturedAt: '2024-05-01T00:00:00Z',
      url: 'https://example.com/page',
      domain: 'example.com',
      status: '200',
      mime: 'text/html',
      detectedLanguage: 'en',
      digest: 'abc123',
    };
    const mapped = mapCommonCrawlCapture(capture);
    expect(mapped.source).toBe('common_crawl');
    expect(mapped.source_type).toBe('public_web_corpus');
    expect(mapped.language).toBe('en');
    expect(mapped.status).toBe('public_web_observed');
  });

  it('validateCommonCrawlCapture valid capture', () => {
    const valid = validateCommonCrawlCapture({
      url: 'https://example.com',
      domain: 'example.com',
      crawlId: '20240501000000',
      capturedAt: '2024-05-01T00:00:00Z',
    });
    expect(valid.valid).toBe(true);
  });

  it('validateCommonCrawlCapture missing URL', () => {
    const valid = validateCommonCrawlCapture({
      domain: 'example.com',
      crawlId: '20240501000000',
      capturedAt: '2024-05-01T00:00:00Z',
    });
    expect(valid.valid).toBe(false);
    expect(valid.reason).toContain('URL');
  });

  it('validateCommonCrawlCapture missing domain', () => {
    const valid = validateCommonCrawlCapture({
      url: 'https://example.com',
      crawlId: '20240501000000',
      capturedAt: '2024-05-01T00:00:00Z',
    });
    expect(valid.valid).toBe(false);
    expect(valid.reason).toContain('Domain');
  });

  it('deduplicateCommonCrawlCaptures removes duplicates', () => {
    const captures: CommonCrawlCapture[] = [
      {
        crawlId: '20240501000000',
        capturedAt: '2024-05-01T00:00:00Z',
        url: 'https://example.com',
        domain: 'example.com',
        status: '200',
        mime: 'text/html',
      },
      {
        crawlId: '20240501000000',
        capturedAt: '2024-05-01T00:00:00Z',
        url: 'https://example.com', // duplicate
        domain: 'example.com',
        status: '200',
        mime: 'text/html',
      },
    ];
    const deduped = deduplicateCommonCrawlCaptures(captures);
    expect(deduped.length).toBe(1);
  });

  it('deduplicateCommonCrawlCaptures preserves unique captures', () => {
    const captures: CommonCrawlCapture[] = [
      {
        crawlId: '20240501000000',
        capturedAt: '2024-05-01T00:00:00Z',
        url: 'https://example.com',
        domain: 'example.com',
        status: '200',
        mime: 'text/html',
      },
      {
        crawlId: '20240501000000',
        capturedAt: '2024-05-01T00:00:01Z',
        url: 'https://other.com',
        domain: 'other.com',
        status: '200',
        mime: 'text/html',
      },
    ];
    const deduped = deduplicateCommonCrawlCaptures(captures);
    expect(deduped.length).toBe(2);
  });

  it('classifyCompetitorCandidate verified_competitor', () => {
    const existingCompetitors = new Set(['example.com', 'competitor.com']);
    expect(classifyCompetitorCandidate('competitor.com', existingCompetitors)).toBe('verified_competitor');
  });

  it('classifyCompetitorCandidate competitor_candidate', () => {
    const existingCompetitors = new Set(['other.com']);
    expect(classifyCompetitorCandidate('competitor.com', existingCompetitors)).toBe('public_web_page_discovered');
  });

  it('classifyCompetitorCandidate public_web_page_discovered', () => {
    const existingCompetitors = new Set([]);
    expect(classifyCompetitorCandidate('newsite.com', existingCompetitors)).toBe('public_web_page_discovered');
  });

  it('extractCommonCrawlProvenance returns BLOCKED status', () => {
    const provenance = extractCommonCrawlProvenance();
    expect(provenance.status).toBe('BLOCKED');
    expect(provenance.evidence).toBe('public_web_observed');
    expect(provenance.source).toBe('common_crawl');
  });

  it('no fake SEO metrics in adapter config', () => {
    const s = JSON.stringify(commonCrawlAdapter);
    expect(s).not.toContain('search_volume');
    expect(s).not.toContain('ranking');
    expect(s).not.toContain('ctr');
    expect(s).not.toContain('position');
    expect(s).not.toContain('impressions');
    expect(s).not.toContain('demand');
  });

  it('language handling: Arabic detected as ar', () => {
    const capture: CommonCrawlCapture = {
      crawlId: '20240501000000',
      capturedAt: '2024-05-01T00:00:00Z',
      url: 'https://example.com/page',
      domain: 'example.com',
      status: '200',
      mime: 'text/html',
      detectedLanguage: 'ar',
    };
    const mapped = mapCommonCrawlCapture(capture);
    expect(mapped.language).toBe('ar');
  });

  it('language handling: English detected as en', () => {
    const capture: CommonCrawlCapture = {
      crawlId: '20240501000000',
      capturedAt: '2024-05-01T00:00:00Z',
      url: 'https://example.com/page',
      domain: 'example.com',
      status: '200',
      mime: 'text/html',
      detectedLanguage: 'en',
    };
    const mapped = mapCommonCrawlCapture(capture);
    expect(mapped.language).toBe('en');
  });

  it('language handling: no detected language returns undefined', () => {
    const capture: CommonCrawlCapture = {
      crawlId: '20240501000000',
      capturedAt: '2024-05-01T00:00:00Z',
      url: 'https://example.com/page',
      domain: 'example.com',
      status: '200',
      mime: 'text/html',
    };
    const mapped = mapCommonCrawlCapture(capture);
    expect(mapped.language).toBeUndefined();
  });

  it('market remains undefined when not proven', () => {
    expect(commonCrawlAdapter.market).toBeUndefined();
  });
});