/**
 * tests/unit/smartToolsCatalog.test.ts
 * Validates the central Smart Tools catalog: 30 user-facing tools,
 * unique identities, and filesystem wiring (component/engine/schema/route).
 */
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCatalogTools, getPublishedCatalogTools, validateCatalog } from '@/lib/tools/smartToolsCatalog4';
import { SMART_TOOL_CATEGORIES, getPublishedToolsByCategory, toHierarchicalHref } from '@/lib/tools/categories';
import { TOOL_REGISTRY } from '@/lib/tools/registry';

const ROOT = process.cwd();

function toFsPath(p: string): string {
  // '@/components/tools/x' -> '<root>/components/tools/x.tsx'
  // 'lib/tools/engines/x' -> '<root>/lib/tools/engines/x.ts'
  if (p.startsWith('@/')) return join(ROOT, p.slice(2) + '.tsx');
  return join(ROOT, p + '.ts');
}

describe('Smart Tools catalog', () => {
  it('passes validation gate with no duplicates', () => {
    const { ok, errors } = validateCatalog();
    expect(errors).toEqual([]);
    expect(ok).toBe(true);
  });

  it('exposes the current catalog: 162 published + 4 planned = 166 identities', () => {
    const tools = getCatalogTools();
    const implemented = tools.filter((t) => t.status !== 'planned');
    const planned = tools.filter((t) => t.status === 'planned');
    expect(implemented.length).toBe(264);
    expect(planned.length).toBe(4);
    expect(tools.length).toBe(268);
  });

  it('every implemented entry has component, engine, schema and route on disk', () => {
    const tools = getCatalogTools().filter((t) => t.status !== 'planned');
    for (const t of tools) {
      expect(existsSync(toFsPath(t.componentPath)), `missing component: ${t.toolId} -> ${t.componentPath}`).toBe(true);
      expect(existsSync(toFsPath(t.enginePath)), `missing engine: ${t.toolId} -> ${t.enginePath}`).toBe(true);
      expect(existsSync(toFsPath(t.schemaPath)), `missing schema: ${t.toolId} -> ${t.schemaPath}`).toBe(true);
      // Check for the dynamic route file that handles all tools
      expect(
        existsSync(join(ROOT, 'app', 'smarttools', '[category]', '[tool]', 'page.tsx')),
        `missing dynamic route: ${t.toolId} -> app/smarttools/[category]/[tool]/page.tsx`
      ).toBe(true);
    }
  });

  it('every entry has AR + EN titles and a valid access tier', () => {
    for (const t of getCatalogTools()) {
      expect(t.titleAr.length).toBeGreaterThan(0);
      expect(t.titleEn.length).toBeGreaterThan(0);
      expect(['free', 'premium']).toContain(t.accessTier);
    }
  });

  it('planned roadmap entries never leak into Hub/route generators', () => {
    const tools = getCatalogTools();
    const planned = tools.filter((t) => t.status === 'planned');
    // Guard is conditional: when the roadmap is empty every entry ships; when
    // planned entries exist they must have NO component/route on disk yet.
    for (const t of planned) {
      expect(existsSync(toFsPath(t.componentPath)), `planned tool must have no component yet: ${t.toolId}`).toBe(false);
      const slug = t.href.replace(/^\//, '');
      expect(existsSync(join(ROOT, 'app', slug, 'page.tsx')), `planned tool must have no route yet: ${t.toolId}`).toBe(false);
    }
  });

  it('published views (category pages, sitemap, tool params) exclude planned entries', () => {
    const published = getPublishedCatalogTools();
    expect(published.some((t) => t.status === 'planned')).toBe(false);
    expect(published.length).toBe(264);
    for (const cat of SMART_TOOL_CATEGORIES) {
      expect(getPublishedToolsByCategory(cat.slug).some((t) => t.status === 'planned'), cat.slug).toBe(false);
    }
  });

  it('uses a category-first canonical href for every published tool', () => {
    for (const tool of getPublishedCatalogTools()) {
      expect(tool.href, `${tool.slug} should link directly to its category-first route`).toBe(toHierarchicalHref(tool.slug));
    }
  });

  it('has a Registry identity for every published catalog tool', () => {
    const published = getPublishedCatalogTools();
    const registrySlugs = new Set(TOOL_REGISTRY.map((tool) => tool.slug));
    expect(TOOL_REGISTRY.length).toBe(published.length);
    for (const tool of published) expect(registrySlugs.has(tool.slug), tool.slug).toBe(true);
  });
});
