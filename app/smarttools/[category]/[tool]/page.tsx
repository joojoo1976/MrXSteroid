/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalogTools } from '@/lib/tools/smartToolsCatalog4';
import { getCategory, getCategoryOfSlug, SMART_TOOL_CATEGORIES } from '@/lib/tools/categories';
import { getToolComponent } from '@/lib/tools/loaders';
import { SafetyNotice } from '@/components/tools/SafetyNotice';

export function generateStaticParams(): Array<{ category: string; tool: string }> {
  return getCatalogTools()
    .map((t) => ({ category: getCategoryOfSlug(t.slug) as string | null, tool: t.slug }))
    .filter((p): p is { category: string; tool: string } => p.category !== null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}): Promise<Metadata> {
  const { category, tool } = await params;
  const entry = getCatalogTools().find((t) => t.slug === tool);
  const cat = getCategory(category);
  if (!entry || !cat || getCategoryOfSlug(entry.slug) !== cat.slug) {
    return { title: 'Tool not found | Mr. X-Steroid' };
  }
  const canonical = `https://mrxsteroid.com/smarttools/${cat.slug}/${entry.slug}`;
  const title = `${entry.titleEn} | Mr. X-Steroid`;
  return {
    title,
    description: entry.descriptionEn,
    alternates: { canonical, languages: { 'ar-EG': canonical } },
    openGraph: { title, description: entry.descriptionEn, url: canonical, siteName: 'Mr. X-Steroid', type: 'website' },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}) {
  const { category, tool } = await params;
  const entry = getCatalogTools().find((t) => t.slug === tool);
  const cat = getCategory(category);
  if (!entry || !cat || getCategoryOfSlug(entry.slug) !== cat.slug) notFound();

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
        <nav className="mb-6 flex items-center gap-2 text-xs text-zinc-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gold-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/smarttools" className="hover:text-gold-500 transition-colors">Smart Tools</Link>
          <span>/</span>
          <Link href={`/smarttools/${cat.slug}`} className="hover:text-gold-500 transition-colors">{cat.nameEn}</Link>
          <span>/</span>
          <span className="text-gold-500 font-bold">{entry.titleEn}</span>
        </nav>
        <SafetyNotice category={cat.slug} />
        <ToolComponent />
      </div>
    </>
  );
}
