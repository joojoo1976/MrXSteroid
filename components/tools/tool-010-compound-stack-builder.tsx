'use client';

import React, { useState, useMemo } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle, {
  getStoredMeasurementSystem,
  mgToOz,
  ozToMg,
  type MeasurementSystem,
} from './MeasurementToggle';
import type { StackCompound } from '@/lib/tools/schemas/tool-010-compound-stack-builder';
import i18nJsonRaw from '@/i18n/tool-010-compound-stack-builder.json';
const i18nJson = i18nJsonRaw as any;
import { useToolI18n } from '@/lib/tools/i18nHelper';

/* ============================================================================
 * TYPE DEFINITIONS
 * ============================================================================ */

type AromatizationTier = '1-minimal' | '2-moderate' | '3-high' | '4-critical';

interface AromatizationResult {
  tier: AromatizationTier;
  estrogen_estimate_mg: number;
  risk_factors_en: string[];
  risk_factors_ar: string[];
  ai_explanation_en: string;
  ai_explanation_ar: string;
}

interface SynergyResult {
  rating: 'negative' | 'neutral' | 'positive';
  score: number;
  tips: string[];
}

/* ============================================================================
 * AROMATIZATION WEIGHTS (pure constants, no i18n)
 * ============================================================================ */

const aromatizationWeights: Record<string, number> = {
  testosterone: 1.0,
  dianabol: 1.5,
  dihydrotestosterone: 0,
  nandrolone: 0.7,
  trenbolone: 0.5,
  oxandrolone: 0,
  stanozolol: 0,
  boldenone: 0.6,
  methenolone: 0,
  testosterone_ester: 1.0,
};

/* ============================================================================
 * AROMATIZATION TIER CALCULATION (pure functions, returns both EN/AR)
 * ============================================================================ */

function calculateAromatizationTier(compounds: StackCompound[]): AromatizationResult {
  if (compounds.length === 0) {
    return {
      tier: '1-minimal',
      estrogen_estimate_mg: 0,
      risk_factors_en: ['No compounds entered — baseline estrogen levels expected.'],
      risk_factors_ar: ['لم يتم إدخال مركبات — متوقع مستويات إستراديول قاعدية.'],
      ai_explanation_en: 'With no compounds, your estrogen levels should remain at baseline. Any observed gynecomastia or water retention should be evaluated separately.',
      ai_explanation_ar: 'بدون مركبات، يجب أن تظل مستويات الإستراديول عند المستوى القاعدي. أي تثدي ملاحظ أو احتباس ماء يجب تقييمه بشكل منفصل.',
    };
  }

  let totalWeightedAromatization = 0;
  const riskFactorsEn: string[] = [];
  const riskFactorsAr: string[] = [];
  let hasNonAromatizable = false;

  compounds.forEach((c) => {
    const weight = aromatizationWeights[c.family] || 0.5;
    totalWeightedAromatization += c.aromatization_factor * weight * c.weekly_dose_mg;

    if (weight === 0) {
      hasNonAromatizable = true;
      riskFactorsEn.push(`${c.name_en} (${c.family}) is non-aromatizable — will not convert to estrogen.`);
      riskFactorsAr.push(`${c.name_ar} (${c.family}) غير قابل للأرمتة — لن يتحول إلى إستراديول.`);
    }

    if (c.aromatization_factor > 0.7 && c.weekly_dose_mg > 500) {
      riskFactorsEn.push(
        `High aromatization factor (${c.aromatization_factor}) at high dose (${c.weekly_dose_mg}mg/week) — significant estrogen conversion expected.`
      );
      riskFactorsAr.push(
        `عامل أرمتة عالي (${c.aromatization_factor}) بجرعة عالية (${c.weekly_dose_mg}ملغ/أسبوع) — متوقع تحويل إستراديول كبير.`
      );
    }
  });

  const avgAromatization = totalWeightedAromatization / Math.max(1, compounds.reduce((s, c) => s + c.weekly_dose_mg, 0));

  let tier: AromatizationTier;
  const estrogenEstimate = Math.round((totalWeightedAromatization / 100) * 10) / 10;

  if (avgAromatization > 0.8) tier = '4-critical';
  else if (avgAromatization > 0.6) tier = '3-high';
  else if (avgAromatization > 0.4) tier = '2-moderate';
  else tier = '1-minimal';

  if (tier === '4-critical') {
    riskFactorsEn.push('CRITICAL aromatization risk — AI strongly recommends aromatase inhibitor support and bloodwork within 48 hours.');
    riskFactorsAr.push('خطر أرمتة حرج — يوصي الذكاء الاصطناعي بشدة بدعم مثبط الأروماتاز وتحاليل دم خلال 48 ساعة.');
  }
  if (tier === '3-high' || tier === '4-critical') {
    riskFactorsEn.push('Moderate-to-high estrogen conversion expected. Monitor for: water retention, gynecomastia, elevated blood pressure.');
    riskFactorsAr.push('متوقع تحويل إستراديول متوسط إلى مرتفع. راقب: احتباس الماء، التثدي، ارتفاع ضغط الدم.');
  }
  if (hasNonAromatizable) {
    riskFactorsEn.push('Stack contains non-aromatizable compounds — ensure primary goal aligns with mass/cutting/recovery without estrogen-related sides.');
    riskFactorsAr.push('الحزمة تحتوي على مركبات غير قابلة للأرمتة — تأكد أن الهدف الأساسي يتماشى مع التضخيم/التنشيف/التعافي دون أعراض جانبية مرتبطة بالإستراديول.');
  }

  const aiExplanationEn = generateAIExplanationEn(tier, compounds, estrogenEstimate, riskFactorsEn);
  const aiExplanationAr = generateAIExplanationAr(tier, compounds, estrogenEstimate, riskFactorsAr);

  return {
    tier,
    estrogen_estimate_mg: estrogenEstimate,
    risk_factors_en: riskFactorsEn,
    risk_factors_ar: riskFactorsAr,
    ai_explanation_en: aiExplanationEn,
    ai_explanation_ar: aiExplanationAr,
  };
}

function generateAIExplanationEn(
  tier: AromatizationTier,
  compounds: StackCompound[],
  estrogenEstimate: number,
  riskFactors: string[]
): string {
  const parts: string[] = [];

  const tierDescriptions: Record<AromatizationTier, string> = {
    '1-minimal': 'Low aromatization risk. Estrogen conversion is minimal with this stack.',
    '2-moderate': 'Moderate aromatization risk. Some estrogen conversion expected; monitor symptoms.',
    '3-high': 'High aromatization risk. Significant estrogen conversion likely; AI recommends supportive therapy.',
    '4-critical': 'Critical aromatization risk. Immediate medical review and aromatase inhibitor consideration required.',
  };

  parts.push(tierDescriptions[tier] || 'Aromatization risk assessment complete.');
  parts.push(`Estimated estradiol equivalent: ${estrogenEstimate} mg. This is a computational estimate based on compound aromatization factors and doses.`);

  const aromatizingCompounds = compounds.filter((c) => c.aromatization_factor > 0);
  if (aromatizingCompounds.length > 0) {
    parts.push(`${aromatizingCompounds.length} compound${aromatizingCompounds.length > 1 ? 's' : ''} in this stack have aromatization potential.`);
  }

  const activeRisks = riskFactors.filter((f) => !f.includes('No compounds'));
  if (activeRisks.length > 0) {
    parts.push('Key risk considerations: ' + activeRisks.slice(0, 3).join('. ') + '.');
  }

  parts.push('*Note: This explanation is generated via local calculation. AI-powered explanation available when Supabase Edge Function service is operational.');

  return parts.join(' ');
}

function generateAIExplanationAr(
  tier: AromatizationTier,
  compounds: StackCompound[],
  estrogenEstimate: number,
  riskFactors: string[]
): string {
  const parts: string[] = [];

  const tierDescriptions: Record<AromatizationTier, string> = {
    '1-minimal': 'خطر أرمتة منخفض. تحوّل الإستراديول ضئيل مع هذه الحزمة.',
    '2-moderate': 'خطر أرمتة متوسط. متوقع بعض تحويل الإستراديول؛ راقب الأعراض.',
    '3-high': 'خطر أرمتة مرتفع. تحويل إستراديول كبير محتمل؛ يوصي الذكاء الاصطناعي بعلاج داعم.',
    '4-critical': 'خطر أرمتة حرج. مطلوب مراجعة طبية فورية واعتبار مثبط الأروماتاز.',
  };

  parts.push(tierDescriptions[tier] || 'اكتمل تقييم خطر الأرمتة.');
  parts.push(`تقدير الإستراديول المكافئ: ${estrogenEstimate} ملغ. هذا تقدير حسابي يعتمد على عوامل أرمتة المركبات والجرعات.`);

  const aromatizingCompounds = compounds.filter((c) => c.aromatization_factor > 0);
  if (aromatizingCompounds.length > 0) {
    parts.push(`${aromatizingCompounds.length} مركب${aromatizingCompounds.length > 1 ? 'ات' : ''} في هذه الحزمة لديها إمكانية أرمتة.`);
  }

  const activeRisks = riskFactors.filter((f) => !f.includes('لم يتم'));
  if (activeRisks.length > 0) {
    parts.push('اعتبارات الخطر الرئيسية: ' + activeRisks.slice(0, 3).join('. ') + '.');
  }

  parts.push('*ملاحظة: هذا الشرح تم توليده عبر الحساب المحلي. شرح مدعوم بالذكاء الاصطناعي متاح عند تشغيل خدمة Supabase Edge Function.');

  return parts.join(' ');
}

function synergyOf(compounds: StackCompound[], t: ReturnType<typeof useToolI18n>): SynergyResult {
  let score = 0;
  const tips: string[] = [];
  if (compounds.length === 0) return { rating: 'neutral', score: 0, tips: [t.synergy_tips?.add_compounds || 'Add compounds to evaluate synergy.'] };
  const families = new Set(compounds.map((c) => c.family));
  if (families.size < compounds.length) {
    score -= 20;
    tips.push(t.synergy_tips?.duplicate_families || 'Duplicate families detected — overlap increases suppression without proportional benefit.');
  } else {
    score += 10;
  }
  const avgArom = compounds.reduce((s, c) => s + c.aromatization_factor, 0) / compounds.length;
  if (avgArom > 0.6) {
    score -= 10;
    tips.push(t.synergy_tips?.high_aromatization || 'High average aromatization — plan AI support and E2 monitoring.');
  }
  const mass = compounds.filter((c) => c.primary_effect === 'mass').length;
  const cutting = compounds.filter((c) => c.primary_effect === 'cutting').length;
  if (mass > 0 && cutting > 0) {
    score -= 10;
    tips.push(t.synergy_tips?.mixed_goals || 'Mixed mass + cutting goals in one stack — pick a primary goal.');
  } else {
    score += 10;
  }
  if (tips.length === 0) tips.push(t.synergy_tips?.coherent_stack || 'Stack looks coherent — keep testosterone as the base and monitor bloodwork.');
  return { rating: score < 0 ? 'negative' : score > 10 ? 'positive' : 'neutral', score, tips };
}
export default function Tool010CompoundStackBuilder() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedStateRaw } = useUserToolState('user-id');
  const savedState = (savedStateRaw as any) ?? {};
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1500);

  const stackData = savedState?.stack_builder ?? { name: '', compounds: [] as StackCompound[] };

  const [name, setName] = useState(stackData.name || '');
  const [compounds, setCompounds] = useState<StackCompound[]>(stackData.compounds || []);
  const [family, setFamily] = useState('');
  const [weeklyDose, setWeeklyDose] = useState(300);
  const [weeks, setWeeks] = useState(12);
  const [unitSystem, setUnitSystem] = useState<MeasurementSystem>(() => getStoredMeasurementSystem());
  const isMetric = unitSystem === 'metric';

  const addCompound = () => {
    const comp: StackCompound = {
      id: Date.now(),
      name_en: family,
      name_ar: family,
      family,
      weekly_dose_mg: weeklyDose,
      duration_weeks: weeks,
      synergy_score: 0,
      primary_effect: 'mass',
      aromatization_factor: family.toLowerCase() === 'testosterone' ? 1 : 0.3,
    };
    const next = [...compounds, comp];
    setCompounds(next);
    debouncedSave({ ...savedState, stack_builder: { name, compounds: next } });
  };

  const aromatizationResult = useMemo(
    () => calculateAromatizationTier(compounds),
    [compounds]
  );

  const { rating, score, tips } = synergyOf(compounds, i18nData);
  const totalWeekly = compounds.reduce((s, comp) => s + comp.weekly_dose_mg, 0);

  const isArabic = i18nData.dir === 'rtl';
  const riskFactors = isArabic ? aromatizationResult.risk_factors_ar : aromatizationResult.risk_factors_en;
  const aiExplanation = isArabic ? aromatizationResult.ai_explanation_ar : aromatizationResult.ai_explanation_en;
  const tierKey = aromatizationResult.tier.split('-')[1];
  const tierLabel = i18nData.aromatization?.[`tier_${tierKey}`] || aromatizationResult.tier;

  return (    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle unitSystem={unitSystem} onChange={setUnitSystem} isRtl={i18nData.dir === 'rtl'} />
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{i18nData.stack_name}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border p-2" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{i18nData.family_label}</label>
            <input type="text" value={family} onChange={(e) => setFamily(e.target.value)} className="w-full rounded border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{i18nData.dose_label} ({isMetric ? i18nData.unit_mg_week : i18nData.unit_oz_week}):</label>
            <input
              type="number"
              value={isMetric ? weeklyDose : parseFloat(mgToOz(weeklyDose).toFixed(6))}
              onChange={(e) => {
                const raw = Number(e.target.value);
                const safe = Number.isFinite(raw) && raw >= 0 ? raw : 0;
                setWeeklyDose(isMetric ? Math.round(safe) : Math.round(ozToMg(safe) * 10) / 10);
              }}
              min={isMetric ? '0' : '0'}
              max={isMetric ? '2000' : String(parseFloat(mgToOz(2000).toFixed(6)))}
              step={isMetric ? '1' : 'any'}
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{i18nData.weeks_label}</label>
            <input type="number" value={weeks} onChange={(e) => setWeeks(parseInt(e.target.value) || 1)} min="1" max="52" className="w-full rounded border p-2" />
          </div>
        </div>
        <button onClick={addCompound} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}>
          {i18nData.build_stack}
        </button>        {/* Aromatization Risk Section */}
        <div className="mt-6 p-4 rounded bg-zinc-50 border">
          <h3 className="font-bold text-lg mb-3">{isArabic ? 'تقييم خطر الأرمتة' : 'Aromatization Risk Assessment'}</h3>
          <div className="space-y-2">
            <p className="font-medium">
              {isArabic ? 'مستوى الخطر:' : 'Risk Level:'} 
              <span className="ml-2 px-2 py-1 rounded text-sm font-bold 
                {tierLabel === 'Critical Risk' || tierLabel === 'خطر حرج' ? 'bg-red-100 text-red-800' :
                 tierLabel === 'High Risk' || tierLabel === 'خطر مرتفع' ? 'bg-orange-100 text-orange-800' :
                 tierLabel === 'Moderate Risk' || tierLabel === 'خطر متوسط' ? 'bg-yellow-100 text-yellow-800' :
                 'bg-green-100 text-green-800'}">
                {tierLabel}
              </span>
            </p>
            <p className="text-sm">
              {isArabic ? i18nData.results?.estrogen_estimate : i18nData.results?.estrogen_estimate}: 
              {aromatizationResult.estrogen_estimate_mg} mg
            </p>
            <div>
              <p className="font-medium text-sm mb-1">{isArabic ? i18nData.results?.risk_factors : i18nData.results?.risk_factors}:</p>
              <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1">
                {riskFactors.map((rf, i) => <li key={i}>{rf}</li>)}
              </ul>
            </div>
            <div className="pt-2 border-t">
              <p className="font-medium text-sm mb-1">{isArabic ? i18nData.results?.ai_explanation : i18nData.results?.ai_explanation}:</p>
              <p className="text-sm text-zinc-600">{aiExplanation}</p>
            </div>
          </div>
        </div>        {/* Synergy / Stack Summary */}
        <div className="mt-6 p-4 rounded bg-zinc-50">
          <p className="font-bold">{i18nData.stack}: {name} — {compounds.length} {i18nData.compounds_count}, {isMetric ? `${totalWeekly} ${i18nData.unit_mg_week}` : `${mgToOz(totalWeekly).toFixed(4)} ${i18nData.unit_oz_week}`}</p>
          <p className="text-sm text-zinc-600">{i18nData.synergy}: {rating} ({score})</p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600">
            {tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
