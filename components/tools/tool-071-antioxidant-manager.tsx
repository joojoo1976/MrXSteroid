'use client';

/**
 * components/tools/tool-071-antioxidant-manager.tsx
 * Tool #071 — Antioxidant Manager (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  assessAntioxidantDiversity,
  ANTIOXIDANT_CATEGORIES,
  type AntioxidantInput,
} from '@/lib/tools/engines/tool-071-antioxidant-manager';
import i18nJson from '@/i18n/tool-071-antioxidant-manager.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

const initial: AntioxidantInput = {
  berries: true,
  citrus: true,
  leafy_greens: true,
  cruciferous: false,
  nuts_seeds: true,
  olive_oil: true,
  spices_herbs: true,
  green_tea: false,
  dark_chocolate: false,
  legumes: true,
  whole_grains: true,
  fatty_fish: false,
};

export default function Tool071AntioxidantManager() {
  const t = useToolI18n(i18nJson);
  const [input, setInput] = useState<AntioxidantInput>(initial);
  const set = <K extends keyof AntioxidantInput>(k: K, v: AntioxidantInput[K]) =>
    setInput((p) => ({ ...p, [k]: v }));

  const result = useMemo(() => assessAntioxidantDiversity(input), [input]);

  return (
    <div className="antioxidant-manager-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ANTIOXIDANT_CATEGORIES.map((k) => (
          <label key={k} className="flex items-center gap-2">
            <input type="checkbox" checked={input[k]} onChange={(e) => set(k, e.target.checked)} />
            <span className="text-sm font-medium">{t[k]}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between"><span>{t.diversity_score}</span><span dir="ltr" className="font-mono">{result.diversity_score}</span></div>
        <div className="flex justify-between"><span>{t.categories_met}</span><span dir="ltr" className="font-mono">{result.categories_met}/{result.categories_total}</span></div>
        <div className="flex justify-between"><span>{t.band}</span><strong>{t[result.band] ?? result.band}</strong></div>
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">{t.contributing_factors}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.contributing_factors.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">{t.recommendations}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
