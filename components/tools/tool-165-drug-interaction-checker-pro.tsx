'use client';

import React, { useState } from 'react';
import { recordInteractionItems, InteractionInputSchema } from '@/lib/tools/engines/tool-165-drug-interaction.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type Items = ReturnType<typeof recordInteractionItems>['items'];

export default function Tool165() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [rawItems, setRawItems] = useState('');
  const [records, setRecords] = useState<Items[]>([]);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const add = () => {
    const items = rawItems.split(',').map((item) => item.trim());
    const parsed = InteractionInputSchema.safeParse({ items });
    if (!parsed.success) { setError(tr('أدخل من 1 إلى 30 اسماً غير فارغ، مفصولاً بفواصل؛ لا يتجاوز كل اسم 100 حرف.', 'Enter 1–30 non-empty comma-separated names; each name must be at most 100 characters.')); return; }
    const result = recordInteractionItems(parsed.data);
    setRecords((current) => [...current, result.items]);
    setError(null);
  };
  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('سجل قائمة المواد المدخلة', 'User-Entered Item List')}</h1>
    <p className="text-sm text-zinc-300">{tr('قائمة يكتبها المستخدم فقط؛ لا يُجرى فحص تداخل أو استنتاج أمان أو توصية علاجية.', 'User-entered list only; no interaction check, safety inference, or treatment recommendation is performed.')}</p>
    <p className="rounded border border-amber-700 p-3 text-sm text-amber-200">{tr('القوائم تبقى في حالة الصفحة الحالية فقط ولا تُحفظ في الحساب أو قاعدة البيانات، وقد تختفي عند مغادرة الصفحة أو تحديثها.', 'Lists remain only in the current page state. They are not saved to your account or database and may disappear on navigation or refresh.')}</p>
    <label className="block space-y-1 text-sm">{tr('الأسماء كما أدخلها المستخدم، مفصولة بفواصل', 'Names as entered by the user, separated by commas')}
      <textarea aria-label={tr('الأسماء كما أدخلها المستخدم، مفصولة بفواصل', 'Names as entered by the user, separated by commas')} maxLength={3100} className="w-full rounded border bg-zinc-950 p-2 text-white" value={rawItems} onChange={(event) => { setRawItems(event.target.value); setError(null); }} />
    </label>
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={add}>{tr('أضف القائمة إلى سجل الصفحة', 'Add list to page log')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {records.length > 0 && <section aria-live="polite" aria-label={tr('القوائم الحالية', 'Current page lists')}>
      <h2 className="font-bold">{tr('القوائم الحالية', 'Current page lists')}</h2>
      <ul className="space-y-2">{records.map((items, index) => <li key={`${items.join('|')}-${index}`} className="rounded border border-zinc-700 p-3"><ul className="list-inside list-disc">{items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{item}</li>)}</ul><p className="mt-2 text-xs text-zinc-400">{tr('قائمة مدخلة؛ لم يتم تحليل التفاعلات', 'User-entered list; interactions were not analyzed')}</p></li>)}</ul>
    </section>}
  </main>;
}
