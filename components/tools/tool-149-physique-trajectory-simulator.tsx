'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PhysiqueTrajectoryInput } from '@/lib/tools/engines/tool-149-physique-trajectory-simulator.v6';
import { inspectPhysiqueTrajectoryDraft } from '@/lib/tools/engines/tool-149-physique-trajectory-simulator.v6';
import { buildPhysiqueTrajectoryOutput, buildTool149ShareEnvelopeV7 } from '@/lib/tools/adapters/tool-149-physique-trajectory-simulator';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import { validateCrossToolImportV7 } from '@/lib/tools/shared-data/cross-tool-result.v7';
import { useExplicitTool149SessionContext, useToolResultSharing } from '@/context/SmartToolsSessionContext';
import ToolOutputSummary from './ToolOutputSummary';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';

type Draft = {
  current_weight_kg: string;
  current_body_fat_pct: string;
  target_body_fat_pct: string;
  weekly_rates_kg_per_week: string[];
};

const blank: Draft = { current_weight_kg: '', current_body_fat_pct: '', target_body_fat_pct: '', weekly_rates_kg_per_week: [''] };
const inputClass = 'mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white';
const KG_PER_LB = 1 / 2.20462;

export default function Tool149PhysiqueTrajectorySimulator() {
  const { locale, unitSystem: unit, isRtl } = useToolDisplayPreferences();
  const [draft, setDraft] = useState<Draft>(blank);
  const [importedContextGrantByField, setImportedContextGrantByField] = useState<Partial<Record<'current_weight_kg' | 'current_body_fat_pct' | 'target_body_fat_pct', string>>>({});
  const [selectedContextGrants, setSelectedContextGrants] = useState<string[]>([]);
  const [contextImportError, setContextImportError] = useState<string | null>(null);
  const sharedWithTool149 = useExplicitTool149SessionContext();
  const availableContextGrantKeys = useMemo(
    () => new Set(sharedWithTool149.map((item) => `${item.resultId}:${item.consent.grantedAt}`)),
    [sharedWithTool149],
  );
  const importedContextFields = useMemo(
    () => new Set(Object.entries(importedContextGrantByField)
      .filter(([, grantKey]) => grantKey && availableContextGrantKeys.has(grantKey))
      .map(([field]) => field as 'current_weight_kg' | 'current_body_fat_pct' | 'target_body_fat_pct')),
    [availableContextGrantKeys, importedContextGrantByField],
  );
  const tool150Sharing = useToolResultSharing('tool-150-ai-performance-command-center');
  const tr = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const mass = unit === 'metric' ? 'kg' : 'lb';
  const displayMass = (kgValue: string) => kgValue === '' ? '' : String(Number((unit === 'imperial' ? Number(kgValue) / KG_PER_LB : Number(kgValue)).toFixed(2)));
  const displayRate = (kgValue: string) => kgValue === '' ? '' : String(Number((unit === 'imperial' ? Number(kgValue) / KG_PER_LB : Number(kgValue)).toFixed(6)));
  const toCanonical = (displayValue: string) => {
    if (displayValue.trim() === '') return '';
    const value = Number(displayValue);
    return String(unit === 'imperial' ? value * KG_PER_LB : value);
  };
  // Draft values stay in canonical kg; units only affect the displayed/editable values.
  const effectiveDraft = useMemo(() => {
    const values = { ...draft };
    for (const [field, grantKey] of Object.entries(importedContextGrantByField)) {
      const grant = sharedWithTool149.find((item) => `${item.resultId}:${item.consent.grantedAt}` === grantKey);
      const sharedField = grant?.fields.find((candidate) => candidate.key === field);
      if (field === 'current_weight_kg' || field === 'current_body_fat_pct' || field === 'target_body_fat_pct') {
        values[field] = sharedField ? String(sharedField.value) : '';
      }
    }
    return values;
  }, [draft, importedContextGrantByField, sharedWithTool149]);
  const rawInput = useMemo(() => ({
    current_weight_kg: effectiveDraft.current_weight_kg === '' ? undefined : Number(effectiveDraft.current_weight_kg),
    current_body_fat_pct: effectiveDraft.current_body_fat_pct === '' ? undefined : Number(effectiveDraft.current_body_fat_pct),
    target_body_fat_pct: effectiveDraft.target_body_fat_pct === '' ? undefined : Number(effectiveDraft.target_body_fat_pct),
    weekly_rates_kg_per_week: effectiveDraft.weekly_rates_kg_per_week.map((value) => value === '' ? undefined : Number(value)),
  }), [effectiveDraft]);
  const draftState = useMemo(() => inspectPhysiqueTrajectoryDraft(rawInput), [rawInput]);
  const input = draftState.status === 'FULL' ? draftState.input : null;
  const { output, calculate, reset } = useExplicitToolOutput<PhysiqueTrajectoryInput, ReturnType<typeof buildPhysiqueTrajectoryOutput>['result']>(input);
  const displaySettings = useRef({ locale, unit });
  useEffect(() => {
    if (displaySettings.current.locale !== locale || displaySettings.current.unit !== unit) {
      displaySettings.current = { locale, unit };
      reset();
    }
  }, [locale, unit, reset]);
  const update = (
    change: (previous: Draft) => Draft,
    manuallyEditedField?: 'current_weight_kg' | 'current_body_fat_pct' | 'target_body_fat_pct',
  ) => {
    reset();
    setDraft(change);
    if (manuallyEditedField) {
      setImportedContextGrantByField((grants) => {
        const next = { ...grants };
        delete next[manuallyEditedField];
        return next;
      });
    }
  };

  const selectedContext = sharedWithTool149.filter((item) => selectedContextGrants.includes(`${item.resultId}:${item.consent.grantedAt}`));
  const shareableResult = output ? buildTool149ShareEnvelopeV7(output.result, output.calculatedAt, `tool149-result-${output.calculatedAt}`) : null;
  const resultAlreadyShared = shareableResult ? tool150Sharing.sharedResults.some((item) => item.resultId === shareableResult.resultId) : false;
  const duplicateContextFields = selectedContext
    .flatMap((item) => item.fields.map((field) => field.key))
    .filter((field, index, fields) => fields.indexOf(field) !== index);
  const contextFieldLabel = (field: string) => field === 'current_weight_kg'
    ? tr('الوزن الحالي', 'Current weight')
    : field === 'current_body_fat_pct'
      ? tr('نسبة الدهون الحالية', 'Current body-fat percentage')
      : tr('نسبة الدهون المستهدفة', 'Target body-fat percentage');
  const importSelectedContext = () => {
    if (selectedContext.length === 0) return;
    if (duplicateContextFields.length > 0) {
      setContextImportError(tr('اختر قيمة واحدة فقط لكل حقل قبل الاستيراد.', 'Select only one value for each field before importing.'));
      return;
    }
    const grantByField: Partial<Record<'current_weight_kg' | 'current_body_fat_pct' | 'target_body_fat_pct', string>> = {};
    for (const envelope of selectedContext) {
      if (envelope.sourceToolId !== 'tool-148-personal-fitness-memory-layer') {
        setContextImportError(tr('مصدر هذه القيمة غير معتمد للاستيراد.', 'This value source is not approved for import.'));
        return;
      }
      const allowedUnits: Record<string, string> = {
        current_weight_kg: 'kg',
        current_body_fat_pct: '%',
        target_body_fat_pct: '%',
      };
      const requirements: Array<{ key: string; unit: string }> = [];
      for (const field of envelope.fields) {
        const unit = allowedUnits[field.key];
        if (!unit) {
          setContextImportError(tr('تحتوي القيمة المشتركة على حقل غير مدعوم.', 'The shared value contains an unsupported field.'));
          return;
        }
        requirements.push({ key: field.key, unit });
      }
      const decision = validateCrossToolImportV7(
        envelope,
        'tool-149-physique-trajectory-simulator',
        requirements,
        { now: Date.now() },
      );
      if (decision.status !== 'READY') {
        setContextImportError(tr(`تعذر التحقق من القيمة المشتركة: ${decision.status}.`, `Shared value validation failed: ${decision.status}.`));
        return;
      }
      for (const field of decision.fields) {
        if (field.key === 'current_weight_kg' || field.key === 'current_body_fat_pct' || field.key === 'target_body_fat_pct') {
          grantByField[field.key] = `${envelope.resultId}:${envelope.consent.grantedAt}`;
        }
      }
    }
    setDraft((current) => ({
      ...current,
      ...Object.fromEntries(Object.keys(grantByField).map((field) => [field, ''])),
    }));
    reset();
    setImportedContextGrantByField((current) => ({ ...current, ...grantByField }));
    setSelectedContextGrants([]);
    setContextImportError(null);
  };

  const clearImportedContext = () => {
    const fields = importedContextFields;
    update((old) => ({ ...old, ...Object.fromEntries([...fields].map((field) => [field, ''])) }));
    setImportedContextGrantByField({});
  };

  const validationText = (field: string, _message: string) => {
    const name = field === 'current_weight_kg' ? tr('الوزن الحالي', 'Current weight')
      : field === 'current_body_fat_pct' ? tr('نسبة الدهون الحالية', 'Current body-fat percentage')
        : field === 'target_body_fat_pct' ? tr('نسبة الدهون المستهدفة', 'Target body-fat percentage')
          : tr('معدلات السيناريو', 'Scenario rates');
    return `${name}: ${field.includes('body_fat')
        ? tr('أدخل قيمة من 3 إلى 70%.', 'Enter a value from 3 to 70%.')
        : field.includes('weight') && !field.includes('rates')
          ? tr('أدخل قيمة أكبر من صفر ولا تتجاوز 500.', 'Enter a value greater than zero and no more than 500.')
          : tr('أدخل معدلًا أكبر من صفر ولا يتجاوز 2 كجم أسبوعيًا (أو ما يعادله).', 'Enter a rate greater than zero and no more than 2 kg per week (or equivalent).')}`;
  };

  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-black text-white">{tr('محاكي سيناريوهات المسار الجسدي', 'Physique Trajectory Scenario Simulator')}</h1>
    </header>

    <p className="text-sm text-zinc-300">{tr(
      'محاكاة حسابية بافتراض ثبات الكتلة الخالية من الدهون. المدة الحسابية ليست توقعًا واقعيًا أو وعدًا بنتيجة، ولا تقدم الأداة توصيات تدريب أو تغذية أو أدوية أو تقييمًا صحيًا.',
      'Arithmetic scenarios assume constant lean mass. Scenario duration is not a real-world prediction or promise; this tool provides no training, nutrition, medication, or health recommendations.',
    )}</p>

    {sharedWithTool149.length > 0 && <section className="space-y-3 rounded-xl border border-sky-800 bg-sky-950/20 p-4" aria-label={tr('سياق اللياقة المتاح لهذه الجلسة', 'Fitness context available this session')}>
      <h2 className="font-bold text-white">{tr('سياق لياقة شاركته صراحةً من الأداة 148', 'Fitness context you explicitly shared from Tool 148')}</h2>
      <p className="text-xs text-zinc-300">{tr('المتاح هنا هو قيمة الوزن أو نسبة الدهون ووحدتها فقط؛ لا يصل المصدر أو التاريخ أو أي حقل آخر إلى هذه الأداة. تبقى الإتاحة داخل جلسة SmartTools الحالية وتنتهي عند تحديثها أو مغادرتها؛ لا تخزين دائم ولا إرسال خارجي. اختيار القيمة ثم ضغط «تأكيد واستيراد» هو موافقتك الثانية لإتاحة القيمة للنموذج. تظل القيمة مرتبطة بالمصدر داخل الجلسة، لذلك يؤدي إلغاء الإتاحة في الأداة 148 إلى إزالتها فوراً من هذا النموذج.', 'Only the weight or body-fat value and its unit are available here; source, date, and all other fields are excluded. Access lasts only for this SmartTools session and ends on refresh or exit; there is no persistent storage or external transmission. Selecting a value and pressing “Confirm and import” is your second consent to make it available to the form. The value remains linked to its session source, so revoking access in Tool 148 immediately removes it from this form.')}</p>
      <div className="space-y-2">
        {sharedWithTool149.map((item) => {
          const field = item.fields[0];
          if (!field) return null;
          return <label key={item.resultId} className="flex items-start gap-2 text-sm text-zinc-200">
            <input type="checkbox" checked={selectedContextGrants.includes(`${item.resultId}:${item.consent.grantedAt}`)} onChange={(event) => {
              const grantKey = `${item.resultId}:${item.consent.grantedAt}`;
              setSelectedContextGrants((current) => event.target.checked ? [...current.filter((key) => key !== grantKey), grantKey] : current.filter((key) => key !== grantKey));
            }} />
            <span>{contextFieldLabel(field.key)}: {String(field.value)} {field.unit ?? ''}</span>
          </label>;
        })}
      </div>
      {contextImportError && <p role="alert" className="text-sm text-red-300">{contextImportError}</p>}
      <button type="button" disabled={selectedContext.length === 0} onClick={importSelectedContext} className="rounded-lg border border-sky-600 px-3 py-2 text-sm text-white disabled:opacity-40">{tr('تأكيد واستيراد القيم المحددة', 'Confirm and import selected values')}</button>
    </section>}

    {importedContextFields.size > 0 && <section className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-700 p-3" aria-label={tr('القيم المستوردة من الأداة 148', 'Values imported from Tool 148')}>
      <p className="text-xs text-amber-200">{tr('هذه الحقول تستخدم قيماً مرتبطة بمنح المشاركة النشطة داخل الجلسة، ولا تنشئ نسخة مستقلة. إلغاء الإتاحة يمسحها فوراً من النموذج؛ ويمكنك إلغاء استخدامها هنا في أي وقت بهذا الزر.', 'These fields use values linked to active session consent and do not create an independent copy. Revoking access clears them from the form immediately; you can also stop using them here at any time with this button.')}</p>
      <button type="button" onClick={clearImportedContext} className="rounded-lg border border-amber-600 px-3 py-2 text-sm text-white">{tr('مسح القيم المستوردة من هذا النموذج', 'Clear imported values from this form')}</button>
    </section>}

    <section className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs text-zinc-300">{tr('الوزن الحالي', 'Current weight')} ({mass})
        <input data-r6-slider="true" aria-label={`${tr('الوزن الحالي', 'Current weight')} (${mass})`} className={inputClass} type="number" min="0" max={unit === 'metric' ? 500 : 1102.31} step="any" value={displayMass(effectiveDraft.current_weight_kg)} onChange={(event) => update((old) => ({ ...old, current_weight_kg: toCanonical(event.target.value) }), 'current_weight_kg')} />
      </label>
      <label className="text-xs text-zinc-300">{tr('نسبة الدهون الحالية (%)', 'Current body-fat percentage (%)')}
        <input data-r6-slider="true" aria-label={tr('نسبة الدهون الحالية (%)', 'Current body-fat percentage (%)')} className={inputClass} type="number" min="3" max="70" step="any" value={effectiveDraft.current_body_fat_pct} onChange={(event) => update((old) => ({ ...old, current_body_fat_pct: event.target.value }), 'current_body_fat_pct')} />
      </label>
      <label className="text-xs text-zinc-300">{tr('نسبة الدهون المستهدفة (%)', 'Target body-fat percentage (%)')}
        <input data-r6-slider="true" aria-label={tr('نسبة الدهون المستهدفة (%)', 'Target body-fat percentage (%)')} className={inputClass} type="number" min="3" max="70" step="any" value={effectiveDraft.target_body_fat_pct} onChange={(event) => update((old) => ({ ...old, target_body_fat_pct: event.target.value }), 'target_body_fat_pct')} />
      </label>
    </section>

    <section className="space-y-3 rounded-xl border border-zinc-700 p-4" aria-label={tr('معدلات السيناريو', 'Scenario rates')}>
      <h2 className="font-bold text-white">{tr('معدلات التغير التي تختارها', 'User-selected change rates')}</h2>
      {draft.weekly_rates_kg_per_week.map((rate, index) => <div key={index} className="flex items-end gap-3">
        <label className="flex-1 text-xs text-zinc-300">{tr(`معدل السيناريو ${index + 1}`, `Scenario rate ${index + 1}`)} ({mass}/{tr('أسبوع', 'week')})
          <input data-r6-slider="true" aria-label={`${tr(`معدل السيناريو ${index + 1}`, `Scenario rate ${index + 1}`)} (${mass}/${tr('أسبوع', 'week')})`} className={inputClass} type="number" min="0" max={unit === 'metric' ? 2 : 4.40924} step="any" value={displayRate(rate)} onChange={(event) => update((old) => ({ ...old, weekly_rates_kg_per_week: old.weekly_rates_kg_per_week.map((item, itemIndex) => itemIndex === index ? toCanonical(event.target.value) : item) }))} />
        </label>
        <button type="button" disabled={draft.weekly_rates_kg_per_week.length <= 1} onClick={() => update((old) => ({ ...old, weekly_rates_kg_per_week: old.weekly_rates_kg_per_week.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-white disabled:opacity-40">{tr('إزالة', 'Remove')}</button>
      </div>)}
      <button type="button" disabled={draft.weekly_rates_kg_per_week.length >= 3} onClick={() => update((old) => ({ ...old, weekly_rates_kg_per_week: [...old.weekly_rates_kg_per_week, ''] }))} className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-white disabled:opacity-40">{tr('إضافة معدل', 'Add rate')}</button>
      <p className="text-xs text-zinc-400">{tr('يمكنك مقارنة معدل واحد إلى ثلاثة معدلات تدخلها بنفسك؛ لا ترتب الأداة المعدلات ولا توصي بمعدل.', 'Enter one to three rates to compare; the tool does not rank or recommend a rate.')}</p>
    </section>

    {draftState.status === 'PARTIAL' && <p role="status" className="text-sm text-amber-300"><strong>PARTIAL</strong> · {tr('أكمل الوزن ونسب الدهون ومعدلًا واحدًا على الأقل قبل الحساب.', 'Complete the weight, body-fat values and at least one rate before calculating.')}</p>}
    {draftState.status === 'INVALID_INPUT' && <div role="alert" className="space-y-1 text-sm text-red-300"><strong>INVALID_INPUT</strong>{draftState.errors.map((error, index) => <p key={`${error.field}-${index}`}>{validationText(error.field, error.message)}</p>)}</div>}

    <div className="flex gap-2">
      <button type="button" disabled={!input} onClick={() => input && calculate(input, buildPhysiqueTrajectoryOutput, locale, unit)} className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{tr('احسب السيناريوهات', 'Calculate scenarios')}</button>
      <button type="button" onClick={() => { reset(); setDraft(blank); setImportedContextGrantByField({}); }} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white">{tr('إعادة الضبط', 'Reset')}</button>
    </div>

    {output && <ToolOutputSummary output={output} locale={locale} />}
    {shareableResult && <section className="space-y-2 rounded-xl border border-violet-800 bg-violet-950/20 p-4" aria-label={tr('مشاركة نتيجة الأداة', 'Share tool result')}>
      <h2 className="font-bold text-white">{tr('تبادل نتيجة محدد وآمن', 'Explicit result sharing')}</h2>
      <p className="text-sm text-zinc-300">{tr(
        'النتيجة الحسابية فقط ستتاح للأداة 150 بعد موافقتك. لن تُشارك المدخلات أو قيم الأداة 148. سيظل عليك اختيار استيرادها داخل الأداة 150؛ ويمكنك إلغاء الإتاحة هنا.',
        'Only this calculated result will be available to Tool 150 after your consent. Inputs and Tool 148 values are not shared. You must still select it for import inside Tool 150; access can be revoked here.',
      )}</p>
      <p className="text-xs text-zinc-400">{tr('المصدر: الأداة 149 · النوع: CALCULATED · الوحدة الداخلية: kg وweek · التاريخ ظاهر مع النتيجة.', 'Source: Tool 149 · type: CALCULATED · canonical units: kg and week · the result date accompanies the data.')}</p>
      <button type="button" onClick={() => {
        if (resultAlreadyShared) tool150Sharing.revokeResult(shareableResult.resultId);
        else tool150Sharing.shareResultWithTarget(shareableResult);
      }} className="rounded-lg border border-violet-600 px-3 py-2 text-sm text-white">
        {resultAlreadyShared ? tr('إلغاء الإتاحة للأداة 150', 'Revoke Tool 150 access') : tr('السماح للأداة 150 باستيراد النتيجة', 'Allow Tool 150 to import this result')}
      </button>
      <p role="status" className="text-xs text-zinc-300">{resultAlreadyShared ? tr('الإتاحة مفعّلة لهذه النتيجة فقط داخل جلسة SmartTools الحالية.', 'Access is enabled for this result only within the current SmartTools session.') : tr('النتيجة خاصة حتى تضغط زر السماح.', 'This result stays private until you allow sharing.')}</p>
    </section>}
  </main>;
}
