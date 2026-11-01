import { ManualCommandInputV7Schema } from '@/lib/tools/schemas/tool-252-command-center.v7';

const REQUIRED_DISPLAY_FIELDS = ['value', 'unit', 'source', 'recordedOn', 'freshness'] as const;

export function assembleCommandEntries(raw: unknown) {
  const input = ManualCommandInputV7Schema.parse(raw);
  const entries = input.entries.map((entry) => {
    const missingFields = REQUIRED_DISPLAY_FIELDS.filter((field) => !entry[field]);
    return { ...entry, missingFields };
  });
  const status = entries.length === 0 || entries.some((entry) => entry.missingFields.length > 0)
    ? 'PARTIAL' as const
    : 'RECORDED' as const;

  return {
    status,
    resultType: 'USER_SELECTED' as const,
    entries,
    limitations: [
      'Manual aggregation only; values are not recalculated, normalized, ranked, reconciled, or recommended.',
      'Source, unit, date, freshness, and conflict labels are supplied by the user and are not independently checked.',
      'No automatic tool execution, external action, or cross-tool data import occurs.',
    ],
  };
}
