/**
 * lib/tools/registry.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Canonical tool registry — single source of truth for the prev/next
 *  link-graph (SEO §7), access tiers, canonical routes and tool identity.
 * ═══════════════════════════════════════════════════════════════════════════
 * PURE MODULE — no React, no DOM, no I/O.
 *
 * `href` values are the REAL App Router folders under `app/` (validated by
 * `lib/tools/registry.test.ts`, which asserts each folder + page.tsx exists),
 * while `shared/config/menuConfig.ts` stays the navigation/presentation layer.
 */
import { Page } from '@/shared/types/types';
import {
    ACCESS_TIERS,
    ToolContractError,
    createToolOutput,
    type AccessTier,
    type SeoLinks,
    type ToolLink,
    type ToolOutput,
    type ToolOutputParams,
} from './contracts';

/** Migration status of a tool against the 5-layer architecture. */
export type StackStatus = 'legacy' | 'layered';

export interface ToolDefinition {
    /**
     * Stable identity, namespaced and version-less: `mrx.tool.<slug>`.
     * Never changes, even if the route slug is later aliased.
     */
    toolId: string;
    /** Canonical route slug (`/macro` → `macro`). */
    slug: string;
    /** Engine/persistence version stamped into `public.user_tool_logs`. */
    version: string;
    /** Legacy `Page` enum value — used by `navigateTo` in legacy components. */
    page: Page;
    /** Canonical App Router href (no locale prefix; middleware rewrites /ar,/en). */
    href: string;
    titleAr: string;
    titleEn: string;
    accessTier: AccessTier;
    /** Explicit chain order for prev/next interlinking (gaps allowed = 10,20,…). */
    order: number;
    /** `layered` once the tool is fully wired through engines/schemas/adapters. */
    stackStatus: StackStatus;
}

/**
 * Registry chain order mirrors the existing product information architecture:
 * the 7 Smart Tools first, then the premium resources, then the hub page.
 */
export const TOOL_REGISTRY: readonly ToolDefinition[] = [
    {
        toolId: 'mrx.tool.macro',
        slug: 'macro',
        version: '1.0.0',
        page: Page.MACRO,
        href: '/macro',
        titleAr: 'حاسبة الماكروز المتقدمة',
        titleEn: 'Advanced Macro Calculator',
        accessTier: 'free',
        order: 10,
        stackStatus: 'legacy',
    },
    {
        toolId: 'mrx.tool.bodyfat',
        slug: 'bodyfat',
        version: '1.0.0',
        page: Page.BODYFAT,
        href: '/bodyfat',
        titleAr: 'حاسبة نسبة الدهون',
        titleEn: 'Body Fat Calculator',
        accessTier: 'free',
        order: 20,
        stackStatus: 'legacy',
    },
    {
        toolId: 'mrx.tool.injection',
        slug: 'injection',
        version: '1.0.0',
        page: Page.INJECTION,
        href: '/injection',
        titleAr: 'خريطة الحقن التفاعلية',
        titleEn: 'Interactive Injection Map',
        accessTier: 'free',
        order: 30,
        stackStatus: 'legacy',
    },
    {
        toolId: 'mrx.tool.halflife',
        slug: 'halflife',
        version: '1.0.0',
        page: Page.HALFLIFE,
        href: '/halflife',
        titleAr: 'محاكي نصف العمر',
        titleEn: 'Half-Life Simulator',
        accessTier: 'free',
        order: 40,
        stackStatus: 'legacy',
    },
    {
        toolId: 'mrx.tool.multi-ester-pharmacokinetics',
        slug: 'multi-ester-pharmacokinetics',
        version: '1.0.0',
        page: Page.HALFLIFE, // legacy nav fallback: closest existing Page enum member
        href: '/smarttools/multi-ester-pharmacokinetics',
        titleAr: 'محاكي تراكم الإسترات (PharmaSim™)',
        titleEn: 'Multi-Ester PK Simulator (PharmaSim™)',
        accessTier: 'premium',
        order: 45,
        stackStatus: 'layered',
    },
    {
        toolId: 'mrx.tool.lab',
        slug: 'lab',
        version: '1.0.0',
        page: Page.LAB,
        href: '/lab',
        titleAr: 'المرجع الذكي للتحاليل',
        titleEn: 'Smart Lab Reference',
        accessTier: 'free',
        order: 50,
        stackStatus: 'legacy',
    },
    {
        toolId: 'mrx.tool.genetic',
        slug: 'genetic',
        version: '1.0.0',
        page: Page.GENETIC,
        href: '/genetic',
        titleAr: 'حاسبة الإمكانات الوراثية',
        titleEn: 'Genetic Potential Calculator',
        accessTier: 'free',
        order: 60,
        stackStatus: 'legacy',
    },
    {
        toolId: 'mrx.tool.cycle',
        slug: 'cycle',
        version: '1.0.0',
        page: Page.CYCLE_ARCHITECT,
        href: '/cycle',
        titleAr: 'مهندس الدورة',
        titleEn: 'Cycle Architect',
        accessTier: 'premium',
        order: 70,
        stackStatus: 'legacy',
    },
    {
        toolId: 'mrx.tool.timeline',
        slug: 'timeline',
        version: '1.0.0',
        page: Page.TIMELINE,
        href: '/smarttools/timeline',
        titleAr: 'الجدول الزمني للتحول',
        titleEn: 'Transformation Timeline',
        accessTier: 'free',
        order: 80,
        stackStatus: 'layered',
    },
    {
        toolId: 'mrx.tool.master-calculator',
        slug: 'master-calculator',
        version: '1.0.0',
        page: Page.MASTER_CALCULATOR,
        href: '/master-calculator',
        titleAr: 'الحاسبة الشاملة',
        titleEn: 'Master Calculator',
        accessTier: 'free',
        order: 90,
        stackStatus: 'legacy',
    },
    {
        toolId: 'mrx.tool.aromatization-risk',
        slug: 'aromatization-risk',
        version: '1.0.0',
        page: Page.AROMATIZATION_RISK,
        href: '/smarttools/aromatization-risk',
        titleAr: 'محاكي مخاطر الأروماتزة والاستراديول',
        titleEn: 'Aromatization Risk & E2 Management Modeler',
        accessTier: 'free',
        order: 45.5, // between multi-ester PK (45) and HPTA recovery (46)
        stackStatus: 'layered',
    },
    {
        toolId: 'mrx.tool.hpta-recovery',
        slug: 'hpta-recovery',
        version: '1.0.0',
        page: Page.HPTA_RECOVERY,
        href: '/smarttools/hpta-recovery',
        titleAr: 'محاكي التثبيط المحوري واستعادة HPTA',
        titleEn: 'HPTA Suppression & Recovery Modeler',
        accessTier: 'free',
        order: 46,
        stackStatus: 'layered',
    },
    {
        toolId: 'mrx.tool.pct-timing',
        slug: 'pct-timing',
        version: '1.0.0',
        page: Page.PCT_TIMING,
        href: '/smarttools/pct-timing',
        titleAr: 'محرك توقيت PCT والتطهير',
        titleEn: 'PCT Timing & Compound Washout Engine',
        accessTier: 'free',
        order: 47,
        stackStatus: 'layered',
    },
];

export class ToolRegistryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ToolRegistryError';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Lookups
// ─────────────────────────────────────────────────────────────────────────────

/** `/ar/macro/` → `macro`. Locale prefixes and slashes are stripped. */
export function normalizeSlug(input: string | null | undefined): string | null {
    if (!input || typeof input !== 'string') return null;
    const stripped = input
        .trim()
        .replace(/^(?:\/(?:ar|en))?(?=\/|$)/i, '')
        .replace(/^\/+/, '')
        .replace(/\/+$/, '');
    if (!stripped) return null;
    return stripped.toLowerCase();
}

/** Registry in deterministic chain order (explicit `order`, never array index). */
export function orderedTools(): ToolDefinition[] {
    return [...TOOL_REGISTRY].sort((a, b) => a.order - b.order);
}

/** Fail-fast registry integrity check — executed on import and re-run in tests. */
export function validateRegistry(tools: readonly ToolDefinition[] = TOOL_REGISTRY): true {
    if (tools.length === 0) throw new ToolRegistryError('tool registry is empty');
    const seen = { toolId: new Set<string>(), slug: new Set<string>(), href: new Set<string>(), order: new Set<number>() };
    for (const t of tools) {
        if (t.toolId !== `mrx.tool.${t.slug}`) {
            throw new ToolRegistryError(`toolId "${t.toolId}" must equal "mrx.tool.${t.slug}"`);
        }
        if (!ACCESS_TIERS.includes(t.accessTier)) {
            throw new ToolRegistryError(`tool "${t.slug}" has invalid accessTier "${String(t.accessTier)}"`);
        }
        if (!/^\d+\.\d+\.\d+$/.test(t.version)) {
            throw new ToolRegistryError(`tool "${t.slug}" version "${t.version}" must be semver (x.y.z)`);
        }
        if (!t.href.startsWith('/') || t.href.length < 2) {
            throw new ToolRegistryError(`tool "${t.slug}" href "${t.href}" must be an absolute app path`);
        }
        if (!t.titleAr || !t.titleEn) {
            throw new ToolRegistryError(`tool "${t.slug}" requires both titleAr and titleEn`);
        }
        if (seen.toolId.has(t.toolId)) throw new ToolRegistryError(`duplicate toolId "${t.toolId}"`);
        if (seen.slug.has(t.slug)) throw new ToolRegistryError(`duplicate slug "${t.slug}"`);
        if (seen.href.has(t.href)) throw new ToolRegistryError(`duplicate href "${t.href}"`);
        if (seen.order.has(t.order)) throw new ToolRegistryError(`duplicate order ${t.order} (chain order must be unique)`);
        seen.toolId.add(t.toolId);
        seen.slug.add(t.slug);
        seen.href.add(t.href);
        seen.order.add(t.order);
    }
    return true;
}

// The registry is a compile-time constant — an invalid one must never boot.
validateRegistry();

/** Resolve by slug (`macro`) or by href (`/macro`, `/ar/macro/`, `/TransformationTimeline`). */
export function getTool(slugOrHref: string): ToolDefinition | null {
    const key = normalizeSlug(slugOrHref);
    if (!key) return null;
    return orderedTools().find((t) => t.slug === key || t.href.toLowerCase() === `/${key}`) ?? null;
}

/** Resolve from the legacy `Page` enum used across `features/calculator`. */
export function getToolByPage(page: Page): ToolDefinition | null {
    return orderedTools().find((t) => t.page === page) ?? null;
}

/** Resolve from a Next.js pathname (locale prefix + trailing slash tolerant). */
export function getToolByHref(href: string): ToolDefinition | null {
    return getTool(href);
}

/** Throwing variant for engine/adapter call sites where a typo must fail loud. */
export function requireTool(slugOrHref: string): ToolDefinition {
    const tool = getTool(slugOrHref);
    if (!tool) throw new ToolRegistryError(`unknown tool "${String(slugOrHref)}" — not present in TOOL_REGISTRY`);
    return tool;
}

export function getDefaultTool(): ToolDefinition {
    return orderedTools()[0];
}

export function getToolsByTier(tier: AccessTier): ToolDefinition[] {
    return orderedTools().filter((t) => t.accessTier === tier);
}

// ─────────────────────────────────────────────────────────────────────────────
// Prev/Next interlinking (SEO §7 — mandatory on every tool)
// ─────────────────────────────────────────────────────────────────────────────

export function toToolLink(tool: ToolDefinition): ToolLink {
    return { titleAr: tool.titleAr, titleEn: tool.titleEn, slug: tool.slug };
}

/**
 * Circular neighbour pair for the prev/next footer links.
 * The chain wraps around, so the FIRST tool always has a `prevTool` and the
 * LAST tool always has a `nextTool` — no tool can ever render a dead link.
 */
export function getToolNeighbors(slugOrHref: string): SeoLinks {
    const chain = orderedTools();
    const index = chain.findIndex((t) => t.slug === requireTool(slugOrHref).slug);
    const prevTool = chain[(index - 1 + chain.length) % chain.length];
    const nextTool = chain[(index + 1) % chain.length];
    return { prevTool: toToolLink(prevTool), nextTool: toToolLink(nextTool) };
}

export function buildSeoLinks(slugOrHref: string): SeoLinks {
    return getToolNeighbors(slugOrHref);
}

// ─────────────────────────────────────────────────────────────────────────────
// Contract wiring — the ergonomic entry point used by every tool engine
// ─────────────────────────────────────────────────────────────────────────────

export type RegistryToolOutputParams<T> = Omit<
    ToolOutputParams<T>,
    'toolId' | 'toolSlug' | 'accessTier' | 'seoLinks'
>;

/**
 * Builds the canonical `ToolOutput` for a registered tool: identity, access
 * tier and prev/next links are injected from the registry, so a tool author can
 * never emit an inconsistent envelope.
 */
export function buildToolOutput<T>(slugOrHref: string, params: RegistryToolOutputParams<T>): ToolOutput<T> {
    const tool = requireTool(slugOrHref);
    try {
        return createToolOutput<T>({
            ...params,
            toolId: tool.toolId,
            toolSlug: tool.slug,
            accessTier: tool.accessTier,
            seoLinks: getToolNeighbors(tool.slug),
        });
    } catch (error) {
        if (error instanceof ToolContractError) {
            throw new ToolRegistryError(`tool "${tool.slug}" produced an invalid ToolOutput: ${error.message}`);
        }
        throw error;
    }
}
