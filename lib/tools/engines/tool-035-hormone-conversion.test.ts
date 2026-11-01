/** Tool #035 — molar-mass-derived concentration unit conversion tests. */
import { describe, expect, it } from 'vitest';
import { calculateHormoneConversion } from './tool-035-hormone-conversion';
import { ConversionInputSchema, ConversionResultSchema } from '../schemas/tool-035-hormone-conversion';

const base = {
  analyte: 'testosterone' as const,
  value: 100,
  unit: 'ng/dL' as const,
  measurement_date: '2026-10-25',
  reading_source: 'Example laboratory report',
};

describe('tool-035 lab concentration unit conversion', () => {
  it('converts testosterone ng/dL to nmol/L using its documented molar mass', () => {
    const result = calculateHormoneConversion(base);
    expect(ConversionResultSchema.safeParse(result).success).toBe(true);
    expect(result).toMatchObject({ status: 'CALCULATED', analyte: 'testosterone', result_value: 3.4674, result_unit: 'nmol/L', calculation_method: 'MOLAR_MASS_DERIVED_UNIT_CONVERSION' });
    expect(result.conversion_factor).toBe(0.03467406);
  });

  it('converts testosterone in the reverse direction and round-trips within display precision', () => {
    const result = calculateHormoneConversion({ ...base, value: 100, unit: 'nmol/L' });
    expect(result.result_value).toBe(2884);
    expect(result.result_unit).toBe('ng/dL');
    const back = calculateHormoneConversion({ ...base, value: result.result_value, unit: 'ng/dL' });
    expect(back.result_value).toBeCloseTo(100, 3);
  });

  it('converts estradiol pg/mL to pmol/L and back', () => {
    const result = calculateHormoneConversion({ ...base, analyte: 'estradiol', value: 100, unit: 'pg/mL' });
    expect(result.result_value).toBe(367.1072);
    expect(result.result_unit).toBe('pmol/L');
    const back = calculateHormoneConversion({ ...base, analyte: 'estradiol', value: result.result_value, unit: 'pmol/L' });
    expect(back.result_value).toBe(100);
  });

  it('preserves zero and user provenance fields', () => {
    const result = calculateHormoneConversion({ ...base, value: 0 });
    expect(result.result_value).toBe(0);
    expect(result.measurement_date).toBe(base.measurement_date);
    expect(result.reading_source).toBe(base.reading_source);
  });

  it('rejects wrong analyte-unit combinations and invalid, missing, or impossible inputs', () => {
    expect(ConversionInputSchema.safeParse({ ...base, analyte: 'testosterone', unit: 'pg/mL' }).success).toBe(false);
    expect(ConversionInputSchema.safeParse({ ...base, analyte: 'estradiol', unit: 'nmol/L' }).success).toBe(false);
    expect(ConversionInputSchema.safeParse({ ...base, value: -1 }).success).toBe(false);
    expect(ConversionInputSchema.safeParse({ ...base, value: Number.NaN }).success).toBe(false);
    expect(ConversionInputSchema.safeParse({ ...base, measurement_date: '2026-02-30' }).success).toBe(false);
    expect(ConversionInputSchema.safeParse({ ...base, measurement_date: '0000-01-01' }).success).toBe(false);
    expect(ConversionInputSchema.safeParse({ ...base, reading_source: '' }).success).toBe(false);
    expect(ConversionInputSchema.safeParse({ ...base, unexpected: 'ignored?' }).success).toBe(false);
  });
});
