'use client';

import { useMemo, useState } from 'react';
import { StorageExcursionInputSchema, type StorageExcursionInput } from '@/lib/tools/schemas/tool-143-storage-stability-thermal-degradation-estimator';
import type { StorageExcursionResult } from '@/lib/tools/engines/tool-143-storage-stability-thermal-degradation-estimator.v6';
import { buildStorageExcursionOutput } from '@/lib/tools/adapters/tool-143-storage-stability-thermal-degradation-estimator';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type Draft = { productName: string; productState: '' | 'unopened' | 'in_use' | 'reconstituted'; queriedAt: string; labelReference: string; labelRangeMinC: string; labelRangeMaxC: string; observedMinC: string; observedMaxC: string };
const initial: Draft = { productName: '', productState: '', queriedAt: '', labelReference: '', labelRangeMinC: '', labelRangeMaxC: '', observedMinC: '', observedMaxC: '' };
const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';

export default function Tool143StorageLabelChecker() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const [draft, setDraft] = useState<Draft>(initial);
  const tr = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const numberOrUndefined = (value: string) => value.trim() === '' ? undefined : Number(value);
  const celsiusToDisplay = (celsius: number) => unitSystem === 'imperial' ? Number((celsius * 9 / 5 + 32).toFixed(4)) : celsius;
  const displayToCelsius = (temperature: number) => unitSystem === 'imperial' ? (temperature - 32) * 5 / 9 : temperature;
  const temperatureUnit = unitSystem === 'imperial' ? '°F' : '°C';
  const input = useMemo(() => {
    const candidate: StorageExcursionInput = {
      productName: draft.productName, productState: draft.productState || undefined, queriedAt: draft.queriedAt || undefined, labelReference: draft.labelReference,
      labelRangeMinC: numberOrUndefined(draft.labelRangeMinC), labelRangeMaxC: numberOrUndefined(draft.labelRangeMaxC), observedMinC: numberOrUndefined(draft.observedMinC), observedMaxC: numberOrUndefined(draft.observedMaxC),
    };
    const parsed = StorageExcursionInputSchema.safeParse(candidate);
    return parsed.success ? parsed.data : null;
  }, [draft]);
  const { output, calculate, reset } = useExplicitToolOutput<StorageExcursionInput, StorageExcursionResult>(input);
  const searchUrl = draft.productName.trim() ? `https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(draft.productName.trim())}` : '';
  const update = (key: keyof Draft, value: string) => {
    reset();
    setDraft((old) => key === 'productName'
      ? { ...old, productName: value, queriedAt: '', labelReference: '' }
      : { ...old, [key]: value });
  };
  const fieldClass = 'block text-sm text-zinc-200';
  const numberField = (key: keyof Draft, label: string) => {
    const canonical = draft[key] === '' ? '' : Number(draft[key]);
    const displayed = canonical === '' ? '' : String(Number(celsiusToDisplay(canonical).toFixed(4)));
    const min = unitSystem === 'imperial' ? -459.67 : -273.15;
    const max = unitSystem === 'imperial' ? 1832 : 1000;
    return <label className={fieldClass}>{label} ({temperatureUnit})<input data-r6-slider="true" className={inputClass} type="number" step="any" min={min} max={max} value={displayed} onChange={(event) => {
      const raw = event.target.value;
      update(key, raw === '' ? '' : String(displayToCelsius(Number(raw))));
    }} /></label>;
  };
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-black text-white">{tr('فاحص نطاق الملصق وسجل حرارة المنتج', 'Product Storage Label & Temperature Record Checker')}</h1></header>
    <p className="rounded-xl border border-amber-700/60 bg-amber-950/30 p-3 text-sm text-amber-100">{tr('مقارنة تعليمية للقراءات المدخلة مع نطاق منقول من ملصق DailyMed محدد. لا تحسب الثبات أو الفعالية، ولا تحكم على سلامة المنتج أو عقمه أو صلاحيته للاستخدام.', 'Educational comparison of entered readings with a range transcribed from a selected DailyMed label. No stability or potency is calculated and no safety, sterility or suitability-for-use decision is made.')}</p>
    <section className="grid gap-4 sm:grid-cols-2">
      <label className={`${fieldClass} sm:col-span-2`}>{tr('اسم المنتج كما يظهر في الملصق', 'Product name as shown on label')}<input className={inputClass} maxLength={160} value={draft.productName} onChange={(event) => update('productName', event.target.value)} /></label>
      <label className={fieldClass}>{tr('حالة المنتج في الملصق', 'Product state in label')}<select className={inputClass} value={draft.productState} onChange={(event) => update('productState', event.target.value as Draft['productState'])}><option value="">{tr('اختر الحالة', 'Select state')}</option><option value="unopened">{tr('غير مفتوح', 'Unopened')}</option><option value="in_use">{tr('قيد الاستخدام', 'In use')}</option><option value="reconstituted">{tr('بعد إعادة التحضير حسب الملصق', 'After label-directed reconstitution')}</option></select></label>
      <div className={`${fieldClass} flex items-end`}><a aria-disabled={!searchUrl} href={searchUrl || '#'} target="_blank" rel="noreferrer" onClick={(event) => { if (!searchUrl) { event.preventDefault(); return; } update('queriedAt', new Date().toISOString()); }} className={`inline-flex rounded-lg border px-4 py-2 text-sm ${searchUrl ? 'border-sky-500 text-sky-300' : 'pointer-events-none border-zinc-700 text-zinc-500'}`}>{tr('ابحث في DailyMed', 'Search DailyMed')}</a></div>
      <label className={fieldClass}>{tr('وقت الاستعلام المسجل', 'Recorded query time')}<input className={inputClass} type="text" readOnly value={draft.queriedAt} placeholder={tr('يفتح عند بدء البحث', 'Recorded when search is opened')} /></label>
      <label className={fieldClass}>{tr('رابط ملصق DailyMed أو Set ID', 'DailyMed label URL or Set ID')}<input className={inputClass} maxLength={1000} value={draft.labelReference} onChange={(event) => update('labelReference', event.target.value)} placeholder="https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=…" /></label>
      {numberField('labelRangeMinC', tr('أدنى حرارة التخزين في الملصق', 'Label storage minimum'))}
      {numberField('labelRangeMaxC', tr('أعلى حرارة التخزين في الملصق', 'Label storage maximum'))}
      {numberField('observedMinC', tr('أدنى قراءة مسجلة', 'Recorded minimum'))}
      {numberField('observedMaxC', tr('أعلى قراءة مسجلة', 'Recorded maximum'))}
    </section>
    <p className="text-xs text-zinc-400">{tr('DailyMed هو مصدر بحث للملصقات المقدمة من الشركات؛ قد تختلف نسخته عن أحدث ملصق معتمد لدى FDA. تحقق من هوية المنتج وحالته وانقل النطاق من ملصقه المحدد.', 'DailyMed is a search source for company-submitted labeling; its version may differ from the latest FDA-approved label. Verify product identity and state and transcribe the range from its specific label.')}</p>
    {!input && <p role="alert" className="text-sm text-amber-300">{tr('تحقق من أن كل حد أدنى لا يتجاوز الحد الأقصى وأن درجات الحرارة أرقام محدودة.', 'Check that every minimum is no greater than its maximum and that temperatures are finite numbers.')}</p>}
    <div className="flex gap-2"><button type="button" disabled={!input} onClick={() => input && calculate(input, buildStorageExcursionOutput, locale, unitSystem)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{tr('قارن البيانات', 'Compare record')}</button><button type="button" onClick={() => { reset(); setDraft(initial); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{tr('إعادة الضبط', 'Reset')}</button></div>
    {output && <ToolOutputSummary output={output} locale={locale} />}
  </main>;
}
