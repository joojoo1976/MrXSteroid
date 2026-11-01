import SmartToolsIndex, { type SmartToolsIndexCategory } from '@/components/smarttools/SmartToolsIndex';
import { SMART_TOOL_CATEGORIES, getPublishedToolsByCategory, toHierarchicalHref } from '@/lib/tools/categories';
import { getSmartToolI18nSearchText } from '@/lib/tools/smartToolsI18nSearchIndex';

export default function SmartToolsPage() {
  const categories: SmartToolsIndexCategory[] = SMART_TOOL_CATEGORIES.map((category) => ({
    slug: category.slug,
    nameAr: category.nameAr,
    nameEn: category.nameEn,
    descriptionAr: category.descriptionAr,
    descriptionEn: category.descriptionEn,
    tools: getPublishedToolsByCategory(category.slug).flatMap((tool) => {
      const href = toHierarchicalHref(tool.slug);
      return href ? [{
        toolId: tool.toolId,
        slug: tool.slug,
        href,
        titleAr: tool.titleAr,
        titleEn: tool.titleEn,
        descriptionAr: tool.descriptionAr,
        descriptionEn: tool.descriptionEn,
        searchText: [
          tool.slug,
          tool.toolId,
          tool.bookContext?.chapterAr,
          tool.bookContext?.chapterEn,
          tool.bookContext?.topicAr,
          tool.bookContext?.topicEn,
          getSmartToolI18nSearchText(tool.slug),
        ].filter(Boolean).join(' '),
      }] : [];
    }),
  }));

  return <SmartToolsIndex categories={categories} />;
}
