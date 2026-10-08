/**
 * lib/tools/loaders.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Chargement paresseux (code-splitting) des composants SmartTools par slug.
 *  Baseée sur le catalogue : ajouter un outil #31-#150 dans le catalogue suffit,
 *  aucun maintenue de map ici (webpack context résout le module par slug).
 *
 *  Compatible avec `next/dynamic` (accepte () => import(...)) côté pages,
 *  et avec `await loader()` côté serveur.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type ToolComponentModule = {
  default: React.ComponentType<Record<string, never>>;
};

/** Slug guard — prevents arbitrary path traversal through the webpack context. */
const SLUG_RE = /^[a-z0-9-]+$/;

/**
 * Returns a lazy loader for the given tool slug, or null when the slug is
 * invalid. Each call resolves to `{ default: Component }`.
 */
export function toolLoaders(slug: string): (() => Promise<ToolComponentModule>) | null {
  if (!SLUG_RE.test(slug)) return null;
  return () => import(`@/components/tools/${slug}`) as Promise<ToolComponentModule>;
}

/**
 * Resolves the React component for a slug (or null when unknown/invalid).
 * Awaits the underlying chunk, then returns the default export.
 */
export async function getToolComponent(
  slug: string
): Promise<React.ComponentType<Record<string, never>> | null> {
  const loader = toolLoaders(slug);
  if (!loader) return null;
  try {
    const mod = await loader();
    return mod?.default ?? null;
  } catch {
    return null;
  }
}

/** Warm-up: triggers the chunk download for the given slugs (no await). */
export function preloadTools(slugs: readonly string[]): void {
  for (const slug of slugs) {
    try {
      toolLoaders(slug)?.();
    } catch {
      // Preload is best-effort — never break navigation on a missing chunk.
    }
  }
}
