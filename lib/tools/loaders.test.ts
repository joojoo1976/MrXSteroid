/**
 * lib/tools/loaders.test.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  G-08 regression guard.
 *
 *  `lib/tools/loaders.ts` used a webpack *context module*
 *  (`` import(`@/components/tools/${slug}`) ``). A context module matches every
 *  file under `components/tools/**` recursively, so every tool component — and
 *  every non-tool helper that happens to live in that folder (`recharts`
 *  widgets, `dnd-kit` widgets, even stray `*.test.tsx` files) — was pulled into
 *  the module graph of the single catch-all route
 *  `/smarttools/[category]/[tool]`. That is why `recharts` chunks shipped in the
 *  *initial* `<script>` set of Tool-036, whose own chart is correctly lazy.
 *
 *  The loader now uses an explicit slug → import map, so only real published
 *  tool entries are reachable, and heavy widgets stay behind the tool's own
 *  `next/dynamic(..., { ssr: false })` boundary.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { toolLoaders, getToolComponent, preloadTools } from './loaders';
import { getPublishedCatalogTools } from './smartToolsCatalog4';

/** Strip block + line comments so the audit-trail note may *name* the pattern. */
function strippedLoadersSource(): string {
  const raw = readFileSync(path.join(process.cwd(), 'lib/tools/loaders.ts'), 'utf8');
  return raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/** Non-tool modules that live in `components/tools/` and must NOT be reachable. */
const NON_TOOL_HELPERS = [
  'tool-036-weekly-calendar', // dnd-kit drag calendar (lazy inside tool-036)
  'tool-036-accumulation-chart', // recharts widget (lazy inside tool-036)
  'timeline', // orphan legacy module, imports recharts
  'SafetyNotice', // shared presentational helper
] as const;

describe('G-08 — SmartTools loader must not use a webpack context module', () => {
  it('loaders.ts contains no variable or template-literal dynamic import', () => {
    const src = strippedLoadersSource();
    // A webpack context module is created by a dynamic import whose *request*
    // is built from a variable. Static string imports are exactly what we want
    // (one analysable async chunk per tool); a template literal or string
    // concatenation re-introduces the whole folder.
    expect(src).not.toMatch(/import\(\s*`/);
    expect(src).not.toMatch(/import\(\s*[^)`"']*\+/);
    // Sanity: the explicit map IS made of static string imports.
    expect(src).toMatch(/import\('@\/components\/tools\//);
  });

  it('still exports the public loader API', () => {
    expect(typeof toolLoaders).toBe('function');
    expect(typeof getToolComponent).toBe('function');
    expect(typeof preloadTools).toBe('function');
  });
});

describe('G-08 — every published catalog tool stays resolvable (no broken routes)', () => {
  const published = getPublishedCatalogTools();

  it('the catalog exposes a non-trivial published set', () => {
    expect(published.length).toBeGreaterThan(100);
  });

  it('returns a lazy loader for every published catalog slug', () => {
    const unresolvable = published
      .map((t) => t.slug)
      .filter((slug) => typeof toolLoaders(slug) !== 'function');
    expect(unresolvable).toEqual([]);
  });

  it('every published slug is unique', () => {
    const slugs = published.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('G-08 — non-tool helper modules are no longer swept into the route graph', () => {
  it.each(NON_TOOL_HELPERS)('toolLoaders(%j) resolves to null', (slug) => {
    expect(toolLoaders(slug)).toBeNull();
  });

  it('getToolComponent returns null (not a throw) for a helper slug', async () => {
    await expect(getToolComponent('tool-036-accumulation-chart')).resolves.toBeNull();
  });
});

describe('G-08 — slug guard is preserved (no arbitrary module resolution)', () => {
  it.each([
    '',
    '../secrets',
    'a/b',
    'tool-036-injection-schedule/extra',
    'Tool-036-Injection-Schedule',
    './tool-036-injection-schedule',
    'tool 036',
  ])('toolLoaders(%j) is null', (slug) => {
    expect(toolLoaders(slug)).toBeNull();
  });

  it('a valid slug that is not in the map is null rather than a broken import', () => {
    expect(toolLoaders('tool-999-does-not-exist')).toBeNull();
  });
});

describe('G-08 — preloadTools is inert for unknown slugs', () => {
  it('does not throw for a mix of valid, helper and malformed slugs', () => {
    expect(() =>
      preloadTools([
        'tool-036-injection-schedule',
        'tool-036-accumulation-chart',
        '../secrets',
        '',
      ]),
    ).not.toThrow();
  });
});
