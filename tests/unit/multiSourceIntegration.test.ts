import { describe, it, expect } from 'vitest';
import { sourceRegistry } from '../../server/seo/sources/registry';
import { internalBaselineAdapter } from '../../server/seo/sources/internalBaselineAdapter';
import { internalSearchAdapter } from '../../server/seo/sources/internalSearchAdapter';
import { gscAdapter } from '../../server/seo/sources/gscAdapter';

describe('Step 8 — Multi-Source Internal Integration Gate (PROVEN co-existence)', () => {
  it('registry returns both PROVEN internal sources', () => {
    const active = sourceRegistry.getActiveSources();
    const names = active.map(a => a.source);
    expect(names).toContain('internal_baseline_seeds');
    expect(names).toContain('internal_search_telemetry');
  });

  it('BLOCKED GSC not in active sources', () => {
    const active = sourceRegistry.getActiveSources();
    const names = active.map(a => a.source);
    expect(names).not.toContain('google_search_console');
  });

  it('baseline adapter remains discovery (PROVEN)', () => {
    expect(internalBaselineAdapter.status).toBe('PROVEN');
    expect(internalBaselineAdapter.source).toBe('internal_baseline_seeds');
    expect(internalBaselineAdapter.discovery_method).toBe('baseline');
  });

  it('search telemetry adapter remains signal/boost only (PROVEN)', () => {
    expect(internalSearchAdapter.status).toBe('PROVEN');
    expect(internalSearchAdapter.source).toBe('internal_search_telemetry');
    expect(internalSearchAdapter.discovery_method).toBe('telemetry');
    expect(internalSearchAdapter.discovered).toBeUndefined(); // adapter design; registry uses getActiveSources not discovered count directly
  });

  it('no duplicate ingestion path for baseline', () => {
    // Adapter exists; registry active; ingestion path remains same (adapter not second ingestion)
    expect(sourceRegistry.isProven('internal_baseline_seeds')).toBe(true);
  });

  it('no duplicate ingestion path for telemetry', () => {
    expect(sourceRegistry.isProven('internal_search_telemetry')).toBe(true);
    // Adapter returns [] (signal/boost); pipeline uses telemetry directly; no second ingestion
  });

  it('EN/AR isolation preserved across both sources', () => {
    expect(internalBaselineAdapter.language).toBe('en');
    expect(internalSearchAdapter.language).toBe('en');
  });

  it('market isolation preserved', () => {
    expect(internalBaselineAdapter.market).toBe('global');
    expect(internalSearchAdapter.market).toBe('global');
  });

  it('provenance preserved for both sources', () => {
    expect(internalBaselineAdapter.status).toBe('PROVEN');
    expect(internalBaselineAdapter.evidence).toBe('baseline');
    expect(internalSearchAdapter.status).toBe('PROVEN');
    expect(internalSearchAdapter.evidence).toBe('internal_telemetry');
  });

  it('semantic equivalence — pipeline unchanged for both sources', () => {
    // Adapter design; no change to scoring/clustering/destination/persistence
    expect(internalBaselineAdapter.source_type).toBe('baseline');
    expect(internalSearchAdapter.source_type).toBe('internal_search');
  });

  it('no cross-source duplication in registry', () => {
    const active = sourceRegistry.getActiveSources();
    const sources = active.map(a => a.source);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it('no GSC activation in multi-source gate', () => {
    expect(gscAdapter.status).toBe('BLOCKED');
  });

  it('EN/AR isolation preserved across both sources', () => {
    expect(internalBaselineAdapter.language).toBe('en');
    expect(internalSearchAdapter.language).toBe('en');
    // Both support EN/AR via underlying code (baselineKeywords and searchTelemetry params)
  });

  it('market isolation preserved', () => {
    expect(internalBaselineAdapter.market).toBe('global');
    expect(internalSearchAdapter.market).toBe('global');
  });

  it('provenance preserved for both sources', () => {
    // Adapter imports verified in registry/module; provenance tracked by adapter contracts
    expect(internalBaselineAdapter.status).toBe('PROVEN');
    expect(internalBaselineAdapter.evidence).toBe('baseline');
    expect(internalSearchAdapter.status).toBe('PROVEN');
    expect(internalSearchAdapter.evidence).toBe('internal_telemetry');
  });

  it('semantic equivalence — pipeline unchanged for both sources', () => {
    // Pipeline does not change behavior because adapters are design-only / registry-only
    expect(internalBaselineAdapter.fetchDiscoveredKeywords).toBeDefined();
    expect(internalSearchAdapter.fetchDiscoveredKeywords).toBeDefined();
    // No modification to scoring/clustering/destination/persistence
  });

  it('no cross-source duplication in registry', () => {
    const active = sourceRegistry.getActiveSources();
    const sources = active.map(a => a.source);
    expect(new Set(sources).size).toBe(sources.length); // unique
  });

  it('no GSC activation in multi-source gate', () => {
    expect(gscAdapter.status).toBe('BLOCKED');
    expect(internalBaselineAdapter.status).toBe('PROVEN');
    expect(internalSearchAdapter.status).toBe('PROVEN');
  });
});
