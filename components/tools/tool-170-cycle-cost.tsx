'use client';

import React, { useState } from 'react';
import { calculateCost, CostInputSchema } from '@/lib/tools/engines/tool-170-cycle-cost.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type CostItem = { id: number; label: string; cost: string };

export default function Tool170() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [items, setItems] = useState<CostItem[]>([{ id: 1, label: '', cost: '' }]);
  const [currency, setCurrency] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateCost> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const update = (id: number, patch: Partial<CostItem>) => { setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item)); setResult(null); setError(null); };
  const calculate = () => {
    const parsed = CostInputSchema.safeParse({
      items: items.map((item) => ({ label: item.label, cost: item.cost === '' ? Number.NaN : Number(item.cost) })),
      currency,
    });
    if (!parsed.success) { setResult(null); setError(tr('أدخل اسماً وتكلفة غير سالبة لكل بند، وحدد رمز العملة كما أدخلته.', 'Enter a label and non-negative cost for every item, and specify the currency code as entered.')); return; }
    setResult(calculateCost(parsed.data));
    setError(null);
  };
  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('جمع التكاليف المدخلة', 'Sum User-Entered Costs')}</h1>
    <p className="text-sm text-zinc-300">{tr('يجمع القيم التي تدخلها فقط. لا يقدم توصية بدورة أو شراء، ولا يتحقق من الأسعار أو العملة.', 'Sums only the values you enter. It does not recommend a cycle or purchase and does not verify prices or currency.')}</p>
    <div className="space-y-3">
      {items.map((item, index) => <fieldset key={item.id} className="space-y-2 rounded border border-zinc-700 p-3">
        <legend className="px-1 text-sm">{tr('بند', 'Item')} {index + 1}</legend>
        <label className="block space-y-1 text-sm">{tr('وصف البند', 'Item label')}
          <input aria-label={`${tr('وصف البند', 'Item label')} ${index + 1}`} maxLength={100} className="w-full rounded border bg-zinc-950 p-2 text-white" value={item.label} onChange={(event) => update(item.id, { label: event.target.value })} />
        </label>
        <label className="block space-y-1 text-sm">{tr('التكلفة كما أدخلتها', 'Cost as entered')}
          <input aria-label={`${tr('التكلفة كما أدخلتها', 'Cost as entered')} ${index + 1}`} type="number" min="0" max="1000000" step="any" inputMode="decimal" className="w-full rounded border bg-zinc-950 p-2 text-white" value={item.cost} onChange={(event) => update(item.id, { cost: event.target.value })} />
        </label>
        {items.length > 1 && <button type="button" className="text-xs text-red-300 underline" onClick={() => { setItems((current) => current.filter((entry) => entry.id !== item.id)); setResult(null); }}>{tr('إزالة البند', 'Remove item')}</button>}
      </fieldset>)}
    </div>
    <button type="button" disabled={items.length >= 100} className="rounded border border-zinc-600 px-3 py-2 text-sm disabled:opacity-50" onClick={() => setItems((current) => [...current, { id: Date.now() + current.length, label: '', cost: '' }])}>{tr('أضف بنداً', 'Add item')}</button>
    <label className="block space-y-1 text-sm">{tr('رمز العملة كما أدخلته', 'Currency code as entered')}
      <input aria-label={tr('رمز العملة كما أدخلته', 'Currency code as entered')} maxLength={10} className="w-full rounded border bg-zinc-950 p-2 text-white" value={currency} onChange={(event) => { setCurrency(event.target.value); setResult(null); setError(null); }} />
    </label>
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={calculate}>{tr('احسب المجموع', 'Calculate sum')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {result && <section aria-live="polite" aria-label={tr('نتيجة مجموع التكلفة', 'Cost sum result')} className="rounded border border-zinc-700 p-4">
      <h2 className="font-bold">{tr('المجموع الحسابي', 'Arithmetic total')}: {result.total} {result.currency}</h2>
      <p className="text-xs text-zinc-400">{result.status} · {tr('جمع فقط', 'Sum only')}</p>
      <ul className="list-inside list-disc text-sm">{items.map((item, index) => <li key={`${item.id}-${index}`}>{item.label}: {item.cost} {result.currency}</li>)}</ul>
      <p className="mt-2 text-sm text-amber-200">{tr('لا يقدم توصية بدورة أو شراء.', 'No cycle or purchase recommendation is provided.')}</p>
    </section>}
  </main>;
}
