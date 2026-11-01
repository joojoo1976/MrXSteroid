'use client';

import React, { useState } from 'react';
import { recordStackItems, SynergyInputSchema } from '@/lib/tools/engines/tool-168-stacking-synergy.v7';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type Items = ReturnType<typeof recordStackItems>['items'];

export default function Tool168() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const ar = locale === 'ar';
  const [raw, setRaw] = useState('');
  const [lists, setLists] = useState<Items[]>([]);
  const [error, setError] = useState<string | null>(null);
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const add = () => {
    const items = raw.split(',').map((item) => item.trim());
    const parsed = SynergyInputSchema.safeParse({ items });
    if (!parsed.success) { setError(tr('أدخل من 1 إلى 30 اسماً غير فارغاً مفصولاً بفواصل؛ لا يتجاوز الاسم 100 حرف.', 'Enter 1–30 non-empty comma-separated names; each name must be at most 100 characters.')); return; }
    const result = recordStackItems(parsed.data);
    setLists((current) => [...current, result.items]);
    setError(null);
  };
  return <main className="mx-auto max-w-xl space-y-4 px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-black">{tr('سجل قائمة العناصر', 'Item List Record')}</h1>
    <p className="text-sm text-zinc-300">{tr('قائمة يكتبها المستخدم فقط. لا تحلل الأداة التآزر أو التوافق أو السلامة.', 'User-written list only. The tool does not analyze synergy, compatibility, or safety.')}</p>
    <p className="rounded border border-amber-700 p-3 text-sm text-amber-200">{tr('القوائم ظاهرة في الصفحة الحالية فقط ولا تُحفظ في الحساب أو قاعدة البيانات، وقد تختفي عند المغادرة أو التحديث.', 'Lists are shown only on the current page. They are not saved to your account or database and may disappear on navigation or refresh.')}</p>
    <label className="block space-y-1 text-sm">{tr('العناصر كما أدخلها المستخدم، مفصولة بفواصل', 'Items as entered by the user, separated by commas')}
      <textarea aria-label={tr('العناصر كما أدخلها المستخدم، مفصولة بفواصل', 'Items as entered by the user, separated by commas')} maxLength={3100} className="w-full rounded border bg-zinc-950 p-2 text-white" value={raw} onChange={(event) => { setRaw(event.target.value); setError(null); }} />
    </label>
    <button type="button" className="rounded bg-lime-500 px-4 py-2 font-bold text-black" onClick={add}>{tr('أضف القائمة إلى الصفحة', 'Add list to page')}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {lists.length > 0 && <section aria-live="polite" aria-label={tr('القوائم الحالية', 'Current page lists')}><h2 className="font-bold">{tr('القوائم الحالية', 'Current page lists')}</h2><ul className="space-y-2">{lists.map((items, index) => <li key={`${items.join('|')}-${index}`} className="rounded border border-zinc-700 p-3"><ul className="list-inside list-disc">{items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{item}</li>)}</ul><p className="mt-2 text-xs text-zinc-400">{tr('لم يتم استنتاج التآزر أو التوافق', 'No synergy or compatibility was inferred')}</p></li>)}</ul></section>}
  </main>;
}
