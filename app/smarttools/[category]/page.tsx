/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  SMART_TOOL_CATEGORIES,
  getCategory,
  getToolsByCategory,
  toHierarchicalHref,
  type SmartToolCategory,
} from '@/lib/tools/categories';

export function generateStaticParams(): Array<{ category: SmartToolCategory }> {
  return SMART_TOOL_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const def = getCategory(category);
  if (!def) return { title: 'Category not found | Mr. X-Steroid' };

  const canonical = `https://mrxsteroid.com/smarttools/${def.slug}`;
  return {
    title: `${def.nameEn} Tools | Mr. X-Steroid`,
    description: def.descriptionEn,
    alternates: { canonical, languages: { 'ar-EG': canonical } },
    openGraph: {
      title: `${def.nameEn} Tools | Mr. X-Steroid`,
      description: def.descriptionEn,
      url: canonical,
      siteName: 'Mr. X-Steroid',
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const def = getCategory(category);
  if (!def) notFound();

  const tools = getToolsByCategory(def!.slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <nav className="mb-6 flex items-center gap-2 text-xs text-zinc-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gold-500 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/smarttools" className="hover:text-gold-500 transition-colors">Smart Tools</Link>
            <span>/</span>
            <span className="text-gold-500 font-bold">{def!.nameEn}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-3">
            {def!.nameEn}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mb-10">{def!.descriptionEn}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((t) => (
              <Link
                key={t.slug}
                href={toHierarchicalHref(t.slug) ?? t.href}
                className="group relative p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 hover:border-gold-500/50 hover:shadow-xl hover:shadow-gold-500/10 transition-all duration-300"
              >
                <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">{t.titleEn}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{t.descriptionEn}</p>
                <span className="inline-flex items-center text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest">
                  Open Tool
                </span>
              </Link>
            ))}
          </div>

          {tools.length === 0 && (
            <p className="text-zinc-500 text-sm">More tools in this category are coming soon.</p>
          )}
        </div>
      </div>
    </div>
  );
}
