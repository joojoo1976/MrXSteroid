/**
 * lib/tools/search.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Recherche bilingue AR/EN sur le catalogue SmartTools (30 outils).
 *  Insensible à la casse et aux diacritiques arabes (fatha/damma/kasra…).
 *  Extensible #31-#150 : lit uniquement le catalogue.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { getCatalogTools } from './smartToolsCatalog4';
import type { SmartToolEntry } from './smartToolsCatalog';

export type SearchResult = {
  toolId: string;
  slug: string;
  href: string;
  order: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  accessTier: 'free' | 'premium';
  score: number;
};

/** Lowercase + strip Arabic diacritics/tatweel + trim. */
function normalize(value: string): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0640\u0670]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const toResult = (t: SmartToolEntry, score: number): SearchResult => ({
  toolId: t.toolId,
  slug: t.slug,
  href: t.href,
  order: t.order,
  titleEn: t.titleEn,
  titleAr: t.titleAr,
  descriptionEn: t.descriptionEn,
  descriptionAr: t.descriptionAr,
  accessTier: t.accessTier,
  score,
});

/**
 * Search tools by free text (AR or EN). Empty/whitespace queries return [].
 * Ranking: exact > prefix > substring, ties broken by catalog order.
 */
export function searchTools(query: string, limit = 20): SearchResult[] {
  const q = normalize(query);
  if (!q) return [];

  const results: SearchResult[] = [];
  for (const tool of getCatalogTools()) {
    const fields = [tool.titleEn, tool.titleAr, tool.descriptionEn, tool.descriptionAr, tool.slug];
    let score = 0;
    for (const field of fields) {
      const hay = normalize(field);
      if (!hay) continue;
      if (hay === q) score = Math.max(score, 100);
      else if (hay.startsWith(q)) score = Math.max(score, 80);
      else if (hay.includes(q)) score = Math.max(score, 50);
    }
    if (score > 0) results.push(toResult(tool, score));
  }

  return results.sort((a, b) => b.score - a.score || a.order - b.order).slice(0, limit);
}
