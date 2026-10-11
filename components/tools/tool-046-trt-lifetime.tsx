'use client';

/**
 * components/tools/tool-046-trt-lifetime.tsx
 * Tool #046 — TRT Lifetime Calculator (client UI). Educational only.
 */
import React, { useMemo, useState } from 'react';
import {
  calculateTrtLifetime,
  TRT_ESTER_PROFILES,
  type TrtEster,
} from '@/lib/tools/engines/tool-046-trt-lifetime';
import i18nJson from '@/i18n/tool-046-trt-lifetime.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import MeasurementToggle from './MeasurementToggle';

const ESTERS = Object.keys(TRT_ESTER_PROFILES) as TrtEster[];

export default function Tool046TrtLifetime() {
  const t = useToolI18n(i18nJson);
  const [dose, setDose] = useState(100);
  const [ester, setEster] = useState<TrtEster>('cypionate');
  const [intervalDays, setIntervalDays] = useState(7);
  const [years, setYears] = useState(5);
  const [age, setAge] = useState(45);
  const [baselineHct, setBaselineHct] = useState(45);
  const [cvFactors, setCvFactors] = useState(0);

  const result = useMemo(
    () =>
      calculateTrtLifetime({
        weekly_dose_mg: dose,
        ester,
        injection_interval_days: intervalDays,
        planned_years: years,
        age,
        baseline_hematocrit_pct: baselineHct,
        cardiovascular_risk_factors: cvFactors,
      }),
    [dose, ester, intervalDays, years, age, baselineHct, cvFactors]
  );

  const num = (v: number) => (
    <span dir="ltr" className="font-mono">
      {v}
    </span>
  );

  return (
    <div className="trt-lifetime-tool p-6" dir={t.dir}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>
      <MeasurementToggle />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.weekly_dose_mg}</span>
          <input
            type="number"
            dir="ltr"
            min={10}
            max={600}
            value={dose}
            onChange={(e) => setDose(Number(e.target.value))}
            className="w-full rounded border p-2"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.ester}</span>
          <select
            dir="ltr"
            value={ester}
            onChange={(e) => setEster(e.target.value as TrtEster)}
            className="w-full rounded border p-2"
          >
            {ESTERS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.injection_interval_days}</span>
          <input
            type="number"
            dir="ltr"
            min={0.5}
            max={90}
            step={0.5}
            value={intervalDays}
            onChange={(e) => setIntervalDays(Number(e.target.value))}
            className="w-full rounded border p-2"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.planned_years}</span>
          <input
            type="number"
            dir="ltr"
            min={0.1}
            max={40}
            step={0.5}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full rounded border p-2"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.age}</span>
          <input
            type="number"
            dir="ltr"
            min={16}
            max={100}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full rounded border p-2"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.baseline_hematocrit_pct}</span>
          <input
            type="number"
            dir="ltr"
            min={30}
            max={60}
            value={baselineHct}
            onChange={(e) => setBaselineHct(Number(e.target.value))}
            className="w-full rounded border p-2"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">{t.cardiovascular_risk_factors}</span>
          <input
            type="number"
            dir="ltr"
            min={0}
            max={6}
            value={cvFactors}
            onChange={(e) => setCvFactors(Number(e.target.value))}
            className="w-full rounded border p-2"
          />
        </label>
      </div>

      <div className="mt-6 rounded border p-4 space-y-2">
        <div className="flex justify-between">
          <span>{t.weekly_active_mg}</span>
          {num(result.weekly_active_mg)}
        </div>
        <div className="flex justify-between">
          <span>{t.cumulative_active_g}</span>
          {num(result.cumulative_active_g)}
        </div>
        <div className="flex justify-between">
          <span>{t.accumulation_ratio}</span>
          {num(result.accumulation_ratio)}
        </div>
        <div className="flex justify-between">
          <span>{t.exposure_index}</span>
          {num(result.exposure_index)}
        </div>
        <div className="flex justify-between">
          <span>{t.projected_hematocrit_pct}</span>
          {num(result.projected_hematocrit_pct)}
        </div>
        <div className="flex justify-between">
          <span>{t.hematocrit_monitoring}</span>
          {num(result.monitoring.hematocrit_months)}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">{t.safety_flags}</h3>
        <ul className="list-disc ps-6 text-sm space-y-1">
          {result.safety_flags.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs text-zinc-500">{result.educational_notice}</p>
    </div>
  );
}
