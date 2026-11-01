'use client';

import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import i18nJson from '@/i18n/tool-094-pregnancy-risk-calculator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-094-pregnancy-risk-calculator';

export default function Tool094PregnancyRiskCalculator() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const t = pickToolI18n(i18nJson, locale);

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <header>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
      </header>

      <section role="status" className="rounded-xl border border-red-500/50 bg-red-950/40 p-5 text-sm text-red-100">
        <h2 className="mb-2 text-lg font-bold">{locale === 'ar' ? 'لا يتوفر تقييم فردي' : 'Individualized assessment unavailable'}</h2>
        <p>{locale === 'ar'
          ? 'لا يمكن لفئة مركب عامة أو عدد الأسابيع وحدهما تحديد خطر الحمل أو زوال التعرض أو توقيت آمن للحمل. أوقفنا نتائج «الخطر المنخفض بعد التطهير» وفترات الانتظار العامة لأنها غير مخصصة للمنتج أو الحالة.'
          : 'A broad compound class and elapsed weeks alone cannot determine pregnancy risk, exposure clearance, or safe conception timing. Generic washout periods and “low risk after washout” results have been disabled because they are not individualized to a product or person.'}</p>
        <p className="mt-3">{locale === 'ar'
          ? 'هذه الصفحة لا تطلب بيانات عن الحمل أو التعرض، ولا تحفظها، ولا تقدم تشخيصاً أو تصريحاً طبياً بسلامة الحمل.'
          : 'This page does not request or store pregnancy or exposure details and does not provide a diagnosis or medical clearance for pregnancy.'}</p>
      </section>

      <section className="space-y-2 rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 text-sm text-zinc-200">
        <h2 className="font-bold">{locale === 'ar' ? 'لماذا يلزم الملصق المحدد؟' : 'Why the specific product label matters'}</h2>
        <p>{locale === 'ar'
          ? 'تختلف تحذيرات الحمل ومتطلبات المتابعة حسب الدواء والمنتج. مثال ذلك ملصق الإيزوتريتينوين المدرج في DailyMed؛ لا يجوز تعميم تعليماته على فئات مركبات أخرى أو استخدامها لحساب الخطر الفردي.'
          : 'Pregnancy warnings and follow-up requirements are product-specific. The DailyMed isotretinoin label is one example; its instructions must not be generalized to other compound classes or used here to calculate individual risk.'}</p>
        <a className="inline-flex text-sky-300 underline underline-offset-4" href="https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=c369e1c3-90c5-4768-9741-56c62253a2c4" target="_blank" rel="noreferrer">
          {locale === 'ar' ? 'عرض ملصق DailyMed لمنتج الإيزوتريتينوين' : 'View this DailyMed isotretinoin product label'}
        </a>
        <p className="text-xs text-zinc-400">{locale === 'ar'
          ? 'راجع الملصق الرسمي الخاص بالمنتج والجهة التنظيمية في بلدك، واطلب تقييماً من مختص مؤهل. هذه الصفحة لا تحسب فترة انتظار.'
          : 'Consult the official labeling for the exact product and your local regulator, and seek individualized review from a qualified professional. This page does not calculate a waiting period.'}</p>
      </section>

      <nav aria-label={locale === 'ar' ? 'التنقل بين الأدوات' : 'Tool navigation'} className="flex flex-wrap justify-between gap-3 border-t border-zinc-700 pt-4 text-sm">
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="text-zinc-300 hover:text-red-300">{locale === 'ar' ? `الأداة السابقة: ${neighbors.prevTool.titleAr}` : `Previous tool: ${neighbors.prevTool.titleEn}`}</a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="text-zinc-300 hover:text-red-300">{locale === 'ar' ? `الأداة التالية: ${neighbors.nextTool.titleAr}` : `Next tool: ${neighbors.nextTool.titleEn}`}</a>
      </nav>
      <p className="text-xs text-zinc-500">{tool.toolId} · v{tool.version}</p>
    </main>
  );
}
