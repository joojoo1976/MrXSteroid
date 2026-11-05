'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import type { ToolOutput } from '@/lib/tools/contracts';
import { getTool } from '@/lib/tools/registry';
import AIInsightPanel from '@/components/smarttools/AIInsightPanel';
import { toAIInsightContext, useAIInsightContext } from '@/components/smarttools/AIInsightContext';

interface ToolOutputSummaryProps<T> {
  output: ToolOutput<T>;
  locale: 'ar' | 'en';
}

export default function ToolOutputSummary<T>({ output, locale }: ToolOutputSummaryProps<T>) {
  const aiContext = useAIInsightContext();
  const publishAIOutput = aiContext?.publish;
  const aiOutput = useMemo(() => toAIInsightContext(output), [output]);
  useEffect(() => {
    if (!publishAIOutput) return;
    publishAIOutput(aiOutput);
    return () => publishAIOutput(null);
  }, [publishAIOutput, aiOutput]);
  const ar = locale === 'ar';
  const previous = getTool(output.seoLinks.prevTool.slug);
  const next = getTool(output.seoLinks.nextTool.slug);
  const quality = output.provenance.dataQuality === 'not_assessed'
    ? (ar ? 'غير مقاس' : 'Not assessed')
    : output.provenance.dataQuality;
  const confidence = output.provenance.confidence === null
    ? (ar ? 'غير مقاسة' : 'Not assessed')
    : `${Math.round(output.provenance.confidence * 100)}%`;
  const methodLabels: Record<string, string> = {
    'User-entered food log scored by deterministic rules': ar ? 'سجل طعام أدخله المستخدم وقواعد حساب حتمية' : 'User-entered food log scored by deterministic rules',
    'User-entered prices optimized by deterministic rules': ar ? 'أسعار أدخلها المستخدم وحُسنت بقواعد حساب حتمية' : 'User-entered prices optimized by deterministic rules',
    'User-entered or reference-estimated restaurant nutrition': ar ? 'بيانات مطعم أدخلها المستخدم أو قُدرت من مرجع' : 'User-entered or reference-estimated restaurant nutrition',
    'User-provided studies graded by the stated evidence framework': ar ? 'دراسات أدخلها المستخدم وصُنفت بإطار الأدلة الموضح' : 'User-provided studies graded by the stated evidence framework',
    'Self-reported food log compared with reference intake values': ar ? 'سجل غذائي ذاتي قورن بقيم المدخول المرجعية' : 'Self-reported food log compared with reference intake values',
    'User-entered training parameters with reference ranges': ar ? 'بيانات تدريب أدخلها المستخدم مع نطاقات مرجعية' : 'User-entered training parameters with reference ranges',
    'Self-reported and user-entered biometric markers scored by deterministic rules': ar ? 'مؤشرات حيوية ذاتية ومدخلة من المستخدم قُيّمت بقواعد حتمية' : 'Self-reported and user-entered biometric markers scored by deterministic rules',
    'User-entered sets, repetitions and load aggregated deterministically': ar ? 'مجموعات وتكرارات وأوزان أدخلها المستخدم وجُمعت حتميًا' : 'User-entered sets, repetitions and load aggregated deterministically',
    'User-entered performance projected by deterministic heuristics': ar ? 'أداء أدخله المستخدم وأُسقط باستدلالات حتمية' : 'User-entered performance projected by deterministic heuristics',
    'Training stimulus scored by deterministic recovery heuristics': ar ? 'مثيرات تدريب قُيّمت باستدلالات استشفاء حتمية' : 'Training stimulus scored by deterministic recovery heuristics',
    'load_velocity_profile_rpe_rir_based_1rm_estimation': ar ? 'تقدير 1RM من منحنى الحمل والسرعة وRPE/RIR' : '1RM estimate from load-velocity profile and RPE/RIR',
    'User-entered training load and self-reported recovery markers scored by deterministic heuristics': ar ? 'أحمال تدريب ومؤشرات استشفاء ذاتية قُيّمت باستدلالات حتمية' : 'User-entered loads and self-reported recovery markers scored by deterministic heuristics',
    'Self-reported training and recovery markers scored by deterministic fatigue heuristics': ar ? 'مؤشرات تدريب واستشفاء ذاتية قُيّمت باستدلالات تعب حتمية' : 'Self-reported training and recovery markers scored by deterministic fatigue heuristics',
    'Indirect self-reported training indicators scored by a simplified deterministic model': ar ? 'مؤشرات تدريب ذاتية غير مباشرة قُيّمت بنموذج حتمي مبسط' : 'Indirect self-reported training indicators scored by a simplified deterministic model',
    'Self-reported performance tests scored by fixed deterministic reference ratios': ar ? 'اختبارات أداء أدخلها المستخدم وقورنت بنسب مرجعية حتمية ثابتة' : 'Self-reported performance tests scored by fixed deterministic reference ratios',
    'Self-reported readiness markers scored by deterministic weighted rules; no AI model is called': ar ? 'مؤشرات جاهزية ذاتية قُيّمت بقواعد موزونة حتمية دون استدعاء نموذج ذكاء اصطناعي' : 'Self-reported readiness markers scored by deterministic weighted rules; no AI model is called',
    'User-recorded training-session loads aggregated over fixed calendar windows': ar ? 'أحمال جلسات أدخلها المستخدم وجُمعت ضمن نوافذ زمنية ثابتة' : 'User-recorded training-session loads aggregated over fixed calendar windows',
    'User-selected program parameters mapped to a deterministic heuristic outline; no AI model is called': ar ? 'إعدادات برنامج اختارها المستخدم وحُولت إلى مخطط استدلالي حتمي دون استدعاء نموذج ذكاء اصطناعي' : 'User-selected program parameters mapped to a deterministic heuristic outline; no AI model is called',
    'User-entered trend points inspected by a fixed slope threshold; no AI model is called': ar ? 'نقاط تقدم أدخلها المستخدم وفُحصت بحد ميل ثابت دون استدعاء نموذج ذكاء اصطناعي' : 'User-entered trend points inspected by a fixed slope threshold; no AI model is called',
    'Lean-mass-constant arithmetic scenario using a user-selected weekly rate; no AI model is called': ar ? 'سيناريو حسابي بكتلة خالية من الدهون ثابتة ومعدل أسبوعي يحدده المستخدم دون نموذج ذكاء اصطناعي' : 'Lean-mass-constant arithmetic scenario using a user-selected weekly rate; no AI model is called',
    'User-recorded set readings sorted by set number and compared with fixed rules; no sensor or AI model is used': ar ? 'قراءات مجموعات أدخلها المستخدم ورُتبت بحسب رقم المجموعة وقورنت بقواعد ثابتة دون مستشعر أو نموذج ذكاء اصطناعي' : 'User-recorded set readings sorted by set number and compared with fixed rules; no sensor or AI model is used',
    'User-entered side-to-side values compared with a fixed app threshold; not a clinical assessment': ar ? 'قيم أدخلها المستخدم للجانبين وقورنت بحد ثابت للتطبيق؛ ليست تقييمًا سريريًا' : 'User-entered side-to-side values compared with a fixed app threshold; not a clinical assessment',
    'Static movement-pattern and user-selected equipment rules; no AI model or injury assessment is used': ar ? 'قواعد ثابتة لنمط الحركة والمعدات المختارة؛ دون نموذج ذكاء اصطناعي أو تقييم إصابة' : 'Static movement-pattern and user-selected equipment rules; no AI model or injury assessment is used',
    'User-entered circumference ratios compared with fixed aesthetic heuristics; not a health standard': ar ? 'نسب محيطات أدخلها المستخدم وقورنت باستدلالات جمالية ثابتة؛ ليست معيارًا صحيًا' : 'User-entered circumference ratios compared with fixed aesthetic heuristics; not a health standard',
    'Published analyte-specific laboratory conversion factor; no interpretation': ar ? 'عامل تحويل مخبري منشور خاص بالتحليل؛ دون تفسير للنتيجة' : 'Published analyte-specific laboratory conversion factor; no interpretation',
    'User-entered DailyMed label reference and temperature ranges compared directly; no stability model or quality assessment': ar ? 'مقارنة مباشرة لمرجع ملصق DailyMed ونطاقات حرارة أدخلها المستخدم؛ دون نموذج ثبات أو تقييم جودة' : 'User-entered DailyMed label reference and temperature ranges compared directly; no stability model or quality assessment',
    'Deterministic SI quantity calculation from user-entered measurements; density source and temperature recorded': ar ? 'حساب حتمي لكميات SI من قياسات المستخدم مع تسجيل مصدر الكثافة وحرارة قياسها' : 'Deterministic SI quantity calculation from user-entered measurements; density source and temperature recorded',
    'User-entered g/kg values; remaining carbohydrates calculated after 4 kcal/g protein and carbohydrate and 9 kcal/g fat. Energy baseline is the inherited rough weight × 24 heuristic, then the selected fixed goal multiplier. No activity adjustment is applied.': ar ? 'قيم g/kg أدخلها المستخدم؛ حُسبت الكربوهيدرات المتبقية وفق 4 سعرات/جم للبروتين والكربوهيدرات و9 سعرات/جم للدهون. خط أساس الطاقة هو الاستدلال الموروث الوزن × 24 ثم معامل الهدف الثابت المختار، دون تعديل للنشاط.' : 'User-entered g/kg values; remaining carbohydrates calculated after 4 kcal/g protein and carbohydrate and 9 kcal/g fat. Energy baseline is the inherited rough weight × 24 heuristic, then the selected fixed goal multiplier. No activity adjustment is applied.',
    'Vermeulen mass-action calculation from user-entered total testosterone, SHBG, and albumin; not a diagnosis or reference-range assessment.': ar ? 'حساب بمعادلة فيرمولين للاتزان الكتلي اعتماداً على التستوستيرون الكلي وSHBG والألبومين التي أدخلها المستخدم؛ ليس تشخيصاً أو تقييماً لمجال مرجعي.' : 'Vermeulen mass-action calculation from user-entered total testosterone, SHBG, and albumin; not a diagnosis or reference-range assessment.',
    'Single-exponential calculation using user-entered half-life and threshold. Substance names and source text are excluded from assistant findings.': ar ? 'حساب أسي واحد باستخدام نصف العمر والحد اللذين أدخلهما المستخدم. لا تُرسل أسماء المواد أو نص المصدر ضمن استنتاجات المساعد.' : 'Single-exponential calculation using user-entered half-life and threshold. Substance names and source text are excluded from assistant findings.',
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4" aria-live="polite">
      <h2 className="mb-3 text-sm font-black text-white">{ar ? 'ملخص النتائج' : 'Results summary'}</h2>
      <ul className="space-y-2">
        {output.keyFindings.map((finding) => (
          <li key={finding.code} className="flex flex-wrap justify-between gap-2 border-b border-zinc-800 pb-2 text-xs">
            <span className="text-zinc-300">{ar ? finding.labelAr : finding.labelEn}</span>
            <span className={finding.severity === 'important' ? 'font-bold text-amber-300' : 'font-mono text-white'}>{finding.value}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-zinc-400">
        <div><dt>{ar ? 'المصدر' : 'Source'}</dt><dd className="text-zinc-200">{output.provenance.source === 'manual' ? (ar ? 'مدخلات المستخدم' : 'User input') : output.provenance.source}</dd></div>
        <div><dt>{ar ? 'طريقة المعالجة' : 'Method'}</dt><dd className="text-zinc-200">{output.provenance.measurementMethod ? methodLabels[output.provenance.measurementMethod] ?? output.provenance.measurementMethod : (ar ? 'غير محددة' : 'Unspecified')}</dd></div>
        <div><dt>{ar ? 'جودة البيانات' : 'Data quality'}</dt><dd className="text-zinc-200">{quality}</dd></div>
        <div><dt>{ar ? 'الثقة' : 'Confidence'}</dt><dd className="text-zinc-200">{confidence}</dd></div>
        <div className="col-span-2"><dt>{ar ? 'وقت الحساب' : 'Calculated at'}</dt><dd className="text-zinc-200" dir="ltr">{new Date(output.calculatedAt).toLocaleString(locale)}</dd></div>
        <div className="col-span-2"><dt>{ar ? 'وقت تسجيل المدخلات' : 'Input recorded at'}</dt><dd className="text-zinc-200" dir="ltr">{new Date(output.provenance.recordedAt).toLocaleString(locale)} · {output.provenance.timezone}</dd></div>
      </dl>
      <nav className="mt-4 flex justify-between gap-3 border-t border-zinc-800 pt-3 text-xs font-bold text-lime-400" aria-label={ar ? 'أدوات ذات صلة' : 'Related tools'}>
        {previous ? <Link href={previous.href}>{ar ? 'السابق: ' : 'Previous: '}{ar ? previous.titleAr : previous.titleEn}</Link> : <span />}
        {next ? <Link href={next.href}>{ar ? 'التالي: ' : 'Next: '}{ar ? next.titleAr : next.titleEn}</Link> : <span />}
      </nav>
      {!aiContext && <AIInsightPanel toolSlug={output.toolSlug} findings={aiOutput.findings} provenanceLine={aiOutput.provenanceLine} />}
    </section>
  );
}
