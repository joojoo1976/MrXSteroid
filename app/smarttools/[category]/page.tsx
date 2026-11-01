import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SmartToolsCategoryListing from '@/components/smarttools/SmartToolsCategoryListing';
import type { SmartToolsIndexTool } from '@/components/smarttools/SmartToolsIndex';
import { SMART_TOOL_CATEGORIES, getPublishedToolsByCategory, isCategory, toHierarchicalHref } from '@/lib/tools/categories';

export function generateStaticParams(): Array<{ category: string }> {
  return SMART_TOOL_CATEGORIES.map(({ slug }) => ({ category: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = SMART_TOOL_CATEGORIES.find((item) => item.slug === slug);
  if (!category) return { title: 'Category not found' };

  const canonical = `https://mrxsteroid.com/smarttools/${category.slug}`;
  return {
    title: category.nameEn,
    description: category.descriptionEn,
    alternates: { canonical, languages: { 'ar-EG': canonical } },
  };
}

export default async function SmartToolsCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  if (!isCategory(slug)) notFound();

  const category = SMART_TOOL_CATEGORIES.find((item) => item.slug === slug);
  if (!category) notFound();

  const tools: SmartToolsIndexTool[] = getPublishedToolsByCategory(slug).flatMap((tool) => {
    const href = toHierarchicalHref(tool.slug);
    return href ? [{
      toolId: tool.toolId,
      slug: tool.slug,
      href,
      titleAr: tool.titleAr,
      titleEn: tool.titleEn,
      descriptionAr: tool.descriptionAr,
      descriptionEn: tool.descriptionEn,
    }] : [];
  });

  return <SmartToolsCategoryListing category={{ ...category, tools }} />;
}
