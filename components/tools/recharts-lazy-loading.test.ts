// components/tools/recharts-lazy-loading.test.ts
// ═══════════════════════════════════════════════════════════════════════════
//  G-08 (second half) — `recharts` must never be a *static* import of a tool
//  component that is served by the SmartTools catch-all route
//  `/smarttools/[category]/[tool]`.
//
//  Why: that single route server-resolves any published tool, so Next folds
//  every statically-reachable client component (and its whole dependency
//  graph) into the route. Any tool that imports `recharts` at module scope
//  therefore ships `recharts` in the FIRST LOAD of *every* other tool —
//  including Tool-036, whose own chart is already lazy.
//
//  The fix mirrors the pattern Tool-036 already uses: the chart subtree lives
//  in its own module and is mounted through
//  `next/dynamic(() => import('./X-chart'), { ssr: false })`, so `recharts`
//  becomes a real async chunk fetched only when the chart is shown.
// ═══════════════════════════════════════════════════════════════════════════
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const COMPONENTS_DIR = path.join(process.cwd(), 'components/tools');

/** tool component -> the lazy chart module it must mount */
const LAZY_CHART_TOOLS: ReadonlyArray<readonly [tool: string, chartModule: string]> = [
    ['hpta-recovery', './hpta-recovery-chart'],
    ['aromatization-risk', './aromatization-risk-chart'],
    ['pct-timing', './pct-timing-chart'],
    ['multi-ester-pharmacokinetics', './multi-ester-pharmacokinetics-chart'],
    // Reference implementation — Tool-036 already does this correctly.
    ['tool-036-injection-schedule', './tool-036-accumulation-chart'],
];

function readTool(tool: string): string {
    const raw = readFileSync(path.join(COMPONENTS_DIR, tool + '.tsx'), 'utf8');
    // Strip comments so header notes may legitimately *mention* Recharts.
    return raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

describe('G-08 — tool components must not statically import recharts', () => {
    it.each(LAZY_CHART_TOOLS.map(([t]) => t))(
        '%s.tsx has no module-scope `from \'recharts\'` import',
        (tool) => {
            expect(readTool(tool)).not.toMatch(/from\s+['"]recharts['"]/);
        },
    );

    it.each(LAZY_CHART_TOOLS.map(([t]) => t))(
        '%s.tsx loads its chart through next/dynamic (ssr: false)',
        (tool) => {
            const src = readTool(tool);
            expect(src).toMatch(/import\s+dynamic\s+from\s+['"]next\/dynamic['"]/);
            expect(src).toMatch(/dynamic\(\s*\(\)\s*=>\s*import\(/);
            expect(src).toMatch(/ssr:\s*false/);
        },
    );

    it.each(LAZY_CHART_TOOLS)(
        '%s.tsx mounts the lazy chart with the declared module path %s',
        (tool, chartModule) => {
            const src = readTool(tool);
            const escaped = chartModule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            expect(src).toMatch(new RegExp('import\\(\\s*[\'"]' + escaped + '[\'"]\\s*\\)'));
        },
    );
});

describe('G-08 — the extracted chart modules own the recharts dependency', () => {
    it.each(LAZY_CHART_TOOLS.map(([t, c]) => [t, c] as const))(
        '%s-chart module exists, imports recharts and default-exports',
        (tool, chartModule) => {
            const file = path.join(COMPONENTS_DIR, chartModule.replace(/^\.\//, '') + '.tsx');
            expect(existsSync(file), 'missing chart module: ' + file).toBe(true);
            const src = readFileSync(file, 'utf8');
            expect(src).toMatch(/from\s+['"]recharts['"]/);
            expect(src).toMatch(/export\s+default\s+function/);
            // It is a client component (mounted by next/dynamic inside a client parent).
            expect(src.trimStart()).toMatch(/^['"]use client['"]/);
        },
    );

    it('the chart modules are NOT reachable from the SmartTools loader map', () => {
        const raw = readFileSync(path.join(process.cwd(), 'lib/tools/loaders.ts'), 'utf8');
        // Strip comments: the audit note in loaders.ts legitimately *names* the
        // helper it used to drag in; only real map entries count.
        const loaders = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
        for (const [, chartModule] of LAZY_CHART_TOOLS) {
            const name = chartModule.replace(/^\.\//, '');
            expect(loaders).not.toContain(name);
        }
    });
});
