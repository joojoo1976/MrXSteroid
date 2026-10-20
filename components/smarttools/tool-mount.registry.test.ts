/**
 * components/smarttools/tool-mount.registry.test.ts
 * ───────────────────────────────────────────────────────────────────────────
 * Regression guard for the per-tool lazy-loading architecture (Tool-036
 * performance work). The catch-all route `/smarttools/[category]/[tool]` used
 * to render `await getToolComponent(slug)` from a Server Component, which made
 * React's RSC client-reference collector pull EVERY 'use client' module
 * reachable through `lib/tools/loaders.ts` into the route's client chunk
 * (measured: 420 kB First Load JS carrying all 110 tool components).
 *
 * The fix moves the 110 `next/dynamic` declarations at module scope into a
 * client boundary that the route renders, and the route no longer imports the
 * loader. Webpack then emits one async chunk per tool.
 *
 * These assertions are deliberately source-level: they encode the shape that
 * makes webpack split (literal import paths, module-scope registry, client
 * boundary), so a future edit that reintroduces the eager graph fails here
 * before it can regress the bundle.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const MOUNT_PATH = join(ROOT, 'components/smarttools/ToolMount.tsx');
const LOADERS_PATH = join(ROOT, 'lib/tools/loaders.ts');

const mountSrc = readFileSync(MOUNT_PATH, 'utf8');
const loaderSrc = readFileSync(LOADERS_PATH, 'utf8');

/** Slugs declared in the authoritative loader map. */
function loaderSlugs(): string[] {
  return [...loaderSrc.matchAll(/'([a-z0-9-]+)':\s*\(\)\s*=>\s*import\('@\/components\/tools\/([a-z0-9-]+)'\)/g)].map(
    (m) => m[1]
  );
}

/** Registry keys declared in ToolMount. */
function mountSlugs(): string[] {
  return [...mountSrc.matchAll(/'([a-z0-9-]+)':\s*dynamic\(/g)].map((m) => m[1]);
}

describe('ToolMount registry', () => {
  it('is a client component', () => {
    expect(mountSrc.startsWith("'use client';")).toBe(true);
  });

  it('declares the registry at module scope (not inside the component)', () => {
    const componentIdx = mountSrc.indexOf('export default function ToolMount');
    const registryIdx = mountSrc.search(/const TOOL_COMPONENTS\s*(?::[^=]+)?=\s*\{/);
    expect(registryIdx).toBeGreaterThan(-1);
    expect(componentIdx).toBeGreaterThan(-1);
    // registry must be declared BEFORE the component function
    expect(registryIdx).toBeLessThan(componentIdx);
  });

  it('has exactly one entry per published loader slug', () => {
    const loader = loaderSlugs().sort();
    const mount = mountSlugs().sort();
    expect(loader.length).toBe(110);
    expect(mount).toEqual(loader);
  });

  it('uses next/dynamic for every entry (no static component imports)', () => {
    const dynamicCount = (mountSrc.match(/:\s*dynamic\(\(\)\s*=>\s*import\(/g) || []).length;
    expect(dynamicCount).toBe(110);
    // no bare `import X from '@/components/tools/...'` static imports of tools
    const staticToolImports = mountSrc.match(/^import\s+[A-Za-z0-9_$]+\s+from\s+'@\/components\/tools\//gm) || [];
    expect(staticToolImports).toHaveLength(0);
  });

  it('uses literal import paths only (no template strings, no computed paths)', () => {
    // every import() call site must contain a quoted literal
    const importCalls = mountSrc.match(/import\([^)]*\)/g) || [];
    expect(importCalls.length).toBe(110);
    for (const call of importCalls) {
      expect(call).toMatch(/^import\('@\/components\/tools\/[a-z0-9-]+'\)$/);
    }
    // strip comments, then assert no template-string / computed import machinery
    const code = mountSrc
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '');
    expect(code).not.toContain('${');
    expect(code).not.toContain('`');
  });

  it('resolves exactly one component at runtime and renders it', () => {
    expect(mountSrc).toMatch(/TOOL_COMPONENTS\[slug\]/);
    expect(mountSrc).toMatch(/return\s*<Component/);
  });

  it('has a loading skeleton and a defensive missing-slug branch', () => {
    expect(mountSrc).toContain('tool-mount-skeleton');
    expect(mountSrc).toContain('tool-mount-missing');
  });
});

describe('catch-all page no longer imports the loader', () => {
  const pageSrc = readFileSync(join(ROOT, 'app/smarttools/[category]/[tool]/page.tsx'), 'utf8');

  it('does not import getToolComponent from the loader map', () => {
    expect(pageSrc).not.toContain('getToolComponent');
    expect(pageSrc).not.toMatch(/from\s+'@\/lib\/tools\/loaders'/);
  });

  it('renders the client ToolMount with the entry slug', () => {
    expect(pageSrc).toContain("import ToolMount from '@/components/smarttools/ToolMount'");
    expect(pageSrc).toMatch(/<ToolMount\s+slug=\{entry\.slug\}\s*\/>/);
  });
});
