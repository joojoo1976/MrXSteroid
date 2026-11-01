'use client';

import { useMemo, useState } from 'react';
import {
  ASSAY_MASS_TO_GRAMS,
  calculateUserAssayMassV6,
  UserAssayMassInputSchema,
  type UserAssayMassInput,
  type UserAssayMassResult,
} from '@/lib/tools/engines/tool-142-compound-purity-active-yield-estimator.v6';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type Draft = {
  /** Canonical grams; presentation follows the global header preference. */
  sampleMassGrams: string;
  assayPercent: string;
  statedUncertaintyPercentPoints: string;
  uncertaintyDescription: string;
  sourceReference: string;
  methodDescription: string;
  reportDate: string;
};

const initialDraft = (): Draft => ({
  sampleMassGrams: '', assayPercent: '', statedUncertaintyPercentPoints: '',
  uncertaintyDescription: '', sourceReference: '', methodDescription: '', reportDate: '',
});
const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';

function format(value: number, locale: 'ar' | 'en'): string {
  return new Intl.NumberFormat(locale, { maximumSignificantDigits: 8 }).format(value);
}

export default function Tool142UserAssayMassCalculator() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const [draft, setDraft] = useState<Draft>(() => initialDraft());
  const [result, setResult] = useState<UserAssayMassResult | null>(null);
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const massUnit: UserAssayMassInput['massUnit'] = unitSystem === 'imperial' ? 'oz' : 'g';
  const displayedSampleMass = draft.sampleMassGrams.trim() === ''
    ? ''
    : String(Number((Number(draft.sampleMassGrams) / ASSAY_MASS_TO_GRAMS[massUnit]).toPrecision(8)));

  const parsedInput = useMemo(() => {
    const candidate = {
      sampleMass: displayedSampleMass === '' ? undefined : Number(displayedSampleMass),
      massUnit,
      assayPercent: draft.assayPercent.trim() === '' ? undefined : Number(draft.assayPercent),
      statedUncertaintyPercentPoints: draft.statedUncertaintyPercentPoints.trim() === '' ? undefined : Number(draft.statedUncertaintyPercentPoints),
      uncertaintyDescription: draft.uncertaintyDescription,
      sourceReference: draft.sourceReference,
      methodDescription: draft.methodDescription,
      reportDate: draft.reportDate,
    };
    const parsed = UserAssayMassInputSchema.safeParse(candidate);
    return parsed.success ? parsed.data : null;
  }, [draft, displayedSampleMass, massUnit]);
  const hasNumericalInputs = [draft.sampleMassGrams, draft.assayPercent, draft.statedUncertaintyPercentPoints].every((value) => value.trim() !== '');
  const hasProvenance = [draft.uncertaintyDescription, draft.sourceReference, draft.methodDescription, draft.reportDate].every((value) => value.trim() !== '');
  const inputState = parsedInput ? 'READY' : hasNumericalInputs && !hasProvenance ? 'NOT_AVAILABLE' : hasNumericalInputs ? 'INVALID' : 'PARTIAL';

  const update = (key: keyof Draft, value: string) => {
    setResult(null);
    setDraft((old) => ({ ...old, [key]: value }));
  };

  const onCalculate = () => {
    if (!parsedInput) return;
    setResult(calculateUserAssayMassV6(parsedInput));
  };

  const fields = [
    ['sourceReference', t('مرجع تقرير الاختبار', 'Assay report reference')],
    ['methodDescription', t('الطريقة كما يذكرها التقرير', 'Method as stated on the report')],
    ['uncertaintyDescription', t('وصف عدم اليقين كما يذكره التقرير', 'Uncertainty description from the report')],
    ['reportDate', t('تاريخ التقرير', 'Report date')],
  ] as const;

  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
    <header><h1 className="text-2xl font-black text-white">{t('حساب كتلة من نتيجة اختبار مدخلة', 'Mass Arithmetic from a User-Provided Assay')}</h1></header>
    <p className="rounded-xl border border-amber-700/60 bg-amber-950/30 p-3 text-sm text-amber-100">
      {t('تحسب الأداة كتلة حسابية من نتيجة اختبار وبيانات عدم يقين ينقلها المستخدم من تقرير محدد. لا تتحقق من التقرير أو المادة، ولا تصادق على النقاء أو الجودة أو الأصالة، ولا تحسب جرعات أو خطوات تحضير أو مردود تصنيع.', 'This tool calculates an arithmetic mass from an assay value and uncertainty transcribed by the user from a specific report. It does not verify the report or material, certify purity, quality or authenticity, or calculate doses, preparation steps or manufacturing yield.')}
    </p>
    <section className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm text-zinc-200">{t('كتلة العينة', 'Sample mass')} ({massUnit})
        <input className={inputClass} type="number" min="0" step="any" inputMode="decimal" value={displayedSampleMass} onChange={(event) => {
          setResult(null);
          const enteredMass = event.target.value.trim() ? Number(event.target.value) : NaN;
          const grams = Number.isFinite(enteredMass) ? String(enteredMass * ASSAY_MASS_TO_GRAMS[massUnit]) : '';
          setDraft((old) => ({ ...old, sampleMassGrams: grams }));
        }} />
      </label>
      <label className="block text-sm text-zinc-200">{t('نسبة الاختبار الكتلية المدخلة (%)', 'User-entered mass assay (%)')}
        <input className={inputClass} type="number" min="0" max="100" step="any" inputMode="decimal" value={draft.assayPercent} onChange={(event) => update('assayPercent', event.target.value)} />
      </label>
      <label className="block text-sm text-zinc-200">{t('عدم اليقين المطلق كما في التقرير (نقاط مئوية)', 'Stated absolute uncertainty (percentage points)')}
        <input className={inputClass} type="number" min="0" max="100" step="any" inputMode="decimal" value={draft.statedUncertaintyPercentPoints} onChange={(event) => update('statedUncertaintyPercentPoints', event.target.value)} />
      </label>
      {fields.map(([key, label]) => <label key={key} className="block text-sm text-zinc-200">{label}
        <input className={inputClass} type={key === 'reportDate' ? 'date' : 'text'} maxLength={key === 'sourceReference' ? 500 : 240} value={draft[key]} onChange={(event) => update(key, event.target.value)} />
      </label>)}
    </section>
    <p className="text-xs text-zinc-400">{t('الناتج CALCULATED مشتق حسابياً من بيانات المستخدم فقط. نطاق الكتلة يعكس حدوداً حسابية للنسبة وعدم اليقين المدخلين؛ لا يستنتج مستوى ثقة ولا يعيد تقييم عدم اليقين.', 'CALCULATED means arithmetic derived only from user-provided values. The mass interval is an arithmetic mapping of the entered assay and stated uncertainty; it does not infer a confidence level or reassess uncertainty.')}</p>
    {!parsedInput && <p role="status" data-testid="tool-142-input-state" className="text-sm text-amber-300">
      {inputState}: {inputState === 'NOT_AVAILABLE'
        ? t('النتيجة غير متاحة حتى تُستكمل بيانات المصدر والطريقة وعدم اليقين والتاريخ.', 'Result is NOT_AVAILABLE until source, method, uncertainty description and report date are supplied.')
        : inputState === 'INVALID'
          ? t('المدخلات غير صالحة أو غير متسقة؛ راجع الحدود والوحدات والتاريخ.', 'Inputs are invalid or inconsistent; check bounds, units and date.')
          : t('أدخل كتلة ونتيجة اختبار وعدم يقين وبيانات المصدر المطلوبة.', 'Enter the sample mass, assay, uncertainty and required source metadata.')}
    </p>}
    <div className="flex gap-2">
      <button type="button" disabled={!parsedInput} onClick={onCalculate} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{t('احسب الكتلة الحسابية', 'Calculate arithmetic mass')}</button>
      <button type="button" onClick={() => { setDraft(initialDraft()); setResult(null); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{t('إعادة الضبط', 'Reset')}</button>
    </div>
    {result && <section aria-live="polite" className="space-y-2 rounded-xl border border-zinc-700 p-4 text-white">
      <h2 className="text-lg font-bold">{t('نتيجة حسابية فقط', 'Arithmetic result only')} · {result.resultType}</h2>
      <p>{t('الكتلة المركزية المحسوبة', 'Calculated central mass')}: <strong>{format(result.centralMass * ASSAY_MASS_TO_GRAMS[result.unit] / ASSAY_MASS_TO_GRAMS[massUnit], locale)} {massUnit}</strong></p>
      <p>{t('الحدان الحسابيان', 'Arithmetic bounds')}: {format(result.lowerArithmeticBound * ASSAY_MASS_TO_GRAMS[result.unit] / ASSAY_MASS_TO_GRAMS[massUnit], locale)}–{format(result.upperArithmeticBound * ASSAY_MASS_TO_GRAMS[result.unit] / ASSAY_MASS_TO_GRAMS[massUnit], locale)} {massUnit}</p>
      <p>{t('المعادلة', 'Formula')}: {t('كتلة العينة × نسبة الاختبار ÷ 100', 'sample mass × assay percentage ÷ 100')}</p>
      <dl className="grid gap-1 text-sm text-zinc-300">
        <div><dt className="inline font-semibold">{t('المصدر', 'Source')}: </dt><dd className="inline">{result.sourceReference}</dd></div>
        <div><dt className="inline font-semibold">{t('الطريقة', 'Method')}: </dt><dd className="inline">{result.methodDescription}</dd></div>
        <div><dt className="inline font-semibold">{t('تاريخ التقرير', 'Report date')}: </dt><dd className="inline">{result.reportDate}</dd></div>
        <div><dt className="inline font-semibold">{t('وصف عدم اليقين', 'Uncertainty description')}: </dt><dd className="inline">{result.uncertaintyDescription}</dd></div>
      </dl>
      <p className="text-sm text-amber-200">{t('المدخلات منقولة من المستخدم ولم يتم التحقق منها. النتيجة لا تثبت نقاء المادة أو جودتها أو صلاحيتها ولا توجه استخدامها.', 'Inputs were transcribed by the user and were not verified. This result does not establish purity, quality or suitability and does not guide use.')}</p>
    </section>}
  </main>;
}
