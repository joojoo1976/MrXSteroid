/**
 * lib/tools/registry.test.ts
 * Registry integrity tests — the prev/next link-graph, slug/href resolution and
 * a live filesystem assertion that every registered route really exists under
 * `app/` (this is what keeps the SEO link-graph from rotting).
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Page } from '@/shared/types/types';
import {
    TOOL_REGISTRY,
    ToolRegistryError,
    buildSeoLinks,
    buildToolOutput,
    getDefaultTool,
    getTool,
    getToolByHref,
    getToolByPage,
    getToolNeighbors,
    getToolsByTier,
    normalizeSlug,
    orderedTools,
    requireTool,
    toToolLink,
    validateRegistry,
} from './registry';
import type { DataProvenance } from './contracts';

const APP_DIR = join(process.cwd(), 'app');

const provenance: DataProvenance = {
    source: 'manual',
    recordedAt: '2026-09-21T10:00:00.000Z',
    timezone: 'Africa/Cairo',
    unit: 'kg',
    confidence: 0.95,
    dataQuality: 'high',
};

describe('Tool registry — integrity', () => {
    it('passes its own validation gate', () => {
        expect(validateRegistry()).toBe(true);
        expect(TOOL_REGISTRY.length).toBeGreaterThan(0);
    });

    it('has unique toolIds, slugs, hrefs and chain orders', () => {
        const slugs = TOOL_REGISTRY.map((t) => t.slug);
        const hrefs = TOOL_REGISTRY.map((t) => t.href);
        const orders = TOOL_REGISTRY.map((t) => t.order);
        const toolIds = TOOL_REGISTRY.map((t) => t.toolId);

        expect(new Set(slugs).size).toBe(slugs.length);
        expect(new Set(hrefs).size).toBe(hrefs.length);
        expect(new Set(orders).size).toBe(orders.length);
        expect(new Set(toolIds).size).toBe(toolIds.length);
    });

    it('uses the mrx.tool.<slug> identity convention and semver versions', () => {
        for (const tool of TOOL_REGISTRY) {
            expect(tool.toolId).toBe(`mrx.tool.${tool.slug}`);
            expect(tool.version).toMatch(/^\d+\.\d+\.\d+$/);
            expect(tool.titleAr.length).toBeGreaterThan(0);
            expect(tool.titleEn.length).toBeGreaterThan(0);
        }
    });

    it('points every registered href at a real App Router page folder', () => {
        for (const tool of TOOL_REGISTRY) {
            const segment = tool.href.replace(/^\//, '');
            const pageFile = join(APP_DIR, segment, 'page.tsx');
            expect(existsSync(pageFile), `missing route for ${tool.slug}: app/${segment}/page.tsx`).toBe(true);
        }
    });

    it('only registers hrefs whose first segment exists as a literal folder', () => {
        const folders = new Set(readdirSync(APP_DIR, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name));
        for (const tool of TOOL_REGISTRY) {
            const first = tool.href.replace(/^\//, '').split('/')[0];
            expect(folders.has(first), `no app/ folder for ${tool.href}`).toBe(true);
        }
    });

    it('rejects a corrupted registry (duplicate slug / order)', () => {
        const [first] = TOOL_REGISTRY;
        expect(() => validateRegistry([...TOOL_REGISTRY, { ...first }]))
            .toThrowError(ToolRegistryError);
    });
});

describe('Tool registry — resolution', () => {
    it('normalizes locale prefixes, slashes and casing', () => {
        expect(normalizeSlug('/ar/macro/')).toBe('macro');
        expect(normalizeSlug('/en/bodyfat')).toBe('bodyfat');
        expect(normalizeSlug('MACRO')).toBe('macro');
        expect(normalizeSlug('   ')).toBeNull();
        expect(normalizeSlug(null)).toBeNull();
    });

    it('resolves by slug, by href, by locale-prefixed path and by Page enum', () => {
        expect(getTool('macro')?.slug).toBe('macro');
        expect(getTool('/macro')?.slug).toBe('macro');
        expect(getTool('/ar/halflife/')?.slug).toBe('halflife');
        expect(getTool('/TransformationTimeline')?.slug).toBe('timeline');
        expect(getToolByHref('/lab')?.slug).toBe('lab');
        expect(getToolByPage(Page.GENETIC)?.slug).toBe('genetic');
        expect(getTool('does-not-exist')).toBeNull();
    });

    it('throws for unknown tools at engine call sites and returns a default', () => {
        expect(() => requireTool('nope')).toThrowError(ToolRegistryError);
        expect(getDefaultTool().slug).toBe(orderedTools()[0].slug);
    });
});

describe('Tool registry — prev/next link-graph (SEO §7)', () => {
    it('returns the circular neighbour pair for a middle tool', () => {
        const links = getToolNeighbors('multi-ester-pharmacokinetics');
        expect(links.prevTool.slug).toBe('halflife');
        // order 46 — HPTA Recovery sits between PharmaSim™ (45) and Lab (50).
        expect(links.nextTool.slug).toBe('hpta-recovery');
        expect(links.nextTool.titleAr).toBe('محاكي التثبيط المحوري واستعادة HPTA');
        expect(links.nextTool.titleEn).toBe('HPTA Suppression & Recovery Modeler');
    });

    it('wraps around at both ends so no link is ever dead', () => {
        const chain = orderedTools();
        const first = getToolNeighbors(chain[0].slug);
        const last = getToolNeighbors(chain[chain.length - 1].slug);

        expect(first.prevTool.slug).toBe(chain[chain.length - 1].slug);
        expect(first.nextTool.slug).toBe(chain[1].slug);
        expect(last.nextTool.slug).toBe(chain[0].slug);
    });

    it('accepts an href and matches the slug-based pair', () => {
        expect(buildSeoLinks('/macro')).toEqual(getToolNeighbors('macro'));
        expect(toToolLink(requireTool('cycle'))).toEqual({
            titleAr: 'مهندس الدورة',
            titleEn: 'Cycle Architect',
            slug: 'cycle',
        });
    });

    it('throws for an unregistered tool instead of emitting a broken link', () => {
        expect(() => getToolNeighbors('ghost-tool')).toThrowError(ToolRegistryError);
    });
});

describe('Tool registry — contract wiring', () => {
    it('injects identity, tier and seoLinks into a ToolOutput', () => {
        const output = buildToolOutput('macro', {
            calculatedAt: '2026-09-21T10:00:00.000Z',
            locale: 'ar',
            unitSystem: 'metric',
            snapshotType: 'draft',
            result: { tdee: 2600 },
            provenance,
            keyFindings: [],
        });

        expect(output.toolId).toBe('mrx.tool.macro');
        expect(output.toolSlug).toBe('macro');
        expect(output.accessTier).toBe('free');
        expect(output.seoLinks.nextTool.slug).toBe('bodyfat');
        expect(output.result).toEqual({ tdee: 2600 });
    });

    it('marks premium tools as premium', () => {
        const output = buildToolOutput('cycle', {
            calculatedAt: '2026-09-21T10:00:00.000Z',
            locale: 'en',
            unitSystem: 'imperial',
            snapshotType: 'dashboard_projection',
            result: { weeks: 12 },
            provenance,
            keyFindings: [],
        });
        expect(output.accessTier).toBe('premium');
        expect(getToolsByTier('premium').map((t) => t.slug)).toContain('cycle');
    });

    it('rejects an unregistered slug and surfaces contract violations as registry errors', () => {
        expect(() => buildToolOutput('ghost-tool', {
            calculatedAt: '2026-09-21T10:00:00.000Z',
            locale: 'ar',
            unitSystem: 'metric',
            snapshotType: 'draft',
            result: {},
            provenance,
            keyFindings: [],
        })).toThrowError(ToolRegistryError);

        expect(() => buildToolOutput('macro', {
            calculatedAt: 'not-a-date',
            locale: 'ar',
            unitSystem: 'metric',
            snapshotType: 'draft',
            result: {},
            provenance,
            keyFindings: [],
        })).toThrow(/produced an invalid ToolOutput/);
    });
});
