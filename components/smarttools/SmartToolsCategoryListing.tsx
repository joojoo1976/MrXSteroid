'use client';

import Link from 'next/link';
import { usePreferences } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';
import type { SmartToolsIndexTool } from './SmartToolsIndex';

interface CategoryListingProps {
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  tools: SmartToolsIndexTool[];
}

export default function SmartToolsCategoryListing({ category }: { category: CategoryListingProps }) {
  const { language, isRTL } = usePreferences();
  const isArabic = language !== Language.EN;

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <Link href="/smarttools" className="mb-6 inline-block text-sm font-bold text-gold-700 hover:underline dark:text-gold-400">
          {isArabic ? 'كل فئات SmartTools' : 'All SmartTools categories'}
        </Link>
        <header className="mb-9 border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <p className="mb-2 text-sm font-bold text-zinc-500">{category.tools.length} {isArabic ? 'أداة منشورة' : 'published tools'}</p>
          <h1 className="text-3xl font-black text-zinc-950 dark:text-white md:text-4xl">
            {isArabic ? category.nameAr : category.nameEn}
          </h1>
          <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
            {isArabic ? category.descriptionAr : category.descriptionEn}
          </p>
        </header>

        {category.tools.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            {isArabic ? 'لا توجد أدوات منشورة في هذه الفئة حالياً.' : 'No tools are currently published in this category.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {category.tools.map((tool) => (
              <Link key={tool.toolId} href={tool.href} data-tool-slug={tool.slug} className="rounded-2xl border border-zinc-200 bg-white p-5 hover:border-gold-500/60 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/80">
                <h2 className="text-lg font-black text-zinc-900 dark:text-white">{isArabic ? tool.titleAr : tool.titleEn}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{isArabic ? tool.descriptionAr : tool.descriptionEn}</p>
                <span className="mt-4 inline-block text-xs font-bold text-gold-700 dark:text-gold-400" dir="ltr">{tool.href}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
