'use client';

import type { UnitSystem } from '@/lib/tools/contracts';

export default function UnitSystemToggle({ value, locale, onChange }: {
  value: UnitSystem;
  locale: 'ar' | 'en';
  onChange: (value: UnitSystem) => void;
}) {
  return <div role="group" aria-label={locale === 'ar' ? 'نظام الوحدات' : 'Unit system'} className="flex gap-1">
    {(['metric', 'imperial'] as const).map((system) => <button key={system} type="button" aria-pressed={value === system} onClick={() => onChange(system)} className={`rounded-lg px-2 py-1 text-[10px] font-bold ${value === system ? 'bg-sky-400 text-slate-950' : 'bg-zinc-800 text-zinc-300'}`}>
      {system === 'metric' ? (locale === 'ar' ? 'متري' : 'Metric') : (locale === 'ar' ? 'إمبراطوري' : 'Imperial')}
    </button>)}
  </div>;
}
