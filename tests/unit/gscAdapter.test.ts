import { describe, it, expect } from 'vitest';
import {
  gscAdapter,
  mapGscToAdapterRow,
  normalizeGscFields,
  verifyNoCredentialLeak,
  GscResponseRow,
} from '../../server/seo/sources/gscAdapter';

describe('GSC Adapter — Step 2 (Blocked, Read-Only Design)', () => {
  it('registers adapter with BLOCKED status', () => {
    expect(gscAdapter.status).toBe('BLOCKED');
    expect(gscAdapter.source_type).toBe('google_search_console');
  });

  it('mapGscToAdapterRow produces adapter contract fields', () => {
    const row: GscResponseRow = {
      dimensions: [{ query: 'coaching', page: '/mrx-coaching', country: 'US', device: 'DESKTOP' }],
      clicks: 42,
      impressions: 1000,
      ctr: 0.042,
      position: 3.5,
    };
    const mapped = mapGscToAdapterRow(row);
    expect(mapped.source).toBe('google_search_console');
    expect(mapped.language).toBe('en');
    expect(mapped.source_reference).toContain('coaching');
  });

  it('detects Arabic query as ar language', () => {
    const row: GscResponseRow = {
      dimensions: [{ query: 'تدريب', page: '/training-ar', country: 'EG', device: 'MOBILE' }],
    };
    const mapped = mapGscToAdapterRow(row);
    expect(mapped.language).toBe('ar');
  });

  it('normalizes missing/null fields safely', () => {
    const normalized = normalizeGscFields(null);
    expect(normalized.dimensions.length).toBeGreaterThanOrEqual(1);
    expect(normalized.clicks).toBe(0);
    expect(normalized.impressions).toBe(0);
    expect(normalized.position).toBe(0);
  });

  it('clamps CTR to [0, 1]', () => {
    const normalized = normalizeGscFields({ dimensions: [{}], ctr: 1.5 });
    expect(normalized.ctr).toBe(1);
  });

  it('no credential leak in adapter config', () => {
    expect(verifyNoCredentialLeak(gscAdapter)).toBe(true);
  });

  it('fail-closed behavior: fetch returns empty array without activation', async () => {
    const result = await gscAdapter.fetchDiscoveredKeywords!();
    expect(result).toEqual([]);
  });

  it('provenance tracks parent seed from query', () => {
    const row: GscResponseRow = {
      dimensions: [{ query: 'mrx-addon' }],
    };
    const mapped = mapGscToAdapterRow(row);
    expect(mapped.parent_seed).toBe('mrx-addon');
  });

  it('market isolation preserved (global default)', () => {
    expect(gscAdapter.market).toBe('global');
  });
});
