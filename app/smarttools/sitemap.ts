import type { MetadataRoute } from 'next';
import { SMART_TOOL_CATEGORIES, getToolsByCategory } from '@/lib/tools/categories';
import { toHierarchicalHref } from '@/lib/tools/categories';

const BASE = 'https://mrxsteroid.com';

// App-Router sitemap for the SmartTools hierarchy (SPEC § generated from the
// registry — no manual URL lists).
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/smarttools`, changeFrequency: 'weekly', priority: 0.9 },
  ];

  for (const cat of SMART_TOOL_CATEGORIES) {
    entries.push({
      url: `${BASE}/smarttools/${cat.slug}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
    for (const tool of getToolsByCategory(cat.slug)) {
      const href = toHierarchicalHref(tool.slug) ?? tool.href;
      entries.push({
        url: `${BASE}${href}`,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
