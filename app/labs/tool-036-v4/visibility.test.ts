/**
 * Tool-036 V4 — preview invisibility tests (decision R1).
 *
 * The preview must not appear in the catalog, the sitemap, or search:
 *  1. the route layout declares noindex;
 *  2. the registry-driven SmartTools sitemap cannot emit /labs URLs;
 *  3. the published static sitemap does not list the preview;
 *  4. the tool catalog registry does not know this route exists.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { labsMetadata } from './metadata';

const ROOT = process.cwd();

describe('V4 preview invisibility (R1)', () => {
  it('the route layout declares noindex, nofollow', () => {
    expect(labsMetadata.robots).toEqual({ index: false, follow: false });
  });

  it('the SmartTools sitemap source cannot emit /labs URLs', () => {
    const src = readFileSync(path.join(ROOT, 'app/smarttools/sitemap.ts'), 'utf8');
    expect(src).not.toContain('labs');
    expect(src).not.toContain('tool-036-v4');
  });

  it('the published static sitemap does not list the preview', () => {
    const xml = readFileSync(path.join(ROOT, 'public/sitemap.xml'), 'utf8');
    expect(xml).not.toContain('tool-036-v4');
    expect(xml).not.toContain('/labs/');
  });

  it('the tool catalog registry does not reference the preview route', () => {
    const registry = readFileSync(path.join(ROOT, 'lib/tools/categories.ts'), 'utf8');
    expect(registry).not.toContain('tool-036-v4');
    expect(registry).not.toContain('/labs/');
  });
});
