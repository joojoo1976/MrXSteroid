'use client';

import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import i18nJson from '@/i18n/tool-092-female-dosage-calculator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-092-female-dosage-calculator';

export default function Tool092FemaleDosageCalculator() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const t = pickToolI18n(i18nJson, locale);

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <header>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
      </header>

      <section role="status" className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-5 text-sm text-amber-950 dark:text-amber-100">
        <h2 className="mb-2 text-lg font-bold">{locale === 'ar' ? 'الحساب غير متاح' : 'Assessment unavailable'}</h2>
        <p>{locale === 'ar'
          ? 'لا يوجد نموذج موثّق خاص بالمنتج يحدد جرعة أندروجين آمنة للنساء أو مدة تعرض آمنة. لذلك أوقفنا تصنيفات المخاطر وحدود الجرعات والمدد التي لم تستند إلى مرجع صالح.'
          : 'No validated product-specific model establishes a safe androgen dose or exposure duration for women. Unsupported risk tiers, dose ceilings and durations have therefore been disabled.'}</p>
        <p className="mt-3">{locale === 'ar'
          ? 'هذه الصفحة لا تطلب جرعة ولا تحفظ بيانات تعرض شخصية، ولا تقدم وصفة أو دورة أو توصية علاجية.'
          : 'This page does not request or store personal exposure details and does not provide a prescription, cycle, or treatment recommendation.'}</p>
      </section>

      <section className="space-y-2 rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 text-sm text-zinc-200">
        <h2 className="font-bold">{locale === 'ar' ? 'حدود المصدر' : 'Source limits'}</h2>
        <p>{locale === 'ar'
          ? 'ملصق DailyMed لأوكساندرولون يذكر آثاراً أندروجينية قد تكون غير قابلة للعكس لدى بعض النساء. هذا الملصق لا يثبت حدود الجرعات أو مدد الاستخدام التي كانت تعرضها النسخة السابقة، ولا يدعم استنتاجات عن المركبات الأخرى.'
          : 'The DailyMed oxandrolone label describes androgenic effects that may be irreversible in some women. It does not validate the dose ceilings or exposure durations shown by the previous version, and it does not support conclusions about other compounds.'}</p>
        <a className="inline-flex text-sky-300 underline underline-offset-4" href="https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a6f42739-5bfc-4b76-8795-e93fa58f3d29" target="_blank" rel="noreferrer">
          {locale === 'ar' ? 'عرض ملصق DailyMed لأوكساندرولون' : 'View the DailyMed oxandrolone label'}
        </a>
        <p className="text-xs text-zinc-400">{locale === 'ar'
          ? 'هذا مرجع خاص بملصق المنتج، وقد تختلف نسخة DailyMed عن أحدث ملصق معتمد لدى FDA.'
          : 'This is a product-label reference; the DailyMed version may differ from the latest FDA-approved labeling.'}</p>
      </section>

      <nav aria-label={locale === 'ar' ? 'التنقل بين الأدوات' : 'Tool navigation'} className="flex flex-wrap justify-between gap-3 border-t border-zinc-700 pt-4 text-sm">
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="text-zinc-300 hover:text-lime-300">{locale === 'ar' ? `الأداة السابقة: ${neighbors.prevTool.titleAr}` : `Previous tool: ${neighbors.prevTool.titleEn}`}</a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="text-zinc-300 hover:text-lime-300">{locale === 'ar' ? `الأداة التالية: ${neighbors.nextTool.titleAr}` : `Next tool: ${neighbors.nextTool.titleEn}`}</a>
      </nav>
      <p className="text-xs text-zinc-500">{tool.toolId} · v{tool.version}</p>
    </main>
  );
}
