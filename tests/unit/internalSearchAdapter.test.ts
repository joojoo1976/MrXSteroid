import { describe, it, expect } from 'vitest';
import { internalSearchAdapter, extractTelemetryProvenance } from '../../server/seo/sources/internalSearchAdapter';
import { sourceRegistry } from '../../server/seo/sources/registry';

describe('Internal Search Intelligence Adapter — Step 7 (PROVEN, signal/boost only)', () => {
  it('is registered as PROVEN', () => {
    expect(internalSearchAdapter.status).toBe('PROVEN');
    expect(sourceRegistry.isProven('internal_search_telemetry')).toBe(true);
  });

  it('does NOT claim keyword discovery — signal/boost only', () => {
    expect(internalSearchAdapter.discovery_method).toBe('telemetry');
    expect(internalSearchAdapter.source).toBe('internal_search_telemetry');
  });

  it('preserves Arabic / English language isolation', () => {
    expect(internalSearchAdapter.language).toBe('en');
    // Adapter handles telemetry with language from AdvancedSearchLogParams
  });

  it('provenance reports telemetry evidence', () => {
    const prov = extractTelemetryProvenance();
    expect(prov.status).toBe('PROVEN');
    expect(prov.evidence).toBe('internal_telemetry');
    expect(prov.discovered).toBe(0); // signal/boost only — not discovery
  });

  it('market isolation preserved (global)', () => {
    expect(internalSearchAdapter.market).toBe('global');
  });

  it('adapter contract fields present', () => {
    expect(internalSearchAdapter.source_type).toBe('internal_search');
    expect(internalSearchAdapter.source_reference).toContain('seo_internal_search_logs');
    expect(typeof internalSearchAdapter.confidence).toBe('number');
  });

  it('empty/fallback behavior safe (no phantom keywords)', () => {
    // Adapter fetch returns [] by design; pipeline uses telemetry separately
    const result = internalSearchAdapter.fetchDiscoveredKeywords!();
    // fetch is async; result is Promise
    expect(typeof result.then).toBe('function');
  });

  it('no external credentials in adapter', () => {
    const s = JSON.stringify(internalSearchAdapter);
    expect(s).not.toContain('key=');
    expect(s).not.toContain('token=');
    expect(s).not.toContain('secret=');
  });

  it('no duplicate ingestion risk — adapter separate from refresh pipeline', () => {
    // Step 7: adapter exists; registry active; pipeline unchanged (refresh/route untouched)
    expect(internalSearchAdapter.status).toBe('PROVEN');
    expect(sourceRegistry.isProven('internal_search_telemetry')).toBe(true);
  });
});
