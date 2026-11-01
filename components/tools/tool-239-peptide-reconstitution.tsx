'use client';

import { useState } from 'react';
import { recordPeptideLabelReference } from '@/lib/tools/engines/tool-239-peptide-reconstitution.v7';
import { PeptideLabelReferenceInputV7Schema } from '@/lib/tools/schemas/tool-239-peptide-reconstitution.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

const inputClass = 'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';

export default function Tool239PeptideLabelReference() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const [draft, setDraft] = useState({ productName: '', manufacturer: '', sourceReference: '', note: '' });
  const [result, setResult] = useState<ReturnType<typeof recordPeptideLabelReference> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const update = (key: keyof typeof draft, value: string) => { setDraft((current) => ({ ...current, [key]: value })); setResult(null); setError(null); };
  const record = () => {
    const candidate = {
      productName: draft.productName,
      ...(draft.manufacturer.trim() ? { manufacturer: draft.manufacturer } : {}),
      sourceReference: draft.sourceReference,
      ...(draft.note.trim() ? { note: draft.note } : {}),
    };
    const parsed = PeptideLabelReferenceInputV7Schema.safeParse(candidate);
    if (!parsed.success) {
      setError(tr('أدخل اسم المنتج ومرجع الملصق أو تعليمات الشركة.', 'Enter the product name and a label or manufacturer-instruction reference.'));
      setResult(null);
      return;
    }
    setResult(recordPeptideLabelReference(parsed.data));
    setError(null);
  };
  const field = (key: keyof typeof draft, label: string, multiline = false) => <label className="block text-sm font-semibold text-zinc-200">{label}{multiline ? <textarea className={`${inputClass} min-h-24`} maxLength={400} value={draft[key]} onChange={(event) => update(key, event.target.value)} /> : <input className={inputClass} maxLength={500} value={draft[key]} onChange={(event) => update(key, event.target.value)} />}</label>;

  return <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 text-white" dir={isRtl ? 'rtl' : 'ltr'}>
    <header><h1 className="text-2xl font-black">{tr('سجل مرجع ملصق المنتج', 'Peptide Product Label Reference')}</h1><p className="mt-2 text-sm text-zinc-300">{tr('سجل اسم المنتج ومصدر التعليمات فقط. لا تتحقق الأداة من المصدر ولا تحسب التحضير أو التركيز أو الجرعة.', 'Record product identity and an instruction reference only. The tool does not verify sources or calculate preparation, concentration, or dose.')}</p></header>
    <p role="note" className="rounded-xl border border-rose-800 bg-rose-950/40 p-4 text-sm text-rose-100">{tr('لا تستخدم هذه الصفحة لتجهيز منتج. اتبع النشرة الحالية الخاصة بالمنتج واسأل الصيدلي أو الشركة المصنّعة عند غموض التعليمات.', 'Do not use this page to prepare a product. Follow its current product-specific labeling and contact a pharmacist or manufacturer if instructions are unclear.')}</p>
    <section className="grid gap-4 rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">{field('productName', tr('اسم المنتج كما يظهر على الملصق', 'Product name as labeled'))}{field('manufacturer', tr('الشركة المصنّعة (اختياري)', 'Manufacturer (optional)'))}{field('sourceReference', tr('رابط أو معرّف مرجع الملصق', 'Label source URL or reference ID'))}{field('note', tr('ملاحظة شخصية غير علاجية (اختياري)', 'Personal non-treatment note (optional)'), true)}</section>
    <button type="button" onClick={record} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black">{tr('سجل المرجع', 'Record reference')}</button>
    {error && <p role="alert" className="rounded-lg border border-amber-700 p-3 text-sm text-amber-200">{error}</p>}
    {result && <section role="status" className="space-y-2 rounded-xl border border-zinc-700 bg-zinc-900 p-4"><h2 className="font-bold">{tr('تم تسجيل المرجع؛ الحساب غير متاح', 'Reference recorded; calculation unavailable')}</h2><p>{result.entry.productName} · {result.entry.sourceReference}</p><p className="text-xs text-zinc-400">{tr('لم يتم جلب المرجع أو التحقق منه.', 'The reference was not fetched or verified.')}</p></section>}
  </main>;
}
