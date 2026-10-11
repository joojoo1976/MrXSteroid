'use client';

/** components/tools/tool-053-insulin-conversion.tsx — Tool #053 (educational). */
import React, { useMemo, useState } from 'react';
import { convertInsulin, type InsulinConcentration } from '@/lib/tools/engines/tool-053-insulin-conversion';
import i18nJson from '@/i18n/tool-053-insulin-conversion.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool053InsulinConversion() {
  const t = useToolI18n(i18nJson);
  const [concentration, setConcentration] = useState<InsulinConcentration>('U-100');
  const [units, setUnits] = useState(20);
  const [hypo, setHypo] = useState(false);

  const result = useMemo(
    () => convertInsulin({ concentration, units, hypoglycaemia_symptoms: hypo }),
    [concentration, units, hypo]
  );

  return (
    <div className="insulin-conversion-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block"><span className="block text-sm font-medium mb-1">{t.concentration}</span>
          <select dir="ltr" value={concentration} onChange={(e) => setConcentration(e.target.value as InsulinConcentration)} className="w-full rounded border p-2">
            <option value="U-100">U-100</option><option value="U-40">U-40</option><option value="U-500">U-500</option>
          </select></label>
        <label className="block"><span className="block text-sm font-medium mb-1">{t.units}</span>
          <input type="number" dir="ltr" min={0} max={10000} value={units} onChange={(e) => setUnits(Number(e.target.value))} className="w-full rounded border p-2" /></label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={hypo} onChange={(e) => setHypo(e.target.checked)} />
          <span className="text-sm font-medium">{t.hypo_symptoms}</span>
        </label>
      </div>
      {result.emergency && (
        <div role="alert" className="mt-4 rounded border-2 border-red-600 bg-red-50 p-3 text-red-800 text-sm font-bold">{result.emergency_message}</div>
      )}
      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.units_per_ml}</span><span dir="ltr" className="font-mono">{result.units_per_ml}</span></div>
        <div className="flex justify-between"><span>{t.volume_ml}</span><span dir="ltr" className="font-mono">{result.volume_ml ?? '—'}</span></div>
      </div>
      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
