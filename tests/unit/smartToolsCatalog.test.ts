/**
 * tests/unit/smartToolsCatalog.test.ts
 * Validates the central Smart Tools catalog: 30 user-facing tools,
 * unique identities, and filesystem wiring (component/engine/schema/route).
 */
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCatalogTools, getPublishedCatalogTools, validateCatalog } from '@/lib/tools/smartToolsCatalog4';
import { SMART_TOOL_CATEGORIES, getPublishedToolsByCategory } from '@/lib/tools/categories';

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

  it('exposes 50 implemented user-facing tools with an empty planned queue', () => {
    const tools = getCatalogTools();
    const implemented = tools.filter((t) => t.status !== 'planned');
    const planned = tools.filter((t) => t.status === 'planned');
    // 30 baseline tools (#1-#30) + 20 shipped tools (#031-#050, each with
    // engine/schema/component/adapter/i18n/route/category/registry + tests).
    expect(implemented.length).toBe(50);
    // Roadmap #046-#050 shipped — no planned entries remain in catalog6.
    expect(planned.length).toBe(0);
    expect(tools.length).toBe(50);
  });

  it('every implemented entry has component, engine, schema and route on disk', () => {
    const tools = getCatalogTools().filter((t) => t.status !== 'planned');
    for (const t of tools) {
      expect(existsSync(toFsPath(t.componentPath)), `missing component: ${t.toolId} -> ${t.componentPath}`).toBe(true);
      expect(existsSync(toFsPath(t.enginePath)), `missing engine: ${t.toolId} -> ${t.enginePath}`).toBe(true);
      expect(existsSync(toFsPath(t.schemaPath)), `missing schema: ${t.toolId} -> ${t.schemaPath}`).toBe(true);
      const slug = t.href.replace(/^\//, '');
      expect(
        existsSync(join(ROOT, 'app', slug, 'page.tsx')),
        `missing route: ${t.toolId} -> app/${slug}/page.tsx`
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
    expect(published.length).toBe(50);
    for (const cat of SMART_TOOL_CATEGORIES) {
      expect(getPublishedToolsByCategory(cat.slug).some((t) => t.status === 'planned'), cat.slug).toBe(false);
    }
  });
});