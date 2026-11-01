import {
  AnalysisUnitConversionInputV7Schema,
  type AnalysisUnitV7,
} from '@/lib/tools/schemas/tool-242-dosage-unit-conversion-engine.v7';

type UnitDefinition = { dimension: 'mass' | 'volume' | 'length' | 'pressure' | 'temperature'; factor: number; offset?: number };

const UNIT_DEFINITIONS: Record<AnalysisUnitV7, UnitDefinition> = {
  mg: { dimension: 'mass', factor: 1e-6 },
  g: { dimension: 'mass', factor: 1e-3 },
  kg: { dimension: 'mass', factor: 1 },
  lb: { dimension: 'mass', factor: 0.4535924 },
  mL: { dimension: 'volume', factor: 1e-3 },
  L: { dimension: 'volume', factor: 1 },
  fl_oz: { dimension: 'volume', factor: 0.02957353 },
  cup: { dimension: 'volume', factor: 0.2365882 },
  mm: { dimension: 'length', factor: 1e-3 },
  cm: { dimension: 'length', factor: 1e-2 },
  m: { dimension: 'length', factor: 1 },
  in: { dimension: 'length', factor: 0.0254 },
  ft: { dimension: 'length', factor: 0.3048 },
  Pa: { dimension: 'pressure', factor: 1 },
  kPa: { dimension: 'pressure', factor: 1_000 },
  bar: { dimension: 'pressure', factor: 100_000 },
  mmHg: { dimension: 'pressure', factor: 133.3224 },
  C: { dimension: 'temperature', factor: 1 },
  F: { dimension: 'temperature', factor: 5 / 9, offset: -32 * (5 / 9) },
};

export function convertAnalysisUnit(raw: unknown) {
  const input = AnalysisUnitConversionInputV7Schema.parse(raw);
  const from = UNIT_DEFINITIONS[input.fromUnit];
  const to = UNIT_DEFINITIONS[input.toUnit];
  if (from.dimension !== to.dimension) {
    throw new RangeError('Source and target units must belong to the same physical dimension.');
  }
  if (from.dimension !== 'temperature' && input.value < 0) {
    throw new RangeError('Negative values are invalid for these measured quantities.');
  }

  const canonical = input.value * from.factor + (from.offset ?? 0);
  if (from.dimension === 'temperature' && canonical < -273.15 - Number.EPSILON * 1_000) {
    throw new RangeError('Temperature cannot be below absolute zero.');
  }
  const value = (canonical - (to.offset ?? 0)) / to.factor;
  if (!Number.isFinite(value)) throw new RangeError('The converted value is outside the supported numeric range.');

  return {
    status: 'CALCULATED' as const,
    resultType: 'UNIT_CONVERSION' as const,
    value: Number(value.toPrecision(10)),
    fromUnit: input.fromUnit,
    toUnit: input.toUnit,
    dimension: from.dimension,
    formula: 'source value → canonical unit → target unit',
    limitations: [
      'Only the listed same-dimension measurement conversions are supported.',
      'No lab reference interpretation, analyte-specific conversion, medication or dosage conversion is provided.',
    ],
  };
}
