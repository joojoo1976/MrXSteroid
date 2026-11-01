import { GenericRatioInputV7Schema } from '@/lib/tools/schemas/tool-244-purity-yield-estimator.v7';

export function calculateGenericYield(raw: unknown) {
  const input = GenericRatioInputV7Schema.parse(raw);
  const ratio = input.output / input.input;
  if (!Number.isFinite(ratio)) throw new RangeError('The ratio is outside the supported numeric range.');

  return {
    status: 'CALCULATED' as const,
    resultType: 'ARITHMETIC' as const,
    input: input.input,
    output: input.output,
    ratio: Number(ratio.toPrecision(10)),
    ratioPercent: Number((ratio * 100).toPrecision(10)),
    formula: 'output / input',
    limitations: [
      'Generic arithmetic ratio only; input and output are user-defined quantities with matching units assumed.',
      'No purity, chemical yield, process efficiency, dose, concentration, or preparation claim is made.',
    ],
  };
}
