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

/** The 30 legacy toolIds that must never regress (SPEC §1, §6). */
const ORIGINAL_30_TOOL_IDS: readonly string[] = [
  'mrx.tool.multi-ester-pharmacokinetics', 'mrx.tool.hpta-recovery', 'mrx.tool.aromatization-risk',
  'mrx.tool.pct-timing', 'mrx.tool.hcg-serm-protocol', 'mrx.tool.006-estrogen-prolactin',
  'mrx.tool.007-bloodwork-analyzer', 'mrx.tool.008-side-effect-tracker', 'mrx.tool.009-injection-site-rotator',
  'mrx.tool.010-compound-stack-builder', 'mrx.tool.011-progress-tracker', 'mrx.tool.012-calorie-adjuster',
  'mrx.tool.013-macro-optimizer', 'mrx.tool.014-water-retention', 'mrx.tool.015-shbg-modulator',
  'mrx.tool.016-half-life', 'mrx.tool.017-drug-interaction', 'mrx.tool.018-hpta-recovery-monitor',
  'mrx.tool.019-cardio-monitor', 'mrx.tool.020-genetic-potential', 'mrx.tool.021-peptide-protocol',
  'mrx.tool.022-half-life-stacker', 'mrx.tool.023-trt-optimization', 'mrx.tool.024-bloodwork-interpreter',
  'mrx.tool.025-drug-interaction-pro', 'mrx.tool.026-injection-pain', 'mrx.tool.027-ester-conversion',
  'mrx.tool.028-stacking-synergy', 'mrx.tool.029-side-effect-warning', 'mrx.tool.030-cycle-cost',
];
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

  it('exposes at least the original 30 tools plus every implemented batch', () => {
    const tools = getCatalogTools();
    expect(tools.length).toBeGreaterThanOrEqual(30);
    // The original #1-#30 identities must always be present (no regression).
    for (const id of ORIGINAL_30_TOOL_IDS) {
      expect(tools.some((t) => t.toolId === id), `missing legacy tool ${id}`).toBe(true);
    }
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