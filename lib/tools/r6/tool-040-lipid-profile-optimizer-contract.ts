/**
 * lib/tools/r6/tool-040-lipid-profile-optimizer-contract.ts
 * ═══════════════════════════════════════════════════════════════════════════
 * Tool #040 — Lipid Profile Optimizer: R6.1 input contract (SPEC-R6.1-2).
 *
 * PURE MODULE — no React, no DOM, no I/O, no clock. The clock is injected, so
 * the freshness rule is testable without pretending the current date is
 * something else.
 *
 * What this contract is:
 *   - the user-facing field list with fieldId + label + help + type + unit +
 *     range + required + dependsOn + visibilityRule + example (SPEC-R6.1-2.a);
 *   - a MIRROR of the engine's band ladder, so the UI can draw the band the
 *     engine actually used. The V6 engine remains authoritative; this mirror
 *     must never disagree with it;
 *   - the public reference sources (C4) — every one of them was fetched and
 *     answered HTTP 200 on the review date;
 *   - the lab freshness rule (lab = 90 days, SPEC-R6.1-2.i);
 *   - the cross-tool link contracts (SPEC-R6.1-2.h) with a freshness rule and
 *     a stale action;
 *   - a browser-only CSV export (no server call, no account).
 *
 * Two things this contract deliberately does NOT do:
 *   - it does not change the V6 engine or the Zod schema;
 *   - it does not add persistence. Tool 040 stays compute-and-display only: no
 *     draft, no dashboard snapshot, no session, no cloud storage (W18).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** The result engine is debounced: a burst of edits triggers ONE calculation. */
export const TOOL_040_DEBOUNCE_MS = 120;

/** Lab data is fresh for 90 days (SPEC-R6.1-2.i — a reviewable value, not a prescription). */
export const TOOL_040_LAB_FRESHNESS_DAYS = 90;

/** The canonical unit of every lipid value. Never converted. */
export const TOOL_040_LIPID_UNIT = 'mg/dL';

export type Tool040FieldId =
  | 'ldl_mg_dl'
  | 'hdl_mg_dl'
  | 'triglycerides_mg_dl'
  | 'total_cholesterol_mg_dl'
  | 'panel_date'
  | 'age'
  | 'smoker'
  | 'systolic_bp'
  | 'on_cycle'
  | 'weeks_remaining';

export type Tool040FieldType = 'decimal' | 'integer' | 'date' | 'boolean';

export interface Tool040VisibilityRule {
  /** True when the field is always rendered. */
  alwaysVisible: boolean;
  /** Condition key when the field is conditional; null when always visible. */
  condition: string | null;
  /** Why the rule is what it is (documentation, not user-facing copy). */
  reason: string;
}

export interface Tool040FieldContract {
  fieldId: Tool040FieldId;
  /** i18n key of the visible label (AR + EN). */
  labelKey: string;
  /** i18n key of the help text under the field and in the tooltip. */
  helpKey: string;
  type: Tool040FieldType;
  /** Canonical unit; null when the field is unitless. */
  unit: string | null;
  min: number | null;
  max: number | null;
  required: boolean;
  /** Shown as a placeholder. NEVER used as a default input value. */
  example: string;
  /** Whether the shared R6 slider upgrade fits this field. */
  slider: boolean;
  /** Why the slider is refused, when it is. */
  sliderReasonKey: string | null;
  /** Fields whose value changes how this field must be entered. */
  dependsOn: Tool040FieldId[];
  visibilityRule: Tool040VisibilityRule;
}

const ALWAYS_VISIBLE = (reason: string): Tool040VisibilityRule => ({
  alwaysVisible: true,
  condition: null,
  reason,
});

/** The contract required by SPEC-R6.1-2.a. */
export const TOOL_040_FIELD_CONTRACT: readonly Tool040FieldContract[] = [
  {
    fieldId: 'ldl_mg_dl',
    labelKey: 'field_ldl',
    helpKey: 'help_ldl',
    type: 'decimal',
    unit: TOOL_040_LIPID_UNIT,
    min: 0,
    max: 600,
    required: true,
    example: '130',
    slider: false,
    sliderReasonKey: 'slider_not_for_precision',
    dependsOn: [],
    visibilityRule: ALWAYS_VISIBLE('The LDL value is the first band the engine produces.'),
  },
  {
    fieldId: 'hdl_mg_dl',
    labelKey: 'field_hdl',
    helpKey: 'help_hdl',
    type: 'decimal',
    unit: TOOL_040_LIPID_UNIT,
    min: 0,
    max: 200,
    required: true,
    example: '38',
    slider: false,
    sliderReasonKey: 'slider_not_for_precision',
    dependsOn: [],
    visibilityRule: ALWAYS_VISIBLE('The HDL value is the second band the engine produces.'),
  },
  {
    fieldId: 'triglycerides_mg_dl',
    labelKey: 'field_tg',
    helpKey: 'help_tg',
    type: 'decimal',
    unit: TOOL_040_LIPID_UNIT,
    min: 0,
    max: 2000,
    required: true,
    example: '180',
    slider: false,
    sliderReasonKey: 'slider_not_for_precision',
    dependsOn: [],
    visibilityRule: ALWAYS_VISIBLE('The triglyceride value is the third band the engine produces.'),
  },
  {
    fieldId: 'total_cholesterol_mg_dl',
    labelKey: 'field_total_cholesterol',
    helpKey: 'help_total_cholesterol',
    type: 'decimal',
    unit: TOOL_040_LIPID_UNIT,
    min: 0,
    max: 800,
    required: false,
    example: '210',
    slider: false,
    sliderReasonKey: 'slider_not_for_precision',
    dependsOn: [],
    visibilityRule: {
      alwaysVisible: true,
      condition: null,
      reason:
        'Optional. The engine falls back to the Friedewald approximation (LDL + HDL + TG/5) when it is absent, and says so in the result.',
    },
  },
  {
    fieldId: 'panel_date',
    labelKey: 'field_panel_date',
    helpKey: 'help_panel_date',
    type: 'date',
    unit: null,
    min: null,
    max: null,
    required: true,
    example: '2026-02-01',
    slider: false,
    sliderReasonKey: 'slider_not_for_date',
    dependsOn: [],
    visibilityRule: ALWAYS_VISIBLE(
      'The freshness anchor: a lipid panel older than the lab freshness window is shown as stale and is not treated as current.',
    ),
  },
  {
    fieldId: 'age',
    labelKey: 'field_age',
    helpKey: 'help_age',
    type: 'integer',
    unit: null,
    min: 18,
    max: 90,
    required: true,
    example: '45',
    slider: true,
    sliderReasonKey: null,
    dependsOn: [],
    visibilityRule: ALWAYS_VISIBLE('The age feeds the risk escalation inside the engine.'),
  },
  {
    fieldId: 'smoker',
    labelKey: 'field_smoker',
    helpKey: 'help_smoker',
    type: 'boolean',
    unit: null,
    min: null,
    max: null,
    required: true,
    example: 'no',
    slider: false,
    sliderReasonKey: 'slider_not_for_boolean',
    dependsOn: [],
    visibilityRule: ALWAYS_VISIBLE('Smoking is an independent risk factor the engine escalates on.'),
  },
  {
    fieldId: 'systolic_bp',
    labelKey: 'field_sbp',
    helpKey: 'help_sbp',
    type: 'integer',
    unit: 'mmHg',
    min: 80,
    max: 260,
    required: true,
    example: '125',
    slider: false,
    sliderReasonKey: 'slider_not_for_precision',
    dependsOn: [],
    visibilityRule: ALWAYS_VISIBLE('Blood pressure is read next to the lipid bands.'),
  },
  {
    fieldId: 'on_cycle',
    labelKey: 'field_on_cycle',
    helpKey: 'help_on_cycle',
    type: 'boolean',
    unit: null,
    min: null,
    max: null,
    required: true,
    example: 'yes',
    slider: false,
    sliderReasonKey: 'slider_not_for_boolean',
    dependsOn: [],
    visibilityRule: ALWAYS_VISIBLE('On-cycle lipids drift; the engine escalates the band accordingly.'),
  },
  {
    fieldId: 'weeks_remaining',
    labelKey: 'field_weeks_remaining',
    helpKey: 'help_weeks_remaining',
    type: 'integer',
    unit: null,
    min: 0,
    max: 52,
    required: true,
    example: '8',
    slider: false,
    sliderReasonKey: 'slider_not_for_precision',
    dependsOn: ['on_cycle'],
    visibilityRule: {
      alwaysVisible: true,
      condition: null,
      reason:
        'Only meaningful while a cycle is running; the engine uses it for the borderline long-tail escalation.',
    },
  },
];

/* ── The band ladder, mirrored from the V6 engine ─────────────────────────── */

export type Tool040Band = 'optimal' | 'borderline' | 'high' | 'very-high';

export interface Tool040BandStep {
  band: Tool040Band;
  /** Lower bound (inclusive) of the band, in mg/dL. */
  lowerInclusive: number | null;
  /** Upper bound (exclusive) of the band, in mg/dL. */
  upperExclusive: number | null;
  /** True when a HIGHER value is better (HDL). */
  higherIsBetter: boolean;
}

/**
 * MIRROR of the thresholds in `lib/tools/engines/tool-040-lipid-profile-optimizer.ts`.
 * The engine is authoritative; this mirror exists so the UI can draw the band
 * the engine actually produced. `tool-040-lipid-profile-optimizer-pipeline.test.ts`
 * asserts that the mirror and the engine agree.
 */
export const TOOL_040_BANDS: Record<'LDL' | 'HDL' | 'TG', readonly Tool040BandStep[]> = {
  LDL: [
    { band: 'optimal', lowerInclusive: null, upperExclusive: 100, higherIsBetter: false },
    { band: 'borderline', lowerInclusive: 100, upperExclusive: 130, higherIsBetter: false },
    { band: 'high', lowerInclusive: 130, upperExclusive: 160, higherIsBetter: false },
    { band: 'very-high', lowerInclusive: 160, upperExclusive: null, higherIsBetter: false },
  ],
  HDL: [
    { band: 'high', lowerInclusive: null, upperExclusive: 40, higherIsBetter: true },
    { band: 'borderline', lowerInclusive: 40, upperExclusive: 60, higherIsBetter: true },
    { band: 'optimal', lowerInclusive: 60, upperExclusive: null, higherIsBetter: true },
  ],
  TG: [
    { band: 'optimal', lowerInclusive: null, upperExclusive: 150, higherIsBetter: false },
    { band: 'borderline', lowerInclusive: 150, upperExclusive: 200, higherIsBetter: false },
    { band: 'high', lowerInclusive: 200, upperExclusive: 500, higherIsBetter: false },
    { band: 'very-high', lowerInclusive: 500, upperExclusive: null, higherIsBetter: false },
  ],
};

/** The marker keys the UI plots, with their unit and their band source. */
export const TOOL_040_MARKERS = ['LDL', 'HDL', 'TG'] as const;
export type Tool040Marker = (typeof TOOL_040_MARKERS)[number];

/**
 * The reference limit drawn on each gauge: the edge of the "optimal" band.
 * For LDL and TG that is the upper edge (lower is better); for HDL it is the
 * lower edge of the optimal band (higher is better).
 */
export const TOOL_040_REFERENCE_LIMITS: Record<Tool040Marker, number> = {
  LDL: 100,
  HDL: 60,
  TG: 150,
};

/** The scale ceiling of each gauge (the first band edge above the reference). */
export const TOOL_040_GAUGE_MAX: Record<Tool040Marker, number> = {
  LDL: 200,
  HDL: 120,
  TG: 500,
};

/* ── Public reference sources (C4) ────────────────────────────────────────── */

export interface Tool040SourceRef {
  id: string;
  titleKey: string;
  noteKey: string;
  publisherKey: string;
  url: string;
  /** Publisher in words, for the evidence list. */
  publisher: string;
  /** The date the source was last checked (HTTP 200 verified on this date). */
  reviewedOn: string;
  /** Evidence level of the source itself. */
  evidenceLevel: 'E1' | 'E2' | 'E3';
}

/**
 * Every URL below was fetched and answered HTTP 200 on the review date.
 * They are public, general-audience references; they describe general
 * cholesterol and triglyceride categories, not this user's values.
 */
export const TOOL_040_SOURCES: readonly Tool040SourceRef[] = [
  {
    id: 'medlineplus-cholesterol-levels',
    titleKey: 'source_cholesterol_levels_title',
    noteKey: 'source_cholesterol_levels_note',
    publisherKey: 'source_medlineplus_publisher',
    url: 'https://medlineplus.gov/lab-tests/cholesterol-levels/',
    publisher: 'MedlinePlus, U.S. National Library of Medicine, NIH',
    reviewedOn: '2026-11-12',
    evidenceLevel: 'E2',
  },
  {
    id: 'medlineplus-triglycerides',
    titleKey: 'source_triglycerides_title',
    noteKey: 'source_triglycerides_note',
    publisherKey: 'source_medlineplus_publisher',
    url: 'https://medlineplus.gov/triglycerides.html',
    publisher: 'MedlinePlus, U.S. National Library of Medicine, NIH',
    reviewedOn: '2026-11-12',
    evidenceLevel: 'E2',
  },
  {
    id: 'medlineplus-cholesterol-topic',
    titleKey: 'source_cholesterol_topic_title',
    noteKey: 'source_cholesterol_topic_note',
    publisherKey: 'source_medlineplus_publisher',
    url: 'https://medlineplus.gov/cholesterol.html',
    publisher: 'MedlinePlus, U.S. National Library of Medicine, NIH',
    reviewedOn: '2026-11-12',
    evidenceLevel: 'E2',
  },
  {
    id: 'cdc-cholesterol',
    titleKey: 'source_cdc_cholesterol_title',
    noteKey: 'source_cdc_cholesterol_note',
    publisherKey: 'source_cdc_publisher',
    url: 'https://www.cdc.gov/cholesterol/about/index.html',
    publisher: 'Centers for Disease Control and Prevention (CDC)',
    reviewedOn: '2026-11-12',
    evidenceLevel: 'E2',
  },
];

/* ── Cross-tool links (SPEC-R6.1-2.h) ────────────────────────────────────── */

export interface Tool040MappedField {
  targetField: string;
  note: string;
}

export interface Tool040CrossToolLink {
  sourceToolId: string;
  targetToolId: string;
  mappedFields: Tool040MappedField[];
  freshnessRule: string;
  staleAction: string;
  /**
   * `manual-reentry` is the ONLY transfer mode allowed while W18 is pending:
   * nothing moves between tools and nothing is shared between them.
   */
  transfer: 'manual-reentry';
}

export const TOOL_040_CROSS_TOOL_LINKS: readonly Tool040CrossToolLink[] = [
  {
    sourceToolId: 'tool-040-lipid-profile-optimizer',
    targetToolId: 'tool-039-liver-enzyme-tracker',
    mappedFields: [
      { targetField: 'draw_date', note: 'the panel date and the blood-draw date are compared by hand' },
      { targetField: 'readings[].marker / value / unit', note: 'both tools use mg/dL for their shared markers' },
    ],
    freshnessRule: 'lab data is fresh for 90 days (TOOL_040_LAB_FRESHNESS_DAYS) on both sides',
    staleAction: 'show the older panel as stale and never merge it into the newer one automatically',
    transfer: 'manual-reentry',
  },
  {
    sourceToolId: 'tool-040-lipid-profile-optimizer',
    targetToolId: 'tool-007-bloodwork-analyzer',
    mappedFields: [
      { targetField: 'panel values', note: 'the lipid values can be read by hand from the same blood panel' },
    ],
    freshnessRule: 'lab data is fresh for 90 days',
    staleAction: 'ask for a current panel before drawing any conclusion from an old one',
    transfer: 'manual-reentry',
  },
];

/* ── Freshness (lab = 90 days) ────────────────────────────────────────────── */

/**
 * True when the string is a REAL calendar date. `2026-02-30` is not: the
 * JavaScript Date constructor would silently roll it over to 2026-03-02, so the
 * check is done here instead of trusting the parser.
 */
export function isRealCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (month < 1 || month > 12 || day < 1) return false;
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

/** Days between an ISO date and a reference ISO date — date-only, timezone free. */
export function daysSinceDate(isoDate: string, referenceIsoDate: string): number | null {
  // A date that is not a real calendar date has no age: it is rejected, never
  // rolled over into a neighbouring month.
  if (!isRealCalendarDate(isoDate) || !isRealCalendarDate(referenceIsoDate)) return null;
  const read = Date.parse(`${isoDate}T00:00:00.000Z`);
  const reference = Date.parse(`${referenceIsoDate}T00:00:00.000Z`);
  if (Number.isNaN(read) || Number.isNaN(reference)) return null;
  return Math.round((reference - read) / 86_400_000);
}

/** Freshness verdict for the panel, computed AT READ TIME. */
export function labFreshness(isoDate: string, referenceIsoDate: string): { ageDays: number | null; stale: boolean } {
  const ageDays = daysSinceDate(isoDate, referenceIsoDate);
  if (ageDays === null) return { ageDays: null, stale: false };
  return { ageDays, stale: ageDays > TOOL_040_LAB_FRESHNESS_DAYS };
}

/* ── CSV export (browser only) ─────────────────────────────────────────────── */

export interface Tool040CsvInput {
  panel: { ldl_mg_dl: number; hdl_mg_dl: number; triglycerides_mg_dl: number; total_cholesterol_mg_dl?: number };
  age: number;
  smoker: boolean;
  systolic_bp: number;
  on_cycle: boolean;
  weeks_remaining: number;
}

export interface Tool040CsvResult {
  ldl_status: string;
  hdl_status: string;
  tg_status: string;
  non_hdl: number;
  overall_band: string;
  interventions: string[];
}

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/**
 * CSV of the entered panel and the computed bands. Generated in the browser
 * only — no server call, no account, no secret.
 */
export function buildLipidOptimizerCsv(input: Tool040CsvInput, result: Tool040CsvResult): string {
  const rows: string[][] = [
    ['tool', 'tool-040-lipid-profile-optimizer'],
    [],
    ['marker', 'value', 'unit'],
    ['ldl_mg_dl', String(input.panel.ldl_mg_dl), TOOL_040_LIPID_UNIT],
    ['hdl_mg_dl', String(input.panel.hdl_mg_dl), TOOL_040_LIPID_UNIT],
    ['triglycerides_mg_dl', String(input.panel.triglycerides_mg_dl), TOOL_040_LIPID_UNIT],
    ...(input.panel.total_cholesterol_mg_dl === undefined
      ? []
      : [['total_cholesterol_mg_dl', String(input.panel.total_cholesterol_mg_dl), TOOL_040_LIPID_UNIT]]),
    [],
    ['ldl_band', result.ldl_status],
    ['hdl_band', result.hdl_status],
    ['tg_band', result.tg_status],
    ['non_hdl_mg_dl', String(result.non_hdl), TOOL_040_LIPID_UNIT],
    ['overall_band', result.overall_band],
    [],
    ['age', String(input.age)],
    ['smoker', String(input.smoker)],
    ['systolic_bp', String(input.systolic_bp)],
    ['on_cycle', String(input.on_cycle)],
    ['weeks_remaining', String(input.weeks_remaining)],
    [],
    ['interventions'],
    ...result.interventions.map((intervention) => [intervention]),
  ];
  return rows.map((row) => row.map(csvCell).join(',')).join('\n');
}
