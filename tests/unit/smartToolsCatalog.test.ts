/**
 * tests/unit/smartToolsCatalog.test.ts
 * Validates the central Smart Tools catalog: 30 user-facing tools,
 * unique identities, and filesystem wiring (component/engine/schema/route).
 */
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCatalogTools, validateCatalog } from '@/lib/tools/smartToolsCatalog4';

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

  it('exposes 30 user-facing tools', () => {
    const tools = getCatalogTools();
    expect(tools.length).toBe(30);
  });

  it('every catalog entry has component, engine, schema and route on disk', () => {
    const tools = getCatalogTools();
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
});