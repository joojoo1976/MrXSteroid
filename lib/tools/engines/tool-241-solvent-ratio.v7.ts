import { GenericRatioInputV7Schema } from '@/lib/tools/schemas/tool-241-solvent-ratio.v7';

export function calculateGenericRatio(raw: unknown) {
  const input = GenericRatioInputV7Schema.parse(raw);
  const ratio = input.a / input.b;
  if (!Number.isFinite(ratio)) throw new RangeError('The ratio is outside the supported numeric range.');

  return {
    status: 'CALCULATED' as const,
    resultType: 'ARITHMETIC' as const,
    numerator: input.a,
    denominator: input.b,
    ratio: Number(ratio.toPrecision(10)),
    formula: 'a / b',
    limitations: [
      'Generic ratio arithmetic only; inputs have no chemical meaning assigned by this tool.',
      'No solvent, BA/BB, mixing, concentration, dose, or preparation instructions are provided.',
    ],
  };
}
