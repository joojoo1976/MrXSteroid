import { describe, it, expect } from 'vitest';
import type { Locale, SnapshotType, UnitSystem } from '../contracts';
import { buildSarmToAasTransitionOutput } from './tool-101-sarm-to-aas-transition-bridge-predictor';
import { buildSubqVsImOutput } from './tool-102-subcutaneous-vs-intramuscular-pk-modeler';
import { buildRenalFunctionOutput } from './tool-103-renal-function-hydration-index';
import { buildThyroidOutput } from './tool-104-thyroid-metabolic-rate-dynamics';
import { buildHealthFusionOutput } from './tool-105-ai-health-data-fusion-hub';

const options = {
  locale: 'ar' as Locale,
  unitSystem: 'metric' as UnitSystem,
  snapshotType: 'dashboard_projection' as SnapshotType,
  calculatedAt: '2026-10-12T10:00:00.000Z',
  recordedAt: '2026-10-12T10:00:00.000Z',
  timezone: 'UTC',
};

describe('Tools #101-#105 adapters - canonical ToolOutput contract', () => {
  const outputs = [
    {
      slug: 'tool-101-sarm-to-aas-transition-bridge-predictor',
      out: () =>
        buildSarmToAasTransitionOutput(
          {
            sarm_compound: 'ostarine_mk2866',
            sarm_use_weeks: 12,
            suppression_severity: 'moderate',
            prior_aas_use: false,
            target_aas_ester: 'testosterone_enanthate',
            has_current_bloodwork: true,
          },
          options,
        ),
    },
    {
      slug: 'tool-102-subcutaneous-vs-intramuscular-pk-modeler',
      out: () =>
        buildSubqVsImOutput(
          {
            dose_mg: 250,
            concentration_mg_ml: 250,
            site_anatomy: 'ventrogluteal',
            elimination_half_life_days: 4.5,
            injection_interval_days: 7,
          },
          options,
        ),
    },
    {
      slug: 'tool-103-renal-function-hydration-index',
      out: () =>
        buildRenalFunctionOutput(
          {
            serum_creatinine_mg_dl: 1.0,
            age_years: 30,
            sex: 'male',
            body_weight_kg: 80,
            fluid_intake_liters: 2.5,
            climate: 'temperate',
            training_sweat_liters: 0.5,
          },
          options,
        ),
    },
    {
      slug: 'tool-104-thyroid-metabolic-rate-dynamics',
      out: () =>
        buildThyroidOutput(
          {
            tsh_miu_l: 2.0,
            free_t4_ng_dl: 1.3,
            free_t3_pg_ml: 3.0,
            age_years: 30,
            sex: 'male',
            weight_kg: 80,
            height_cm: 178,
          },
          options,
        ),
    },
    {
      slug: 'tool-105-ai-health-data-fusion-hub',
      out: () =>
        buildHealthFusionOutput(
          {
            events: [{ date: '2026-01-01', category: 'lab', code: 'ldl', value: 100 }],
            consent_given: false,
            authenticated: false,
          },
          options,
        ),
    },
  ];

  for (const { slug, out } of outputs) {
    it(`${slug} stamps identity, provenance, findings and seoLinks`, () => {
      const output = out();
      expect(output.toolId).toBe(`mrx.tool.${slug.replace(/^tool-/, '')}`);
      expect(output.toolSlug).toBe(slug);
      expect(output.accessTier).toBe('free');
      expect(output.locale).toBe('ar');
      expect(output.calculatedAt).toBe(options.calculatedAt);
      expect(output.provenance.source).toBe('manual');
      expect(output.provenance.recordedAt).toBe(options.recordedAt);
      expect(output.provenance.timezone).toBe('UTC');
      expect(output.provenance.confidence).toBeGreaterThan(0);
      expect(['high', 'medium', 'low']).toContain(output.provenance.dataQuality);
      expect(output.keyFindings.length).toBeGreaterThan(0);
      for (const f of output.keyFindings) {
        expect(f.code.length).toBeGreaterThan(0);
        expect(['info', 'monitor', 'important']).toContain(f.severity);
      }
      expect(output.seoLinks.prevTool.slug).toBeTruthy();
      expect(output.seoLinks.nextTool.slug).toBeTruthy();
      expect(output.seoLinks.prevTool.slug).not.toBe(slug);
      expect(output.seoLinks.nextTool.slug).not.toBe(slug);
    });
  }

  it('keeps the AI context free of health data unless explicitly built by the caller', () => {
    const output = outputs[4].out();
    // #105 result never leaks event values into keyFindings beyond counts/trends.
    const values = output.keyFindings.map((f) => f.value).join(' ');
    expect(values).not.toContain('100');
  });
});
