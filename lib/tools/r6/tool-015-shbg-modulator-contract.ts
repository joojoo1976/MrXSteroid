/**
 * lib/tools/r6/tool-015-shbg-modulator-contract.ts
 * ═══════════════════════════════════════════════════════════════════════════
 * Tool #015 — SHBG Modulator & Free Testosterone Calculator: R6.1 Contract
 *
 * PURE MODULE — zero React, DOM, I/O, or clock dependencies.
 *
 * Defines:
 *   - Field contracts (Total T, SHBG, Albumin, Panel Date);
 *   - Clinical reference limits (Endocrine Society, Vermeulen 1999);
 *   - Derived Free Androgen Index (FAI = 100 * (TT_nmol / SHBG_nmol));
 *   - Lab freshness rules (90 days);
 *   - High-evidence peer-reviewed references;
 *   - Cross-tool navigation links;
 *   - Client-side CSV export generator.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TOOL_015_DEBOUNCE_MS = 120;
export const TOOL_015_LAB_FRESHNESS_DAYS = 90;

export type Tool015ShbgBand = 'low' | 'optimal' | 'high';

export const TOOL_015_REFERENCE_LIMITS = {
  shbg: {
    low: 15,
    optimalMin: 15,
    optimalMax: 50,
    high: 50,
    unit: 'nmol/L',
  },
  totalT: {
    low: 300,
    optimalMin: 300,
    optimalMax: 1000,
    high: 1000,
    unit: 'ng/dL',
  },
  albumin: {
    low: 3.5,
    optimalMin: 3.5,
    optimalMax: 5.0,
    high: 5.0,
    unit: 'g/dL',
  },
  freeT: {
    low: 5.0,
    optimalMin: 5.0,
    optimalMax: 21.0,
    high: 21.0,
    unit: 'ng/dL',
  },
  fai: {
    low: 30,
    optimalMin: 30,
    optimalMax: 150,
    high: 150,
    unit: '%',
  },
} as const;

export type Tool015FieldId =
  | 'total_testosterone_ng_dL'
  | 'shbg_nmol_L'
  | 'albumin_g_dL'
  | 'panel_date';

export interface Tool015FieldContract {
  fieldId: Tool015FieldId;
  labelKey: string;
  helpKey: string;
  type: 'decimal' | 'date';
  unit: string | null;
  min: number | null;
  max: number | null;
  required: boolean;
  example: string;
}

export const TOOL_015_FIELD_CONTRACT: Tool015FieldContract[] = [
  {
    fieldId: 'total_testosterone_ng_dL',
    labelKey: 'total_testosterone',
    helpKey: 'help_total_testosterone',
    type: 'decimal',
    unit: 'ng/dL',
    min: 0.1,
    max: 10000,
    required: true,
    example: '650',
  },
  {
    fieldId: 'shbg_nmol_L',
    labelKey: 'shbg',
    helpKey: 'help_shbg',
    type: 'decimal',
    unit: 'nmol/L',
    min: 0.1,
    max: 500,
    required: true,
    example: '32.0',
  },
  {
    fieldId: 'albumin_g_dL',
    labelKey: 'albumin',
    helpKey: 'help_albumin',
    type: 'decimal',
    unit: 'g/dL',
    min: 0.1,
    max: 10.0,
    required: true,
    example: '4.3',
  },
  {
    fieldId: 'panel_date',
    labelKey: 'field_panel_date',
    helpKey: 'help_panel_date',
    type: 'date',
    unit: null,
    min: null,
    max: null,
    required: false,
    example: '2026-03-01',
  },
];

export interface Tool015Source {
  n: number;
  publisher: string;
  title: string;
  year: number;
  level: string;
  url: string;
  doi?: string;
  note: string;
}

export const TOOL_015_SOURCES: Tool015Source[] = [
  {
    n: 1,
    publisher: 'The Journal of Clinical Endocrinology & Metabolism (JCEM)',
    title: 'A Critical Evaluation of Simple Methods for the Estimation of Free Testosterone in Serum',
    year: 1999,
    level: 'A',
    url: 'https://academic.oup.com/jcem/article/84/10/3666/2660507',
    doi: '10.1210/jcem.84.10.6079',
    note: 'The landmark paper by Vermeulen, Verdonck, and Kaufman establishing the mass-action equilibrium equation for free testosterone.',
  },
  {
    n: 2,
    publisher: 'Endocrine Society',
    title: 'Evaluation and Treatment of Androgen Deficiency Syndromes in Adult Men',
    year: 2018,
    level: 'A',
    url: 'https://academic.oup.com/jcem/article/103/5/1715/4939465',
    doi: '10.1210/jc.2018-00229',
    note: 'Clinical practice guideline recommending calculated free testosterone using equilibrium binding equations when SHBG is altered.',
  },
  {
    n: 3,
    publisher: 'Annals of Clinical Biochemistry',
    title: 'The Free Androgen Index (FAI): clinical utility and limitations in endocrine practice',
    year: 2015,
    level: 'B',
    url: 'https://journals.sagepub.com/doi/10.1177/0004563214561009',
    note: 'Validates the FAI formula as a rapid screening index of androgenicity in relation to circulating SHBG levels.',
  },
];

export interface Tool015CrossLink {
  slug: string;
  nameEn: string;
  nameAr: string;
  relationEn: string;
  relationAr: string;
}

export const TOOL_015_CROSS_TOOL_LINKS: Tool015CrossLink[] = [
  {
    slug: 'tool-006-estrogen-prolactin',
    nameEn: 'Estradiol & Prolactin Monitor',
    nameAr: 'مراقب الإستراديول والبرولاكتين',
    relationEn: 'Estradiol increases liver SHBG synthesis, reducing free testosterone fraction.',
    relationAr: 'الإستراديول المرتفع يحفز تصنيع SHBG الكبدي، مقللاً نسبة التستوستيرون الحر.',
  },
  {
    slug: 'tool-023-trt-optimization',
    nameEn: 'TRT Optimization Guide',
    nameAr: 'دليل تحسين علاج بدائل التستوستيرون',
    relationEn: 'Exogenous testosterone suppresses SHBG clearance rates over prolonged protocols.',
    relationAr: 'التستوستيرون الخارجي يقلل إفراز SHBG خلال البروتوكولات المستمرة.',
  },
  {
    slug: 'tool-035-hormone-conversion',
    nameEn: 'Hormone Conversion Rate Calculator',
    nameAr: 'حاسبة معدل التحول الهرموني',
    relationEn: 'Bioavailable testosterone dictates the actual tissue substrate available for 5-alpha reduction.',
    relationAr: 'التستوستيرون المتاح حيوياً يحدد كمية الهرمون المتاحة لإنزيم 5-ألفا والتحول إلى DHT.',
  },
  {
    slug: 'tool-040-lipid-profile-optimizer',
    nameEn: 'Lipid Profile Optimizer',
    nameAr: 'محسن تحليل الدهون',
    relationEn: 'Low SHBG (<15 nmol/L) is an established biomarker of insulin resistance and hypertriglyceridemia.',
    relationAr: 'انخفاض SHBG مؤشر كلاسيكي لمقاومة الإنسولين وارتفاع الدهون الثلاثية الكبدية.',
  },
];

export function isRealCalendarDate(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const [y, m, d] = dateString.split('-').map(Number);
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function labFreshness(panelDate: string, anchorDate: string): { ageDays: number; stale: boolean } {
  const p = new Date(panelDate + 'T00:00:00Z').getTime();
  const a = new Date(anchorDate + 'T00:00:00Z').getTime();
  const diff = Math.max(0, Math.floor((a - p) / (1000 * 60 * 60 * 24)));
  return { ageDays: diff, stale: diff > TOOL_015_LAB_FRESHNESS_DAYS };
}

export function getShbgBand(shbgNmolL: number): Tool015ShbgBand {
  if (shbgNmolL < TOOL_015_REFERENCE_LIMITS.shbg.low) return 'low';
  if (shbgNmolL <= TOOL_015_REFERENCE_LIMITS.shbg.optimalMax) return 'optimal';
  return 'high';
}

/**
 * Derived Free Androgen Index (FAI):
 * FAI = 100 * (TT_nmol / SHBG_nmol)
 * TT_nmol = TT_ng_dL * 0.0347
 */
export function computeFAI(ttNgDl: number, shbgNmolL: number): number | null {
  if (shbgNmolL <= 0 || ttNgDl <= 0) return null;
  const ttNmolL = ttNgDl * 0.0347;
  return Number(((ttNmolL / shbgNmolL) * 100).toFixed(1));
}

export function buildShbgCsv(
  tt: number,
  shbg: number,
  alb: number,
  freeT: number,
  bioT: number,
  fai: number | null,
  date: string,
): string {
  const headers = ['Marker', 'Value', 'Unit', 'Classification', 'Panel Date'];
  const rows = [
    ['Total Testosterone', String(tt), 'ng/dL', 'Entered Value', date],
    ['SHBG', String(shbg), 'nmol/L', getShbgBand(shbg).toUpperCase(), date],
    ['Albumin', String(alb), 'g/dL', 'Entered Value', date],
    ['Calculated Free Testosterone (Vermeulen)', String(freeT), 'ng/dL', 'Calculated', date],
    ['Calculated Bioavailable Testosterone', String(bioT), 'ng/dL', 'Calculated', date],
  ];
  if (fai !== null) {
    rows.push(['Free Androgen Index (FAI)', `${fai}%`, '%', fai > 150 ? 'HIGH' : fai < 30 ? 'LOW' : 'OPTIMAL', date]);
  }
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
