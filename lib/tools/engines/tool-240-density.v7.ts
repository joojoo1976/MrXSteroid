import { DensityMeasurementInputV7Schema, type DensityMeasurementInputV7 } from '@/lib/tools/schemas/tool-240-raw-powder-density-engine.v7';

export function calculateMeasuredDensity(raw: unknown) {
  const input: DensityMeasurementInputV7 = DensityMeasurementInputV7Schema.parse(raw);
  const densityGPerMl = Number((input.massGrams / input.measuredVolumeMl).toPrecision(10));
  if (!Number.isFinite(densityGPerMl) || densityGPerMl <= 0) {
    throw new RangeError('The supplied measurements do not produce a positive finite density.');
  }

  return {
    status: 'CALCULATED' as const,
    resultType: 'CALCULATED' as const,
    inputClassification: 'USER_PROVIDED' as const,
    measurement: {
      massGrams: input.massGrams,
      measuredVolumeMl: input.measuredVolumeMl,
      method: input.measurementMethod,
      sourceReference: input.sourceReference,
    },
    density: { value: densityGPerMl, unit: 'g/mL' as const },
    limitations: [
      'Density is calculated only from the measured mass and volume entered for this sample.',
      'No substance reference values, purity, dose, mixing, reconstitution, or preparation instructions are provided.',
      'Measurement method and source are user-entered and are not independently verified.',
    ],
  };
}
