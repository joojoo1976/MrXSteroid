import { z } from 'zod';

/** Exact published analyte/unit pairs only. This is not a medication-dose converter. */
export const LAB_CONVERSIONS = {
  glucose_blood: { label: 'Glucose, blood', conventionalUnit: 'mg/dL', siUnit: 'mmol/L', factor: 0.0555, source: 'Labcorp SI Unit Conversion Table' },
  cholesterol_total: { label: 'Total cholesterol, serum', conventionalUnit: 'mg/dL', siUnit: 'mmol/L', factor: 0.0259, source: 'Labcorp SI Unit Conversion Table' },
  cholesterol_hdl: { label: 'HDL cholesterol, serum', conventionalUnit: 'mg/dL', siUnit: 'mmol/L', factor: 0.0259, source: 'Labcorp SI Unit Conversion Table' },
  cholesterol_ldl: { label: 'LDL cholesterol, serum', conventionalUnit: 'mg/dL', siUnit: 'mmol/L', factor: 0.0259, source: 'Labcorp SI Unit Conversion Table' },
  triglycerides_serum: { label: 'Triglycerides, serum', conventionalUnit: 'mg/dL', siUnit: 'mmol/L', factor: 0.0113, source: 'Labcorp SI Unit Conversion Table' },
  creatinine_serum: { label: 'Creatinine, serum', conventionalUnit: 'mg/dL', siUnit: 'µmol/L', factor: 88.4, source: 'Labcorp SI Unit Conversion Table' },
  bilirubin_total_serum: { label: 'Bilirubin, total serum', conventionalUnit: 'mg/dL', siUnit: 'µmol/L', factor: 17.1, source: 'Labcorp SI Unit Conversion Table' },
  calcium_total_serum: { label: 'Calcium, total serum', conventionalUnit: 'mg/dL', siUnit: 'mmol/L', factor: 0.25, source: 'Labcorp and Mayo Clinic Laboratories' },
  bun_blood: { label: 'Urea nitrogen (BUN), blood', conventionalUnit: 'mg/dL', siUnit: 'mmol/L', factor: 0.357, source: 'Labcorp SI Unit Conversion Table' },
  uric_acid_serum: { label: 'Uric acid, serum', conventionalUnit: 'mg/dL', siUnit: 'mmol/L', factor: 0.059, source: 'Labcorp SI Unit Conversion Table' },
  albumin_serum: { label: 'Albumin, serum', conventionalUnit: 'g/dL', siUnit: 'g/L', factor: 10, source: 'Labcorp and Mayo Clinic Laboratories' },
  testosterone_total: { label: 'Testosterone, total', conventionalUnit: 'ng/dL', siUnit: 'nmol/L', factor: 0.0347, source: 'Labcorp SI Unit Conversion Table' },
  estradiol_ms_serum: { label: 'Estradiol, serum by mass spectrometry', conventionalUnit: 'pg/mL', siUnit: 'pmol/L', factor: 3.671, source: 'Mayo Clinic Laboratories SI Conversion' },
  tsh: { label: 'TSH', conventionalUnit: 'µIU/mL', siUnit: 'mIU/L', factor: 1, source: 'Labcorp SI Unit Conversion Table' },
  vitamin_d_25_total: { label: '25-hydroxy vitamin D, total', conventionalUnit: 'ng/mL', siUnit: 'nmol/L', factor: 2.496, source: 'Mayo Clinic Laboratories SI Conversion' },
} as const;

export type LabAnalyte = keyof typeof LAB_CONVERSIONS;
export type LabUnit = string;
const analytes = Object.keys(LAB_CONVERSIONS) as [LabAnalyte, ...LabAnalyte[]];

export const LabResultConversionInputSchema = z.object({
  analyte: z.enum(analytes),
  value: z.number().finite().min(0).max(1_000_000_000),
  fromUnit: z.string(),
  toUnit: z.string(),
}).superRefine((input, ctx) => {
  const conversion = LAB_CONVERSIONS[input.analyte];
  const forward = input.fromUnit === conversion.conventionalUnit && input.toUnit === conversion.siUnit;
  const reverse = input.fromUnit === conversion.siUnit && input.toUnit === conversion.conventionalUnit;
  if (!forward && !reverse) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['toUnit'], message: 'Unit pair does not match this analyte and specimen.' });
});

export type LabResultConversionInput = z.infer<typeof LabResultConversionInputSchema>;
export interface LabResultConversionResult {
  analyte: LabAnalyte;
  analyteLabel: string;
  inputValue: number;
  outputValue: number;
  fromUnit: string;
  toUnit: string;
  factor: number;
  operation: 'multiply' | 'divide';
  formula: string;
  source: string;
}

export function convertLabResultV6(input: LabResultConversionInput): LabResultConversionResult {
  const parsed = LabResultConversionInputSchema.parse(input);
  const mapping = LAB_CONVERSIONS[parsed.analyte];
  const forward = parsed.fromUnit === mapping.conventionalUnit;
  const raw = forward ? parsed.value * mapping.factor : parsed.value / mapping.factor;
  if (!Number.isFinite(raw)) throw new RangeError('Converted result is outside the supported numeric range.');
  const outputValue = Number(raw.toPrecision(8));
  return {
    analyte: parsed.analyte, analyteLabel: mapping.label, inputValue: parsed.value, outputValue,
    fromUnit: parsed.fromUnit, toUnit: parsed.toUnit, factor: mapping.factor,
    operation: forward ? 'multiply' : 'divide',
    formula: forward ? `${parsed.value} × ${mapping.factor} = ${outputValue}` : `${parsed.value} ÷ ${mapping.factor} = ${outputValue}`,
    source: mapping.source,
  };
}
