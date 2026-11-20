'use client';
/**
 * components/tools/tool-044-dht-side-effects.tsx
 * Tool #044 — DHT Side Effect Predictor (R6.1 Parity Upgrade)
 * Full engineering parity with Tool 039 benchmark:
 * 1. P-01: Visual risk gauges for hair loss, prostate symptoms, and overall burden
 * 2. P-02: Weighted androgenic burden heuristics & mitigations
 * 3. P-03: Client-side privacy OCR lab report scanner
 * 4. P-04: Print-to-PDF consultation summary
 * 5. P-05: One-click deterministic synthetic demo data with overwrite guard
 * 6. 5-state lifecycle: EMPTY / PARTIAL / FULL / INVALID / DEGRADED
 * 7. Debounced R6 execution (120ms) & zero session persistence
 * 8. Tool-owned GENIUS-12 analytical boxes & responsive layout
 */
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { predictDhtEffects, type DhtResult } from '@/lib/tools/engines/tool-044-dht-side-effects';
import { buildDhtOutput } from '@/lib/tools/adapters/tool-044-dht-side-effects';
import { AUTO_DRAFT_DEBOUNCE_MS, buildAiContext, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { DhtInputSchema } from '@/lib/tools/schemas/tool-044-dht-side-effects';
import i18nJson from '@/i18n/tool-044-dht-side-effects.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

import Tool044Visual from './tool-044-dht-side-effects.visual';
import Tool044Genius from './tool-044-dht-side-effects.genius';
import Tool044OcrModal from './tool-044-dht-side-effects.ocr';
import Tool044PdfButton from './tool-044-dht-side-effects.pdf';

const TOOL_SLUG = 'tool-044-dht-side-effects';

interface DraftInputs {
  dht_ng_dl: number | null;
  uses_dht_derivative: boolean;
  five_ari: 'none' | 'finasteride' | 'dutasteride';
  family_history_hairloss: boolean;
  age: number | null;
  panelDate?: string;
}

const EMPTY_DRAFT: DraftInputs = {
  dht_ng_dl: null,
  uses_dht_derivative: false,
  five_ari: 'none',
  family_history_hairloss: false,
  age: null,
  panelDate: '',
};

const DEMO_DRAFT: DraftInputs = {
  dht_ng_dl: 115,
  uses_dht_derivative: true,
  five_ari: 'none',
  family_history_hairloss: false,
  age: 34,
  panelDate: '2026-03-10',
};

type LifecycleState = 'EMPTY' | 'PARTIAL' | 'FULL' | 'INVALID' | 'DEGRADED';

export default function Tool044DhtSideEffects() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const [inputs, setInputs] = useState<DraftInputs>(EMPTY_DRAFT);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Parity states
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [compactGenius, setCompactGenius] = useState(false);

  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const prevDraftKey = useRef('');

  // Validate and parse
  const parsed = useMemo(() => {
    if (inputs.dht_ng_dl === null || inputs.age === null) return null;
    return DhtInputSchema.safeParse({
      dht_ng_dl: inputs.dht_ng_dl,
      uses_dht_derivative: inputs.uses_dht_derivative,
      five_ari: inputs.five_ari,
      family_history_hairloss: inputs.family_history_hairloss,
      age: inputs.age,
    });
  }, [inputs]);

  // Lifecycle state
  const lifecycleState: LifecycleState = useMemo(() => {
    if (inputs.dht_ng_dl === null && inputs.age === null && !inputs.panelDate) {
      return 'EMPTY';
    }
    if (inputs.dht_ng_dl !== null && (inputs.dht_ng_dl < 5 || inputs.dht_ng_dl > 300)) {
      return 'INVALID';
    }
    if (inputs.age !== null && (inputs.age < 18 || inputs.age > 90)) {
      return 'INVALID';
    }
    if (inputs.dht_ng_dl === null || inputs.age === null) {
      return 'PARTIAL';
    }
    if (!parsed || !parsed.success) {
      return 'INVALID';
    }
    return 'FULL';
  }, [inputs, parsed]);

  const result = useMemo<DhtResult | null>(() => {
    if (!parsed || !parsed.success) return null;
    return predictDhtEffects(parsed.data);
  }, [parsed]);

  const aiContext = useMemo(() => {
    if (!result || !parsed || !parsed.success) return null;
    const now = '1970-01-01T00:00:00.000Z';
    const output = buildDhtOutput(parsed.data, {
      locale,
      unitSystem,
      snapshotType: 'draft',
      calculatedAt: now,
      recordedAt: now,
      timezone: 'UTC',
    });
    return buildAiContext({ ...output, result });
  }, [result, parsed, locale, unitSystem]);

  useEffect(() => {
    if (parsed && !parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Invalid input');
    } else {
      setValidationError(null);
    }
  }, [parsed]);

  const handleLoadDemo = () => {
    setInputs(DEMO_DRAFT);
    setIsDemoActive(true);
  };

  const handleClear = () => {
    setInputs(EMPTY_DRAFT);
    setIsDemoActive(false);
    clearDraft(TOOL_SLUG);
  };

  const handleOcrConfirm = (ocr: { dhtLevel?: string; panelDate?: string }) => {
    setIsDemoActive(false);
    setInputs(prev => ({
      ...prev,
      dht_ng_dl: ocr.dhtLevel ? Number(ocr.dhtLevel) : prev.dht_ng_dl,
      panelDate: ocr.panelDate ?? prev.panelDate,
    }));
  };

  const handleSave = async () => {
    if (!parsed || !parsed.success || !result) {
      setSaveStatus(isRtl ? 'أصلح أخطاء الإدخال أولاً' : 'Fix input errors first');
      return;
    }
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const output = buildDhtOutput(parsed.data, {
        locale,
        unitSystem,
        snapshotType: 'dashboard_projection',
        calculatedAt: now,
        recordedAt: now,
        timezone: 'UTC',
      });
      const { submitted, projection } = await commitDashboardSnapshot(output, parsed.data);
      if (submitted.ok && projection.ok) {
        await clearDraft(TOOL_SLUG);
        setSaveStatus(isRtl ? 'تم الحفظ في لوحة القيادة الحيوية' : 'Saved to Bio-Dashboard');
      } else {
        setSaveStatus(isRtl ? 'فشل الحفظ — سجّل الدخول أولاً' : 'Save failed — sign in first');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'} data-r6-state={lifecycleState}>
      {/* Header and Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-zinc-800 text-zinc-300">
              State: {lifecycleState}
            </span>
            {isDemoActive && (
              <span
                data-testid="synthetic-demo-badge"
                className="text-[11px] px-2 py-0.5 rounded font-medium bg-purple-950/60 text-purple-300 border border-purple-800"
              >
                Synthetic Demo — TT 1200, DHT 115, PSA 0.8
              </span>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOcrOpen(true)}
            className="text-xs px-3 py-1.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
          >
            Scan Lab Report
          </button>
          <button
            type="button"
            onClick={handleLoadDemo}
            className="text-xs px-3 py-1.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700 hover:bg-blue-800 transition"
          >
            Load Demo
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs px-3 py-1.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
          >
            Clear
          </button>
          <Tool044PdfButton
            result={result}
            dhtLevel={inputs.dht_ng_dl !== null ? String(inputs.dht_ng_dl) : ''}
            usesDhtDerivative={inputs.uses_dht_derivative}
            fiveAri={inputs.five_ari}
            familyHistoryHairloss={inputs.family_history_hairloss}
            age={inputs.age !== null ? String(inputs.age) : ''}
            panelDate={inputs.panelDate}
            locale={locale}
          />
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <label className="text-[10px] font-bold text-zinc-500">
          {t.dht}
          <input
            data-r6-field="dhtLevel"
            type="number"
            min={5}
            max={300}
            value={inputs.dht_ng_dl ?? ''}
            onChange={e => {
              setIsDemoActive(false);
              setInputs(p => ({ ...p, dht_ng_dl: e.target.value === '' ? null : Number(e.target.value) }));
            }}
            className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono"
          />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.age}
          <input
            data-r6-field="age"
            type="number"
            min={18}
            max={90}
            value={inputs.age ?? ''}
            onChange={e => {
              setIsDemoActive(false);
              setInputs(p => ({ ...p, age: e.target.value === '' ? null : Number(e.target.value) }));
            }}
            className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white font-mono"
          />
        </label>
        <label className="text-[10px] font-bold text-zinc-500">
          {t.five_ari}
          <select
            data-r6-field="fiveAri"
            value={inputs.five_ari}
            onChange={e => {
              setIsDemoActive(false);
              setInputs(p => ({ ...p, five_ari: e.target.value as any }));
            }}
            className="mt-0.5 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-2 py-1.5 text-xs text-white"
          >
            <option value="none">None</option>
            <option value="finasteride">Finasteride</option>
            <option value="dutasteride">Dutasteride</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
          <input
            data-r6-field="usesDhtDerivative"
            type="checkbox"
            checked={inputs.uses_dht_derivative}
            onChange={e => {
              setIsDemoActive(false);
              setInputs(p => ({ ...p, uses_dht_derivative: e.target.checked }));
            }}
            className="accent-lime-500"
          />
          {t.derivative}
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2">
          <input
            data-r6-field="familyHistoryHairloss"
            type="checkbox"
            checked={inputs.family_history_hairloss}
            onChange={e => {
              setIsDemoActive(false);
              setInputs(p => ({ ...p, family_history_hairloss: e.target.checked }));
            }}
            className="accent-lime-500"
          />
          {t.family_history}
        </label>
      </div>

      {validationError && (
        <p className="mb-3 text-xs font-bold text-red-400">⚠️ {validationError}</p>
      )}

      {/* Legacy result summary */}
      {result && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <div className="grid grid-cols-4 gap-3 text-center mb-4">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.band}</span>
              <span className={`text-xl font-bold font-mono ${
                result.band === 'high' ? 'text-red-400' :
                result.band === 'moderate' ? 'text-amber-400' :
                'text-lime-400'
              }`}>
                {result.band}
              </span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.hair_risk}</span>
              <span className="text-xl font-bold font-mono text-rose-400">{result.hair_loss_risk_pct}%</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.prostate_risk}</span>
              <span className="text-xl font-bold font-mono text-sky-400">{result.prostate_symptom_risk_pct}%</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block">{t.overall}</span>
              <span className="text-xl font-bold font-mono text-amber-400">{result.overall_burden_pct}%</span>
            </div>
          </div>
          {result.mitigations.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 mb-3">
              <span className="text-[10px] font-bold text-amber-400 block mb-1">{t.mitigations}</span>
              <ul className="space-y-0.5 text-xs text-amber-300">
                {result.mitigations.map((m, i) => <li key={i}>• {m}</li>)}
              </ul>
            </div>
          )}
          <div className="flex flex-col md:flex-row justify-between items-center pt-3 mt-3 border-t border-zinc-800 gap-3">
            <span className="text-xs text-zinc-500 font-mono">{saveStatus}</span>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto px-5 py-2 text-xs font-bold bg-lime-500 hover:bg-lime-400 text-slate-950 rounded-lg transition disabled:opacity-50"
            >
              {isSaving ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ في لوحة القيادة الحيوية' : 'Save to Bio-Dashboard')}
            </button>
          </div>
        </div>
      )}

      {/* P-01 Visual Range Layer */}
      <Tool044Visual
        dhtLevel={inputs.dht_ng_dl}
        result={result}
        locale={locale}
      />

      {/* GENIUS-12 Framework */}
      <Tool044Genius
        result={result}
        dhtLevel={inputs.dht_ng_dl !== null ? String(inputs.dht_ng_dl) : ''}
        usesDhtDerivative={inputs.uses_dht_derivative}
        fiveAri={inputs.five_ari}
        familyHistoryHairloss={inputs.family_history_hairloss}
        age={inputs.age !== null ? String(inputs.age) : ''}
        panelDate={inputs.panelDate}
        compact={compactGenius}
        onToggleCompact={() => setCompactGenius(c => !c)}
        locale={locale}
      />

      <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition">
          <span>← </span><span>{isRtl ? `الأداة السابقة: ${neighbors.prevTool.titleAr}` : `Prev Tool: ${neighbors.prevTool.titleEn}`}</span>
        </a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition">
          <span>{isRtl ? `الأداة التالية: ${neighbors.nextTool.titleAr}` : `Next Tool: ${neighbors.nextTool.titleEn}`}</span><span>→</span>
        </a>
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>

      {/* OCR Modal */}
      <Tool044OcrModal
        open={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onConfirm={handleOcrConfirm}
        locale={locale}
      />
    </div>
  );
}
