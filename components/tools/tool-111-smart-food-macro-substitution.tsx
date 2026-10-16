'use client';

import React, { useState, useCallback } from 'react';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-111-smart-food-macro-substitution.json';
import { tryParseTool111Input } from '@/lib/tools/schemas/tool-111-smart-food-macro-substitution';
import { tool111Adapter } from '@/lib/tools/adapters/tool-111-smart-food-macro-substitution';
import type { EngineInput, SubstitutionResult } from '@/lib/tools/engines/staging/tool-111-smart-food-macro-substitution-engine';

type MacroFields = { protein: string; carbs: string; fat: string; calories: string };

const MACRO_FIELDS = ['protein', 'carbs', 'fat', 'calories'] as const;

const EMPTY_MACROS: MacroFields = { protein: '', carbs: '', fat: '', calories: '' };

const EMPTY_FOOD: Omit<EngineInput['originalFood'], 'macrosPer100g'> = {
  id: '', name: '', nameEn: '',
  category: 'OTHER', dataSource: 'estimated', dataQuality: 'medium', lastUpdated: '',
};

const ALL_UNITS: EngineInput['originalUnit'][] = [
  'g', 'kg', 'oz', 'lb', 'ml', 'l', 'fl_oz', 'cup', 'tbsp', 'tsp', 'piece', 'slice',
];

const ALL_CATEGORIES: EngineInput['originalFood']['category'][] = [
  'PROTEIN', 'CARBS', 'FAT', 'DAIRY', 'VEGETABLE', 'FRUIT', 'GRAIN',
  'LEGUME', 'NUT_SEED', 'MEAT', 'POULTRY', 'FISH', 'EGG', 'PROCESSED',
  'SUPPLEMENT', 'OTHER',
];

const ALL_DATA_SOURCES: EngineInput['originalFood']['dataSource'][] = [
  'USDA', 'brand', 'manufacturer', 'estimated',
];

const ALL_DATA_QUALITIES: EngineInput['originalFood']['dataQuality'][] = [
  'high', 'medium', 'low',
];

type FormData = {
  originalFood: Omit<EngineInput['originalFood'], 'macrosPer100g'>;
  substituteFood: Omit<EngineInput['originalFood'], 'macrosPer100g'>;
  originalMacros: MacroFields;
  substituteMacros: MacroFields;
  originalQuantity: string;
  originalUnit: EngineInput['originalUnit'];
  targetProtein: string;
  targetCarbs: string;
  targetFat: string;
  targetCalories: string;
  unitSystem: EngineInput['unitSystem'];
  locale: EngineInput['locale'];
};

type ValidationErrors = {
  originalFood?: string; substituteFood?: string;
  originalMacros?: string; substituteMacros?: string;
  originalQuantity?: string;
  originalUnit?: string; targetMacros?: string; unitSystem?: string;
  locale?: string; general?: string;
};

type DisplayState = 'idle' | 'validating' | 'success' | 'error';

function emptyFormData(): FormData {
  return {
    originalFood: { ...EMPTY_FOOD }, substituteFood: { ...EMPTY_FOOD },
    originalMacros: { ...EMPTY_MACROS }, substituteMacros: { ...EMPTY_MACROS },
    originalQuantity: '100', originalUnit: 'g',
    targetProtein: '', targetCarbs: '', targetFat: '', targetCalories: '',
    unitSystem: 'metric', locale: 'en',
  };
}

/** Parses a macro text field; returns null when empty or not a finite number ≥ 0. */
function parseMacroInput(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
}

/** True only when all four macros were explicitly entered as valid numbers. */
function macrosComplete(macros: MacroFields): boolean {
  return MACRO_FIELDS.every((key) => parseMacroInput(macros[key]) !== null);
}

/** Converts validated macro text fields into the engine's numeric profile. */
function toMacroProfile(macros: MacroFields): EngineInput['originalFood']['macrosPer100g'] {
  return {
    protein: parseMacroInput(macros.protein) ?? 0,
    carbs: parseMacroInput(macros.carbs) ?? 0,
    fat: parseMacroInput(macros.fat) ?? 0,
    calories: parseMacroInput(macros.calories) ?? 0,
  };
}

export default function Tool111SmartFoodMacroSubstitution() {
  const t = useToolI18n(i18nJson);
  const isRtl = t.dir === 'rtl';

  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [displayState, setDisplayState] = useState<DisplayState>('idle');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [result, setResult] = useState<SubstitutionResult | null>(null);
  const [output, setOutput] = useState<any>(null);
  const [adapterError, setAdapterError] = useState<string | null>(null);

  const buildEngineInput = useCallback((fd: FormData): EngineInput => {
    const targetMacros: EngineInput['targetMacros'] = {};
    if (fd.targetProtein.trim() !== '') targetMacros.protein = parseFloat(fd.targetProtein) || 0;
    if (fd.targetCarbs.trim() !== '') targetMacros.carbs = parseFloat(fd.targetCarbs) || 0;
    if (fd.targetFat.trim() !== '') targetMacros.fat = parseFloat(fd.targetFat) || 0;
    if (fd.targetCalories.trim() !== '') targetMacros.calories = parseFloat(fd.targetCalories) || 0;
    const origId = fd.originalFood.name.trim().toLowerCase().replace(/\s+/g, '-') || 'original-food';
    const subId = fd.substituteFood.name.trim().toLowerCase().replace(/\s+/g, '-') || 'substitute-food';
    const now = new Date().toISOString().split('T')[0];
    return {
      originalFood: { ...fd.originalFood, macrosPer100g: toMacroProfile(fd.originalMacros), id: origId, lastUpdated: now },
      substituteFood: { ...fd.substituteFood, macrosPer100g: toMacroProfile(fd.substituteMacros), id: subId, lastUpdated: now },
      originalQuantity: parseFloat(fd.originalQuantity) || 0,
      originalUnit: fd.originalUnit,
      targetMacros: Object.keys(targetMacros).length > 0 ? targetMacros : undefined,
      unitSystem: fd.unitSystem,
      locale: fd.locale,
    };
  }, []);

  const handleCalculate = useCallback(() => {
    setValidationErrors({});
    setAdapterError(null);
    setResult(null);
    setOutput(null);
    setDisplayState('validating');
    const macroErrors: ValidationErrors = {};
    if (!macrosComplete(formData.originalMacros)) macroErrors.originalMacros = t.macros_required;
    if (!macrosComplete(formData.substituteMacros)) macroErrors.substituteMacros = t.macros_required;
    if (Object.keys(macroErrors).length > 0) {
      setValidationErrors(macroErrors);
      setDisplayState('error');
      return;
    }
    const engineInput = buildEngineInput(formData);
    const parseResult = tryParseTool111Input(engineInput);
    if (!parseResult.ok) {
      const errors: ValidationErrors = {};
      for (const issue of parseResult.error.issues) {
        const path = issue.path.join('.');
        const msg = issue.message;
        switch (path) {
          case 'originalFood.id': case 'originalFood.name':
          case 'originalFood.macrosPer100g.protein': case 'originalFood.macrosPer100g.carbs':
          case 'originalFood.macrosPer100g.fat': case 'originalFood.macrosPer100g.calories':
            errors.originalFood = msg; break;
          case 'substituteFood.id': case 'substituteFood.name':
          case 'substituteFood.macrosPer100g.protein': case 'substituteFood.macrosPer100g.carbs':
          case 'substituteFood.macrosPer100g.fat': case 'substituteFood.macrosPer100g.calories':
            errors.substituteFood = msg; break;
          case 'originalQuantity': errors.originalQuantity = msg; break;
          case 'originalUnit': errors.originalUnit = msg; break;
          case 'targetMacros.protein': case 'targetMacros.carbs':
          case 'targetMacros.fat': case 'targetMacros.calories':
            errors.targetMacros = msg; break;
          case 'unitSystem': errors.unitSystem = msg; break;
          case 'locale': errors.locale = msg; break;
          default: errors.general = msg;
        }
      }
      setValidationErrors(errors);
      setDisplayState('error');
      return;
    }
    const adapterResult = tool111Adapter.execute(engineInput);
    if (!adapterResult.ok) {
      setAdapterError(adapterResult.error instanceof Error ? adapterResult.error.message : String(adapterResult.error));
      setDisplayState('error');
      return;
    }
    setResult(adapterResult.output.result);
    setOutput(adapterResult.output);
    setDisplayState('success');
  }, [formData, buildEngineInput, t]);

  const handleReset = useCallback(() => {
    setFormData(emptyFormData());
    setValidationErrors({});
    setAdapterError(null);
    setResult(null);
    setOutput(null);
    setDisplayState('idle');
  }, []);

  const formatNum = (value: number | undefined, decimals = 1): string => {
    if (value === undefined || value === null) return '—';
    return value.toFixed(decimals);
  };

  const translateEquivalence = (level: string): string => {
    const map: Record<string, string> = {
      excellent: t.excellent ?? 'Excellent', good: t.good ?? 'Good',
      fair: t.fair ?? 'Fair', poor: t.poor ?? 'Poor',
      unacceptable: t.unacceptable ?? 'Unacceptable',
    };
    return map[level] ?? level;
  };

  const translateAdherence = (level: string): string => {
    const map: Record<string, string> = {
      on_target: t.adherence_on_target ?? 'On target',
      slightly_off: t.adherence_slightly_off ?? 'Slightly off',
      moderately_off: t.adherence_moderately_off ?? 'Moderately off',
      significantly_off: t.adherence_significantly_off ?? 'Significantly off',
    };
    return map[level] ?? level;
  };

  return (
    <div className="tool-111-smart-food-macro-substitution p-6 max-w-5xl mx-auto"
      dir={isRtl ? 'rtl' : 'ltr'} lang={isRtl ? 'ar' : 'en'}>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">{t.tool_name}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t.tool_description}</p>
        <MeasurementToggle />
      </header>
      <div className="mb-6 p-3 rounded bg-amber-50 border border-amber-200 text-amber-800 text-sm">
        {t.disclaimer}
      </div>
      <section className="mb-8 space-y-6">
        <h2 className="text-lg font-semibold">{t.inputs}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <fieldset className="border rounded p-4 flex flex-col gap-4">
            <legend className="font-medium">{t.original_food}</legend>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-1">
                {t.food_name} <span className="text-xs text-rose-500">{t.required}</span>
              </label>
              <input type="text" value={formData.originalFood.name}
                onChange={(e) => setFormData((d) => ({ ...d, originalFood: { ...d.originalFood, name: e.target.value } }))}
                className="w-full rounded border p-2" dir="ltr" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-1">
                {t.food_name_en} <span className="text-xs text-rose-500">{t.required}</span>
              </label>
              <input type="text" value={formData.originalFood.nameEn}
                onChange={(e) => setFormData((d) => ({ ...d, originalFood: { ...d.originalFood, nameEn: e.target.value } }))}
                className="w-full rounded border p-2" dir="ltr" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t.category}</label>
              <select value={formData.originalFood.category}
                onChange={(e) => setFormData((d) => ({ ...d, originalFood: { ...d.originalFood, category: e.target.value as EngineInput['originalFood']['category'] } }))}
                className="w-full rounded border p-2">
                {ALL_CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-1">
                {t.data_source} <span className="text-xs text-rose-500">{t.required}</span>
              </label>
              <select value={formData.originalFood.dataSource}
                onChange={(e) => setFormData((d) => ({ ...d, originalFood: { ...d.originalFood, dataSource: e.target.value as EngineInput['originalFood']['dataSource'] } }))}
                className="w-full rounded border p-2">
                {ALL_DATA_SOURCES.map((ds) => (<option key={ds} value={ds}>{ds}</option>))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-1">
                {t.data_quality} <span className="text-xs text-rose-500">{t.required}</span>
              </label>
              <select value={formData.originalFood.dataQuality}
                onChange={(e) => setFormData((d) => ({ ...d, originalFood: { ...d.originalFood, dataQuality: e.target.value as EngineInput['originalFood']['dataQuality'] } }))}
                className="w-full rounded border p-2">
                {ALL_DATA_QUALITIES.map((dq) => (<option key={dq} value={dq}>{dq}</option>))}
              </select>
            </div>
            {validationErrors.originalFood && <p className="text-xs text-rose-500">{validationErrors.originalFood}</p>}
          </fieldset>

          <fieldset className="border rounded p-4 flex flex-col gap-4">
            <legend className="font-medium">{t.substitute_food}</legend>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-1">
                {t.food_name} <span className="text-xs text-rose-500">{t.required}</span>
              </label>
              <input type="text" value={formData.substituteFood.name}
                onChange={(e) => setFormData((d) => ({ ...d, substituteFood: { ...d.substituteFood, name: e.target.value } }))}
                className="w-full rounded border p-2" dir="ltr" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-1">
                {t.food_name_en} <span className="text-xs text-rose-500">{t.required}</span>
              </label>
              <input type="text" value={formData.substituteFood.nameEn}
                onChange={(e) => setFormData((d) => ({ ...d, substituteFood: { ...d.substituteFood, nameEn: e.target.value } }))}
                className="w-full rounded border p-2" dir="ltr" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t.category}</label>
              <select value={formData.substituteFood.category}
                onChange={(e) => setFormData((d) => ({ ...d, substituteFood: { ...d.substituteFood, category: e.target.value as EngineInput['originalFood']['category'] } }))}
                className="w-full rounded border p-2">
                {ALL_CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-1">
                {t.data_source} <span className="text-xs text-rose-500">{t.required}</span>
              </label>
              <select value={formData.substituteFood.dataSource}
                onChange={(e) => setFormData((d) => ({ ...d, substituteFood: { ...d.substituteFood, dataSource: e.target.value as EngineInput['originalFood']['dataSource'] } }))}
                className="w-full rounded border p-2">
                {ALL_DATA_SOURCES.map((ds) => (<option key={ds} value={ds}>{ds}</option>))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-1">
                {t.data_quality} <span className="text-xs text-rose-500">{t.required}</span>
              </label>
              <select value={formData.substituteFood.dataQuality}
                onChange={(e) => setFormData((d) => ({ ...d, substituteFood: { ...d.substituteFood, dataQuality: e.target.value as EngineInput['originalFood']['dataQuality'] } }))}
                className="w-full rounded border p-2">
                {ALL_DATA_QUALITIES.map((dq) => (<option key={dq} value={dq}>{dq}</option>))}
              </select>
            </div>
            {validationErrors.substituteFood && <p className="text-xs text-rose-500">{validationErrors.substituteFood}</p>}
          </fieldset>
        </div>

        <fieldset className="border rounded p-4 flex flex-col gap-4">
          <legend className="font-medium">
            {t.original_macros_per_100g} <span className="text-xs text-rose-500">{t.required}</span>
          </legend>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MACRO_FIELDS.map((key) => {
              const label = key === 'protein' ? t.protein : key === 'carbs' ? t.carbs : key === 'fat' ? t.fat : t.calories;
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-sm font-medium">{label}</label>
                  <input type="number" min={0}
                    value={formData.originalMacros[key]}
                    onChange={(e) => setFormData((d) => ({ ...d, originalMacros: { ...d.originalMacros, [key]: e.target.value } }))}
                    className="w-full rounded border p-2" dir="ltr" />
                </div>
              );
            })}
          </div>
          {validationErrors.originalMacros && <p className="text-xs text-rose-500">{validationErrors.originalMacros}</p>}
        </fieldset>

        <fieldset className="border rounded p-4 flex flex-col gap-4">
          <legend className="font-medium">
            {t.substitute_macros_per_100g} <span className="text-xs text-rose-500">{t.required}</span>
          </legend>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MACRO_FIELDS.map((key) => {
              const label = key === 'protein' ? t.protein : key === 'carbs' ? t.carbs : key === 'fat' ? t.fat : t.calories;
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-sm font-medium">{label}</label>
                  <input type="number" min={0}
                    value={formData.substituteMacros[key]}
                    onChange={(e) => setFormData((d) => ({ ...d, substituteMacros: { ...d.substituteMacros, [key]: e.target.value } }))}
                    className="w-full rounded border p-2" dir="ltr" />
                </div>
              );
            })}
          </div>
          {validationErrors.substituteMacros && <p className="text-xs text-rose-500">{validationErrors.substituteMacros}</p>}
        </fieldset>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium flex items-center gap-1">
              {t.original_quantity} <span className="text-xs text-rose-500">{t.required}</span>
            </label>
            <input type="number" value={formData.originalQuantity}
              onChange={(e) => setFormData((d) => ({ ...d, originalQuantity: e.target.value }))}
              className="w-full rounded border p-2" dir="ltr" />
            {validationErrors.originalQuantity && <p className="text-xs text-rose-500">{validationErrors.originalQuantity}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium flex items-center gap-1">
              {t.original_unit} <span className="text-xs text-rose-500">{t.required}</span>
            </label>
            <select value={formData.originalUnit}
              onChange={(e) => setFormData((d) => ({ ...d, originalUnit: e.target.value as EngineInput['originalUnit'] }))}
              className="w-full rounded border p-2">
              {ALL_UNITS.map((u) => (<option key={u} value={u}>{u}</option>))}
            </select>
            {validationErrors.originalUnit && <p className="text-xs text-rose-500">{validationErrors.originalUnit}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t.unit_system}</label>
            <select value={formData.unitSystem}
              onChange={(e) => setFormData((d) => ({ ...d, unitSystem: e.target.value as EngineInput['unitSystem'] }))}
              className="w-full rounded border p-2">
              <option value="metric">{t.unit_system_metric}</option>
              <option value="imperial">{t.unit_system_imperial}</option>
            </select>
            {validationErrors.unitSystem && <p className="text-xs text-rose-500">{validationErrors.unitSystem}</p>}
          </div>
        </div>

        <fieldset className="border rounded p-4 flex flex-col gap-4">
          <legend className="font-medium text-amber-700">{t.target_macros}</legend>
          <p className="text-xs text-amber-500">{t.optional}</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['targetProtein', 'targetCarbs', 'targetFat', 'targetCalories'] as const).map((key) => {
              const label = key === 'targetProtein' ? t.target_protein : key === 'targetCarbs' ? t.target_carbs : key === 'targetFat' ? t.target_fat : t.target_calories;
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-sm font-medium">{label}</label>
                  <input type="number" value={formData[key]}
                    onChange={(e) => setFormData((d) => ({ ...d, [key]: e.target.value }))}
                    className="w-full rounded border p-2" dir="ltr" />
                </div>
              );
            })}
          </div>
          {validationErrors.targetMacros && <p className="text-xs text-rose-500">{validationErrors.targetMacros}</p>}
        </fieldset>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t.locale}</label>
          <select value={formData.locale}
            onChange={(e) => setFormData((d) => ({ ...d, locale: e.target.value as EngineInput['locale'] }))}
            className="w-full rounded border p-2">
            <option value="ar">{t.locale_ar}</option>
            <option value="en">{t.locale_en}</option>
          </select>
          {validationErrors.locale && <p className="text-xs text-rose-500">{validationErrors.locale}</p>}
        </div>

        {Object.keys(validationErrors).length > 0 && (
          <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-sm mb-4">
            {t.validation_errors}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleCalculate} disabled={displayState === 'validating'}
            className="w-full py-3 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {displayState === 'validating' ? t.calculating : t.calculate}
          </button>
          <button onClick={handleReset}
            className="w-full py-3 rounded bg-zinc-200 text-zinc-800 font-medium hover:bg-zinc-300 transition-colors">
            {t.optional}
          </button>
        </div>
      </section>

      {adapterError && (
        <div className="mb-6 p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {t.invalid_input}: {adapterError}
        </div>
      )}

      {displayState === 'success' && result && output && (
        <section className="mb-8 space-y-6">
          <h2 className="text-lg font-semibold">{t.results}</h2>

          {output.keyFindings && output.keyFindings.length > 0 && (
            <div className="rounded bg-blue-50 p-4 border border-blue-200">
              <h3 className="text-sm font-bold mb-3">{t.key_findings}</h3>
              <ul className="space-y-2 text-sm">
                {output.keyFindings.map((finding: { code: string; labelAr: string; labelEn: string; severity: string }, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-xs font-bold rounded px-2 py-0.5 {finding.severity === 'important' ? 'bg-rose-100 text-rose-700' : finding.severity === 'monitor' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}">
                      {finding.code}
                    </span>
                    <span>{isRtl ? finding.labelAr : finding.labelEn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded bg-zinc-50 p-4 border border-zinc-200">
              <h3 className="text-sm font-bold mb-3">{t.substitute_quantity}</h3>
              <div className="text-2xl font-mono font-bold">{formatNum(result.substituteQuantity)}</div>
              <div className="text-sm text-zinc-500">{result.substituteUnit}</div>
            </div>
            <div className="rounded bg-zinc-50 p-4 border border-zinc-200">
              <h3 className="text-sm font-bold mb-3">{t.equivalence_score}</h3>
              <div className="text-2xl font-mono font-bold" data-testid="equivalence-score">{formatNum(result.equivalenceScore)}</div>
              <div className="text-sm text-zinc-500">{translateEquivalence(result.equivalenceLevel)}</div>
            </div>
          </div>

          <div className="rounded bg-zinc-50 p-4 border border-zinc-200">
            <h3 className="text-sm font-bold mb-3">{t.macro_deltas}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs text-zinc-500">{t.protein_difference}</div>
                <div className="font-mono">{formatNum(result.proteinDifference)}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">{t.carbs_difference}</div>
                <div className="font-mono">{formatNum(result.carbsDifference)}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">{t.fat_difference}</div>
                <div className="font-mono">{formatNum(result.fatDifference)}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">{t.calorie_difference}</div>
                <div className="font-mono">{formatNum(result.calorieDifference)}</div>
              </div>
            </div>
          </div>

          {result.targetAdherence && (
            <div className="rounded bg-amber-50 p-4 border border-amber-200">
              <h3 className="text-sm font-bold mb-3">{t.target_adherence}</h3>
              <div className="text-sm">{translateAdherence(result.targetAdherence.overall)}</div>
            </div>
          )}

          {result.warnings && result.warnings.length > 0 && (
            <div className="rounded bg-amber-50 p-4 border border-amber-200">
              <h3 className="text-sm font-bold mb-3">{t.warnings}</h3>
              <ul className="space-y-1 text-sm text-amber-700">
                {result.warnings.map((w: { code: string; message: string }, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 rounded px-2 py-0.5">
                      {w.code}
                    </span>
                    <span>{w.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.limitations && result.limitations.length > 0 && (
            <div className="rounded bg-zinc-100 p-4 border border-zinc-200">
              <h3 className="text-sm font-bold mb-3">{t.limitations}</h3>
              <ul className="space-y-1 text-sm text-zinc-700">
                {result.limitations.map((l: { code: string; message: string }, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-xs font-bold bg-zinc-200 text-zinc-700 rounded px-2 py-0.5">
                      {l.code}
                    </span>
                    <span>{l.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {output.provenance && (
            <div className="rounded bg-zinc-50 p-4 border border-zinc-200">
              <h3 className="text-sm font-bold mb-3">{t.provenance}</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <dt className="text-xs text-zinc-500">{t.data_source_label}</dt>
                  <dd className="font-mono">{output.provenance.source}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">{t.confidence}</dt>
                  <dd className="font-mono">{(output.provenance.confidence * 100).toFixed(0)}%</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">{t.measurement_method}</dt>
                  <dd className="font-mono">{output.provenance.measurementMethod}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">{t.recorded_at}</dt>
                  <dd className="font-mono">{output.provenance.recordedAt}</dd>
                </div>
              </dl>
            </div>
          )}
        </section>
      )}

      {displayState === 'idle' && !result && (
        <div className="text-sm text-zinc-400 text-center py-4">
          {t.no_results}
        </div>
      )}
    </div>
  );
}


