import { describe, expect, it, beforeEach } from 'vitest';
import {
  __resetR6ManifestCacheForTests,
  getR6ManifestEntry,
  getR6Total,
  R6_EXEMPT_SLUGS,
} from '@/lib/tools/r6/manifest';
import { getPublishedCatalogTools } from '@/lib/tools/smartToolsCatalog4';
import { buildR6Boxes } from '@/lib/tools/r6/boxes';

describe('R6 manifest', () => {
  beforeEach(() => __resetR6ManifestCacheForTests());

  it('uses the published catalog total of 268', () => {
    expect(getR6Total()).toBe(268);
  });

  it('uses the published catalog position for the progress index', () => {
    const tools = getPublishedCatalogTools();
    const slug = 'tool-111-smart-food-macro-substitution';
    const entry = getR6ManifestEntry(slug);
    expect(entry).not.toBeNull();
    expect(entry?.index).toBe(tools.findIndex((t) => t.slug === slug) + 1);
    expect(entry?.total).toBe(268);
  });

  it('gives every published tool a unique 1..268 progress index', () => {
    const indexes = getPublishedCatalogTools().map((t) => getR6ManifestEntry(t.slug)?.index);
    expect(indexes.every((i) => typeof i === 'number' && i >= 1 && i <= 268)).toBe(true);
    expect(new Set(indexes).size).toBe(268);
  });

  it('freezes the five already-upgraded tools', () => {
    for (const slug of R6_EXEMPT_SLUGS) {
      expect(getR6ManifestEntry(slug)?.hasOwnBoxes).toBe(true);
    }
  });

  it('returns null for an unknown slug', () => {
    expect(getR6ManifestEntry('not-a-real-tool')).toBeNull();
  });

  it('builds all twelve boxes in fixed order with honest sources', () => {
    const entry = getR6ManifestEntry('tool-006-estrogen-prolactin');
    expect(entry).not.toBeNull();
    const boxes = buildR6Boxes(entry!, 'en');
    expect(boxes.map((b) => b.id)).toEqual([
      'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12',
    ]);
    expect(boxes.find((b) => b.id === 'C4')?.content).toBe('NOT_AVAILABLE');
    expect(boxes.find((b) => b.id === 'C5')?.content).toBe('NOT_AVAILABLE');
    expect(boxes.find((b) => b.id === 'C8')?.content).toBe('NOT_AVAILABLE');
    expect(boxes.find((b) => b.id === 'C11')?.content).toBe('NOT_AVAILABLE');
    expect(boxes.find((b) => b.id === 'C2')?.content).toBe(entry!.descriptionEn);
  });
});
