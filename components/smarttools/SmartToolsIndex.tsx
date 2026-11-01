'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { usePreferences } from '@/context/PreferencesContext';
import { Language } from '@/shared/types/types';

export interface SmartToolsIndexTool {
  toolId: string;
  slug: string;
  href: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  searchText?: string;
}

export interface SmartToolsIndexCategory {
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  tools: SmartToolsIndexTool[];
}

export default function SmartToolsIndex({ categories }: { categories: SmartToolsIndexCategory[] }) {
  const { language, isRTL } = usePreferences();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const pendingCategoryClick = useRef<{ timer: number; slug: string; href: string } | null>(null);
  const isArabic = language !== Language.EN;
  const totalTools = categories.reduce((count, category) => count + category.tools.length, 0);
  const normalizedQuery = normalizeSearchText(query);
  const queryTerms = normalizedQuery.split(' ').filter(Boolean);
  const filteredCategories = categories.map((category) => ({
    ...category,
    tools: category.tools.filter((tool) => {
      if (queryTerms.length === 0) return true;
      const searchableText = normalizeSearchText([
        tool.titleAr,
        tool.titleEn,
        tool.descriptionAr,
        tool.descriptionEn,
        tool.slug,
        tool.toolId,
        tool.searchText ?? '',
        category.nameAr,
        category.nameEn,
        category.descriptionAr,
        category.descriptionEn,
      ].join(' '));
      return queryTerms.every((term) => searchableText.includes(term));
    }),
  }));
  const visibleToolCount = filteredCategories.reduce((count, category) => count + category.tools.length, 0);

  useEffect(() => () => {
    if (pendingCategoryClick.current) window.clearTimeout(pendingCategoryClick.current.timer);
  }, []);

  const handleCategoryClick = (event: React.MouseEvent<HTMLAnchorElement>, slug: string, href: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();

    const pending = pendingCategoryClick.current;
    if (pending?.slug === slug) {
      window.clearTimeout(pending.timer);
      pendingCategoryClick.current = null;
      router.push(href);
      return;
    }

    if (pending) window.clearTimeout(pending.timer);
    const timer = window.setTimeout(() => {
      pendingCategoryClick.current = null;
      document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
    pendingCategoryClick.current = { timer, slug, href };
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <header className="mb-10 text-center md:mb-14">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">
            {isArabic ? `${categories.length} فئة · ${totalTools} أداة منشورة` : `${categories.length} categories · ${totalTools} published tools`}
          </p>
          <h1 className="mb-3 text-4xl font-black text-zinc-950 dark:text-white md:text-5xl">
            {isArabic ? 'الأدوات الذكية' : 'Smart Tools'}
          </h1>
          <p className="mx-auto max-w-3xl text-base text-zinc-600 dark:text-zinc-400 md:text-lg">
            {isArabic
              ? 'تصفح الأدوات حسب الفئة. كل رابط يفتح صفحة الأداة داخل فئتها.'
              : 'Browse tools by category. Every tool link opens under its category route.'}
          </p>
        </header>

        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          {isArabic
            ? 'انقر مرة للانتقال إلى الفئة هنا، أو انقر مرتين لفتح صفحة الفئة. يتوفر أيضاً رابط مباشر لصفحتها.'
            : 'Click once to jump to the category here, or double-click to open its page. A direct page link is also available.'}
        </p>
        <nav aria-label={isArabic ? 'فئات الأدوات' : 'Tool categories'} className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <div key={category.slug} className="rounded-xl border border-zinc-200 bg-white/80 p-4 transition hover:border-gold-500/60 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/70">
              <Link
                href={`/smarttools/${category.slug}`}
                data-testid={`category-jump-${category.slug}`}
                onClick={(event) => handleCategoryClick(event, category.slug, `/smarttools/${category.slug}`)}
                className="block rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500"
              >
                <span className="block font-bold text-zinc-900 dark:text-white">{isArabic ? category.nameAr : category.nameEn}</span>
                <span className="mt-1 block text-xs text-zinc-500">{category.tools.length} {isArabic ? 'أداة منشورة' : 'published tools'}</span>
              </Link>
              <Link href={`/smarttools/${category.slug}`} data-testid={`category-open-${category.slug}`} className="mt-2 inline-block text-xs font-bold text-gold-700 hover:underline dark:text-gold-400">
                {isArabic ? 'فتح صفحة الفئة مباشرة' : 'Open category page directly'}
              </Link>
            </div>
          ))}
        </nav>

        <div className="mb-10 text-start">
          <label htmlFor="smarttools-search" className="mb-2 block text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {isArabic ? 'ابحث في الأدوات' : 'Search SmartTools'}
          </label>
          <input
            id="smarttools-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isArabic ? 'ابحث باسم الأداة أو الفئة أو الشرح أو الموضوع أو الكلمات المفتاحية…' : 'Search by tool name, category, description, topic, or keywords…'}
            autoComplete="off"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
          <p className="mt-2 text-xs text-zinc-500" aria-live="polite">
            {isArabic ? `نتائج البحث: ${visibleToolCount} من ${totalTools} أداة` : `Search results: ${visibleToolCount} of ${totalTools} tools`}
          </p>
        </div>

        <div className="space-y-12">
          {filteredCategories.map((category) => (
            (normalizedQuery && category.tools.length === 0) ? null : (
            <section key={category.slug} id={category.slug} aria-labelledby={`category-${category.slug}`} className="scroll-mt-28">
              <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800">
                <div>
                  <h2 id={`category-${category.slug}`} className="text-2xl font-black text-zinc-950 dark:text-white">
                    {isArabic ? category.nameAr : category.nameEn}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {isArabic ? category.descriptionAr : category.descriptionEn}
                  </p>
                </div>
                <Link href={`/smarttools/${category.slug}`} className="text-sm font-bold text-gold-700 hover:underline dark:text-gold-400">
                  {isArabic ? 'عرض الفئة' : 'View category'}
                </Link>
              </header>

              {category.tools.length === 0 ? (
                <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700">
                  {isArabic ? 'لا توجد أدوات منشورة في هذه الفئة حالياً.' : 'No tools are currently published in this category.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {category.tools.map((tool) => (
                    <Link
                      key={tool.toolId}
                      href={tool.href}
                      data-tool-slug={tool.slug}
                      className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gold-500/60 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/80"
                    >
                      <h3 className="mb-2 text-lg font-black text-zinc-900 group-hover:text-gold-700 dark:text-white dark:group-hover:text-gold-400">
                        {isArabic ? tool.titleAr : tool.titleEn}
                      </h3>
                      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {isArabic ? tool.descriptionAr : tool.descriptionEn}
                      </p>
                      <span className="mt-4 inline-block text-xs font-bold text-gold-700 dark:text-gold-400" dir="ltr">
                        {tool.href}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
            )
          ))}
          {normalizedQuery && visibleToolCount === 0 && (
            <p role="status" className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              {isArabic ? 'لم نعثر على أداة تطابق كلمات البحث. جرّب اسماً أو وصفاً أو موضوعاً آخر.' : 'No tools match those terms. Try another name, description, or topic.'}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}
