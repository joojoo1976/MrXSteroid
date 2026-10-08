/**
 * lib/tools/validation.ts
 * Vérifications statiques et de liaison pour la plateforme SmartTools.
 * Exécutée par scripts/validate-tools.ts (npm run validate-tools).
 *
 * Règle forte conservée : les 30 outils déjà réalisés (#1-#30) ne sont ni
 * supprimés, ni fusionnés, ni recadrés : leurs moteurs/schemas/composants et
 * leur route plate (/smarttools/<slug>) restent sur le disque, et leur url
 * plate devient une 301 (permanent) vers le canonique hiérarchique
 * /smarttools/<category>/<tool> (SPEC §1.4). L'identité mrx.tool.<slug> est
 * inchangée. Aucune fonctionnalité unique n'est supprimée.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Racine résolue de la REPO (process.cwd) : compatible Node script ET vitest
// (sous vitest, import.meta.url pointe vers un fichier temp, ce qui briserait
// la résolution des chemins de diagnostic).
const ROOT = process.cwd();

// -- helpers de résolution de chemins (diagnostics seul) --------------------
function toFsPath(p: string): string {
  const normalized = p.startsWith('@/') ? p.slice(2) : p;
  const suffix = normalized.startsWith('components/') ? '.tsx' : (p.endsWith('.ts') ? '' : '.ts');
  return join(ROOT, normalized + suffix);
}
const exists = (p: string): boolean => existsSync(toFsPath(p));

// -- imports depuis le catalogue
import { getCatalogTools } from './smartToolsCatalog4';
import { TOOL_REGISTRY } from './registry';
import { toHierarchicalHref } from './categories';

export type ValidationResult = {
  ok: boolean;
  errors: string[];
  lines: string[];
  entries: Array<{
    toolId: string;
    slug: string;
    href: string;
    order: number;
    componentPath: string;
    enginePath: string;
    schemaPath: string;
    size: 'ok' | 'missing';
  }>;
};

export function validateCatalogGate(): { ok: boolean; errors: string[] } {
  const res = runValidation();
  return { ok: res.ok, errors: res.errors };
}

export function runValidation(): ValidationResult {
  const errors: string[] = [];
  const lines: string[] = [];
  const entries: ValidationResult['entries'] = [];
  const seenSlug = new Set<string>();
  const seenHref = new Set<string>();
  const seenOrder = new Set<number>();
  const seenLegacy = new Set<string>();
  const smarttoolsSlugs = new Set<string>();

  const cat = getCatalogTools();

  const toSlug = (href: string): string => href.replace(/^\/smarttools\//, '').replace(/^\//, '');

  for (const t of cat) {
    smarttoolsSlugs.add(t.slug);
    const component = exists(t.componentPath) ? 'ok' : 'missing';
    const engine = exists(t.enginePath) ? 'ok' : 'missing';
    const schema = exists(t.schemaPath) ? 'ok' : 'missing';

    if (component === 'missing') errors.push('component manquant: ' + t.toolId + ' (' + t.componentPath + ')');
    if (engine === 'missing') errors.push('engine manquant: ' + t.toolId + ' (' + t.enginePath + ')');
    if (schema === 'missing') errors.push('schema manquant: ' + t.toolId + ' (' + t.schemaPath + ')');

    if (!t.titleAr || !t.titleEn) errors.push('titres manquants: ' + t.toolId);
    if (!['free', 'premium'].includes(t.accessTier)) errors.push('tier invalide: ' + t.toolId);

    if (t.slug !== toSlug(t.href)) {
      errors.push('slug != href: ' + t.toolId + ' (slug=' + t.slug + ', href=' + t.href + ')');
    }
    if (seenSlug.has(t.slug)) errors.push('slug dupliqué: ' + t.slug);
    seenSlug.add(t.slug);
    if (seenHref.has(t.href)) errors.push('href dupliqué: ' + t.href);
    seenHref.add(t.href);
    if (seenOrder.has(t.order)) errors.push('order dupliquée: ' + t.order);
    seenOrder.add(t.order);

    entries.push({
      toolId: t.toolId, slug: t.slug, href: t.href, order: t.order,
      componentPath: t.componentPath, enginePath: t.enginePath, schemaPath: t.schemaPath,
      size: component === 'ok' && engine === 'ok' && schema === 'ok' ? 'ok' : 'missing',
    });
  }

  // registry legacy
  for (const tool of TOOL_REGISTRY) {
    const legacy = toSlug(tool.href);
    if (seenLegacy.has(legacy)) errors.push('route legacy dupliquée: /' + legacy);
    seenLegacy.add(legacy);

    if (!tool.titleAr || !tool.titleEn) errors.push('title manquant dans registry: ' + tool.toolId);
    if (!['free', 'premium'].includes(tool.accessTier)) errors.push('tier invalide registry: ' + tool.toolId);

    if (tool.stackStatus === 'layered' && smarttoolsSlugs.has(tool.slug)) {
      const expected = toHierarchicalHref(tool.slug);
      if (!expected) {
        errors.push('redirect manquant (categorie): ' + tool.toolId);
      } else {
        lines.push('redirect 301: ' + tool.href + ' -> ' + expected);
      }
    }
  }

  const directSlugs = new Set<string>();
  for (const t of cat) {
    if (t.href.startsWith('/smarttools/') && !t.href.includes('/')) {
      if (directSlugs.has(t.href)) errors.push('route directe dupliquée: ' + t.href);
      directSlugs.add(t.href);
    }
  }

  lines.push('Catalogue: ' + cat.length + ' outils');
  lines.push('Registry : ' + TOOL_REGISTRY.length + ' entrées');
  lines.push('Filesystem verifié: ' + entries.filter((e) => e.size === 'ok').length + '/' + cat.length);
  lines.push('Erreurs: ' + errors.length);

  return { ok: errors.length === 0, errors, lines, entries };
}
