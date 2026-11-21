/**
 * lib/tools/r6/tool-006-estrogen-prolactin-contract.ts
 * ═══════════════════════════════════════════════════════════════════════════
 * Tool #006 — Estradiol & Prolactin Monitor: R6.1 input & parity contract.
 *
 * PURE MODULE — zero React, DOM, I/O, or system clock dependencies.
 *
 * What this contract defines:
 *   - User-facing field contracts (E2, Prolactin, optional Testosterone, Date);
 *   - Clinical reference limits (Mayo Clinic, Endocrine Society guidelines);
 *   - Derived physiological ratio (E2 / Total Testosterone ratio);
 *   - Lab freshness rules (90-day threshold);
 *   - High-evidence public scientific sources (Level A/B);
 *   - Cross-tool navigation links;
 *   - Client-side CSV export generator.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TOOL_006_DEBOUNCE_MS = 120;
export const TOOL_006_LAB_FRESHNESS_DAYS = 90;

export type Tool006Band = 'optimal' | 'borderline' | 'high' | 'low';

export interface Tool006ReferenceLimit {
  marker: 'e2' | 'prolactin' | 'ratio';
  low: number;
  optimalMin: number;
  optimalMax: number;
  borderlineMax: number;
  high: number;
  unit: string;
}

export const TOOL_006_REFERENCE_LIMITS = {
  e2: {
    low: 15,
    optimalMin: 15,
    optimalMax: 35,
    borderlineMax: 50,
    high: 50,
    unit: 'pg/mL',
  },
  prolactin: {
    low: 2,
    optimalMin: 2,
    optimalMax: 15,
    borderlineMax: 25,
    high: 25,
    unit: 'ng/mL',
  },
  ratio: {
    optimalMin: 3.0,
    optimalMax: 5.5,
    high: 6.0,
    unit: '%',
  },
} as const;

export type Tool006FieldId =
  | 'e2Level'
  | 'e2Unit'
  | 'prolactinLevel'
  | 'prolactinUnit'
  | 'testosteroneLevel'
  | 'panelDate';

export interface Tool006FieldContract {
  fieldId: Tool006FieldId;
  labelKey: string;
  helpKey: string;
  type: 'decimal' | 'date' | 'select';
  unit: string | null;
  min: number | null;
  max: number | null;
  required: boolean;
  example: string;
}

export const TOOL_006_FIELD_CONTRACT: Tool006FieldContract[] = [
  {
    fieldId: 'e2Level',
    labelKey: 'e2_label',
    helpKey: 'help_e2',
    type: 'decimal',
    unit: 'pg/mL',
    min: 0,
    max: 1000,
    required: true,
    example: '28.5',
  },
  {
    fieldId: 'prolactinLevel',
    labelKey: 'prolactin_label',
    helpKey: 'help_prolactin',
    type: 'decimal',
    unit: 'ng/mL',
    min: 0,
    max: 500,
    required: true,
    example: '11.2',
  },
  {
    fieldId: 'testosteroneLevel',
    labelKey: 'tt_label',
    helpKey: 'help_tt',
    type: 'decimal',
    unit: 'ng/dL',
    min: 0,
    max: 5000,
    required: false,
    example: '850',
  },
  {
    fieldId: 'panelDate',
    labelKey: 'field_panel_date',
    helpKey: 'help_panel_date',
    type: 'date',
    unit: null,
    min: null,
    max: null,
    required: true,
    example: '2026-03-01',
  },
];

export interface Tool006Source {
  n: number;
  publisher: string;
  title: string;
  year: number;
  level: string;
  url: string;
  doi?: string;
  note: string;
}

export const TOOL_006_SOURCES: Tool006Source[] = [
  {
    n: 1,
    publisher: 'Endocrine Society',
    title: 'Diagnosis and Treatment of Hyperprolactinemia: An Endocrine Society Clinical Practice Guideline',
    year: 2011,
    level: 'A',
    url: 'https://academic.oup.com/jcem/article/96/2/273/2597249',
    doi: '10.1210/jc.2010-1692',
    note: 'Defines the upper normal male prolactin limit (15 ng/mL) and macroprolactin screening thresholds.',
  },
  {
    n: 2,
    publisher: 'American Urological Association (AUA)',
    title: 'Evaluation and Management of Testosterone Deficiency',
    year: 2018,
    level: 'A',
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/testosterone-deficiency-guideline',
    note: 'Guidance on estradiol monitoring during exogenous androgen administration and symptom balance.',
  },
  {
    n: 3,
    publisher: 'Mayo Clinic Laboratories',
    title: 'Estradiol, Ultrasensitive LC-MS/MS, Serum Reference Intervals',
    year: 2024,
    level: 'B',
    url: 'https://www.mayocliniclabs.com/test-catalog/overview/81816',
    note: 'Validates male sensitive estradiol reference ranges (10–40 pg/mL) using liquid chromatography-tandem mass spectrometry.',
  },
  {
    n: 4,
    publisher: 'European Academy of Andrology (EAA)',
    title: 'Clinical practice guidelines—endocrine assessment in male hypogonadism and TRT',
    year: 2020,
    level: 'B',
    url: 'https://onlinelibrary.wiley.com/journal/20472927',
    note: 'Establishes the physiological E2/T ratio equilibrium and risks associated with excessive estradiol suppression.',
  },
];

export interface Tool006CrossLink {
  slug: string;
  nameEn: string;
  nameAr: string;
  relationEn: string;
  relationAr: string;
}

export const TOOL_006_CROSS_TOOL_LINKS: Tool006CrossLink[] = [
  {
    slug: 'tool-015-shbg-modulator',
    nameEn: 'SHBG Modulator',
    nameAr: 'معدل البروتين الرابط للهرمونات الجنسية',
    relationEn: 'SHBG binds both testosterone and estradiol, altering active free estradiol fractions.',
    relationAr: 'يرتبط SHBG بالتستوستيرون والإستراديول معاً، مغيراً نسبة الهرمون الحر الفعال.',
  },
  {
    slug: 'tool-023-trt-optimization',
    nameEn: 'TRT Optimization Guide',
    nameAr: 'دليل تحسين العلاج ببدائل التستوستيرون',
    relationEn: 'Aromatization peaks track with injection frequency and peak serum testosterone.',
    relationAr: 'ترتبط ذروة الأروماتاز مباشرة بتكرار الحقن وذروة تركيز التستوستيرون.',
  },
  {
    slug: 'tool-043-prolactin-management',
    nameEn: 'Prolactin Management Pro',
    nameAr: 'الإدارة المتقدمة للبرولاكتين',
    relationEn: 'In-depth dopamine agonist mechanism review and secondary prolactin elevation protocols.',
    relationAr: 'مراجعة متقدمة لمستقبلات الدوبامين وإدارة الارتفاعات الثانوية للبرولاكتين.',
  },
  {
    slug: 'tool-040-lipid-profile-optimizer',
    nameEn: 'Lipid Profile Optimizer',
    nameAr: 'محسن تحليل الدهون',
    relationEn: 'Crushed estradiol (<15 pg/mL) impairs HDL synthesis and accelerates atherogenesis.',
    relationAr: 'الانخفاض الحاد في الإستراديول يضعف تصنيع HDL ويزيد مخاطر تصلب الشرايين.',
  },
];

/** Check if date is a real calendar date YYYY-MM-DD */
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
  return { ageDays: diff, stale: diff > TOOL_006_LAB_FRESHNESS_DAYS };
}

export function getE2Band(pgMl: number): Tool006Band {
  if (pgMl < TOOL_006_REFERENCE_LIMITS.e2.low) return 'low';
  if (pgMl <= TOOL_006_REFERENCE_LIMITS.e2.optimalMax) return 'optimal';
  if (pgMl <= TOOL_006_REFERENCE_LIMITS.e2.borderlineMax) return 'borderline';
  return 'high';
}

export function getProlactinBand(ngMl: number): Tool006Band {
  if (ngMl < TOOL_006_REFERENCE_LIMITS.prolactin.low) return 'low';
  if (ngMl <= TOOL_006_REFERENCE_LIMITS.prolactin.optimalMax) return 'optimal';
  if (ngMl <= TOOL_006_REFERENCE_LIMITS.prolactin.borderlineMax) return 'borderline';
  return 'high';
}

export function computeE2TRatio(e2PgMl: number, ttNgDl: number): number | null {
  if (ttNgDl <= 0) return null;
  // E2 in pg/mL / TT in ng/dL * 100
  // e.g. E2=30 pg/mL, TT=600 ng/dL -> 30/600 * 100 = 5.0%
  return Number(((e2PgMl / ttNgDl) * 100).toFixed(2));
}

export function buildEstrogenProlactinCsv(
  e2: number,
  e2Unit: string,
  prolactin: number,
  prolactinUnit: string,
  tt: number | null,
  date: string,
): string {
  const headers = ['Marker', 'Value', 'Unit', 'Reference Band', 'Panel Date'];
  const e2Band = getE2Band(e2Unit === 'pmol/L' ? e2 / 3.67 : e2);
  const prlBand = getProlactinBand(prolactinUnit === 'mIU/L' ? prolactin / 21.2 : prolactin);
  
  const rows = [
    ['Estradiol (E2)', String(e2), e2Unit, e2Band, date],
    ['Prolactin', String(prolactin), prolactinUnit, prlBand, date],
  ];

  if (tt !== null && tt > 0) {
    const ratio = computeE2TRatio(e2Unit === 'pmol/L' ? e2 / 3.67 : e2, tt);
    rows.push(['Total Testosterone', String(tt), 'ng/dL', 'standard', date]);
    rows.push(['E2/T Ratio', `${ratio}%`, '%', ratio && ratio > 6.0 ? 'high' : 'optimal', date]);
  }

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
