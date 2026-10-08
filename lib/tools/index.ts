/**
 * lib/tools/index.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Registry centralisé de la plateforme SmartTools.
 *  Source unique de vérité agrégée pour les 30 outils terminés (#1-#30),
 *  leurs moteurs/schemas/composants et le lien de navigation.
 *  Conçue pour s'étendre à #31-#150 par simple ajout dans les paniers.
 * ═══════════════════════════════════════════════════════════════════════════
 *  Public :
 *    - getCatalogTools()      → tous les outils du catalogue (30)
 *    - validateCatalog()      → garde des identités uniques
 *    - TOOL_REGISTRY          → définition canonique (slug, tier, order, status)
 *    - toolLoaders            → loaders dynamiques (next/dynamic) par slug
 *    - searchTools()          → recherche bilingue AR/EN
 *    - routes                 → génération canonical + sitemap
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
//  1. Catalogue des outils terminés (sections + 30 outils)
// ─────────────────────────────────────────────────────────────────────────────
export { SMART_TOOLS_CATALOG } from './smartToolsCatalog';
export { SMART_TOOLS_CATALOG_2 } from './smartToolsCatalog2';
export { SMART_TOOLS_CATALOG_3 } from './smartToolsCatalog3';
export { SMART_TOOLS_CATALOG_4, validateCatalog, catalogAll, getCatalogTools } from './smartToolsCatalog4';
export { SMART_TOOLS_CATALOG_5 } from './smartToolsCatalog5';
export type { SmartToolEntry } from './smartToolsCatalog';

// ─────────────────────────────────────────────────────────────────────────────
//  2. Registry canonique (slug, tier, order, link-graph prev/next)
// ─────────────────────────────────────────────────────────────────────────────
export {
  TOOL_REGISTRY,
  getTool,
  getToolByPage,
  getToolByHref,
  requireTool,
  getDefaultTool,
  getToolsByTier,
  toToolLink,
  getToolNeighbors,
  buildSeoLinks,
  buildToolOutput,
} from './registry';
export type { ToolDefinition, StackStatus, ToolOutputParams } from './registry';

// ─────────────────────────────────────────────────────────────────────────────
//  3. Moteurs mathématiques / schémas (seuil pour les futurs outils)
// ─────────────────────────────────────────────────────────────────────────────
export * from './contracts';

// ─────────────────────────────────────────────────────────────────────────────
//  4. Loaders dynamiques (next/dynamic) — Phase 2 — outils #1-#30
// ─────────────────────────────────────────────────────────────────────────────
export { getToolComponent, preloadTools, toolLoaders } from './loaders';

// ─────────────────────────────────────────────────────────────────────────────
//  5. Recherche / navigation
// ─────────────────────────────────────────────────────────────────────────────
export { searchTools, type SearchResult } from './search';

// ─────────────────────────────────────────────────────────────────────────────
//  5b. Catégories hiérarchiques (SPEC §3.1) — /smarttools/[category]/[tool]
// ─────────────────────────────────────────────────────────────────────────────
export {
  SMART_TOOL_CATEGORY_SLUGS,
  SMART_TOOL_CATEGORIES,
  TOOL_CATEGORY,
  getCategory,
  isCategory,
  getCategoryOfSlug,
  getToolsByCategory,
  toHierarchicalHref,
} from './categories';
export type { SmartToolCategory, SmartToolCategoryDefinition } from './categories';

// ─────────────────────────────────────────────────────────────────────────────
//  6. Validation CLI (scripts/validate-tools.ts)
// ─────────────────────────────────────────────────────────────────────────────
export { runValidation } from './validation';
