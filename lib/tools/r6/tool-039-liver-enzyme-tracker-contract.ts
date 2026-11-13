/**
 * lib/tools/r6/tool-039-liver-enzyme-tracker-contract.ts
 * ═══════════════════════════════════════════════════════════════════════════
 * Tool #039 — Liver Enzyme Tracker
 * R6.1 Dynamic Input Contract (v2 shape) + reference metadata.
 *
 * PURE MODULE — no React, no DOM, no I/O, no clock, no network.
 *
 * The V6 engine (`lib/tools/engines/tool-039-liver-enzyme-tracker.ts`) stays the
 * single calculation source and is NOT modified. The reference limits below are
 * a *mirror* of the engine's own ULN constants, and
 * `tool-039-liver-enzyme-tracker-contract.test.ts` proves they still agree with
 * the engine (same multiples, same status thresholds). If the engine ever
 * changes, that test fails instead of the UI silently drifting.
 *
 * All user-visible strings are resolved through `i18n/tool-039-liver-enzyme-tracker.json`
 * by key, so this module never carries translated copy.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type Tool039Marker = 'ALT' | 'AST' | 'GGT' | 'ALP' | 'bilirubin';

export const TOOL_039_MARKERS: readonly Tool039Marker[] = ['ALT', 'AST', 'GGT', 'ALP', 'bilirubin'];

/**
 * Reference upper limits used by the engine (standard adult reference).
 * Unit is fixed per marker — the engine performs no unit conversion.
 */
export const TOOL_039_REFERENCE_LIMITS: Record<Tool039Marker, { uln: number; unit: string }> = {
  ALT: { uln: 56, unit: 'U/L' },
  AST: { uln: 40, unit: 'U/L' },
  GGT: { uln: 60, unit: 'U/L' },
  ALP: { uln: 147, unit: 'U/L' },
  bilirubin: { uln: 1.2, unit: 'mg/dL' },
};

/** Engine status thresholds (multiple of the upper reference limit). */
export const TOOL_039_STATUS_THRESHOLDS = {
  elevatedAbove: 1,
  highAt: 3,
  criticalAt: 5,
} as const;

/** Schema bounds mirrored from `LiverTrackerInputSchema` (source of truth: Zod). */
export const TOOL_039_VALUE_RANGE = { min: 0, max: 5000 } as const;
export const TOOL_039_ALCOHOL_RANGE = { min: 0, max: 100 } as const;
export const TOOL_039_MAX_READINGS = 100;

/**
 * Freshness rule for lab data (R6.1: Lab 90d). A reading older than this is
 * shown as stale and is never presented as current.
 */
export const TOOL_039_LAB_FRESHNESS_DAYS = 90;

/**
 * Debounce window for the result engine (SPEC-R6.1-2: "Dynamic Result Engine:
 * deterministic, debounced, same inputs = same outputs"). A burst of edits must
 * trigger exactly one calculation.
 */
export const TOOL_039_DEBOUNCE_MS = 120;

export type Tool039FieldId =
  | 'reading_marker'
  | 'reading_value'
  | 'reading_unit'
  | 'reading_date'
  | 'oral_steroids'
  | 'uses_tudca'
  | 'alcohol_drinks_per_week';

export type Tool039FieldType = 'marker' | 'decimal' | 'unit' | 'date' | 'tri_state' | 'integer';

export interface Tool039VisibilityRule {
  /** The field is always rendered for this tool. */
  alwaysVisible: boolean;
  /** Condition key when the field is conditional; `null` for always-visible fields. */
  condition: string | null;
  /** Why the rule is what it is (documentation, not user-facing copy). */
  reason: string;
}

export interface Tool039FieldContract {
  fieldId: Tool039FieldId;
  /** i18n key for the visible label (en/ar). */
  labelKey: string;
  /** i18n key for the help text shown under the field and used by tooltips. */
  helpKey: string;
  type: Tool039FieldType;
  /** Canonical unit. `null` when the field is unitless. */
  unit: string | null;
  min: number | null;
  max: number | null;
  required: boolean;
  /** Example value shown as a placeholder (never used as a default input). */
  example: string;
  /** Whether the shared R6 slider upgrade is appropriate for this field. */
  slider: boolean;
  /** Why the slider is not applied, when it is not. */
  sliderReasonKey: string | null;
  /** Fields whose value changes how this field must be entered. */
  dependsOn: Tool039FieldId[];
  /** Visibility rule for this field. */
  visibilityRule: Tool039VisibilityRule;
}

const ALWAYS_VISIBLE = (reason: string): Tool039VisibilityRule => ({
  alwaysVisible: true,
  condition: null,
  reason,
});

/**
 * The contract as required by SPEC-R6.1-2 (fieldId + label AR/EN + type +
 * unit + range + required + dependsOn + visibilityRule + helpText + example).
 */
export const TOOL_039_FIELD_CONTRACT: readonly Tool039FieldContract[] = [
  {
    fieldId: 'reading_marker',
    labelKey: 'field_marker',
    helpKey: 'help_marker',
    type: 'marker',
    unit: null,
    min: null,
    max: null,
    required: true,
    example: 'ALT',
    slider: false,
    sliderReasonKey: 'slider_not_for_select',
    dependsOn: [],
    visibilityRule: ALWAYS_VISIBLE(
      'The marker list is fixed by the engine contract (ALT, AST, GGT, ALP, bilirubin) and is always offered.',
    ),
  },
  {
    fieldId: 'reading_value',
    labelKey: 'field_value',
    helpKey: 'help_value',
    type: 'decimal',
    unit: 'U/L or mg/dL (fixed by marker)',
    min: TOOL_039_VALUE_RANGE.min,
    max: TOOL_039_VALUE_RANGE.max,
    required: true,
    example: '45',
    slider: false,
    sliderReasonKey: 'slider_not_for_precision',
    dependsOn: ['reading_marker'],
    visibilityRule: ALWAYS_VISIBLE(
      'A reading needs a value; its unit and its reference limit follow the selected marker.',
    ),
  },
  {
    fieldId: 'reading_unit',
    labelKey: 'field_unit',
    helpKey: 'help_unit',
    type: 'unit',
    unit: 'U/L or mg/dL (fixed by marker)',
    min: null,
    max: null,
    required: true,
    example: 'U/L',
    slider: false,
    sliderReasonKey: 'slider_not_for_readonly',
    dependsOn: ['reading_marker'],
    visibilityRule: ALWAYS_VISIBLE(
      'The unit is derived from the marker and is read-only, so it is shown next to the value instead of being editable.',
    ),
  },
  {
    fieldId: 'reading_date',
    labelKey: 'field_date',
    helpKey: 'help_date',
    type: 'date',
    unit: null,
    min: null,
    max: null,
    required: true,
    example: '2026-01-01',
    slider: false,
    sliderReasonKey: 'slider_not_for_date',
    dependsOn: [],
    visibilityRule: ALWAYS_VISIBLE(
      'A draw date is required for every reading because the trend and the freshness rule are date-based.',
    ),
  },
  {
    fieldId: 'oral_steroids',
    labelKey: 'field_oral_steroids',
    helpKey: 'help_oral_steroids',
    type: 'tri_state',
    unit: null,
    min: null,
    max: null,
    required: true,
    example: 'no',
    slider: false,
    sliderReasonKey: 'slider_not_for_select',
    dependsOn: [],
    visibilityRule: ALWAYS_VISIBLE(
      'Oral steroid use drives the engine recommendations, so the question is always asked and stays unanswered until the user picks yes or no.',
    ),
  },
  {
    fieldId: 'uses_tudca',
    labelKey: 'field_uses_tudca',
    helpKey: 'help_uses_tudca',
    type: 'tri_state',
    unit: null,
    min: null,
    max: null,
    required: true,
    example: 'no',
    slider: false,
    sliderReasonKey: 'slider_not_for_select',
    dependsOn: ['oral_steroids'],
    visibilityRule: ALWAYS_VISIBLE(
      'TUDCA use is clinically relevant in the oral-steroid context, but the input contract requires the answer in every case, so the question is never hidden.',
    ),
  },
  {
    fieldId: 'alcohol_drinks_per_week',
    labelKey: 'field_alcohol',
    helpKey: 'help_alcohol',
    type: 'integer',
    unit: 'drinks/week',
    min: TOOL_039_ALCOHOL_RANGE.min,
    max: TOOL_039_ALCOHOL_RANGE.max,
    required: true,
    example: '0',
    slider: true,
    sliderReasonKey: null,
    dependsOn: [],
    visibilityRule: ALWAYS_VISIBLE(
      'Alcohol intake multiplies hepatotoxicity in the engine recommendations, so it is always asked.',
    ),
  },
];

export interface Tool039SourceRef {
  id: string;
  /** i18n key for the source title. */
  titleKey: string;
  /** i18n key for the publisher name. */
  publisherKey: string;
  publisher: string;
  /** ISO date the source was reviewed for this tool. */
  reviewedOn: string;
  /** R6.1 evidence level for the reference. */
  evidenceLevel: 'E2';
  url: string;
  /** i18n key for the short note explaining what the source is (and is not). */
  noteKey: string;
}

/**
 * Public educational references used for interpretation and care-seeking
 * guidance. They are NOT the source of the engine's reference limits, and the
 * UI states that explicitly.
 */
export const TOOL_039_SOURCES: readonly Tool039SourceRef[] = [
  {
    id: 'medlineplus-liver-function-tests',
    titleKey: 'source_liver_function_tests_title',
    publisherKey: 'source_nlm_publisher',
    publisher: 'U.S. National Library of Medicine (NIH)',
    reviewedOn: '2026-11-11',
    evidenceLevel: 'E2',
    url: 'https://medlineplus.gov/lab-tests/liver-function-tests/',
    noteKey: 'source_liver_function_tests_note',
  },
  {
    id: 'medlineplus-bilirubin-blood-test',
    titleKey: 'source_bilirubin_title',
    publisherKey: 'source_nlm_publisher',
    publisher: 'U.S. National Library of Medicine (NIH)',
    reviewedOn: '2026-11-11',
    evidenceLevel: 'E2',
    url: 'https://medlineplus.gov/lab-tests/bilirubin-blood-test/',
    noteKey: 'source_bilirubin_note',
  },
  {
    id: 'medlineplus-alkaline-phosphatase',
    titleKey: 'source_alkaline_phosphatase_title',
    publisherKey: 'source_nlm_publisher',
    publisher: 'U.S. National Library of Medicine (NIH)',
    reviewedOn: '2026-11-11',
    evidenceLevel: 'E2',
    url: 'https://medlineplus.gov/lab-tests/alkaline-phosphatase/',
    noteKey: 'source_alkaline_phosphatase_note',
  },
  {
    id: 'niddk-liver-disease',
    titleKey: 'source_niddk_liver_title',
    publisherKey: 'source_niddk_publisher',
    publisher: 'National Institute of Diabetes and Digestive and Kidney Diseases (NIH)',
    reviewedOn: '2026-11-11',
    evidenceLevel: 'E2',
    url: 'https://www.niddk.nih.gov/health-information/liver-disease',
    noteKey: 'source_niddk_liver_note',
  },
];

/** Related tools (cross-tool links). Hrefs are resolved through the registry. */
export const TOOL_039_RELATED_TOOL_SLUGS: readonly string[] = [
  'tool-024-bloodwork-interpreter',
  'tool-007-bloodwork-analyzer',
  'tool-041-hematocrit-monitor',
];

/**
 * Cross-tool link contract (SPEC-R6.1-2: sourceToolId + targetToolId +
 * mappedFields + freshnessRule + staleAction).
 *
 * `transfer` is always `manual-reentry`: this tool stores nothing and W18
 * (session / cloud sync) is not approved, so no payload may move between tools.
 * The contract therefore documents the mapping and the staleness rule without
 * implementing a transfer.
 */
export interface Tool039MappedField {
  /** Field name in this tool's input contract. */
  from: string;
  /** Field name expected by the target tool. */
  to: string;
  /** Unit carried across, or `null` when the field carries no unit. */
  unit: string | null;
  /** Why this mapping is correct. */
  note: string;
}

export interface Tool039CrossToolLink {
  sourceToolId: string;
  targetToolId: string;
  targetSlug: string;
  mappedFields: Tool039MappedField[];
  freshnessRule: { source: 'lab'; maxAgeDays: number };
  staleAction: 'mark-stale-and-ask-user-to-refresh';
  transfer: 'manual-reentry';
  /** Empty when the target shares no analyte with this tool. */
  noSharedFieldReason: string | null;
}

const LAB_ANALYTES: Tool039MappedField[] = [
  { from: 'reading_value[ALT]', to: 'alt', unit: 'U/L', note: 'Same analyte and unit; the target applies the same reference limits.' },
  { from: 'reading_value[AST]', to: 'ast', unit: 'U/L', note: 'Same analyte and unit; the target applies the same reference limits.' },
  { from: 'reading_value[GGT]', to: 'ggt', unit: 'U/L', note: 'Same analyte and unit; the target applies the same reference limits.' },
  { from: 'reading_value[ALP]', to: 'alp', unit: 'U/L', note: 'Same analyte and unit; the target applies the same reference limits.' },
  { from: 'reading_value[bilirubin]', to: 'bilirubin', unit: 'mg/dL', note: 'Same analyte and unit; no conversion is applied on either side.' },
  { from: 'reading_date', to: 'date', unit: null, note: 'The draw date is the freshness anchor for both tools.' },
];

export const TOOL_039_CROSS_TOOL_LINKS: readonly Tool039CrossToolLink[] = [
  {
    sourceToolId: 'mrx.tool.039-liver-enzyme-tracker',
    targetToolId: 'mrx.tool.024-bloodwork-interpreter',
    targetSlug: 'tool-024-bloodwork-interpreter',
    mappedFields: LAB_ANALYTES,
    freshnessRule: { source: 'lab', maxAgeDays: TOOL_039_LAB_FRESHNESS_DAYS },
    staleAction: 'mark-stale-and-ask-user-to-refresh',
    transfer: 'manual-reentry',
    noSharedFieldReason: null,
  },
  {
    sourceToolId: 'mrx.tool.039-liver-enzyme-tracker',
    targetToolId: 'mrx.tool.007-bloodwork-analyzer',
    targetSlug: 'tool-007-bloodwork-analyzer',
    mappedFields: LAB_ANALYTES,
    freshnessRule: { source: 'lab', maxAgeDays: TOOL_039_LAB_FRESHNESS_DAYS },
    staleAction: 'mark-stale-and-ask-user-to-refresh',
    transfer: 'manual-reentry',
    noSharedFieldReason: null,
  },
  {
    sourceToolId: 'mrx.tool.039-liver-enzyme-tracker',
    targetToolId: 'mrx.tool.041-hematocrit-monitor',
    targetSlug: 'tool-041-hematocrit-monitor',
    mappedFields: [],
    freshnessRule: { source: 'lab', maxAgeDays: TOOL_039_LAB_FRESHNESS_DAYS },
    staleAction: 'mark-stale-and-ask-user-to-refresh',
    transfer: 'manual-reentry',
    noSharedFieldReason:
      'No shared analyte: this tool measures liver enzymes, while the hematocrit monitor needs hemoglobin and hematocrit. The link is navigational only.',
  },
];

/**
 * CSV export of the readings and the computed result.
 * Generated in the browser only — no server call, no account, no secrets.
 */
export function buildLiverTrackerCsv(
  input: { readings: Array<{ marker: string; value: number; unit: string; date: string }>; oral_steroids: boolean; alcohol_drinks_per_week: number; uses_tudca: boolean },
  result: {
    overall_status: string;
    stop_orals: boolean;
    markers: Array<{ marker: string; latest_value: number; unit: string; uln_multiple: number; status: string; trend_per_30d: number }>;
    recommendations: string[];
  },
): string {
  const escape = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  const rows: string[][] = [
    ['tool', 'tool-039-liver-enzyme-tracker'],
    ['marker', 'value', 'unit', 'date'],
    ...input.readings.map((reading) => [reading.marker, String(reading.value), reading.unit, reading.date]),
    [],
    ['overall_status', result.overall_status],
    ['stop_orals', String(result.stop_orals)],
    ['oral_steroids', String(input.oral_steroids)],
    ['alcohol_drinks_per_week', String(input.alcohol_drinks_per_week)],
    ['uses_tudca', String(input.uses_tudca)],
    [],
    ['marker', 'latest_value', 'unit', 'uln_multiple', 'status', 'trend_per_30d'],
    ...result.markers.map((marker) => [
      marker.marker,
      String(marker.latest_value),
      marker.unit,
      String(marker.uln_multiple),
      marker.status,
      String(marker.trend_per_30d),
    ]),
    [],
    ['recommendations'],
    ...result.recommendations.map((recommendation) => [recommendation]),
  ];
  return rows.map((row) => row.map(escape).join(',')).join('\n');
}

/** Days between a reading date and "today" — date-only, timezone free. */
export function daysSinceDate(isoDate: string, referenceIsoDate: string): number | null {
  const read = Date.parse(`${isoDate}T00:00:00.000Z`);
  const reference = Date.parse(`${referenceIsoDate}T00:00:00.000Z`);
  if (Number.isNaN(read) || Number.isNaN(reference)) return null;
  return Math.round((reference - read) / 86_400_000);
}

/** Freshness verdict for the newest reading (lab data = 90 days). */
export function labFreshness(isoDate: string, referenceIsoDate: string): {
  ageDays: number | null;
  stale: boolean;
} {
  const ageDays = daysSinceDate(isoDate, referenceIsoDate);
  if (ageDays === null) return { ageDays: null, stale: false };
  return { ageDays, stale: ageDays > TOOL_039_LAB_FRESHNESS_DAYS };
}
