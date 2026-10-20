import type { Metadata } from 'next';

/**
 * Tool-036 V4 preview metadata (decision R1).
 *
 * The preview must stay invisible to catalogs, sitemaps and search: this
 * metadata carries an explicit `noindex`, the route lives outside
 * /smarttools (so the registry-driven sitemap cannot emit it), and
 * `visibility.test.ts` guards all three facts against regressions.
 */
export const labsMetadata: Metadata = {
  title: 'Tool-036 V4 — معاينة تجريبية',
  description: 'معاينة تجريبية غير مفهرسة لأداة جدولة الحقن الإصدار الرابع.',
  robots: { index: false, follow: false },
};
