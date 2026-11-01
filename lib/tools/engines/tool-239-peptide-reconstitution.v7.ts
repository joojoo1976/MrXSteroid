import { PeptideLabelReferenceInputV7Schema, type PeptideLabelReferenceInputV7 } from '@/lib/tools/schemas/tool-239-peptide-reconstitution.v7';

export function recordPeptideLabelReference(raw: unknown) {
  const entry: PeptideLabelReferenceInputV7 = PeptideLabelReferenceInputV7Schema.parse(raw);
  return {
    status: 'RECORDED' as const,
    resultType: 'USER_PROVIDED' as const,
    entry: { ...entry, manufacturer: entry.manufacturer || null, note: entry.note || null },
    calculation: {
      status: 'NOT_AVAILABLE' as const,
      reasonCode: 'NO_VERIFIED_PRODUCT_INSTRUCTIONS' as const,
      message: 'No product-specific reconstitution calculation is provided by this tool.',
    },
    limitations: [
      'The source reference is user-entered and is not fetched or verified by this tool.',
      'Follow the current product labeling and contact the manufacturer or a pharmacist when instructions are unclear.',
      'No solvent, volume, concentration, dose, sterility, storage, or preparation instructions are calculated or supplied.',
    ],
  };
}
