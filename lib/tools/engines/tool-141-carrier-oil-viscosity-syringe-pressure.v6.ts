import { z } from 'zod';

export const NewtonianTubeFlowInputSchema = z.object({
  dynamicViscosityPaS: z.number().finite().positive().max(1_000_000),
  densityKgM3: z.number().finite().positive().max(100_000),
  innerDiameterM: z.number().finite().positive().max(0.05),
  tubeLengthM: z.number().finite().positive().max(10),
  volumetricFlowM3S: z.number().finite().positive().max(0.1),
  measurementTemperatureC: z.number().finite().min(-273.15).max(1_000),
  viscositySource: z.string().trim().min(1).max(400),
  densitySource: z.string().trim().min(1).max(400),
  assumptionsAcknowledged: z.literal(true),
}).strict();

export type NewtonianTubeFlowInput = z.infer<typeof NewtonianTubeFlowInputSchema>;

export type NewtonianTubeFlowResult =
  | {
    status: 'CALCULATED';
    resultType: 'CALCULATED';
    reynoldsNumber: number;
    idealTubePressureDropPa: number;
    measurementTemperatureC: number;
    viscositySource: string;
    densitySource: string;
    model: 'HAGEN_POISEUILLE_IDEAL_TUBE';
    limitations: readonly string[];
  }
  | {
    status: 'NOT_AVAILABLE';
    reason: 'TRANSITIONAL_FLOW' | 'TURBULENT_FLOW';
    reynoldsNumber: number;
    measurementTemperatureC: number;
    viscositySource: string;
    densitySource: string;
    model: 'HAGEN_POISEUILLE_IDEAL_TUBE';
  };

const LAMINAR_REYNOLDS_MAX = 2_000;
const TRANSITION_REYNOLDS_MAX = 4_000;
const MAX_PRESSURE_DROP_PA = 1e15;

function finiteRounded(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > MAX_PRESSURE_DROP_PA) {
    throw new RangeError('Ideal tube pressure drop is outside the supported finite range.');
  }
  return Number(value.toPrecision(10));
}

/** Ideal, steady, laminar, Newtonian pressure drop in one straight circular tube. */
export function calculateNewtonianTubePressureV6(input: NewtonianTubeFlowInput): NewtonianTubeFlowResult {
  const data = NewtonianTubeFlowInputSchema.parse(input);
  const areaM2 = Math.PI * (data.innerDiameterM / 2) ** 2;
  const meanVelocityMPerS = data.volumetricFlowM3S / areaM2;
  const reynoldsNumber = finiteRounded(data.densityKgM3 * meanVelocityMPerS * data.innerDiameterM / data.dynamicViscosityPaS);

  if (reynoldsNumber >= TRANSITION_REYNOLDS_MAX) {
    return {
      status: 'NOT_AVAILABLE', reason: 'TURBULENT_FLOW', reynoldsNumber,
      measurementTemperatureC: data.measurementTemperatureC,
      viscositySource: data.viscositySource, densitySource: data.densitySource,
      model: 'HAGEN_POISEUILLE_IDEAL_TUBE',
    };
  }
  if (reynoldsNumber >= LAMINAR_REYNOLDS_MAX) {
    return {
      status: 'NOT_AVAILABLE', reason: 'TRANSITIONAL_FLOW', reynoldsNumber,
      measurementTemperatureC: data.measurementTemperatureC,
      viscositySource: data.viscositySource, densitySource: data.densitySource,
      model: 'HAGEN_POISEUILLE_IDEAL_TUBE',
    };
  }

  const idealTubePressureDropPa = finiteRounded(
    (128 * data.dynamicViscosityPaS * data.tubeLengthM * data.volumetricFlowM3S)
      / (Math.PI * data.innerDiameterM ** 4),
  );

  return {
    status: 'CALCULATED',
    resultType: 'CALCULATED',
    reynoldsNumber,
    idealTubePressureDropPa,
    measurementTemperatureC: data.measurementTemperatureC,
    viscositySource: data.viscositySource,
    densitySource: data.densitySource,
    model: 'HAGEN_POISEUILLE_IDEAL_TUBE',
    limitations: [
      'steady, incompressible, Newtonian, fully developed laminar flow',
      'one straight rigid circular tube with constant internal diameter',
      'excludes inlet, outlet, fittings, bends, needle hub and syringe plunger friction',
      'not an actual syringe force, injection-time, safety or suitability result',
    ],
  };
}
