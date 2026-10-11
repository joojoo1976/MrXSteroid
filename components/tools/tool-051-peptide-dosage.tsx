'use client';

/**
 * components/tools/tool-051-peptide-dosage.tsx
 * Tool #051 — Peptide Dosage Calculator (concentration arithmetic only).
 */
import React, { useMemo, useState } from 'react';
import { calculatePeptideConcentration, type PeptideUnit } from '@/lib/tools/engines/tool-051-peptide-dosage';
import i18nJson from '@/i18n/tool-051-peptide-dosage.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool051PeptideDosage() {
  const t = useToolI18n(i18nJson);
  const [vialMg, setVialMg] = useState(5);
  const [diluentMl, setDiluentMl] = useState(2);
  const [unit, setUnit] = useState<PeptideUnit>('mcg');
  const [amount, setAmount] = useState(250);

  const result = useMemo(
    () =>
      calculatePeptideConcentration({
        vial_mg: vialMg, diluent_ml: diluentMl, unit,
        user_stated_amount: amount, syringe_units_per_ml: 100,
      }),
    [vialMg, diluentMl, unit, amount]
  );

  return (
    <div className="peptide-dosage-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block"><span className="block text-sm font-medium mb-1">{t.vial_mg}</span>
          <input type="number" dir="ltr" min={0} max={500} value={vialMg} onChange={(e) => setVialMg(Number(e.target.value))} className="w-full rounded border p-2" /></label>
        <label className="block"><span className="block text-sm font-medium mb-1">{t.diluent_ml}</span>
          <input type="number" dir="ltr" min={0.1} max={100} step={0.1} value={diluentMl} onChange={(e) => setDiluentMl(Number(e.target.value))} className="w-full rounded border p-2" /></label>
        <label className="block"><span className="block text-sm font-medium mb-1">{t.unit}</span>
          <select dir="ltr" value={unit} onChange={(e) => setUnit(e.target.value as PeptideUnit)} className="w-full rounded border p-2">
            <option value="mcg">mcg</option><option value="mg">mg</option><option value="iu">iu</option>
          </select></label>
        <label className="block"><span className="block text-sm font-medium mb-1">{t.user_stated_amount}</span>
          <input type="number" dir="ltr" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full rounded border p-2" /></label>
      </div>
      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.concentration_per_ml}</span><span dir="ltr" className="font-mono">{result.concentration_per_ml} {result.concentration_unit}/mL</span></div>
        <div className="flex justify-between"><span>{t.volume_for_stated_amount_ml}</span><span dir="ltr" className="font-mono">{result.volume_for_stated_amount_ml ?? '—'}</span></div>
        <div className="flex justify-between"><span>{t.syringe_ticks}</span><span dir="ltr" className="font-mono">{result.syringe_ticks_for_stated_amount ?? '—'}</span></div>
      </div>
      <div className="mt-4 rounded border border-amber-500 bg-amber-50 p-3 text-amber-900 text-sm">{result.non_prescriptive_notice}</div>
      <ul className="mt-4 list-disc ps-6 text-sm space-y-1">{result.safety_flags.map((f, i) => <li key={i}>{f}</li>)}</ul>
    </div>
  );
}
