import { ChemistryObservationInputV7Schema } from '@/lib/tools/schemas/tool-246-homebrew-chemistry.v7';

export function recordChemistryNote(raw: unknown) {
  return {
    status: 'RECORDED' as const,
    resultType: 'USER_PROVIDED' as const,
    entry: ChemistryObservationInputV7Schema.parse(raw),
    limitations: [
      'User note only; this tool performs no chemistry calculation or laboratory analysis.',
      'No synthesis, mixing, heating, purification, formulation, dose, or preparation instructions.',
      'The note is not independently verified or persisted by this tool.',
    ],
  };
}
