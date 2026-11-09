/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getPublishedCatalogTools } from '@/lib/tools/smartToolsCatalog4';
import { getCategory, getCategoryOfSlug, toHierarchicalHref } from '@/lib/tools/categories';
import { getToolComponent } from '@/lib/tools/loaders';
import { SafetyNotice } from '@/components/tools/SafetyNotice';
import { getToolNeighbors } from '@/lib/tools/registry';
import { R6Progress } from '@/components/tools/r6/R6Progress';
import { R6ToolShell } from '@/components/tools/r6/R6ToolShell';
import { getR6ManifestEntry } from '@/lib/tools/r6/manifest';

export function generateStaticParams(): Array<{ category: string; tool: string }> {
  return getPublishedCatalogTools()
    .map((t) => ({ category: getCategoryOfSlug(t.slug) as string | null, tool: t.slug }))
    .filter((p): p is { category: string; tool: string } => p.category !== null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}): Promise<Metadata> {
  const { category, tool } = await params;
  const entry = getPublishedCatalogTools().find((t) => t.slug === tool);
  const cat = getCategory(category);
  if (!entry || !cat || getCategoryOfSlug(entry.slug) !== cat.slug) {
    return { title: 'Tool not found' };
  }
  const canonical = `https://mrxsteroid.com/smarttools/${cat.slug}/${entry.slug}`;
  return {
    title: entry.titleEn, // root layout template appends the brand — never inline it here (H12)
    description: entry.descriptionEn,
    alternates: { canonical, languages: { 'ar-EG': canonical } },
    openGraph: { title: `${entry.titleEn} | Mr. X-Steroid`, description: entry.descriptionEn, url: canonical, siteName: 'Mr. X-Steroid', type: 'website' },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}) {
  const { category, tool } = await params;
  const entry = getPublishedCatalogTools().find((t) => t.slug === tool);
  const cat = getCategory(category);
  if (!entry || !cat || getCategoryOfSlug(entry.slug) !== cat.slug) notFound();

  const h = await headers();
  const locale = h.get('x-locale') === 'ar' ? 'ar' : 'en';
  const isAr = locale === 'ar';
  const title = isAr ? entry.titleAr : entry.titleEn;
  const catName = isAr ? cat.nameAr : cat.nameEn;

  const neighbors = getToolNeighbors(entry.slug);
  const prevHref = toHierarchicalHref(neighbors.prevTool.slug);
  const nextHref = toHierarchicalHref(neighbors.nextTool.slug);
  const r6 = getR6ManifestEntry(entry.slug);

  const canonical = `https://mrxsteroid.com/smarttools/${cat.slug}/${entry.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: entry.titleEn,
    description: entry.descriptionEn,
    url: canonical,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'All',
    inLanguage: ['en', 'ar'],
    author: { '@type': 'Person', name: 'George Mourice' },
    offers: { '@type': 'Offer', price: entry.accessTier === 'free' ? '0' : undefined, priceCurrency: 'USD' },
  };

  const ToolComponent = await getToolComponent(entry.slug);
  if (!ToolComponent) notFound();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <nav className="mb-6 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gold-500 transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
          <span>/</span>
          <Link href="/smarttools" className="hover:text-gold-500 transition-colors">{isAr ? 'الأدوات الذكية' : 'Smart Tools'}</Link>
          <span>/</span>
          <Link href={`/smarttools/${cat.slug}`} className="hover:text-gold-500 transition-colors">{catName}</Link>
          <span>/</span>
          <span className="text-gold-500 font-bold" aria-current="page">{title}</span>
        </nav>
        {r6 && <R6Progress index={r6.index} total={r6.total} locale={locale} />}
        <SafetyNotice category={cat.slug} />
        {r6 && !r6.hasOwnBoxes ? (
          <R6ToolShell entry={r6} locale={locale}>
            <ToolComponent />
          </R6ToolShell>
        ) : (
          <ToolComponent />
        )}
        {r6 && <R6Progress index={r6.index} total={r6.total} locale={locale} />}
        <nav className="mt-8 flex items-center justify-between text-sm" aria-label={isAr ? 'التنقل بين الأدوات' : 'Tool navigation'}>
          {prevHref ? (
            <Link href={prevHref} className="text-gold-500 hover:underline">
              {isAr ? `← ${neighbors.prevTool.titleAr}` : `← ${neighbors.prevTool.titleEn}`}
            </Link>
          ) : <span />}
          {nextHref ? (
            <Link href={nextHref} className="text-gold-500 hover:underline">
              {isAr ? `${neighbors.nextTool.titleAr} →` : `${neighbors.nextTool.titleEn} →`}
            </Link>
          ) : <span />}
        </nav>
      </div>
    </>
  );
}
