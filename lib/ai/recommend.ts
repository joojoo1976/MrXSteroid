/**
 * lib/ai/recommend.ts — grounded recommendations (SPEC §11, §19, §34, §35).
 * ═══════════════════════════════════════════════════════════════════════════
 *  Recommendations are always derived from the registry/catalogue, never
 *  invented. Implemented tools are preferred; planned tools are surfaced only
 *  as clearly-labelled "planned" entries and never linked as working tools.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { searchTools, type SearchResult } from '@/lib/tools/search';
import { expandQuery } from './nlp';

/** Recommend tools for a free-text query using bilingual expansion. */
export function recommendTools(query: string, limit = 5): SearchResult[] {
  const expanded = expandQuery(query);
  const direct = searchTools(query, limit);
  if (direct.length >= limit) return direct.slice(0, limit);
  const expandedHits = searchTools(expanded, limit * 2).filter(
    (r) => !direct.some((d) => d.slug === r.slug)
  );
  return [...direct, ...expandedHits].slice(0, limit);
}

/** Related tools: derive from the slug's own terms (grounded, never invented). */
export function relatedToolsFor(slug: string, limit = 4): SearchResult[] {
  return recommendTools(slug.replace(/-/g, ' '), limit).filter((r) => r.slug !== slug);
}
