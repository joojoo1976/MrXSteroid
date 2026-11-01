import { OilObservationInputV7Schema } from '@/lib/tools/schemas/tool-243-carrier-oil-viscosity-estimator.v7';

export function recordOilNote(raw: unknown) {
  return {
    status: 'RECORDED' as const,
    resultType: 'USER_PROVIDED' as const,
    entry: OilObservationInputV7Schema.parse(raw),
    limitations: [
      'User observation only; no oil ranking, selection, viscosity estimate, syringe-pressure estimate, or formulation advice.',
      'The note is not independently verified and is not persisted by this tool.',
    ],
  };
}
