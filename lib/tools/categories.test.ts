import { describe, expect, it } from 'vitest';
import { SMART_TOOL_CATEGORIES, getCategoryOfSlug, getPublishedToolsByCategory, toHierarchicalHref } from './categories';
import { getPublishedCatalogTools } from './smartToolsCatalog4';

describe('published SmartTools category and route coverage', () => {
  it('assigns every published catalog entry to a visible category', () => {
    const uncategorized = getPublishedCatalogTools().filter((tool) => !getCategoryOfSlug(tool.slug));
    expect(uncategorized).toEqual([]);
  });

  it('uses category-before-tool canonical routes for all published entries', () => {
    for (const tool of getPublishedCatalogTools()) {
      const category = getCategoryOfSlug(tool.slug);
      expect(category, tool.slug).toBeTruthy();
      expect(toHierarchicalHref(tool.slug)).toBe(`/smarttools/${category}/${tool.slug}`);
    }
  });

  it('groups published entries exactly once in declared category order', () => {
    const grouped = SMART_TOOL_CATEGORIES.flatMap((category) => getPublishedToolsByCategory(category.slug));
    const slugs = grouped.map((tool) => tool.slug);
    expect(slugs).toHaveLength(getPublishedCatalogTools().length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('publishes tools 236–240 under their preserved category-first hrefs', () => {
    const expected = [
      ['tool-236-restaurant-macro-navigator', 'ai-nutrition-vision'],
      ['tool-237-intra-workout-volumizer', 'ai-nutrition-vision'],
      ['tool-238-fiber-type-adaptation-score', 'contest-prep'],
      ['tool-239-peptide-reconstitution', 'homebrew-chemistry'],
      ['tool-240-raw-powder-density-engine', 'homebrew-chemistry'],
    ] as const;

    for (const [slug, category] of expected) {
      const entry = getPublishedCatalogTools().find((tool) => tool.slug === slug);
      expect(entry, slug).toBeDefined();
      expect(getCategoryOfSlug(slug)).toBe(category);
      expect(toHierarchicalHref(slug)).toBe(`/smarttools/${category}/${slug}`);
      expect(entry?.href).toBe(`/smarttools/${category}/${slug}`);
    }
  });

  it('publishes tools 241–245 under their existing homebrew-chemistry routes', () => {
    const slugs = [
      'tool-241-solvent-ratio',
      'tool-242-dosage-unit-conversion-engine',
      'tool-243-carrier-oil-viscosity-estimator',
      'tool-244-purity-yield-estimator',
      'tool-245-storage-stability-estimator',
    ];

    for (const slug of slugs) {
      const entry = getPublishedCatalogTools().find((tool) => tool.slug === slug);
      expect(entry, slug).toBeDefined();
      expect(getCategoryOfSlug(slug)).toBe('homebrew-chemistry');
      expect(toHierarchicalHref(slug)).toBe(`/smarttools/homebrew-chemistry/${slug}`);
      expect(entry?.href).toBe(`/smarttools/homebrew-chemistry/${slug}`);
    }
  });

  it('publishes approved bounded tools 246, 247, 250, and 252 under preserved routes', () => {
    const expected = [
      ['tool-246-homebrew-chemistry', 'homebrew-chemistry'],
      ['tool-247-habit-intelligence-coach', 'ai-behavior'],
      ['tool-250-personal-fitness-memory-layer', 'ai-behavior'],
      ['tool-252-command-center', 'ai-behavior'],
    ] as const;
    for (const [slug, category] of expected) {
      const entry = getPublishedCatalogTools().find((tool) => tool.slug === slug);
      expect(entry, slug).toBeDefined();
      expect(getCategoryOfSlug(slug)).toBe(category);
      expect(toHierarchicalHref(slug)).toBe(`/smarttools/${category}/${slug}`);
      expect(entry?.href).toBe(`/smarttools/${category}/${slug}`);
    }
  });
});
