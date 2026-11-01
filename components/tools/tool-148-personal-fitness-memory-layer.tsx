'use client';

import { useState } from 'react';
import { useTool148SessionContext } from '@/context/SmartToolsSessionContext';
import type { PersonalFitnessContextField } from '@/lib/tools/schemas/tool-148-personal-fitness-memory-layer';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
const kgPerLb = 1 / 2.20462;

function createSessionItemId() {
  const uuid = globalThis.crypto?.randomUUID?.();
  return `session-fitness-${uuid ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
}

export default function Tool148PersonalFitnessMemoryLayer() {
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const { items, addItem, removeItem, setShareWithTool149, clearItems } = useTool148SessionContext();
  const ar = locale === 'ar';
  const tr = (arabic: string, english: string) => ar ? arabic : english;
  const [field, setField] = useState<PersonalFitnessContextField>('current_weight_kg');
  const [value, setValue] = useState('');
  const [source, setSource] = useState('');
  const [recordedOn, setRecordedOn] = useState('');
  const [shareWithTool149, setShare] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isWeight = field === 'current_weight_kg';
  const inputUnit = isWeight && unitSystem === 'imperial' ? 'lb' : isWeight ? 'kg' : '%';
  const valueToCanonical = () => {
    const parsed = Number(value);
    return isWeight && unitSystem === 'imperial' ? parsed * kgPerLb : parsed;
  };
  const displayItemValue = (item: (typeof items)[number]) => item.field === 'current_weight_kg' && unitSystem === 'imperial'
    ? `${Number((item.value / kgPerLb).toFixed(2))} lb`
    : `${item.value} ${item.unit}`;
  const fieldLabel = (key: PersonalFitnessContextField) => ({
    current_weight_kg: tr('الوزن الحالي', 'Current weight'),
    current_body_fat_pct: tr('نسبة الدهون الحالية', 'Current body-fat percentage'),
    target_body_fat_pct: tr('نسبة الدهون المستهدفة', 'Target body-fat percentage'),
  }[key]);

  const save = () => {
    const id = createSessionItemId();
    const result = addItem({
      id,
      field,
      value: valueToCanonical(),
      unit: isWeight ? 'kg' : '%',
      source,
      recordedOn,
      shareWithTool149,
    });
    if (!result.ok) {
      setError(result.errors.map((item) => `${item.field}: ${item.message}`).join(' '));
      return;
    }
    setValue('');
    setSource('');
    setRecordedOn('');
    setShare(false);
    setError(null);
  };

  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
    <header>
      <h1 className="text-2xl font-black text-white">{tr('ذاكرة اللياقة المؤقتة للجلسة', 'Session-only Personal Fitness Context')}</h1>
      <p className="mt-2 text-sm text-zinc-300">{tr(
        'أضف قيماً منظمة تستخدمها أثناء جلسة التصفح الحالية. هذه الأداة لا تحفظ البيانات بعد مغادرة SmartTools.',
        'Add structured values for the current browsing session. This tool does not retain data after you leave SmartTools.',
      )}</p>
    </header>

    <section className="space-y-2 rounded-xl border border-amber-700 bg-amber-950/30 p-4 text-sm text-amber-100" aria-label={tr('حدود الخصوصية', 'Privacy boundaries')}>
      <p>{tr('تُحفظ القيم في ذاكرة الصفحة فقط، ولا تستخدم localStorage أو sessionStorage أو Supabase أو الشبكة. تحديث الصفحة أو مغادرة SmartTools يمسحها.', 'Values live only in in-memory page state. No localStorage, sessionStorage, Supabase, or network is used. Refreshing or leaving SmartTools clears them.')}</p>
      <p>{tr('لا تضف اسماً أو بريداً أو بيانات تعريفية. المشاركة مع الأداة 149 متوقفة افتراضياً. عند تفعيلها لقيمة محددة، لا يُشارك سوى نوع قيمة الوزن أو نسبة الدهون والقيمة والوحدة؛ يظل المصدر والتاريخ داخل الأداة 148 ولا ينتقلان إلى الأداة 149.', 'Do not add names, email addresses, or identifying details. Sharing with Tool 149 is off by default. Enabling it for a specific item shares only the weight/body-fat field, value, and unit; source and date stay in Tool 148 and are not transferred to Tool 149.')}</p>
      <p>{tr('تظل الإتاحة داخل جلسة SmartTools الحالية وتنتهي عند تحديث الصفحة أو مغادرة SmartTools. ألغِها بإيقاف مربع السماح بجوار القيمة أو بحذفها؛ عند الإلغاء تُمسح القيمة المستوردة المرتبطة بها من نموذج الأداة 149. زر مسح بيانات الجلسة يحذف كل القيم والإتاحات فوراً. لن تُخزّن دائماً أو تُرسل إلى جهة خارجية.', 'Access lasts only for the current SmartTools session and ends when you refresh or leave SmartTools. Revoke it by unchecking the item’s sharing box or removing it; revocation also clears the linked imported value from Tool 149. Clear session data immediately removes all values and grants. Nothing is persistently stored or sent to an external party.')}</p>
      <p>{tr('المصدر والتاريخ يكتبهما المستخدم ولا تتحقق الأداة منهما أو من حداثة القياس.', 'Source and date are user-entered; this tool does not verify them or assess measurement freshness.')}</p>
    </section>

    <section className="grid gap-3 sm:grid-cols-2" aria-label={tr('إضافة سياق لياقة', 'Add fitness context')}>
      <label className="text-xs text-zinc-300">{tr('نوع القيمة', 'Value type')}
        <select className={inputClass} value={field} onChange={(event) => { setField(event.target.value as PersonalFitnessContextField); setValue(''); }}>
          <option value="current_weight_kg">{fieldLabel('current_weight_kg')}</option>
          <option value="current_body_fat_pct">{fieldLabel('current_body_fat_pct')}</option>
          <option value="target_body_fat_pct">{fieldLabel('target_body_fat_pct')}</option>
        </select>
      </label>
      <label className="text-xs text-zinc-300">{fieldLabel(field)} ({inputUnit})
        <input aria-label={`${fieldLabel(field)} (${inputUnit})`} className={inputClass} type="number" min="0" step="any" value={value} onChange={(event) => setValue(event.target.value)} />
      </label>
      <label className="text-xs text-zinc-300">{tr('مصدر القيمة', 'Value source')}
        <input aria-label={tr('مصدر القيمة', 'Value source')} className={inputClass} type="text" maxLength={160} value={source} onChange={(event) => setSource(event.target.value)} />
      </label>
      <label className="text-xs text-zinc-300">{tr('تاريخ القياس', 'Measurement date')}
        <input aria-label={tr('تاريخ القياس', 'Measurement date')} className={inputClass} type="date" value={recordedOn} onChange={(event) => setRecordedOn(event.target.value)} />
      </label>
    </section>

    <label className="flex items-start gap-2 text-sm text-zinc-200">
      <input className="mt-1" type="checkbox" checked={shareWithTool149} onChange={(event) => setShare(event.target.checked)} />
      <span>{tr(`أوافق على إتاحة ${fieldLabel(field)} (${value || '—'} ${inputUnit}) ووحدتها للأداة 149 خلال هذه الجلسة فقط. لن يُشارك المصدر أو التاريخ. سأختار القيمة وأؤكد الاستيراد هناك.`, `I allow Tool 149 to access this ${fieldLabel(field)} (${value || '—'} ${inputUnit}) and its unit during this session only. The source and date are not shared. I will select the value and confirm import there.`)}</span>
    </label>

    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={!value || !source.trim() || !recordedOn} onClick={save} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{tr('إضافة إلى الجلسة', 'Add to this session')}</button>
      <button type="button" disabled={items.length === 0} onClick={clearItems} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white disabled:opacity-40">{tr('مسح بيانات الجلسة', 'Clear session data')}</button>
    </div>
    {error && <p role="alert" className="text-sm text-red-300">INVALID_INPUT · {error}</p>}

    <section className="space-y-3" aria-label={tr('قيم هذه الجلسة', 'This session’s values')}>
      <h2 className="font-bold text-white">{tr('قيم هذه الجلسة', 'This session’s values')}</h2>
      {items.length === 0 && <p className="text-sm text-zinc-400">{tr('لا توجد قيم محفوظة في الذاكرة المؤقتة.', 'No values are held in session memory.')}</p>}
      {items.map((item) => <article key={item.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-zinc-700 p-4">
        <div className="space-y-1 text-sm">
          <h3 className="font-bold text-white">{fieldLabel(item.field)}: {displayItemValue(item)}</h3>
          <p className="text-zinc-300">{tr('المصدر', 'Source')}: {item.source} · {tr('التاريخ', 'Date')}: {item.recordedOn}</p>
          <p className="text-xs text-zinc-400">{item.shareWithTool149 ? tr('القيمة ووحدتها فقط متاحتان للأداة 149 داخل الجلسة؛ المصدر والتاريخ يظلان خاصين بهذه الأداة. لم تُنسخ القيمة إلى نموذج 149 حتى تؤكد الاستيراد هناك. أوقف السماح أو احذف القيمة لإلغاء الإتاحة.', 'Only the value and unit are available to Tool 149 during this session; source and date remain private here. The value is not copied into Tool 149 until you confirm import there. Uncheck sharing or remove this item to revoke access.') : tr('خاص بهذه الأداة؛ لا تراه الأداة 149 حتى تمنح الإذن هنا.', 'Private to this tool; Tool 149 cannot see it until you grant access here.')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <input aria-label={tr(`إتاحة ${fieldLabel(item.field)} للأداة 149`, `Allow Tool 149 to access ${fieldLabel(item.field)}`)} type="checkbox" checked={item.shareWithTool149} onChange={(event) => setShareWithTool149(item.id, event.target.checked)} />
            {tr('إتاحة هذه القيمة للأداة 149', 'Allow Tool 149 to access this value')}
          </label>
          <button type="button" onClick={() => removeItem(item.id)} className="rounded-lg border border-zinc-600 px-3 py-2 text-xs text-white">{tr('حذف', 'Remove')}</button>
        </div>
      </article>)}
    </section>
  </main>;
}
