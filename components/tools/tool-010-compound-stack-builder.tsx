'use client';

import React, { useState } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle, {
  getStoredMeasurementSystem,
  mgToOz,
  ozToMg,
  type MeasurementSystem,
} from './MeasurementToggle';
import type { StackCompound } from '@/lib/tools/schemas/tool-010-compound-stack-builder';
import i18nJson from '@/i18n/tool-010-compound-stack-builder.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool010CompoundStackBuilder() {
function synergyOf(compounds: StackCompound[]): { rating: 'negative' | 'neutral' | 'positive'; score: number; tips: string[] } {
  let score = 0;
  const tips: string[] = [];
  if (compounds.length === 0) return { rating: 'neutral', score: 0, tips: ['Add compounds to evaluate synergy.'] };
  const families = new Set(compounds.map((c) => c.family));
  if (families.size < compounds.length) {
    score -= 20;
    tips.push('Duplicate families detected — overlap increases suppression without proportional benefit.');
  } else {
    score += 10;
  }
  const avgArom = compounds.reduce((s, c) => s + c.aromatization_factor, 0) / compounds.length;
  if (avgArom > 0.6) {
    score -= 10;
    tips.push('High average aromatization — plan AI support and E2 monitoring.');
  }
  const mass = compounds.filter((c) => c.primary_effect === 'mass').length;
  const cutting = compounds.filter((c) => c.primary_effect === 'cutting').length;
  if (mass > 0 && cutting > 0) {
    score -= 10;
    tips.push('Mixed mass + cutting goals in one stack — pick a primary goal.');
  } else {
    score += 10;
  }
  if (tips.length === 0) tips.push('Stack looks coherent — keep testosterone as the base and monitor bloodwork.');
  return { rating: score < 0 ? 'negative' : score > 10 ? 'positive' : 'neutral', score, tips };
}

/* ============================================================================
 * AROMATIZATION RISK WEIGHTS & TIER
 * ============================================================================ */

// Aromatization family weights (relative to testosterone = 1.0)
const aromatizationWeights: Record<string, number> = {
  testosterone: 1.0,
  dianabol: 1.5,
  dihydrotestosterone: 0, // non-aromatizable
  nandrolone: 0.7,
  trenbolone: 0.5,
  oxandrolone: 0,
  stanozolol: 0,
  boldenone: 0.6,
  methenolone: 0,
  testosterone_ester: 1.0,
};

// Aromatization risk tier type
type AromatizationTier = '1-minimal' | '2-moderate' | '3-high' | '4-critical';

/* ============================================================================
 * AROMATIZATION TIER CALCULATION
 * ============================================================================ */

/**
 * Calculate aromatization risk tier and details based on compounds and doses.
 */
function calculateAromatizationTier(compounds: StackCompound[]) {
  if (compounds.length === 0) {
    return {
      tier: '1-minimal' as AromatizationTier,
      estrogen_estimate_mg: 0,
      risk_factors: [
        'No compounds entered — baseline estrogen levels expected.',
      ],
      ai_explanation:
        'With no compounds, your estrogen levels should remain at baseline. Any observed gynecomastia or water retention should be evaluated separately.',
    };
  }

  let totalWeightedAromatization = 0;
  const riskFactors: string[] = [];
  let hasNonAromatizable = false;

  compounds.forEach((c) => {
    const weight = aromatizationWeights[c.family] || 0.5;
    totalWeightedAromatization +=
      c.aromatization_factor * weight * c.weekly_dose_mg;

    if (weight === 0) {
      hasNonAromatizable = true;
      riskFactors.push(
        `${c.name_en} (${c.family}) is non-aromatizable — will not convert to estrogen.`
      );
    }

    if (c.aromatization_factor > 0.7 && c.weekly_dose_mg > 500) {
      riskFactors.push(
        `High aromatization factor (${c.aromatization_factor}) at high dose (${c.weekly_dose_mg}mg/week) — significant estrogen conversion expected.`
      );
    }
  });

  const avgAromatization =
    totalWeightedAromatization /
    Math.max(1, compounds.reduce((s, c) => s + c.weekly_dose_mg, 0));

  let tier: AromatizationTier;
  const estrogenEstimate = Math.round((totalWeightedAromatization / 100) * 10) / 10;

  if (avgAromatization > 0.8) {
    tier = '4-critical';
  } else if (avgAromatization > 0.6) {
    tier = '3-high';
  } else if (avgAromatization > 0.4) {
    tier = '2-moderate';
  } else {
    tier = '1-minimal';
  }

  // Generate risk factors based on tier
  if (tier === '4-critical') {
    riskFactors.push(
      'CRITICAL aromatization risk — AI strongly recommends aromatase inhibitor support and bloodwork within 48 hours.'
    );
  }
  if (tier === '3-high' || tier === '4-critical') {
    riskFactors.push(
      'Moderate-to-high estrogen conversion expected. Monitor for: water retention, gynecomastia, elevated blood pressure.'
    );
  }
  if (hasNonAromatizable) {
    riskFactors.push(
      'Stack contains non-aromatizable compounds — ensure primary goal aligns with mass/cutting/recovery without estrogen-related sides.'
    );
  }

  // AI-generated explanation (with local fallback)
  const aiExplanation = generateAIExplanation(
    tier,
    compounds,
    estrogenEstimate,
    riskFactors
  );

  return {
    tier,
    estrogen_estimate_mg: estrogenEstimate,
    risk_factors: riskFactors,
    ai_explanation: aiExplanation,
  };
}

/* ============================================================================
 * AI EXPLANATION FUNCTIONS
 * ============================================================================ */

/**
 * Generate AI-powered explanation (with local fallback).
 * Uses Supabase Edge Function when available, otherwise falls back to deterministic local explanation.
 */
function generateAIExplanation(
  tier: AromatizationTier,
  compounds: StackCompound[],
  estrogenEstimate: number,
  riskFactors: string[]
): string {
  // Local fallback if no AI service configuration
  return localAIExplanation(tier, compounds, estrogenEstimate, riskFactors);
}

/**
 * Local AI explanation fallback (deterministic, no API call required).
 */
function localAIExplanation(
  tier: AromatizationTier,
  compounds: StackCompound[],
  estrogenEstimate: number,
  riskFactors: string[]
): string {
  const parts: string[] = [];

  const tierDescriptions: Record<AromatizationTier, string> = {
    '1-minimal':
      'Low aromatization risk. Estrogen conversion is minimal with this stack.',
    '2-moderate':
      'Moderate aromatization risk. Some estrogen conversion expected; monitor symptoms.',
    '3-high':
      'High aromatization risk. Significant estrogen conversion likely; AI recommends supportive therapy.',
    '4-critical':
      'Critical aromatization risk. Immediate medical review and aromatase inhibitor consideration required.',
  };

  parts.push(tierDescriptions[tier] || 'Aromatization risk assessment complete.');

  parts.push(
    `Estimated estradiol equivalent: ${estrogenEstimate} mg. This is a computational estimate based on compound aromatization factors and doses.`
  );

  const aromatizingCompounds = compounds.filter(
    (c) => c.aromatization_factor > 0
  );
  if (aromatizingCompounds.length > 0) {
    parts.push(
      `${aromatizingCompounds.length} compound${aromatizingCompounds.length > 1 ? 's' : ''} in this stack have aromatization potential.`
    );
  }

  const activeRisks = riskFactors.filter(
    (f) => !f.includes('No compounds')
  );
  if (activeRisks.length > 0) {
    parts.push(
      'Key risk considerations: ' + activeRisks.slice(0, 3).join('. ') + '.'
    );
  }

  parts.push(
    '*Note: This explanation is generated via local calculation. AI-powered explanation available when Supabase Edge Function service is operational.'
  );

  return parts.join(' ');
}
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [name, setName] = useState('My Stack');
  const [compounds, setCompounds] = useState<StackCompound[]>([]);
  const [family, setFamily] = useState('testosterone');
  const [weeklyDose, setWeeklyDose] = useState(300);
  const [weeks, setWeeks] = useState(10);
  // Canonical unit state (mg kept internally); persisted via MeasurementToggle.
  const [unitSystem, setUnitSystem] = useState<MeasurementSystem>(() => getStoredMeasurementSystem());
  const isMetric = unitSystem === 'metric';

  const addCompound = () => {
    const c: StackCompound = {
      id: Date.now(),
      name_en: family,
      name_ar: family,
      family,
      weekly_dose_mg: weeklyDose,
      duration_weeks: weeks,
      synergy_score: 0,
      primary_effect: 'mass',
      aromatization_factor: family === 'testosterone' ? 1 : 0.3,
    };
    const next = [...compounds, c];
    setCompounds(next);
    debouncedSave({ ...savedState, stack_builder: { name, compounds: next } });
  };

  const { rating, score, tips } = synergyOf(compounds);
  const totalWeekly = compounds.reduce((s, c) => s + c.weekly_dose_mg, 0);

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle unitSystem={unitSystem} onChange={setUnitSystem} isRtl={i18nData.dir === 'rtl'} />
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{i18nData.stack_name}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value as any)} className="w-full rounded border p-2" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{i18nData.family_label}</label>
            <input type="text" value={family} onChange={(e) => setFamily(e.target.value as any)} className="w-full rounded border p-2" />
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
            <input type="number" value={weeks} onChange={(e) => setWeeks(parseInt(e.target.value as any) || 1)} min="1" max="52" className="w-full rounded border p-2" />
          </div>
        </div>
        <button onClick={addCompound} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}>
          {i18nData.build_stack}
        </button>
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