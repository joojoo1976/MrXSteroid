import { z } from 'zod';

export const ManualAggregationStatusSchema = z.enum(['current', 'old', 'incomplete', 'unknown']);

export const ManualAggregationEntrySchema = z.object({
  id: z.string().trim().min(1).max(80),
  metric: z.string().trim().min(1).max(120),
  value: z.string().trim().max(160).optional(),
  unit: z.string().trim().max(48).optional(),
  source: z.string().trim().max(160).optional(),
  recordedOn: z.string().date().optional(),
  derivedAt: z.string().datetime({ offset: true }).optional(),
  status: ManualAggregationStatusSchema,
  note: z.string().trim().max(300).optional(),
}).strict();

export const ManualAggregationInputSchema = z.object({
  entries: z.array(ManualAggregationEntrySchema).max(20),
}).strict().superRefine((input, context) => {
  const ids = input.entries.map((entry) => entry.id);
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['entries'], message: 'Entry identifiers must be unique.' });
  }
});

export type ManualAggregationEntry = z.infer<typeof ManualAggregationEntrySchema>;
export type ManualAggregationInput = z.infer<typeof ManualAggregationInputSchema>;

export type ManualAggregationDraftState =
  | { status: 'NOT_AVAILABLE'; reason: string }
  | { status: 'INVALID_INPUT'; errors: Array<{ index: number; field: string; message: string }> }
  | { status: 'PARTIAL'; incompleteEntryIds: string[] }
  | { status: 'READY'; input: ManualAggregationInput };

export interface ManualAggregationConflict {
  metric: string;
  entryIds: string[];
  kind: 'VALUE_CONFLICT' | 'UNIT_MISMATCH';
}

export interface ManualAggregationReviewedEntry extends ManualAggregationEntry {
  missingFields: Array<'value' | 'unit' | 'source' | 'recordedOn'>;
  disclosure: string[];
}

export type ManualAggregationResult =
  | { status: 'NOT_AVAILABLE'; entries: []; conflicts: []; reason: string; calculationType: 'MANUAL_AGGREGATION' }
  | { status: 'INVALID_INPUT'; entries: []; conflicts: []; reason: string; errors: string[]; calculationType: 'MANUAL_AGGREGATION' }
  | {
      status: 'PARTIAL' | 'CONFLICTED' | 'ASSEMBLED';
      entries: ManualAggregationReviewedEntry[];
      conflicts: ManualAggregationConflict[];
      reason: string | null;
      calculationType: 'MANUAL_AGGREGATION';
      assumptions: string[];
    };

const REQUIRED_FIELDS = ['value', 'unit', 'source', 'recordedOn'] as const;

function missingFields(entry: ManualAggregationEntry): ManualAggregationReviewedEntry['missingFields'] {
  return REQUIRED_FIELDS.filter((field) => !entry[field]?.trim()) as ManualAggregationReviewedEntry['missingFields'];
}

function normalizeMetric(metric: string): string {
  return metric.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');
}

function normalizeValue(value: string): string {
  const trimmed = value.trim();
  const numeric = Number(trimmed);
  return trimmed !== '' && Number.isFinite(numeric) ? String(numeric) : trimmed.normalize('NFKC').toLocaleLowerCase('en-US');
}

export function inspectManualAggregationDraft(raw: unknown): ManualAggregationDraftState {
  const parsed = ManualAggregationInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: 'INVALID_INPUT',
      errors: parsed.error.issues.map((issue) => ({
        index: typeof issue.path[1] === 'number' ? issue.path[1] : -1,
        field: String(issue.path.at(-1) ?? 'input'),
        message: issue.message,
      })),
    };
  }
  if (parsed.data.entries.length === 0) {
    return { status: 'NOT_AVAILABLE', reason: 'No user-selected entries were provided.' };
  }

  const incompleteEntryIds = parsed.data.entries
    .filter((entry) => entry.status === 'incomplete' || entry.status === 'unknown' || missingFields(entry).length > 0)
    .map((entry) => entry.id);
  return incompleteEntryIds.length > 0
    ? { status: 'PARTIAL', incompleteEntryIds }
    : { status: 'READY', input: parsed.data };
}

/**
 * Organizes only the records explicitly supplied by the user. It does not
 * fetch tools, convert units, score performance, infer freshness, or advise.
 */
export function assembleManualToolResults(raw: unknown): ManualAggregationResult {
  const parsed = ManualAggregationInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: 'INVALID_INPUT', entries: [], conflicts: [],
      reason: 'Input did not match the manual aggregation contract.',
      errors: parsed.error.issues.map((issue) => `${issue.path.join('.') || 'input'}: ${issue.message}`),
      calculationType: 'MANUAL_AGGREGATION',
    };
  }
  if (parsed.data.entries.length === 0) {
    return {
      status: 'NOT_AVAILABLE', entries: [], conflicts: [],
      reason: 'No user-selected entries were provided.', calculationType: 'MANUAL_AGGREGATION',
    };
  }

  const entries: ManualAggregationReviewedEntry[] = parsed.data.entries.map((entry) => {
    const missing = missingFields(entry);
    const disclosure: string[] = [];
    if (entry.status === 'current') disclosure.push('Marked current by the user; not independently verified.');
    if (entry.status === 'old') disclosure.push('Marked old by the user; freshness was not independently checked.');
    if (entry.status === 'incomplete') disclosure.push('Marked incomplete by the user.');
    if (entry.status === 'unknown') disclosure.push('Status is unknown; no freshness or validity assumption was made.');
    if (missing.length > 0) disclosure.push(`Missing fields: ${missing.join(', ')}.`);
    return { ...entry, missingFields: missing, disclosure };
  });

  const groups = new Map<string, ManualAggregationReviewedEntry[]>();
  for (const entry of entries) {
    const key = normalizeMetric(entry.metric);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }

  const conflicts: ManualAggregationConflict[] = [];
  for (const group of groups.values()) {
    const comparable = group.filter((entry) => entry.value?.trim() && entry.unit?.trim());
    if (comparable.length < 2) continue;
    const entryIds = comparable.map((entry) => entry.id);
    const units = new Set(comparable.map((entry) => entry.unit!.normalize('NFKC').trim().toLocaleLowerCase('en-US')));
    const values = new Set(comparable.map((entry) => normalizeValue(entry.value!)));
    const kind = units.size > 1 ? 'UNIT_MISMATCH' : values.size > 1 ? 'VALUE_CONFLICT' : null;
    if (kind) conflicts.push({ metric: comparable[0].metric, entryIds, kind });
  }

  const hasIncomplete = entries.some((entry) => entry.status === 'incomplete' || entry.status === 'unknown' || entry.missingFields.length > 0);
  const hasOld = entries.some((entry) => entry.status === 'old');
  const status = conflicts.length > 0 ? 'CONFLICTED' : hasIncomplete || hasOld ? 'PARTIAL' : 'ASSEMBLED';
  const reason = conflicts.length > 0
    ? 'Repeated metric entries conflict or use different units; inspect each source and value manually.'
    : hasIncomplete
      ? 'Some records are incomplete or have unknown status; missing data is not inferred.'
      : hasOld
        ? 'One or more records were marked old by the user; their freshness was not independently checked.'
        : null;

  return {
    status,
    entries,
    conflicts,
    reason,
    calculationType: 'MANUAL_AGGREGATION',
    assumptions: [
      'Only manually entered records are included.',
      'Values are displayed as entered; no unit conversion or normalization is performed.',
      'Freshness is not inferred; old/unknown labels come from the user.',
      'Conflicts are exact-label comparisons and require human review.',
      'No overall score, recommendation, or automated tool execution is produced.',
    ],
  };
}
