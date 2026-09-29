import { describe, it, expect } from 'vitest';
import { manualImportAdapter, normalizeManualImportRow, validateManualImportRow, deduplicateManualImportRows } from '../../server/seo/sources/manualImportAdapter';
import { sourceRegistry } from '../../server/seo/sources/registry';

describe('Manual/Public Import Adapter — Step 10 (PROVEN, manual augmentation)', () => {
  it('is registered as PROVEN', () => {
    expect(manualImportAdapter.status).toBe('PROVEN');
    expect(sourceRegistry.isProven('manual_public_import')).toBe(true);
  });

  it('adapter source_type is manual', () => {
    expect(manualImportAdapter.source_type).toBe('manual');
  });

  it('adapter source_reference is internal manual-import', () => {
    expect(manualImportAdapter.source_reference).toContain('manual-import');
  });

  it('default language is en', () => {
    expect(manualImportAdapter.language).toBe('en');
  });

  it('default market is global', () => {
    expect(manualImportAdapter.market).toBe('global');
  });

  it('confidence is 80 (PROVEN manual)', () => {
    expect(manualImportAdapter.confidence).toBe(80);
  });

  it('evidence is manual_entry', () => {
    expect(manualImportAdapter.evidence).toBe('manual_entry');
  });

  it('fetchDiscoveredKeywords returns empty (signal/augmentation only)', async () => {
    const result = await manualImportAdapter.fetchDiscoveredKeywords!();
    expect(result).toEqual([]);
  });

  it('normalizeManualImportRow produces adapter fields', () => {
    const row: ManualImportRow = {
      originalKeyword: 'test keyword',
      language: 'en',
    };
    const normalized = normalizeManualImportRow(row);
    expect(normalized.language).toBe('en');
    expect(normalized.source).toBe('manual_public_import');
  });

  it('validateManualImportRow valid input', () => {
    const result = validateManualImportRow({
      originalKeyword: 'test keyword',
      language: 'en',
    });
    expect(result.valid).toBe(true);
  });

  it('validateManualImportRow invalid: empty keyword', () => {
    const result = validateManualImportRow({
      originalKeyword: '',
      language: 'en',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('validateManualImportRow invalid: bad language', () => {
    const result = validateManualImportRow({
      originalKeyword: 'test',
      language: 'fr',
    });
    expect(result.valid).toBe(false);
  });

  it('deduplicateManualImportRows removes duplicates', () => {
    const rows: ManualImportRow[] = [
      { originalKeyword: 'keyword 1', language: 'en' },
      { originalKeyword: 'keyword 1', language: 'en' }, // duplicate
      { originalKeyword: 'keyword 2', language: 'en' },
    ];
    const deduped = deduplicateManualImportRows(rows);
    expect(deduped.length).toBe(2);
  });

  it('deduplicateManualImportRows preserves unique rows', () => {
    const rows: ManualImportRow[] = [
      { originalKeyword: 'keyword 1', language: 'en' },
      { originalKeyword: 'keyword 2', language: 'en' },
    ];
    const deduped = deduplicateManualImportRows(rows);
    expect(deduped.length).toBe(2);
  });

  it('sourceRegistry registers manualImportAdapter as PROVEN', () => {
    expect(sourceRegistry.isProven('manual_public_import')).toBe(true);
  });

  it('sourceRegistry getActiveSources includes manualImportAdapter', () => {
    const active = sourceRegistry.getActiveSources();
    const sources = active.map(a => a.source);
    expect(sources).toContain('manual_public_import');
  });

  it('adapter respects EN/AR language detection', () => {
    // Arabic keyword should be valid with explicit language='ar'
    const arabicRow: ManualImportRow = {
      originalKeyword: 'training',
      language: 'ar',
    };
    const validated = validateManualImportRow(arabicRow);
    expect(validated.valid).toBe(true);
  });

  it('no fake metrics in adapter config', () => {
    const s = JSON.stringify(manualImportAdapter);
    expect(s).not.toContain('search_volume');
    expect(s).not.toContain('ctr');
    expect(s).not.toContain('position');
    expect(s).not.toContain('api_key');
  });
});