import { describe, expect, it } from 'vitest';
import { convertLabResultV6, LabResultConversionInputSchema } from './tool-140-dosage-unit-conversion-engine.v6';

describe('tool 140 lab result conversion', () => {
  it('uses the published forward factor and its inverse', () => {
    const forward = convertLabResultV6({ analyte: 'glucose_blood', value: 100, fromUnit: 'mg/dL', toUnit: 'mmol/L' });
    expect(forward.outputValue).toBe(5.55);
    expect(forward.operation).toBe('multiply');
    const reverse = convertLabResultV6({ analyte: 'glucose_blood', value: 5.55, fromUnit: 'mmol/L', toUnit: 'mg/dL' });
    expect(reverse.outputValue).toBe(100);
    expect(reverse.operation).toBe('divide');
  });

  it('keeps assay-specific and specimen-specific mappings explicit', () => {
    expect(() => convertLabResultV6({ analyte: 'creatinine_serum', value: 1, fromUnit: 'mg/dL', toUnit: 'mmol/L' })).toThrow();
    expect(() => convertLabResultV6({ analyte: 'estradiol_ms_serum', value: 1, fromUnit: 'pg/mL', toUnit: 'pmol/L' })).not.toThrow();
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, 1_000_000_001])('rejects unsupported value %s', (value) => {
    expect(LabResultConversionInputSchema.safeParse({ analyte: 'glucose_blood', value, fromUnit: 'mg/dL', toUnit: 'mmol/L' }).success).toBe(false);
  });
});
