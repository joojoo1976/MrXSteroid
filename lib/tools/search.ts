/**
 * lib/tools/search.ts
 * ═══════════════════════════════════════════════════════════════════════════
 *  Recherche bilingue AR/EN sur le catalogue SmartTools.
 *  - Normalisation arabe (tashkeel, tatweel, variantes d'alef, chiffres).
 *  - Scoring phrase (exact > prefixe > sous-chaine) + scoring par tokens,
 *    ce qui rend « macro calculator » capable de trouver « Macro Optimizer ».
 *  - Tolerance aux fautes legere (distance d'edition 1 sur les tokens).
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

/** Lowercase + strip Arabic diacritics/tatweel + unify variants + trim. */
export function normalize(value: string): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    // eslint-disable-next-line no-misleading-character-class
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= 2);
}

/** Bounded Levenshtein distance for light typo tolerance. */
function editDistance(a: string, b: string, cap = 1): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

function scoreField(hay: string, phrase: string, tokens: string[]): number {
  if (!hay) return 0;
  let score = 0;
  if (phrase) {
    if (hay === phrase) score += 100;
    else if (hay.startsWith(phrase)) score += 80;
    else if (hay.includes(phrase)) score += 50;
  }
  if (tokens.length) {
    const words = hay.split(' ');
    for (const token of tokens) {
      if (words.includes(token)) score += 20;
      else if (hay.includes(token)) score += 12;
      else if (token.length >= 4 && words.some((w) => editDistance(w, token, 1) <= 1)) score += 6;
    }
  }
  return score;
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

/** Search tools by free text (AR or EN). Empty/whitespace queries return []. */
export function searchTools(query: string, limit = 20): SearchResult[] {
  const phrase = normalize(query);
  if (!phrase) return [];
  const tokens = tokenize(query);

  const results: SearchResult[] = [];
  for (const tool of getCatalogTools()) {
    const fields = [tool.titleEn, tool.titleAr, tool.descriptionEn, tool.descriptionAr, tool.slug];
    let score = 0;
    for (const field of fields) {
      score += scoreField(normalize(field), phrase, tokens);
    }
    if (score > 0) results.push(toResult(tool, score));
  }

  return results.sort((a, b) => b.score - a.score || a.order - b.order).slice(0, limit);
}
