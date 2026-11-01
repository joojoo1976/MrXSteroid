import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SEARCH_TEXT_CACHE = new Map<string, string>();

/**
 * Collects user-visible localized strings for a SmartTool at build/render time.
 * Missing i18n files are allowed because some legacy tools keep copy in their
 * component; malformed present files fail the build instead of silently
 * producing an incomplete search index. UTF-8 BOMs are removed before parsing.
 */
export function getSmartToolI18nSearchText(slug: string): string {
  const cached = SEARCH_TEXT_CACHE.get(slug);
  if (cached !== undefined) return cached;
  if (!/^[a-z0-9-]+$/.test(slug)) return '';

  const i18nDirectory = join(process.cwd(), 'i18n');
  const candidates = [join(i18nDirectory, `${slug}.json`)];
  if (!slug.startsWith('tool-')) candidates.push(join(i18nDirectory, `tool-${slug}.json`));
  const filePath = candidates.find((candidate) => existsSync(candidate));
  if (!filePath) {
    SEARCH_TEXT_CACHE.set(slug, '');
    return '';
  }

  let parsed: unknown;
  try {
    const content = readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to build SmartTools search text from ${filePath}: ${detail}`);
  }

  const text = [...new Set(collectLocalizedStrings(parsed))].join(' ');
  SEARCH_TEXT_CACHE.set(slug, text);
  return text;
}

function collectLocalizedStrings(value: unknown): string[] {
  if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
  if (Array.isArray(value)) return value.flatMap(collectLocalizedStrings);
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectLocalizedStrings);
  }
  return [];
}
