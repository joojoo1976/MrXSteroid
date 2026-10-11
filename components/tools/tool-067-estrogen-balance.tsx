'use client';

/**
 * components/tools/tool-067-estrogen-balance.tsx
 * Tool #067 — Estrogen Balance Calculator (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessEstrogenBalance,
  type EstrogenBalanceInput,
  type Sex,
} from '@/lib/tools/engines/tool-067-estrogen-balance';
import i18nJson from '@/i18n/tool-067-estrogen-balance.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: EstrogenBalanceInput = {
  sex: 'male',
  estradiol_pg_ml: 25,
  total_testosterone_ng_dl: 600,
  shbg_nmol_l: 30,
  high_e2_symptoms: 0,
  low_e2_symptoms: 0,
};

export default function Tool067EstrogenBalance() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<EstrogenBalanceInput>(initial);
  const set = <K extends keyof EstrogenBalanceInput>(k: K, v: EstrogenBalanceInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessEstrogenBalance(input), [input]);

  const numField = (key: keyof EstrogenBalanceInput, label: string, min: number, max: number) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        value={input[key] as number}
        onChange={(e) => set(key, Number(e.target.value) as EstrogenBalanceInput[typeof key])}
        className="w-full rounded border p-2"
      />
    </label>
  );

  return (
    <div className="estrogen-balance-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.sex}</span>
          <select
            dir="ltr"
            value={input.sex}
            onChange={(e) => set('sex', e.target.value as Sex)}
            className="w-full rounded border p-2"
          >
            <option value="male">{t.male}</option>
            <option value="female">{t.female}</option>
          </select>
        </label>
        {numField('estradiol_pg_ml', t.estradiol_pg_ml, 0, 1000)}
        {numField('total_testosterone_ng_dl', t.total_testosterone_ng_dl, 0, 3000)}
        {numField('shbg_nmol_l', t.shbg_nmol_l, 1, 300)}
        {numField('high_e2_symptoms', t.high_e2_symptoms, 0, 3)}
        {numField('low_e2_symptoms', t.low_e2_symptoms, 0, 3)}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.e2_t_ratio}</span><span dir="ltr" className="font-mono">{result.e2_t_ratio}</span></div>
        <div className="flex justify-between"><span>{t.balance_index}</span><span dir="ltr" className="font-mono">{result.balance_index}</span></div>
        <div className="flex justify-between"><span>{t.classification}</span><strong>{t[result.classification] ?? result.classification}</strong></div>
      </div>

      {result.symptom_discordance && (
        <div role="alert" className="mt-4 rounded border border-amber-500 bg-amber-50 p-3 text-amber-900 text-sm">
          {t.symptom_discordance}
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-bold mb-2">{t.contributing_factors}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.contributing_factors.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">{t.education}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.education.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>

      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
