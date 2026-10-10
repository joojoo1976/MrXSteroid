/**
 * lib/tools/ai-registry.test.ts
 * The AI navigation layer must be category-aware via the REAL category map
 * (TOOL_CATEGORY), not the old slug-prefix hack (which matched every tool
 * whose slug started with 'tool' — i.e. everything).
 */
import { describe, it, expect } from 'vitest';
import { aiToolsRegistry, getAIRecommendations, searchToolsAI } from './ai-registry';
import { getCategoryOfSlug, SMART_TOOL_CATEGORY_SLUGS } from './categories';

describe('AI registry', () => {
  it('every registry tool carries numeric id + difficulty + estimated time', () => {
    expect(aiToolsRegistry.length).toBeGreaterThan(0);
    for (const t of aiToolsRegistry) {
      expect(typeof t.id).toBe('number');
      expect(['beginner', 'intermediate', 'advanced']).toContain(t.difficultyLevel);
      expect(t.estimatedTime).toBeGreaterThan(0);
      expect(t.relatedTools.length).toBeLessThanOrEqual(3);
      // category must be a REAL SmartToolCategory, or 'uncategorized' for the
      // legacy flat-route tools (which navigate by flat /smarttools/<slug>).
      expect([...SMART_TOOL_CATEGORY_SLUGS, 'uncategorized'] as readonly string[]).toContain(t.category);
    }
  });

  it('getAIRecommendations returns same-REAL-category tools (medical-monitoring), never self', () => {
    const recs = getAIRecommendations({ slug: 'tool-037-side-effect-probability', toolId: 'mrx.tool.037-side-effect-probability' });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(5);
    for (const r of recs) {
      expect(r.slug).not.toBe('tool-037-side-effect-probability');
      expect(getCategoryOfSlug(r.slug), r.slug).toBe('medical-monitoring');
    }
  });

  it('getAIRecommendations never leaks cross-category noise (the old bug)', () => {
    const recs = getAIRecommendations({ slug: 'tool-013-macro-optimizer', toolId: 'mrx.tool.013-macro-optimizer' });
    for (const r of recs) {
      expect(getCategoryOfSlug(r.slug), r.slug).toBe('nutrition');
    }
  });

  it('searchToolsAI matches both Arabic and English titles', () => {
    expect(searchToolsAI('حاسبة نصف العمر').length).toBeGreaterThan(0);
    expect(searchToolsAI('lipid').some((t) => t.slug === 'tool-040-lipid-profile-optimizer')).toBe(true);
  });
});
