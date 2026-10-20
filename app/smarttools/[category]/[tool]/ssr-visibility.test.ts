/**
 * app/smarttools/[category]/[tool]/ssr-visibility.test.ts
 * ───────────────────────────────────────────────────────────────────────────
 * G-P10 regression guard — server-rendered tool visibility WITHOUT JavaScript.
 *
 * Background
 * ----------
 * `next/dynamic` wraps its target in a React Suspense boundary as soon as a
 * `loading` fallback is supplied:
 *
 *     // node_modules/next/dist/shared/lib/lazy-dynamic/loadable.js
 *     const hasSuspenseBoundary = !opts.ssr || !!opts.loading;
 *
 * `React.lazy` always suspends on the first server render, so that boundary made
 * React stream the server-rendered tool body into a hidden out-of-order container
 * (`<div hidden id="S:n">`) which only became visible once client JS hydrated.
 * With JavaScript disabled the tool body stayed invisible — the G-P10 regression
 * (measured: `data-testid="v3-shell"` inside `<div hidden id="S:1">`).
 *
 * Adding a route-level `loading.tsx` does NOT fix this: it puts the whole page
 * behind Suspense in the streamed payload and reproduces the same hidden
 * container (`S:2`, measured).
 *
 * The fix is therefore structural: every `next/dynamic` entry in ToolMount must
 * be a bare `dynamic(() => import('…'))` with NO options object, so
 * `hasSuspenseBoundary` stays false and the tool is server-rendered straight into
 * the visible document while webpack still emits one async chunk per tool.
 *
 * These assertions are source-level on purpose: they encode the shape that keeps
 * the SSR output visible, so a future edit reintroducing a `loading` fallback (or
 * a Suspense-forcing wrapper) fails here before it can ship.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const MOUNT_PATH = join(ROOT, 'components/smarttools/ToolMount.tsx');
const ROUTE_DIR = join(ROOT, 'app/smarttools/[category]/[tool]');
const mountSrc = readFileSync(MOUNT_PATH, 'utf8');

/** Source with comments stripped, so prose about `loading:` does not match. */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

describe('G-P10 — ToolMount cannot force a Suspense boundary', () => {
  it('declares no `loading` option on any dynamic entry', () => {
    expect(code(mountSrc)).not.toMatch(/loading\s*:/);
  });

  it('imports no fallback/skeleton component', () => {
    const c = code(mountSrc);
    expect(c).not.toContain('ToolSkeleton');
    expect(c).not.toContain('tool-mount-skeleton');
  });

  it('every entry is a bare literal dynamic import with no options object', () => {
    const entries = mountSrc.match(/:\s*dynamic\(\(\)\s*=>\s*import\('[^']+'\)\)/g) || [];
    expect(entries).toHaveLength(110);
  });

  it('does not wrap the tool in an explicit <Suspense>', () => {
    expect(code(mountSrc)).not.toMatch(/<Suspense[\s>]/);
  });
});

describe('G-P10 — no route-level loading.tsx on the catch-all tool route', () => {
  it('the catch-all tool route declares no loading.tsx', () => {
    // A route loading.tsx wraps the page in Suspense and re-hides the streamed
    // body (measured: the tool landed inside <div hidden id="S:2">).
    const entries = existsSync(ROUTE_DIR) ? readdirSync(ROUTE_DIR) : [];
    expect(entries).not.toContain('loading.tsx');
  });
});
