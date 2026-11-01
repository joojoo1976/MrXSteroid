/** Tool #035 — sourced unit conversion for testosterone and estradiol results. */
import {
  ConversionInputSchema,
  type ConversionInput,
  type ConversionResult,
} from '../schemas/tool-035-hormone-conversion';

export type { ConversionInput, ConversionResult } from '../schemas/tool-035-hormone-conversion';

const TESTOSTERONE_MOLAR_MASS_G_MOL = 288.4;
const ESTRADIOL_MOLAR_MASS_G_MOL = 272.4;
const TESTOSTERONE_NG_DL_TO_NMOL_L = 10 / TESTOSTERONE_MOLAR_MASS_G_MOL;
const ESTRADIOL_PG_ML_TO_PMOL_L = 1_000 / ESTRADIOL_MOLAR_MASS_G_MOL;

function roundToFourDecimalPlaces(value: number): number {
  return Math.round((value + Number.EPSILON) * 10_000) / 10_000;
}

function roundToEightDecimalPlaces(value: number): number {
  return Math.round((value + Number.EPSILON) * 100_000_000) / 100_000_000;
}

/** Converts concentration units only; it does not estimate or interpret hormones. */
export function calculateHormoneConversion(rawInput: ConversionInput): ConversionResult {
  const input = ConversionInputSchema.parse(rawInput);
  const isTestosterone = input.analyte === 'testosterone';
  const forward = isTestosterone ? input.unit === 'ng/dL' : input.unit === 'pg/mL';
  const conversionFactor = isTestosterone ? TESTOSTERONE_NG_DL_TO_NMOL_L : ESTRADIOL_PG_ML_TO_PMOL_L;
  const resultValue = forward
    ? input.value * conversionFactor
    : input.value / conversionFactor;
  const resultUnit = isTestosterone
    ? (forward ? 'nmol/L' : 'ng/dL')
    : (forward ? 'pmol/L' : 'pg/mL');

  return {
    status: 'CALCULATED',
    analyte: input.analyte,
    input_value: input.value,
    input_unit: input.unit,
    result_value: roundToFourDecimalPlaces(resultValue),
    result_unit: resultUnit,
    measurement_date: input.measurement_date,
    reading_source: input.reading_source,
    conversion_factor: roundToEightDecimalPlaces(forward ? conversionFactor : 1 / conversionFactor),
    calculation_method: 'MOLAR_MASS_DERIVED_UNIT_CONVERSION',
  };
}
