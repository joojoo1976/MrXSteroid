/**
 * lib/tools/r6/manifest.ts
 * R6.1 bulk shell manifest — server-side only.
 *
 * The manifest is derived from the published catalog, so adding a tool to the
 * catalog automatically gives it the R6.1 shell. It never writes to the DB and
 * never calls an engine.
 */
import { getPublishedCatalogTools } from '@/lib/tools/smartToolsCatalog4';
import { getCategoryOfSlug } from '@/lib/tools/categories';
import { getToolNeighbors } from '@/lib/tools/registry';

export interface R6ManifestEntry {
  slug: string;
  href: string;
  index: number;
  total: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  categorySlug: string;
  prevSlug: string | null;
  nextSlug: string | null;
  prevTitleEn: string | null;
  prevTitleAr: string | null;
  nextTitleEn: string | null;
  nextTitleAr: string | null;
  hasOwnBoxes: boolean;
}

/**
 * Tools that already render their own R6.1 boxes/badge/tooltips.
 * Their UI is frozen by owner decision (routing-fix-only scope); the route
 * still shows the shared progress line, but the shell does not duplicate
 * boxes or badges.
 */
export const R6_EXEMPT_SLUGS = new Set<string>([
  'tool-111-smart-food-macro-substitution',
  'tool-132-ai-pose-form-coach',
  'tool-137-peptide-hormone-reconstitution-calculator',
  'tool-138-raw-powder-density-oil-formulation-engine',
  'tool-139-solvent-emulsifier-ratio-calculator',
  // Tool 039 renders its own GENIUS-12 boxes: every box carries engine-derived
  // content or an explicit NOT_APPLICABLE / NOT_AVAILABLE reason, and the
  // generic shell boxes would otherwise duplicate it with weaker wording.
  'tool-039-liver-enzyme-tracker',
  'tool-040-lipid-profile-optimizer',
  'tool-041-hematocrit-monitor',
  'tool-042-estrogen-management',
  'tool-045-cycle-break-planner',
  'tool-046-trt-lifetime',
  'tool-047-fertility-preservation',
  'tool-048-cardiovascular-risk',
  'tool-049-bone-density',
  'tool-050-mental-health',
  'tool-051-peptide-dosage-calculator',
]);

let cache: { bySlug: Map<string, R6ManifestEntry>; total: number } | null = null;

function buildCache() {
  if (cache) return cache;

  const tools = getPublishedCatalogTools();
  const total = tools.length;
  const bySlug = new Map<string, R6ManifestEntry>();

  tools.forEach((tool, position) => {
    // Progress is the tool's 1-based position in the published catalog, not
    // the number embedded in its slug: catalog order is curated and some
    // numbers repeat/gap, so only the position can reach 268/268.
    const index = position + 1;

    let prevSlug: string | null = null;
    let nextSlug: string | null = null;
    let prevTitleEn: string | null = null;
    let prevTitleAr: string | null = null;
    let nextTitleEn: string | null = null;
    let nextTitleAr: string | null = null;

    try {
      const neighbours = getToolNeighbors(tool.slug);
      prevSlug = neighbours.prevTool.slug;
      nextSlug = neighbours.nextTool.slug;
      prevTitleEn = neighbours.prevTool.titleEn;
      prevTitleAr = neighbours.prevTool.titleAr;
      nextTitleEn = neighbours.nextTool.titleEn;
      nextTitleAr = neighbours.nextTool.titleAr;
    } catch {
      // Registry and catalog can drift during a rollout. Fall back to the
      // catalog's own order so the shell never breaks a route.
      const prev = tools[(position - 1 + tools.length) % tools.length];
      const next = tools[(position + 1) % tools.length];
      prevSlug = prev?.slug ?? null;
      nextSlug = next?.slug ?? null;
      prevTitleEn = prev?.titleEn ?? null;
      prevTitleAr = prev?.titleAr ?? null;
      nextTitleEn = next?.titleEn ?? null;
      nextTitleAr = next?.titleAr ?? null;
    }

    const category = getCategoryOfSlug(tool.slug);

    bySlug.set(tool.slug, {
      slug: tool.slug,
      href: tool.href,
      index,
      total,
      titleEn: tool.titleEn,
      titleAr: tool.titleAr,
      descriptionEn: tool.descriptionEn,
      descriptionAr: tool.descriptionAr,
      categorySlug: category ?? 'smarttools',
      prevSlug,
      nextSlug,
      prevTitleEn,
      prevTitleAr,
      nextTitleEn,
      nextTitleAr,
      hasOwnBoxes: R6_EXEMPT_SLUGS.has(tool.slug),
    });
  });

  cache = { bySlug, total };
  return cache;
}

export function getR6ManifestEntry(slug: string): R6ManifestEntry | null {
  return buildCache().bySlug.get(slug) ?? null;
}

export function getR6Total(): number {
  return buildCache().total;
}

/** Test-only escape hatch; production callers use the cached functions. */
export function __resetR6ManifestCacheForTests(): void {
  cache = null;
}
